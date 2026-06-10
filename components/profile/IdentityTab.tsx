"use client";

import React from "react";

interface IdentityTabProps {
  data: {
    title: string;
    description: string;
    coreEssence: string;
  };
}

export function IdentityTab({ data }: IdentityTabProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bhumi-card p-8 bg-white border-none shadow-sm">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 bg-[#FCFAF5] rounded-full flex items-center justify-center mb-4 border border-[#E8E9E5]">
             <span className="text-3xl">✨</span>
          </div>
          <p className="text-[#9AA394] text-xs font-bold uppercase tracking-[0.2em] mb-2">{data.title}</p>
          <h2 className="text-2xl font-serif text-[#4F6658] leading-tight font-semibold">{data.coreEssence}</h2>
        </div>

        <div className="h-px bg-[#E8E9E5] w-full mb-8" />

        <p className="text-[#3C3C3C] leading-relaxed text-lg italic text-center px-2">
          "{data.description}"
        </p>
      </div>

      <div className="mt-6 p-6 rounded-[2rem] bg-[#FCFAF5] border border-[#E8E9E5]">
        <p className="text-xs text-[#3C3C3C] leading-relaxed font-medium">
          Bagian ini adalah potret dirimu yang paling mendasar. Ia mengingatkan tentang kualitas unik yang kamu bawa sejak lahir ke dunia ini.
        </p>
      </div>
    </div>
  );
}
