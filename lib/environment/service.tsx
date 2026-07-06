"use client";

import * as Astronomy from "astronomy-engine";

export type EnvironmentDataSource =
  | "device_gps"
  | "weather_api"
  | "air_quality_api"
  | "astronomy_api"
  | "bmkg"
  | "usgs"
  | "noaa_space_weather";

export type EnvironmentSourceStatus = "available" | "unavailable" | "permission_denied" | "not_configured" | "error";

export interface EnvironmentSourceMeta {
  source: EnvironmentDataSource;
  status: EnvironmentSourceStatus;
  observedAt: string;
  message?: string;
}

export interface EnvironmentCoordinates {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
}

export interface EnvironmentLocation {
  coordinates: EnvironmentCoordinates;
  country?: string;
  province?: string;
  cityOrRegency?: string;
  locality?: string;
  district?: string;
  timezone?: string;
  formattedCoordinates?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentWeather {
  condition?: string;
  temperatureCelsius?: number;
  feelsLikeCelsius?: number;
  humidityPercent?: number;
  pressureHpa?: number;
  windSpeedKph?: number;
  windDirection?: string;
  visibilityKm?: number;
  cloudCoverPercent?: number;
  rainProbabilityPercent?: number;
  precipitationMm?: number;
  uvCurrent?: number;
  uvMaxToday?: number;
  uvLabel?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentAirQuality {
  aqi?: number;
  label?: string;
  pm25?: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  so2?: number;
  co?: number;
  uvIndex?: number;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentAstronomy {
  sunrise?: string;
  sunset?: string;
  solarNoon?: string;
  dayLength?: string;
  goldenHour?: string;
  blueHour?: string;
  sunSign?: string;
  subtitle?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentMoon {
  phase?: string;
  illuminationPercent?: number;
  moonAgeDays?: number;
  moonrise?: string;
  moonset?: string;
  subtitle?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentEarthActivity {
  status: string;
  latestEarthquake?: {
    title?: string;
    magnitude?: number;
    depthKm?: number;
    distanceKm?: number;
    occurredAt?: string;
    place?: string;
    time?: string;
  };
  eventCount?: number;
  fallbackCopy?: string;
  source: EnvironmentSourceMeta;
}

export interface EnvironmentCircadian {
  status: string;
  label: string;
  basedOn: string;
}

export interface EnvironmentContext {
  dateKey: string;
  fetchedAt: string;
  location: EnvironmentLocation;
  weather?: EnvironmentWeather;
  airQuality?: EnvironmentAirQuality;
  astronomy?: EnvironmentAstronomy;
  moon?: EnvironmentMoon;
  earthActivity?: EnvironmentEarthActivity;
  circadian?: EnvironmentCircadian;
}

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
  ctx.astronomy = { source: metaUnavailable("weather_api") };
  ctx.moon = { source: metaUnavailable("astronomy_api") };
  ctx.earthActivity = {
    status: "Stabil",
    fallbackCopy: "Memantau getaran dan pergerakan tanah.",
    source: metaUnavailable("usgs"),
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
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,precipitation,uv_index,cloud_cover&daily=uv_index_max,sunrise,sunset&timezone=auto`,
        5000,
      ).catch(() => null);
      if (!res || !res.ok) return;
      try {
        const data = await res.json();
        const current = data.current || {};
        const daily = data.daily || {};
        const uvMax = Array.isArray(daily.uv_index_max) ? daily.uv_index_max[0] : undefined;
        const sunrise = Array.isArray(daily.sunrise) && daily.sunrise[0]
          ? new Date(daily.sunrise[0]).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : undefined;
        const sunset = Array.isArray(daily.sunset) && daily.sunset[0]
          ? new Date(daily.sunset[0]).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
          : undefined;

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

        ctx.astronomy = {
          sunrise,
          sunset,
          subtitle: sunrise ? `Terbit ${sunrise} · Terbenam ${sunset}` : "Siklus matahari hari ini sedang terbaca.",
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
          eventCount: features.length,
          fallbackCopy: "Tidak ada aktivitas gempa terdeteksi dalam radius terdekat saat ini.",
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

  // Wait for all tasks but each is bounded by its own timeout — total worst-case ~5s.
  await Promise.all(tasks);

  const circadian = getCircadianStatus();
  ctx.circadian = {
    status: circadian.status,
    label: circadian.label,
    basedOn: "local time",
  };

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
