import React from "react";

interface MudraGuideCardProps {
  mudraName: string;
  intention: string;
  practice: string;
  benefit: string;
}

export function MudraGuideCard({ mudraName, intention, practice, benefit }: MudraGuideCardProps) {
  return (
    <section className="rounded-[32px] bg-[#F5F5F2] p-7 shadow-soft border border-[#E8E9E5]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Panduan mudra</p>
          <h2 className="text-2xl font-semibold text-[#4A433C]">{mudraName}</h2>
        </div>
        <div className="rounded-full bg-[#F7F4ED] px-4 py-2 text-sm font-semibold text-[#4F5E52]">
          {intention}
        </div>
      </div>
      <p className="mt-5 text-[#5F6B60] leading-relaxed">{practice}</p>
      <div className="mt-5 rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Manfaat</p>
        <p className="text-[#4F5E52] leading-relaxed">{benefit}</p>
      </div>
    </section>
  );
}
