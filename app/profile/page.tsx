"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { calculateNatalBasics } from "@/lib/astrology/calculateNatalBasics";
import { createProfileInsights, type ProfileInsights } from "@/lib/profile/createProfileInsights";
import { translateBlueprintV2, type TranslatedProfile } from "@/lib/profile/v2/insightTranslator";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { growthEngine, GrowthProfile } from "@/lib/engines/growthEngine";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { ChevronDown, ChevronUp, Beaker } from "lucide-react";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { storageProvider } from "@/lib/storage/storageProvider";

type LocalRecord = Record<string, unknown>;
const PROFILE_EMPTY = "Belum dilengkapi";
const BLUEPRINT_PENDING = "Dalam Persiapan";

function getText(record: LocalRecord | null, path: string[], fallback = "Dalam Persiapan"): string {
  const value = path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as LocalRecord)[key];
  }, record);

  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getFirstText(record: LocalRecord | null, paths: string[][], fallback = "Dalam Persiapan"): string {
  for (const path of paths) {
    const value = getText(record, path, "");
    if (value) return value;
  }
  return fallback;
}

function normalizeProfile(profile: LocalRecord | null) {
  return {
    name: getFirstText(profile, [["fullName"], ["displayName"], ["name"]], PROFILE_EMPTY),
    email: getFirstText(profile, [["email"]], PROFILE_EMPTY),
    birthDate: getFirstText(profile, [["birthDate"]], PROFILE_EMPTY),
    birthTime: getFirstText(profile, [["birthTime"]], PROFILE_EMPTY),
    birthCity: getFirstText(profile, [["birthPlace"], ["birthCity"], ["cityOfBirth"]], PROFILE_EMPTY),
    setupCompleted: profile?.setupCompleted === true,
  };
}

function normalizeBlueprint(blueprint: LocalRecord | null) {
  return {
    lifePath: getFirstText(blueprint, [
      ["lifePath", "display"],
      ["lifePath", "number"],
      ["numerology", "display"],
      ["numerology", "lifePath"],
      ["numerology", "number"],
      ["lifePath"],
    ], BLUEPRINT_PENDING),
    arcanaCenter: getFirstText(blueprint, [
      ["destinyMatrix", "arcanaCenter", "number"],
      ["destinyMatrix", "arcanaCenter"],
      ["destinyMatrix", "center"],
      ["arcanaCenter", "number"],
      ["arcanaCenter"],
    ], BLUEPRINT_PENDING),
    humanDesignType: getText(blueprint, ["humanDesign", "type"], BLUEPRINT_PENDING),
    humanDesignProfile: getText(blueprint, ["humanDesign", "profile"], BLUEPRINT_PENDING),
    humanDesignAuthority: getText(blueprint, ["humanDesign", "authority"], BLUEPRINT_PENDING),
    sunSign: getFirstText(blueprint, [["astrology", "sunSign"], ["natalChart", "sunSign"], ["sunSign", "sign"], ["sunSign"]], BLUEPRINT_PENDING),
    moonSign: getFirstText(blueprint, [["astrology", "moonSign"], ["natalChart", "moonSign"]], BLUEPRINT_PENDING),
    ascendant: getFirstText(blueprint, [["astrology", "risingSign"], ["natalChart", "ascendant"]], BLUEPRINT_PENDING),
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#E8E9E5] py-3 last:border-0">
      <p className="text-sm text-[#7B8776]">{label}</p>
      <p className="text-right font-medium text-[#4F5E52]">{value}</p>
    </div>
  );
}

function ProfileCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bhumi-card p-6">
      <h2 className="text-xl font-semibold text-[#4F5E52]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [profile, setProfile] = useState<LocalRecord | null>(null);
  const [blueprint, setBlueprint] = useState<LocalRecord | null>(null);
  const [insights, setInsights] = useState<ProfileInsights | null>(null);
  const [v2Data, setV2Data] = useState<TranslatedProfile | null>(null);
  const [growthData, setGrowthData] = useState<GrowthProfile | null>(null);
  const [showTechnical, setShowTechnical] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
      const profileData = await storageProvider.getUserProfile();
      const blueprintData = await storageProvider.getUserBlueprint();

      if (!profileData?.setupCompleted || !profileData || !blueprintData) {
        setLoaded(true);
        return;
      }

      const uid = profileData.uid;
      const parsedProfile = profileData as unknown as LocalRecord;
      const parsedBlueprint = blueprintData as unknown as LocalRecord;

      const natalChart = calculateNatalBasics({
        birthDate: String(parsedProfile.birthDate || ""),
        birthTime: String(parsedProfile.birthTime || ""),
        birthCity: String(parsedProfile.birthCity || parsedProfile.birthPlace || ""),
        timezone: (parsedProfile.timezone as string | undefined) || undefined,
        latitude: (parsedProfile.latitude as number | null | undefined) ?? undefined,
        longitude: (parsedProfile.longitude as number | null | undefined) ?? undefined,
      });

      const nextBlueprint = {
        ...parsedBlueprint,
        natalChart: {
          ...(parsedBlueprint.natalChart || {}),
          ...natalChart,
        },
      };

      setProfile(parsedProfile);
      setBlueprint(nextBlueprint);
      setInsights(createProfileInsights({ profile: parsedProfile, blueprint: nextBlueprint }));
      setV2Data(translateBlueprintV2(nextBlueprint, language));

      // Fetch Journey for Growth Engine
      const states = await journeyRepository.getRecentDailyStates(uid);
      setGrowthData(growthEngine.calculateGrowth(states));

    } catch (error) {
      console.error("[Profile Page] Failed to load local blueprint", error);
    } finally {
      setLoaded(true);
    }
    };
    void loadProfile();
  }, [language]);

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Membuka profil blueprint...</p>
        </div>
      </main>
    );
  }

  if (!profile || !blueprint || !insights) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-24">
        <AppNav />
        <div className="mx-auto max-w-3xl">
          <section className="bhumi-card p-8 text-center">
            <h1 className="text-3xl font-semibold text-[#4F5E52]">{t.profile.title}</h1>
            <p className="mt-4 text-[#7B8776]">
              {t.profile.missing}
            </p>
            <Link href="/" className="bhumi-button mt-6 inline-flex">
              Kembali ke Awal →
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const normalizedProfile = normalizeProfile(profile);
  const normalizedBlueprint = normalizeBlueprint(blueprint);

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
      <AppNav />
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="bhumi-card p-8 bg-white border-none shadow-sm flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-[#4F5E52] text-white rounded-full flex items-center justify-center text-2xl font-serif mb-4">
            {normalizedProfile.name.charAt(0)}
          </div>
          <h1 className="text-3xl font-serif text-[#4F5E52] mb-1">{normalizedProfile.name}</h1>
          <p className="text-[#7B8776] text-sm italic mb-4">
            Jiwa {normalizedBlueprint.sunSign}
          </p>

          {profile?.membershipType === "PENJAGA_BHUMI_INTI" && (
            <div className="mb-6 inline-flex flex-col items-center px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm">
              <p className="text-emerald-700 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                🌱 Penjaga Bhumi Inti
              </p>
              <p className="text-emerald-600/70 text-[10px] font-medium mt-1">
                Free Plan aktif selama 2 bulan.
              </p>
            </div>
          )}

          <Link
            href="/tentang"
            className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-widest hover:text-[#4F5E52] transition-colors"
          >
            Tentang Bhumi Amartya
          </Link>
        </header>

        {v2Data && <ProfileTabs data={v2Data} growth={growthData} />}

        {/* SECTION: LEGACY / TECHNICAL DATA (Hidden by default) */}
        <div className="pt-10">
          <button
            onClick={() => setShowTechnical(!showTechnical)}
            className="w-full flex items-center justify-center gap-2 py-4 text-[#9AA394] text-[10px] font-bold uppercase tracking-widest hover:text-[#7B8776] transition-colors"
          >
            <Beaker size={14} />
            {showTechnical ? "Sembunyikan Data Teknis" : "Lihat Data Teknis (Legacy)"}
            {showTechnical ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTechnical && (
            <div className="mt-6 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <ProfileCard title={t.profile.birthData}>
                <InfoRow label={t.profile.name} value={normalizedProfile.name} />
                <InfoRow label={t.profile.email} value={normalizedProfile.email} />
                <InfoRow label={t.profile.birthDate} value={normalizedProfile.birthDate} />
                <InfoRow label={t.profile.birthCity} value={normalizedProfile.birthCity} />
                <InfoRow label={t.profile.birthTime} value={normalizedProfile.birthTime} />
              </ProfileCard>

              <ProfileCard title={t.profile.blueprintSummary}>
                <InfoRow label={t.dashboard.lifePath} value={normalizedBlueprint.lifePath} />
                <InfoRow label={t.dashboard.arcanaCenter} value={normalizedBlueprint.arcanaCenter} />
                <InfoRow label={t.dashboard.humanDesign} value={normalizedBlueprint.humanDesignType} />
                <InfoRow label={t.dashboard.humanDesign} value={normalizedBlueprint.humanDesignProfile} />
                <InfoRow label={t.dashboard.humanDesign} value={normalizedBlueprint.humanDesignAuthority} />
                <InfoRow label={t.dashboard.sunSign} value={normalizedBlueprint.sunSign} />
                <InfoRow label={t.profile.moonSign} value={normalizedBlueprint.moonSign} />
                <InfoRow label={t.profile.ascendant} value={normalizedBlueprint.ascendant} />
              </ProfileCard>

               <ProfileCard title={language === "id" ? "Karma Leluhur" : "Ancestor Karma"}>
                 <div className="space-y-4 text-[#4F5E52] leading-7">
                   {insights.ancestorKarma.split("\n\n").map((paragraph) => (
                     <p key={paragraph}>{paragraph}</p>
                   ))}
                 </div>
               </ProfileCard>

               <ProfileCard title={language === "id" ? "Pola Berulang" : "Repeating Patterns"}>
                 <ul className="space-y-3">
                   {insights.repeatingPatterns.patterns.map((pattern) => (
                     <li key={pattern} className="rounded-2xl bg-[#FCFAF5] p-4 text-[#4F5E52]">
                       {pattern}
                     </li>
                   ))}
                 </ul>
                 <p className="mt-5 text-sm font-medium text-[#7B8776]">{insights.repeatingPatterns.question}</p>
               </ProfileCard>

               <ProfileCard title={language === "id" ? "Luka Batin" : "Inner Wounds"}>
                 <p className="text-[#4F5E52] leading-7">{insights.innerWounds.paragraph}</p>
                 <div className="mt-4 flex flex-wrap gap-2">
                   {insights.innerWounds.themes.map((theme) => (
                     <span key={theme} className="rounded-full bg-[#FCFAF5] px-3 py-2 text-sm font-medium text-[#4F5E52]">
                       {theme}
                     </span>
                   ))}
                 </div>
               </ProfileCard>

               <ProfileCard title="Soul Fragment & Inner Child Map (Legacy)">
                 <div className="space-y-4">
                   {insights.soulFragmentMap.map((item, index) => (
                     <div key={item.part} className="rounded-2xl bg-[#FCFAF5] p-4">
                       <p className="font-semibold text-[#4F5E52]">{index + 1}. {item.part}</p>
                       <p className="mt-2 text-sm text-[#7B8776]">{language === "id" ? "Kebutuhan: " : "Need: "}{item.need}</p>
                       <p className="mt-2 text-sm text-[#7B8776]">{language === "id" ? "Praktik: " : "Practice: "}{item.practice}</p>
                     </div>
                   ))}
                 </div>
               </ProfileCard>

               <ProfileCard title="Shadow Integration Map (Legacy)">
                 <div className="space-y-4">
                   <InfoRow label={language === "id" ? "Bayangan" : "Shadow"} value={insights.shadowIntegrationMap.shadowPattern} />
                   <InfoRow label={language === "id" ? "Pertumbuhan" : "Growth"} value={insights.shadowIntegrationMap.growthInvitation} />
                   <InfoRow label={language === "id" ? "Praktik" : "Practice"} value={insights.shadowIntegrationMap.dailyPractice} />
                 </div>
               </ProfileCard>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
