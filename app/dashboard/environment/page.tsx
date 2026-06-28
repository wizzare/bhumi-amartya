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
  Waves
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  getNormalizedEnvironment,
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
  const [permission, setPermission] = useState<EnvironmentPermissionState | null>(null);
  const [context, setContext] = useState<EnvironmentContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
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

      const location = await requestCurrentEnvironmentLocation();
      const ctx = await getNormalizedEnvironment(location);
      setContext(ctx);
      setPermission("granted");
    } catch (err: any) {
      setError(err.message || "Gagal memuat data lingkungan.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

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

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4F6658] border-t-transparent" />
              <p className="mt-4 text-sm font-medium text-[#7B8776]">Membaca sinyal alam...</p>
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
                label="Lokasi Saat Ini"
                value={context.location.cityOrRegency || "Area Terdeteksi"}
                subValue={`${formatCoord(context.location.coordinates.latitude, true)}, ${formatCoord(context.location.coordinates.longitude, false)}`}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<CloudSun size={20} />}
                  label="Cuaca"
                  value={context.weather?.condition || "Belum tersedia"}
                  subValue={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : "Menanti data sinkron"}
                />
                <DetailItem
                  icon={<Thermometer size={20} />}
                  label="Suhu"
                  value={context.weather?.temperatureCelsius !== undefined && context.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : "Belum tersedia"}
                  subValue={context.weather?.feelsLikeCelsius !== undefined && context.weather?.feelsLikeCelsius !== null ? `Terasa seperti ${context.weather.feelsLikeCelsius}°C` : undefined}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Sun size={20} />}
                  label="Matahari"
                  value={context.astronomy?.sunrise ? `Terbit ${context.astronomy.sunrise}` : "Belum tersedia"}
                  subValue={context.astronomy?.sunset ? `Terbenam ${context.astronomy.sunset}` : "Menanti siklus hari"}
                />
                <DetailItem
                  icon={<Moon size={20} />}
                  label="Bulan"
                  value={normalizeMoonPhaseLabel(context.moon?.phase)}
                  subValue={context.moon?.illuminationPercent !== undefined && context.moon?.illuminationPercent !== null ? `${context.moon.illuminationPercent}% cahaya` : "Menanti fase malam"}
                />
              </div>

              <DetailItem
                icon={<Leaf size={24} />}
                label="Kualitas Udara (AQI)"
                value={context.airQuality?.aqi !== undefined && context.airQuality?.aqi !== null ? `${context.airQuality.aqi} — ${context.airQuality.label}` : "Belum tersedia"}
                subValue="Kualitas udara di sekitarmu saat ini."
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Wind size={20} />}
                  label="Angin"
                  value={context.weather?.windSpeedKph !== undefined && context.weather?.windSpeedKph !== null ? `${context.weather.windSpeedKph} km/jam` : "Belum tersedia"}
                />
                <DetailItem
                  icon={<Droplets size={20} />}
                  label="Kelembapan"
                  value={context.weather?.humidityPercent !== undefined && context.weather?.humidityPercent !== null ? `${context.weather.humidityPercent}%` : "Belum tersedia"}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<Gauge size={20} />}
                  label="Tekanan"
                  value={context.weather?.pressureHpa !== undefined && context.weather?.pressureHpa !== null ? `${context.weather.pressureHpa} hPa` : "Belum tersedia"}
                />
                <DetailItem
                  icon={<Zap size={20} />}
                  label="Indeks UV"
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
                label="Aktivitas Bumi"
                value={context.earthActivity?.status || "Stabil"}
                subValue={context.earthActivity?.latestEarthquake?.title || "Memantau getaran dan pergerakan tanah."}
              />
            </div>
          ) : null}

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
