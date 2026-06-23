import React from "react";

interface ChakraFocusItem {
  chakra: string;
  status: string;
  guidance: string;
}

interface ChakraBalanceCardProps {
  chakraFocus: ChakraFocusItem[];
}

export function ChakraBalanceCard({ chakraFocus }: ChakraBalanceCardProps) {
  return (
    <section className="rounded-[32px] bg-[#F5F3EE] p-7 shadow-soft border border-[#E8E9E5]">
      <p className="text-[#7B8776] text-xs uppercase tracking-[0.24em] mb-2">Keseimbangan chakra</p>
      <h2 className="text-2xl font-semibold text-[#33413A]">Tempat energi kamu memanggil perhatian</h2>
      <div className="mt-6 space-y-4">
        {chakraFocus.map((item) => (
          <div key={item.chakra} className="rounded-[24px] border border-[#E8E9E5] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[#4F5E52] font-semibold">{item.chakra}</p>
                <p className="text-[#7B8776] text-sm mt-1">{item.status}</p>
              </div>
              <div className="rounded-full bg-[#F7F4ED] px-3 py-1 text-xs font-semibold text-[#4F5E52]">
                {item.status}
              </div>
            </div>
            <p className="mt-3 text-[#5F6B60] leading-relaxed">{item.guidance}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
