import { NextResponse } from "next/server";
import { verifyHdRequestAuthentication } from "@/lib/auth/hdEndpointAuth";

const CANONICAL_HD_API_URL = "https://bhumi-human-design-api.vercel.app/calculate";
import { requestHdJson, HD_UPSTREAM_TIMEOUT_MS, HdCommunicationError } from "@/lib/humandesign/hdCommunication";
import { normalizeLiveHumanDesignResponse } from "@/lib/humandesign/liveContract";
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

// Simple in-memory rate limiting map: ip -> { count, resetTime } (Defense-in-depth)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute per IP
const RATE_LIMIT_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  record.count += 1;
  return true;
}

function isValidDateStr(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(val.trim());
}

function isValidTimeStr(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return /^\d{2}:\d{2}(:\d{2})?$/.test(val.trim());
}

export async function POST(request: Request) {
  try {
    // 1. Abuse protection / Rate limiting (Defense-in-depth)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!checkRateLimit(ip)) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "retriable_error", note: "Too many requests. Rate limit exceeded." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 2. Route Authentication & Authorization Verification
    const authResult = await verifyHdRequestAuthentication(request);
    if (!authResult.authenticated) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "unauthorized", note: authResult.errorNote || "Authentication failed." },
        {
          status: authResult.status || 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 3. Body parsing
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return corsJson(
        request,
        { status: "error", calculationStatus: "missing_input", note: "Invalid JSON body." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const birthDate = typeof body.birthDate === "string" ? body.birthDate.trim() : "";
    const birthTime = typeof body.birthTime === "string" ? body.birthTime.trim() : "";
    const birthPlace = typeof body.birthPlace === "string" ? body.birthPlace.trim() : (typeof body.birthCity === "string" ? body.birthCity.trim() : "");
    const timezone = typeof body.timezone === "string" && body.timezone.trim() ? body.timezone.trim() : null;
    const latitude = typeof body.latitude === "number" && Number.isFinite(body.latitude) ? body.latitude : null;
    const longitude = typeof body.longitude === "number" && Number.isFinite(body.longitude) ? body.longitude : null;

    // 4. Payload validation
    if (!isValidDateStr(birthDate) || !isValidTimeStr(birthTime) || !birthPlace) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "missing_input", note: "Valid birthDate (YYYY-MM-DD), birthTime (HH:mm), and birthPlace are required." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    if (!timezone) {
      return corsJson(
        request,
        { status: "error", calculationStatus: "needs_verified_timezone", note: "A verified IANA timezone or explicit UTC offset is required for Human Design calculation." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 5. Sanitize payload sent to external microservice (PII Minimization):
    const sanitizedPayload = {
      fullName: "User", // PII sanitized to static string
      birthDate,
      birthTime,
      birthPlace,
      timezone,
      latitude,
      longitude,
    };

    const targetUrl = process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL || CANONICAL_HD_API_URL;
    let data: Record<string, unknown>;
    try {
      data = await requestHdJson(targetUrl, sanitizedPayload, {
        timeoutMs: HD_UPSTREAM_TIMEOUT_MS,
        signal: request.signal,
      });
      if (!normalizeLiveHumanDesignResponse(data)) throw new HdCommunicationError("invalid_response");
    } catch (error) {
      const code = error instanceof HdCommunicationError ? error.code : "connection_error";
      const status = code === "endpoint_not_found" ? 404 : code === "unauthorized" ? 403
        : code === "rate_limited" ? 429 : code === "invalid_input" ? 400
          : code === "cancelled" ? 499 : code === "invalid_response" ? 502 : 503;
      return corsJson(request, { status: "error", calculationStatus: code, code }, {
        status, headers: { "Cache-Control": "no-store", "X-HD-Failure-Code": code },
      });
    }

    const canonicalData = {
      ...data,
      hdEngineVersion: "gaia-hd-v1",
      calculationQuality: "verified",
      source: "human-design-py",
      hdAuditStatus: "validated",
    };
    return corsJson(request, canonicalData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch {
    console.error("[HD API ROUTE] Unexpected server error in HD calculation route");
    return corsJson(
      request,
      { status: "error", calculationStatus: "service_unavailable", note: "Internal server error during Human Design calculation." },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
