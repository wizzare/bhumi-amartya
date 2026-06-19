"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, Sparkles, Sun, Moon, ArrowUpCircle, MessageCircle, Heart, Zap, Infinity as InfinityIcon, Shield, Radio, Droplet, Mountain, Wind, Flame, Home } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { Blueprint } from "@/lib/types/blueprint";
import { useAuth } from "@/context/AuthContext";
import { composePlanetMeaning, getTopHouses, getTopAspects } from "@/lib/astrology/natalIntelligence";

import { generateDeterministicSynthesis } from "@/lib/engines/NatalSummaryEngine";
import { LILITH_SIGN_MEANINGS } from "@/lib/data/astrologyDictionaries";
import { NatalWheelLite } from "@/components/blueprint/NatalWheelLite";

export default function NatalChartPage() {
  const auth = useAuth();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const bp = await storageProvider.getUserBlueprint();
        if (bp) {
          setBlueprint(bp as any);
          const astrology = (bp as any).astrology || (bp as any).natalChart || {};
          
          // Use the deterministic synthesis engine instead of LLM
          const deterministicSynthesis = generateDeterministicSynthesis(astrology);
          setSynthesis(deterministicSynthesis);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const nc = (blueprint?.astrology as any) || (blueprint?.natalChart as any) || {};
  const getPlanet = (name: string) => nc.planets?.[name as keyof typeof nc.planets];

  const elements = nc.elements || {};
  const totalElements = Object.values(elements).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0) as number;
  const getElementPct = (name: string) => {
    if (totalElements === 0) return 0;
    return Math.round(((Number(elements[name]) || 0) / totalElements) * 100);
  };

  const dominantElementEntry = Object.entries(elements).sort((a: any, b: any) => b[1] - a[1])[0];
  const dominantElement = dominantElementEntry ? dominantElementEntry[0] : "Belum tersedia";

  const topHouses = getTopHouses(nc.planets);
  const topAspects = getTopAspects(nc.aspects);
  const lilith = nc.lilith;
  const lilithMeaning = lilith?.sign ? LILITH_SIGN_MEANINGS[lilith.sign] : undefined;

  const groups = [
    {
      title: "1. Identity Layer",
      items: [
        { label: "Sun", sign: nc.sunSign || getPlanet("Sun")?.sign, icon: Sun, bg: "bg-amber-50", color: "text-amber-500" },
        { label: "Moon", sign: nc.moonSign || getPlanet("Moon")?.sign, icon: Moon, bg: "bg-slate-100", color: "text-slate-500" },
        { label: "Ascendant", sign: nc.risingSign || nc.ascendant, icon: ArrowUpCircle, bg: "bg-rose-50", color: "text-rose-500" },
        { label: "MC", sign: nc.mc || nc.midheaven, icon: Mountain, bg: "bg-stone-50", color: "text-stone-500" },
      ]
    },
    {
      title: "2. Personal Planets",
      items: [
        { label: "Mercury", sign: getPlanet("Mercury")?.sign, icon: MessageCircle, bg: "bg-blue-50", color: "text-blue-500" },
        { label: "Venus", sign: getPlanet("Venus")?.sign, icon: Heart, bg: "bg-pink-50", color: "text-pink-500" },
        { label: "Mars", sign: getPlanet("Mars")?.sign, icon: Zap, bg: "bg-red-50", color: "text-red-500" },
      ]
    },
    {
      title: "3. Social Planets",
      items: [
        { label: "Jupiter", sign: getPlanet("Jupiter")?.sign, icon: Sparkles, bg: "bg-yellow-50", color: "text-yellow-600" },
        { label: "Saturn", sign: getPlanet("Saturn")?.sign, icon: Shield, bg: "bg-zinc-100", color: "text-zinc-600" },
      ]
    },
    {
      title: "4. Generational Planets",
      items: [
        { label: "Uranus", sign: getPlanet("Uranus")?.sign, icon: Radio, bg: "bg-cyan-50", color: "text-cyan-500" },
        { label: "Neptune", sign: getPlanet("Neptune")?.sign, icon: Droplet, bg: "bg-indigo-50", color: "text-indigo-400" },
        { label: "Pluto", sign: getPlanet("Pluto")?.sign, icon: Flame, bg: "bg-purple-50", color: "text-purple-600" },
      ]
    },
    {
      title: "5. Soul Evolution",
      items: [
        { label: "NorthNode", sign: nc.northNode || getPlanet("NorthNode")?.sign, icon: InfinityIcon, bg: "bg-emerald-50", color: "text-emerald-500" },
        { label: "SouthNode", sign: nc.southNode || getPlanet("SouthNode")?.sign, icon: InfinityIcon, bg: "bg-stone-50", color: "text-stone-400" },
        { label: "Chiron", sign: nc.chiron || getPlanet("Chiron")?.sign, icon: Heart, bg: "bg-teal-50", color: "text-teal-500" },
      ]
    }
  ];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white"><Compass size={25} /></div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">Natal Chart</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">Peta Langitmu</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">Sebuah potret spesifik langit pada detik kelahiranmu. Memahami posisi planet adalah awal untuk memahami ritme bawaan alam bawah sadarmu.</p>
          </header>

          {loading ? <p className="text-center text-[#7B8776]">Membaca rasi bintang...</p> : blueprint ? (
            <div className="space-y-10">
              <NatalWheelLite astrology={nc} />
              
              {groups.map((group, gIdx) => (
                <div key={gIdx}>
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">{group.title}</h2>
                  <div className="grid gap-4">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                            <item.icon size={20} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-[#9AA394]">{item.label}</span>
                            <span className="block text-lg font-serif font-bold text-[#4F5E52]">{item.sign ? `${item.sign}` : "Belum tersedia"}</span>
                          </div>
                        </div>
                        {item.sign && (
                          <div className="border-t border-[#F5F1E8] pt-3">
                            <p className="text-sm leading-relaxed text-[#7B8776]">{composePlanetMeaning(item.label, item.sign)}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Element Composition */}
              {lilith && lilithMeaning && (
                <div>
                  <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">🌑 Black Moon Lilith</h2>
                  <div className="rounded-2xl border border-[#D8D0E3] bg-[#F8F5FB] p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#8C7C99]">Mean Black Moon Lilith</p>
                        <p className="mt-1 text-sm font-semibold text-[#6F6577]">Degree {Number(lilith.degree).toFixed(2)}{"\u00b0"}</p>
                        <p className="mt-1 text-xl font-serif font-bold text-[#4F4359]">{lilith.sign} · House {lilith.house}</p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#4F4359] text-xl text-white">🌑</div>
                    </div>
                    <div className="space-y-3 border-t border-[#E7E0EC] pt-4 text-sm leading-relaxed text-[#6F6577]">
                      <p><span className="font-bold text-[#4F4359]">Meaning:</span> {lilithMeaning.meaning}</p>
                      <p><span className="font-bold text-[#4F4359]">Shadow Theme:</span> {lilithMeaning.shadowTheme}</p>
                      <p><span className="font-bold text-[#4F4359]">Growth Invitation:</span> {lilithMeaning.growthInvitation}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Element Composition */}
              <div>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">6. Element Composition</h2>
                <div className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2"><Flame size={16} className="text-red-500" /><span className="text-sm font-bold text-[#4F5E52]">Fire {getElementPct("Fire")}%</span></div>
                    <div className="flex items-center gap-2"><Mountain size={16} className="text-green-600" /><span className="text-sm font-bold text-[#4F5E52]">Earth {getElementPct("Earth")}%</span></div>
                    <div className="flex items-center gap-2"><Wind size={16} className="text-sky-500" /><span className="text-sm font-bold text-[#4F5E52]">Air {getElementPct("Air")}%</span></div>
                    <div className="flex items-center gap-2"><Droplet size={16} className="text-blue-500" /><span className="text-sm font-bold text-[#4F5E52]">Water {getElementPct("Water")}%</span></div>
                  </div>
                  <div className="border-t border-[#F5F1E8] pt-3">
                    <p className="text-sm text-[#7B8776]"><span className="font-bold text-[#4F5E52]">Elemen Dominan: {dominantElement}</span>. Keseimbangan elemen adalah peta dasar caramu merespons kehidupan.</p>
                  </div>
                </div>
              </div>

              {/* Life Areas */}
              <div>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">7. Life Areas</h2>
                <p className="mb-4 text-sm text-[#7B8776]">Top 3 area kehidupan dengan konsentrasi energi terbesar:</p>
                <div className="grid gap-3">
                  {topHouses.map((h, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-2xl border border-[#E8E1D3] bg-white p-4 shadow-sm">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500"><Home size={18} /></div>
                      <div>
                        <p className="font-serif font-bold text-[#4F5E52]">{h.title} (House {h.house})</p>
                        <p className="text-xs text-[#9AA394]">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                  {topHouses.length === 0 && <p className="text-sm text-[#7B8776]">Data belum tersedia.</p>}
                </div>
              </div>

              {/* Major Aspects */}
              <div>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-[#7B8776]">8. Major Aspects</h2>
                <div className="grid gap-3">
                  {topAspects.map((a, i) => (
                    <div key={i} className="rounded-2xl border border-[#E8E1D3] bg-white p-4 shadow-sm">
                      <p className="font-serif font-bold text-[#4F5E52]">{a.title}</p>
                      <p className="mt-1 text-sm text-[#7B8776]">{a.meaning}</p>
                    </div>
                  ))}
                  {topAspects.length === 0 && <p className="text-sm text-[#7B8776]">Data belum tersedia.</p>}
                </div>
              </div>

              {/* Natal Chart Summary */}
              <div className="mt-10 rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#D4AF37]" />
                  <h3 className="font-serif text-xl">9. Sintesis Peta Langit</h3>
                </div>
                {synthesis ? (
                  <div className="prose prose-sm prose-invert max-w-none text-[#D2D8D0] leading-relaxed">
                    {synthesis.split('\n').filter(p => p.trim()).map((p, i) => (
                      <p key={i} className="mb-4">
                        {p.replace(/<br\s*\/?>/g, "").replace(/\*+/g, "")}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#D2D8D0]">Sintesis belum dapat dimuat.</p>
                )}
              </div>

            </div>
          ) : <p className="text-center text-[#7B8776]">Data belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}
