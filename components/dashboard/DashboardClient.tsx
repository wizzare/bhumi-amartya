"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CoreIdentity } from "@/components/dashboard/CoreIdentity";
import { AstroTodayCard } from "@/components/dashboard/AstroTodayCard";
import { EnvironmentContextCard } from "@/components/dashboard/EnvironmentContextCard";
import { DailyUserFlowGuide } from "@/components/dashboard/DailyUserFlowGuide";
import { SoulReflectionCard } from "@/components/dashboard/SoulReflectionCard";
import { AccuracyUpgradeBanner } from "@/components/dashboard/AccuracyUpgradeBanner";
import { PendingHdRecoveryBanner } from "@/components/dashboard/PendingHdRecoveryBanner";
import { GuardianIdentityCard } from "@/components/dashboard/GuardianIdentityCard";
import { SafetyActionCard } from "@/components/safety/SafetyActionCard";
import { evaluateSafetyTriggers, SafetyState } from "@/lib/engines/safetySentinelEngine";
import { safetyRepository, TrustedContact } from "@/lib/repositories/safetyRepository";
import { wellnessMappingRepository } from "@/lib/repositories/wellnessMappingRepository";
import { AppNav } from "@/components/navigation/AppNav";
import { translations } from "@/lib/data/translations";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { APP_TIME_REFRESH_MS, getEnvironmentWindowKey } from "@/lib/dailyGuidance/timeOfDayGreeting";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import {
  DAILY_GUIDANCE_PROMPT_VERSION,
  DAILY_GUIDANCE_SCHEMA_VERSION,
  DAILY_GUIDANCE_CONTENT_VERSION,
  getDailyGuidanceStaleReason,
} from "@/lib/dailyGuidance/version";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { journalRepository } from "@/lib/repositories/journalRepository";
import { meditationRepository } from "@/lib/repositories/meditationRepository";
import { audioHealingRepository } from "@/lib/repositories/audioHealingRepository";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getCompletionSummary } from "@/lib/engines/completionEngine";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { repairOwnerHumanDesign } from "@/lib/humandesign/ownerOverride";
import { generateLocalDailyGuidance } from "@/lib/orchestrators/localDailyGuidanceFallback";
import { innerworkIntelligence } from "@/lib/engines/innerworkIntelligence";
import { calculateProgressMetrics } from "@/lib/engines/progressCalculationEngine";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { participationEngine } from "@/lib/engines/participationEngine";
import { createDailyContentSeed } from "@/lib/dailyGuidance/dailyContentKey";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { normalizeUserFacingGuidance } from "@/lib/dailyGuidance/normalizeUserFacingGuidance";
import { astroAwarenessEngine } from "@/lib/engines/astroAwarenessEngine";
import { loadWellnessDailyIntelligence } from "@/lib/services/wellnessDailyIntelligence";
import { generateBlueprintHash, generateMemoryHash } from "@/lib/utils/hashing";
import { buildMirrorDailyReflection } from "@/lib/dailyGuidance/mirrorDailyReflection";
import { buildArsipAkashiInputFromProfile } from "@/lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";
import { buildProfileDailyGuidance } from "@/lib/dailyGuidance/profileDailySynthesis";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { WeeklyGuidanceCard } from "@/components/dashboard/WeeklyGuidanceCard";
import { buildWeeklyGuidance } from "@/lib/weeklyGuidance/weeklyGuidanceEngine";
import type { WeeklyGuidance } from "@/lib/weeklyGuidance/types";
import { DashboardReviewPrompt } from "@/components/rating/DashboardReviewPrompt";

