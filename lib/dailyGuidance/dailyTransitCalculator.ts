import { DateTime } from "luxon";
import {
  getGeocentricLongitude,
  getInstantaneousVelocity,
  angularDistance,
  getZodiacSign,
} from "@/lib/astrology/transitEvents";
import type { SkyBody } from "@/lib/astrology/calculateCurrentSky";
import {
  ASPECT_DEFINITIONS,
  TRANSIT_BODIES,
  PLANET_LABELS_ID,
  resolveSafeTimezone,
  extractNatalPlacements,
  type NatalPlacement,
  type TransitToNatalAspect,
} from "@/lib/weeklyGuidance/weeklyTransitCalculator";
import type { AspectType, WeeklyAstrologicalEvidence } from "@/lib/weeklyGuidance/types";

export type DailyTransitToNatalAspect = {
  transitBody: SkyBody;
  transitLongitude: number;
  transitSign: string;
  transitDegree: number;
  transitMotion: "retrograde" | "direct" | "stationary";
  transitHouse: number;
  isCuspCrossing: boolean;
  cuspCrossingDetail?: string;
  natalPlacement: NatalPlacement;
  aspect: AspectType;
  aspectLabel: string;
  orb: number;
  nature: "applying" | "exact" | "separating";
  exactTimeFormatted?: string;
  exactDate?: Date;
};

export type DailyTimeWindow = {
  timezone: string;
  start: DateTime;
  end: DateTime;
  midpoint: DateTime;
  dayKey: string;
  dateFormatted: string;
};

export function computeDailyTimeWindow(
  referenceDate: Date = new Date(),
  timezone: string = "Asia/Jakarta"
): DailyTimeWindow {
  const safeZone = resolveSafeTimezone(timezone);
  let dt = DateTime.fromJSDate(referenceDate, { zone: safeZone });
  if (!dt.isValid) dt = DateTime.now().setZone(safeZone);

  const start = dt.startOf("day");
  const end = dt.endOf("day");
  const midpoint = start.plus({ hours: 12 });
  const dayKey = dt.toFormat("yyyy-MM-dd");
  const dateFormatted = dt.setLocale("id-ID").toFormat("cccc, d LLLL yyyy");

  return {
    timezone: safeZone,
    start,
    end,
    midpoint,
    dayKey,
    dateFormatted,
  };
}

function getHouseFromCusps(longitude: number, placidusHouses: Array<{ house: number; sign: string; degree: number | null }>): number | null {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const cusps = placidusHouses
    .filter((h) => typeof h.degree === "number")
    .map((h) => {
      const sIdx = signs.indexOf(h.sign);
      const baseLon = sIdx >= 0 ? sIdx * 30 : 0;
      return {
        house: h.house,
        longitude: ((baseLon + (h.degree ?? 0)) % 360 + 360) % 360,
      };
    })
    .sort((a, b) => a.longitude - b.longitude);

  if (cusps.length < 12) return null;
  const normLon = ((longitude % 360) + 360) % 360;

  for (let i = 0; i < cusps.length; i++) {
    const cur = cusps[i];
    const nxt = cusps[(i + 1) % cusps.length];
    if (cur.longitude <= nxt.longitude) {
      if (normLon >= cur.longitude && normLon < nxt.longitude) return cur.house;
    } else {
      if (normLon >= cur.longitude || normLon < nxt.longitude) return cur.house;
    }
  }
  return null;
}

