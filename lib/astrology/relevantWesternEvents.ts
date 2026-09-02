import type { CurrentSky, SkyBody } from "./calculateCurrentSky";

// T-ASTRO-03 / T-ASTRO-06 / R-PRD-37: variable-count relevant Western sky events.
// No fixed slice. Relevance = retrograde motion, tight major aspects (orb <= 6 deg),
// or sign ingress near today. The Sun is included only when it carries a reason,
// so the natural event count varies day by day (contract: 0..15+, never padded).

export type WesternAspectName = "conjunction" | "sextile" | "square" | "trine" | "opposition";

export type WesternAspect = {
  partner: SkyBody;
  aspect: WesternAspectName;
  orb: number;
};

export type RelevantWesternEvent = {
  body: SkyBody;
  sign: string;
  isRetrograde: boolean;
  periodStart?: string;
  periodEnd?: string;
  reasons: Array<{ type: "retrograde" | "aspect" | "ingress"; detail?: string }>;
  aspects: WesternAspect[];
  score: number;
};

const ASPECT_POOL: SkyBody[] = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
// ponytail: Chiron/Lilith/North Node excluded — Chiron longitude here is a linear approximation,
// unreliable for orb work; upgrade path = real ephemeris for those bodies.

export const ASPECT_ORB_LIMIT = 6;
const INGRESS_WINDOW_DAYS = 3;

const ASPECT_ANGLES: Array<{ name: WesternAspectName; angle: number }> = [
  { name: "conjunction", angle: 0 },
  { name: "sextile", angle: 60 },
  { name: "square", angle: 90 },
  { name: "trine", angle: 120 },
  { name: "opposition", angle: 180 },
];

function angularDistance(a: number, b: number): number {
  let d = Math.abs(((a - b) % 360 + 360) % 360);
  if (d > 180) d = 360 - d;
  return d;
}

/** Pure aspect computation over ecliptic longitudes — unit-testable without ephemeris. */
export function computeAspects(longitudes: Partial<Record<SkyBody, number>>): Array<{ a: SkyBody; b: SkyBody; aspect: WesternAspectName; orb: number }> {
  const bodies = Object.keys(longitudes) as SkyBody[];
  const out: Array<{ a: SkyBody; b: SkyBody; aspect: WesternAspectName; orb: number }> = [];
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dist = angularDistance(longitudes[bodies[i]]!, longitudes[bodies[j]]!);
      for (const { name, angle } of ASPECT_ANGLES) {
        const orb = Math.abs(dist - angle);
        if (orb <= ASPECT_ORB_LIMIT) {
          out.push({ a: bodies[i], b: bodies[j], aspect: name, orb });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

function daysBetween(dateKeyA: string, dateKeyB: string): number {
  return Math.abs((new Date(`${dateKeyA}T00:00:00Z`).getTime() - new Date(`${dateKeyB}T00:00:00Z`).getTime()) / 86400000);
}

function parseIndoDateBoundToKey(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // periodStart/periodEnd are Indonesian-formatted ("12 Agustus 2026"); map back to ISO key.
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const m = value.match(/^(\d{1,2})\s+(\w+)\s+(\d{4})$/);
  if (!m) return undefined;
  const monthIndex = months.indexOf(m[2]);
  if (monthIndex < 0) return undefined;
  return `${m[3]}-${String(monthIndex + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

export function selectRelevantWesternEvents(sky: CurrentSky): RelevantWesternEvent[] {
  const pool = sky.bodies.filter((b) => ASPECT_POOL.includes(b.body));
  const longitudes: Partial<Record<SkyBody, number>> = {};
  pool.forEach((b) => { longitudes[b.body] = b.longitude; });
  const aspects = computeAspects(longitudes);

  const today = sky.date;
  const events: RelevantWesternEvent[] = [];

  for (const body of pool) {
    const reasons: RelevantWesternEvent["reasons"] = [];
    const bodyAspects = aspects.filter((a) => a.a === body.body || a.b === body.body)
      .map((a) => ({ partner: (a.a === body.body ? a.b : a.a), aspect: a.aspect, orb: a.orb }));

    if (body.isRetrograde) {
      reasons.push({ type: "retrograde", detail: body.periodEnd ? `direct ~${body.periodEnd}` : undefined });
    }
    if (bodyAspects.length > 0) {
      for (const asp of bodyAspects) {
        reasons.push({ type: "aspect", detail: `${asp.aspect} ${asp.partner} (orb ${asp.orb.toFixed(1)}°)` });
      }
    }
    const startKey = parseIndoDateBoundToKey(body.periodStart);
    const endKey = parseIndoDateBoundToKey(body.periodEnd);
    if ((startKey && daysBetween(startKey, today) <= INGRESS_WINDOW_DAYS) || (endKey && daysBetween(endKey, today) <= INGRESS_WINDOW_DAYS)) {
      reasons.push({ type: "ingress", detail: body.sign });
    }

    if (reasons.length === 0) continue; // Sun with nothing to say stays out — count varies naturally

    let score = 0;
    if (body.isRetrograde) score += 3;
    score += bodyAspects.length * 2 + (bodyAspects.length > 0 ? (ASPECT_ORB_LIMIT - bodyAspects[0].orb) : 0);
    if (reasons.some((r) => r.type === "ingress")) score += 4;
    if (body.body === "Sun") score += 1;

    events.push({
      body: body.body,
      sign: body.sign,
      isRetrograde: body.isRetrograde,
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      reasons,
      aspects: bodyAspects,
      score: Math.round(score * 10) / 10,
    });
  }

  return events.sort((a, b) => b.score - a.score || a.body.localeCompare(b.body));
}
