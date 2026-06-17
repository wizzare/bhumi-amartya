import * as Astronomy from "astronomy-engine";
import calculateSunSign from "@/lib/calculations/calculateSunSign";
import { NatalAspect, NatalBalance, NatalDominance, NatalPattern, PlanetaryPosition } from "@/lib/types/blueprint";

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
  midheaven: string | null;
  planets?: {
    Sun?: PlanetaryPosition;
    Moon?: PlanetaryPosition;
    Mercury?: PlanetaryPosition;
    Venus?: PlanetaryPosition;
    Mars?: PlanetaryPosition;
    Jupiter?: PlanetaryPosition;
    Saturn?: PlanetaryPosition;
    Uranus?: PlanetaryPosition;
    Neptune?: PlanetaryPosition;
    Pluto?: PlanetaryPosition;
    NorthNode?: PlanetaryPosition;
    SouthNode?: PlanetaryPosition;
    Chiron?: PlanetaryPosition;
  };
  northNode?: string;
  southNode?: string;
  chiron?: string;
  houses?: Record<string, { sign: string; degree: number; longitude: number }>;
  placidusHouses?: Record<string, { sign: string; degree: number; longitude: number }>;
  wholeSignHouses?: Record<string, { sign: string; degree: number; longitude: number }>;
  elements?: NatalBalance;
  modalities?: NatalBalance;
  polarities?: NatalBalance;
  aspects?: NatalAspect[];
  patterns?: NatalPattern[];
  dominance?: NatalDominance;
  status: "ready" | "partial" | "pending";
  source: "local-natal-mvp" | "swiss-ephemeris" | "astronomy-engine-fallback";
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

const SIGN_META: Record<string, { element: "Fire" | "Earth" | "Air" | "Water"; modality: "Cardinal" | "Fixed" | "Mutable"; polarity: "Yang" | "Yin" }> = {
  Aries: { element: "Fire", modality: "Cardinal", polarity: "Yang" },
  Taurus: { element: "Earth", modality: "Fixed", polarity: "Yin" },
  Gemini: { element: "Air", modality: "Mutable", polarity: "Yang" },
  Cancer: { element: "Water", modality: "Cardinal", polarity: "Yin" },
  Leo: { element: "Fire", modality: "Fixed", polarity: "Yang" },
  Virgo: { element: "Earth", modality: "Mutable", polarity: "Yin" },
  Libra: { element: "Air", modality: "Cardinal", polarity: "Yang" },
  Scorpio: { element: "Water", modality: "Fixed", polarity: "Yin" },
  Sagittarius: { element: "Fire", modality: "Mutable", polarity: "Yang" },
  Capricorn: { element: "Earth", modality: "Cardinal", polarity: "Yin" },
  Aquarius: { element: "Air", modality: "Fixed", polarity: "Yang" },
  Pisces: { element: "Water", modality: "Mutable", polarity: "Yin" },
};

const BODY_WEIGHTS: Record<string, number> = {
  Sun: 3,
  Moon: 3,
  Mercury: 2,
  Venus: 2,
  Mars: 2,
  Jupiter: 1.5,
  Saturn: 1.5,
  Uranus: 1,
  Neptune: 1,
  Pluto: 1,
  NorthNode: 1,
  SouthNode: 1,
  Chiron: 1,
};

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

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function degreeInSign(longitude: number): number {
  return Number((normalizeLongitude(longitude) % 30).toFixed(4));
}

function houseKey(house: number): string {
  return `house${house}`;
}

function calculateAscendantLongitude(date: Date, latitude: number, longitude: number): number {
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const horizonVector = Astronomy.VectorFromHorizon(new Astronomy.Spherical(0, 90, 1), date, "normal");
  const eclipticVector = Astronomy.RotateVector(Astronomy.Rotation_HOR_ECL(date, observer), horizonVector);
  const eclipticSphere = Astronomy.SphereFromVector(eclipticVector);
  return normalizeLongitude(eclipticSphere.lon);
}

function calculateAscendant(date: Date, latitude: number, longitude: number): string {
  return signFromLongitude(calculateAscendantLongitude(date, latitude, longitude));
}

