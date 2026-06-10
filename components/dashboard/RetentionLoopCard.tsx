import type { AdaptiveRetentionOutput } from "@/lib/retention/adaptiveRetentionEngine";

type RetentionLoopCardProps = {
  retention: AdaptiveRetentionOutput | null;
};

export function RetentionLoopCard({ retention }: RetentionLoopCardProps) {
  if (!retention) return null;

  return (
    <section className="mb-6 rounded-3xl border border-[#DDE7DB] bg-[#F7FBF4] p-5">
      <p className="text-sm font-semibold text-[#4F5E52]">Hari Ini</p>
      <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{retention.todayReflection}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-medium text-[#7B8776]">Yang berubah sejak kemarin</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{retention.changedSinceYesterday}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-4">
          <p className="text-xs font-medium text-[#7B8776]">Progress yang sudah terbentuk</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{retention.progressMade}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/70 p-4">
        <p className="text-xs font-medium text-[#7B8776]">Refleksi minggu ini</p>
        <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{retention.weeklyReflection}</p>
      </div>
    </section>
  );
}
