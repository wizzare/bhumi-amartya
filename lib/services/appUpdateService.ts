import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";

export interface AppUpdateStatus {
  currentBuild: number;
  minimumBuild: number;
  latestVersion: string;
  isOutdated: boolean;
  updateUrl: string;
}

/**
 * Checks for application updates from Firestore.
 * Stabilized in KARA 53 to support legacy schema and prevent false positives.
 */
export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  const currentBuild = buildInfo.versionCode;

  // 1. Initial State: Access Granted (Fail-Open for Config)
  let minimumBuild = 0;
  let latestVersion = buildInfo.versionName;
  let updateUrl = "https://play.google.com/store/apps/details?id=com.bhumiamartya.app";
  let isOutdated = false; 

  try {
    const snap = await getDoc(doc(db, "app_config", "version"));
    if (snap.exists()) {
      const data = snap.data();
      
      // 2. Derive Latest Version (Support New and Legacy)
      latestVersion = data.latestVersion || data.currentVersion || latestVersion;
      updateUrl = data.updateUrl || updateUrl;

      // 3. Derive Minimum Build (Support New and Legacy)
      // Logic: If minimumBuild is missing, we check forceUpdate legacy flag.
      // If forceUpdate is true, we might fallback to a build number if available, 
      // but usually we prefer explicit build numbers.
      let remoteMinBuild: number | null = null;
      
      if (typeof data.minimumBuild !== "undefined") {
        remoteMinBuild = parseInt(String(data.minimumBuild), 10);
      } else if (data.forceUpdate === true) {
        // Fallback: If legacy forceUpdate is active but no build is specified, 
        // we keep isOutdated as false to avoid locking everyone without a target.
        console.warn("[APP UPDATE] Legacy forceUpdate active but minimumBuild missing.");
      }

      if (remoteMinBuild !== null && !isNaN(remoteMinBuild)) {
        minimumBuild = remoteMinBuild;
        // 4. Force Update Condition
        isOutdated = currentBuild < minimumBuild;
      }
    }
  } catch (error) {
    // If Firestore fails, we allow access (isOutdated remains false)
    console.warn("[APP UPDATE SERVICE] Failed to fetch remote version config. Defaulting to access granted.", error);
  }

  // Local Override for Android: Build 54 and below are forced to update due to geolocation issue
  const MIN_SUPPORTED_ANDROID_VERSION_CODE = 55;
  if (buildInfo.platform === "android" && currentBuild < MIN_SUPPORTED_ANDROID_VERSION_CODE) {
    isOutdated = true;
    minimumBuild = MIN_SUPPORTED_ANDROID_VERSION_CODE;
    updateUrl = "market://details?id=com.bhumiamartya.app";
  }

  return {
    currentBuild,
    minimumBuild,
    latestVersion,
    isOutdated,
    updateUrl,
  };
}
