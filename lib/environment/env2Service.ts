import type {
  EnvironmentalConditionPayload,
  SurfaceAirQualityDomain,
  AtmosphericColumnDomain,
  WindDomain,
  EnvironmentalDatumProvenance,
} from "./env2Types";
import { evaluateVolcanicContext, degreesToCardinal } from "./volcanicEngine";

async function fetchWithTimeout(url: string, timeoutMs = 6000, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

const ENV2_CACHE_KEY_PREFIX = "bhumi:env2:payload:";
const ENV2_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache for environmental observation

function roundCoord(num: number): number {
  return Math.round(num * 100) / 100;
}

export function getEnv2CacheKey(lat: number, lon: number): string {
  return `${ENV2_CACHE_KEY_PREFIX}${roundCoord(lat)}:${roundCoord(lon)}`;
}

export function readEnv2Cache(lat: number, lon: number): EnvironmentalConditionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getEnv2CacheKey(lat, lon));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EnvironmentalConditionPayload;
    const age = Date.now() - new Date(parsed.fetchedAt).getTime();
    if (age > ENV2_CACHE_TTL_MS * 4) { // Stale beyond 2 hours
      return null;
    }
    if (age > ENV2_CACHE_TTL_MS) {
      parsed.overallFreshness = "stale";
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeEnv2Cache(payload: EnvironmentalConditionPayload): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getEnv2CacheKey(payload.coordinates.latitude, payload.coordinates.longitude),
      JSON.stringify(payload)
    );
  } catch {
    // Ignore storage write failures (e.g. quota)
  }
}

export function evaluateSurfaceHealthAdvice(aqi?: number): string | undefined {
  if (typeof aqi !== "number") return undefined;
  if (aqi <= 50) return "Air quality is good. Ideal conditions for outdoor activities and deep breathing.";
  if (aqi <= 100) return "Air quality is moderate. Sensitive individuals may consider reducing prolonged outdoor exertion.";
  if (aqi <= 150) return "Air quality is unhealthy for sensitive groups. Reduce prolonged outdoor activities.";
  if (aqi <= 200) return "Air quality is unhealthy. Everyone should reduce strenuous outdoor activities.";
  if (aqi <= 300) return "Air quality is very unhealthy. Avoid outdoor exertion and keep indoor air clean.";
  return "Hazardous air quality. Remain indoors with windows closed and utilize air filtration if possible.";
}

