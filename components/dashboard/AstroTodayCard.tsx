"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Compass, Moon as MoonIcon, Sparkles, X, Orbit, ExternalLink } from "lucide-react";
import { CelestialMoon, getMoonIllumination } from "@/components/celestial/CelestialMoon";
import { RelevantPlanetBadge } from "@/components/celestial/RelevantPlanetBadge";
import { buildDailyAstroSynthesis } from "@/lib/astrology/dailyAstroSynthesis";
import { buildAstroHouseActivations } from "@/lib/astrology/astroHouseActivations";
import { buildTransitNarrative } from "@/lib/astrology/personalizedTransitNarrative";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { translations } from "@/lib/data/translations";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { GAP_KIN } from "@/lib/tzolkin/dictionaries";

type AstroTodayCardProps = {
  context: {
    profile?: Record<string, any>;
    blueprint?: Record<string, any>;
    [key: string]: unknown;
  };
};

const ASPECT_LABELS: Record<string, string> = {
  conjunction: "Konjungsi",
  sextile: "Sekstil",
  square: "Kuadrat",
  trine: "Trigon",
  opposition: "Oposisi",
};

export function AstroTodayCard({ context }: AstroTodayCardProps) {
  const t = translations["id"].astroToday;
  const profileTimezone = context.profile?.timezone ?? null;
  const uid = context.profile?.uid;

  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTitle = useId();
  const [detailOpen, setDetailOpen] = useState(false);
  useEffect(() => {
    if (!detailOpen) return;
    const opener = document.activeElement;
    const element = dialog.current;
    element?.showModal();
    return () => {
      element?.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [detailOpen]);
  const [selectedTransitId, setSelectedTransitId] = useState<string | null>(null);

  // Canonical Daily Astro Synthesis
  const synthesis = useMemo(() => buildDailyAstroSynthesis({ uid, profileTimezone }), [uid, profileTimezone]);
  const sky = synthesis.sky;
  const timezone = synthesis.timezone;
  const today = synthesis.dateKey;

  // Real Moon Phase & Illumination Fraction
  const moonInfo = synthesis.moonPhase;
  const moonPhaseAngle = sky.moonPhaseAngle;
  const moonIllum = useMemo(() => getMoonIllumination(moonPhaseAngle), [moonPhaseAngle]);

  // House Activations and Transit Narratives
  const activations = useMemo(
    () =>
      buildAstroHouseActivations({
        uid,
        currentSky: sky,
        natalChart: context.blueprint?.astrology || context.blueprint?.natalChart || null,
        natalHouses: context.blueprint?.astrology?.houses || null,
      }).activations,
    [sky, uid, context.blueprint]
  );

  const moonBody = sky.bodies.find((b) => b.body === "Moon");
  const moonActivation = activations.find((a) => a.planet === "Moon");
  const moonNarrative = moonBody ? buildTransitNarrative(moonBody, moonActivation, context) : null;

  // Primary Western Astronomical Event (Top 1 Relevancy)
  const primaryEvent = synthesis.westernEvents[0] || null;
  const primaryBody = primaryEvent ? sky.bodies.find((b) => b.body === primaryEvent.body) : null;
  const primaryActivation = primaryEvent ? activations.find((a) => a.planet === primaryEvent.body) : null;
  const primaryNarrative = primaryBody ? buildTransitNarrative(primaryBody, primaryActivation || undefined, context) : null;

  const vedic = useMemo(() => { try { if (!context.profile?.birthDate || !context.profile?.birthTime) return null; return calculateVedic({ birthDate: context.profile.birthDate, birthTime: context.profile.birthTime, birthCity: context.profile.birthCity, timezone, asOf: new Date() }); } catch { return null; } }, [context.profile, timezone]);
  const bazi = useMemo(() => { try { if (!context.profile?.birthDate || !context.profile?.birthTime) return null; return calculateBazi({ birthDate: context.profile.birthDate, birthTime: context.profile.birthTime, timezone, referenceDate: new Date() }); } catch { return null; } }, [context.profile, timezone]);
  const nextGap = useMemo(() => {
    for (let offset = 0; offset <= 260; offset++) {
      const date = new Date(`${today}T12:00:00Z`);
      date.setUTCDate(date.getUTCDate() + offset);
      const dateKey = date.toISOString().slice(0, 10);
      if (GAP_KIN.has(calculateTzolkin({ birthDate: dateKey }).kin)) return { date: dateKey, days: offset };
    }
    return null;
  }, [today]);
  const eastern = t.eastern;
  const tzolkin = synthesis.eastern.tzolkin;
  const weton = synthesis.eastern.weton;
  const easternCards = [
    { title: eastern.vedic.title, timing: eastern.vedic.timing, summary: vedic ? eastern.vedic.summary.replace("{maha}", String(vedic.currentMahadasha.planet)).replace("{anta}", String(vedic.currentAntardasha.planet)) : "Data kelahiran belum tersedia", collective: eastern.vedic.collective, personal: vedic ? String(vedic.summary?.[2] || eastern.vedic.personalFallback) : "Data kelahiran belum tersedia", action: eastern.vedic.action },
    { title: bazi ? eastern.bazi.titleTpl.replace("{pillar}", bazi.dayPillar.display) : "BaZi", timing: today, summary: bazi ? eastern.bazi.summaryTpl.replace("{element}", String(bazi.dayMaster.element).toLowerCase()) : "Data kelahiran belum tersedia", collective: eastern.bazi.collective, personal: bazi ? eastern.bazi.personalTpl.replace("{element}", String(bazi.dayMaster.element).toLowerCase()) : "Data kelahiran belum tersedia", action: eastern.bazi.action },
    ...(tzolkin ? [{ title: eastern.tzolkin.titleTpl.replace("{kin}", `Kin ${tzolkin.kin} · ${tzolkin.kinName}`), timing: today, summary: eastern.tzolkin.summaryTpl.replace("{wavespell}", tzolkin.wavespellName), collective: eastern.tzolkin.collective, personal: tzolkin.wavespellMeaning, action: eastern.tzolkin.action }] : []),
    ...(nextGap ? [{ title: eastern.gap.title, timing: nextGap.days === 0 ? eastern.gap.todayTimingTpl.replace("{date}", nextGap.date) : eastern.gap.aheadTimingTpl.replace("{date}", nextGap.date).replace("{n}", String(nextGap.days)), summary: nextGap.days === 0 ? eastern.gap.todaySummary : eastern.gap.aheadSummaryTpl.replace("{date}", nextGap.date), collective: eastern.gap.collective, personal: eastern.gap.personal, action: eastern.gap.action }] : []),
    ...(weton ? [{ title: eastern.wetonCard.titleTpl.replace("{weton}", weton.weton), timing: today, summary: eastern.wetonCard.summary, collective: eastern.wetonCard.collective, personal: eastern.wetonCard.personal, action: eastern.wetonCard.action }] : []),
  ];

  // Format date helper
  const formattedToday = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(new Date());

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DASHBOARD PREVIEW CARD: Lightweight, 2D/2.5D Focal Moon */}
      {/* ========================================================= */}
      <section
        className="rounded-[24px] p-5 sm:p-6 bg-white border border-[#E4DFD5] shadow-sm relative overflow-hidden transition-all"
        aria-labelledby="astro-preview-heading"
      >
        {/* Subtle Ambient Night Sky Header Gradient */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full pointer-events-none opacity-30 blur-2xl"
          style={{ background: "radial-gradient(circle, #D8D2E7 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        {/* Section Tag */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5F6B5E]">
              Langit Hari Ini
            </span>
          </div>
          <span className="text-xs text-[#5F6B5E] font-medium">{formattedToday}</span>
        </div>

        {/* Main Preview Row: Moon Visual + Phase Summary */}
        <div className="flex items-center gap-5 my-2">
          {/* Continuous Moon Anchor */}
          <div className="shrink-0">
            <CelestialMoon
              phaseAngle={moonPhaseAngle}
              illuminationFraction={moonIllum.fraction}
              isWaxing={moonIllum.isWaxing}
              size={76}
              showAmbientGlow={true}
            />
          </div>

          {/* Phase Information */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 id="astro-preview-heading" className="text-lg font-serif font-medium text-[#2D352E] truncate">
                {Number.isFinite(moonPhaseAngle) ? moonIllum.phaseLabel : "Fase bulan belum tersedia"}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E5EBE3] text-[#4A5849] font-medium shrink-0">
                {Number.isFinite(moonIllum.fraction) ? `≈${(moonIllum.fraction * 100).toFixed(0)}%` : "Belum tersedia"}
              </span>
            </div>

            <p className="text-xs text-[#5F6B5E] leading-relaxed line-clamp-2">
              {moonBody?.sign ? `Bulan melintasi zodiak ${moonBody.sign}. ` : ""}
              {moonInfo.theme || "Membawa ruang refleksi dan keheningan batin."}
            </p>
          </div>
        </div>

        {/* Primary Event/Transit Teaser (Astronomical Fact vs Bhumi Reflection) */}
        {primaryEvent && primaryNarrative && (
          <div className="mt-4 pt-3.5 border-t border-[#E4DFD5]/70 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#2D352E]">
                {primaryEvent.body} di {primaryEvent.sign}
              </span>
              <span className="text-[10px] text-[#5F6B5E]">
                {primaryEvent.isRetrograde ? "Retrograde" : "Transit"}
              </span>
            </div>
            <p className="text-xs text-[#5F6B5E] leading-relaxed line-clamp-2">
              <strong className="font-medium text-[#2D352E]">Arah Hari Ini:</strong> {primaryNarrative.collectiveTheme}
            </p>
          </div>
        )}

        {/* Action Button: Opens Full Celestial Experience */}
        <button
          type="button"
          onClick={() => setDetailOpen(true)}
          className="mt-4 w-full py-2.5 px-4 rounded-[14px] bg-[#F7F4EE] hover:bg-[#EAE4D5] text-xs font-semibold text-[#4A5849] flex items-center justify-center gap-1.5 transition-colors focus-visible:outline-2"
          aria-haspopup="dialog"
        >
          <span>Buka Langit & Transit Lengkap</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>
      </section>

      {/* ========================================================= */}
      {/* 2. FULL CELESTIAL DETAIL MODAL / SURFACE (Design 2 Core) */}
      {/* ========================================================= */}
      {detailOpen && (
        <dialog
          ref={dialog}
          onCancel={() => setDetailOpen(false)}
          onClose={() => setDetailOpen(false)}
          className="m-auto w-full max-w-lg bg-transparent p-0 backdrop:bg-black/40 backdrop:backdrop-blur-xs"
          aria-labelledby={dialogTitle}
        >
          <div className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-[#F7F4EE] text-[#2D352E] shadow-2xl border border-[#E4DFD5] max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white border-b border-[#E4DFD5] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E5EBE3] flex items-center justify-center text-[#4A5849]">
                  <Orbit size={18} />
                </div>
                <div>
                  <h3 id={dialogTitle} className="font-serif text-lg font-medium text-[#2D352E]">
                    Langit & Transit Hari Ini
                  </h3>
                  <p className="text-[11px] text-[#5F6B5E]">{formattedToday} · {timezone}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#5F6B5E] hover:bg-[#F2EFE8] transition-colors"
                aria-label="Tutup detail langit"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* PRIMARY VISUAL ANCHOR: Large 2.5D Moon + Astronomical Data */}
              <section className="rounded-[24px] bg-white p-6 border border-[#E4DFD5] shadow-xs text-center flex flex-col items-center">
                <CelestialMoon
                  phaseAngle={moonPhaseAngle}
                  illuminationFraction={moonIllum.fraction}
                  isWaxing={moonIllum.isWaxing}
                  size={128}
                  showAmbientGlow={true}
                  subtleFloating={false}
                />

                <span className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#5F6B5E]">
                  {!Number.isFinite(moonPhaseAngle) ? "Fase belum tersedia" : moonIllum.isWaxing ? "Bulan Bertambah (Waxing)" : "Bulan Berkurang (Waning)"}
                </span>

                <h4 className="text-2xl font-serif font-medium text-[#2D352E] mt-1 mb-2">
                  {Number.isFinite(moonPhaseAngle) ? moonIllum.phaseLabel : "Fase bulan belum tersedia"}
                </h4>

                {/* Fact Grid: Astronomy Data vs Interpretation */}
                <div className="grid grid-cols-2 gap-2 w-full mt-3 pt-3 border-t border-[#E4DFD5]/60 text-left">
                  <div className="p-2.5 rounded-xl bg-[#F7F4EE]">
                    <span className="text-[10px] text-[#5F6B5E] block font-medium">Perkiraan iluminasi dari sudut fase</span>
                    <span className="text-sm font-semibold text-[#2D352E]">{Number.isFinite(moonIllum.fraction) ? `≈${(moonIllum.fraction * 100).toFixed(1)}%` : "Belum tersedia"}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#F7F4EE]">
                    <span className="text-[10px] text-[#5F6B5E] block font-medium">Posisi Zodiak</span>
                    <span className="text-sm font-semibold text-[#2D352E]">{moonBody?.sign || "Terkalkulasi"}</span>
                  </div>
                </div>

                {moonNarrative && (
                  <div className="mt-4 text-left p-3.5 rounded-2xl bg-[#E5EBE3]/50 border border-[#E5EBE3] w-full">
                    <span className="text-[11px] font-bold text-[#4A5849] uppercase tracking-wider block mb-1">
                      Makna Refleksi Bhumi
                    </span>
                    <p className="text-xs text-[#2D352E] leading-relaxed">
                      {moonNarrative.personalImpact || moonNarrative.collectiveTheme}
                    </p>
                    <p className="text-xs">{t.actionLabel}: {moonNarrative.action}</p>
                  </div>
                )}
                <p className="text-xs">{moonInfo.startDate}–{moonInfo.endDate}</p>
              </section>

              {/* RELEVANT PLANETARY TRANSITS: Filtered to ONLY active events */}
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-[0.16em] text-[#5F6B5E]">
                    Planet & Transit Relevan
                  </h4>
                  <span className="text-xs text-[#5F6B5E]">
                    {synthesis.westernEvents.length} peristiwa aktif
                  </span>
                </div>

                {synthesis.westernEvents.length === 0 ? (
                  <p className="text-xs text-[#5F6B5E] p-4 bg-white rounded-2xl border border-[#E4DFD5] text-center">
                    Langit hari ini tenang tanpa aspek ketat atau transit planet mayor.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {synthesis.westernEvents.map((evt) => {
                      const bodyObj = sky.bodies.find((b) => b.body === evt.body);
                      const actObj = activations.find((a) => a.planet === evt.body);
                      const narrative = bodyObj ? buildTransitNarrative(bodyObj, actObj || undefined, context) : null;
                      const isExpanded = selectedTransitId === evt.body;

                      return (
                        <div
                          key={evt.body}
                          className="rounded-[20px] bg-white border border-[#E4DFD5] p-4 shadow-2xs transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <RelevantPlanetBadge
                              body={evt.body}
                              sign={evt.sign}
                              isRetrograde={evt.isRetrograde}
                            />
                            <button
                              type="button"
                              onClick={() => setSelectedTransitId(isExpanded ? null : evt.body)}
                              className="text-xs font-semibold text-[#4A5849] p-1.5 hover:bg-[#F7F4EE] rounded-lg transition-colors"
                              aria-expanded={isExpanded}
                              aria-label={`Detail transit ${evt.body}`}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>

                          {/* Aspect tags */}
                          {evt.aspects.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {evt.aspects.map((asp, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#F2EFE8] text-[#4A5849]"
                                >
                                  {ASPECT_LABELS[asp.aspect] || asp.aspect} {asp.partner} ({asp.orb.toFixed(1)}°)
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Narrative Disclosure */}
                          {isExpanded && narrative && (
                            <div className="mt-3 pt-3 border-t border-[#E4DFD5]/60 space-y-2 text-xs text-[#2D352E] leading-relaxed">
                              <div>
                                <span className="font-semibold text-[#4A5849] block text-[11px]">Tema Kolektif:</span>
                                <p className="text-[#5F6B5E]">{narrative.collectiveTheme}</p>
                              </div>
                              <div>
                                <span className="font-semibold text-[#4A5849] block text-[11px]">Refleksi Pribadi:</span>
                                <p className="text-[#5F6B5E]">{narrative.personalImpact}</p>
                              </div>
                              {narrative.action && (
                                <div className="p-2.5 rounded-xl bg-[#F7F4EE] text-[#2D352E]">
                                  <span className="font-semibold text-[#4A5849] block text-[10px] uppercase">Langkah Selaras:</span>
                                  <p className="text-xs">{narrative.action}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h4>{t.easternGroup}</h4>
                {easternCards.map((card) => <details key={card.title} className="rounded-2xl p-4 bg-white border border-[#E4DFD5] text-xs space-y-2">
                  <summary className="cursor-pointer font-semibold">{card.title} · {card.timing}</summary>
                  <p>{card.summary}</p><p>{t.collectiveTheme}: {card.collective}</p>
                  <p>{t.personalTouch}: {card.personal}</p><p>{t.actionLabel}: {card.action}</p>
                </details>)}
              </section>
              {synthesis.eclipses.globalNext && (
                <section className="rounded-2xl p-4 bg-white border border-[#E4DFD5] space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6B5E] block">
                    Gerhana Berikutnya di Dunia
                  </span>
                  <p className="text-xs font-semibold text-[#2D352E]">
                    Gerhana {synthesis.eclipses.globalNext.kind === "solar" ? "Matahari" : "Bulan"} ({synthesis.eclipses.globalNext.subkind})
                  </p>
                  <p className="text-[11px] text-[#5F6B5E]">
                    Puncak: {new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(synthesis.eclipses.globalNext.peakUtc)}
                  </p>
                  <p className="text-xs">{synthesis.eclipses.globalNext.kind === "solar" ? t.solarEclipseMeaning : t.lunarEclipseMeaning}</p>
                  <p className="text-xs">{synthesis.eclipses.globalNext.kind === "solar" ? t.solarEclipsePersonal : t.lunarEclipsePersonal}</p>
                  <p className="text-xs">{synthesis.eclipses.globalNext.kind === "solar" ? t.solarEclipseAction : t.lunarEclipseAction}</p>
                </section>
              )}
              <section className="rounded-2xl p-4 bg-white border border-[#E4DFD5] text-xs">
                <h4>{t.eclipseLocalNext}</h4>
                <p>{synthesis.eclipses.localVisible ? `${synthesis.eclipses.localVisible.kind} · ${new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: timezone }).format(synthesis.eclipses.localVisible.peakUtc)}` : t.eclipseLocalUnavailable}</p>
              </section>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-[#E4DFD5] text-center shrink-0">
              <button
                type="button"
                onClick={() => setDetailOpen(false)}
                className="w-full py-3 rounded-2xl bg-[#4A5849] text-white text-sm font-semibold hover:bg-[#3E4B3D] transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
