import tzLookup from "tz-lookup";

/**
 * CDI-108-01A — canonical timezone resolution for natal calculation.
 *
 * Build 106/107 resolved a missing timezone with `Math.round(longitude / 15)`
 * (a naive 15°-per-hour offset) or a browser guess (`new Date().getTimezoneOffset()`,
 * the CURRENT date's offset, DST-wrong for any historical birth). Both are removed.
 *
 * The canonical source is a deterministic offline polygon lookup of the
 * (latitude, longitude) -> IANA zone name (`tz-lookup`, CC0, pure JS, no I/O).
 * An IANA name (e.g. "Asia/Jakarta") is DST-correct downstream because
 * `toUtcDate` resolves the wall-clock -> UTC conversion for the exact birth
 * instant (via luxon). A `+HH:MM` offset can only ever be an approximation.
 *
 * When neither a usable stored value nor coordinates are available, this returns
 * `null` — callers MUST fail closed (leave the natal chart pending) rather than
 * fabricate an offset.
 */

const IANA_NAME = /^[A-Za-z][A-Za-z_-]*(?:\/[A-Za-z0-9][A-Za-z0-9_+-]*){1,2}$/;
const FIXED_OFFSET = /^[+-]\d{2}:\d{2}$/;
/** Legacy tokens that are NOT a usable timezone even though a value is present. */
const PLACEHOLDER_ZONES = new Set(["", "utc", "gmt", "local", "unknown", "default", "auto"]);

/** True for a real IANA zone name (contains a region, e.g. "America/New_York"). */
export function isIanaTimezone(value: unknown): value is string {
  return typeof value === "string" && IANA_NAME.test(value.trim()) && value.includes("/");
}

/**
 * A stored timezone that must be preserved, never overwritten: a real IANA name,
 * or an explicit `+HH:MM` / `-HH:MM` offset a user or verified lookup produced.
 * Bare "UTC" / "GMT" / "" / "default" are treated as *absent*.
 */
export function isUsableStoredTimezone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (PLACEHOLDER_ZONES.has(v.toLowerCase())) return false;
  return isIanaTimezone(v) || FIXED_OFFSET.test(v);
}

/**
 * Deterministic (lat, lon) -> IANA zone name. Returns `null` for missing /
 * non-finite / out-of-range coordinates or if the lookup cannot classify the
 * point. NEVER returns an offset string.
 */
export function resolveIanaTimezone(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): string | null {
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  try {
    const zone = tzLookup(latitude, longitude);
    return typeof zone === "string" && isIanaTimezone(zone) ? zone : null;
  } catch {
    return null;
  }
}

export type NatalTimezoneSource = "stored" | "iana-geo" | "unresolved";

/**
 * Canonical timezone for a natal profile / calculation input:
 *   1. keep a valid stored IANA / `+HH:MM` value (never overwrite it)
 *   2. else resolve an IANA name from coordinates (deterministic polygon lookup)
 *   3. else `null` — fail closed. No longitude/15 inference, no browser guess.
 */
export function canonicalizeNatalTimezone(input: {
  storedTimezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): { timezone: string | null; source: NatalTimezoneSource } {
  if (isUsableStoredTimezone(input.storedTimezone)) {
    return { timezone: (input.storedTimezone as string).trim(), source: "stored" };
  }
  const geo = resolveIanaTimezone(input.latitude, input.longitude);
  if (geo) return { timezone: geo, source: "iana-geo" };
  return { timezone: null, source: "unresolved" };
}
