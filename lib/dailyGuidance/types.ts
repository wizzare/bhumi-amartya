import { PhysicalActivity } from "@/lib/repositories/activityRepository";
import { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";

export type DailyGuidancePractice = {
  id: string;
  category?: "grounding" | "reflection" | "action";
  title: string;
  description: string;
  estimatedMinutes?: number;
  completed: boolean;
};

export type DailyCompanionReflection = {
  preview: string;
  fullReflection: string;
};

export type DailyGuidanceCategory = {
  insight: string;
  reason: string;
  reflection?: string; // Reflective questions for V2
  advice: string;
};

export type DailyManifestation = {
  affirmation: string;
  attraction: string;
  assumption: string;
};

export type DailyGuidance = {
  uid: string;
  date: string;
  localDateKey?: string;
  schemaVersion?: string;
  generatedWithPromptVersion?: string;
  guidanceVersion?: string;
  dailyVariationSeed?: string;
  promptContextLength?: number;
  generatedAt?: string;
  profileSnapshot: Record<string, unknown> | null;
  blueprintSnapshot: Record<string, unknown> | null;
  astrologyToday: string;
  previousProgressSummary: string;
  completionRateYesterday?: number;
  journalCompletedYesterday?: boolean;
  meditationCompletedYesterday?: boolean;
  audioCompletedYesterday?: boolean;
  practiceCompletedCountYesterday?: number;
  streakDays?: number;
  adaptiveTone?: "gentle_encouraging_restart" | "appreciative_growth_oriented" | "steady_supportive";
  blueprintSummary?: string;
  soulReflectionText?: string;
  dailyNoteText?: string;
  dominantIssue?: {
    key: string;
    label: string;
    category: string;
    source: "catatan";
  };

  // V2 Categories
  categories?: {
    general: DailyGuidanceCategory;
    mental: DailyGuidanceCategory;
    finance: DailyGuidanceCategory;
    love: DailyGuidanceCategory;
    relational: DailyGuidanceCategory;
    spiritual: DailyGuidanceCategory;
    challenges: DailyGuidanceCategory;
    opportunities: DailyGuidanceCategory;
    advice: DailyGuidanceCategory;
  };

  // V2 Innerwork Intel
  innerworkRecommendations?: {
    workout: { id: string; title: string; reason: string };
    yoga: { id: string; title: string; reason: string };
    healthyFood: { id: string; title: string; reason: string };
    audioHealing: { id: string; title: string; reason: string };
    journaling: { id: string; title: string; reason: string };
    meditation: { id: string; title: string; reason: string };
    manifestation: { id: string; title: string; reason: string };
  };
  manifestation?: DailyManifestation;
  innerworkNarrative?: string; // Narrative invitation for V2 Dashboard

  houseData?: Record<string, unknown> | null;
  astroHouseActivations?: Array<Record<string, unknown>>;
  companionReflection?: DailyCompanionReflection;
  aiInsight: string;
  journalPrompt: string;
  meditationSuggestion: string;
  audioHealingSuggestion?: string;
  dailyPractices: DailyGuidancePractice[];
  emotionalFocus: string;
  spiritualFocus: string;
  groundedAction: string;
  blueprintHash?: string;
  memoryHash?: string;
  model?: string;
  note?: string;
  status?: "success" | "fallback" | "error";
  fallbackUsed?: boolean;
  createdAt: string;
  updatedAt: string;
  source: "ai" | "fallback" | "local-fallback";
};

export type DailyGuidanceContext = {
  uid: string;
  date: string;
  localDateKey?: string;
  language: "id" | "en";
  profile: Record<string, unknown> | null;
  blueprint: Record<string, unknown> | null;
  astrologyToday?: string | null;
  currentSky?: Record<string, unknown> | null;
  // V2 Innerwork Intel
  innerworkRecommendations?: {
    workout: { id: string; title: string; reason: string };
    yoga: { id: string; title: string; reason: string };
    healthyFood: { id: string; title: string; reason: string };
    audioHealing: { id: string; title: string; reason: string };
    journaling: { id: string; title: string; reason: string };
    meditation: { id: string; title: string; reason: string };
    manifestation: { id: string; title: string; reason: string };
  };
  manifestation?: DailyManifestation;
  innerworkNarrative?: string; // Narrative invitation for V2 Dashboard

  houseData?: Record<string, unknown> | null;
  astroHouseActivations?: Array<Record<string, unknown>>;
  natalHouses?: Array<Record<string, unknown>> | Record<string, unknown> | null;
  previousJournalEntries?: Array<Record<string, unknown>>;
  previousMeditationEntries?: Array<Record<string, unknown>>;
  previousAudioHealingEntries?: Array<Record<string, unknown>>;
  previousGuidance?: DailyGuidance[];
  activityHistory?: PhysicalActivity[] | null;
  momentumState?: Record<string, unknown> | null;
  healingMemory?: Record<string, unknown> | null;
};

export type DailyGuidanceAdaptiveContext = {
  dailyVariationSeed: string;
  completionRateYesterday: number;
  journalCompletedYesterday: boolean;
  meditationCompletedYesterday: boolean;
  audioCompletedYesterday: boolean;
  practiceCompletedCountYesterday: number;
  streakDays: number;
  adaptiveTone: "gentle_encouraging_restart" | "appreciative_growth_oriented" | "steady_supportive";
  previousProgressSummary: string;
  yesterdayWellnessMapping?: WellnessMapping | null;
  previousGuidanceSummaries: Array<{
    date: string;
    aiInsight: string;
    journalPrompt: string;
    meditationSuggestion: string;
    audioHealingSuggestion?: string;
    completedPractices: number;
    totalPractices: number;
  }>;
};
