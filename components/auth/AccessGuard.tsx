"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type PremiumFeature } from "@/lib/access/accessControl";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { useAuth } from "@/context/AuthContext";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { isBuild110LocalQa } from "@/lib/config/localQa";
import type { UserProfile } from "@/lib/repositories/userRepository";
import { getAntiAbuseUxCopy } from "@/lib/antiAbuse/eligibilityUx";
import { retryCanonicalAccessVerification } from "@/lib/billing/canonicalAccessBootstrap";

type AccessGuardProps = {
  children: React.ReactNode;
  feature: PremiumFeature;
};

export function AccessGuard({ children, feature }: AccessGuardProps) {
  const auth = useAuth();
  const authRef = useRef(auth);
  useEffect(() => {
    authRef.current = auth;
  }, [auth]);
  const router = useRouter();
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [resolvedProfile, setResolvedProfile] = useState<UserProfile | null>(null);
  const [resolveUnavailable, setResolveUnavailable] = useState(false);
  const [resolveAttempt, setResolveAttempt] = useState(0);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [clockTick, setClockTick] = useState(0);
  const reconciledUidRef = useRef<string | null>(null);

  useEffect(() => {
    const currentAuth = authRef.current;
    if (!currentAuth?.authStateResolved || currentAuth.authLoading || currentAuth.profileLoading) return;
    const authUid = currentAuth.user?.uid;
    if (!authUid) {
      setResolvedProfile(null);
      setCheckingProfile(false);
      return;
    }
    if (currentAuth.userProfile?.uid === authUid && currentAuth.userProfile.setupCompleted === true) {
      setResolvedProfile(currentAuth.userProfile);
      setResolveUnavailable(false);
      setCheckingProfile(false);
      return;
    }
    if (reconciledUidRef.current === authUid) {
      setResolvedProfile(currentAuth.userProfile ?? null);
      setCheckingProfile(false);
      return;
    }
    let cancelled = false;

    reconciledUidRef.current = authUid;
    setHasAccess(false);
    setCheckingAccess(true);
    setTesterRecord(null);
    setCheckingProfile(true);
    setResolveUnavailable(false);
    void resolveActiveProfile(currentAuth).then((resolved) => {
      if (cancelled || resolved.isLoading) return;
      setResolvedProfile(resolved.profile as unknown as UserProfile | null);
      setResolveUnavailable(resolved.isUnavailable);
      setCheckingProfile(false);
    });

    return () => {
      cancelled = true;
    };
  }, [auth?.authLoading, auth?.authStateResolved, auth?.user?.uid, auth?.userProfile, resolveAttempt]);

  const uid = typeof resolvedProfile?.uid === "string" ? resolvedProfile.uid : undefined;
  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    getFounderTesterRecord(uid).catch(() => null).then((record) => {
      if (!cancelled) setTesterRecord(record);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const userProfile = resolvedProfile;

  useEffect(() => {
    if (checkingProfile) return;
    let cancelled = false;
    async function checkAccess() {
      // 1. Synchronous Firestore entitlement check
      const syncStatus = getEntitlementStatus(userProfile || null, new Date(), testerRecord);
      setExpiresAt(syncStatus.expiresAt ?? null);
      if (syncStatus.isPremium) {
        if (!cancelled) {
          setHasAccess(true);
          setCheckingAccess(false);
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
                setCheckingAccess(false);
              }
              return;
            }
          }
        } catch (err) {
          console.warn("[ACCESS_GUARD] Signed token check failed:", err);
        }
      }

      if (!cancelled) {
        setHasAccess(false);
        setCheckingAccess(false);
      }
    }

    setCheckingAccess(true);
    checkAccess();

    return () => {
      cancelled = true;
    };
  }, [checkingProfile, userProfile, testerRecord, clockTick]);

  // Real-time wall-clock timer & visibility/focus listener for instant expiration
  useEffect(() => {
    if (!hasAccess || !expiresAt) return;

    const msUntilExpiry = expiresAt.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      setClockTick((t) => t + 1);
      return;
    }

    const delay = Math.min(Math.max(100, msUntilExpiry), 2_147_483_647);
    const timer = setTimeout(() => {
      setClockTick((t) => t + 1);
    }, delay);

    const onVisibleOrFocus = () => {
      if (Date.now() >= expiresAt.getTime()) {
        setClockTick((t) => t + 1);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", onVisibleOrFocus);
      document.addEventListener("visibilitychange", onVisibleOrFocus);
    }

    return () => {
      clearTimeout(timer);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", onVisibleOrFocus);
        document.removeEventListener("visibilitychange", onVisibleOrFocus);
      }
    };
  }, [hasAccess, expiresAt]);

  if (
    (process.env.NODE_ENV === "development" &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("bhumi_audit_user"))
  ) {
    return <>{children}</>;
  }

  if (!auth || auth.loading || checkingProfile || checkingAccess) {
    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <p className="text-sm text-[#7B8776]">Menyelaraskan akses...</p>
      </div>
    );
  }

  if (resolveUnavailable) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 flex items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm border border-[#E8E9E5]">
          <p className="text-sm leading-relaxed text-[#7B8776] mb-6">
            Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.
          </p>
          <button
            type="button"
            onClick={() => {
              reconciledUidRef.current = null;
              setResolveAttempt((attempt) => attempt + 1);
            }}
            className="w-full rounded-2xl bg-[#4F5E52] px-5 py-4 text-sm font-bold text-white"
          >
            Coba Lagi
          </button>
        </section>
      </main>
    );
  }

  if (hasAccess) return <>{children}</>;

  const antiAbuseBanner = getAntiAbuseUxCopy(userProfile as Record<string, unknown> | null);

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm border border-[#E8E9E5]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9AA394] mb-3">
          Akses Bhumi
        </p>
        <h1 className="text-2xl font-serif text-[#4F5E52] mb-3">
          {antiAbuseBanner ? antiAbuseBanner.title : "Perjalanan Berlanjut dari Dashboard"}
        </h1>
        <p className="text-sm leading-relaxed text-[#7B8776] mb-8">
          {antiAbuseBanner ? antiAbuseBanner.description : "Masa akses penuh akun ini sudah selesai. Dashboard tetap terbuka untuk melihat status dan langkah berikutnya."}
        </p>
        <button
          type="button"
          onClick={() => router.replace("/premium-bhumi")}
          className="w-full rounded-2xl bg-[#4F5E52] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#3D4A3F] mb-3"
        >
          {antiAbuseBanner ? antiAbuseBanner.primaryCtaLabel : "Buka Premium Bhumi"}
        </button>
        {antiAbuseBanner ? (
          <div className="mb-3 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => router.replace("/premium-bhumi?restore=1")}
              className="w-full rounded-2xl border border-[#4F5E52] px-5 py-3.5 text-sm font-bold text-[#4F5E52] bg-white transition-colors hover:bg-[#F2F4F0]"
            >
              {antiAbuseBanner.restoreCtaLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                void auth?.logout?.().finally(() => router.replace("/login"));
              }}
              className="w-full rounded-2xl border border-[#D8DDD5] px-5 py-3 text-xs font-semibold text-[#5F6B5E] bg-white transition-colors hover:bg-[#F7F4EE]"
            >
              {antiAbuseBanner.switchAccountCtaLabel}
            </button>
            <button
              type="button"
              onClick={() => {
                const u = auth?.user;
                if (u && typeof u.getIdToken === "function") {
                  void retryCanonicalAccessVerification(u.uid, (f) => u.getIdToken(f), async () => {
                    reconciledUidRef.current = null;
                    setResolveAttempt((attempt) => attempt + 1);
                  }).then((res) => {
                    if (!res.ok) router.replace("/bantuan#verifikasi-perangkat");
                  });
                } else {
                  router.replace("/bantuan#verifikasi-perangkat");
                }
              }}
              className="w-full rounded-2xl border border-[#D8DDD5] px-5 py-3 text-xs font-semibold text-[#5F6B5E] bg-white transition-colors hover:bg-[#F7F4EE]"
            >
              {antiAbuseBanner.verifyAccountCtaLabel}
            </button>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => router.replace("/dashboard")}
          className="w-full rounded-2xl border border-[#4F5E52] px-5 py-4 text-sm font-bold text-[#4F5E52] bg-white transition-colors hover:bg-[#F2F4F0]"
        >
          Kembali ke Dashboard
        </button>
      </section>
    </main>
  );
}
