import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { APP_VERSION } from "@/src/lib/version";
import { App } from "@capacitor/app";

export interface UserActivityPayload {
  uid: string;
  displayName: string;
  email: string;
  lastLogin?: string;
}

function getLocalDateString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

let cachedBuildNumber: string | null = null;

async function getBuildNumber(): Promise<string> {
  if (cachedBuildNumber !== null) return cachedBuildNumber;
  try {
    const info = await App.getInfo();
    cachedBuildNumber = info.build || "";
  } catch {
    cachedBuildNumber = "";
  }
  return cachedBuildNumber;
}

export async function trackAppOpen(payload: UserActivityPayload, isNewSession: boolean) {
  if (!payload.uid) return;
  const dateStr = getLocalDateString();
  const docId = `${payload.uid}_${dateStr}`;
  const docRef = doc(db, "user_activity", docId);
  const buildNum = await getBuildNumber();
  console.log("[ActivityTracker] write attempt", { action: "trackAppOpen", docId, uid: payload.uid });

  const updateData: any = {
    uid: payload.uid,
    displayName: payload.displayName || "Jiwa",
    email: payload.email || "",
    date: dateStr,
    appVersion: APP_VERSION,
    buildNumber: buildNum,
    lastLogin: payload.lastLogin || null,
    lastSeen: serverTimestamp(),
  };

  if (isNewSession) {
    updateData.loginCount = increment(1);
    updateData.sessionCount = increment(1);
    updateData.totalSeconds = increment(0); // Ensure field exists on creation
  }

  try {
    await setDoc(docRef, updateData, { merge: true });
    console.log("[ActivityTracker] write success", { action: "trackAppOpen", docId, uid: payload.uid });
  } catch (error) {
    console.warn("[ActivityTracker] write error", { action: "trackAppOpen", docId, uid: payload.uid, error });
    console.warn("[ActivityTracker] Failed to track app open:", error);
  }
}

export async function trackScreenChange(payload: UserActivityPayload, screenName: string) {
  if (!payload.uid) return;
  const dateStr = getLocalDateString();
  const docId = `${payload.uid}_${dateStr}`;
  const docRef = doc(db, "user_activity", docId);
  const buildNum = await getBuildNumber();
  console.log("[ActivityTracker] write attempt", { action: "trackScreenChange", docId, uid: payload.uid, screenName });

  try {
    await setDoc(docRef, {
      uid: payload.uid,
      displayName: payload.displayName || "Jiwa",
      email: payload.email || "",
      date: dateStr,
      appVersion: APP_VERSION,
      buildNumber: buildNum,
      lastScreen: screenName,
      lastSeen: serverTimestamp(),
    }, { merge: true });
    console.log("[ActivityTracker] write success", { action: "trackScreenChange", docId, uid: payload.uid, screenName });
  } catch (error) {
    console.warn("[ActivityTracker] write error", { action: "trackScreenChange", docId, uid: payload.uid, screenName, error });
    console.warn("[ActivityTracker] Failed to track screen change:", error);
  }
}

export async function trackSessionDuration(payload: UserActivityPayload, seconds: number) {
  if (!payload.uid || seconds <= 0) return;
  const dateStr = getLocalDateString();
  const docId = `${payload.uid}_${dateStr}`;
  const docRef = doc(db, "user_activity", docId);
  const buildNum = await getBuildNumber();
  console.log("[ActivityTracker] write attempt", { action: "trackSessionDuration", docId, uid: payload.uid, seconds });

  try {
    await setDoc(docRef, {
      uid: payload.uid,
      displayName: payload.displayName || "Jiwa",
      email: payload.email || "",
      date: dateStr,
      appVersion: APP_VERSION,
      buildNumber: buildNum,
      totalSeconds: increment(seconds),
      lastSeen: serverTimestamp(),
    }, { merge: true });
    console.log("[ActivityTracker] write success", { action: "trackSessionDuration", docId, uid: payload.uid, seconds });
  } catch (error) {
    console.warn("[ActivityTracker] write error", { action: "trackSessionDuration", docId, uid: payload.uid, seconds, error });
    console.warn("[ActivityTracker] Failed to track session duration:", error);
  }
}
