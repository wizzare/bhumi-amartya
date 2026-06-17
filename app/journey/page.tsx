"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { useAuth } from "@/context/AuthContext";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { getCompletionSummary, CompletionSummary } from "@/lib/engines/completionEngine";
import {
  TrendingUp,
  Target,
  Heart,
  Flag,
  History,
  ChevronRight,
  Calendar
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";

export default function JourneyPage() {
  const auth = useAuth();

  useEffect(() => {
    trackEvent("open_journey", auth?.user?.uid);
  }, [auth?.user?.uid]);

  const [todaySummary, setTodaySummary] = useState<CompletionSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJourney = async () => {
      if (!auth?.user?.uid) return;

      try {
        const uid = auth.user.uid;
        const profile = auth.userProfile;
        const timezone = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

        const states = await journeyRepository.getRecentDailyStates(uid);

        const today = getLocalDateKey(new Date(), timezone);
        const todayState = states.find(s => s.date === today) || null;
        setTodaySummary(getCompletionSummary(todayState));

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
        <p className="text-[#4F5E52] animate-pulse">Membuka riwayat perjalanan...</p>
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
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg space-y-8">
          <BhumiPageHeader />
          <header className="text-center">
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Journey</h1>
            <p className="text-[#7B8776] text-sm">Kisah pertumbuhan dan konsistensi dirimu.</p>
          </header>

          {/* Today's Quick Progress */}
          <section className="bhumi-card p-6 bg-white border-none shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#F5F1E8] text-[#4F5E52]">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#9AA394] uppercase tracking-widest">Progres Hari Ini</p>
                  <p className="font-bold text-[#4F5E52] text-sm">{todaySummary?.count || 0}/{todaySummary?.total || 4} Aktivitas Selesai</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#4F5E52] bg-[#F5F1E8] px-3 py-1 rounded-full">
                {Math.round((todaySummary?.count || 0) / (todaySummary?.total || 4) * 100)}%
              </span>
            </div>
          </section>

          {/* Menu Cards */}
          <div className="grid gap-3">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={`/journey/${item.id}`}
                className="bhumi-card bg-white p-5 flex items-center justify-between hover:bg-[#F5F1E8] transition-colors border-none shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[#4F5E52]">
                    {item.icon}
                  </div>
                  <span className="font-bold text-[#4F5E52]">{item.name}</span>
                </div>
                <ChevronRight size={20} className="text-[#9AA394]" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
