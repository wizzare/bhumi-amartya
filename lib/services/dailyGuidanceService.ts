import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { normalizeUserFacingGuidance } from "@/lib/dailyGuidance/normalizeUserFacingGuidance";
import {
  getDailyGuidanceStaleReason,
  DAILY_GUIDANCE_SCHEMA_VERSION,
  DAILY_GUIDANCE_PROMPT_VERSION,
  DAILY_GUIDANCE_CONTENT_VERSION,
} from "@/lib/dailyGuidance/version";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { journalRepository } from "@/lib/repositories/journalRepository";
import { meditationRepository } from "@/lib/repositories/meditationRepository";
import { audioHealingRepository } from "@/lib/repositories/audioHealingRepository";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { wellnessMappingRepository } from "@/lib/repositories/wellnessMappingRepository";
import { loadWellnessDailyIntelligence } from "@/lib/services/wellnessDailyIntelligence";
import { generateLocalDailyGuidance } from "@/lib/orchestrators/localDailyGuidanceFallback";
import { profileToDashboardUser, profileToCoreIdentity } from "@/lib/mappers/userProfileMapper";
import { createDailyContentSeed } from "@/lib/dailyGuidance/dailyContentKey";
import { generateBlueprintHash, generateMemoryHash } from "@/lib/utils/hashing";
import { safeJsonParse } from "@/lib/storage/safeJson";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";
import { innerworkIntelligence } from "@/lib/engines/innerworkIntelligence";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { calculateProgressMetrics } from "@/lib/engines/progressCalculationEngine";
import { dailyIntelligenceEngine } from "@/lib/engines/dailyIntelligenceEngine";
import { dailyGuidanceEngine } from "@/lib/engines/dailyGuidanceEngine";
import type { DailyGuidanceContext } from "@/lib/dailyGuidance/types";
export { createDailyGuidanceServiceCore } from "./dailyGuidanceServiceCore";

export interface DailyGuidanceResult {
  guidance: DailyGuidance | null;
  source: "ai" | "fallback" | "local-fallback" | "cache" | "firestore" | string;
  status: "success" | "error";
  error: string | null;
}

export async function generateDailyGuidanceForRequest(
  input: DailyGuidanceContext,
): Promise<DailyGuidance> {
  const brain = await dailyIntelligenceEngine.synthesize({
    ...input,
    date: input.date ?? input.localDateKey,
    localDateKey: input.localDateKey ?? input.date,
  });
  const guidance = await dailyGuidanceEngine.generateLanguageFace(brain, input);
  if (!isCanonicalDailyGuidanceRecord(guidance, input.uid, input.localDateKey ?? input.date)) {
    throw new Error("INVALID_DAILY_GUIDANCE_RESULT");
  }
  return guidance;
}

export function isCanonicalDailyGuidanceRecord(
  value: unknown,
  uid?: string,
  date?: string,
): value is DailyGuidance {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const guidance = value as Partial<DailyGuidance>;
  if (uid && guidance.uid !== uid) return false;
  if (date && guidance.localDateKey !== date && guidance.date !== date) return false;
  return typeof guidance.uid === "string"
    && typeof guidance.date === "string"
    && typeof guidance.aiInsight === "string"
    && typeof guidance.journalPrompt === "string"
    && typeof guidance.meditationSuggestion === "string"
    && Array.isArray(guidance.dailyPractices)
    && typeof guidance.createdAt === "string"
    && typeof guidance.updatedAt === "string";
}

/**
 * Read-only Daily Guidance access for presentation consumers.
 *
 * This deliberately never calls an API, fallback generator, AI provider, or
 * persistence method. Profile and other consumers can reuse an existing
 * canonical record without becoming generation owners.
 */
export async function getExistingDailyGuidance(params: {
  uid: string;
  profile: any;
  blueprint: any;
  date: string;
}): Promise<DailyGuidanceResult> {
  const { uid, profile, date } = params;

  if (typeof window !== "undefined") {
    const prefix = `dailyGuidance:${uid}:${date}:`;
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const parsed = safeJsonParse<DailyGuidance | null>(window.localStorage.getItem(key), null);
      if (parsed && isCanonicalDailyGuidanceRecord(parsed, uid, date)) {
        return {
          guidance: normalizeUserFacingGuidance(parsed, profile),
          source: parsed.source || "cache",
          status: "success",
          error: null,
        };
      }
    }
  }

  const existing = await dailyGuidanceRepository.getDailyGuidance(uid, date).catch(() => null);
  if (!existing || !isCanonicalDailyGuidanceRecord(existing, uid, date)) {
    return { guidance: null, source: "none", status: "success", error: null };
  }

  return {
    guidance: normalizeUserFacingGuidance(existing, profile),
    source: existing.source || "firestore",
    status: "success",
    error: null,
  };
}

