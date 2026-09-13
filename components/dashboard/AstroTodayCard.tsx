"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Compass, Moon, Orbit, Sun } from "lucide-react";
import { calculateCurrentSky } from "@/lib/astrology/calculateCurrentSky";
import { buildAstroHouseActivations } from "@/lib/astrology/astroHouseActivations";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { GAP_KIN } from "@/lib/tzolkin/dictionaries";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { buildTransitNarrative } from "@/lib/astrology/personalizedTransitNarrative";
import { buildDailyAstroSynthesis } from "@/lib/astrology/dailyAstroSynthesis";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";

type AstroTodayCardProps = { context: { profile?: Record<string, any>; blueprint?: Record<string, any>; [key: string]: unknown } };
type TimingCard = { id: string; title: string; timing: string; summary: string; collective: string; personal: string; action: string };

const ASPECT_LABELS: Record<string, string> = { conjunction: "conjunction", sextile: "sextile", square: "square", trine: "trine", opposition: "opposition" };

export function AstroTodayCard({ context }: AstroTodayCardProps) {
  const isEn = false;
  const a = translations["id"].astroToday;
  const timezone = context.profile?.timezone || "UTC";
  const today = getLocalDateKey(new Date(), timezone);
  const [openLevel, setOpenLevel] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<string | null>(null);
  useEffect(() => { setOpenLevel(false); setOpenGroup(null); setOpenCard(null); }, [context.profile?.uid, today]);
  // T-ASTRO-04 (D-V5-26): the card renders ONE canonical Daily Astro Synthesis —
  // the same object consumed by Wellness / Catatan Hari Ini / Panduan Minggu Ini.
  const uid = context.profile?.uid;
  const synthesis = useMemo(() => buildDailyAstroSynthesis({ uid, profileTimezone: context.profile?.timezone ?? null }), [uid, context.profile?.timezone]);
  const sky = synthesis.sky;
  const moonPhaseLabel = ({ "New Moon": "Bulan Baru", "Waxing Crescent": "Sabit Awal", "First Quarter": "Perbani Awal", "Waxing Gibbous": "Cembung Awal", "Full Moon": "Bulan Purnama", "Waning Gibbous": "Cembung Akhir", "Last Quarter": "Perbani Akhir", "Third Quarter": "Perbani Akhir", "Waning Crescent": "Sabit Akhir" } as Record<string, string>)[sky.moonInfo.label] ?? "Fase bulan belum tersedia";
  const activations = useMemo(() => buildAstroHouseActivations({ uid, currentSky: sky, natalChart: context.blueprint?.astrology || context.blueprint?.natalChart || null, natalHouses: context.blueprint?.astrology?.houses || null }).activations, [sky, uid, context.blueprint]);
  const moon = sky.bodies.find((body) => body.body === "Moon");
  const moonActivation = activations.find((activation) => activation.planet === "Moon");
  const moonNarrative = moon ? buildTransitNarrative(moon, moonActivation, context) : null;
  const vedic = useMemo(() => { try { return calculateVedic({ birthDate: context.profile?.birthDate || "1990-01-01", birthTime: context.profile?.birthTime || "12:00", birthCity: context.profile?.birthCity || "Jakarta", timezone, asOf: new Date() }); } catch { return null; } }, [context.profile, timezone]);
  const bazi = useMemo(() => { try { return calculateBazi({ birthDate: context.profile?.birthDate || "1990-01-01", birthTime: context.profile?.birthTime || "12:00", timezone, referenceDate: new Date() }); } catch { return null; } }, [context.profile, timezone]);
  const tzolkin = useMemo(() => (synthesis.eastern.tzolkin ? { kinName: `Kin ${synthesis.eastern.tzolkin.kin} · ${synthesis.eastern.tzolkin.kinName}`, wavespell: { name: synthesis.eastern.tzolkin.wavespellName, meaning: synthesis.eastern.tzolkin.wavespellMeaning } } : null), [synthesis]);
  const nextGap = useMemo(() => { for (let offset = 0; offset <= 260; offset += 1) { const date = new Date(`${today}T12:00:00`); date.setDate(date.getDate() + offset); const dateKey = date.toISOString().slice(0, 10); const kin = calculateTzolkin({ birthDate: dateKey }); if (GAP_KIN.has(kin.kin)) return { date: dateKey, days: offset }; } return null; }, [today]);
  const weton = useMemo(() => (synthesis.eastern.weton ? { weton: synthesis.eastern.weton.weton } : null), [synthesis]);
  const formatDate = (date: string) => new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(new Date(`${date}T12:00:00`));
  const formatInstant = (iso: string) => new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: timezone }).format(new Date(iso));

  // T-ASTRO-03/06 (D-V5-27): variable-count relevant Western events — no fixed slice.
  const relevantWestern = synthesis.westernEvents;
  const westernCards: TimingCard[] = relevantWestern.map((event) => {
    const body = sky.bodies.find((item) => item.body === event.body)!;
    const narrative = buildTransitNarrative(body, activations.find((activation) => activation.planet === event.body), context);
    const detailBits: string[] = [];
    if (event.isRetrograde) detailBits.push(a.retrogradeNote);
    if (event.reasons.some((reason) => reason.type === "ingress")) detailBits.push(a.ingressNote);
    for (const asp of event.aspects) {
      detailBits.push(a.aspectWith.replace("{aspect}", ASPECT_LABELS[asp.aspect] || asp.aspect).replace("{partner}", (a.planets as Record<string, string>)[asp.partner] || asp.partner).replace("{orb}", asp.orb.toFixed(1)));
    }
    const timing = event.periodStart && event.periodEnd ? `${event.periodStart}–${event.periodEnd}` : a.todayTiming;
    return {
      id: `western-${event.body}`,
      title: `${(a.planets as Record<string, string>)[event.body] || event.body} ${isEn ? "in" : "di"} ${event.sign}`,
      timing,
      summary: detailBits.length > 0 ? detailBits.join(" · ") : narrative.collectiveTheme,
      collective: narrative.collectiveTheme,
      personal: narrative.personalImpact,
      action: narrative.action,
    };
  });

  // T-ASTRO-01/02 (D-V5-29): dynamic eclipses — Global Next always; Local/Visible Next
  // only when reliable coordinates exist, otherwise an explicit unavailable state.
  const eclipseData = synthesis.eclipses;
  const eclipseCards: TimingCard[] = [];
  if (eclipseData.globalNext) {
    const info = eclipseData.globalNext;
    const peakLocalKey = getLocalDateKey(info.peakUtc, timezone);
    const daysAway = Math.max(0, Math.ceil((new Date(`${peakLocalKey}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000));
    const isSolar = info.kind === "solar";
    eclipseCards.push({
      id: `eclipse-global-${info.id}`,
      title: `${a.eclipseGlobalNext}: ${isSolar ? (isEn ? "Solar" : "Matahari") : (isEn ? "Lunar" : "Bulan")} ${info.subkind}`,
      timing: `${formatInstant(info.peakUtc.toISOString())} · ${daysAway === 0 ? a.eclipseToday : a.eclipseDaysAway.replace("{n}", String(daysAway))}`,
      summary: isSolar ? a.solarEclipseMeaning : a.lunarEclipseMeaning,
      collective: isSolar ? a.solarEclipseMeaning : a.lunarEclipseMeaning,
      personal: isSolar ? a.solarEclipsePersonal : a.lunarEclipsePersonal,
      action: isSolar ? a.solarEclipseAction : a.lunarEclipseAction,
    });
    eclipseCards.push({
      id: "eclipse-local",
      title: a.eclipseLocalNext,
      timing: a.todayTiming,
      summary: eclipseData.localVisible ? (isSolar ? a.solarEclipseMeaning : a.lunarEclipseMeaning) : a.eclipseLocalUnavailable,
      collective: a.eclipseLocalUnavailable,
      personal: a.eclipseLocalUnavailable,
      action: a.eclipseLocalUnavailable,
    });
  }

  const groups: Array<{ id: string; title: string; icon: React.ReactNode; summary: string; cards: TimingCard[] }> = [
    { id: "moon", title: a.moonPhaseGroup, icon: <Moon size={18} />, summary: `${moonPhaseLabel} ${isEn ? "in" : "di"} ${moon?.sign || (isEn ? "today's sign" : "zodiak hari ini")}`, cards: [{ id: "moon-phase", title: moonPhaseLabel, timing: `${sky.moonInfo.startDate}–${sky.moonInfo.endDate}`, summary: (a.eastern.moonThemes as Record<string,string>)[sky.moonInfo.label] || sky.moonInfo.theme, collective: (a.eastern.moonThemes as Record<string,string>)[sky.moonInfo.label] || sky.moonInfo.theme, personal: moonNarrative?.personalImpact || a.moonFallbackPersonal, action: moonNarrative?.action || a.moonFallbackAction }] },
    { id: "western", title: a.westernGroup, icon: <Sun size={18} />, summary: a.relevantEventsCount.replace("{n}", String(westernCards.length)), cards: westernCards },
    { id: "eastern", title: a.easternGroup, icon: <Compass size={18} />, summary: [vedic && "Vedic", bazi && "BaZi", tzolkin && "Tzolkin", weton && "Weton"].filter(Boolean).join(" · ") || "—", cards: [vedic && { id: "vedic", title: a.eastern.vedic.title, timing: a.eastern.vedic.timing, summary: a.eastern.vedic.summary.replace("{maha}", String(vedic.currentMahadasha.planet)).replace("{anta}", String(vedic.currentAntardasha.planet)), collective: a.eastern.vedic.collective, personal: String(vedic.summary?.[2] || a.eastern.vedic.personalFallback), action: a.eastern.vedic.action }, bazi && { id: "bazi", title: a.eastern.bazi.titleTpl.replace("{pillar}", String(bazi.dayPillar.display)), timing: a.eastern.bazi.timingTpl.replace("{date}", formatDate(today)), summary: a.eastern.bazi.summaryTpl.replace("{element}", String(bazi.dayMaster.element).toLowerCase()), collective: a.eastern.bazi.collective, personal: a.eastern.bazi.personalTpl.replace("{element}", String(bazi.dayMaster.element).toLowerCase()), action: a.eastern.bazi.action }, tzolkin && { id: "tzolkin", title: a.eastern.tzolkin.titleTpl.replace("{kin}", String(tzolkin.kinName)), timing: a.eastern.bazi.timingTpl.replace("{date}", formatDate(today)), summary: a.eastern.tzolkin.summaryTpl.replace("{wavespell}", String(tzolkin.wavespell.name)), collective: a.eastern.tzolkin.collective, personal: String(tzolkin.wavespell.meaning), action: a.eastern.tzolkin.action }, nextGap && { id: "tzolkin-gap", title: a.eastern.gap.title, timing: nextGap.days === 0 ? a.eastern.gap.todayTimingTpl.replace("{date}", formatDate(nextGap.date)) : a.eastern.gap.aheadTimingTpl.replace("{date}", formatDate(nextGap.date)).replace("{n}", String(nextGap.days)), summary: nextGap.days === 0 ? a.eastern.gap.todaySummary : a.eastern.gap.aheadSummaryTpl.replace("{date}", formatDate(nextGap.date)), collective: a.eastern.gap.collective, personal: a.eastern.gap.personal, action: a.eastern.gap.action }, weton && { id: "weton", title: a.eastern.wetonCard.titleTpl.replace("{weton}", String(weton.weton)), timing: a.eastern.wetonCard.timingTpl.replace("{date}", formatDate(today)), summary: a.eastern.wetonCard.summary, collective: a.eastern.wetonCard.collective, personal: a.eastern.wetonCard.personal, action: a.eastern.wetonCard.action } ].filter(Boolean) as TimingCard[] },
    ...(eclipseCards.length > 0 ? [{ id: "eclipse", title: a.eclipseGroup, icon: <Orbit size={18} />, summary: eclipseData.globalNext ? formatInstant(eclipseData.globalNext.peakUtc.toISOString()) : "—", cards: eclipseCards }] : []),
  ];
  return <section className="mt-10 space-y-4" aria-labelledby="astro-today-title">
    <header className="px-1"><h3 id="astro-today-title" className="text-2xl font-serif font-bold text-[#4F6658]">{a.title}</h3><p className="mt-1 text-[13px] font-medium text-[#3C3C3C]/70">{a.subtitle}</p></header>
    <div className="bhumi-card overflow-hidden border-none bg-white shadow-sm"><div className="p-6"><div className="flex items-start gap-4"><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-500"><Moon size={22} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{moonPhaseLabel}</p><h4 className="mt-1 text-lg font-bold text-[#4F6658]">{isEn ? `Moon in ${moon?.sign || "today's sign"}` : `Bulan di ${moon?.sign || "zodiak hari ini"}`}</h4><p className="mt-1 text-sm leading-relaxed text-[#667064]">{moonNarrative?.personalImpact || sky.moonInfo.theme}</p></div></div></div><button type="button" aria-expanded={openLevel} onClick={() => setOpenLevel((value) => !value)} className="flex w-full items-center justify-center gap-2 border-t border-[#F1EEE7] bg-[#FCFAF5] px-5 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4F6658]">{openLevel ? a.close : a.seeMore}{openLevel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button></div>
    {openLevel && <div className="space-y-4">{groups.map((group) => <div key={group.id} className="bhumi-card border-none bg-white p-5 shadow-sm"><button type="button" aria-expanded={openGroup === group.id} onClick={() => { setOpenGroup((value) => value === group.id ? null : group.id); setOpenCard(null); }} className="flex w-full items-center gap-3 text-left text-[#4F6658]"><span>{group.icon}</span><span className="flex-1"><span className="block text-sm font-bold uppercase tracking-widest">{group.title}</span><span className="mt-1 block text-xs font-medium normal-case tracking-normal text-[#7B8776]">{group.summary}</span></span>{openGroup === group.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>{openGroup === group.id && <div className="mt-4 space-y-3">{group.cards.map((card) => <div key={card.id} className="rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-4"><button type="button" aria-expanded={openCard === card.id} onClick={() => setOpenCard((value) => value === card.id ? null : card.id)} className="flex w-full items-start gap-3 text-left"><span className="flex-1"><span className="block text-sm font-bold text-[#4F6658]">{card.title}</span><span className="mt-1 block text-[10px] font-semibold text-[#9AA394]">{card.timing}</span><span className="mt-1 block text-xs leading-relaxed text-[#667064]">{card.summary}</span></span>{openCard === card.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>{openCard === card.id && <div className="mt-3 grid gap-2 text-xs"><div className="rounded-xl bg-white p-3"><p className="font-bold text-[#9AA394]">{a.collectiveTheme}</p><p className="mt-1 text-[#526053]">{card.collective}</p></div><div className="rounded-xl border border-indigo-50 bg-indigo-50/20 p-3"><p className="font-bold text-indigo-300">{a.personalTouch}</p><p className="mt-1 text-indigo-900/60">{card.personal}</p></div><div className="rounded-xl border border-emerald-50 bg-emerald-50/20 p-3"><p className="font-bold text-emerald-300">{a.actionLabel}</p><p className="mt-1 text-emerald-900/60">{card.action}</p></div></div>}</div>)}</div>}</div>)}</div>}
  </section>;
}
