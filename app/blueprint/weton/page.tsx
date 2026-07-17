"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
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
  Users,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import {
  buildWetonPresentation,
  type WetonPresentationInput,
  type WetonPresentationSectionId,
  type TulangWangiPresentation,
} from "@/lib/weton/presentation";

const SECTION_STYLES: Record<
  WetonPresentationSectionId,
  { icon: typeof CalendarDays; color: string; background: string }
> = {
  identity: { icon: CalendarDays, color: "text-amber-700", background: "bg-amber-50" },
  neptu: { icon: Layers3, color: "text-emerald-700", background: "bg-emerald-50" },
  wuku: { icon: Compass, color: "text-rose-700", background: "bg-rose-50" },
  "pranata-mangsa": { icon: Sun, color: "text-purple-700", background: "bg-purple-50" },
  character: { icon: Flower2, color: "text-orange-700", background: "bg-orange-50" },
  social: { icon: Users, color: "text-sky-700", background: "bg-sky-50" },
  "strengths-challenges": { icon: Sparkles, color: "text-yellow-700", background: "bg-yellow-50" },
  relationship: { icon: Heart, color: "text-pink-700", background: "bg-pink-50" },
  work: { icon: BriefcaseBusiness, color: "text-indigo-700", background: "bg-indigo-50" },
  money: { icon: Coins, color: "text-teal-700", background: "bg-teal-50" },
  growth: { icon: MoonStar, color: "text-violet-700", background: "bg-violet-50" },
};

export default function WetonPage() {
  const [weton, setWeton] = useState<WetonPresentationInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [storedBlueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        if (!storedBlueprint) return;

        const blueprint = storedBlueprint as unknown as Blueprint;
        const birthDate = blueprint.input?.birthDate || profile?.birthDate;
        const birthTime = blueprint.input?.birthTime || profile?.birthTime;

        if (birthDate) {
          try {
            setWeton(calculateWeton({ birthDate, birthTime }));
            return;
          } catch {
            if (blueprint.weton) {
              setWeton(blueprint.weton);
              return;
            }
            setLoadFailed(true);
            return;
          }
        }

        if (blueprint.weton) setWeton(blueprint.weton);
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const presentation = useMemo(() => buildWetonPresentation(weton), [weton]);

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
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">{presentation.canonicalName}</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">{presentation.hero}</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">
              Membaca lapisan identitas Jawa melalui Hari, Pasaran, Neptu, Wuku, dan Pranata Mangsa secara reflektif.
            </p>
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Membuka perhitungan Weton...</p>
          ) : loadFailed ? (
            <EmptyState message="Perhitungan Weton belum dapat dibuka. Periksa kembali data tanggal kelahiranmu." />
          ) : presentation.status === "unavailable" ? (
            <EmptyState message="Data kelahiran belum tersedia untuk menampilkan pembacaan Weton." />
          ) : (
            <div className="space-y-8">
              <div className="grid gap-4">
                {presentation.sections.map((section) => {
                  const style = SECTION_STYLES[section.id];
                  const Icon = style.icon;
                  return (
                    <Fragment key={section.id}>
                      <section className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.background} ${style.color}`}>
                            <Icon size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{section.title}</h2>
                            {section.values.length > 0 && (
                              <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                                {section.values.map((item) => (
                                  <div key={item.label}>
                                    <dt className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">{item.label}</dt>
                                    <dd className="mt-1 font-serif text-xl font-bold text-[#4F5E52]">{item.value}</dd>
                                  </div>
                                ))}
                              </dl>
                            )}
                          </div>
                        </div>
                        <p className="mt-4 border-t border-[#F5F1E8] pt-4 text-sm leading-7 text-[#7B8776]">
                          {section.narrative}
                        </p>
                      </section>
                      {section.id === "identity" && presentation.tulangWangi && (
                        <TulangWangiCard presentation={presentation.tulangWangi} />
                      )}
                    </Fragment>
                  );
                })}
              </div>

              {presentation.status === "partial" && (
                <p className="rounded-2xl border border-[#E8E1D3] bg-white p-5 text-sm leading-6 text-[#7B8776]">
                  Beberapa bagian belum ditampilkan karena data sumbernya belum lengkap.
                </p>
              )}

              {presentation.summary.length > 0 && (
                <section className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                  <div className="mb-5 flex items-center gap-2">
                    <Sparkles size={18} className="text-[#D4AF37]" />
                    <h2 className="text-xl font-serif font-bold">Kesimpulan Dirimu</h2>
                  </div>
                  <div className="space-y-4 text-sm leading-7 text-[#D2D8D0]">
                    {presentation.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-16 text-center leading-7 text-[#7B8776]">{message}</p>;
}

function TulangWangiCard({ presentation }: { presentation: TulangWangiPresentation }) {
  return (
    <aside data-testid="tulang-wangi-card" className="rounded-3xl border border-[#D8CDAF] bg-[#F7F1E2] p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4F5E52] text-[#F7E6AE]">
          <Sparkles size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A7650]">Wetonmu termasuk dalam kelompok Tulang Wangi</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-[#4F5E52]">{presentation.canonicalLabel}</h2>
          <p className="mt-1 text-xs text-[#7B8776]">Dalam sebagian tradisi juga disebut {presentation.alternativeLabel}</p>
        </div>
      </div>
      <p className="mt-5 font-medium leading-7 text-[#4F5E52]">{presentation.statusText}</p>
      <p className="mt-3 text-sm leading-7 text-[#6F786D]">{presentation.shortNarrative}</p>
      <details className="mt-5 border-t border-[#D8CDAF] pt-4">
        <summary className="cursor-pointer text-sm font-bold text-[#4F5E52]">Apa itu Tulang Wangi?</summary>
        <div className="mt-4 space-y-4 text-sm leading-7 text-[#6F786D]">
          {presentation.detailParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <p className="rounded-2xl bg-white/60 p-4 text-xs leading-6 text-[#7B8776]">{presentation.culturalContext}</p>
        </div>
      </details>
    </aside>
  );
}
