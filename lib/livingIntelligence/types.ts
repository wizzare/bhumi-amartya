export type TimeWindow = "morning" | "afternoon" | "evening" | "night" | "afterMidnight";

export type CircadianContext = {
  timeWindow: TimeWindow;
  hour: number;
  greeting: string;
  closing: string;
  isAfterMidnight: boolean;
  isLateNightPhase: "awakening" | "active" | "winding" | "resting" | "deepRest";
};

export type BehavioralPattern = {
  loginTime?: string;
  lastSeen?: string;
  sessionDuration?: number;
  activeHours?: number[];
  frequentlyOpenedPages?: string[];
  favoriteTime?: TimeWindow;
  usageFrequency?: number;
  averageSessionDuration?: number;
  lastActiveDate?: string;
  streakDays?: number;
};

export type BehavioralContext = {
  patterns: BehavioralPattern;
  currentSession?: {
    startTime: string;
    currentPage: string;
    previousPage?: string;
  };
  isNewSession: boolean;
  sessionNumber: number;
};

export type RecommendationContext = {
  blueprint: Record<string, unknown> | null;
  journey: Record<string, unknown> | null;
  wellness: Record<string, unknown> | null;
  time: CircadianContext;
  behavior: BehavioralContext;
  memory: MemoryContext;
};

export type MemoryContext = {
  readonly journeyNarrative?: string;
  readonly weeklyLearning?: string;
  readonly monthlyTheme?: string;
  readonly growthNarrative?: string;
  readonly coachMemory?: string;
  readonly practiceInsights?: Record<string, unknown>;
  readonly recentPracticePatterns?: ReadonlyArray<{
    readonly issue: string;
    readonly practiceId: string;
    readonly practiceCategory: string;
    readonly reflectionResult: string;
    readonly practiceHelped: boolean | null;
    readonly completedAt: string;
  }>;
  readonly progressMarkers?: ReadonlyArray<{
    readonly type: "streak" | "milestone" | "pattern" | "shift";
    readonly description: string;
    readonly date: string;
  }>;
  readonly dominantThemes?: ReadonlyArray<string>;
  readonly recurringWounds?: ReadonlyArray<string>;
  readonly healingEdges?: ReadonlyArray<string>;

  // Compiled history lists & snapshots (Read-Only snap fields)
  readonly today?: any;
  readonly yesterday?: any;
  readonly last7Days?: ReadonlyArray<any>;
  readonly last30Days?: ReadonlyArray<any>;
  readonly reflectionHistory?: ReadonlyArray<any>;
  readonly journalHistory?: ReadonlyArray<any>;
  readonly meditationHistory?: ReadonlyArray<any>;
  readonly audioHealingHistory?: ReadonlyArray<any>;
  readonly journeyHistory?: ReadonlyArray<any>;
  readonly wellnessHistory?: any;
  readonly moodHistory?: ReadonlyArray<any>;
  readonly gratitudeHistory?: ReadonlyArray<any>;
  readonly activityHistory?: ReadonlyArray<any>;
  readonly identitySnapshot?: any;
  readonly circadianContext?: any;
  readonly languageContext?: any;

  // Narrative continuity data
  readonly previousReflection?: string;
  readonly previousDailyNote?: string;
  readonly previousJourney?: string;
  readonly narrativeSummary?: string;
};

export type DailyContext = {
  circadian: CircadianContext;
  behavioral: BehavioralContext;
  recommendation: RecommendationContext;
  memory: MemoryContext;
  timestamp: string;
  dateKey: string;
};

export type LivingIntelligenceContext = {
  daily: DailyContext;
  profile: Record<string, unknown> | null;
  blueprint: Record<string, unknown> | null;
  generatedAt: string;
};

export interface ReflectionContext {
  readonly narrativeDirection: string; // e.g. "winding-down", "active-expansion", "stabilizing"
  readonly previousReflectionSummary: string;
  readonly previousDailyNoteSummary: string;
  readonly recurringThemes: ReadonlyArray<string>;
  readonly unresolvedThemes: ReadonlyArray<string>;
  readonly improvements: ReadonlyArray<string>;
  readonly setbacks: ReadonlyArray<string>;
  readonly narrativeTransition: "continue" | "bridge" | "pivot";
  readonly greetingStyle: {
    readonly format: "salutation-first" | "theme-first" | "poetic-opening";
    readonly text: string;
  };
  readonly toneAdjustment: string;
  readonly identityReferences: ReadonlyArray<string>; // References to existing HumanMeaning fields
}

