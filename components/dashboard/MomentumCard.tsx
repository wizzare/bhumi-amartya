import type { MomentumOutput } from "@/lib/momentum/momentumEngine";
import { translations } from "@/lib/data/translations";

type MomentumCardProps = {
  momentum: MomentumOutput | null;
  language?: "id" | "en";
};

export function MomentumCard({ momentum, language = "id" }: MomentumCardProps) {
  if (!momentum) return null;
  const t = translations[language].dashboard.momentum;

  const MOMENTUM_LABEL: Record<MomentumOutput["momentumLevel"], string> = {
    restarting: t.restarting,
    stabilizing: t.stabilizing,
    growing: t.growing,
    thriving: t.thriving,
  };

  return (
    <section className="mb-6 rounded-3xl border border-[#E8E9E5] bg-white p-5">
      <p className="text-sm font-semibold text-[#4F5E52]">{t.title}</p>
      <div className="mt-4 rounded-2xl bg-[#F7F8F5] p-4">
        <p className="text-xs font-medium text-[#7B8776]">{t.currentMomentum}</p>
        <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">
          {MOMENTUM_LABEL[momentum.momentumLevel]}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#6C7A6F]">{momentum.reflection}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-medium text-[#7B8776]">{t.whatChanged}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{momentum.whatChanged}</p>
        </div>
        <div className="rounded-2xl bg-[#FCFAF5] p-4">
          <p className="text-xs font-medium text-[#7B8776]">{t.currentStreak}</p>
          <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">
            {momentum.currentStreak} {t.streakUnit}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-[#F4FBF1] p-4">
        <p className="text-xs font-medium text-[#7B8776]">{t.nextMilestone}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">{momentum.nextMilestone}</p>
      </div>
    </section>
  );
}
