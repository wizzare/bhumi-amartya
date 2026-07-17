"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Compass,
  Heart,
  Layers3,
  MoonStar,
  Orbit,
  Sparkles,
  Sprout,
  Sun,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import {
  buildTzolkinPresentation,
  type TzolkinIdentityReadContract,
  type TzolkinPresentation,
  type TzolkinPresentationInput,
  type TzolkinSectionContract,
} from "@/lib/tzolkin/presentation";

const GROUP_ICONS: Record<string, typeof Sparkles> = {
  "galactic-identity": Sparkles,
  "journey-rhythm": Layers3,
  "energy-directions": Orbit,
  "gifts-challenges": MoonStar,
  "relation-work-growth": Heart,
};

export default function TzolkinPage() {
  const [tzolkin, setTzolkin] = useState<TzolkinPresentationInput | null>(null);
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
        if (birthDate) {
          try {
            setTzolkin(calculateTzolkin({ birthDate }));
            return;
          } catch {
            if (!blueprint.tzolkin) {
              setLoadFailed(true);
              return;
            }
          }
        }

        if (blueprint.tzolkin) setTzolkin(blueprint.tzolkin);
      } catch {
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const presentation = useMemo(() => buildTzolkinPresentation(tzolkin), [tzolkin]);

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
              <Sprout size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">{presentation.canonicalName}</p>
            <h1 className="mt-2 font-serif text-4xl text-[#4F5E52]">{presentation.hero.title}</h1>
            {!loading && presentation.status !== "unavailable" && (
              <>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[#4F5E52]">
                  {presentation.hero.kin && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">{presentation.hero.kin}</span>}
                  {presentation.hero.tone && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">Galactic Tone · {presentation.hero.tone}</span>}
                  {presentation.hero.seal && <span className="max-w-full rounded-full bg-white px-3 py-2 shadow-sm">Solar Seal · {presentation.hero.seal}</span>}
                </div>
                <p className="mt-4 max-w-xl leading-7 text-[#7B8776]">{presentation.hero.insight}</p>
              </>
            )}
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Membaca siklus 260 Kin...</p>
          ) : loadFailed ? (
            <EmptyState message="Perhitungan Tzolkin belum dapat dibuka. Periksa kembali tanggal kelahiranmu." />
          ) : presentation.status === "unavailable" ? (
            <EmptyState message="Tanggal kelahiran belum tersedia untuk menghitung Tzolkin." />
          ) : (
            <TzolkinContent presentation={presentation} />
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-16 text-center leading-7 text-[#7B8776]">{message}</p>;
}

function TzolkinContent({ presentation }: { presentation: TzolkinPresentation }) {
  return (
    <div id="detail-tzolkin" className="space-y-10 scroll-mt-6">
      {presentation.status === "partial" && (
        <p className="rounded-2xl border border-[#E8E1D3] bg-white p-5 text-sm leading-7 text-[#7B8776]">
          Pembacaan ini hanya menampilkan bagian yang tersedia dari data Tzolkin tersimpan. Relasi simbolik atau siklus yang tidak didukung disembunyikan.
        </p>
      )}

      <OracleGraphic contract={presentation.readContract} />

      {presentation.groups.map((group) => {
        const Icon = GROUP_ICONS[group.groupId] || Compass;
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
              {group.sections.map((section) => <TzolkinSectionCard key={section.sectionId} section={section} />)}
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

function TzolkinSectionCard({ section }: { section: TzolkinSectionContract }) {
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

function OracleGraphic({ contract }: { contract: TzolkinIdentityReadContract }) {
  if (!contract.kin || !contract.guide || !contract.analog || !contract.antipode || !contract.occult || !contract.seal) return null;
  return (
    <section aria-label="Galactic Signature Oracle" className="rounded-3xl border border-[#E8E1D3] bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9AA394]">Galactic Signature</p>
        <h2 className="mt-2 break-words font-serif text-xl font-bold text-[#4F5E52]">{contract.galacticSignature?.displayValue}</h2>
      </div>
      <div className="mx-auto grid max-w-sm grid-cols-3 items-center gap-3 text-center">
        <div />
        <OracleNode section={contract.guide} icon={Compass} />
        <div />
        <OracleNode section={contract.antipode} icon={Activity} />
        <OracleNode section={contract.seal} icon={Sun} label={`Kin ${contract.kinNumber}`} />
        <OracleNode section={contract.analog} icon={Heart} />
        <div />
        <OracleNode section={contract.occult} icon={BriefcaseBusiness} />
        <div />
      </div>
    </section>
  );
}

function OracleNode({ section, icon: Icon, label }: { section: TzolkinSectionContract; icon: typeof Sparkles; label?: string }) {
  return (
    <div className="min-w-0">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF1EA] text-[#4F5E52]">
        <Icon size={20} />
      </div>
      <p className="mt-2 break-words text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">{label || section.label}</p>
      <p className="mt-1 break-words text-xs font-semibold text-[#4F5E52]">{section.sealName}</p>
    </div>
  );
}
