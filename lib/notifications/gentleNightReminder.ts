import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";

export const GENTLE_NIGHT_REMINDER_ID = 2100;
export const GENTLE_NIGHT_REMINDER_TITLE = "Bhumi menunggumu sebentar";
export const GENTLE_NIGHT_REMINDER_BODY = "Ambil satu menit untuk menyapa dirimu malam ini.";

const STORAGE_KEYS = {
  lastOpenedAt: "bhumiLastOpenedAt",
  lastOpenedDate: "bhumiLastOpenedDate",
  permissionPrompted: "bhumiNightReminderPermissionPrompted",
  permissionStatus: "bhumiNightReminderPermissionStatus",
  scheduledAt: "bhumiNightReminderScheduledAt",
} as const;

export type GentleNightReminderResult =
  | { status: "scheduled"; scheduledAt: string }
  | { status: "permission-denied" | "permission-prompted" | "unavailable" }
  | { status: "error"; error: unknown };

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getNextNightReminderAt(now: Date): Date {
  const next = new Date(now);
  next.setHours(21, 0, 0, 0);
  if (now.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

async function savePreference(key: string, value: string): Promise<void> {
  await Preferences.set({ key, value });
  if (typeof window !== "undefined") window.localStorage.setItem(key, value);
}

async function getPreference(key: string): Promise<string | null> {
  const nativeValue = await Preferences.get({ key });
  if (nativeValue.value !== null) return nativeValue.value;
  return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
}

async function recordAppOpened(now: Date): Promise<void> {
  await Promise.all([
    savePreference(STORAGE_KEYS.lastOpenedAt, now.toISOString()),
    savePreference(STORAGE_KEYS.lastOpenedDate, getLocalDateKey(now)),
  ]);
}

async function ensureNotificationPermission(): Promise<"granted" | "denied" | "prompted"> {
  const current = await LocalNotifications.checkPermissions();
  await savePreference(STORAGE_KEYS.permissionStatus, current.display);
  if (current.display === "granted") return "granted";
  if (current.display === "denied") return "denied";

  const prompted = await getPreference(STORAGE_KEYS.permissionPrompted);
  if (prompted === "true") return "prompted";

  await savePreference(STORAGE_KEYS.permissionPrompted, "true");
  const requested = await LocalNotifications.requestPermissions();
  await savePreference(STORAGE_KEYS.permissionStatus, requested.display);
  return requested.display === "granted" ? "granted" : "denied";
}

export async function refreshGentleNightReminder(now = new Date()): Promise<GentleNightReminderResult> {
  try {
    await recordAppOpened(now);

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return { status: "unavailable" };
    }

    const permission = await ensureNotificationPermission();
    if (permission === "denied") return { status: "permission-denied" };
    if (permission === "prompted") return { status: "permission-prompted" };

    await LocalNotifications.cancel({ notifications: [{ id: GENTLE_NIGHT_REMINDER_ID }] });

    const scheduledAt = getNextNightReminderAt(now);
    await LocalNotifications.schedule({
      notifications: [{
        id: GENTLE_NIGHT_REMINDER_ID,
        title: GENTLE_NIGHT_REMINDER_TITLE,
        body: GENTLE_NIGHT_REMINDER_BODY,
        schedule: { at: scheduledAt, allowWhileIdle: true },
        extra: { kind: "gentle-night-reminder" },
      }],
    });

    await savePreference(STORAGE_KEYS.scheduledAt, scheduledAt.toISOString());
    const pending = await LocalNotifications.getPending();
    const scheduledReminder = pending.notifications.find(
      (notification) => notification.id === GENTLE_NIGHT_REMINDER_ID,
    );
    console.info("[Gentle Night Reminder] Scheduled", {
      id: GENTLE_NIGHT_REMINDER_ID,
      scheduledAt: scheduledAt.toString(),
      pending: Boolean(scheduledReminder),
    });
    return { status: "scheduled", scheduledAt: scheduledAt.toISOString() };
  } catch (error) {
    console.warn("[Gentle Night Reminder] Scheduler unavailable", error);
    return { status: "error", error };
  }
}
