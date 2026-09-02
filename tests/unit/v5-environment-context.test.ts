import { translations } from "../../lib/data/translations";
import { buildAIEnvironmentContext, buildEnvironmentSpiritualReading, deriveEnvironmentBands } from "../../lib/environment/context_utils";
import {
  accumulateSchumannObservation,
  computeSchumannWindow,
  formatSchumannLocalTimestamp,
  kpActivityLabel,
  normalizeNoaaKp,
  normalizeSchumannResponse,
  resolveSchumannUiState,
  type RawSchumannApiResponse,
} from "../../lib/environment/schumann";
import { getNormalizedEnvironment } from "../../lib/environment/service";
import type { EnvironmentContext } from "../../lib/environment/types";

let passed = 0;
let failed = 0;
function test(label: string, condition: boolean) {
  if (condition) { passed += 1; console.log(`PASS: ${label}`); }
  else { failed += 1; console.error(`FAIL: ${label}`); }
}

const SAMPLE: RawSchumannApiResponse = {
  updated: "2026-08-24T09:50:05Z",
  status: { key: "Elevated", label: "Elevated" },
  intensity: 1.5,
  amplitude: 34.34,
  power: 141.4,
  frequencies: [
    { id: "SR1", value: 7.74, nominal: 7.83 },
    { id: "SR2", value: 14.26, nominal: 14.3 },
    { id: "SR3", value: 20.59, nominal: 20.8 },
    { id: "SR4", value: 26.97, nominal: 27.3 },
    { id: "SR5", value: 34.38, nominal: 33.8 },
  ],
};

const normalized = normalizeSchumannResponse(SAMPLE);
test("Schumann timestamp remains source ISO", normalized.updatedAtIso === "2026-08-24T09:50:05.000Z");
test("Schumann SR1..SR5 stay ordered", normalized.frequencies.length === 5 && normalized.frequencies[0].id === "SR1" && normalized.frequencies[4].id === "SR5");
test("Schumann observation preserves finite values", normalized.observation.f[0] === 7.74 && normalized.observation.a === 34.34 && normalized.observation.p === 141.4);
const nonFinite = normalizeSchumannResponse({ ...SAMPLE, intensity: Number.NaN, amplitude: Number.POSITIVE_INFINITY, frequencies: [{ id: "SR1", value: Number.NaN }] });
test("Schumann rejects non-finite provider values", nonFinite.intensity === undefined && nonFinite.amplitudePicoTesla === undefined && nonFinite.frequencies[0].valueHz === undefined);

const now = Date.parse("2026-08-24T10:00:00Z");
const observation = (hoursAgo: number) => ({
  t: now - hoursAgo * 3_600_000,
  f: [7.8, null, null, null, null],
  a: 35,
  p: 140,
  s: "Elevated",
});
let buffer = accumulateSchumannObservation([], observation(5), now);
buffer = accumulateSchumannObservation(buffer, observation(0), now);
test("Schumann buffer accumulates distinct observations", buffer.length === 2);
buffer = accumulateSchumannObservation(buffer, { ...observation(0), t: now + 10_000 }, now);
test("Schumann near replay replaces idempotently", buffer.length === 2 && buffer[1].t === now + 10_000);
test("Schumann window reports honest span", computeSchumannWindow(buffer, now + 10_000).hoursAvailable === 5);
test("Schumann empty window remains zero", computeSchumannWindow([], now).hoursAvailable === 0);

test("NOAA Kp bands remain distinct", kpActivityLabel(1) === "Tenang" && kpActivityLabel(4) === "Aktif" && kpActivityLabel(6) === "Badai geomagnetik");
const noaa = normalizeNoaaKp([{ time_tag: "2026-08-24T06:00:00", Kp: 1 }, { time_tag: "2026-08-24T09:00:00", Kp: 2.33 }]);
test("NOAA latest valid Kp wins with UTC provenance", noaa.kpIndex === 2.33 && noaa.observedAtIso === "2026-08-24T09:00:00.000Z");
test("NOAA rejects non-finite or out-of-range Kp", normalizeNoaaKp([{ time_tag: "2026-08-24T09:00:00", Kp: Number.NaN }, { time_tag: "2026-08-24T10:00:00", Kp: 12 }]).kpIndex === undefined);

