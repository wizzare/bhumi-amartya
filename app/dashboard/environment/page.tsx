"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CloudSun,
  Droplets,
  Gauge,
  Leaf,
  MapPin,
  Moon,
  Sun,
  Thermometer,
  Wind,
  Zap,
  Waves,
  Activity,
  Radio,
} from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";
import { buildEnvironmentSpiritualReading, deriveEnvironmentBands } from "@/lib/environment/context_utils";
import { getSchumannSeries } from "@/lib/environment/service";
import { formatSchumannLocalTimestamp, resolveSchumannUiState, kpActivityLabel } from "@/lib/environment/schumann";
import { SchumannGraph } from "@/components/dashboard/SchumannGraph";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { AtmosphereVolcanicCard } from "@/components/dashboard/AtmosphereVolcanicCard";
import { fetchEnvironmentalConditionPayload } from "@/lib/environment/env2Service";
import type { EnvironmentalConditionPayload } from "@/lib/environment/env2Types";
import {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  getNormalizedEnvironment,
  getCachedEnvironment,
  getUvLabel,
  getAqiLabel,
  normalizeMoonPhaseLabel,
  type EnvironmentContext,
  type EnvironmentLocation,
  type EnvironmentPermissionState,
} from "@/lib/environment/service";

function formatCoord(val: number, isLat: boolean, isEn = false): string {
  const dir = isLat
    ? (val >= 0 ? (isEn ? "N" : "LU") : (isEn ? "S" : "LS"))
    : (val >= 0 ? (isEn ? "E" : "BT") : (isEn ? "W" : "BB"));
  return `${Math.abs(val).toFixed(2)}° ${dir}`;
}

function localizeWeatherCondition(condition: string | undefined, isEn: boolean): string {
  if (!condition) return "";
  if (!isEn) return condition;
  const map: Record<string, string> = {
    "Cerah": "Clear",
    "Cerah Berawan": "Mostly Clear",
    "Berawan": "Partly Cloudy",
    "Mendung": "Overcast",
    "Berkabut": "Foggy",
    "Kabut Rime": "Depositing Rime Fog",
    "Gerimis Ringan": "Light Drizzle",
    "Gerimis": "Drizzle",
    "Gerimis Lebat": "Heavy Drizzle",
    "Hujan Ringan": "Light Rain",
    "Hujan": "Rain",
    "Hujan Lebat": "Heavy Rain",
    "Salju Ringan": "Light Snow",
    "Salju": "Snow",
    "Salju Lebat": "Heavy Snow",
    "Hujan Sedang": "Moderate Rain",
    "Badai Petir": "Thunderstorm",
  };
  return map[condition] || condition;
}

function DetailItem({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F8F6EF] text-[#4F6658]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{label}</p>
        <p className="mt-1 text-lg font-bold text-[#4F6658]">{value}</p>
        {subValue && <p className="mt-1 text-xs text-[#7B8776]">{subValue}</p>}
      </div>
    </div>
  );
}

