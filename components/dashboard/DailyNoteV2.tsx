"use client";

import React from "react";
import { Compass, Brain, Wallet, Heart, Users, Sparkles, ShieldAlert, Sprout } from "lucide-react";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { DailyState } from "@/lib/repositories/dailyStateRepository";
import type { NavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { useAuth } from "@/context/AuthContext";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { DashboardNoteAdapter } from "@/lib/dailyGuidance/dashboardNoteAdapter";

interface DailyNoteV2Props {
  dailyGuidance: DailyGuidance | null;
  focus?: string;
  language: "id" | "en";
  userName: string;
  dailyState: DailyState | null;
  yesterdayState: DailyState | null;
  recentDailyStates: DailyState[];
  navigatorState: NavigatorState | null;
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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
  language,
  userName,
}: DailyNoteV2Props) {
  const auth = useAuth();
  const firstName = userName.split(" ")[0] || "Jiwa";

  React.useEffect(() => {
    if (dailyGuidance) trackEvent("open_daily_note", auth?.user?.uid);
  }, [dailyGuidance, auth?.user?.uid]);

  if (!dailyGuidance?.categories) {
    return (
      <section className="mt-8 space-y-4">
        <h3 className="px-1 text-2xl font-serif font-bold text-[#4F6658]">Catatan dari Bhumi untuk Kamu</h3>
        <div className="bhumi-card border border-[#E8E9E5]/50 bg-[#FCFAF5] p-8 text-center text-sm italic text-[#7B8776]">
          {language === "id" ? "Catatanmu sedang dirapikan sebentar..." : "Your letter is being written..."}
        </div>
      </section>
    );
  }

  const markRead = () => {
    if (!auth?.user?.uid) return;
    const dateKey = dailyGuidance.localDateKey || dailyGuidance.date || new Date().toISOString().slice(0, 10);
    void dailyStateRepository.saveDailyState(auth.user.uid, dateKey, { dailyNoteDone: true });
  };

  const sections = DashboardNoteAdapter.adapt(dailyGuidance);

  return (
    <section className="mt-10 space-y-4">
      <div className="px-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F6658]">Catatan dari Bhumi untuk Kamu</h3>
      </div>

      <article
        onMouseEnter={markRead}
        className="bhumi-card max-h-[72vh] overflow-y-auto border-none bg-white p-7 shadow-sm sm:p-8"
      >
        <div className="space-y-9">
          <header className="space-y-4 border-b border-[#F1EEE7] pb-7">
            <p className="font-serif text-xl font-bold text-[#4F6658]">Hai {firstName},</p>
            <p className="text-sm leading-7 text-[#526053]">
              Hari ini ada beberapa hal yang ingin Bhumi ceritakan padamu. Nggak perlu buru-buru menyelesaikannya kok.
              Anggap saja tulisan ini sebagai teman duduk yang menemanimu melihat apa yang sedang bergerak hari ini.
            </p>
          </header>

          {sections.map((section) => {
            const Icon = section.icon ? ICON_MAP[section.icon] : null;

            if (section.isClosing) {
              return (
                <section key={section.key || "closing"} className="space-y-4 border-t border-[#F1EEE7] pt-8">
                  <div className="flex items-center gap-3 text-[#4F6658]">
                    {Icon && <Icon size={20} />}
                    <h4 className="font-serif text-lg font-bold">{section.title}</h4>
                  </div>
                  <p className="text-sm leading-7 text-[#3C3C3C]">{section.main}</p>
                </section>
              );
            }

            return (
              <section key={section.key} className="space-y-4">
                <div className="flex items-center gap-3 text-[#4F6658]">
                  <span className="rounded-2xl bg-[#FCFAF5] p-2.5">
                    {Icon && <Icon size={19} />}
                  </span>
                  <h4 className="font-serif text-lg font-bold">{section.title}</h4>
                </div>
                <p className="text-sm leading-7 text-[#3C3C3C]">{section.main}</p>
                {section.advice && (
                  <div className="rounded-2xl bg-[#F5F1E8]/55 p-4">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B8776]">Saran dari Bhumi</p>
                    <p className="text-sm leading-6 text-[#526053]">{section.advice}</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </article>
    </section>
  );
}
