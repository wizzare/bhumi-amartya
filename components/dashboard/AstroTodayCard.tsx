"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp, Compass, Moon, Orbit, ShieldAlert } from "lucide-react";
import { calculateCurrentSky, CurrentSky, SkyBody } from "@/lib/astrology/calculateCurrentSky";
import { buildAstroHouseActivations, AstroHouseActivation } from "@/lib/astrology/astroHouseActivations";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { buildTransitNarrative } from "@/lib/astrology/personalizedTransitNarrative";

type BlueprintAstroContext = {
  profile?: Record<string, unknown> | null;
  blueprint?: Record<string, unknown> | null;
  [key: string]: unknown;
};

type AstroTodayCardProps = { context: BlueprintAstroContext };
type AstroBlueprintRecord = Record<string, unknown> & {
  astrology?: Record<string, unknown> & { houses?: Array<Record<string, unknown>> | Record<string, unknown> | null };
  natalChart?: Record<string, unknown>;
};

const DISPLAY_BODIES: SkyBody[] = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron",
];

const BODY_LABELS: Record<string, string> = {
  Sun: "Matahari", Moon: "Bulan", Mercury: "Merkurius", Venus: "Venus", Mars: "Mars",
  Jupiter: "Jupiter", Saturn: "Saturnus", Uranus: "Uranus", Neptune: "Neptunus", Pluto: "Pluto",
  Chiron: "Chiron",
};

function formatPeriod(periodStart: string | undefined, periodEnd: string | undefined, fallbackDate: string): string {
  if (periodStart && periodEnd) return `${periodStart} - ${periodEnd}`;
  if (periodStart) return `Sejak ${periodStart}`;
  if (periodEnd) return `Hingga ${periodEnd}`;
  return `Aktif pada ${fallbackDate}`;
}

