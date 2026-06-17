"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Sprout, Compass, ChevronRight } from "lucide-react";

interface DailyUserFlowGuideProps {
  language: "id" | "en";
}

export function DailyUserFlowGuide({ language }: DailyUserFlowGuideProps) {
  const isId = language === "id";

  const content = {
    title: isId ? "Disarankan" : "Recommended",
    subtitle: isId
      ? "Setelah membaca Home dari atas sampai Catatan Hari Ini, lanjutkan perjalananmu:"
      : "After reading Home from top to Today's Note, continue your journey:",
    steps: [
      {
        id: "wellness",
        icon: Sparkles,
        title: isId ? "Kenali Diri" : "Know Yourself",
        description: isId
          ? "Kenali kondisi dan kebutuhanmu hari ini."
          : "Understand your condition and needs today.",
        href: "/wellness-assessment",
        color: "bg-orange-50 text-orange-500",
      },
      {
        id: "innerwork",
        icon: Sprout,
        title: isId ? "Innerwork" : "Innerwork",
        description: isId
          ? "Pilih praktik yang paling sesuai untukmu."
          : "Choose the practice that best suits you.",
        href: "/innerwork",
        color: "bg-emerald-50 text-emerald-600",
      },
      {
        id: "journey",
        icon: Compass,
        title: isId ? "Journey" : "Journey",
        description: isId
          ? "Lihat jejak pertumbuhan dan konsistensimu."
          : "See your growth and consistency tracks.",
        href: "/journey",
        color: "bg-indigo-50 text-indigo-600",
      }
    ]
  };

  return (
    <section className="mt-12 mb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
      <div className="px-1">
        <h3 className="text-[#4F6658] font-serif text-2xl font-bold italic">
          {content.title}
        </h3>
        <p className="text-[#7B8776] text-[13px] mt-2 leading-relaxed font-medium">
          {content.subtitle}
        </p>
      </div>

      <div className="space-y-3">
        {content.steps.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className="flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-[#E8E9E5]/50 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className={`p-3 rounded-2xl ${step.color} shrink-0`}>
              <step.icon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#4F6658]">{step.title}</h4>
              <p className="text-xs text-[#7B8776] mt-0.5 font-medium">{step.description}</p>
            </div>
            <ChevronRight size={18} className="text-[#9BB89A] group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </section>
  );
}
