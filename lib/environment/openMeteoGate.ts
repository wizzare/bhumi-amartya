/**
 * Open-Meteo Provider Gate for Bhumi Production Compliance
 *
 * Invariant: Bhumi Amartya is a commercial mobile application offering subscription billing.
 * Open-Meteo terms of use strictly prohibit commercial/subscription apps from using the free tier:
 *   "Operating websites or apps that have subscriptions or display advertisements... are considered commercial use."
 *
 * Without an authorized commercial API key configured in the environment, all production calls
 * to Open-Meteo MUST fail closed to prevent unlicensed service use.
 */

export function isOpenMeteoCommercialConfigured(): boolean {
  // Only permit Open-Meteo calls if an explicit commercial API key is supplied
  const apiKey = process.env.NEXT_PUBLIC_OPEN_METEO_API_KEY;
  return typeof apiKey === "string" && apiKey.trim().length > 0;
}

export function isOpenMeteoCallPermitted(): boolean {
  // In production builds (NODE_ENV === "production" or production export), strict commercial gate applies
  if (process.env.NODE_ENV === "production") {
    return isOpenMeteoCommercialConfigured();
  }
  // In local development / test mock runs, non-commercial calls are only permitted if explicitly enabled
  return isOpenMeteoCommercialConfigured() || process.env.ENABLE_DEV_OPEN_METEO === "true";
}
