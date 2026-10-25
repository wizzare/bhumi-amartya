import { Capacitor } from "@capacitor/core";
import { assertQaEndpoint } from './qaConfig.mjs';
import { assertQaOperationAllowed } from './qaRuntime';

assertQaOperationAllowed();

const CANONICAL_QA_API_URL = process.env.NEXT_PUBLIC_QA_MODE === 'realQA'
  ? "https://localhost:8443/api/humandesign/calculate"
  : "https://bhumi-human-design-api.vercel.app/calculate";

/**
 * Runtime-aware URL resolution for Human Design calculation API.
 *
 * Rules:
 * 1. Environment Override: `process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL` if present.
 * 2. Capacitor Android/iOS Native APK: MUST use absolute HTTPS URL (never relative `/api/...`).
 * 3. Web Production / Staging: Uses web API proxy route `/api/humandesign/calculate` or absolute web URL.
 * 4. Web Localhost (Dev Server): Uses relative route `/api/humandesign/calculate`.
 */
export function getHdApiUrl(options?: {
  envUrl?: string;
  isNative?: boolean;
  isProd?: boolean;
  isWindow?: boolean;
  webOrigin?: string;
}): string {
  assertQaOperationAllowed();
  const envUrl = options?.envUrl ?? process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL;
  if (envUrl && envUrl.trim()) {
    return process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? assertQaEndpoint(envUrl.trim()) : envUrl.trim();
  }

  const isNative = options?.isNative ?? (typeof Capacitor !== "undefined" && typeof Capacitor.isNativePlatform === "function" && Capacitor.isNativePlatform());

  // Rule: Native Capacitor Android / iOS APK MUST ALWAYS use absolute HTTPS backend endpoint.
  if (isNative) {
    const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || (process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? "https://localhost:8443" : "https://bhumi-amartya-clean.vercel.app");
    return `${(process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? assertQaEndpoint(webAppUrl) : webAppUrl).replace(/\/$/, "")}/api/humandesign/calculate`;
  }

  const isWindow = options?.isWindow ?? (typeof window !== "undefined");
  if (isWindow) {
    return "/api/humandesign/calculate";
  }

  return CANONICAL_QA_API_URL;
}

export const HD_API_URL: string = getHdApiUrl();
