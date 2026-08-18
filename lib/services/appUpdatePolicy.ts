import type { BuildInfo } from "@/lib/config/buildInfo";

export interface AppUpdateStatus {
  currentBuild: number;
  minimumBuild: number;
  latestVersion: string;
  isOutdated: boolean;
  updateUrl: string;
  configSource: "firestore" | "local-failsafe" | "default";
  nativeState?: "unavailable" | "no_update" | "available" | "downloading" | "downloaded" | "immediate_required" | "immediate_in_progress" | "failed";
  policy: "no_update" | "flexible_available" | "immediate_required";
}

export type RemoteVersionConfig = Record<string, unknown>;

export function evaluateAppUpdateStatus(
  buildInfo: BuildInfo,
  remoteConfig: RemoteVersionConfig | null,
): AppUpdateStatus {
  const MIN_SUPPORTED_ANDROID_VERSION_CODE = 99;
  const defaultUpdateUrl = "market://details?id=com.bhumiamartya.app";
  const currentBuild = buildInfo.versionCode;
  let minimumBuild = buildInfo.platform === "android" ? MIN_SUPPORTED_ANDROID_VERSION_CODE : 0;
  let latestVersion = buildInfo.versionName;
  let updateUrl = defaultUpdateUrl;
  let configSource: AppUpdateStatus["configSource"] = buildInfo.platform === "android" ? "local-failsafe" : "default";
  let forceUpdate = false;

  if (remoteConfig) {
    latestVersion = String(remoteConfig.latestVersion || remoteConfig.currentVersion || latestVersion);
    updateUrl = String(remoteConfig.updateUrl || updateUrl);

    // minimumSupportedVersionCode, minimumBuild, and forceUpdate are Android
    // release controls. Web has no independently versioned binary, so it must
    // not be locked by an Android minimum until a separate web policy exists.
    if (buildInfo.platform === "android") {
      forceUpdate = remoteConfig.forceUpdate === true;

      let remoteMinBuild: number | null = null;
      if (typeof remoteConfig.minimumSupportedVersionCode !== "undefined") {
        remoteMinBuild = parseInt(String(remoteConfig.minimumSupportedVersionCode), 10);
      } else if (typeof remoteConfig.minimumBuild !== "undefined") {
        remoteMinBuild = parseInt(String(remoteConfig.minimumBuild), 10);
      } else if (remoteConfig.forceUpdate === true) {
        console.warn("[APP UPDATE] Legacy forceUpdate active but minimumBuild missing.");
      }

      if (remoteMinBuild !== null && !isNaN(remoteMinBuild)) {
        minimumBuild = Math.max(remoteMinBuild, minimumBuild);
        configSource = "firestore";
      }
    }
  }

  // A global force flag must not strand a build that already meets the
  // supported minimum. It only has meaning for an actually unsupported
  // installed build; web/PWA builds therefore remain accessible.
  const isBelowMinimum = currentBuild < minimumBuild;
  const forceUpdateApplies = forceUpdate && isBelowMinimum;
  const isOutdated = isBelowMinimum || forceUpdateApplies;
  return {
    currentBuild,
    minimumBuild,
    latestVersion,
    isOutdated,
    updateUrl,
    configSource,
    policy: isOutdated ? "immediate_required" : latestVersion !== buildInfo.versionName ? "flexible_available" : "no_update",
  };
}
