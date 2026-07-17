"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel, type DestinyMatrixVisualModel } from "@/lib/visual/destinyMatrixVisualModel";
import { MatrixDiagram, chakraColors } from "@/components/blueprint/DestinyMatrixVisual";
import { buildDestinyMatrixPresentation, type DestinyMatrixPresentation } from "@/lib/destiny-matrix/presentation";

function Card({ title, subtitle, items }: { title: string, subtitle?: string, items: { label: string, value: string }[] }) {
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm h-full">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#9AA394] mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-[#7B8776] mb-4">{subtitle}</p>}
      <div className="space-y-3 mt-4">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="text-xs font-semibold text-[#8A8175]">{item.label}</p>
            <p className="text-sm text-[#4F5E52] mt-1">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DestinyMatrixPage() {
  const [matrix, setMatrix] = useState<DestinyMatrixVisualModel | null>(null);
  const [presentation, setPresentation] = useState<DestinyMatrixPresentation | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [blueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        const stored = blueprint as unknown as { input?: { birthDate?: string; timezone?: string | null } } | null;
        const dateOfBirth = stored?.input?.birthDate || profile?.birthDate;
        if (!dateOfBirth) return;
        const timezone = stored?.input?.timezone || profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const canonical = calculateBhumiMatrix(dateOfBirth);
        setBirthDate(dateOfBirth);
        setMatrix(buildDestinyMatrixVisualModel(canonical));
        setPresentation(buildDestinyMatrixPresentation(canonical, { birthDate: dateOfBirth, timezone }));
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <p className="text-center text-[#7B8776] mt-20">Membuka data...</p>
        </main>
      </ProtectedRoute>
    );
  }

  if (!matrix || !presentation) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <p className="text-center text-[#7B8776] mt-20">Tanggal lahir belum tersedia untuk membangun Destiny Matrix.</p>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-7xl">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          
          <header className="mb-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Compass size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Destiny Matrix</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Blueprint Jiwa</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Peta pola kehidupan yang menggambarkan pelajaran jiwa, pola leluhur, relasi, talenta, ekonomi, spiritualitas, dan evolusi kesadaran.</p>
          </header>

          <div className="space-y-16">
            
            {/* SECTION 1: DESTINY MATRIX GRAPHIC */}
            <section>
              <div className="overflow-hidden rounded-3xl border border-[#DED7CA] bg-[linear-gradient(180deg,#FFFFFF_0%,#FCFAF5_100%)] p-3 shadow-sm sm:p-6">
                <div className="mb-2 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#9AA394]">Peta Energi Kehidupan</p>
                  <p className="mt-1 font-serif text-2xl text-[#273B4A]">Destiny Matrix</p>
                </div>
                <div className="mx-auto w-full max-w-[1120px]">
                  <MatrixDiagram matrix={matrix} birthDate={birthDate ?? undefined} activeAge={presentation.annualArcana?.age} activeArcana={presentation.annualArcana?.arcana} />
                </div>
                <p className="mt-1 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A8175]">Lingkar luar · Arcana Tahunan berdasarkan usia</p>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-[#6F7D72]" aria-label="Legenda diagram Destiny Matrix">
                <span><span aria-hidden="true" className="text-[#A56BBC]">━</span> Garis Ayah</span>
                <span><span aria-hidden="true" className="text-[#F57336]">━</span> Garis Ibu</span>
                <span><span aria-hidden="true" className="text-[#D84242]">♥</span> Jalur Cinta</span>
                <span><span aria-hidden="true" className="text-[#4F8A5B]">$</span> Jalur Uang</span>
                <span><span aria-hidden="true">○</span> Talenta</span>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-center">
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Center Arcana</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{presentation.center.displayValue}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Common Energy</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{presentation.commonEnergy.displayValue}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Karmic Tile</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{presentation.karmicTile.displayValue}</p>
                </div>
              </div>
              <div className="mt-4 text-center px-4">
                <p className="text-sm text-[#7B8776]">Pola ini adalah cerminan inti dari perjalanan jiwamu, menghubungkan energi material dan spiritual.</p>
              </div>
            </section>

            {/* SECTION 2: SOUL ARCHITECTURE */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6 flex items-center gap-2"><Sparkles size={20} className="text-[#D4AF37]" /> Soul Architecture</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presentation.soulSearching && <Card title={presentation.soulSearching.displayLabel} subtitle={presentation.soulSearching.canonicalLabel} items={[
                  { label: "Result", value: String(presentation.soulSearching.resultValue) },
                  { label: "Meaning", value: presentation.soulSearching.shortExplanation },
                  { label: "Interpretation", value: presentation.soulSearching.fullExplanation }
                ]} />}
                {presentation.socialization && <Card title={presentation.socialization.displayLabel} subtitle={presentation.socialization.canonicalLabel} items={[
                  { label: "Result", value: String(presentation.socialization.resultValue) },
                  { label: "Meaning", value: presentation.socialization.shortExplanation },
                  { label: "Interpretation", value: presentation.socialization.fullExplanation }
                ]} />}
                {presentation.spiritualKnowledge && <Card title={presentation.spiritualKnowledge.displayLabel} subtitle={presentation.spiritualKnowledge.canonicalLabel} items={[
                  { label: "Result", value: String(presentation.spiritualKnowledge.resultValue) },
                  { label: "Meaning", value: presentation.spiritualKnowledge.shortExplanation },
                  { label: "Interpretation", value: presentation.spiritualKnowledge.fullExplanation }
                ]} />}
              </div>
            </section>

            {/* SECTION 3: CORE PATTERNS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Core Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Center Arcana" items={[
                  { label: "Arcana", value: presentation.center.displayValue },
                  { label: "Meaning", value: presentation.center.narrative },
                ]} />
                <Card title="Common Energy" items={[
                  { label: "Arcana", value: presentation.commonEnergy.displayValue },
                  { label: "Dominant Themes", value: presentation.commonEnergy.narrative },
                ]} />
                <Card title="Karmic Tile" items={[
                  { label: "Arcana", value: presentation.karmicTile.displayValue },
                  { label: "Life Lesson", value: presentation.karmicTile.narrative },
                ]} />
              </div>
            </section>

            {/* SECTION 4: ANCESTRAL PATTERNS */}
            {(presentation.fatherLine || presentation.motherLine) && <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Ancestral Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {presentation.fatherLine && <Card title="Father Line" items={[
                  { label: "Father Karma", value: presentation.fatherLine.karma.displayValue },
                  { label: "Father Talent", value: presentation.fatherLine.talent.displayValue },
                  { label: "Lineage Wisdom", value: presentation.fatherLine.narrative },
                ]} />}
                {presentation.motherLine && <Card title="Mother Line" items={[
                  { label: "Mother Karma", value: presentation.motherLine.karma.displayValue },
                  { label: "Mother Talent", value: presentation.motherLine.talent.displayValue },
                  { label: "Lineage Wisdom", value: presentation.motherLine.narrative },
                ]} />}
              </div>
            </section>}

            {/* SECTION 5: TALENTS & GIFTS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Talents & Gifts</h2>
              <div className="grid grid-cols-1 gap-4">
                {presentation.fatherTalents && <Card title="Father Talents" items={[
                  { label: "Arcana", value: presentation.fatherTalents.displayValue },
                  { label: "Meaning", value: presentation.fatherTalents.narrative }
                ]} />}
                {presentation.motherTalents && <Card title="Mother Talents" items={[
                  { label: "Arcana", value: presentation.motherTalents.displayValue },
                  { label: "Meaning", value: presentation.motherTalents.narrative }
                ]} />}
                <Card title="Higher Talents" items={[
                  { label: "Arcana", value: presentation.higherTalents.displayValue },
                  { label: "Meaning", value: presentation.higherTalents.narrative }
                ]} />
              </div>
            </section>

            {/* SECTION 6: MONEY & LOVE */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Money & Love</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Money Path" items={[
                  { label: "Money Path", value: presentation.moneyPath.displayValue },
                  { label: "Financial Pattern", value: presentation.moneyPath.narrative }
                ]} />
                <Card title="Love Path" items={[
                  { label: "Love Path", value: presentation.lovePath.displayValue },
                  { label: "Relationship Pattern", value: presentation.lovePath.narrative }
                ]} />
              </div>
            </section>

            {/* SECTION 7: CHAKRA MATRIX */}
            {presentation.energyMatrix && <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-2">Health Matrix</h2>
              <p className="mb-6 text-sm text-[#7B8776]">Peta Keseimbangan Energi</p>
              <div className="overflow-x-auto rounded-2xl border border-[#E7E0D4] bg-white mb-6">
                <table className="w-full min-w-[430px] text-sm">
                  <thead className="bg-[#F5F1E8] text-[#6B746C]">
                    <tr>
                      <th className="p-3 text-left font-semibold">Chakras</th>
                      <th className="p-3 text-center font-semibold">Physics</th>
                      <th className="p-3 text-center font-semibold">Energy</th>
                      <th className="p-3 text-center font-semibold">Emotions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {presentation.energyMatrix.rows.map((row) => (
                      <Fragment key={row.rowId}>
                        <tr className="border-t border-white" style={{ backgroundColor: chakraColors[row.chakra] }}>
                          <td className="p-3 font-semibold text-white/90 drop-shadow-sm">{row.chakra}</td>
                          <td className="p-3 text-center text-white font-medium">{row.physical ?? "—"}</td>
                          <td className="p-3 text-center text-white font-medium">{row.energy ?? "—"}</td>
                          <td className="p-3 text-center text-white font-medium">{row.emotion ?? "—"}</td>
                        </tr>
                        <tr className="border-t border-[#EEE8DD] bg-white">
                          <td colSpan={4} className="p-0">
                            <details className="group px-3 py-2">
                              <summary className="cursor-pointer list-none text-xs font-bold text-[#657568] marker:content-none">Keterangan selengkapnya <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">⌄</span></summary>
                              <div className="mt-3 grid gap-3 border-t border-[#EEE8DD] pt-3 text-xs leading-5 text-[#657568] sm:grid-cols-2">
                                {row.physicsExplanation && <div><p className="font-bold text-[#4F5E52]">Fisik</p><p>{row.physicsExplanation}</p></div>}
                                {row.energyExplanation && <div><p className="font-bold text-[#4F5E52]">Energi</p><p>{row.energyExplanation}</p></div>}
                                {row.emotionsExplanation && <div><p className="font-bold text-[#4F5E52]">Emosi</p><p>{row.emotionsExplanation}</p></div>}
                                <div><p className="font-bold text-[#4F5E52]">Keseluruhan</p><p>{row.integratedExplanation}</p></div>
                              </div>
                            </details>
                          </td>
                        </tr>
                      </Fragment>
                    ))}
                    <tr className="border-t border-white bg-[#D6D0C7] font-bold text-[#4F5E52]">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-center">{presentation.energyMatrix.totals.physical ?? "—"}</td>
                      <td className="p-3 text-center">{presentation.energyMatrix.totals.energy ?? "—"}</td>
                      <td className="p-3 text-center">{presentation.energyMatrix.totals.emotion ?? "—"}</td>
                    </tr>
                    <tr className="bg-[#F8F5EF]"><td colSpan={4} className="px-3 py-2 text-xs leading-5 text-[#657568]">{presentation.energyMatrix.totalExplanation}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <details className="group rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                  <summary className="cursor-pointer list-none font-serif text-lg text-[#4F5E52] marker:content-none">Cara Membaca Peta Ini <span aria-hidden="true" className="float-right transition-transform group-open:rotate-180">⌄</span><span className="mt-1 block font-sans text-xs font-bold text-[#8A8175]">Keterangan selengkapnya</span></summary>
                  <p className="mt-4 border-t border-[#EEE8DD] pt-4 text-sm leading-6 text-[#657568]">{presentation.energyMatrix.shortExplanation}</p>
                </details>
                <details className="group rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                  <summary className="cursor-pointer list-none font-serif text-lg text-[#4F5E52] marker:content-none">Catatan Penting <span aria-hidden="true" className="float-right transition-transform group-open:rotate-180">⌄</span><span className="mt-1 block font-sans text-xs font-bold text-[#8A8175]">Keterangan selengkapnya</span></summary>
                  <p className="mt-4 border-t border-[#EEE8DD] pt-4 text-sm leading-6 text-[#657568]">{presentation.energyMatrix.safetyNotice}</p>
                </details>
              </div>
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8E1D3]">
                <p className="mb-3 text-sm font-bold text-[#4F5E52]">Pola Keseimbanganmu</p>
                <details className="group">
                  <summary className="cursor-pointer list-none text-xs font-bold text-[#8A8175] marker:content-none">Keterangan selengkapnya <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">⌄</span></summary>
                  <div className="mt-4 space-y-4 border-t border-[#EEE8DD] pt-4 text-sm leading-6 text-[#7B8776]">{presentation.energyMatrix.summary.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
                </details>
              </div>
            </section>}

            {/* SECTION 8: ACTIVE ANNUAL ARCANA */}
            {presentation.annualArcana && <section>
              <div className="rounded-3xl border border-[#DED7CA] bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Tema usia yang sedang kamu jalani</p>
                <h2 className="mt-2 font-serif text-3xl text-[#4F5E52]">Arcana Tahunan</h2>
                <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-[#4F5E52]">
                  <span className="rounded-full bg-[#F5F1E8] px-4 py-2">Arcana {presentation.annualArcana.arcana}</span>
                  <span className="rounded-full bg-[#F5F1E8] px-4 py-2">Usia aktif: {presentation.annualArcana.age} tahun</span>
                  <span className="rounded-full bg-[#F5F1E8] px-4 py-2">{presentation.annualArcana.ageRangeLabel}</span>
                </div>
                <p className="mt-4 text-sm text-[#7B8776]">Aktif sejak ulang tahun terakhirmu</p>
                <p className="mt-1 text-sm font-semibold text-[#657568]">Periode aktif: {presentation.annualArcana.periodStart}{presentation.annualArcana.periodEnd ? ` – ${presentation.annualArcana.periodEnd}` : ""}</p>
                <details className="group mt-5 border-t border-[#EEE8DD] pt-4">
                  <summary className="cursor-pointer list-none text-sm font-bold text-[#657568] marker:content-none">Keterangan selengkapnya <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">⌄</span></summary>
                  <div className="mt-5 space-y-4 text-sm leading-7 text-[#7B8776]">
                    {presentation.annualArcana.integratedParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </details>
              </div>
            </section>}

            {/* SECTION 9: DESTINY MATRIX SYNTHESIS */}
            <section>
              <div className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-lg font-bold">Kesimpulan Dirimu</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {presentation.summary.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
