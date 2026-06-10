"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { profileToCoreIdentity } from "@/lib/mappers/userProfileMapper";
import { emotionalMemoryRepository } from "@/lib/repositories/emotionalMemoryRepository";
import { journalRepository } from "@/lib/repositories/journalRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { healingRepository } from "@/lib/repositories/healingRepository";
import type {
  JournalEntry,
  JournalPrompt,
  EmotionalCheckIn,
  EmotionalAnalysis,
  HealingRecommendation,
  EmotionalMemory,
  CoreIdentity,
} from "@/lib/data/types";
import { generateDailyJournalPrompt } from "@/lib/engines/generateJournalPrompt";
import { analyzeJournalEmotion } from "@/lib/engines/analyzeJournalEmotion";
import { getSuggestedHealingPractices } from "@/lib/engines/generateHealingRecommendation";
import { updateEmotionalMemory } from "@/lib/engines/updateEmotionalMemory";
import { APP_MODE } from "@/lib/config/appMode";
import {
  generateLocalJournalInsight,
  getTodayJournalPrompt,
  loadLocalJournalEntries,
  saveLocalJournalEntry,
  type BlueprintJournalContext,
  type JournalInsight as LocalJournalInsight,
  type JournalPrompt as LocalJournalPrompt,
} from "@/lib/journal/localJournal";

import { JournalHero } from "@/components/journal/JournalHero";
import { PremiumLock } from "@/components/auth/PremiumLock";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DailyPromptCard } from "@/components/journal/DailyPromptCard";
import { EmotionalCheckin } from "@/components/journal/EmotionalCheckin";
import { JournalInput } from "@/components/journal/JournalInput";
import { JournalInsight } from "@/components/journal/JournalInsight";
import { HealingRecommendationComponent } from "@/components/journal/HealingRecommendation";
import { EmotionalTimeline } from "@/components/journal/EmotionalTimeline";
import { AppNav } from "@/components/navigation/AppNav";
import { FeatureLocked } from "@/components/billing/FeatureLocked";
import { hasFeatureAccess } from "@/lib/billing/accessControl";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { storageProvider } from "@/lib/storage/storageProvider";
import { trackError, trackEvent } from "@/lib/analytics/usageAnalytics";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";

const EMOTIONAL_STATES = [
  "😊 Lebih ringan",
  "😌 Lebih tenang",
  "😢 Sedih",
  "😔 Bingung",
  "😠 Marah",
  "💭 Campur aduk",
];

const BODY_SIGNALS = [
  "Bahu tegang",
  "Dada terasa berat",
  "Tenggorokan terasa mengganjal",
  "Perut tidak nyaman",
  "Mata berkaca-kaca",
  "Tubuh lebih rileks",
  "Tidak ada sensasi khusus",
];

function getStringValue(record: Record<string, unknown> | null, key: string): string | null {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function getNestedString(record: Record<string, unknown> | null, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, record);
  return typeof value === "string" ? value : null;
}

function getNestedNumber(record: Record<string, unknown> | null, path: string[]): number | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, record);
  return typeof value === "number" ? value : null;
}