export default function EnvironmentDetailPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permission, setPermission] = useState<EnvironmentPermissionState | null>(null);
  const [context, setContext] = useState<EnvironmentContext | null>(null);
  const [env2Payload, setEnv2Payload] = useState<EnvironmentalConditionPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isEn = false;
  const t = translations["id"];
  const locale = "id-ID";
  const schumannSeries = getSchumannSeries();
  const schumann = context?.schumann;
  const hasSchumannObservation = Boolean(schumann?.updatedAtIso || schumann?.frequencies.some((item) => typeof item.valueHz === "number"));
  const schumannUi = resolveSchumannUiState(hasSchumannObservation ? schumann : undefined, schumannSeries);
  const localUpdated = formatSchumannLocalTimestamp(schumann?.updatedAtIso, context?.location.timezone, undefined, locale);
  const statusLabels: Record<string, string> = {
    Elevated: t.environment.statusElevated,
    Quiet: t.environment.statusQuiet,
    Storm: t.environment.statusStorm,
    Extreme: t.environment.statusExtreme,
  };
  const statusPrimary = (schumann?.statusKey && statusLabels[schumann.statusKey]) || schumann?.statusLabel || t.environment.unavailable;
  const windowLabel = schumannUi.kind === "full"
    ? t.environment.fullLabel
    : schumannUi.hoursAvailable >= 0.1
      ? t.environment.partialTpl.replace("{h}", String(schumannUi.hoursAvailable))
      : t.environment.schumannWindowTpl.replace("{h}", String(schumannUi.hoursAvailable));
  const snapshotMetaLine = [
    schumannUi.startedAtIso
      ? t.environment.startedTpl.replace("{time}", formatSchumannLocalTimestamp(schumannUi.startedAtIso, context?.location.timezone, undefined, locale))
      : null,
    typeof schumannUi.minutesAvailable === "number"
      ? t.environment.minutesTpl.replace("{m}", String(Math.round(schumannUi.minutesAvailable)))
      : null,
  ].filter(Boolean).join(" · ");
  const spiritual = context
    ? buildEnvironmentSpiritualReading(deriveEnvironmentBands(context), t.environment)
    : null;

  async function load() {
    setError(null);
    try {
      const state = await getEnvironmentLocationPermission();
      setPermission(state);

      if (state === "denied") {
        setError(t.environment.permissionDenied || (isEn ? "Location permission is not active. Bhumi needs location permission to read your nearest environmental conditions." : "Izin lokasi belum aktif. Bhumi membutuhkan izin lokasi agar bisa membaca kondisi lingkungan terdekatmu."));
        setLoading(false);
        return;
      }

      if (state === "unsupported") {
        setError(t.environment.unsupported || (isEn ? "Location feature is not supported on this device." : "Fitur lokasi tidak didukung di perangkat ini."));
        setLoading(false);
        return;
      }

      // Resolve location quickly with a short GPS timeout.
      const location = await requestCurrentEnvironmentLocation({ timeoutMs: 6000 });

      // Show cached context immediately (if any) so the page paints fast.
      const cached = getCachedEnvironment(location.coordinates.latitude, location.coordinates.longitude);
      if (cached) {
        setContext({ ...cached, location: { ...cached.location, coordinates: location.coordinates, timezone: location.timezone } });
        setLoading(false);
        setRefreshing(true);
      }

      // Fetch fresh data (each provider is bounded by its own timeout).
      const [fresh, env2] = await Promise.all([
        getNormalizedEnvironment(location),
        fetchEnvironmentalConditionPayload(location.coordinates.latitude, location.coordinates.longitude).catch(() => null),
      ]);
      setContext(fresh);
      if (env2) setEnv2Payload(env2);
      setPermission("granted");
    } catch (err: any) {
      // If we already showed cache, keep showing it but flag the error.
      setError(err?.message || (t.environment.loadError || (isEn ? "Failed to load environmental data." : "Gagal memuat data lingkungan.")));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, [])

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-6 py-10 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <BhumiPageHeader className="mb-8" />

          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#7B8776] transition-colors hover:text-[#4F6658]"
          >
            <ArrowLeft size={16} /> {t.environment.back || "Back"}
          </Link>

          <header className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-[#4F6658]">{t.environment.pageTitle || t.environment.title}</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
              {t.environment.pageSubtitle || t.environment.subtitle}
            </p>
          </header>

          {loading && !context ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-[#7B8776]">{t.environment.readingSignals || "Reading natural signals..."}</p>
              <p className="mt-1 text-xs text-[#9AA394]">{t.environment.waitAMoment || "Please wait a moment."}</p>
            </div>
          ) : refreshing && context ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-[#7B8776]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <span>{t.environment.refreshingData || "Refreshing data..."}</span>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-[#7B8776] leading-relaxed mb-6">{error}</p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => void load()}
                  className="rounded-full bg-[#4F6658] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#405247]"
                >
                  {error.toLowerCase().includes("izin") || error.toLowerCase().includes("permission") ? t.environment.allowLocation : t.environment.retry}
                </button>
                {(error.toLowerCase().includes("izin") || error.toLowerCase().includes("permission")) && (
                  <p className="text-xs text-[#9AA394] leading-relaxed mt-1">
                    {t.environment.settingsHintFull || t.environment.settingsHint}
                  </p>
                )}
              </div>
            </div>
          ) : context ? (
            <div className="space-y-4">
              <DetailItem
                icon={<MapPin size={24} />}
                label={t.environment.fCurrentLocation}
                value={context.location.cityOrRegency || t.environment.detectedArea || "Area Terdeteksi"}
                subValue={`${formatCoord(context.location.coordinates.latitude, true, isEn)}, ${formatCoord(context.location.coordinates.longitude, false, isEn)}`}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<CloudSun size={20} />}
                  label={t.environment.fWeather}
                  value={localizeWeatherCondition(context.weather?.condition, isEn) || t.environment.unavailable}
                  subValue={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : (t.environment.awaitingSync || "Awaiting data sync")}
                />
                <DetailItem
                  icon={<Thermometer size={20} />}
                  label={t.environment.fTemperature}
                  value={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : t.environment.unavailable}
                  subValue={context.weather?.feelsLikeCelsius !== undefined && context.weather?.feelsLikeCelsius !== null ? `${t.environment.feelsLike || "Feels like"} ${context.weather.feelsLikeCelsius}°C` : undefined}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Sun size={20} />}
                  label={t.environment.fSun}
                  value={context.astronomy?.sunrise ? `${t.environment.sunrise || "Sunrise"} ${context.astronomy.sunrise}` : t.environment.unavailable}
                  subValue={context.astronomy?.sunset ? `${t.environment.sunset || "Sunset"} ${context.astronomy.sunset}` : (t.environment.awaitingDaylight || "Awaiting daylight cycle")}
                />
                <DetailItem
                  icon={<Moon size={20} />}
                  label={t.environment.fMoon}
                  value={normalizeMoonPhaseLabel(context.moon?.phase, isEn)}
                  subValue={context.moon?.illuminationPercent !== undefined && context.moon?.illuminationPercent !== null ? `${context.moon.illuminationPercent}% ${t.environment.illumination || "cahaya"}` : (t.environment.awaitingNight || "Awaiting night phase")}
                />
              </div>

              <DetailItem
                icon={<Leaf size={24} />}
                label={t.environment.fAirQuality}
                value={context.airQuality?.aqi !== undefined && context.airQuality?.aqi !== null ? `${context.airQuality.aqi} — ${getAqiLabel(context.airQuality.aqi, isEn)}` : t.environment.unavailable}
                subValue={t.environment.airQualityAround || "Current air quality around you."}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Wind size={20} />}
                  label={t.environment.fWind}
                  value={context.weather?.windSpeedKph !== undefined && context.weather?.windSpeedKph !== null ? `${context.weather.windSpeedKph} ${t.environment.windUnit || "km/jam"}` : t.environment.unavailable}
                />
                <DetailItem
                  icon={<Droplets size={20} />}
                  label={t.environment.fHumidity}
                  value={context.weather?.humidityPercent !== undefined && context.weather?.humidityPercent !== null ? `${context.weather.humidityPercent}%` : t.environment.unavailable}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Gauge size={20} />}
                  label={t.environment.fPressure}
                  value={context.weather?.pressureHpa !== undefined && context.weather?.pressureHpa !== null ? `${context.weather.pressureHpa} hPa` : t.environment.unavailable}
                />
                <DetailItem
                  icon={<Zap size={20} />}
                  label={t.environment.fUvIndex}
                  value={(() => {
                    const uvVal = context.weather?.uvCurrent ?? context.airQuality?.uvIndex;
                    if (uvVal === undefined || uvVal === null || Number.isNaN(uvVal)) return t.environment.unavailable;
                    const num = Math.round(uvVal);
                    return `${num} — ${getUvLabel(num, isEn)}`;
                  })()}
                />
              </div>

              <DetailItem
                icon={<Waves size={24} />}
                label={t.environment.fEarthActivity}
                value={context.earthActivity?.dataState === "available" ? (isEn && context.earthActivity.status === "Stabil" ? "Stable" : context.earthActivity.status) : t.environment.unavailable}
                subValue={context.earthActivity?.latestEarthquake?.title || context.earthActivity?.fallbackCopy}
              />
              <DetailItem
                icon={<Activity size={24} />}
                label={t.environment.fGeomagnetic}
                value={context.spaceWeather?.source.status === "available" ? (context.spaceWeather.kpIndex !== undefined ? kpActivityLabel(context.spaceWeather.kpIndex, isEn) : (context.spaceWeather.geomagneticActivity || t.environment.unavailable)) : t.environment.unavailable}
                subValue={context.spaceWeather?.kpIndex !== undefined ? `Kp ${context.spaceWeather.kpIndex}` : undefined}
              />
            </div>
          ) : null}

          <footer className="mt-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9AA394]">
              {t.environment.syncFooter || "Data synchronized with local environmental signals."}
            </p>
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
