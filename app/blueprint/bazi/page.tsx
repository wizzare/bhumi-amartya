"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CircleDot,
  Coins,
  Compass,
  Heart,
  Layers3,
  Sparkles,
} from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import type { Blueprint } from "@/lib/types/blueprint";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import type { BaziBlueprint, BaziPillar } from "@/lib/bazi/types";

export default function BaziPage() {
  const [bazi, setBazi] = useState<BaziBlueprint | null>(null);
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
        if (blueprint.bazi) {
          setBazi(blueprint.bazi);
          return;
        }
        const birthDate = blueprint.input?.birthDate || profile?.birthDate;
        const birthTime = blueprint.input?.birthTime || profile?.birthTime;
        if (!birthDate || !birthTime) return;
        const calculated = calculateBazi({
          birthDate,
          birthTime,
          timezone: blueprint.input?.timezone || profile?.timezone,
        });
        await storageProvider.saveUserBlueprint({
          ...storedBlueprint,
          bazi: calculated,
          updatedAt: new Date().toISOString(),
        });
        setBazi(calculated);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />Kembali ke Profil
          </Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <CircleDot size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">BaZi</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Empat Pilar Takdirmu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Peta kalender kelahiran melalui Batang Langit, Cabang Bumi, Lima Elemen, dan ritme keberuntungan.</p>
          </header>

          {loading ? (
            <p className="py-16 text-center text-[#7B8776]">Menghitung Empat Pilar...</p>
          ) : bazi ? (
            <div className="space-y-8">
              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Empat Pilar</h2>
                <div className="grid grid-cols-2 gap-4">
                  <PillarCard title="Pilar Tahun" pillar={bazi.yearPillar} />
                  <PillarCard title="Pilar Bulan" pillar={bazi.monthPillar} />
                  <PillarCard title="Pilar Hari" pillar={bazi.dayPillar} />
                  <PillarCard title="Pilar Jam" pillar={bazi.hourPillar} />
                </div>
              </section>

              <section className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><Compass size={20} /></div>
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">Day Master</h2>
                    <p className="mt-1 text-2xl font-serif font-bold text-[#4F5E52]">{bazi.dayMaster.stem} {bazi.dayMaster.pinyin}</p>
                    <p className="text-sm font-semibold text-[#7B8776]">{bazi.dayMaster.polarity} {bazi.dayMaster.element}</p>
                  </div>
                </div>
                <p className="mt-4 border-t border-[#F5F1E8] pt-4 text-sm leading-relaxed text-[#7B8776]">{bazi.dayMaster.description}</p>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Lima Elemen</h2>
                <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                  <div className="space-y-3">
                    {Object.entries(bazi.fiveElements).map(([element, value]) => (
                      <div key={element}>
                        <div className="mb-1 flex justify-between text-sm font-semibold text-[#4F5E52]"><span>{element}</span><span>{value}/8</span></div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#F1EDE4]"><div className="h-full rounded-full bg-[#7B8776]" style={{ width: `${value * 12.5}%` }} /></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#F5F1E8] pt-4 text-sm">
                    <div><p className="font-bold text-emerald-700">Pendukung</p><p className="text-[#7B8776]">{bazi.favorableElements.join(", ")}</p></div>
                    <div><p className="font-bold text-rose-700">Perlu Dijaga</p><p className="text-[#7B8776]">{bazi.unfavorableElements.join(", ")}</p></div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Ten Gods</h2>
                <div className="grid gap-3">
                  {bazi.tenGods.map((item) => (
                    <div key={item.pillar} className="flex items-center justify-between rounded-2xl border border-[#E8E1D3] bg-white p-4 shadow-sm">
                      <span className="text-sm font-bold capitalize text-[#4F5E52]">{item.pillar} stem · {item.stem}</span>
                      <span className="rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-semibold text-[#7B8776]">{item.tenGod}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">Siklus Keberuntungan</h2>
                <div className="rounded-2xl border border-[#D8D0C3] bg-[#F5F1E8] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">Siklus Saat Ini</p>
                  <p className="mt-1 text-2xl font-serif font-bold text-[#4F5E52]">{bazi.currentLuckCycle.pillar.display}</p>
                  <p className="mt-1 text-sm text-[#7B8776]">Usia {bazi.currentLuckCycle.startAge}–{bazi.currentLuckCycle.endAge}</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {bazi.luckPillars.map((cycle) => (
                    <div key={cycle.index} className="rounded-xl border border-[#E8E1D3] bg-white p-3 text-center">
                      <p className="font-serif font-bold text-[#4F5E52]">{cycle.pillar.display}</p>
                      <p className="mt-1 text-xs text-[#9AA394]">{cycle.startAge}–{cycle.endAge} tahun</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-4">
                <Insight icon={Sparkles} title="Kekuatan" items={bazi.strengths} />
                <Insight icon={Layers3} title="Tantangan" items={bazi.challenges} />
                <Insight icon={BriefcaseBusiness} title="Gaya Karier" text={bazi.careerStyle} />
                <Insight icon={Heart} title="Gaya Relasi" text={bazi.relationshipStyle} />
                <Insight icon={Coins} title="Gaya Rezeki" text={bazi.moneyStyle} />
                <Insight icon={Compass} title="Misi Kehidupan" text={bazi.lifeMission} />
              </section>

              <section className="rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-5 flex items-center gap-2"><Sparkles size={18} className="text-[#D4AF37]" /><h2 className="text-xl font-serif font-bold">Kesimpulan BaZi</h2></div>
                <div className="space-y-4 text-sm leading-relaxed text-[#D2D8D0]">
                  {bazi.summary.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            </div>
          ) : (
            <p className="py-16 text-center text-[#7B8776]">Data kelahiran belum lengkap untuk menghitung BaZi.</p>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

function PillarCard({ title, pillar }: { title: string; pillar: BaziPillar }) {
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-white p-4 text-center shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wider text-[#9AA394]">{title}</p>
      <p className="mt-2 text-3xl font-serif font-bold text-[#4F5E52]">{pillar.stem}{pillar.branch}</p>
      <p className="mt-1 text-sm font-semibold text-[#7B8776]">{pillar.stemPinyin} {pillar.branchPinyin}</p>
      <p className="mt-2 text-xs text-[#9AA394]">{pillar.polarity} {pillar.element} · {pillar.animal}</p>
    </div>
  );
}

function Insight({ icon: Icon, title, text, items }: { icon: typeof Sparkles; title: string; text?: string; items?: string[] }) {
  return (
    <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2"><Icon size={18} className="text-[#9AA394]" /><h3 className="font-serif text-lg font-bold text-[#4F5E52]">{title}</h3></div>
      {items ? <ul className="space-y-2 text-sm leading-relaxed text-[#7B8776]">{items.map((item) => <li key={item}>• {item}</li>)}</ul> : <p className="text-sm leading-relaxed text-[#7B8776]">{text}</p>}
    </div>
  );
}
