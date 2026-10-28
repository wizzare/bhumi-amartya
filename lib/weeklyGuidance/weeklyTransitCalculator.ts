import { DateTime } from "luxon";
import * as Astronomy from "astronomy-engine";
import {
  getGeocentricLongitude,
  getInstantaneousVelocity,
  calculatePlanetaryMotions,
  calculateDailyEvents,
  angularDistance,
  getZodiacSign,
  type DailyAstroEvent,
  type PlanetMotionDetail,
} from "@/lib/astrology/transitEvents";
import type { SkyBody } from "@/lib/astrology/calculateCurrentSky";
import {
  buildAstroHouseActivations,
  type AstroHouseActivation,
} from "@/lib/astrology/astroHouseActivations";
import type { AspectType, WeeklyAstrologicalEvidence } from "./types";

export const ASPECT_DEFINITIONS: Array<{ type: AspectType; label: string; angle: number; maxOrb: number }> = [
  { type: "Conjunction", label: "Konjungsi (0°)", angle: 0, maxOrb: 5.5 },
  { type: "Sextile", label: "Sekstil (60°)", angle: 60, maxOrb: 4.5 },
  { type: "Square", label: "Kuadrat (90°)", angle: 90, maxOrb: 5.5 },
  { type: "Trine", label: "Trigon (120°)", angle: 120, maxOrb: 5.5 },
  { type: "Opposition", label: "Oposisi (180°)", angle: 180, maxOrb: 5.5 },
];

export const TRANSIT_BODIES: SkyBody[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
];

export const PLANET_LABELS_ID: Record<string, string> = {
  Sun: "Matahari",
  Moon: "Bulan",
  Mercury: "Merkurius",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturnus",
  Uranus: "Uranus",
  Neptune: "Neptunus",
  Pluto: "Pluto",
  Chiron: "Chiron",
  Ascendant: "Ascendant / Rising",
  Midheaven: "Midheaven (MC)",
  NorthNode: "Simpul Utara (North Node)",
};

export type WeeklyTimeWindow = {
  timezone: string;
  start: DateTime;
  end: DateTime;
  midpoint: DateTime;
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  dateRangeFormatted: string;
};

export function resolveSafeTimezone(tz?: string | null): string {
  if (!tz || typeof tz !== "string" || tz.trim() === "") return "Asia/Jakarta";
  const clean = tz.trim();
  const test = DateTime.now().setZone(clean);
  if (test.isValid) return clean;
  return "Asia/Jakarta";
}

export function computeWeeklyTimeWindow(
  referenceDate: Date = new Date(),
  timezone: string = "Asia/Jakarta",
  mode: "current" | "upcoming" = "current"
): WeeklyTimeWindow {
  const safeZone = resolveSafeTimezone(timezone);
  let dt = DateTime.fromJSDate(referenceDate, { zone: safeZone });
  if (!dt.isValid) dt = DateTime.now().setZone(safeZone);
  if (mode === "upcoming") {
    dt = dt.plus({ weeks: 1 });
  }

  const start = dt.startOf("week"); // Monday 00:00:00
  const end = dt.endOf("week");     // Sunday 23:59:59.999
  const midpoint = start.plus({ days: 3, hours: 12 }); // Thursday 12:00

  const weekNumber = start.weekNumber;
  const weekYear = start.weekYear;
  const weekKey = `${weekYear}-W${String(weekNumber).padStart(2, "0")}`;
  const weekStart = start.toISODate() || "";
  const weekEnd = end.toISODate() || "";

  const startFmt = start.setLocale("id-ID").toFormat("d LLLL yyyy");
  const endFmt = end.setLocale("id-ID").toFormat("d LLLL yyyy");
  const dateRangeFormatted = `${startFmt} – ${endFmt}`;

  return {
    timezone: safeZone,
    start,
    end,
    midpoint,
    weekKey,
    weekStart,
    weekEnd,
    dateRangeFormatted,
  };
}

export type WeeklyCollectiveSky = {
  window: WeeklyTimeWindow;
  lunarPhaseName: string;
  lunarIlluminationPct: number;
  lunarPhaseSummary: string;
  motions: PlanetMotionDetail[];
  planetaryMotionSummary: string;
  retrogradePlanets: string[];
  directPlanets: string[];
  stationaryPlanets: string[];
  weeklyStations: DailyAstroEvent[];
  weeklyIngresses: DailyAstroEvent[];
  weeklyLunarPeaks: DailyAstroEvent[];
  keyEventsSummary: string[];
  collectiveTheme: string;
};

