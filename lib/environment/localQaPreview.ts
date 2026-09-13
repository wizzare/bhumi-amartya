"use client";

import { isBuild110LocalQa } from "@/lib/config/localQa";
import type { EnvironmentContext } from "./types";

export interface LocalQaEnvironmentFixture {
  mode: string;
  externalCalls: number;
  weather: {
    condition: string;
    temperatureCelsius: number;
    feelsLikeCelsius: number;
    humidityPercent: number;
    pressureHpa: number;
    windSpeedKph: number;
    windDirectionDegrees: number;
    windDirectionCardinal: string;
    windGustKph: number;
    uvIndex: number;
    uvLabel: string;
    cloudCoverPercent: number;
    providerName: string;
    attribution: string;
  };
  airQuality: {
    // Provider AQI (us-epa-index). NEVER labelled as Indonesian MENLHK —
    // WeatherAPI.com does not supply the MENLHK index.
    aqi: number;
    aqiStandard: string;
    aqiCategory: string;
    dominantPollutant: string;
    providerName: string;
    attribution: string;
  };
  earthActivity: {
    status: string;
    dataState: "available" | "unavailable" | "stale";
    eventCount: number;
    fallbackCopy?: string;
  };
  spaceWeather: {
    kpIndex: number;
    geomagneticActivity: string;
  };
  astronomy: { sunrise: string; sunset: string };
  moon: { phase: string; illuminationPercent: number };
}

// Deterministic representative Jakarta values for the Founder to preview the
// target grouping UI (CUACA / KUALITAS UDARA / BUMI & ANTARIKSA / SCHUMANN SR1).
// This fixture is LOCAL-QA ONLY: it can never activate in production (throws when
// isBuild110LocalQa() is false) and is NOT evidence of production provider
// connectivity. The planned production source for weather + AQI is
// WeatherAPI.com behind a server-side proxy — not yet activated, no key present.
const DETERMINISTIC_PREVIEW: LocalQaEnvironmentFixture = {
  mode: "synthetic-local-environment-preview",
  externalCalls: 0,
  weather: {
    condition: "Cerah Berawan",
    temperatureCelsius: 31,
    feelsLikeCelsius: 34,
    humidityPercent: 72,
    pressureHpa: 1010,
    windSpeedKph: 12,
    windDirectionDegrees: 110,
    windDirectionCardinal: "Tenggara",
    windGustKph: 20,
    uvIndex: 7,
    uvLabel: "Tinggi",
    cloudCoverPercent: 35,
    providerName: "WeatherAPI.com (planned — NOT active)",
    attribution: "Powered by WeatherAPI.com",
  },
  airQuality: {
    aqi: 2,
    aqiStandard: "us-epa-index",
    aqiCategory: "Sedang",
    dominantPollutant: "PM2.5",
    providerName: "WeatherAPI.com (planned — NOT active)",
    attribution: "Powered by WeatherAPI.com",
  },
  earthActivity: {
    status: "Stabil",
    dataState: "available",
    eventCount: 0,
    fallbackCopy: "Tidak ada aktivitas gempa terdeteksi dalam radius terdekat saat ini.",
  },
  spaceWeather: {
    kpIndex: 1.67,
    geomagneticActivity: "Tenang",
  },
  astronomy: { sunrise: "05:55", sunset: "17:50" },
  moon: { phase: "Cembung Awal", illuminationPercent: 72 },
};

export function resolveLocalQaEnvironmentPreview(): LocalQaEnvironmentFixture {
  if (!isBuild110LocalQa()) {
    throw new Error("BUILD110_LOCAL_QA_DISABLED");
  }
  return DETERMINISTIC_PREVIEW;
}

// Patches a live-fetched EnvironmentContext with the deterministic preview
// weather/AQI values for Founder UI review. Never called in production:
// callers gate on isBuild110LocalQa() first, and this function throws
// otherwise.
export function applyLocalQaEnvironmentPreview(ctx: EnvironmentContext): EnvironmentContext {
  if (!isBuild110LocalQa()) {
    throw new Error("BUILD110_LOCAL_QA_DISABLED");
  }
  const preview = resolveLocalQaEnvironmentPreview();
  return {
    ...ctx,
    weather: {
      condition: preview.weather.condition,
      temperatureCelsius: preview.weather.temperatureCelsius,
      feelsLikeCelsius: preview.weather.feelsLikeCelsius,
      humidityPercent: preview.weather.humidityPercent,
      pressureHpa: preview.weather.pressureHpa,
      windSpeedKph: preview.weather.windSpeedKph,
      cloudCoverPercent: preview.weather.cloudCoverPercent,
      uvCurrent: preview.weather.uvIndex,
      source: { source: "weather_api", status: "available", observedAt: new Date().toISOString(), message: "Local QA preview values — not live provider data." },
    },
    airQuality: {
      aqi: preview.airQuality.aqi,
      label: preview.airQuality.aqiCategory,
      pm25: 18.5,
      pm10: 32.1,
      co: 240.3,
      no2: 12.4,
      ozone: 45.2,
      so2: 3.6,
      source: { source: "air_quality_api", status: "available", observedAt: new Date().toISOString(), message: "Local QA preview values — not live provider data." },
    },
  };
}
