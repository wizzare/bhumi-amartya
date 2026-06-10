"use client";

import Link from "next/link";
import type { MeditationEntry } from "@/lib/meditation/createDailyMeditationPractice";

interface MeditationCardProps {
  title?: string;
  duration?: number;
  type?: string;
  theme?: string;
  summary?: string;
  lastEntry?: MeditationEntry | null;
}

export function MeditationCard({
  title,
  duration,
  type,
  theme,
  summary,
  lastEntry,
}: MeditationCardProps) {
  const displayTheme = theme || title || "Meditasi Hari Ini";
  const displaySummary = summary || (duration && type ? `${duration} Minutes / ${type}` : "Praktik singkat untuk kembali mendengar ritme tubuhmu.");

  return (
    <Link href="/meditation" className="block mt-6">
      <div className="bhumi-card p-6 cursor-pointer hover:shadow-lg transition">
        <p className="text-[#7B8776] text-sm">🧘 Meditasi Hari Ini</p>

        <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
          Meditasi membantu tubuh kembali merasa aman sebelum pikiran mencari jawaban. Ambil beberapa menit untuk mendengar ritme tubuhmu hari ini.
        </p>

        <div className="mt-5 rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Tema</p>
          <h2 className="mt-2 text-2xl text-[#4F5E52] font-semibold">
            {displayTheme}
          </h2>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
            Praktik
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{displaySummary}</p>
        </div>

        {lastEntry && (
          <div className="mt-4 rounded-2xl border border-[#E8E9E5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
              Meditasi Terakhir
            </p>
            <p className="mt-2 text-sm text-[#4F5E52]">
              {lastEntry.date} · {lastEntry.theme}
            </p>
            {lastEntry.insight && (
              <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
                {lastEntry.insight}
              </p>
            )}
          </div>
        )}

        <button className="bhumi-button mt-5 pointer-events-none w-full">Mulai Meditasi</button>
      </div>
    </Link>
  );
}
