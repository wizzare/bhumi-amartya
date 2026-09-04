"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHdState } from "@/lib/humandesign/hdState";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { userRepository } from "@/lib/repositories/userRepository";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { Timestamp } from "firebase/firestore";
import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

interface PendingHdRecoveryBannerProps {
  uid: string;
  blueprint: any;
  profile: any;
}

function hasBirthData(profile: any): boolean {
  const time = profile?.birthTime || profile?.timeOfBirth;
  const place = profile?.birthCity || profile?.birthPlace || profile?.cityOfBirth || profile?.placeOfBirth;
  return Boolean(time) && Boolean(place);
}

export function PendingHdRecoveryBanner({ uid, blueprint, profile }: PendingHdRecoveryBannerProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = isEnlEdition() || language === "en";
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  const hd = blueprint?.humanDesign || profile?.humanDesign;
  const hdState = getHdState(hd);
  const shouldDisplay = hdState.state === "PENDING" || hdState.state === "RETRIABLE_ERROR";

  const isFirestoreDismissed = Boolean(profile?.hdDismissedAt);

  const isRetriableError = hdState.state === "RETRIABLE_ERROR";
  const isMissingBirthData = !hasBirthData(profile);

  const { title, message, buttonLabel, buttonAction } = useMemo(() => {
    if (isMissingBirthData) {
      return {
        title: isEn ? "Incomplete Birth Data" : "Data Kelahiran Belum Lengkap",
        message: isEn
          ? "Complete your birth time and city so your soul blueprint can be read accurately."
          : "Lengkapi jam dan kota lahirmu agar peta jiwamu bisa terbaca dengan presisi.",
        buttonLabel: isEn ? "Complete Now" : "Lengkapi Sekarang",
        buttonAction: "settings" as const,
      };
    }
    if (isRetriableError) {
      return {
        title: isEn ? "Calculation Pending" : "Perhitungan Terkendala",
        message: isEn
          ? "Your Human Design chart calculation is not finished yet. Please try again or refresh the page."
          : "Peta Human Design belum selesai dihitung. Silakan coba lagi atau muat ulang halaman.",
        buttonLabel: isEn ? "Try Again" : "Coba Lagi",
        buttonAction: "reload" as const,
      };
    }
    return {
      title: isEn ? "Calculation in Progress" : "Perhitungan Sedang Berlangsung",
      message: isEn
        ? "Your Human Design chart is being processed. Results will appear once calculation finishes."
        : "Peta Human Design sedang diproses. Hasil akan muncul setelah perhitungan selesai.",
      buttonLabel: isEn ? "Try Again Later" : "Coba Lagi Nanti",
      buttonAction: "reload" as const,
    };
  }, [isMissingBirthData, isRetriableError, isEn]);

  if (!shouldDisplay || isFirestoreDismissed || localDismissed) {
    return null;
  }

  const handleDismiss = async () => {
    setLocalDismissed(true);
    if (!uid) return;
    try {
      setLoading(true);
      await userRepository.upsertUserProfile(uid, {
        hdDismissedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      } as any);
    } catch (err) {
      console.warn("[PendingHdBanner] Failed to persist dismiss flag to Firestore:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = async () => {
    if (buttonAction === "settings") {
      router.push("/settings");
      return;
    }

    setLoading(true);
    try {
      if (profile) {
        const nextHD = await calculateHumanDesign({
          birthDate: profile.birthDate || profile.dateOfBirth,
          birthTime: profile.birthTime || profile.timeOfBirth,
          birthCity: profile.birthCity || profile.birthPlace || profile.cityOfBirth || profile.placeOfBirth,
          timezone: profile.timezone || "+07:00",
          latitude: profile.latitude,
          longitude: profile.longitude,
        });

        // Build 106 hotfix: only persist a canonical recalculation. A failed
        // engine call returns a typeless local-fallback/pending chart; writing
        // that back would overwrite recoverable stored HD and trap the user on
        // "menghitung ulang". On failure keep existing data and just reload.
        if (blueprint && isCanonicalHumanDesign(nextHD)) {
          const nextBlueprint = {
            ...blueprint,
            humanDesign: nextHD,
            updatedAt: new Date().toISOString(),
          };
          await storageProvider.saveUserBlueprint(nextBlueprint);
        }
      }
      window.location.reload();
    } catch (err) {
      console.error("[PendingHdBanner] Recalculation failed:", err);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-5 mt-6 p-6 rounded-[2.5rem] bg-gradient-to-r from-[#8C7A6B] to-[#4F5E52] text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
      <div className="absolute -top-6 -right-6 p-4 opacity-15">
        <Sparkles size={140} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles size={20} className="text-amber-200 animate-pulse" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-base tracking-wide text-amber-100">
                {title}
              </h4>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            disabled={loading}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all opacity-80 hover:opacity-100"
            title={isEn ? "Dismiss temporarily" : "Tutup sementara"}
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-amber-50 font-normal">
          {message}
        </p>

        <button
          onClick={handleActionClick}
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-2xl bg-amber-100 hover:bg-white text-[#4F5E52] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <>
              <span>{buttonLabel}</span>
              {buttonAction === "reload" ? <RefreshCw size={16} /> : <ArrowRight size={16} />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
