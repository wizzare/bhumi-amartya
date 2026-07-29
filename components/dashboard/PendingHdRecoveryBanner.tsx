"use client";

import React, { useMemo, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHdState } from "@/lib/humandesign/hdState";
import { userRepository } from "@/lib/repositories/userRepository";
import { Timestamp } from "firebase/firestore";

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
  const router = Router();
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  function Router() {
    return useRouter();
  }

  const hd = blueprint?.humanDesign || profile?.humanDesign;
  const hdState = getHdState(hd);
  const shouldDisplay = hdState.state === "PENDING" || hdState.state === "RETRIABLE_ERROR";

  const isFirestoreDismissed = Boolean(profile?.hdDismissedAt);

  const isRetriableError = hdState.state === "RETRIABLE_ERROR";
  const isMissingBirthData = !hasBirthData(profile);

  const { title, message, buttonLabel, buttonAction } = useMemo(() => {
    if (isMissingBirthData) {
      return {
        title: "Data Kelahiran Belum Lengkap",
        message: "Lengkapi jam dan kota lahirmu agar peta jiwamu bisa terbaca dengan presisi.",
        buttonLabel: "Lengkapi Sekarang",
        buttonAction: "settings" as const,
      };
    }
    if (isRetriableError) {
      return {
        title: "Perhitungan Terkendala",
        message: "Peta Human Design belum selesai dihitung. Silakan coba lagi atau muat ulang halaman.",
        buttonLabel: "Coba Lagi",
        buttonAction: "reload" as const,
      };
    }
    return {
      title: "Perhitungan Sedang Berlangsung",
      message: "Peta Human Design sedang diproses. Hasil akan muncul setelah perhitungan selesai.",
      buttonLabel: "Coba Lagi Nanti",
      buttonAction: "reload" as const,
    };
  }, [isMissingBirthData, isRetriableError]);

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

  const handleActionClick = () => {
    if (buttonAction === "settings") {
      router.push("/settings");
    } else {
      window.location.reload();
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
            title="Tutup sementara"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs leading-relaxed text-amber-50 font-normal">
          {message}
        </p>

        <button
          onClick={handleActionClick}
          className="w-full py-3.5 px-5 rounded-2xl bg-amber-100 hover:bg-white text-[#4F5E52] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          <span>{buttonLabel}</span>
          {buttonAction === "reload" ? <RefreshCw size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
}
