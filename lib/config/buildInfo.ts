import { Capacitor } from "@capacitor/core";

export const CURRENT_VERSION_NAME = "4.4.12";
export const CURRENT_VERSION_CODE = 92;
export const CURRENT_BUILD_NUMBER = "92";
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
    let buildNumber = info.build || CURRENT_BUILD_NUMBER;
    let versionCode = parseVersionCode(buildNumber) ?? CURRENT_VERSION_CODE;

    const isEmulatorMode = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
    const isQaMode = process.env.NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN === "true";
    const simulatedBuild = process.env.NEXT_PUBLIC_QA_SIMULATED_BUILD;
    if (isEmulatorMode && isQaMode && simulatedBuild) {
      const parsed = parseInt(simulatedBuild, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        versionCode = parsed;
        buildNumber = String(parsed);
      }
    }

    return {
      versionName: info.version || CURRENT_VERSION_NAME,
      versionCode,
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
