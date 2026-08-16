import * as Astronomy from "astronomy-engine";

export type HumanDesignType =
  | "Generator"
  | "Manifesting Generator"
  | "Projector"
  | "Reflector"
  | "Manifestor";

const gateOrder = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

export const centersByChannel: Record<string, [string, string]> = {
  "1-8": ["G", "Throat"],
  "2-14": ["Sacral", "G"],
  "3-60": ["Root", "Sacral"],
  "4-63": ["Head", "Ajna"],
  "5-15": ["Sacral", "G"],
  "6-59": ["Sacral", "Solar Plexus"],
  "7-31": ["G", "Throat"],
  "9-52": ["Root", "Sacral"],
  "10-20": ["G", "Throat"],
  "10-34": ["G", "Sacral"],
  "10-57": ["G", "Spleen"],
  "11-56": ["Ajna", "Throat"],
  "12-22": ["Throat", "Solar Plexus"],
  "13-33": ["G", "Throat"],
  "16-48": ["Spleen", "Throat"],
  "17-62": ["Ajna", "Throat"],
  "18-58": ["Root", "Spleen"],
  "19-49": ["Root", "Solar Plexus"],
  "20-34": ["Throat", "Sacral"],
  "20-57": ["Throat", "Spleen"],
  "21-45": ["Ego", "Throat"],
  "23-43": ["Ajna", "Throat"],
  "24-61": ["Head", "Ajna"],
  "25-51": ["Ego", "Throat"],
  "26-44": ["Spleen", "Ego"],
  "27-50": ["Spleen", "Sacral"],
  "28-38": ["Spleen", "Root"],
  "29-46": ["Sacral", "G"],
  "30-41": ["Root", "Solar Plexus"],
  "32-54": ["Root", "Spleen"],
  "34-57": ["Sacral", "Spleen"],
  "35-36": ["Solar Plexus", "Throat"],
  "37-40": ["Ego", "Solar Plexus"],
  "39-55": ["Root", "Solar Plexus"],
  "42-53": ["Root", "Sacral"],
  "47-64": ["Head", "Ajna"],
};

const planets = [
  Astronomy.Body.Sun,
  Astronomy.Body.Moon,
  Astronomy.Body.Mercury,
  Astronomy.Body.Venus,
  Astronomy.Body.Mars,
  Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn,
  Astronomy.Body.Uranus,
  Astronomy.Body.Neptune,
  Astronomy.Body.Pluto,
];

function normalizeDegrees(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function parseTimezoneOffsetMinutes(timezone?: string | null): number | null {
  if (!timezone) return null;

  // Support +HH:mm or +HHmm or +HH
  const match = timezone.trim().match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  if (!match) return null;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return sign * (hours * 60 + minutes);
}

export function birthDateTimeToUtcDate(
  birthDate: string,
  birthTime: string,
  timezone?: string | null,
  longitude?: number | null,
): Date {
  const time = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute, second = 0] = time.split(":").map(Number);

  if (
    Number.isFinite(year) &&
    Number.isFinite(month) &&
    Number.isFinite(day) &&
    Number.isFinite(hour) &&
    Number.isFinite(minute)
  ) {
    const offsetMinutes = parseTimezoneOffsetMinutes(timezone);

    if (offsetMinutes !== null) {
      const utcMs = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000;
      return new Date(utcMs);
    }

    // BUILD 31: If timezone is missing, we check for named timezone or longitude
    if (timezone && !timezone.includes("+") && !timezone.includes("-")) {
      try {
        const dateStr = `${birthDate}T${time}Z`;
        const date = new Date(dateStr);
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false
        });

        const parts = formatter.formatToParts(date);
        const p: Record<string, string> = {};
        parts.forEach(part => p[part.type] = part.value);

        const tzDate = Date.UTC(
          parseInt(p.year),
          parseInt(p.month) - 1,
          parseInt(p.day),
          parseInt(p.hour) === 24 ? 0 : parseInt(p.hour),
          parseInt(p.minute),
          parseInt(p.second)
        );

        const offset = (tzDate - date.getTime());
        return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offset);
      } catch (e) {
        console.warn("[HD TIMEZONE] Intl fallback failed for", timezone, e);
      }
    }

    // BUILD 31 PROTECTION: We still allow longitude approximation for CALCULATIONS
    // but the repair logic will mark it as "approximate" and avoid overwriting "ready" charts.
    if (typeof longitude === "number" && Number.isFinite(longitude)) {
      const approximateUtcOffsetHours = Math.round(longitude / 15);
      return new Date(Date.UTC(year, month - 1, day, hour - approximateUtcOffsetHours, minute, second));
    }
  }

  // BUILD 31: Return an invalid date rather than guessing +07:00 if data is missing
  return new Date(NaN);
}

