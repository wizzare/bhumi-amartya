/**
 * Open-Meteo Provider Gate for Bhumi Production Compliance
 *
 * Invariants:
 * 1. Bhumi Amartya is a commercial mobile application offering subscription billing.
 * 2. OPEN_METEO_FREE_PRODUCTION = FORBIDDEN
 * 3. OPEN_METEO_COMMERCIAL_ACCESS = NOT_CONFIGURED
 * 4. OPEN_METEO_CLIENT_KEY_ACTIVATION = FORBIDDEN_PENDING_ARCHITECTURE_AND_SECURITY_REVIEW
 *    (NEXT_PUBLIC_OPEN_METEO_API_KEY is NOT an approved production activation mechanism,
 *    as bundling secret or commercial API keys into public static web/Capacitor bundles exposes them).
 * 5. In production builds, all calls to Open-Meteo are strictly FORBIDDEN (fail-closed).
 */

export function isOpenMeteoCommercialConfigured(): boolean {
  // Client-side key activation is forbidden pending separate architecture & security review
  return false;
}

export function isOpenMeteoCallPermitted(): boolean {
  // In production builds (NODE_ENV === "production" or production export), Open-Meteo calls are strictly forbidden
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  // In local development / test mock runs only, calls are permitted ONLY if explicitly flagged for dev tests
  return process.env.ENABLE_DEV_OPEN_METEO === "true";
}
