"use client";

// Cached client for the Build 110 WeatherAPI.com server proxy.
// Free-tier control (100k calls/month):
// - WEATHERAPI_CACHE_TTL: 30 minutes per geo-bucket.
// - WEATHERAPI_CACHE_KEY: rounded coordinates (2 decimals ≈ 1.1 km cells).
// - DUPLICATE_REQUEST_COALESCING: in-flight identical requests share one promise.
// - Dashboard + Environment detail import this same module → one shared cache.
// - No upstream call on every render/navigation: callers fetch once per mount and
//   reuse the cached result; rapid refreshes hit cache, never the proxy.

export const WEATHERAPI_CACHE_TTL_MS = 30 * 60 * 1000;

export interface WeatherApiWeather {
  temperatureCelsius?: number;
  feelsLikeCelsius?: number;
  humidityPercent?: number;
  pressureHpa?: number;
  windSpeedKph?: number;
  windDirectionDegrees?: number;
  windDirectionCardinal?: string;
  windGustKph?: number;
  uvIndex?: number;
  condition?: string;
  cloudCoverPercent?: number;
}

export interface WeatherApiAirQuality {
  usEpaIndex?: number;
  pm25UgM3?: number;
  pm10UgM3?: number;
  coUgM3?: number;
  no2UgM3?: number;
  o3UgM3?: number;
  so2UgM3?: number;
}

export interface WeatherApiResult {
  status: "ready" | "error";
  providerStatus?: string;
  observedAt?: string;
  weather?: WeatherApiWeather;
  airQuality?: WeatherApiAirQuality;
  attribution?: string;
  note?: string;
  fromCache?: boolean;
}

export function getWeatherApiCacheKey(lat: number, lon: number): string {
  const round = (n: number) => Math.round(n * 100) / 100;
  return `bhumi:weatherapi:${round(lat)}:${round(lon)}`;
}

interface CacheEntry {
  fetchedAt: number;
  result: WeatherApiResult;
}

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<WeatherApiResult>>();

export type WeatherApiTokenProvider = () => Promise<string | null>;
let customTokenProvider: WeatherApiTokenProvider | null = null;

export function setWeatherApiTokenProviderForTests(provider: WeatherApiTokenProvider | null): void {
  customTokenProvider = provider;
}

function readCache(key: string, now = Date.now()): WeatherApiResult | null {
  const entry = memoryCache.get(key);
  if (!entry) {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as CacheEntry;
          if (parsed && typeof parsed.fetchedAt === "number" && now - parsed.fetchedAt < WEATHERAPI_CACHE_TTL_MS) {
            memoryCache.set(key, parsed);
            return { ...parsed.result, fromCache: true };
          }
        }
      } catch {
        // ignore corrupt cache
      }
    }
    return null;
  }
  if (now - entry.fetchedAt >= WEATHERAPI_CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return { ...entry.result, fromCache: true };
}

function writeCache(key: string, result: WeatherApiResult, now = Date.now()): void {
  if (result.status !== "ready") return;
  const entry: CacheEntry = { fetchedAt: now, result: { ...result, fromCache: undefined } };
  memoryCache.set(key, entry);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // ignore quota issues
    }
  }
}

async function fetchViaProxy(lat: number, lon: number): Promise<WeatherApiResult> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let idToken: string | null = null;
    if (customTokenProvider) {
      idToken = await customTokenProvider().catch(() => null);
    } else {
      const { auth } = await import("@/lib/firebase/firebase");
      const user = auth?.currentUser;
      if (user) {
        idToken = await user.getIdToken().catch(() => null);
      }
    }
    if (idToken) headers.Authorization = `Bearer ${idToken}`;
  } catch {
    return { status: "error", providerStatus: "unauthorized" };
  }
  const response = await fetch("/api/environment/weather-aqi", {
    method: "POST",
    headers,
    body: JSON.stringify({ latitude: lat, longitude: lon }),
    cache: "no-store",
  }).catch((): Response | null => null);
  if (!response) {
    return { status: "error", providerStatus: "retriable_error", note: "Weather provider is not reachable right now." };
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.status !== "ready") {
    return {
      status: "error",
      providerStatus: data?.providerStatus || "provider_error",
      note: data?.note || "Weather provider is not reachable right now.",
    };
  }
  return {
    status: "ready",
    providerStatus: "available",
    observedAt: data.observedAt,
    weather: data.weather,
    airQuality: data.airQuality,
    attribution: data.attribution,
  };
}

/**
 * Shared cached fetch used by BOTH Dashboard summary and Environment detail.
 * Identical concurrent calls coalesce into a single upstream request.
 */
export function getCachedWeatherAqi(lat: number, lon: number): Promise<WeatherApiResult> {
  const key = getWeatherApiCacheKey(lat, lon);
  const cached = readCache(key);
  if (cached) return Promise.resolve(cached);
  const existing = inFlight.get(key);
  if (existing) return existing;
  const request = fetchViaProxy(lat, lon)
    .then((result) => {
      writeCache(key, result);
      return result;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, request);
  return request;
}

export function clearWeatherApiCacheForTests(): void {
  memoryCache.clear();
  inFlight.clear();
}
