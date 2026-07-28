"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface IntelligenceCardProps {
  title: string;
  icon: LucideIcon;
  content: string;
  advice?: string;
  color?: string;
}

export function IntelligenceCard({
  title,
  icon: Icon,
  content,
  advice,
  color = "emerald",
}: IntelligenceCardProps) {
  return (
    <div className="bhumi-card border-none bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon size={20} />
        </div>
        <h4 className="font-serif text-lg font-bold text-[#4F5E52]">{title}</h4>
      </div>

      <p className="text-sm leading-7 text-[#526053] mb-4">{content}</p>

      {advice && (
        <div className="rounded-2xl bg-[#FCFAF5] p-4 border border-[#F1EEE7]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">Saran Bhumi</p>
          <p className="text-sm leading-6 text-[#4F5E52]">{advice}</p>
        </div>
      )}
    </div>
  );
}


