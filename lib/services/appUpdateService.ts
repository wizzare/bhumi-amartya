import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { evaluateAppUpdateStatus, type AppUpdateStatus, type RemoteVersionConfig } from "@/lib/services/appUpdatePolicy";

export type { AppUpdateStatus };

/**
 * Checks for application updates from Firestore.
 * Stabilized in KARA 53 to support legacy schema and prevent false positives.
 */
export async function checkAppUpdateStatus(): Promise<AppUpdateStatus> {
  const buildInfo = await getRuntimeBuildInfo();
  const currentBuild = buildInfo.versionCode;

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
