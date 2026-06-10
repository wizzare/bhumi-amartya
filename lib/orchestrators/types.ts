import type {
  CoreIdentity,
  UserProfile as DashboardUserProfile,
  AIReflection,
  AstroEnergyDay,
  DailyInnerwork,
  EmotionalMemory,
  HealingRecommendation,
  MeditationRecommendation,
  JournalingPrompt,
  HealingAudioRecommendation,
  SoulProgress,
  ReminderState,
} from "@/lib/data/types";
import type { Blueprint } from "@/lib/types/blueprint";
import type { UserEmotionalState, UserHealingProgress } from "@/lib/types/user";
import type { DailyGuidanceAdaptiveContext, DailyGuidance } from "@/lib/dailyGuidance/types";

export type AstrologyTransitContext = {
  source: string;
  generatedAt: string;
  summary: string;
  activeTransits: Array<{
    planet: string;
    aspect?: string;
    sign?: string;
    house?: number;
    intensity: "low" | "medium" | "high";
    themes: string[];
  }>;
};

export type DailyGuidanceInput = {
  user: DashboardUserProfile;
  identity: CoreIdentity;
  blueprint: Blueprint;
  emotionalState: UserEmotionalState;
  emotionalMemory: EmotionalMemory;
  healingProgress: UserHealingProgress;
  astrologyTransits: AstrologyTransitContext | null;
  currentSky?: Record<string, unknown> | null;
  houseData?: Record<string, unknown> | null;
  astroHouseActivations?: Array<Record<string, unknown>>;
  natalHouses?: Array<Record<string, unknown>> | Record<string, unknown> | null;
  journalHistory?: Array<Record<string, unknown>>;
  meditationHistory?: Array<Record<string, unknown>>;
  audioHealingHistory?: Array<Record<string, unknown>>;
  activityHistory?: Record<string, unknown> | null;
  momentumState?: Record<string, unknown> | null;
  healingMemory?: Record<string, unknown> | null;
  weeklyReflections?: Array<Record<string, unknown>>;
  adaptiveContext?: DailyGuidanceAdaptiveContext;
  previousGuidance?: DailyGuidance | null;
  language: "id" | "en";
  generatedAt: string;
};

export type DailyGuidanceOutput = {
  blueprintSummary: string;
  soulReflectionText?: string;
  dailyNoteText?: string;

  // V2 Categories
  categories?: {
    general: { insight: string; reason: string; reflection: string; advice: string };
    mental: { insight: string; reason: string; reflection: string; advice: string };
    finance: { insight: string; reason: string; reflection: string; advice: string };
    love: { insight: string; reason: string; reflection: string; advice: string };
    relational: { insight: string; reason: string; reflection: string; advice: string };
    spiritual: { insight: string; reason: string; reflection: string; advice: string };
    challenges: { insight: string; reason: string; reflection: string; advice: string };
    opportunities: { insight: string; reason: string; reflection: string; advice: string };
    advice: { insight: string; reason: string; reflection: string; advice: string };
  };

  companionReflection?: {
    preview: string;
    fullReflection: string;
  };
  manifestation?: {
    affirmation: string;
    attraction: string;
    assumption: string;
  };
  soulReflection: AIReflection;
  astroEnergy: AstroEnergyDay;
  dailyInnerwork: DailyInnerwork;
  journalingPrompt: JournalingPrompt;
  shadowInsight: string;
  meditationRecommendation: MeditationRecommendation;
  healingRecommendation: HealingRecommendation;
  healingAudio: HealingAudioRecommendation;
  innerworkNarrative?: string;
  soulProgress: SoulProgress;
  reminderState: ReminderState;
};
