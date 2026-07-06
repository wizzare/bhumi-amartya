"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { useAuth } from "@/context/AuthContext";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyStoryEngine, GrowthStory } from "@/lib/engines/journeyStoryEngine";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { ArrowLeft, Sparkles, Clock, Heart, Flag } from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getCompletionSummary, mergeDailyStatesWithJourneyRecords } from "@/lib/engines/completionEngine";
import type { JourneyDailyMemory } from "@/lib/types/journeyDailyRecord";
import { MoanaRuntimeDiagnosticsPanel } from "@/components/debug/MoanaRuntimeDiagnosticsPanel";
import { appendMoanaRuntimeDiagnostic, toDiagnosticError } from "@/lib/innerwork/moanaRuntimeDiagnostics";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { sanitizeNarrative } from "@/lib/profile/narrativeHumanizer";


interface JourneyDetailClientProps {
  id: string;
}

const EMPTY_JOURNEY_MEMORY: JourneyDailyMemory = {
  yesterday: null,
  last7Days: [],
  last30Days: [],
  weeklyLearning: undefined,
  monthlyLearning: undefined,
  practiceInsights: undefined,
  growthNarrative: undefined,
  coachMemory: undefined,
};

const NAVIGATOR_MODE_MAP: Record<string, string> = {
  RECOVERY: "Mode Pemulihan",
  REFLECTION: "Mode Refleksi",
  GROWTH: "Mode Pertumbuhan",
};

const DOMAIN_MAP: Record<string, string> = {
  BODY: "Tubuh",
  EMOTION: "Emosi",
  MIND: "Pikiran",
  RELATIONSHIP: "Relasi",
  MEANING: "Makna",
  REGULATION: "Regulasi Diri",
};

const PRACTICE_NAME_MAP: Record<string, string> = {
  journaling: "Jurnal",
  journal: "Jurnal",
  meditation: "Meditasi",
  audioHealing: "Audio Healing",
  "audio-healing": "Audio Healing",
  manifestation: "Manifestasi",
  manifestasi: "Manifestasi",
  yoga: "Yoga",
  workout: "Olahraga",
  "healthy-food": "Makanan Sehat",
  herbal: "Makanan Sehat",
  food: "Makanan Sehat",
};

function indonesianize(text: string): string {
  if (!text) return "";
  const replaced = text
    .replace(/\bboundaries\b/gi, "batas diri")
    .replace(/\bresponsibility\b/gi, "tanggung jawab")
    .replace(/\bnervous system\b/gi, "sistem saraf")
    .replace(/\blow energy\b/gi, "energi rendah")
    .replace(/\bbody recovery\b/gi, "pemulihan tubuh")
    .replace(/\bemotional release\b/gi, "pelepasan emosi")
    .replace(/\bRECOVERY\b/g, "Pemulihan")
    .replace(/\bREFLECTION\b/g, "Refleksi")
    .replace(/\bGROWTH\b/g, "Pertumbuhan")
    .replace(/\bBODY\b/g, "Tubuh")
    .replace(/\bEMOTION\b/g, "Emosi")
    .replace(/\bMIND\b/g, "Pikiran")
    .replace(/\bRELATIONSHIP\b/g, "Relasi")
    .replace(/\bMEANING\b/g, "Makna")
    .replace(/\bREGULATION\b/g, "Regulasi Diri")
    .replace(/\bSelf-trust\b/gi, "Kepercayaan diri")
    .replace(/\bEmotional sensitivity\b/gi, "Sensitivitas emosional")
    .replace(/\bCreative regulation\b/gi, "Regulasi kreatif")
    .replace(/\bStructure and consistency\b/gi, "Struktur dan konsistensi")
    .replace(/\bFreedom with steadiness\b/gi, "Kebebasan dengan kestabilan")
    .replace(/\bResponsibility with balance\b/gi, "Tanggung jawab seimbang")
    .replace(/\bQuiet introspection\b/gi, "Introspeksi tenang")
    .replace(/\bPower with responsibility\b/gi, "Kekuatan dan tanggung jawab")
    .replace(/\bCompassionate release\b/gi, "Pelepasan penuh kasih")
    .replace(/\bEmotional regulation\b/gi, "Regulasi emosional")
    .replace(/\bLong-term steadiness\b/gi, "Kestabilan jangka panjang")
    .replace(/\bHeart-led steadiness\b/gi, "Kestabilan berbasis hati");

  return sanitizeNarrative(replaced);
}

