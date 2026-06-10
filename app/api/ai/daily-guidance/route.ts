import { NextResponse } from "next/server";
import { dailyGuidanceEngine } from "@/lib/engines/dailyGuidanceEngine";
import type { DailyGuidanceContext } from "@/lib/dailyGuidance/types";

type DailyGuidanceErrorReason =
  | "missing_uid"
  | "missing_profile"
  | "missing_blueprint"
  | "missing_currentSky"
  | "missing_localDateKey"
  | "ai_failed";

export async function POST(request: Request) {
  try {
    console.log("[DAILY_GUIDANCE_API_START]");
    console.log(process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
    const body = (await request.json().catch(() => null)) as (Partial<DailyGuidanceContext> & {
      localDateKey?: string;
    }) | null;
    const localDateKey = body?.localDateKey || body?.date;

    const missingReason: DailyGuidanceErrorReason | null = !body?.uid
      ? "missing_uid"
      : !body.profile
        ? "missing_profile"
        : !body.blueprint
          ? "missing_blueprint"
          : !body.currentSky
            ? "missing_currentSky"
            : !localDateKey
              ? "missing_localDateKey"
              : null;

    console.log("[DAILY GUIDANCE REQUEST]", {
      uid: body?.uid ?? null,
      localDateKey: localDateKey ?? null,
      hasProfile: Boolean(body?.profile),
      hasBlueprint: Boolean(body?.blueprint),
    });
    console.log("[DAILY_GUIDANCE_REQUEST]", body);

    if (missingReason) {
      return NextResponse.json(
        { ok: false, reason: missingReason },
        { status: 400 },
      );
    }

    const validBody = body as DailyGuidanceContext & { localDateKey?: string };
    const dateKey = localDateKey as string;
    const input: DailyGuidanceContext = {
      ...validBody,
      uid: validBody.uid,
      date: dateKey,
      localDateKey: dateKey,
      language: validBody.language || "id",
      profile: validBody.profile,
      blueprint: validBody.blueprint,
      currentSky: validBody.currentSky,
    } as DailyGuidanceContext;

    const guidance = await dailyGuidanceEngine.getOrCreateDailyGuidance(
      input.uid,
      dateKey,
      input
    );

    const apiResponse = { ok: true, guidance };
    console.log("[DAILY_GUIDANCE_RESPONSE]", apiResponse);
    return NextResponse.json(apiResponse);
  } catch (error) {
    console.log("[DAILY_GUIDANCE_GEMINI_ERROR]", error);
    console.error("Daily guidance API failed:", error);
    const apiResponse = { ok: false, reason: "ai_failed" satisfies DailyGuidanceErrorReason, error: String(error), stack: error instanceof Error ? error.stack : null };
    console.log("[DAILY_GUIDANCE_RESPONSE]", apiResponse);
    return NextResponse.json(
      apiResponse,
      { status: 500 },
    );
  }
}
