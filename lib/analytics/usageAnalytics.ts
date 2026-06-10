import { safeJsonParse } from "@/lib/storage/safeJson";
import { analyticsRepository } from "@/lib/repositories/analyticsRepository";

export const ANALYTICS_EVENTS_STORAGE_KEY = "bhumiAnalyticsEvents";
export const ANALYTICS_ERRORS_STORAGE_KEY = "bhumiAnalyticsErrors";

export type AnalyticsEventName =
  | "app_open"
  | "landing_view"
  | "login_view"
  | "login_success"
  | "setup_view"
  | "setup_completed"
  | "dashboard_view"
  | "daily_guidance_view"
  | "open_dashboard"
  | "open_daily_note"
  | "expand_reason"
  | "open_innerwork"
  | "journal_open"
  | "journal_saved"
  | "complete_journaling"
  | "meditation_open"
  | "meditation_completed"
  | "complete_meditation"
  | "audio_open"
  | "audio_completed"
  | "complete_audio"
  | "complete_workout"
  | "complete_yoga"
  | "complete_herbal"
  | "complete_healthy_food"
  | "open_workout"
  | "open_yoga"
  | "open_herbal"
  | "open_healthy_food"
  | "complete_workout_item"
  | "complete_yoga_item"
  | "complete_healthy_food_item"
  | "open_journey"
  | "practice_completed"
  | "daily_completion_reached"
  | "profile_view"
  | "settings_view";

export type AnalyticsErrorName =
  | "failed_blueprint_generation"
  | "failed_daily_guidance_generation"
  | "failed_journal_save"
  | "failed_meditation_save"
  | "failed_audio_save"
  | "failed_notification_generation";

export type AnalyticsEvent = {
  timestamp: string;
  activeUid: string | null;
  eventName: AnalyticsEventName;
};

export type AnalyticsErrorEvent = {
  timestamp: string;
  activeUid: string | null;
  errorName: AnalyticsErrorName;
  status?: string;
};

export type AnalyticsMetrics = {
  totalUsers: number;
  activeUsers: number;
  journalsSaved: number;
  meditationsCompleted: number;
  audioSessionsCompleted: number;
  averageStreak: number;
  retention: {
    day1: number;
    day3: number;
    day7: number;
  };
  funnel: Array<{
    step: string;
    users: number;
    dropOffFromPrevious: number;
  }>;
  errors: Record<AnalyticsErrorName, number>;
};

function getStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  const parsed = safeJsonParse<unknown>(window.localStorage.getItem(key), []);
  return Array.isArray(parsed) ? parsed as T[] : [];
}

function writeStoredArray<T>(key: string, values: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(values.slice(-1000)));
}

export function getActiveAnalyticsUid(fallback?: string | null): string | null {
  if (fallback) return fallback;
  if (typeof window === "undefined") return null;

  const profile = safeJsonParse<Record<string, unknown> | null>(window.localStorage.getItem("bhumiUserProfile"), null);
  const activeUid = window.localStorage.getItem("bhumiActiveUid");
  const profileUid = typeof profile?.uid === "string" ? profile.uid : null;
  return activeUid || profileUid;
}

export function trackEvent(eventName: AnalyticsEventName, activeUid?: string | null): void {
  if (typeof window === "undefined") return;
  const events = getStoredArray<AnalyticsEvent>(ANALYTICS_EVENTS_STORAGE_KEY);
  const uid = getActiveAnalyticsUid(activeUid);

  events.push({
    timestamp: new Date().toISOString(),
    activeUid: uid,
    eventName,
  });
  writeStoredArray(ANALYTICS_EVENTS_STORAGE_KEY, events);

  // Sync to Firestore for tester metrics
  void analyticsRepository.trackEvent(eventName, uid);
}

export function trackError(errorName: AnalyticsErrorName, activeUid?: string | null, status?: string): void {
  if (typeof window === "undefined") return;
  const errors = getStoredArray<AnalyticsErrorEvent>(ANALYTICS_ERRORS_STORAGE_KEY);
  errors.push({
    timestamp: new Date().toISOString(),
    activeUid: getActiveAnalyticsUid(activeUid),
    errorName,
    status,
  });
  writeStoredArray(ANALYTICS_ERRORS_STORAGE_KEY, errors);
}

