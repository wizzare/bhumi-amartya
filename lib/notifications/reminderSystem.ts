import { safeJsonParse } from "@/lib/storage/safeJson";

export const NOTIFICATION_STORAGE_KEY = "bhumiNotificationState";

export type NotificationState = {
  fcmToken: string | null;
  pushEnabled: boolean;
  lastPrompted: string | null;
  lastActivityDate: string | null;
  reminderSentToday: boolean;
};

export function getNotificationState(): NotificationState {
  if (typeof window === "undefined") {
    return {
      fcmToken: null,
      pushEnabled: false,
      lastPrompted: null,
      lastActivityDate: null,
      reminderSentToday: false,
    };
  }

  const stored = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
  if (stored) {
    const parsed = safeJsonParse<NotificationState | null>(stored, null);
    if (parsed) {
      // Check if day rolled over
      const today = new Date().toISOString().slice(0, 10);
      const lastActivityDate = parsed.lastActivityDate;
      const lastActivityDay = lastActivityDate ? lastActivityDate.slice(0, 10) : null;
      
      // If we are on a new day, reset reminderSentToday 
      if (lastActivityDay !== today && parsed.reminderSentToday) {
         const nextState = { ...parsed, reminderSentToday: false };
         window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(nextState));
         return nextState;
      }
      return parsed;
    }
  }

  const defaultState: NotificationState = {
    fcmToken: null,
    pushEnabled: false,
    lastPrompted: null,
    lastActivityDate: null,
    reminderSentToday: false,
  };
  
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}

export function saveNotificationState(state: Partial<NotificationState>): NotificationState {
  const current = getNotificationState();
  const next = { ...current, ...state };
  window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function updateLastActivityDate(): void {
  saveNotificationState({ lastActivityDate: new Date().toISOString() });
}

export function checkAndSendDailyReminder(): boolean {
  if (typeof window === "undefined") return false;
  
  const state = getNotificationState();
  const today = new Date().toISOString().slice(0, 10);
  
  // If activity was already tracked today, no reminder needed.
  if (state.lastActivityDate && state.lastActivityDate.startsWith(today)) {
    return false;
  }
  
  // If we already sent one today, skip.
  if (state.reminderSentToday) {
    return false;
  }
  
  // In a real implementation this sends via FCM or Web Push.
  // MVP: local abstraction.
  console.log("[Reminder System] Hai, kamu baik-baik aja? Hari ini belum innerwork dan grounding ya? Yuk login 🌱");
  
  saveNotificationState({ reminderSentToday: true });
  return true;
}