export function calculateWeeklyCollectiveSky(
  window: WeeklyTimeWindow
): WeeklyCollectiveSky {
  const midDate = window.midpoint.toJSDate();
  const motionSummary = calculatePlanetaryMotions(midDate);

  // Compute Moon Phase at midpoint
  const Ast: any = Astronomy;
  const moonPhase = Ast.MoonPhase(midDate);
  const moonIllum = Math.round(((1 - Math.cos((moonPhase * Math.PI) / 180)) / 2) * 100);

  let phaseLabel = "Bulan Sabit";
  if (moonPhase >= 350 || moonPhase < 10) phaseLabel = "Bulan Baru (New Moon)";
  else if (moonPhase >= 10 && moonPhase < 80) phaseLabel = "Bulan Sabit Membesar";
  else if (moonPhase >= 80 && moonPhase < 100) phaseLabel = "Kuartal Pertama";
  else if (moonPhase >= 100 && moonPhase < 170) phaseLabel = "Bulan Cembung Membesar";
  else if (moonPhase >= 170 && moonPhase < 190) phaseLabel = "Bulan Purnama (Full Moon)";
  else if (moonPhase >= 190 && moonPhase < 260) phaseLabel = "Bulan Cembung Mengecil";
  else if (moonPhase >= 260 && moonPhase < 280) phaseLabel = "Kuartal Terakhir";
  else phaseLabel = "Bulan Sabit Menua";

  const midMoonLon = getGeocentricLongitude("Moon", midDate);
  const midMoonSign = getZodiacSign(midMoonLon);
  const lunarPhaseSummary = `${phaseLabel} di ${midMoonSign} (${moonIllum}% iluminasi)`;

  // Check discrete events across the 7 days of the week
  const weeklyStations: DailyAstroEvent[] = [];
  const weeklyIngresses: DailyAstroEvent[] = [];
  const weeklyLunarPeaks: DailyAstroEvent[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = window.start.plus({ days: i, hours: 12 }).toJSDate();
    const dayEvents = calculateDailyEvents(dayDate, window.timezone);
    for (const ev of dayEvents) {
      if (ev.type === "station") {
        if (!weeklyStations.some((x) => x.id === ev.id)) weeklyStations.push(ev);
      } else if (ev.type === "ingress") {
        if (!weeklyIngresses.some((x) => x.id === ev.id)) weeklyIngresses.push(ev);
      } else if (ev.type === "moon_phase_peak") {
        if (!weeklyLunarPeaks.some((x) => x.id === ev.id)) weeklyLunarPeaks.push(ev);
      }
    }
  }

  const retrogradePlanets = motionSummary.motions
    .filter((m) => m.motionStatus === "retrograde")
    .map((m) => PLANET_LABELS_ID[m.body] || m.body);

  const directPlanets = motionSummary.motions
    .filter((m) => m.motionStatus === "direct")
    .map((m) => PLANET_LABELS_ID[m.body] || m.body);

  const stationaryPlanets = motionSummary.motions
    .filter((m) => m.motionStatus === "stationary")
    .map((m) => PLANET_LABELS_ID[m.body] || m.body);

  const keyEventsSummary: string[] = [];
  if (weeklyStations.length > 0) {
    for (const s of weeklyStations) keyEventsSummary.push(`${s.title}: ${s.detail} (${s.timeLocalFormatted})`);
  }
  if (weeklyLunarPeaks.length > 0) {
    for (const lp of weeklyLunarPeaks) keyEventsSummary.push(`${lp.title} (${lp.timeLocalFormatted})`);
  }
  const planetIngresses = weeklyIngresses.filter((x) => x.body !== "Moon");
  for (const ing of planetIngresses) {
    keyEventsSummary.push(`${ing.title} (${ing.timeLocalFormatted})`);
  }
  if (keyEventsSummary.length === 0) {
    keyEventsSummary.push(`Fase ${lunarPhaseSummary}`);
    keyEventsSummary.push(motionSummary.summaryLabel);
  }

  // Collective theme synthesis
  let collectiveTheme = "Pekan ini membawa arus energi kontemplatif yang mengajak kita menata ulang fondasi hidup.";
  if (retrogradePlanets.length >= 3) {
    collectiveTheme = `Dengan ${retrogradePlanets.length} planet bergerak retrograde (${retrogradePlanets.join(", ")}), pekan ini membawa ajakan alami untuk melambatkan langkah, meninjau kembali keputusan yang lalu, dan merapikan ruang batin tanpa memaksakan akselerasi yang tergesa-gesa.`;
  } else if (weeklyLunarPeaks.some((x) => x.title.toLowerCase().includes("purnama") || x.title.toLowerCase().includes("full"))) {
    collectiveTheme = `Energi Bulan Purnama pekan ini mempercepat kulminasi batin dan memperjelas apa yang selama ini tersembunyi, memberi momentum untuk melepaskan beban emosional lama.`;
  } else if (weeklyLunarPeaks.some((x) => x.title.toLowerCase().includes("baru") || x.title.toLowerCase().includes("new"))) {
    collectiveTheme = `Bulan Baru pekan ini membuka pintu gerbang benih niat baru; ruang hening yang tepat untuk menanam visi jangka panjang dengan kerendahan hati.`;
  }

  return {
    window,
    lunarPhaseName: phaseLabel,
    lunarIlluminationPct: moonIllum,
    lunarPhaseSummary,
    motions: motionSummary.motions,
    planetaryMotionSummary: motionSummary.summaryLabel,
    retrogradePlanets,
    directPlanets,
    stationaryPlanets,
    weeklyStations,
    weeklyIngresses,
    weeklyLunarPeaks,
    keyEventsSummary,
    collectiveTheme,
  };
}

