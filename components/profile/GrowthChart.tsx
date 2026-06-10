"use client";

import React from "react";
import { GrowthProfile } from "@/lib/engines/growthEngine";

interface GrowthChartProps {
  growth: GrowthProfile;
}

export function GrowthChart({ growth }: GrowthChartProps) {
  const signalLabels = [
    { key: "awareness", label: "Kesadaran" },
    { key: "consistency", label: "Konsistensi" },
    { key: "depth", label: "Kedalaman" },
    { key: "balance", label: "Keseimbangan" },
    { key: "courage", label: "Keberanian" },
    { key: "acceptance", label: "Penerimaan" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Section 1: Tahap Pertumbuhan */}
      <section className="bhumi-card p-10 bg-white border-none shadow-sm text-center">
        <div className="text-6xl mb-4">{growth.milestoneIcon}</div>
        <p className="text-[#9AA394] text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Tahap Pertumbuhan</p>
        <h3 className="text-2xl font-serif font-bold text-[#4F6658]">{growth.currentMilestone}</h3>
      </section>

      {/* Section 2: Narasi Pertumbuhan */}
      <section className="bhumi-card p-8 bg-[#F5F1E8]/50 border-none">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4F6658] mb-4">Perjalanan Jiwamu</h4>
        <p className="text-base text-[#3C3C3C] leading-relaxed italic font-medium">
          "{growth.story}"
        </p>
      </section>

      {/* Section 3: Milestone */}
      <section className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100">
        <p className="text-[10px] text-indigo-700 font-bold uppercase tracking-widest text-center">
          Teruslah melangkah untuk membuka milestone berikutnya
        </p>
      </section>

      {/* Section 4: Sinyal Pertumbuhan Jiwa */}
      <section className="bhumi-card p-8 bg-white border-none shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#4F6658] mb-8">Sinyal Pertumbuhan</h4>
        <div className="space-y-6">
          {signalLabels.map((item) => (
            <div key={item.key}>
              <div className="flex justify-between text-xs mb-2">
                <span className="font-bold text-[#4F6658]">{item.label}</span>
                <span className="font-bold text-[#3C3C3C]">{(growth.signals as any)[item.key]}%</span>
              </div>
              <div className="h-2 w-full bg-[#E8E9E5] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4F5E52] rounded-full transition-all duration-1000"
                  style={{ width: `${(growth.signals as any)[item.key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
