import { calculateNatalBasics, resolveNatalLocation, type NatalBasics, type NatalBasicsInput } from "@/lib/astrology/calculateNatalBasics";
import type { NatalAspect, NatalBalance, PlanetaryPosition } from "@/lib/types/blueprint";
import type { WholeSignEmphasis, WholeSignHouse, WholeSignPlanetPlacement, WholeSignResult } from "./types";

export const WHOLE_SIGN_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon", Leo: "Sun", Virgo: "Mercury",
  Libra: "Venus", Scorpio: "Mars", Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const MODERN_CO_RULERS: Record<string, string> = { Scorpio: "Pluto", Aquarius: "Uranus", Pisces: "Neptune" };

const HOUSE_DOMAINS: Record<number, string> = {
  1: "cara hadir, tubuh, dan inisiatif", 2: "nilai diri dan sumber daya", 3: "belajar, komunikasi, dan lingkungan dekat",
  4: "rumah, akar, dan keamanan batin", 5: "kreativitas, kegembiraan, dan ekspresi", 6: "ritme harian, kerja, dan perawatan diri",
  7: "relasi dan kemitraan", 8: "keintiman, kepercayaan, dan perubahan", 9: "makna, wawasan, dan perjalanan",
  10: "kontribusi, tanggung jawab, dan arah publik", 11: "komunitas, persahabatan, dan visi", 12: "keheningan, pemulihan, dan dunia batin",
};

type StoredNatalFacts = Partial<NatalBasics> & {
  risingSign?: string;
  mc?: string;
  planets?: Record<string, PlanetaryPosition>;
  aspects?: NatalAspect[];
  elements?: NatalBalance;
  modalities?: NatalBalance;
};

const normalizedSignIndex = (sign?: string | null) => WHOLE_SIGN_SIGNS.findIndex((item) => item.toLowerCase() === String(sign ?? "").toLowerCase());

function validTimezone(timezone?: string | null): boolean {
  if (!timezone) return false;
  if (/^[+-](?:0\d|1\d|2[0-3]):[0-5]\d$/.test(timezone)) return true;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

function validBirthTime(value?: string | null): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value || "");
  return Boolean(match && Number(match[1]) <= 23 && Number(match[2]) <= 59);
}

export function wholeSignHouseForSign(planetSign: string, ascendantSign: string): number | null {
  const planetIndex = normalizedSignIndex(planetSign);
  const ascendantIndex = normalizedSignIndex(ascendantSign);
  return planetIndex < 0 || ascendantIndex < 0 ? null : ((planetIndex - ascendantIndex + 12) % 12) + 1;
}

function placement(name: string, value: PlanetaryPosition, ascendantSign: string | null): WholeSignPlanetPlacement | null {
  if (!Number.isFinite(value.longitude) || normalizedSignIndex(value.sign) < 0) return null;
  const degree = ((value.longitude % 30) + 30) % 30;
  return {
    planet: name,
    longitude: Number((((value.longitude % 360) + 360) % 360).toFixed(4)),
    sign: value.sign,
    degree: Math.floor(degree),
    minute: Math.floor((degree - Math.floor(degree)) * 60),
    retrograde: value.retrograde === true,
    wholeSignHouse: ascendantSign ? wholeSignHouseForSign(value.sign, ascendantSign) : null,
    placidusHouse: Number.isFinite(value.placidusHouse) ? value.placidusHouse! : Number.isFinite(value.house) ? value.house! : null,
    canonicalStatus: ascendantSign ? "canonical" : "sign-only",
  };
}

function housesFor(ascendantSign: string, planets: WholeSignPlanetPlacement[]): WholeSignHouse[] {
  const ascendantIndex = normalizedSignIndex(ascendantSign);
  return Array.from({ length: 12 }, (_, index) => {
    const houseNumber = index + 1;
    const sign = WHOLE_SIGN_SIGNS[(ascendantIndex + index) % 12];
    const occupants = planets.filter((planet) => planet.wholeSignHouse === houseNumber).map((planet) => planet.planet);
    const domain = HOUSE_DOMAINS[houseNumber];
    return {
      houseNumber,
      sign,
      ruler: TRADITIONAL_RULERS[sign],
      modernCoRuler: MODERN_CO_RULERS[sign] ?? null,
      planets: occupants,
      shortExplanation: `${sign} memberi nada pada ${domain}.`,
      fullExplanation: occupants.length
        ? `Area ${domain} mendapat perhatian melalui ${occupants.join(", ")}. ${sign} mengajak pengalaman di sini bergerak dengan ritme yang khas tanpa menjadikannya satu-satunya pusat hidup.`
        : `Area ${domain} tetap memiliki arah melalui ${sign} dan penguasanya, meski tidak ada planet yang menempatinya. Rumah kosong bukan berarti bagian hidup ini tidak aktif atau tidak penting.`,
      availabilityStatus: "available" as const,
    };
  });
}

