import { createHash } from "node:crypto";

export const PRODUCT_ID = process.env.GOOGLE_PLAY_PRODUCT_ID || "bhumi_premium_monthly";
export const BASE_PLAN_ID = process.env.GOOGLE_PLAY_BASE_PLAN_ID || "monthly";
export const PACKAGE_NAME = process.env.ANDROID_PACKAGE_NAME || "com.bhumiamartya.app";
export const MAX_BODY_BYTES = 16 * 1024;
export const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export function previewDryRunEnabled() {
  return process.env.VERCEL_ENV === "preview" && process.env.BILLING_PREVIEW_DRY_RUN === "true";
}

export function originAllowed(origin?: string) {
  if (!origin) return true;
  const allowed = (process.env.ALLOWED_ORIGINS || "capacitor://localhost,http://localhost").split(",").map((value) => value.trim()).filter(Boolean);
  return allowed.includes(origin);
}
