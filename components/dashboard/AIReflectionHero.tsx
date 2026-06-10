"use client";

import { useState } from "react";
import { Sparkles, Zap, Target } from "lucide-react";

interface AIReflectionHeroProps {
  reflection: string;
  preview?: string;
  fullReflection?: string;
  language?: "id" | "en";
  title?: string;
  manifestation?: {
    affirmation: string;
    attraction: string;
    assumption: string;
  };
}

export function AIReflectionHero({
  reflection,
  preview,
  fullReflection,
  language = "id",
  title,
  manifestation
}: AIReflectionHeroProps) {
  const [expanded, setExpanded] = useState(false);
  const hasExplicitExpandedText = Boolean(fullReflection?.trim());
  const sourcePreview = (preview || (hasExplicitExpandedText ? reflection : "") || "").trim();
  const sourceFull = (fullReflection || reflection || "").trim();

  const fullText = sourceFull;
  const previewText = sourcePreview || (fullText.length > 240 ? `${fullText.slice(0, 240).trim()}...` : fullText);

  const canExpand = fullText.length > previewText.length;
  const displayReflection = expanded ? fullText : previewText;

  return (
    <div className="mt-8 space-y-6">
      {/* 1. Manifestation Card */}
      {manifestation && (
        <div className="bhumi-card p-8 bg-[#4F5E52] text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Sparkles size={120} />
          </div>

          <div className="relative z-10 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Sparkles size={14} className="text-[#9BB89A]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">Affirmation</p>
              </div>
              <p className="text-lg font-serif italic leading-relaxed">
                "{manifestation.affirmation}"
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Zap size={14} className="text-[#9BB89A]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">Attraction</p>
              </div>
              <p className="text-base leading-relaxed font-medium">
                {manifestation.attraction}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3 opacity-80">
                <Target size={14} className="text-[#9BB89A]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">Assumption</p>
              </div>
              <p className="text-base leading-relaxed font-medium">
                {manifestation.assumption}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Reflection Text */}
      <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] shadow-sm">
        <p className="text-[#7B8776] text-xs font-bold uppercase tracking-[0.15em]">
          {title ?? (language === "id" ? "Refleksi Jiwa" : "Soul Reflection")}
        </p>

        <h2 className={`text-xl mt-4 leading-relaxed text-[#3C3C3C] font-medium whitespace-pre-line ${expanded ? "" : "line-clamp-6 overflow-hidden"}`}>
          {displayReflection}
        </h2>

        {canExpand ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="mt-6 text-sm font-bold text-[#4F6658] underline underline-offset-4 hover:text-[#3D4A3F]"
          >
            {expanded
              ? (language === "id" ? "Tutup" : "Show Less")
              : (language === "id" ? "Baca Selengkapnya" : "Read More")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
