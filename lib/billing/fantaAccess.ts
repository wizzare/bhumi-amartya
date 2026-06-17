import { GAIA_ACCESS_END, isGaiaAccessOverrideActive } from "./gaiaAccess";

/** @deprecated Use Gaia access policy. Kept for compatibility with existing gates. */
export const FANTA_ACCESS_END = GAIA_ACCESS_END;

export function isFantaAccessActive(now = new Date()): boolean {
  return isGaiaAccessOverrideActive(now);
}
