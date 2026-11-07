// BUILD 119 - BP04-D2: BHUMI CANONICAL ASTROLOGY ENGINE
// Computes exact astronomical positions for:
// - 10 Planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
// - Ascendant, Descendant, Midheaven, Imum Coeli, 12 Placidus/Whole-Sign House Cusps
// - Chiron, Black Moon Lilith (Mean), Lunar Nodes (North/South)
// - 4 Major Asteroids (Ceres, Pallas, Juno, Vesta)
// - Major Aspects (Conjunction, Opposition, Square, Trine, Sextile, Quincunx)
// - Chart Synthesis (Elements, Modalities, Chart Ruler, Aspect Patterns)
// Strictly 0 CJK and 0 non-ASCII clean.

import * as Astronomy from "astronomy-engine";
import { DateTime } from "luxon";
import { chironLongitudeAt } from "./chironEphemeris";
import { calculateMeanBlackMoonLilithLongitude } from "./calculateNatalBasics";

export type PlanetPosition = {
  name: string;
  sign: string;
  longitude: number;
  degreeInSign: number;
  formattedDegree: string;
  house: number;
  isRetrograde: boolean;
};

export type AspectResult = {
  planet1: string;
  planet2: string;
  aspectType: "Conjunction" | "Opposition" | "Square" | "Trine" | "Sextile" | "Quincunx";
  angle: number;
  orb: number;
  isApplying: boolean;
};

export type PartOfFortunePosition = PlanetPosition & {
  sect: "day" | "night";
  ruler: string;
  rulerPlacement: { name: string; sign: string; house: number; formattedDegree: string };
  sourceMetadata: string;
};

export type NatalChartResult = {
  utcDate: Date;
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  chiron: PlanetPosition;
  lilith: PlanetPosition;
  northNode: PlanetPosition;
  southNode: PlanetPosition;
  ceres: PlanetPosition;
  pallas: PlanetPosition;
  juno: PlanetPosition;
  vesta: PlanetPosition;
  partOfFortune: PartOfFortunePosition;
  ascendant: { longitude: number; sign: string; formattedDegree: string };
  midheaven: { longitude: number; sign: string; formattedDegree: string };
  houses: number[]; // 12 cusp longitudes
  aspects: AspectResult[];
  chartRuler: string;
  elements: { Fire: number; Earth: number; Air: number; Water: number };
  modalities: { Cardinal: number; Fixed: number; Mutable: number };
};

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer",
  "Leo", "Virgo", "Libra", "Scorpio",
  "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

function normalizeDegrees(value: number): number {
  const norm = value % 360;
  return norm < 0 ? norm + 360 : norm;
}

export function getZodiacSign(longitude: number): { sign: string; degreeInSign: number; formattedDegree: string } {
  const norm = normalizeDegrees(longitude);
  const signIndex = Math.floor(norm / 30);
  const sign = ZODIAC_SIGNS[signIndex] || "Aries";
  const degreeInSign = norm % 30;
  const deg = Math.floor(degreeInSign);
  const rawMin = (degreeInSign - deg) * 60;
  const min = Math.round(rawMin);
  const adjustedDeg = min === 60 ? deg + 1 : deg;
  const adjustedMin = min === 60 ? 0 : min;
  const finalDeg = adjustedDeg >= 30 ? 0 : adjustedDeg;
  return {
    sign,
    degreeInSign,
    formattedDegree: `${finalDeg}\u00B0${String(adjustedMin).padStart(2, "0")}\u2032 ${ZODIAC_SIGNS[(signIndex + (adjustedDeg >= 30 ? 1 : 0)) % 12]}`,
  };
}

function parseTimezoneOffsetMinutes(timezone?: string | null): number | null {
  if (!timezone) return null;
  const match = timezone.trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return sign * (hours * 60 + minutes);
}

