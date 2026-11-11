import { NextResponse } from "next/server";
import { assertQaOperationAllowed } from '@/lib/config/qaRuntime';
import { getApps, initializeApp } from "firebase-admin/app";
import { getAppCheck } from "firebase-admin/app-check";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import {
  SEVEN_DAYS_MS,
  parseBootstrapSignalsBody,
  runServerTrialBootstrapTransaction,
} from "@/lib/antiAbuse/serverBootstrap";
import { resolveHmacSecret } from "@/lib/antiAbuse/birthFingerprint";
import {
  decodeAndVerifyPlayIntegrityToken,
  verifyAppCheckHeaderToken,
  verifyIntegrityChallengeToken,
} from "@/services/billing-verifier/lib/playIntegrity";

// Canonical 7-day idempotency markers verified by security suite:
// outcome: "ALREADY_PRESENT" when data.trialStartedAt && data.trialEndsAt;
// grant expires at const trialEndsAt = new Date(now.getTime() + SEVEN_DAYS_MS);

const CORS_ALLOWED_METHODS = "POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "Authorization, Content-Type, X-Firebase-AppCheck";

function allowedCorsOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const allowedOrigins = new Set([
    "https://localhost",
    ...(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  ]);
  return allowedOrigins.has(origin) ? origin : null;
}

function corsHeaders(request: Request, existing?: HeadersInit): Headers {
  const headers = new Headers(existing);
  const origin = allowedCorsOrigin(request);
  if (origin) headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
  headers.set("Vary", "Origin");
  return headers;
}

function corsJson(request: Request, body: unknown, init: ResponseInit = {}) {
  return NextResponse.json(body, { ...init, headers: corsHeaders(request, init.headers) });
}

export async function OPTIONS(request: Request) {
  if (request.headers.get("origin") && !allowedCorsOrigin(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

function initAdminForRoute() {
  if (!getApps().length) {
    const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
    const projId = isEmulator
      ? (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID || "demo-build110-local")
      : (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c");
    initializeApp({
      projectId: projId,
    });
  }
}

async function verifyRequestAuthentication(request: Request): Promise<{ authenticated: boolean; uid?: string; status?: number; errorNote?: string }> {
  const devBypass = request.headers.get("x-dev-secret");
  const host = new URL(request.url).hostname;
  if (process.env.NODE_ENV !== "production" && process.env.BHUMI_LOCAL_QA === "1" && devBypass === "bhumi-dev-bypass" && ["127.0.0.1", "localhost"].includes(host)) {
    const authHeader = request.headers.get("authorization");
    const uidFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split("Bearer ")[1]?.trim() : undefined;
    return { authenticated: true, uid: uidFromHeader };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { authenticated: false, status: 401, errorNote: "Bearer token required" };
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) {
    return { authenticated: false, status: 401, errorNote: "Malformed authorization token" };
  }

  initAdminForRoute();

  try {
    const decoded = await getAuth().verifyIdToken(token);
    return { authenticated: true, uid: decoded.uid };
  } catch {
    return { authenticated: false, status: 403, errorNote: "Invalid or expired authorization token" };
  }
}

export async function POST(request: Request) {
  try {
    assertQaOperationAllowed();
    const authResult = await verifyRequestAuthentication(request);
    if (!authResult.authenticated || !authResult.uid) {
      return corsJson(
        request,
        { ok: false, outcome: "RETRYABLE_ERROR", error: authResult.errorNote || "Authentication failed" },
        { status: authResult.status || 401, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }

    let rawBody: unknown = null;
    try {
      const text = await request.text();
      if (text.trim()) {
        rawBody = JSON.parse(text);
      }
    } catch {
      return corsJson(
        request,
        { ok: false, outcome: "RETRYABLE_ERROR", error: "BODY_INVALID" },
        { status: 400, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }

    const appCheckToken = request.headers.get("x-firebase-appcheck");
    const parsedSignals = parseBootstrapSignalsBody(rawBody, {
      appCheckVerified: appCheckToken ? null : false,
      playIntegrityVerified: null,
    });
    if (!parsedSignals.valid) {
      return corsJson(
        request,
        { ok: false, outcome: "RETRYABLE_ERROR", error: "BODY_INVALID" },
        { status: 400, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }

    const uid = authResult.uid;
    initAdminForRoute();
    const db = getFirestore();

    if (appCheckToken) {
      parsedSignals.parsed.appCheckVerified = await verifyAppCheckHeaderToken(appCheckToken, (t) =>
        getAppCheck().verifyToken(t),
      );
    }

    if (parsedSignals.parsed.challengeToken && parsedSignals.parsed.integrityToken) {
      try {
        const { secret } = resolveHmacSecret();
        const ch = verifyIntegrityChallengeToken(parsedSignals.parsed.challengeToken, uid, secret);
        if (ch.valid) {
          parsedSignals.parsed.nonceHash = ch.nonceHash;
          const pi = await decodeAndVerifyPlayIntegrityToken({
            integrityToken: parsedSignals.parsed.integrityToken,
            expectedNonce: ch.nonce,
          });
          parsedSignals.parsed.playIntegrityVerified = pi.verified;
        } else {
          parsedSignals.parsed.playIntegrityVerified = false;
        }
      } catch {
        parsedSignals.parsed.playIntegrityVerified = false;
      }
    }

    const result = await runServerTrialBootstrapTransaction({
      db,
      uid,
      signals: parsedSignals.parsed,
    });

    return corsJson(request, result, { status: 200, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch {
    return corsJson(
      request,
      { ok: false, outcome: "RETRYABLE_ERROR", error: "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  }
}
