import type { BuildInfo } from "@/lib/config/buildInfo";

export interface AppUpdateStatus {
  currentBuild: number;
  minimumBuild: number;
  /** Best display string for the newer version (remote name, else current name). */
  latestVersion: string;
  /** Remote-provided display name only; null when the remote config has none. */
  latestVersionName: string | null;
  /**
   * Numeric candidate version code (highest trusted). Update eligibility is
   * decided by this — NEVER by comparing display names. null when unknown.
   */
  latestVersionCode: number | null;
  isOutdated: boolean;
  updateUrl: string;
  configSource: "firestore" | "local-failsafe" | "default";
  nativeState?: "unavailable" | "no_update" | "available" | "downloading" | "downloaded" | "immediate_required" | "immediate_in_progress" | "failed";
  policy: "no_update" | "flexible_available" | "immediate_required";
}

export type RemoteVersionConfig = Record<string, unknown>;

/** Optional signal from the Google Play In-App Update API. */
export interface PlayUpdateCandidate {
  /**
   * Play's AppUpdateInfo.availableVersionCode(). When present it is the
   * authoritative target code.
   */
  availableVersionCode?: number | null;
  /**
   * Play's UPDATE_AVAILABLE flag. Google Play only reports this when a strictly
   * higher versionCode is available on the installed app's track, so it may be
   * accepted on its own when no numeric code is exposed.
   */
  available?: boolean;
}

function toFiniteInt(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function evaluateAppUpdateStatus(
  buildInfo: BuildInfo,
  remoteConfig: RemoteVersionConfig | null,
  playCandidate?: PlayUpdateCandidate | null,
): AppUpdateStatus {
  const MIN_SUPPORTED_ANDROID_VERSION_CODE = 99;
  const defaultUpdateUrl = "market://details?id=com.bhumiamartya.app";
  const currentBuild = buildInfo.versionCode;
  const isAndroid = buildInfo.platform === "android";

  let minimumBuild = isAndroid ? MIN_SUPPORTED_ANDROID_VERSION_CODE : 0;
  let updateUrl = defaultUpdateUrl;
  let configSource: AppUpdateStatus["configSource"] = isAndroid ? "local-failsafe" : "default";
  let forceUpdate = false;

  // Remote display name (nullable) and remote numeric candidate (nullable).
  let latestVersionName: string | null = null;
  let remoteCandidateCode: number | null = null;

  if (remoteConfig) {
    const rawName = remoteConfig.latestVersionName ?? remoteConfig.latestVersion ?? remoteConfig.currentVersion;
    if (typeof rawName === "string" && rawName.trim() !== "") {
      latestVersionName = rawName.trim();
    }
    updateUrl = String(remoteConfig.updateUrl || updateUrl);

    remoteCandidateCode = toFiniteInt(
      remoteConfig.latestVersionCode ?? remoteConfig.latestBuild ?? remoteConfig.currentVersionCode,
    );

    if (isAndroid) {
      forceUpdate = remoteConfig.forceUpdate === true;

      let remoteMinBuild: number | null = null;
      if (typeof remoteConfig.minimumSupportedVersionCode !== "undefined") {
        remoteMinBuild = toFiniteInt(remoteConfig.minimumSupportedVersionCode);
      } else if (typeof remoteConfig.minimumBuild !== "undefined") {
        remoteMinBuild = toFiniteInt(remoteConfig.minimumBuild);
      } else if (remoteConfig.forceUpdate === true) {
        console.warn("[APP UPDATE] Legacy forceUpdate active but minimumBuild missing.");
      }

      if (remoteMinBuild !== null) {
        minimumBuild = Math.max(remoteMinBuild, minimumBuild);
        configSource = "firestore";
      }
    }
  }

  // --- Forced update (fail-closed on the minimum; precedence over optional) ---
  const isBelowMinimum = currentBuild < minimumBuild;
  const forceUpdateApplies = forceUpdate && isBelowMinimum;
  const isOutdated = isBelowMinimum || forceUpdateApplies;

  // --- Optional update: numeric versionCode only. Display name never decides. ---
  const playCode = toFiniteInt(playCandidate?.availableVersionCode);
  const trustedCandidateCodes = [remoteCandidateCode, playCode].filter(
    (code): code is number => code !== null,
  );
  const latestVersionCode = trustedCandidateCodes.length > 0 ? Math.max(...trustedCandidateCodes) : null;

  const hasHigherNumericCandidate = latestVersionCode !== null && latestVersionCode > currentBuild;
  // Play's generic UPDATE_AVAILABLE (contract: strictly newer) is accepted only
  // when it does not contradict a numeric target that is not higher.
  const playImpliesNewer =
    playCandidate?.available === true && (playCode === null || playCode > currentBuild);
  const optionalEligible = !isOutdated && (hasHigherNumericCandidate || playImpliesNewer);

  const policy: AppUpdateStatus["policy"] = isOutdated
    ? "immediate_required"
    : optionalEligible
      ? "flexible_available"
      : "no_update";

  return {
    currentBuild,
    minimumBuild,
    latestVersion: latestVersionName ?? buildInfo.versionName,
    latestVersionName,
    latestVersionCode,
    isOutdated,
    updateUrl,
    configSource,
    policy,
  };
}
