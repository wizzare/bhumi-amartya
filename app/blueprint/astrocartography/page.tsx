"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AstrocartographyMap } from "@/components/blueprint/AstrocartographyMap";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateAstrocartography } from "@/lib/astrocartography/calculateAstrocartography";
import { buildAstrocartographyPresentation } from "@/lib/astrocartography/presentation";
import { buildAutomaticAstrocartographyPresentation } from "@/lib/astrocartography/automaticPresentation";
import { resolveBirthCountryCode } from "@/lib/astrocartography/cityReferences";
import type { AstrocartographyAutomaticPresentation, AstrocartographyPresentation, AstrocartographyResult } from "@/lib/astrocartography/types";

type StoredBlueprint = {
  input?: Record<string, unknown>;
  astrology?: Record<string, unknown>;
  natalChart?: Record<string, unknown>;
};

export default function AstrocartographyPage() {
  const [result, setResult] = useState<AstrocartographyResult | null>(null);
  const [presentation, setPresentation] = useState<AstrocartographyPresentation | null>(null);
  const [automatic, setAutomatic] = useState<AstrocartographyAutomaticPresentation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [blueprint, profile] = await Promise.all([storageProvider.getUserBlueprint(), storageProvider.getUserProfile()]);
        const stored = blueprint as unknown as StoredBlueprint | null;
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
        const calculated = calculateAstrocartography(birthData, (stored?.astrology || stored?.natalChart) as never);
        const profileRecord = profile as unknown as Record<string, unknown> | null;
        const birthCountryCode = resolveBirthCountryCode(
          typeof input.birthCountryCode === "string" ? input.birthCountryCode : typeof profileRecord?.birthCountryCode === "string" ? profileRecord.birthCountryCode : null,
          birthData.birthCountry,
        );
        setResult(calculated);
        setPresentation(buildAstrocartographyPresentation(calculated));
        setAutomatic(buildAutomaticAstrocartographyPresentation(calculated, { birthCountryCode }));
      } catch (error) {
        console.error("[Astrocartography] Unable to build map", error);
        setResult(null);
        setPresentation(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) return <ProtectedRoute><main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mt-24 text-center text-[#7B8776]">Menghubungkan langit dan bumi...</p></main></ProtectedRoute>;
  if (!result || !presentation) return <ProtectedRoute><main className="min-h-screen bg-[#FCFAF5] px-5 py-8"><AppNav /><p className="mx-auto mt-24 max-w-xl text-center leading-7 text-[#7B8776]">Peta Astrocartography belum dapat dibangun. Data kelahiranmu tetap aman dan tidak ada garis perkiraan yang ditampilkan.</p></main></ProtectedRoute>;

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-x-hidden bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-6xl">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>

          <header className="rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md sm:p-9">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10"><Globe2 size={27} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4DDD4]">{presentation.hero.eyebrow}</p>
            <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight">Astrocartography</h1>
            <p className="mt-2 font-serif text-2xl text-[#D8E0D7]">Peta Langitmu di Atas Bumi</p>
            {presentation.availabilityStatus === "available" && <p className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm"><strong>{presentation.hero.lineCount}</strong>&nbsp;garis terhitung</p>}
            {automatic && <div className="mt-3 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-4 py-2 text-sm">Tema utama · {automatic.strongestCategory}</span><span className="rounded-full bg-white/10 px-4 py-2 text-sm">{automatic.referenceCities.length} wilayah referensi</span></div>}
            <p className="mt-5 max-w-3xl leading-7 text-[#D8E0D7]">Peta ini menunjukkan wilayah tempat tema rumah, karya, relasi, dan pertumbuhanmu dapat terasa lebih menonjol.</p>
          </header>

          <div className="mt-10 space-y-10">
            {presentation.availabilityStatus === "available" && automatic ? (
              <>
                <section>
                  <AstrocartographyMap automatic={automatic} />
                </section>
              </>
            ) : (
              <section className="rounded-2xl border border-[#E8E1D3] bg-white p-6 text-sm leading-7 text-[#7B8776]">
                <h2 className="font-serif text-2xl text-[#4F5E52]">Peta belum tersedia</h2>
                <p className="mt-3">Peta Astrocartography belum dapat dihitung karena membutuhkan tanggal, jam, zona waktu, dan lokasi lahir yang lengkap.</p>
                <Link href="/settings" className="mt-4 inline-flex font-bold text-[#4F5E52] underline">Lengkapi profil kelahiran</Link>
              </section>
            )}

            <section className="rounded-2xl border border-[#E8E1D3] bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl text-[#4F5E52]">Cara Membaca Peta</h2>
              <p className="mt-4 text-sm leading-7 text-[#7B8776]">{presentation.travelThemes}</p>
              <p className="mt-4 text-sm leading-7 text-[#7B8776]">{presentation.growthThemes}</p>
            </section>

            {automatic && <section className="rounded-2xl border border-[#D9E4DA] bg-[#F1F7F1] p-5 text-sm leading-7 text-[#657568]"><p>{automatic.safetyNote}</p><p className="mt-2">{automatic.privacyNotice}</p></section>}

            <section className="rounded-3xl bg-[#4F5E52] p-6 text-white shadow-md sm:p-8">
              <div className="mb-5 flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="text-lg font-bold">Kesimpulan Dirimu</h2></div>
              <div className="space-y-4 text-sm leading-7 text-[#D8E0D7]">{(automatic?.summary || presentation.summary).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </section>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
