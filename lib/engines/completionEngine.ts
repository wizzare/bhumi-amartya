import { DailyState } from "@/lib/repositories/dailyStateRepository";

export type CompletionStatus = "none" | "daily" | "deep" | "full";

export interface CompletionSummary {
  count: number;
  status: CompletionStatus;
  label: string;
  isUnlocked: boolean; // Unlocked if count >= 2
}

export function getCompletionSummary(state: DailyState | null): CompletionSummary {
  if (!state) {
    return { count: 0, status: "none", label: "Belum ada aktivitas", isUnlocked: false };
  }

  const activities = [
    state.journalingDone,
    state.meditationDone,
    state.audioHealingDone,
    state.workoutDone,
    state.yogaDone,
    state.herbalDone
  ];

  const count = activities.filter(Boolean).length;

  let status: CompletionStatus = "none";
  let label = "Mulai hari ini";

  if (count >= 6) {
    status = "full";
    label = "Full Integration";
  } else if (count >= 4) {
    status = "deep";
    label = "Deep Practice";
  } else if (count >= 2) {
    status = "daily";
    label = "Daily Completion";
  }

  return {
    count,
    status,
    label,
    isUnlocked: count >= 2
  };
}
