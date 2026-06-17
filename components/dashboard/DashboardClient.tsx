"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Blueprint } from "@/lib/types/blueprint";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CoreIdentity } from "@/components/dashboard/CoreIdentity";
import { AstroTodayCard } from "@/components/dashboard/AstroTodayCard";
import { DailyNoteV2 } from "@/components/dashboard/DailyNoteV2";
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

export function DashboardClient() {
  const router = useRouter();
  const auth = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dailyState, setDailyState] = useState<any>(null);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [safetyState, setSafetyState] = useState<SafetyState | null>(null);
  const [trustedContact, setTrustedContact] = useState<TrustedContact | undefined>(undefined);
  const [dgLoading, setDgLoading] = useState(false);
  const [trialMessage, setTrialMessage] = useState<string | null>(null);

  const language = (profile?.language || "id") as "id" | "en";
  const t = translations[language];

  async function fetchBackgroundData(uid: string, p: any, b: any) {
    const timezone = p?.timezone || p?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const today = getLocalDateKey(new Date(), timezone);
    const localCacheKey = `dailyGuidance:${uid}:${today}`;
    const invalidCacheKeys = ["dailyGuidance", `dailyGuidance:${today}`, "dailyGuidance:today", "globalDailyGuidance", "sharedReflection", "staticReflection"];

    setDgLoading(true);
    let journals: any[] = [];
    let meditations: any[] = [];
    let audios: any[] = [];
    let activities: any[] = [];

    try {
      const existingDailyState = await dailyStateRepository.getDailyState(uid, today).catch(() => null);
      setDailyState(existingDailyState);
      const completion = getCompletionSummary(existingDailyState);

      // BUILD 37: Consolidate yesterday if needed
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = getLocalDateKey(yesterday, timezone);
      const yesterdayState = await dailyStateRepository.getDailyState(uid, yesterdayKey).catch(() => null);
      if (yesterdayState && !yesterdayState.consolidatedAt) {
        console.log(`[CONSOLIDATION] Triggering end-of-day summary for ${yesterdayKey}`);
        void dailyStateRepository.consolidateDay(uid, yesterdayKey).catch(err => console.error("Consolidation failed", err));
      }

      if (completion.isUnlocked) {
        trackEvent("daily_completion_reached", uid);
      }

      invalidCacheKeys.forEach((key) => window.localStorage.removeItem(key));

      const [recent, j, m, a, act, mapping, safetyCfg] = await Promise.all([
        dailyGuidanceRepository.getRecentGuidance(uid, 5).catch(() => []),
        journalRepository.getJournalEntries(uid, 5).catch(() => []),
        meditationRepository.getMeditationEntries(uid, 5).catch(() => []),
        audioHealingRepository.getAudioHealingEntries(uid, 5).catch(() => []),
        activityRepository.getRecentActivities(uid, 5).catch(() => []),
        wellnessMappingRepository.getMapping(uid).catch(() => null),
        safetyRepository.getSafetyConfig(uid).catch(() => null)
      ]);

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
      const memoryContext = {
        ...p,
        previousJournalEntries: journals,
        previousMeditationEntries: meditations,
        previousAudioHealingEntries: audios,
        previousActivityEntries: activities,
      };

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
          const normalized = normalizeUserFacingGuidance(parsed);
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
        const normalized = normalizeUserFacingGuidance(existing);
        setDailyGuidance(normalized);
        window.localStorage.setItem(localCacheKey, JSON.stringify(normalized));
        await dailyGuidanceRepository.saveDailyGuidance(normalized).catch(() => {});
        setDgLoading(false);
        return;
      }

      const { calculateCurrentSky } = await import("@/lib/astrology/calculateCurrentSky");
      const sky = calculateCurrentSky(new Date(`${today}T12:00:00`));
      const payload = {
        uid, date: today, localDateKey: today, language, profile: p, blueprint: b,
        currentSky: sky as any,
        natalHouses: b.astrology?.houses || null,
        previousJournalEntries: journals, previousMeditationEntries: meditations,
        previousAudioHealingEntries: audios, activityHistory: activities,
        momentumState: null, healingMemory: null,
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
      const dg = normalizeUserFacingGuidance(result.guidance);
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
          healingMemory: null,
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

        setDailyGuidance(normalizeUserFacingGuidance(localGuidance));
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
        const b = await storageProvider.getUserBlueprint();

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

        setProfile(p);
        setBlueprint(b);

        if (auth.user.email) {
          void repairOwnerHumanDesign(auth.user.uid, auth.user.email);
        }

        trackEvent("open_dashboard", auth.user.uid);
        void participationEngine.recordActivity(auth.user.uid, "launch");

        // App Resume Listener (Build 37A Requirement)
        if (typeof window !== "undefined") {
          import("@capacitor/app").then(({ App }) => {
            App.addListener("appStateChange", ({ isActive }) => {
              if (isActive && auth.user?.uid) {
                console.log("[APP RESUME] Updating presence...");
                void participationEngine.recordActivity(auth.user.uid, "launch");
              }
            });
          }).catch(err => console.warn("Capacitor App plugin not available", err));
        }

        const daysLeft = getTrialDaysLeft(p as any);
        if (isTrialExpired(p as any)) setTrialMessage("Akses Bhumi kamu perlu diperbarui.");
        else if (daysLeft < 3) setTrialMessage(null);

        setLoading(false);
        clearTimeout(watchdog);

        void fetchBackgroundData(auth.user.uid, p, b);

      } catch (err) {
        console.error("[DASHBOARD BOOT ERROR]", err);
        setLoading(false);
      }
    };

    void boot();
    return () => clearTimeout(watchdog);
  }, [auth, router]);

;

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

      <AccuracyUpgradeBanner uid={profile.uid} blueprint={blueprint} profile={profile} />

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
        <div className="mt-6 p-4 bg-yellow-50/50 text-yellow-800 text-[12px] text-center rounded-2xl font-bold uppercase tracking-widest border border-yellow-100/50">
          {trialMessage}
        </div>
      )}

      <GuardianIdentityCard
        role={profile.guardianRole === "founder" || profile.guardianRole === "admin" ? profile.guardianRole : "user"}
        badge={profile.guardianBadge === "core_guardian" ? "core_guardian" : "guardian"}
        tier={profile.recognitionTier === "FOUNDER" || profile.recognitionTier === "CORE_GUARDIAN" ? profile.recognitionTier : "GUARDIAN"}
        recognitionDate={profile.recognitionDate}
        language={language}
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
          humanDesign: t.dashboard.humanDesign,
          humanDesignPending: t.dashboard.humanDesignPending,
          humanDesignNeedsTimezone: t.dashboard.humanDesignNeedsTimezone,
        }}
      />

      <SoulReflectionCard
        language={language}
        reflection={dailyGuidance?.soulReflectionText}
        loading={dgLoading}
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

      <DailyNoteV2
        dailyGuidance={dailyGuidance}
        language={language}
      />

      <DailyUserFlowGuide language={language} />

      <footer className="mt-20 mb-10 text-center">
        <p className="text-[10px] text-[#9AA394] font-bold uppercase tracking-[0.3em] opacity-60">
          {language === "id" ? "Sampai jumpa besok untuk refleksi berikutnya." : "See you tomorrow for your next reflection."}
        </p>
      </footer>

    </main>
  );
}
