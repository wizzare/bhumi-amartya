import * as Astronomy from "astronomy-engine";
import type { SkyBody } from "./calculateCurrentSky";
import type { WesternAspectName } from "./relevantWesternEvents";

export const ASPECT_POOL: SkyBody[] = [
  "Sun",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

export const EIGHT_PLANETS: SkyBody[] = [
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

export const ASPECT_ORB_LIMIT = 6.0;
export const STATIONARY_SPEED_THRESHOLD = 0.002; // deg/day (speeds below this are considered stationary; Pluto at ~0.0045 deg/day is Direct)

export const ASPECT_CONFIG: Array<{ name: WesternAspectName; label: string; angle: number }> = [
  { name: "conjunction", label: "Konjungsi", angle: 0 },
  { name: "sextile", label: "Sekstil", angle: 60 },
  { name: "square", label: "Kuadrat", angle: 90 },
  { name: "trine", label: "Trigon", angle: 120 },
  { name: "opposition", label: "Oposisi", angle: 180 },
];

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export type ActiveAspectItem = {
  a: SkyBody;
  b: SkyBody;
  aspect: WesternAspectName;
  aspectLabel: string;
  angle: number;
  exactDistance: number;
  orb: number;
  nature: "applying" | "separating" | "exact";
  natureLabel: string;
};

export type PlanetMotionDetail = {
  body: SkyBody;
  sign: string;
  longitude: number;
  speedDegPerDay: number;
  motionStatus: "retrograde" | "direct" | "stationary";
  isRetrograde: boolean;
  label: string;
};

export type PlanetaryMotionSummary = {
  retrogradeCount: number;
  directCount: number;
  stationaryCount: number;
  totalChecked: number;
  motions: PlanetMotionDetail[];
  summaryLabel: string;
};

export type DailyEventType = "ingress" | "station" | "exact_aspect" | "moon_phase_peak";

export type EphemerisConvention = "apparent" | "astrometric";

export type DailyAstroEvent = {
  id: string;
  type: DailyEventType;
  title: string;
  detail: string;
  timeUtc: Date;
  timeLocalFormatted: string;
  body?: SkyBody;
  fromSign?: string;
  toSign?: string;
  phaseName?: string;
};

export function getZodiacSign(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(norm / 30)];
}

export function getZodiacSignIndex(longitude: number): number {
  const norm = ((longitude % 360) + 360) % 360;
  return Math.floor(norm / 30);
}

export function getGeocentricLongitude(
  bodyName: SkyBody,
  d: Date,
  convention: EphemerisConvention = "apparent"
): number {
  const Ast: any = Astronomy;
  if (bodyName === "Sun") return Ast.SunPosition(d).elon;
  if (bodyName === "Moon") return Ast.EclipticGeoMoon(d).lon;
  const body = Ast.Body[bodyName];
  if (!body) return 0;
  // Apparent Geocentric Position (aberration = true) is canonical standard in Swiss Ephemeris (SEFLG_SWIEPH)
  // and matches Bhumi's canonical natal engine (calculateNatalBasics.ts).
  // Astrometric position (aberration = false) omits stellar aberration.
  const useAberration = convention === "apparent";
  return Ast.Ecliptic(Ast.GeoVector(body, d, useAberration)).elon;
}

/**
 * Instantaneous numerical velocity calculated using symmetric 10-minute central difference.
 * Eliminates smoothing artifacts of wide multi-hour windows for exact station root-finding.
 */
export function getInstantaneousVelocity(
  bodyName: SkyBody,
  d: Date,
  convention: EphemerisConvention = "apparent"
): number {
  const dtMs = 10 * 60 * 1000;
  const d0 = new Date(d.getTime() - dtMs);
  const d1 = new Date(d.getTime() + dtMs);
  let l0 = getGeocentricLongitude(bodyName, d0, convention);
  let l1 = getGeocentricLongitude(bodyName, d1, convention);
  let diff = l1 - l0;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  // diff is degrees in 20 minutes (20 / 1440 days = 1 / 72 days)
  return diff * 72; // deg per day
}

export function getPlanetaryVelocity(
  bodyName: SkyBody,
  d: Date,
  convention: EphemerisConvention = "apparent"
): number {
  const d0 = new Date(d.getTime() - 6 * 3600 * 1000);
  const d1 = new Date(d.getTime() + 6 * 3600 * 1000);
  let l0 = getGeocentricLongitude(bodyName, d0, convention);
  let l1 = getGeocentricLongitude(bodyName, d1, convention);
  let diff = l1 - l0;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff * 2; // deg per day
}

export function angularDistance(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

/**
 * Category 1: Aspek Aktif (Active Aspects)
 * Deduplicated pairs (A-B only once), orb <= 6°, applying/separating determination.
 */
export function calculateActiveAspects(
  longitudes: Partial<Record<SkyBody, number>>,
  date?: Date,
  convention: EphemerisConvention = "apparent"
): ActiveAspectItem[] {
  const bodies = ASPECT_POOL.filter((b) => typeof longitudes[b] === "number");
  const out: ActiveAspectItem[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const b1 = bodies[i];
      const b2 = bodies[j];
      const l1 = longitudes[b1]!;
      const l2 = longitudes[b2]!;
      const dist = angularDistance(l1, l2);

      for (const asp of ASPECT_CONFIG) {
        const orb = Math.abs(dist - asp.angle);
        if (orb <= ASPECT_ORB_LIMIT) {
          let nature: "applying" | "separating" | "exact" = "exact";
          let natureLabel = "Eksak";

          if (date && orb > 0.001) {
            const nextHour = new Date(date.getTime() + 3600 * 1000);
            const nextL1 = getGeocentricLongitude(b1, nextHour, convention);
            const nextL2 = getGeocentricLongitude(b2, nextHour, convention);
            const nextDist = angularDistance(nextL1, nextL2);
            const nextOrb = Math.abs(nextDist - asp.angle);

            if (nextOrb < orb - 0.0001) {
              nature = "applying";
              natureLabel = "Mendekat";
            } else if (nextOrb > orb + 0.0001) {
              nature = "separating";
              natureLabel = "Menjauh";
            }
          }

          out.push({
            a: b1,
            b: b2,
            aspect: asp.name,
            aspectLabel: asp.label,
            angle: asp.angle,
            exactDistance: Math.round(dist * 100) / 100,
            orb: Math.round(orb * 100) / 100,
            nature,
            natureLabel,
          });
          break;
        }
      }
    }
  }

  return out.sort((x, y) => x.orb - y.orb);
}

/**
 * Category 2: Status Gerak Planet (Planetary Motion Status)
 * Checks 8 planets Mercury-Pluto for Retrograde / Direct / Stationary.
 */
export function calculatePlanetaryMotions(
  date: Date,
  bodiesStatus?: Array<{ body: SkyBody; longitude: number; sign: string }>,
  convention: EphemerisConvention = "apparent"
): PlanetaryMotionSummary {
  const motions: PlanetMotionDetail[] = [];
  let retrogradeCount = 0;
  let directCount = 0;
  let stationaryCount = 0;

  for (const b of EIGHT_PLANETS) {
    const lon = bodiesStatus?.find((x) => x.body === b)?.longitude ?? getGeocentricLongitude(b, date, convention);
    const sign = bodiesStatus?.find((x) => x.body === b)?.sign ?? getZodiacSign(lon);
    const speed = getPlanetaryVelocity(b, date, convention);

    let motionStatus: "retrograde" | "direct" | "stationary" = "direct";
    let isRetrograde = false;
    let label = "Direct";

    if (Math.abs(speed) < STATIONARY_SPEED_THRESHOLD) {
      motionStatus = "stationary";
      label = "Stasioner";
      stationaryCount++;
    } else if (speed < 0) {
      motionStatus = "retrograde";
      isRetrograde = true;
      label = "Retrograde (Rx)";
      retrogradeCount++;
    } else {
      directCount++;
    }

    motions.push({
      body: b,
      sign,
      longitude: lon,
      speedDegPerDay: Math.round(speed * 1000) / 1000,
      motionStatus,
      isRetrograde,
      label,
    });
  }

  const parts = [];
  if (retrogradeCount > 0) parts.push(`${retrogradeCount} Retrograde`);
  if (stationaryCount > 0) parts.push(`${stationaryCount} Stasioner`);
  parts.push(`${directCount} Direct`);

  return {
    retrogradeCount,
    directCount,
    stationaryCount,
    totalChecked: EIGHT_PLANETS.length,
    motions,
    summaryLabel: parts.join(" · "),
  };
}

/**
 * Category 3: Peristiwa Hari Ini (Daily Specific Events)
 * Boundary: 00:00:00 to 24:00:00 in given timezone (default "Asia/Jakarta").
 */
export function calculateDailyEvents(
  targetDate: Date,
  timezone: string = "Asia/Jakarta",
  convention: EphemerisConvention = "apparent"
): DailyAstroEvent[] {
  const Ast: any = Astronomy;

  // Compute local midnight boundaries in UTC
  // Using Intl format to get local date components
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(targetDate);
  const year = parseInt(parts.find((p) => p.type === "year")?.value || "2026", 10);
  const month = parseInt(parts.find((p) => p.type === "month")?.value || "10", 10);
  const day = parseInt(parts.find((p) => p.type === "day")?.value || "25", 10);

  // Approximate offset for timezone
  // For Asia/Jakarta, offset is +07:00
  const isWib = timezone === "Asia/Jakarta" || timezone === "Asia/Bangkok" || timezone.includes("Jakarta");
  const offsetHours = isWib ? 7 : 7; // standard Indonesian Western Time

  const startUtc = new Date(Date.UTC(year, month - 1, day, -offsetHours, 0, 0, 0));
  const endUtc = new Date(Date.UTC(year, month - 1, day + 1, -offsetHours, 0, 0, 0));

  const formatLocalTime = (d: Date): string => {
    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(d) + (isWib ? " WIB" : "")
    );
  };

  const events: DailyAstroEvent[] = [];

  // 1. Ingresses (Planets + Moon)
  const ingressBodies: SkyBody[] = [
    "Moon",
    "Sun",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
  ];

  for (const b of ingressBodies) {
    const s0 = getZodiacSignIndex(getGeocentricLongitude(b, startUtc, convention));
    const s1 = getZodiacSignIndex(getGeocentricLongitude(b, endUtc, convention));
    if (s0 !== s1) {
      let low = startUtc.getTime();
      let high = endUtc.getTime();
      while (high - low > 1000) {
        const mid = Math.floor((low + high) / 2);
        if (getZodiacSignIndex(getGeocentricLongitude(b, new Date(mid), convention)) === s0) {
          low = mid;
        } else {
          high = mid;
        }
      }
      const ingressTime = new Date(high);
      events.push({
        id: `ingress-${b}-${high}`,
        type: "ingress",
        title: `${b} Masuk ${ZODIAC_SIGNS[s1]}`,
        detail: `${b} berpindah dari ${ZODIAC_SIGNS[s0]} ke ${ZODIAC_SIGNS[s1]} pada ${formatLocalTime(ingressTime)}.`,
        timeUtc: ingressTime,
        timeLocalFormatted: formatLocalTime(ingressTime),
        body: b,
        fromSign: ZODIAC_SIGNS[s0],
        toSign: ZODIAC_SIGNS[s1],
      });
    }
  }

  // 2. Station Transitions (Mercury - Pluto)
  // Uses instantaneous velocity for high-precision root-finding of dλ/dt = 0
  for (const b of EIGHT_PLANETS) {
    const v0 = getInstantaneousVelocity(b, startUtc, convention);
    const v1 = getInstantaneousVelocity(b, endUtc, convention);
    if ((v0 < 0 && v1 >= 0) || (v0 >= 0 && v1 < 0)) {
      let low = startUtc.getTime();
      let high = endUtc.getTime();
      while (high - low > 1000) {
        const mid = Math.floor((low + high) / 2);
        const vMid = getInstantaneousVelocity(b, new Date(mid), convention);
        if ((v0 < 0 && vMid < 0) || (v0 >= 0 && vMid >= 0)) {
          low = mid;
        } else {
          high = mid;
        }
      }
      const stationTime = new Date(high);
      const isNowRetro = v1 < 0;
      events.push({
        id: `station-${b}-${high}`,
        type: "station",
        title: `${b} Stasioner ${isNowRetro ? "Retrograde" : "Direct"}`,
        detail: `${b} berganti arah gerak menjadi ${isNowRetro ? "retrograde" : "direct"} sekitar ${formatLocalTime(stationTime)}.`,
        timeUtc: stationTime,
        timeLocalFormatted: formatLocalTime(stationTime),
        body: b,
      });
    }
  }

  // 3. Exact Aspects (Orb 0.00°)
  for (let i = 0; i < ASPECT_POOL.length; i++) {
    for (let j = i + 1; j < ASPECT_POOL.length; j++) {
      const b1 = ASPECT_POOL[i];
      const b2 = ASPECT_POOL[j];
      const l1Start = getGeocentricLongitude(b1, startUtc, convention);
      const l2Start = getGeocentricLongitude(b2, startUtc, convention);
      const l1End = getGeocentricLongitude(b1, endUtc, convention);
      const l2End = getGeocentricLongitude(b2, endUtc, convention);

      for (const asp of ASPECT_CONFIG) {
        const diffStart = angularDistance(l1Start, l2Start) - asp.angle;
        const diffEnd = angularDistance(l1End, l2End) - asp.angle;

        if ((diffStart < 0 && diffEnd >= 0) || (diffStart >= 0 && diffEnd < 0)) {
          let low = startUtc.getTime();
          let high = endUtc.getTime();
          while (high - low > 1000) {
            const mid = Math.floor((low + high) / 2);
            const dMid = new Date(mid);
            const curDiff = angularDistance(getGeocentricLongitude(b1, dMid, convention), getGeocentricLongitude(b2, dMid, convention)) - asp.angle;
            if ((diffStart < 0 && curDiff < 0) || (diffStart >= 0 && curDiff >= 0)) {
              low = mid;
            } else {
              high = mid;
            }
          }
          const exactTime = new Date(high);
          events.push({
            id: `exact-${b1}-${b2}-${asp.name}-${high}`,
            type: "exact_aspect",
            title: `${asp.label} Eksak: ${b1} & ${b2}`,
            detail: `Aspek ${asp.label} antara ${b1} dan ${b2} mencapai titik puncak eksak 0° pada ${formatLocalTime(exactTime)}.`,
            timeUtc: exactTime,
            timeLocalFormatted: formatLocalTime(exactTime),
          });
        }
      }
    }
  }

  // 4. Lunar Major Phase Peaks
  if (Ast.SearchMoonPhase) {
    for (const targetAngle of [0, 90, 180, 270]) {
      const phase = Ast.SearchMoonPhase(targetAngle, startUtc, 1.5);
      if (
        phase &&
        phase.date.getTime() >= startUtc.getTime() &&
        phase.date.getTime() < endUtc.getTime()
      ) {
        const phaseNames: Record<number, string> = {
          0: "Bulan Baru (New Moon)",
          90: "Perbani Awal (First Quarter)",
          180: "Bulan Purnama (Full Moon)",
          270: "Perbani Akhir (Last Quarter)",
        };
        const pName = phaseNames[targetAngle] || "Fase Bulan";
        events.push({
          id: `moon-peak-${targetAngle}-${phase.date.getTime()}`,
          type: "moon_phase_peak",
          title: `Puncak ${pName}`,
          detail: `Puncak astronomis fase ${pName} terjadi pada ${formatLocalTime(phase.date)}.`,
          timeUtc: phase.date,
          timeLocalFormatted: formatLocalTime(phase.date),
          phaseName: pName,
        });
      }
    }
  }

  // Sort events by local time ascending
  return events.sort((a, b) => a.timeUtc.getTime() - b.timeUtc.getTime());
}
