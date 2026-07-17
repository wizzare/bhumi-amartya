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
import { getCompletionSummary, mergeDailyStateWithJourneyRecord, CompletionSummary } from "@/lib/engines/completionEngine";
import { ChevronRight, Flag, Heart, History, Target, TrendingUp } from "lucide-react";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { MoanaRuntimeDiagnosticsPanel } from "@/components/debug/MoanaRuntimeDiagnosticsPanel";
import { appendMoanaRuntimeDiagnostic, toDiagnosticError } from "@/lib/innerwork/moanaRuntimeDiagnostics";
import { normalizeJourneyRecord } from "@/lib/services/journeyReadAdapter";

export default function JourneyPage() {
  const auth = useAuth();
  const [todaySummary, setTodaySummary] = useState<CompletionSummary | null>(null);
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
        const states = await journeyRepository.getRecentDailyStates(uid);
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
        const hydratedState = mergeDailyStateWithJourneyRecord(todayState, todayRecord);
        setTodaySummary(getCompletionSummary(hydratedState));
        if (todayRecord) normalizeJourneyRecord(todayRecord);
      } catch (error) {
        console.error("Failed to load journey:", error);
        setReadError(error instanceof Error ? error.message : "Gagal memuat Journey.");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) loadJourney();
  }, [auth]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <p className="text-[#4F5E52] animate-pulse">Bhumi sedang menyiapkan riwayat perjalananmu...</p>
      </main>
    );
  }

  const menuItems = [
    { id: "stage", name: "Tahap Pertumbuhan", icon: <TrendingUp size={24} /> },
    { id: "focus", name: "Fokus Saat Ini", icon: <Target size={24} /> },
    { id: "attention", name: "Yang Meminta Perhatian", icon: <Heart size={24} /> },
    { id: "milestone", name: "Milestone Berikutnya", icon: <Flag size={24} /> },
    { id: "history", name: "Riwayat Aktivitas", icon: <History size={24} /> },
  ];

  return (
    <ProtectedRoute>
      <AccessGuard feature="journey">
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <div className="mx-auto max-w-lg space-y-8">
            <BhumiPageHeader />
            <header className="text-center">
              <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Perjalananmu</h1>
              <p className="text-[#7B8776] text-sm">Menyimak setiap langkah kecil dan pertumbuhanmu.</p>
            </header>

            {readError && process.env.NODE_ENV !== "production" && (
              <section className="bhumi-card p-4 bg-white border border-amber-100 shadow-sm">
                <p className="text-xs font-semibold text-amber-800 break-words">{readError}</p>
              </section>
            )}

            <div className="grid gap-3">
              {menuItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/journey/${item.id}`}
                  className="bhumi-card bg-white p-5 flex items-center justify-between hover:bg-[#F5F1E8] transition-colors border-none shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-[#4F5E52] group-hover:scale-110 transition-transform">{item.icon}</div>
                    <span className="font-bold text-[#4F5E52]">{item.name}</span>
                  </div>
                  <ChevronRight size={20} className="text-[#9AA394] group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>

            {todaySummary && todaySummary.count > 0 && (
              <p className="text-center text-xs text-[#9AA394]">Aktivitas hari ini tersimpan di riwayatmu.</p>
            )}
            <ProfileShareCardSection title="Bagikan perjalananmu di Bhumi Amartya" />
            {process.env.NODE_ENV === "development" && <MoanaRuntimeDiagnosticsPanel label="Journey main page readback" />}
          </div>
        </main>
      </AccessGuard>
    </ProtectedRoute>
  );
}