export interface JourneyContext {
  readonly currentStage: "orientation" | "exploration" | "consolidation" | "integration";
  readonly consistencyRate: number; // percentage 0-100
  readonly momentum: {
    readonly direction: "upward" | "stable" | "downward";
    readonly confidence: "high" | "moderate" | "developing";
    readonly velocity: "accelerating" | "steady" | "decelerating";
    readonly stability: "stable" | "volatile" | "fragile";
  };
  readonly microWins: ReadonlyArray<{
    readonly id: string;
    readonly type: "first_completion" | "consistency" | "recovery" | "emotional_recovery" | "healthier_rhythm" | "gratitude_returned" | "journaling_resumed" | "meditation_resumed" | "movement_resumed";
    readonly targetArea: string;
    readonly date: string;
  }>;
  readonly nextGrowthSignals: ReadonlyArray<"reflection" | "movement" | "sleep" | "nutrition" | "breathing" | "gratitude" | "learning" | "connection" | "purpose" | "nature" | "creative" | "spiritual" | "environment">;

  // Future compatibility placeholders (Sprint 4 & Dashboard)
  readonly wellnessSignals: ReadonlyArray<any>;
  readonly habitSignals: ReadonlyArray<any>;
  readonly growthSignals: ReadonlyArray<any>;
  readonly achievementSignals: ReadonlyArray<any>;
}

export interface WellnessDomainDetail {
  readonly currentState: "stable" | "needs-attention" | "recovering" | "developing";
  readonly momentum: "upward" | "stable" | "downward";
  readonly consistencyRate: number;
  readonly attentionLevel: "low" | "medium" | "high";
  readonly recoverySignal: boolean;
  readonly microActionCandidates: ReadonlyArray<string>;
  readonly dependencyTrigger?: string; // e.g. "sleep_declined" influencing movement
}

export interface WellnessContext {
  readonly overall: {
    readonly overallRhythm: "restoring" | "harmonious" | "disrupted";
    readonly overallRecovery: boolean;
    readonly overallBalance: "steady" | "fragile" | "growing";
    readonly overallAttention: "low" | "medium" | "high";
    readonly overallMomentum: "stable" | "recovering" | "developing" | "needs-attention";
  };
  readonly domains: {
    readonly movement: WellnessDomainDetail;
    readonly sleep: WellnessDomainDetail;
    readonly nutrition: WellnessDomainDetail;
    readonly breathing: WellnessDomainDetail;
    readonly meditation: WellnessDomainDetail;
    readonly emotion: WellnessDomainDetail;
    readonly journal: WellnessDomainDetail;
    readonly nature: WellnessDomainDetail;
    readonly digitalWellness: WellnessDomainDetail;
    readonly social: WellnessDomainDetail;
    readonly learning: WellnessDomainDetail;
    readonly creativity: WellnessDomainDetail;
    readonly spiritual: WellnessDomainDetail;
    readonly environment: WellnessDomainDetail;
    readonly purpose: WellnessDomainDetail;
  };
  readonly relationships: ReadonlyArray<{
    readonly source: string;
    readonly target: string;
    readonly state: "active" | "dormant";
    readonly influence: "supporting" | "disrupting" | "neutral";
  }>;
}

export interface PotentialContext {
  readonly naturalStrengths: ReadonlyArray<string>;
  readonly hiddenStrengths: ReadonlyArray<string>;
  readonly activeStrengths: ReadonlyArray<string>;
  readonly dormantStrengths: ReadonlyArray<string>;
  readonly activationSignals: ReadonlyArray<string>;
  readonly optimizationSignals: ReadonlyArray<string>;
  readonly lightSideSignals: ReadonlyArray<string>;
  readonly shadowActivation: ReadonlyArray<string>;
  readonly shadowIntegration: ReadonlyArray<string>;
  readonly chakraActivation: ReadonlyArray<{
    readonly chakraName: "root" | "sacral" | "solar_plexus" | "heart" | "throat" | "third_eye" | "crown";
    readonly state: "active" | "dormant" | "needs-care";
  }>;
  readonly spiritualGiftSignals: ReadonlyArray<string>;
  readonly potentialMomentum: "emerging" | "stable" | "accelerating" | "recovering";
  readonly potentialReadiness: "ready" | "developing" | "supported" | "blocked" | "recovering";
  readonly growthSignals: ReadonlyArray<string>;
}