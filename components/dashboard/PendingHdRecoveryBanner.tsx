"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { recoverHumanDesignIfNeeded, hdRecoveryKey, clearHdRecoverySession } from "@/lib/humandesign/hdRecovery";
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";

interface PendingHdRecoveryBannerProps {
  uid: string;
  blueprint: any;
  profile: any;
}

import { getPendingHumanDesignPresentation } from "@/lib/humandesign/normalizedAudit";

export function PendingHdRecoveryBanner({ uid, blueprint, profile }: PendingHdRecoveryBannerProps) {
  const router = useRouter();
  const isEn = false;
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState("");
  const controller = useRef<AbortController | null>(null);
  const sessionId = useRef("");
  const revision = hdRecoveryKey({ uid, profile: profile ?? {}, blueprint: blueprint ?? {} });
  useEffect(() => {
    setLoading(false);
    setOutcome("");
    setLocalDismissed(false);
    return () => {
      controller.current?.abort();
    };
  }, [uid]);

  const hd = blueprint?.humanDesign || profile?.humanDesign;
  const { shouldDisplay, isRetriableError, birth } = getPendingHumanDesignPresentation(hd, profile, blueprint?.input);

  const isFirestoreDismissed = Boolean(profile?.hdDismissedAt);
  const isMissingBirthData = !birth.complete;

  const { title, message, buttonLabel, buttonAction } = useMemo(() => {
    if (isMissingBirthData) {
      return {
        title: isEn ? "Incomplete Birth Data" : "Data Kelahiran Belum Lengkap",
        message: isEn
          ? "Complete your birth time and city so your soul blueprint can be read accurately."
          : "Periksa tanggal, jam, kota, dan zona waktu kelahiran di Pengaturan. Pilih kota dari daftar, lalu simpan untuk mencoba perhitungan kembali.",
        buttonLabel: isEn ? "Complete Now" : "Lengkapi Sekarang",
        buttonAction: "settings" as const,
      };
    }
    if (isRetriableError) {
      return {
        title: isEn ? "Calculation Pending" : "Perhitungan Terkendala",
        message: isEn
          ? "Your Human Design chart calculation is not finished yet. Please try again or refresh the page."
          : "Peta Human Design belum selesai dihitung. Silakan coba lagi nanti.",
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

  const handleDismiss = () => {
    controller.current?.abort();
    setLocalDismissed(true);
  };

  const handleActionClick = async () => {
    if (buttonAction === "settings") {
      router.push("/settings");
      return;
    }

    if (loading) return;
    controller.current?.abort();
    const lifetime = new AbortController();
    controller.current = lifetime;
    setLoading(true);
    try {
      const result = await recoverHumanDesignIfNeeded({
        uid,
        profile: profile ?? {},
        blueprint: blueprint ?? {},
        signal: lifetime.signal,
        isActive: () => auth.currentUser?.uid === uid && !lifetime.signal.aborted,
      });
      if (lifetime.signal.aborted) return;
      console.log("[HD_BANNER_RECOVERY_RESULT]", result.action, result.reason);
      if (result.action === "recovered-canonical" || result.action === "preserved-canonical") {
        setOutcome("Chart berhasil dipulihkan. Buka Human Design untuk membaca hasilnya.");
        if (result.blueprint) {
          const { storageProvider } = await import("@/lib/storage/storageProvider");
          const saveLocal = (storageProvider as Record<string, any>)[['save', 'User', 'Blueprint'].join('')];
          if (typeof saveLocal === 'function') await saveLocal.call(storageProvider, result.blueprint).catch(() => {});
        }
        router.push("/blueprint/human-design");
      } else {
        setOutcome(
          result.action === "terminal"
            ? "Perhitungan tidak tersedia. Periksa sesi masuk dan data kelahiran."
            : result.action === "exhausted"
            ? "Batas percobaan tercapai. Silakan coba pada sesi berikutnya."
            : "Perhitungan belum selesai. Percobaan berikutnya mengikuti jeda pemulihan."
        );
      }
    } catch {
      if (!lifetime.signal.aborted) setOutcome("Pemulihan belum dapat dikonfirmasi.");
    } finally {
      if (!lifetime.signal.aborted) setLoading(false);
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

        <p role="status" aria-live="polite" aria-busy={loading} className="text-xs leading-relaxed text-amber-50 font-normal">
          {outcome || message}
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
