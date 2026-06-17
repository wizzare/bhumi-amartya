"use client";

import React from "react";
import { Sparkles, Shield, Compass } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";

interface SpiritualArchetypeCardProps {
  style: HumanDesignStyle;
}

export function SpiritualArchetypeCard({ style }: SpiritualArchetypeCardProps) {
  return (
    <InsightCard
      icon={Sparkles}
      iconColor="text-amber-600"
      bgColor="bg-amber-50"
      title="Spiritual Archetype"
      summary={`Arketipe spiritualmu: ${style.spiritualArchetype}`}
    >
      <section className="space-y-6">
        <div className="flex flex-col items-center text-center p-8 bg-white rounded-[3rem] border border-[#E8E9E5]">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100">
            <Shield size={32} className="text-amber-600" />
          </div>
          <h4 className="text-2xl font-serif font-bold text-[#4F6658] mb-2">{style.spiritualArchetype}</h4>
          <p className="text-sm text-[#7B8776] italic">Blueprint spiritual yang membimbing perjalanan jiwamu.</p>
        </div>

        <div className="p-6 rounded-[2rem] bg-[#4F5E52] text-white space-y-3">
          <div className="flex items-center gap-2 opacity-70">
            <Compass size={16} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Kepemimpinan Alami</p>
          </div>
          <p className="text-base font-medium leading-relaxed">
            {style.leadership}
          </p>
        </div>
      </section>
    </InsightCard>
  );
}
