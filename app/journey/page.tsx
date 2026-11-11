"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { ProfileShareCardSection } from "@/components/profile/ProfileShareCardSection";
import { useAuth } from "@/context/AuthContext";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import {
  getCompletionSummary,
  mergeDailyStateWithJourneyRecord,
  mergeDailyStatesWithJourneyRecords,
  CompletionSummary,
} from "@/lib/engines/completionEngine";
import { journeyStoryEngine, GrowthStory } from "@/lib/engines/journeyStoryEngine";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getDictionaryKey } from "@/lib/locale/normalizeLocale";
import type { JourneyDailyMemory, JourneyUnifiedEvent } from "@/lib/types/journeyDailyRecord";
import { StageCard, FocusCard } from "@/components/journey/GrowthStoryCard";
import {
  ChevronRight,
  Flag,
  Heart,
  History,
  MessageSquare,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { MoanaRuntimeDiagnosticsPanel } from "@/components/debug/MoanaRuntimeDiagnosticsPanel";
import { appendMoanaRuntimeDiagnostic, toDiagnosticError } from "@/lib/innerwork/moanaRuntimeDiagnostics";

function JourneyPageContent() {
  const auth = useAuth();
  const isEn = false;
  const [todaySummary, setTodaySummary] = useState<CompletionSummary | null>(null);
  const [story, setStory] = useState<GrowthStory | null>(null);
  const [memory, setMemory] = useState<JourneyDailyMemory | null>(null);
  const [recentEvents, setRecentEvents] = useState<JourneyUnifiedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [readError, setReadError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("open_journey", auth?.user?.uid);
  }, [auth?.user?.uid]);

  useEffect(() => {
    const loadJourney = async () => {
      const auditUser = process.env.NODE_ENV === "development"
        ? window.localStorage.getItem("bhumi_audit_user")
        : null;
      if (!auth?.user?.uid && !auditUser) return;

      try {
        setReadError(null);
        const uid = auth?.user?.uid || `${auditUser}_uid`;
        const timezone = auth?.userProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        let profile = auth?.userProfile;
        let blueprintData = await storageProvider.getUserBlueprint().catch(() => null);
        if (auditUser) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          profile = getMockProfile(auditUser) as any;
          blueprintData = getMockBlueprint(auditUser) as any;
        }

        const states = await journeyRepository.getRecentDailyStates(uid).catch(() => []);
        const today = getLocalDateKey(new Date(), timezone);
        const todayState = states.find((state) => state.date === today) || null;
        const todayRecord = await journeyRepository.getDailyRecord(uid, today).catch((error) => {
          appendMoanaRuntimeDiagnostic("journey_today_record_read_failure", {
            userId: uid,
            dateKey: today,
            path: `journeyDailyRecords/${uid}/entries/${today}`,
            error: toDiagnosticError(error),
          });
          return null;
        });

        const mem = await journeyRepository.getDailyMemory(uid).catch(() => null);
        setMemory(mem);

        const hydratedStates = mergeDailyStatesWithJourneyRecords(states, mem?.last30Days || (todayRecord ? [todayRecord] : []));
        const hydratedTodayState = mergeDailyStateWithJourneyRecord(todayState, todayRecord);
        setTodaySummary(getCompletionSummary(hydratedTodayState));

        let synthesis = null;
        if (blueprintData) {
          synthesis = buildUnifiedBlueprintSynthesis({
            language: getDictionaryKey(profile?.language || "id") === "en" ? "en" : "id",
            profile: profile as unknown as Record<string, unknown>,
            blueprint: blueprintData as unknown as Record<string, unknown>,
          });
        }

        const generatedStory = journeyStoryEngine.generateStory(hydratedStates, synthesis);
        setStory(generatedStory);

        const events = await journeyRepository.getRecentUnifiedEvents(uid, 5).catch(() => []);
        setRecentEvents(events);
      } catch (error) {
        console.error("Failed to load journey:", error);
        setReadError(error instanceof Error ? error.message : (isEn ? "Failed to load Journey." : "Gagal memuat Journey."));
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) loadJourney();
  }, [auth]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <p className="text-[#4F5E52] animate-pulse">
          {isEn ? "Bhumi is preparing your journey history..." : "Bhumi sedang menyiapkan riwayat perjalananmu..."}
        </p>
      </main>
    );
  }

  const menuItems = [
    { id: "stage", name: isEn ? "Growth Stage" : "Tahap Pertumbuhan", icon: <TrendingUp size={22} /> },
    { id: "message", name: isEn ? "Companion Message" : "Pesan Pendamping", icon: <MessageSquare size={22} /> },
    { id: "focus", name: isEn ? "Current Focus" : "Fokus Saat Ini", icon: <Target size={22} /> },
    { id: "attention", name: isEn ? "What Needs Attention" : "Yang Meminta Perhatian", icon: <Heart size={22} /> },
    { id: "milestone", name: isEn ? "Next Milestone" : "Milestone Berikutnya", icon: <Flag size={22} /> },
    { id: "history", name: isEn ? "Activity History" : "Riwayat Aktivitas", icon: <History size={22} /> },
  ];

  return (
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <div className="mx-auto max-w-lg space-y-6">
            <BhumiPageHeader />
            <header className="text-center">
              <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">{isEn ? "Your Journey" : "Perjalananmu"}</h1>
              <p className="text-[#7B8776] text-sm">
                {isEn ? "Honoring every small step and your growth." : "Menyimak setiap langkah kecil dan pertumbuhanmu."}
              </p>
            </header>

            {readError && process.env.NODE_ENV !== "production" && (
              <section className="bhumi-card p-4 bg-white border border-amber-100 shadow-sm">
                <p className="text-xs font-semibold text-amber-800 break-words">{readError}</p>
              </section>
            )}

            {/* 1. Stage Card */}
            {story?.stage && (
              <StageCard label={story.stage.label} description={story.stage.description} />
            )}

            {/* 2. Focus Card */}
            {story?.growthFocus && (
              <FocusCard focus={story.growthFocus} />
            )}

            {/* 3. Companion Message Teaser */}
            {story?.companionMessage && (
              <Link href="/journey/message" className="block group">
                <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm hover:border-[#9BB89A] transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#7B8776]">
                      <Sparkles size={16} className="text-[#9BB89A]" />
                      <span>{isEn ? "Companion Message" : "Pesan Pendamping"}</span>
                    </div>
                    <ChevronRight size={16} className="text-[#9AA394] group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm font-serif italic text-[#4F5E52] leading-relaxed line-clamp-2">
                    “{story.companionMessage}”
                  </p>
                  <p className="text-xs text-[#9BB89A] font-medium pt-1">
                    {isEn ? "Read full reflection →" : "Baca pesan lengkap →"}
                  </p>
                </div>
              </Link>
            )}

            {/* 4. Personal Reflection & Learning Summary */}
            {(memory?.growthNarrative?.currentLesson || memory?.coachMemory?.coachMemory) && (
              <div className="bhumi-card p-6 bg-[#F5F1E8] border border-[#DDE7DB] shadow-sm space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#4F5E52]/70">
                  {isEn ? "Reflection Insight" : "Pelajaran Refleksi Terkini"}
                </p>
                {memory.growthNarrative?.currentLesson ? (
                  <p className="text-sm font-medium text-[#4F5E52] leading-relaxed">
                    “{memory.growthNarrative.currentLesson}”
                  </p>
                ) : (
                  <p className="text-sm font-medium text-[#4F5E52] leading-relaxed">
                    {memory.coachMemory?.coachMemory}
                  </p>
                )}
              </div>
            )}

            {/* 5. Today's Practice & Habit Overview */}
            {todaySummary && (
              <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#4F5E52]">
                    {isEn ? "Today's Practices & Rhythm" : "Praktik & Ritme Hari Ini"}
                  </h3>
                  <span className="text-xs text-[#7B8776] bg-[#F5F1E8] px-3 py-1 rounded-full font-medium">
                    {todaySummary.count} / {todaySummary.total} {isEn ? "completed" : "selesai"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {todaySummary.items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        item.completed
                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                          : "bg-[#FCFAF5] border-[#E8E9E5] text-[#7B8776]"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.completed ? "bg-emerald-600" : "bg-[#DDE7DB]"
                        }`}
                      />
                      <span className="font-medium truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
                {todaySummary.count === 0 && (
                  <p className="text-xs text-[#7B8776] italic text-center pt-1">
                    {isEn
                      ? "No practices recorded yet today. Take a small step in Wellness or Daily Reflection."
                      : "Belum ada praktik yang tercatat hari ini. Ambil satu langkah kecil di Wellness atau Refleksi Harian."}
                  </p>
                )}
              </div>
            )}

            {/* 6. Living History Preview */}
            {recentEvents.length > 0 && (
              <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#4F5E52]">
                    {isEn ? "Recent Living History" : "Jejak Praktik Terbaru"}
                  </h3>
                  <Link
                    href="/journey/history"
                    className="text-xs font-semibold text-[#9BB89A] hover:underline"
                  >
                    {isEn ? "View all →" : "Lihat semua →"}
                  </Link>
                </div>
                <div className="space-y-2">
                  {recentEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-xl bg-[#FCFAF5] border border-[#F0EFEA] flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-[#4F5E52] truncate">{event.title}</p>
                        {event.summary && (
                          <p className="text-[11px] text-[#7B8776] truncate">{event.summary}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9AA394] shrink-0 font-medium">{event.dateKey}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Deep Detail Navigation Menu */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B8776] px-2">
                {isEn ? "Explore Journey Details" : "Eksplorasi Detail Perjalanan"}
              </p>
              <div className="grid gap-2.5">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/journey/${item.id}`}
                    className="bhumi-card bg-white p-4 flex items-center justify-between hover:bg-[#F5F1E8] transition-colors border border-[#E8E9E5] shadow-sm group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="text-[#4F5E52] group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-bold text-[#4F5E52] text-sm">{item.name}</span>
                    </div>
                    <ChevronRight size={18} className="text-[#9AA394] group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            <ProfileShareCardSection
              title={isEn ? "Share your journey on Bhumi Amartya" : "Bagikan perjalananmu di Bhumi Amartya"}
              story={story}
            />
            {process.env.NODE_ENV === "development" && (
              <MoanaRuntimeDiagnosticsPanel label="Journey main page readback" />
            )}
          </div>
        </main>
  );
}


export default function JourneyPage() {
  return (
    <ProtectedRoute>
      <AccessGuard feature="journey">
        <JourneyPageContent />
      </AccessGuard>
    </ProtectedRoute>
  );
}
