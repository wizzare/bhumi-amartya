"use client";

import React from "react";
import { Compass, Brain, Wallet, Heart, Users, Sparkles, ShieldAlert, Sprout, type LucideIcon } from "lucide-react";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { DashboardNoteAdapter } from "@/lib/dailyGuidance/dashboardNoteAdapter";
import { getTimeOfDayGreeting } from "@/lib/dailyGuidance/timeOfDayGreeting";
import { isEnlEdition } from "@/lib/config/edition";
import { IntelligenceCard } from "./IntelligenceCard";

interface DailyNoteV2Props {
  dailyGuidance: DailyGuidance | null;
  focus?: string;
  language: "id" | "en";
  userName: string;
  dailyState: DailyState | null;
  yesterdayState: DailyState | null;
  recentDailyStates: DailyState[];
  navigatorState: NavigatorState | null;
  appNow?: Date;
  dailyNoteState?: "loading" | "ready" | "limited" | "unavailable" | "error";
  dailyNoteError?: string | null;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  Brain,
  Wallet,
  Heart,
  Users,
  Sparkles,
  ShieldAlert,
  Sprout,
};

export function DailyNoteV2({
  dailyGuidance,
  dailyNoteState,
  dailyNoteError,
  language,
  userName,
  appNow = new Date(),
}: DailyNoteV2Props) {
  const auth = useAuth();
  const isEn = false;

  React.useEffect(() => {
    if (dailyGuidance) trackEvent("open_daily_note", auth?.user?.uid);
  }, [dailyGuidance, auth?.user?.uid]);

  const state = dailyNoteState ?? (dailyGuidance?.categories ? "ready" : "loading");

  if (state === "loading") {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">
          {isEn ? "A Note from Bhumi for You" : "Catatan dari Bhumi untuk Kamu"}
        </h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm italic text-[#7B8776]">
          {isEn ? "Your note is being written..." : "Catatanmu sedang dirapikan sebentar..."}
        </div>
      </section>
    );
  }

  if (state === "unavailable") {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">
          {isEn ? "A Note from Bhumi for You" : "Catatan dari Bhumi untuk Kamu"}
        </h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm text-[#7B8776]">
          {isEn
            ? "Today's Note cannot be compiled yet because minimum profile and Akashi Archive data are not available."
            : "Catatan Hari Ini belum bisa disusun karena data minimum profil dan Arsip Akashi belum tersedia."}
        </div>
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">
          {isEn ? "A Note from Bhumi for You" : "Catatan dari Bhumi untuk Kamu"}
        </h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm text-[#7B8776]">
          {isEn
            ? `Today's Note could not be opened. ${dailyNoteError ? `Detail: ${dailyNoteError}` : "Please reload this page shortly."}`
            : `Catatan Hari Ini belum berhasil dibuka. ${dailyNoteError ? `Detail: ${dailyNoteError}` : "Silakan muat ulang halaman ini sebentar lagi."}`}
        </div>
      </section>
    );
  }

  if (!dailyGuidance?.categories) {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">
          {isEn ? "A Note from Bhumi for You" : "Catatan dari Bhumi untuk Kamu"}
        </h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm text-[#7B8776]">
          {isEn
            ? "Today's Note does not have a complete reading structure to display yet."
            : "Catatan Hari Ini belum memiliki struktur bacaan yang lengkap untuk ditampilkan."}
        </div>
      </section>
    );
  }

  const markRead = () => {
    if (!auth?.user?.uid) return;
    const dateKey = dailyGuidance.localDateKey || dailyGuidance.date || new Date().toISOString().slice(0, 10);
    void dailyStateRepository.saveDailyState(auth.user.uid, dateKey, { dailyNoteDone: true });
  };

  /**
   * P0 HOTFIX: Presentation Safeguard
   * Removes internal orchestration tokens and debug strings.
   */
  const humanize = (text: string): string => {
    if (!text) return "";

    const INTERNAL_TOKENS = [
      "steady-integration", "stable-reflection", "deep-healing",
      "rising-growth", "gentle-support", "volatile-rhythm",
      "fragile-momentum", "expanding-potential", "steady-assimilation",
      "focus-integration", "stable-integration", "steady-growth"
    ];

    let cleaned = text.replace(/\s+/g, " ").trim();

    // Remove specific blacklisted tokens
    const tokenRegex = new RegExp(`\\b(${INTERNAL_TOKENS.join('|')})\\b`, 'gi');
    cleaned = cleaned.replace(tokenRegex, "");

    // Fix punctuation spacing after token removal
    return cleaned
      .replace(/\s+/g, " ")
      .replace(/\s+([.,!?])/g, "$1")
      .trim();
  };

  /**
   * P0 HOTFIX: Finance Limiter & Advice Duplication Prevention
   */
  const sections = DashboardNoteAdapter.adapt(dailyGuidance).map((section) => {
    let main = humanize(section.main);
    let advice = section.advice ? humanize(section.advice) : undefined;

    // Advice Duplication Prevention
    // If advice repeats the insight or concept too closely, suppress it in presentation.
    if (advice && main.toLowerCase().includes(advice.toLowerCase().substring(0, Math.min(20, advice.length)))) {
      advice = undefined;
    }

    return {
      ...section,
      main,
      advice,
    };
  });

  const greeting = getTimeOfDayGreeting(appNow, isEn ? "en" : "id");
  const cleanName = userName?.trim() || (!isEn ? "Sahabat" : "Friend");
  const conclusion = dailyGuidance?.dailyConclusion?.text;

  const TITLE_MAP_EN: Record<string, string> = {
    general: "Today's Horizon",
    mental: "Mind & Focus",
    finance: "Finance & Abundance",
    love: "Love & Relationships",
    relational: "Close Connections",
    spiritual: "Inner Meaning",
    challenges: "Current Challenges",
    opportunities: "New Opportunities",
  };

  return (
    <section className="mt-10 space-y-6">
      <div className="px-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F6658]">
          {isEn ? "Today's Note" : "Catatan Hari Ini"}
        </h3>
        <p className="mt-1 text-sm font-semibold text-[#4F6658]">{greeting}, {cleanName}.</p>
        <p className="text-sm font-medium text-[#7B8776] mt-1">{appNow.toLocaleDateString(isEn ? "en-US" : "id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}</p>
        <p className="text-xs text-[#9AA394] mt-2 opacity-80 italic">
          {isEn ? "A small note from Bhumi for you." : "Sebuah catatan kecil dari Bhumi untuk kamu."}
        </p>
      </div>

      {state === "limited" && (
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-4 text-xs leading-5 text-[#7B8776]">
          {isEn
            ? "Some supporting sources are not yet available, so this note is compiled only from valid data without invented context."
            : "Beberapa sumber pendukung belum tersedia, jadi catatan ini disusun dari data yang sudah valid tanpa mengarang konteks tambahan."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {sections.map((section) => {
          const Icon = section.icon ? ICON_MAP[section.icon] : null;
          if (!Icon || section.isClosing) return null;

          const sectionTitle = isEn
            ? (TITLE_MAP_EN[section.key || ""] || section.title)
            : (section.key === "finance" ? "Ekonomi & Rezeki" :
               section.key === "love" ? "Asmara & Percintaan" :
               section.title);

          const sectionColor = section.key === "challenges" ? "orange" :
                               section.key === "opportunities" ? "blue" :
                               section.key === "finance" ? "amber" :
                               section.key === "love" ? "rose" :
                               section.key === "spiritual" ? "purple" :
                               section.key === "mental" ? "indigo" :
                               "emerald";

          return (
            <div key={section.key} onMouseEnter={section.key === "general" ? markRead : undefined}>
              <IntelligenceCard
                title={sectionTitle}
                icon={Icon}
                content={section.main}
                advice={section.advice}
                color={sectionColor}
              />
            </div>
          );
        })}
      </div>

      {/* Dedicated Personal Closing */}
      {(conclusion || dailyGuidance.dailyNoteText) && (
        <div className="mt-8 px-1">
          <div className="p-6 rounded-[2rem] bg-[#FCFAF5] border border-[#F1EEE7] shadow-sm relative overflow-hidden">
            {conclusion && (
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">
                {isEn ? "Today's Conclusion" : "Kesimpulan Hari Ini"}
              </p>
            )}
            <p className="text-sm leading-7 text-[#526053] italic">
              &ldquo;{humanize(conclusion || dailyGuidance.dailyNoteText || "")}&rdquo;
            </p>
            <p className="mt-4 text-xs font-bold text-[#4F6658] text-center">- Bhumi -</p>
          </div>
        </div>
      )}
    </section>
  );
}
