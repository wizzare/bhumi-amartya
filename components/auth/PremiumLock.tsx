"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PremiumFeature } from "@/lib/access/accessControl";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { useAuth } from "@/context/AuthContext";
import { getAntiAbuseUxCopy } from "@/lib/antiAbuse/eligibilityUx";
import { retryCanonicalAccessVerification } from "@/lib/billing/canonicalAccessBootstrap";

interface PremiumLockProps {
  children: React.ReactNode;
  feature: PremiumFeature;
}

export function PremiumLock({ children, feature }: PremiumLockProps) {
  const auth = useAuth();
  const router = useRouter();
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [checking, setChecking] = useState(true);

  const uid = auth?.userProfile?.uid;
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    getFounderTesterRecord(uid).then((record) => {
      if (!cancelled) setTesterRecord(record);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const userProfile = auth?.userProfile;

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      // 1. Synchronous Firestore entitlement check
      const syncAccess = getEntitlementStatus(userProfile || null, new Date(), testerRecord).isPremium;
      if (syncAccess) {
        if (!cancelled) {
          setHasAccess(true);
          setChecking(false);
        }
        return;
      }

      // 2. Fallback: Signed entitlement check
      if (userProfile?.uid) {
        try {
          const { getLocalSignedEntitlement, verifySignedEntitlementLocal } = await import("@/lib/billing/googlePlayBilling");
          const token = await getLocalSignedEntitlement(userProfile.uid);
          if (token) {
            const isValid = await verifySignedEntitlementLocal(token, userProfile.uid);
            if (isValid) {
              if (!cancelled) {
                setHasAccess(true);
                setChecking(false);
              }
              return;
            }
          }
        } catch (err) {
          console.warn("[PREMIUM_LOCK] Signed token check failed:", err);
        }
      }

      if (!cancelled) {
        setHasAccess(false);
        setChecking(false);
      }
    }

    setChecking(true);
    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [userProfile, testerRecord]);

  if (!auth || auth.loading || checking) return <>{children}</>;

  if (hasAccess) {
    return <>{children}</>;
  }

  const antiAbuseBanner = getAntiAbuseUxCopy(userProfile as Record<string, unknown> | null);

  return (
    <div className="relative">
      <div className="blur-[6px] pointer-events-none select-none">
        {children}
      </div>

      <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl border border-[#4F5E52]/10 shadow-xl text-center max-w-sm">
          <div className="text-2xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-[#4F5E52] mb-2">
            {antiAbuseBanner ? antiAbuseBanner.title : "Fitur Premium"}
          </h3>
          <p className="text-sm text-[#7B8776] mb-6 leading-relaxed">
            {antiAbuseBanner ? antiAbuseBanner.description : "Fitur ini tersedia untuk pengguna Premium. Upgrade untuk melanjutkan."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.replace("/premium-bhumi")}
              className="block w-full py-4 px-6 bg-[#4F5E52] text-white rounded-2xl font-medium shadow-md hover:bg-[#3D4A3F] transition-all"
            >
              {antiAbuseBanner ? antiAbuseBanner.primaryCtaLabel : "Lihat Premium"}
            </button>
            {antiAbuseBanner ? (
              <button
                onClick={() => router.replace("/premium-bhumi?restore=1")}
                className="block w-full py-3 px-6 border border-[#4F5E52]/30 text-[#4F5E52] bg-white rounded-2xl text-sm font-medium hover:bg-[#F7F4EE] transition-all"
              >
                {antiAbuseBanner.restoreCtaLabel}
              </button>
            ) : null}
            {antiAbuseBanner ? (
              <button
                onClick={() => {
                  void auth?.logout?.().finally(() => router.replace("/login"));
                }}
                className="block w-full py-2.5 px-6 border border-[#D8DDD5] text-[#5F6B5E] bg-white rounded-2xl text-xs font-medium hover:bg-[#F7F4EE] transition-all"
              >
                {antiAbuseBanner.switchAccountCtaLabel}
              </button>
            ) : null}
            {antiAbuseBanner ? (
              <button
                onClick={() => {
                  const u = auth?.user;
                  if (u && typeof u.getIdToken === "function") {
                    void retryCanonicalAccessVerification(u.uid, (f) => u.getIdToken(f), async () => {
                      await auth?.refreshUserProfile?.();
                    }).then((res) => {
                      if (!res.ok) router.replace("/bantuan#verifikasi-perangkat");
                    });
                  } else {
                    router.replace("/bantuan#verifikasi-perangkat");
                  }
                }}
                className="block w-full py-2.5 px-6 border border-[#D8DDD5] text-[#5F6B5E] bg-white rounded-2xl text-xs font-medium hover:bg-[#F7F4EE] transition-all"
              >
                {antiAbuseBanner.verifyAccountCtaLabel}
              </button>
            ) : null}
            <button
              onClick={() => router.replace("/dashboard")}
              className="block w-full py-4 px-6 border border-[#4F5E52] text-[#4F5E52] bg-white rounded-2xl font-medium shadow-sm hover:bg-[#F2F4F0] transition-all"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
