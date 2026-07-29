"use client";

import React, { useState } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { getHdState } from "@/lib/humandesign/hdState";

interface AccuracyUpgradeBannerProps {
  uid: string;
  blueprint: any;
  profile: any;
}

export function AccuracyUpgradeBanner({ uid, blueprint, profile }: AccuracyUpgradeBannerProps) {
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const hd = blueprint?.humanDesign;
  const hdState = getHdState(hd);
  const shouldDisplay = hdState.state === "FALLBACK_LABELED" && hdState.needsUpgrade;

  if (!shouldDisplay || dismissed) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Force recalculation using Kit (which now calls Python engine)
      const nextHD = await calculateHumanDesign({
        birthDate: profile.birthDate,
        birthTime: profile.birthTime,
        birthCity: profile.birthCity,
        timezone: profile.timezone,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });

      const nextBlueprint = {
        ...blueprint,
        humanDesign: { ...nextHD, needsUpgrade: false },
        updatedAt: new Date().toISOString()
      };

      await storageProvider.saveUserBlueprint(nextBlueprint);
      window.location.reload(); // Force refresh to see new identity
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
            <h4 className="font-bold text-sm">Peningkatan Akurasi</h4>
          </div>
          <button onClick={() => setDismissed(true)} className="p-1 opacity-60 hover:opacity-100">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs leading-relaxed font-medium">
          Akurasi pemetaan jiwamu kini lebih presisi. Perbarui profilmu sekarang untuk sinkronisasi batin yang lebih mendalam?
        </p>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-white text-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? (
             <RefreshCw size={16} className="animate-spin" />
          ) : (
             "Perbarui Sekarang"
          )}
        </button>
      </div>
    </div>
  );
}
