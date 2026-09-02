import type { JournalEntry } from "@/lib/data/types";
import type { MeditationEntry } from "@/lib/meditation/createDailyMeditationPractice";
import type { AudioHealingEntry } from "@/lib/audioHealing/localAudioHealing";
import type { PhysicalActivity } from "@/lib/repositories/activityRepository";

export interface ProgressMetrics {
  totalJournalEntries: number;
  totalMeditationEntries: number;
  totalAudioHealingEntries: number;
  totalPhysicalActivities: number; // Build 31.35
  totalEntries: number;
  streakDays: number;
  consistencyScore: number;
  dominantThemes: Array<{ theme: string; frequency: number; trend: "up" | "down" | "stable" }>;
  journeyPhase: "Awareness" | "Acceptance" | "Release" | "Rebuilding" | "Integration" | "Alignment";
  milestones: string[];
  emotionalStates: Array<{ emotion: string; frequency: number }>;
  bodySignals: Array<{ signal: string; frequency: number }>;
  physicalActivityDiversity: Array<{ category: string; count: number }>; // Build 31.35
  lastActivityDate: string | null;
  // R-PRD-18 / R-XC-02: distinct days with any activity in the trailing 30 days.
  // This is the no-pressure progress signal — missing a day does not reset it.
  // `streakDays` above is retained as a raw metric only; it must not drive a
  // "don't break the chain" UI.
  activeDays30: number;
  updatedAt: string;
}

export interface ProgressInput {
  journalEntries: JournalEntry[];
  meditationEntries: MeditationEntry[];
  audioHealingEntries: AudioHealingEntry[];
  physicalActivities?: PhysicalActivity[]; // Build 31.35
}

// Helper: Get unique dates with activities
function getActivityDates(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
  physicalActivities: PhysicalActivity[] = []
): Set<string> {
  const dates = new Set<string>();

  journalEntries.forEach((entry) => {
    const date = new Date(entry.dateCreated).toISOString().split("T")[0];
    dates.add(date);
  });

  meditationEntries.forEach((entry) => {
    const date = new Date(entry.createdAt).toISOString().split("T")[0];
    dates.add(date);
  });

  audioHealingEntries.forEach((entry) => {
    const date = new Date(entry.createdAt).toISOString().split("T")[0];
    dates.add(date);
  });

  physicalActivities.forEach((activity) => {
    dates.add(activity.localDate);
  });

  return dates;
}

// Helper: distinct days with activity within the trailing `windowDays` (no
// consecutive requirement). R-PRD-18 / R-XC-02 — progress without streak pressure.
function countActiveDaysInWindow(dates: Set<string>, windowDays = 30): number {
  if (dates.size === 0) return 0;
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (windowDays - 1));
  let count = 0;
  for (const iso of dates) {
    const d = new Date(iso);
    if (Number.isFinite(d.getTime()) && d.getTime() >= cutoff.getTime()) count += 1;
  }
  return count;
}

// Helper: Calculate streak (consecutive days with at least 1 activity).
// Retained as a raw metric only — NEVER surface as chain-pressure UI (R-PRD-18).
function calculateStreak(dates: Set<string>): number {
  if (dates.size === 0) return 0;

  const sortedDates = Array.from(dates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // If the last activity was today or yesterday, we continue the streak
  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const hasActivityOnDate = sortedDates.some(
      (d) =>
        d.getFullYear() === checkDate.getFullYear() &&
        d.getMonth() === checkDate.getMonth() &&
        d.getDate() === checkDate.getDate()
    );

    if (hasActivityOnDate) {
      streak++;
    } else if (streak > 0) {
      break;
    }
  }

  return streak;
}

// Helper: Calculate consistency score (0-100)
function calculateConsistencyScore(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
  activeDays30: number,
  physicalActivities: PhysicalActivity[] = []
): number {
  const totalEntries =
    journalEntries.length +
    meditationEntries.length +
    audioHealingEntries.length +
    physicalActivities.length;

  if (totalEntries === 0) return 0;

  // Calculate based on (R-PRD-18 / R-XC-02 — no consecutive-day streak factor):
  // 1. Activity frequency (total entries, max 40 = 100% of this factor)
  // 2. Active days in the last 30 (breadth over the month, NOT a chain), max 20
  // 3. Recent activity (last 7 days activity)

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recentEntries =
    journalEntries.filter((e) => new Date(e.dateCreated) > sevenDaysAgo).length +
    meditationEntries.filter((e) => new Date(e.createdAt) > sevenDaysAgo).length +
    audioHealingEntries.filter((e) => new Date(e.createdAt) > sevenDaysAgo).length +
    physicalActivities.filter((e) => new Date(e.completedAt) > sevenDaysAgo).length;

  const frequencyScore = Math.min((totalEntries / 40) * 100, 100); // Max 40 total entries for 100%
  const activeDaysScore = Math.min((activeDays30 / 20) * 100, 100); // Max 20 active days in the last 30 for 100%
  const recentActivityScore = Math.min((recentEntries / 10) * 100, 100); // Ideal 10 in last week

  // Weight: 30% frequency, 40% active-days-in-last-30, 30% recent activity.
  // No consecutive-day streak term (R-PRD-18 / R-XC-02).
  const score = frequencyScore * 0.3 + activeDaysScore * 0.4 + recentActivityScore * 0.3;

  return Math.min(Math.round(score), 100);
}

