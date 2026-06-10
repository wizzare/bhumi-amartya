import React from "react";

interface InnerChildHealingCardProps {
  prompt: string;
  invitation: string;
  reassurance: string;
}

export function InnerChildHealingCard({ prompt, invitation, reassurance }: InnerChildHealingCardProps) {
  return (
    <section className="rounded-[32px] bg-[#F6F5F1] p-7 shadow-soft border border-[#E8E9E5]">
      <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Perhatian anak batin</p>
      <h2 className="text-2xl font-semibold text-[#3D4A41]">Sebuah momen lembut untuk dirimu yang lebih muda</h2>
      <p className="mt-4 text-[#5F6B60] leading-relaxed">{prompt}</p>
      <div className="mt-6 rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Undangan</p>
        <p className="text-[#4F5E52] leading-relaxed">{invitation}</p>
      </div>
      <p className="mt-5 text-[#6B7B6C] leading-relaxed">{reassurance}</p>
    </section>
  );
}
