"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Info,
  Target,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Activity
} from "lucide-react";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import { isEnlEdition } from "@/lib/config/edition";

interface WellnessMappingViewProps {
  mapping: WellnessMapping;
  language: "id" | "en";
}

const CATEGORY_METADATA_EN: Record<string, { label: string; explanation: string }> = {
  GROWTH_PHASE: {
    label: "Growth Phase",
    explanation: "All your dimensions are in a stable condition and support your personal expansion."
  },
  BURNOUT: {
    label: "Burnout",
    explanation: "There is a noticeable dip in your physical energy and emotional reserves."
  },
  LIFE_TRANSITION: {
    label: "Life Transition",
    explanation: "You are currently in a phase of change or new chapter requiring internal adjustments."
  },
  LIFE_CRISIS: {
    label: "Life Challenge",
    explanation: "Several fundamental aspects of your life are facing challenges that need extra care."
  },
  LOSS_AND_GRIEF: {
    label: "Loss & Grief",
    explanation: "Your responses reflect higher emotional intensity around letting go or experiencing loss."
  },
  ANXIETY: {
    label: "Anxiety",
    explanation: "Patterns indicate elevated tension and a greater need for grounded safety than usual."
  },
  LONELINESS: {
    label: "Loneliness",
    explanation: "Relational dimensions show a need for deeper connection and heartfelt social support."
  },
  MEANING_CRISIS: {
    label: "Search for Meaning",
    explanation: "While other areas are steady, you are seeking deeper purpose and significance in daily life."
  },
  SPIRITUAL_AWAKENING: {
    label: "Spiritual Awakening",
    explanation: "A shift in inner awareness is taking place, often accompanying a personal transition."
  },
  SPIRITUAL_CRISIS: {
    label: "Spiritual Questioning",
    explanation: "Your inner search for purpose or deeper faith is at a pivotal, contemplative crossroad."
  }
};

const DIMENSION_NAMES: Record<string, { id: string; en: string }> = {
  body: { id: "Tubuh", en: "Body" },
  emotion: { id: "Emosi", en: "Emotion" },
  mind: { id: "Pikiran", en: "Mind" },
  relationship: { id: "Relasi", en: "Relationship" },
  meaning: { id: "Makna", en: "Meaning" },
  spirituality: { id: "Spiritualitas", en: "Spirituality" },
  regulation: { id: "Regulasi", en: "Regulation" },
};

export function WellnessMappingView({ mapping, language }: WellnessMappingViewProps) {
  const isEn = isEnlEdition() || language === "en";
  const [showWhy, setShowWhy] = useState(false);
  const { results, confidence, drivers } = mapping;

  const getConfidenceColor = () => {
    if (confidence.level === "HIGH") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (confidence.level === "MEDIUM") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  const getConfidenceLabel = (level: string) => {
    if (isEn) {
      if (level === "HIGH") return "High";
      if (level === "MEDIUM") return "Moderate";
      return "Low";
    }
    if (level === "HIGH") return "Tinggi";
    if (level === "MEDIUM") return "Cukup";
    return "Rendah";
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h4 className="text-[#4F6658] font-bold text-lg italic">
            {isEn ? "Possible Current Themes" : "Kemungkinan Tema Dominan"}
          </h4>
          <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
            {isEn ? "Inner patterns currently active" : "Pola batin yang sedang aktif"}
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getConfidenceColor()}`}>
          {confidence.level === "HIGH" ? <CheckCircle2 size={10} /> : confidence.level === "MEDIUM" ? <TrendingUp size={10} /> : <AlertCircle size={10} />}
          {getConfidenceLabel(confidence.level)}
        </div>
      </header>

      <div className="space-y-4">
        {results.map((res, index) => {
          const itemLabel = isEn ? (CATEGORY_METADATA_EN[res.category]?.label ?? res.label) : res.label;
          const itemExplanation = isEn ? (CATEGORY_METADATA_EN[res.category]?.explanation ?? res.explanation) : res.explanation;

          return (
            <div key={res.category} className="group">
              <div className="flex justify-between items-end mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${index === 0 ? "text-[#4F6658]" : "text-[#7B8776]"}`}>
                    {itemLabel}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] bg-[#4F6658] text-white px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">
                      {isEn ? "Dominant" : "Dominan"}
                    </span>
                  )}
                </div>
                {confidence.level !== "LOW" && (
                  <span className="text-sm font-serif italic font-bold text-[#4F6658]">
                    {res.probability}%
                  </span>
                )}
              </div>

              {confidence.level !== "LOW" && (
                 <div className="h-1.5 w-full bg-[#F5F1E8] rounded-full overflow-hidden mb-2">
                   <div
                     className={`h-full bg-[#4F5E52] transition-all duration-1000 delay-${index * 200}`}
                     style={{ width: `${res.probability}%`, opacity: 1 - (index * 0.2) }}
                   />
                 </div>
              )}

              <p className="text-xs text-[#3C3C3C] leading-relaxed font-medium opacity-80 pl-2 border-l border-[#E8E9E5]">
                {itemExplanation}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-[#F5F1E8]">
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="w-full flex items-center justify-between py-2 text-[#7B8776] hover:text-[#4F6658] transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={14} />
            {isEn ? "View Detailed Analysis" : "Lihat Detail Analisis"}
          </span>
          {showWhy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showWhy && (
          <div className="mt-4 p-5 rounded-2xl bg-[#FCFAF5] border border-[#E8E9E5]/60 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-3">
                  {isEn ? "Dimension Drivers" : "Penggerak Dimensi"}
                </p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                   {Object.entries(drivers.dimensions).map(([key, val]) => {
                     const dimName = DIMENSION_NAMES[key.toLowerCase()] ? DIMENSION_NAMES[key.toLowerCase()][isEn ? "en" : "id"] : key;
                     return (
                       <div key={key} className="flex justify-between items-center text-[11px] font-bold">
                         <span className="text-[#7B8776] capitalize">{dimName}</span>
                         <span className="text-[#4F5E52]">{val}%</span>
                       </div>
                     );
                   })}
                </div>
              </div>

              {drivers.boosters.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-2">
                    {isEn ? "Supporting Signals" : "Sinyal Pendukung"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {drivers.boosters.map(b => (
                      <span key={b} className="px-2 py-1 bg-white border border-[#E8E9E5] rounded text-[9px] font-bold text-[#7B8776]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[9px] text-[#9AA394] italic leading-relaxed">
                {isEn ? "Confidence Level:" : "Tingkat Akurasi:"} {confidence.score}% - {confidence.reason}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
