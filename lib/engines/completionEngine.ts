import { DailyState } from "@/lib/repositories/dailyStateRepository";

export type CompletionStatus = "none" | "daily" | "deep" | "full";
export type CompletionItemId =
  | "journal"
  | "meditation"
  | "audio"
  | "manifest";

export interface CompletionItem {
  id: CompletionItemId;
  label: string;
  completed: boolean;
}

export interface CompletionSummary {
  count: number;
  total: number;
  status: CompletionStatus;
  label: string;
  isUnlocked: boolean; // Unlocked if count >= 1 (Sprint 37A adjustment)
  items: CompletionItem[];
}

export function getCompletionItems(state: DailyState | null): CompletionItem[] {
  if (!state) {
    return [
      { id: "journal", label: "Journaling", completed: false },
      { id: "meditation", label: "Meditation", completed: false },
      { id: "audio", label: "Audio Healing", completed: false },
      { id: "manifest", label: "Manifestasi", completed: false },
    ];
  }

  return [
    { id: "journal", label: "Journaling", completed: Boolean(state.journalingDone) },
    { id: "meditation", label: "Meditation", completed: Boolean(state.meditationDone) },
    { id: "audio", label: "Audio Healing", completed: Boolean(state.audioHealingDone) },
    { id: "manifest", label: "Manifestasi", completed: Boolean(state.manifestDone) },
  ];
}

export function getCompletionSummary(state: DailyState | null): CompletionSummary {
  const items = getCompletionItems(state);
  const count = items.filter((item) => item.completed).length;
  const total = items.length;

  let status: CompletionStatus = "none";
  let label = "Mulai harimu";

  if (count >= total) {
    status = "full";
    label = "Selesai sepenuhnya";
  } else if (count >= 3) {
    status = "deep";
    label = "Praktik mendalam";
  } else if (count >= 1) {
    status = "daily";
    label = "Ritme berjalan";
  }

  return {
    count,
    total,
    status,
    label,
    isUnlocked: count >= 1,
    items,
  };
}
