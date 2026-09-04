"use client";

import React from "react";
import { Leaf } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

export function PenjagaBhumiIntiBanner() {
  const { language } = useLanguage();
  const isEn = isEnlEdition() || language === "en";

  return (
    <div className="mt-8 bhumi-card p-8 bg-gradient-to-br from-[#9BB89A]/10 to-[#FCFAF5] border border-[#9BB89A]/20 shadow-sm relative overflow-hidden">
      <div className="absolute -top-4 -right-4 opacity-5 text-[#4F6658]">
        <Leaf size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-white shadow-sm text-emerald-600">
            <Leaf size={20} />
          </div>
          <h3 className="text-[#4F6658] font-serif text-xl font-bold">
            {isEn ? "🌱 Bhumi Core Guardian" : "🌱 Penjaga Bhumi Inti"}
          </h3>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-[#4F5E52] font-medium">
          <p>
            {isEn ? (
              <>Congratulations, you are part of the <span className="font-bold text-[#4F6658]">Bhumi Core Guardians</span> walking alongside Bhumi Amartya from its early steps.</>
            ) : (
              <>Selamat, kamu adalah bagian dari <span className="font-bold text-[#4F6658]">Penjaga Bhumi Inti</span> yang membersamai perjalanan Bhumi Amartya sejak tahap awal.</>
            )}
          </p>
          <p>
            {isEn
              ? "As a token of our appreciation, Core Bhumi access is available during the Fanta phase."
              : "Sebagai bentuk apresiasi, akses Bhumi Inti tersedia selama fase Fanta berlangsung."}
          </p>
          <p className="italic opacity-80">
            {isEn
              ? "Thank you for helping Bhumi grow into a Home to Return to and Know Yourself."
              : "Terima kasih telah ikut membantu Bhumi bertumbuh menjadi Rumah untuk Pulang dan Mengenali Diri."}
          </p>
        </div>
      </div>
    </div>
  );
}
