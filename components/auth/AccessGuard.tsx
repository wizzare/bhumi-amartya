"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type PremiumFeature } from "@/lib/access/accessControl";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { useAuth } from "@/context/AuthContext";

type AccessGuardProps = {
  children: React.ReactNode;
  feature: PremiumFeature;
};

export function AccessGuard({ children, feature }: AccessGuardProps) {
  const auth = useAuth();
  const router = useRouter();
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);

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

  if (
    process.env.NODE_ENV === "development" &&
    typeof window !== "undefined" &&
    window.localStorage.getItem("bhumi_audit_user")
  ) {
    return <>{children}</>;
  }

  if (!auth || auth.loading) return <>{children}</>;

  const hasAccess = getEntitlementStatus(auth.userProfile, new Date(), testerRecord).isPremium;
  if (hasAccess) return <>{children}</>;

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm border border-[#E8E9E5]">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9AA394] mb-3">
          Akses Bhumi
        </p>
        <h1 className="text-2xl font-serif text-[#4F5E52] mb-3">
          Perjalanan Berlanjut dari Dashboard
        </h1>
        <p className="text-sm leading-relaxed text-[#7B8776] mb-8">
          Masa akses penuh akun ini sudah selesai. Dashboard tetap terbuka untuk melihat status dan langkah berikutnya.
        </p>
        <button
          type="button"
          onClick={() => router.replace("/dashboard")}
          className="w-full rounded-2xl bg-[#4F5E52] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#3D4A3F] mb-3"
        >
          Kembali ke Dashboard
        </button>
        <button
          type="button"
          onClick={() => router.replace("/premium-bhumi")}
          className="w-full rounded-2xl border border-[#4F5E52] px-5 py-4 text-sm font-bold text-[#4F5E52] bg-white transition-colors hover:bg-[#F2F4F0]"
        >
          Buka Premium Bhumi
        </button>
      </section>
    </main>
  );
}
