"use client";

import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { revisionOf } from "@/lib/profile/canonicalState";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import type {
  VedicBlueprint,
  VedicPartialBlueprint,
} from "@/lib/vedic/types";

export type VedicDataStatus = "loading" | "ready" | "partial" | "unavailable" | "error";

export interface VedicProfileInfo {
  name: string;
  birthDate: string;
  birthTime: string | null;
  birthCity: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
  isTimeProvided: boolean;
  isCanonical?: boolean;
}

export interface VedicDataState {
  status: VedicDataStatus;
  uid: string | null;
  profile: VedicProfileInfo | null;
  vedic: VedicBlueprint | VedicPartialBlueprint | null;
  editorial: Record<string, unknown> | null;
  activeAsOfDate: string;
  setEvaluationDate: (dateStr: string) => void;
  isCanonical?: boolean;
  errorMessage?: string;
}

const CITY_FALLBACKS: Record<string, { latitude: number; longitude: number; timezone: string }> = {
  jakarta: { latitude: -6.2088, longitude: 106.8456, timezone: "+07:00" },
  bandung: { latitude: -6.9175, longitude: 107.6191, timezone: "+07:00" },
  surabaya: { latitude: -7.2575, longitude: 112.7521, timezone: "+07:00" },
  yogyakarta: { latitude: -7.7956, longitude: 110.3695, timezone: "+07:00" },
  denpasar: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
  bali: { latitude: -8.65, longitude: 115.2167, timezone: "+08:00" },
};

export function useVedicData(activeUid?: string | null): VedicDataState {
  const [evaluationDate, setEvaluationDateState] = useState<string>("2026-11-01");
  const setEvaluationDate = useCallback((dateStr: string) => setEvaluationDateState(dateStr), []);
  const auth = useAuth();
  const profile = auth?.userProfile;
  return useMemo(() => {
    const empty = { uid: activeUid ?? null, profile: null, vedic: null, editorial: null, activeAsOfDate: evaluationDate, setEvaluationDate };
    if (auth?.authLoading || auth?.profileLoading) return { ...empty, status: "loading" };
    if (!activeUid || auth?.user?.uid !== activeUid || !profile || profile.uid !== activeUid) {
      return { ...empty, status: "unavailable", errorMessage: "Data kelahiran belum tersedia." };
    }
    const birthDate = profile.birthDate;
    const birthTime = profile.birthTime || null;
    const birthCity = profile.birthCity || profile.birthPlace;

    const cityKey = Object.keys(CITY_FALLBACKS).find((key) => (birthCity || "").toLowerCase().includes(key));
    const fallback = cityKey ? CITY_FALLBACKS[cityKey] : undefined;
    const latitude = typeof profile.latitude === "number" && Number.isFinite(profile.latitude) ? profile.latitude : fallback?.latitude;
    const longitude = typeof profile.longitude === "number" && Number.isFinite(profile.longitude) ? profile.longitude : fallback?.longitude;
    const timezone = profile.timezone || fallback?.timezone;

    if (!birthDate || !birthCity || !timezone || typeof latitude !== "number" || !Number.isFinite(latitude) || typeof longitude !== "number" || !Number.isFinite(longitude)) {
      return { ...empty, status: "unavailable", errorMessage: "Data kelahiran belum lengkap." };
    }
    const isTimeProvided = Boolean(birthTime && birthTime.trim() && birthTime !== "—" && birthTime.includes(":"));
    const isCanonical = Boolean(revisionOf(profile));
    const profileInfo: VedicProfileInfo = {
      name: profile.displayName || profile.fullName || "Pengguna Bhumi",
      birthDate,
      birthTime: isTimeProvided ? birthTime : null,
      birthCity,
      latitude,
      longitude,
      timezone,
      isTimeProvided,
      isCanonical,
    };
    const asOf = new Date(`${evaluationDate}T00:00:00Z`);
    try {
      if (isTimeProvided && birthTime) {
        const calculated = calculateVedic({ birthDate, birthTime, birthCity, latitude, longitude, timezone, asOf });
        return { ...empty, status: "ready", isCanonical, profile: profileInfo, vedic: calculated, editorial: null };
      }
      const partial = calculateVedic({ birthDate, birthTime: null, birthCity, latitude, longitude, timezone, asOf });
      return { ...empty, status: "partial", isCanonical, profile: profileInfo, vedic: partial, editorial: null };
    } catch {
      return { ...empty, status: "error", errorMessage: "Terjadi kendala saat menghitung peta kelahiran Vedic Jyotish." };
    }
  }, [activeUid, auth?.authLoading, auth?.profileLoading, auth?.user?.uid, profile, evaluationDate, setEvaluationDate]);
}
