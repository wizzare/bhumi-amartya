"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CoreIdentity } from "@/components/dashboard/CoreIdentity";
import { AstroTodayCard } from "@/components/dashboard/AstroTodayCard";
import { DailyNoteV2 } from "@/components/dashboard/DailyNoteV2";
import { EnvironmentContextCard } from "@/components/dashboard/EnvironmentContextCard";
import { DailyUserFlowGuide } from "@/components/dashboard/DailyUserFlowGuide";
import { SoulReflectionCard } from "@/components/dashboard/SoulReflectionCard";
import { AccuracyUpgradeBanner } from "@/components/dashboard/AccuracyUpgradeBanner";
import { GuardianIdentityCard } from "@/components/dashboard/GuardianIdentityCard";
import { SafetyActionCard } from "@/components/safety/SafetyActionCard";
import { evaluateSafetyTriggers, SafetyState } from "@/lib/engines/safetySentinelEngine";
import { safetyRepository, TrustedContact } from "@/lib/repositories/safetyRepository";
import { wellnessMappingRepository } from "@/lib/repositories/wellnessMappingRepository";
import { AppNav } from "@/components/navigation/AppNav";
import { translations } from "@/lib/data/translations";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { APP_TIME_REFRESH_MS, applyDynamicGreetingPrefix, getEnvironmentWindowKey, getTimeOfDayGreeting } from "@/lib/dailyGuidance/timeOfDayGreeting";
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
import { wellnessNavigatorRepository } from "@/lib/repositories/wellnessNavigatorRepository";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { journalRepository } from "@/lib/repositories/journalRepository";
import { meditationRepository } from "@/lib/repositories/meditationRepository";
import { audioHealingRepository } from "@/lib/repositories/audioHealingRepository";
import { activityRepository } from "@/lib/repositories/activityRepository";
import { getCompletionSummary } from "@/lib/engines/completionEngine";
import { getTrialDaysLeft, isTrialExpired } from "@/lib/billing/accessControl";
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
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";

function compactTzolkinSignature(tzolkin: any): string | undefined {
  const kin = tzolkin?.kin;
  const kinNumber = typeof kin === "number" && kin > 0 ? kin : undefined;
  const sealName = tzolkin?.solarSeal?.name || "";
  const aliasMatch = /\(([^)]+)\)/.exec(String(tzolkin?.kinName || ""));
  const compactSeal = aliasMatch?.[1] || sealName.split(" ").pop() || String(tzolkin?.kinName || "").split(/\s+/)[0] || "";
  if (!compactSeal && !kinNumber) return undefined;
  return [compactSeal, kinNumber].filter(Boolean).join(" ");
}

function formatBaziDayMaster(bazi: any): string | undefined {
  const dayMaster = bazi?.dayMaster;
  if (!dayMaster?.polarity || !dayMaster?.element) return undefined;
  return `${dayMaster.polarity} ${dayMaster.element}`;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function limitWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ").replace(/[,.!?;:]+$/, "")}.`;
}

