"use client";

import * as Astronomy from "astronomy-engine";
import {
  SCHUMANN_API_URL,
  SCHUMANN_MAX_OBSERVATIONS,
  SCHUMANN_POLL_MIN_INTERVAL_MS,
  SCHUMANN_STALE_MS,
  SCHUMANN_WINDOW_MS,
  accumulateSchumannObservation,
  computeSchumannWindow,
  kpActivityLabel,
  normalizeNoaaKp,
  normalizeSchumannResponse,
  type RawSchumannApiResponse,
} from "./schumann";
import type {
  EnvironmentContext,
  EnvironmentDataSource,
  EnvironmentLocation,
  SchumannFrequencyPoint,
  SchumannObservation,
} from "./types";

export type {
  EarthActivityDataState,
  EnvironmentAirQuality,
  EnvironmentAstronomy,
  EnvironmentCircadian,
  EnvironmentContext,
  EnvironmentCoordinates,
  EnvironmentDataSource,
  EnvironmentEarthActivity,
  EnvironmentLocation,
  EnvironmentMoon,
  EnvironmentSchumann,
  EnvironmentSourceMeta,
  EnvironmentSourceStatus,
  EnvironmentSpaceWeather,
  EnvironmentWeather,
  SchumannObservation,
} from "./types";

const WEATHER_CODES: Record<number, string> = {
  0: "Cerah",
  1: "Cerah Berawan",
  2: "Berawan",
  3: "Mendung",
  45: "Berkabut",
  48: "Kabut Rime",
  51: "Gerimis Ringan",
  53: "Gerimis",
  55: "Gerimis Lebat",
  61: "Hujan Ringan",
  63: "Hujan",
  65: "Hujan Lebat",
  71: "Salju Ringan",
  73: "Salju",
  75: "Salju Lebat",
  80: "Hujan Ringan",
  81: "Hujan Sedang",
  82: "Hujan Lebat",
  95: "Badai Petir",
};

export function getAqiLabel(aqiValue: number): string {
  if (aqiValue <= 50) return "Baik";
  if (aqiValue <= 100) return "Sedang";
  if (aqiValue <= 150) return "Kurang sehat untuk kelompok sensitif";
  if (aqiValue <= 200) return "Tidak sehat";
  if (aqiValue <= 300) return "Sangat tidak sehat";
  return "Berbahaya";
}

export function getUvLabel(uv: number): string {
  if (uv <= 2) return "Rendah";
  if (uv <= 5) return "Sedang";
  if (uv <= 7) return "Tinggi";
  if (uv <= 10) return "Sangat Tinggi";
  return "Ekstrem";
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getCircadianStatus(): { status: string; label: string } {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 6) return { status: "Dawn", label: "Fajar" };
  if (hour >= 6 && hour < 11) return { status: "Morning", label: "Pagi" };
  if (hour >= 11 && hour < 13) return { status: "Midday", label: "Siang" };
  if (hour >= 13 && hour < 17) return { status: "Afternoon", label: "Sore" };
  if (hour >= 17 && hour < 19) return { status: "Evening", label: "Petang" };
  return { status: "Night", label: "Malam" };
}

export function getMoonPhaseLabel(phaseAngle: number): string {
  const normalized = ((phaseAngle % 360) + 360) % 360;
  if (normalized < 7.5 || normalized >= 352.5) return "Bulan Baru";
  if (normalized < 82.5) return "Sabit Muda";
  if (normalized < 97.5) return "Kuartal Pertama";
  if (normalized < 172.5) return "Cembung Awal";
  if (normalized < 187.5) return "Purnama";
  if (normalized < 262.5) return "Cembung Akhir";
  if (normalized < 277.5) return "Kuartal Akhir";
  return "Sabit Tua";
}

