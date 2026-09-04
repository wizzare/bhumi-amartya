"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { getHdState } from "@/lib/humandesign/hdState";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

interface AccuracyUpgradeBannerProps {
  uid: string;
  blueprint: any;
  profile: any;
}

export function AccuracyUpgradeBanner({ uid, blueprint, profile }: AccuracyUpgradeBannerProps) {
  const { language } = useLanguage();
  const isEn = isEnlEdition() || language === "en";
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hd = blueprint?.humanDesign;
  const hdState = getHdState(hd);
  const shouldDisplay = hdState.state === "FALLBACK_LABELED" && hdState.needsUpgrade;

  if (!shouldDisplay || dismissed) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const birthDate = profile?.birthDate || profile?.dateOfBirth || profile?.profile?.birthDate;
      const birthTime = profile?.birthTime || profile?.timeOfBirth || profile?.profile?.birthTime;
      const birthCity = profile?.birthCity || profile?.birthPlace || profile?.cityOfBirth || profile?.placeOfBirth || profile?.profile?.birthCity;
      const timezone = profile?.timezone || profile?.profile?.timezone || "+07:00";
      const latitude = profile?.latitude ?? profile?.profile?.latitude ?? null;
      const longitude = profile?.longitude ?? profile?.profile?.longitude ?? null;

      // Force recalculation using the canonical Gaia engine.
      const nextHD = await calculateHumanDesign({
        birthDate,
        birthTime,
        birthCity,
        timezone,
        latitude,
        longitude,
      });

      // Build 106 hotfix: only a canonical result may replace stored HD. If the
      // engine is unreachable it returns a typeless local-fallback/pending
      // chart; persisting that would strip a recoverable historical type and
      // strand the user on "menghitung ulang". Leave existing data intact.
      if (isCanonicalHumanDesign(nextHD)) {
        const nextBlueprint = {
          ...blueprint,
          humanDesign: { ...nextHD, needsUpgrade: false },
          updatedAt: new Date().toISOString()
        };
        await storageProvider.saveUserBlueprint(nextBlueprint);
        window.location.reload(); // Force refresh to see new identity
        return;
      }

      console.warn("[AccuracyUpgradeBanner] Recalculation did not return a canonical chart; existing HD preserved.");
      setDismissed(true);
    } catch (error) {
      console.error("Accuracy upgrade failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-5 mt-6 p-5 rounded-[2.5rem] bg-indigo-600 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={120} />
      </div>

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20">
              <Sparkles size={18} />
            </div>
            <h4 className="font-bold text-sm">
              {isEn ? "Accuracy Upgrade" : "Peningkatan Akurasi"}
            </h4>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 opacity-60 hover:opacity-100"
            aria-label={isEn ? "Dismiss" : "Tutup"}
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs leading-relaxed font-medium">
          {isEn
            ? "Your soul mapping precision has improved. Update your profile now for deeper inner alignment?"
            : "Akurasi pemetaan jiwamu kini lebih presisi. Perbarui profilmu sekarang untuk sinkronisasi batin yang lebih mendalam?"}
        </p>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-white text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
             <RefreshCw size={16} className="animate-spin" />
          ) : (
             isEn ? "Update Now" : "Perbarui Sekarang"
          )}
        </button>
      </div>
    </div>
  );
}
