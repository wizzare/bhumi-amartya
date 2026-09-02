import * as Astronomy from "astronomy-engine";

// T-ASTRO-01 / T-ASTRO-02 / T-ASTRO-12: dynamic eclipse source replacing KNOWN_ECLIPSES.
// Uses astronomy-engine's Meeus-based eclipse search — no hardcoded dates.
// Local/Visible Next is computed ONLY when real observer coordinates exist;
// otherwise callers must surface an explicit unavailable state (D-V5-29: never invent visibility).

export type EclipseKindInfo = {
  kind: "solar" | "lunar";
  subkind: string;
  peakUtc: Date;
  id: string;
};

export type VisibleEclipseInfo = {
  global: EclipseKindInfo;
  /** True when the SAME upcoming eclipse is visible at the observer location. */
  visibleAtObserver: boolean;
};

export type ObserverLocation = { latitude: number; longitude: number };

const MAX_SEARCH_ITERATIONS = 60;

function subkindLabel(kind: string): string {
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export function findNextGlobalSolarEclipse(after: Date): EclipseKindInfo | null {
  try {
    const e = Astronomy.SearchGlobalSolarEclipse(after);
    return { kind: "solar", subkind: subkindLabel(e.kind), peakUtc: e.peak.date, id: `eclipse_solar_${e.peak.date.toISOString().slice(0, 10)}` };
  } catch {
    return null;
  }
}

export function findNextGlobalLunarEclipse(after: Date): EclipseKindInfo | null {
  try {
    const e = Astronomy.SearchLunarEclipse(after);
    return { kind: "lunar", subkind: subkindLabel(e.kind), peakUtc: e.peak.date, id: `eclipse_lunar_${e.peak.date.toISOString().slice(0, 10)}` };
  } catch {
    return null;
  }
}

/** Next chronological eclipse of any kind worldwide (whichever comes first). */
export function findNextGlobalEclipse(after: Date): EclipseKindInfo | null {
  const solar = findNextGlobalSolarEclipse(after);
  const lunar = findNextGlobalLunarEclipse(after);
  if (!solar) return lunar;
  if (!lunar) return solar;
  return solar.peakUtc.getTime() <= lunar.peakUtc.getTime() ? solar : lunar;
}

function isLunarEclipseVisibleAt(eclipsePeak: Date, observer: ObserverLocation): boolean {
  try {
    const obs = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
    const equ = Astronomy.Equator(Astronomy.Body.Moon, eclipsePeak, obs, true, true);
    const hor = Astronomy.Horizon(eclipsePeak, obs, equ.ra, equ.dec, "normal");
    return hor.altitude > 0;
  } catch {
    return false;
  }
}

/**
 * Next Global Next + whether that same event is locally observable.
 * Returns null when no reliable visibility determination is possible
 * (no observer coordinates) — callers must then mark Local/Visible as unavailable.
 */
export function findNextVisibleEclipse(after: Date, observer: ObserverLocation | null): VisibleEclipseInfo | null {
  const global = findNextGlobalEclipse(after);
  if (!global) return null;
  if (!observer) return null;

  if (global.kind === "lunar") {
    return { global, visibleAtObserver: isLunarEclipseVisibleAt(global.peakUtc, observer) };
  }

  // Solar: the same global eclipse is locally visible iff a local search from
  // ~a day before its peak converges on the same instant.
  try {
    const obs = new Astronomy.Observer(observer.latitude, observer.longitude, 0);
    const searchStart = new Date(global.peakUtc.getTime() - 36 * 60 * 60 * 1000);
    const local = Astronomy.SearchLocalSolarEclipse(searchStart, obs);
    const toleranceMs = 24 * 60 * 60 * 1000;
    return { global, visibleAtObserver: Math.abs(local.peak.time.date.getTime() - global.peakUtc.getTime()) < toleranceMs };
  } catch {
    return { global, visibleAtObserver: false };
  }
}

/** All eclipses within [baseDate, baseDate + limitDays], ascending — callers map to their event shape. */
export function buildUpcomingEclipseEvents(baseDate: Date, limitDays: number, maxEvents = 8): EclipseKindInfo[] {
  const limitMs = baseDate.getTime() + limitDays * 24 * 60 * 60 * 1000;
  const found: EclipseKindInfo[] = [];
  let cursor = new Date(baseDate.getTime());
  for (let i = 0; i < MAX_SEARCH_ITERATIONS * 2 && found.length < maxEvents; i++) {
    const solar = findNextGlobalSolarEclipse(cursor);
    const lunar = findNextGlobalLunarEclipse(cursor);
    const next = !solar ? lunar : !lunar ? solar : solar.peakUtc <= lunar.peakUtc ? solar : lunar;
    if (!next || next.peakUtc.getTime() > limitMs) break;
    found.push(next);
    cursor = new Date(next.peakUtc.getTime() + 24 * 60 * 60 * 1000);
  }
  return found;
}
