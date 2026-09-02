import type { SchumannFrequencyPoint, SchumannObservation } from "./types";

// Provider contract: its SR series is modelled. NOAA Kp is a distinct measured
// domain and must never be collapsed into one synthetic "energy" score.
export const SCHUMANN_API_URL = "https://schumannresonancelive.com/api/data.php";
export const SCHUMANN_POLL_MIN_INTERVAL_MS = 90 * 1000;
export const SCHUMANN_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SCHUMANN_MAX_OBSERVATIONS = 1000;
export const SCHUMANN_STALE_MS = 30 * 60 * 1000;

export interface RawSchumannApiResponse {
  updated?: string;
  status?: { key?: string; label?: string };
  intensity?: number;
  amplitude?: number;
  power?: number;
  frequencies?: Array<{ id?: string; value?: number; nominal?: number }>;
}

const SR_IDS = ["SR1", "SR2", "SR3", "SR4", "SR5"] as const;
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const bounded = (value: unknown, min: number, max: number): value is number => finite(value) && value >= min && value <= max;

export function normalizeSchumannResponse(raw: RawSchumannApiResponse, fetchedAt = new Date()) {
  const updatedAtIso = raw.updated && !Number.isNaN(Date.parse(raw.updated))
    ? new Date(raw.updated).toISOString()
    : fetchedAt.toISOString();
  const t = Date.parse(updatedAtIso);
  const map = new Map<string, { value?: number; nominal?: number }>();
  for (const item of Array.isArray(raw.frequencies) ? raw.frequencies : []) {
    if (!item?.id) continue;
    map.set(String(item.id).toUpperCase(), {
      value: bounded(item.value, 0, 100) ? item.value : undefined,
      nominal: bounded(item.nominal, 0, 100) ? item.nominal : undefined,
    });
  }
  const frequencies: SchumannFrequencyPoint[] = SR_IDS.map((id) => ({
    id,
    valueHz: map.get(id)?.value,
    nominalHz: map.get(id)?.nominal,
  }));
  return {
    observation: {
      t,
      f: frequencies.map((item) => item.valueHz ?? null),
      a: bounded(raw.amplitude, 0, 1_000_000) ? raw.amplitude : undefined,
      p: bounded(raw.power, 0, 1_000_000_000) ? raw.power : undefined,
      s: raw.status?.key,
    } satisfies SchumannObservation,
    updatedAtIso,
    statusKey: raw.status?.key,
    statusLabel: raw.status?.label,
    intensity: bounded(raw.intensity, 0, 10) ? raw.intensity : undefined,
    amplitudePicoTesla: bounded(raw.amplitude, 0, 1_000_000) ? raw.amplitude : undefined,
    powerGwKm2: bounded(raw.power, 0, 1_000_000_000) ? raw.power : undefined,
    frequencies,
    stale: Date.now() - t > SCHUMANN_STALE_MS,
  };
}

export function accumulateSchumannObservation(
  buffer: SchumannObservation[],
  observation: SchumannObservation,
  now = Date.now(),
): SchumannObservation[] {
  if (!Number.isFinite(observation.t)) return buffer;
  const merged = [...buffer];
  const duplicate = merged.findIndex((item) => Math.abs(item.t - observation.t) < 45 * 1000);
  if (duplicate >= 0) merged[duplicate] = observation;
  else merged.push(observation);
  return merged
    .filter((item) => item.t >= now - SCHUMANN_WINDOW_MS)
    .sort((left, right) => left.t - right.t)
    .slice(-SCHUMANN_MAX_OBSERVATIONS);
}

export interface SchumannWindowStats {
  hoursAvailable: number;
  observationCount: number;
  firstT: number | null;
  lastT: number | null;
}

export function computeSchumannWindow(buffer: SchumannObservation[], now = Date.now()): SchumannWindowStats {
  const observations = buffer
    .filter((item) => Number.isFinite(item.t) && item.t >= now - SCHUMANN_WINDOW_MS)
    .sort((left, right) => left.t - right.t);
  if (observations.length === 0) {
    return { hoursAvailable: 0, observationCount: 0, firstT: null, lastT: null };
  }
  const firstT = observations[0].t;
  const lastT = observations[observations.length - 1].t;
  return {
    hoursAvailable: Math.max(0, Math.round(((lastT - firstT) / 3_600_000) * 10) / 10),
    observationCount: observations.length,
    firstT,
    lastT,
  };
}

export function kpActivityLabel(kp: number): string {
  if (kp < 2) return "Tenang";
  if (kp < 3) return "Aktivitas ringan";
  if (kp < 5) return "Aktif";
  if (kp < 7) return "Badai geomagnetik";
  return "Badai kuat";
}

export interface RawNoaaKpRow { time_tag?: string; Kp?: number }

export function normalizeNoaaKp(rows: RawNoaaKpRow[]): { kpIndex?: number; observedAtIso?: string } {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (!row || !bounded(row.Kp, 0, 9) || !row.time_tag || Number.isNaN(Date.parse(row.time_tag))) continue;
    const timestamp = row.time_tag.endsWith("Z") ? row.time_tag : `${row.time_tag}Z`;
    return { kpIndex: row.Kp, observedAtIso: new Date(timestamp).toISOString() };
  }
  return {};
}

export type SchumannUiStateKind = "full" | "partial" | "snapshot" | "stale" | "none";

export interface SchumannUiState {
  kind: SchumannUiStateKind;
  hoursAvailable: number;
  observationCount: number;
  startedAtIso?: string;
  minutesAvailable?: number;
}

export function resolveSchumannUiState(
  schumann: { updatedAtIso?: string; stale?: boolean } | undefined,
  buffer: SchumannObservation[],
  now = Date.now(),
): SchumannUiState {
  const stats = computeSchumannWindow(buffer, now);
  const updatedAt = schumann?.updatedAtIso ? Date.parse(schumann.updatedAtIso) : Number.NaN;
  const lastT = Number.isFinite(updatedAt) ? updatedAt : stats.lastT ?? Number.NaN;
  if (!Number.isFinite(lastT)) return { kind: "none", hoursAvailable: 0, observationCount: 0 };
  const base = {
    hoursAvailable: stats.hoursAvailable,
    observationCount: stats.observationCount,
    startedAtIso: stats.firstT ? new Date(stats.firstT).toISOString() : undefined,
  };
  if (schumann?.stale === true || now - lastT > SCHUMANN_STALE_MS) return { kind: "stale", ...base };
  if (stats.observationCount >= 2 && stats.hoursAvailable >= 23) {
    return { kind: "full", hoursAvailable: stats.hoursAvailable, observationCount: stats.observationCount };
  }
  if (stats.observationCount >= 2 && stats.hoursAvailable >= 0.1) return { kind: "partial", ...base };
  return {
    kind: "snapshot",
    ...base,
    minutesAvailable: stats.firstT ? Math.max(0, Math.round(((now - stats.firstT) / 60_000) * 10) / 10) : 0,
  };
}

export function formatSchumannLocalTimestamp(
  iso: string | undefined,
  profileTimezone?: string | null,
  browserTimezone?: string,
  locale = "id-ID",
): string {
  if (!iso || Number.isNaN(Date.parse(iso))) return "";
  let timezone = profileTimezone ?? browserTimezone ?? null;
  if (!timezone && typeof Intl !== "undefined") {
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? null; } catch { timezone = null; }
  }
  try {
    return new Intl.DateTimeFormat(locale, {
      timeZone: timezone || "UTC",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
