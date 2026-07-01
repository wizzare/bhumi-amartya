"use client";

import React from "react";
import { ArrowUpCircle } from "lucide-react";

interface UpdateRequiredScreenProps {
  updateUrl: string;
  currentBuild: number;
  minimumBuild: number;
  customMessage?: string;
}

export function UpdateRequiredScreen({
  updateUrl,
  currentBuild,
  minimumBuild,
  customMessage,
}: UpdateRequiredScreenProps) {
  const handleUpdate = () => {
    if (typeof window !== "undefined") {
      try {
        window.open(updateUrl, "_system");
      } catch (e) {
        window.open("https://play.google.com/store/apps/details?id=com.bhumiamartya.app", "_system");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#4F5E52]/10 shadow-sm">
        <div className="w-16 h-16 bg-[#7D977B]/10 rounded-full flex items-center justify-center mb-6 mx-auto text-[#7D977B]">
          <ArrowUpCircle size={32} />
        </div>
        
        <h2 className="text-2xl font-serif text-[#4F5E52] mb-3">
          Aplikasi Bhumi telah diperbarui.
        </h2>
        
        <p className="text-[#7B8776] text-sm leading-relaxed mb-8">
          {customMessage || "Versi yang Anda gunakan sudah tidak didukung. Silakan update ke versi terbaru melalui Google Play."}
        </p>

        <button
          onClick={handleUpdate}
          className="bhumi-button w-full py-4 text-center font-bold tracking-wider uppercase text-xs"
        >
          UPDATE SEKARANG
        </button>

        <div className="mt-8 pt-6 border-t border-[#F5F1E8] flex justify-between text-[10px] text-[#9AA394] font-mono">
          <span>Build Saat Ini: {currentBuild}</span>
          <span>Minimum Build: {minimumBuild}</span>
        </div>
      </div>
    </div>
  );
}
