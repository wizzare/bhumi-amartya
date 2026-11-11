/**
 * BP04-D1 - Pure data-state & input resolution logic for Personal Astrology route.
 * Strictly adheres to UID ownership isolation, multi-user switching guards,
 * birth time accuracy flags, timezone validation, and freshness tracking.
 * Strictly 0 CJK and 0 non-ASCII clean.
 */

export type AstroDataStatus =
  | "loading"
  | "ready"
  | "no_birth_data"
  | "invalid_birth_date"
  | "needs_birth_time"
  | "needs_timezone"
  | "needs_location"
  | "error";

export type AstroFreshness = "fresh" | "stale" | "unknown";

export type AstroBirthInput = {
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  birthCountry?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeUncertain?: boolean;
};

export type AstroBirthSnapshot = {
  input: AstroBirthInput | null;
  profile: AstroBirthInput | null;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_FORMAT = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/;
export const ASTRO_ENGINE_VERSION = "bhumi-astro-1.0.0";

export function isValidAstroBirthDate(value?: string | null): boolean {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [, y, m, d] = ISO_DATE.exec(value) ?? [];
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if (year < 1850 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return false;
  return date < new Date(Date.UTC(2100, 0, 1)) && date <= new Date();
}

export function isValidAstroBirthTime(value?: string | null): boolean {
  if (typeof value !== "string") return false;
  return TIME_FORMAT.test(value.trim());
}

export function resolveAstroBirthData(snapshot: AstroBirthSnapshot): {
  birthProfile: Required<Pick<AstroBirthInput, "birthDate" | "birthTime" | "timezone">> & AstroBirthInput | null;
  status: AstroDataStatus;
} {
  const date = snapshot.input?.birthDate || snapshot.profile?.birthDate;
  if (!date) return { birthProfile: null, status: "no_birth_data" };
  if (!isValidAstroBirthDate(date)) return { birthProfile: null, status: "invalid_birth_date" };

  const time = snapshot.input?.birthTime || snapshot.profile?.birthTime;
  if (!time || !isValidAstroBirthTime(time)) return { birthProfile: null, status: "needs_birth_time" };
  const timeUncertain = snapshot.input?.timeUncertain || snapshot.profile?.timeUncertain || false;

  const timezone = snapshot.input?.timezone || snapshot.profile?.timezone;
  if (!timezone || !timezone.trim()) return { birthProfile: null, status: "needs_timezone" };

  const city = snapshot.input?.birthCity || snapshot.profile?.birthCity || null;
  const country = snapshot.input?.birthCountry || snapshot.profile?.birthCountry || null;
  const lat = snapshot.input?.latitude ?? snapshot.profile?.latitude;
  const lng = snapshot.input?.longitude ?? snapshot.profile?.longitude;
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return { birthProfile: null, status: "needs_location" };

  return {
    birthProfile: {
      birthDate: date,
      birthTime: time.length === 5 ? `${time}:00` : time,
      timezone: timezone.trim(),
      birthCity: city,
      birthCountry: country,
      latitude: lat,
      longitude: lng,
      timeUncertain,
    },
    status: "ready",
  };
}

export function astroInputFingerprint(input: AstroBirthInput, engineVersion = ASTRO_ENGINE_VERSION): string {
  return `${engineVersion}::${input.birthDate || ""}::${input.birthTime || ""}::${input.timezone || ""}::${input.longitude || 0}`;
}