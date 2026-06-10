"use client";

import { useState } from "react";
import { DailyGuidance, DailyGuidancePractice } from "@/lib/dailyGuidance/types";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { trackEvent } from "@/lib/analytics/usageAnalytics";

interface DailyGuidanceCardProps {
  guidance: DailyGuidance;
  language: "id" | "en";
  t: any; // Translation object
}

export function DailyGuidanceCard({ guidance, language, t }: DailyGuidanceCardProps) {
  const [practices, setPractices] = useState<DailyGuidancePractice[]>(guidance.dailyPractices);
  const [updating, setUpdating] = useState(false);

  const togglePractice = async (id: string) => {
    const previousPractice = practices.find((practice) => practice.id === id);
    const updatedPractices = practices.map((p) =>
      p.id === id ? { ...p, completed: !p.completed } : p
    );
    setPractices(updatedPractices);
    setUpdating(true);

    try {
      await dailyGuidanceRepository.updateDailyPracticeProgress(
        guidance.uid,
        guidance.date,
        updatedPractices
      );
      if (previousPractice && !previousPractice.completed) {
        trackEvent("practice_completed", guidance.uid);
      }
    } catch (error) {
      console.error("Failed to update practice progress:", error);
      // Revert on error if needed, or show error message
    } finally {
      setUpdating(false);
    }
  };

  const dg = t.dashboard.dailyGuidance;

  return (
    <div className="mt-8 overflow-hidden rounded-[32px] border border-[#E8E9E5] bg-white shadow-sm">
      <div className="bg-[#4F5E52] px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{dg.title}</h2>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
            {guidance.source === "ai" ? dg.sourceAi : dg.sourceFallback}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Main Insight */}
        <section className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.mainInsight}</p>
          <p className="mt-2 text-[#4F5E52] leading-relaxed whitespace-pre-wrap">{guidance.aiInsight}</p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Astrology */}
          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.astrology}</p>
            <p className="mt-2 text-sm text-[#4F5E52]">{guidance.astrologyToday}</p>
          </section>

          {/* Emotional/Spiritual Focus */}
          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.emotionalFocus}</p>
                <p className="mt-1 text-sm font-medium text-[#4F5E52]">{guidance.emotionalFocus}</p>
              </div>
              <div className="border-l border-[#E8E9E5] pl-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.spiritualFocus}</p>
                <p className="mt-1 text-sm font-medium text-[#4F5E52]">{guidance.spiritualFocus}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Journal & Meditation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
           <section>
             <p className="text-[11px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.journalPrompt}</p>
             <div className="mt-2 rounded-2xl border border-[#DDE7DB] bg-[#F4FBF1] p-4 italic text-[#2D5A3C] text-sm">
               "{guidance.journalPrompt}"
             </div>
           </section>
           <section>
             <p className="text-[11px] font-bold uppercase tracking-widest text-[#7B8776]">{dg.meditationSuggestion}</p>
             <div className="mt-2 rounded-2xl border border-[#E8E9E5] bg-white p-4 text-[#4F5E52] text-sm">
               {guidance.meditationSuggestion}
             </div>
           </section>
        </div>

        {guidance.audioHealingSuggestion && (
          <section className="mb-8 rounded-2xl border border-[#EFE4D2] bg-[#FFF9ED] p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#9C7A38]">
              {language === "id" ? "Saran Audio Healing" : "Audio Healing Suggestion"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[#6F5A2A]">{guidance.audioHealingSuggestion}</p>
          </section>
        )}

        {/* Daily Practices */}
        <section className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#7B8776] mb-3">{dg.practices}</p>
          <div className="space-y-3">
            {practices.map((practice) => (
              <div
                key={practice.id}
                onClick={() => !updating && togglePractice(practice.id)}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                  practice.completed
                    ? "border-[#DDE7DB] bg-[#F4FBF1] opacity-75"
                    : "border-[#E8E9E5] bg-white hover:border-[#4F5E52]"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    practice.completed
                      ? "border-[#2D5A3C] bg-[#2D5A3C] text-white"
                      : "border-[#7B8776]"
                  }`}
                >
                  {practice.completed && (
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${practice.completed ? "text-[#2D5A3C] line-through" : "text-[#4F5E52]"}`}>
                    {practice.title}
                  </p>
                  <p className={`mt-0.5 text-xs ${practice.completed ? "text-[#6C7A6F]" : "text-[#7B8776]"}`}>
                    {practice.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Grounded Action */}
        <section className="rounded-2xl bg-[#4F5E52] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{dg.groundedAction}</p>
          <p className="mt-2 font-medium leading-snug">{guidance.groundedAction}</p>
        </section>
      </div>
    </div>
  );
}
