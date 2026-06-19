"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { profileToCoreIdentity } from "@/lib/mappers/userProfileMapper";
import { emotionalMemoryRepository } from "@/lib/repositories/emotionalMemoryRepository";
import { healingRepository } from "@/lib/repositories/healingRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import type {
  CoreIdentity,
  EmotionalMemory,
  EmotionalAnalysis,
  HealingProgressSummary,
  MeditationRecommendation,
  HealingRecommendation,
  HealingActionRecord,
} from "@/lib/data/types";
import { generateMeditationPlan } from "@/lib/engines/generateMeditationPlan";
import { analyzeHealingProgress } from "@/lib/engines/analyzeHealingProgress";
import { recordHealingAction } from "@/lib/engines/updateHealingMemory";
import { getSuggestedHealingPractices } from "@/lib/engines/generateHealingRecommendation";
import { HealingHero } from "@/components/healing/HealingHero";
import { DailyHealingFocus } from "@/components/healing/DailyHealingFocus";
import { MeditationCard } from "@/components/healing/MeditationCard";
import { ChakraBalanceCard } from "@/components/healing/ChakraBalanceCard";
import { ShadowHealingCard } from "@/components/healing/ShadowHealingCard";
import { InnerChildHealingCard } from "@/components/healing/InnerChildHealingCard";
import { AncestorHealingCard } from "@/components/healing/AncestorHealingCard";
import { MudraGuideCard } from "@/components/healing/MudraGuideCard";
import { HealingProgressCard } from "@/components/healing/HealingProgressCard";
import { EmotionalProgressTimeline } from "@/components/healing/EmotionalProgressTimeline";

