"use client";

import React from "react";
import { Briefcase, Target, Zap, Building, AlertCircle, Coins, Ban, Info } from "lucide-react";
import { InsightCard } from "./InsightCard";
import { CareerIntelligence } from "@/lib/engines/careerIntelligenceEngine";

interface CareerCardProps {
  career: CareerIntelligence;
}

export function CareerCard({ career }: CareerCardProps) {
  return (
    <InsightCard
      icon={Briefcase}
      iconColor="text-blue-600"
      bgColor="bg-blue-50"
      title="Potensi Karir"
      summary={career.summary}
    >
      {/* 1. Career DNA */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-[#9AA394]">
          <Target size={14} className="uppercase font-bold tracking-widest" />
          <p className="text-[10px] font-bold uppercase tracking-widest">Career DNA Dominan</p>
        </div>
        <p className="text-2xl font-serif text-[#4F6658] font-bold italic">{career.careerDna}</p>
      </section>

      {/* 2. Top Roles */}
      <section className="space-y-4">
        <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Top 5 Peran Cocok</p>
        <div className="flex flex-wrap gap-2">
          {career.topRoles.map((role) => (
            <span key={role} className="px-4 py-2 rounded-xl bg-white border border-[#E8E9E5] text-sm text-[#4F5E52] font-medium shadow-sm">
              {role}
            </span>
          ))}
        </div>
      </section>

      {/* 3. Style & Environment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-2">
          <div className="flex items-center gap-2 text-indigo-500">
            <Zap size={16} />
            <p className="text-[9px] font-bold uppercase tracking-wider">Gaya Kerja</p>
          </div>
          <p className="text-sm text-[#4F5E52] font-bold leading-relaxed">{career.workStyle}</p>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-[#E8E9E5] space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <Building size={16} />
            <p className="text-[9px] font-bold uppercase tracking-wider">Lingkungan Ideal</p>
          </div>
          <p className="text-sm text-[#4F5E52] font-bold leading-relaxed">{career.idealEnvironment}</p>
        </div>
      </div>

      {/* 4. Prosperity Pattern */}
      <section className="p-6 rounded-[2rem] bg-[#4F5E52] text-white shadow-lg space-y-3">
        <div className="flex items-center gap-2 opacity-70">
          <Coins size={16} />
          <p className="text-[10px] font-bold uppercase tracking-widest">Pola Rezeki</p>
        </div>
        <p className="text-base font-medium leading-relaxed italic">
          "{career.prosperityPattern}"
        </p>
      </section>

      {/* 5. Challenges & Avoid */}
      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-3">Tantangan Karir</p>
          <ul className="space-y-2">
            {career.challenges.map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm text-[#7B8776]">
                <AlertCircle size={14} className="text-amber-500" />
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-3">Hal yang Perlu Dihindari</p>
          <ul className="space-y-2">
            {career.thingsToAvoid.map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm text-[#7B8776]">
                <Ban size={14} className="text-red-400" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. Sources */}
      <footer className="pt-6 border-t border-[#E8E9E5] flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-[#9AA394]">
          <Info size={12} />
          <p className="text-[8px] font-bold uppercase tracking-widest">Sumber Blueprint:</p>
        </div>
        <div className="flex gap-2">
          {career.sources.map((s) => (
            <span key={s} className="text-[8px] font-bold text-[#4F5E52] bg-[#F5F1E8] px-2 py-1 rounded-md">
              {s}
            </span>
          ))}
        </div>
      </footer>
    </InsightCard>
  );
}
