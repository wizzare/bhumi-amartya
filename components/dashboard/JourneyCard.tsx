"use client";

import Link from "next/link";
import type { JourneyData } from "@/lib/journey/createJourneyData";

type JourneyCardProps = {
  journey: JourneyData | null;
};

export function JourneyCard({ journey }: JourneyCardProps) {
  return (
    <Link href="/journey" className="mt-6 block">
      <div className="bhumi-card cursor-pointer p-6 transition hover:shadow-lg">
        <p className="text-sm text-[#7B8776]">🌱 Perjalanan Jiwa</p>
        <h2 className="mt-4 text-2xl font-semibold text-[#4F5E52]">
          {journey?.currentStage.stage || "Awareness"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
          {journey?.weeklyFocus.theme
            ? `Fokus saat ini: ${journey.weeklyFocus.theme}.`
            : "Lihat pola perjalanan healing yang mulai terbentuk dari aktivitasmu."}
        </p>
        {journey?.timeline.length ? (
          <div className="mt-4 space-y-2">
            {journey.timeline.slice(-3).map((item) => (
              <div key={`${item.date}-${item.activityType}-${item.dominantTheme}`} className="rounded-2xl bg-[#F7F8F5] px-3 py-2">
                <p className="text-xs font-medium text-[#4F5E52]">{item.activityType} · {item.date}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#7B8776]">{item.dominantTheme}</p>
              </div>
            ))}
          </div>
        ) : null}
        <p className="mt-5 text-sm font-medium text-[#9BB89A]">
          Lihat Perjalanan →
        </p>
      </div>
    </Link>
  );
}