const baseContext = (kp?: number, statusKey?: string, intensity?: number): EnvironmentContext => ({
  dateKey: "2026-08-24",
  fetchedAt: "2026-08-24T10:00:00Z",
  location: { coordinates: { latitude: 0, longitude: 0 }, source: { source: "device_gps", status: "available", observedAt: "2026-08-24T10:00:00Z" } },
  spaceWeather: typeof kp === "number" ? { kpIndex: kp, source: { source: "noaa_space_weather", status: "available", observedAt: "2026-08-24T09:00:00Z" } } : undefined,
  schumann: { frequencies: [], provenance: "modelled-series", stale: false, statusKey, intensity, source: { source: "schumann_resonance_live", status: "available", observedAt: "2026-08-24T09:50:05Z" } },
});
test("Missing environment data derives quiet, not an invented state", deriveEnvironmentBands(baseContext()).geomagnetic === "quiet" && deriveEnvironmentBands(baseContext()).schumann === "quiet");
test("NOAA storm and Schumann active remain separate bands", deriveEnvironmentBands(baseContext(6, "Elevated")).geomagnetic === "storm" && deriveEnvironmentBands(baseContext(6, "Elevated")).schumann === "active");

const dictionary = {
  spiritQuiet: "spirit quiet", spiritMild: "spirit mild", spiritActive: "spirit active", spiritStorm: "spirit storm",
  obsNoteQuiet: "observed quiet", obsNoteMild: "observed mild", obsNoteActive: "observed active", obsNoteStorm: "observed storm",
  practiceQuiet: "practice quiet", practiceMild: "practice mild", practiceActive: "practice active", practiceStorm: "practice storm",
  interpNote: "non-deterministic",
};
const reading = buildEnvironmentSpiritualReading({ geomagnetic: "storm", schumann: "quiet" }, dictionary);
test("Layered reading maps observation, worldview, and practice", reading.observationNote === "observed storm" && reading.reading === "spirit storm" && reading.practice === "practice storm");
test("Layered reading retains disclaimer", reading.note === "non-deterministic");

test("Schumann none state is explicit", resolveSchumannUiState(undefined, [], now).kind === "none");
const snapshot = resolveSchumannUiState({ updatedAtIso: new Date(now - 120_000).toISOString(), stale: false }, [observation(2 / 60)], now);
test("Schumann snapshot never claims 24 hours", snapshot.kind === "snapshot" && snapshot.hoursAvailable === 0 && Math.round(snapshot.minutesAvailable || 0) === 2);
test("Schumann partial window reports actual hours", resolveSchumannUiState({ updatedAtIso: new Date(now).toISOString(), stale: false }, [observation(5), observation(0)], now).kind === "partial");
test("Schumann full requires at least 23 hours", resolveSchumannUiState({ updatedAtIso: new Date(now).toISOString(), stale: false }, [observation(23.5), observation(0)], now).kind === "full");
test("Schumann stale state is explicit", resolveSchumannUiState({ updatedAtIso: new Date(now - 2_700_000).toISOString(), stale: true }, [observation(0.75)], now).kind === "stale");
test("Schumann timestamp honors requested locale and timezone", formatSchumannLocalTimestamp("2026-08-24T09:50:05Z", "Asia/Jakarta", undefined, "en-US").includes("4:50 PM"));

const idEnvironment = translations.id.environment;
test("Model disclosure is present", /model/i.test(idEnvironment.disclosureModel));
test("Indonesian interpretation disclaims deterministic causation", /bukan/i.test(idEnvironment.interpNote) && /deterministik/i.test(idEnvironment.interpNote));
test("Unavailable copy is explicit", idEnvironment.unavailable === "Data belum tersedia");

const storage = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    setTimeout,
    clearTimeout,
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  },
});
Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: async () => ({ ok: false, json: async () => ({}) }),
});

async function verifyServiceFailClosed() {
  const unavailable = await getNormalizedEnvironment({
    coordinates: { latitude: -6.2, longitude: 106.8 },
    timezone: "Asia/Jakarta",
    source: { source: "device_gps", status: "available", observedAt: "2026-08-24T10:00:00Z" },
  });
  test("USGS outage never fabricates Stabil", unavailable.earthActivity?.dataState === "unavailable" && unavailable.earthActivity.status === "");
  test("Unavailable remote domains retain source provenance", unavailable.weather?.source.status === "unavailable" && unavailable.airQuality?.source.status === "unavailable" && unavailable.spaceWeather?.source.status === "unavailable" && unavailable.schumann?.source.status === "unavailable");
  test("Local astronomy domains retain astronomy-engine provenance", unavailable.astronomy?.source.source === "astronomy_api" && unavailable.moon?.source.source === "astronomy_api" && unavailable.circadian?.source.source === "astronomy_api");
  test("AI bridge does not emit earth_stable for unavailable USGS", !buildAIEnvironmentContext(unavailable).cautionFlags.includes("earth_stable"));
  test("AI bridge keeps NOAA and Schumann fields separate", "kpIndex" in buildAIEnvironmentContext(unavailable) && "schumannProvenance" in buildAIEnvironmentContext(unavailable));

  console.log(`\nV5_ENVIRONMENT_TESTS: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

verifyServiceFailClosed().catch((error) => {
  console.error(error);
  process.exit(1);
});
