import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { WellnessSnapshot } from "@/lib/data/types";
import {
  selectWellnessPackages,
  UserWellnessPreferences,
  RecommendationHistoryItem,
  EnvironmentalContext,
  PackageRecommendation,
  RECOMMENDATION_ELIGIBILITY_VERSION,
  isRecommendationEligible
} from "@/lib/engines/wellnessRecommendationEngine";
import { WELLNESS_RECOMMENDATION_LIBRARY } from "@/lib/data/wellnessRecommendationLibrary";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { buildWellnessContextSynthesis, type WellnessContextSynthesis } from "@/lib/intelligence/wellnessContextSynthesis";
// Sprint E: Behavior Intelligence
import { behaviorMemoryRepository } from "@/lib/repositories/behaviorMemoryRepository";
import { buildPreferenceWeightMap } from "@/lib/intelligence/recommendationPreferenceEngine";
import { buildCapacityAdjustmentMap } from "@/lib/intelligence/recommendationCapacityEngine";
import { buildContextBoostMap } from "@/lib/intelligence/recommendationContextEngine";
// Sprint E Hotfix: Failure Observability (Blocker 3)
import { logBehaviorSyncFailure } from "@/lib/firebase/behaviorSyncLogger";
// Sprint F: Longitudinal Wellness Intelligence
import { longitudinalWellnessRepository } from "@/lib/repositories/longitudinalWellnessRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import type { AkashiWellnessContext } from "@/lib/intelligence/wellnessAkashiContext";

// Sprint E Hotfix Blocker 1: Cross-day rotation history constants
/** Maximum number of cross-day recommendation events to include in diversity context. */
const CROSS_DAY_HISTORY_MAX = 30;
/** Maximum age (days) of cross-day history entries to consider. */
const CROSS_DAY_HISTORY_MAX_DAYS = 14;

export interface CuratedRecommendation extends PackageRecommendation {
  humanPriority: string;
  appreciationPhrase: string;
}

export interface CuratedPackage {
  period: string;
  recommendations: CuratedRecommendation[];
}

export interface WellnessCurationState {
  contextSynthesis: WellnessContextSynthesis;
  environment: EnvironmentalContext;
  akashiContext?: AkashiWellnessContext;
  packages: {
    morning: CuratedPackage;
    afternoon: CuratedPackage;
    evening: CuratedPackage;
  };
  completedActivityIds: string[];
  observation: string;
  wellbeingStateLabel: string;
  wellbeingStateClass: string;
}

export interface HistoryDiaryItem {
  day: string;
  activities: string[];
}

const APPRECIATION_PHRASES = [
  "Terima kasih sudah meluangkan waktu untuk dirimu hari ini.",
  "Sedikit ruang yang kamu berikan pada dirimu hari ini tetap berarti.",
  "Semoga jeda kecil ini menemanimu menjalani sisa harimu."
];

function normalizedHealthCondition(value: WellnessSnapshot["healthCondition"]): "normal" | "kurang_fit" | "ringan" | "sedang" | "berat" {
  if (value === "Less Fit") return "kurang_fit";
  if (value === "Mild Illness") return "ringan";
  if (value === "Moderate Illness") return "sedang";
  if (value === "Severe Illness") return "berat";
  return value === "kurang_fit" || value === "ringan" || value === "sedang" || value === "berat" ? value : "normal";
}

interface PersistedWellnessPackage {
  generatedForLocalDate: string;
  generatedForCheckInRevision: number;
  generatedForBeliefPreferenceRevision?: number;
  environmentContextRevision?: string;
  astroContextRevision?: string;
  akashiContextRevision?: string;
  environment?: EnvironmentalContext;
  eligibilityVersion?: string;
  worldviewPreferenceRevision?: number;
  generatedAt?: string;
  invalidationReason?: string;
  packages: WellnessCurationState["packages"];
}

function persistedPackageIsEligible(
  persisted: PersistedWellnessPackage,
  preferences: UserWellnessPreferences | undefined,
  environment: EnvironmentalContext,
): boolean {
  if (persisted.eligibilityVersion !== RECOMMENDATION_ELIGIBILITY_VERSION) return false;
  const input = { preferences, environment };
  return Object.values(persisted.packages || {}).every((pack) =>
    Array.isArray(pack.recommendations) && pack.recommendations.every((recommendation) => {
      const libraryItem = WELLNESS_RECOMMENDATION_LIBRARY.find((item) => item.id === recommendation.id);
      return Boolean(libraryItem && isRecommendationEligible(libraryItem, input));
    }),
  );
}