// Module-level in-flight promise map for deduplication
const inFlightPromises = new Map<string, Promise<DailyGuidanceResult>>();

export async function getOrGenerateDailyGuidance(params: {
  uid: string;
  profile: any;
  blueprint: any;
  date: string;
  appNow?: Date;
  generate?: (input: DailyGuidanceContext) => Promise<DailyGuidance>;
}): Promise<DailyGuidanceResult> {
  const { uid, profile, blueprint, date } = params;
  const appNow = params.appNow || new Date();
  const dedupeKey = `${uid}_${date}:${DAILY_GUIDANCE_PROMPT_VERSION}:${DAILY_GUIDANCE_CONTENT_VERSION}`;

  if (inFlightPromises.has(dedupeKey)) {
    console.log(`[DAILY_GUIDANCE_SERVICE] Awaiting in-flight promise for dedupeKey: ${dedupeKey}`);
    return inFlightPromises.get(dedupeKey)!;
  }

  const promise = (async (): Promise<DailyGuidanceResult> => {
    try {
      const result = await executeGetOrGenerateDailyGuidance({
        uid,
        profile,
        blueprint,
        date,
        appNow,
        generate: params.generate,
      });
      return result;
    } catch (err) {
      return {
        guidance: null,
        source: "none",
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      inFlightPromises.delete(dedupeKey);
    }
  })();

  inFlightPromises.set(dedupeKey, promise);
  return promise;
}

async function executeGetOrGenerateDailyGuidance(params: {
  uid: string;
  profile: any;
  blueprint: any;
  date: string;
  appNow: Date;
  generate?: (input: DailyGuidanceContext) => Promise<DailyGuidance>;
}): Promise<DailyGuidanceResult> {
  const { uid, profile, blueprint, date, appNow, generate } = params;
  const validationContext = {
    ...profile,
    profile,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    rendererVersion: DAILY_GUIDANCE_PROMPT_VERSION,
  };
  const fingerprint = generateMemoryHash(validationContext);
  const localCacheKey = `dailyGuidance:${uid}:${date}:${DAILY_GUIDANCE_PROMPT_VERSION}:${DAILY_GUIDANCE_CONTENT_VERSION}:${fingerprint}`;

  const invalidCacheKeys = ["dailyGuidance", `dailyGuidance:${date}`, "dailyGuidance:today", "globalDailyGuidance", "sharedReflection", "staticReflection"];

  if (typeof window !== "undefined") {
    invalidCacheKeys.forEach((key) => window.localStorage.removeItem(key));
  }

  // 1. Try Local Storage Cache
  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(localCacheKey);
    if (cached) {
      const parsed = safeJsonParse<DailyGuidance | null>(cached, null);
      if (parsed) {
        const staleReason = getDailyGuidanceStaleReason(parsed, {
          uid,
          localDateKey: date,
          blueprint,
          context: validationContext,
        });
        if (!staleReason) {
          const normalized = normalizeUserFacingGuidance(parsed, profile);
          return {
            guidance: normalized,
            source: parsed.source || "cache",
            status: "success",
            error: null,
          };
        } else {
          window.localStorage.removeItem(localCacheKey);
        }
      }
    }
  }

  // 2. Try Firestore
  const existing = await dailyGuidanceRepository.getDailyGuidance(uid, date).catch(() => null);
  if (existing) {
    const existingStaleReason = getDailyGuidanceStaleReason(existing, {
      uid,
      localDateKey: date,
      blueprint,
      context: validationContext,
    });
    if (!existingStaleReason) {
      const normalized = normalizeUserFacingGuidance(existing, profile);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
      }
      return {
        guidance: normalized,
        source: existing.source || "firestore",
        status: "success",
        error: null,
      };
    }
  }

  // 3. Load Context for API or fallback
  const [recent, journals, meditations, audios, activities, mapping, wellnessIntelligence] = await Promise.all([
    dailyGuidanceRepository.getRecentGuidance(uid, 5).catch(() => []),
    journalRepository.getJournalEntries(uid, 5).catch(() => []),
    meditationRepository.getMeditationEntries(uid, 5).catch(() => []),
    audioHealingRepository.getAudioHealingEntries(uid, 5).catch(() => []),
    activityRepository.getRecentActivities(uid, 5).catch(() => []),
    wellnessMappingRepository.getMapping(uid).catch(() => null),
    loadWellnessDailyIntelligence({ uid, profile, blueprint, date }),
  ]);

  const existingDailyState = await dailyStateRepository.getDailyState(uid, date).catch(() => null);
  
  const yesterday = new Date(appNow);
  yesterday.setDate(yesterday.getDate() - 1);
  const timezone = profile?.timezone || profile?.profile?.timezone || "UTC";
  const yesterdayKey = getLocalDateKey(yesterday, timezone);
  const yesterdayState = await dailyStateRepository.getDailyState(uid, yesterdayKey).catch(() => null);

  const journeyStates = wellnessIntelligence.recentDailyStates;
  const navigator = wellnessIntelligence.navigatorState;
  const journeyMemory = wellnessIntelligence.journeyMemory;

  const previousGuidance = recent.find(g => g.localDateKey !== date);
  const recentPracticePatterns = journeyMemory?.last30Days
    .flatMap((record) => record.practiceResults ?? [])
    .slice(0, 20)
    .map((result) => ({
      issue: result.issue,
      practiceId: result.practiceId,
      practiceCategory: result.practiceCategory,
      reflectionResult: result.reflectionResult ?? "",
      practiceHelped: result.practiceHelped ?? null,
      completedAt: result.completedAt,
    })) ?? [];

  const journeyLearning = journeyMemory ? {
    weeklyLearning: journeyMemory.weeklyLearning,
    monthlyTheme: journeyMemory.monthlyLearning,
    growthNarrative: journeyMemory.growthNarrative,
    coachMemory: journeyMemory.coachMemory,
    practiceEffectiveness: journeyMemory.practiceInsights,
    recentPracticePatterns,
  } : null;

  const memoryContext = {
    ...profile,
    profile,
    previousJournalEntries: journals,
    previousMeditationEntries: meditations,
    previousAudioHealingEntries: audios,
    previousActivityEntries: activities,
    healingMemory: journeyLearning,
    journeyMemory: journeyLearning,
    dailyState: existingDailyState,
    wellnessState: existingDailyState,
    previousDailyState: yesterdayState,
    previousDayState: yesterdayState,
    recentDailyStates: journeyStates,
    wellnessMapping: mapping,
    navigatorState: navigator,
    momentumState: navigator,
    previousGuidance,
    guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
    rendererVersion: DAILY_GUIDANCE_PROMPT_VERSION,
    groundingVersion: "dashboard-guidance-grounding-v1",
  };

  const { calculateCurrentSky } = await import("@/lib/astrology/calculateCurrentSky");
  const sky = calculateCurrentSky(new Date(`${date}T12:00:00`));

  let envContext = null;
  try {
    const { getEnvironmentLocationPermission, requestCurrentEnvironmentLocation, getNormalizedEnvironment } = await import("@/lib/environment/service");
    const { buildAIEnvironmentContext } = await import("@/lib/environment/context_utils");

    const locPermission = await getEnvironmentLocationPermission();
    if (locPermission === "granted" || locPermission === "prompt") {
      const loc = await requestCurrentEnvironmentLocation().catch(() => null);
      if (loc) {
        const normEnv = await getNormalizedEnvironment(loc as any).catch(() => null);
        if (normEnv) {
          envContext = buildAIEnvironmentContext(normEnv as any);
        }
      }
    }
  } catch (envErr) {
    console.warn("[DAILY_GUIDANCE_SERVICE_ENV_CONTEXT_FAILED]", envErr);
  }

  const payload = {
    uid,
    date,
    localDateKey: date,
    language: profile.language === "en" ? "en" : "id",
    profile,
    blueprint,
    currentSky: sky,
    natalHouses: blueprint.astrology?.houses || null,
    dailyState: existingDailyState,
    previousDailyState: yesterdayState,
    recentDailyStates: journeyStates,
    previousJournalEntries: journals,
    previousMeditationEntries: meditations,
    previousAudioHealingEntries: audios,
    activityHistory: activities,
    wellnessMapping: mapping,
    wellnessState: existingDailyState,
    navigatorState: navigator,
    momentumState: navigator,
    healingMemory: journeyLearning,
    journeyMemory: journeyLearning,
    previousGuidance,
    environmentContext: envContext,
  };

  // 4. The API route supplies this callback so the shared service owns the
  // generation and exactly-once repository write on the server path.
  if (generate) {
    try {
      const generated = await generate({
        ...(payload as DailyGuidanceContext),
        uid,
        date,
        localDateKey: date,
        profile,
        blueprint,
      });
      const normalized = normalizeUserFacingGuidance(generated, profile);
      if (!isCanonicalDailyGuidanceRecord(normalized, uid, date)) {
        throw new Error("INVALID_DAILY_GUIDANCE_RESULT");
      }
      await dailyGuidanceRepository.saveDailyGuidance(normalized);
      return {
        guidance: normalized,
        source: normalized.source || "ai",
        status: "success",
        error: null,
      };
    } catch (generationError) {
      console.warn("[DAILY_GUIDANCE_SERVICE_GENERATION_FAILED]", generationError);
    }
  } else {
    try {
      const response = await fetch("/api/ai/daily-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.ok && result.guidance) {
          const normalized = normalizeUserFacingGuidance(result.guidance, profile);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
          }
          return {
            guidance: normalized,
            source: normalized.source || "ai",
            status: "success",
            error: null,
          };
        }
      }
    } catch (apiErr) {
      console.warn("[DAILY_GUIDANCE_SERVICE_API_FAILED]", apiErr);
    }
  }

  // 5. Try Local Fallback
  try {
    const input = {
      user: profileToDashboardUser(profile),
      identity: profileToCoreIdentity(profile, blueprint),
      blueprint,
      emotionalState: profile.emotionalState || { currentMood: 5, recurringThemes: [] },
      emotionalMemory: profile.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
      healingProgress: profile.healingProgress || { healingStreak: 0 },
      astrologyTransits: null,
      journalHistory: [],
      meditationHistory: [],
      audioHealingHistory: [],
      activityHistory: [],
      momentumState: null,
      healingMemory: journeyLearning,
      adaptiveContext: {
        dailyVariationSeed: createDailyContentSeed({
          uid,
          localDateKey: date,
          blueprint,
        }),
        completionRateYesterday: 0,
        journalCompletedYesterday: false,
        meditationCompletedYesterday: false,
        audioCompletedYesterday: false,
        practiceCompletedCountYesterday: 0,
        streakDays: 0,
        adaptiveTone: "steady_supportive" as const,
        previousProgressSummary: "Local fallback",
        previousGuidanceSummaries: [],
      },
      language: (profile.language === "en" ? "en" as const : "id" as const),
      generatedAt: new Date().toISOString(),
    };

    const localOutput = generateLocalDailyGuidance(input);
    const localGuidance: DailyGuidance = {
      uid,
      date,
      localDateKey: date,
      schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
      generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
      guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
      dailyVariationSeed: input.adaptiveContext.dailyVariationSeed,
      blueprintHash: generateBlueprintHash(blueprint),
      memoryHash: generateMemoryHash(memoryContext),
      source: "local-fallback",
      soulReflectionText: localOutput.soulReflectionText || localOutput.soulReflection.dailyMessage,
      dailyNoteText: localOutput.dailyNoteText || (localOutput.companionReflection?.fullReflection ?? ""),
      companionReflection: localOutput.companionReflection || {
        preview: (localOutput.dailyNoteText || localOutput.soulReflection.dailyMessage).slice(0, 150) + "...",
        fullReflection: localOutput.dailyNoteText || localOutput.soulReflection.dailyMessage,
      },
      aiInsight: localOutput.soulReflectionText || localOutput.soulReflection.dailyMessage,
      journalPrompt: localOutput.journalingPrompt.prompt,
      meditationSuggestion: localOutput.meditationRecommendation.title,
      dailyPractices: [],
      emotionalFocus: localOutput.soulReflection.theme,
      spiritualFocus: localOutput.soulReflection.theme,
      groundedAction: localOutput.soulReflection.guidance,
      manifestation: localOutput.manifestation,
      categories: localOutput.categories,
      innerworkRecommendations: innerworkIntelligence.getRecommendations({
        activations: [],
        hdType: getCanonicalHumanDesignType(blueprint.humanDesign) || "",
        lifePath: blueprint.lifePath?.number || 0,
        arcanaCenter: blueprint.destinyMatrix?.center || 0,
        rawBlueprint: blueprint,
        unifiedBlueprint: buildUnifiedBlueprintSynthesis({
          language: profile.language || "id",
          profile,
          blueprint,
        }),
        gaiaProfile: profile.gaiaProfile || null,
        activityHistory: activities,
        progressMetrics: calculateProgressMetrics({
          journalEntries: journals,
          meditationEntries: meditations,
          audioHealingEntries: audios,
          physicalActivities: activities,
        }),
        localDateKey: date,
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileSnapshot: profile,
      blueprintSnapshot: blueprint,
      astrologyToday: localOutput.astroEnergy.currentEnergy,
      previousProgressSummary: "Local fallback",
    };

    const normalized = normalizeUserFacingGuidance(localGuidance, profile);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
    }
    await dailyGuidanceRepository.saveDailyGuidance(normalized).catch(() => {});
    return {
      guidance: normalized,
      source: "local-fallback",
      status: "success",
      error: null,
    };
  } catch (fallbackErr) {
    console.error("[DAILY_GUIDANCE_SERVICE_FALLBACK_FAILED]", fallbackErr);
    return {
      guidance: null,
      source: "none",
      status: "error",
      error: fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr),
    };
  }
}
