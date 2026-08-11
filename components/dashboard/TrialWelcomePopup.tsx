"use client";

import { useEffect, useMemo, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { Sparkles, X } from "lucide-react";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import {
  getTrialWelcomePreferenceKey,
  shouldShowTrialWelcome,
} from "@/lib/billing/trialWelcome";
import type { UserProfile } from "@/lib/repositories/userRepository";

export function TrialWelcomePopup({ profile }: { profile: UserProfile }) {
  const [visible, setVisible] = useState(false);
  const entitlement = useMemo(() => getEntitlementStatus(profile), [profile]);
  const preferenceKey = getTrialWelcomePreferenceKey(profile);
  const eligible = shouldShowTrialWelcome(profile, entitlement);

  useEffect(() => {
    let active = true;
    setVisible(false);
    if (!eligible || !preferenceKey) return () => { active = false; };

    void Preferences.get({ key: preferenceKey })
      .then(({ value }) => {
        if (active && value !== "dismissed") setVisible(true);
      })
      .catch(() => {
        if (active) setVisible(false);
      });

    return () => { active = false; };
  }, [eligible, preferenceKey]);

  if (!visible || !preferenceKey) return null;

  const dismiss = () => {
    setVisible(false);
    void Preferences.set({ key: preferenceKey, value: "dismissed" }).catch(() => undefined);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 px-5" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-welcome-title"
        className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup"
          className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full text-[#7B8776] hover:bg-[#F2F4F0]"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <Sparkles className="mb-4 h-7 w-7 text-[#4F5E52]" aria-hidden="true" />
        <h2 id="trial-welcome-title" className="pr-10 font-serif text-2xl text-[#3F5145]">
          Selamat datang di Bhumi
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#6F7C72]">
          Selama 7 hari, kamu memiliki akses penuh ke Profil, Wellness, Journey, dan ruang pendampingan Bhumi.
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-6 w-full rounded-lg bg-[#4F5E52] px-5 py-3 text-sm font-semibold text-white hover:bg-[#3D4A3F]"
        >
          Mulai Jelajahi
        </button>
      </section>
    </div>
  );
}
