import {
  createHealingInsights,
  loadHealingInsights,
  refreshHealingInsights,
  type HealingInsightResult,
  type HealingTheme,
} from "@/lib/healing/createHealingInsights";
import {
  readOwnedCacheArray,
  readOwnedCacheObject,
  writeOwnedCacheObject,
} from "@/lib/storage/derivedCacheOwnership";
import { auth } from "@/lib/firebase/firebase";

export const JOURNEY_STORAGE_KEY = "bhumiJourneyData";

function getScopedJourneyKey(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) return JOURNEY_STORAGE_KEY;
  return `${JOURNEY_STORAGE_KEY}:${uid}`;
}

type UnknownRecord = Record<string, unknown>;

export type HealingStage =
  | "Awareness"
  | "Acceptance"
  | "Release"
  | "Rebuilding"
  | "Integration"
  | "Alignment";

export type JourneyData = {
  uid?: string;
  currentStage: {
    stage: HealingStage;
    label: string;
    reason: string;
  };
  dominantThemes: Array<{
    theme: HealingTheme;
    frequency: number;
    reason: string;
  }>;
  progressSummary: {
    journalEntries: number;
    meditationSessions: number;
    audioHealingSessions: number;
    currentStreak: number;
  };
  timeline: Array<{
    date: string;
    dominantTheme: string;
    activityType: "Journal" | "Meditasi" | "Audio Healing" | "Milestone";
  }>;
  weeklyFocus: {
    theme: HealingTheme;
    why: string;
  };
  recommendedNextStep: {
    journal: string;
    meditation: string;
    audioHealing: string;
  };
  updatedAt: string;
  source: "local-journey-mvp";
  futureHooks: {
    geminiAnalysis: boolean;
    pushNotifications: boolean;
    aiCompanion: boolean;
    premiumInsights: boolean;
  };
};

type JourneyInput = {
  blueprint?: UnknownRecord | null;
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  healingInsights?: HealingInsightResult | null;
};

function parseDate(value: unknown): string {
  if (typeof value === "string" && value.trim()) {
    return value.slice(0, 10);
  }

  return new Date().toISOString().slice(0, 10);
}

