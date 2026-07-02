import type { BuildInfo } from "@/lib/config/buildInfo";

export interface AppUpdateStatus {
  currentBuild: number;
  minimumBuild: number;
  latestVersion: string;
  isOutdated: boolean;
  updateUrl: string;
  configSource: "firestore" | "local-failsafe" | "default";
}

export type RemoteVersionConfig = Record<string, unknown>;

export function evaluateAppUpdateStatus(
  buildInfo: BuildInfo,
  remoteConfig: RemoteVersionConfig | null,
): AppUpdateStatus {
  const MIN_SUPPORTED_ANDROID_VERSION_CODE = 62;
  const defaultUpdateUrl = "market://details?id=com.bhumiamartya.app";
  const currentBuild = buildInfo.versionCode;
  let minimumBuild = buildInfo.platform === "android" ? MIN_SUPPORTED_ANDROID_VERSION_CODE : 0;
  let latestVersion = buildInfo.versionName;
  let updateUrl = defaultUpdateUrl;
  let configSource: AppUpdateStatus["configSource"] = buildInfo.platform === "android" ? "local-failsafe" : "default";

  if (remoteConfig) {
    latestVersion = String(remoteConfig.latestVersion || remoteConfig.currentVersion || latestVersion);
    updateUrl = String(remoteConfig.updateUrl || updateUrl);

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

  return {
    currentBuild,
    minimumBuild,
    latestVersion,
    isOutdated: currentBuild < minimumBuild,
    updateUrl,
    configSource,
  };
}
