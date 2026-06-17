import { NextRequest, NextResponse } from "next/server";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";

const PYTHON_CALCULATE_URL = "http://localhost:8000/calculate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, birthDate, birthTime, timezone, utc_offset } = body;

    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute, second = 0] = birthTime.split(":").map(Number);

    const payload = {
      name: fullName,
      year,
      month,
      day,
      hour,
      minute,
      second,
      utc_offset,
    };

    console.log("[HD DEBUG API] Requesting Python engine with:", payload);

    const response = await fetch(PYTHON_CALCULATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const rawData = await response.json().catch(() => ({ error: "Failed to parse Python response" }));

    return NextResponse.json({
      metadata: {
        received: { birthDate, birthTime, timezone, utc_offset },
        parsed: { year, month, day, hour, minute, second },
        payload
      },
      python_raw: rawData,
      http_status: response.status,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
