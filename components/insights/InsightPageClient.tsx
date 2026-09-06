"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { APP_MODE } from "@/lib/config/appMode";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { AppNav } from "@/components/navigation/AppNav";
import {
  loadProgressData,
  refreshProgressData,
  type ProgressData,
  type ProgressTheme,
} from "@/lib/insights/createInsightProgress";
import {
  loadCompiledInnerwork,
  refreshCompiledInnerwork,
  type CompiledInnerworkInsight,
} from "@/lib/ai/compileUserInnerwork";
import {
  loadHealingInsights,
  refreshHealingInsights,
  type HealingInsightResult,
} from "@/lib/healing/createHealingInsights";
import { loadJourneyData, refreshJourneyData, type JourneyData } from "@/lib/journey/createJourneyData";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";
import { InsightOrchestrator, type InsightPageData } from "@/lib/orchestrators/insightOrchestrator";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { storageProvider } from "@/lib/storage/storageProvider";
import { isEnlEdition } from "@/lib/config/edition";

type UnknownRecord = Record<string, unknown>;

type LocalInsightState = {
  profile: UnknownRecord | null;
  blueprint: UnknownRecord | null;
  journalEntries: UnknownRecord[];
  meditationEntries: UnknownRecord[];
  audioHealingEntries: UnknownRecord[];
  healingInsights: HealingInsightResult | null;
  journeyData: JourneyData | null;
  compiledInnerwork: CompiledInnerworkInsight | null;
  progressData: ProgressData | null;
};

const THEME_ICON: Record<string, string> = {
  "Self Worth": "❤️",
  "Inner Child": "👶",
  "Money Block": "💰",
  "Ancestral Patterns": "🧬",
  "Boundaries": "🛡",
  "Fear of Rejection": "💔",
  Responsibility: "⚖",
  "Love Block": "💗",
  "Repeating Patterns": "🔁",
  "Family Wounds": "🏠",
  "Nervous System Regulation": "🫁",
  "Emotional Safety": "🌿",
};

const PATTERN_REASON: Record<string, string> = {
  "Self Worth": "Hal ini muncul berulang dalam refleksi tentang nilai diri, rasa layak, dan kebutuhan validasi.",
  "Inner Child": "Hal ini terlihat dari banyak catatan tentang rasa ingin didengar, kebutuhan aman, dan pola masa kecil.",
  "Money Block": "Hal ini muncul dari relasi terhadap rasa aman finansial, menerima, dan ketegangan saat membahas uang.",
  "Boundaries": "Hal ini terlihat dari pola menjaga batas, sulit berkata tidak, atau menanggung beban berlebih.",
  Responsibility: "Hal ini terlihat dari pola memikul tanggung jawab dan kesulitan membagi beban.",
  "Fear of Rejection": "Hal ini muncul dari sinyal takut dinilai, takut ditolak, atau menahan ekspresi diri.",
};

const PATTERN_REASON_EN: Record<string, string> = {
  "Self Worth": "This appears repeatedly in reflections about self-worth, feeling worthy, and the need for validation.",
  "Inner Child": "This is evident from many notes about wanting to be heard, needing safety, and childhood patterns.",
  "Money Block": "This stems from your relationship with financial security, receiving, and tension when discussing money.",
  "Boundaries": "This shows up in patterns of boundary keeping, difficulty saying no, or carrying excessive loads.",
  Responsibility: "This shows up in patterns of taking on responsibility and difficulty sharing burdens.",
  "Fear of Rejection": "This comes from signals of fear of judgment, fear of rejection, or holding back self-expression.",
};

function toTitleLabel(score: number): string {
  if (score >= 76) return "Deepening Practice";
  if (score >= 51) return "Consistent";
  if (score >= 26) return "Growing";
  return "Beginner";
}

function trendLabel(trend: ProgressTheme["trend"], isEn = false) {
  if (trend === "up") return isEn ? "↑ increasing" : "↑ meningkat";
  if (trend === "down") return isEn ? "↓ decreasing" : "↓ menurun";
  return isEn ? "→ stable" : "→ stabil";
}