export function calculateDailyTransitToNatalAspects(
  window: DailyTimeWindow,
  natalPlacements: NatalPlacement[],
  placidusHouses: Array<{ house: number; sign: string; degree: number | null }>
): DailyTransitToNatalAspect[] {
  const midDate = window.midpoint.toJSDate();
  const startDate = window.start.toJSDate();
  const endDate = window.end.toJSDate();
  const results: DailyTransitToNatalAspect[] = [];

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

    // Placidus house traversal in 24 hours
    const startHouse = placidusHouses.length >= 12 ? getHouseFromCusps(startLon, placidusHouses) ?? 1 : 1;
    const midHouse = placidusHouses.length >= 12 ? getHouseFromCusps(midLon, placidusHouses) ?? 1 : 1;
    const endHouse = placidusHouses.length >= 12 ? getHouseFromCusps(endLon, placidusHouses) ?? 1 : 1;

    const isCuspCrossing = startHouse !== endHouse;
    let cuspCrossingDetail: string | undefined;
    if (isCuspCrossing) {
      if (tBody === "Moon") {
        cuspCrossingDetail = `Hari ini, lintasan cepat Bulan berpindah dari rumah ke-${startHouse} menuju rumah ke-${endHouse} Placidus (posisi tengah hari di rumah ke-${midHouse} Placidus)`;
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

          // Determine target aspect angle longitude closest to midLon
          const target1 = ((nat.longitude + def.angle) % 360 + 360) % 360;
          const target2 = ((nat.longitude - def.angle) % 360 + 360) % 360;
          const d1 = angularDistance(midLon, target1);
          const d2 = angularDistance(midLon, target2);
          const targetLon = d1 <= d2 ? target1 : target2;

          // Continuous signed difference in [-180, 180]
          const signedDiff = (lon: number) => {
            return ((lon - targetLon + 540) % 360) - 180;
          };

          // Exact aspect timing root-finding: check 24 1-hour intervals for true zero-crossing within the day
          let exactTimeFormatted: string | undefined;
          let exactDate: Date | undefined;

          const numIntervals = 24;
          const totalWindowMs = window.end.toMillis() - window.start.toMillis();
          const intervalMs = totalWindowMs / numIntervals;

          let bestStep = -1;
          let minStepOrb = 999;

          for (let step = 0; step < numIntervals; step++) {
            const tA = window.start.toMillis() + step * intervalMs;
            const tB = tA + intervalMs;
            const lonA = getGeocentricLongitude(tBody, new Date(tA));
            const lonB = getGeocentricLongitude(tBody, new Date(tB));
            const sDiffA = signedDiff(lonA);
            const sDiffB = signedDiff(lonB);

            const curOrb = Math.abs(sDiffA);
            if (curOrb < minStepOrb) {
              minStepOrb = curOrb;
              bestStep = step;
            }

            if (sDiffA * sDiffB <= 0) {
              let low = tA;
              let high = tB;
              for (let iter = 0; iter < 16; iter++) {
                const testMid = (low + high) / 2;
                const testLon = getGeocentricLongitude(tBody, new Date(testMid));
                const testDiff = signedDiff(testLon);
                if (Math.abs(testDiff) < 0.005) {
                  exactDate = new Date(testMid);
                  break;
                }
                if (sDiffA * testDiff <= 0) {
                  high = testMid;
                } else {
                  low = testMid;
                }
              }
              if (exactDate) break;
            }
          }

          // If no zero-crossing occurred today, but aspect is tight (orb <= 0.35) and reached minimum within the day:
          if (!exactDate && minStepOrb <= 0.35 && bestStep > 0 && bestStep < numIntervals - 1) {
            exactDate = new Date(window.start.toMillis() + bestStep * intervalMs);
          } else if (!exactDate && orb <= 0.25) {
            // Tight aspect with minimum today
            const t0 = startDate.getTime();
            const t1 = midDate.getTime();
            const t2 = endDate.getTime();
            const y0 = prevOrb;
            const y1 = orb;
            const y2 = nextOrb;
            const denom = 2 * (y0 - 2 * y1 + y2);
            if (denom > 0) {
              const dtMin = ((y0 - y2) / denom) * (t1 - t0);
              const estTime = t1 + dtMin;
              if (estTime >= t0 && estTime <= t2) {
                exactDate = new Date(estTime);
              }
            }
            if (!exactDate) {
              exactDate = midDate;
            }
          }

          if (exactDate) {
            const dtExact = DateTime.fromJSDate(exactDate, { zone: window.timezone }).setLocale("id-ID");
            exactTimeFormatted = `sekitar ${dtExact.toFormat("HH:mm")} ${window.timezone.includes("Jakarta") ? "WIB" : ""}`.trim();
          }

          let nature: "applying" | "exact" | "separating" = "applying";
          if (exactDate) {
            const nowMs = midDate.getTime();
            const exactMs = exactDate.getTime();
            if (Math.abs(nowMs - exactMs) < 60 * 60 * 1000) {
              nature = "exact";
            } else if (nowMs < exactMs) {
              nature = "applying";
            } else {
              nature = "separating";
            }
          } else if (orb < 0.25) {
            nature = "exact";
          } else if (nextOrb < prevOrb) {
            nature = "applying";
          } else {
            nature = "separating";
          }

          results.push({
            transitBody: tBody,
            transitLongitude: midLon,
            transitSign: tSign,
            transitDegree: tDeg,
            transitMotion: motion,
            transitHouse: midHouse,
            isCuspCrossing,
            cuspCrossingDetail,
            natalPlacement: nat,
            aspect: def.type,
            aspectLabel: def.label,
            orb: Math.round(orb * 100) / 100,
            nature,
            exactTimeFormatted,
            exactDate,
          });
        }
      }
    }
  }

  // Sort by tightness of orb
  return results.sort((a, b) => a.orb - b.orb);
}
