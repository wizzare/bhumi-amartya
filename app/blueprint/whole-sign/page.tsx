"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateWholeSign } from "@/lib/whole-sign/calculateWholeSign";
import { buildWholeSignPresentation } from "@/lib/whole-sign/presentation";
import type { WholeSignNarrativeCard, WholeSignPresentation } from "@/lib/whole-sign/types";

function NarrativeCard({ card }: { card: WholeSignNarrativeCard }) {
  return (
    <article className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
      <h3 className="font-serif text-xl text-[#4F5E52]">{card.title}</h3>
      <p className="mt-2 text-sm font-semibold text-[#657568]">{card.value}</p>
      <details className="group mt-4 border-t border-[#EEE8DD] pt-3">
        <summary className="cursor-pointer list-none text-xs font-bold text-[#7B8776] marker:content-none">Keterangan selengkapnya <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">⌄</span></summary>
        <p className="mt-3 text-sm leading-7 text-[#7B8776]">{card.narrative}</p>
      </details>
    </article>
  );
}

function NarrativeSection({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <section className="rounded-2xl border border-[#E8E1D3] bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl text-[#4F5E52]">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-[#7B8776]">{text}</p>
    </section>
  );
}

export default function WholeSignPage() {
  const [presentation, setPresentation] = useState<WholeSignPresentation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [blueprint, profile] = await Promise.all([storageProvider.getUserBlueprint(), storageProvider.getUserProfile()]);
        const stored = blueprint as unknown as { input?: Record<string, unknown>; astrology?: Record<string, unknown>; natalChart?: Record<string, unknown> } | null;
        const input = stored?.input || {};
        const birthData = {
          birthDate: String(input.birthDate || profile?.birthDate || ""),
          birthTime: String(input.birthTime || profile?.birthTime || ""),
          birthCity: String(input.birthCity || profile?.birthCity || profile?.birthPlace || ""),
          birthCountry: String(input.birthCountry || profile?.birthCountry || ""),
          timezone: typeof input.timezone === "string" ? input.timezone : profile?.timezone,
          latitude: typeof input.latitude === "number" ? input.latitude : profile?.latitude,
          longitude: typeof input.longitude === "number" ? input.longitude : profile?.longitude,
        };
        const result = calculateWholeSign(birthData, (stored?.astrology || stored?.natalChart) as never);
        setPresentation(buildWholeSignPresentation(result));
      } catch (error) {
        console.error("[Whole Sign] Unable to build presentation", error);
        setPresentation(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <ProtectedRoute><main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mt-24 text-center text-[#7B8776]">Menyusun rumah kehidupanmu...</p></main></ProtectedRoute>;
  if (!presentation) return <ProtectedRoute><main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mt-24 text-center text-[#7B8776]">Whole Sign Birth Chart belum dapat dibangun dari data yang tersedia.</p></main></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-5xl">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>

          <header className="rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md sm:p-9">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Compass size={26} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4DDD4]">{presentation.hero.eyebrow}</p>
            <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-tight">{presentation.hero.title}</h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {presentation.hero.metrics.map((metric) => <span key={metric.label} className="rounded-full bg-white/10 px-4 py-2 text-sm"><strong>{metric.label}</strong> · {metric.value}</span>)}
            </div>
            <p className="mt-6 max-w-3xl leading-7 text-[#D8E0D7]">{presentation.hero.insight}</p>
          </header>

          <div className="mt-12 space-y-12">
            {presentation.availabilityMessage && <section className="rounded-2xl border border-[#E5D4AD] bg-[#FFF9EA] p-5 text-sm leading-6 text-[#765F35]">{presentation.availabilityMessage}</section>}

            <section>
              <h2 className="mb-5 font-serif text-2xl text-[#4F5E52]">Chart Identity</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {presentation.identity.map((item) => <div key={item.label} className="rounded-2xl border border-[#E8E1D3] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">{item.label}</p><p className="mt-2 text-sm font-semibold text-[#4F5E52]">{item.value}</p></div>)}
              </div>
            </section>

            {presentation.ascendant && <NarrativeCard card={presentation.ascendant} />}
            <div className="grid gap-4 md:grid-cols-2">{presentation.sun && <NarrativeCard card={presentation.sun} />}{presentation.moon && <NarrativeCard card={presentation.moon} />}</div>

            {presentation.planets.length > 0 && <section><h2 className="mb-5 font-serif text-2xl text-[#4F5E52]">Planetary Placements</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{presentation.planets.map((card) => <NarrativeCard key={card.id} card={card} />)}</div></section>}
            {presentation.houses.length > 0 && <section><h2 className="mb-5 font-serif text-2xl text-[#4F5E52]">Twelve Whole Sign Houses</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{presentation.houses.map((card) => <NarrativeCard key={card.id} card={card} />)}</div></section>}
            {presentation.houseEmphasis.length > 0 && <section><h2 className="mb-5 font-serif text-2xl text-[#4F5E52]">House Emphasis</h2><div className="grid gap-4 md:grid-cols-3">{presentation.houseEmphasis.map((card) => <NarrativeCard key={card.id} card={card} />)}</div></section>}
            {presentation.angularPlanets && <NarrativeCard card={presentation.angularPlanets} />}
            {presentation.midheaven && <NarrativeCard card={presentation.midheaven} />}

            <NarrativeSection title="Relationship Pattern" text={presentation.relationshipThemes} />
            <NarrativeSection title="Home and Inner Foundation" text={presentation.homeThemes} />
            <NarrativeSection title="Work and Contribution" text={presentation.workThemes} />
            <NarrativeSection title="Arah Spiritual" text={presentation.spiritualThemes} />
            <NarrativeSection title="Misi Jiwa" text={presentation.soulMissionThemes} />
            <NarrativeSection title="Growth Direction" text={presentation.growthThemes} />
            <section className="rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md sm:p-8">
              <div className="mb-5 flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="text-lg font-bold">Kesimpulan Dirimu</h2></div>
              <div className="space-y-4 text-sm leading-7 text-[#D8E0D7]">{presentation.summary.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </section>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
