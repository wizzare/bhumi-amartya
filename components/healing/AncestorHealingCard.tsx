import React from "react";

interface AncestorHealingCardProps {
  invitation: string;
  lineage: string;
  practice: string;
}

export function AncestorHealingCard({
  invitation,
  lineage,
  practice,
}: AncestorHealingCardProps) {
  return (
    <section className="rounded-[32px] bg-[#F7F3EE] p-7 shadow-soft border border-[#E8E9E5]">
      <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Kepedulian leluhur</p>
      <h2 className="text-2xl font-semibold text-[#3E4A43]">Garis keturunan yang menopangmu</h2>
      <p className="mt-4 text-[#5F6B60] leading-relaxed">{invitation}</p>
      <div className="mt-6 rounded-[24px] bg-white p-5 border border-[#E8E9E5]">
        <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Catatan garis keturunan</p>
        <p className="text-[#4F5E52] leading-relaxed">{lineage}</p>
      </div>
      <p className="mt-5 text-[#6B7B6C] leading-relaxed">{practice}</p>
    </section>
  );
}
