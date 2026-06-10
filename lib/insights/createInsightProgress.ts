import type { HealingStage } from "@/lib/journey/createJourneyData";
import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";

export const PROGRESS_STORAGE_KEY = "bhumiProgressData";

type UnknownRecord = Record<string, unknown>;

type ThemeTrend = "up" | "down" | "stable";

export type ProgressTheme = {
  theme: string;
  frequency: number;
  trend: ThemeTrend;
};

export type ProgressCount = {
  value: string;
  frequency: number;
};

export type ProgressMilestone = {
  label: string;
  unlocked: boolean;
};

export type ProgressData = {
  uid?: string;
  totalJournalEntries: number;
  totalMeditationEntries: number;
  totalAudioHealingEntries: number;
  streakDays: number;
  consistencyScore: number;
  currentStage: HealingStage;
  milestones: ProgressMilestone[];
  dominantThemes: ProgressTheme[];
  emotionalStates: ProgressCount[];
  bodySignals: ProgressCount[];
  updatedAt: string;
};

function parseDate(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.slice(0, 10);
}

function countBy(entries: UnknownRecord[], field: string): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  entries.forEach((entry) => {
    const value = entry[field];
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim();
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  });
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function countBodySignals(entries: UnknownRecord[]): Array<{ key: string; count: number }> {
  const counts = new Map<string, number>();
  entries.forEach((entry) => {
    if (!Array.isArray(entry.bodySignals)) return;
    entry.bodySignals.forEach((item) => {
      if (typeof item === "string" && item.trim()) {
        const normalized = item.trim();
        counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
      }
    });
  });
  return [...counts.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

function calculateStreak(entries: UnknownRecord[]): number {
  const days = new Set(
    entries
      .map((entry) => parseDate(entry.date) ?? parseDate(entry.createdAt))
      .filter((item): item is string => Boolean(item)),
  );
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const day = cursor.toISOString().slice(0, 10);
    if (!days.has(day)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateConsistencyScore(entries: UnknownRecord[], streak: number): number {
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const recentDays = new Set(
    entries
      .map((entry) => parseDate(entry.date) ?? parseDate(entry.createdAt))
      .filter((item): item is string => Boolean(item))
      .filter((day) => day >= sevenDaysAgo.toISOString().slice(0, 10)),
  );

  const totalActivityScore = Math.min(50, Math.round((entries.length / 30) * 50));
  const streakScore = Math.min(30, streak * 3);
  const recentScore = Math.min(20, Math.round((recentDays.size / 7) * 20));

  return Math.max(0, Math.min(100, totalActivityScore + streakScore + recentScore));
}

function determineStage(totalActivities: number, streak: number, emotionalCount: number): HealingStage {
  if (totalActivities >= 45 && streak >= 10) return "Alignment";
  if (totalActivities >= 30 && streak >= 6) return "Integration";
  if (totalActivities >= 18) return "Rebuilding";
  if (totalActivities >= 10 && emotionalCount >= 2) return "Release";
  if (totalActivities >= 4) return "Acceptance";
  return "Awareness";
}

function calculateThemeTrends(entries: UnknownRecord[]): ProgressTheme[] {
  const today = new Date();
  const currentStart = new Date(today);
  currentStart.setDate(today.getDate() - 6);
  const previousStart = new Date(today);
  previousStart.setDate(today.getDate() - 13);
  const previousEnd = new Date(today);
  previousEnd.setDate(today.getDate() - 7);

  const allThemeCounts = countBy(entries, "theme").slice(0, 7);
  return allThemeCounts.map(({ key, count }) => {
    let currentCount = 0;
    let previousCount = 0;
    entries.forEach((entry) => {
      if (entry.theme !== key) return;
      const day = parseDate(entry.date) ?? parseDate(entry.createdAt);
      if (!day) return;
      if (day >= currentStart.toISOString().slice(0, 10)) currentCount += 1;
      if (day >= previousStart.toISOString().slice(0, 10) && day <= previousEnd.toISOString().slice(0, 10)) {
        previousCount += 1;
      }
    });
    const trend: ThemeTrend =
      currentCount > previousCount ? "up" : currentCount < previousCount ? "down" : "stable";
    return {
      theme: key,
      frequency: count,
      trend,
    };
  });
}

export function createProgressData(input: {
  journalEntries: UnknownRecord[];
  meditationEntries: UnknownRecord[];
  audioHealingEntries: UnknownRecord[];
  compiledInnerwork: UnknownRecord | null;
}): ProgressData {
  const { journalEntries, meditationEntries, audioHealingEntries, compiledInnerwork } = input;
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const streakDays = calculateStreak(allEntries);
  const emotionalStates = countBy(allEntries, "emotionalState")
    .slice(0, 5)
    .map((item) => ({ value: item.key, frequency: item.count }));
  const bodySignals = countBodySignals(allEntries)
    .slice(0, 5)
    .map((item) => ({ value: item.key, frequency: item.count }));
  const dominantThemes = calculateThemeTrends(allEntries);
  const consistencyScore = calculateConsistencyScore(allEntries, streakDays);
  const currentStage = determineStage(allEntries.length, streakDays, emotionalStates.length);
  const milestones: ProgressMilestone[] = [
    { label: "Penulis Pertama", unlocked: journalEntries.length >= 1 },
    { label: "Meditasi Pertama", unlocked: meditationEntries.length >= 1 },
    { label: "Audio Healing Pertama", unlocked: audioHealingEntries.length >= 1 },
    { label: "7 Hari Bertumbuh", unlocked: streakDays >= 7 },
    { label: "30 Refleksi", unlocked: journalEntries.length >= 30 },
    { label: "10 Sesi Meditasi", unlocked: meditationEntries.length >= 10 },
    { label: "10 Sesi Audio", unlocked: audioHealingEntries.length >= 10 },
    { label: "Insight Pertama", unlocked: Boolean(compiledInnerwork) },
  ];

  return {
    totalJournalEntries: journalEntries.length,
    totalMeditationEntries: meditationEntries.length,
    totalAudioHealingEntries: audioHealingEntries.length,
    streakDays,
    consistencyScore,
    currentStage,
    milestones,
    dominantThemes,
    emotionalStates,
    bodySignals,
    updatedAt: new Date().toISOString(),
  };
}

export function refreshProgressData(): ProgressData | null {
  if (typeof window === "undefined") return null;

  try {
    const journalEntries = readOwnedCacheArray<UnknownRecord>("bhumiJournalEntries", "progress:journalEntries");
    const meditationEntries = readOwnedCacheArray<UnknownRecord>("bhumiMeditationEntries", "progress:meditationEntries");
    const audioHealingEntries = readOwnedCacheArray<UnknownRecord>("bhumiAudioHealingEntries", "progress:audioHealingEntries");
    const compiledInnerwork = readOwnedCacheObject<UnknownRecord>("bhumiCompiledInnerwork", "progress:compiledInnerwork");

    const result = createProgressData({
      journalEntries,
      meditationEntries,
      audioHealingEntries,
      compiledInnerwork,
    });
    return writeOwnedCacheObject(PROGRESS_STORAGE_KEY, result, "progress");
  } catch (error) {
    console.error("[Progress Data] Failed to refresh", error);
    return null;
  }
}

export function loadProgressData(): ProgressData | null {
  if (typeof window === "undefined") return null;
  try {
    return readOwnedCacheObject<ProgressData>(PROGRESS_STORAGE_KEY, "progress") ?? refreshProgressData();
  } catch {
    return refreshProgressData();
  }
}
