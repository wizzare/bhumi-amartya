import { NextResponse } from "next/server";

const CANONICAL_HD_API_URL = "https://bhumi-human-design-api.vercel.app/calculate";
const HD_REQUEST_TIMEOUT_MS = 15_000;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { status: "error", note: "Invalid JSON body." },
        { status: 400 }
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HD_REQUEST_TIMEOUT_MS);

    const targetUrl = process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL || CANONICAL_HD_API_URL;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    }).finally(() => clearTimeout(timer));

    if (!response.ok) {
      console.warn(`[HD API ROUTE] External API returned ${response.status}`);
      return NextResponse.json(
        { status: "error", note: `External API returned status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[HD API ROUTE] Calculation proxy failed:", error?.message || error);
    return NextResponse.json(
      { status: "error", calculationStatus: "service_unavailable", note: "Human Design calculation service unavailable." },
      { status: 500 }
    );
  }
}