export async function fetchEnvironmentalConditionPayload(
  lat: number,
  lon: number,
  forceRefresh = false
): Promise<EnvironmentalConditionPayload> {
  const cached = readEnv2Cache(lat, lon);
  if (cached && !forceRefresh && cached.overallFreshness === "fresh") {
    return cached;
  }

  const nowIso = new Date().toISOString();

  // Tasks executed in parallel
  let aqData: any = null;
  let weatherData: any = null;

  try {
    const [aqRes, weatherRes] = await Promise.all([
      fetchWithTimeout(
        `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,so2_column`,
        6000
      ).catch(() => null),
      fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&elevation=true`,
        6000
      ).catch(() => null),
    ]);

    if (aqRes && aqRes.ok) {
      aqData = await aqRes.json().catch(() => null);
    }
    if (weatherRes && weatherRes.ok) {
      weatherData = await weatherRes.json().catch(() => null);
    }
  } catch (fetchErr) {
    console.warn("[ENV2] Network fetch error:", fetchErr);
  }

  const aqCurrent = aqData?.current || {};
  const weatherCurrent = weatherData?.current || {};
  const elevationMeters = weatherData?.elevation ?? 0;

  const aqObservedAt = aqCurrent.time ? new Date(aqCurrent.time).toISOString() : nowIso;
  const weatherObservedAt = weatherCurrent.time ? new Date(weatherCurrent.time).toISOString() : nowIso;

  // 1. Surface Air Quality Domain
  const aqProvenance: EnvironmentalDatumProvenance = {
    source: "copernicus_cams_open_meteo",
    provider: "Copernicus Atmosphere Monitoring Service & Open-Meteo",
    dataset: "CAMS Global Air Quality Ensemble",
    measurementOrModel: "modelled",
    observedAt: aqObservedAt,
    fetchedAt: nowIso,
    freshness: "fresh",
    licensing: "CC BY 4.0",
    attributionText: "Copernicus Atmosphere Monitoring Service (CAMS) & Open-Meteo",
  };

  const surfaceAq: SurfaceAirQualityDomain = {
    aqi: typeof aqCurrent.us_aqi === "number" ? Math.round(aqCurrent.us_aqi) : undefined,
    aqiStandard: "us_aqi",
    label: typeof aqCurrent.us_aqi === "number"
      ? (aqCurrent.us_aqi <= 50 ? "Good" : aqCurrent.us_aqi <= 100 ? "Moderate" : aqCurrent.us_aqi <= 150 ? "Unhealthy for Sensitive Groups" : "Unhealthy")
      : undefined,
    pm25UgM3: typeof aqCurrent.pm2_5 === "number" ? Math.round(aqCurrent.pm2_5 * 10) / 10 : undefined,
    pm10UgM3: typeof aqCurrent.pm10 === "number" ? Math.round(aqCurrent.pm10 * 10) / 10 : undefined,
    no2UgM3: typeof aqCurrent.nitrogen_dioxide === "number" ? Math.round(aqCurrent.nitrogen_dioxide * 10) / 10 : undefined,
    o3UgM3: typeof aqCurrent.ozone === "number" ? Math.round(aqCurrent.ozone * 10) / 10 : undefined,
    coUgM3: typeof aqCurrent.carbon_monoxide === "number" ? Math.round(aqCurrent.carbon_monoxide * 10) / 10 : undefined,
    surfaceSo2UgM3: typeof aqCurrent.sulphur_dioxide === "number" ? Math.round(aqCurrent.sulphur_dioxide * 10) / 10 : undefined,
    healthRecommendation: evaluateSurfaceHealthAdvice(aqCurrent.us_aqi),
    provenance: aqProvenance,
  };

  // 2. Atmospheric Column SO2 Domain
  const columnSo2UgM2 = typeof aqCurrent.so2_column === "number" ? Math.round(aqCurrent.so2_column) : undefined;
  const dobsonUnits = typeof columnSo2UgM2 === "number" ? Math.round((columnSo2UgM2 / 28500) * 1000) / 1000 : undefined;

  const atmosphereProvenance: EnvironmentalDatumProvenance = {
    source: "copernicus_cams_tropomi",
    provider: "European Space Agency Sentinel-5P TROPOMI & Copernicus ECMWF",
    dataset: "CAMS Global Atmospheric Composition - SO2 Total Column",
    measurementOrModel: "modelled",
    observedAt: aqObservedAt,
    fetchedAt: nowIso,
    freshness: "fresh",
    licensing: "Copernicus Open Access / CC BY 4.0",
    attributionText: "ESA Sentinel-5P TROPOMI / Copernicus ECMWF CAMS",
  };

  const atmosphere: AtmosphericColumnDomain = {
    totalColumnSo2UgM2: columnSo2UgM2,
    totalColumnSo2DobsonUnits: dobsonUnits,
    scientificUnit: "ug/m2",
    anomalyDetected: typeof columnSo2UgM2 === "number" ? columnSo2UgM2 >= 25000 : null,
    provenance: atmosphereProvenance,
  };

  // 3. Wind Domain
  const windDirDeg = typeof weatherCurrent.wind_direction_10m === "number" ? weatherCurrent.wind_direction_10m : undefined;
  const windProvenance: EnvironmentalDatumProvenance = {
    source: "open_meteo_weather",
    provider: "National Weather Services (DWD/NOAA/ECMWF) via Open-Meteo",
    dataset: "High-Resolution Numerical Weather Prediction",
    measurementOrModel: "forecast",
    observedAt: weatherObservedAt,
    fetchedAt: nowIso,
    freshness: "fresh",
    licensing: "ODbL / CC BY 4.0",
    attributionText: "Open-Meteo Weather Model Assimilation",
  };

  const wind: WindDomain = {
    speedKph: typeof weatherCurrent.wind_speed_10m === "number" ? Math.round(weatherCurrent.wind_speed_10m * 10) / 10 : undefined,
    directionDegrees: windDirDeg,
    directionCardinal: typeof windDirDeg === "number" ? degreesToCardinal(windDirDeg) : undefined,
    movementRelativeToUserLocation: typeof windDirDeg === "number" ? `Wind blowing from ${degreesToCardinal(windDirDeg)} (${Math.round(windDirDeg)}°)` : undefined,
    elevationMeters,
    provenance: windProvenance,
  };

  // 4. Volcanic Context Domain
  const volcanic = evaluateVolcanicContext({
    userLat: lat,
    userLon: lon,
    totalColumnSo2UgM2: columnSo2UgM2,
    surfaceSo2UgM3: surfaceAq.surfaceSo2UgM3,
    windSpeedKph: wind.speedKph,
    windDirectionDegrees: wind.directionDegrees,
    observedAt: aqObservedAt,
  });

  const payload: EnvironmentalConditionPayload = {
    version: "env2-v1",
    coordinates: {
      latitude: lat,
      longitude: lon,
    },
    airQuality: surfaceAq,
    atmosphere,
    wind,
    volcanic,
    fetchedAt: nowIso,
    updatedAt: aqObservedAt,
    overallFreshness: "fresh",
    failClosed: false,
  };

  // Cache only if at least surface air quality or weather returned data
  if (typeof surfaceAq.aqi === "number" || typeof wind.speedKph === "number") {
    writeEnv2Cache(payload);
  } else if (cached) {
    // If live call returned nothing, fallback to cached record marked stale
    cached.overallFreshness = "stale";
    return cached;
  } else {
    payload.failClosed = true;
    payload.overallFreshness = "unknown";
  }

  return payload;
}
