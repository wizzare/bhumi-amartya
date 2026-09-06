import { DailyState } from "@/lib/repositories/dailyStateRepository";
import { JourneyDailyRecord, PracticeEffectivenessSummary, PracticeInsightItem } from "@/lib/types/journeyDailyRecord";
import { isEnlEdition } from "@/lib/config/edition";

export type CompletionStatus = "none" | "daily" | "deep" | "full";
export type CompletionItemId =
  | "journal"
  | "meditation"
  | "audio"
  | "manifest"
  | "yoga"
  | "workout"
  | "food";

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
  const isEn = isEnlEdition();
  const manifestLabel = isEn ? "Manifestation" : "Manifestasi";
  const foodLabel = isEn ? "Healthy Eating" : "Makanan Sehat";

  if (!state) {
    return [
      { id: "journal", label: "Journaling", completed: false },
      { id: "meditation", label: "Meditation", completed: false },
      { id: "audio", label: "Audio Healing", completed: false },
      { id: "manifest", label: manifestLabel, completed: false },
      { id: "yoga", label: "Yoga", completed: false },
      { id: "workout", label: "Workout", completed: false },
      { id: "food", label: foodLabel, completed: false },
    ];
  }

  return [
    { id: "journal", label: "Journaling", completed: Boolean(state.journalingDone) },
    { id: "meditation", label: "Meditation", completed: Boolean(state.meditationDone) },
    { id: "audio", label: "Audio Healing", completed: Boolean(state.audioHealingDone) },
    { id: "manifest", label: manifestLabel, completed: Boolean(state.manifestDone) },
    { id: "yoga", label: "Yoga", completed: Boolean(state.yogaDone) },
    { id: "workout", label: "Workout", completed: Boolean(state.workoutDone) },
    { id: "food", label: foodLabel, completed: Boolean(state.herbalDone) },
  ];
}

export function getCompletionSummary(state: DailyState | null): CompletionSummary {
  const isEn = isEnlEdition();
  const items = getCompletionItems(state);
  const count = items.filter((item) => item.completed).length;
  const total = items.length;

  let status: CompletionStatus = "none";
  let label = isEn ? "Start your day" : "Mulai harimu";

  if (count >= total) {
    status = "full";
    label = isEn ? "Fully completed" : "Selesai sepenuhnya";
  } else if (count >= 3) {
    status = "deep";
    label = isEn ? "Deep practice" : "Praktik mendalam";
  } else if (count >= 1) {
    status = "daily";
    label = isEn ? "Rhythm in motion" : "Ritme berjalan";
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

function applyPracticeTypeToDailyState(state: DailyState, practiceType?: string | null): DailyState {
  switch (practiceType) {
    case "journaling":
    case "journal":
      return { ...state, journalingDone: true };
    case "meditation":
      return { ...state, meditationDone: true };
    case "audioHealing":
    case "audio-healing":
      return { ...state, audioHealingDone: true };
    case "manifestation":
    case "manifestasi":
      return { ...state, manifestDone: true };
    case "yoga":
      return { ...state, yogaDone: true };
    case "workout":
      return { ...state, workoutDone: true };
    case "healthyFood":
    case "herbal":
    case "food":
      return { ...state, herbalDone: true };
    default:
      return state;
  }
}

export function mergeDailyStateWithJourneyRecord(
  state: DailyState | null,
  record: JourneyDailyRecord | null,
): DailyState | null {
  if (!record) return state;

  let merged: DailyState = {
    ...(state ?? {
      uid: record.userId,
      date: record.appDate || record.date,
      updatedAt: record.updatedAt || new Date().toISOString(),
    }),
  };

  const completionType = record.innerworkCompletion?.actualPracticeType
    || record.innerworkRecommendation?.practiceType;
  merged = applyPracticeTypeToDailyState(merged, completionType);

  for (const result of record.practiceResults ?? []) {
    merged = applyPracticeTypeToDailyState(merged, result.practiceCategory);
  }

  return merged;
}

export function mergeDailyStatesWithJourneyRecords(
  states: DailyState[],
  records: JourneyDailyRecord[],
): DailyState[] {
  const byDate = new Map(states.map((state) => [state.date, state]));

  for (const record of records) {
    const date = record.appDate || record.date;
    byDate.set(date, mergeDailyStateWithJourneyRecord(byDate.get(date) ?? null, record) as DailyState);
  }

  return Array.from(byDate.values()).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function calculatePracticeEffectiveness(records: JourneyDailyRecord[]): PracticeEffectivenessSummary {
  const isEn = isEnlEdition();
  const last30 = records.slice(0, 30);
  const practiceStats: Record<string, { total: number; helpful: number; heavy: number; neutral: number; unknown: number }> = {};

  last30.forEach(rec => {
    const comp = rec.innerworkCompletion ?? { completed: false, skipped: true };
    if (!comp.completed) return;

    // Resolve practice title/type
    const practice = rec.innerworkRecommendation?.practiceTitle || comp.actualPracticeType || rec.innerworkRecommendation?.practiceType || (isEn ? "Mindfulness Practice" : "Praktik Kesadaran");
    
    if (!practiceStats[practice]) {
      practiceStats[practice] = { total: 0, helpful: 0, heavy: 0, neutral: 0, unknown: 0 };
    }

    practiceStats[practice].total++;
    
    const result = (comp.reflectionResult || "").toLowerCase();
    const helped = comp.practiceHelped;

    if (
      helped === true ||
      result.includes("tenang") || result.includes("helpful") || result.includes("baik") ||
      result.includes("calm") || result.includes("peaceful") || result.includes("good")
    ) {
      practiceStats[practice].helpful++;
    } else if (
      helped === false ||
      result.includes("berat") || result.includes("heavy") || result.includes("susah") ||
      result.includes("hard") || result.includes("difficult")
    ) {
      practiceStats[practice].heavy++;
    } else if (
      result.includes("biasa") || result.includes("neutral") || result.includes("sedang") ||
      result.includes("normal") || result.includes("ordinary") || result.includes("moderate")
    ) {
      practiceStats[practice].neutral++;
    } else {
      practiceStats[practice].unknown++;
    }
  });

  const practiceInsights: PracticeInsightItem[] = [];
  const helpfulPractices: string[] = [];
  const neutralPractices: string[] = [];
  const heavyPractices: string[] = [];
  const unknownPractices: string[] = [];

  Object.entries(practiceStats).forEach(([practice, stats]) => {
    const score = Math.round((stats.helpful / (stats.helpful + stats.neutral + stats.heavy || 1)) * 100);
    practiceInsights.push({ practice, helpfulScore: score });

    if (stats.helpful > 0 && stats.helpful >= stats.heavy) {
      helpfulPractices.push(practice);
    } else if (stats.heavy > 0 && stats.heavy > stats.helpful) {
      heavyPractices.push(practice);
    } else if (stats.neutral > 0) {
      neutralPractices.push(practice);
    } else {
      unknownPractices.push(practice);
    }
  });

  // Fallback if no records exist to ensure "No Coming Soon"
  if (practiceInsights.length === 0) {
    return {
      practiceInsights: [],
      helpfulPractices: [],
      neutralPractices: [],
      heavyPractices: [],
      unknownPractices: []
    };
  }

  return {
    practiceInsights: practiceInsights.sort((a, b) => b.helpfulScore - a.helpfulScore),
    helpfulPractices,
    neutralPractices,
    heavyPractices,
    unknownPractices
  };
}

