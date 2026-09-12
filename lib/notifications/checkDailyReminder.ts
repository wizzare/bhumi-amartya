import { safeJsonParse } from "@/lib/storage/safeJson";
import { getLastActivity } from "@/lib/activity/getLastActivity";
import type { DailyGuidanceAdaptiveContext } from "@/lib/dailyGuidance/types";
import {
  createAdaptiveRetention,
  type RetentionNotificationState,
} from "@/lib/retention/adaptiveRetentionEngine";

export const DAILY_REMINDER_MESSAGES = [
  "Catatanmu siap kapan pun kamu ingin membacanya.",
  "Ruangmu tetap ada di sini, tanpa tuntutan.",
  "Kalau terasa berguna, satu refleksi lembut menunggumu.",
  "Kamu boleh kembali pelan-pelan, atau sekadar membaca.",
  "Bhumi ada di sini kapan pun kamu siap.",
] as const;

export type DailyReminderEligibility = {
  journalDone: boolean;
  meditationDone: boolean;
  audioHealingDone: boolean;
  eligible: boolean;
  lastActivityDate: string | null;
  lastActivityType: "journal" | "meditation" | "audioHealing" | null;
  state:
    | "no_activity_today"
    | "partial_activity_today"
    | "completed_practices_today";
};

function isToday(dateValue: string): boolean {
  return dateValue.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function hasCompletedToday(storageKey: string): boolean {
  if (typeof window === "undefined") return false;

  const stored = window.localStorage.getItem(storageKey);
  const parsed = safeJsonParse<unknown>(stored, []);
  if (!Array.isArray(parsed) || parsed.length === 0) return false;

  return parsed.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const candidate = entry as Record<string, unknown>;
    const dateCandidate = [candidate.date, candidate.dateCreated, candidate.createdAt]
      .find((value) => typeof value === "string") as string | undefined;

    return Boolean(dateCandidate && isToday(dateCandidate));
  });
}

export function checkDailyReminder(): DailyReminderEligibility {
  const lastActivity = getLastActivity();
  const journalDone = hasCompletedToday("bhumiJournalEntries");
  const meditationDone = hasCompletedToday("bhumiMeditationEntries");
  const audioHealingDone = hasCompletedToday("bhumiAudioHealingEntries");

  return {
    journalDone,
    meditationDone,
    audioHealingDone,
    eligible: !(journalDone && meditationDone && audioHealingDone),
    lastActivityDate: lastActivity.lastActivityDate,
    lastActivityType: lastActivity.lastActivityType,
    state: journalDone || meditationDone || audioHealingDone
      ? journalDone && meditationDone && audioHealingDone
        ? "completed_practices_today"
        : "partial_activity_today"
      : "no_activity_today",
  };
}

export function pickDailyReminderMessage(seed: number): string {
  return DAILY_REMINDER_MESSAGES[Math.abs(seed) % DAILY_REMINDER_MESSAGES.length];
}

export function pickUnifiedDailyReminderMessage(input: {
  language: "id" | "en";
  profile: Record<string, unknown> | null;
  blueprint: Record<string, unknown> | null;
  astrologyToday?: string | null;
  adaptiveContext?: DailyGuidanceAdaptiveContext;
  seed?: number;
}): string {

  return "Ruang Bhumi ada di sini kapan pun kamu siap.";
}

export function pickAdaptiveRetentionNotification(input: {
  language: "id" | "en";
  profile: Record<string, unknown> | null;
  blueprint: Record<string, unknown> | null;
  journalEntries?: Record<string, unknown>[];
  meditationEntries?: Record<string, unknown>[];
  audioHealingEntries?: Record<string, unknown>[];
  dailyPractices?: Record<string, unknown>[];
  astrologyToday?: string | null;
}): { state: RetentionNotificationState; message: string } {
  const retention = createAdaptiveRetention({ ...input, language: "id" });
  return {
    state: retention.notificationState,
    message: retention.notificationMessage,
  };
}
