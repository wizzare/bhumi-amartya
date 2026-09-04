"use client";

import React from "react";
import { Star } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

interface ReviewDialogProps {
  onRate: () => void;
  onDismiss: () => void;
  onOptOut: () => void;
}

export function ReviewDialog({ onRate, onDismiss, onOptOut }: ReviewDialogProps) {
  const { language } = useLanguage();
  const isEn = isEnlEdition() || language === "en";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-white p-8 text-center shadow-2xl border border-[#E8E9E5]" role="dialog" aria-modal="true" aria-labelledby="bhumi-review-title">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F5F1E8] text-[#4F5E52]">
          <Star size={32} fill="currentColor" />
        </div>

        <h2 id="bhumi-review-title" className="mb-3 font-serif text-2xl font-bold text-[#4F5E52]">
          {isEn ? "How has your journey with Bhumi been?" : "Bagaimana perjalananmu bersama Bhumi?"}
        </h2>

        <p className="mb-8 text-sm leading-relaxed text-[#7B8776]">
          {isEn
            ? "If Bhumi has brought you closer to yourself, your review will help this space grow and reach more souls."
            : "Jika Bhumi membantumu lebih dekat dengan dirimu, ulasanmu akan membantu ruang ini terus bertumbuh dan menjangkau lebih banyak jiwa."}
        </p>

        <div className="flex flex-col gap-3">
          <button type="button"
            onClick={onRate}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[#4F5E52] py-4 text-sm font-bold text-white transition-all active:scale-95 hover:bg-[#3D4A3F]"
          >
            {isEn ? "⭐ Rate Bhumi" : "⭐ Beri Rating"}
          </button>
          <button type="button"
            onClick={onDismiss}
            className="rounded-2xl py-4 text-sm font-bold text-[#9AA394] transition-all active:scale-95 hover:bg-black/5"
          >
            {isEn ? "Maybe Later" : "Nanti Saja"}
          </button>
          <button type="button"
            onClick={onOptOut}
            className="rounded-2xl py-2 text-xs font-medium text-[#9AA394] underline-offset-4 hover:underline"
          >
            {isEn ? "Don't Show Again" : "Jangan Tampilkan Lagi"}
          </button>
        </div>
      </div>
    </div>
  );
}