export function AstroTodayCard({ context }: AstroTodayCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timezone = context.profile && typeof context.profile.timezone === "string" ? context.profile.timezone : undefined;
  const [localDateKey] = useState(() => getLocalDateKey(new Date(), timezone));

  const astroData = useMemo(() => {
    try {
      const currentSky = calculateCurrentSky(new Date(`${localDateKey}T12:00:00`));
      const blueprint = (context.blueprint || {}) as AstroBlueprintRecord;
      const result = buildAstroHouseActivations({
        currentSky,
        natalChart: blueprint.astrology || blueprint.natalChart || null,
        natalHouses: blueprint.astrology?.houses || null,
      });
      return { sky: currentSky, activations: result.activations, error: false };
    } catch (error) {
      console.error("Astro Card Error:", error);
      return { sky: null, activations: [] as AstroHouseActivation[], error: true };
    }
  }, [context.blueprint, localDateKey]);
  const sky: CurrentSky | null = astroData.sky;
  const activations = astroData.activations;

  const planets = useMemo(() => sky?.bodies.filter((body) => DISPLAY_BODIES.includes(body.body) && body.sign !== "Unknown") ?? [], [sky]);
  const retrogrades = planets.filter((body) => body.isRetrograde);
  const moonBody = planets.find((body) => body.body === "Moon");
  const currentMoonSign = moonBody?.sign || "zodiak hari ini";
  const moonActivation = activations.find((item) => item.planet === "Moon");
  const importantTransits = planets.filter((body) => ["Saturn", "Uranus", "Neptune", "Pluto", "Chiron"].includes(body.body));
  const moonNarrative = moonBody ? buildTransitNarrative(moonBody, moonActivation, context as Record<string, unknown>) : null;

  if (astroData.error || !sky) {
    return <div className="mt-8 bhumi-card p-8 text-center text-sm italic text-[#7B8776]">Membaca data langit...</div>;
  }

  return (
    <section className="mt-10 space-y-4">
      <header className="px-1">
        <h3 className="text-2xl font-serif font-bold text-[#4F6658]">Astro Hari Ini</h3>
        <p className="mt-1 text-[13px] font-medium text-[#3C3C3C]/70">Catatan langit yang ringkas dan membumi.</p>
      </header>

      <div className="bhumi-card overflow-hidden border-none bg-white shadow-sm">
        <div className="p-7">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500"><Moon size={22} /></div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">Fase Bulan</p>
              <h4 className="mt-1 text-lg font-bold text-[#4F6658]">Bulan: {sky.moonInfo.label} di {currentMoonSign}</h4>
              <p className="mt-1 text-xs font-semibold text-[#7B8776]">
                Menuju {sky.moonInfo.nextPhaseLabel} di {sky.moonInfo.nextPhaseSign} · {sky.moonInfo.endDate} (±{sky.moonInfo.daysRemaining} hari)
              </p>
            </div>
          </div>
          <p className="mt-5 text-[14px] leading-relaxed text-[#3C3C3C]">{moonNarrative?.personalImpact || sky.moonInfo.theme}</p>
        </div>

        <button type="button" onClick={() => setIsExpanded((value) => !value)} className="flex w-full items-center justify-center gap-2 border-t border-[#F1EEE7] bg-[#FCFAF5] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4F6658]">
          {isExpanded ? <>Tutup Detail <ChevronUp size={16} /></> : <>Lihat Pengaruh ke Dirimu <ChevronDown size={16} /></>}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <DetailSection icon={<Moon size={18} />} title="Fase Bulan">
            <p><strong>{sky.moonInfo.label} di {currentMoonSign}</strong> membawa tema {sky.moonInfo.theme.toLowerCase()}</p>
            <p className="mt-2 text-xs text-[#9AA394]">Periode fase: {sky.moonInfo.startDate} - {sky.moonInfo.endDate}</p>
            <p className="mt-2">Fase berikutnya adalah <strong>{sky.moonInfo.nextPhaseLabel} di {sky.moonInfo.nextPhaseSign}</strong>, sekitar {sky.moonInfo.endDate}.</p>
            {moonNarrative && <TransitNarrativeView narrative={moonNarrative} />}
          </DetailSection>

          <DetailSection icon={<Compass size={18} />} title="Planet Aktif">
            <div className="space-y-4">
              {planets.map((planet) => {
                const activation = activations.find((item) => item.planet === planet.body);
                const narrative = buildTransitNarrative(planet, activation, context as Record<string, unknown>);
                return <div key={planet.body} className="border-b border-[#F1EEE7] pb-4 last:border-0 last:pb-0">
                  <p className="font-bold text-[#4F6658]">{BODY_LABELS[planet.body]} di {planet.sign}{planet.isRetrograde ? " · Retrograde" : ""}</p>
                  <p className="mt-1 text-xs font-medium text-[#9AA394]">Periode: {planet.body === "Moon" ? `${sky.moonInfo.startDate} - ${sky.moonInfo.endDate}` : formatPeriod(planet.periodStart, planet.periodEnd, localDateKey)}</p>
                  <TransitNarrativeView narrative={narrative} />
                </div>;
              })}
            </div>
          </DetailSection>

          <DetailSection icon={<Orbit size={18} />} title="Transit Penting">
            <div className="space-y-4">
              <div>
                <p className="font-bold text-[#4F6658]">{sky.moonInfo.nextPhaseLabel} di {sky.moonInfo.nextPhaseSign}</p>
                <p className="mt-1 text-sm text-[#7B8776]">{sky.moonInfo.endDate}. Menandai pergantian ritme emosional dan ruang untuk menata fokus berikutnya.</p>
              </div>
              {importantTransits.map((planet) => {
                const activation = activations.find((item) => item.planet === planet.body);
                const narrative = buildTransitNarrative(planet, activation, context as Record<string, unknown>);
                return <div key={planet.body}>
                  <p className="font-bold text-[#4F6658]">{BODY_LABELS[planet.body]} di {planet.sign}</p>
                  <p className="mt-1 text-xs text-[#9AA394]">Periode: {formatPeriod(planet.periodStart, planet.periodEnd, localDateKey)}</p>
                  <TransitNarrativeView narrative={narrative} />
                </div>;
              })}
            </div>
          </DetailSection>

          {retrogrades.length > 0 && <DetailSection icon={<ShieldAlert size={18} />} title="Retrograde & Masa Evaluasi">
            <div className="space-y-3">{retrogrades.map((planet) => <div key={planet.body}>
              <p className="font-bold text-[#4F6658]">{BODY_LABELS[planet.body]} Retrograde di {planet.sign}</p>
              <p className="mt-1 text-xs text-[#9AA394]">Periode retrograde: {formatPeriod(planet.periodStart, planet.periodEnd, localDateKey)}</p>
              <TransitNarrativeView narrative={buildTransitNarrative(planet, activations.find((item) => item.planet === planet.body), context as Record<string, unknown>)} />
            </div>)}</div>
          </DetailSection>}

          <p className="flex items-center justify-center gap-2 pt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[#9AA394]"><Calendar size={11} /> Dihitung untuk {localDateKey} · Astronomy Engine</p>
        </div>
      )}
    </section>
  );
}

function TransitNarrativeView({ narrative }: { narrative: ReturnType<typeof buildTransitNarrative> }) {
  return <div className="mt-3 space-y-3">
    <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Tema Kolektif</p><p className="mt-1">{narrative.collectiveTheme}</p></div>
    <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Menyentuh Dirimu</p><p className="mt-1">{narrative.personalImpact}</p></div>
    <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">Yang Bisa Dilakukan</p><p className="mt-1 text-[#4F6658]">{narrative.action}</p></div>
  </div>;
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="bhumi-card border-none bg-white p-7 shadow-sm">
    <div className="mb-5 flex items-center gap-3 text-[#4F6658]">{icon}<h4 className="font-bold">{title}</h4></div>
    <div className="text-sm leading-relaxed text-[#3C3C3C]">{children}</div>
  </div>;
}
