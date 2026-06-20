import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";

export interface AppVersionConfig {
  minimumBuild: number;
  latestVersion: string;
  forceUpdate: boolean;
  updateUrl?: string;
}

export interface AppUpdateStatus {
  currentBuild: number;
  minimumBuild: number;
  latestVersion: string;
  isOutdated: boolean;
  updateUrl: string;
}

export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  const currentBuild = buildInfo.versionCode;

  let minimumBuild = 0;
  let latestVersion = buildInfo.versionName;
  let updateUrl = "https://play.google.com/store/apps/details?id=com.bhumiamartya.app";
  let isOutdated = true; // SECURE DEFAULT (Fail-Closed)

  try {
    const snap = await getDoc(doc(db, "app_config", "version"));
    if (snap.exists()) {
      const data = snap.data();
      if (data && typeof data.minimumBuild !== "undefined") {
        let parsedMinBuild: number | null = null;
        if (typeof data.minimumBuild === "number") {
          parsedMinBuild = data.minimumBuild;
        } else {
          const parsed = parseInt(String(data.minimumBuild), 10);
          if (!isNaN(parsed)) {
            parsedMinBuild = parsed;
          }
        }

        if (parsedMinBuild !== null && parsedMinBuild > 0) {
          minimumBuild = parsedMinBuild;
          isOutdated = currentBuild < minimumBuild;
        }
      }
      if (data && data.latestVersion) {
        latestVersion = data.latestVersion;
      }
      if (data && data.updateUrl) {
        updateUrl = data.updateUrl;
      }
    }
  } catch (error) {
    console.warn("[APP UPDATE SERVICE] Failed to fetch remote version config:", error);
    // isOutdated remains true (SECURE DEFAULT)
  }

  return {
    currentBuild,
    minimumBuild,
    latestVersion,
    isOutdated,
    updateUrl,
  };
}