function calculateMidheavenLongitude(date: Date, longitude: number): number {
  const siderealTime = Astronomy.SiderealTime(date);
  const localSiderealTime = siderealTime + longitude / 15.0;
  const RAMC = (localSiderealTime * 15.0) % 360;

  // Midheaven is the intersection of the local meridian and the ecliptic
  // MC = arctan(tan(RAMC) / cos(epsilon))
  // We approximate epsilon (obliquity) as ~23.4 degrees to avoid missing Astronomy exports
  const epsilonRad = 23.439 * (Math.PI / 180.0);
  const ramcRad = RAMC * (Math.PI / 180.0);

  const mcLon = Math.atan2(Math.sin(ramcRad), Math.cos(ramcRad) * Math.cos(epsilonRad)) * (180.0 / Math.PI);
  return normalizeLongitude(mcLon);
}

function calculateMidheaven(date: Date, latitude: number, longitude: number): string {
  void latitude;
  return signFromLongitude(calculateMidheavenLongitude(date, longitude));
}

function getGeocentricLongitudeLocal(bodyName: string, date: Date): number {
  if (bodyName === "Sun") return Astronomy.SunPosition(date).elon;
  if (bodyName === "Moon") return Astronomy.EclipticGeoMoon(date).lon;
  if (bodyName === "NorthNode") return calculateMeanNorthNodeLongitude(date);
  if (bodyName === "SouthNode") return calculateMeanNorthNodeLongitude(date) + 180;
  if (bodyName === "Chiron") return calculateApproximateChironLongitude(date);

  const bodyEnum = (Astronomy.Body as any)[bodyName];
  if (!bodyEnum) return 0;
  return Astronomy.Ecliptic(Astronomy.GeoVector(bodyEnum, date, true)).elon;
}

function calculateMeanNorthNodeLongitude(date: Date): number {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - j2000) / 86_400_000;
  return normalizeLongitude(125.04452 - 0.0529538083 * days);
}

function calculateApproximateChironLongitude(date: Date): number {
  const j2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - j2000) / 86_400_000;
  return normalizeLongitude(251.35 + days * 0.019777);
}

function buildWholeSignHouses(ascendantLongitude: number): Record<string, { sign: string; degree: number; longitude: number }> {
  const ascSignIndex = Math.floor(normalizeLongitude(ascendantLongitude) / 30);
  const houses: Record<string, { sign: string; degree: number; longitude: number }> = {};
  for (let i = 0; i < 12; i++) {
    const longitude = normalizeLongitude((ascSignIndex + i) * 30);
    houses[houseKey(i + 1)] = {
      sign: signFromLongitude(longitude),
      degree: 0,
      longitude: Number(longitude.toFixed(4)),
    };
  }
  return houses;
}

function buildApproximatePlacidusHouses(ascendantLongitude: number): Record<string, { sign: string; degree: number; longitude: number }> {
  const houses: Record<string, { sign: string; degree: number; longitude: number }> = {};
  for (let i = 0; i < 12; i++) {
    const longitude = normalizeLongitude(ascendantLongitude + i * 30);
    houses[houseKey(i + 1)] = {
      sign: signFromLongitude(longitude),
      degree: degreeInSign(longitude),
      longitude: Number(longitude.toFixed(4)),
    };
  }
  return houses;
}

function determineHouse(longitude: number, houses: Record<string, { longitude: number }>): number | undefined {
  const cusps = Array.from({ length: 12 }, (_, index) => ({
    house: index + 1,
    longitude: normalizeLongitude(houses[houseKey(index + 1)]?.longitude ?? index * 30),
  }));
  const normalized = normalizeLongitude(longitude);

  for (let i = 0; i < cusps.length; i++) {
    const current = cusps[i];
    const next = cusps[(i + 1) % cusps.length];
    if (current.longitude <= next.longitude) {
      if (normalized >= current.longitude && normalized < next.longitude) return current.house;
    } else if (normalized >= current.longitude || normalized < next.longitude) {
      return current.house;
    }
  }

  return undefined;
}