export default function JournalPage() {
  const router = useRouter();
  const auth = useAuth();
  const userProfile = auth?.userProfile;

  // State
  const [coreIdentity, setCoreIdentity] = useState<CoreIdentity | null>(null);
  const [dailyPrompt, setDailyPrompt] = useState<JournalPrompt | null>(null);
  const [checkIn, setCheckIn] = useState<EmotionalCheckIn | null>(null);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [healingRecommendations, setHealingRecommendations] = useState<HealingRecommendation[]>([]);
  const [emotionalMemory, setEmotionalMemory] = useState<EmotionalMemory | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingJournal, setIsSubmittingJournal] = useState(false);
  const [stage, setStage] = useState<"setup" | "checkin" | "writing" | "insight">("setup");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [localPrompt, setLocalPrompt] = useState<LocalJournalPrompt | null>(null);
  const [localContext, setLocalContext] = useState<BlueprintJournalContext>({});
  const [localJournalText, setLocalJournalText] = useState("");
  const [localEmotionalState, setLocalEmotionalState] = useState("");
  const [localBodySignals, setLocalBodySignals] = useState<string[]>([]);
  const [localInsight, setLocalInsight] = useState<LocalJournalInsight | null>(null);
  const [localSaved, setLocalSaved] = useState(false);
  const [isWellnessLocked, setIsWellnessLocked] = useState(false);

  useEffect(() => {
    trackEvent("journal_open");
  }, []);

  // Initialize
  useEffect(() => {
    const initializeLocalMode = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const resolved = await resolveActiveProfile(auth);
        if (resolved.isLoading) {
          return;
        }
        if (resolved.isMissing) {
          router.replace("/setup");
          return;
        }

        const profile = resolved.profile as Record<string, unknown> | null;
        setIsWellnessLocked(!hasFeatureAccess(profile as any, "journal"));

        const blueprint = await storageProvider.getUserBlueprint();
        if (!blueprint) {
          router.replace("/setup");
          return;
        }
        if (!profile || !blueprint) {
          setLoadError("Data lokal belum siap. Silakan ulangi setup.");
          return;
        }
         const entries = loadLocalJournalEntries();
         const context: BlueprintJournalContext = {
           birthDate: getStringValue(profile, "birthDate"),
           sunSign: getNestedString(blueprint as any, ["sunSign", "sign"]),
           lifePathNumber: getNestedNumber(blueprint as any, ["lifePath", "number"]),
           humanDesignType: getNestedString(blueprint as any, ["humanDesign", "type"]),
           arcanaCenter: getNestedNumber(blueprint as any, ["arcanaCenter", "number"]),
           natalChart: (blueprint as any).astrology?.natalChart || (blueprint as any).natalChart,
           destinyMatrix: (blueprint as any).destinyMatrix,
         };

         setLocalContext(context);
         setLocalPrompt(getTodayJournalPrompt(context, entries));
       } catch (error) {
         console.error("[Journal Page] Failed to load local journal data", error);
         setLoadError("Data lokal belum siap. Silakan ulangi setup.");
       } finally {
         setIsLoading(false);
       }
    };

    if (APP_MODE === "local-first" || APP_MODE === "dual") {
      void initializeLocalMode();
      return;
    }

    if (!auth || auth.authLoading || auth.profileLoading) return;
    const { user, userProfile } = auth;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!userProfile?.setupCompleted) {
      router.replace("/setup");
      return;
    }

    const initialize = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const blueprint = await blueprintRepository.getUserBlueprint(userProfile.uid);
        if (!blueprint || blueprint.status !== "ready") {
          router.replace("/setup");
          return;
        }
        const identity: CoreIdentity = profileToCoreIdentity(userProfile as any, blueprint);
        setCoreIdentity(identity);

        const prompt = generateDailyJournalPrompt(identity, 5);
        setDailyPrompt(prompt);

        const memory = await emotionalMemoryRepository.getOrCreate(userProfile.uid);
        setEmotionalMemory(memory);
      } catch (error) {
        console.error("[Journal Page] Failed to load", error);
        setLoadError("Data pengguna belum siap. Silakan coba lagi.");
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [auth, router]);

  const handleLocalBodySignalToggle = (signal: string) => {
    setLocalBodySignals((current) => {
      if (signal === "Tidak ada sensasi khusus") {
        return current.includes(signal) ? [] : [signal];
      }

      const withoutNone = current.filter((item) => item !== "Tidak ada sensasi khusus");
      if (withoutNone.includes(signal)) {
        return withoutNone.filter((item) => item !== signal);
      }

      return [...withoutNone, signal];
    });
  };

  const handleLocalSave = () => {
    if (!localPrompt) return;

    const generatedInsight = generateLocalJournalInsight({
      theme: localPrompt.theme,
      journalText: localJournalText,
      emotionalState: localEmotionalState,
      bodySignals: localBodySignals,
      context: localContext,
    });
    const createdAt = new Date().toISOString();

    try {
      saveLocalJournalEntry({
        date: createdAt.slice(0, 10),
        theme: localPrompt.theme,
        questions: localPrompt.questions,
        journalText: localJournalText,
        emotionalState: localEmotionalState,
        bodySignals: localBodySignals,
        createdAt,
        insight: generatedInsight.insight,
        tomorrowFocus: generatedInsight.tomorrowFocus,
        sourceContext: {
          lifePathNumber: localContext.lifePathNumber,
          humanDesignType: localContext.humanDesignType,
          arcanaCenter: localContext.arcanaCenter,
          sunSign: localContext.sunSign,
          previousEntryCount: loadLocalJournalEntries().length,
        },
      });
      trackEvent("journal_saved");
    } catch (error) {
      console.error("[Journal Page] Failed to save local journal", error);
      trackError("failed_journal_save", undefined, "local");
      return;
    }

    setLocalInsight(generatedInsight);
    setLocalSaved(true);
  };

  // Handle emotional checkin complete
  const handleCheckInComplete = (newCheckIn: EmotionalCheckIn) => {
    setCheckIn(newCheckIn);
    setStage("writing");
  };

  // Handle journal submission
  const handleJournalSubmit = async (content: string, durationMinutes: number) => {
    if (!userProfile || !dailyPrompt || !coreIdentity || !emotionalMemory || !checkIn) return;
    setIsSubmittingJournal(true);

    try {
      const uid = userProfile.uid;
      // Create journal entry
      const entry: JournalEntry = {
        id: `journal-${Date.now()}`,
        userId: uid,
        dateCreated: new Date().toISOString(),
        dateCompleted: new Date().toISOString(),
        prompt: dailyPrompt,
        emotionalCheckIn: checkIn,
        content,
        wordCount: content.trim().split(/\s+/).length,
        durationMinutes,
        tags: [],
      };

      // Analyze emotion
      const analysis = analyzeJournalEmotion(entry);
      entry.emotionalAnalysis = analysis;

      // Get healing recommendations
      const recommendations = getSuggestedHealingPractices(analysis, coreIdentity);

      // Update emotional memory
      const updatedMemory = updateEmotionalMemory(emotionalMemory, entry, analysis);

      await journalRepository.saveEntry(uid, entry);
      await emotionalMemoryRepository.save(uid, updatedMemory);
      await userRepository.updateEmotionalState(uid, {
        currentMood: checkIn.moodLevel,
        lastCheckInAt: entry.dateCompleted,
        recurringThemes: analysis.recurringThemes,
      });
      await dailyStateRepository.saveDailyState(uid, entry.dateCreated.slice(0, 10), {
        moodLevel: checkIn.moodLevel,
        emotionalWord: checkIn.emotionalWord,
        nervousSystemState: checkIn.nervousSystemState,
        journalingDone: true,
      });
      await userRepository.recordJournalProgress(uid);
      await healingRepository.saveHealingProgress(uid, {
        totalJournalEntries: (userProfile.healingProgress?.totalJournalEntries || 0) + 1,
      });

      // Set state
      setEmotionalAnalysis(analysis);
      setHealingRecommendations(recommendations);
      setEmotionalMemory(updatedMemory);
      setWordCount(entry.wordCount);
      setStage("insight");
      trackEvent("complete_journaling", uid);
      trackEvent("journal_saved", uid);
    } catch (error) {
      console.error("Error submitting journal:", error);
      trackError("failed_journal_save", userProfile.uid, "firebase");
    } finally {
      setIsSubmittingJournal(false);
    }
  };

  if (isLoading || (APP_MODE !== "local-first" && auth?.loading)) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Persiapan ruang yang aman untuk dirimu...</p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#E8E9E5]">
            <div className="h-full w-3/4 animate-pulse rounded-full bg-[#4F5E52]" />
          </div>
        </div>
      </main>
    );
  }

  if (APP_MODE === "local-first" || APP_MODE === "dual") {
    if (isWellnessLocked) {
      return <FeatureLocked />;
    }

    if (loadError || !localPrompt) {
      return (
        <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
          <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
            <p className="text-[#4F5E52] text-lg">{loadError || "Prompt journaling belum siap."}</p>
          </div>
        </main>
      );
    }

    const today = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return (
      <main className="min-h-screen px-5 py-8 pb-24 bg-[#FCFAF5]">
        <AppNav />
        <div className="max-w-3xl mx-auto space-y-6">
          <header className="bhumi-card p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
            <p className="text-sm text-[#7B8776]">{today}</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#4F5E52]">
              📖 Journaling Hari Ini
            </h1>
            <p className="mt-4 text-[#7B8776] leading-relaxed">
              Menulis membantu menyadari pola yang sering tidak terlihat saat hanya dipikirkan. Luangkan beberapa menit untuk mendengar isi hatimu hari ini.
            </p>
          </header>

          <section className="bhumi-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Theme</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#4F5E52]">{localPrompt.theme}</h2>
            <p className="mt-4 text-sm font-semibold text-[#7B8776]">Reflection Question</p>
            <p className="mt-2 text-lg leading-relaxed text-[#4F5E52]">
              {localPrompt.dashboardQuestion}
            </p>
          </section>

          <section className="bhumi-card p-6">
            <h2 className="text-xl font-semibold text-[#4F5E52]">Section A · Reflection Question</h2>
            <ol className="mt-5 space-y-4">
              {localPrompt.questions.map((question, index) => (
                <li key={question} className="rounded-2xl bg-white/70 p-4 text-[#4F5E52]">
                  <span className="mr-3 text-sm font-semibold text-[#9BB89A]">{index + 1}.</span>
                  {question}
                </li>
              ))}
            </ol>
          </section>

          <section className="bhumi-card p-6">
            <h2 className="text-xl font-semibold text-[#4F5E52]">Section B · Journal Writing</h2>
            <label className="mt-5 block text-sm font-medium text-[#7B8776]" htmlFor="journalText">
              Tulis refleksimu di sini...
            </label>
            <textarea
              id="journalText"
              value={localJournalText}
              onChange={(event) => setLocalJournalText(event.target.value)}
              onInput={(event) => {
                event.currentTarget.style.height = "auto";
                event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
              }}
              className="mt-3 min-h-56 w-full resize-none rounded-3xl border border-[#E8E9E5] bg-white p-5 text-[#4F5E52] outline-none transition focus:border-[#9BB89A] focus:ring-2 focus:ring-[#9BB89A]/20"
              placeholder="Mulai dari satu kalimat yang paling jujur..."
            />
          </section>

          <section className="bhumi-card p-6">
            <h2 className="text-xl font-semibold text-[#4F5E52]">Section C · Body Awareness</h2>
            <p className="mt-5 text-sm font-medium text-[#7B8776]">
              Bagaimana perasaanmu setelah menulis?
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {EMOTIONAL_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => setLocalEmotionalState(state)}
                  className={`rounded-2xl border p-4 text-left text-sm transition ${
                    localEmotionalState === state
                      ? "border-[#4F5E52] bg-[#F5F1E8] text-[#4F5E52]"
                      : "border-[#E8E9E5] bg-white text-[#7B8776]"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>

            <p className="mt-6 text-sm font-medium text-[#7B8776]">
              Apakah ada sensasi pada tubuhmu?
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {BODY_SIGNALS.map((signal) => (
                <label
                  key={signal}
                  className="flex items-center gap-3 rounded-2xl border border-[#E8E9E5] bg-white p-4 text-sm text-[#4F5E52]"
                >
                  <input
                    type="checkbox"
                    checked={localBodySignals.includes(signal)}
                    onChange={() => handleLocalBodySignalToggle(signal)}
                    className="h-4 w-4 rounded border-[#9BB89A] text-[#4F5E52]"
                  />
                  {signal}
                </label>
              ))}
            </div>
          </section>

          <section className="bhumi-card p-6">
            <h2 className="text-xl font-semibold text-[#4F5E52]">Section D · Save</h2>
            <button
              type="button"
              onClick={handleLocalSave}
              disabled={localSaved}
              className="mt-5 w-full rounded-full bg-[#4F5E52] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#3D4A3F] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {localSaved ? "Refleksi tersimpan..." : "Simpan Refleksi"}
            </button>

            {localInsight && (
              <div className="mt-6 space-y-4 rounded-3xl bg-[#FCFAF5] p-5">
                <div>
                  <p className="text-sm font-semibold text-[#4F5E52]">🌱 Insight Hari Ini</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{localInsight.insight}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#4F5E52]">✨ Fokus Besok</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{localInsight.tomorrowFocus}</p>
                </div>
                <p className="text-xs text-[#9BB89A]">Mengembalikanmu ke dashboard...</p>
              </div>
            )}
          </section>
        </div>
        <InnerworkCelebration isOpen={localSaved} />
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">{loadError}</p>
        </div>
      </main>
    );
  }

  if (!userProfile || !dailyPrompt || !coreIdentity) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Data pengguna belum siap. Silakan coba lagi.</p>
        </div>
      </main>
    );
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <ProtectedRoute requireProfile>
      <PremiumLock feature="journaling">
        <main className="min-h-screen px-5 py-8 pb-24 bg-[#FCFAF5]">
          <AppNav />
          <div className="max-w-3xl mx-auto">
            <JournalHero
              userName={userProfile.fullName || userProfile.displayName || "Jiwa"}
              date={today}
            />

            {/* STAGES */}
            {(stage === "setup" || stage === "checkin") && (
              <div className="space-y-8">
                <DailyPromptCard prompt={dailyPrompt} />
                <EmotionalCheckin onCheckInComplete={handleCheckInComplete} />
              </div>
            )}

            {/* Stage 2: Journal Writing */}
            {stage === "writing" && (
              <div className="space-y-8">
                <DailyPromptCard prompt={dailyPrompt} />
                <JournalInput
                  onSubmit={handleJournalSubmit}
                  isLoading={isSubmittingJournal}
                />
              </div>
            )}

            {/* Stage 3: Insight & Recommendations */}
            {stage === "insight" && emotionalAnalysis && (
              <div className="space-y-8">
                {/* Insight from analysis */}
                <JournalInsight analysis={emotionalAnalysis} wordCount={wordCount} />

                {/* Healing recommendations */}
                {healingRecommendations.length > 0 && (
                  <HealingRecommendationComponent
                    recommendations={healingRecommendations}
                  />
                )}

                {/* Timeline of healing progress */}
                {emotionalMemory && (
                  <EmotionalTimeline memory={emotionalMemory} />
                )}

                {/* Continue button */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setStage("setup");
                      setCheckIn(null);
                      setEmotionalAnalysis(null);
                      setHealingRecommendations([]);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#4F5E52] text-white font-medium hover:bg-[#3D4A3F] transition-colors"
                  >
                    Journal Again
                  </button>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-[#4F5E52] text-[#4F5E52] font-medium hover:bg-[#F0EDEA] transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </PremiumLock>
    </ProtectedRoute>
  );
}
