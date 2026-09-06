import { NextResponse } from "next/server";
import { generateBlueprint } from "@/lib/engines/generateBlueprint";
import { AuraService } from "@/lib/services/auraService";
import { generateAuraResult } from "@/lib/services/auraResultGenerator";
import { isEnlEdition } from "@/lib/config/edition";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { fullName, birthDate, birthTime, birthCity, latitude, longitude, timezone, language } = body;
    const isEn = language === "en" || isEnlEdition();

    if (!fullName || !birthDate || !birthCity) {
      return NextResponse.json(
        {
          error: isEn
            ? "Missing required fields: fullName, birthDate, and birthCity are required."
            : "Field wajib belum lengkap: nama lengkap, tanggal lahir, dan kota lahir harus diisi.",
        },
        { status: 400 }
      );
    }

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

    const baseResult = AuraService.calculateAura(blueprint);
    const auraResult = generateAuraResult(
      baseResult.primaryAura,
      baseResult.secondaryAura,
      baseResult.shadowAura,
      baseResult.scores,
      isEn
    );

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
