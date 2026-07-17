"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleDot,
  Compass,
  Heart,
  Layers3,
  MoonStar,
  Orbit,
  Sparkles,
  Sun,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import {
  buildVedicPresentation,
  type VedicPresentation,
  type VedicPresentationInput,
  type VedicSectionContract,
} from "@/lib/vedic/presentation";
import type { Blueprint } from "@/lib/types/blueprint";

type LoadedVedic = {
  value: VedicPresentationInput;
  birthTimeAvailable: boolean;
};

const GROUP_ICONS: Record<string, typeof Sun> = {
  "vedic-identity": Compass,
  "inner-pattern": MoonStar,
  "personal-planets": CircleDot,
  maturation: Layers3,
  "karma-change": Orbit,
  "life-areas": BriefcaseBusiness,
  "dasha-cycle": Sparkles,
  "lived-themes": Heart,
};

export default function VedicPage() {
  const [loaded, setLoaded] = useState<LoadedVedic | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [stored, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        if (!stored) return;

        const blueprint = stored as unknown as Blueprint;
        const input = blueprint.input;
        const birthDate = input?.birthDate || profile?.birthDate;
        const birthTime = input?.birthTime || profile?.birthTime;
        const birthTimeAvailable = Boolean(birthTime?.trim());

        if (birthDate && birthTime) {
          try {
            const calculated = calculateVedic({
              birthDate,
              birthTime,
              birthCity: input?.birthCity || profile?.birthCity,
              latitude: input?.latitude ?? profile?.latitude,
              longitude: input?.longitude ?? profile?.longitude,
              timezone: input?.timezone || profile?.timezone,
            });
            setLoaded({ value: calculated, birthTimeAvailable: true });
            return;
          } catch {
            if (!blueprint.vedic) {
              setLoadFailed(true);
              return;
            }
          }
        }

        if (blueprint.vedic) {
          setLoaded({ value: blueprint.vedic, birthTimeAvailable });
        }
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const presentation = useMemo(
    () => buildVedicPresentation(loaded?.value, { birthTimeAvailable: loaded?.birthTimeAvailable }),
    [loaded],
  );

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-x-hidden bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-2xl">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />
            Kembali ke Profil
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <Sun size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">{presentation.canonicalName}</p>
            <h1 className="mt-2 font-serif text-4xl text-[#4F5E52]">{presentation.hero.title}</h1>
            {!loading && presentation.status !== "unavailable" && (
              <>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#4F5E52]">
                  {presentation.hero.lagna && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">Lagna · {presentation.hero.lagna}</span>}
                  {presentation.hero.rashi && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">Rashi · {presentation.hero.rashi}</span>}
                  {presentation.hero.nakshatra && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">Nakshatra · {presentation.hero.nakshatra}</span>}
                </div>
                <p className="mt-4 max-w-xl leading-7 text-[#7B8776]">{presentation.hero.insight}</p>
              </>
            )}
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Membuka peta langit sidereal...</p>
          ) : loadFailed ? (
            <EmptyState message="Perhitungan Vedic Astrology belum dapat dibuka. Periksa kembali data waktu dan lokasi kelahiranmu." />
          ) : presentation.status === "unavailable" ? (
            <EmptyState message="Data Vedic Astrology belum tersedia. Waktu dan lokasi kelahiran lengkap diperlukan untuk memverifikasi Lagna dan Houses." />
          ) : (
            <VedicContent presentation={presentation} />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-16 text-center leading-7 text-[#7B8776]">{message}</p>;
}

function VedicContent({ presentation }: { presentation: VedicPresentation }) {
  return (
    <div id="detail-vedic" className="space-y-10 scroll-mt-6">
      {presentation.status === "partial" && (
        <p className="rounded-2xl border border-[#E8E1D3] bg-white p-5 text-sm leading-7 text-[#7B8776]">
          Pembacaan ini hanya menampilkan data yang dapat diverifikasi. Lagna, Houses, atau siklus yang tidak didukung oleh data kelahiran aktif disembunyikan.
        </p>
      )}

      {presentation.groups.map((group) => {
        const Icon = GROUP_ICONS[group.groupId] || Sparkles;
        return (
          <section key={group.groupId} aria-labelledby={`${group.groupId}-title`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#4F5E52]">
                <Icon size={19} />
              </div>
              <h2 id={`${group.groupId}-title`} className="min-w-0 text-sm font-bold uppercase tracking-[0.16em] text-[#7B8776]">
                {group.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {group.sections.map((section) => <VedicSectionCard key={section.sectionId} section={section} />)}
            </div>
          </section>
        );
      })}

      {presentation.summary.length > 0 && (
        <section className="mx-auto max-w-xl rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-[#D4AF37]" />
            <h2 className="font-serif text-xl font-bold">Kesimpulan Dirimu</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-[#D2D8D0]">
            {presentation.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      )}
    </div>
  );
}

function VedicSectionCard({ section }: { section: VedicSectionContract }) {
  return (
    <article className="min-w-0 rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
      <p className="break-words text-xs font-bold uppercase tracking-[0.14em] text-[#9AA394]">{section.label}</p>
      <p className="mt-2 break-words font-serif text-xl font-bold text-[#4F5E52]">{section.displayValue}</p>
      <details className="group mt-3 border-t border-[#F3EFE6] pt-3">
        <summary className="cursor-pointer list-none text-sm font-bold text-[#4F5E52] marker:content-none">
          <span className="group-open:hidden">Lihat selengkapnya</span>
          <span className="hidden group-open:inline">Tutup penjelasan</span>
        </summary>
        <p className="mt-3 text-sm leading-7 text-[#7B8776]">{section.fullExplanation}</p>
      </details>
    </article>
  );
}