function formatDateId(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function getEntryTheme(entry: UnknownRecord, fallback: string): string {
  return typeof entry.theme === "string" && entry.theme.trim()
    ? entry.theme
    : fallback;
}

function uniqueActivityDates(entries: UnknownRecord[]): Set<string> {
  return new Set(entries.map((entry) => parseDate(entry.date || entry.createdAt)));
}

function calculateCurrentStreak(entries: UnknownRecord[]): number {
  const activeDates = uniqueActivityDates(entries);
  let streak = 0;
  const cursor = new Date();

  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function determineStage(input: {
  totalActivities: number;
  currentStreak: number;
  dominantThemeCount: number;
  emotionalPatternCount: number;
}): JourneyData["currentStage"] {
  const { totalActivities, currentStreak, dominantThemeCount, emotionalPatternCount } = input;

  if (totalActivities >= 45 && currentStreak >= 10 && dominantThemeCount >= 4) {
    return {
      stage: "Alignment",
      label: "Kemungkinan fase yang sedang kamu jalani: Alignment",
      reason: "Aktivitasmu terlihat konsisten, tema-tema mulai terpetakan, dan praktik sudah menjadi bagian dari ritme mingguan.",
    };
  }

  if (totalActivities >= 30 && currentStreak >= 5) {
    return {
      stage: "Integration",
      label: "Kemungkinan fase yang sedang kamu jalani: Integration",
      reason: "Kamu sudah memiliki cukup jejak praktik untuk mulai mengintegrasikan pola baru ke rutinitas harian.",
    };
  }

  if (totalActivities >= 18) {
    return {
      stage: "Rebuilding",
      label: "Kemungkinan fase yang sedang kamu jalani: Rebuilding",
      reason: "Data aktivitas menunjukkan kamu mulai membangun respons baru setelah beberapa tema berulang terlihat.",
    };
  }

  if (totalActivities >= 10 && emotionalPatternCount >= 2) {
    return {
      stage: "Release",
      label: "Kemungkinan fase yang sedang kamu jalani: Release",
      reason: "Beberapa pola emosi mulai muncul berulang, sehingga fase ini bisa berkaitan dengan melepaskan respons lama secara bertahap.",
    };
  }

  if (totalActivities >= 4) {
    return {
      stage: "Acceptance",
      label: "Kemungkinan fase yang sedang kamu jalani: Acceptance",
      reason: "Kamu mulai memberi ruang pada pengalaman batin dan tubuhmu tanpa harus langsung mengubah semuanya.",
    };
  }

  return {
    stage: "Awareness",
    label: "Kemungkinan fase yang sedang kamu jalani: Awareness",
    reason: "Data masih awal, jadi fokus utamanya adalah melihat pola dengan lembut dan mulai mengenali sinyal tubuh serta emosi.",
  };
}

export function createJourneyData({
  blueprint,
  journalEntries = [],
  meditationEntries = [],
  audioHealingEntries = [],
  healingInsights,
}: JourneyInput): JourneyData {
  const allEntries = [...journalEntries, ...meditationEntries, ...audioHealingEntries];
  const insights = healingInsights ?? createHealingInsights({
    journalEntries,
    meditationEntries,
    audioHealingEntries,
    blueprint,
  });
  const progressSummary = {
    journalEntries: journalEntries.length,
    meditationSessions: meditationEntries.length,
    audioHealingSessions: audioHealingEntries.length,
    currentStreak: calculateCurrentStreak(allEntries),
  };
  const totalActivities = allEntries.length;
  const timeline = [
    ...journalEntries.map((entry) => ({
      date: parseDate(entry.date || entry.createdAt),
      dominantTheme: getEntryTheme(entry, insights.weeklyFocus.theme),
      activityType: "Journal" as const,
    })),
    ...meditationEntries.map((entry) => ({
      date: parseDate(entry.date || entry.createdAt),
      dominantTheme: getEntryTheme(entry, insights.weeklyFocus.theme),
      activityType: "Meditasi" as const,
    })),
    ...audioHealingEntries.map((entry) => ({
      date: parseDate(entry.date || entry.createdAt),
      dominantTheme: typeof entry.emotionalState === "string" && entry.emotionalState
        ? entry.emotionalState
        : "Audio Healing",
      activityType: "Audio Healing" as const,
    })),
    ...(journalEntries.length >= 1 ? [{
      date: parseDate(journalEntries[0]?.date || journalEntries[0]?.createdAt),
      dominantTheme: "Journal pertamamu mulai menjadi jejak perjalanan.",
      activityType: "Milestone" as const,
    }] : []),
    ...(meditationEntries.length >= 1 ? [{
      date: parseDate(meditationEntries[0]?.date || meditationEntries[0]?.createdAt),
      dominantTheme: "Meditasi pertamamu memberi tubuh ruang untuk didengar.",
      activityType: "Milestone" as const,
    }] : []),
    ...(audioHealingEntries.length >= 1 ? [{
      date: parseDate(audioHealingEntries[0]?.date || audioHealingEntries[0]?.createdAt),
      dominantTheme: "Audio healing pertamamu menjadi jangkar grounding.",
      activityType: "Milestone" as const,
    }] : []),
    ...(progressSummary.currentStreak >= 7 ? [{
      date: new Date().toISOString().slice(0, 10),
      dominantTheme: `${progressSummary.currentStreak} hari kamu kembali pada diri sendiri.`,
      activityType: "Milestone" as const,
    }] : []),
    ...(totalActivities >= 10 ? [{
      date: new Date().toISOString().slice(0, 10),
      dominantTheme: "10 jejak innerwork sudah terkumpul.",
      activityType: "Milestone" as const,
    }] : []),
  ]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-12);
  const dominantThemes = insights.dominantThemes.map((item) => ({
    theme: item.theme,
    frequency: item.score,
    reason: item.reason,
  }));
  const currentStage = determineStage({
    totalActivities,
    currentStreak: progressSummary.currentStreak,
    dominantThemeCount: dominantThemes.length,
    emotionalPatternCount: insights.emotionalPatterns.length,
  });

  return {
    currentStage,
    dominantThemes,
    progressSummary,
    timeline,
    weeklyFocus: {
      theme: insights.weeklyFocus.theme,
      why: insights.weeklyFocus.whyDetected,
    },
    recommendedNextStep: {
      journal: insights.recommendedJournal,
      meditation: insights.recommendedMeditation,
      audioHealing: insights.recommendedAudioHealing,
    },
    updatedAt: new Date().toISOString(),
    source: "local-journey-mvp",
    futureHooks: {
      geminiAnalysis: true,
      pushNotifications: true,
      aiCompanion: true,
      premiumInsights: true,
    },
  };
}

export function refreshJourneyData(): JourneyData | null {
  if (typeof window === "undefined") return null;

  try {
    const authUid = auth.currentUser?.uid;
    // Fallback search for scoped profile
    let uid = authUid;
    if (!uid) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('bhumiProfile:')) {
          uid = key.split(':')[1];
          break;
        }
      }
    }

    if (!uid) return null;

    const journalEntries = readOwnedCacheArray<UnknownRecord>(`bhumiJournalEntries:${uid}`, "journey:journalEntries");
    const meditationEntries = readOwnedCacheArray<UnknownRecord>(`bhumiMeditationEntries:${uid}`, "journey:meditationEntries");
    const audioHealingEntries = readOwnedCacheArray<UnknownRecord>(`bhumiAudioHealingEntries:${uid}`, "journey:audioHealingEntries");
    const blueprint = readOwnedCacheObject<UnknownRecord>(`bhumiBlueprint:${uid}`, "journey:blueprint");
    const healingInsights = loadHealingInsights() ?? refreshHealingInsights();
    const result = createJourneyData({
      journalEntries,
      meditationEntries,
      audioHealingEntries,
      blueprint,
      healingInsights,
    });

    const scopedKey = getScopedJourneyKey();
    const ownedResult = writeOwnedCacheObject(scopedKey, result, "journey");

    if (scopedKey !== JOURNEY_STORAGE_KEY) {
      window.localStorage.removeItem(JOURNEY_STORAGE_KEY);
    }

    console.log("[JOURNEY SOURCE]", {
      source: "local-derived-refresh",
      journalCount: journalEntries.length,
      meditationCount: meditationEntries.length,
      audioHealingCount: audioHealingEntries.length,
      uid: ownedResult.uid ?? null,
    });
    return ownedResult;
  } catch (error) {
    console.error("[Journey Data] Failed to refresh", error);
    return null;
  }
}

export function loadJourneyData(): JourneyData | null {
  if (typeof window === "undefined") return null;

  try {
    const scopedKey = getScopedJourneyKey();
    const cached = readOwnedCacheObject<JourneyData>(scopedKey, "journey");
    console.log("[JOURNEY SOURCE]", {
      source: cached ? "local-derived-cache" : "local-derived-refresh",
      uid: cached?.uid ?? null,
    });
    return cached ?? refreshJourneyData();
  } catch {
    return refreshJourneyData();
  }
}

export function formatJourneyTimelineDate(date: string): string {
  return formatDateId(date);
}
