"use client";

import React, { useEffect, useState } from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { reflectionRepository, WeeklyReflection } from "@/lib/repositories/reflectionRepository";
import { reflectionEngine } from "@/lib/engines/reflectionEngine";
import { ReflectionCard } from "@/components/journey/ReflectionCard";
import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { getCompletionSummary, CompletionSummary } from "@/lib/engines/completionEngine";
import { CheckCircle2, Circle, Lock, Calendar, History, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics/usageAnalytics";

export default function JourneyPage() {
  const auth = useAuth();

  useEffect(() => {
    trackEvent("open_journey", auth?.user?.uid);
  }, [auth?.user?.uid]);

  const [history, setHistory] = useState<DailyState[]>([]);
  const [todaySummary, setTodaySummary] = useState<CompletionSummary | null>(null);
  const [weeklyReflection, setWeeklyReflection] = useState<WeeklyReflection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJourney = async () => {
      if (!auth?.user?.uid) return;

      try {
        const uid = auth.user.uid;
        const states = await journeyRepository.getRecentDailyStates(uid);
        setHistory(states);

        const today = new Date().toISOString().slice(0, 10);
        const todayState = states.find(s => s.date === today) || null;
        setTodaySummary(getCompletionSummary(todayState));

        // Weekly Reflection Logic
        if (states.length >= 3) { // Minimum 3 days of data to reflect
          const currentWeekId = `2026-W${Math.ceil(new Date().getDate() / 7)}`; // Mock week ID for Alpha
          let reflection = await reflectionRepository.getWeeklyReflection(uid, currentWeekId);

          if (!reflection) {
            reflection = reflectionEngine.generateWeeklySummary(uid, currentWeekId, states.slice(0, 7));
            await reflectionRepository.saveWeeklyReflection(reflection);
          }
          setWeeklyReflection(reflection);
        }
      } catch (error) {
        console.error("Failed to load journey:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) {
      loadJourney();
    }
  }, [auth]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <p className="text-[#4F5E52]">Membuka riwayat perjalanan...</p>
      </main>
    );
  }

  const isUnlocked = todaySummary?.isUnlocked || history.length > 1;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Journey</h1>
            <p className="text-[#7B8776]">Jejak pertumbuhan dan konsistensi dirimu.</p>
          </header>

          {/* Today's Progress Section */}
          <section className="bhumi-card p-6 mb-8 bg-gradient-to-br from-white to-[#F5F1E8]">
            <h2 className="text-lg font-semibold text-[#4F5E52] mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Progres Hari Ini
            </h2>

            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-2xl font-bold text-[#4F5E52]">{todaySummary?.count || 0}/6</p>
                <p className="text-sm text-[#7B8776]">{todaySummary?.label}</p>
              </div>
              <div className="h-16 w-16 rounded-full border-4 border-[#E8E9E5] flex items-center justify-center relative">
                 <div
                    className="absolute inset-0 rounded-full border-4 border-[#4F5E52] transition-all duration-1000"
                    style={{ clipPath: `inset(${100 - ((todaySummary?.count || 0) / 6 * 100)}% 0 0 0)` }}
                 />
                 <span className="text-xs font-bold text-[#4F5E52]">{Math.round((todaySummary?.count || 0) / 6 * 100)}%</span>
              </div>
            </div>

            <p className="text-xs text-[#7B8776] leading-relaxed">
              {todaySummary?.isUnlocked
                ? "✨ Journey harianmu sudah terbuka sepenuhnya."
                : "Selesaikan minimal 2 aktivitas Innerwork untuk membuka catatan Journey hari ini."}
            </p>
          </section>

          {/* Weekly Soul Summary */}
          {weeklyReflection && (
            <section className="mb-8">
              <ReflectionCard reflection={weeklyReflection} />
            </section>
          )}

          {/* Weekly Soul Summary Placeholder if not enough data */}
          {!weeklyReflection && (
            <section className="bhumi-card p-6 mb-8 border-dashed border-2 border-[#DDE7DB]">
              <h2 className="text-lg font-semibold text-[#9AA394] mb-2 flex items-center gap-2">
                <Sparkles size={20} />
                Weekly Soul Summary
              </h2>
              <p className="text-sm text-[#9AA394] italic">
                "Ringkasan perjalanan jiwamu selama seminggu terakhir sedang dipersiapkan oleh sistem. Teruslah berproses..."
              </p>
            </section>
          )}

          {/* Timeline History */}
          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-[#4F5E52] flex items-center gap-2 px-2">
              <History size={20} />
              Riwayat Aktivitas
            </h2>

            {!isUnlocked ? (
              <div className="bhumi-card p-10 text-center flex flex-col items-center">
                <Lock size={40} className="text-[#9AA394] mb-4" />
                <p className="text-[#7B8776] text-sm">
                  Riwayat perjalanan dikunci. <br/> Selesaikan 2 aktivitas hari ini untuk melihat kembali jejakmu.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((state) => (
                  <div key={state.date} className="bhumi-card p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[#4F5E52]">{state.date}</p>
                      <p className="text-xs text-[#7B8776] mt-1">
                        {state.moodLevel ? `Mood: ${state.moodLevel}/10` : "Mood tidak dicatat"}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {[
                        state.journalingDone,
                        state.meditationDone,
                        state.audioHealingDone,
                        state.workoutDone,
                        state.yogaDone,
                        state.herbalDone
                      ].map((done, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${done ? 'bg-[#4F5E52]' : 'bg-[#E8E9E5]'}`} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
}
