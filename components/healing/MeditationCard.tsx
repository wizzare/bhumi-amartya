import React from "react";
import type { MeditationRecommendation } from "@/lib/data/types";

interface MeditationCardProps {
  plan: MeditationRecommendation;
  onStart?: () => void;
  isCompleted?: boolean;
}

export function MeditationCard({ plan, onStart, isCompleted }: MeditationCardProps) {
  return (
    <section className="rounded-[32px] bg-white p-7 shadow-soft border border-[#E8E9E5]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Meditasi</p>
          <h2 className="text-2xl font-semibold text-[#33413A]">{plan.title}</h2>
        </div>
        <div className="rounded-3xl bg-[#F7F4ED] px-4 py-2 text-sm text-[#4F5E52] font-medium">
          {plan.duration} menit
        </div>
      </div>
      <p className="mt-5 text-[#5F6B60] leading-relaxed">{plan.description}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[24px] bg-[#FCFAF5] p-4 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">Fokus</p>
          <p className="mt-2 text-[#4F5E52] font-medium">{plan.focusArea}</p>
        </div>
        <div className="rounded-[24px] bg-[#FCFAF5] p-4 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">Teknik</p>
          <p className="mt-2 text-[#4F5E52] font-medium">{plan.technique}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[#6B7B6C] text-sm leading-relaxed">{plan.energyEffect}</p>
        <button
          type="button"
          onClick={onStart}
          disabled={!onStart}
          className="inline-flex items-center justify-center rounded-3xl bg-[#4F5E52] px-6 py-3 text-white font-medium transition hover:bg-[#37463D] disabled:opacity-60"
        >
          {isCompleted ? "Selesai" : "Mulai meditasi"}
        </button>
      </div>
    </section>
  );
}
