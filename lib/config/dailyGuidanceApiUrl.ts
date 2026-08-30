import { Capacitor } from "@capacitor/core";

const DAILY_GUIDANCE_API_PATH = "/api/ai/daily-guidance";
const CANONICAL_WEB_APP_URL = "https://bhumi-amartya-clean.vercel.app";

export function getDailyGuidanceApiUrl(options?: {
  isNative?: boolean;
  webAppUrl?: string;
}): string {
  const isNative = options?.isNative
    ?? (typeof Capacitor !== "undefined"
      && typeof Capacitor.isNativePlatform === "function"
      && Capacitor.isNativePlatform());

  if (!isNative) return DAILY_GUIDANCE_API_PATH;

  const webAppUrl = options?.webAppUrl
    ?? process.env.NEXT_PUBLIC_WEB_APP_URL
    ?? CANONICAL_WEB_APP_URL;
  return `${webAppUrl.replace(/\/$/, "")}${DAILY_GUIDANCE_API_PATH}`;
}
