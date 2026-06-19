"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Coins,
  Compass,
  Flower2,
  Heart,
  Layers3,
  MoonStar,
  Sparkles,
  Sprout,
  Sun,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateWeton, generateWetonSummary } from "@/lib/weton/calculateWeton";
import type { WetonBlueprint } from "@/lib/weton/types";

type DisplayCard = {
  title: string;
  value: string;
  detail?: string;
  icon: typeof CalendarDays;
  color: string;
  background: string;
};

export default function WetonPage() {
  const [weton, setWeton] = useState<WetonBlueprint | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [storedBlueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        if (!storedBlueprint) return;

        const blueprint = storedBlueprint as unknown as Blueprint;
        if (blueprint.weton) {
          setWeton(blueprint.weton);
          return;
        }

        const birthDate = blueprint.input?.birthDate || profile?.birthDate;
        const birthTime = blueprint.input?.birthTime || profile?.birthTime || "12:00";
        if (!birthDate) return;

        const calculated = calculateWeton({ birthDate, birthTime });
        const updatedBlueprint = {
          ...storedBlueprint,
          weton: calculated,
          updatedAt: new Date().toISOString(),
        };
        await storageProvider.saveUserBlueprint(updatedBlueprint);
        setWeton(calculated);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const cards: DisplayCard[] = weton ? [
    {
      title: "Hari Kelahiran",
      value: weton.day,
      detail: `Neptu hari: ${weton.neptuDay}`,
      icon: CalendarDays,
      color: "text-amber-600",
      background: "bg-amber-50",
    },
    {
      title: "Pasaran",
      value: weton.pasaran,
      detail: `Neptu pasaran: ${weton.neptuPasaran}`,
      icon: MoonStar,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "Weton & Neptu",
      value: weton.weton,
      detail: `${weton.neptuDay} + ${weton.neptuPasaran} = ${weton.totalNeptu}`,
      icon: Layers3,
      color: "text-emerald-600",
      background: "bg-emerald-50",
    },
    {
      title: "Wuku",
      value: weton.wuku.name,
      detail: `Wuku ke-${weton.wuku.index}. ${weton.wuku.description}`,
      icon: Compass,
      color: "text-rose-600",
      background: "bg-rose-50",
    },
    {
      title: "Pranata Mangsa",
      value: weton.pranataMangsa.name,
      detail: weton.pranataMangsa.description,
      icon: Sun,
      color: "text-purple-600",
      background: "bg-purple-50",
    },
    {
      title: "Watak Dasar",
      value: weton.watak,
      icon: Flower2,
      color: "text-orange-600",
      background: "bg-orange-50",
    },
  ] : [];

  const summaries = weton ? generateWetonSummary(weton) : [];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />
            Kembali ke Profil
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <Sprout size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Weton</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Jejak Hari Kelahiranmu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">
              Membaca lapisan identitas Jawa melalui hari, pasaran, neptu, wuku, dan musim kelahiran.
            </p>
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Membuka perhitungan Weton...</p>
          ) : weton ? (
            <div className="space-y-8">
              <div className="grid gap-4">
                {cards.map(({ title, value, detail, icon: Icon, color, background }) => (
                  <section key={title} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${background} ${color}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{title}</h2>
                        <p className="mt-1 text-xl font-serif font-bold leading-relaxed text-[#4F5E52]">{value}</p>
                      </div>
                    </div>
                    {detail && <p className="mt-4 border-t border-[#F5F1E8] pt-4 text-sm leading-relaxed text-[#7B8776]">{detail}</p>}
                  </section>
                ))}
              </div>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Pola Kehidupan</h2>
                <div className="grid gap-4">
                  <InsightCard icon={Sparkles} title="Kekuatan" items={weton.strengths} />
                  <InsightCard icon={Layers3} title="Tantangan" items={weton.challenges} />
                  <InsightCard icon={Sun} title="Misi Kehidupan" text={weton.lifeMission} />
                  <InsightCard icon={Heart} title="Gaya Relasi" text={weton.relationshipStyle} />
                  <InsightCard icon={BriefcaseBusiness} title="Gaya Kerja" text={weton.workStyle} />
                  <InsightCard icon={Coins} title="Gaya Rezeki" text={weton.moneyStyle} />
                </div>
              </section>

              <section className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-xl font-serif font-bold">Kesimpulan Weton</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {summaries.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </div>
          ) : (
            <p className="py-16 text-center text-[#7B8776]">
              Data kelahiran belum tersedia untuk menghitung Weton.
            </p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function InsightCard({
  icon: Icon,
  title,
  text,
  items,
}: {
  icon: typeof Sparkles;
  title: string;
  text?: string;
  items?: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className="text-[#9AA394]" />
        <h3 className="font-serif text-lg font-bold text-[#4F5E52]">{title}</h3>
      </div>
      {items ? (
        <ul className="space-y-2 text-sm leading-relaxed text-[#7B8776]">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-[#7B8776]">{text}</p>
      )}
    </div>
  );
}
