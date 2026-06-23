import { NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/engines/generateBlueprint";
import { AuraService } from "@/lib/services/auraService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { fullName, birthDate, birthTime, birthCity, latitude, longitude, timezone } = body;

    if (!fullName || !birthDate || !birthCity) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, birthDate, and birthCity are required." },
        { status: 400 }
      );
    }

    // Call the existing blueprint orchestration engine
    const blueprint = await generateBlueprint({
      uid: "aura-visitor",
      fullName,
      birthDate,
      birthTime: birthTime || undefined,
      birthCity,
      latitude: latitude != null ? Number(latitude) : null,
      longitude: longitude != null ? Number(longitude) : null,
      timezone: timezone || null,
    });

    // Run the Aura calculation service
    const auraResult = AuraService.calculateAura(blueprint);

    return NextResponse.json(auraResult);
  } catch (error) {
    console.error("Aura calculation API failed:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