function buildBalances(planets: Record<string, PlanetaryPosition>) {
  const elements: NatalBalance = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities: NatalBalance = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const polarities: NatalBalance = { Yang: 0, Yin: 0 };

  for (const [name, position] of Object.entries(planets)) {
    const meta = SIGN_META[position.sign];
    if (!meta) continue;
    const weight = BODY_WEIGHTS[name] ?? 1;
    elements[meta.element] += weight;
    modalities[meta.modality] += weight;
    polarities[meta.polarity] += weight;
  }

  return { elements, modalities, polarities };
}

function detectAspect(diff: number): { type: NatalAspect["type"]; angle: number; orb: number } | null {
  const definitions: Array<{ type: NatalAspect["type"]; angle: number; orb: number }> = [
    { type: "Conjunction", angle: 0, orb: 8 },
    { type: "Sextile", angle: 60, orb: 5 },
    { type: "Square", angle: 90, orb: 7 },
    { type: "Trine", angle: 120, orb: 7 },
    { type: "Opposition", angle: 180, orb: 8 },
  ];
  return definitions.find((definition) => Math.abs(diff - definition.angle) <= definition.orb) ?? null;
}

function angularDistance(a: number, b: number): number {
  const diff = Math.abs(normalizeLongitude(a) - normalizeLongitude(b));
  return diff > 180 ? 360 - diff : diff;
}

function calculateAspects(planets: Record<string, PlanetaryPosition>): NatalAspect[] {
  const entries = Object.entries(planets);
  const aspects: NatalAspect[] = [];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [p1, a] = entries[i];
      const [p2, b] = entries[j];
      const diff = angularDistance(a.longitude, b.longitude);
      const aspect = detectAspect(diff);
      if (aspect) {
        aspects.push({ p1, p2, type: aspect.type, orb: Number(Math.abs(diff - aspect.angle).toFixed(2)) });
      }
    }
  }
  return aspects.sort((a, b) => a.orb - b.orb);
}

function hasAspect(aspects: NatalAspect[], p1: string, p2: string, type: NatalAspect["type"]): boolean {
  return aspects.some((aspect) => aspect.type === type && ((aspect.p1 === p1 && aspect.p2 === p2) || (aspect.p1 === p2 && aspect.p2 === p1)));
}

function isQuincunx(a: PlanetaryPosition, b: PlanetaryPosition): boolean {
  return Math.abs(angularDistance(a.longitude, b.longitude) - 150) <= 3;
}

