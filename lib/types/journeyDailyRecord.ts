export interface JourneyInnerworkRecommendation {
  practiceId: string;
  practiceType: string;
  practiceTitle: string;
  durationMinutes: number;
  intensity: string;
  reason: string;
  sourceSignals: string[];
}

export interface JourneyInnerworkCompletion {
  completed: boolean;
  skipped: boolean;
  reason?: string;
  completedAt?: string;
  actualPracticeId?: string;
  actualPracticeType?: string;
  actualDuration?: number;
  reflectionResult?: string;
  reflectionResponse?: string;
  practiceHelped?: boolean | null;
  userFelt?: string;
  userNote?: string;
}

export interface JourneyPracticeResult {
  zone: "A" | "B";
  issue: string;
  issueCategory: string;
  practiceId: string;
  practiceCategory: string;
  practiceTitle: string;
  durationMinutes: number;
  completedAt: string;
  source?: string;
  reflectionResult?: string;
  reflectionResponse?: string;
  practiceHelped?: boolean | null;
}

export interface WeeklyLearningSummary {
  weeklyTheme: string;
  weeklyChallenge: string;
  weeklyOpportunity: string;
  weeklyPattern: string;
  coachObservation: string;
}

export interface MonthlyLearningSummary {
  monthlyTheme: string;
  monthlyPattern: string;
  monthlyGrowthArea: string;
  monthlyNarrative: string;
}

export interface PracticeInsightItem {
  practice: string;
  helpfulScore: number;
}

export interface PracticeEffectivenessSummary {
  practiceInsights: PracticeInsightItem[];
  helpfulPractices: string[];
  neutralPractices: string[];
  heavyPractices: string[];
  unknownPractices: string[];
}

export interface GrowthNarrativeSummary {
  growthNarrative: string;
  growthTransitions: string[];
  currentLesson: string;
  nextInvitation: string;
}

export interface CoachMemorySummary {
  coachMemory: string;
  bhumiObservations: string[];
}

export interface JourneyDailyRecord {
  id: string;
  userId: string;
  date: string;
  appDate: string;
  dayOfWeek: string;
  createdAt: string;
  updatedAt: string;
  dominantIssue: string;
  issueCategory: string;
  navigatorMode: string;
  wellnessState: Record<string, unknown>;
  dailyScanCompleted: boolean;
  dailyScanSummary: string;
  catatanSummary: string;
  catatanMainDirection: string;
  catatanChallenge: string;
  catatanOpportunity: string;
  astroSummary: string;
  astroEvents: string[];
  profileSignals: string[];
  innerworkRecommendation: JourneyInnerworkRecommendation | null;
  innerworkCompletion: JourneyInnerworkCompletion;
  practiceResults?: JourneyPracticeResult[];
  sourceConfidence: number;
}

export interface JourneyDailyMemory {
  yesterday: JourneyDailyRecord | null;
  last7Days: JourneyDailyRecord[];
  last30Days: JourneyDailyRecord[];
  weeklyLearning?: WeeklyLearningSummary;
  monthlyLearning?: MonthlyLearningSummary;
  practiceInsights?: PracticeEffectivenessSummary;
  growthNarrative?: GrowthNarrativeSummary;
  coachMemory?: CoachMemorySummary;
}
