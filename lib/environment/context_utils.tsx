"use client";

import type { EnvironmentContext } from "./service";

export interface AIEnvironmentContext {
  locationLabel: string;
  weatherSummary: string;
  temperature: string;
  feelsLike: string;
  humidity: string;
  airQualityLabel: string;
  aqiValue: number;
  uvLabel: string;
  earthActivityStatus: string;
  circadianStatus: string;
  sunSummary: string;
  moonSummary: string;
  cautionFlags: string[];
  contextSentence: string;
}

export function buildAIEnvironmentContext(ctx: EnvironmentContext): AIEnvironmentContext {
  const flags: string[] = [];

  if (ctx.airQuality?.aqi) {
    const aqi = ctx.airQuality.aqi;
    if (aqi > 300) flags.push("air_quality_hazardous");
    else if (aqi > 200) flags.push("air_quality_very_unhealthy");
    else if (aqi > 150) flags.push("air_quality_unhealthy");
    else if (aqi > 100) flags.push("air_quality_sensitive");
    else if (aqi > 50) flags.push("air_quality_moderate");
    else flags.push("air_quality_good");
  }

  if (ctx.weather?.humidityPercent && ctx.weather.humidityPercent >= 80) {
    flags.push("high_humidity");
  }

  if (ctx.weather?.feelsLikeCelsius && ctx.weather.feelsLikeCelsius >= 32) {
    flags.push("heat_stress_possible");
  }

  if (ctx.weather?.uvMaxToday && ctx.weather.uvMaxToday >= 6) {
    flags.push("uv_high_today");
  }

  if (ctx.weather?.uvCurrent !== undefined && ctx.weather.uvCurrent <= 2) {
    flags.push("uv_current_low");
  }

  if (ctx.earthActivity?.status === "Stabil") {
    flags.push("earth_stable");
  } else if (ctx.earthActivity?.status === "Ada aktivitas terdekat") {
    flags.push("local_seismic_activity");
  }

  const circadian = ctx.circadian?.status;
  if (circadian) {
    flags.push(`${circadian.toLowerCase()}_phase`);
  }

  const weather = ctx.weather?.condition || "Belum terbaca";
  const temp = ctx.weather?.temperatureCelsius ? `${ctx.weather.temperatureCelsius}°C` : "Belum terbaca";
  const feels = ctx.weather?.feelsLikeCelsius ? `${ctx.weather.feelsLikeCelsius}°C` : "Belum terbaca";
  const hum = ctx.weather?.humidityPercent ? `${ctx.weather.humidityPercent}%` : "Belum terbaca";
  const aqiLabel = ctx.airQuality?.aqi ? `US AQI ${ctx.airQuality.aqi} — ${ctx.airQuality.label}` : "Belum terbaca";
  const uv = ctx.weather?.uvCurrent !== undefined ? `${ctx.weather.uvCurrent} — ${ctx.weather.uvLabel}, maksimum hari ini ${ctx.weather.uvMaxToday || '-'}` : "Belum terbaca";

  // Build warm context sentence
  const conditions: string[] = [];
  if (ctx.weather?.temperatureCelsius && ctx.weather.temperatureCelsius > 30) conditions.push("hangat");
  else if (ctx.weather?.temperatureCelsius && ctx.weather.temperatureCelsius < 24) conditions.push("sejuk");

  if (ctx.weather?.humidityPercent && ctx.weather.humidityPercent >= 80) conditions.push("lembap");

  if (ctx.airQuality?.aqi && ctx.airQuality.aqi > 100) conditions.push("dengan kualitas udara yang kurang ramah");

  const contextSentence = conditions.length > 0
    ? `Lingkungan sekitar terbaca ${conditions.join(", ")}.`
    : "Kondisi sekitar hari ini bisa menjadi konteks tambahan untuk membaca ritme tubuhmu.";

  return {
    locationLabel: ctx.location.cityOrRegency || ctx.location.locality || "Area terdeteksi",
    weatherSummary: weather,
    temperature: temp,
    feelsLike: feels,
    humidity: hum,
    airQualityLabel: aqiLabel,
    aqiValue: ctx.airQuality?.aqi || 0,
    uvLabel: uv,
    earthActivityStatus: ctx.earthActivity?.status || "Stabil",
    circadianStatus: ctx.circadian ? `${ctx.circadian.status} / ${ctx.circadian.label}` : "Belum terbaca",
    sunSummary: ctx.astronomy?.subtitle || "Siklus matahari sedang terbaca",
    moonSummary: ctx.moon?.phase || "Fase bulan sedang terbaca",
    cautionFlags: flags,
    contextSentence
  };
}
