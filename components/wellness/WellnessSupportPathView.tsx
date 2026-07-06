"use client";

import React from "react";
import {
  ShieldCheck,
  Users,
  ExternalLink,
  ArrowRight,
  Info,
  Lock,
  Phone
} from "lucide-react";
import { SupportEngineState, SupportPathRecommendation, SupportLevel } from "@/lib/engines/wellnessSupportEngine";
import { SUPPORT_DISCLAIMERS } from "@/lib/data/supportResourceLibrary";

interface WellnessSupportPathViewProps {
  state: SupportEngineState;
  language: "id" | "en";
}

export function WellnessSupportPathView({ state, language }: WellnessSupportPathViewProps) {
  const { primary, secondary } = state;

  return (
    <div className="space-y-8">
      <header>
        <h4 className="text-[#4F6658] font-bold text-lg italic">
          {language === "id" ? "Rekomendasi Jalur Dukungan" : "Safety Path for You"}
        </h4>
        <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
          {language === "id" ? "Pilihan dukungan yang paling sesuai" : "Tailored support options"}
        </p>
      </header>

      <div className="space-y-4">
        <SupportCard recommendation={primary} isPrimary language={language} />
        {secondary && <SupportCard recommendation={secondary} language={language} />}
      </div>
    </div>
  );
}

function SupportCard({ recommendation, isPrimary, language }: { recommendation: SupportPathRecommendation; isPrimary?: boolean; language: "id" | "en" }) {
  const { level, label, confidence, why, resources } = recommendation;

  const getConfidenceLabel = (conf: string) => {
    if (language === "id") {
      return conf === "HIGH" ? "TINGGI" : conf === "MEDIUM" ? "CUKUP" : "RENDAH";
    }
    return conf;
  };

  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${isPrimary ? (level >= 5 ? "bg-white border-indigo-600 shadow-lg" : "bg-white border-[#4F5E52] shadow-md") : "bg-[#FCFAF5] border-[#E8E9E5]"}`}>
      {isPrimary && (
        <p className={`text-[9px] font-bold uppercase tracking-[0.3em] mb-3 ${level >= 5 ? "text-indigo-600" : "text-[#4F5E52]"}`}>
          Rekomendasi Utama
        </p>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
           <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-wider">Level {level}</p>
           <h5 className={`text-sm font-bold ${level >= 5 ? "text-indigo-700" : isPrimary ? "text-[#4F5E52]" : "text-[#7B8776]"}`}>
             {label[language]}
           </h5>
        </div>
        <div className="text-right">
           <p className="text-[8px] font-bold text-[#9AA394] uppercase tracking-tighter">
             {language === "id" ? "Kecocokan" : "Confidence"}
           </p>
           <p className="text-[10px] font-bold text-[#4F6658]">{getConfidenceLabel(confidence)}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[9px] font-bold text-[#9AA394] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Info size={10} /> {language === "id" ? "Mengapa langkah ini?" : "Why?"}
          </p>
          <p className="text-xs text-[#3C3C3C] leading-relaxed font-medium">
            {why[language]}
          </p>
        </div>

        {level >= 2 && level <= 4 && (
          <p className="text-[10px] text-[#7B8776] italic font-medium p-3 bg-white/50 rounded-xl border border-[#E8E9E5]/40">
            "{SUPPORT_DISCLAIMERS.wellness}"
          </p>
        )}

        <div className="space-y-2 pt-2">
           <p className="text-[9px] font-bold text-[#7B8776] uppercase tracking-[0.2em]">
             {language === "id" ? "Pilihan Pendampingan" : "Resources"}
           </p>
           <div className="space-y-2">
             {resources.map((res) => (
               <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8E9E5] hover:border-[#4F6658]/30 transition-all group cursor-pointer"
                    onClick={() => {
                      if (res.url) window.open(res.url, "_blank");
                      if (res.phone) window.location.href = `tel:${res.phone}`;
                    }}>
                 <div>
                   <p className="text-[11px] font-bold text-[#4F6658]">{res.name}</p>
                   <p className="text-[9px] text-[#7B8776] font-medium">{res.purpose[language]}</p>
                 </div>
                 {res.url ? <ExternalLink size={12} className="text-[#9BB89A]" /> : res.phone ? <Phone size={12} className="text-[#9BB89A]" /> : <ArrowRight size={12} className="text-[#9BB89A]" />}
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
