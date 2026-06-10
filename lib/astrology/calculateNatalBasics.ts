import * as Astronomy from "astronomy-engine";
import calculateSunSign from "@/lib/calculations/calculateSunSign";

export type NatalBasicsInput = {
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  birthCountry?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type NatalBasics = {
  sunSign: string;
  moonSign: string | null;
  ascendant: string | null;
  status: "ready" | "partial" | "pending";
  source: "local-natal-mvp";
  note?: string;
};

export type NatalLocationFallback = {
  latitude: number;
  longitude: number;
  timezone: string;
};

const CITY_FALLBACKS: Record<string, NatalLocationFallback> = {
  jakarta: { latitude: -6.2088, longitude: 106.8456, timezone: "+07:00" },
  bandung: { latitude: -6.9175, longitude: 107.6191, timezone: "+07:00" },
  surabaya: { latitude: -7.2575, longitude: 112.7521, timezone: "+07:00" },
  yogyakarta: { latitude: -7.7956, longitude: 110.3695, timezone: "+07:00" },
  bali: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
  denpasar: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
  makassar: { latitude: -5.1476, longitude: 119.4327, timezone: "+08:00" },
  medan: { latitude: 3.5952, longitude: 98.6722, timezone: "+07:00" },
  palembang: { latitude: -2.9761, longitude: 104.7754, timezone: "+07:00" },
  semarang: { latitude: -6.9667, longitude: 110.4167, timezone: "+07:00" },
  jayapura: { latitude: -2.5916, longitude: 140.669, timezone: "+09:00" },
  london: { latitude: 51.5074, longitude: -0.1278, timezone: "+00:00" },
  singapore: { latitude: 1.3521, longitude: 103.8198, timezone: "+08:00" },
  "new york": { latitude: 40.7128, longitude: -74.006, timezone: "-05:00" },
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function normalizeCity(city?: string | null): string {
  return (city || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function resolveNatalLocation(input: NatalBasicsInput): NatalLocationFallback | null {
  if (
    typeof input.latitude === "number" &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.longitude)
  ) {
    const fallback = findCityFallback(input.birthCity);

    // BUILD 31: If we have coordinates but no timezone, approximate it from longitude
    let timezone = input.timezone || fallback?.timezone || "";
    if (!timezone && input.longitude !== null) {
       const hours = Math.round(input.longitude / 15);
       const sign = hours >= 0 ? "+" : "-";
       timezone = `${sign}${Math.abs(hours).toString().padStart(2, '0')}:00`;
    }

    return {
      latitude: input.latitude,
      longitude: input.longitude,
      timezone: timezone,
    };
  }

  return findCityFallback(input.birthCity);
}

function findCityFallback(city?: string | null): NatalLocationFallback | null {
  const normalized = normalizeCity(city);
  const matchedKey = Object.keys(CITY_FALLBACKS).find((key) => normalized.includes(key));
  return matchedKey ? CITY_FALLBACKS[matchedKey] : null;
}

function parseTimezoneOffsetMinutes(timezone?: string | null): number | null {
  if (!timezone) return null;
  const match = timezone.trim().match(/^([+-])(\d{1,2}):?(\d{2})?$/);
  if (!match) return null;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
}

function toUtcDate(birthDate: string, birthTime: string, timezone: string): Date | null {
  const offsetMinutes = parseTimezoneOffsetMinutes(timezone);
  if (offsetMinutes === null) return null;

  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;

  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000;
  return new Date(utcMs);
}

function signFromLongitude(longitude: number): string {
  const normalized = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(normalized / 30)] ?? "Unknown";
}

function calculateAscendant(date: Date, latitude: number, longitude: number): string {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const horizonVector = Astronomy.VectorFromHorizon(new Astronomy.Spherical(0, 90, 1), date, "normal");
  const eclipticVector = Astronomy.RotateVector(Astronomy.Rotation_HOR_ECL(date, observer), horizonVector);
  const eclipticSphere = Astronomy.SphereFromVector(eclipticVector);
  return signFromLongitude(eclipticSphere.lon);
}

export function calculateNatalBasics(input: NatalBasicsInput): NatalBasics {
  const sunSign = input.birthDate ? calculateSunSign(input.birthDate) : "Unknown";
  const location = resolveNatalLocation(input);
  const timezone = input.timezone || location?.timezone || null;

  if (!input.birthDate || !input.birthTime || !timezone) {
    return {
      sunSign,
      moonSign: null,
      ascendant: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon and Ascendant require birth date, birth time, timezone, and astrology engine.",
    };
  }

  const utcDate = toUtcDate(input.birthDate, input.birthTime, timezone);
  if (!utcDate) {
    return {
      sunSign,
      moonSign: null,
      ascendant: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon and Ascendant require a valid timezone offset.",
    };
  }

  try {
    const moonSign = signFromLongitude(Astronomy.EclipticGeoMoon(utcDate).lon);

    if (!location) {
      return {
        sunSign,
        moonSign,
        ascendant: null,
        status: "partial",
        source: "local-natal-mvp",
        note: "Ascendant requires birth location coordinates. Add latitude/longitude or a supported city fallback.",
      };
    }

    return {
      sunSign,
      moonSign,
      ascendant: calculateAscendant(utcDate, location.latitude, location.longitude),
      status: "ready",
      source: "local-natal-mvp",
    };
  } catch (error) {
    console.error("[Natal Basics] Calculation failed", error);
    return {
      sunSign,
      moonSign: null,
      ascendant: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon and Ascendant require astrology engine.",
    };
  }
}
