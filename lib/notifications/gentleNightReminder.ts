import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";
import { notificationCopy, type NotificationLocale } from "@/lib/notifications/notificationPolicy";
import { safeErrorMetadata } from "@/lib/auth/safeDiagnostics";

export const GENTLE_NIGHT_REMINDER_ID = 2100;
export const REENGAGEMENT_3D_ID = 2101;
export const REENGAGEMENT_7D_ID = 2102;

const STORAGE_KEYS = {
  lastOpenedAt: "bhumiLastOpenedAt",
  lastOpenedDate: "bhumiLastOpenedDate",
  permissionPrompted: "bhumiNightReminderPermissionPrompted",
  permissionStatus: "bhumiNightReminderPermissionStatus",
  scheduledAt: "bhumiNightReminderScheduledAt",
  enabled: "bhumiDailyReminderEnabled",
} as const;

const DAY_IN_MS = 86_400_000;

export type GentleNightReminderResult =
  | { status: "scheduled"; scheduledAt: string }
  | { status: "permission-denied" | "permission-prompted" | "unavailable" | "skipped-opened-today" | "reengagement-sent" }
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

export async function cancelDailyReminders(): Promise<void> {
  await Promise.all([cancelNotification(GENTLE_NIGHT_REMINDER_ID), cancelNotification(REENGAGEMENT_3D_ID), cancelNotification(REENGAGEMENT_7D_ID)]);
}

export async function getDailyReminderEnabled(): Promise<boolean> {
  const value = await getPreference(STORAGE_KEYS.enabled);
  return value === "true";
}

export async function setDailyReminderEnabled(enabled: boolean): Promise<void> {
  await savePreference(STORAGE_KEYS.enabled, String(enabled));
  if (!enabled) await cancelDailyReminders();
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

async function cancelNotification(id: number): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {
    // Silent: cancellation must never break the app.
  }
}

async function scheduleFutureReengagement(now: Date, locale: NotificationLocale): Promise<void> {
  const copy = notificationCopy("return", locale);
  const at3Days = new Date(now.getTime() + 3 * DAY_IN_MS);
  const at7Days = new Date(now.getTime() + 7 * DAY_IN_MS);
  await Promise.all([cancelNotification(REENGAGEMENT_3D_ID), cancelNotification(REENGAGEMENT_7D_ID)]);
  await LocalNotifications.schedule({
    notifications: [
      { id: REENGAGEMENT_3D_ID, ...copy, schedule: { at: at3Days, allowWhileIdle: true }, extra: { kind: "reengagement-3d" } },
      { id: REENGAGEMENT_7D_ID, ...copy, schedule: { at: at7Days, allowWhileIdle: true }, extra: { kind: "reengagement-7d" } },
    ],
  });
}

export async function refreshGentleNightReminder(
  now = new Date(),
  locale: NotificationLocale = "id-ID",
): Promise<GentleNightReminderResult> {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") {
      return { status: "unavailable" };
    }
    if (!(await getDailyReminderEnabled())) {
      await cancelDailyReminders();
      return { status: "skipped-opened-today" };
    }

    const permission = await ensureNotificationPermission();
    if (permission === "denied") return { status: "permission-denied" };
    if (permission === "prompted") return { status: "permission-prompted" };

    // Each foreground open resets future absence invitations. If the user does
    // not return, the OS delivers them at day 3/day 7; no app-open "catch-up"
    // notification is emitted.
    await scheduleFutureReengagement(now, locale);

    // Schedule the next invitation. A later foreground open cancels/resets it.
    await cancelNotification(GENTLE_NIGHT_REMINDER_ID);
    const scheduledAt = getNextNightReminderAt(now);
    const dailyCopy = notificationCopy("daily", locale);
    await LocalNotifications.schedule({
      notifications: [{
        id: GENTLE_NIGHT_REMINDER_ID,
        ...dailyCopy,
        schedule: { at: scheduledAt, allowWhileIdle: true },
        extra: { kind: "gentle-night-reminder" },
      }],
    });

    await savePreference(STORAGE_KEYS.scheduledAt, scheduledAt.toISOString());
    await recordAppOpened(now);
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
    console.warn("[Gentle Night Reminder] Scheduler unavailable", safeErrorMetadata(error));
    return { status: "error", error };
  }
}
