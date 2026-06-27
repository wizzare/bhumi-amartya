import type { EnvironmentLocation, EnvironmentSourceMeta } from "@/lib/environment/types";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export type EnvironmentPermissionState = "granted" | "prompt" | "denied" | "unsupported";

export interface EnvironmentLocationOptions {
  enableHighAccuracy?: boolean;
  timeoutMs?: number;
  maximumAgeMs?: number;
}

function gpsSource(status: EnvironmentSourceMeta["status"], message?: string): EnvironmentSourceMeta {
  return {
    source: "device_gps",
    status,
    observedAt: new Date().toISOString(),
    message,
  };
}

export function mapLocationError(error: any): Error {
  const code = error?.code;
  const message = error?.message || "";
  
  if (code === 1 || message.includes("denied") || message.includes("permission") || message.includes("Permission")) {
    const err = new Error("Izin lokasi belum aktif. Bhumi membutuhkan izin lokasi agar bisa membaca kondisi lingkungan terdekatmu.");
    (err as any).status = "permission_denied";
    return err;
  }
  if (code === 3 || message.includes("timeout") || message.includes("Timeout")) {
    const err = new Error("Pembacaan lokasi terlalu lama. Coba lagi dengan koneksi dan GPS yang aktif.");
    (err as any).status = "timeout";
    return err;
  }
  if (code === 2 || message.includes("unavailable") || message.includes("location disabled") || message.includes("GPS") || message.includes("disable")) {
    const err = new Error("Lokasi belum bisa terbaca saat ini. Coba lagi sebentar lagi.");
    (err as any).status = "unavailable";
    return err;
  }
  
  const err = new Error("Kondisi lingkungan belum bisa dibaca saat ini. Coba lagi sebentar lagi.");
  (err as any).status = "error";
  return err;
}

export async function getEnvironmentLocationPermission(): Promise<EnvironmentPermissionState> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Geolocation.checkPermissions();
      const state = check.location; // 'granted' | 'denied' | 'prompt' | 'prompt-with-rationale'
      if (state === "granted") return "granted";
      if (state === "denied") return "denied";
      return "prompt";
    } catch (e) {
      console.warn("[GEOLOCATION] Failed checking native permissions:", e);
      return "prompt";
    }
  }

  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return "unsupported";
  }

  if (!("permissions" in navigator)) {
    return "prompt";
  }

  try {
    const result = await navigator.permissions.query({ name: "geolocation" as any });
    return result.state as EnvironmentPermissionState;
  } catch {
    return "prompt";
  }
}

export async function requestCurrentEnvironmentLocation(
  options: EnvironmentLocationOptions = {},
): Promise<EnvironmentLocation> {
  if (Capacitor.isNativePlatform()) {
    try {
      const check = await Geolocation.checkPermissions();
      if (check.location !== "granted") {
        const req = await Geolocation.requestPermissions();
        if (req.location !== "granted") {
          throw { code: 1, message: "User denied Geolocation" };
        }
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeoutMs ?? 10000,
        maximumAge: options.maximumAgeMs ?? 300000,
      });

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
        },
        timezone,
        elevationMeters: position.coords.altitude ?? undefined,
        source: gpsSource("available"),
      };
    } catch (error: any) {
      throw mapLocationError(error);
    }
  }

  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    throw new Error("GPS perangkat tidak tersedia di lingkungan ini.");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        resolve({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
          },
          timezone,
          elevationMeters: position.coords.altitude ?? undefined,
          source: gpsSource("available"),
        });
      },
      (error) => {
        reject(mapLocationError(error));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeoutMs ?? 10000,
        maximumAge: options.maximumAgeMs ?? 300000,
      },
    );
  });
}
