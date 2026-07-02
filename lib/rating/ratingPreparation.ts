export type UserSatisfaction = "positive" | "negative" | "neutral" | "unknown";

export type RatingUsageMetrics = {
  journeyDays: number;
  loginCount: number;
  dashboardOpenCount: number;
  reflectionReadCount: number;
  satisfaction: UserSatisfaction;
  lastRatingPromptAt?: unknown;
  recentBlockingError?: boolean;
};

export type RatingDestination = "google_play_review" | "internal_feedback" | "none";

export type RatingEligibilityResult = {
  eligible: boolean;
  destination: RatingDestination;
  reasons: string[];
};

export const RATING_TRIGGER_REQUIREMENTS = {
  journeyDays: 7,
  loginCount: 10,
  dashboardOpenCount: 5,
  reflectionReadCount: 3,
  promptCooldownDays: 90,
} as const;

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function hasRecentPrompt(lastRatingPromptAt: unknown, now: Date): boolean {
  const date = toDate(lastRatingPromptAt);
  if (!date) return false;
  const elapsedDays = (now.getTime() - date.getTime()) / 86_400_000;
  return elapsedDays < RATING_TRIGGER_REQUIREMENTS.promptCooldownDays;
}

export function getRatingDestination(satisfaction: UserSatisfaction): RatingDestination {
  if (satisfaction === "positive") return "google_play_review";
  if (satisfaction === "negative") return "internal_feedback";
  return "none";
}

export function evaluateRatingEligibility(
  metrics: RatingUsageMetrics,
  now = new Date(),
): RatingEligibilityResult {
  const reasons: string[] = [];

  if (metrics.journeyDays < RATING_TRIGGER_REQUIREMENTS.journeyDays) reasons.push("journey_days_below_7");
  if (metrics.loginCount < RATING_TRIGGER_REQUIREMENTS.loginCount) reasons.push("login_count_below_10");
  if (metrics.dashboardOpenCount < RATING_TRIGGER_REQUIREMENTS.dashboardOpenCount) reasons.push("dashboard_open_below_5");
  if (metrics.reflectionReadCount < RATING_TRIGGER_REQUIREMENTS.reflectionReadCount) reasons.push("reflection_read_below_3");
  if (metrics.satisfaction !== "positive" && metrics.satisfaction !== "negative") reasons.push("satisfaction_not_actionable");
  if (metrics.recentBlockingError) reasons.push("recent_blocking_error");
  if (hasRecentPrompt(metrics.lastRatingPromptAt, now)) reasons.push("recent_rating_prompt");

  return {
    eligible: reasons.length === 0,
    destination: reasons.length === 0 ? getRatingDestination(metrics.satisfaction) : "none",
    reasons,
  };
}
