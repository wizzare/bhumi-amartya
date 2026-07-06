"use client";

import React from "react";
import { Sparkles, CheckCircle2, Target, AlertCircle } from "lucide-react";
import { WeeklyReflection } from "@/lib/repositories/reflectionRepository";

interface ReflectionCardProps {
  reflection: WeeklyReflection;
}

export function ReflectionCard({ reflection }: ReflectionCardProps) {
  return (
    <div className="bhumi-card p-8 bg-indigo-900 text-white border-none shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10 space-y-6">
        <header>
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Ringkasan Perjalanan Jiwa</p>
          <h3 className="text-2xl font-serif font-semibold">{reflection.theme}</h3>
        </header>

        <p className="text-sm text-indigo-100 leading-relaxed italic border-l-2 border-indigo-400 pl-4 py-1">
          "{reflection.soulSummary}"
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <section>
            <h4 className="text-[10px] font-bold uppercase text-indigo-300 mb-3 flex items-center gap-2">
              <CheckCircle2 size={14} /> Pelajaran & Kemenangan
            </h4>
            <ul className="space-y-2">
              {reflection.lessons.map((l, i) => (
                <li key={i} className="text-xs text-indigo-100 leading-relaxed">• {l}</li>
              ))}
              {reflection.smallWins.map((w, i) => (
                <li key={i} className="text-xs text-green-300 leading-relaxed">✓ {w}</li>
              ))}
            </ul>
          </section>

          <section>
            <h4 className="text-[10px] font-bold uppercase text-indigo-300 mb-3 flex items-center gap-2">
              <Target size={14} /> Fokus Kedepan
            </h4>
            <div className="bg-indigo-800/50 p-3 rounded-xl border border-indigo-700/50">
               <p className="text-xs text-indigo-100 font-medium">{reflection.focusNextWeek}</p>
            </div>

            <h4 className="text-[10px] font-bold uppercase text-indigo-300 mt-4 mb-2 flex items-center gap-2">
              <AlertCircle size={14} /> Tantangan
            </h4>
            <p className="text-xs text-indigo-200">{reflection.mainChallenge}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
