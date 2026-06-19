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
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.center || "Coming Soon"}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Common Energy</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.commonEnergy || "Coming Soon"}</p>
                </div>
                <div className="bg-[#F5F1E8] px-4 py-2 rounded-xl flex-1">
                  <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-1">Karmic Tail</p>
                  <p className="text-sm font-bold text-[#4F5E52]">{legacy?.karmicTile || "Coming Soon"}</p>
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
                  { label: "Result", value: matrix.soulSearching?.values?.join(" · ") || "Coming Soon" },
                  { label: "Meaning", value: "Pencarian identitas dan fondasi relasi." },
                  { label: "Interpretation", value: "Fase ini berfokus pada pengembangan diri awal." }
                ]} />
                <Card title="Socialization" subtitle="Social and family systems. Result and public acceptance." items={[
                  { label: "Result", value: matrix.socialization?.values?.join(" · ") || "Coming Soon" },
                  { label: "Meaning", value: "Interaksi dengan dunia luar dan masyarakat." },
                  { label: "Interpretation", value: "Fase kematangan sosial di mana karya diakui." }
                ]} />
                <Card title="Spiritual Knowledge" subtitle="Spiritual exam. Who am I before God?" items={[
                  { label: "Arcana", value: matrix.spiritualKnowledge?.values?.join(" · ") || "Coming Soon" },
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
                  { label: "Arcana", value: legacy?.center ? String(legacy.center) : "Coming Soon" },
                  { label: "Meaning", value: "Inti kepribadian." },
                  { label: "Strength", value: "Membawa kestabilan." },
                  { label: "Shadow", value: "Kecenderungan stagnan." },
                  { label: "Life Lesson", value: "Menerima diri sendiri." }
                ]} />
                <Card title="Common Energy" items={[
                  { label: "Arcana", value: legacy?.commonEnergy || "Coming Soon" },
                  { label: "Dominant Themes", value: "Tema yang sering muncul." },
                  { label: "Repeated Patterns", value: "Siklus yang terus berulang." },
                  { label: "Natural Tendencies", value: "Kecenderungan alamiah." }
                ]} />
                <Card title="Karmic Tail" items={[
                  { label: "Arcana", value: legacy?.karmicTile || "Coming Soon" },
                  { label: "Life Lesson", value: "Tugas dari masa lalu." },
                  { label: "Shadow Pattern", value: "Pola negatif terpendam." },
                  { label: "Healing Direction", value: "Penerimaan dan pelepasan." }
                ]} />
              </div>
            </section>

            {/* SECTION 4: ANCESTRAL PATTERNS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Ancestral Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Father Line" items={[
                  { label: "Father Karma", value: legacy?.fatherKarma || "Coming Soon" },
                  { label: "Father Talent", value: legacy?.fatherTalent || "Coming Soon" },
                  { label: "Strengths", value: "Perlindungan dan ketegasan." },
                  { label: "Challenges", value: "Kesulitan berekspresi." },
                  { label: "Healing Opportunities", value: "Membangun batas sehat." }
                ]} />
                <Card title="Mother Line" items={[
                  { label: "Mother Karma", value: legacy?.motherKarma || "Coming Soon" },
                  { label: "Mother Talent", value: legacy?.motherTalent || "Coming Soon" },
                  { label: "Strengths", value: "Intuisi dan empati." },
                  { label: "Challenges", value: "Kelekatan emosional." },
                  { label: "Healing Opportunities", value: "Mencintai tanpa syarat." }
                ]} />
                <Card title="Ancestor Line" items={[
                  { label: "Arcana", value: matrix.ancestor?.values?.join(" · ") || "Coming Soon" },
                  { label: "Strengths", value: "Kebijaksanaan leluhur." },
                  { label: "Challenges", value: "Pola trauma lintas generasi." },
                  { label: "Healing Opportunities", value: "Memutus rantai karma." }
                ]} />
              </div>
            </section>

            {/* SECTION 5: TALENTS & GIFTS */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Talents & Gifts</h2>
              <div className="grid grid-cols-1 gap-4">
                <Card title="God Talent" items={[
                  { label: "Arcana", value: legacy?.godTalent || "Coming Soon" },
                  { label: "Meaning", value: "Bakat spiritual dan koneksi Ilahi." }
                ]} />
                <Card title="Personal Qualities" items={[
                  { label: "Arcana", value: legacy?.personalQualities || "Coming Soon" },
                  { label: "Meaning", value: "Karakter pribadi yang menonjol." }
                ]} />
                <Card title="Talent Line" items={[
                  { label: "Arcana", value: matrix.talent?.values?.join(" · ") || "Coming Soon" },
                  { label: "Natural Gifts", value: "Potensi bawaan." },
                  { label: "Potential", value: "Kemungkinan pencapaian." },
                  { label: "Career Tendencies", value: "Bidang perkembangan." },
                  { label: "Personal Strengths", value: "Keunikan personal." }
                ]} />
              </div>
            </section>

            {/* SECTION 6: MONEY & LOVE */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Money & Love</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card title="Money Channel" items={[
                  { label: "Money Line", value: legacy?.moneyLine || "Coming Soon" },
                  { label: "Financial Pattern", value: "Cara menarik kelimpahan." },
                  { label: "Potential Block", value: "Pikiran kelangkaan." },
                  { label: "Growth Direction", value: "Membangun sistem." }
                ]} />
                <Card title="Love Channel" items={[
                  { label: "Love Line", value: legacy?.loveLine || "Coming Soon" },
                  { label: "Relationship Pattern", value: "Dinamika koneksi intim." },
                  { label: "Challenge", value: "Kesulitan membuka diri." },
                  { label: "Growth Direction", value: "Kerentanan emosional." }
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

            {/* SECTION 8: LIFE TIMELINE */}
            <section>
              <h2 className="text-2xl font-serif text-[#4F5E52] mb-6">Life Timeline</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {matrix.timeline?.segments?.slice(0, 7).map((segment, index) => {
                  const ages = ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"];
                  return (
                    <div key={index} className="rounded-xl border border-[#E8E1D3] bg-white p-4 text-center">
                      <p className="text-[10px] font-bold uppercase text-[#8A8175] mb-2">{ages[index] || segment.label}</p>
                      <p className="text-lg font-bold text-[#4F5E52]">{segment.values[0]}</p>
                      <p className="text-xs text-[#7B8776] mt-2">Major Arcana</p>
                    </div>
                  );
                })}
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
                    Pola jiwamu menempatkan Arcana {legacy?.center || "Coming Soon"} di pusat, menandakan bahwa kenyamanan dan inti kekuatanmu berasal dari energi ini. Dikelilingi oleh vibrasi dominan {legacy?.commonEnergy || "Coming Soon"}, jalan hidupmu akan sering berpusat pada penemuan makna di dalam pengulangan tema yang selaras dengan arcana tersebut.
                  </p>
                  <p>
                    Sebagai bagian dari pembelajaran karmik ({legacy?.karmicTile || "Coming Soon"}), ada pola dari masa lalu yang perlu diselesaikan. Energi ini tidak dirancang untuk menghukum, melainkan membawamu pada pembebasan batin. Di sisi lain, potensi terbesarmu tercermin dalam garis bakat ({matrix.talent?.values?.join(" · ") || "Coming Soon"}), menanti untuk diekspresikan baik melalui jalan karir maupun sumbangsih pribadi.
                  </p>
                  <p>
                    Melalui dinamika relasi ({legacy?.loveLine || "Coming Soon"}) dan kelimpahan finansial ({legacy?.moneyLine || "Coming Soon"}), matriks ini mengingatkan bahwa pelajaran terbesarmu adalah menyeimbangkan dorongan material dengan pemahaman spiritual. Melewati fase Soul Searching hingga Spiritual Knowledge, tujuan akhirmu adalah mencapai keselarasan utuh sebagai jiwa.
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
