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
  if (normalized < 7.5 || normalized >= 352.5) return "New Moon";
  if (normalized < 82.5) return "Waxing Crescent";
  if (normalized < 97.5) return "First Quarter";
  if (normalized < 172.5) return "Waxing Gibbous";
  if (normalized < 187.5) return "Full Moon";
  if (normalized < 262.5) return "Waning Gibbous";
  if (normalized < 277.5) return "Last Quarter";
  return "Waning Crescent";
}

async function fetchReverseGeocode(lat: number, lon: number): Promise<Partial<EnvironmentLocation>> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
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

export async function getNormalizedEnvironment(location: EnvironmentLocation): Promise<EnvironmentContext> {
  const { latitude: lat, longitude: lon } = location.coordinates;
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const startTime = yesterday.toISOString();

  const [geoRes, weatherRes, airRes, earthquakeRes] = await Promise.allSettled([
    fetchReverseGeocode(lat, lon),
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,precipitation,uv_index,cloud_cover&daily=uv_index_max,sunrise,sunset&timezone=auto`),
    fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide`),
    fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&latitude=${lat}&longitude=${lon}&maxradiuskm=150&minmagnitude=2.0&orderby=time`)
  ]);

  const ctx: EnvironmentContext = {
    dateKey: now.toISOString().split("T")[0],
    fetchedAt: now.toISOString(),
    location: { ...location },
  };

  if (geoRes.status === "fulfilled") {
    ctx.location = { ...ctx.location, ...geoRes.value };
  }

  if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
    const data = await weatherRes.value.json();
    const current = data.current;
    const uvMax = data.daily?.uv_index_max?.[0];
    const sunrise = data.daily?.sunrise?.[0] ? new Date(data.daily.sunrise[0]).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : undefined;
    const sunset = data.daily?.sunset?.[0] ? new Date(data.daily.sunset[0]).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : undefined;

    ctx.weather = {
      condition: WEATHER_CODES[current.weather_code] || "Cerah",
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
      uvLabel: getUvLabel(current.uv_index),
      source: { source: "weather_api", status: "available", observedAt: now.toISOString() },
    };

    ctx.astronomy = {
      sunrise,
      sunset,
      subtitle: sunrise ? `Terbit ${sunrise} · Terbenam ${sunset}` : "Siklus matahari hari ini sedang terbaca.",
      source: { source: "weather_api", status: "available", observedAt: now.toISOString() },
    };
  }

  if (airRes.status === "fulfilled" && airRes.value.ok) {
    const data = await airRes.value.json();
    const current = data.current;
    ctx.airQuality = {
      aqi: current.us_aqi,
      label: getAqiLabel(current.us_aqi),
      pm25: current.pm2_5,
      pm10: current.pm10,
      ozone: current.ozone,
      no2: current.nitrogen_dioxide,
      so2: current.sulphur_dioxide,
      co: current.carbon_monoxide,
      source: { source: "air_quality_api", status: "available", observedAt: now.toISOString() },
    };
  }

  if (earthquakeRes.status === "fulfilled" && earthquakeRes.value.ok) {
    const data = await earthquakeRes.value.json();
    ctx.earthActivity = {
      status: data.features?.length > 0 ? "Ada aktivitas terdekat" : "Stabil",
      eventCount: data.features?.length || 0,
      fallbackCopy: "Tidak ada aktivitas gempa M2.0+ dalam radius 150 km selama 24 jam terakhir.",
      source: { source: "usgs", status: "available", observedAt: now.toISOString() },
    };
    if (data.features?.length > 0) {
      const latest = data.features[0];
      const [eqLon, eqLat, eqDepth] = latest.geometry.coordinates;
      ctx.earthActivity.latestEarthquake = {
        title: latest.properties.place,
        magnitude: latest.properties.mag,
        depthKm: eqDepth,
        distanceKm: Math.round(haversineDistance(lat, lon, eqLat, eqLon)),
        occurredAt: new Date(latest.properties.time).toISOString(),
      };
    }
  }

  const circadian = getCircadianStatus();
  ctx.circadian = {
    status: circadian.status,
    label: circadian.label,
    basedOn: "local time",
  };

  return ctx;
}

export {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  type EnvironmentPermissionState
} from "./geolocation";
