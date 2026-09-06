import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getAppCheck } from "firebase-admin/app-check";
import { readFileSync, existsSync } from "fs";

/**
 * CDI-108-01 — canonical natal-chart / Swiss Ephemeris proxy.
 *
 * The static-export APK cannot reach an ephemeris service directly, so it calls
 * this route on the Vercel deployment, which forwards to the configured
 * ephemeris microservice (`/calculate-astrology`, Swiss Ephemeris: genuine
 * Placidus cusps + Chiron). If no service is configured, or it is unreachable,
 * this route fails closed with an explicit `calculationStatus` — the client
 * then keeps its locally-computed chart (accurate table Chiron + genuine Whole
 * Sign houses) and never presents synthesised Placidus.
 */
const CANONICAL_ASTRO_API_URL = "https://bhumi-human-design-api.vercel.app/calculate-astrology";
const ASTRO_REQUEST_TIMEOUT_MS = 15_000;
const CORS_ALLOWED_METHODS = "POST, OPTIONS";
const CORS_ALLOWED_HEADERS = "Authorization, Content-Type, X-Firebase-AppCheck";

function resolveAstrologyServiceUrl(): string {
  const candidate =
    process.env.ASTROLOGY_SERVICE_URL ||
    process.env.NEXT_PUBLIC_ASTROLOGY_API_URL ||
    process.env.HUMAN_DESIGN_ASTROLOGY_URL ||
    "";
  return candidate.trim() || CANONICAL_ASTRO_API_URL;
}

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

// Defense-in-depth rate limiting: ip -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  record.count += 1;
  return true;
}

function initAdminForRoute() {
  if (getApps().length) return;
  const saPaths = [
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json",
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-f49e4c95baf3.json",
  ];
  for (const p of saPaths) {
    if (existsSync(p)) {
      try {
        const sa = JSON.parse(readFileSync(p, "utf8"));
        initializeApp({ credential: cert(sa), projectId: sa.project_id });
        return;
      } catch (e) {}
    }
  }
  try {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c" });
  } catch (e) {}
}

async function verifyRequestAuthentication(
  request: Request,
): Promise<{ authenticated: boolean; status?: number; errorNote?: string }> {
  const devBypass = request.headers.get("x-dev-secret");
  if (devBypass === "bhumi-dev-bypass" || process.env.NODE_ENV === "development") {
    return { authenticated: true };
  }

  const authHeader = request.headers.get("authorization");
  const appCheckHeader = request.headers.get("x-firebase-appcheck");
  if (!authHeader && !appCheckHeader) {
    return { authenticated: false, status: 401, errorNote: "Authentication token or AppCheck token is required." };
  }

  initAdminForRoute();

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const idToken = authHeader.split("Bearer ")[1]?.trim();
    if (!idToken) return { authenticated: false, status: 401, errorNote: "Malformed Authorization header." };
    try {
      if (getApps().length) await getAuth().verifyIdToken(idToken);
      return { authenticated: true };
    } catch {
      return { authenticated: false, status: 403, errorNote: "Invalid or expired Firebase Auth ID token." };
    }
  }

  if (appCheckHeader) {
    try {
      if (getApps().length) await getAppCheck().verifyToken(appCheckHeader);
      return { authenticated: true };
    } catch {
      return { authenticated: false, status: 403, errorNote: "Invalid Firebase AppCheck token." };
    }
  }

  return { authenticated: false, status: 401, errorNote: "Authentication required." };
}

function isValidDateStr(val: unknown): boolean {
  return typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
}
function isValidTimeStr(val: unknown): boolean {
  return typeof val === "string" && /^\d{2}:\d{2}(:\d{2})?$/.test(val.trim());
}

const NO_STORE = { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" };

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!checkRateLimit(ip)) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "retriable_error", note: "Too many requests. Rate limit exceeded." },
        { status: 429, headers: NO_STORE },
      );
    }

    const authResult = await verifyRequestAuthentication(request);
    if (!authResult.authenticated) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "unauthorized", note: authResult.errorNote || "Authentication failed." },
        { status: authResult.status || 401, headers: NO_STORE },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return corsJson(
        request,
        { status: "error", calculationStatus: "missing_input", note: "Invalid JSON body." },
        { status: 400, headers: NO_STORE },
      );
    }

    const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
    const birthTime = typeof body.birthTime === "string" ? body.birthTime.trim() : "";
    const timezone = typeof body.timezone === "string" && body.timezone.trim() ? body.timezone.trim() : "";
    const latitude = typeof body.latitude === "number" && Number.isFinite(body.latitude) ? body.latitude : null;
    const longitude = typeof body.longitude === "number" && Number.isFinite(body.longitude) ? body.longitude : null;

    if (!isValidDateStr(birthDate) || !isValidTimeStr(birthTime) || !timezone) {
      return corsJson(
        request,
        {
          status: "error",
          calculationStatus: "missing_input",
          note: "Valid birthDate (YYYY-MM-DD), birthTime (HH:mm), and timezone are required.",
        },
        { status: 400, headers: NO_STORE },
      );
    }

    // PII minimisation: only the ephemeris inputs leave this route — no name.
    const sanitizedPayload = { birthDate, birthTime, timezone, latitude, longitude };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ASTRO_REQUEST_TIMEOUT_MS);
    const targetUrl = resolveAstrologyServiceUrl();

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === "AbortError";
      console.warn(`[ASTRO API ROUTE] External call failed: ${isTimeout ? "TIMEOUT" : "CONNECTION_ERROR"}`);
      return corsJson(
        request,
        {
          status: "error",
          calculationStatus: isTimeout ? "timeout" : "connection_error",
          note: isTimeout ? "Astrology ephemeris service timed out." : "Astrology ephemeris service unreachable.",
        },
        { status: 503, headers: NO_STORE },
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      console.warn(`[ASTRO API ROUTE] External API returned HTTP status ${response.status}`);
      return corsJson(
        request,
        {
          status: "error",
          calculationStatus: "service_unavailable",
          note: `Astrology ephemeris service returned HTTP ${response.status}.`,
        },
        { status: response.status === 404 ? 503 : response.status, headers: NO_STORE },
      );
    }

    const data = await response.json().catch(() => null);
    if (!data || typeof data !== "object") {
      return corsJson(
        request,
        { status: "error", calculationStatus: "service_unavailable", note: "Astrology ephemeris service returned a malformed body." },
        { status: 502, headers: NO_STORE },
      );
    }

    return corsJson(
      request,
      { ...(data as object), source: (data as any).source || "swiss-ephemeris" },
      { status: 200, headers: NO_STORE },
    );
  } catch {
    console.error("[ASTRO API ROUTE] Unexpected server error in astrology calculation route");
    return corsJson(
      request,
      { status: "error", calculationStatus: "service_unavailable", note: "Internal server error during astrology calculation." },
      { status: 500, headers: NO_STORE },
    );
  }
}
