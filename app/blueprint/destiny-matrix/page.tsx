"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateBhumiMatrix } from "@/lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel, type DestinyMatrixVisualModel } from "@/lib/visual/destinyMatrixVisualModel";
import { MatrixDiagram, chakraColors } from "@/components/blueprint/DestinyMatrixVisual";

import { synthesizeArcanaMeaning } from "@/lib/engines/destinyMatrixMeaningSynthesis";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [blueprint, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        const stored = blueprint as unknown as { input?: { birthDate?: string } } | null;
        const dateOfBirth = stored?.input?.birthDate || profile?.birthDate;
        if (!dateOfBirth) return;
        setMatrix(buildDestinyMatrixVisualModel(calculateBhumiMatrix(dateOfBirth)));
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

  if (!matrix) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <p className="text-center text-[#7B8776] mt-20">Tanggal lahir belum tersedia untuk membangun Destiny Matrix.</p>
        </main>
      </ProtectedRoute>
    );
  }

  const legacy = matrix.legacyReading;

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-3xl">
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
              <div className="flex justify-center items-center bg-white p-4 sm:p-6 rounded-3xl border border-[#DED7CA] shadow-sm">
                <div className="w-full max-w-[500px]">
                  <MatrixDiagram matrix={matrix} />
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-center">
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Center Arcana</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.center || "-"}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Common Energy</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.commonEnergy || "-"}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Karmic Tail</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.karmicTile || "-"}</p>
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
                <Card title="Soul Searching" subtitle="Mix of male and female. Building relationships. Skills." items={[
                  { label: "Result", value: matrix.soulSearching?.values?.join(" · ") || "-" },
                  { label: "Meaning", value: "Pencarian identitas dan fondasi relasi." },
                  { label: "Interpretation", value: "Fase ini berfokus pada pengembangan diri awal." }
                ]} />
                <Card title="Socialization" subtitle="Social and family systems. Result and public acceptance." items={[
                  { label: "Result", value: matrix.socialization?.values?.join(" · ") || "-" },
                  { label: "Meaning", value: "Interaksi dengan dunia luar dan masyarakat." },
                  { label: "Interpretation", value: "Fase kematangan sosial di mana karya diakui." }
                ]} />
                <Card title="Spiritual Knowledge" subtitle="Spiritual exam. Who am I before God?" items={[
                  { label: "Arcana", value: matrix.spiritualKnowledge?.values?.join(" · ") || "-" },
                  { label: "Meaning", value: "Pencapaian spiritual tertinggi." },
                  { label: "Interpretation", value: "Evaluasi perjalanan hidup dan hikmah mendalam." }
                ]} />
              </div>
            </section>

            {/* SECTION 3: CORE PATTERNS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Core Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Center Arcana" items={[
                  { label: "Arcana", value: legacy?.center ? String(legacy.center) : "-" },
                  { label: "Meaning", value: synthesizeArcanaMeaning(legacy?.center, "center") },
                ]} />
                <Card title="Common Energy" items={[
                  { label: "Arcana", value: legacy?.commonEnergy || "-" },
                  { label: "Dominant Themes", value: synthesizeArcanaMeaning(legacy?.commonEnergy, "commonEnergy") },
                ]} />
                <Card title="Karmic Tail" items={[
                  { label: "Arcana", value: legacy?.karmicTile || "-" },
                  { label: "Life Lesson", value: synthesizeArcanaMeaning(legacy?.karmicTile, "karmicTail") },
                ]} />
              </div>
            </section>

            {/* SECTION 4: ANCESTRAL PATTERNS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Ancestral Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Father Line" items={[
                  { label: "Father Karma", value: legacy?.fatherKarma || "-" },
                  { label: "Father Talent", value: legacy?.fatherTalent || "-" },
                  { label: "Lineage Wisdom", value: synthesizeArcanaMeaning(legacy?.fatherTalent || legacy?.fatherKarma, "fatherKarma") },
                ]} />
                <Card title="Mother Line" items={[
                  { label: "Mother Karma", value: legacy?.motherKarma || "-" },
                  { label: "Mother Talent", value: legacy?.motherTalent || "-" },
                  { label: "Lineage Wisdom", value: synthesizeArcanaMeaning(legacy?.motherTalent || legacy?.motherKarma, "motherKarma") },
                ]} />
                <Card title="Ancestor Line" items={[
                  { label: "Arcana", value: matrix.ancestor?.values?.join(" · ") || "-" },
                  { label: "Healing Opportunities", value: synthesizeArcanaMeaning(matrix.ancestor?.values, "ancestorLine") },
                ]} />
              </div>
            </section>

            {/* SECTION 5: TALENTS & GIFTS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Talents & Gifts</h2>
              <div className="grid grid-cols-1 gap-4">
                <Card title="God Talent" items={[
                  { label: "Arcana", value: legacy?.godTalent || "-" },
                  { label: "Meaning", value: synthesizeArcanaMeaning(legacy?.godTalent, "godTalent") }
                ]} />
                <Card title="Personal Qualities" items={[
                  { label: "Arcana", value: legacy?.personalQualities || "-" },
                  { label: "Meaning", value: synthesizeArcanaMeaning(legacy?.personalQualities, "personalQualities") }
                ]} />
              </div>
            </section>

            {/* SECTION 6: MONEY & LOVE */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Money & Love</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Money Channel" items={[
                  { label: "Money Line", value: legacy?.moneyLine || "-" },
                  { label: "Financial Pattern", value: synthesizeArcanaMeaning(legacy?.moneyLine, "moneyLine") }
                ]} />
                <Card title="Love Channel" items={[
                  { label: "Love Line", value: legacy?.loveLine || "-" },
                  { label: "Relationship Pattern", value: synthesizeArcanaMeaning(legacy?.loveLine, "loveLine") }
                ]} />
              </div>
            </section>

            {/* SECTION 7: CHAKRA MATRIX */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Chakra Matrix</h2>
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
                    {matrix.health?.map((row) => (
                      <tr key={row.name} className="border-t border-white" style={{ backgroundColor: chakraColors[row.name] }}>
                        <td className="p-3 font-semibold text-white/90 drop-shadow-sm">{row.name}</td>
                        <td className="p-3 text-center text-white font-medium">{row.physical}</td>
                        <td className="p-3 text-center text-white font-medium">{row.energy}</td>
                        <td className="p-3 text-center text-white font-medium">{row.emotion}</td>
                      </tr>
                    ))}
                    {matrix.healthTotals && (
                      <tr className="border-t border-white bg-[#D6D0C7] font-bold text-[#4F5E52]">
                        <td className="p-3">Total</td>
                        <td className="p-3 text-center">{matrix.healthTotals.physical}</td>
                        <td className="p-3 text-center">{matrix.healthTotals.energy}</td>
                        <td className="p-3 text-center">{matrix.healthTotals.emotion}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card title="Dominant Chakra" items={[
                  { label: "Status", value: "Chakra dengan energi terbesar." }
                ]} />
                <Card title="Weakest Chakra" items={[
                  { label: "Status", value: "Chakra yang membutuhkan perhatian ekstra." }
                ]} />
              </div>
              <div className="mt-4 p-4 rounded-xl bg-white border border-[#E8E1D3]">
                <p className="text-sm font-bold text-[#4F5E52] mb-1">Interpretation Summary</p>
                <p className="text-sm text-[#7B8776]">Kesehatan menyeluruhmu berakar pada harmoni antara emosi, energi, dan fisik. Perhatikan sinyal tubuhmu secara saksama.</p>
              </div>
            </section>

            {/* SECTION 9: DESTINY MATRIX SYNTHESIS */}
            <section>
              <div className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h2 className="text-lg font-bold">Destiny Matrix Synthesis</h2>
                </div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  <p>
                    Pola jiwamu menempatkan Arcana {legacy?.center || "-"} di pusat, menandakan bahwa kenyamanan dan inti kekuatanmu berasal dari energi ini. Dikelilingi oleh vibrasi dominan {legacy?.commonEnergy || "-"}, jalan hidupmu akan sering berpusat pada penemuan makna di dalam pengulangan tema yang selaras dengan arcana tersebut.
                  </p>
                  <p>
                    Sebagai bagian dari pembelajaran karmik ({legacy?.karmicTile || "-"}), ada pola dari masa lalu yang perlu diselesaikan. Energi ini tidak dirancang untuk menghukum, melainkan membawamu pada pembebasan batin. Di sisi lain, potensi terbesarmu tercermin dalam garis bakat ({matrix.talent?.values?.join(" · ") || "-"}), menanti untuk diekspresikan baik melalui jalan karir maupun sumbangsih pribadi.
                  </p>
                  <p>
                    Melalui dinamika relasi ({legacy?.loveLine || "-"}) dan kelimpahan finansial ({legacy?.moneyLine || "-"}), matriks ini mengingatkan bahwa pelajaran terbesarmu adalah menyeimbangkan dorongan material dengan pemahaman spiritual. Melewati fase Soul Searching hingga Spiritual Knowledge, tujuan akhirmu adalah mencapai keselarasan utuh sebagai jiwa.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}