function eclipticLongitude(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    return Astronomy.SunPosition(date).elon;
  }

  if (body === Astronomy.Body.Moon) {
    return Astronomy.EclipticGeoMoon(date).lon;
  }

  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}

// HD gate-mandala anchoring (BUG 3 FIX).
// Canonical convention: Gate 41 begins at 02°00′00″ Aquarius (302°00′00″ ecliptic),
// i.e. +58° from 0° Aries. This matches the hdkit reference library vendored at
// lib/humandesign/hdkit/models/bodygraph.ts:985-1008 (getActivationFromDecimalDegrees).
const GATE_MANDALA_OFFSET_DEGREES = 58;

function gateFromLongitude(longitude: number): number {
  // Gate 41 starts at 2°00' Aquarius (302°).
  // adjusted = (longitude + 360 - 302) % 360 == (longitude + 58) % 360
  const adjusted = normalizeDegrees(longitude + GATE_MANDALA_OFFSET_DEGREES);
  return gateOrder[Math.floor((adjusted / 360) * 64)];
}

function lineFromLongitude(longitude: number): number {
  // Same canonical +58° anchoring as gateFromLongitude above.
  const adjusted = normalizeDegrees(longitude + GATE_MANDALA_OFFSET_DEGREES);
  const gateProgress = (adjusted / 360) * 64;
  const gateFraction = gateProgress % 1;
  return Math.floor(gateFraction * 6) + 1;
}

function unwrappedSolarLongitude(date: Date, personalitySunLongitude: number): number {
  const longitude = eclipticLongitude(Astronomy.Body.Sun, date);
  return longitude > personalitySunLongitude ? longitude - 360 : longitude;
}

function findDesignDate(birthDate: Date): Date {
  const personalitySunLongitude = eclipticLongitude(Astronomy.Body.Sun, birthDate);
  const targetLongitude = personalitySunLongitude - 88;
  let start = new Date(birthDate.getTime() - 100 * 24 * 60 * 60 * 1000);
  let end = new Date(birthDate.getTime() - 70 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < 32; i += 1) {
    const midpoint = new Date((start.getTime() + end.getTime()) / 2);
    const midpointLongitude = unwrappedSolarLongitude(midpoint, personalitySunLongitude);

    if (midpointLongitude < targetLongitude) {
      start = midpoint;
    } else {
      end = midpoint;
    }
  }

  return new Date((start.getTime() + end.getTime()) / 2);
}

function getNorthNodeLongitude(date: Date): number {
  // Approximate Mean North Node (Standard HD Fallback)
  const epoch = Date.UTC(2000, 0, 1, 12, 0, 0);
  const days = (date.getTime() - epoch) / (1000 * 60 * 60 * 24);
  const lon = 259.183275 - 0.0529539222 * days;
  return normalizeDegrees(lon);
}

function activatedGatesForDate(date: Date): number[] {
  const gates = planets.map((body) => gateFromLongitude(eclipticLongitude(body, date)));
  const sunGate = gateFromLongitude(eclipticLongitude(Astronomy.Body.Sun, date));
  const earthGate = gateFromLongitude(normalizeDegrees(eclipticLongitude(Astronomy.Body.Sun, date) + 180));

  // Add Lunar Nodes
  const northNodeLon = getNorthNodeLongitude(date);
  const southNodeLon = normalizeDegrees(northNodeLon + 180);
  const nodeGates = [gateFromLongitude(northNodeLon), gateFromLongitude(southNodeLon)];

  return [...new Set([...gates, sunGate, earthGate, ...nodeGates])];
}

