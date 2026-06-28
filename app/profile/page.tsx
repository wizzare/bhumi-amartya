"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { ShareCard } from "@/components/ui/ShareCard";
import { useAuth } from "@/context/AuthContext";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { generateLocalDailyGuidance } from "@/lib/orchestrators/localDailyGuidanceFallback";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import { ProfileRuntimeAdapter } from "@/lib/services/profileRuntimeAdapter";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import type { Blueprint } from "@/lib/types/blueprint";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import { getShareSafeGaiaInsights } from "@/lib/profile/gaia/selectors";
import type { GaiaInsight } from "@/lib/profile/gaia/types";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import { createDailyContentSeed } from "@/lib/dailyGuidance/dailyContentKey";

type LocalRecord = Record<string, unknown>;

function profileName(profile: LocalRecord): string {
  for (const key of ["fullName", "displayName", "name"]) {
    const value = profile[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Penghuni Bhumi";
}

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function readLocalManifestation(uid: string, dateKey: string): DailyGuidance["manifestation"] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const candidateUids = Array.from(new Set([uid, "local_user", "null_uid", "undefined_uid", "local-user", "guest", ""])).filter((u) => u !== undefined);
    for (const u of candidateUids) {
      const stored = window.localStorage.getItem(`moana:manifestation:${u}:${dateKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.affirmation === "string" && parsed.affirmation.trim()) return parsed;
      }
    }
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("moana:manifestation:") && key.endsWith(`:${dateKey}`)) {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.affirmation === "string" && parsed.affirmation.trim()) return parsed;
        }
      }
    }
  } catch {
    // ignore parse errors
  }
  return undefined;
}

function buildLocalShareGuidance(params: {
  uid: string;
  dateKey: string;
  profile: Record<string, any>;
  blueprint: Record<string, any>;
}): DailyGuidance {
  const output = generateLocalDailyGuidance({
    user: profileToDashboardUser(params.profile),
    identity: profileToCoreIdentity(params.profile, params.blueprint as any),
    blueprint: params.blueprint as any,
    emotionalState: params.profile?.emotionalState || { currentMood: 5, recurringThemes: [] },
    emotionalMemory: params.profile?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
    healingProgress: params.profile?.healingProgress || { healingStreak: 0 },
    astrologyTransits: null,
    adaptiveContext: {
      dailyVariationSeed: createDailyContentSeed({
        uid: params.uid,
        localDateKey: params.dateKey,
        blueprint: params.blueprint,
      }),
      completionRateYesterday: 0,
      journalCompletedYesterday: false,
      meditationCompletedYesterday: false,
      audioCompletedYesterday: false,
      practiceCompletedCountYesterday: 0,
      streakDays: 0,
      adaptiveTone: "steady_supportive",
      previousProgressSummary: "Share card local fallback",
      previousGuidanceSummaries: [],
    },
    language: params.profile?.language === "en" ? "en" : "id",
    generatedAt: new Date().toISOString(),
  } satisfies DailyGuidanceInput);

  return {
    uid: params.uid,
    date: params.dateKey,
    localDateKey: params.dateKey,
    profileSnapshot: params.profile,
    blueprintSnapshot: params.blueprint,
    astrologyToday: "",
    previousProgressSummary: "",
    soulReflectionText: output.soulReflectionText || output.soulReflection.dailyMessage,
    dailyNoteText: output.dailyNoteText || output.companionReflection?.fullReflection || "",
    companionReflection: output.companionReflection,
    aiInsight: output.soulReflectionText || output.soulReflection.dailyMessage,
    journalPrompt: output.journalingPrompt.prompt,
    meditationSuggestion: output.meditationRecommendation.title,
    dailyPractices: [],
    emotionalFocus: output.soulReflection.theme,
    spiritualFocus: output.soulReflection.theme,
    groundedAction: output.soulReflection.guidance,
    manifestation: output.manifestation,
    categories: output.categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "local-fallback",
  } as DailyGuidance;
}

function insightCount(section: ProfileSection): number {
  if (section.title === "ASAL USUL & PERADABAN") return 2;
  return section.cards.length;
}

function IdentitasJiwaHub() {
  const cards = [
    {
      title: "Life Path",
      icon: "🔢",
      desc: "Jalan belajar dan pertumbuhan jiwamu.",
      href: "/blueprint/numerology"
    },
    {
      title: "Destiny Matrix",
      icon: "🜂",
      desc: "Pola energi, pelajaran, dan potensi yang membentuk perjalananmu.",
      href: "/blueprint/destiny-matrix"
    },
    {
      title: "Human Design",
      icon: "⚡",
      desc: "Cara alami energimu bekerja dan mengambil keputusan.",
      href: "/blueprint/human-design"
    },
    {
      title: "Natal Chart",
      icon: "🌙",
      desc: "Peta langit saat kamu lahir dan pengaruhnya dalam hidupmu.",
      href: "/blueprint/natal-chart"
    },
    {
      title: "Weton",
      icon: "🌾",
      desc: "Jejak hari dan pasaran kelahiran dalam tradisi Jawa.",
      href: "/blueprint/weton"
    },
    {
      title: "BaZi",
      icon: "☯️",
      desc: "Empat pilar dan keseimbangan unsur pada waktu kelahiranmu.",
      href: "/blueprint/bazi"
    },
    {
      title: "Vedic Astrology",
      icon: "🕉️",
      desc: "Peta langit kelahiran melalui tradisi astrologi Vedik.",
      href: "/blueprint/vedic"
    },
    {
      title: "Tzolkin Maya",
      icon: "☀️",
      desc: "Kode waktu dan ritme kesadaran dari kalender sakral Maya.",
      href: "/blueprint/tzolkin"
    }
  ];

  return (
    <section className="space-y-4">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles size={20} className="text-[#9AA394]" />
        <div>
          <h2 className="text-xl font-serif text-[#4F5E52]">Identitas Jiwa</h2>
          <p className="text-sm text-[#7B8776] mt-1">Delapan cermin utama untuk mengenal dirimu lebih dalam.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {cards.map(c => (
          <Link key={c.title} href={c.href} className="bhumi-card border-none bg-white p-5 shadow-sm flex items-start gap-4 transition-transform active:scale-95">
            <div className="text-2xl pt-0.5">{c.icon}</div>
            <div>
              <h3 className="font-semibold text-[#4F5E52]">{c.title}</h3>
              <p className="text-xs text-[#7B8776] mt-1">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-center text-[10px] uppercase tracking-wider text-[#9AA394] mt-4">
        Klik masing-masing bagian untuk melihat pembacaan lengkap.
      </p>
    </section>
  );
}

export default function ProfilePage() {
  const auth = useAuth();
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const [name, setName] = useState("Penghuni Bhumi");
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [dateKey, setDateKey] = useState("");
  const [gaiaInsights, setGaiaInsights] = useState<GaiaInsight[]>([]);

  useEffect(() => {
    async function load() {
      try {
        let [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint(),
        ]);
        if (auditUser && (!profile || !blueprint)) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          profile = profile || getMockProfile(auditUser) as any;
          blueprint = blueprint || getMockBlueprint(auditUser) as any;
        }
        if (profile) {
          setName(profileName(profile as unknown as LocalRecord));
          setGaiaInsights(profile.gaiaProfile ? getShareSafeGaiaInsights(profile.gaiaProfile) : []);
        }
        const timezone = (profile as LocalRecord | null)?.timezone;
        const today = getLocalDateKey(new Date(), typeof timezone === "string" ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone);
        setDateKey(today);
        const activeUid = auth?.user?.uid || (auditUser ? `${auditUser}_uid` : "");
        let guidance: DailyGuidance | null = null;
        if (activeUid) {
          guidance = await dailyGuidanceRepository.getDailyGuidance(activeUid, today).catch(() => null);
        }
        if (!guidance && profile && blueprint) {
          guidance = buildLocalShareGuidance({
            uid: activeUid || (profile as any)?.uid || "local_user",
            dateKey: today,
            profile: profile as Record<string, any>,
            blueprint: blueprint as Record<string, any>,
          });
        }
        const effectiveUid = activeUid || (profile as any)?.uid || "local_user";
        const localManifestation = readLocalManifestation(effectiveUid, today);
        if (localManifestation) {
          const baseGuidance = guidance || ({
            uid: effectiveUid,
            date: today,
            localDateKey: today,
            soulReflectionText: "",
            dailyNoteText: "",
          } as DailyGuidance);
          guidance = { ...baseGuidance, manifestation: localManifestation };
        }
        setDailyGuidance(guidance);
        if (blueprint) {
          const canonical = CanonicalTranslatorService.translate(blueprint as unknown as Blueprint);
          const meaning = HumanMeaningService.generate(canonical);
          const sections = ProfileRuntimeAdapter.buildProfile(meaning);
          setProfileSections(sections);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [auth?.user?.uid]);

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#FCFAF5] text-[#4F5E52]">Membuka profilmu...</main>;
  if (!profileSections.length) return <main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mx-auto mt-24 max-w-lg text-center text-[#7B8776]">Profilmu belum siap dibaca. Lengkapi data kelahiran terlebih dahulu.</p></main>;

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
      <AppNav />
      <div className="mx-auto max-w-lg space-y-8">
        <BhumiPageHeader />
        <header className="text-center">
          <h1 className="text-3xl font-serif text-[#4F5E52]">{name}</h1>
          <p className="mt-2 text-sm text-[#7B8776]">Selamat datang kembali. Mari melihat dirimu dengan lebih jernih.</p>
        </header>

        <IdentitasJiwaHub />

        <section>
          <header className="mb-5 px-1">
            <h2 className="text-xl font-serif text-[#4F5E52]">Gudang Identitas Jiwa</h2>
            <p className="mt-1 text-sm text-[#7B8776]">Pilih satu ruang untuk mengenal lapisan dirimu lebih dalam.</p>
          </header>
          <div className="grid grid-cols-2 gap-4">
          {(profileSections).map((section) => {
            return (
              <Link key={slugify(section.title)} href={`/profile/${slugify(section.title)}`} className="bhumi-card flex min-h-44 flex-col items-center justify-center p-5 text-center transition-transform active:scale-95 hover:shadow-md">
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600`}><Sparkles size={24} /></div>
                <h3 className="text-sm font-semibold text-[#4F5E52]">{section.title}</h3>
                <p className="mt-2 text-[10px] leading-4 text-[#8A9489]">{insightCount(section)} bacaan</p>
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
            profileSections={profileSections}
            dateKey={dateKey}
            userSeed={auth?.user?.uid ?? name}
            guidance={dailyGuidance}
            gaiaInsights={gaiaInsights}
          />
        </section>

      </div>
    </main>
  );
}