function withCanonicalDailyConclusion(
  guidance: DailyGuidance,
  uid: string,
  profile: Record<string, unknown>,
  blueprint: Record<string, unknown>,
  localDateKey: string,
  timezone: string,
): DailyGuidance {
  if (guidance.dailyConclusion?.text) return guidance;

  const arsipInput = buildArsipAkashiInputFromProfile(
    {
      uid,
      timezone,
      birthDate: typeof profile.birthDate === "string" ? profile.birthDate : undefined,
      birthTime: typeof profile.birthTime === "string" ? profile.birthTime : undefined,
      referenceDate: `${localDateKey}T12:00:00.000Z`,
    },
    blueprint as any,
  );
  const arsipViewModel = buildArsipAkashiProfileViewModel(arsipInput);
  const catatanGuidance = buildProfileDailyGuidance({
    uid,
    profile,
    blueprint,
    arsipViewModel,
    localDateKey,
    timezone,
    referenceDate: new Date(`${localDateKey}T12:00:00.000Z`),
  });

  return {
    ...guidance,
    dailySynthesisState: catatanGuidance.dailySynthesisState,
    dailySynthesisSources: catatanGuidance.dailySynthesisSources,
    dailyConclusion: catatanGuidance.dailyConclusion,
    dailyNarrativeParagraphs: catatanGuidance.dailyNarrativeParagraphs,
    dailyNoteText: catatanGuidance.dailyNoteText,
    soulReflectionText: catatanGuidance.dailyConclusion?.text ?? guidance.soulReflectionText,
    categories: catatanGuidance.categories ?? guidance.categories,
    dailyVariationSeed: catatanGuidance.dailyVariationSeed ?? guidance.dailyVariationSeed,
  };
}

