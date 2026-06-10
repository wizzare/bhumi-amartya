"use client";

import { initiateGooglePlaySubscription } from "@/lib/billing/googlePlayBilling";
import { AppNav } from "@/components/navigation/AppNav";

export function WellnessLock() {
  const handleUpgrade = async () => {
    await initiateGooglePlaySubscription();
  };

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-24">
      <AppNav />
      <div className="mx-auto max-w-3xl">
        <section className="bhumi-card p-8 text-center">
          <p className="text-sm font-medium text-[#9BB89A]">Rp50.000 / bulan</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#4F5E52]">Akses Pro Dibutuhkan</h1>
          <p className="mt-4 text-[#7B8776] leading-relaxed">
            Masa akses gratis 7 hari sudah selesai. Untuk melanjutkan Journal, Meditasi, dan Audio Healing, aktifkan Pro Plan.
          </p>
          <button
            type="button"
            onClick={handleUpgrade}
            className="bhumi-button mt-6 w-full sm:w-auto"
          >
            Aktifkan Pro Plan
          </button>
          <p className="mt-4 text-xs text-[#9BB89A]">
            Melalui Google Play Billing
          </p>
        </section>
      </div>
    </main>
  );
}