export function normalizeMoonPhaseLabel(input: string | null | undefined): string {
  if (!input) return "Belum tersedia";
  const clean = input.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (clean.includes("newmoon") || clean === "bulanbaru") return "Bulan Baru";
  if (clean.includes("waxingcrescent") || clean === "sabitmuda") return "Sabit Muda";
  if (clean.includes("firstquarter") || clean === "kuartalpertama") return "Kuartal Pertama";
  if (clean.includes("waxinggibbous") || clean.includes("benjolmuda") || clean === "cembungawal") return "Cembung Awal";
  if (clean.includes("fullmoon") || clean === "purnama" || clean === "bulanpurnama") return "Purnama";
  if (clean.includes("waninggibbous") || clean.includes("benjoltua") || clean === "cembungakhir") return "Cembung Akhir";
  if (clean.includes("lastquarter") || clean === "kuartalakhir" || clean === "kuartalterakhir") return "Kuartal Akhir";
  if (clean.includes("waningcrescent") || clean === "sabittua") return "Sabit Tua";
  return input;
}

async function fetchWithTimeout(url: string, timeoutMs = 6000, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchReverseGeocode(lat: number, lon: number): Promise<Partial<EnvironmentLocation>> {
  try {
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`,
      4000,
    );
    if (!res.ok) return {};
    const data = await res.json();
    return {
      cityOrRegency: data.city || data.locality || data.principalSubdivision,
      province: data.principalSubdivision,
      country: data.countryName,
    };
  } catch {
    return {};
  }
}

const ENV_CACHE_PREFIX = "bhumi:env:";

function safeReadEnvCache(key: string): EnvironmentContext | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ENV_CACHE_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !parsed.fetchedAt) return null;
    const ageMs = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (!Number.isFinite(ageMs) || ageMs > 30 * 60 * 1000) return null;
    return parsed as EnvironmentContext;
  } catch {
    return null;
  }
}

function safeWriteEnvCache(key: string, ctx: EnvironmentContext): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ENV_CACHE_PREFIX + key, JSON.stringify(ctx));
  } catch {
    // ignore quota/serialization issues
  }
}

export function getCachedEnvironment(latitude: number, longitude: number): EnvironmentContext | null {
  const key = `${latitude.toFixed(3)}_${longitude.toFixed(3)}`;
  return safeReadEnvCache(key);
}

const SCHUMANN_BUFFER_KEY = "bhumi:env:schumann";
const SCHUMANN_LAST_FETCH_KEY = "bhumi:env:schumann:lastFetch";

function readSchumannBuffer(): SchumannObservation[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SCHUMANN_BUFFER_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    const now = Date.now();
    return parsed
      .filter((item: SchumannObservation) =>
        item && Number.isFinite(item.t) && Array.isArray(item.f) && item.t >= now - SCHUMANN_WINDOW_MS,
      )
      .map((item: SchumannObservation) => ({
        t: item.t,
        f: item.f.slice(0, 5).map((value) => typeof value === "number" && Number.isFinite(value) ? value : null),
        a: typeof item.a === "number" && Number.isFinite(item.a) && item.a >= 0 ? item.a : undefined,
        p: typeof item.p === "number" && Number.isFinite(item.p) && item.p >= 0 ? item.p : undefined,
        s: typeof item.s === "string" ? item.s : undefined,
      }))
      .sort((left: SchumannObservation, right: SchumannObservation) => left.t - right.t);
  } catch {
    return [];
  }
}

function readSchumannLastFetch(): number | null {
  if (typeof window === "undefined") return null;
  const value = Date.parse(window.localStorage.getItem(SCHUMANN_LAST_FETCH_KEY) || "");
  return Number.isFinite(value) ? value : null;
}

function writeSchumannBuffer(buffer: SchumannObservation[], fetchedAtIso: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCHUMANN_BUFFER_KEY, JSON.stringify(buffer.slice(-SCHUMANN_MAX_OBSERVATIONS)));
    window.localStorage.setItem(SCHUMANN_LAST_FETCH_KEY, fetchedAtIso);
  } catch {
    // Storage is an optional cache; an unavailable cache must not block the page.
  }
}

export function getSchumannSeries(): SchumannObservation[] {
  return readSchumannBuffer();
}

export async function getNormalizedEnvironment(location: EnvironmentLocation): Promise<EnvironmentContext> {
  const { latitude: lat, longitude: lon } = location.coordinates;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startTime = yesterday.toISOString();

  const ctx: EnvironmentContext = {
    dateKey: now.toISOString().split("T")[0],
    fetchedAt: now.toISOString(),
    location: { ...location },
  };

  const metaUnavailable = (source: EnvironmentDataSource, message = "Provider tidak dapat dijangkau saat ini.") =>
    ({ source, status: "unavailable" as const, observedAt: now.toISOString(), message });
  const metaAvailable = (source: EnvironmentDataSource) =>
    ({ source, status: "available" as const, observedAt: now.toISOString() });

  // Default empty shapes (UI-friendly).
  ctx.weather = { source: metaUnavailable("weather_api") };
  ctx.airQuality = { source: metaUnavailable("air_quality_api") };
  ctx.astronomy = { source: metaUnavailable("astronomy_api") };
  ctx.moon = { source: metaUnavailable("astronomy_api") };
  ctx.earthActivity = {
    status: "",
    dataState: "unavailable",
    fallbackCopy: "Data seismic belum tersedia.",
    source: metaUnavailable("usgs"),
  };
  ctx.spaceWeather = { source: metaUnavailable("noaa_space_weather") };
  ctx.schumann = {
    frequencies: [],
    provenance: "modelled-series",
    stale: true,
    source: metaUnavailable("schumann_resonance_live"),
  };

  // Each task is wrapped with a hard timeout so the slowest API never blocks the page.
  // We fire-and-forget then patch the ctx as each task resolves.
  const tasks: Array<Promise<void>> = [];

  tasks.push(
    fetchReverseGeocode(lat, lon).then((geo) => {
      if (geo) ctx.location = { ...ctx.location, ...geo };
    }).catch(() => undefined),
  );

  tasks.push(
    (async () => {
      const res = await fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,precipitation,uv_index,cloud_cover&daily=uv_index_max&timezone=auto`,
        5000,
      ).catch(() => null);
      if (!res || !res.ok) return;
      try {
        const data = await res.json();
        const current = data.current || {};
        const daily = data.daily || {};
        const uvMax = Array.isArray(daily.uv_index_max) ? daily.uv_index_max[0] : undefined;
        ctx.weather = {
          condition: current.weather_code !== undefined ? (WEATHER_CODES[current.weather_code] || "Cerah") : "Cerah",
          temperatureCelsius: current.temperature_2m,
          feelsLikeCelsius: current.apparent_temperature,
          humidityPercent: current.relative_humidity_2m,
          pressureHpa: current.surface_pressure,
          windSpeedKph: current.wind_speed_10m,
          cloudCoverPercent: current.cloud_cover,
          rainProbabilityPercent: current.precipitation > 0 ? 100 : 0,
          precipitationMm: current.precipitation,
          uvCurrent: current.uv_index,
          uvMaxToday: uvMax,
          uvLabel: typeof current.uv_index === "number" ? getUvLabel(current.uv_index) : undefined,
          source: metaAvailable("weather_api"),
        };
      } catch (parseError) {
        console.warn("[Environment] Weather parse failed:", parseError);
      }
    })(),
  );

  tasks.push(
    (async () => {
      const res = await fetchWithTimeout(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide`,
        5000,
      ).catch(() => null);
      if (!res || !res.ok) return;
      try {
        const data = await res.json();
        const current = data.current || {};
        ctx.airQuality = {
          aqi: current.us_aqi,
          label: typeof current.us_aqi === "number" ? getAqiLabel(current.us_aqi) : undefined,
          pm25: current.pm2_5,
          pm10: current.pm10,
          ozone: current.ozone,
          no2: current.nitrogen_dioxide,
          so2: current.sulphur_dioxide,
          co: current.carbon_monoxide,
          uvIndex: current.uv_index !== undefined && current.uv_index !== null ? current.uv_index : ctx.weather?.uvCurrent,
          source: metaAvailable("air_quality_api"),
        };
      } catch (parseError) {
        console.warn("[Environment] Air-quality parse failed:", parseError);
      }
    })(),
  );

  tasks.push(
    (async () => {
      const res = await fetchWithTimeout(
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&latitude=${lat}&longitude=${lon}&maxradiuskm=150&minmagnitude=2.0&orderby=time`,
        5000,
      ).catch(() => null);
      if (!res || !res.ok) return;
      try {
        const data = await res.json();
        const features = Array.isArray(data.features) ? data.features : [];
        ctx.earthActivity = {
          status: features.length > 0 ? "Ada aktivitas terdekat" : "Stabil",
          dataState: "available",
          eventCount: features.length,
          fallbackCopy: features.length > 0 ? undefined : "Tidak ada aktivitas gempa terdeteksi dalam radius terdekat saat ini.",
          source: metaAvailable("usgs"),
        };
        if (features.length > 0) {
          const latest = features[0];
          const [eqLon, eqLat, eqDepth] = latest.geometry?.coordinates || [];
          ctx.earthActivity.latestEarthquake = {
            title: latest.properties?.place,
            magnitude: latest.properties?.mag,
            depthKm: eqDepth,
            distanceKm: Math.round(haversineDistance(lat, lon, eqLat, eqLon)),
            occurredAt: latest.properties?.time ? new Date(latest.properties.time).toISOString() : undefined,
          };
        }
      } catch (parseError) {
        console.warn("[Environment] Earthquake parse failed:", parseError);
      }
    })(),
  );

  tasks.push(
    (async () => {
      const response = await fetchWithTimeout(
        "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
        5000,
      ).catch(() => null);
      if (!response?.ok) return;
      try {
        const rows = (await response.json()) as Array<{ time_tag?: string; Kp?: number }>;
        const normalized = normalizeNoaaKp(rows);
        if (typeof normalized.kpIndex !== "number") return;
        ctx.spaceWeather = {
          kpIndex: normalized.kpIndex,
          geomagneticActivity: kpActivityLabel(normalized.kpIndex),
          source: {
            source: "noaa_space_weather",
            status: "available",
            observedAt: normalized.observedAtIso ?? now.toISOString(),
          },
        };
      } catch (error) {
        console.warn("[Environment] NOAA Kp parse failed:", error);
      }
    })(),
  );

  tasks.push(
    (async () => {
      const buffer = readSchumannBuffer();
      const last = buffer.at(-1);
      const lastFetch = readSchumannLastFetch();
      let working = buffer;
      const cacheWindowActive = Boolean(last) && lastFetch !== null && Date.now() - lastFetch < SCHUMANN_POLL_MIN_INTERVAL_MS;
      if (!cacheWindowActive) {
        try {
          const response = await fetchWithTimeout(SCHUMANN_API_URL, 5000, { cache: "no-store" }).catch(() => null);
          if (response?.ok) {
            const normalized = normalizeSchumannResponse((await response.json()) as RawSchumannApiResponse, new Date());
            const hasObservation = normalized.frequencies.some((item) => typeof item.valueHz === "number")
              || typeof normalized.intensity === "number"
              || typeof normalized.amplitudePicoTesla === "number"
              || typeof normalized.powerGwKm2 === "number";
            if (hasObservation) {
              working = accumulateSchumannObservation(buffer, normalized.observation);
              writeSchumannBuffer(working, new Date().toISOString());
              ctx.schumann = {
              statusKey: normalized.statusKey,
              statusLabel: normalized.statusLabel,
              intensity: normalized.intensity,
              amplitudePicoTesla: normalized.amplitudePicoTesla,
              powerGwKm2: normalized.powerGwKm2,
              frequencies: normalized.frequencies,
              updatedAtIso: normalized.updatedAtIso,
              provenance: "modelled-series",
              stale: normalized.stale,
              source: {
                source: "schumann_resonance_live",
                status: "available",
                observedAt: normalized.updatedAtIso,
              },
              };
            }
          }
        } catch (error) {
          console.warn("[Environment] Schumann fetch failed:", error);
        }
      }
      const fallback = working.at(-1) ?? last;
      if (ctx.schumann?.source.status !== "available" && fallback) {
        ctx.schumann = {
          frequencies: fallback.f.map((value, index) => ({
            id: `SR${index + 1}` as SchumannFrequencyPoint["id"],
            valueHz: value ?? undefined,
          })),
          amplitudePicoTesla: fallback.a,
          powerGwKm2: fallback.p,
          statusKey: fallback.s,
          updatedAtIso: new Date(fallback.t).toISOString(),
          provenance: "modelled-series",
          stale: Date.now() - fallback.t > SCHUMANN_STALE_MS,
          source: {
            source: "schumann_resonance_live",
            status: cacheWindowActive ? "available" : "unavailable",
            observedAt: new Date(fallback.t).toISOString(),
            message: cacheWindowActive ? "Cached within provider polling interval." : "Live fetch unavailable; showing last observation.",
          },
        };
      }
      if (ctx.schumann) {
        const stats = computeSchumannWindow(working);
        ctx.schumann.accumulatedHours = stats.hoursAvailable;
        ctx.schumann.observationCount = stats.observationCount;
      }
    })(),
  );

  // Wait for all tasks but each is bounded by its own timeout — total worst-case ~5s.
  await Promise.all(tasks);

  const circadian = getCircadianStatus();
  ctx.circadian = {
    status: circadian.status,
    label: circadian.label,
    basedOn: "local time",
    source: metaAvailable("astronomy_api"),
  };

  // Sun timing is computed locally from coordinates with astronomy-engine.
  try {
    const observer = new Astronomy.Observer(lat, lon, location.elevationMeters ?? 0);
    const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, 1, now, 1);
    const sunset = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, now, 1);
    const formatTime = (value: Astronomy.AstroTime | null) => value
      ? value.date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : undefined;
    const sunriseLabel = formatTime(sunrise);
    const sunsetLabel = formatTime(sunset);
    ctx.astronomy = {
      sunrise: sunriseLabel,
      sunset: sunsetLabel,
      subtitle: sunriseLabel && sunsetLabel
        ? `Terbit ${sunriseLabel} · Terbenam ${sunsetLabel}`
        : "Siklus matahari belum tersedia.",
      source: metaAvailable("astronomy_api"),
    };
  } catch (error) {
    console.warn("[Environment] Sun timing calculation failed:", error);
  }

  // Moon data is computed locally via astronomy-engine (offline-friendly).
  try {
    const moonPhaseAngle = Astronomy.MoonPhase(now);
    const illumination = Astronomy.Illumination(Astronomy.Body.Moon, now);
    ctx.moon = {
      phase: getMoonPhaseLabel(moonPhaseAngle),
      illuminationPercent: Math.round(illumination.phase_fraction * 100),
      source: metaAvailable("astronomy_api"),
    };
  } catch (e) {
    console.error("Failed to calculate moon phase", e);
  }

  // Cache successful responses (with at least weather or moon data) for fast re-open.
  if (ctx.weather?.source?.status === "available" || ctx.moon?.source?.status === "available") {
    safeWriteEnvCache(`${lat.toFixed(3)}_${lon.toFixed(3)}`, ctx);
  }

  return ctx;
}

export {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  type EnvironmentPermissionState
} from "./geolocation";
