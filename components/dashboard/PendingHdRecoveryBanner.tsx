"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";
import { userRepository } from "@/lib/repositories/userRepository";
import { Timestamp } from "firebase/firestore";

interface PendingHdRecoveryBannerProps {
  uid: string;
  blueprint: any;
  profile: any;
}

export function PendingHdRecoveryBanner({ uid, blueprint, profile }: PendingHdRecoveryBannerProps) {
  const router = Router();
  const [localDismissed, setLocalDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  function Router() {
    return useRouter();
  }

  const hd = blueprint?.humanDesign || profile?.humanDesign;
  const status = String(hd?.status || hd?.calculationStatus || "").toLowerCase();
  const type = hd?.type || hd?.energyType;

  // Check if status is pending, missing input, missing location, or needs verified timezone
  const isPendingStatus =
    status === "pending" ||
    status === "missing-input" ||
    status === "missing-location" ||
    status === "needs_verified_timezone" ||
    (!type && !isCanonicalHumanDesign(hd));

  // Check if user has already dismissed the banner in Firestore
  const isFirestoreDismissed = Boolean(profile?.hdDismissedAt);

  if (!isPendingStatus || isFirestoreDismissed || localDismissed) {
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
    router.push("/settings");
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
                Pesan dari Bhumi ✨
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
          Lengkapi jam dan kota lahirmu agar peta jiwamu bisa terbaca dengan presisi.
        </p>

        <button
          onClick={handleActionClick}
          className="w-full py-3.5 px-5 rounded-2xl bg-amber-100 hover:bg-white text-[#4F5E52] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
        >
          <span>Lengkapi Sekarang</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