function getString(record: UnknownRecord | null, path: string[]): string | null {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as UnknownRecord)[key];
  }, record);

  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hasAnyActivity(state: LocalInsightState | null): boolean {
  if (!state) return false;
  return (
    state.journalEntries.length > 0 ||
    state.meditationEntries.length > 0 ||
    state.audioHealingEntries.length > 0
  );
}

function createBodyReflection(progress: ProgressData | null, isEn = false): string {
  if (!progress || (progress.bodySignals.length === 0 && progress.emotionalStates.length === 0)) {
    return isEn
      ? "Your emotional and body data is still growing. After a few more practices, a clearer pattern will emerge."
      : "Data emosi dan tubuhmu masih bertumbuh. Setelah beberapa praktik lagi, pola yang lebih jelas akan terlihat.";
  }
  const topBody = progress.bodySignals[0]?.value?.toLowerCase();
  const topEmotion = progress.emotionalStates[0]?.value?.toLowerCase();
  if (isEn) {
    return `Your body seems to frequently respond to stress through ${topBody || "subtle signals"} and ${topEmotion || "varied emotions"}. This is not something wrong, but rather a signal you can listen to with more gentleness.`;
  }
  return `Tubuhmu tampak sering merespons tekanan melalui ${topBody || "sinyal halus"} dan emosi ${topEmotion || "yang beragam"}. Ini bukan sesuatu yang salah, melainkan sinyal yang bisa kamu dengarkan dengan lebih lembut.`;
}

function createBlueprintParagraphs(blueprint: UnknownRecord | null, isEn = false): string[] {
  const lifePath = getString(blueprint, ["lifePath", "number"]);
  const arcana = getString(blueprint, ["arcanaCenter", "number"]);
  const humanDesignType = getCanonicalHumanDesignType((blueprint as any)?.humanDesign);
  const humanDesignProfile = getString(blueprint, ["humanDesign", "profile"]);
  const humanDesignAuthority = getString(blueprint, ["humanDesign", "authority"]);
  const sunSign = getString(blueprint, ["sunSign", "sign"]) ?? getString(blueprint, ["natalChart", "sunSign"]);
  const moonSign = getString(blueprint, ["natalChart", "moonSign"]);
  const ascendant = getString(blueprint, ["natalChart", "ascendant"]);

  if (isEn) {
    const first = `${lifePath || humanDesignType || sunSign ? "From the observed patterns," : "From your journey so far,"} your innerwork seems to ask for a more aligned rhythm, not a harder one. When you do not force yourself to finish immediately, your body and emotions have room to show a more honest step.`;
    const second = `${humanDesignProfile || humanDesignAuthority || arcana || moonSign || ascendant ? "There are several layers within you asking to be heard more gently." : "Not everything needs to be named immediately to be understood."} Use that as a simple compass: pick one small step that makes you feel more present, safer, and more honest with your needs today.`;
    return [first, second];
  }

  const first = `${lifePath || humanDesignType || sunSign ? "Dari pola yang terlihat," : "Dari perjalananmu sejauh ini,"} innerwork-mu tampak meminta ritme yang lebih selaras, bukan lebih keras. Saat kamu tidak memaksa diri untuk langsung selesai, tubuh dan emosimu punya ruang untuk menunjukkan langkah yang lebih jujur.`;
  const second = `${humanDesignProfile || humanDesignAuthority || arcana || moonSign || ascendant ? "Ada beberapa lapisan dalam dirimu yang sedang meminta didengar dengan lebih halus." : "Tidak semua hal perlu langsung diberi nama untuk bisa dipahami."} Gunakan itu sebagai kompas yang sederhana: pilih satu langkah kecil yang membuatmu merasa lebih hadir, lebih aman, dan lebih jujur pada kebutuhanmu hari ini.`;
  return [first, second];
}

