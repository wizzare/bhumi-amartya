/**
 * WeatherAPI.com Provider Gate for Bhumi Production Compliance.
 *
 * Official findings (verified 2026-09-13 from weatherapi.com/pricing.aspx + /docs/):
 * 1. FREE plan: 100,000 calls/month, commercial use allowed, Air Quality
 *    included ("Limited" tier on Free — realtime AQI only, no AQI history).
 * 2. Realtime weather updates every 10–15 minutes; quota resets midnight 1st UTC.
 * 3. Free users must provide link-back attribution:
 *    `Powered by <a href="https://www.weatherapi.com/" title="Weather API">WeatherAPI.com</a>`
 * 4. AQI fields (with ?aqi=yes): co, o3, no2, so2, pm2_5, pm10 (μg/m3) +
 *    us-epa-index (1–6) + gb-defra-index (1–10). NO Indonesian MENLHK index is
 *    supplied — the UI must therefore NOT label provider AQI as MENLHK.
 * 5. Key is passed as a `key=` query parameter; it must live server-side only.
 *
 * Invariants:
 * 1. WEATHERAPI_CLIENT_KEY_ACTIVATION = FORBIDDEN_PENDING_KEY_PROVISIONING
 *    (NEXT_PUBLIC_WEATHERAPI_KEY is NOT an approved activation mechanism,
 *    as bundling keys into public static web/Capacitor bundles exposes them).
 * 2. In production builds without an explicit server-side proxy activation,
 *    all direct client calls are strictly FORBIDDEN (fail-closed).
 * 3. SUNGEO_PRODUCTION_CALLS = 0 (SunGeo is non-commercial without explicit
 *    permission — never use as a substitute).
 */

export const WEATHERAPI_ATTRIBUTION_HTML =
  'Powered by <a href="https://www.weatherapi.com/" title="Weather API">WeatherAPI.com</a>';

export const WEATHERAPI_ATTRIBUTION_TEXT = "Data cuaca oleh WeatherAPI.com";

export function isWeatherApiServerConfigured(): boolean {
  // Client-side key activation is forbidden pending provisioning through a
  // server-side proxy with an authorized key. There is deliberately no code
  // path that reads a NEXT_PUBLIC_* key here.
  return false;
}

export function isWeatherApiCallPermitted(): boolean {
  // Fail closed in production by default. Local dev/QA calls are permitted
  // ONLY with an explicit flag, and even then only against fixtures or a
  // Founder-provisioned dev key via the loopback proxy — never a hardcoded key.
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return process.env.ENABLE_DEV_WEATHERAPI === "true";
}
