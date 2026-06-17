import { Capacitor } from "@capacitor/core";

export const CURRENT_VERSION_NAME = "3.1.4";
export const CURRENT_VERSION_CODE = 45;
export const CURRENT_BUILD_NUMBER = "45";
export const INTERNAL_TESTING_TRACK = "Internal Testing";

export type BuildInfo = {
  versionName: string;
  versionCode: number;
  buildNumber: string;
  platform: string;
};

export function getWebBuildInfo(platform = "web"): BuildInfo {
  return {
    versionName: CURRENT_VERSION_NAME,
    versionCode: CURRENT_VERSION_CODE,
    buildNumber: CURRENT_BUILD_NUMBER,
    platform,
  };
}

export async function getRuntimeBuildInfo(): Promise<BuildInfo> {
  const platform = Capacitor.getPlatform?.() || "web";

  if (!Capacitor.isNativePlatform?.()) {
    return getWebBuildInfo(platform);
  }

  try {
    const { App } = await import("@capacitor/app");
    const info = await App.getInfo();
    const buildNumber = info.build || CURRENT_BUILD_NUMBER;

    return {
      versionName: info.version || CURRENT_VERSION_NAME,
      versionCode: parseVersionCode(buildNumber) ?? CURRENT_VERSION_CODE,
      buildNumber,
      platform,
    };
  } catch (error) {
    console.warn("[BUILD INFO] Runtime app metadata unavailable, using fallback constants.", error);
    return getWebBuildInfo(platform);
  }
}

export function parseVersionCode(buildNumber?: string | number | null): number | null {
  if (buildNumber === null || buildNumber === undefined || buildNumber === "") return null;
  const parsed = Number.parseInt(String(buildNumber), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function hasBuildInfoChanged(
  current: {
    versionName?: string | null;
    versionCode?: number | null;
    buildNumber?: string | null;
    platform?: string | null;
  } | null | undefined,
  next: BuildInfo,
) {
  return (
    current?.versionName !== next.versionName ||
    current?.versionCode !== next.versionCode ||
    current?.buildNumber !== next.buildNumber ||
    current?.platform !== next.platform
  );
}
