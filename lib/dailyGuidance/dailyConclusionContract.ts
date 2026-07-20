import type { DailyConclusion, DailyGuidance } from "@/lib/dailyGuidance/types";

export type MirrorDailyConclusionContract = {
  localDateKey: string;
  timezone: string;
  dailyConclusion: DailyConclusion;
};

export function getCanonicalDailyConclusion(guidance: DailyGuidance | null | undefined): DailyConclusion | null {
  return guidance?.dailyConclusion ?? null;
}

export function buildMirrorDailyConclusionContract(guidance: DailyGuidance | null | undefined): MirrorDailyConclusionContract | null {
  const dailyConclusion = getCanonicalDailyConclusion(guidance);
  if (!dailyConclusion) return null;

  return {
    localDateKey: dailyConclusion.localDateKey,
    timezone: dailyConclusion.timezone,
    dailyConclusion,
  };
}
