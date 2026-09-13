"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Moon,
  Sun,
  Waves,
  Activity,
} from "lucide-react";
import { translations } from "@/lib/data/translations";
import { kpActivityLabel } from "@/lib/environment/schumann";
import { isBuild110LocalQa } from "@/lib/config/localQa";
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

// Build 110: only fields with a currently LIVE, approved-for-production source
// are rendered. Open-Meteo (Weather/Temperature/Humidity/Wind/Pressure/UV/Air
// Quality) is not an approved production source (see openMeteoGate.ts) and is
// therefore hidden here rather than shown as permanent "Data tidak tersedia".
// Schumann Resonance and Volcanic context are removed per Founder decision.
export default function EnvironmentDetailPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [permission, setPermission] = useState<EnvironmentPermissionState | null>(null);
  const [context, setContext] = useState<EnvironmentContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const t = translations["id"];

  async function load() {
    setError(null);
    try {
      const state = await getEnvironmentLocationPermission();
      setPermission(state);

      if (state === "denied") {
        setError(t.environment.permissionDenied || "Izin lokasi belum aktif. Bhumi membutuhkan izin lokasi agar bisa membaca kondisi lingkungan terdekatmu.");
        setLoading(false);
        return;
      }

      if (state === "unsupported") {
        setError(t.environment.unsupported || "Fitur lokasi tidak didukung di perangkat ini.");
        setLoading(false);
        return;
      }

      // Resolve location quickly with a short GPS timeout. Do not overwrite a
      // valid previously-stored location on a transient GPS timeout — the
      // cached context (keyed by last-known coordinates) still renders below.
      const location = await requestCurrentEnvironmentLocation({ timeoutMs: 6000 });

      const cached = getCachedEnvironment(location.coordinates.latitude, location.coordinates.longitude);
      if (cached) {
        setContext({ ...cached, location: { ...cached.location, coordinates: location.coordinates, timezone: location.timezone } });
        setLoading(false);
        setRefreshing(true);
      }

      const fresh = await getNormalizedEnvironment(location);

      // LOCAL-QA ONLY UI preview of the target grouped provider model
      // (CUACA / KUALITAS UDARA / BUMI & ANTARIKSA). Deterministic
      // representative Jakarta values for Founder layout review — NOT live
      // provider data and NOT production connectivity evidence. The preview
      // module throws when isBuild110LocalQa() is false, so this branch can
      // never execute in production.
      if (isBuild110LocalQa()) {
        const { applyLocalQaEnvironmentPreview } = await import("@/lib/environment/localQaPreview");
        setContext(applyLocalQaEnvironmentPreview(fresh));
      } else {
        setContext(fresh);
      }
      setPermission("granted");
    } catch (err: any) {
      setError(err?.message || t.environment.loadError || "Gagal memuat data lingkungan.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const earthActivityLive = context?.earthActivity?.dataState === "available";
  const geomagneticLive = context?.spaceWeather?.source.status === "available";
  const hasAnyLiveIndicator = earthActivityLive || geomagneticLive;

  // Weather/AQI are rendered ONLY when their fields are actually populated.
  // In production today those fields stay hidden (Open-Meteo fail-closed and the
  // Google Weather/AQI proxy is NOT yet activated); in local QA the deterministic
  // preview fixture populates them so the Founder can review the target layout.
  const weatherLive = context?.weather?.temperatureCelsius !== undefined && context?.weather?.temperatureCelsius !== null;
  const aqiLive = context?.airQuality?.aqi !== undefined && context?.airQuality?.aqi !== null;
  const isQaPreview = isBuild110LocalQa() && (weatherLive || aqiLive);

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
            <ArrowLeft size={16} /> {t.environment.back || "Kembali"}
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
              <p className="mt-4 text-sm font-medium text-[#7B8776]">{t.environment.readingSignals || "Membaca sinyal alam..."}</p>
              <p className="mt-1 text-xs text-[#9AA394]">{t.environment.waitAMoment || "Mohon tunggu sebentar."}</p>
            </div>
          ) : refreshing && context ? (
            <div className="mb-4 flex items-center gap-2 text-xs text-[#7B8776]">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <span>{t.environment.refreshingData || "Memperbarui data..."}</span>
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-medium text-[#7B8776] leading-relaxed mb-6">{error}</p>
              <div className="flex flex-col items-center gap-3">
                <button
                  onClick={() => void load()}
                  className="rounded-full bg-[#4F6658] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#405247]"
                >
                  {error.toLowerCase().includes("izin") ? t.environment.allowLocation : t.environment.retry}
                </button>
                {error.toLowerCase().includes("izin") && (
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
                subValue={`${formatCoord(context.location.coordinates.latitude, true)}, ${formatCoord(context.location.coordinates.longitude, false)}`}
              />

              {isQaPreview && (
                <div className="rounded-3xl border border-dashed border-[#9AA394] bg-[#F8F6EF] p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Pratinjau lokal QA</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#7B8776]">
                    Nilai Cuaca & Kualitas Udara di bawah adalah data contoh sintetis untuk
                    meninjau tata letak — BUKAN data provider live dan BUKAN bukti konektivitas produksi.
                  </p>
                </div>
              )}

              {weatherLive && (
                <section className="space-y-4">
                  <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9AA394]">Cuaca</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem
                      icon={<Sun size={20} />}
                      label={t.environment.fTemperature}
                      value={`${context.weather!.temperatureCelsius}°C`}
                      subValue={context.weather?.feelsLikeCelsius !== undefined ? `Terasa seperti ${context.weather.feelsLikeCelsius}°C` : undefined}
                    />
                    <DetailItem
                      icon={<MapPin size={20} />}
                      label={t.environment.fHumidity}
                      value={`${context.weather!.humidityPercent}%`}
                      subValue={context.weather?.condition}
                    />
                  </div>
                  <DetailItem
                    icon={<Activity size={20} />}
                    label={t.environment.fWind}
                    value={`${context.weather!.windSpeedKph} km/jam`}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailItem
                      icon={<Sun size={20} />}
                      label={t.environment.fPressure}
                      value={`${context.weather!.pressureHpa} hPa`}
                    />
                    <DetailItem
                      icon={<Sun size={20} />}
                      label={t.environment.fUvIndex}
                      value={context.weather?.uvCurrent !== undefined ? `${Math.round(context.weather.uvCurrent)} — ${getUvLabel(Math.round(context.weather.uvCurrent))}` : t.environment.unavailable}
                    />
                  </div>
                  <p className="px-1 text-[10px] text-[#9AA394]">Includes weather data from Google</p>
                </section>
              )}

              {aqiLive && (
                <section className="space-y-4">
                  <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9AA394]">Kualitas Udara</h2>
                  <DetailItem
                    icon={<Activity size={20} />}
                    label={t.environment.fAirQuality}
                    value={`${context.airQuality!.aqi} — ${context.airQuality!.label ?? "Sedang"}`}
                    subValue="Indeks lokal Indonesia (idn_menlhk)"
                  />
                  <p className="px-1 text-[10px] text-[#9AA394]">Includes data from Google Maps</p>
                </section>
              )}

              <section className="space-y-4">
                <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.24em] text-[#9AA394]">Bumi & Antariksa</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DetailItem
                    icon={<Sun size={20} />}
                    label={t.environment.fSun}
                    value={context.astronomy?.sunrise ? `${t.environment.sunrise || "Terbit"} ${context.astronomy.sunrise}` : t.environment.unavailable}
                    subValue={context.astronomy?.sunset ? `${t.environment.sunset || "Terbenam"} ${context.astronomy.sunset}` : undefined}
                  />
                  <DetailItem
                    icon={<Moon size={20} />}
                    label={t.environment.fMoon}
                    value={normalizeMoonPhaseLabel(context.moon?.phase)}
                    subValue={context.moon?.illuminationPercent !== undefined && context.moon?.illuminationPercent !== null ? `${context.moon.illuminationPercent}% ${t.environment.illumination || "cahaya"}` : undefined}
                  />
                </div>

                {!hasAnyLiveIndicator ? (
                  <div className="rounded-3xl bg-white p-6 text-center shadow-sm">
                    <p className="text-sm font-medium text-[#7B8776] leading-relaxed">
                      Data lingkungan sedang tidak tersedia. Silakan coba lagi nanti.
                    </p>
                  </div>
                ) : (
                  <>
                    {earthActivityLive && (
                      <DetailItem
                        icon={<Waves size={24} />}
                        label={t.environment.fEarthActivity}
                        value={context.earthActivity!.status}
                        subValue={context.earthActivity?.latestEarthquake?.title || context.earthActivity?.fallbackCopy}
                      />
                    )}
                    {geomagneticLive && (
                      <DetailItem
                        icon={<Activity size={24} />}
                        label={t.environment.fGeomagnetic}
                        value={context.spaceWeather!.kpIndex !== undefined ? kpActivityLabel(context.spaceWeather!.kpIndex) : (context.spaceWeather!.geomagneticActivity || t.environment.unavailable)}
                        subValue={context.spaceWeather?.kpIndex !== undefined ? `Kp ${context.spaceWeather.kpIndex}` : undefined}
                      />
                    )}
                  </>
                )}
              </section>
            </div>
          ) : null}

          <footer className="mt-16 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9AA394]">
              {t.environment.syncFooter || "Data disinkronkan dengan sinyal lingkungan lokal."}
            </p>
          </footer>
        </div>
      </main>
    </ProtectedRoute>
  );
}
