"use client";

import React, { type ComponentType } from "react";
import {
  Zap,
  RotateCcw,
  MessageSquare,
  TrendingUp,
  Compass,
  Sparkles
} from "lucide-react";
import { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { NavigatorMode } from "@/lib/data/navigatorActionLibrary";

interface WellnessNavigatorViewProps {
  state: NavigatorState;
  language: "id" | "en";
}

const MODE_CONFIG: Record<NavigatorMode, { label: { id: string; en: string }; color: string; bgColor: string; icon: ComponentType<{ size?: number }> }> = {
  RECOVERY: {
    label: { id: "Mode Pemulihan", en: "Recovery Mode" },
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    icon: RotateCcw
  },
  REFLECTION: {
    label: { id: "Mode Refleksi", en: "Reflection Mode" },
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    icon: MessageSquare
  },
  GROWTH: {
    label: { id: "Mode Pertumbuhan", en: "Growth Mode" },
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    icon: TrendingUp
  }
};

export function WellnessNavigatorView({ state, language }: WellnessNavigatorViewProps) {
  const { mode, primaryAction, supportingActions } = state;
  const config = MODE_CONFIG[mode];
  const Icon = config.icon;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h4 className="text-[#4F6658] font-bold text-lg italic flex items-center gap-2">
            <Compass size={20} className="text-[#9BB89A]" />
            {language === "id" ? "Langkah Berikutnya" : "Next Steps"}
          </h4>
          <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
            {language === "id" ? "Panduan navigasi kondisimu" : "Navigator guide for your condition"}
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${config.bgColor} ${config.color} border-current opacity-80`}>
          <Icon size={10} />
          {config.label[language]}
        </div>
      </header>

      {/* PRIMARY ACTION CARD */}
      <div className="p-6 rounded-[2rem] bg-white border border-[#E8E9E5] shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <Zap size={60} />
        </div>

        <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-[0.3em] mb-3">
          {language === "id" ? "Langkah Utama" : "Primary Action"}
        </p>

        <h5 className="text-sm font-bold text-[#4F6658] mb-1">
          {primaryAction.label[language]}
        </h5>

        <div className="bg-[#FCFAF5] p-4 rounded-2xl border border-[#E8E9E5]/50">
          <p className="text-[13px] text-[#3C3C3C] font-bold italic leading-relaxed">
            {primaryAction.microAction[language]}
          </p>
          <p className="text-[10px] text-[#7B8776] mt-1 font-medium italic opacity-70">
            {language === "id" ? "Waktu: < 1 Menit" : "Estimate: < 1 Minute"}
          </p>
        </div>

      </div>

      {/* SUPPORTING ACTIONS */}
      {supportingActions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-[#7B8776] uppercase tracking-[0.2em] ml-2">
            {language === "id" ? "Langkah Pendukung" : "Supporting Steps"}
          </p>
          <div className="space-y-2">
            {supportingActions.map((action) => (
              <div key={action.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-[#E8E9E5]/60 hover:border-[#4F6658]/30 transition-all cursor-pointer group">
                <div className="p-2 rounded-xl bg-[#FCFAF5] text-[#9BB89A] group-hover:bg-white group-hover:text-[#4F6658] transition-colors">
                  <Sparkles size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#4F6658]">{action.label[language]}</p>
                  <p className="text-[10px] text-[#7B8776] font-medium">{action.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
