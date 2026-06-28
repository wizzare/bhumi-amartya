import { NextResponse } from "next/server";
import { dailyGuidanceEngine } from "@/lib/engines/dailyGuidanceEngine";
import type { DailyGuidanceContext } from "@/lib/dailyGuidance/types";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import { DailyIntelligenceObject } from "@/lib/types/dailyIntelligence";

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

function maskUid(uid: unknown): string | null {
  if (typeof uid !== "string" || !uid.trim()) return null;
  const trimmed = uid.trim();
  if (trimmed.length <= 8) return "***";
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

function getDailyGuidanceLogSummary(
  body: DailyGuidanceRequestBody | null,
  normalized: { input: DailyGuidanceContext | null; missingReason: DailyGuidanceErrorReason | null },
) {
  const bodyRecord = asRecord(body);
  const dashboardUser = asRecord("user" in (body ?? {}) ? body?.user : null);
  const uid = normalized.input?.uid ?? body?.uid ?? dashboardUser?.uid ?? null;

  return {
    hasUid: Boolean(uid),
    uid: maskUid(uid),
    date: normalized.input?.localDateKey ?? body?.localDateKey ?? body?.date ?? null,
    hasBlueprint: Boolean(body?.blueprint),
    hasDailyState: Boolean(bodyRecord?.dailyState),
    hasJourney: Boolean(
      bodyRecord?.journey
        || Array.isArray(body?.journalHistory)
        || Array.isArray(body?.previousJournalEntries)
        || Boolean(body?.previousGuidance)
    ),
    hasWellness: Boolean(bodyRecord?.wellness),
    hasEnvironment: Boolean(
      bodyRecord?.environmentContext
        || bodyRecord?.environment
    ),
    providerStatus: process.env.GEMINI_API_KEY ? "configured" : "missing_api_key",
    reason: normalized.missingReason,
    normalizedFromDashboardInput: Boolean(!body?.profile && dashboardUser),
  };
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
    ? body.previousGuidance[0] ?? null
    : "previousGuidance" in (body ?? {}) && body?.previousGuidance
      ? body.previousGuidance
    : undefined;
  const generatedAt = typeof body?.generatedAt === "string" && body.generatedAt.trim()
    ? body.generatedAt
    : new Date().toISOString();

  return {
    missingReason: null,
    input: {
      ...(body as Record<string, unknown>),
      uid: uid as string,
      date: localDateKey as string,
      localDateKey: localDateKey as string,
      language: body?.language === "en" ? "en" : "id",
      user: asRecord("user" in (body ?? {}) ? body?.user : null) ?? profile,
      profile,
      blueprint,
      astrologyToday: typeof astrologyTransits?.summary === "string"
        ? astrologyTransits.summary
        : typeof body?.astrologyToday === "string"
          ? body.astrologyToday
          : null,
      astrologyTransits,
      currentSky,
      journalHistory: Array.isArray(body?.journalHistory)
        ? body.journalHistory
        : Array.isArray(body?.previousJournalEntries)
          ? body.previousJournalEntries
          : [],
      meditationHistory: Array.isArray(body?.meditationHistory)
        ? body.meditationHistory
        : Array.isArray(body?.previousMeditationEntries)
          ? body.previousMeditationEntries
          : [],
      audioHealingHistory: Array.isArray(body?.audioHealingHistory)
        ? body.audioHealingHistory
        : Array.isArray(body?.previousAudioHealingEntries)
          ? body.previousAudioHealingEntries
          : [],
      previousGuidance,
      environmentContext: (body as any)?.environmentContext,
      generatedAt,
    } as DailyGuidanceContext,
  };
}

export async function POST(request: Request) {
  try {
    console.log("[DAILY_GUIDANCE_API_START]");
    const body = (await request.json().catch(() => null)) as DailyGuidanceRequestBody | null;
    const normalized = normalizeDailyGuidanceRequest(body);

    console.log("[DAILY_GUIDANCE_REQUEST_SUMMARY]", getDailyGuidanceLogSummary(body, normalized));

    if (normalized.missingReason) {
      console.error("[DAILY_GUIDANCE_BAD_REQUEST]", normalized.missingReason);
      return NextResponse.json(
        { ok: false, reason: normalized.missingReason },
        { status: 400 },
      );
    }

    const input = normalized.input as DailyGuidanceContext;

    const brain: DailyIntelligenceObject = {
      uid: input.uid,
      localDateKey: input.localDateKey as string,
      seed: "recovery_seed", // Placeholder
      theme: input.astrologyToday || "recovery_theme", // Using astrologyToday if available, otherwise placeholder
      focus: "recovery_focus", // Placeholder
      issueKey: "recovery_issue", // Placeholder
      navigatorMode: "REFLECTION", // Default to REFLECTION
      journeyStage: 1, // Placeholder
      emotion: "neutral", // Placeholder
      challenge: "recovery_challenge", // Placeholder
      growth: "recovery_growth", // Placeholder
      suggestion: "recovery_suggestion", // Placeholder
      energyLevel: 5, // Placeholder
      dominantSignal: "recovery_signal", // Placeholder
      confidence: 5, // Placeholder
      voiceTone: "steady", // Default to steady
      reflectionSeed: "recovery_reflection_seed", // Placeholder
      guidanceSeed: "recovery_guidance_seed", // Placeholder
      generatedAt: new Date().toISOString(),
      memoryHash: "recovery_memory_hash", // Placeholder
    };

    const guidance = await dailyGuidanceEngine.generateLanguageFace(
      brain,
      input
    );

    const apiResponse = { ok: true, guidance };
    console.log("[DAILY_GUIDANCE_RESPONSE_SUMMARY]", {
      ok: true,
      date: input.localDateKey,
      hasGuidance: Boolean(guidance),
    });
    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Daily guidance API failed:", error);
    if (process.env.NODE_ENV === "development" && error instanceof Error) {
      console.error("[DAILY_GUIDANCE_GEMINI_ERROR_STACK]", error.stack);
    }
    const apiResponse = { ok: false, reason: "ai_failed" satisfies DailyGuidanceErrorReason };
    console.log("[DAILY_GUIDANCE_RESPONSE_SUMMARY]", apiResponse);
    return NextResponse.json(
      apiResponse,
      { status: 500 },
    );
  }
}
