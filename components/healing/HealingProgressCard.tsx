import React from "react";
import type { HealingProgressSummary } from "@/lib/data/types";

interface HealingProgressCardProps {
  summary: HealingProgressSummary;
  completedActions: number;
  onCompletePractice: () => void;
}

export function HealingProgressCard({ summary, completedActions, onCompletePractice }: HealingProgressCardProps) {
  return (
    <section className="rounded-[32px] bg-[#F3F2EE] p-7 shadow-soft border border-[#E8E9E5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Perkembangan</p>
          <h2 className="text-2xl font-semibold text-[#3B4A41]">Langkah lembutmu ke depan</h2>
        </div>
        <div className="rounded-full bg-[#EDE8DC] px-4 py-2 text-sm text-[#4F5E52] font-semibold">
          {completedActions} praktik selesai
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Current phase</p>
          <p className="text-[#4F5E52] font-medium">{summary.currentPhase}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Next session energy</p>
          <p className="text-[#4F5E52] font-medium">{summary.nextIntensity}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-[#FEFAF2] p-5 border border-[#E8E9E5]">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Yang paling penting</p>
        <p className="text-[#4F5E52] leading-relaxed">{summary.supportiveMessage}</p>
      </div>

      <button
        type="button"
        onClick={onCompletePractice}
        className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-[#4F5E52] px-6 py-3 text-white font-medium transition hover:bg-[#37463D]"
      >
        Tandai langkah penyembuhan berikut selesai
      </button>
    </section>
  );
}
