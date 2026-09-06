import React from "react";
import type { HealingProgressSummary } from "@/lib/data/types";
import { isEnlEdition } from "@/lib/config/edition";

interface HealingProgressCardProps {
  summary: HealingProgressSummary;
  completedActions: number;
  onCompletePractice: () => void;
}

export function HealingProgressCard({ summary, completedActions, onCompletePractice }: HealingProgressCardProps) {
  const isEn = isEnlEdition();

  return (
    <section className="rounded-[32px] bg-[#F3F2EE] p-7 shadow-soft border border-[#E8E9E5]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">{isEn ? "Progress" : "Perkembangan"}</p>
          <h2 className="text-2xl font-semibold text-[#3B4A41]">{isEn ? "Your gentle steps forward" : "Langkah lembutmu ke depan"}</h2>
        </div>
        <div className="rounded-full bg-[#EDE8DC] px-4 py-2 text-sm text-[#4F5E52] font-semibold">
          {completedActions} {isEn ? "practices completed" : "praktik selesai"}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">{isEn ? "Current phase" : "Fase saat ini"}</p>
          <p className="text-[#4F5E52] font-medium">{summary.currentPhase}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">{isEn ? "Next session energy" : "Energi sesi berikutnya"}</p>
          <p className="text-[#4F5E52] font-medium">{summary.nextIntensity}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] bg-[#FEFAF2] p-5 border border-[#E8E9E5]">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">{isEn ? "What matters most" : "Yang paling penting"}</p>
        <p className="text-[#4F5E52] leading-relaxed">{summary.supportiveMessage}</p>
      </div>

      <button
        type="button"
        onClick={onCompletePractice}
        className="mt-6 inline-flex w-full items-center justify-center rounded-3xl bg-[#4F5E52] px-6 py-3 text-white font-medium transition hover:bg-[#37463D]"
      >
        {isEn ? "Mark healing step complete" : "Tandai langkah penyembuhan berikut selesai"}
      </button>
    </section>
  );
}
