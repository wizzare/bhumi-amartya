"use client";

import { getUvLabel, normalizeMoonPhaseLabel, type EnvironmentContext } from "./service";

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
  geomagneticActivity?: string;
  kpIndex?: number | null;
  schumannStatusLabel?: string;
  schumannSr1Hz?: number | null;
  schumannUpdatedAtIso?: string;
  schumannProvenance?: "modelled-series" | "measured" | "unknown";
}

export type EnvironmentBand = "quiet" | "mild" | "active" | "storm";

export interface EnvironmentBands {
  geomagnetic: EnvironmentBand;
  schumann: EnvironmentBand;
}

export function deriveEnvironmentBands(ctx: EnvironmentContext): EnvironmentBands {
  const kp = ctx.spaceWeather?.kpIndex;
  const geomagnetic: EnvironmentBand = typeof kp !== "number" || kp < 2
    ? "quiet"
    : kp < 3 ? "mild" : kp < 5 ? "active" : "storm";
  const key = (ctx.schumann?.statusKey || "").toLowerCase();
  let schumann: EnvironmentBand = "quiet";
  if (/storm|extreme/.test(key)) schumann = "storm";
  else if (/elevat|moderat|active/.test(key)) schumann = "active";
  else if (typeof ctx.schumann?.intensity === "number") {
    schumann = ctx.schumann.intensity >= 2 ? "active" : ctx.schumann.intensity >= 1.5 ? "mild" : "quiet";
  }
  return { geomagnetic, schumann };
}

export function buildEnvironmentSpiritualReading(
  bands: EnvironmentBands,
  env: {
    spiritQuiet: string; spiritMild: string; spiritActive: string; spiritStorm: string;
    obsNoteQuiet: string; obsNoteMild: string; obsNoteActive: string; obsNoteStorm: string;
    practiceQuiet: string; practiceMild: string; practiceActive: string; practiceStorm: string;
    interpNote: string;
  },
): { band: EnvironmentBand; observationNote: string; reading: string; practice: string; note: string } {
  const band: EnvironmentBand = bands.geomagnetic === "storm" || bands.schumann === "storm"
    ? "storm"
    : bands.geomagnetic === "active" || bands.schumann === "active"
      ? "active"
      : bands.geomagnetic === "mild" || bands.schumann === "mild" ? "mild" : "quiet";
  const suffix = `${band.charAt(0).toUpperCase()}${band.slice(1)}`;
  return {
    band,
    observationNote: env[`obsNote${suffix}` as keyof typeof env] as string,
    reading: env[`spirit${suffix}` as keyof typeof env] as string,
    practice: env[`practice${suffix}` as keyof typeof env] as string,
    note: env.interpNote,
  };
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

  if (ctx.earthActivity?.dataState === "available") {
    if (ctx.earthActivity.status === "Stabil") flags.push("earth_stable");
    else if (ctx.earthActivity.status === "Ada aktivitas terdekat") flags.push("local_seismic_activity");
  }

  const kp = ctx.spaceWeather?.kpIndex ?? null;
  const geomagneticActivity = typeof kp === "number" ? ctx.spaceWeather?.geomagneticActivity : undefined;
  if (typeof kp === "number" && kp >= 5) flags.push("geomagnetic_storm_level");
  else if (typeof kp === "number" && kp >= 4) flags.push("geomagnetic_active");
  if (/(storm|extreme|elevated)/i.test(ctx.schumann?.statusKey || "")) flags.push("schumann_elevated_context");

  const circadian = ctx.circadian?.status;
  if (circadian) {
    flags.push(`${circadian.toLowerCase()}_phase`);
  }

  const weather = ctx.weather?.condition || "Belum tersedia";
  const temp = ctx.weather?.temperatureCelsius !== undefined && ctx.weather?.temperatureCelsius !== null ? `${ctx.weather.temperatureCelsius}°C` : "Belum tersedia";
  const feels = ctx.weather?.feelsLikeCelsius !== undefined && ctx.weather?.feelsLikeCelsius !== null ? `${ctx.weather.feelsLikeCelsius}°C` : "Belum tersedia";
  const hum = ctx.weather?.humidityPercent !== undefined && ctx.weather?.humidityPercent !== null ? `${ctx.weather.humidityPercent}%` : "Belum tersedia";
  const aqiLabel = ctx.airQuality?.aqi !== undefined && ctx.airQuality?.aqi !== null ? `${ctx.airQuality.label}` : "Belum tersedia";
  const uvVal = ctx.weather?.uvCurrent ?? ctx.airQuality?.uvIndex;
  const uv = uvVal !== undefined && uvVal !== null
    ? `${uvVal} — ${getUvLabel(uvVal)}${ctx.weather?.uvMaxToday ? `, maksimum hari ini ${ctx.weather.uvMaxToday}` : ""}`
    : "Belum tersedia";

  // Build warm context sentence
  const conditions: string[] = [];
  if (ctx.weather?.temperatureCelsius && ctx.weather.temperatureCelsius > 30) conditions.push("hangat");
  else if (ctx.weather?.temperatureCelsius && ctx.weather.temperatureCelsius < 24) conditions.push("sejuk");

  if (ctx.weather?.humidityPercent && ctx.weather.humidityPercent >= 80) conditions.push("lembap");

  if (ctx.airQuality?.aqi && ctx.airQuality.aqi > 100) conditions.push("dengan kualitas udara yang kurang ramah");

  if (ctx.circadian?.label) conditions.push(`fase ${ctx.circadian.label.toLowerCase()}`);

  const contextSentence = conditions.length > 0
    ? `Lingkungan sekitar terbaca ${conditions.join(", ")}, sebagai konteks pendukung untuk menjaga tempo tubuh.`
    : "Kondisi sekitar bisa menjadi konteks pendukung untuk membaca ritme tubuhmu.";

  return {
    locationLabel: ctx.location.cityOrRegency || ctx.location.locality || "Area terdeteksi",
    weatherSummary: weather,
    temperature: temp,
    feelsLike: feels,
    humidity: hum,
    airQualityLabel: aqiLabel,
    aqiValue: ctx.airQuality?.aqi || 0,
    uvLabel: uv,
    earthActivityStatus: ctx.earthActivity?.dataState === "available" ? (ctx.earthActivity.status || "—") : "Belum tersedia",
    circadianStatus: ctx.circadian ? `${ctx.circadian.status} / ${ctx.circadian.label}` : "Belum tersedia",
    sunSummary: ctx.astronomy?.subtitle || "Siklus matahari sedang terbaca",
    moonSummary: normalizeMoonPhaseLabel(ctx.moon?.phase),
    cautionFlags: flags,
    contextSentence,
    geomagneticActivity,
    kpIndex: kp,
    schumannStatusLabel: ctx.schumann?.statusLabel,
    schumannSr1Hz: ctx.schumann?.frequencies?.[0]?.valueHz ?? null,
    schumannUpdatedAtIso: ctx.schumann?.updatedAtIso,
    schumannProvenance: ctx.schumann?.provenance,
  };
}
