import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function POST() {
  return NextResponse.json(
    {
      status: "error",
      code: "ENDPOINT_DECOMMISSIONED",
      note: "The /api/humandesign/bodygraph endpoint is decommissioned for security and architectural convergence. Canonical calculations use /api/humandesign/calculate.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      status: "error",
      code: "ENDPOINT_DECOMMISSIONED",
      note: "The /api/humandesign/bodygraph endpoint is decommissioned for security and architectural convergence.",
    },
    {
      status: 410,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    },
  );
}
