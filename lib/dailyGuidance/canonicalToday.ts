import { getLocalDateKey } from "./dateKey";

export interface CanonicalToday {
  localDateKey: string;
  timezone: string;
  calculationInstant: Date;
  localDate: Date;
}

export interface CanonicalTodayInput {
  uid: string;
  profileTimezone?: string | null;
  browserTimezone?: string;
  now?: Date;
}

function resolveBrowserTimezone(): string | null {
  if (typeof Intl === "undefined") return null;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the canonical "today" for a user, providing both the local date key
 * (for calendar grouping/UI) and the calculation instant (for astronomical engines).
 * 
 * The contract distinguishes:
 * - localDateKey / localDate: calendar date for UX/day grouping (timezone-aware)
 * - calculationInstant: actual instant for astronomical calculations (timezone-aware Date)
 * 
 * Timezone resolution hierarchy:
 * 1. profile.timezone (user's explicit preference)
 * 2. browser/device timezone (Intl.DateTimeFormat().resolvedOptions().timeZone)
 * 3. "UTC" (last resort)
 */
export function getCanonicalToday(input: CanonicalTodayInput): CanonicalToday {
  const now = input.now ?? new Date();
  
  // Resolve timezone per hierarchy
  const timezone = 
    input.profileTimezone 
    ?? input.browserTimezone 
    ?? resolveBrowserTimezone()
    ?? "UTC";

  // Local date key for calendar grouping / UI day grouping
  const localDateKey = getLocalDateKey(now, timezone);
  
  // Local date object for UI display (start of day in user's timezone)
  // We create this by parsing the local date key back to a Date at noon local time
  // to avoid DST boundary issues.
  const [year, month, day] = localDateKey.split("-").map(Number);
  const localDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  
  // Calculation instant: the actual instant used by astronomical engines.
  // This IS the original `now` instant, not the local date at midnight/noon.
  // Astronomical engines (calculateCurrentSky, etc.) require the actual instant.
  const calculationInstant = now;

  return {
    localDateKey,
    timezone,
    calculationInstant,
    localDate,
  };
}

/**
 * Gets the user's timezone from their profile or browser.
 * Returns the resolved timezone string.
 */
export function getUserTimezone(profileTimezone?: string | null, browserTimezone?: string): string {
  return profileTimezone 
    ?? browserTimezone 
    ?? resolveBrowserTimezone()
    ?? "UTC";
}

/**
 * Helper to get the calculation instant for astronomical engines.
 * This is the raw Date instant (now or a specific reference time).
 * 
 * For "today" calculations, use the canonical today's calculationInstant.
 * For specific dates (e.g., yesterday), construct the instant at noon local time.
 */
export function getCalculationInstantForLocalDate(localDateKey: string, timezone: string): Date {
  const [year, month, day] = localDateKey.split("-").map(Number);
  // Noon local time as the reference instant for that day
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/**
 * Helper to get yesterday's local date key and calculation instant.
 */
export function getYesterdayCanonical(input: CanonicalTodayInput): CanonicalToday {
  const canonicalToday = getCanonicalToday(input);
  
  // Derive yesterday purely in ISO date-key space, then rebuild its noon anchor.
  // This avoids DST/day-shift artifacts from mutating UTC-constructed Dates.
  const [year, month, day] = canonicalToday.localDateKey.split("-").map(Number);
  const previousUtcNoon = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  previousUtcNoon.setUTCDate(previousUtcNoon.getUTCDate() - 1);
  const yesterdayLocalDateKey = previousUtcNoon.toISOString().slice(0, 10);
  
  return {
    localDateKey: yesterdayLocalDateKey,
    timezone: canonicalToday.timezone,
    calculationInstant: getCalculationInstantForLocalDate(yesterdayLocalDateKey, canonicalToday.timezone),
    localDate: new Date(Date.UTC(
      previousUtcNoon.getUTCFullYear(),
      previousUtcNoon.getUTCMonth(),
      previousUtcNoon.getUTCDate(),
      12, 0, 0
    )),
  };
}

/**
 * Gets the current time in the user's timezone as an ISO string.
 * Useful for timestamps that need to preserve timezone context.
 */
export function getCurrentISOStringInTimezone(timezone: string): string {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === "year")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const day = parts.find(p => p.type === "day")?.value;
    const hour = parts.find(p => p.type === "hour")?.value;
    const minute = parts.find(p => p.type === "minute")?.value;
    const second = parts.find(p => p.type === "second")?.value;
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  } catch {
    return new Date().toISOString();
  }
}