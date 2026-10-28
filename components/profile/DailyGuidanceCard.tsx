"use client";

import { useState } from "react";
import Link from "next/link";
import type { DailyGuidance, DailyGuidanceSection } from "@/lib/dailyGuidance/dailyGuidanceEngine";
import { normalizeIndonesianSentenceCase } from "@/lib/utils/sentenceCase";
import { useLanguage } from "@/app/context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";

function DomainIcon({ domainKey }: { domainKey: string }) {
  switch (domainKey) {
    case "kabarHariIni":
      // Compass / Horizon
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <polygon points="12 7 14 13 8 11" fill="currentColor" opacity="0.3" />
          <polygon points="12 7 14 13 8 11" />
        </svg>
      );
    case "pikiran":
      // Lightbulb / Intellect
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "ekonomi":
      // Currency / Material Security
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "asmara":
      // Heart / Emotional Bond
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      );
    case "orangTerdekat":
      // Users / Circles
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case "maknaBatin":
      // Moon / Inner World
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case "yangMungkinTerasaBerat":
      // Shield / Boundaries & Heavy Lessons
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "ruangYangSedangTerbuka":
      // Star / Opportunity
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    default:
      return (
        <svg className="h-5 w-5 text-[#4F5E52]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
  }
}

export interface DailyGuidanceCardProps {
  guidance: DailyGuidance | null;
  expandedDomainKey?: string | null;
  onToggleDomain?: (key: string | null) => void;
}

