"use client";

import React from "react";
import { Star, ShieldCheck, Compass } from "lucide-react";
import { CareerIntelligence } from "@/lib/engines/careerIntelligenceEngine";
import { CareerCard } from "./CareerCard";
import { HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";
import { TopTalentCard } from "./TopTalentCard";
import { RelationshipStyleCard } from "./RelationshipStyleCard";
import { SpiritualArchetypeCard } from "./SpiritualArchetypeCard";

interface PotentialTabProps {
  data: {
    title: string;
    strengths: string[];
    soulMission: string;
    lightManifestation: string;
    career: CareerIntelligence;
    hdStyle: HumanDesignStyle;
  };
}

export function PotentialTab({ data }: PotentialTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CareerCard career={data.career} />

      <div className="grid grid-cols-1 gap-4">
         <TopTalentCard style={data.hdStyle} />
         <RelationshipStyleCard style={data.hdStyle} />
         <SpiritualArchetypeCard style={data.hdStyle} />
      </div>

      <section className="bhumi-card p-6 bg-white border-none shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Star size={20} />
          </div>
          <h3 className="font-bold text-[#4F6658]">{data.title}</h3>
        </div>
        <div className="space-y-4">
          {data.strengths.map((strength, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-[#FCFAF5] border border-[#E8E9E5]">
              <span className="mt-1 text-amber-500 font-bold">✦</span>
              <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium">{strength}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bhumi-card p-6 bg-white border-none shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Compass size={20} />
          </div>
          <h3 className="font-bold text-[#4F6658]">Misi Jiwa</h3>
        </div>
        <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium">
          {data.soulMission}
        </p>
      </section>

      <section className="bhumi-card p-8 bg-[#F5F1E8] border border-[#E8E9E5] shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <ShieldCheck size={20} className="text-[#4F6658]" />
             <h3 className="font-bold text-[#4F6658] uppercase tracking-[0.2em] text-sm">Perwujudan Cahaya</h3>
          </div>
          <p className="text-base leading-relaxed text-[#3C3C3C] font-medium">
            {data.lightManifestation}
          </p>
        </div>
      </section>
    </div>
  );
}
