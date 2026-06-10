import React from "react";

interface ShadowHealingCardProps {
  pattern: string;
  integration: string;
  gift: string;
}

export function ShadowHealingCard({ pattern, integration, gift }: ShadowHealingCardProps) {
  return (
    <section className="rounded-[32px] bg-[#FFF8F0] p-7 shadow-soft border border-[#E8E9E5]">
      <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Pekerjaan bayangan</p>
      <h2 className="text-2xl font-semibold text-[#4A433C]">Bayangan lembutmu</h2>
      <div className="mt-5 space-y-4">
        <div className="rounded-[24px] bg-white p-5 shadow-inner">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">Polanya</p>
          <p className="mt-2 text-[#4F5E52] leading-relaxed">{pattern}</p>
        </div>
        <div className="rounded-[24px] bg-[#F7F4ED] p-5 border border-[#E8E9E5]">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">Undangan integrasi</p>
          <p className="mt-2 text-[#4F5E52] leading-relaxed">{integration}</p>
        </div>
        <div className="rounded-[24px] bg-white p-5 shadow-inner">
          <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em]">Hadiah tersembunyi</p>
          <p className="mt-2 text-[#4F5E52] leading-relaxed">{gift}</p>
        </div>
      </div>
    </section>
  );
}
