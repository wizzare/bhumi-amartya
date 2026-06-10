import { checkDailyReminder, pickDailyReminderMessage } from "@/lib/notifications/checkDailyReminder";
import { safeJsonParse } from "@/lib/storage/safeJson";

export const REMINDER_STATE_STORAGE_KEY = "bhumiReminderState";

export type ReminderState = {
  lastShownDate: string | null;
  lastMessage: string | null;
};

const DEFAULT_REMINDER_STATE: ReminderState = {
  lastShownDate: null,
  lastMessage: null,
};

function getReminderState(): ReminderState {
  if (typeof window === "undefined") return DEFAULT_REMINDER_STATE;

  const stored = window.localStorage.getItem(REMINDER_STATE_STORAGE_KEY);
  const parsed = safeJsonParse<ReminderState | null>(stored, null);

  if (
    parsed
    && (parsed.lastShownDate === null || typeof parsed.lastShownDate === "string")
    && (parsed.lastMessage === null || typeof parsed.lastMessage === "string")
  ) {
    return parsed;
  }

  return DEFAULT_REMINDER_STATE;
}

function saveReminderState(state: ReminderState): ReminderState {
  if (typeof window === "undefined") return state;
  window.localStorage.setItem(REMINDER_STATE_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function shouldShowReminder(): boolean {
  if (typeof window === "undefined") return false;

  const eligibility = checkDailyReminder();
  if (!eligibility.eligible) return false;

  const state = getReminderState();
  const today = new Date().toISOString().slice(0, 10);

  return state.lastShownDate !== today;
}

export function getReminderMessage(): string {
  const seed = Date.now() + new Date().getDate();
  const state = getReminderState();
  const candidate = pickDailyReminderMessage(seed);

  if (!state.lastMessage || candidate !== state.lastMessage) {
    return candidate;
  }

  return pickDailyReminderMessage(seed + 1);
}

export function markReminderShown(message: string): ReminderState {
  const nextState: ReminderState = {
    lastShownDate: new Date().toISOString().slice(0, 10),
    lastMessage: message,
  };

  // TODO: Future integration with Firebase Cloud Messaging for remote reminders.
  // TODO: Future integration with Android push notification channels.
  // TODO: Future server-side scheduled notifications.
  return saveReminderState(nextState);
}
