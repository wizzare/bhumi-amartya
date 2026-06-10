import Link from "next/link";
import type { HealingMemoryOutput } from "@/lib/healing/healingMemoryEngine";

type HealingMemoryCardProps = {
  memory: HealingMemoryOutput | null;
};

export function HealingMemoryCard({ memory }: HealingMemoryCardProps) {
  if (!memory) {
    return (
      <section className="rounded-3xl border border-[#E8E9E5] bg-white p-5">
        <p className="text-sm font-semibold text-[#4F5E52]">🌱 Perjalanan Penyembuhan</p>
        <p className="mt-2 text-sm text-[#7B8776]">
          Mulai journal, meditasi, atau audio healing untuk melihat peta perjalanan penyembuhanmu.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-[#E8E9E5] bg-white p-5">
      <p className="text-sm font-semibold text-[#4F5E52]">🌱 Perjalanan Penyembuhan</p>
      
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-[#F4FBF1] to-[#FCFAF5] p-4">
        <p className="text-xs font-medium text-[#7B8776]">Current Healing Stage</p>
        <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{memory.healingStage}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#6C7A6F]">
          {memory.healingStageExplanation}
        </p>
      </div>

      <div className="mt-4 rounded-2xl bg-[#F7F8F5] p-4">
        <p className="text-xs font-medium text-[#7B8776]">Yang Bhumi ingat</p>
        <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{memory.memoryReflection}</p>
        <p className="mt-3 text-xs text-[#7B8776]">
          {memory.completedPractices} jejak tersimpan · streak {memory.currentStreak} hari
        </p>
      </div>

      {memory.dominantThemes.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#7B8776]">Yang Sering Muncul</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {memory.dominantThemes.slice(0, 3).map((item) => (
              <span
                key={item.theme}
                className="rounded-full bg-[#F7F8F5] px-3 py-1 text-xs text-[#4F5E52]"
              >
                {item.theme} ({item.count}x)
              </span>
            ))}
          </div>
        </div>
      )}

      {memory.growthIndicators.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#7B8776]">Growth Indicators</p>
          <p className="mt-2 text-sm text-[#6C7A6F]">
            {memory.growthIndicators[0]}
          </p>
        </div>
      )}

      <Link
        href="/journey"
        className="mt-4 inline-flex rounded-full bg-[#4F5E52] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#3D4A3F]"
      >
        Lihat Perjalanan →
      </Link>
    </section>
  );
}