function shortenReflectionBody(text: string): string {
  const clean = text
    .replace(/[*_`#>]/g, "")
    .replace(/[“”"]/g, "")
    .replace(/\bRenungkan perlahan\.?/gi, "")
    .replace(/\bReflect slowly\.?/gi, "")
    .replace(/Peluk hangat dari Bhumi\.?/gi, "")
    .replace(/^\s*(Halo|Hai)\s+[^,\n]+,\s*/i, "")
    .replace(/^\s*Selamat\s+(pagi|siang|sore|malam)\.?\s*/i, "")
    .replace(/^\s*Good\s+(morning|afternoon|evening|night)\.?\s*/i, "")
    .replace(/^Bagaimana\s+hari\s+[^?!.]+[?!.]\s*/i, "")
    .replace(/Kelola energimu dengan bijak, luangkan waktu untuk melihat sekeliling dengan jernih\./gi, "Kamu sedang diajak mengelola energimu dengan bijak dan melihat sekeliling dengan lebih jernih.")
    .replace(/Sekarang ada ruang untuk membawa kenyamanan dalam mengekspresikan pertumbuhan melalui tindakan nyata\./gi, "Kenyamananmu bisa hadir lewat tindakan nyata yang sederhana.")
    .replace(/Coba\s+[^.?!]+[.?!]\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|[.!?]\s+)([a-z])/g, (_match, prefix: string, letter: string) => `${prefix}${letter.toUpperCase()}`);
  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  if (!sentences.length) return "";

  let body = "";
  for (const sentence of sentences) {
    const next = `${body} ${sentence}`.trim();
    if (wordCount(next) > 84 && body) break;
    body = next;
    if (wordCount(body) >= 58) break;
  }

  return limitWords(body || clean, 84);
}

function formatSoulReflectionForDashboard(
  reflection: string,
  userName: string,
  language: "id" | "en",
  date: Date,
): string {
  const body = shortenReflectionBody(reflection);
  if (!body) return "";
  const firstName = userName?.trim().split(/\s+/)[0] || "Jiwa";
  const greeting = getTimeOfDayGreeting(date, language);
  if (language === "en") {
    return `Hello ${firstName},\n${greeting}. ${body} Warmly from Bhumi.`;
  }
  return `Halo ${firstName},\n${greeting}. ${body} Peluk hangat dari Bhumi.`;
}

export function DashboardClient() {
  const router = useRouter();
  const auth = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [dailyState, setDailyState] = useState<DailyState | null>(null);
  const [yesterdayState, setYesterdayState] = useState<DailyState | null>(null);
  const [recentDailyStates, setRecentDailyStates] = useState<DailyState[]>([]);
  const [navigatorState, setNavigatorState] = useState<NavigatorState | null>(null);
  const [dailyNoteFocus, setDailyNoteFocus] = useState<string>("");
  const [safetyState, setSafetyState] = useState<SafetyState | null>(null);
  const [trustedContact, setTrustedContact] = useState<TrustedContact | undefined>(undefined);
  const [dgLoading, setDgLoading] = useState(false);
  const [trialMessage, setTrialMessage] = useState<string | null>(null);
  const [appNow, setAppNow] = useState(() => new Date());

  const language = (profile?.language || "id") as "id" | "en";
  const t = translations[language];
  const visibleSoulReflection = formatSoulReflectionForDashboard(
    applyDynamicGreetingPrefix(dailyGuidance?.soulReflectionText?.trim() || "", language, appNow),
    profile?.fullName || "",
    language,
    appNow,
  );

  useEffect(() => {
    const interval = window.setInterval(() => setAppNow(new Date()), APP_TIME_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);

  const appTimezone = profile?.timezone || profile?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const appDateKey = getLocalDateKey(appNow, appTimezone);
  const appEnvironmentWindowKey = getEnvironmentWindowKey(appNow, appDateKey);

  useEffect(() => {
    const uid = auth?.user?.uid;
    if (!uid || !profile || !blueprint || loading) return;
    void fetchBackgroundData(uid, profile, blueprint);
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
          const normalized = normalizeUserFacingGuidance(parsed, p);
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
        const normalized = normalizeUserFacingGuidance(existing, p);
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
      const dg = normalizeUserFacingGuidance(result.guidance, p);
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

        setDailyGuidance(normalizeUserFacingGuidance(localGuidance, p));
      } catch (fallbackErr) {
        console.error("[DAILY_GUIDANCE_FALLBACK_ERROR]", fallbackErr);
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
        const p = await storageProvider.getUserProfile();
        const b = await storageProvider.getUserBlueprint() as any;

        // Human Design stability audit log (Build 31 requirement)
        if (b?.humanDesign) {
          console.log("[HD AUDIT]", {
            uid: auth.user.uid,
            type: b.humanDesign.type,
            status: b.humanDesign.status,
            source: b.humanDesign.source,
          });
        }

        if (!p || p.setupCompleted !== true || !b) {
          setLoading(false);
          return;
        }

        let updatedBlueprint = { ...b };
        let needsSave = false;
        const birthDate = p.birthDate || p.profile?.blueprintInput?.birthDate || b.input?.birthDate;
        const birthTime = p.birthTime || p.profile?.blueprintInput?.birthTime || b.input?.birthTime || "12:00";
        const timezone = p.timezone || p.profile?.timezone || b.input?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const birthCity = p.birthCity || p.profile?.birthCity || b.input?.birthCity || "";
        const latitude = p.latitude ?? p.profile?.latitude ?? b.input?.latitude ?? null;
        const longitude = p.longitude ?? p.profile?.longitude ?? b.input?.longitude ?? null;

        // 1. Tzolkin Hydration
        if (b && (!b.tzolkin || !b.tzolkin.oracle || !b.tzolkin.kinName)) {
          if (birthDate) {
            try {
              const calculated = calculateTzolkin({ birthDate });
              updatedBlueprint.tzolkin = calculated;
              needsSave = true;
              console.log("[HYDRATION] Tzolkin computed.");
            } catch (e) {
              console.warn("[HYDRATION FAILED] Tzolkin", e);
            }
          }
        }

        // 2. Weton Hydration
        if (b && (!b.weton || !b.weton.weton)) {
          if (birthDate) {
            try {
              const calculated = calculateWeton({ birthDate, birthTime });
              updatedBlueprint.weton = calculated;
              needsSave = true;
              console.log("[HYDRATION] Weton computed.");
            } catch (e) {
              console.warn("[HYDRATION FAILED] Weton", e);
            }
          }
        }

        // 3. BaZi Hydration
        if (b && (!b.bazi || !b.bazi.dayMaster)) {
          if (birthDate && birthTime) {
            try {
              const calculated = calculateBazi({
                birthDate,
                birthTime,
                timezone,
              });
              updatedBlueprint.bazi = calculated;
              needsSave = true;
              console.log("[HYDRATION] BaZi computed.");
            } catch (e) {
              console.warn("[HYDRATION FAILED] BaZi", e);
            }
          }
        }

        // 4. Vedic Hydration
        if (b && (!b.vedic || !b.vedic.moonSign)) {
          if (birthDate && birthTime) {
            try {
              const calculated = calculateVedic({
                birthDate,
                birthTime,
                birthCity,
                latitude,
                longitude,
                timezone,
              });
              updatedBlueprint.vedic = calculated;
              needsSave = true;
              console.log("[HYDRATION] Vedic computed.");
            } catch (e) {
              console.warn("[HYDRATION FAILED] Vedic", e);
            }
          }
        }

        // 5. Human Design Stability Audit & Repair
        const isHdCanonical = isCanonicalHumanDesign(b?.humanDesign);
        if (!isHdCanonical && birthDate) {
          try {
            console.log("[HYDRATION] Human Design not canonical, attempting repair...");
            const calculated = await calculateHumanDesign({
              birthDate,
              birthTime,
              birthCity,
              latitude,
              longitude,
              timezone,
            });
            updatedBlueprint.humanDesign = calculated;
            needsSave = true;
            console.log("[HYDRATION] Human Design repaired.");
          } catch (e) {
            console.warn("[HYDRATION FAILED] Human Design", e);
          }
        }

        if (needsSave) {
          updatedBlueprint.updatedAt = new Date().toISOString();
          await blueprintRepository.saveUserBlueprint(auth.user.uid, updatedBlueprint);
          await storageProvider.saveUserBlueprint(updatedBlueprint);
          console.log("[HYDRATION SUCCESS] Blueprint updated and saved.");
        }

        setProfile(p);
        setBlueprint(updatedBlueprint);

        if (auth.user.email) {
          void repairOwnerHumanDesign(auth.user.uid, auth.user.email);
        }

        trackEvent("open_dashboard", auth.user.uid);
        void participationEngine.recordActivity(auth.user.uid, "launch");

        // ... rest of the code
        const daysLeft = getTrialDaysLeft(p as any);
        if (isTrialExpired(p as any)) setTrialMessage("Akses Bhumi kamu perlu diperbarui.");
        else if (daysLeft < 3) setTrialMessage(null);

        setLoading(false);
        clearTimeout(watchdog);

        void fetchBackgroundData(auth.user.uid, p, updatedBlueprint);

      } catch (err) {
        console.error("[DASHBOARD BOOT ERROR]", err);
        setLoading(false);
      }
    };

    void boot();
    return () => clearTimeout(watchdog);
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
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="bhumi-card p-12 text-center max-w-md w-full bg-white border-none shadow-xl">
          <h2 className="text-3xl font-serif text-[#4F5E52] mb-4 italic">Setup Belum Lengkap</h2>
          <p className="text-[#7B8776] mb-10 leading-relaxed font-medium">Lengkapi data profilmu untuk mulai mengenali diri.</p>
          <button onClick={() => router.replace("/setup")} className="bhumi-button w-full py-5 text-lg">Buka Setup</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10 pb-32 bg-white max-w-lg mx-auto">
      <AppNav />

      <DashboardHeader userName={profile.fullName} language={language} />

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

      {trialMessage && (
        <button
          onClick={() => router.push("/premium-bhumi")}
          className="w-full mt-6 p-4 bg-yellow-50/50 text-yellow-800 text-[12px] text-center rounded-2xl font-bold uppercase tracking-widest border border-yellow-100/50 active:scale-[0.98] transition-transform"
        >
          {trialMessage}
        </button>
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
        weton={blueprint.weton?.weton}
        baziDayMaster={formatBaziDayMaster(blueprint.bazi)}
        vedicMoonSign={blueprint.vedic?.moonSign?.sign ? `${blueprint.vedic.moonSign.sign} Moon` : undefined}
        tzolkinSignature={(() => {
          const stored = compactTzolkinSignature(blueprint.tzolkin);
          if (stored) return stored;
          const birthDate = profile?.birthDate || profile?.profile?.blueprintInput?.birthDate || blueprint?.input?.birthDate;
          if (birthDate) {
            try {
              return compactTzolkinSignature(calculateTzolkin({ birthDate }));
            } catch (e) {
              console.warn("Failed to calculate fallback Tzolkin signature:", e);
            }
          } else {
            return language === "en" ? "Complete profile" : "Lengkapi profil";
          }
          return "-";
        })()}
        labels={{
          title: t.dashboard.coreIdentity,
          lifePath: t.dashboard.lifePath,
          arcanaCenter: t.dashboard.arcanaCenter,
          sunSign: t.dashboard.sunSign,
          humanDesign: t.dashboard.humanDesign,
          humanDesignPending: t.dashboard.humanDesignPending,
          humanDesignNeedsTimezone: t.dashboard.humanDesignNeedsTimezone,
          weton: t.dashboard.weton,
          baziDayMaster: t.dashboard.baziDayMaster,
          vedicMoonSign: t.dashboard.vedicMoonSign,
          tzolkinSignature: t.dashboard.tzolkinSignature,
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

      <DailyNoteV2
        dailyGuidance={dailyGuidance}
        focus={dailyNoteFocus}
        language={language}
        userName={profile.fullName}
        dailyState={dailyState}
        yesterdayState={yesterdayState}
        recentDailyStates={recentDailyStates}
        navigatorState={navigatorState}
        appNow={appNow}
      />

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
