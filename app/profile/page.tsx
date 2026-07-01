"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { ProfileRuntimeAdapter } from "@/lib/services/profileRuntimeAdapter";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import type { Blueprint } from "@/lib/types/blueprint";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";

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
      
      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
        {cards.map(c => (
          <Link key={c.title} href={c.href} className="bhumi-card border-none bg-white p-4 shadow-sm transition-transform active:scale-95">
            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5 text-2xl">{c.icon}</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[#4F5E52]">{c.title}</h3>
                <p className="text-xs text-[#7B8776] mt-1">{c.desc}</p>
              </div>
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
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const [name, setName] = useState("Penghuni Bhumi");
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
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
  }, [auditUser]);

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

      </div>
    </main>
  );
}