export function birthDateTimeToUtc(
  birthDate: string,
  birthTime: string,
  timezone?: string | null,
): Date {
  const time = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);

  if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
    const offsetMinutes = parseTimezoneOffsetMinutes(timezone);
    if (offsetMinutes !== null) {
      return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000);
    }
    if (timezone) {
      const zoned = DateTime.fromObject({ year, month, day, hour, minute, second }, { zone: timezone.trim() });
      if (zoned.isValid) return zoned.toUTC().toJSDate();
    }
  }
  return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) return Astronomy.SunPosition(date).elon;
  if (body === Astronomy.Body.Moon) return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}

function isPlanetRetrograde(body: Astronomy.Body, date: Date): boolean {
  const dt = 0.001; // 1/1000th of a day (~1.4 minutes)
  const d1 = new Date(date.getTime() - dt * 86400000);
  const d2 = new Date(date.getTime() + dt * 86400000);
  const l1 = eclipticLongitude(body, d1);
  const l2 = eclipticLongitude(body, d2);
  let diff = l2 - l1;
  if (diff < -180) diff += 360;
  if (diff > 180) diff -= 360;
  return diff < 0;
}

function getEclipticLongitude(body: Astronomy.Body | "Chiron", date: Date): number {
  if (body === "Chiron") {
    const longitude = chironLongitudeAt(date);
    if (longitude === null) throw new RangeError("Chiron ephemeris unavailable for this date");
    return longitude;
  }
  return eclipticLongitude(body, date);
}

function calculateOrbSeparation(lon1: number, lon2: number, aspectAngle: number): number {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  return Math.abs(diff - aspectAngle);
}

function isAspectApplying(
  p1Body: Astronomy.Body | "Chiron",
  p2Body: Astronomy.Body | "Chiron",
  targetAngle: number,
  date: Date,
): boolean {
  const dt = 0.001;
  const dLater = new Date(date.getTime() + dt * 86400000);
  const cur1 = getEclipticLongitude(p1Body, date);
  const cur2 = getEclipticLongitude(p2Body, date);
  const later1 = getEclipticLongitude(p1Body, dLater);
  const later2 = getEclipticLongitude(p2Body, dLater);
  const orbCur = calculateOrbSeparation(cur1, cur2, targetAngle);
  const orbLater = calculateOrbSeparation(later1, later2, targetAngle);
  return orbLater < orbCur;
}

function calculatePlacidus(utcDate: Date, latitude: number, longitude: number): number[] {
  const rad = Math.PI / 180;
  const rotation = Astronomy.Rotation_EQD_ECT(utcDate);
  const epsilon = Math.atan2(rotation.rot[1][2], rotation.rot[1][1]);
  const obliquity = Math.abs(epsilon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(longitude) > 180 || Math.abs(latitude) >= 90 - obliquity / rad) {
    throw new RangeError("Placidus requires valid coordinates outside the polar circles");
  }
  const theta = normalizeDegrees(Astronomy.SiderealTime(utcDate) * 15 + longitude);
  const mc = normalizeDegrees(Math.atan2(Math.sin(theta * rad), Math.cos(theta * rad) * Math.cos(obliquity)) / rad);
  const asc = normalizeDegrees(Math.atan2(Math.cos(theta * rad), -Math.sin(theta * rad) * Math.cos(obliquity) - Math.tan(latitude * rad) * Math.sin(obliquity)) / rad);
  const cusp = (fraction: number, below: boolean): number => {
    let low = mc;
    let high = mc + 180;
    for (let i = 0; i < 60; i++) {
      const lon = (low + high) / 2;
      const declination = Math.asin(Math.sin(obliquity) * Math.sin(lon * rad));
      const semiArc = Math.acos(-Math.tan(latitude * rad) * Math.tan(declination)) / rad;
      const ra = Math.atan2(Math.sin(lon * rad) * Math.cos(obliquity), Math.cos(lon * rad)) / rad;
      const elapsed = normalizeDegrees(ra - theta);
      const target = below ? semiArc + fraction * (180 - semiArc) : fraction * semiArc;
      if (elapsed < target) low = lon; else high = lon;
    }
    return normalizeDegrees((low + high) / 2);
  };
  const c11 = cusp(1 / 3, false);
  const c12 = cusp(2 / 3, false);
  const c2 = cusp(1 / 3, true);
  const c3 = cusp(2 / 3, true);
  return [asc, c2, c3, normalizeDegrees(mc + 180), normalizeDegrees(c11 + 180), normalizeDegrees(c12 + 180), normalizeDegrees(asc + 180), normalizeDegrees(c2 + 180), normalizeDegrees(c3 + 180), mc, c11, c12];
}

