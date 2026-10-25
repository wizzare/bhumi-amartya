"use client";

import React from "react";
import { Quote } from "lucide-react";
import { cleanMarkdown } from "@/lib/utils/markdown";
import { isEnlEdition } from "@/lib/config/edition";

interface SoulReflectionCardProps {
  language: "id" | "en";
  reflection?: string;
  loading?: boolean;
  compact?: boolean;
}

export function SoulReflectionCard({ language, reflection, loading, compact = false }: SoulReflectionCardProps) {
  const isEn = false;
  const [isExpanded, setIsExpanded] = React.useState(false);
  const cleanedReflection = React.useMemo(
    () => cleanMarkdown(reflection),
    [reflection],
  );

  if (compact) return (
    <section className="my-6 rounded-2xl border border-current/10 bg-white p-5" aria-labelledby="main-insight-title" aria-busy={loading}>
      <h2 id="main-insight-title" className="font-serif text-xl">INSIGHT UTAMA</h2>
      <p className="mt-3 text-sm leading-relaxed">{loading ? 'Menyiapkan refleksimu…' : cleanedReflection?.split(/\n\s*\n/)[0] || 'Refleksi hari ini belum tersedia.'}</p>
      {!loading && cleanedReflection && (
        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-semibold">Baca refleksi lengkap</summary>
          <p className="whitespace-pre-line text-sm leading-relaxed">{cleanedReflection}</p>
        </details>
      )}
    </section>
  );

  return (
    <div className="mt-8 space-y-4">
      <div className="px-1 text-center">
        <h3 className="text-[#4F6658] font-serif text-2xl font-bold italic">
          {isEn ? "Soul Reflection" : "Refleksi Jiwa"}
        </h3>
      </div>

      <div
        onClick={() => !loading && setIsExpanded(!isExpanded)}
        className="bhumi-card p-8 bg-white border-none shadow-sm relative overflow-hidden text-center group hover:shadow-md transition-all duration-500 cursor-pointer"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#9BB89A]/30 to-transparent" />

        <div className="absolute -top-4 -left-4 opacity-5 text-[#4F6658] group-hover:scale-105 transition-transform duration-700">
          <Quote size={120} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-px bg-[#E8E9E5] mb-8" />

          {loading ? (
            <div className="space-y-4 w-full">
              <div className="h-5 bg-[#FCFAF5] rounded-2xl w-full animate-pulse"></div>
              <div className="h-5 bg-[#FCFAF5] rounded-2xl w-5/6 mx-auto animate-pulse"></div>
              <div className="h-5 bg-[#FCFAF5] rounded-2xl w-4/6 mx-auto animate-pulse"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-[9px] text-[#7B8776] font-bold uppercase tracking-wider mb-2">
                {isEn
                  ? "Reading your soul today"
                  : "Refleksi Hari Ini"}
              </p>
              <h2 className={`whitespace-pre-line text-[#4F6658] text-lg sm:text-xl font-serif italic leading-relaxed px-2 transition-all duration-500 ${isExpanded ? "" : "line-clamp-4"}`}>
                {cleanedReflection || (isEn ? "Preparing a message for your soul..." : "Menyiapkan refleksimu...")}
              </h2>

              {cleanedReflection && cleanedReflection.length > 150 && (
                <p className="text-[9px] font-bold text-[#9BB89A] uppercase tracking-widest mt-4">
                  {isExpanded
                    ? (isEn ? "Collapse" : "Tutup")
                    : (isEn ? "Read More" : "Baca Selengkapnya")}
                </p>
              )}
            </div>
          )}

          <div className="w-12 h-px bg-[#E8E9E5] mt-8" />
        </div>

        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#FCFAF5] rounded-full blur-2xl opacity-50" />
      </div>
    </div>
  );
}
