"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleDot, Grid3X3, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { TwelvePalaceChart } from "@/components/zi-wei/TwelvePalaceChart";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateZiWei } from "@/lib/zi-wei/calculateZiWei";
import { buildZiWeiPresentation, type ZiWeiSection } from "@/lib/zi-wei/presentation";
import type { ZiWeiGender, ZiWeiResult } from "@/lib/zi-wei/types";

function canonicalGender(value: unknown): ZiWeiGender | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (["male", "pria", "laki-laki", "laki laki"].includes(normalized)) return "male";
  if (["female", "wanita", "perempuan"].includes(normalized)) return "female";
  return null;
}

export default function ZiWeiPage() {
  const [result, setResult] = useState<ZiWeiResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [stored, profile] = await Promise.all([storageProvider.getUserBlueprint(), storageProvider.getUserProfile()]);
        const blueprint = stored as unknown as Blueprint | null;
        const profileRecord = profile as unknown as Record<string, unknown> | null;
        const input = blueprint?.input;
        setResult(calculateZiWei({
          birthDate: input?.birthDate || (profileRecord?.birthDate as string | undefined),
          birthTime: input?.birthTime || (profileRecord?.birthTime as string | undefined),
          birthCity: input?.birthCity || (profileRecord?.birthCity as string | undefined),
          timezone: input?.timezone || (profileRecord?.timezone as string | undefined),
          gender: canonicalGender(profileRecord?.gender ?? profileRecord?.sex ?? profileRecord?.jenisKelamin),
        }));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const presentation = useMemo(() => result ? buildZiWeiPresentation(result) : null, [result]);
  const identity = presentation?.identity ?? [];
  const byId = (id: string) => identity.find((section) => section.id === id);

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-x-hidden bg-[#FCFAF5] px-4 py-8 pb-32 sm:px-6">
        <AppNav />
        <div className="mx-auto max-w-6xl">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} /> Kembali ke Profil
          </Link>

          <header className="mb-10 max-w-3xl">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><CircleDot size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Zi Wei Dou Shu</p>
            <h1 className="mt-2 font-serif text-4xl text-[#4F5E52] sm:text-5xl">{presentation?.hero.title ?? "Peta Istana dan Bintang Kehidupanmu"}</h1>
            {presentation && result?.status !== "unavailable" && (
              <>
                <div className="mt-5 flex flex-wrap gap-2">{presentation.hero.facts.map((fact) => <span key={fact.label} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#4F5E52] shadow-sm"><span className="text-[#9AA394]">{fact.label}</span> · {fact.value}</span>)}</div>
                <p className="mt-5 max-w-2xl leading-7 text-[#7B8776]">{presentation.hero.insight}</p>
              </>
            )}
          </header>

          {loading ? <p className="py-16 text-center text-[#7B8776]">Menyusun dua belas istana...</p> : !result || !presentation || result.status === "unavailable" ? (
            <EmptyState message={result?.calculationError || "Data kelahiran belum tersedia."} />
          ) : (
            <div className="space-y-12">
              {presentation.notices.length > 0 && <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 text-sm leading-7 text-[#7B8776]">{presentation.notices.map((notice) => <p key={notice}>{notice}</p>)}</div>}

              <SectionBlock title="Chart Identity" sections={[byId("chart-identity")]} />
              <SectionBlock title="Life Palace" sections={[byId("life-palace")]} />
              <SectionBlock title="Body Palace" sections={[byId("body-palace")]} />
              <SectionBlock title="Five Element Bureau" sections={[byId("bureau")]} />

              <section aria-labelledby="palace-chart-title">
                <SectionTitle id="palace-chart-title" icon={Grid3X3}>Twelve Palace Chart</SectionTitle>
                <TwelvePalaceChart palaces={result.palaces} interpretations={presentation.palaceSections} />
              </section>

              <SectionBlock title="Major Stars" sections={[{ id: "major-stars", title: "Major Stars", snapshot: [{ label: "Jumlah terverifikasi", value: `${result.majorStars.length} Major Stars` }, { label: "Pembacaan", value: "Terintegrasi di setiap istana" }], humanMeaning: ["Major Stars bekerja melalui konteks hidup tempat mereka berada. Karena itu, pembacaan mereka sudah disatukan ke dalam makna tiap istana, bukan dipecah menjadi daftar sifat yang berdiri sendiri."], growthDirection: "Baca pola keseluruhan sebelum menarik kesimpulan dari satu nama bintang." }]} />
              <SectionBlock title="Supporting Stars" sections={[{ id: "supporting-stars", title: "Supporting Stars", snapshot: result.supportingStars.length ? [{ label: "Nama teknis", value: result.supportingStars.map((star) => star.canonicalName).filter((name, index, values) => values.indexOf(name) === index).join(" · ") }] : [], humanMeaning: ["Supporting Stars memberi konteks tambahan berupa dukungan sosial, komunikasi, tekanan, kepekaan, disiplin, atau perubahan. Perannya sudah disatukan ke dalam pembacaan istana agar tidak berubah menjadi kamus bintang."], challenge: "Yang perlu dijaga adalah memberi satu supporting star bobot yang lebih besar daripada struktur keseluruhan." }]} />
              <SectionBlock title="Four Transformations" sections={[byId("transformations")]} />
              <SectionBlock title="Life Master and Body Master" sections={[byId("masters")]} />
              <SectionBlock title="Active Decade" sections={[byId("active-decade")]} />

              {presentation.themeSections.map((section) => <SectionBlock key={section.id} title={section.title} sections={[section]} />)}

              {presentation.summary.length > 0 && (
                <section className="mx-auto max-w-2xl rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md sm:p-8">
                  <div className="mb-5 flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="font-serif text-2xl font-bold">Kesimpulan Dirimu</h2></div>
                  <div className="space-y-5 text-sm leading-7 text-[#D2D8D0]">{presentation.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
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
  return <div className="mx-auto max-w-xl rounded-3xl border border-[#E8E1D3] bg-white p-8 text-center"><h2 className="font-serif text-2xl text-[#4F5E52]">Data belum cukup</h2><p className="mt-3 leading-7 text-[#7B8776]">{message}</p></div>;
}

function SectionTitle({ id, icon: Icon = Sparkles, children }: { id?: string; icon?: typeof Sparkles; children: React.ReactNode }) {
  return <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF1EA] text-[#4F5E52]"><Icon size={19} /></div><h2 id={id} className="text-sm font-bold uppercase tracking-[0.16em] text-[#7B8776]">{children}</h2></div>;
}

function SectionBlock({ title, sections }: { title: string; sections: Array<ZiWeiSection | undefined> }) {
  const visible = sections.filter((section): section is ZiWeiSection => Boolean(section));
  if (!visible.length) return null;
  return <section><SectionTitle>{title}</SectionTitle><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{visible.map((section) => <DetailCard key={section.id} section={section} />)}</div></section>;
}

function DetailCard({ section }: { section: ZiWeiSection }) {
  return <article className="min-w-0 rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9AA394]">{section.title}</p>
    {section.snapshot.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{section.snapshot.map((item) => <span key={`${item.label}-${item.value}`} className="max-w-full rounded-full bg-[#F5F2EA] px-3 py-2 text-xs text-[#4F5E52]"><span className="font-semibold">{item.label}:</span> <span className="break-words">{item.value}</span></span>)}</div>}
    <details className="group mt-4 border-t border-[#F3EFE6] pt-3">
      <summary className="cursor-pointer list-none text-sm font-bold text-[#4F5E52]"><span className="group-open:hidden">Lihat selengkapnya</span><span className="hidden group-open:inline">Tutup penjelasan</span></summary>
      <div className="mt-4 space-y-3 text-sm leading-7 text-[#7B8776]">
        {section.humanMeaning.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.strength && <p><span className="font-bold text-[#4F5E52]">Kekuatanmu:</span> {section.strength}</p>}
        {section.challenge && <p><span className="font-bold text-[#4F5E52]">Yang perlu dijaga:</span> {section.challenge.replace(/^Yang perlu dijaga adalah\s*/i, "")}</p>}
        {section.growthDirection && <p><span className="font-bold text-[#4F5E52]">Arah pertumbuhan:</span> {section.growthDirection}</p>}
      </div>
    </details>
  </article>;
}
