/**
 * Canonical URL for the Human Design calculation API.
 *
 * - Web dev (next dev):  falls back to "/api/humandesign/calculate"
 *   which is handled by the Next.js API route on the dev server.
 * - Android APK (production):  NEXT_PUBLIC_HUMAN_DESIGN_API_URL must be
 *   set to the HTTPS Cloud Run endpoint, e.g.
 *   "https://bhumi-humandesign-api-xxxxx.a.run.app/calculate"
 */
export function getHdApiUrl(): string {
  if (process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL) {
    return process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL;
  }
  if (typeof window !== "undefined") {
    return "/api/humandesign/calculate";
  }
  return "https://bhumi-human-design-api.vercel.app/calculate";
}

export const HD_API_URL: string = getHdApiUrl();
