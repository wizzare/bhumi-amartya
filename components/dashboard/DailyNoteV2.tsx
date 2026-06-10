"use client";

import React, { useState } from "react";
import {
  Sun,
  Brain,
  Wallet,
  Heart,
  Users,
  Sparkles,
  ShieldAlert,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  HelpCircle
} from "lucide-react";
import { DailyGuidance } from "@/lib/dailyGuidance/types";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { cleanMarkdown } from "@/lib/utils/markdown";

interface DailyNoteV2Props {
  dailyGuidance: DailyGuidance | null;
  language: "id" | "en";
}

const CATEGORY_CONFIG = {
  general: {
    label: { id: "Kondisi Umum", en: "General Condition" },
    icon: Sun,
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  mental: {
    label: { id: "Mental", en: "Mental" },
    icon: Brain,
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  finance: {
    label: { id: "Keuangan", en: "Finance" },
    icon: Wallet,
    color: "text-emerald-500",
    bgColor: "bg-emerald-50"
  },
  love: {
    label: { id: "Percintaan", en: "Love" },
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50"
  },
  relational: {
    label: { id: "Relasi & Keluarga", en: "Relational" },
    icon: Users,
    color: "text-indigo-500",
    bgColor: "bg-indigo-50"
  },
  spiritual: {
    label: { id: "Spiritual", en: "Spiritual" },
    icon: Sparkles,
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  challenges: {
    label: { id: "Tantangan", en: "Challenges" },
    icon: ShieldAlert,
    color: "text-amber-600",
    bgColor: "bg-amber-50"
  },
  opportunities: {
    label: { id: "Peluang", en: "Opportunities" },
    icon: Lightbulb,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50"
  },
  advice: {
    label: { id: "Saran", en: "Advice" },
    icon: MessageSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
};

export function DailyNoteV2({ dailyGuidance, language }: DailyNoteV2Props) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const auth = useAuth();

  React.useEffect(() => {
    if (dailyGuidance) {
      trackEvent("open_daily_note", auth?.user?.uid);
    }
  }, [dailyGuidance, auth?.user?.uid]);

  if (!dailyGuidance || !dailyGuidance.categories) {
    return (
      <div className="mt-8 space-y-4">
        <div className="px-1">
          <h3 className="text-[#4F6658] font-serif text-2xl font-bold">
            {language === "id" ? "Catatan Hari Ini" : "Today's Note"}
          </h3>
        </div>
        <div className="bhumi-card p-8 bg-[#FCFAF5] border border-[#E8E9E5]/50 text-center italic text-[#7B8776] text-sm">
          {language === "id" ? "Informasi sedang dipersiapkan..." : "Information is being prepared..."}
        </div>
      </div>
    );
  }

  const toggleCategory = (key: string) => {
    const isExpanding = expandedCategory !== key;
    if (isExpanding) {
      trackEvent("expand_reason", auth?.user?.uid);
    }
    setExpandedCategory(isExpanding ? key : null);
  };

  return (
    <div className="mt-8 space-y-4">
      <div className="px-1">
        <h3 className="text-[#4F6658] font-serif text-2xl font-bold">
          {language === "id" ? "Catatan Hari Ini" : "Today's Note"}
        </h3>
        <p className="text-[#3C3C3C] text-[13px] mt-1 font-medium opacity-70">
          {language === "id"
            ? "Membaca Blueprint Gabunganmu bersama kondisi langit."
            : "Reading your Combined Blueprint alongside celestial conditions."}
        </p>
      </div>

      <div className="space-y-3">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const categoryData = (dailyGuidance.categories as any)[key];
          if (!categoryData) return null;

          const isExpanded = expandedCategory === key;
          const Icon = config.icon;

          return (
            <div
              key={key}
              className={`bhumi-card overflow-hidden transition-all duration-500 border-none shadow-sm bg-white ${isExpanded ? 'ring-1 ring-[#4F5E52]/10 shadow-md' : 'hover:shadow-sm'}`}
            >
              <button
                onClick={() => toggleCategory(key)}
                className="w-full flex items-start gap-4 p-5 text-left active:bg-[#FCFAF5] transition-colors"
              >
                <div className={`mt-0.5 p-2.5 rounded-2xl ${config.bgColor} ${config.color} shrink-0`}>
                  <Icon size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776]">
                      {config.label[language]}
                    </p>
                    {isExpanded ? <ChevronUp size={16} className="text-[#7B8776]" /> : <ChevronDown size={16} className="text-[#7B8776]" />}
                  </div>
                  <h4 className={`text-[15px] font-bold text-[#4F6658] leading-snug mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {cleanMarkdown(categoryData.insight)}
                  </h4>
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-8 pt-2 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="h-px bg-[#F5F1E8] w-full" />

                  {/* A. MENGAPA */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                       <HelpCircle size={14} className="text-[#7B8776]" />
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776]">
                        {language === "id" ? "Mengapa ini muncul?" : "Why this appears?"}
                      </p>
                    </div>
                    <p className="text-sm text-[#3C3C3C] leading-relaxed font-medium italic bg-[#FCFAF5] p-5 rounded-2xl border border-[#E8E9E5]/50">
                      {cleanMarkdown(categoryData.reason)}
                    </p>
                  </div>

                  {/* B. REFLEKSI */}
                  {categoryData.reflection && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                         <MessageSquare size={14} className="text-[#7B8776]" />
                         <p className="text-[10px] font-bold uppercase tracking-widest text-[#7B8776]">
                          {language === "id" ? "Refleksi Dirimu" : "Self Reflection"}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {categoryData.reflection.split('\n').filter((l: string) => l.trim().length > 0).map((q: string, i: number) => (
                           <p key={i} className="text-[14px] text-[#3C3C3C] font-bold leading-relaxed pl-5 border-l-2 border-[#9BB89A]">
                             {cleanMarkdown(q)}
                           </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* C. SARAN PRAKTIS */}
                  <div className="bg-[#4F5E52] p-7 rounded-[2rem] shadow-sm">
                    <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#9BB89A] mb-4">
                      {language === "id" ? "Saran Mentor" : "Practical Advice"}
                    </p>
                    <p className="text-[14px] text-white leading-relaxed font-medium opacity-90">
                      {cleanMarkdown(categoryData.advice)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

