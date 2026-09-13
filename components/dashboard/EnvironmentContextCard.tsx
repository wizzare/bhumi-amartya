"use client";

import { useEffect, useState } from "react";
import { Activity, Droplets, Globe, MapPin, Radio, Thermometer } from "lucide-react";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";
import { kpActivityLabel } from "@/lib/environment/schumann";
import {
  getEnvironmentLocationPermission,
  requestCurrentEnvironmentLocation,
  getNormalizedEnvironment,
  getCachedEnvironment,
  type EnvironmentLocation,
  type EnvironmentPermissionState,
  type EnvironmentContext,
} from "@/lib/environment/service";

type EnvironmentContextCardProps = {
  onOpenDetail?: () => void;
};

function formatCoord(val: number, isLat: boolean, isEn = false): string {
  const dir = isLat
    ? (val >= 0 ? (isEn ? "N" : "LU") : (isEn ? "S" : "LS"))
    : (val >= 0 ? (isEn ? "E" : "BT") : (isEn ? "W" : "BB"));
  return `${Math.abs(val).toFixed(2)}° ${dir}`;
}

function formatLocation(
  location: EnvironmentLocation | null,
  permission: EnvironmentPermissionState | null,
  t: Record<string, any>,
  isEn: boolean
): string {
  if (location?.cityOrRegency) return location.cityOrRegency;
  if (location?.coordinates) {
    return `${formatCoord(location.coordinates.latitude, true, isEn)}, ${formatCoord(location.coordinates.longitude, false, isEn)}`;
  }
  if (permission === "denied") return t.waitingPermission || (isEn ? "Awaiting your location permission" : "Menanti izin lokasimu");
  if (permission === "unsupported") return t.locationNotDetected || (isEn ? "Location not yet detected" : "Lokasi belum terbaca");
  return t.readingLocation || (isEn ? "Recognizing your location..." : "Mengenali lokasimu...");
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
  const isEn = false;
  const t = translations["id"].environment;
  const [permission, setPermission] = useState<EnvironmentPermissionState | null>(null);
  const [location, setLocation] = useState<EnvironmentLocation | null>(null);
  const [context, setContext] = useState<EnvironmentContext | null>(null);

  async function loadEnvironment() {
    const state = await getEnvironmentLocationPermission();
    setPermission(state);

    if (state === "denied" || state === "unsupported") return;

    try {
      const currentLocation = await requestCurrentEnvironmentLocation({ timeoutMs: 6000 });
      setLocation(currentLocation);

      // Show cached context immediately for fast paint.
      const cached = getCachedEnvironment(currentLocation.coordinates.latitude, currentLocation.coordinates.longitude);
      if (cached) {
        setContext({ ...cached, location: { ...cached.location, coordinates: currentLocation.coordinates, timezone: currentLocation.timezone } });
        if (cached.location.cityOrRegency) setLocation(cached.location);
      }

      // Fetch fresh data in background.
      const ctx = await getNormalizedEnvironment(currentLocation);
      setContext(ctx);
      setPermission("granted");

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
      const currentLocation = await requestCurrentEnvironmentLocation({ timeoutMs: 6000 });
      setLocation(currentLocation);
      setPermission("granted");
      
      const cached = getCachedEnvironment(currentLocation.coordinates.latitude, currentLocation.coordinates.longitude);
      if (cached) {
        setContext({ ...cached, location: { ...cached.location, coordinates: currentLocation.coordinates, timezone: currentLocation.timezone } });
        if (cached.location.cityOrRegency) setLocation(cached.location);
      }

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
        <h3 className="font-serif text-2xl font-bold text-[#4F6658]">{"🌍 " + t.title}</h3>
        <p className="mt-1 text-sm text-[#7B8776]">{t.subtitle}</p>
      </div>

      <article className="bhumi-card border-none bg-white p-5 shadow-sm">
        {permission === "denied" || permission === "prompt" ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <p className="text-sm font-medium text-[#7B8776] mb-4">
              {t.locationPermissionNeeded}
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={handleRequestLocation}
                className="rounded-full bg-[#4F6658] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#405247]"
              >
                {permission === "denied" ? t.retry : t.allowLocation}
              </button>
              {permission === "denied" && (
                <p className="text-[10px] text-[#9AA394] leading-relaxed mt-1">
                  {t.settingsHint}
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SummaryItem icon={<MapPin size={18} />} label={t.fLocation} value={formatLocation(location, permission, t, isEn)} />
                <SummaryItem icon={<Thermometer size={18} />} label={t.fTemperature} value={context?.weather?.temperatureCelsius !== undefined && context?.weather?.temperatureCelsius !== null ? `${context.weather.temperatureCelsius}°C` : t.unavailable} />
                <SummaryItem icon={<Droplets size={18} />} label={t.fHumidity} value={context?.weather?.humidityPercent !== undefined && context?.weather?.humidityPercent !== null ? `${context.weather.humidityPercent}%` : t.unavailable} />
                <SummaryItem icon={<Activity size={18} />} label={t.fEarthActivity} value={context?.earthActivity?.dataState === "available" ? (isEn && context.earthActivity.status === "Stabil" ? "Stable" : context.earthActivity.status) : t.unavailable} />
                <SummaryItem icon={<Globe size={18} />} label={t.fGeomagnetic} value={context?.spaceWeather?.kpIndex !== undefined ? kpActivityLabel(context.spaceWeather.kpIndex, isEn) : (context?.spaceWeather?.geomagneticActivity ?? t.unavailable)} />
              </div>

            {onOpenDetail && (
              <button
                type="button"
                onClick={onOpenDetail}
                className="mt-5 w-full rounded-full bg-[#4F6658] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#405247]"
              >
                {t.viewDetail}
              </button>
            )}
          </>
        )}
      </article>
    </section>
  );
}
