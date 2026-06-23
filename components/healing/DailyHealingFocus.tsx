import React from "react";

interface DailyHealingFocusProps {
  theme: string;
  focusArea: string;
  anchorMessage: string;
  invitation: string;
}

export function DailyHealingFocus({
  theme,
  focusArea,
  anchorMessage,
  invitation,
}: DailyHealingFocusProps) {
  return (
    <section className="rounded-[32px] bg-[#F4F2EC] p-7 shadow-soft">
      <div className="flex flex-col gap-3">
        <p className="text-[#8B9488] uppercase text-xs tracking-[0.24em]">Tema penyembuhan</p>
        <h2 className="text-3xl font-semibold text-[#3E4A43] leading-snug">{theme}</h2>
        <p className="text-[#5F6B60] leading-relaxed">{anchorMessage}</p>
      </div>
      <div className="mt-6 rounded-[24px] border border-[#E8E9E5] bg-white p-5">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Fokus Kamu</p>
        <p className="text-[#4F5E52] font-medium text-lg">{focusArea}</p>
        <p className="mt-4 text-[#6B7B6C] leading-relaxed">{invitation}</p>
      </div>
    </section>
  );
}
