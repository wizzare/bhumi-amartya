/**
 * Schumann Resonance LIVE gate — SR1-only measured-value policy.
 *
 * Data-integrity rules (Founder decision, Build 110):
 * 1. Only a genuinely measured SR1 value may be displayed as a live measurement.
 * 2. Nominal/reference SR2–SR5 must NEVER be displayed as live measured values.
 * 3. 7.83 Hz may only appear as the labelled nominal fundamental
 *    ("Frekuensi fundamental nominal: sekitar 7,83 Hz"), never as a live reading.
 * 4. No health / spiritual / "energy portal" / sleep / migraine claims may be
 *    generated from Schumann measurements.
 * 5. Fail closed: endpoint failure, missing timestamp, stale data, or missing
 *    measured SR1 → hide the live card (single compact degraded state at most).
 *
 * Provider contract (SchumannResonanceLive, stated terms):
 * - JSON API, no API key, CC0.
 * - 90-second server cache → client poll interval must be >= 90 s.
 * - SR1 derived/measured from the Tomsk SOS-70 spectrogram.
 */

export const SCHUMANN_SR1_ONLY_POLICY = "measured-sr1-only" as const;

export const SCHUMANN_NOMINAL_FUNDAMENTAL_LABEL =
  "Frekuensi fundamental nominal: sekitar 7,83 Hz";

export const SCHUMANN_STALE_THRESHOLD_MS = 30 * 60 * 1000;

export const SCHUMANN_MIN_POLL_INTERVAL_MS = 90 * 1000;

export interface SchumannLiveVerification {
  httpStatus: number | null;
  contentType: string | null;
  timestampPresent: boolean;
  timestampIso: string | null;
  sr1Present: boolean;
  sr1Measured: boolean;
  sr1ValueHz: number | null;
  license: string | null;
  stale: boolean | null;
  live: boolean;
  failureReason: string | null;
}

export interface SchumannLiveCandidate {
  updated?: unknown;
  timestamp?: unknown;
  observedAt?: unknown;
  time?: unknown;
  license?: unknown;
  sr1?: unknown;
  frequencies?: unknown;
}

function firstFiniteNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0 && value < 100) {
      return value;
    }
  }
  return null;
}

function extractTimestampIso(candidate: SchumannLiveCandidate): string | null {
  for (const key of ["updated", "timestamp", "observedAt", "time"] as const) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim() && !Number.isNaN(Date.parse(value))) {
      return new Date(value).toISOString();
    }
  }
  return null;
}

function extractLicense(candidate: SchumannLiveCandidate): string | null {
  return typeof candidate.license === "string" && candidate.license.trim()
    ? candidate.license.trim()
    : null;
}

function extractSr1(candidate: SchumannLiveCandidate): { valueHz: number | null; measured: boolean } {
  // Accept only an explicitly measured SR1 slot. A bare "nominal" or
  // "reference" slot is NOT a measurement and must not pass the gate.
  if (candidate.sr1 !== undefined && candidate.sr1 !== null) {
    if (typeof candidate.sr1 === "number") {
      const valueHz = firstFiniteNumber(candidate.sr1);
      return { valueHz, measured: valueHz !== null };
    }
    if (typeof candidate.sr1 === "object") {
      const slot = candidate.sr1 as Record<string, unknown>;
      const explicitMeasured = slot.measured === true && slot.nominal !== true && slot.reference !== true;
      const valueHz = firstFiniteNumber(slot.value, slot.valueHz, slot.hz);
      return { valueHz, measured: explicitMeasured && valueHz !== null };
    }
  }
  if (Array.isArray(candidate.frequencies)) {
    for (const item of candidate.frequencies) {
      if (!item || typeof item !== "object") continue;
      const slot = item as Record<string, unknown>;
      const id = String(slot.id ?? slot.name ?? "").toUpperCase();
      if (id !== "SR1") continue;
      // STRICT: any nominal/reference marker disqualifies the slot outright.
      // A bare numeric SR1 without markers is treated as measured ONLY when the
      // provider contract independently confirms the feed carries measured SR1
      // (Tomsk extraction). Otherwise fail closed.
      if (slot.nominal === true || slot.reference === true || slot.measured === false) {
        return { valueHz: null, measured: false };
      }
      const valueHz = firstFiniteNumber(slot.value, slot.valueHz, slot.hz);
      if (valueHz !== null) return { valueHz, measured: true };
      return { valueHz: null, measured: false };
    }
  }
  return { valueHz: null, measured: false };
}

/**
 * Verifies a fetched Schumann payload against the SR1-only live gate.
 * Pure function — no network. Returns live:true ONLY when HTTP 2xx with a
 * JSON body, a parseable timestamp, a measured SR1 value, and a fresh
 * (non-stale) timestamp are all present simultaneously.
 */
export function verifySchumannLiveResponse(
  httpStatus: number | null,
  contentType: string | null,
  body: unknown,
  now = Date.now(),
): SchumannLiveVerification {
  const fail = (failureReason: string, partial?: Partial<SchumannLiveVerification>): SchumannLiveVerification => ({
    httpStatus,
    contentType,
    timestampPresent: false,
    timestampIso: null,
    sr1Present: false,
    sr1Measured: false,
    sr1ValueHz: null,
    license: null,
    stale: null,
    live: false,
    failureReason,
    ...partial,
  });

  if (httpStatus === null || httpStatus < 200 || httpStatus >= 300) {
    return fail("http-not-ok");
  }
  if (contentType !== null && !/application\/json/i.test(contentType)) {
    return fail("unexpected-content-type");
  }
  if (!body || typeof body !== "object") {
    return fail("invalid-body");
  }
  const candidate = body as SchumannLiveCandidate;
  const timestampIso = extractTimestampIso(candidate);
  if (!timestampIso) {
    return fail("timestamp-missing", { license: extractLicense(candidate) });
  }
  const license = extractLicense(candidate);
  const { valueHz, measured } = extractSr1(candidate);
  if (valueHz === null) {
    return fail("sr1-missing", { timestampPresent: true, timestampIso, license, stale: now - Date.parse(timestampIso) > SCHUMANN_STALE_THRESHOLD_MS });
  }
  if (!measured) {
    return fail("sr1-not-measured", {
      timestampPresent: true,
      timestampIso,
      license,
      sr1Present: true,
      stale: now - Date.parse(timestampIso) > SCHUMANN_STALE_THRESHOLD_MS,
    });
  }
  const stale = now - Date.parse(timestampIso) > SCHUMANN_STALE_THRESHOLD_MS;
  if (stale) {
    return fail("stale", {
      timestampPresent: true,
      timestampIso,
      license,
      sr1Present: true,
      sr1Measured: true,
      sr1ValueHz: valueHz,
      stale: true,
    });
  }
  return {
    httpStatus,
    contentType,
    timestampPresent: true,
    timestampIso,
    sr1Present: true,
    sr1Measured: true,
    sr1ValueHz: valueHz,
    license,
    stale: false,
    live: true,
    failureReason: null,
  };
}