const motors = ["Sacral", "Root", "Solar Plexus", "Ego"];

function motorToThroat(channels: string[], definedCenters: Set<string>): boolean {
  if (!definedCenters.has("Throat")) return false;

  const adj = new Map<string, string[]>();
  channels.forEach(ch => {
    const [c1, c2] = centersByChannel[ch];
    if (!adj.has(c1)) adj.set(c1, []);
    if (!adj.has(c2)) adj.set(c2, []);
    adj.get(c1)!.push(c2);
    adj.get(c2)!.push(c1);
  });

  const visited = new Set<string>();
  const queue = ["Throat"];
  visited.add("Throat");

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (motors.includes(curr)) return true;

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return false;
}

function getDefinition(channels: string[], definedCenters: Set<string>): string {
  if (definedCenters.size === 0) return "No Definition";

  const centers = Array.from(definedCenters);
  const adj = new Map<string, string[]>();

  channels.forEach(ch => {
    const [c1, c2] = centersByChannel[ch];
    if (!adj.has(c1)) adj.set(c1, []);
    if (!adj.has(c2)) adj.set(c2, []);
    adj.get(c1)!.push(c2);
    adj.get(c2)!.push(c1);
  });

  const visited = new Set<string>();
  let islands = 0;

  centers.forEach(c => {
    if (!visited.has(c)) {
      islands++;
      const queue = [c];
      visited.add(c);
      while (queue.length > 0) {
        const curr = queue.shift()!;
        (adj.get(curr) || []).forEach(next => {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        });
      }
    }
  });

  if (islands === 1) return "Single Definition";
  if (islands === 2) return "Split Definition";
  if (islands === 3) return "Triple Split Definition";
  if (islands === 4) return "Quadruple Split Definition";
  return "Single Definition";
}

export function calculateHumanDesignTypeFromBirthData(
  birthDate: string,
  birthTime: string,
  timezone?: string | null,
  longitude?: number | null,
): { type: HumanDesignType; definition: string; channels: string[]; activeGates: number[] } | null {
  const personalityDate = birthDateTimeToUtcDate(birthDate, birthTime, timezone, longitude);

  if (Number.isNaN(personalityDate.getTime())) {
    return null;
  }

  const designDate = findDesignDate(personalityDate);
  const activeGatesSet = new Set([
    ...activatedGatesForDate(personalityDate),
    ...activatedGatesForDate(designDate),
  ]);
  const activeGates = Array.from(activeGatesSet).sort((a, b) => a - b);

  const channels = Object.keys(centersByChannel).filter((channel) => {
    const [firstGate, secondGate] = channel.split("-").map(Number);
    return activeGatesSet.has(firstGate) && activeGatesSet.has(secondGate);
  });
  const definedCenters = new Set(channels.flatMap((channel) => centersByChannel[channel]));

  const definition = getDefinition(channels, definedCenters);

  if (channels.length === 0 || definedCenters.size === 0) return null;

  let type: HumanDesignType = "Projector";
  if (definedCenters.has("Sacral")) {
    type = motorToThroat(channels, definedCenters) ? "Manifesting Generator" : "Generator";
  } else if (motorToThroat(channels, definedCenters)) {
    type = "Manifestor";
  }

  return { type, definition, channels, activeGates };
}

export function calculateHumanDesignProfileFromBirthData(
  birthDate: string,
  birthTime: string,
  timezone?: string | null,
  longitude?: number | null,
): string | null {
  const personalityDate = birthDateTimeToUtcDate(birthDate, birthTime, timezone, longitude);
  if (Number.isNaN(personalityDate.getTime())) return null;

  const designDate = findDesignDate(personalityDate);

  const personalitySunLon = eclipticLongitude(Astronomy.Body.Sun, personalityDate);
  const designSunLon = eclipticLongitude(Astronomy.Body.Sun, designDate);

  const personalityLine = lineFromLongitude(personalitySunLon);
  const designLine = lineFromLongitude(designSunLon);

  return `${personalityLine}/${designLine}`;
}
