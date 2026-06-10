"use client";

import Link from "next/link";
import type { LocalJournalEntry } from "@/lib/journal/localJournal";

interface JournalingPromptProps {
  prompt?: string;
  theme?: string;
  question?: string;
  lastEntry?: LocalJournalEntry | null;
}

export function JournalingPrompt({
  prompt,
  theme,
  question,
  lastEntry,
}: JournalingPromptProps) {
  const displayTheme = theme || "Refleksi Hari Ini";
  const displayQuestion = question || prompt || "Apa yang paling ingin didengar oleh hatimu hari ini?";

  return (
    <Link href="/journal" className="block mt-6">
      <div className="bhumi-card p-6 cursor-pointer hover:shadow-lg transition">
        <p className="text-[#7B8776] text-sm">📖 Journaling Hari Ini</p>

        <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
          Menulis membantu menyadari pola yang sering tidak terlihat saat hanya dipikirkan. Luangkan beberapa menit untuk mendengar isi hatimu hari ini.
        </p>

        <div className="mt-5 rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Tema</p>
          <h2 className="mt-2 text-xl leading-snug text-[#4F5E52] font-semibold">
            {displayTheme}
          </h2>

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Pertanyaan</p>
          <p className="mt-2 text-base leading-relaxed text-[#4F5E52] whitespace-pre-line">
            {displayQuestion}
          </p>
        </div>

        {lastEntry && (
          <div className="mt-4 rounded-2xl border border-[#E8E9E5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
              Refleksi Terakhir
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

        <button className="bhumi-button mt-5 pointer-events-none w-full">
          Mulai Journaling
        </button>
      </div>
    </Link>
  );
}