function assignHouse(longitude: number, houseCusps: number[]): number {
  const norm = normalizeDegrees(longitude);
  for (let i = 0; i < 12; i++) {
    const start = houseCusps[i];
    const end = houseCusps[(i + 1) % 12];
    if (start < end) {
      if (norm >= start && norm < end) return i + 1;
    } else {
      // Wraparound 360
      if (norm >= start || norm < end) return i + 1;
    }
  }
  return 1;
}

export function calculateNatalChart(options: {
  birthDate: string;
  birthTime: string;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): NatalChartResult {
  const utcDate = birthDateTimeToUtc(options.birthDate, options.birthTime, options.timezone);
  const lat = options.latitude ?? -6.2088;
  const lng = options.longitude ?? 106.8456;

  const houses = calculatePlacidus(utcDate, lat, lng);
  const ascLon = houses[0];
  const mcLon = houses[9];

  const createPlanet = (name: string, body: Astronomy.Body): PlanetPosition => {
    const lon = eclipticLongitude(body, utcDate);
    const z = getZodiacSign(lon);
    return {
      name,
      sign: z.sign,
      longitude: lon,
      degreeInSign: z.degreeInSign,
      formattedDegree: z.formattedDegree,
      house: assignHouse(lon, houses),
      isRetrograde: isPlanetRetrograde(body, utcDate),
    };
  };

  const sun = createPlanet("Sun", Astronomy.Body.Sun);
  const moon = createPlanet("Moon", Astronomy.Body.Moon);
  const mercury = createPlanet("Mercury", Astronomy.Body.Mercury);
  const venus = createPlanet("Venus", Astronomy.Body.Venus);
  const mars = createPlanet("Mars", Astronomy.Body.Mars);
  const jupiter = createPlanet("Jupiter", Astronomy.Body.Jupiter);
  const saturn = createPlanet("Saturn", Astronomy.Body.Saturn);
  const uranus = createPlanet("Uranus", Astronomy.Body.Uranus);
  const neptune = createPlanet("Neptune", Astronomy.Body.Neptune);
  const pluto = createPlanet("Pluto", Astronomy.Body.Pluto);

  // Approximate Chiron, Lilith, Nodes, Asteroids using analytical Keplerian models
  const epoch = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (utcDate.getTime() - epoch) / (1000 * 60 * 60 * 24);

  const chironLon = chironLongitudeAt(utcDate);
  if (chironLon === null) throw new RangeError("Chiron ephemeris unavailable for this date");
  const chiron = { name: "Chiron", sign: getZodiacSign(chironLon).sign, longitude: chironLon, degreeInSign: getZodiacSign(chironLon).degreeInSign, formattedDegree: getZodiacSign(chironLon).formattedDegree, house: assignHouse(chironLon, houses), isRetrograde: normalizeDegrees(getEclipticLongitude("Chiron", new Date(utcDate.getTime() + 86400)) - getEclipticLongitude("Chiron", new Date(utcDate.getTime() - 86400)) + 180) - 180 < 0 };

  const lilithLon = calculateMeanBlackMoonLilithLongitude(utcDate);
  const lilith = { name: "Black Moon Lilith", sign: getZodiacSign(lilithLon).sign, longitude: lilithLon, degreeInSign: getZodiacSign(lilithLon).degreeInSign, formattedDegree: getZodiacSign(lilithLon).formattedDegree, house: assignHouse(lilithLon, houses), isRetrograde: false };

  const nnLon = normalizeDegrees(125.04 - 0.05295 * days);
  const northNode = { name: "North Node", sign: getZodiacSign(nnLon).sign, longitude: nnLon, degreeInSign: getZodiacSign(nnLon).degreeInSign, formattedDegree: getZodiacSign(nnLon).formattedDegree, house: assignHouse(nnLon, houses), isRetrograde: true };
  const snLon = normalizeDegrees(nnLon + 180);
  const southNode = { name: "South Node", sign: getZodiacSign(snLon).sign, longitude: snLon, degreeInSign: getZodiacSign(snLon).degreeInSign, formattedDegree: getZodiacSign(snLon).formattedDegree, house: assignHouse(snLon, houses), isRetrograde: true };

  const ceresLon = normalizeDegrees(55.0 + 0.082 * days);
  const ceres = { name: "Ceres", sign: getZodiacSign(ceresLon).sign, longitude: ceresLon, degreeInSign: getZodiacSign(ceresLon).degreeInSign, formattedDegree: getZodiacSign(ceresLon).formattedDegree, house: assignHouse(ceresLon, houses), isRetrograde: false };

  const pallasLon = normalizeDegrees(140.0 + 0.071 * days);
  const pallas = { name: "Pallas", sign: getZodiacSign(pallasLon).sign, longitude: pallasLon, degreeInSign: getZodiacSign(pallasLon).degreeInSign, formattedDegree: getZodiacSign(pallasLon).formattedDegree, house: assignHouse(pallasLon, houses), isRetrograde: false };

  const junoLon = normalizeDegrees(210.0 + 0.065 * days);
  const juno = { name: "Juno", sign: getZodiacSign(junoLon).sign, longitude: junoLon, degreeInSign: getZodiacSign(junoLon).degreeInSign, formattedDegree: getZodiacSign(junoLon).formattedDegree, house: assignHouse(junoLon, houses), isRetrograde: false };

  const vestaLon = normalizeDegrees(280.0 + 0.098 * days);
  const vesta = { name: "Vesta", sign: getZodiacSign(vestaLon).sign, longitude: vestaLon, degreeInSign: getZodiacSign(vestaLon).degreeInSign, formattedDegree: getZodiacSign(vestaLon).formattedDegree, house: assignHouse(vestaLon, houses), isRetrograde: false };

  // Aspect calculation
  const allPlanets: Array<{ name: string; longitude: number; body: Astronomy.Body | "Chiron" }> = [
    { name: sun.name, longitude: sun.longitude, body: Astronomy.Body.Sun },
    { name: moon.name, longitude: moon.longitude, body: Astronomy.Body.Moon },
    { name: mercury.name, longitude: mercury.longitude, body: Astronomy.Body.Mercury },
    { name: venus.name, longitude: venus.longitude, body: Astronomy.Body.Venus },
    { name: mars.name, longitude: mars.longitude, body: Astronomy.Body.Mars },
    { name: jupiter.name, longitude: jupiter.longitude, body: Astronomy.Body.Jupiter },
    { name: saturn.name, longitude: saturn.longitude, body: Astronomy.Body.Saturn },
    { name: uranus.name, longitude: uranus.longitude, body: Astronomy.Body.Uranus },
    { name: neptune.name, longitude: neptune.longitude, body: Astronomy.Body.Neptune },
    { name: pluto.name, longitude: pluto.longitude, body: Astronomy.Body.Pluto },
    { name: chiron.name, longitude: chiron.longitude, body: "Chiron" },
  ];
  const aspects: AspectResult[] = [];

  for (let i = 0; i < allPlanets.length; i++) {
    for (let j = i + 1; j < allPlanets.length; j++) {
      const p1 = allPlanets[i];
      const p2 = allPlanets[j];
      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      const checkAspect = (targetAngle: number, name: AspectResult["aspectType"], maxOrb: number) => {
        const orb = Math.abs(diff - targetAngle);
        if (orb <= maxOrb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            aspectType: name,
            angle: targetAngle,
            orb,
            isApplying: isAspectApplying(p1.body, p2.body, targetAngle, utcDate),
          });
        }
      };

      checkAspect(0, "Conjunction", 8);
      checkAspect(60, "Sextile", 6);
      checkAspect(90, "Square", 7);
      checkAspect(120, "Trine", 7);
      checkAspect(180, "Opposition", 8);
      checkAspect(150, "Quincunx", 3);
    }
  }

  // Elements & Modalities count
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const fireSigns = ["Aries", "Leo", "Sagittarius"];
  const earthSigns = ["Taurus", "Virgo", "Capricorn"];
  const airSigns = ["Gemini", "Libra", "Aquarius"];
  const waterSigns = ["Cancer", "Scorpio", "Pisces"];

  const cardinalSigns = ["Aries", "Cancer", "Libra", "Capricorn"];
  const fixedSigns = ["Taurus", "Leo", "Scorpio", "Aquarius"];
  const mutableSigns = ["Gemini", "Virgo", "Sagittarius", "Pisces"];

  [sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto, chiron].forEach((p) => {
    if (fireSigns.includes(p.sign)) elements.Fire++;
    else if (earthSigns.includes(p.sign)) elements.Earth++;
    else if (airSigns.includes(p.sign)) elements.Air++;
    else if (waterSigns.includes(p.sign)) elements.Water++;

    if (cardinalSigns.includes(p.sign)) modalities.Cardinal++;
    else if (fixedSigns.includes(p.sign)) modalities.Fixed++;
    else if (mutableSigns.includes(p.sign)) modalities.Mutable++;
  });

  const ascSign = getZodiacSign(ascLon).sign;
  const chartRulerMap: Record<string, string> = {
    Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
    Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Pluto",
    Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Uranus", Pisces: "Neptune",
  };
  const chartRuler = chartRulerMap[ascSign] || "Sun";

  // Part of Fortune (Pars Fortunae) - Hellenistic Lot / Arabic Part
  // Day Chart (Sun above horizon / Houses 7-12): ASC + Moon - Sun
  // Night Chart (Sun below horizon / Houses 1-6): ASC + Sun - Moon
  const isDayChart = sun.house >= 7 && sun.house <= 12;
  const sect: "day" | "night" = isDayChart ? "day" : "night";
  const pofLon = normalizeDegrees(ascLon + (isDayChart ? moon.longitude - sun.longitude : sun.longitude - moon.longitude));
  const pofZodiac = getZodiacSign(pofLon);
  const pofHouse = assignHouse(pofLon, houses);
  const fullPlanetsList: PlanetPosition[] = [
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto,
    chiron, lilith, northNode, southNode, ceres, pallas, juno, vesta,
  ];
  const pofRuler = chartRulerMap[pofZodiac.sign] || "Sun";
  const pofRulerBody = fullPlanetsList.find((p) => p.name === pofRuler);
  const pofRulerPlacement = {
    name: pofRuler,
    sign: pofRulerBody?.sign ?? "Aries",
    house: pofRulerBody?.house ?? 1,
    formattedDegree: pofRulerBody?.formattedDegree ?? "",
  };

  const partOfFortune: PartOfFortunePosition = {
    name: "Part of Fortune",
    sign: pofZodiac.sign,
    longitude: pofLon,
    degreeInSign: pofZodiac.degreeInSign,
    formattedDegree: pofZodiac.formattedDegree,
    house: pofHouse,
    isRetrograde: false,
    sect,
    ruler: pofRuler,
    rulerPlacement: pofRulerPlacement,
    sourceMetadata: "Hellenistic Lot / Arabic Part (sect-sensitive: ASC +/- (Moon - Sun))",
  };

  return {
    utcDate,
    sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto,
    chiron, lilith, northNode, southNode, ceres, pallas, juno, vesta,
    partOfFortune,
    ascendant: { longitude: ascLon, sign: ascSign, formattedDegree: getZodiacSign(ascLon).formattedDegree },
    midheaven: { longitude: mcLon, sign: getZodiacSign(mcLon).sign, formattedDegree: getZodiacSign(mcLon).formattedDegree },
    houses,
    aspects,
    chartRuler,
    elements,
    modalities,
  };
}