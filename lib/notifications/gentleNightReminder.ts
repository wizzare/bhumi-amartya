import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Preferences } from "@capacitor/preferences";

export const GENTLE_NIGHT_REMINDER_ID = 2100;
export const REENGAGEMENT_3D_ID = 2101;
export const REENGAGEMENT_7D_ID = 2102;

export const GENTLE_NIGHT_REMINDER_TITLE = "Bhumi menunggumu sebentar";
export const GENTLE_NIGHT_REMINDER_BODY = "Ambil satu menit untuk menyapa dirimu malam ini.";
export const REENGAGEMENT_3D_TITLE = "Bhumi kangen";
export const REENGAGEMENT_3D_BODY = "Sudah 3 hari tidak mampir. Tidak perlu alasan khusus, hanya ingin memastikan kamu baik-baik saja.";
export const REENGAGEMENT_7D_TITLE = "Bhumi masih di sini";
export const REENGAGEMENT_7D_BODY = "Sudah satu minggu. Kalau mau kembali, pelan-pelan saja. Bhumi tetap di sini untukmu.";

const STORAGE_KEYS = {
  lastOpenedAt: "bhumiLastOpenedAt",
  lastOpenedDate: "bhumiLastOpenedDate",
  permissionPrompted: "bhumiNightReminderPermissionPrompted",
  permissionStatus: "bhumiNightReminderPermissionStatus",
  scheduledAt: "bhumiNightReminderScheduledAt",
  reengagement3dSentAt: "bhumiReengagement3dSentAt",
  reengagement7dSentAt: "bhumiReengagement7dSentAt",
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

function daysSince(lastDate: string | null, now: Date): number {
  if (!lastDate) return Number.POSITIVE_INFINITY;
  const parsed = new Date(`${lastDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return Number.POSITIVE_INFINITY;
  const diff = now.getTime() - parsed.getTime();
  return Math.floor(diff / DAY_IN_MS);
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

async function cancelNotification(id: number): Promise<void> {
  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch {
    // Silent: cancellation must never break the app.
  }
}

async function sendReengagementOnce(
  id: number,
  title: string,
  body: string,
  thresholdDays: number,
  sentKey: string,
  now: Date,
): Promise<boolean> {
  const lastOpened = await getPreference(STORAGE_KEYS.lastOpenedDate);
  if (!lastOpened) return false;
  const inactiveDays = daysSince(lastOpened, now);
  if (!Number.isFinite(inactiveDays) || inactiveDays < thresholdDays) return false;

  const lastSent = await getPreference(sentKey);
  if (lastSent && lastSent >= lastOpened) {
    // Already sent for this inactivity cycle; do not duplicate.
    return false;
  }

  try {
    await cancelNotification(id);
    await LocalNotifications.schedule({
      notifications: [
        {
          id,
          title,
          body,
          schedule: { at: now, allowWhileIdle: true },
          extra: { kind: id === REENGAGEMENT_3D_ID ? "reengagement-3d" : "reengagement-7d" },
        },
      ],
    });
    await savePreference(sentKey, getLocalDateKey(now));
    return true;
  } catch {
    return false;
  }
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

    // Re-engagement cycles (3d / 7d) — send at most once per inactivity cycle.
    const sent3 = await sendReengagementOnce(
      REENGAGEMENT_3D_ID,
      REENGAGEMENT_3D_TITLE,
      REENGAGEMENT_3D_BODY,
      3,
      STORAGE_KEYS.reengagement3dSentAt,
      now,
    );
    const sent7 = await sendReengagementOnce(
      REENGAGEMENT_7D_ID,
      REENGAGEMENT_7D_TITLE,
      REENGAGEMENT_7D_BODY,
      7,
      STORAGE_KEYS.reengagement7dSentAt,
      now,
    );
    if (sent3 || sent7) {
      return { status: "reengagement-sent" };
    }

    // Daily 21:00 reminder ONLY if user has NOT opened the app today.
    const lastOpenedDate = await getPreference(STORAGE_KEYS.lastOpenedDate);
    const todayKey = getLocalDateKey(now);
    if (lastOpenedDate === todayKey) {
      await cancelNotification(GENTLE_NIGHT_REMINDER_ID);
      return { status: "skipped-opened-today" };
    }

    await cancelNotification(GENTLE_NIGHT_REMINDER_ID);
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
