"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PremiumFeature, canAccessPremiumFeature } from "@/lib/access/accessControl";
import { useAuth } from "@/context/AuthContext";

interface PremiumLockProps {
  children: React.ReactNode;
  feature: PremiumFeature;
}

export function PremiumLock({ children, feature }: PremiumLockProps) {
  const auth = useAuth();
  const router = useRouter();

  if (!auth || auth.loading) return children;

  const { userProfile } = auth;
  const hasAccess = canAccessPremiumFeature(userProfile, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-[6px] pointer-events-none select-none">
        {children}
      </div>
      
      <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl border border-[#4F5E52]/10 shadow-xl text-center max-w-sm">
          <div className="text-2xl mb-4">✨</div>
          <h3 className="text-xl font-semibold text-[#4F5E52] mb-2">
            Perjalanan Berlanjut
          </h3>
          <p className="text-sm text-[#7B8776] mb-8 leading-relaxed">
            Akses Bhumi kamu perlu diperbarui. Kami sedang menyiapkan langkah berikutnya agar perjalananmu tetap terasa nyaman.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.replace('/dashboard')}
              className="block w-full py-4 px-6 bg-[#4F5E52] text-white rounded-2xl font-medium shadow-md hover:bg-[#3D4A3F] transition-all"
            >
              Kembali ke Dashboard
            </button>
            <button
              onClick={() => router.replace('/premium-bhumi')}
              className="block w-full py-4 px-6 border border-[#4F5E52] text-[#4F5E52] bg-white rounded-2xl font-medium shadow-sm hover:bg-[#F2F4F0] transition-all"
            >
              Buka Premium Bhumi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
