import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { evaluateAppUpdateStatus, type AppUpdateStatus, type RemoteVersionConfig } from "@/lib/services/appUpdatePolicy";
import { Capacitor, registerPlugin } from "@capacitor/core";

export type { AppUpdateStatus };

interface NativeAppUpdatePlugin {
  check(): Promise<{ available?: boolean; flexibleAllowed?: boolean; immediateAllowed?: boolean; downloading?: boolean; downloaded?: boolean; immediateInProgress?: boolean; state?: AppUpdateStatus["nativeState"] }>;
  startFlexible(): Promise<void>;
  startImmediate(): Promise<void>;
  resumeImmediate(): Promise<void>;
  complete(): Promise<void>;
}

const NativeAppUpdate = registerPlugin<NativeAppUpdatePlugin>("AppUpdate");

/**
 * Checks for application updates from Firestore.
 * Stabilized in KARA 53 to support legacy schema and prevent false positives.
 */
export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  let nativeCheckSucceeded = false;
  let native: Awaited<ReturnType<NativeAppUpdatePlugin["check"]>> = {};
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    try {
      native = await NativeAppUpdate.check();
      nativeCheckSucceeded = true;
    } catch {
      native = {};
    }
    if (native.downloaded || native.downloading || native.immediateInProgress || native.available) {
      const nativeState = native.state || (native.downloaded ? "downloaded" : native.downloading ? "downloading" : native.immediateInProgress ? "immediate_in_progress" : native.immediateAllowed ? "immediate_required" : "available");
      const immediate = native.immediateAllowed === true || native.immediateInProgress === true;
      return { currentBuild: buildInfo.versionCode, minimumBuild: buildInfo.versionCode, latestVersion: buildInfo.versionName, isOutdated: immediate && nativeState === "immediate_required", updateUrl: "market://details?id=com.bhumiamartya.app", configSource: "default", nativeState, policy: immediate ? "immediate_required" : "flexible_available" };
    }
  }
  let remoteConfig: RemoteVersionConfig | null = null;

  try {
    const snap = await getDoc(doc(db, "app_config", "version"));
    if (snap.exists()) {
      remoteConfig = snap.data();
    }
  } catch (error) {
    console.warn("[APP UPDATE SERVICE] Failed to fetch remote version config. Using Android local failsafe.", error);
  }

  const evaluated = evaluateAppUpdateStatus(buildInfo, remoteConfig);
  // Play Core is the authority for native distribution availability. If it
  // reports no Play update (or is unavailable in a debug/sideload build), do
  // not turn the Firestore flag into a blocking screen or retry loop.
  if (buildInfo.platform === "android" && (!nativeCheckSucceeded || (!native.available && !native.downloaded && !native.downloading && !native.immediateInProgress))) {
    return { ...evaluated, isOutdated: false, nativeState: nativeCheckSucceeded ? "no_update" : "unavailable", policy: "no_update" };
  }
  return evaluated;
}

export async function startFlexibleUpdate(): Promise<"started" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.startFlexible(); return "started"; } catch { return "failed"; }
}

export async function startImmediateUpdate(): Promise<"started" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.startImmediate(); return "started"; } catch { return "failed"; }
}

export async function resumeImmediateUpdate(): Promise<"resumed" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.resumeImmediate(); return "resumed"; } catch { return "failed"; }
}

export async function completeFlexibleUpdate(): Promise<"completed" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.complete(); return "completed"; } catch { return "failed"; }
}
