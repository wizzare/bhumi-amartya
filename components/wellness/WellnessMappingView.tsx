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

interface WellnessMappingViewProps {
  mapping: WellnessMapping;
  language: "id" | "en";
}

export function WellnessMappingView({ mapping, language }: WellnessMappingViewProps) {
  const [showWhy, setShowWhy] = useState(false);
  const { results, confidence, drivers } = mapping;

  const getConfidenceColor = () => {
    if (confidence.level === "HIGH") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (confidence.level === "MEDIUM") return "bg-blue-50 text-blue-700 border-blue-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h4 className="text-[#4F6658] font-bold text-lg italic">
            {language === "id" ? "Kemungkinan Tema Saat Ini" : "Possible Current Themes"}
          </h4>
          <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
            {language === "id" ? "Pola batin yang sedang aktif" : "Inner patterns currently active"}
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getConfidenceColor()}`}>
          {confidence.level === "HIGH" ? <CheckCircle2 size={10} /> : confidence.level === "MEDIUM" ? <TrendingUp size={10} /> : <AlertCircle size={10} />}
          {confidence.level}
        </div>
      </header>

      <div className="space-y-4">
        {results.map((res, index) => (
          <div key={res.category} className="group">
            <div className="flex justify-between items-end mb-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${index === 0 ? "text-[#4F6658]" : "text-[#7B8776]"}`}>
                  {res.label}
                </span>
                {index === 0 && <span className="text-[10px] bg-[#4F6658] text-white px-1.5 py-0.5 rounded uppercase tracking-tighter font-bold">Dominan</span>}
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
                   className={`h-full bg-[#4F6658] transition-all duration-1000 delay-${index * 200}`}
                   style={{ width: `${res.probability}%`, opacity: 1 - (index * 0.2) }}
                 />
               </div>
            )}

            <p className="text-xs text-[#3C3C3C] leading-relaxed font-medium opacity-80 pl-2 border-l border-[#E8E9E5]">
              {res.explanation}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-[#F5F1E8]">
        <button
          onClick={() => setShowWhy(!showWhy)}
          className="w-full flex items-center justify-between py-2 text-[#7B8776] hover:text-[#4F6658] transition-colors"
        >
          <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <Info size={14} />
            {language === "id" ? "Lihat Mengapa" : "View Why"}
          </span>
          {showWhy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showWhy && (
          <div className="mt-4 p-5 rounded-2xl bg-[#FCFAF5] border border-[#E8E9E5]/60 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-3">Dimensi Penggerak</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                   {Object.entries(drivers.dimensions).map(([key, val]) => (
                     <div key={key} className="flex justify-between items-center text-[11px] font-bold">
                       <span className="text-[#7B8776] capitalize">{key}</span>
                       <span className="text-[#4F6658]">{val}%</span>
                     </div>
                   ))}
                </div>
              </div>

              {drivers.boosters.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-2">Sinyal Tambahan</p>
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
                Tingkat akurasi: {confidence.score}% - {confidence.reason}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
