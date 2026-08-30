import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { evaluateAppUpdateStatus, type AppUpdateStatus, type RemoteVersionConfig } from "@/lib/services/appUpdatePolicy";
import { Capacitor, registerPlugin } from "@capacitor/core";

export type { AppUpdateStatus };

interface NativeAppUpdateResult {
  available?: boolean;
  flexibleAllowed?: boolean;
  immediateAllowed?: boolean;
  downloading?: boolean;
  downloaded?: boolean;
  immediateInProgress?: boolean;
  state?: AppUpdateStatus["nativeState"];
}

interface NativeAppUpdatePlugin {
  check(): Promise<NativeAppUpdateResult | null | undefined>;
  startFlexible(): Promise<void>;
  startImmediate(): Promise<void>;
  resumeImmediate(): Promise<void>;
  complete(): Promise<void>;
}

const NativeAppUpdate = registerPlugin<NativeAppUpdatePlugin>("AppUpdate");

export function normalizeNativeAppUpdateResult(value: unknown): NativeAppUpdateResult {
  if (!value || typeof value !== "object") return {};
  const candidate = value as Record<string, unknown>;
  const normalized: NativeAppUpdateResult = {};

  for (const key of ["available", "flexibleAllowed", "immediateAllowed", "downloading", "downloaded", "immediateInProgress"] as const) {
    if (typeof candidate[key] === "boolean") normalized[key] = candidate[key];
  }

  const allowedStates: AppUpdateStatus["nativeState"][] = ["unavailable", "no_update", "available", "downloading", "downloaded", "immediate_required", "immediate_in_progress", "failed"];
  if (allowedStates.includes(candidate.state as AppUpdateStatus["nativeState"])) {
    normalized.state = candidate.state as AppUpdateStatus["nativeState"];
  }

  return normalized;
}

export async function runNativeAppUpdateCheck(
  check: () => Promise<unknown>,
  logWarning: (message: string, error: unknown) => void = console.warn,
): Promise<{ native: NativeAppUpdateResult; succeeded: boolean }> {
  try {
    return { native: normalizeNativeAppUpdateResult(await check()), succeeded: true };
  } catch (error) {
    logWarning("[APP UPDATE SERVICE] Native update check unavailable. Using local fallback.", error);
    return { native: {}, succeeded: false };
  }
}

/**
 * Checks for application updates from Firestore.
 * Stabilized in KARA 53 to support legacy schema and prevent false positives.
 */
export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  let nativeCheckSucceeded = false;
  let native: NativeAppUpdateResult = {};
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
    const nativeCheck = await runNativeAppUpdateCheck(() => NativeAppUpdate.check());
    native = nativeCheck.native;
    nativeCheckSucceeded = nativeCheck.succeeded;
    if (native.downloaded || native.downloading || native.immediateInProgress || native.available) {
      const nativeState = native.state || (native.downloaded ? "downloaded" : native.downloading ? "downloading" : native.immediateInProgress ? "immediate_in_progress" : native.immediateAllowed ? "immediate_required" : "available");
      const immediate = native.immediateAllowed === true || native.immediateInProgress === true;
      // Google Play only surfaces available/downloaded/immediate for a strictly
      // newer versionCode, so this branch does not need a numeric guard.
      return { currentBuild: buildInfo.versionCode, minimumBuild: buildInfo.versionCode, latestVersion: buildInfo.versionName, latestVersionName: null, latestVersionCode: null, isOutdated: immediate && nativeState === "immediate_required", updateUrl: "market://details?id=com.bhumiamartya.app", configSource: "default", nativeState, policy: immediate ? "immediate_required" : "flexible_available" };
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
  // Play Core is the authority for native distribution, but the Firestore
  // minimumBuild/forceUpdate is the authority for what is supported. If Play
  // Core reports no update AND Firestore also says the build is current, only
  // then skip the forced-update screen. If Firestore flags the build as
  // outdated, that takes precedence regardless of Play Core availability.
  if (buildInfo.platform === "android" && !evaluated.isOutdated && (!nativeCheckSucceeded || (!native.available && !native.downloaded && !native.downloading && !native.immediateInProgress))) {
    return { ...evaluated, nativeState: nativeCheckSucceeded ? "no_update" : "unavailable", policy: "no_update" };
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