function detectPatterns(planets: Record<string, PlanetaryPosition>, aspects: NatalAspect[]): NatalPattern[] {
  const patterns: NatalPattern[] = [];
  const bySign = new Map<string, string[]>();
  const byHouse = new Map<number, string[]>();

  for (const [name, position] of Object.entries(planets)) {
    bySign.set(position.sign, [...(bySign.get(position.sign) ?? []), name]);
    const house = position.placidusHouse ?? position.house;
    if (house) byHouse.set(house, [...(byHouse.get(house) ?? []), name]);
  }

  for (const [sign, names] of bySign.entries()) {
    if (names.length >= 3) patterns.push({ type: "Stellium", planets: names, sign });
  }
  for (const [house, names] of byHouse.entries()) {
    if (names.length >= 3) patterns.push({ type: "Stellium", planets: names, house });
  }

  const names = Object.keys(planets);
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      for (let k = j + 1; k < names.length; k++) {
        const trio = [names[i], names[j], names[k]];
        const trines = hasAspect(aspects, trio[0], trio[1], "Trine") && hasAspect(aspects, trio[0], trio[2], "Trine") && hasAspect(aspects, trio[1], trio[2], "Trine");
        if (trines) patterns.push({ type: "Grand Trine", planets: trio });

        const oppositionPairs: Array<[string, string, string]> = [
          [trio[0], trio[1], trio[2]],
          [trio[0], trio[2], trio[1]],
          [trio[1], trio[2], trio[0]],
        ];
        for (const [a, b, apex] of oppositionPairs) {
          if (hasAspect(aspects, a, b, "Opposition") && hasAspect(aspects, a, apex, "Square") && hasAspect(aspects, b, apex, "Square")) {
            patterns.push({ type: "T-Square", planets: [a, b, apex] });
          }
        }

        for (const apex of trio) {
          const base = trio.filter((name) => name !== apex);
          if (hasAspect(aspects, base[0], base[1], "Sextile") && isQuincunx(planets[apex], planets[base[0]]) && isQuincunx(planets[apex], planets[base[1]])) {
            patterns.push({ type: "Yod", planets: [apex, ...base] });
          }
        }
      }
    }
  }

  const seen = new Set<string>();
  return patterns.filter((pattern) => {
    const key = `${pattern.type}:${pattern.planets.slice().sort().join(",")}:${pattern.sign ?? ""}:${pattern.house ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function highestEntry<T extends string>(scores: Record<T, number>): T | undefined {
  return Object.entries(scores).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] as T | undefined;
}

function calculateDominance(planets: Record<string, PlanetaryPosition>, elements: NatalBalance, modalities: NatalBalance): NatalDominance {
  const planetScores: Record<string, number> = {};
  const signScores: Record<string, number> = {};
  const houseScores: Record<number, number> = {};

  for (const [name, position] of Object.entries(planets)) {
    const weight = BODY_WEIGHTS[name] ?? 1;
    planetScores[name] = (planetScores[name] ?? 0) + weight;
    signScores[position.sign] = (signScores[position.sign] ?? 0) + weight;
    const house = position.placidusHouse ?? position.house;
    if (house) houseScores[house] = (houseScores[house] ?? 0) + weight;
  }

  return {
    dominantPlanet: highestEntry(planetScores),
    dominantSign: highestEntry(signScores),
    dominantElement: highestEntry(elements),
    dominantModality: highestEntry(modalities),
    dominantHouse: Number(Object.entries(houseScores).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? 0) || undefined,
  };
}

function enrichNatalPlanets(
  planets: Record<string, PlanetaryPosition>,
  placidusHouses?: Record<string, { longitude: number }>,
  wholeSignHouses?: Record<string, { longitude: number }>,
): Record<string, PlanetaryPosition> {
  return Object.fromEntries(Object.entries(planets).map(([name, position]) => {
    const placidusHouse = placidusHouses ? determineHouse(position.longitude, placidusHouses) : undefined;
    const wholeSignHouse = wholeSignHouses ? determineHouse(position.longitude, wholeSignHouses) : undefined;
    return [name, {
      ...position,
      house: placidusHouse ?? position.house,
      placidusHouse: placidusHouse ?? position.placidusHouse,
      wholeSignHouse: wholeSignHouse ?? position.wholeSignHouse,
    }];
  }));
}

function buildNatalIntelligence(planets: Record<string, PlanetaryPosition>) {
  const { elements, modalities, polarities } = buildBalances(planets);
  const aspects = calculateAspects(planets);
  const patterns = detectPatterns(planets, aspects);
  const dominance = calculateDominance(planets, elements, modalities);
  return { elements, modalities, polarities, aspects, patterns, dominance };
}

function calculatePlanetsLocal(date: Date): Record<string, PlanetaryPosition> {
  const planetNames = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode", "SouthNode", "Chiron"] as const;
  const planets: any = {};
  const yesterday = new Date(date.getTime() - 24 * 60 * 60 * 1000);

  for (const name of planetNames) {
    const lon = getGeocentricLongitudeLocal(name, date);
    const lonPrev = getGeocentricLongitudeLocal(name, yesterday);

    let diff = lon - lonPrev;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    const retrograde = name !== "Sun" && name !== "Moon" && name !== "SouthNode" ? diff < 0 : name === "SouthNode" ? planets.NorthNode?.retrograde ?? true : false;

    planets[name] = {
      sign: signFromLongitude(lon),
      degree: degreeInSign(lon),
      longitude: Number(normalizeLongitude(lon).toFixed(4)),
      retrograde
    };
  }

  return planets;
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
      midheaven: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon, Ascendant, and Midheaven require birth date, birth time, timezone, and astrology engine.",
    };
  }

  const utcDate = toUtcDate(input.birthDate, input.birthTime, timezone);
  if (!utcDate) {
    return {
      sunSign,
      moonSign: null,
      ascendant: null,
      midheaven: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon, Ascendant, and Midheaven require a valid timezone offset.",
    };
  }

  try {
    const moonSign = signFromLongitude(Astronomy.EclipticGeoMoon(utcDate).lon);

    if (!location) {
      return {
        sunSign,
        moonSign,
        ascendant: null,
        midheaven: null,
        status: "partial",
        source: "local-natal-mvp",
        note: "Ascendant and Midheaven require birth location coordinates. Add latitude/longitude or a supported city fallback.",
      };
    }

    const ascendantLongitude = calculateAscendantLongitude(utcDate, location.latitude, location.longitude);
    const midheavenLongitude = calculateMidheavenLongitude(utcDate, location.longitude);
    const placidusHouses = buildApproximatePlacidusHouses(ascendantLongitude);
    const wholeSignHouses = buildWholeSignHouses(ascendantLongitude);
    const planets = enrichNatalPlanets(calculatePlanetsLocal(utcDate), placidusHouses, wholeSignHouses);
    const intelligence = buildNatalIntelligence(planets);

    return {
      sunSign,
      moonSign,
      ascendant: signFromLongitude(ascendantLongitude),
      midheaven: signFromLongitude(midheavenLongitude),
      planets,
      northNode: planets.NorthNode?.sign,
      southNode: planets.SouthNode?.sign,
      chiron: planets.Chiron?.sign,
      houses: placidusHouses,
      placidusHouses,
      wholeSignHouses,
      ...intelligence,
      status: "ready",
      source: "astronomy-engine-fallback",
    };
  } catch (error) {
    console.error("[Natal Basics] Calculation failed", error);
    return {
      sunSign,
      moonSign: null,
      ascendant: null,
      midheaven: null,
      status: "pending",
      source: "local-natal-mvp",
      note: "Natal Moon, Ascendant, and Midheaven require astrology engine.",
    };
  }
}

export async function calculateNatalBasicsAsync(input: NatalBasicsInput): Promise<NatalBasics> {
  const localResult = calculateNatalBasics(input);
  if (localResult.status !== "ready") return localResult;

  const timezone = input.timezone || resolveNatalLocation(input)?.timezone || null;
  if (!timezone) return localResult;

  try {
    const SERVICE_URL = process.env.HUMAN_DESIGN_SERVICE_URL || "http://localhost:8000";
    const url = `${SERVICE_URL.replace(/\/$/, "")}/calculate-astrology`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        timezone: timezone,
        latitude: input.latitude,
        longitude: input.longitude
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.status === "ready" && data.planets) {
        const planets = enrichNatalPlanets(
          data.planets,
          data.placidusHouses || data.houses,
          data.wholeSignHouses,
        );
        const intelligence = buildNatalIntelligence(planets);
        return {
          sunSign: planets.Sun?.sign || localResult.sunSign,
          moonSign: planets.Moon?.sign || localResult.moonSign,
          ascendant: data.ascendant || localResult.ascendant,
          midheaven: data.midheaven || localResult.midheaven,
          planets,
          northNode: planets.NorthNode?.sign,
          southNode: planets.SouthNode?.sign,
          chiron: planets.Chiron?.sign,
          houses: data.houses || data.placidusHouses || localResult.houses,
          placidusHouses: data.placidusHouses || data.houses || localResult.placidusHouses,
          wholeSignHouses: data.wholeSignHouses || localResult.wholeSignHouses,
          elements: data.elements || intelligence.elements,
          modalities: data.modalities || intelligence.modalities,
          polarities: data.polarities || intelligence.polarities,
          aspects: data.aspects || intelligence.aspects,
          patterns: data.patterns || intelligence.patterns,
          dominance: data.dominance || intelligence.dominance,
          status: "ready",
          source: "swiss-ephemeris"
        };
      }
    }
  } catch (error) {
    console.warn("[Natal Basics] Failed to calculate using remote Swiss Ephemeris, falling back to astronomy-engine.", error);
  }

  return localResult;
}
