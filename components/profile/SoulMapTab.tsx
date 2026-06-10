"use client";

import React from "react";
import { HelpCircle, Sparkles, Heart } from "lucide-react";

interface SoulMapTabProps {
  data: {
    title: string;
    whyPatterns: string;
    innerChildNeeds: string;
    healingPath: string;
  };
}

export function SoulMapTab({ data }: SoulMapTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <section className="bhumi-card p-6 bg-white border-none shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <HelpCircle size={20} />
          </div>
          <h3 className="font-bold text-[#4F6658]">{data.title}</h3>
        </div>
        <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium">
          {data.whyPatterns}
        </p>
      </section>

      <section className="bhumi-card p-6 bg-white border-none shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Heart size={20} />
          </div>
          <h3 className="font-bold text-[#4F6658]">Kebutuhan Batin</h3>
        </div>
        <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium">
          {data.innerChildNeeds}
        </p>
      </section>

      <section className="bhumi-card p-6 bg-[#FCFAF5] border-dashed border-2 border-[#DDE7DB]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-green-50 text-green-600">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-[#4F6658]">Jalan Pemulihan</h3>
        </div>
        <p className="text-sm text-[#3C3C3C] font-bold leading-relaxed italic">
          {data.healingPath}
        </p>
      </section>
    </div>
  );
}