function createClosingMessage(progress: ProgressData | null, isEn = false): string {
  const score = progress?.consistencyScore ?? 0;
  if (isEn) {
    return `Your journey is not always visible from how quickly you change. Often it is visible from your courage to remain present, honest, and willing to listen to yourself when things are not fully clear. Every small step still matters, even when not consistent every day. With your current consistency score of ${score}/100, you are already on a growing path. Stay gentle with your process, because deep change is usually born from repeated presence, not rushed pressure.`;
  }
  return `Perjalananmu tidak selalu terlihat dari seberapa cepat kamu berubah. Sering kali ia terlihat dari keberanianmu untuk tetap hadir, jujur, dan mau mendengarkan dirimu sendiri saat keadaan belum sepenuhnya jelas. Setiap langkah kecilmu tetap berarti, bahkan ketika belum konsisten setiap hari. Dengan konsistensi ${score}/100 saat ini, kamu sudah berada di jalur yang bertumbuh. Tetap lembut pada prosesmu, karena perubahan yang dalam biasanya lahir dari kehadiran yang berulang, bukan dari dorongan yang terburu-buru.`;
}

export function InsightPageClient() {
  const router = useRouter();
  const auth = useAuth();
  const isEn = isEnlEdition();
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);
  const userProfile = auth?.userProfile;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [firebaseInsightData, setFirebaseInsightData] = useState<InsightPageData | null>(null);
  const [localState, setLocalState] = useState<LocalInsightState | null>(null);
  const reconciledUidRef = useRef<string | null>(null);

  useEffect(() => {
    const currentAuth = authRef.current;
    if (APP_MODE === "local-first") {
      if (!currentAuth || currentAuth.authLoading || currentAuth.profileLoading || !currentAuth.authStateResolved) return;
      let cancelled = false;

      const loadLocalInsightData = async () => {
        try {
          const authUid = currentAuth.user?.uid;
          const canUseReconciledContext = Boolean(
            authUid &&
            reconciledUidRef.current === authUid &&
            currentAuth.userProfile?.uid === authUid,
          );
          if (authUid && !canUseReconciledContext) reconciledUidRef.current = authUid;
          const resolved = canUseReconciledContext
            ? {
                profile: currentAuth.userProfile as unknown as UnknownRecord,
                isLoading: false,
                isMissing: false,
                isUnavailable: false,
              }
            : await resolveActiveProfile(currentAuth);
          if (cancelled || resolved.isLoading) return;
          if (resolved.isUnavailable) {
            setError(isEn ? "Profile could not be loaded. Please check your connection and try again." : "Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.");
            return;
          }
          const profile = resolved.profile;
          if (!profile || profile.setupCompleted !== true) {
            router.replace("/setup");
            return;
          }
          const blueprint = await storageProvider.getUserBlueprint() as unknown as UnknownRecord | null;
          const journalEntries = safeJsonParse<unknown>(localStorage.getItem("bhumiJournalEntries"), []);
          const meditationEntries = safeJsonParse<unknown>(localStorage.getItem("bhumiMeditationEntries"), []);
          const audioHealingEntries = safeJsonParse<unknown>(localStorage.getItem("bhumiAudioHealingEntries"), []);
          const healingInsights = loadHealingInsights() ?? refreshHealingInsights();
          const journeyData = loadJourneyData() ?? refreshJourneyData();
          const compiledInnerwork = loadCompiledInnerwork() ?? refreshCompiledInnerwork();
          const progressData = loadProgressData() ?? refreshProgressData();

          if (cancelled) return;
          setLocalState({
            profile,
            blueprint,
            journalEntries: Array.isArray(journalEntries) ? journalEntries : [],
            meditationEntries: Array.isArray(meditationEntries) ? meditationEntries : [],
            audioHealingEntries: Array.isArray(audioHealingEntries) ? audioHealingEntries : [],
            healingInsights,
            journeyData,
            compiledInnerwork,
            progressData,
          });
        } catch (loadError) {
          if (!cancelled) {
            console.error("[Insight Page] Failed to load local data", loadError);
            setError(isEn ? "Failed to load insight data. Please try again." : "Gagal memuat insight data. Silakan coba lagi.");
          }
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      void loadLocalInsightData();
      return () => {
        cancelled = true;
      };
    }

    if (!currentAuth || currentAuth.authLoading || currentAuth.profileLoading) return;
    const { user } = currentAuth;
    if (!user) {
      router.replace("/");
      return;
    }
    if (!userProfile?.setupCompleted) {
      router.replace("/setup");
      return;
    }

    const loadInsightData = async () => {
      try {
        setLoading(true);
        const orchestrator = new InsightOrchestrator(user.uid);
        const data = await orchestrator.getInsightPageData();
        setFirebaseInsightData(data);
      } catch (loadError) {
        console.error("Failed to load insight data:", loadError);
        setError(isEn ? "Failed to load insight data. Please try again." : "Gagal memuat insight data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadInsightData();
  }, [auth?.authLoading, auth?.authStateResolved, auth?.user?.uid, router, userProfile]);

  const localHasActivity = hasAnyActivity(localState);
  const dominantTheme = useMemo(() => {
    if (!localState) return null;
    return (
      localState.compiledInnerwork?.dominantTheme ??
      localState.healingInsights?.weeklyFocus.theme ??
      localState.progressData?.dominantThemes[0]?.theme ??
      null
    );
  }, [localState]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
        <AppNav />
        <div className="mx-auto max-w-3xl">
          <div className="space-y-4 animate-pulse">
            <div className="h-10 rounded-lg bg-[#4F5E52]/10" />
            <div className="h-48 rounded-lg bg-[#4F5E52]/10" />
            <div className="h-48 rounded-lg bg-[#4F5E52]/10" />
          </div>
        </div>
      </main>
    );
  }

  if (APP_MODE !== "local-first") {
    if (error || !firebaseInsightData) {
      return (
        <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
          <div className="mx-auto max-w-2xl">
            <p className="text-center text-[#7B8776]">{error}</p>
          </div>
        </main>
      );
    }

    if (!firebaseInsightData.hasActivity) {
      return (
        <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
          <div className="mx-auto max-w-md">
            <h1 className="mb-4 text-3xl font-semibold text-[#4F5E52]">{isEn ? "Your Journey Insights" : "Insight Perjalananmu"}</h1>
            <div className="bhumi-card flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed border-[#4F5E52]/10 bg-white/50 p-12 text-center">
              <p className="mb-6 text-sm text-[#7B8776]">
                {isEn ? "Insights will begin to take shape after you journal, meditate, or listen to audio healing." : "Insight akan mulai terbentuk setelah kamu melakukan Journal, Meditasi, atau Audio Healing."}
              </p>
              <button
                onClick={() => router.push("/dashboard")}
                className="rounded-full bg-[#4F5E52]/10 px-6 py-2 text-sm font-medium text-[#4F5E52] transition hover:bg-[#4F5E52]/20"
              >
                {isEn ? "Back to Dashboard" : "Kembali ke Dashboard"}
              </button>
            </div>
          </div>
        </main>
      );
    }
  }

  if (APP_MODE === "local-first" && (error || !localState)) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
        <AppNav />
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-[#7B8776]">{error || (isEn ? "Insight data not available." : "Data insight tidak tersedia.")}</p>
        </div>
      </main>
    );
  }

  if (APP_MODE === "local-first" && !localHasActivity) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
        <AppNav />
        <div className="mx-auto max-w-md">
          <h1 className="mb-4 text-3xl font-semibold text-[#4F5E52]">{isEn ? "Your Journey Insights" : "Insight Perjalananmu"}</h1>
          <div className="bhumi-card flex min-h-[300px] flex-col items-center justify-center border-2 border-dashed border-[#4F5E52]/10 bg-white/50 p-12 text-center">
            <p className="mb-6 text-sm text-[#7B8776]">
              {isEn ? "Insights will begin to take shape after you journal, meditate, or listen to audio healing." : "Insight akan mulai terbentuk setelah kamu melakukan Journal, Meditasi, atau Audio Healing."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-[#4F5E52]/10 px-6 py-2 text-sm font-medium text-[#4F5E52] transition hover:bg-[#4F5E52]/20"
            >
              {isEn ? "Back to Dashboard" : "Kembali ke Dashboard"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (APP_MODE !== "local-first") {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
        <div className="mx-auto max-w-2xl">
          <p className="text-[#7B8776]">{isEn ? "Firebase mode uses the legacy orchestrator." : "Mode Firebase tetap menggunakan orchestrator lama."}</p>
        </div>
      </main>
    );
  }

  const progress = localState?.progressData;
  const blueprint = localState?.blueprint ?? null;
  const topThemes = progress?.dominantThemes ?? [];
  const topPatterns = topThemes.slice(0, 3);
  const blueprintParagraphs = createBlueprintParagraphs(blueprint, isEn);
  const weeklyFocusText =
    localState?.compiledInnerwork?.weeklyMessage ??
    localState?.healingInsights?.weeklyFocus.practice ??
    (isEn ? "Continue small practices that make you feel more present with yourself." : "Teruskan praktik kecil yang membuatmu merasa lebih hadir dengan dirimu.");

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-10 pb-32">
      <AppNav />
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-semibold text-[#4F5E52]">{isEn ? "Your Journey Insights" : "Insight Perjalananmu"}</h1>
        <p className="mb-10 text-[#7B8776]">{isEn ? "Patterns, phases, and next steps of your innerwork." : "Pola, fase, dan langkah berikutnya dari innerwork-mu."}</p>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 0 · Your Journey Progress" : "SECTION 0 · Progress Perjalananmu"}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">📖 Journal</p>
              <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{progress?.totalJournalEntries ?? 0}</p>
            </div>
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">🧘 {isEn ? "Meditation" : "Meditasi"}</p>
              <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{progress?.totalMeditationEntries ?? 0}</p>
            </div>
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">🎧 Audio Healing</p>
              <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{progress?.totalAudioHealingEntries ?? 0}</p>
            </div>
          </div>
        </section>

        {/* R-PRD-18 / R-XC-02: no streak / consecutive-day pressure UI. Progress is
            shown as a gentle consistency reading below, not a run to keep alive. */}

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "🌱 Innerwork Consistency" : "🌱 Konsistensi Innerwork"}</h2>
          <div className="bhumi-card bg-white/50 p-6">
            <p className="text-3xl font-semibold text-[#4F5E52]">{progress?.consistencyScore ?? 0} / 100</p>
            <p className="mt-2 text-sm font-medium text-[#4F5E52]">{toTitleLabel(progress?.consistencyScore ?? 0)}</p>
            <div className="mt-4 h-2 w-full rounded-full bg-[#4F5E52]/10">
              <div
                className="h-2 rounded-full bg-[#4F5E52]"
                style={{ width: `${Math.max(0, Math.min(100, progress?.consistencyScore ?? 0))}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "📊 Theme Development" : "📊 Perkembangan Tema"}</h2>
          <div className="space-y-3">
            {topThemes.length === 0 ? (
              <div className="bhumi-card bg-white/50 p-5 text-sm text-[#7B8776]">{isEn ? "Not enough data to read patterns." : "Belum ada pola yang cukup terbaca."}</div>
            ) : (
              topThemes.map((theme) => (
                <div key={theme.theme} className="bhumi-card bg-white/50 p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#4F5E52]">
                      {THEME_ICON[theme.theme] ?? "🌿"} {theme.theme}
                    </p>
                    <p className="text-sm text-[#7B8776]">x{theme.frequency}</p>
                  </div>
                  <p className="mt-2 text-sm text-[#7B8776]">{trendLabel(theme.trend, isEn)}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">🏆 Milestone</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {(progress?.milestones ?? []).map((milestone) => (
              <div key={milestone.label} className="bhumi-card bg-white/50 p-4">
                <p className="text-sm text-[#4F5E52]">
                  {milestone.unlocked ? "✅" : "🔒"} {milestone.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "🌿 Journey Phase" : "🌿 Fase Perjalanan"}</h2>
          <div className="bhumi-card bg-white/50 p-6">
            <p className="text-sm text-[#7B8776]">{isEn ? "Possible phase you are currently experiencing" : "Kemungkinan fase yang sedang kamu jalani saat ini"}</p>
            <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{progress?.currentStage ?? "Awareness"}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 1 · Your Journey Summary" : "SECTION 1 · Ringkasan Perjalananmu"}</h2>
          <div className="bhumi-card space-y-4 bg-white/50 p-6">
            <div>
              <p className="text-sm text-[#7B8776]">{isEn ? "Most Frequent:" : "Yang Paling Sering Muncul:"}</p>
              <p className="font-medium text-[#4F5E52]">{dominantTheme ?? (isEn ? "No data yet" : "Belum ada data")}</p>
            </div>
            <div>
              <p className="text-sm text-[#7B8776]">{isEn ? "Current Phase:" : "Fase Saat Ini:"}</p>
              <p className="font-medium text-[#4F5E52]">{progress?.currentStage ?? "Awareness"}</p>
            </div>
            <div>
              <p className="text-sm text-[#7B8776]">{isEn ? "This Week's Focus:" : "Fokus Minggu Ini:"}</p>
              <p className="leading-relaxed text-[#4F5E52]">{weeklyFocusText}</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 2 · Patterns Currently Visible" : "SECTION 2 · Pola Yang Sedang Terlihat"}</h2>
          <div className="space-y-3">
            {topPatterns.map((pattern) => (
              <div key={pattern.theme} className="bhumi-card bg-white/50 p-5">
                <p className="font-medium text-[#4F5E52]">{pattern.theme}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">
                  {(isEn ? PATTERN_REASON_EN[pattern.theme] : PATTERN_REASON[pattern.theme]) ?? (isEn ? "This pattern was detected from a combination of journal history, meditation, audio healing, and weekly insights." : "Pola ini terdeteksi dari kombinasi riwayat journal, meditasi, audio healing, dan insight mingguan.")}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 3 · Body and Emotions" : "SECTION 3 · Tubuh dan Emosi"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm font-medium text-[#4F5E52]">{isEn ? "Most frequent emotions" : "Emosi yang paling sering muncul"}</p>
              <ul className="mt-3 space-y-2 text-sm text-[#7B8776]">
                {(progress?.emotionalStates ?? []).slice(0, 5).map((emotion) => (
                  <li key={emotion.value}>• {emotion.value} (x{emotion.frequency})</li>
                ))}
              </ul>
            </div>
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm font-medium text-[#4F5E52]">{isEn ? "Most frequent body signals" : "Sinyal tubuh yang paling sering muncul"}</p>
              <ul className="mt-3 space-y-2 text-sm text-[#7B8776]">
                {(progress?.bodySignals ?? []).slice(0, 5).map((signal) => (
                  <li key={signal.value}>• {signal.value} (x{signal.frequency})</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bhumi-card mt-4 bg-white/50 p-5">
            <p className="text-sm leading-relaxed text-[#7B8776]">{createBodyReflection(progress ?? null, isEn)}</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 4 · Blueprint Connection" : "SECTION 4 · Kaitan Dengan Blueprint"}</h2>
          <div className="bhumi-card space-y-4 bg-white/50 p-6">
            {blueprintParagraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-[#7B8776]">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 5 · Next Steps" : "SECTION 5 · Langkah Berikutnya"}</h2>
          <div className="space-y-3">
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">Recommended Journal</p>
              <p className="mt-2 text-[#4F5E52]">
                {localState?.compiledInnerwork?.recommendedNextJournalQuestion ??
                  (isEn ? "Start with the most honest question today." : "Mulai dari pertanyaan yang paling jujur hari ini.")}
              </p>
            </div>
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">Recommended Meditation</p>
              <p className="mt-2 text-[#4F5E52]">
                {localState?.compiledInnerwork?.recommendedMeditationFocus ??
                  localState?.healingInsights?.recommendedMeditation ??
                  "Nervous System Grounding"}
              </p>
            </div>
            <div className="bhumi-card bg-white/50 p-5">
              <p className="text-sm text-[#7B8776]">Recommended Audio Healing</p>
              <p className="mt-2 text-[#4F5E52]">
                {localState?.compiledInnerwork?.recommendedAudioHealingFocus ??
                  localState?.healingInsights?.recommendedAudioHealing ??
                  "Inner Child Healing"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-[#4F5E52]">{isEn ? "SECTION 6 · Message for You" : "SECTION 6 · Pesan Untukmu"}</h2>
          <div className="bhumi-card bg-white/50 p-6">
            <p className="text-sm leading-relaxed text-[#7B8776]">{createClosingMessage(progress ?? null, isEn)}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
