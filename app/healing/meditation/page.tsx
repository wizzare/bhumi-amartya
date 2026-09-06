"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PremiumLock } from "@/components/auth/PremiumLock";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { isEnlEdition } from "@/lib/config/edition";

export default function MeditationPage() {
  const isEn = isEnlEdition();

  return (
    <ProtectedRoute>
      <AccessGuard feature="meditation">
      <PremiumLock feature="meditation">
        <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
          <div className="max-w-md mx-auto">
            <Link href="/healing" className="text-[#7B8776] mb-8 inline-block">
              {isEn ? "← Back to Healing" : "← Kembali ke Healing"}
            </Link>
            
            <h1 className="text-3xl font-semibold text-[#4F5E52] mb-4">{isEn ? "Meditation" : "Meditasi"}</h1>
            <p className="text-[#7B8776] mb-8">
              {isEn ? "Return to your center through breath and presence." : "Kembali ke pusat dirimu melalui napas dan kehadiran."}
            </p>

            <div className="space-y-4">
              <div className="bhumi-card p-6 opacity-60">
                <h3 className="font-medium text-[#4F5E52]">{isEn ? "Morning Breathwork" : "Napas Pagi Hari"}</h3>
                <p className="text-sm text-[#7B8776]">{isEn ? "5 mins" : "5 menit"}</p>
              </div>
              <div className="bhumi-card p-6 opacity-60">
                <h3 className="font-medium text-[#4F5E52]">{isEn ? "Inner Child Connection" : "Koneksi Inner Child"}</h3>
                <p className="text-sm text-[#7B8776]">{isEn ? "12 mins" : "12 menit"}</p>
              </div>
            </div>
          </div>
        </main>
      </PremiumLock>
      </AccessGuard>
    </ProtectedRoute>
  );
}