export type NatalPlacement = {
  name: string;
  label: string;
  longitude: number;
  sign: string;
  degree: number;
  house: number;
  isRetrograde?: boolean;
};

export function extractNatalPlacements(
  blueprint: Record<string, unknown>
): { placements: NatalPlacement[]; placidusHouses: Array<{ house: number; sign: string; degree: number | null }> } {
  const astro = (blueprint.astrology as Record<string, unknown> | undefined) || {};
  const natalPlanets = (astro.planets as Record<string, any> | undefined) || {};
  const directHouses = (astro.placidusHouses || astro.houses) as any;

  // Build house activations helper to obtain clean house cusps
  const activationHelper = buildAstroHouseActivations({
    currentSky: null,
    natalChart: astro,
    natalHouses: directHouses,
  });

  const houses = activationHelper.houseData.houses;
  const placements: NatalPlacement[] = [];

  // Helper to extract a placement
  const addPlacement = (key: string, name: string, fallbackSign?: string | null, fallbackDegree?: number | null, fallbackLon?: number | null) => {
    const raw = natalPlanets[key];
    let lon: number | null = null;
    let sign: string = "";
    let deg: number = 0;
    let houseNum = 1;
    let isRetro = false;

    if (raw && typeof raw.longitude === "number") {
      const validLon = raw.longitude;
      lon = validLon;
      sign = raw.sign || getZodiacSign(validLon);
      deg = Number(raw.degree ?? (validLon % 30));
      houseNum = Number(raw.placidusHouse ?? raw.house ?? 1);
      isRetro = Boolean(raw.retrograde);
    } else if (typeof fallbackLon === "number") {
      const validLon = fallbackLon;
      lon = validLon;
      sign = fallbackSign || getZodiacSign(validLon);
      deg = Number(fallbackDegree ?? (validLon % 30));
    } else if (fallbackSign) {
      sign = fallbackSign;
      const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
      const sIdx = signs.indexOf(sign);
      deg = typeof fallbackDegree === "number" ? fallbackDegree : 15;
      lon = (sIdx >= 0 ? sIdx * 30 : 0) + deg;
    }

    if (lon !== null) {
      // Re-verify house from cusps if available
      const houseFromCusps = houses.length >= 12 ? getHouseFromCusps(lon, houses) : null;
      placements.push({
        name,
        label: PLANET_LABELS_ID[name] || name,
        longitude: lon,
        sign,
        degree: Math.round(deg * 100) / 100,
        house: houseFromCusps ?? houseNum,
        isRetrograde: isRetro,
      });
    }
  };

  addPlacement("Sun", "Sun", astro.sunSign as string, null, null);
  addPlacement("Moon", "Moon", astro.moonSign as string, null, null);
  addPlacement("Ascendant", "Ascendant", (astro.ascendant || astro.risingSign) as string, null, astro.ascendantLongitude as number);
  addPlacement("Midheaven", "Midheaven", astro.midheaven as string, null, astro.midheavenLongitude as number);
  addPlacement("Mercury", "Mercury");
  addPlacement("Venus", "Venus");
  addPlacement("Mars", "Mars");
  addPlacement("Jupiter", "Jupiter");
  addPlacement("Saturn", "Saturn");
  addPlacement("Uranus", "Uranus");
  addPlacement("Neptune", "Neptune");
  addPlacement("Pluto", "Pluto");
  addPlacement("Chiron", "Chiron");

  return { placements, placidusHouses: houses };
}

