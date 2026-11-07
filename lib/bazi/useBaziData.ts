"use client";

import { useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { revisionOf } from "@/lib/profile/canonicalState";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import type { BaziBlueprint } from "@/lib/bazi/types";

export type BaziDataStatus = "loading" | "ready" | "unavailable" | "error";
export interface BaziProfileInfo {
  name: string;
  birthDate: string;
  birthTime: string | null;
  timezone: string;
  gender: "male" | "female" | null;
  isHourProvided: boolean;
  isCanonical?: boolean;
}
export interface BaziDataState {
  status: BaziDataStatus;
  uid: string | null;
  profile: BaziProfileInfo | null;
  bazi: BaziBlueprint | null;
  isCanonical?: boolean;
  errorMessage?: string;
}

export function useBaziData(activeUid?: string | null): BaziDataState {
  const auth = useAuth();
  const profile = auth?.userProfile;
  return useMemo(() => {
    const empty = { uid: activeUid ?? null, profile: null, bazi: null };
    if (auth?.authLoading || auth?.profileLoading) return { ...empty, status: "loading" };
    if (!activeUid || auth?.user?.uid !== activeUid || !profile || profile.uid !== activeUid) {
      return { ...empty, status: "unavailable", errorMessage: "Data kelahiran belum tersedia." };
    }
    const birthDate = profile.birthDate;
    const birthTime = profile.birthTime || null;
    const timezone = profile.timezone || "Asia/Jakarta";
    if (!birthDate) return { ...empty, status: "unavailable", errorMessage: "Data kelahiran belum lengkap." };
    const profileGender = (profile as unknown as Record<string, unknown>).gender;
    const gender = profileGender === "male" || profileGender === "female" ? profileGender : null;
    const isHourProvided = Boolean(birthTime && birthTime.trim() && birthTime !== "—");
    const isCanonical = Boolean(revisionOf(profile));
    try {
      return {
        status: "ready",
        uid: activeUid,
        isCanonical,
        profile: {
          name: profile.displayName || profile.fullName || "Pengguna Bhumi",
          birthDate,
          birthTime: isHourProvided ? birthTime : null,
          timezone,
          gender,
          isHourProvided,
          isCanonical,
        },
        bazi: calculateBazi({ birthDate, birthTime: isHourProvided ? birthTime : null, timezone, gender, isHourProvided }),
      };
    } catch {
      return { ...empty, status: "error", errorMessage: "Terjadi kendala saat menghitung peta kelahiran BaZi." };
    }
  }, [activeUid, auth?.authLoading, auth?.profileLoading, auth?.user?.uid, profile]);
}
