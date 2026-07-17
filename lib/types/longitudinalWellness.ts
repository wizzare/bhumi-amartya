export type LongitudinalWellnessDomain =
  | "physical"
  | "breath"
  | "reflection"
  | "nature"
  | "relationship"
  | "mind"
  | "environment";

export type PracticePeriod = "morning" | "afternoon" | "night";
export type PracticeDifficulty = "beginner" | "intermediate" | "advanced" | "unknown";
export type EnergyCapacity = "low" | "medium" | "high" | "unknown";
export type ObservationDirection = "increasing" | "decreasing" | "steady" | "emerging" | "dormant" | "insufficient-data";
export type RelativeTendency = "less-observed" | "within-usual-range" | "more-observed" | "not-observed";

export interface WellnessEventInput {
  eventId?: string;
  timestamp: string;
  dateKey: string;
  recommendationId: string;
  rawDomain: string;
  subcategory: string;
  durationMinutes: number;
  period: PracticePeriod;
  difficulty?: PracticeDifficulty;
  energyCapacity?: EnergyCapacity;
  environment?: "indoor" | "outdoor" | "either" | "unknown";
}

export interface WellnessEvent extends WellnessEventInput {
  eventId: string;
  domain: LongitudinalWellnessDomain;
  difficulty: PracticeDifficulty;
  energyCapacity: EnergyCapacity;
  environment: "indoor" | "outdoor" | "either" | "unknown";
}

export interface ObservationEvidence {
  recentCount: number;
  comparisonCount: number;
  observedDays: number;
  firstObservedAt: string | null;
  lastObservedAt: string | null;
}

export interface WellnessPattern {
  key: string;
  subject: "domain" | "practice" | "subcategory";
  subjectId: string;
  windowDays: 7 | 30 | 90;
  direction: ObservationDirection;
  evidence: ObservationEvidence;
}

export interface DomainDistributionEntry {
  domain: LongitudinalWellnessDomain;
  occurrences: number;
  activeDays: number;
  tendency: RelativeTendency;
}

export interface DomainDistribution {
  windowDays: 7 | 30 | 90;
  domains: DomainDistributionEntry[];
}

export interface PracticeRhythm {
  windowDays: 30;
  periods: Record<PracticePeriod, { occurrences: number; activeDays: number }>;
  preferredPeriod: PracticePeriod | null;
  shortPracticePattern: {
    thresholdMinutes: 10;
    shortOccurrences: number;
    longerOccurrences: number;
    tendency: "shorter" | "longer" | "mixed" | "insufficient-data";
  };
}

export interface CapacityWindow {
  windowDays: 7 | 30 | 90;
  eventCount: number;
  medianDurationMinutes: number | null;
  difficultyOccurrences: Record<PracticeDifficulty, number>;
  energyCapacityOccurrences: Record<EnergyCapacity, number>;
}

export interface CapacityTrend {
  windows: [CapacityWindow, CapacityWindow, CapacityWindow];
  durationDirection: ObservationDirection;
  difficultyDirection: ObservationDirection;
  energyCapacityDirection: ObservationDirection;
}

export interface PracticeCandidate {
  recommendationId: string;
  domain: LongitudinalWellnessDomain;
  lastObservedAt: string;
  daysSinceLastObservation: number;
  previousOccurrences: number;
}

export interface EmergingHabit {
  recommendationId: string;
  domain: LongitudinalWellnessDomain;
  recentOccurrences: number;
  recentActiveDays: number;
  previousOccurrences: number;
}

export interface PracticeVariety {
  windowDays: 30;
  distinctPractices: number;
  distinctDomains: number;
  repeatedPracticeIds: string[];
  revisitCandidates: PracticeCandidate[];
  dormantPractices: PracticeCandidate[];
}

export interface LongitudinalWellnessSnapshot {
  schemaVersion: "longitudinal-wellness-v1";
  generatedAt: string;
  eventWindow: { retainedEvents: number; earliestEventAt: string | null; latestEventAt: string | null };
  patterns: WellnessPattern[];
  domainDistribution: [DomainDistribution, DomainDistribution, DomainDistribution];
  rhythm: PracticeRhythm;
  capacityTrend: CapacityTrend;
  variety: PracticeVariety;
  emergingHabits: EmergingHabit[];
}

export interface LongitudinalWellnessDocument {
  uid: string;
  updatedAt: string;
  events: WellnessEvent[];
  snapshot: LongitudinalWellnessSnapshot;
}
