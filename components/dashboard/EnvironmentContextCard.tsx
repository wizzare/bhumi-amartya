"use client";

import { useEffect, useState } from "react";
import { Activity, CloudSun, Droplets, Leaf, MapPin, Thermometer } from "lucide-react";
import {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  getNormalizedEnvironment,
  type EnvironmentLocation,
  type EnvironmentPermissionState,
  type EnvironmentContext,
} from "@/lib/environment/service";

type EnvironmentContextCardProps = {
  onOpenDetail?: () => void;
};

function formatCoord(val: number, isLat: boolean): string {
  const dir = isLat ? (val >= 0 ? "LU" : "LS") : (val >= 0 ? "BT" : "BB");
  return `${Math.abs(val).toFixed(2)}° ${dir}`;
}

function formatLocation(location: EnvironmentLocation | null, permission: EnvironmentPermissionState | null): string {
  if (location?.cityOrRegency) return location.cityOrRegency;
  if (location?.coordinates) {
    return `${formatCoord(location.coordinates.latitude, true)}, ${formatCoord(location.coordinates.longitude, false)}`;
  }
  if (permission === "denied") return "Menanti izin lokasimu";
  if (permission === "unsupported") return "Lokasi belum terbaca";
  return "Mengenali lokasimu...";
}

function SummaryItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F8F6EF] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#4F6658]">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">{label}</p>
        <p className="truncate text-sm font-semibold text-[#4F6658]">{value}</p>
      </div>
    </div>
  );
}

export function EnvironmentContextCard({ onOpenDetail }: EnvironmentContextCardProps) {
  const [permission, setPermission] = useState<EnvironmentPermissionState | null>(null);
  const [location, setLocation] = useState<EnvironmentLocation | null>(null);
  const [context, setContext] = useState<EnvironmentContext | null>(null);

  async function loadEnvironment() {
    const state = await getEnvironmentLocationPermission();
    setPermission(state);

    if (state === "denied" || state === "unsupported") return;

    try {
      const currentLocation = await requestCurrentEnvironmentLocation();
      setLocation(currentLocation);

      // Use refactored logic from environment layer
      const ctx = await getNormalizedEnvironment(currentLocation);
      setContext(ctx);
      setPermission("granted");

      // Update local location state if service found a city name
      if (ctx.location.cityOrRegency) {
        setLocation(ctx.location);
      }
    } catch {
      setPermission("denied");
    }
  }

  useEffect(() => {
    let isMounted = true;
    void loadEnvironment();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRequestLocation() {
    try {
      const currentLocation = await requestCurrentEnvironmentLocation();
      setLocation(currentLocation);
      setPermission("granted");
      
      const ctx = await getNormalizedEnvironment(currentLocation);
      setContext(ctx);
      
      if (ctx.location.cityOrRegency) {
        setLocation(ctx.location);
      }
    } catch (err: any) {
      setPermission("denied");
    }
  }

  return (
    <section className="mt-10 space-y-4">
      <div className="px-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F6658]">🌍 Kondisi Lingkungan</h3>
        <p className="mt-1 text-sm text-[#7B8776]">Kondisi dunia di sekitarmu hari ini.</p>
      </div>

      <article className="bhumi-card border-none bg-white p-5 shadow-sm">
        {permission === "denied" || permission === "prompt" ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm font-medium text-[#7B8776] mb-4">
              Izin lokasi belum aktif. Bhumi membutuhkan izin lokasi agar bisa membaca kondisi lingkungan terdekatmu.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleRequestLocation}
                className="rounded-full bg-[#4F6658] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#405247]"
              >
                {permission === "denied" ? "Coba Lagi" : "Izinkan Lokasi"}
              </button>
              {permission === "denied" && (
                <p className="text-[10px] text-[#9AA394] leading-relaxed mt-1">
                  Atau buka Pengaturan Perangkat → Aplikasi → Bhumi Amartya → Izin → Lokasi.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SummaryItem icon={<MapPin size={18} />} label="Lokasi" value={formatLocation(location, permission)} />
              <SummaryItem icon={<CloudSun size={18} />} label="Cuaca" value={context?.weather?.condition || "Belum terbaca"} />
              <SummaryItem icon={<Thermometer size={18} />} label="Suhu" value={context?.weather?.temperatureCelsius ? `${context.weather.temperatureCelsius}°C` : "Belum terbaca"} />
              <SummaryItem icon={<Droplets size={18} />} label="Kelembapan" value={context?.weather?.humidityPercent !== undefined ? `${context.weather.humidityPercent}%` : "Belum terbaca"} />
              <SummaryItem icon={<Leaf size={18} />} label="AQI" value={context?.airQuality?.aqi ? `${context.airQuality.aqi} — ${context.airQuality.label}` : "Belum terbaca"} />
              <SummaryItem icon={<Activity size={18} />} label="Aktivitas Bumi" value={context?.earthActivity?.status || "Stabil"} />
            </div>

            {onOpenDetail && (
              <button
                type="button"
                onClick={onOpenDetail}
                className="mt-5 w-full rounded-full bg-[#4F6658] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#405247]"
              >
                Lihat Detail
              </button>
            )}
          </>
        )}
      </article>
    </section>
  );
}
