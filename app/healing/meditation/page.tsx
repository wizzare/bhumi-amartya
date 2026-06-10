"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PremiumLock } from "@/components/auth/PremiumLock";

export default function MeditationPage() {
  return (
    <ProtectedRoute>
      <PremiumLock feature="meditation">
        <main className="min-h-screen bg-[#FCFAF5] px-6 py-12 pb-32">
          <div className="max-w-md mx-auto">
            <Link href="/healing" className="text-[#7B8776] mb-8 inline-block">
              ← Back to Healing
            </Link>
            
            <h1 className="text-3xl font-semibold text-[#4F5E52] mb-4">Meditation</h1>
            <p className="text-[#7B8776] mb-8">
              Return to your center through breath and presence.
            </p>

            <div className="space-y-4">
              <div className="bhumi-card p-6 opacity-60">
                <h3 className="font-medium text-[#4F5E52]">Morning Breathwork</h3>
                <p className="text-sm text-[#7B8776]">5 mins</p>
              </div>
              <div className="bhumi-card p-6 opacity-60">
                <h3 className="font-medium text-[#4F5E52]">Inner Child Connection</h3>
                <p className="text-sm text-[#7B8776]">12 mins</p>
              </div>
            </div>
          </div>
        </main>
      </PremiumLock>
    </ProtectedRoute>
  );
}
