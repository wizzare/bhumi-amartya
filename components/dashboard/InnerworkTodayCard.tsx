"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { DailyGuidance } from "@/lib/dailyGuidance/types";
import { cleanMarkdown } from "@/lib/utils/markdown";
import { getCanonicalHumanDesignType } from "@/lib/humandesign/hdAudit";

interface InnerworkTodayCardProps {
  dailyGuidance: DailyGuidance | null;
  language: "id" | "en";
  labels: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
}

export function InnerworkTodayCard({ dailyGuidance, language, labels }: InnerworkTodayCardProps) {
  const hdType = getCanonicalHumanDesignType((dailyGuidance?.blueprintSnapshot as any)?.humanDesign);

  const ctaLabels: Record<string, string> = {
    "Manifesting Generator": language === "id" ? "Aktivasi Energi Hari Ini" : "Activate Energy Today",
    "Generator": language === "id" ? "Gerakkan Energi Hari Ini" : "Move Energy Today",
    "Projector": language === "id" ? "Recovery Energi Hari Ini" : "Recover Energy Today",
    "Reflector": language === "id" ? "Sinkronisasi Energi Hari Ini" : "Sync Energy Today",
    "Manifestor": language === "id" ? "Salurkan Energi Hari Ini" : "Channel Energy Today",
  };

  const ctaText = (hdType && ctaLabels[hdType]) || labels.viewAll;

  const narrative = cleanMarkdown(dailyGuidance?.innerworkNarrative) ||
    (language === "id"
      ? "Waktu yang baik untuk memberi ruang bagi dirimu mendengar kembali suara batinmu."
      : "A good time to give yourself space to hear your inner voice again.");

  return (
    <div className="mt-8 bhumi-card p-8 bg-white border-none shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
        <Sparkles size={100} />
      </div>

      <div className="relative z-10">
        <header className="mb-6">
          <h3 className="text-[#4F6658] font-bold text-xl italic">{labels.title}</h3>
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{labels.subtitle}</p>
        </header>

        <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic mb-8 opacity-90">
          "{narrative}"
        </p>

        {dailyGuidance?.innerworkRecommendations && (
          <div className="mb-8 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100/50">
              <span className="text-lg">🏃</span>
              <div>
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider">Workout: {dailyGuidance.innerworkRecommendations.workout.title}</p>
                <p className="text-[11px] text-orange-700 mt-0.5 leading-relaxed">{dailyGuidance.innerworkRecommendations.workout.reason}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100/50">
              <span className="text-lg">🧘</span>
              <div>
                <p className="text-xs font-bold text-green-800 uppercase tracking-wider">Yoga: {dailyGuidance.innerworkRecommendations.yoga.title}</p>
                <p className="text-[11px] text-green-700 mt-0.5 leading-relaxed">{dailyGuidance.innerworkRecommendations.yoga.reason}</p>
              </div>
            </div>
          </div>
        )}

        <Link
          href="/innerwork"
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#4F5E52] text-white text-sm font-bold hover:bg-[#3D4A3F] transition-all shadow-md active:scale-[0.98]"
        >
          {ctaText}
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