export function getHouseFromCusps(
  longitude: number,
  houses: Array<{ house: number; sign: string; degree: number | null }>
): number | null {
  const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  const cusps = houses
    .filter((h) => typeof h.degree === "number")
    .map((h) => {
      const sIdx = signs.indexOf(h.sign);
      return {
        house: h.house,
        longitude: (sIdx >= 0 ? sIdx * 30 : 0) + (h.degree ?? 0),
      };
    })
    .sort((a, b) => a.longitude - b.longitude);

  if (cusps.length < 12) return null;
  const norm = ((longitude % 360) + 360) % 360;

  for (let i = 0; i < cusps.length; i++) {
    const cur = cusps[i];
    const next = cusps[(i + 1) % cusps.length];
    if (cur.longitude <= next.longitude) {
      if (norm >= cur.longitude && norm < next.longitude) return cur.house;
    } else if (norm >= cur.longitude || norm < next.longitude) {
      return cur.house;
    }
  }
  return null;
}

export type TransitToNatalAspect = {
  transitBody: SkyBody;
  transitSign: string;
  transitDegree: number;
  transitLongitude: number;
  transitSpeed: number;
  transitMotion: "retrograde" | "direct" | "stationary";
  transitHouse: number;
  isCuspCrossing: boolean;
  cuspCrossingDetail?: string;
  natalPlacement: NatalPlacement;
  aspect: AspectType;
  aspectLabel: string;
  angle: number;
  orb: number;
  nature: "applying" | "exact" | "separating";
  exactTimeFormatted?: string;
  exactDate?: Date;
  activeHouses: number[];
  priorityScore: number;
  summary: string;
};

