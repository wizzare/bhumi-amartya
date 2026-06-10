"use client";

import Link from "next/link";
import type { AudioHealingEntry } from "@/lib/audioHealing/localAudioHealing";

interface HealingAudioProps {
  title?: string;
  frequency?: string;
  lastEntry?: AudioHealingEntry | null;
}

export function HealingAudio({ title, frequency, lastEntry }: HealingAudioProps) {
  return (
    <Link href="/healing/audio" className="block mt-6">
      <div className="bhumi-card p-6 cursor-pointer hover:shadow-lg transition">
        <p className="text-[#7B8776] text-sm">🎧 Audio Healing</p>

        <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
          Audio healing membantu tubuh dan pikiran masuk ke ritme yang lebih tenang. Dengarkan perlahan, lalu perhatikan respons tubuhmu.
        </p>

        {lastEntry ? (
          <div className="mt-5 rounded-2xl border border-[#E8E9E5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">
              Audio Terakhir
            </p>
            <p className="mt-2 text-sm text-[#4F5E52]">
              {lastEntry.date} · {lastEntry.emotionalState || "Refleksi audio"}
            </p>
            {lastEntry.insight && (
              <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
                {lastEntry.insight}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#FCFAF5] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Pilihan Audio</p>
            <h2 className="mt-2 text-2xl text-[#4F5E52] font-semibold">
              {frequency || title || "Playlist Healing"}
            </h2>
          </div>
        )}

        <button className="bhumi-button mt-5 pointer-events-none w-full">Mulai Audio Healing</button>
      </div>
    </Link>
  );
}