function emphasisFor(houses: WholeSignHouse[], planets: WholeSignPlanetPlacement[], chartRuler: string): WholeSignEmphasis[] {
  return houses
    .map((house) => {
      const occupants = planets.filter((planet) => planet.wholeSignHouse === house.houseNumber);
      const reasons = [
        occupants.length >= 2 ? `${occupants.length} planet berada di area ini` : null,
        occupants.some((planet) => planet.planet === "Sun" || planet.planet === "Moon") ? "memuat salah satu cahaya utama" : null,
        [1, 4, 7, 10].includes(house.houseNumber) && occupants.length ? "rumah sudut yang ditempati" : null,
        occupants.some((planet) => planet.planet === chartRuler) ? "memuat penguasa bagan" : null,
      ].filter((value): value is string => Boolean(value));
      return { houseNumber: house.houseNumber, sign: house.sign, planets: occupants.map((planet) => planet.planet), reasons };
    })
    .filter((item) => item.reasons.length > 0)
    .sort((left, right) => right.reasons.length - left.reasons.length || left.houseNumber - right.houseNumber)
    .slice(0, 3);
}

function selectCanonicalNatal(input: NatalBasicsInput, stored?: StoredNatalFacts | null): NatalBasics & StoredNatalFacts {
  const calculated = calculateNatalBasics(input);
  if (!stored?.planets || !Object.keys(stored.planets).length) return calculated;
  return {
    ...calculated,
    ...stored,
    ascendant: stored.ascendant || stored.risingSign || calculated.ascendant,
    midheaven: stored.midheaven || stored.mc || calculated.midheaven,
    planets: stored.planets,
    aspects: stored.aspects || calculated.aspects,
    elements: stored.elements || calculated.elements,
    modalities: stored.modalities || calculated.modalities,
    status: calculated.status,
    source: calculated.source,
  };
}

export function calculateWholeSign(input: NatalBasicsInput, storedNatal?: StoredNatalFacts | null): WholeSignResult {
  const safeInput = validTimezone(input.timezone) ? input : { ...input, birthTime: null, timezone: null };
  const natal = selectCanonicalNatal(safeInput, storedNatal);
  const location = resolveNatalLocation(input);
  const preciseInput = Boolean(input.birthDate && validBirthTime(input.birthTime) && validTimezone(input.timezone) && location);
  const ascendantSign = preciseInput ? natal.ascendant || natal.risingSign || null : null;
  const planetValues = Object.entries(natal.planets || {})
    .map(([name, value]) => placement(name, value, ascendantSign))
    .filter((value): value is WholeSignPlanetPlacement => Boolean(value));
  const houses = ascendantSign ? housesFor(ascendantSign, planetValues) : [];
  const chartRuler = ascendantSign ? TRADITIONAL_RULERS[ascendantSign] : "";
  const midheavenSign = natal.midheaven || natal.mc || null;
  const midheavenHouse = ascendantSign && midheavenSign ? wholeSignHouseForSign(midheavenSign, ascendantSign) : null;
  const birthDataStatus = ascendantSign && planetValues.length ? "available" : planetValues.length || natal.sunSign || natal.moonSign ? "partial" : "unavailable";

  return {
    systemName: "Whole Sign Birth Chart",
    zodiacType: "Tropical",
    houseSystem: "Whole Sign",
    birthDataStatus,
    note: birthDataStatus === "available" ? null : "Rumah Whole Sign memerlukan waktu lahir, zona waktu, dan lokasi yang terverifikasi. Data tanda yang tersedia tetap ditampilkan tanpa membuat Ascendant atau penempatan rumah.",
    ascendant: ascendantSign ? { sign: ascendantSign, longitude: null, degree: null, minute: null, wholeSignHouse: 1, canonicalStatus: "canonical" } : null,
    midheaven: midheavenSign ? { sign: midheavenSign, longitude: null, degree: null, minute: null, wholeSignHouse: midheavenHouse, canonicalStatus: midheavenHouse ? "sign-only" : "unavailable" } : null,
    planets: planetValues,
    houses,
    aspects: Array.isArray(natal.aspects) ? natal.aspects.map((aspect) => ({ ...aspect })) : [],
    dominantElements: { ...(natal.elements || {}) },
    dominantModalities: { ...(natal.modalities || {}) },
    angularPlanets: planetValues.filter((planet) => planet.wholeSignHouse !== null && [1, 4, 7, 10].includes(planet.wholeSignHouse)),
    houseEmphasis: ascendantSign ? emphasisFor(houses, planetValues, chartRuler) : [],
    rulershipConvention: "Traditional primary; modern co-ruler identified separately",
    sourceVersion: "whole-sign-r7a-1",
    sourceClassification: "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION",
    canonicalNatalSource: natal.source || "stored-canonical-tropical",
  };
}
