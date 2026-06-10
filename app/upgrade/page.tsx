"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { initiateGooglePlaySubscription } from "@/lib/billing/googlePlayBilling";

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    await initiateGooglePlaySubscription();
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 flex flex-col items-center justify-center text-center pb-24">
      <AppNav />
      <div className="max-w-md w-full">
        <div className="w-20 h-20 bg-[#4F5E52]/10 rounded-full flex items-center justify-center mb-8 mx-auto text-3xl">
          🌱
        </div>
        <h1 className="text-3xl font-semibold text-[#4F5E52] mb-4">Fitur Segera Hadir</h1>
        <p className="text-[#7B8776] mb-12 leading-relaxed">
          Kami sedang menyiapkan paket Premium untuk pengalaman yang lebih mendalam. Selama masa Beta, nikmati fitur yang tersedia secara gratis.
        </p>

        <div className="bg-white p-8 rounded-3xl border border-[#4F5E52]/10 shadow-sm mb-12">
          <p className="text-[#4F5E52] font-medium mb-6">Nantikan pembaruan berikutnya.</p>
          
          <Link
            href="/dashboard"
            className="bhumi-button w-full inline-block"
          >
            Kembali ke Dasbor
          </Link>
        </div>

        <Link href="/dashboard" className="text-[#7B8776] font-medium hover:text-[#4F5E52] transition-colors">
          Kembali ke Dasbor
        </Link>
      </div>
    </main>
  );
}