// Helper: Extract and count themes
function analyzeThemes(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[]
): Array<{ theme: string; frequency: number; trend: "up" | "down" | "stable" }> {
  const themes = new Map<string, number>();

  journalEntries.forEach((entry) => {
    if (entry.emotionalAnalysis?.recurringThemes) {
      entry.emotionalAnalysis.recurringThemes.forEach((theme) => {
        themes.set(theme, (themes.get(theme) || 0) + 1);
      });
    }
  });

  meditationEntries.forEach((entry) => {
    themes.set(entry.theme, (themes.get(entry.theme) || 0) + 1);
  });

  // Sort by frequency and get top themes
  const sorted = Array.from(themes.entries())
    .map(([theme, frequency]) => ({ theme, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // For trend, we check recent entries vs older entries
  const sorted_with_trend = sorted.map(({ theme, frequency }) => {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentCount =
      journalEntries.filter(
        (e) =>
          new Date(e.dateCreated) > twoWeeksAgo &&
          e.emotionalAnalysis?.recurringThemes?.includes(theme)
      ).length +
      meditationEntries.filter((e) => new Date(e.createdAt) > twoWeeksAgo && e.theme === theme)
        .length;

    const olderCount = frequency - recentCount;

    let trend: "up" | "down" | "stable" = "stable";
    if (recentCount > olderCount) trend = "up";
    else if (recentCount < olderCount && olderCount > 0) trend = "down";

    return { theme, frequency, trend };
  });

  return sorted_with_trend;
}

// Helper: Analyze emotional states
function analyzeEmotionalStates(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[]
): Array<{ emotion: string; frequency: number }> {
  const emotions = new Map<string, number>();

  // Extract from journal entries
  journalEntries.forEach((entry) => {
    if (entry.emotionalCheckIn?.emotionalWord) {
      const emotion = entry.emotionalCheckIn.emotionalWord;
      emotions.set(emotion, (emotions.get(emotion) || 0) + 1);
    }
  });

  // Extract from meditation entries
  meditationEntries.forEach((entry) => {
    if (entry.emotionalState) {
      emotions.set(entry.emotionalState, (emotions.get(entry.emotionalState) || 0) + 1);
    }
  });

  // Extract from audio healing entries
  audioHealingEntries.forEach((entry) => {
    if (entry.emotionalState) {
      emotions.set(entry.emotionalState, (emotions.get(entry.emotionalState) || 0) + 1);
    }
  });

  return Array.from(emotions.entries())
    .map(([emotion, frequency]) => ({ emotion, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

// Helper: Analyze body signals
function analyzeBodySignals(
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[]
): Array<{ signal: string; frequency: number }> {
  const signals = new Map<string, number>();

  meditationEntries.forEach((entry) => {
    entry.bodySignals.forEach((signal) => {
      signals.set(signal, (signals.get(signal) || 0) + 1);
    });
  });

  audioHealingEntries.forEach((entry) => {
    entry.bodySignals.forEach((signal) => {
      signals.set(signal, (signals.get(signal) || 0) + 1);
    });
  });

  return Array.from(signals.entries())
    .map(([signal, frequency]) => ({ signal, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);
}

// Helper: Determine journey phase
function determineJourneyPhase(
  totalEntries: number,
  activeDays30: number,
  themes: Array<{ theme: string; frequency: number; trend: "up" | "down" | "stable" }>
): "Awareness" | "Acceptance" | "Release" | "Rebuilding" | "Integration" | "Alignment" {
  // Phases reflect depth of engagement, not an unbroken chain (R-PRD-18 / R-XC-02).
  // Awareness: Just starting, low activity
  if (totalEntries < 5) return "Awareness";

  // Acceptance: Regular activity, beginning to identify patterns
  if (totalEntries < 20 && activeDays30 < 8) return "Acceptance";

  // Release: Consistent activity, patterns becoming clear
  if (activeDays30 >= 8 && activeDays30 < 20) return "Release";

  // Rebuilding: Strong consistency, working with patterns
  if (activeDays30 >= 20 && totalEntries < 50) return "Rebuilding";

  // Integration: Very consistent, themes stabilizing
  const upTrends = themes.filter((t) => t.trend === "up").length;
  const downTrends = themes.filter((t) => t.trend === "down").length;

  if (downTrends > upTrends) return "Integration";

  // Alignment: Deep consistency, mostly stable trends
  return "Alignment";
}

// Helper: Unlock milestones
function unlockMilestones(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
  activeDays30: number
): string[] {
  const milestones: string[] = [];

  if (journalEntries.length > 0) milestones.push("✅ Penulis Pertama");
  if (meditationEntries.length > 0) milestones.push("✅ Meditasi Pertama");
  if (audioHealingEntries.length > 0) milestones.push("✅ Audio Healing Pertama");

  // Active days in the last month — not a consecutive-day streak (R-PRD-18).
  if (activeDays30 >= 7) milestones.push("✅ 7 Hari Aktif");
  if (journalEntries.length >= 30) milestones.push("✅ 30 Refleksi");
  if (meditationEntries.length >= 10) milestones.push("✅ 10 Meditasi");
  if (audioHealingEntries.length >= 10) milestones.push("✅ 10 Audio Sessions");

  return milestones;
}

// Helper: Get last activity date
function getLastActivityDate(
  journalEntries: JournalEntry[],
  meditationEntries: MeditationEntry[],
  audioHealingEntries: AudioHealingEntry[],
  physicalActivities: PhysicalActivity[] = []
): string | null {
  const dates: Date[] = [];

  if (journalEntries.length > 0) {
    dates.push(new Date(journalEntries[0].dateCreated));
  }
  if (meditationEntries.length > 0) {
    dates.push(new Date(meditationEntries[0].createdAt));
  }
  if (audioHealingEntries.length > 0) {
    dates.push(new Date(audioHealingEntries[0].createdAt));
  }
  if (physicalActivities.length > 0) {
    dates.push(new Date(physicalActivities[0].completedAt));
  }

  if (dates.length === 0) return null;

  const latest = new Date(Math.max(...dates.map((d) => d.getTime())));
  return latest.toISOString();
}

export function calculateProgressMetrics(input: ProgressInput): ProgressMetrics {
  const { journalEntries, meditationEntries, audioHealingEntries, physicalActivities = [] } = input;

  const totalJournalEntries = journalEntries.length;
  const totalMeditationEntries = meditationEntries.length;
  const totalAudioHealingEntries = audioHealingEntries.length;
  const totalPhysicalActivities = physicalActivities.length;
  const totalEntries = totalJournalEntries + totalMeditationEntries + totalAudioHealingEntries + totalPhysicalActivities;

  const activityDates = getActivityDates(journalEntries, meditationEntries, audioHealingEntries, physicalActivities);
  const streakDays = calculateStreak(activityDates); // raw metric only — not chain-pressure UI (R-PRD-18)
  const activeDays30 = countActiveDaysInWindow(activityDates, 30);
  const consistencyScore = calculateConsistencyScore(
    journalEntries,
    meditationEntries,
    audioHealingEntries,
    activeDays30,
    physicalActivities
  );

  const dominantThemes = analyzeThemes(journalEntries, meditationEntries);
  const journeyPhase = determineJourneyPhase(totalEntries, activeDays30, dominantThemes);
  const milestones = unlockMilestones(
    journalEntries,
    meditationEntries,
    audioHealingEntries,
    activeDays30
  );

  // Analyze diversity Build 31.35
  const diversityMap = new Map<string, number>();
  physicalActivities.forEach(a => diversityMap.set(a.category, (diversityMap.get(a.category) || 0) + 1));
  const physicalActivityDiversity = Array.from(diversityMap.entries()).map(([category, count]) => ({ category, count }));

  const emotionalStates = analyzeEmotionalStates(
    journalEntries,
    meditationEntries,
    audioHealingEntries
  );
  const bodySignals = analyzeBodySignals(meditationEntries, audioHealingEntries);
  const lastActivityDate = getLastActivityDate(journalEntries, meditationEntries, audioHealingEntries, physicalActivities);

  return {
    totalJournalEntries,
    totalMeditationEntries,
    totalAudioHealingEntries,
    totalPhysicalActivities,
    totalEntries,
    streakDays,
    consistencyScore,
    dominantThemes,
    journeyPhase,
    milestones,
    emotionalStates,
    bodySignals,
    physicalActivityDiversity,
    lastActivityDate,
    activeDays30,
    updatedAt: new Date().toISOString(),
  };
}
