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
import { buildEnvironmentSpiritualReading, deriveEnvironmentBands } from "@/lib/environment/context_utils";
import { getSchumannSeries } from "@/lib/environment/service";
import { formatSchumannLocalTimestamp, resolveSchumannUiState } from "@/lib/environment/schumann";
import { SchumannGraph } from "@/components/dashboard/SchumannGraph";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  getNormalizedEnvironment,
  getCachedEnvironment,
  getUvLabel,
  normalizeMoonPhaseLabel,
  type EnvironmentContext,
  type EnvironmentLocation,
  type EnvironmentPermissionState,
} from "@/lib/environment/service";

function formatCoord(val: number, isLat: boolean): string {
  const dir = isLat ? (val >= 0 ? "LU" : "LS") : (val >= 0 ? "BT" : "BB");
  return `${Math.abs(val).toFixed(2)}° ${dir}`;
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
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "en" ? "en-US" : language === "ms" ? "ms-MY" : "id-ID";
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
        setError("Izin lokasi belum aktif. Bhumi membutuhkan izin lokasi agar bisa membaca kondisi lingkungan terdekatmu.");
        setLoading(false);
        return;
      }

      if (state === "unsupported") {
        setError("Fitur lokasi tidak didukung di perangkat ini.");
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
      const fresh = await getNormalizedEnvironment(location);
      setContext(fresh);
      setPermission("granted");
    } catch (err: any) {
      // If we already showed cache, keep showing it but flag the error.
      setError(err?.message || "Gagal memuat data lingkungan.");
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
            <ArrowLeft size={16} /> Kembali
          </Link>

          <header className="mb-10">
            <h1 className="font-serif text-3xl font-bold text-[#4F6658]">Kondisi Lingkungan</h1>
            <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
              Memahami bagaimana dunia di sekitarmu mempengaruhi ritme dan energi batinmu hari ini.
            </p>
          </header>

                    {loading && !context ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-[#7B8776]">Membaca sinyal alam...</p>
              <p className="mt-1 text-xs text-[#9AA394]">Mohon tunggu sebentar.</p>
            </div>
          ) : refreshing && context ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-[#7B8776]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <span>Menyegarkan data...</span>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-[#7B8776] leading-relaxed mb-6">{error}</p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => void load()}
                  className="rounded-full bg-[#4F6658] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#405247]"
                >
                  {error.includes("Izin") || error.includes("izin") ? "Izinkan Lokasi" : "Coba Lagi"}
                </button>
                {(error.includes("Izin") || error.includes("izin")) && (
                  <p className="text-xs text-[#9AA394] leading-relaxed mt-1">
                    Atau buka Pengaturan Perangkat → Aplikasi → Bhumi Amartya → Izin → Lokasi.
                  </p>
                )}
              </div>
            </div>
          ) : context ? (
            <div className="space-y-4">
              <DetailItem
                icon={<MapPin size={24} />}
                label={t.environment.fCurrentLocation}
                value={context.location.cityOrRegency || "Area Terdeteksi"}
                subValue={`${formatCoord(context.location.coordinates.latitude, true)}, ${formatCoord(context.location.coordinates.longitude, false)}`}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<CloudSun size={20} />}
                  label={t.environment.fWeather}
                  value={context.weather?.condition || "Belum tersedia"}
                  subValue={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : "Menanti data sinkron"}
                />
                <DetailItem
                  icon={<Thermometer size={20} />}
                  label={t.environment.fTemperature}
                  value={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : "Belum tersedia"}
                  subValue={context.weather?.feelsLikeCelsius !== undefined && context.weather?.feelsLikeCelsius !== null ? `Terasa seperti ${context.weather.feelsLikeCelsius}°C` : undefined}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Sun size={20} />}
                  label={t.environment.fSun}
                  value={context.astronomy?.sunrise ? `Terbit ${context.astronomy.sunrise}` : "Belum tersedia"}
                  subValue={context.astronomy?.sunset ? `Terbenam ${context.astronomy.sunset}` : "Menanti siklus hari"}
                />
                <DetailItem
                  icon={<Moon size={20} />}
                  label={t.environment.fMoon}
                  value={normalizeMoonPhaseLabel(context.moon?.phase)}
                  subValue={context.moon?.illuminationPercent !== undefined && context.moon?.illuminationPercent !== null ? `${context.moon.illuminationPercent}% cahaya` : "Menanti fase malam"}
                />
              </div>

              <DetailItem
                icon={<Leaf size={24} />}
                label={t.environment.fAirQuality}
                value={context.airQuality?.aqi !== undefined && context.airQuality?.aqi !== null ? `${context.airQuality.aqi} — ${context.airQuality.label}` : "Belum tersedia"}
                subValue="Kualitas udara di sekitarmu saat ini."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Wind size={20} />}
                  label={t.environment.fWind}
                  value={context.weather?.windSpeedKph !== undefined && context.weather?.windSpeedKph !== null ? `${context.weather.windSpeedKph} km/jam` : "Belum tersedia"}
                />
                <DetailItem
                  icon={<Droplets size={20} />}
                  label={t.environment.fHumidity}
                  value={context.weather?.humidityPercent !== undefined && context.weather?.humidityPercent !== null ? `${context.weather.humidityPercent}%` : "Belum tersedia"}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Gauge size={20} />}
                  label={t.environment.fPressure}
                  value={context.weather?.pressureHpa !== undefined && context.weather?.pressureHpa !== null ? `${context.weather.pressureHpa} hPa` : "Belum tersedia"}
                />
                <DetailItem
                  icon={<Zap size={20} />}
                  label={t.environment.fUvIndex}
                  value={(() => {
                    const uvVal = context.weather?.uvCurrent ?? context.airQuality?.uvIndex;
                    if (uvVal === undefined || uvVal === null || Number.isNaN(uvVal)) return "Belum tersedia";
                    const num = Math.round(uvVal);
                    return `${num} — ${getUvLabel(num)}`;
                  })()}
                />
              </div>

              <DetailItem
                icon={<Waves size={24} />}
                label={t.environment.fEarthActivity}
                value={context.earthActivity?.dataState === "available" ? context.earthActivity.status : t.environment.unavailable}
                subValue={context.earthActivity?.latestEarthquake?.title || context.earthActivity?.fallbackCopy}
              />
              <DetailItem
                icon={<Activity size={24} />}
                label={t.environment.fGeomagnetic}
                value={context.spaceWeather?.source.status === "available" ? (context.spaceWeather.geomagneticActivity || t.environment.unavailable) : t.environment.unavailable}
                subValue={context.spaceWeather?.kpIndex !== undefined ? `Kp ${context.spaceWeather.kpIndex}` : undefined}
              />
            </div>
          ) : null}

          {!loading && <section className="mt-10 space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#4F6658]">{t.environment.fSchumann}</h3>
            {context && schumann && hasSchumannObservation && spiritual ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailItem
                    icon={<Radio size={24} />}
                    label={t.environment.schumannStatus}
                    value={statusPrimary}
                    subValue={`SR1 ${schumann.frequencies[0]?.valueHz ?? "—"} Hz · ${schumann.amplitudePicoTesla ?? "—"} pT`}
                  />
                  <DetailItem
                    icon={<Waves size={24} />}
                    label={t.environment.layerObservation}
                    value={t.environment.disclosureModel}
                    subValue={t.environment.disclosureModelNote}
                  />
                </div>

                {schumannUi.kind === "snapshot" ? (
                  <div className="rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-6 text-center">
                    <p className="text-sm font-semibold text-[#4F6658]">{t.environment.insufficient}</p>
                    <p className="mt-1 text-xs text-[#7B8776]">{snapshotMetaLine}</p>
                    <p className="mt-4 text-3xl font-light text-[#A08963]">SR1 {schumann.frequencies[0]?.valueHz ?? "—"} Hz</p>
                    <p className="text-xs text-[#7B8776]">{schumann.amplitudePicoTesla ?? "—"} pT</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-[#9AA394]">{t.environment.targetWindow}</p>
                  </div>
                ) : schumannUi.kind === "none" ? (
                  <DetailItem icon={<Radio size={24} />} label={t.environment.fSchumann} value={t.environment.noneAvailable} />
                ) : (
                  <>
                    <SchumannGraph
                      series={schumannSeries}
                      amplitudeLabel={t.environment.schumannAmplitude}
                      powerLabel={t.environment.schumannPower}
                      windowLabel={windowLabel}
                    />
                    {schumannUi.kind === "partial" && <p className="text-[11px] text-[#7B8776]">{t.environment.targetWindow}</p>}
                  </>
                )}

                <div className="space-y-1 rounded-2xl border border-[#E8E9E5] bg-white p-4">
                  <p className="text-[11px] text-[#667064]">
                    {t.environment.updatedLabel}: <span className="font-semibold">{localUpdated || "—"}</span>
                    {schumannUi.kind === "stale" || schumann.source.status !== "available" ? ` · ${t.environment.lastKnownLabel} (${t.environment.notLive})` : ""}
                  </p>
                  <p className="text-[11px] text-[#667064]">
                    {t.environment.srcDataLabel}: <span className="font-semibold">Schumann Resonance Live</span> ({t.environment.srcSchumannRole}) · <span className="font-semibold">NOAA SWPC</span> ({t.environment.srcNoaaRole})
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-50 bg-indigo-50/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7C86B4]">{t.environment.layerInterpretation}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">{spiritual.observationNote}</p>
                </div>
                <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">{t.environment.layerSpiritual}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">{spiritual.reading}</p>
                  <p className="mt-3 text-sm font-medium text-[#4F6658]">{t.environment.groundingLabel}: {spiritual.practice}</p>
                  <p className="mt-3 text-[11px] italic text-[#8B93B8]">{spiritual.note}</p>
                </div>
              </>
            ) : (
              <DetailItem icon={<Radio size={24} />} label={t.environment.fSchumann} value={t.environment.unavailable} />
            )}
          </section>}

          <footer className="mt-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9AA394]">
              Data sinkron dengan sinyal lingkungan terdekat.
            </p>
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
