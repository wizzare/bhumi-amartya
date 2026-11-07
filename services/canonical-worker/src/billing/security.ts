export const PRODUCT_ID = "bhumi_premium_monthly";
export const BASE_PLAN_ID = "monthly";
export const PACKAGE_NAME = "com.bhumiamartya.app";
export const MAX_BODY_BYTES = 16 * 1024;

export async function tokenHash(token: string): Promise<string> {
  const buffer = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
