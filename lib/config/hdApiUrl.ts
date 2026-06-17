/**
 * Canonical URL for the Human Design calculation API.
 *
 * - Web dev (next dev):  falls back to "/api/humandesign/calculate"
 *   which is handled by the Next.js API route on the dev server.
 * - Android APK (production):  NEXT_PUBLIC_HUMAN_DESIGN_API_URL must be
 *   set to the HTTPS Cloud Run endpoint, e.g.
 *   "https://bhumi-humandesign-api-xxxxx.a.run.app/calculate"
 */
export const HD_API_URL: string =
  process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL || "/api/humandesign/calculate";
