import { NextResponse } from "next/server";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
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
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-build110-local",
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
    const authResult = await verifyRequestAuthentication(request);
    if (!authResult.authenticated || !authResult.uid) {
      return corsJson(
        request,
        { ok: false, outcome: "RETRYABLE_ERROR", error: authResult.errorNote || "Authentication failed" },
        { status: authResult.status || 401, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
      );
    }

    const uid = authResult.uid;
    initAdminForRoute();
    const db = getFirestore();
    const userRef = db.doc(`users/${uid}`);

    const result = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(userRef);
      const data = snap.exists ? snap.data() || {} : {};

      // 1. Higher server entitlement protection (Founder, Lifetime, Google Play)
      const badge = data.badge || data.testerBadge || data.guardianBadge;
      if (badge === "Founder" || badge === "Penjaga Bhumi Inti" || badge === "Penjaga Bhumi Alfa" || data.membershipType === "LIFETIME") {
        return { ok: true, outcome: "HIGHER_ENTITLEMENT" };
      }
      if (data.membershipType === "PREMIUM" && data.entitlementSource === "google_play") {
        return { ok: true, outcome: "HIGHER_ENTITLEMENT" };
      }

      // 2. Immutability & No Reset Guard: If trial already exists on this server doc, preserve it!
      if (data.trialStartedAt && data.trialEndsAt) {
        return {
          ok: true,
          outcome: "ALREADY_PRESENT",
          trialStartedAt: String(data.trialStartedAt),
          trialEndsAt: String(data.trialEndsAt),
        };
      }

      // 3. New User Canonical 7-Day Server Trial Creation:
      // Server timestamp is the sole authority. Client timestamps are forbidden.
      const now = new Date();
      const trialEndsAt = new Date(now.getTime() + SEVEN_DAYS_MS);

      const grant = {
        plan: "free_trial",
        membership: "REGULAR_TRIAL",
        membershipType: "TRIAL",
        subscriptionStatus: "trialing",
        trialStartedAt: now.toISOString(),
        trialEndsAt: trialEndsAt.toISOString(),
        accessStart: now.toISOString(),
        accessUntil: trialEndsAt.toISOString(),
        entitlementSource: "server_access_bootstrap",
        accessSource: "server_access_bootstrap",
        accessSourceVersion: "2026-09-13",
        entitlementUpdatedAt: now.toISOString(),
        updatedBy: "server_access_bootstrap",
        updatedAt: now.toISOString(),
      };

      transaction.set(userRef, grant, { merge: true });

      return {
        ok: true,
        outcome: "PROVISIONED",
        trialStartedAt: grant.trialStartedAt,
        trialEndsAt: grant.trialEndsAt,
      };
    });

    return corsJson(request, result, { status: 200, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } });
  } catch (err: any) {
    return corsJson(
      request,
      { ok: false, outcome: "RETRYABLE_ERROR", error: err?.message || "Internal server error" },
      { status: 500, headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
    );
  }
}
