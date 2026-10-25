import { Capacitor } from "@capacitor/core";
import { assertQaEndpoint } from './qaConfig.mjs';
import { assertQaOperationAllowed } from './qaRuntime';

const DAILY_GUIDANCE_API_PATH = "/api/ai/daily-guidance";
const CANONICAL_QA_WEB_APP_URL = process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? "https://localhost:8443" : "https://bhumi-amartya-clean.vercel.app";

export function getDailyGuidanceApiUrl(options?: {
  isNative?: boolean;
  webAppUrl?: string;
}): string {
  assertQaOperationAllowed();
  const isNative = options?.isNative
    ?? (typeof Capacitor !== "undefined"
      && typeof Capacitor.isNativePlatform === "function"
      && Capacitor.isNativePlatform());

  if (!isNative) return DAILY_GUIDANCE_API_PATH;

  const webAppUrl = options?.webAppUrl
    ?? process.env.NEXT_PUBLIC_WEB_APP_URL
    ?? CANONICAL_QA_WEB_APP_URL;
  return `${(process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? assertQaEndpoint(webAppUrl) : webAppUrl).replace(/\/$/, "")}${DAILY_GUIDANCE_API_PATH}`;
}
