/**
 * Canonical FCM Registration — permission → token → persistence → refresh
 * Flow: User permission → FCM registration → device token → secure persistence → server target
 */
import { fcmTokenRepository } from "@/lib/repositories/fcmTokenRepository";
import { Capacitor } from "@capacitor/core";

export type PermissionState = "granted" | "denied" | "default" | "unavailable";
export type RegistrationResult =
  | { status: "registered"; token: string; platform: "web" }
  | { status: "permission-denied" }
  | { status: "unavailable"; reason: string }
  | { status: "error"; errorCode: "token-persistence-failed" };

function getPlatform(): "web" | "android" | "ios" | "unknown" {
  if (Capacitor.isNativePlatform()) {
    const p = Capacitor.getPlatform();
    if (p === "android") return "android";
    if (p === "ios") return "ios";
  }
  if (typeof window !== "undefined" && "Notification" in window) return "web";
  return "unknown";
}

export async function getPermissionState(): Promise<PermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unavailable";
  const perm = Notification.permission as PermissionState;
  if (perm === "granted" || perm === "denied" || perm === "default") return perm;
  return "default";
}

export async function requestPermission(): Promise<PermissionState> {
  if (typeof window === "undefined" || !("Notification" in window)) return "unavailable";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    const result = await Notification.requestPermission();
    return result as PermissionState;
  } catch { return "denied"; }
}

async function getWebFcmToken(): Promise<string | null> {
  try {
    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY;
    if (!vapidKey) return null;
    // Dynamic import to avoid SSR bundling issues
    const { getMessaging, getToken } = await import("firebase/messaging");
    const { app } = await import("@/lib/firebase/config");
    const messaging = getMessaging(app);
    // Ensure service worker registered for web
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
    const serviceWorkerRegistration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration });
    return token || null;
  } catch {
    return null;
  }
}

export async function registerFcmToken(uid: string): Promise<RegistrationResult> {
  const platform = getPlatform();
  if (platform !== "web") {
    return { status: "unavailable", reason: "native-push-plugin-not-configured" };
  }
  const perm = await getPermissionState();
  if (perm === "denied") return { status: "permission-denied" };
  if (perm !== "granted") {
    const requested = await requestPermission();
    if (requested !== "granted") return { status: "permission-denied" };
  }

  const token = await getWebFcmToken();
  if (!token) return { status: "unavailable", reason: "web-fcm-token-unavailable" };
  try {
    await fcmTokenRepository.saveToken(uid, token, "web");
    return { status: "registered", token, platform: "web" };
  } catch {
    return { status: "error", errorCode: "token-persistence-failed" };
  }
}

export async function refreshFcmToken(uid: string, oldToken: string): Promise<RegistrationResult> {
  const replacement = await registerFcmToken(uid);
  if (replacement.status === "registered" && replacement.token !== oldToken) {
    await fcmTokenRepository.invalidateToken(uid, oldToken);
  }
  return replacement;
}

export async function onLogoutInvalidate(uid: string, token?: string): Promise<void> {
  if (token) await fcmTokenRepository.invalidateToken(uid, token);
  // keep other tokens for multi-device; logout only invalidates current device token
}

export async function onAccountDeletionCleanup(uid: string): Promise<void> {
  await fcmTokenRepository.deleteAllForUser(uid);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("bhumiNotificationState");
    window.localStorage.removeItem("bhumiReminderState");
  }
}
