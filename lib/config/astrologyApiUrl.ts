import { Capacitor } from "@capacitor/core";
import { assertQaEndpoint } from './qaConfig.mjs';
import { assertQaOperationAllowed } from './qaRuntime';

assertQaOperationAllowed();

/**
 * CDI-108-01 — routing for the canonical Swiss Ephemeris natal-chart service.
 *
 * The Android artifact is a static export (`output: 'export'`) whose WebView runs
 * at `https://localhost`. It cannot host a route handler and it cannot reach
 * `http://localhost:8000` (the pre-fix hardcoded target — cleartext + mixed
 * content, blocked). Mirror the Human Design / daily-guidance pattern: the
 * native app calls the Vercel deployment's proxy route, which forwards to the
 * ephemeris microservice.
 *
 *   ENL edition APK      ->  {WEB_APP_URL}/api/humandesign/astrology  (Vercel runs it)
 *   web (dev / Vercel)   ->  /api/humandesign/astrology               (relative)
 *   env override         ->  NEXT_PUBLIC_ASTROLOGY_API_URL            (absolute, wins)
 *   SSR / no window      ->  canonical absolute
 *
 * When no ephemeris service is configured/deployed the proxy fails closed and
 * the client keeps the locally-computed chart (accurate table Chiron + genuine
 * Whole Sign houses, explicitly labelled) — it never synthesises Placidus.
 */
const ASTROLOGY_API_PATH = "/api/humandesign/astrology";
const CANONICAL_QA_WEB_APP_URL = process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? "https://localhost:8443" : "https://bhumi-amartya-clean.vercel.app";
const CANONICAL_ASTROLOGY_API_URL = `${CANONICAL_QA_WEB_APP_URL}${ASTROLOGY_API_PATH}`;

export function getAstrologyApiUrl(options?: {
  envUrl?: string;
  isNative?: boolean;
  isWindow?: boolean;
  webAppUrl?: string;
}): string {
  assertQaOperationAllowed();
  const envUrl = options?.envUrl ?? process.env.NEXT_PUBLIC_ASTROLOGY_API_URL;
  if (envUrl && envUrl.trim()) return process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? assertQaEndpoint(envUrl.trim()) : envUrl.trim();

  const isNative = options?.isNative
    ?? (typeof Capacitor !== "undefined"
      && typeof Capacitor.isNativePlatform === "function"
      && Capacitor.isNativePlatform());

  if (isNative) {
    const webAppUrl = options?.webAppUrl
      ?? process.env.NEXT_PUBLIC_WEB_APP_URL
      ?? CANONICAL_QA_WEB_APP_URL;
    return `${(process.env.NEXT_PUBLIC_QA_MODE === 'realQA' ? assertQaEndpoint(webAppUrl) : webAppUrl).replace(/\/$/, "")}${ASTROLOGY_API_PATH}`;
  }

  const isWindow = options?.isWindow ?? (typeof window !== "undefined");
  if (isWindow) return ASTROLOGY_API_PATH;

  return CANONICAL_ASTROLOGY_API_URL;
}

export const ASTROLOGY_API_URL: string = getAstrologyApiUrl();