export default function JourneyDetailClient({ id }: JourneyDetailClientProps) {
  const auth = useAuth();
  const [history, setHistory] = useState<DailyState[]>([]);
  const [story, setStory] = useState<GrowthStory | null>(null);
  const [learning, setLearning] = useState<JourneyDailyMemory | null>(null);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        const accessToken = params.get("accessToken");
        if (token) {
          console.log("J0 before custom token sign in");
          try {
            const { signInWithCustomToken } = await import("firebase/auth");
            const { auth: clientAuth } = await import("@/lib/firebase/firebase");
            await signInWithCustomToken(clientAuth, token);
            console.log("J0 after custom token sign in success");
          } catch (err) {
            console.error("J0 custom token sign in error", err);
          }
        } else if (accessToken) {
          console.log("J0 before google token sign in");
          try {
            const { GoogleAuthProvider, signInWithCredential } = await import("firebase/auth");
            const { auth: clientAuth } = await import("@/lib/firebase/firebase");
            const credential = GoogleAuthProvider.credential(null, accessToken);
            await signInWithCredential(clientAuth, credential);
            console.log("J0 after google token sign in success");
          } catch (err) {
            console.error("J0 google token sign in error", err);
          }
        }
      }
    };
    checkToken();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const auditUser = process.env.NODE_ENV === "development"
        ? window.localStorage.getItem("bhumi_audit_user")
        : null;
      if (!auth?.user?.uid && !auditUser) return;

      try {
        const uid = auth?.user?.uid || `${auditUser}_uid`;
        let profile = auth?.userProfile;
        let blueprintData = await storageProvider.getUserBlueprint();
        if (auditUser && (!profile || !blueprintData)) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          profile = profile || getMockProfile(auditUser) as any;
          blueprintData = blueprintData || getMockBlueprint(auditUser) as any;
        }

        console.log("J1 before getRecentDailyStates");
        const states = await journeyRepository.getRecentDailyStates(uid);
        console.log("J2 after getRecentDailyStates", states.length);
        setHistory(states);

        console.log("J3 before getDailyMemory");
        const memory = await journeyRepository.getDailyMemory(uid).catch((error) => {
          appendMoanaRuntimeDiagnostic("journey_detail_memory_read_failure", {
            pageId: id,
            userId: uid,
            authUid: auth?.user?.uid ?? null,
            profileUid: auth?.userProfile?.uid ?? null,
            journeyRecordsReadPath: `journeyDailyRecords/${uid}/entries`,
            error: toDiagnosticError(error),
          });
          console.error("JOURNEY MEMORY READ ERROR", error);
          return EMPTY_JOURNEY_MEMORY;
        });
        console.log("J4 after getDailyMemory", memory);
        setLearning(memory);
        const hydratedStates = mergeDailyStatesWithJourneyRecords(states, memory.last30Days);
        setHistory(hydratedStates);

        let synthesis = null;
        if (blueprintData) {
            synthesis = buildUnifiedBlueprintSynthesis({
              language: profile?.language || "id",
              profile: profile as unknown as Record<string, unknown>,
              blueprint: blueprintData as unknown as Record<string, unknown>
            });
        }
        console.log("J5 before generateStory");
        const generatedStory = journeyStoryEngine.generateStory(hydratedStates, synthesis);
        console.log("J6 after generateStory", generatedStory);
        const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const today = getLocalDateKey(new Date(), timezone);
        const section4Records = memory.last30Days.flatMap((record) =>
          (record.practiceResults ?? []).filter((result) => result.source === "wellness_section_4"),
        );
        appendMoanaRuntimeDiagnostic("journey_detail_readback", {
          pageId: id,
          userId: uid,
          authUid: auth?.user?.uid ?? null,
          profileUid: auth?.userProfile?.uid ?? null,
          dateKeyLocal: today,
          dailyStateReadPath: `dailyStates/${uid}/entries`,
          journeyRecordsReadPath: `journeyDailyRecords/${uid}/entries`,
          dailyStatesFound: states.length,
          hydratedDailyStatesFound: hydratedStates.length,
          journeyRecordsFound: memory.last30Days.length,
          wellnessPracticeLogsFound: section4Records.length,
          rawPracticeTypesFound: section4Records.map((result) => result.practiceCategory),
          seesSection4Records: section4Records.length > 0,
          storyGenerated: Boolean(generatedStory),
          hydratedFromJourneyRecords: hydratedStates.length > states.length,
          fallbackTriggered: !generatedStory,
          fallbackReason: !generatedStory
            ? "story_missing_after_journeyStoryEngine_generateStory"
            : "not_triggered",
        });
        console.log("J7 before setStory");
        setStory(generatedStory);
        console.log("J8 after setStory");
      } catch (error: any) {
        console.error("JOURNEY RUNTIME ERROR", error);
        setReadError(error?.message || "Gagal memuat detail perjalanan.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) {
      loadData();
    }
  }, [auth]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <p className="text-[#4F5E52] animate-pulse">Bhumi sedang menyiapkan detail perjalananmu...</p>
      </main>
    );
  }

  const renderContent = () => {
    if (readError) {
      return (
        <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm text-center space-y-4">
           <p className="text-sm text-amber-800 font-medium">Terjadi kendala saat memuat data perjalanan.</p>
           {process.env.NODE_ENV !== "production" && (
             <p className="text-xs text-[#7B8776] break-words">{readError}</p>
           )}
           <button
             type="button"
             onClick={() => { setLoading(true); setReadError(null); window.location.reload(); }}
             className="px-4 py-2 bg-[#4F5E52] text-white text-xs font-bold rounded-xl uppercase tracking-wider"
           >
             Coba Lagi
           </button>
        </div>
      );
    }

    if (!story) {
      return (
        <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm text-center">
           <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#4F5E52]">
             <Sparkles size={32} />
           </div>
           <p className="text-[#7B8776] leading-relaxed italic">
             Perjalananmu baru saja dimulai. Bhumi sedang menyiapkan peta perjalanan berdasarkan refleksi dan praktik yang kamu lakukan.
           </p>
        </div>
      );
    }

    switch (id) {
      case "stage":
        return (
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm text-center">
              <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#4F5E52]">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-4">{indonesianize(story.stage.label)}</h2>
              <p className="text-[#7B8776] leading-relaxed italic">{indonesianize(story.stage.description)}</p>
            </div>
            
            {/* Theme Evolution */}
            {learning?.growthNarrative?.growthNarrative && (
              <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm">
                <p className="text-xs font-bold text-[#4F5E52] uppercase tracking-widest mb-4">Evolusi Tema Dirimu</p>
                <div className="text-sm text-[#4F5E52] font-semibold space-y-2 whitespace-pre-line text-center bg-[#F5F1E8]/30 py-4 rounded-2xl">
                  {indonesianize(learning.growthNarrative.growthNarrative)}
                </div>
                {learning.growthNarrative.currentLesson && (
                  <p className="text-xs text-[#7B8776] mt-4 leading-relaxed text-center">Pelajaran saat ini: “{indonesianize(learning.growthNarrative.currentLesson)}”</p>
                )}
                {learning.growthNarrative.nextInvitation && (
                  <p className="text-xs text-[#4F5E52] font-bold mt-2 text-center">Undangan berikutnya: {indonesianize(learning.growthNarrative.nextInvitation)}</p>
                )}
              </div>
            )}

            {/* Coach Memory */}
            {learning?.coachMemory?.coachMemory && (
              <div className="bhumi-card p-6 bg-[#F5F1E8] text-[#344A38] border border-[#DDE7DB] shadow-sm">
                <p className="text-xs font-bold text-[#4F5E52]/70 uppercase tracking-widest mb-3">Catatan Pembelajaran Bhumi</p>
                <p className="text-sm leading-relaxed font-medium">{indonesianize(learning.coachMemory.coachMemory)}</p>
              </div>
            )}

            <div className="bhumi-card p-6 bg-[#F5F1E8]/50 border-none">
                <p className="text-xs font-bold text-[#4F5E52] uppercase tracking-widest mb-2">Insight Pertumbuhan</p>
                <p className="text-sm text-[#7B8776] leading-relaxed">
                    Tahap ini mencerminkan sejauh mana praktik harianmu telah terintegrasi dalam kesadaranmu. Setiap langkah kecil adalah bagian dari fondasi yang lebih besar.
                </p>
            </div>
          </div>
        );
      case "focus":
      case "growing":
        return (
          <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm space-y-6">
            <div>
              <h2 className="text-xs font-bold text-[#9AA394] uppercase tracking-[0.2em] mb-4">Fokus Saat Ini</h2>
              <p className="text-2xl font-serif text-[#4F5E52] leading-snug">{indonesianize(story.growthFocus)}</p>
              <div className="mt-6 pt-6 border-t border-[#F5F1E8]">
                <p className="text-sm font-bold text-[#4F5E52] mb-2">Yang sedang tumbuh</p>
                <p className="text-sm text-[#7B8776]">{indonesianize(story.growingAreas[0])}</p>
              </div>
            </div>

            {learning?.weeklyLearning?.weeklyPattern && (
              <div className="pt-6 border-t border-[#F5F1E8]">
                <p className="text-xs font-bold text-[#9AA394] uppercase tracking-widest mb-2">Pola 7 Hari Terakhir</p>
                <p className="text-sm text-[#4F5E52] leading-relaxed">{indonesianize(learning.weeklyLearning.weeklyPattern)}</p>
                {learning.weeklyLearning.coachObservation && (
                  <p className="text-xs text-[#7B8776] mt-2 italic">“{indonesianize(learning.weeklyLearning.coachObservation)}”</p>
                )}
              </div>
            )}

            {learning?.monthlyLearning?.monthlyTheme && (
              <div className="pt-6 border-t border-[#F5F1E8]">
                <p className="text-xs font-bold text-[#9AA394] uppercase tracking-widest mb-2">Tema 30 Hari Terakhir</p>
                <p className="text-sm text-[#4F5E52] leading-relaxed">{indonesianize(learning.monthlyLearning.monthlyTheme)}</p>
                {learning.monthlyLearning.monthlyNarrative && (
                  <p className="text-xs text-[#7B8776] mt-2 leading-relaxed">{indonesianize(learning.monthlyLearning.monthlyNarrative)}</p>
                )}
              </div>
            )}
          </div>
        );
      case "attention":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#4F5E52] px-2 mb-2">Yang Meminta Perhatian</h2>
            {story.attentionAreas.map((area, idx) => (
                <div key={idx} className="bhumi-card p-6 bg-white border-none shadow-sm flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                        <Heart size={20} />
                    </div>
                    <span className="font-bold text-[#4F5E52]">{indonesianize(area)}</span>
                </div>
            ))}

            <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm space-y-4">
                <p className="text-xs font-bold text-[#4F5E52] uppercase tracking-widest">Efektivitas Praktik Harian</p>
                {learning?.practiceInsights?.practiceInsights && learning.practiceInsights.practiceInsights.length > 0 ? (
                  <div className="space-y-4">
                    {learning.practiceInsights.practiceInsights.map(({ practice, helpfulScore }) => {
                      let levelLabel = "Sangat Membantu";
                      let levelColor = "bg-[#4F5E52]";
                      if (helpfulScore < 35) {
                        levelLabel = "Berat / Butuh Penyesuaian";
                        levelColor = "bg-amber-600";
                      } else if (helpfulScore < 60) {
                        levelLabel = "Cukup Membantu";
                        levelColor = "bg-[#7B8776]";
                      } else if (helpfulScore < 75) {
                        levelLabel = "Membantu";
                        levelColor = "bg-[#4F5E52]/80";
                      }
                      return (
                        <div key={practice} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-[#4F5E52]">{indonesianize(PRACTICE_NAME_MAP[practice.toLowerCase()] || practice)}</span>
                            <span className="text-xs text-[#7B8776]">{levelLabel}</span>
                          </div>
                          <div className="w-full bg-[#F5F1E8] h-2 rounded-full overflow-hidden">
                            <div className={`${levelColor} h-full rounded-full`} style={{ width: `${helpfulScore}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#7B8776] leading-relaxed italic">
                    Belum cukup data untuk mengukur efektivitas praktikmu. Teruskan perjalananmu dan Bhumi akan mulai mengenali praktik yang paling membantu untukmu.
                  </p>
                )}
            </div>
          </div>
        );
      case "milestone":
        return (
          <div className="p-8 rounded-[2.5rem] bg-white text-[#344A38] shadow-md text-center border border-[#E8E9E5]">
            <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#DDE7DB]">
                <Flag size={36} className="text-[#4F5E52]" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#7B8776] mb-3">Target Berikutnya</p>
            <h2 className="text-2xl font-serif mb-6 text-[#4F5E52]">{indonesianize(story.nextMilestone)}</h2>
            <div className="bg-[#FCFAF5] p-5 rounded-2xl border border-[#E8E9E5]">
                <p className="text-sm text-[#526053] leading-relaxed font-medium">
                    Teruslah melangkah. Setiap hari yang kamu lalui dengan kesadaran membawamu lebih dekat pada pencapaian ini.
                </p>
            </div>
          </div>
        );
      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#4F5E52] px-2 mb-4">Riwayat Aktivitas</h2>
            {history.length > 0 ? (
              <div className="space-y-3">
                  {history.map((state) => (
                    <div key={state.date} className="bhumi-card p-5 bg-white border-none shadow-sm flex items-center gap-4">
                      <div className="text-sm font-bold text-[#4F5E52] w-20 flex items-center gap-2">
                          <Clock size={14} className="text-[#9AA394]" />
                          {state.date.slice(5)}
                      </div>
                      <div className="flex-1 flex gap-1.5">
                        {getCompletionSummary(state).items.map((item) => (
                          <div
                            key={item.id}
                            className={`w-2 h-2 rounded-full ${item.completed ? 'bg-[#4F5E52]' : 'bg-[#E8E9E5]'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] font-bold text-[#4F5E52] bg-[#F5F1E8] px-3 py-1 rounded-full">
                        {state.moodLevel ? `Kondisi ${state.moodLevel}` : "-"}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm text-center">
                 <p className="text-[#7B8776] leading-relaxed italic">
                   Belum ada catatan aktivitas di perjalananmu. Praktik dan refleksi harianmu akan mulai muncul di sini.
                 </p>
              </div>
            )}
          </div>
        );
      default:
        return <p className="text-center text-[#7B8776]">Bagian ini sedang disiapkan.</p>;
    }
  };

  return (
    <ProtectedRoute>
      <AccessGuard feature="journey">
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 text-[#7B8776] text-sm font-bold uppercase tracking-widest mb-8 hover:text-[#4F5E52] transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Perjalanan
          </Link>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderContent()}
          </div>
          <MoanaRuntimeDiagnosticsPanel label={`Journey detail readback: ${id}`} />
        </div>
      </main>
      </AccessGuard>
    </ProtectedRoute>
  );
}
