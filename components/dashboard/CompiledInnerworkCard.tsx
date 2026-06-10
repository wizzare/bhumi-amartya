"use client";

import type { CompiledInnerworkInsight } from "@/lib/ai/compileUserInnerwork";

type CompiledInnerworkCardProps = {
  insight: CompiledInnerworkInsight | null;
};

export function CompiledInnerworkCard({ insight }: CompiledInnerworkCardProps) {
  return (
    <div className="mt-6 bhumi-card p-6">
      <p className="text-sm text-[#7B8776]">🌱 Fokus Innerwork Berikutnya</p>

      {!insight ? (
        <p className="mt-4 text-sm leading-relaxed text-[#7B8776]">
          Mulai Journal, Meditasi, atau Audio Healing agar Bhumi bisa membaca pola innerwork-mu.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
              Dominant Theme
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#4F5E52]">
              {insight.dominantTheme}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
              {insight.weeklyMessage}
            </p>
          </section>

          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-sm font-medium text-[#7B8776]">Next Journal Question</p>
            <p className="mt-2 text-[#4F5E52] leading-7">
              {insight.recommendedNextJournalQuestion}
            </p>
          </section>

          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-sm font-medium text-[#7B8776]">Meditation Focus</p>
            <p className="mt-2 text-[#4F5E52] leading-7">
              {insight.recommendedMeditationFocus}
            </p>
          </section>

          <section className="rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-sm font-medium text-[#7B8776]">Audio Healing Focus</p>
            <p className="mt-2 text-[#4F5E52] leading-7">
              {insight.recommendedAudioHealingFocus}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
