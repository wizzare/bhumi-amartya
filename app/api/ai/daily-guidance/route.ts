import { NextResponse } from "next/server";
import { dailyGuidanceEngine } from "@/lib/engines/dailyGuidanceEngine";
import type { DailyGuidanceContext } from "@/lib/dailyGuidance/types";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";

type DailyGuidanceErrorReason =
  | "missing_uid"
  | "missing_profile"
  | "missing_blueprint"
  | "missing_currentSky"
  | "missing_localDateKey"
  | "ai_failed";

type DailyGuidanceRequestBody = Partial<DailyGuidanceContext & DailyGuidanceInput> & {
  uid?: string;
  profile?: Record<string, unknown> | null;
  localDateKey?: string;
  date?: string;
  astrologyToday?: string | null;
  generatedAt?: string;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function getLocalDateKey(body: DailyGuidanceRequestBody | null): string | null {
  const explicit = body?.localDateKey || body?.date;
  if (typeof explicit === "string" && explicit.trim()) return explicit.slice(0, 10);

  const generatedAt = "generatedAt" in (body ?? {}) ? body?.generatedAt : null;
  if (typeof generatedAt === "string" && generatedAt.trim()) return generatedAt.slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

function normalizeDailyGuidanceRequest(
  body: DailyGuidanceRequestBody | null,
): { input: DailyGuidanceContext | null; missingReason: DailyGuidanceErrorReason | null } {
  const localDateKey = getLocalDateKey(body);
  const dashboardUser = asRecord("user" in (body ?? {}) ? body?.user : null);
  const profile = asRecord(body?.profile) ?? dashboardUser;
  const blueprint = asRecord(body?.blueprint);
  const uid = typeof body?.uid === "string" && body.uid.trim()
    ? body.uid
    : typeof dashboardUser?.uid === "string"
      ? dashboardUser.uid
      : null;
  const astrologyTransits = asRecord("astrologyTransits" in (body ?? {}) ? body?.astrologyTransits : null);
  const currentSky = asRecord(body?.currentSky)
    ?? (astrologyTransits
      ? {
          source: astrologyTransits.source ?? "dashboard-astrology-transits",
          generatedAt: astrologyTransits.generatedAt ?? new Date().toISOString(),
          summary: astrologyTransits.summary ?? null,
          activeTransits: astrologyTransits.activeTransits ?? [],
          bodies: [],
        }
      : null);

  const missingReason: DailyGuidanceErrorReason | null = !uid
    ? "missing_uid"
    : !profile
      ? "missing_profile"
      : !blueprint
        ? "missing_blueprint"
        : !currentSky
          ? "missing_currentSky"
          : !localDateKey
            ? "missing_localDateKey"
            : null;

  if (missingReason) return { input: null, missingReason };

  const previousGuidance = "previousGuidance" in (body ?? {}) && Array.isArray(body?.previousGuidance)
    ? body.previousGuidance
    : undefined;

  return {
    missingReason: null,
    input: {
      ...(body as Record<string, unknown>),
      uid: uid as string,
      date: localDateKey as string,
      localDateKey: localDateKey as string,
      language: body?.language === "en" ? "en" : "id",
      profile,
      blueprint,
      astrologyToday: typeof astrologyTransits?.summary === "string"
        ? astrologyTransits.summary
        : typeof body?.astrologyToday === "string"
          ? body.astrologyToday
          : null,
      currentSky,
      previousGuidance,
    } as DailyGuidanceContext,
  };
}

export async function POST(request: Request) {
  try {
    console.log("[DAILY_GUIDANCE_API_START]");
    console.log(process.env.GEMINI_API_KEY ? "FOUND" : "MISSING");
    const body = (await request.json().catch(() => null)) as DailyGuidanceRequestBody | null;
    const normalized = normalizeDailyGuidanceRequest(body);

    console.log("[DAILY GUIDANCE REQUEST]", {
      uid: normalized.input?.uid ?? body?.uid ?? ("user" in (body ?? {}) ? body?.user?.uid : null) ?? null,
      localDateKey: normalized.input?.localDateKey ?? body?.localDateKey ?? body?.date ?? null,
      hasProfile: Boolean(normalized.input?.profile ?? body?.profile ?? ("user" in (body ?? {}) ? body?.user : null)),
      hasBlueprint: Boolean(body?.blueprint),
      normalizedFromDashboardInput: Boolean(!body?.profile && "user" in (body ?? {}) && body?.user),
    });
    console.log("[DAILY_GUIDANCE_REQUEST]", body);

    if (normalized.missingReason) {
      console.error("[DAILY_GUIDANCE_BAD_REQUEST]", normalized.missingReason);
      return NextResponse.json(
        { ok: false, reason: normalized.missingReason },
        { status: 400 },
      );
    }

    const input = normalized.input as DailyGuidanceContext;
    const dateKey = input.localDateKey as string;

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
