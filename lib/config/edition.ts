/**
 * Build 108 ENL — Application Edition Configuration
 *
 * Controls whether the runtime is configured as the dedicated English edition (ENL)
 * or the default multilingual edition.
 *
 * Build-time environment variable: NEXT_PUBLIC_APP_EDITION="ENL"
 */

export type AppEdition = "standard" | "ENL";

export function getAppEdition(): AppEdition {
  if (process.env.NEXT_PUBLIC_APP_EDITION === "ENL") {
    return "ENL";
  }
  return "standard";
}

export function isEnlEdition(): boolean {
  return getAppEdition() === "ENL";
}
