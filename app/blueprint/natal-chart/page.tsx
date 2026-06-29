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
import { calculateNatalBasics } from "@/lib/astrology/calculateNatalBasics";

import { generateDeterministicSynthesis } from "@/lib/engines/NatalSummaryEngine";
import { LILITH_SIGN_MEANINGS } from "@/lib/data/astrologyDictionaries";
import { NatalWheelLite } from "@/components/blueprint/NatalWheelLite";

const ZODIAC_ELEMENT_MAP: Record<string, string> = {
  Aries: "Fire", Taurus: "Earth", Gemini: "Air", Cancer: "Water",
  Leo: "Fire", Virgo: "Earth", Libra: "Air", Scorpio: "Water",
  Sagittarius: "Fire", Capricorn: "Earth", Aquarius: "Air", Pisces: "Water"
};

export default function NatalChartPage() {
  const auth = useAuth();
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [synthesis, setSynthesis] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [bp, profile] = await Promise.all([
          storageProvider.getUserBlueprint(),
          storageProvider.getUserProfile(),
        ]);
        
        let activeBlueprint = bp as any;
        let astrology = activeBlueprint?.astrology || activeBlueprint?.natalChart || {};

        // Hydrate or recalculate missing planetary data if birth input is available
        const input = activeBlueprint?.input || {};
        const birthDate = input.birthDate || profile?.birthDate;
        const birthTime = input.birthTime || profile?.birthTime;
        const birthCity = input.birthCity || profile?.birthCity;
        const timezone = input.timezone || profile?.timezone;
        const latitude = input.latitude || profile?.latitude;
        const longitude = input.longitude || profile?.longitude;

        const hasPlanets = astrology.planets && Object.keys(astrology.planets).length > 0;
        if (!hasPlanets && birthDate) {
          try {
            const recalculated = calculateNatalBasics({
              birthDate,
              birthTime: birthTime || "12:00",
              birthCity,
              timezone,
              latitude,
              longitude,
            });
            if (recalculated && recalculated.status !== "pending") {
              astrology = {
                ...astrology,
                ...recalculated,
                planets: recalculated.planets || astrology.planets,
              };
              if (activeBlueprint) {
                activeBlueprint = {
                  ...activeBlueprint,
                  astrology,
                  natalChart: astrology,
                };
              }
            }
          } catch (err) {
            console.error("Failed to hydrate natal chart on client:", err);
          }
        }

        if (activeBlueprint) {
          setBlueprint(activeBlueprint);
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

  const getPlanetSign = (name: string): string | undefined => {
    if (!nc) return undefined;
    
    // Check nc.planets object (Capitalized or lowercase)
    if (nc.planets && typeof nc.planets === "object" && !Array.isArray(nc.planets)) {
      const cap = name.charAt(0).toUpperCase() + name.slice(1);
      const low = name.toLowerCase();
      const p = nc.planets[name] || nc.planets[cap] || nc.planets[low];
      if (p?.sign) return p.sign;
    }
    
    // Check nc.planets if array
    if (Array.isArray(nc.planets)) {
      const p = nc.planets.find((item: any) => typeof item === "object" && item && String(item.name || item.planet).toLowerCase() === name.toLowerCase());
      if (p?.sign) return p.sign;
    }
    
    // Check top-level properties
    const lowName = name.toLowerCase();
    const signProp = `${lowName}Sign`;
    if (nc[signProp]) return String(nc[signProp]);
    if (nc[lowName]?.sign) return String(nc[lowName].sign);
    if (nc[name]?.sign) return String(nc[name].sign);
    if (typeof nc[lowName] === "string") return nc[lowName];
    if (typeof nc[name] === "string") return nc[name];

    return undefined;
  };

  const sunSign = nc.sunSign || getPlanetSign("Sun");
  const moonSign = nc.moonSign || getPlanetSign("Moon");
  const ascendantSign = nc.risingSign || nc.ascendant || getPlanetSign("Ascendant") || getPlanetSign("ASC");
  const mcSign = nc.mc || nc.midheaven || getPlanetSign("MC") || getPlanetSign("Midheaven");
  const northNodeSign = nc.northNode || getPlanetSign("NorthNode");
  const southNodeSign = nc.southNode || getPlanetSign("SouthNode");
  const chironSign = nc.chiron || getPlanetSign("Chiron");

  const rawElements = nc.elements || {};
  let totalElements = Object.values(rawElements).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0) as number;
  
  let elementCounts: Record<string, number> = {
    Fire: Number(rawElements.Fire) || 0,
    Earth: Number(rawElements.Earth) || 0,
    Air: Number(rawElements.Air) || 0,
    Water: Number(rawElements.Water) || 0,
  };

  if (totalElements === 0) {
    const allPlanetSigns = [
      sunSign, moonSign, ascendantSign, mcSign,
      getPlanetSign("Mercury"), getPlanetSign("Venus"), getPlanetSign("Mars"),
      getPlanetSign("Jupiter"), getPlanetSign("Saturn"), getPlanetSign("Uranus"),
      getPlanetSign("Neptune"), getPlanetSign("Pluto"), northNodeSign, southNodeSign, chironSign
    ].filter(Boolean);

    allPlanetSigns.forEach((sign) => {
      const elem = ZODIAC_ELEMENT_MAP[sign as string];
      if (elem) elementCounts[elem] = (elementCounts[elem] || 0) + 1;
    });
    totalElements = Object.values(elementCounts).reduce((a, b) => a + b, 0);
  }

  const getElementPct = (name: string) => {
    if (totalElements === 0) return 0;
    return Math.round(((elementCounts[name] || 0) / totalElements) * 100);
  };

  const dominantElementEntry = Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0];
  const dominantElement = (dominantElementEntry && totalElements > 0) ? dominantElementEntry[0] : "Belum tersedia";

  const topHouses = getTopHouses(nc.planets);
  const topAspects = getTopAspects(nc.aspects);
  const lilith = nc.lilith;
  const lilithMeaning = lilith?.sign ? LILITH_SIGN_MEANINGS[lilith.sign] : undefined;

  const groups = [
    {
      title: "1. Identity Layer",
      items: [
        { label: "Sun", sign: sunSign, icon: Sun, bg: "bg-amber-50", color: "text-amber-500" },
        { label: "Moon", sign: moonSign, icon: Moon, bg: "bg-slate-100", color: "text-slate-500" },
        { label: "Ascendant", sign: ascendantSign, icon: ArrowUpCircle, bg: "bg-rose-50", color: "text-rose-500" },
        { label: "MC", sign: mcSign, icon: Mountain, bg: "bg-stone-50", color: "text-stone-500" },
      ]
    },
    {
      title: "2. Personal Planets",
      items: [
        { label: "Mercury", sign: getPlanetSign("Mercury"), icon: MessageCircle, bg: "bg-blue-50", color: "text-blue-500" },
        { label: "Venus", sign: getPlanetSign("Venus"), icon: Heart, bg: "bg-pink-50", color: "text-pink-500" },
        { label: "Mars", sign: getPlanetSign("Mars"), icon: Zap, bg: "bg-red-50", color: "text-red-500" },
      ]
    },
    {
      title: "3. Social Planets",
      items: [
        { label: "Jupiter", sign: getPlanetSign("Jupiter"), icon: Sparkles, bg: "bg-yellow-50", color: "text-yellow-600" },
        { label: "Saturn", sign: getPlanetSign("Saturn"), icon: Shield, bg: "bg-zinc-100", color: "text-zinc-600" },
      ]
    },
    {
      title: "4. Generational Planets",
      items: [
        { label: "Uranus", sign: getPlanetSign("Uranus"), icon: Radio, bg: "bg-cyan-50", color: "text-cyan-500" },
        { label: "Neptune", sign: getPlanetSign("Neptune"), icon: Droplet, bg: "bg-indigo-50", color: "text-indigo-400" },
        { label: "Pluto", sign: getPlanetSign("Pluto"), icon: Flame, bg: "bg-purple-50", color: "text-purple-600" },
      ]
    },
    {
      title: "5. Soul Evolution",
      items: [
        { label: "NorthNode", sign: northNodeSign, icon: InfinityIcon, bg: "bg-emerald-50", color: "text-emerald-500" },
        { label: "SouthNode", sign: southNodeSign, icon: InfinityIcon, bg: "bg-stone-50", color: "text-stone-400" },
        { label: "Chiron", sign: chironSign, icon: Heart, bg: "bg-teal-50", color: "text-teal-500" },
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
