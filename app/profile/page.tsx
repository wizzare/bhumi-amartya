"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { createProfileEcho, ProfileEchoV1 } from "@/lib/profile/echo";
import { ShareCard } from "@/components/ui/ShareCard";
import { useAuth } from "@/context/AuthContext";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { synthesizeGaiaProfile } from "@/lib/profile/gaia/synthesisEngine";
import { getShareSafeGaiaInsights } from "@/lib/profile/gaia/selectors";
import type { GaiaProfile, GaiaTheme } from "@/lib/profile/gaia/types";
import { GAIA_SECTION_PRESENTATION } from "@/lib/profile/gaia/presentation";
import { isCompleteGaiaWarehouse } from "@/lib/profile/gaia/validation";

type LocalRecord = Record<string, unknown>;

function profileName(profile: LocalRecord): string {
  for (const key of ["fullName", "displayName", "name"]) {
    const value = profile[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Penghuni Bhumi";
}

function isGaiaWarehouse(profile: GaiaProfile): boolean {
  return isCompleteGaiaWarehouse(profile);
}

function SummaryCard({ gaia }: { gaia: GaiaProfile }) {
  const items = [
    ["Life Path", gaia.identity.lifePath],
    ["Arcana Center", gaia.identity.arcanaCenter],
    ["Human Design Type", gaia.identity.humanDesignType],
    ["Zodiak Matahari", gaia.identity.sunSign],
  ];

  return (
    <section className="bhumi-card border-none bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles size={15} className="text-[#9AA394]" />
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">Identitas Jiwa</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#F7F4ED] p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9AA394]">{label}</p>
            <p className="mt-2 text-sm font-semibold text-[#4F5E52]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ProfilePage() {
  const auth = useAuth();
  const [name, setName] = useState("Penghuni Bhumi");
  const [gaia, setGaia] = useState<GaiaProfile | null>(null);
  const [echo, setEcho] = useState<ProfileEchoV1 | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [dateKey, setDateKey] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint(),
        ]);
        if (profile) {
          setName(profileName(profile as unknown as LocalRecord));
          const storedGaia = (profile as unknown as { gaiaProfile?: GaiaProfile }).gaiaProfile;
          if (storedGaia && isGaiaWarehouse(storedGaia)) setGaia(storedGaia);
        }
        const timezone = (profile as LocalRecord | null)?.timezone;
        const today = getLocalDateKey(new Date(), typeof timezone === "string" ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone);
        setDateKey(today);
        if (auth?.user?.uid) {
          setDailyGuidance(await dailyGuidanceRepository.getDailyGuidance(auth.user.uid, today).catch(() => null));
        }
        if (blueprint) {
          setGaia((current) => current ?? synthesizeGaiaProfile(blueprint));
          setEcho(createProfileEcho(blueprint));
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [auth?.user?.uid]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#FCFAF5] text-[#4F5E52]">Membuka profilmu...</main>;
  if (!gaia || !echo) return <main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mx-auto mt-24 max-w-lg text-center text-[#7B8776]">Profilmu belum siap dibaca. Lengkapi data kelahiran terlebih dahulu.</p></main>;

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
      <AppNav />
      <div className="mx-auto max-w-lg space-y-8">
        <BhumiPageHeader />
        <header className="text-center">
          <h1 className="text-3xl font-serif text-[#4F5E52]">{name}</h1>
          <p className="mt-2 text-sm text-[#7B8776]">Selamat datang kembali. Mari melihat dirimu dengan lebih jernih.</p>
        </header>

        <SummaryCard gaia={gaia} />

        <section>
          <header className="mb-5 px-1">
            <h2 className="text-xl font-serif text-[#4F5E52]">Gudang Identitas Jiwa</h2>
            <p className="mt-1 text-sm text-[#7B8776]">Pilih satu ruang untuk mengenal lapisan dirimu lebih dalam.</p>
          </header>
          <div className="grid grid-cols-2 gap-4">
          {(Object.keys(GAIA_SECTION_PRESENTATION) as GaiaTheme[]).map((theme) => {
            const item = GAIA_SECTION_PRESENTATION[theme];
            const Icon = item.icon;
            return (
              <Link key={theme} href={`/profile/${theme}`} className="bhumi-card flex min-h-44 flex-col items-center justify-center p-5 text-center transition-transform active:scale-95 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${item.color}`}><Icon size={24} /></div>
                <h3 className="text-sm font-semibold text-[#4F5E52]">{item.title}</h3>
                <p className="mt-2 text-[10px] leading-4 text-[#8A9489]">{item.subtitle}</p>
              </Link>
            );
          })}
          </div>
        </section>

        <section className="space-y-5 pt-4">
          <header className="text-center">
            <h2 className="text-2xl font-serif text-[#4F5E52]">Bagikan Refleksi Jiwamu</h2>
            <p className="mt-2 text-sm text-[#7B8776]">Satu ringkasan personal dalam format media sosial.</p>
          </header>
          <ShareCard
            userName={name}
            echo={echo}
            dateKey={dateKey}
            userSeed={auth?.user?.uid ?? name}
            guidance={dailyGuidance}
            gaiaInsights={getShareSafeGaiaInsights(gaia)}
          />
        </section>

      </div>
    </main>
  );
}
