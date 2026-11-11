import { NextResponse } from "next/server";
import { assertQaOperationAllowed } from "@/lib/config/qaRuntime";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { resolveHmacSecret } from "@/lib/antiAbuse/birthFingerprint";
import { issueIntegrityChallenge } from "@/services/billing-verifier/lib/playIntegrity";

const CORS_ALLOWED_METHODS = "POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "Authorization, Content-Type, X-Firebase-AppCheck";

function corsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin");
  if (origin === "https://localhost" || origin === "http://localhost" || origin === "capacitor://localhost") {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", CORS_ALLOWED_METHODS);
  headers.set("Access-Control-Allow-Headers", CORS_ALLOWED_HEADERS);
  headers.set("Vary", "Origin");
  return headers;
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request) });
}

function initAdminForRoute() {
  if (!getApps().length) {
    const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
    const projId = isEmulator
      ? (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID || "demo-build110-local")
      : (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c");
    initializeApp({ projectId: projId });
  }
}

export async function POST(request: Request) {
  try {
    assertQaOperationAllowed();
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "AUTH_MISSING" }, { status: 401, headers: corsHeaders(request) });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: "AUTH_MISSING" }, { status: 401, headers: corsHeaders(request) });
    }
    initAdminForRoute();
    const decoded = await getAuth().verifyIdToken(token);
    const { secret } = resolveHmacSecret();
    const challenge = issueIntegrityChallenge(decoded.uid, secret);
    return NextResponse.json({ ok: true, ...challenge }, { status: 200, headers: corsHeaders(request) });
  } catch {
    return NextResponse.json({ ok: false, error: "CHALLENGE_UNAVAILABLE" }, { status: 500, headers: corsHeaders(request) });
  }
}