export function DailyGuidanceCard({
  guidance,
  expandedDomainKey,
  onToggleDomain,
}: DailyGuidanceCardProps) {
  const { language } = useLanguage();
  const isEn = isEnlEdition() || language === "en";

  // Internal state if not controlled externally
  const [internalOpenKey, setInternalOpenKey] = useState<string | null>(null);
  const activeOpenKey = expandedDomainKey !== undefined ? expandedDomainKey : internalOpenKey;

  const handleToggle = (key: string) => {
    const nextKey = activeOpenKey === key ? null : key;
    if (onToggleDomain) {
      onToggleDomain(nextKey);
    } else {
      setInternalOpenKey(nextKey);
    }
  };

  const handleSelectTopDomain = (key: string) => {
    handleToggle(key);
    setTimeout(() => {
      const el = document.getElementById(`daily-domain-${key}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 60);
  };

  if (!guidance) {
    return (
      <section className="mt-4 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="daily-guidance-title">
        <h2 id="daily-guidance-title" className="font-serif text-2xl text-[#4F5E52]">
          Catatan Hari Ini
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">
          Panduan praktis harian dari Bhumi sedang disiapkan…
        </p>
      </section>
    );
  }

  if (guidance.state === "unavailable") {
    return (
      <section className="mt-4 rounded-[2rem] bg-[#F7F5EF] p-6" aria-labelledby="daily-guidance-title">
        <h2 id="daily-guidance-title" className="font-serif text-2xl text-[#4F5E52]">
          Catatan Hari Ini
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">
          Lengkapi data profil dan waktu lahirmu agar potensi dan dinamika harian dapat dibaca secara akurat.
        </p>
        <Link
          href="/setup"
          className="mt-4 inline-flex items-center rounded-2xl bg-[#4F5E52] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#3D493F]"
        >
          Lengkapi Data Lahir
        </Link>
      </section>
    );
  }

  const { cosmicSummary } = guidance;

  return (
    <section className="mt-4" aria-labelledby="daily-guidance-title">
      {/* 1. Header Banner */}
      <div className="rounded-[2rem] bg-[#F7F5EF] p-6 border border-[#E8E9E5]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-[#E8E4D9] px-3 py-1 text-[11px] font-bold tracking-wider text-[#4F5E52]">
              CATATAN HARI INI
            </span>
            {cosmicSummary.wetonToday && (
              <span className="rounded-full bg-[#E5EBE3] px-2.5 py-0.5 text-[10px] font-semibold text-[#4A5849]">
                {cosmicSummary.wetonToday.weton}
              </span>
            )}
            {cosmicSummary.baziToday && (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  cosmicSummary.baziToday.isDayRen
                    ? "bg-[#E0F2FE] text-[#075985]"
                    : "bg-[#EAE4D5] text-[#634E28]"
                }`}
              >
                {cosmicSummary.baziToday.isDayRen
                  ? `Day Ren: ${cosmicSummary.baziToday.display}`
                  : `BaZi: ${cosmicSummary.baziToday.display}`}
              </span>
            )}
            {cosmicSummary.tzolkinToday && (
              <span className="rounded-full bg-[#F3E8FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6B21A8]">
                Kin {cosmicSummary.tzolkinToday.kin}
              </span>
            )}
          </div>
          <p className="text-xs font-bold tracking-[0.04em] text-[#7B8776]">
            {guidance.dateFormatted} · {guidance.timezone}
          </p>
        </div>

        <h2 id="daily-guidance-title" className="mt-3 font-serif text-2xl text-[#4F5E52]">
          Catatan Hari Ini
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-[#7B8776]">
          Panduan kosmik dan perjalanan jiwa personal dari Bhumi untuk hari ini.
        </p>

        {/* Ringkasan Langit & Siklus Hari Ini */}
        <div className="mt-4 rounded-2xl border border-[#E8E9E5] bg-white/80 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#7B8776]">
            <span>{cosmicSummary.lunarPhaseSummary}</span>
            <span>·</span>
            <span>{cosmicSummary.planetaryMotionSummary}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-[#4F5E52]">
            {cosmicSummary.collectiveTheme}
          </p>
          {cosmicSummary.baziToday?.dayRenNote && (
            <p className="mt-2 text-xs leading-relaxed text-[#075985] bg-[#F0F9FF] p-2.5 rounded-xl border border-[#BAE6FD]">
              <strong>Dinamika Day Ren:</strong> {cosmicSummary.baziToday.dayRenNote}
            </p>
          )}
          {cosmicSummary.keyEvents.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#EAE7DF]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">
                Peristiwa:
              </span>
              {cosmicSummary.keyEvents.map((eventTitle, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-[#F3F4F1] px-2 py-0.5 text-[11px] font-medium text-[#4F5E52]"
                >
                  {eventTitle}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Transit Paling Aktif Terhadap Chart Milikmu */}
        {cosmicSummary.mostActivePersonalTransit && (
          <div className="mt-3 rounded-2xl border border-[#E0E6DD] bg-[#F7FAF6] p-4 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5A6D5D]">
              Transit Paling Aktif Terhadap Chart Milikmu
            </p>
            <p className="mt-1 font-semibold leading-relaxed text-[#2C382E]">
              {cosmicSummary.mostActivePersonalTransit.summary}
            </p>
          </div>
        )}

        {/* 3 Domain Kehidupan Paling Menonjol Hari Ini */}
        {cosmicSummary.top3HighlightedDomains.length > 0 && (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7B8776]">
              3 Domain Kehidupan Paling Menonjol Hari Ini
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {cosmicSummary.top3HighlightedDomains.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  onClick={() => handleSelectTopDomain(d.key)}
                  className="w-full text-left rounded-xl border border-[#E8E9E5] bg-white p-3 shadow-xs transition hover:border-[#4F5E52] hover:bg-[#FAF9F5] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#4F5E52]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#4F5E52]">{d.title}</span>
                    <span className="h-2 w-2 rounded-full bg-[#D97706]" />
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#667064]">
                    {d.headline}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#4F5E52]">
                    Buka rincian &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-4 text-xs italic leading-relaxed text-[#6E7B6C] border-t border-[#EAE7DF] pt-3">
          "{cosmicSummary.mainSpiritualMessage}"
        </p>
      </div>

      {/* 2. 8 Vertical Accordion Domain Cards */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7B8776]">
            Bidang Kehidupan (8 Domain)
          </p>
          <span className="text-[10px] text-[#9AA394]">
            Klik kartu untuk membuka rincian
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {guidance.sections.map((sec: DailyGuidanceSection) => {
            const isOpen = activeOpenKey === sec.key;
            const hasDirectActivation = sec.evidence.hasDirectActivation;
            const isHigh = sec.intensity === "high";
            const isMedium = sec.intensity === "medium";

            return (
              <article
                key={sec.key}
                id={`daily-domain-${sec.key}`}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-[#4F5E52] bg-white shadow-md ring-1 ring-[#4F5E52]/10"
                    : "border-[#E8E9E5] bg-white hover:border-[#CBD5C8] hover:bg-[#FAF9F5] shadow-xs"
                }`}
              >
                {/* Clickable Card Header */}
                <button
                  type="button"
                  onClick={() => handleToggle(sec.key)}
                  aria-expanded={isOpen}
                  aria-controls={`daily-panel-${sec.key}`}
                  className="flex w-full items-start justify-between gap-3 p-4 sm:p-5 text-left transition focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#4F5E52]"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Domain Icon with subtle badge */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                        isOpen
                          ? "bg-[#4F5E52] text-white"
                          : hasDirectActivation
                          ? "bg-[#EAEFE8] text-[#4F5E52]"
                          : "bg-[#F3F4F1] text-[#7B8776]"
                      }`}
                    >
                      <DomainIcon domainKey={sec.key} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-base sm:text-lg font-bold text-[#4F5E52] leading-tight">
                          {sec.title}
                        </h3>

                        {/* Transit Activation Badge */}
                        {hasDirectActivation ? (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              isHigh
                                ? "bg-[#FEF3C7] text-[#92400E]"
                                : isMedium
                                ? "bg-[#E0F2FE] text-[#075985]"
                                : "bg-[#F3F4F6] text-[#4B5563]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isHigh ? "bg-[#D97706]" : "bg-[#0284C7]"
                              }`}
                            />
                            {isHigh ? "Aktivasi Kuat" : "Aktivasi Sedang"}
                          </span>
                        ) : (
                          <span className="rounded-full bg-[#F3F4F1] px-2 py-0.5 text-[10px] font-medium text-[#7B8776]">
                            Ritme Tenang
                          </span>
                        )}
                      </div>

                      {/* 1-2 line concise summary */}
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#667064]">
                        {normalizeIndonesianSentenceCase(sec.summary || sec.focus)}
                      </p>
                    </div>
                  </div>

                  {/* Expand / Collapse Chevron */}
                  <div className="shrink-0 pt-1">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-200 ${
                        isOpen ? "bg-[#4F5E52] text-white rotate-180" : "bg-[#F7F5EF] text-[#7B8776]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </div>
                </button>

                {/* Expanded Detailed Accordion Panel */}
                {isOpen && (
                  <div
                    id={`daily-panel-${sec.key}`}
                    role="region"
                    aria-labelledby={`daily-domain-${sec.key}`}
                    className="border-t border-[#F0EFEA] bg-[#FCFAF7] p-5 sm:p-6"
                  >
                    {/* Astrological Evidence Box */}
                    <div className="rounded-2xl border border-[#DCE4D8] bg-[#F3F7F1] p-4 text-xs leading-relaxed text-[#2C382E]">
                      <div className="flex items-center gap-1.5 text-[#4F5E52] font-bold uppercase tracking-[0.12em]">
                        <svg className="h-4 w-4 text-[#5A6D5D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <circle cx="12" cy="12" r="3" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.071-7.071l-1.414 1.414M8.343 15.657l-1.414 1.414m12.142 0l-1.414-1.414M8.343 8.343L6.929 6.929" />
                        </svg>
                        <span>Kalkulasi Astrologis & Rumah Placidus</span>
                      </div>
                      <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-[#2C382E]">
                        {sec.evidence.activationSummary}
                      </p>
                    </div>

                    {/* Astrological Meaning */}
                    <div className="mt-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7B8776]">
                        Pengaruh Astrologis
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-[#4A5548]">
                        {normalizeIndonesianSentenceCase(sec.astrologicalMeaning)}
                      </p>
                    </div>

                    {/* Spiritual & Soul Journey Meaning */}
                    <div className="mt-4">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#7B8776]">
                        Makna Spiritual & Perjalanan Jiwa
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-[#4A5548]">
                        {normalizeIndonesianSentenceCase(sec.spiritualMeaning)}
                      </p>
                    </div>

                    {/* Canonical Blueprint Accent */}
                    {sec.blueprintContribution && (
                      <div className="mt-4 rounded-2xl bg-white border border-[#EBE8DF] p-3.5 text-xs leading-relaxed text-[#6E7B6C]">
                        <span className="font-bold text-[#4F5E52]">Sintesis Lintas Sistem: </span>
                        {normalizeIndonesianSentenceCase(sec.blueprintContribution)}
                      </div>
                    )}

                    {/* Saran Bhumi */}
                    <div className="mt-5 rounded-2xl border border-[#DDE4D8] bg-[#F7F5EF] p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7B8776]">
                        Saran Bhumi
                      </p>
                      <p className="mt-1 text-sm font-medium leading-relaxed text-[#4F5E52]">
                        {normalizeIndonesianSentenceCase(sec.advice.join(" "))}
                      </p>
                    </div>

                    {/* Dynamic Daily Phases (Pagi, Siang, Malam) */}
                    <div className="mt-5 grid gap-3 border-t border-[#EAE7DF] pt-4 sm:grid-cols-3">
                      <div className="rounded-xl bg-white border border-[#EBE8DF] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">
                          Pagi Hari
                        </p>
                        {sec.phases.pagi.map((p, i) => (
                          <p key={`pagi-${i}`} className="mt-1 text-xs leading-relaxed text-[#667064]">
                            {normalizeIndonesianSentenceCase(p)}
                          </p>
                        ))}
                      </div>
                      <div className="rounded-xl bg-white border border-[#EBE8DF] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">
                          Siang Hari
                        </p>
                        {sec.phases.siang.map((p, i) => (
                          <p key={`siang-${i}`} className="mt-1 text-xs leading-relaxed text-[#667064]">
                            {normalizeIndonesianSentenceCase(p)}
                          </p>
                        ))}
                      </div>
                      <div className="rounded-xl bg-white border border-[#EBE8DF] p-3">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9AA394]">
                          Malam Hari
                        </p>
                        {sec.phases.malam.map((p, i) => (
                          <p key={`malam-${i}`} className="mt-1 text-xs leading-relaxed text-[#667064]">
                            {normalizeIndonesianSentenceCase(p)}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Dasar Pembacaan (Foundations Drawer) */}
                    {sec.readingFoundations && sec.readingFoundations.length > 0 && (
                      <details className="mt-4 rounded-xl border border-[#DCE4D8] bg-[#F7F5EF]/80 p-3.5 text-xs">
                        <summary className="cursor-pointer font-bold tracking-wider text-[#4F5E52] hover:text-[#3D493F]">
                          Dasar Pembacaan (Indikator Sistem yang Digunakan)
                        </summary>
                        <div className="mt-3 divide-y divide-[#EAE7DF] border-t border-[#EAE7DF] pt-2">
                          {sec.readingFoundations.map((f, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 py-1.5">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-[#4F5E52]">{f.system}:</span>
                                <span className="font-mono text-[11px] text-[#2C382E]">{f.indicator}</span>
                              </div>
                              <span className="text-[10px] text-[#7B8776] italic">{f.detail}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* 3. Arah Hari Ini Box */}
      <article className="mt-6 rounded-[2rem] border border-[#DDE4D8] bg-[#F7F5EF] p-6">
        <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52]">
          {guidance.dailyDirection.title}
        </h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-[#5F6B5D]">
          {guidance.dailyDirection.paragraphs.map((paragraph, i) => (
            <p key={`direction-${i}`}>{normalizeIndonesianSentenceCase(paragraph)}</p>
          ))}
        </div>
      </article>

      {/* 4. Actionable CTAs */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/wellness"
          className="rounded-2xl bg-[#4F5E52] px-6 py-3 text-xs font-semibold text-white shadow-sm hover:bg-[#3D493F]"
        >
          Praktikkan di Wellness
        </Link>
        <Link
          href="/journal"
          className="rounded-2xl border border-[#DDE4D8] bg-white px-6 py-3 text-xs font-semibold text-[#4F5E52] shadow-sm hover:bg-[#F7F5EF]"
        >
          Tulis Jurnal Refleksi
        </Link>
      </div>
    </section>
  );
}