export function readAnalyticsEvents(): AnalyticsEvent[] {
  return getStoredArray<AnalyticsEvent>(ANALYTICS_EVENTS_STORAGE_KEY);
}

export function readAnalyticsErrors(): AnalyticsErrorEvent[] {
  return getStoredArray<AnalyticsErrorEvent>(ANALYTICS_ERRORS_STORAGE_KEY);
}

function uniqueUsers(events: AnalyticsEvent[], eventNames?: AnalyticsEventName[]): Set<string> {
  const allowed = eventNames ? new Set(eventNames) : null;
  return new Set(
    events
      .filter((event) => event.activeUid && (!allowed || allowed.has(event.eventName)))
      .map((event) => event.activeUid as string),
  );
}

function dateOnly(timestamp: string): string {
  return timestamp.slice(0, 10);
}

function calculateRetention(events: AnalyticsEvent[], day: number): number {
  const byUser = new Map<string, Set<string>>();
  events.forEach((event) => {
    if (!event.activeUid) return;
    const dates = byUser.get(event.activeUid) ?? new Set<string>();
    dates.add(dateOnly(event.timestamp));
    byUser.set(event.activeUid, dates);
  });

  let eligible = 0;
  let retained = 0;
  byUser.forEach((dates) => {
    const sorted = [...dates].sort((a, b) => a.localeCompare(b));
    const first = sorted[0];
    if (!first) return;
    const target = new Date(`${first}T00:00:00`);
    target.setDate(target.getDate() + day);
    const targetKey = target.toISOString().slice(0, 10);
    eligible += 1;
    if (dates.has(targetKey)) retained += 1;
  });

  return eligible === 0 ? 0 : Math.round((retained / eligible) * 100);
}

function buildFunnel(events: AnalyticsEvent[]): AnalyticsMetrics["funnel"] {
  const steps: Array<{ step: string; events: AnalyticsEventName[] }> = [
    { step: "Landing", events: ["landing_view", "app_open"] },
    { step: "Login", events: ["login_view", "login_success"] },
    { step: "Setup", events: ["setup_view", "setup_completed"] },
    { step: "Dashboard", events: ["dashboard_view"] },
    { step: "First Journal", events: ["journal_saved"] },
    { step: "First Meditation", events: ["meditation_completed"] },
    { step: "Day 2 Return", events: ["app_open", "dashboard_view"] },
  ];

  let previous = 0;
  return steps.map((step, index) => {
    const users = uniqueUsers(events, step.events).size;
    const dropOffFromPrevious = index === 0 || previous === 0
      ? 0
      : Math.max(0, Math.round(((previous - users) / previous) * 100));
    previous = users;
    return { step: step.step, users, dropOffFromPrevious };
  });
}

function readProgressStreak(): number {
  if (typeof window === "undefined") return 0;
  const progress = safeJsonParse<Record<string, unknown> | null>(window.localStorage.getItem("bhumiProgressData"), null);
  const streak = progress?.streakDays;
  return typeof streak === "number" && Number.isFinite(streak) ? streak : 0;
}

export function calculateAnalyticsMetrics(): AnalyticsMetrics {
  const events = readAnalyticsEvents();
  const errors = readAnalyticsErrors();
  const users = uniqueUsers(events);
  const errorCounts = errors.reduce<Record<AnalyticsErrorName, number>>((acc, error) => {
    acc[error.errorName] = (acc[error.errorName] ?? 0) + 1;
    return acc;
  }, {
    failed_blueprint_generation: 0,
    failed_daily_guidance_generation: 0,
    failed_journal_save: 0,
    failed_meditation_save: 0,
    failed_audio_save: 0,
    failed_notification_generation: 0,
  });

  return {
    totalUsers: users.size,
    activeUsers: uniqueUsers(events.filter((event) => {
      const days = Math.floor((Date.now() - new Date(event.timestamp).getTime()) / 86400000);
      return days <= 7;
    })).size,
    journalsSaved: events.filter((event) => event.eventName === "journal_saved").length,
    meditationsCompleted: events.filter((event) => event.eventName === "meditation_completed").length,
    audioSessionsCompleted: events.filter((event) => event.eventName === "audio_completed").length,
    averageStreak: readProgressStreak(),
    retention: {
      day1: calculateRetention(events, 1),
      day3: calculateRetention(events, 3),
      day7: calculateRetention(events, 7),
    },
    funnel: buildFunnel(events),
    errors: errorCounts,
  };
}
