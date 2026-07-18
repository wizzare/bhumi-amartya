import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { evaluateAppUpdateStatus, type AppUpdateStatus, type RemoteVersionConfig } from "@/lib/services/appUpdatePolicy";
import { Capacitor, registerPlugin } from "@capacitor/core";

export type { AppUpdateStatus };

interface NativeAppUpdatePlugin {
  check(): Promise<{ available?: boolean; flexibleAllowed?: boolean; immediateAllowed?: boolean; downloaded?: boolean }>;
  startFlexible(): Promise<void>;
  complete(): Promise<void>;
}

const NativeAppUpdate = registerPlugin<NativeAppUpdatePlugin>("AppUpdate");

/**
 * Checks for application updates from Firestore.
 * Stabilized in KARA 53 to support legacy schema and prevent false positives.
 */
export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    const native: Awaited<ReturnType<NativeAppUpdatePlugin["check"]>> = await NativeAppUpdate.check().catch(() => ({} as Awaited<ReturnType<NativeAppUpdatePlugin["check"]>>));
    if (native.available && native.flexibleAllowed) {
      return { currentBuild: buildInfo.versionCode, minimumBuild: buildInfo.versionCode, latestVersion: buildInfo.versionName, isOutdated: false, updateUrl: "market://details?id=com.bhumiamartya.app", configSource: "default" };
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

  return evaluateAppUpdateStatus(buildInfo, remoteConfig);
}

export async function startFlexibleUpdate(): Promise<"started" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.startFlexible(); return "started"; } catch { return "failed"; }
}

export async function completeFlexibleUpdate(): Promise<"completed" | "unavailable" | "failed"> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== "android") return "unavailable";
  try { await NativeAppUpdate.complete(); return "completed"; } catch { return "failed"; }
}
