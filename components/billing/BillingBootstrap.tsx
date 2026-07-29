"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/context/AuthContext";

// Dynamic import only: googlePlayBilling.ts registers native Capacitor plugins
// ("App", "BhumiBilling") at module load time, which must never happen on web.
export function BillingBootstrap() {
  const auth = useAuth();
  const uid = auth?.user?.uid ?? null;

  useEffect(() => {
    if (!uid || !(Capacitor.getPlatform() === "android" && Capacitor.isNativePlatform())) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    import("@/lib/billing/googlePlayBilling").then((billing) => {
      if (cancelled) return;

      billing.setOnPostVerification(async () => {
        const fresh = await auth?.refreshUserProfile?.();
        if (!fresh?.isPremium) {
          console.warn("[BILLING BOOTSTRAP] Post-verification refresh completed but entitlement not yet premium.");
        }
      });

      billing.initializeGooglePlayBilling().catch((err) => {
        console.error("[BILLING BOOTSTRAP] initializeGooglePlayBilling failed:", err);
      });

      cleanup = () => billing.clearOnPostVerification();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return null;
}
