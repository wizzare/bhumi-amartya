"use client";

import React from "react";
import { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";

interface WellnessMapViewProps {
  results: AssessmentResult;
  language: "id" | "en";
}

const DIMENSION_CONFIG: Array<{ key: keyof AssessmentResult; label: { id: string; en: string }; color: string }> = [
  { key: "body", label: { id: "Tubuh", en: "Body" }, color: "bg-orange-500" },
  { key: "emotion", label: { id: "Emosi", en: "Emotion" }, color: "bg-red-500" },
  { key: "relationship", label: { id: "Relasi", en: "Relationship" }, color: "bg-indigo-500" },
  { key: "meaning", label: { id: "Makna", en: "Meaning" }, color: "bg-emerald-500" },
  { key: "spirituality", label: { id: "Spirit", en: "Spirituality" }, color: "bg-purple-500" },
];

export function WellnessMapView({ results, language }: WellnessMapViewProps) {
  return (
    <div className="space-y-6">
      <header>
        <h4 className="text-[#4F6658] font-bold text-lg italic">
          {language === "id" ? "Pemetaan Dimensi Diri" : "Dimension Self-Mapping"}
        </h4>
        <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
          {language === "id" ? "Gambaran kondisimu saat ini" : "Snapshot of your current condition"}
        </p>
      </header>

      <div className="space-y-5">
        {DIMENSION_CONFIG.map((dim) => {
          const result = results[dim.key];
          if (!result || typeof result.score !== "number" || typeof result.label !== "string") {
            return null;
          }
          return (
            <div key={dim.key} className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-[#4F6658] uppercase tracking-wider">
                  {dim.label[language]}
                </span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#7B8776] block leading-none mb-1">
                    {result.label}
                  </span>
                  <span className="text-sm font-serif italic font-bold text-[#4F6658]">
                    {result.score}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-[#F5F1E8] rounded-full overflow-hidden">
                <div
                  className={`h-full ${dim.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-[#9AA394] italic font-medium leading-relaxed pt-4 border-t border-[#F5F1E8]">
        {language === "id"
          ? "*Ini bukan diagnosis medis. Peta ini adalah gambaran batinmu untuk membantumu mengenali area yang membutuhkan perhatian lebih."
          : "*This is not a medical diagnosis. This map is an inner snapshot to help you recognize areas needing more attention."}
      </p>
    </div>
  );
}
