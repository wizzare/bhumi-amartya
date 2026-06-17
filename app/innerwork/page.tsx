"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Music, Sparkles, Dumbbell, Flower2, Utensils, Brain } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";

export default function InnerworkHubPage() {
  const { language } = useLanguage();
  const auth = useAuth();
  const t = translations[language].innerwork;

  const [recommendations, setRecommendations] = React.useState<DailyGuidance["innerworkRecommendations"] | null>(null);

  React.useEffect(() => {
    trackEvent("open_innerwork", auth?.user?.uid);

    const fetchRecs = async () => {
      if (!auth?.user?.uid) return;
      try {
        const profile = await storageProvider.getUserProfile();
        const nestedProfile = profile?.profile as { timezone?: string } | undefined;
        const timezone = profile?.timezone || nestedProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const today = getLocalDateKey(new Date(), timezone);
        const dg = await dailyGuidanceRepository.getDailyGuidance(auth.user.uid, today);
        if (dg?.innerworkRecommendations) {
          setRecommendations(dg.innerworkRecommendations);
        }
      } catch (err) {
        console.error("[INNERWORK_RECS_FETCH_ERROR]", err);
      }
    };

    if (auth?.authStateResolved) {
      fetchRecs();
    }
  }, [auth]);

  const menuItems = [
    {
      id: "journaling",
      icon: BookOpen,
      label: t.journaling,
      href: "/innerwork/journaling",
      color: "bg-blue-50 text-blue-600",
    },
    {
      id: "meditation",
      icon: Sparkles,
      label: t.meditation,
      href: "/innerwork/meditation",
      color: "bg-purple-50 text-purple-600",
    },
    {
      id: "audio",
      icon: Music,
      label: t.audio,
      href: "/innerwork/audio-healing",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      id: "manifestasi",
      icon: Sparkles,
      label: t.manifestasi,
      href: "/innerwork/manifestasi",
      color: "bg-orange-50 text-orange-500",
    },
    {
      id: "workout",
      icon: Dumbbell,
      label: t.workout,
      href: "/innerwork/workout",
      color: "bg-orange-50 text-orange-600",
    },
    {
      id: "yoga",
      icon: Flower2,
      label: t.yoga,
      href: "/innerwork/yoga",
      color: "bg-green-50 text-green-600",
    },
    {
      id: "herbal",
      icon: Utensils,
      label: t.herbal,
      href: "/innerwork/herbal",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <BhumiPageHeader className="mb-8" />
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">{t.title}</h1>
            <p className="text-[#7B8776]">{t.subtitle}</p>
          </header>

          {recommendations && (
            <section className="mb-12">
              <h2 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-4 ml-1">Rekomendasi Berdasarkan Kondisimu</h2>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/innerwork/journaling" className="bhumi-card p-4 bg-white border-2 border-blue-100 flex flex-col gap-3 transition-transform active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><BookOpen size={20} /></div>
                  <div><p className="text-[8px] font-bold text-blue-700 uppercase tracking-wider">Journaling Hari Ini</p><h3 className="mt-1 text-xs font-bold text-[#4F5E52]">{recommendations.journaling?.title}</h3><p className="mt-1 line-clamp-2 text-[9px] text-[#7B8776]">{recommendations.journaling?.reason}</p></div>
                </Link>
                <Link href="/innerwork/meditation" className="bhumi-card p-4 bg-white border-2 border-purple-100 flex flex-col gap-3 transition-transform active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><Brain size={20} /></div>
                  <div><p className="text-[8px] font-bold text-purple-700 uppercase tracking-wider">Meditasi Hari Ini</p><h3 className="mt-1 text-xs font-bold text-[#4F5E52]">{recommendations.meditation?.title}</h3><p className="mt-1 line-clamp-2 text-[9px] text-[#7B8776]">{recommendations.meditation?.reason}</p></div>
                </Link>
                <Link href="/innerwork/manifestasi" className="bhumi-card p-4 bg-white border-2 border-amber-100 flex flex-col gap-3 transition-transform active:scale-[0.98]">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Sparkles size={20} /></div>
                  <div><p className="text-[8px] font-bold text-amber-700 uppercase tracking-wider">Manifestasi Hari Ini</p><h3 className="mt-1 text-xs font-bold text-[#4F5E52]">{recommendations.manifestation?.title}</h3><p className="mt-1 line-clamp-2 text-[9px] text-[#7B8776]">{recommendations.manifestation?.reason}</p></div>
                </Link>
                <Link href="/innerwork/workout" className="bhumi-card p-5 bg-white border-2 border-orange-100 flex items-center gap-4 transition-transform active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Dumbbell size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-orange-700 uppercase tracking-wider mb-0.5">Recommended Workout</p>
                    <h3 className="text-sm font-bold text-[#4F5E52] truncate">{recommendations.workout.title}</h3>
                    <p className="text-[11px] text-orange-600/70 italic truncate mt-0.5">{recommendations.workout.reason}</p>
                  </div>
                </Link>

                <Link href="/innerwork/yoga" className="bhumi-card p-5 bg-white border-2 border-green-100 flex items-center gap-4 transition-transform active:scale-[0.98]">
                  <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <Flower2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">Recommended Yoga</p>
                    <h3 className="text-sm font-bold text-[#4F5E52] truncate">{recommendations.yoga.title}</h3>
                    <p className="text-[11px] text-green-600/70 italic truncate mt-0.5">{recommendations.yoga.reason}</p>
                  </div>
                </Link>

                  <Link href="/innerwork/audio-healing" className="bhumi-card p-4 bg-white border-2 border-indigo-100 flex flex-col gap-3 transition-transform active:scale-[0.98]">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Music size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5">Recommended Audio</p>
                      <h3 className="text-xs font-bold text-[#4F5E52] truncate">{recommendations.audioHealing.title}</h3>
                    </div>
                  </Link>

                  <Link href="/innerwork/herbal" className="bhumi-card p-4 bg-white border-2 border-emerald-100 flex flex-col gap-3 transition-transform active:scale-[0.98]">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <p className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Recommended Food</p>
                      <h3 className="text-xs font-bold text-[#4F5E52] truncate">{recommendations.healthyFood.title}</h3>
                    </div>
                  </Link>
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-4">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="bhumi-card p-6 flex flex-col items-center justify-center text-center transition-transform active:scale-95 hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon size={24} />
                </div>
                <span className="text-sm font-semibold text-[#4F5E52]">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
