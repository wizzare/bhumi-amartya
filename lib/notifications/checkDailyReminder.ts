import { safeJsonParse } from "@/lib/storage/safeJson";
import { getLastActivity } from "@/lib/activity/getLastActivity";
import { buildUnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import type { DailyGuidanceAdaptiveContext } from "@/lib/dailyGuidance/types";
import {
  createAdaptiveRetention,
  type RetentionNotificationState,
} from "@/lib/retention/adaptiveRetentionEngine";

export const DAILY_REMINDER_MESSAGES = [
  "Hai, kamu baik-baik aja? Hari ini belum innerwork dan grounding ya? Yuk login 🌱",
  "Hai, semoga harimu lembut. Kalau belum sempat innerwork hari ini, yuk ambil waktu sebentar 🌿",
  "Pelan-pelan aja, ya. Kalau jurnal, meditasi, atau audio healing belum sempat hari ini, kita lanjut bareng 🌱",
  "Kamu nggak sendiri. Yuk cek-in sebentar lewat innerwork kecil hari ini 💚",
  "Satu napas sadar hari ini sudah berarti. Kalau belum grounding, yuk login dan mulai dari langkah kecil 🌾",
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
  const synthesis = buildUnifiedBlueprintSynthesis({
    language: input.language,
    profile: input.profile,
    blueprint: input.blueprint,
    astrologyToday: input.astrologyToday,
    adaptiveContext: input.adaptiveContext,
  });
  const need = synthesis.coreNeeds[Math.abs(input.seed ?? Date.now()) % Math.max(1, synthesis.coreNeeds.length)]
    ?? (input.language === "en" ? "one gentle step" : "satu langkah lembut");

  if (input.language === "en") {
    return `A small check-in can support ${need} today. Start with one breath, one note, or one grounding step.`;
  }

  return `Check-in kecil bisa mendukung ${need} hari ini. Mulai dari satu napas, satu catatan, atau satu langkah grounding.`;
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
  const retention = createAdaptiveRetention(input);
  return {
    state: retention.notificationState,
    message: retention.notificationMessage,
  };
}
