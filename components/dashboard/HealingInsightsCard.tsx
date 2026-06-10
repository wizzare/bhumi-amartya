"use client";

import type { HealingInsightResult } from "@/lib/healing/createHealingInsights";

type HealingInsightsCardProps = {
  insight: HealingInsightResult | null;
};

export function HealingInsightsCard({ insight }: HealingInsightsCardProps) {
  if (!insight) return null;

  return (
    <div className="mt-6 bhumi-card p-6">
      <p className="text-[#7B8776] text-sm">🌱 Fokus Innerwork Minggu Ini</p>

      <div className="mt-5 space-y-4">
        <section className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
            Dominant Theme
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#4F5E52]">
            {insight.weeklyFocus.theme}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
            {insight.weeklyFocus.whyDetected}
          </p>
        </section>

        <section className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-sm font-medium text-[#7B8776]">Recommended Journal Practice</p>
          <p className="mt-2 text-[#4F5E52] leading-7">{insight.recommendedJournal}</p>
        </section>

        <section className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-sm font-medium text-[#7B8776]">Recommended Meditation Practice</p>
          <p className="mt-2 text-[#4F5E52] leading-7">{insight.recommendedMeditation}</p>
        </section>

        <section className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-sm font-medium text-[#7B8776]">Recommended Audio Healing</p>
          <p className="mt-2 text-[#4F5E52] leading-7">{insight.recommendedAudioHealing}</p>
        </section>
      </div>
    </div>
  );
}
