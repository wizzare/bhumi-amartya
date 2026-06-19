"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { journeyStoryEngine, GrowthStory } from "@/lib/engines/journeyStoryEngine";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { ArrowLeft, Sparkles, Clock, Heart, Flag } from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getCompletionSummary } from "@/lib/engines/completionEngine";
import type { JourneyDailyMemory } from "@/lib/types/journeyDailyRecord";


interface JourneyDetailClientProps {
  id: string;
}

export default function JourneyDetailClient({ id }: JourneyDetailClientProps) {
  const auth = useAuth();
  const [history, setHistory] = useState<DailyState[]>([]);
  const [story, setStory] = useState<GrowthStory | null>(null);
  const [learning, setLearning] = useState<JourneyDailyMemory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!auth?.user?.uid) return;

      try {
        const uid = auth.user.uid;
        const profile = auth.userProfile;
        const blueprintData = await storageProvider.getUserBlueprint();

        const states = await journeyRepository.getRecentDailyStates(uid);
        setHistory(states);

        const memory = await journeyRepository.getDailyMemory(uid);
        setLearning(memory);

        if (blueprintData) {
            const synthesis = buildUnifiedBlueprintSynthesis({
              language: profile?.language || "id",
              profile: profile as unknown as Record<string, unknown>,
              blueprint: blueprintData as unknown as Record<string, unknown>
            });
            setStory(journeyStoryEngine.generateStory(states, synthesis));
        }
      } catch (error) {
        console.error("Failed to load journey details:", error);
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
        <p className="text-[#4F5E52] animate-pulse">Memuat detail...</p>
      </main>
    );
  }

  const renderContent = () => {
    if (!story) return <p className="text-center text-[#7B8776]">Data tidak ditemukan.</p>;

    switch (id) {
      case "stage":
        return (
          <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-white border border-[#E8E9E5] shadow-sm text-center">
              <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto mb-6 text-[#4F5E52]">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-4">{story.stage.label}</h2>
              <p className="text-[#7B8776] leading-relaxed italic">{story.stage.description}</p>
            </div>
            
            {/* Theme Evolution */}
            {learning?.growthNarrative?.growthNarrative && (
              <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm">
                <p className="text-xs font-bold text-[#4F5E52] uppercase tracking-widest mb-4">Evolusi Tema Dirimu</p>
                <div className="text-sm text-[#4F5E52] font-semibold space-y-2 whitespace-pre-line text-center bg-[#F5F1E8]/30 py-4 rounded-2xl">
                  {learning.growthNarrative.growthNarrative}
                </div>
                {learning.growthNarrative.currentLesson && (
                  <p className="text-xs text-[#7B8776] mt-4 leading-relaxed text-center">Pelajaran saat ini: “{learning.growthNarrative.currentLesson}”</p>
                )}
                {learning.growthNarrative.nextInvitation && (
                  <p className="text-xs text-[#4F5E52] font-bold mt-2 text-center">Undangan berikutnya: {learning.growthNarrative.nextInvitation}</p>
                )}
              </div>
            )}

            {/* Coach Memory */}
            {learning?.coachMemory?.coachMemory && (
              <div className="bhumi-card p-6 bg-[#4F5E52] text-white border-none shadow-sm">
                <p className="text-xs font-bold text-white/70 uppercase tracking-widest mb-3">Catatan Pembelajaran Bhumi</p>
                <p className="text-sm leading-relaxed">{learning.coachMemory.coachMemory}</p>
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
              <p className="text-2xl font-serif text-[#4F5E52] leading-snug">{story.growthFocus}</p>
              <div className="mt-6 pt-6 border-t border-[#F5F1E8]">
                <p className="text-sm font-bold text-[#4F5E52] mb-2">Yang sedang tumbuh</p>
                <p className="text-sm text-[#7B8776]">{story.growingAreas[0]}</p>
              </div>
            </div>

            {learning?.weeklyLearning?.weeklyPattern && (
              <div className="pt-6 border-t border-[#F5F1E8]">
                <p className="text-xs font-bold text-[#9AA394] uppercase tracking-widest mb-2">Pola 7 Hari Terakhir</p>
                <p className="text-sm text-[#4F5E52] leading-relaxed">{learning.weeklyLearning.weeklyPattern}</p>
                {learning.weeklyLearning.coachObservation && (
                  <p className="text-xs text-[#7B8776] mt-2 italic">“{learning.weeklyLearning.coachObservation}”</p>
                )}
              </div>
            )}

            {learning?.monthlyLearning?.monthlyTheme && (
              <div className="pt-6 border-t border-[#F5F1E8]">
                <p className="text-xs font-bold text-[#9AA394] uppercase tracking-widest mb-2">Tema 30 Hari Terakhir</p>
                <p className="text-sm text-[#4F5E52] leading-relaxed">{learning.monthlyLearning.monthlyTheme}</p>
                {learning.monthlyLearning.monthlyNarrative && (
                  <p className="text-xs text-[#7B8776] mt-2 leading-relaxed">{learning.monthlyLearning.monthlyNarrative}</p>
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
                    <span className="font-bold text-[#4F5E52]">{area}</span>
                </div>
            ))}

            {learning?.practiceInsights?.practiceInsights && learning.practiceInsights.practiceInsights.length > 0 && (
              <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm space-y-4">
                <p className="text-xs font-bold text-[#4F5E52] uppercase tracking-widest">Efektivitas Praktik Harian</p>
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
                          <span className="font-bold text-[#4F5E52]">{practice}</span>
                          <span className="text-xs text-[#7B8776]">{levelLabel}</span>
                        </div>
                        <div className="w-full bg-[#F5F1E8] h-2 rounded-full overflow-hidden">
                          <div className={`${levelColor} h-full rounded-full`} style={{ width: `${helpfulScore}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      case "milestone":
        return (
          <div className="p-8 rounded-[2.5rem] bg-[#4F5E52] text-white shadow-xl text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/20">
                <Flag size={36} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/60 mb-3">Target Berikutnya</p>
            <h2 className="text-2xl font-serif mb-6">{story.nextMilestone}</h2>
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <p className="text-sm text-white/80 leading-relaxed">
                    Teruslah melangkah. Setiap hari yang kamu lalui dengan kesadaran membawamu lebih dekat pada pencapaian ini.
                </p>
            </div>
          </div>
        );
      case "history":
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-serif text-[#4F5E52] px-2 mb-4">Riwayat Aktivitas</h2>
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
                      {state.moodLevel ? `Mood ${state.moodLevel}` : "N/A"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
      default:
        return <p className="text-center text-[#7B8776]">Bagian ini sedang disiapkan.</p>;
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 text-[#7B8776] text-sm font-bold uppercase tracking-widest mb-8 hover:text-[#4F5E52] transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Journey
          </Link>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {renderContent()}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