export function DashboardClient() {
  const router = useRouter();
  const auth = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [, setDailyState] = useState<DailyState | null>(null);
  const [, setYesterdayState] = useState<DailyState | null>(null);
  const [, setRecentDailyStates] = useState<DailyState[]>([]);
  const [navigatorState, setNavigatorState] = useState<NavigatorState | null>(null);
  const [, setDailyNoteFocus] = useState<string>("");
  const [safetyState, setSafetyState] = useState<SafetyState | null>(null);
  const [trustedContact, setTrustedContact] = useState<TrustedContact | undefined>(undefined);
  const [dgLoading, setDgLoading] = useState(false);
  const [dgError, setDgError] = useState<string | null>(null);
  const [weeklyGuidance, setWeeklyGuidance] = useState<WeeklyGuidance | null>(null);
    const [appNow, setAppNow] = useState(() => new Date());

  const language = (profile?.language || "id") as "id" | "en";
  const t = translations[language];
  const appTimezone = profile?.timezone || profile?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const appDateKey = getLocalDateKey(appNow, appTimezone);
  const appEnvironmentWindowKey = getEnvironmentWindowKey(appNow, appDateKey);
  const mirrorDaily = buildMirrorDailyReflection({
    guidance: dailyGuidance,
    userName: profile?.fullName || profile?.displayName || profile?.name,
    now: appNow,
    timezone: appTimezone,
    loading: dgLoading,
    error: dgError,
  });
  const visibleSoulReflection = mirrorDaily.text;
  // TEST CHANGE


  useEffect(() => {
    const interval = window.setInterval(() => setAppNow(new Date()), APP_TIME_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    setDailyGuidance(null);
  }, [auth?.user?.uid, appDateKey]);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid || !profile || !blueprint || loading) return;
    try {
      const arsipInput = buildArsipAkashiInputFromProfile({
        uid,
        timezone: appTimezone,
        birthDate: typeof profile.birthDate === "string" ? profile.birthDate : undefined,
        birthTime: typeof profile.birthTime === "string" ? profile.birthTime : undefined,
        referenceDate: `${appDateKey}T12:00:00.000Z`,
      }, blueprint as any);
      const arsipViewModel = buildArsipAkashiProfileViewModel(arsipInput);
      setWeeklyGuidance(buildWeeklyGuidance({ uid, profile, blueprint, arsipViewModel, referenceDate: appNow, timezone: appTimezone, journey: profile.journeyState || profile.currentJourney || null }));
    } catch (error) {
      console.warn("[WEEKLY_GUIDANCE_BUILD_FAILED]", error);
      setWeeklyGuidance(null);
    }
  }, [auth?.user?.uid, profile, blueprint, loading, appDateKey, appTimezone, appNow]);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid || !profile || !blueprint || loading) return;
    void fetchBackgroundData(uid, profile, blueprint);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appEnvironmentWindowKey]);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid || !dailyGuidance || !profile) return;
    const timezone = profile?.timezone || profile?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const appDate = dailyGuidance.localDateKey || dailyGuidance.date || getLocalDateKey(new Date(), timezone);
    const categories = dailyGuidance.categories;
    const dominantIssue = dailyGuidance.dominantIssue?.key || "";
    const awareness = astroAwarenessEngine.getAwarenessContext(new Date());

    void journeyRepository.updateDailyRecord(uid, appDate, {
      dominantIssue,
      issueCategory: dailyGuidance.dominantIssue?.category || "",
      navigatorMode: navigatorState?.mode || "REFLECTION",
      catatanSummary: dailyGuidance.dailyNoteText || dailyGuidance.companionReflection?.fullReflection || "",
      catatanMainDirection: categories?.advice?.advice || dailyGuidance.groundedAction || "",
      catatanChallenge: categories?.challenges?.insight || categories?.challenges?.reason || "",
      catatanOpportunity: categories?.opportunities?.insight || categories?.opportunities?.reason || "",
      astroSummary: dailyGuidance.astrologyToday || awareness.currentMoonPhase.label,
      astroEvents: awareness.activeAwarenessEvents.map((event) => `${event.type}:${event.title}`),
      profileSignals: [],
      sourceConfidence: dominantIssue ? 0.9 : categories ? 0.75 : 0.5,
    }).catch((error) => console.warn("[JOURNEY_CATATAN_UPDATE_FAILED]", error));
  }, [auth?.user?.uid, dailyGuidance, navigatorState?.mode, profile]);



  async function fetchBackgroundData(uid: string, p: any, b: any) {
    const timezone = p?.timezone || p?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const today = getLocalDateKey(appNow, timezone);
    const envWindowKey = getEnvironmentWindowKey(appNow, today);
    const localCacheKey = `dailyGuidance:${uid}:${envWindowKey}`;
    const invalidCacheKeys = ["dailyGuidance", `dailyGuidance:${today}`, "dailyGuidance:today", "globalDailyGuidance", "sharedReflection", "staticReflection"];

    setDgLoading(true);
    setDgError(null);
    let journals: any[] = [];
    let meditations: any[] = [];
    let audios: any[] = [];
    let activities: any[] = [];
    let journeyLearning: Record<string, unknown> | null = null;
    let guidanceMemoryContext: Record<string, unknown> | null = null;

    try {
      const existingDailyState = await dailyStateRepository.getDailyState(uid, today).catch(() => null);
      setDailyState(existingDailyState);
      await journeyRepository.ensureDailyRecord(uid, today, {
        navigatorMode: "REFLECTION",
        wellnessState: existingDailyState?.wellnessSnapshot
          ? { ...existingDailyState.wellnessSnapshot.metrics, nervousSystemState: existingDailyState.nervousSystemState ?? "" }
          : {},
        dailyScanCompleted: Boolean(existingDailyState?.wellnessSnapshot?.checkInCompleted),
        dailyScanSummary: existingDailyState?.emotionalWord
          ? `Emosi hari ini: ${existingDailyState.emotionalWord}.`
          : "",
      }).catch((error) => console.warn("[JOURNEY_DAILY_ENSURE_FAILED]", error));
      const completion = getCompletionSummary(existingDailyState);

      // BUILD 37: Consolidate yesterday if needed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getLocalDateKey(yesterday, timezone);
      const yesterdayState = await dailyStateRepository.getDailyState(uid, yesterdayKey).catch(() => null);
      setYesterdayState(yesterdayState);
      if (yesterdayState && !yesterdayState.consolidatedAt) {
        console.log(`[CONSOLIDATION] Triggering end-of-day summary for ${yesterdayKey}`);
        void dailyStateRepository.consolidateDay(uid, yesterdayKey).catch(err => console.error("Consolidation failed", err));
      }

      if (completion.isUnlocked) {
        trackEvent("daily_completion_reached", uid);
      }

      invalidCacheKeys.forEach((key) => window.localStorage.removeItem(key));

      const [recent, j, m, a, act, mapping, safetyCfg, wellnessIntelligence] = await Promise.all([
        dailyGuidanceRepository.getRecentGuidance(uid, 5).catch(() => []),
        journalRepository.getJournalEntries(uid, 5).catch(() => []),
        meditationRepository.getMeditationEntries(uid, 5).catch(() => []),
        audioHealingRepository.getAudioHealingEntries(uid, 5).catch(() => []),
        activityRepository.getRecentActivities(uid, 5).catch(() => []),
        wellnessMappingRepository.getMapping(uid).catch(() => null),
        safetyRepository.getSafetyConfig(uid).catch(() => null),
        loadWellnessDailyIntelligence({ uid, profile: p, blueprint: b, date: today }),
      ]);
      const journeyStates = wellnessIntelligence.recentDailyStates;
      const navigator = wellnessIntelligence.navigatorState;
      const journeyMemory = wellnessIntelligence.journeyMemory;
      setRecentDailyStates(journeyStates);
      setNavigatorState(navigator);
      await journeyRepository.updateDailyRecord(uid, today, {
        navigatorMode: navigator?.mode || "REFLECTION",
      }).catch((error) => console.warn("[JOURNEY_NAVIGATOR_UPDATE_FAILED]", error));

      journals = j;
       meditations = m;
      audios = a;
      activities = act;
      setTrustedContact(safetyCfg?.trustedContact);

      if (mapping) {
         const sState = evaluateSafetyTriggers(mapping, existingDailyState?.wellnessSnapshot ? [existingDailyState.wellnessSnapshot] : []);
         setSafetyState(sState);
      }

      const previousGuidance = recent.find(g => g.localDateKey !== today);
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
      journeyLearning = journeyMemory ? {
        weeklyLearning: journeyMemory.weeklyLearning,
        monthlyTheme: journeyMemory.monthlyLearning,
        growthNarrative: journeyMemory.growthNarrative,
        coachMemory: journeyMemory.coachMemory,
        practiceEffectiveness: journeyMemory.practiceInsights,
        recentPracticePatterns,
      } : null;
      const memoryContext: Record<string, unknown> = {
        ...p,
        profile: p,
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
      guidanceMemoryContext = memoryContext;

      const { calculateCurrentSky } = await import("@/lib/astrology/calculateCurrentSky");
      const sky = calculateCurrentSky(new Date(`${today}T12:00:00`));
      const awareness = astroAwarenessEngine.getAwarenessContext(new Date());
      setDailyNoteFocus(awareness.activeAwarenessEvents[0]?.explanation.id || "");

      // Phase 4: Environment Context for AI
      let envContext = null;
      try {
        const { getEnvironmentLocationPermission, requestCurrentEnvironmentLocation, getNormalizedEnvironment } = await import("@/lib/environment/service");
        const { buildAIEnvironmentContext } = await import("@/lib/environment/context_utils");

        const locPermission = await getEnvironmentLocationPermission();
        if (locPermission === "granted" || locPermission === "prompt") {
          const loc = await requestCurrentEnvironmentLocation().catch(() => null);
          if (loc) {
            const normEnv = await getNormalizedEnvironment(loc).catch(() => null);
            if (normEnv) {
              envContext = buildAIEnvironmentContext(normEnv);
            }
          }
        }
      } catch (envErr) {
        console.warn("[DASHBOARD_ENV_CONTEXT_FAILED]", envErr);
      }
      memoryContext.currentSky = sky;
      memoryContext.astroAwareness = awareness;
      memoryContext.environmentContext = envContext;

      const cached = window.localStorage.getItem(localCacheKey);
      if (cached) {
        const parsed = safeJsonParse<DailyGuidance | null>(cached, null);
        const staleReason = parsed ? getDailyGuidanceStaleReason(parsed, {
          uid,
          localDateKey: today,
          blueprint: b,
          context: memoryContext,
          previousGuidance
        }) : "parse_error";
        if (parsed && !staleReason) {
          const normalized = withCanonicalDailyConclusion(normalizeUserFacingGuidance(parsed, p), uid, p, b, today, timezone);
          console.log(`[DAILY GUIDANCE CACHE HIT] Local storage hit for ${uid} on ${today}`);
          setDailyGuidance(normalized);
          window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
          setDgLoading(false);
          return;
        } else {
          console.log(`[DAILY GUIDANCE CACHE MISS] Local storage stale or missing for ${uid} on ${today}. Reason: ${staleReason}`);
          window.localStorage.removeItem(localCacheKey);
        }
      }

      const existing = await dailyGuidanceRepository.getDailyGuidance(uid, today).catch(() => null);
      const existingStaleReason = getDailyGuidanceStaleReason(existing, {
          uid,
          localDateKey: today,
          blueprint: b,
          context: memoryContext,
        previousGuidance
      });

      if (existing && !existingStaleReason) {
        const normalized = withCanonicalDailyConclusion(normalizeUserFacingGuidance(existing, p), uid, p, b, today, timezone);
        setDailyGuidance(normalized);
        window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
        await dailyGuidanceRepository.saveDailyGuidance(normalized).catch(() => {});
        setDgLoading(false);
        return;
      }

      const payload = {
        uid, date: today, localDateKey: today, language, profile: p, blueprint: b,
        currentSky: sky as any,
        natalHouses: b.astrology?.houses || null,
        dailyState: existingDailyState,
        previousDailyState: yesterdayState,
        recentDailyStates: journeyStates,
        previousJournalEntries: journals, previousMeditationEntries: meditations,
        previousAudioHealingEntries: audios, activityHistory: activities,
        wellnessMapping: mapping,
        wellnessState: existingDailyState,
        navigatorState: navigator,
        momentumState: navigator,
        healingMemory: journeyLearning,
        journeyMemory: journeyLearning,
        previousGuidance,
        environmentContext: envContext,
      };

      const response = await fetch("/api/ai/daily-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const result = await response.json() as { ok: true; guidance: DailyGuidance } | { ok: false; reason: string };
      if (!result.ok) throw new Error(result.reason);
      const dg = withCanonicalDailyConclusion(normalizeUserFacingGuidance(result.guidance, p), uid, p, b, today, timezone);
      const staleReason = getDailyGuidanceStaleReason(dg, {
        uid,
        localDateKey: today,
        blueprint: b,
        context: memoryContext,
        previousGuidance,
      });
      if (staleReason) throw new Error(`Daily guidance returned stale output: ${staleReason}`);

      setDailyGuidance(dg);
      window.localStorage.setItem(localCacheKey, JSON.stringify(dg));
      await dailyGuidanceRepository.saveDailyGuidance(dg).catch(() => {});
    } catch (err) {
      console.warn("[DAILY GUIDANCE FETCH ERROR]", err);

      // Attempt Local Fallback
      try {
        const input: DailyGuidanceInput = {
          user: profileToDashboardUser(p as any),
          identity: profileToCoreIdentity(p as any, b as any),
          blueprint: b as any,
          emotionalState: (p as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
          emotionalMemory: (p as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
          healingProgress: (p as any)?.healingProgress || { healingStreak: 0 },
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
              localDateKey: today,
              blueprint: b as Record<string, unknown>,
            }),
            completionRateYesterday: 0,
            journalCompletedYesterday: false,
            meditationCompletedYesterday: false,
            audioCompletedYesterday: false,
            practiceCompletedCountYesterday: 0,
            streakDays: 0,
            adaptiveTone: "steady_supportive",
            previousProgressSummary: "Local fallback",
            previousGuidanceSummaries: [],
          },
          language: language || "id",
          generatedAt: new Date().toISOString(),
        };

        const fallbackSeed = input.adaptiveContext?.dailyVariationSeed || createDailyContentSeed({
          uid,
          localDateKey: today,
          blueprint: b as Record<string, unknown>,
        });
        const localOutput = generateLocalDailyGuidance(input);
        const localGuidance: DailyGuidance = {
          uid,
          date: today,
          localDateKey: today,
          schemaVersion: DAILY_GUIDANCE_SCHEMA_VERSION,
          generatedWithPromptVersion: DAILY_GUIDANCE_PROMPT_VERSION,
          guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
          dailyVariationSeed: fallbackSeed,
          blueprintHash: generateBlueprintHash(b),
          memoryHash: generateMemoryHash(guidanceMemoryContext ?? {
            profile: p,
            previousJournalEntries: journals,
            previousMeditationEntries: meditations,
            previousAudioHealingEntries: audios,
            previousActivityEntries: activities,
            healingMemory: journeyLearning,
            journeyMemory: journeyLearning,
            guidanceVersion: DAILY_GUIDANCE_CONTENT_VERSION,
            rendererVersion: DAILY_GUIDANCE_PROMPT_VERSION,
            groundingVersion: "dashboard-guidance-grounding-v1",
          }),
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
            hdType: getCanonicalHumanDesignType(b?.humanDesign) || "",
            lifePath: b?.lifePath?.number || 0,
            arcanaCenter: b?.destinyMatrix?.center || 0,
            rawBlueprint: b as Record<string, unknown> | null,
            unifiedBlueprint: buildUnifiedBlueprintSynthesis({
              language: p?.profile?.language || p?.language || "id",
              profile: p,
              blueprint: b,
            }),
            gaiaProfile: p?.gaiaProfile || null,
            activityHistory: activities as any,
            progressMetrics: calculateProgressMetrics({
              journalEntries: journals as any,
              meditationEntries: meditations as any,
              audioHealingEntries: audios as any,
              physicalActivities: activities as any,
            }),
            localDateKey: today
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          profileSnapshot: p,
          blueprintSnapshot: b,
          astrologyToday: localOutput.astroEnergy.currentEnergy,
          previousProgressSummary: "Local fallback",
        };

        setDailyGuidance(withCanonicalDailyConclusion(normalizeUserFacingGuidance(localGuidance, p), uid, p, b, today, timezone));
      } catch (fallbackErr) {
        console.error("[DAILY_GUIDANCE_FALLBACK_ERROR]", fallbackErr);
        setDgError(fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr));
      }
    } finally {
      setDgLoading(false);
    }
  }

  useEffect(() => {
    const watchdog = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 8000);

    const boot = async () => {
      // P1 AUDIT BYPASS (Dev Only)
      if (process.env.NODE_ENV === "development") {
        const auditUser = localStorage.getItem("bhumi_audit_user");
        if (auditUser) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          const p = getMockProfile(auditUser);
          const b = getMockBlueprint(auditUser);
          setProfile(p);
          setBlueprint(b);
          setLoading(false);
          clearTimeout(watchdog);
          void fetchBackgroundData(`${auditUser}_uid`, p, b);
          return;
        }
      }

      if (!auth?.authStateResolved) return;

      if (!auth.user) {
        router.replace("/login?next=/dashboard");
        return;
      }

      try {
        let p = await storageProvider.getUserProfile();
        let b = await storageProvider.getUserBlueprint() as any;

        // If profile is missing or setup is incomplete, redirect to setup
        if (!p || p.setupCompleted !== true) {
          setLoading(false);
          clearTimeout(watchdog);
          return;
        }

        // AUTOMATIC RECOVERY: If profile exists but blueprint is missing (NO_BP / NEVER_CALCULATED)
        if (!b && p.birthDate) {
          console.log("[DASHBOARD BOOT] Blueprint missing for valid profile. Triggering automatic recovery...");
          const { recoverUserBlueprint } = await import("@/lib/engines/blueprintRecoveryEngine");
          b = await recoverUserBlueprint(auth.user.uid, p).catch((err) => {
            console.error("[DASHBOARD RECOVERY FAILED]", err);
            return null;
          });
        }

        if (!b) {
          setLoading(false);
          clearTimeout(watchdog);
          return;
        }

        // Hydrate fast basic systems (Tzolkin, Weton, BaZi, Vedic) if missing
        let updatedBlueprint = { ...b };
        let needsSave = false;
        const birthDate = p.birthDate || p.profile?.blueprintInput?.birthDate || b.input?.birthDate;
        const birthTime = p.birthTime || p.profile?.blueprintInput?.birthTime || b.input?.birthTime || "12:00";
        const timezone = p.timezone || p.profile?.timezone || b.input?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const birthCity = p.birthCity || p.profile?.birthCity || b.input?.birthCity || "";
        const latitude = p.latitude ?? p.profile?.latitude ?? b.input?.latitude ?? null;
        const longitude = p.longitude ?? p.profile?.longitude ?? b.input?.longitude ?? null;

        if (b && (!b.tzolkin || !b.tzolkin.oracle || !b.tzolkin.kinName)) {
          if (birthDate) {
            try {
              const calculated = calculateTzolkin({ birthDate });
              updatedBlueprint.tzolkin = calculated;
              needsSave = true;
            } catch (e) {
              console.warn("[HYDRATION FAILED] Tzolkin", e);
            }
          }
        }

        if (b && (!b.weton || !b.weton.weton)) {
          if (birthDate) {
            try {
              const calculated = calculateWeton({ birthDate, birthTime });
              updatedBlueprint.weton = calculated;
              needsSave = true;
            } catch (e) {
              console.warn("[HYDRATION FAILED] Weton", e);
            }
          }
        }

        if (b && (!b.bazi || !b.bazi.dayMaster)) {
          if (birthDate && birthTime) {
            try {
              const calculated = calculateBazi({ birthDate, birthTime, timezone });
              updatedBlueprint.bazi = calculated;
              needsSave = true;
            } catch (e) {
              console.warn("[HYDRATION FAILED] BaZi", e);
            }
          }
        }

        if (b && (!b.vedic || !b.vedic.moonSign)) {
          if (birthDate && birthTime) {
            try {
              const calculated = calculateVedic({ birthDate, birthTime, birthCity, latitude, longitude, timezone });
              updatedBlueprint.vedic = calculated;
              needsSave = true;
            } catch (e) {
              console.warn("[HYDRATION FAILED] Vedic", e);
            }
          }
        }

        if (needsSave) {
          updatedBlueprint.updatedAt = new Date().toISOString();
          void blueprintRepository.saveUserBlueprint(auth.user.uid, updatedBlueprint);
          void storageProvider.saveUserBlueprint(updatedBlueprint);
        }

        // CRITICAL REFACTOR: Set profile and basic blueprint IMMEDIATELY to unblock Dashboard entry
        setProfile(p);
        setBlueprint(updatedBlueprint);
        setLoading(false);
        clearTimeout(watchdog);

        if (auth.user.email) {
          void repairOwnerHumanDesign(auth.user.uid, auth.user.email);
        }

        trackEvent("open_dashboard", auth.user.uid);
        void participationEngine.recordActivity(auth.user.uid, "launch");

        // NON-BLOCKING: Trigger background HD calculation asynchronously if HD is pending/non-canonical
        const isHdCanonical = isCanonicalHumanDesign(updatedBlueprint.humanDesign);
        if (!isHdCanonical && birthDate) {
          console.log("[BACKGROUND HD] Triggering non-blocking HD calculation for new/partial user...");
          const { triggerBackgroundHdCalculation } = await import("@/lib/engines/blueprintRecoveryEngine");
          void triggerBackgroundHdCalculation(auth.user.uid, p, updatedBlueprint);
        }

        // Fetch background daily guidance and intelligence
        void fetchBackgroundData(auth.user.uid, p, updatedBlueprint);

      } catch (err) {
        console.error("[DASHBOARD BOOT ERROR]", err);
      } finally {
        setLoading(false);
        clearTimeout(watchdog);
      }
    };

    void boot();
    return () => clearTimeout(watchdog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth, router]);



  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-[2.5rem] bg-white p-12 shadow-xl text-center max-w-md w-full border border-black/5">
          <p className="text-[#4F5E52] text-xl font-serif italic">Membuka ruangmu...</p>
          <div className="mt-10 h-1 w-full overflow-hidden rounded-full bg-[#E8E9E5]">
            <div className="h-full w-1/2 animate-progress rounded-full bg-[#4F5E52]" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile || !blueprint) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6 py-12">
        <div className="bhumi-card p-10 text-center max-w-md w-full bg-white border-none shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#4F5E52]/10 flex items-center justify-center mb-6">
            <span className="text-2xl">🌱</span>
          </div>
          <h2 className="text-2xl font-serif text-[#4F5E52] mb-3 font-semibold">Menyelaraskan Ruangmu</h2>
          <p className="text-[#7B8776] mb-8 leading-relaxed text-sm">
            Data profil atau peta jiwamu sedang dalam pemulihan. Silakan muat ulang atau buka pengaturan setup.
          </p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setLoading(true);
                window.location.reload();
              }}
              className="bhumi-button w-full py-4 text-base"
            >
              Coba Muat Ulang Data
            </button>
            <button
              onClick={() => router.replace("/setup")}
              className="py-3 px-4 rounded-full border border-[#4F5E52]/20 text-[#4F5E52] text-sm hover:bg-gray-50 transition-all"
            >
              Ke Halaman Setup
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 pb-32 bg-white max-w-lg mx-auto">
      <AppNav />

      <DashboardReviewPrompt
        profile={profile}
        dashboardReady={Boolean(dailyGuidance) && !dgLoading && !dgError}
        blockedByModal={Boolean(safetyState?.isSafetyMode)}
      />

      {/* ...existing code... */}

      <DashboardHeader userName={profile.fullName} language={language} />

      <PendingHdRecoveryBanner uid={profile.uid} blueprint={blueprint} profile={profile} />

      {safetyState?.isSafetyMode && (
        <SafetyActionCard
          state={safetyState}
          trustedContact={trustedContact}
          language={language}
          onDismiss={async () => {
            if (auth?.user?.uid) {
              const nextState = { ...safetyState, isSafetyMode: false };
              setSafetyState(nextState);
              await safetyRepository.saveSafetyState(auth.user.uid, nextState).catch(() => {});
            }
          }}
        />
      )}

      <GuardianIdentityCard
        role={profile.guardianRole === "founder" || profile.guardianRole === "admin" ? profile.guardianRole : "user"}
        badge={profile.guardianBadge === "core_guardian" ? "core_guardian" : "guardian"}
        tier={profile.recognitionTier === "FOUNDER" || profile.recognitionTier === "CORE_GUARDIAN" ? profile.recognitionTier : "GUARDIAN"}
        recognitionDate={profile.recognitionDate}
        language={language}
      />

      <SoulReflectionCard
        language={language}
        reflection={visibleSoulReflection}
        loading={!visibleSoulReflection}
      />

      <CoreIdentity
        lifePath={blueprint.lifePath?.display || blueprint.lifePath?.number || 0}
        lifePathRole={blueprint.lifePath?.role || ""}
        arcanaCenter={blueprint.destinyMatrix?.center || 0}
        sunSign={blueprint.astrology?.sunSign || ""}
        humanDesign={blueprint.humanDesign}
        labels={{
          title: t.dashboard.coreIdentity,
          lifePath: t.dashboard.lifePath,
          arcanaCenter: t.dashboard.arcanaCenter,
          sunSign: t.dashboard.sunSign,
          humanDesign: language === "en" ? "Human Design Type" : "Human Design Type",
          humanDesignPending: t.dashboard.humanDesignPending,
          humanDesignNeedsTimezone: t.dashboard.humanDesignNeedsTimezone,
        }}
      />

      <AstroTodayCard
        context={{
          profile, blueprint, birthDate: profile.birthDate,
          sunSign: blueprint.astrology?.sunSign,
          lifePathNumber: blueprint.lifePath?.number,
          humanDesignType: getCanonicalHumanDesignType(blueprint.humanDesign),
          arcanaCenter: blueprint.destinyMatrix?.center,
        }}
      />

      <EnvironmentContextCard onOpenDetail={() => router.push("/dashboard/environment")} />

      <WeeklyGuidanceCard guidance={weeklyGuidance} />

      <DailyUserFlowGuide language={language} />

      <AccuracyUpgradeBanner uid={profile.uid} blueprint={blueprint} profile={profile} />

      <footer className="mt-20 mb-10 text-center">
        <p className="text-[10px] text-[#9AA394] font-bold uppercase tracking-[0.3em] opacity-60">
          {language === "id" ? "Sampai jumpa besok untuk refleksi berikutnya." : "See you tomorrow for your next reflection."}
        </p>
      </footer>

    </main>
  );
}
