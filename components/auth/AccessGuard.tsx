"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { canAccessPremiumFeature, type PremiumFeature } from "@/lib/access/accessControl";
import { useAuth } from "@/context/AuthContext";

type AccessGuardProps = {
  children: React.ReactNode;
  feature: PremiumFeature;
};

export function AccessGuard({ children, feature }: AccessGuardProps) {
  const auth = useAuth();
  const router = useRouter();

  if (!auth || auth.loading) return <>{children}</>;

  const hasAccess = canAccessPremiumFeature(auth.userProfile, feature);
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
          className="w-full rounded-2xl bg-[#4F5E52] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#3D4A3F]"
        >
          Kembali ke Dashboard
        </button>
      </section>
    </main>
  );
}
