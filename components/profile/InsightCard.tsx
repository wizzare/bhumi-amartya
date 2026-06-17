"use client";

import React, { useState } from "react";
import { LucideIcon, ChevronRight, X } from "lucide-react";

interface InsightCardProps {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  title: string;
  summary: string;
  children: React.ReactNode; // Detail view content
}

export function InsightCard({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  summary,
  children,
}: InsightCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bhumi-card p-6 bg-white border-none shadow-sm hover:shadow-md transition-all text-left flex items-start gap-4 active:scale-[0.98] group"
      >
        <div className={`p-2.5 rounded-2xl ${bgColor} ${iconColor} shrink-0`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#4F6658] mb-1">{title}</h3>
          <p className="text-sm text-[#7B8776] leading-relaxed line-clamp-2">
            {summary}
          </p>
        </div>
        <ChevronRight size={18} className="text-[#9BB89A] mt-1 group-hover:translate-x-1 transition-transform" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-[#FCFAF5] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-8 bg-white border-b border-[#E8E9E5] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${bgColor} ${iconColor}`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#4F6658]">{title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-[#F5F1E8] transition-colors"
              >
                <X size={20} className="text-[#7B8776]" />
              </button>
            </header>

            <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar space-y-8">
              {children}
            </div>

            <footer className="p-6 bg-white border-t border-[#E8E9E5] flex justify-center">
              <button
                onClick={() => setIsOpen(false)}
                className="px-8 py-3 rounded-full bg-[#4F5E52] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#3D4A3F] transition-all"
              >
                Tutup Detail
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