export function calculateTransitToNatalAspects(
  window: WeeklyTimeWindow,
  natalPlacements: NatalPlacement[],
  placidusHouses: Array<{ house: number; sign: string; degree: number | null }>
): TransitToNatalAspect[] {
  const midDate = window.midpoint.toJSDate();
  const startDate = window.start.toJSDate();
  const endDate = window.end.toJSDate();
  const results: TransitToNatalAspect[] = [];

  for (const tBody of TRANSIT_BODIES) {
    const startLon = getGeocentricLongitude(tBody, startDate);
    const midLon = getGeocentricLongitude(tBody, midDate);
    const endLon = getGeocentricLongitude(tBody, endDate);

    const speed = getInstantaneousVelocity(tBody, midDate);
    let motion: "retrograde" | "direct" | "stationary" = "direct";
    if (Math.abs(speed) < 0.002) motion = "stationary";
    else if (speed < 0) motion = "retrograde";

    const tSign = getZodiacSign(midLon);
    const tDeg = Math.round((midLon % 30) * 100) / 100;

    // Placidus house traversed
    const startHouse = placidusHouses.length >= 12 ? getHouseFromCusps(startLon, placidusHouses) ?? 1 : 1;
    const midHouse = placidusHouses.length >= 12 ? getHouseFromCusps(midLon, placidusHouses) ?? 1 : 1;
    const endHouse = placidusHouses.length >= 12 ? getHouseFromCusps(endLon, placidusHouses) ?? 1 : 1;

    const isCuspCrossing = startHouse !== endHouse;
    let cuspCrossingDetail: string | undefined;
    if (isCuspCrossing) {
      if (tBody === "Moon") {
        cuspCrossingDetail = `Sepanjang minggu ini, lintasan cepat Bulan bergerak melintasi rumah ke-${startHouse} hingga ke-${endHouse} Placidus (posisi tengah pekan di rumah ke-${midHouse} Placidus)`;
      } else {
        cuspCrossingDetail = `Melintasi batas rumah Placidus dari rumah ke-${startHouse} menuju rumah ke-${endHouse}`;
      }
    }

    // Check aspects to each natal placement
    for (const nat of natalPlacements) {
      const dist = angularDistance(midLon, nat.longitude);

      for (const def of ASPECT_DEFINITIONS) {
        const orb = Math.abs(dist - def.angle);
        if (orb <= def.maxOrb) {
          // Applying / Separating calculation
          const prevDist = angularDistance(startLon, nat.longitude);
          const nextDist = angularDistance(endLon, nat.longitude);
          const prevOrb = Math.abs(prevDist - def.angle);
          const nextOrb = Math.abs(nextDist - def.angle);

          // Exact aspect timing root-finding: check 14 half-day intervals for true zero-crossing
          let exactTimeFormatted: string | undefined;
          let exactDate: Date | undefined;

          const numIntervals = 14;
          const totalWindowMs = window.end.toMillis() - window.start.toMillis();
          const intervalMs = totalWindowMs / numIntervals;

          for (let step = 0; step < numIntervals; step++) {
            const tA = window.start.toMillis() + step * intervalMs;
            const tB = tA + intervalMs;
            const lonA = getGeocentricLongitude(tBody, new Date(tA));
            const lonB = getGeocentricLongitude(tBody, new Date(tB));
            const diffA = angularDistance(lonA, nat.longitude) - def.angle;
            const diffB = angularDistance(lonB, nat.longitude) - def.angle;

            if (diffA * diffB <= 0) {
              let low = tA;
              let high = tB;
              for (let iter = 0; iter < 16; iter++) {
                const testMid = (low + high) / 2;
                const testLon = getGeocentricLongitude(tBody, new Date(testMid));
                const testDiff = angularDistance(testLon, nat.longitude) - def.angle;
                if (Math.abs(testDiff) < 0.005) {
                  exactDate = new Date(testMid);
                  break;
                }
                if (diffA * testDiff <= 0) {
                  high = testMid;
                } else {
                  low = testMid;
                }
              }
              if (exactDate) break;
            }
          }

          if (exactDate) {
            const dtExact = DateTime.fromJSDate(exactDate, { zone: window.timezone }).setLocale("id-ID");
            exactTimeFormatted = `sekitar ${dtExact.toFormat("d LLLL, HH:mm")} ${window.timezone.includes("Jakarta") ? "WIB" : ""}`.trim();
          }

          let nature: "applying" | "exact" | "separating" = "applying";
          if (exactDate) {
            const diffFromMidMinutes = Math.abs(exactDate.getTime() - midDate.getTime()) / 60000;
            if (diffFromMidMinutes < 120 || orb < 0.2) {
              nature = "exact";
            } else if (exactDate.getTime() > midDate.getTime()) {
              nature = "applying";
            } else {
              nature = "separating";
            }
          } else {
            if (orb < 0.25) {
              nature = "exact";
            } else if (nextOrb < prevOrb) {
              nature = "applying";
            } else {
              nature = "separating";
            }
          }

          const activeHouses = Array.from(new Set([midHouse, nat.house]));

          // Priority scoring: Sun/Moon/Ascendant get higher priority, lower orb gets higher priority
          let pScore = (10 - orb) * 2;
          if (nat.name === "Sun" || nat.name === "Moon" || nat.name === "Ascendant") pScore += 15;
          if (tBody === "Saturn" || tBody === "Uranus" || tBody === "Pluto" || tBody === "Jupiter") pScore += 10;
          if (nature === "exact") pScore += 8;

          const tLabel = PLANET_LABELS_ID[tBody] || tBody;
          const motionText = motion === "retrograde" ? " (Rx)" : "";
          const phaseText = nature === "exact" ? "Eksak" : nature === "applying" ? "Mendekat" : "Menjauh";
          const summary = `${tLabel}${motionText} di ${tDeg}° ${tSign} (Rumah ${midHouse} Placidus) membentuk ${def.label} terhadap ${nat.label} natal di ${nat.degree}° ${nat.sign} (Rumah ${nat.house} Placidus) · Orb ${orb.toFixed(1)}° (${phaseText})${exactTimeFormatted ? ` · Puncak: ${exactTimeFormatted}` : ""}`;

          results.push({
            transitBody: tBody,
            transitSign: tSign,
            transitDegree: tDeg,
            transitLongitude: midLon,
            transitSpeed: speed,
            transitMotion: motion,
            transitHouse: midHouse,
            isCuspCrossing,
            cuspCrossingDetail,
            natalPlacement: nat,
            aspect: def.type,
            aspectLabel: def.label,
            angle: def.angle,
            orb: Math.round(orb * 100) / 100,
            nature,
            exactTimeFormatted,
            exactDate,
            activeHouses,
            priorityScore: Math.round(pScore * 10) / 10,
            summary,
          });
          break;
        }
      }
    }
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore);
}
