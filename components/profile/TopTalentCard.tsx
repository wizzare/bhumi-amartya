"use client";

import React from "react";
import { Brain, Star, Zap, Search } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";

interface TopTalentCardProps {
  style: HumanDesignStyle;
}

export function TopTalentCard({ style }: TopTalentCardProps) {
  return (
    <InsightCard
      icon={Brain}
      iconColor="text-purple-600"
      bgColor="bg-purple-50"
      title="Top Talent DNA"
      summary={`Gaya belajarmu: ${style.learning}`}
    >
      <section className="space-y-6">
        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-3">
          <div className="flex items-center gap-2 text-purple-500">
            <Star size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Gaya Belajar & Kognisi</p>
          </div>
          <p className="text-sm text-[#4F5E52] leading-relaxed font-medium">
            {style.learning}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-3">
          <div className="flex items-center gap-2 text-indigo-500">
            <Zap size={16} />
            <p className="text-[10px] font-bold uppercase tracking-wider">Produktivitas Alami</p>
          </div>
          <p className="text-sm text-[#4F5E52] leading-relaxed font-medium">
            {style.productivity}
          </p>
        </div>

        <div className="p-5 rounded-[2rem] bg-indigo-50/50 border border-indigo-100/50">
          <div className="flex items-center gap-2 text-[#4F5E52] mb-2 opacity-70">
            <Search size={14} />
            <p className="text-[9px] font-bold uppercase tracking-widest">Kreativitas</p>
          </div>
          <p className="text-xs italic text-[#4F5E52]">
            {style.creativity}
          </p>
        </div>
      </section>
    </InsightCard>
  );
}
