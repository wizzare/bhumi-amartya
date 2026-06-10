import type {
  DailyGuidance,
  DailyGuidanceAdaptiveContext,
} from "@/lib/dailyGuidance/types";

type UnknownRecord = Record<string, unknown>;

type BuildAdaptiveContextInput = {
  uid: string;
  date: string;
  journalEntries?: UnknownRecord[];
  meditationEntries?: UnknownRecord[];
  audioHealingEntries?: UnknownRecord[];
  previousGuidance?: DailyGuidance[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function getEntryDate(entry: UnknownRecord): string | null {
  const candidates = [
    entry.date,
    entry.createdAt,
    entry.dateCreated,
    entry.dateCompleted,
    entry.updatedAt,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.length >= 10) {
      return value.slice(0, 10);
    }
  }

  return null;
}

function hasEntryOnDate(entries: UnknownRecord[] | undefined, date: string): boolean {
  return (entries ?? []).some((entry) => getEntryDate(entry) === date);
}

function countCompletedPractices(guidance: DailyGuidance | undefined): number {
  return guidance?.dailyPractices.filter((practice) => practice.completed).length ?? 0;
}

function collectActiveDates(input: BuildAdaptiveContextInput): Set<string> {
  const dates = new Set<string>();
  const activityEntries = [
    ...(input.journalEntries ?? []),
    ...(input.meditationEntries ?? []),
    ...(input.audioHealingEntries ?? []),
  ];

  for (const entry of activityEntries) {
    const date = getEntryDate(entry);
    if (date) dates.add(date);
  }

  for (const guidance of input.previousGuidance ?? []) {
    if (countCompletedPractices(guidance) > 0) dates.add(guidance.date);
  }

  return dates;
}

function calculateStreakDays(input: BuildAdaptiveContextInput, yesterday: string): number {
  const activeDates = collectActiveDates(input);
  let cursor = yesterday;
  let streak = 0;

  while (activeDates.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function selectTone(completionRateYesterday: number): DailyGuidanceAdaptiveContext["adaptiveTone"] {
  if (completionRateYesterday === 0) return "gentle_encouraging_restart";
  if (completionRateYesterday >= 80) return "appreciative_growth_oriented";
  return "steady_supportive";
}

export function buildAdaptiveDailyGuidanceContext(
  input: BuildAdaptiveContextInput,
): DailyGuidanceAdaptiveContext {
  const dailyVariationSeed = `${input.date}:${input.uid}`;
  const yesterday = addDays(input.date, -1);
  const journalCompletedYesterday = hasEntryOnDate(input.journalEntries, yesterday);
  const meditationCompletedYesterday = hasEntryOnDate(input.meditationEntries, yesterday);
  const audioCompletedYesterday = hasEntryOnDate(input.audioHealingEntries, yesterday);
  const yesterdayGuidance = (input.previousGuidance ?? []).find((guidance) => guidance.date === yesterday);
  const practiceCompletedCountYesterday = countCompletedPractices(yesterdayGuidance);
  const totalPracticesYesterday = yesterdayGuidance?.dailyPractices.length ?? 0;
  const completedItems =
    Number(journalCompletedYesterday)
    + Number(meditationCompletedYesterday)
    + Number(audioCompletedYesterday)
    + practiceCompletedCountYesterday;
  const totalItems = 3 + totalPracticesYesterday;
  const completionRateYesterday = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const streakDays = calculateStreakDays(input, yesterday);
  const adaptiveTone = selectTone(completionRateYesterday);

  const previousGuidanceSummaries = (input.previousGuidance ?? [])
    .slice(0, 7)
    .map((guidance) => ({
      date: guidance.date,
      aiInsight: guidance.aiInsight,
      journalPrompt: guidance.journalPrompt,
      meditationSuggestion: guidance.meditationSuggestion,
      audioHealingSuggestion: guidance.audioHealingSuggestion,
      completedPractices: countCompletedPractices(guidance),
      totalPractices: guidance.dailyPractices.length,
    }));

  const previousProgressSummary =
    `Yesterday ${yesterday}: completion ${completionRateYesterday}%, `
    + `journal ${journalCompletedYesterday ? "completed" : "not completed"}, `
    + `meditation ${meditationCompletedYesterday ? "completed" : "not completed"}, `
    + `audio healing ${audioCompletedYesterday ? "completed" : "not completed"}, `
    + `daily practices ${practiceCompletedCountYesterday}/${totalPracticesYesterday}, `
    + `streak ${streakDays} day(s), tone ${adaptiveTone}.`;

  return {
    dailyVariationSeed,
    completionRateYesterday,
    journalCompletedYesterday,
    meditationCompletedYesterday,
    audioCompletedYesterday,
    practiceCompletedCountYesterday,
    streakDays,
    adaptiveTone,
    previousProgressSummary,
    previousGuidanceSummaries,
  };
}
