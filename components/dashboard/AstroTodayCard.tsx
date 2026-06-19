"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Compass, Moon, Orbit, Globe, Zap, Sun } from "lucide-react";
import { calculateCurrentSky } from "@/lib/astrology/calculateCurrentSky";
import { buildAstroHouseActivations } from "@/lib/astrology/astroHouseActivations";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { buildTransitNarrative } from "@/lib/astrology/personalizedTransitNarrative";

type AstroTodayCardProps = {
  context: {
    profile?: Record<string, unknown> & {
      uid?: string;
      timezone?: string;
      birthDate?: string;
      birthTime?: string;
      birthCity?: string;
    };
    blueprint?: Record<string, unknown> & {
      astrology?: Record<string, unknown> & { houses?: Record<string, unknown> };
      natalChart?: Record<string, unknown>;
    };
    [key: string]: unknown;
  };
};

const LABELS: Record<string, string> = {
  Sun: "Matahari",
  Moon: "Bulan",
  Mercury: "Merkurius",
  Venus: "Venus",
  Mars: "Mars",
  Jupiter: "Jupiter",
  Saturn: "Saturnus",
  Uranus: "Uranus",
  Neptune: "Neptunus",
  Pluto: "Pluto",
  Chiron: "Chiron",
};

export function AstroTodayCard({ context }: AstroTodayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timezone = context.profile?.timezone || "UTC";
  const today = getLocalDateKey(new Date(), timezone);

  const sky = useMemo(() => calculateCurrentSky(new Date()), []);

  const astroActivations = useMemo(() => buildAstroHouseActivations({
    uid: context.profile?.uid,
    currentSky: sky,
    natalChart: context.blueprint?.astrology || context.blueprint?.natalChart || null,
    natalHouses: context.blueprint?.astrology?.houses || null,
  }).activations, [sky, context.profile?.uid, context.blueprint]);

  const vedic = useMemo(() => {
    try {
      return calculateVedic({
        birthDate: context.profile?.birthDate || "1990-01-01",
        birthTime: context.profile?.birthTime || "12:00",
        birthCity: context.profile?.birthCity || "Jakarta",
        timezone,
        asOf: new Date()
      });
    } catch { return null; }
  }, [context.profile, timezone]);

  const bazi = useMemo(() => {
    try {
      return calculateBazi({
        birthDate: context.profile?.birthDate || "1990-01-01",
        birthTime: context.profile?.birthTime || "12:00",
        timezone,
        referenceDate: new Date()
      });
    } catch { return null; }
  }, [context.profile, timezone]);

  const tzolkin = useMemo(() => calculateTzolkin({ birthDate: today }), [today]);
  const weton = useMemo(() => calculateWeton({ birthDate: today }), [today]);

  const moonStatus = sky.bodies.find(b => b.body === "Moon");
  const moonActivation = astroActivations.find(a => a.planet === "Moon");
  const moonNarrative = moonStatus ? buildTransitNarrative(moonStatus, moonActivation, context) : null;

  return (
    <section className="mt-10 space-y-4">
      <header className="px-1">
        <h3 className="text-2xl font-serif font-bold text-[#4F6658]">Astro Hari Ini</h3>
        <p className="mt-1 text-[13px] font-medium text-[#3C3C3C]/70">Membangun kesadaran terhadap ritme semesta.</p>
      </header>

      <div className="bhumi-card overflow-hidden border-none bg-white shadow-sm">
        <div className="p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500">
               <Moon size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">Fase Bulan</p>
              <h4 className="mt-1 text-lg font-bold text-[#4F6658]">Bulan: {sky.moonInfo.label} di {moonStatus?.sign || "zodiak hari ini"}</h4>
              <p className="mt-1 text-xs font-semibold text-[#7B8776]">Periode: {sky.moonInfo.startDate} - {sky.moonInfo.endDate}</p>
              <p className="mt-1 text-xs font-bold text-[#4F6658]">
                Berikutnya: {sky.moonInfo.nextPhaseLabel} di {sky.moonInfo.nextPhaseSign} · {sky.moonInfo.endDate}
              </p>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <button type="button" onClick={() => setIsExpanded(true)} className="flex w-full items-center justify-center gap-2 border-t border-[#F1EEE7] bg-[#FCFAF5] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4F6658]">
            Lihat Detail Langit Hari Ini <ChevronDown size={16} />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <AstroSection icon={<Moon size={18} />} title="Fase Bulan">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-[#4F6658]">{sky.moonInfo.label} di {moonStatus?.sign || "zodiak hari ini"}</p>
                <p className="mt-1 text-xs font-medium text-[#9AA394]">Periode: {sky.moonInfo.startDate} - {sky.moonInfo.endDate}</p>
              </div>
              <NarrativeBlocks
                collective={sky.moonInfo.theme}
                personal={moonNarrative?.personalImpact || sky.moonInfo.theme}
                action={moonNarrative?.action || "Amati perubahan ritmemu dan pilih respons yang paling membumi."}
              />
            </div>
          </AstroSection>

          {/* SECTION 1: LANGIT BARAT */}
          <AstroSection icon={<Sun size={18} />} title="Langit Barat">
             <div className="space-y-6">
                {sky.bodies.filter(b => b.body !== "Moon" && b.body !== "Lilith" && b.body !== "North Node").slice(0, 8).map(b => {
                   const activation = astroActivations.find(a => a.planet === b.body);
                   const narrative = buildTransitNarrative(b, activation, context);
                   return (
                      <div key={b.body} className="space-y-3">
                         <div className="flex justify-between items-end border-b border-[#F1EEE7] pb-1">
                            <h5 className="font-bold text-[#4F6658] text-sm">{LABELS[b.body] || b.body} di {b.sign} {b.isRetrograde ? "(Rx)" : ""}</h5>
                            <span className="text-[9px] font-bold text-[#9AA394] uppercase tracking-tighter">
                               {b.periodStart} - {b.periodEnd}
                            </span>
                         </div>
                         <div className="grid gap-2">
                            <div className="p-3 bg-[#FCFAF5] rounded-xl">
                               <p className="text-[9px] font-bold text-[#9AA394] uppercase mb-1">Tema Kolektif</p>
                               <p className="text-[11px] text-[#526053]">{narrative.collectiveTheme}</p>
                            </div>
                            <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-50">
                               <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                               <p className="text-[11px] text-indigo-900/60">{narrative.personalImpact}</p>
                            </div>
                            <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                               <p className="text-[9px] font-bold text-emerald-300 uppercase mb-1">Yang Bisa Dilakukan</p>
                               <p className="text-[11px] text-emerald-900/60">{narrative.action}</p>
                            </div>
                         </div>
                      </div>
                   );
                })}
             </div>
          </AstroSection>

          {/* SECTION 2: VEDIC */}
          <AstroSection icon={<Zap size={18} />} title="Vedic (Mahadasha)">
             {vedic ? (
                <div className="space-y-4">
                   <div className="pb-2 border-b border-[#F1EEE7]">
                      <p className="text-sm font-bold text-[#4F6658]">Siklus: {vedic.currentMahadasha.planet} - {vedic.currentAntardasha.planet}</p>
                      <p className="text-[10px] font-bold text-[#9AA394]">
                         {new Date(vedic.currentAntardasha.startDate).toLocaleDateString("id-ID")} - {new Date(vedic.currentAntardasha.endDate).toLocaleDateString("id-ID")}
                      </p>
                   </div>
                   <div className="space-y-2">
                      <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-50">
                         <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                         <p className="text-[11px] text-indigo-900/60">{vedic.summary[2]}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                         <p className="text-[9px] font-bold text-emerald-300 uppercase mb-1">Yang Bisa Dilakukan</p>
                         <p className="text-[11px] text-emerald-900/60">Gunakan periode {vedic.currentAntardasha.planet} ini untuk mengamati tema {vedic.currentAntardasha.planet === "Venus" ? "relasi dan kenyamanan" : vedic.currentAntardasha.planet === "Mars" ? "aksi dan keberanian" : "pertumbuhan batin"}.</p>
                      </div>
                   </div>
                </div>
             ) : <p className="text-xs italic text-gray-400">Menghitung siklus...</p>}
          </AstroSection>

          {/* SECTION 3: BAZI */}
          <AstroSection icon={<Compass size={18} />} title="BaZi (Energi Elemen)">
             {bazi ? (
                <div className="space-y-4">
                   <div className="pb-2 border-b border-[#F1EEE7]">
                      <p className="text-sm font-bold text-[#4F6658]">Pilar Hari: {bazi.dayPillar.display}</p>
                      <p className="text-[10px] font-bold text-[#9AA394]">Periode Hari Ini</p>
                   </div>
                   <div className="space-y-2">
                      <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-50">
                         <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                         <p className="text-[11px] text-indigo-900/60">Elemen dominan hari ini mengajak pada tema {bazi.dayMaster.element.toLowerCase()}. Perhatikan bagaimana elemen ini beresonansi dengan kapasitas kerjamu.</p>
                      </div>
                      <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                         <p className="text-[9px] font-bold text-emerald-300 uppercase mb-1">Yang Bisa Dilakukan</p>
                         <p className="text-[11px] text-emerald-900/60">Lakukan tindakan yang selaras dengan energi {bazi.dayMaster.element.toLowerCase()} untuk menjaga keseimbangan batin.</p>
                      </div>
                   </div>
                </div>
             ) : <p className="text-xs italic text-gray-400">Menghitung elemen...</p>}
          </AstroSection>

          {/* SECTION 4: TZOLKIN MAYA */}
          <AstroSection icon={<Globe size={18} />} title="Tzolkin Maya">
             <div className="space-y-4">
                <div className="pb-2 border-b border-[#F1EEE7]">
                   <p className="text-sm font-bold text-[#4F6658]">Kin Hari Ini: {tzolkin.kinName} {tzolkin.gap ? "(GAP)" : ""}</p>
                   <p className="text-[10px] font-bold text-[#9AA394]">Periode Hari Ini</p>
                </div>
                <div className="space-y-2">
                   <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-50">
                      <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                      <p className="text-[11px] text-indigo-900/60">{tzolkin.wavespell.meaning}</p>
                   </div>
                   <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                      <p className="text-[9px] font-bold text-emerald-300 uppercase mb-1">Yang Bisa Dilakukan</p>
                      <p className="text-[11px] text-emerald-900/60">Arahkan fokus pada {tzolkin.wavespell.growthDirection.toLowerCase()}.</p>
                   </div>
                </div>
             </div>
          </AstroSection>

          {/* SECTION 5: KALENDER JAWA */}
          <AstroSection icon={<Calendar size={18} />} title="Kalender Jawa">
             <div className="space-y-4">
                <div className="pb-2 border-b border-[#F1EEE7]">
                   <p className="text-sm font-bold text-[#4F6658]">{weton.weton} (Wuku {weton.wuku.name})</p>
                   <p className="text-[10px] font-bold text-[#9AA394]">Periode Hari Ini</p>
                </div>
                <div className="space-y-2">
                   <div className="p-3 bg-indigo-50/20 rounded-xl border border-indigo-50">
                      <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                      <p className="text-[11px] text-indigo-900/60">{weton.wuku.description}. Ini memberikan corak batin yang {weton.watak.split(". ")[1]}.</p>
                   </div>
                   <div className="p-3 bg-emerald-50/20 rounded-xl border border-emerald-50">
                      <p className="text-[9px] font-bold text-emerald-300 uppercase mb-1">Yang Bisa Dilakukan</p>
                      <p className="text-[11px] text-emerald-900/60">{weton.workStyle}.</p>
                   </div>
                </div>
             </div>
          </AstroSection>

          {/* SECTION 6: GERHANA */}
          <AstroSection icon={<Orbit size={18} />} title="Gerhana & Siklus Besar">
             <div className="space-y-4">
                <div className="p-4 bg-red-50/30 rounded-2xl border border-red-100/50">
                   <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1">Gerhana Matahari Berikutnya</p>
                   <p className="text-sm font-bold text-[#4F6658]">Total Solar Eclipse</p>
                   <p className="text-xs text-[#7B8776] mb-3">12 Agustus 2026 (±54 Hari Lagi)</p>
                   <div className="p-3 bg-white/50 rounded-xl border border-red-50">
                      <p className="text-[9px] font-bold text-red-300 uppercase mb-1">Menyentuh Dirimu</p>
                      <p className="text-[11px] text-red-900/60">Periode ini mengajakmu untuk mengamati pola penutupan intens dan awal baru yang mendalam.</p>
                   </div>
                </div>
                <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                   <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1">Gerhana Bulan Berikutnya</p>
                   <p className="text-sm font-bold text-[#4F6658]">Partial Lunar Eclipse</p>
                   <p className="text-xs text-[#7B8776] mb-3">28 Agustus 2026 (±70 Hari Lagi)</p>
                   <div className="p-3 bg-white/50 rounded-xl border border-indigo-50">
                      <p className="text-[9px] font-bold text-indigo-300 uppercase mb-1">Menyentuh Dirimu</p>
                      <p className="text-[11px] text-indigo-900/60">Pembersihan emosional dan evaluasi batin sedang meminta perhatian dalam ritme hidupmu.</p>
                   </div>
                </div>
             </div>
          </AstroSection>

          <button type="button" onClick={() => setIsExpanded(false)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4F6658]">
            Tutup Detail <ChevronUp size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

function NarrativeBlocks({ collective, personal, action }: { collective: string; personal: string; action: string }) {
  return (
    <div className="grid gap-2">
      <div className="rounded-xl bg-[#FCFAF5] p-3">
        <p className="mb-1 text-[9px] font-bold uppercase text-[#9AA394]">Tema Kolektif</p>
        <p className="text-[11px] text-[#526053]">{collective}</p>
      </div>
      <div className="rounded-xl border border-indigo-50 bg-indigo-50/20 p-3">
        <p className="mb-1 text-[9px] font-bold uppercase text-indigo-300">Menyentuh Dirimu</p>
        <p className="text-[11px] text-indigo-900/60">{personal}</p>
      </div>
      <div className="rounded-xl border border-emerald-50 bg-emerald-50/20 p-3">
        <p className="mb-1 text-[9px] font-bold uppercase text-emerald-300">Yang Bisa Dilakukan</p>
        <p className="text-[11px] text-emerald-900/60">{action}</p>
      </div>
    </div>
  );
}

function AstroSection({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <div className="bhumi-card border-none bg-white p-7 shadow-sm">
      <div className="mb-5 flex items-center gap-3 text-[#4F6658]">
        {icon}
        <h4 className="font-bold text-sm uppercase tracking-widest">{title}</h4>
      </div>
      {children}
    </div>
  );
}
