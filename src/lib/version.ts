import {
  CURRENT_BUILD_NUMBER,
  CURRENT_VERSION_NAME,
} from "@/lib/config/buildInfo";

export function formatReleaseName(versionName: string, buildNumber: string): string {
  const majorVersion = versionName.split(".", 1)[0];
  return `BHUMI AMARTYA V${majorVersion} BUILD ${buildNumber}`;
}

export const APP_VERSION = CURRENT_VERSION_NAME;

export const RELEASE_NAME = formatReleaseName(CURRENT_VERSION_NAME, CURRENT_BUILD_NUMBER);

export const LAST_UPDATED = "2026-07-30";
