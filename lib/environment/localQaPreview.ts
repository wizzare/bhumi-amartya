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
// target grouping UI (CUACA / KUALITAS UDARA / BUMI & ANTARIKSA). This fixture
// is LOCAL-QA ONLY: it can never activate in production (throws when
// isBuild110LocalQa() is false) and is NOT evidence of production provider
// connectivity. The planned production sources are Google Weather API and
// Google Air Quality API behind a server-side proxy — not yet activated.
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
    providerName: "Google Weather API (planned — NOT active)",
    attribution: "Includes weather data from Google",
  },
  airQuality: {
    aqi: 68,
    aqiStandard: "idn_menlhk",
    aqiCategory: "Sedang",
    dominantPollutant: "PM2.5",
    providerName: "Google Air Quality API (planned — NOT active)",
    attribution: "Includes data from Google Maps",
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
      source: { source: "air_quality_api", status: "available", observedAt: new Date().toISOString(), message: "Local QA preview values — not live provider data." },
    },
  };
}