export default function HealingPage() {
  const router = useRouter();
  const auth = useAuth();
  const userProfile = auth?.userProfile;

  const [coreIdentity, setCoreIdentity] = useState<CoreIdentity | null>(null);
  const [healingMemory, setHealingMemory] = useState<EmotionalMemory | null>(null);
  const [analysis, setAnalysis] = useState<EmotionalAnalysis | null>(null);
  const [progressSummary, setProgressSummary] = useState<HealingProgressSummary | null>(null);
  const [meditationPlan, setMeditationPlan] = useState<MeditationRecommendation | null>(null);
  const [healingRecommendations, setHealingRecommendations] = useState<HealingRecommendation[]>([]);
  const [notes, setNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
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
      setLoading(true);
      setLoadError(null);

      try {
        const blueprint = await blueprintRepository.getUserBlueprint(userProfile.uid);
        if (!blueprint || blueprint.status !== "ready") {
          router.replace("/setup");
          return;
        }
        const identity: CoreIdentity = profileToCoreIdentity(userProfile as any, blueprint);
        const memory = await emotionalMemoryRepository.getOrCreate(userProfile.uid);
        const { analysis, progressSummary } = analyzeHealingProgress(memory, identity);
        const plan = generateMeditationPlan(identity, analysis, memory);
        const recommendations = getSuggestedHealingPractices(analysis, identity);

        setCoreIdentity(identity);
        setHealingMemory(memory);
        setAnalysis(analysis);
        setProgressSummary(progressSummary);
        setMeditationPlan(plan);
        setHealingRecommendations(recommendations);
      } catch (error) {
        console.error("[Healing Page] Failed to load", error);
        setLoadError("Data pengguna belum siap. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [auth, router]);

  const handlePracticeComplete = async (
    actionId: string,
    title: string,
    type: "meditation" | "innerwork" | "grounding" | "mudra" | "creative" | "somatic" | "shadow" | "ancestor",
    effect: string,
  ) => {
    const userProfile = auth?.userProfile;
    if (!userProfile || !healingMemory || !coreIdentity || !analysis) return;

    const updatedMemory = recordHealingAction(healingMemory, {
      id: actionId,
      title,
      type,
      effect,
      intensityShift: "gentle",
    });

    const { analysis: updatedAnalysis, progressSummary: updatedSummary } = analyzeHealingProgress(updatedMemory, coreIdentity);
    const updatedPlan = generateMeditationPlan(coreIdentity, updatedAnalysis, updatedMemory);
    const updatedRecommendations = getSuggestedHealingPractices(updatedAnalysis, coreIdentity);

    await emotionalMemoryRepository.save(userProfile.uid, updatedMemory);
    await userRepository.recordHealingPractice(
      userProfile.uid,
      type === "meditation" ? meditationPlan?.duration || 0 : 0,
    );
    await healingRepository.saveHealingProgress(userProfile.uid, {
      healingStreak: (userProfile.healingProgress.healingStreak || 0) + 1,
      totalInnerworkSessions: (userProfile.healingProgress.totalInnerworkSessions || 0) + 1,
      totalMeditationMinutes:
        (userProfile.healingProgress.totalMeditationMinutes || 0) +
        (type === "meditation" ? meditationPlan?.duration || 0 : 0),
      consciousnessLevel: (userProfile.healingProgress.consciousnessLevel || 1) + 1,
    });

    setHealingMemory(updatedMemory);
    setAnalysis(updatedAnalysis);
    setProgressSummary(updatedSummary);
    setMeditationPlan(updatedPlan);
    setHealingRecommendations(updatedRecommendations);
  };

  const handleNotesSave = async () => {
    const userProfile = auth?.userProfile;
    if (!userProfile || !notes.trim()) return;

    setIsSavingNotes(true);
    await healingRepository.saveNote(userProfile.uid, notes.trim());
    setIsSavingNotes(false);
    setNotes("");
  };

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6 py-10">
        <div className="rounded-[28px] bg-white p-8 shadow-xl border border-[#E8E9E5] text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-[#4F5E52] px-6 py-3 text-sm font-medium text-white"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  if (loading || auth?.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6 py-10">
        <div className="rounded-[36px] bg-white p-10 shadow-xl border border-[#E8E9E5] text-center max-w-xl w-full">
          <p className="text-[#4F5E52] text-lg">Menciptakan ruang yang aman untuk dirimu…</p>
          <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-[#E8E9E5]">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#4F5E52]" />
          </div>
        </div>
      </main>
    );
  }

  if (!analysis || !progressSummary || !meditationPlan || !coreIdentity || !healingMemory || !userProfile) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6 py-10">
        <div className="rounded-[28px] bg-white p-8 shadow-xl border border-[#E8E9E5] text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Data pengguna belum siap. Silakan coba lagi.</p>
        </div>
      </main>
    );
  }

  const shadowPattern = analysis.recurringWounds[0] || "Luka tersembunyi ini siap bertemu dengan kelembutan.";
  const innerChildPrompt = "Jika inner child-mu bisa bicara, apa yang ia butuhkan untuk didengar sekarang?";
  const ancestorInvitation = "Rasakan garis keturunan yang telah membawa pergulatan ini. Dukungan apa yang mereka tawarkan?";
  const mudraName = "Shuni Mudra";
  const mudraPractice = "Sentuhkan ujung jari tengah ke ujung ibu jari dengan lembut. Letakkan tangan di pangkuan dan tarik napas dengan sabar.";
  const mudraBenefit = "Mudra ini mengundang kesabaran, ketenangan, dan kehadiran yang lebih dalam dalam tubuh.";
  const soulGift = coreIdentity.lifePathArchetype;
  const focus = healingMemory.suggestedFocus;

  return (
    <main className="min-h-screen px-5 py-8 bg-[#FCFAF5] text-[#33413A]">
      <div className="mx-auto max-w-7xl space-y-8">
        <HealingHero
          userName={userProfile.fullName || userProfile.displayName || "Jiwa"}
          focus={focus}
          soulGift={soulGift}
          supportiveMessage="Halaman ini adalah pendamping lembut untuk sistem saraf dan dunia batinmu. Rekomendasi hadir untuk mendukung, bukan mendorong."
        />

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="space-y-6">
            <DailyHealingFocus
              theme={analysis.healingDirection}
              focusArea={progressSummary.chakraFocus.map((item) => item.chakra).join(" + ")}
              anchorMessage={progressSummary.supportiveMessage}
              invitation="Pilih satu praktik hari ini yang terasa aman dan bermakna. Sisanya bisa tetap menjadi undangan, bukan kewajiban."
            />

            <MeditationCard
              plan={meditationPlan}
              onStart={() =>
                handlePracticeComplete(
                  "meditation-today",
                  meditationPlan.title,
                  "meditation",
                  "Meditasi ini menenangkan sistem sarafmu."
                )
              }
              isCompleted={healingMemory.healingActions.some((action) => action.id === "meditation-today")}
            />

            <ChakraBalanceCard chakraFocus={progressSummary.chakraFocus} />

            <ShadowHealingCard
              pattern={shadowPattern}
              integration={analysis.healingDirection}
              gift="Dalam pola ini ada undangan untuk mengenal diri lebih dalam dan menerima dengan lemah lembut."
            />

            <InnerChildHealingCard
              prompt={innerChildPrompt}
              invitation="Tulis atau bicara kepada inner child itu dengan nada yang stabil dan penuh kasih."
              reassurance="Tidak perlu terburu-buru. Satu-satunya syarat adalah hadir."
            />

            <AncestorHealingCard
              invitation={ancestorInvitation}
              lineage="Leluhurmu membawa keberanian lewat badai yang hening. Biarkan kehadiran mereka mengingatkanmu bahwa kamu tidak sendiri."
              practice="Nyalakan lilin, bayangkan mengucap syukur ke belakang, dan biarkan dukungan lini keturunan menetap di hati."  
            />

            <MudraGuideCard
              mudraName={mudraName}
              intention="Kesabaran"
              practice={mudraPractice}
              benefit={mudraBenefit}
            />

            <HealingProgressCard
              summary={progressSummary}
              completedActions={healingMemory.healingActions.length}
              onCompletePractice={() =>
                handlePracticeComplete(
                  "practice-check",
                  "Menandai langkah penyembuhan selesai",
                  "innerwork",
                  "Tubuh dan jiwa merasa tersaksikan."
                )
              }
            />
          </div>

          <aside className="space-y-6">
            <EmotionalProgressTimeline memory={healingMemory} />

            <section className="rounded-[32px] bg-white p-7 shadow-soft border border-[#E8E9E5]">
              <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Catatan penyembuhan</p>
              <h2 className="text-2xl font-semibold text-[#33413A]">Kesaksian lembutmu</h2>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={8}
                className="mt-5 w-full rounded-[24px] border border-[#E8E9E5] bg-[#FCFAF5] p-4 text-sm text-[#33413A] outline-none transition focus:border-[#A08963]"
                placeholder="Tuliskan bagaimana praktik tadi dirasakan, apa yang bergeser, atau apa yang ingin kamu ingat besok."
              />
              <button
                type="button"
                onClick={handleNotesSave}
                className="mt-5 inline-flex w-full items-center justify-center rounded-3xl bg-[#4F5E52] px-6 py-3 text-white font-medium transition hover:bg-[#37463D]"
              >
                {isSavingNotes ? "Menyimpan…" : "Simpan catatan"}
              </button>
            </section>

            <section className="rounded-[32px] bg-[#F7F4ED] p-7 shadow-soft border border-[#E8E9E5]">
              <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Pilihan harian</p>
              <p className="text-[#4F5E52] text-lg font-semibold">
                {healingRecommendations.length > 0 ? healingRecommendations[0].title : "Percayai jeda ini"}
              </p>
              <p className="mt-4 text-[#5F6B60] leading-relaxed">
                {healingRecommendations.length > 0
                  ? healingRecommendations[0].description
                  : "Penyembuhanmu bisa terwujud melalui istirahat, perhatian, dan memilih satu praktik yang lembut."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
