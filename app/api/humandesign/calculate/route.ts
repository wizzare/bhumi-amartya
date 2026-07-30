import { NextResponse } from "next/server";

const CANONICAL_HD_API_URL = "https://bhumi-human-design-api.vercel.app/calculate";
const HD_REQUEST_TIMEOUT_MS = 15_000;

// Simple in-memory rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 requests per minute
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
    // 1. Abuse protection / Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { status: "error", calculationStatus: "retriable_error", note: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 2. Body parsing
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
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
    const timezone = typeof body.timezone === "string" && body.timezone.trim() ? body.timezone.trim() : "+07:00";
    const latitude = typeof body.latitude === "number" && Number.isFinite(body.latitude) ? body.latitude : null;
    const longitude = typeof body.longitude === "number" && Number.isFinite(body.longitude) ? body.longitude : null;

    // 3. Payload validation
    if (!isValidDateStr(birthDate) || !isValidTimeStr(birthTime) || !birthPlace) {
      return NextResponse.json(
        { status: "error", calculationStatus: "missing_input", note: "Valid birthDate (YYYY-MM-DD), birthTime (HH:mm), and birthPlace are required." },
        {
          status: 400,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    // 4. Sanitize payload sent to external microservice:
    // PII Minimization Rule: Never send user's actual fullName if not required for ephemeris calculation.
    const sanitizedPayload = {
      fullName: "User", // PII sanitized to static string
      birthDate,
      birthTime,
      birthPlace,
      timezone,
      latitude,
      longitude,
    };

    // 5. External API request with AbortController timeout & no-store headers
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HD_REQUEST_TIMEOUT_MS);
    const targetUrl = process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL || CANONICAL_HD_API_URL;

    let response: Response;
    try {
      response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedPayload),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (fetchErr: any) {
      const isTimeout = fetchErr?.name === "AbortError";
      // Strict PII protection: Log only error type and status, NEVER birth payload or UID.
      console.warn(`[HD API ROUTE] External call failed: ${isTimeout ? "TIMEOUT" : "CONNECTION_ERROR"}`);
      return NextResponse.json(
        {
          status: "error",
          calculationStatus: isTimeout ? "timeout" : "connection_error",
          calculationQuality: isTimeout ? "timeout" : "connection_error",
          note: isTimeout ? "Human Design service timed out." : "Human Design service unreachable.",
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    } finally {
      clearTimeout(timer);
    }

    if (!response.ok) {
      console.warn(`[HD API ROUTE] External API returned HTTP status ${response.status}`);
      return NextResponse.json(
        {
          status: "error",
          calculationStatus: "service_unavailable",
          calculationQuality: "service_unavailable",
          note: `Human Design service returned HTTP ${response.status}.`,
        },
        {
          status: response.status,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("[HD API ROUTE] Unexpected server error in HD calculation route");
    return NextResponse.json(
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