function localDayContext(localDate: string): NonNullable<EnvironmentalContext> {
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${localDate}T12:00:00Z`)) as NonNullable<EnvironmentalContext>["dayOfWeek"];
  return {
    localDate,
    dayOfWeek,
    isWeekday: dayOfWeek !== "Saturday" && dayOfWeek !== "Sunday",
    isWeekend: dayOfWeek === "Saturday" || dayOfWeek === "Sunday",
  };
}

type WellnessJourneyRecommendationMemory = {
  id: string;
  title: string;
  period: string;
  reason: string;
  intensity: string;
  duration: number;
  safetyAdjustment: string;
  sourceContext: string;
  displayed: boolean;
  acknowledged: boolean;
  completed: boolean;
  skipped: boolean;
  priority?: string;
  worldviewEligible?: boolean;
  opened?: boolean;
  displayedAt?: string;
  openedAt?: string;
  acknowledgedAt?: string;
  completedAt?: string;
  skippedAt?: string;
};

async function persistWellnessJourneyMemory(
  uid: string,
  date: string,
  snapshot: WellnessSnapshot,
  contextSynthesis: WellnessContextSynthesis,
  packages: WellnessCurationState["packages"],
  completedActivityIds: string[],
  environment: EnvironmentalContext,
  checkInRevision: number,
  beliefPreferenceRevision: number,
  akashiContext?: AkashiWellnessContext,
  nervousSystemState?: string,
): Promise<void> {
  const existing = await journeyRepository.getDailyRecord(uid, date).catch(() => null);
  const existingWellness = (existing?.wellnessState?.wellnessV4 || {}) as Record<string, unknown>;
  const existingRecommendations = (existingWellness.recommendations || {}) as Record<string, WellnessJourneyRecommendationMemory>;
  const recommendations: Record<string, WellnessJourneyRecommendationMemory> = { ...existingRecommendations };
  for (const pack of Object.values(packages)) {
    for (const recommendation of pack.recommendations) {
      const previous = recommendations[recommendation.id];
      recommendations[recommendation.id] = {
        id: recommendation.id,
        title: recommendation.title,
        period: pack.period,
        reason: recommendation.reason,
        intensity: recommendation.intensity,
        duration: recommendation.estimatedDuration,
        safetyAdjustment: recommendation.safetyAdjustment,
        sourceContext: recommendation.sourceContext,
        displayed: true,
        acknowledged: previous?.acknowledged ?? false,
        completed: completedActivityIds.includes(recommendation.id) || previous?.completed === true,
        skipped: previous?.skipped ?? false,
        priority: recommendation.priority,
        worldviewEligible: true,
        opened: previous?.opened ?? false,
        displayedAt: previous?.displayedAt || new Date().toISOString(),
        openedAt: previous?.openedAt,
        acknowledgedAt: previous?.acknowledgedAt,
        completedAt: previous?.completedAt,
        skippedAt: previous?.skippedAt,
      };
    }
  }
  await journeyRepository.updateDailyRecord(uid, date, {
    dailyScanCompleted: snapshot.checkInCompleted,
    wellnessState: {
      ...(existing?.wellnessState || {}),
      wellnessV4: {
        ...existingWellness,
        checkIn: {
          date,
          healthCondition: snapshot.healthCondition || "normal",
          lifeSituation: snapshot.lifeSituation || [],
          metrics: snapshot.metrics,
          nervousSystemState: nervousSystemState || existing?.wellnessState?.nervousSystemState || null,
          localDate: date,
          dayOfWeek: environment.dayOfWeek || null,
          isWeekend: environment.isWeekend ?? null,
          checkInRevision,
        },
        contextSummary: {
          primaryCondition: contextSynthesis.primaryCondition,
          activeContext: contextSynthesis.activeContext,
          careFocus: contextSynthesis.careFocus,
          capacityLevel: contextSynthesis.capacityLevel,
          safetyLevel: contextSynthesis.safetyLevel,
          emotionalNeed: contextSynthesis.emotionalNeed,
          physicalNeed: contextSynthesis.physicalNeed,
          recommendedIntensity: contextSynthesis.recommendedIntensity,
          explanation: contextSynthesis.explanation,
          localDate: environment.localDate,
          dayOfWeek: environment.dayOfWeek,
          isWeekend: environment.isWeekend,
          checkInRevision,
          beliefPreferenceRevision,
          environmentContextRevision: environment.environmentContextRevision || null,
          astroContextRevision: environment.astroContextRevision || null,
          environmentContext: {
            weatherCondition: environment.weatherCondition || null,
            precipitationLevel: environment.precipitationLevel || "unknown",
            temperatureLevel: environment.temperatureLevel || "unknown",
            airQualityLevel: environment.airQualityLevel || "unknown",
            windLevel: environment.windLevel || "unknown",
            hazardType: environment.hazardType || "unknown",
            hazardSeverity: environment.hazardSeverity || "unknown",
            sourceTimestamp: environment.sourceTimestamp || null,
            sourceLocationScope: environment.sourceLocationScope || null,
            safetyOverride: environment.hazardSeverity === "active",
          },
          astroContext: environment.astroContext ? {
            ...environment.astroContext,
            enabled: true,
          } : null,
        },
        recommendations,
        packageIdentity: {
          localDate: date,
          checkInRevision,
          beliefPreferenceRevision,
          environmentContextRevision: environment.environmentContextRevision || null,
          astroContextRevision: environment.astroContextRevision || null,
          akashiContextRevision: akashiContext?.revision || null,
        },
        revisionMetadata: {
          checkInRevision,
          beliefPreferenceRevision,
          environmentContextRevision: environment.environmentContextRevision || null,
          astroContextRevision: environment.astroContextRevision || null,
          akashiContextRevision: akashiContext?.revision || null,
        },
        environmentContext: {
          condition: environment.weatherCondition || null,
          severity: environment.hazardSeverity || "unknown",
          sourceTimestamp: environment.sourceTimestamp || null,
          locationScope: environment.sourceLocationScope || null,
          safetyOverride: environment.hazardSeverity === "active",
          revision: environment.environmentContextRevision || null,
        },
        astroContext: environment.astroContext ? {
          dailyTheme: environment.astroContext.astroTheme || null,
          moonPhase: environment.astroContext.moonPhase || null,
          majorTags: environment.astroContext.majorTransitTags || [],
          validForLocalDate: environment.astroContext.validForLocalDate || date,
          sourceVersion: environment.astroContext.sourceVersion || null,
          revision: environment.astroContextRevision || null,
          influenced: { section2: true, section3: true, section4: true },
        } : null,
        akashiContext: akashiContext?.enabled ? {
          activatedPatternIds: akashiContext.activatedPatternIds,
          matchedLifeSituation: akashiContext.matchedLifeSituation,
          availableStrength: akashiContext.availableStrength || null,
          sourceVersion: akashiContext.sourceVersion || null,
          revision: akashiContext.revision || null,
          influencedSections: { section2: true, section3: true, section4: true },
        } : null,
        patternContext: akashiContext?.enabled ? {
          activatedPatternIds: akashiContext.activatedPatternIds,
          matchedLifeSituation: akashiContext.matchedLifeSituation,
          supportingDailyStateFields: ["healthCondition", "metrics", "lifeSituation"],
          recommendedResponse: akashiContext.recommendedResponse || null,
          availableStrength: akashiContext.availableStrength || null,
          sourceVersion: akashiContext.sourceVersion || null,
        } : null,
        updatedAt: new Date().toISOString(),
      },
    },
  });
}

async function markJourneyRecommendationCompleted(uid: string, date: string, activityId: string): Promise<void> {
  const existing = await journeyRepository.getDailyRecord(uid, date).catch(() => null);
  const wellnessState = existing?.wellnessState || {};
  const wellnessV4 = (wellnessState.wellnessV4 || {}) as Record<string, unknown>;
  const recommendations = { ...((wellnessV4.recommendations || {}) as Record<string, WellnessJourneyRecommendationMemory>) };
  const previous = recommendations[activityId];
  if (!previous) return;
  recommendations[activityId] = {
    ...previous,
    acknowledged: true,
    completed: true,
    opened: true,
    acknowledgedAt: previous.acknowledgedAt || new Date().toISOString(),
    completedAt: previous.completedAt || new Date().toISOString(),
  };
  await journeyRepository.updateDailyRecord(uid, date, {
    wellnessState: { ...wellnessState, wellnessV4: { ...wellnessV4, recommendations, updatedAt: new Date().toISOString() } },
  });
}

function getHumanPriorityLabel(priority: string): string {
  switch (priority) {
    case "PRIMARY": return "⭐ Yang paling dibutuhkan hari ini";
    case "SECONDARY": return "🕒 Jika masih ada ruang hari ini";
    case "OPTIONAL": return "☕ Bila ingin menciptakan suasana yang lebih nyaman";
    case "MICRO": return "🐚 Bila hari ini terasa cukup berat";
    default: return "💡 Saran keselarasan harian";
  }
}

function mapToCurated(rec: PackageRecommendation): CuratedRecommendation {
  const index = rec.title.length % APPRECIATION_PHRASES.length;
  return {
    ...rec,
    humanPriority: getHumanPriorityLabel(rec.priority),
    appreciationPhrase: APPRECIATION_PHRASES[index]
  };
}

/**
 * Loads the curated packages from the selector engine.
 */
export async function loadWellnessCuration(
  uid: string,
  date: string,
  snapshot: WellnessSnapshot,
  preferences?: UserWellnessPreferences,
  environment?: EnvironmentalContext,
  akashiContext?: AkashiWellnessContext
): Promise<WellnessCurationState> {
  const dailyState = await dailyStateRepository.getDailyState(uid, date);
  const completedActivityIds = dailyState?.completedActivityIds || [];
  const effectiveEnvironment = { ...localDayContext(date), ...(environment || {}) };
  const firstAkashiPattern = akashiContext?.dominantThemes?.[0];
  const contextSynthesis = buildWellnessContextSynthesis(snapshot, {
    ...effectiveEnvironment,
    akashiEnabled: akashiContext?.enabled,
    akashiPatternLabel: firstAkashiPattern,
    akashiStrength: akashiContext?.availableStrength,
  });
  const checkInRevision = dailyState?.checkInRevision || 1;
  const beliefPreferenceRevision = dailyState?.beliefPreferenceRevision || 0;
  const persistedPackage = dailyState?.wellnessRecommendationPackage as PersistedWellnessPackage | undefined;
  const persistedPackageEligible = persistedPackage?.packages
    ? persistedPackageIsEligible(persistedPackage, preferences, effectiveEnvironment)
    : false;
  if (
    persistedPackage?.generatedForLocalDate === date &&
    persistedPackage.generatedForCheckInRevision === checkInRevision &&
    (persistedPackage.generatedForBeliefPreferenceRevision || 0) === beliefPreferenceRevision &&
    (persistedPackage.akashiContextRevision || "") === (akashiContext?.revision || "") &&
    persistedPackage.packages && persistedPackageEligible
  ) {
    return {
      contextSynthesis,
      environment: persistedPackage.environment || effectiveEnvironment,
      akashiContext,
      packages: persistedPackage.packages,
      completedActivityIds,
      observation: "Rekomendasi hari ini tetap disesuaikan dengan kabar terakhir yang kamu simpan.",
      wellbeingStateLabel: contextSynthesis.capacityLevel === "low" ? "Jeda (Resting)" : contextSynthesis.capacityLevel === "high" ? "Aktif (Active)" : "Selaras (Balanced)",
      wellbeingStateClass: contextSynthesis.capacityLevel === "low" ? "bg-orange-50 text-orange-700" : contextSynthesis.capacityLevel === "high" ? "bg-green-50 text-green-700" : "bg-[#FCFAF5] text-[#7B8776]",
    };
  }

  // Format completed IDs as history items for cooldown evaluation
  const history: RecommendationHistoryItem[] = completedActivityIds.map(id => ({
    recommendationId: id,
    completedAt: dailyState?.updatedAt || new Date().toISOString()
  }));

  // --- Sprint E: Load behavior memory (graceful fallback on error) ---
  let preferenceWeights: ReturnType<typeof buildPreferenceWeightMap> | undefined;
  let capacityAdjustments: ReturnType<typeof buildCapacityAdjustmentMap> | undefined;
  let contextBoosts: ReturnType<typeof buildContextBoostMap> | undefined;
  let lastSeenAt: Record<string, string> | undefined;
  // Sprint E Hotfix Blocker 1: Cross-day recommendation history for longitudinal diversity
  let crossDayHistory: RecommendationHistoryItem[] = [];

  const energy = snapshot.metrics?.energy ?? 5;

  try {
    // Ensure document exists before any increments are attempted later
    await behaviorMemoryRepository.ensureExists(uid);
    const memory = await behaviorMemoryRepository.get(uid);

    const lifeSituationIds = Array.isArray(snapshot.lifeSituation)
      ? snapshot.lifeSituation.filter((s): s is string => typeof s === "string")
      : [];

    // Build all intelligence maps — professional/health gates already run in filter step
    preferenceWeights = buildPreferenceWeightMap(memory);
    capacityAdjustments = buildCapacityAdjustmentMap(
      memory,
      energy,
      WELLNESS_RECOMMENDATION_LIBRARY
    );
    contextBoosts = buildContextBoostMap(memory, lifeSituationIds);
    lastSeenAt = memory.lastSeenAt;

    // --- BLOCKER 1: Build cross-day recommendation history ---
    const cutoffMs = Date.now() - CROSS_DAY_HISTORY_MAX_DAYS * 24 * 60 * 60 * 1000;
    crossDayHistory = (memory.seenRecommendationKeys || [])
      .filter(key => !key.endsWith(":completed"))
      .map(key => {
        const parts = key.split(":");
        return {
          recommendationId: parts[2],
          completedAt: parts[0],
          period: parts[1]
        } as any;
      })
      .filter(item => new Date(item.completedAt).getTime() >= cutoffMs)
      .slice(-CROSS_DAY_HISTORY_MAX);
  } catch (err) {
    logBehaviorSyncFailure("loadMemory", uid, err);
  }

  const combinedHistory: RecommendationHistoryItem[] = [
    ...crossDayHistory,
    ...history,
  ];

  const rawPackages = selectWellnessPackages({
    snapshot,
    preferences,
    history: combinedHistory,
    environment: effectiveEnvironment,
    lifeSituationContext: contextSynthesis.lifeSituation,
    preferenceWeights,
    capacityAdjustments,
    contextBoosts,
    lastSeenAt,
    akashiContext,
  });

  const curatedPackages = {
    morning: { period: rawPackages.morning.period, recommendations: rawPackages.morning.recommendations.map(mapToCurated) },
    afternoon: { period: rawPackages.afternoon.period, recommendations: rawPackages.afternoon.recommendations.map(mapToCurated) },
    evening: { period: rawPackages.evening.period, recommendations: rawPackages.evening.recommendations.map(mapToCurated) },
  };
  await dailyStateRepository.saveDailyState(uid, date, {
    wellnessRecommendationPackage: {
      generatedForLocalDate: date,
      generatedForCheckInRevision: checkInRevision,
      generatedForBeliefPreferenceRevision: beliefPreferenceRevision,
      eligibilityVersion: RECOMMENDATION_ELIGIBILITY_VERSION,
      worldviewPreferenceRevision: beliefPreferenceRevision,
      generatedAt: new Date().toISOString(),
      invalidationReason: persistedPackage && !persistedPackageEligible ? "eligibility_changed" : undefined,
      environmentContextRevision: effectiveEnvironment.environmentContextRevision,
      astroContextRevision: effectiveEnvironment.astroContextRevision,
      akashiContextRevision: akashiContext?.revision,
      environment: effectiveEnvironment,
      packages: curatedPackages,
    },
  });
  await persistWellnessJourneyMemory(uid, date, snapshot, contextSynthesis, curatedPackages, completedActivityIds, effectiveEnvironment, checkInRevision, beliefPreferenceRevision, akashiContext, dailyState?.nervousSystemState).catch((err) => {
    logBehaviorSyncFailure("loadMemory", uid, err);
  });

  // --- Sprint E: Record recommended IDs (once, idempotent per dateKey+period, Correction #1 & #3) ---
  const periods: Array<["morning" | "afternoon" | "evening", typeof rawPackages.morning]> = [
    ["morning", rawPackages.morning],
    ["afternoon", rawPackages.afternoon],
    ["evening", rawPackages.evening],
  ];
  for (const [period, pkg] of periods) {
    const ids = pkg.recommendations.map((r) => r.id);
    behaviorMemoryRepository.recordRecommended(uid, ids, date, period).catch((err) => {
      logBehaviorSyncFailure("recordRecommended", uid, err);
    });
  }

  const healthCondition = normalizedHealthCondition(snapshot.healthCondition);

  // Observasi Batin based on check-in
  let observation = "Ritmemu hari ini terlihat cukup seimbang. Tidak perlu banyak hal, cukup menjaga yang sudah baik.";
  if (healthCondition === "berat" || healthCondition === "sedang") {
    observation = "Hari ini tubuhmu tampak lebih membutuhkan jeda daripada dorongan untuk terus bergerak.";
  } else if (healthCondition === "ringan" || healthCondition === "kurang_fit") {
    observation = "Hari ini tubuhmu memberi tanda untuk melambat. Mari hargai batasannya agar tenagamu segera pulih.";
  } else if (energy < 4) {
    observation = "Hari ini tubuhmu tampak lebih membutuhkan jeda daripada dorongan untuk terus bergerak.";
  } else if (energy > 7) {
    observation = "Sepertinya hari ini ada ruang yang baik untuk bergerak sedikit lebih aktif, selama tubuhmu tetap terasa nyaman.";
  }

  // Capacity indicators
  let wellbeingStateLabel = "Selaras (Balanced)";
  let wellbeingStateClass = "bg-[#FCFAF5] text-[#7B8776]";

  if (energy < 4) {
    wellbeingStateLabel = "Jeda (Resting)";
    wellbeingStateClass = "bg-orange-50 text-orange-700";
  } else if (energy > 7) {
    wellbeingStateLabel = "Aktif (Active)";
    wellbeingStateClass = "bg-green-50 text-green-700";
  }

  return {
    contextSynthesis,
    environment: effectiveEnvironment,
    akashiContext,
    packages: curatedPackages,
    completedActivityIds,
    observation,
    wellbeingStateLabel,
    wellbeingStateClass
  };
}

/**
 * Registers an activity as acknowledged by appending its ID to the daily state.
 *
 * Sprint E: Also writes completion to behavior memory immediately (Correction #3).
 * Sprint F: Records event in longitudinal wellness repository for aggregated history.
 */
export async function acknowledgeWellnessActivity(
  uid: string,
  date: string,
  activityId: string,
  snapshot?: WellnessSnapshot,
  period?: "morning" | "afternoon" | "evening"
): Promise<string[]> {
  const dailyState = await dailyStateRepository.getDailyState(uid, date);
  const completedActivityIds = dailyState?.completedActivityIds || [];

  if (!completedActivityIds.includes(activityId)) {
    const updatedIds = [...completedActivityIds, activityId];
    await dailyStateRepository.saveDailyState(uid, date, {
      completedActivityIds: updatedIds
    });
    await markJourneyRecommendationCompleted(uid, date, activityId).catch((err) => {
      logBehaviorSyncFailure("recordCompleted", uid, err);
    });

    const libEntry = WELLNESS_RECOMMENDATION_LIBRARY.find((r) => r.id === activityId);
    const duration = libEntry?.estimatedDuration ?? 5;
    const energy = snapshot?.metrics?.energy ?? 5;
    const determinedPeriod = period || inferPeriod();

    // --- Sprint E: Write completion to behavior memory immediately ---
    try {
      const lifeSituationIds = Array.isArray(snapshot?.lifeSituation)
        ? (snapshot!.lifeSituation as unknown[]).filter((s): s is string => typeof s === "string")
        : [];

      await behaviorMemoryRepository.recordCompleted(
        uid,
        activityId,
        duration,
        energy,
        lifeSituationIds,
        date
      );
    } catch (err) {
      logBehaviorSyncFailure("recordCompleted", uid, err);
    }

    // --- Sprint F: Record event for Longitudinal Wellness Intelligence ---
    if (libEntry) {
      longitudinalWellnessRepository.recordEvent(uid, {
        eventId: `${date}:${activityId}:completed`,
        timestamp: new Date().toISOString(),
        dateKey: date,
        recommendationId: activityId,
        rawDomain: libEntry.domain,
        subcategory: libEntry.subcategory,
        durationMinutes: duration,
        period: determinedPeriod === "evening" ? "night" : determinedPeriod,
        difficulty: libEntry.difficulty,
        energyCapacity: libEntry.energyLevel === "any" ? "unknown" : libEntry.energyLevel,
        environment: libEntry.indoorOutdoor,
      }).catch(err => {
        // Log using the same mechanism for consistency
        logBehaviorSyncFailure("recordCompleted" as any, uid, err);
      });
    }

    return updatedIds;
  }

  return completedActivityIds;
}

function inferPeriod(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}

/**
 * Retrieves completed activities of the last 7 days in a clean, narrative format.
 */
export async function loadWellnessHistoryLogs(uid: string, timezone: string): Promise<HistoryDiaryItem[]> {
  const logs: HistoryDiaryItem[] = [];
  const daysOfWeek = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = daysOfWeek[d.getDay()];
    const formattedDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    const dateKey = getLocalDateKey(d, timezone);

    const state = await dailyStateRepository.getDailyState(uid, dateKey).catch(() => null);
    const completedIds = state?.completedActivityIds || [];

    const titles = completedIds
      .map(id => WELLNESS_RECOMMENDATION_LIBRARY.find(item => item.id === id)?.title)
      .filter((t): t is string => Boolean(t));

    logs.push({
      day: `${dayStr}, ${formattedDate}`,
      activities: titles
    });
  }

  return logs;
}
