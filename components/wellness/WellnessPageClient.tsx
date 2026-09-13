"use client";

import React from "react";
import Link from "next/link";
import {
  Activity, BookOpen, Brain, BriefcaseMedical, ChevronRight, Dumbbell,
  ExternalLink, Flower2, HeartHandshake, Lock, Music, Sparkles, Users,
  MessageSquare, Target, Clock, Info, Utensils
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { WellnessCheckInCard } from "@/components/dashboard/WellnessCheckInCard";
import { WellnessAssessmentFlow, RecommendationButton } from "@/components/wellness/WellnessAssessmentFlow";
import { WellnessMappingView } from "./WellnessMappingView";
import { WellnessMapView } from "./WellnessMapView";
import { WellnessNavigatorView } from "./WellnessNavigatorView";
import { WellnessSupportPathView } from "./WellnessSupportPathView";
import { COMMUNITY_CONFIG } from "@/lib/config/community";
import { storageProvider } from "@/lib/storage/storageProvider";
import { translations } from "@/lib/data/translations";
import { buildInnerworkDailyDecision, type InnerworkDailyDecision } from "@/lib/engines/innerworkIntelligence";
import { buildZoneBHref, type ZoneBPracticeCategory } from "@/lib/innerwork/zoneBContext";
import {
  loadWellnessDailyIntelligence,
  type WellnessDailyIntelligence,
} from "@/lib/services/wellnessDailyIntelligence";
import { APP_TIME_REFRESH_MS, getTimeWindow } from "@/lib/dailyGuidance/timeOfDayGreeting";
import { journeyRepository } from "@/lib/repositories/journeyRepository";
import { wellnessNavigatorEngine } from "@/lib/engines/wellnessNavigatorEngine";
import { wellnessSupportEngine } from "@/lib/engines/wellnessSupportEngine";
import { acknowledgeWellnessActivity, loadWellnessCuration, type WellnessCurationState } from "@/lib/services/wellnessCurationService";
import type { WellnessSnapshot } from "@/lib/data/types";
import type { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { WellnessNavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import type { SupportEngineState } from "@/lib/engines/wellnessSupportEngine";
import type { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";
import type { EnvironmentalContext } from "@/lib/engines/wellnessRecommendationEngine";
import { calculateCurrentSky } from "@/lib/astrology/calculateCurrentSky";
import { buildAkashiWellnessContext } from "@/lib/intelligence/wellnessAkashiContext";
import { isEnlEdition } from "@/lib/config/edition";

const CATEGORY_METADATA_EN: Record<string, { label: string; explanation: string }> = {
  GROWTH_PHASE: {
    label: "Growth Phase",
    explanation: "All your dimensions are in a stable condition and support your personal expansion."
  },
  BURNOUT: {
    label: "Burnout",
    explanation: "There is a noticeable dip in your physical energy and emotional reserves."
  },
  LIFE_TRANSITION: {
    label: "Life Transition",
    explanation: "You are currently in a phase of change or new chapter requiring internal adjustments."
  },
  LIFE_CRISIS: {
    label: "Life Challenge",
    explanation: "Several fundamental aspects of your life are facing challenges that need extra care."
  },
  LOSS_AND_GRIEF: {
    label: "Loss & Grief",
    explanation: "Your responses reflect higher emotional intensity around letting go or experiencing loss."
  },
  ANXIETY: {
    label: "Anxiety",
    explanation: "Patterns indicate elevated tension and a greater need for grounded safety than usual."
  },
  LONELINESS: {
    label: "Loneliness",
    explanation: "Relational dimensions show a need for deeper connection and heartfelt social support."
  },
  MEANING_CRISIS: {
    label: "Search for Meaning",
    explanation: "While other areas are steady, you are seeking deeper purpose and significance in daily life."
  },
  SPIRITUAL_AWAKENING: {
    label: "Spiritual Awakening",
    explanation: "A shift in inner awareness is taking place, often accompanying a personal transition."
  },
  SPIRITUAL_CRISIS: {
    label: "Spiritual Questioning",
    explanation: "Your inner search for purpose or deeper faith is at a pivotal, contemplative crossroad."
  }
};

async function loadCanonicalWellnessContext(date: string): Promise<EnvironmentalContext> {
  const dayOfWeek = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`)) as EnvironmentalContext["dayOfWeek"];
  const context: EnvironmentalContext = {
    localDate: date,
    dayOfWeek,
    isWeekday: dayOfWeek !== "Saturday" && dayOfWeek !== "Sunday",
    isWeekend: dayOfWeek === "Saturday" || dayOfWeek === "Sunday",
  };
  try {
    const sky = calculateCurrentSky(new Date(`${date}T12:00:00Z`));
    const majorTransitTags = sky.bodies.filter((body) => body.isRetrograde).map((body) => `${body.body} retrograde`);
    context.astroContext = {
      moonPhase: sky.moonInfo.label,
      moonSign: sky.bodies.find((body) => body.body === "Moon")?.sign,
      majorTransitTags,
      retrogradeTags: majorTransitTags,
      astroIntensity: majorTransitTags.length > 2 ? "high" : majorTransitTags.length > 0 ? "moderate" : "low",
      astroTheme: majorTransitTags.length > 0 ? "refleksi dan memperlambat respons" : "kesadaran ritme harian",
      validForLocalDate: date,
      sourceVersion: sky.source,
    };
    context.astroContextRevision = `${date}:${sky.source}:${sky.moonPhaseAngle.toFixed(2)}:${majorTransitTags.join(",")}`;
  } catch {
    // Astro is optional and must never block Wellness.
  }
  try {
    const { getEnvironmentLocationPermission, requestCurrentEnvironmentLocation, getNormalizedEnvironment } = await import("@/lib/environment/service");
    const permission = await getEnvironmentLocationPermission();
    if (permission !== "granted") return context;
    const location = await requestCurrentEnvironmentLocation().catch(() => null);
    if (!location) return context;
    const source = await getNormalizedEnvironment(location).catch(() => null);
    if (!source) return context;
    const weather = source.weather;
    const condition = weather?.condition?.toLowerCase() || "";
    const precipitationLevel: EnvironmentalContext["precipitationLevel"] = /badai|petir|storm/.test(condition)
      ? "storm" : /hujan lebat|gerimis lebat/.test(condition) ? "heavy_rain" : /hujan|gerimis/.test(condition) ? "rain" : "none";
    const temperature = weather?.feelsLikeCelsius ?? weather?.temperatureCelsius;
    const temperatureLevel: EnvironmentalContext["temperatureLevel"] = typeof temperature !== "number"
      ? "unknown" : temperature >= 35 ? "extreme" : temperature >= 31 ? "hot" : "normal";
    const aqi = source.airQuality?.aqi;
    const airQualityLevel: EnvironmentalContext["airQualityLevel"] = typeof aqi !== "number"
      ? "unknown" : aqi > 200 ? "hazardous" : aqi > 100 ? "poor" : aqi > 50 ? "moderate" : "good";
    const wind = weather?.windSpeedKph;
    const windLevel: EnvironmentalContext["windLevel"] = typeof wind !== "number" ? "unknown" : wind >= 60 ? "storm" : wind >= 35 ? "strong" : "normal";
    const hazardActive = source.earthActivity?.status === "Ada aktivitas terdekat";
    Object.assign(context, {
      weatherCondition: weather?.condition,
      precipitationLevel,
      temperatureLevel,
      airQualityLevel,
      windLevel,
      hazardType: hazardActive ? "earthquake" : "none",
      hazardSeverity: hazardActive ? "active" : "none",
      sourceTimestamp: source.fetchedAt,
      sourceLocationScope: source.location.cityOrRegency || source.location.locality,
      environmentContextRevision: `${source.fetchedAt}:${source.location.cityOrRegency || source.location.locality || "unknown"}:${weather?.condition || "unknown"}:${aqi ?? "unknown"}`,
    });
  } catch {
    // Environment is optional; unknown data remains unknown rather than fabricated.
  }
  return context;
}

function getLowestDimension(assessment: AssessmentResult, language: "id" | "en", isEn: boolean = false) {
  const DIMENSIONS = [
    { key: "body" as const, label: { id: "Tubuh", en: "Body" } },
    { key: "emotion" as const, label: { id: "Emosi", en: "Emotion" } },
    { key: "relationship" as const, label: { id: "Relasi", en: "Relationship" } },
    { key: "meaning" as const, label: { id: "Makna", en: "Meaning" } },
    { key: "spirituality" as const, label: { id: "Spirit", en: "Spirituality" } },
  ];
  let minScore = Infinity;
  let minLabel = "";
  for (const dim of DIMENSIONS) {
    const res = assessment[dim.key];
    if (res && typeof res.score === "number" && res.score < minScore) {
      minScore = res.score;
      minLabel = dim.label[isEn ? "en" : language];
    }
  }
  return { label: minLabel, score: minScore };
}

function getMainPracticeHref(type: string, category: string): string {
  const t = type.toLowerCase();
  const c = category.toLowerCase();
  
  if (
    t.includes("journal") || 
    t.includes("reflection") || 
    t.includes("boundary") || 
    t.includes("child") || 
    t.includes("reparenting") || 
    t.includes("enoughness") || 
    t.includes("voice") ||
    c.includes("journal") ||
    c.includes("reflection")
  ) {
    return "/innerwork/journaling";
  }
  if (
    t.includes("yoga") || 
    t.includes("stretch") || 
    t.includes("mobility") || 
    c.includes("yoga")
  ) {
    return "/innerwork/yoga";
  }
  if (
    t.includes("workout") || 
    t.includes("walk") || 
    t.includes("movement") || 
    t.includes("strength") || 
    t.includes("circuit") || 
    c.includes("workout") || 
    c.includes("movement") ||
    c.includes("activity")
  ) {
    return "/innerwork/workout";
  }
  return "/innerwork/meditation";
}

const ENOUGHNESS_ITEMS = [
  { id: "journaling", label: { id: "Journaling", en: "Journaling" } },
  { id: "meditation", label: { id: "Meditasi", en: "Meditation" } },
  { id: "water", label: { id: "Minum Air Putih", en: "Drink Water" } },
  { id: "walk", label: { id: "Jalan Kaki", en: "Mindful Walk" } },
  { id: "sleep", label: { id: "Tidur sebelum 22.30", en: "Sleep before 10:30 PM" } },
] as const;

type EnoughnessState = Record<(typeof ENOUGHNESS_ITEMS)[number]["id"], boolean>;

function createEmptyEnoughnessState(): EnoughnessState {
  return ENOUGHNESS_ITEMS.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {} as EnoughnessState);
}

function getNavigatorLabel(navigator: WellnessNavigatorState | null, isEn: boolean = false): string {
  if (!navigator) return "-";
  if (navigator.mode === "RECOVERY") return isEn ? "Recovery Mode" : "Mode Pemulihan";
  if (navigator.mode === "GROWTH") return isEn ? "Growth Mode" : "Mode Pertumbuhan";
  return isEn ? "Reflection Mode" : "Mode Refleksi";
}

function getMetricLabel(value: number | null | undefined, isEn: boolean = false): string {
  if (typeof value !== "number") return "-";
  if (value >= 8) return isEn ? "Stable" : "Stabil";
  if (value >= 5) return isEn ? "Moderate" : "Cukup";
  if (value >= 3) return isEn ? "Gentle Care Needed" : "Perlu Perhatian Lembut";
  return isEn ? "High Attention Needed" : "Sangat Perlu Perhatian";
}

function WellnessInfoCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <article className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm">
      {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">{eyebrow}</p>}
      <h3 className="mt-1 font-serif text-xl font-bold text-[#4F5E52]">{title}</h3>
      <div className="mt-3 text-sm leading-relaxed text-[#526053]">{children}</div>
    </article>
  );
}

function getRecommendationSearchHref(title: string, domain: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(`${title} ${domain} wellness practice`)}`;
}

function WellnessRecommendationSection({ uid, date, curation, snapshot, onReload, isEn = false }: { uid: string; date: string; curation: WellnessCurationState | null; snapshot: WellnessSnapshot | null; onReload: () => void; isEn?: boolean }) {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const periods = curation ? [curation.packages.morning, curation.packages.afternoon, curation.packages.evening] : [];
  const labels: Record<string, string> = isEn ? { morning: "Morning", afternoon: "Afternoon", evening: "Evening" } : { morning: "Pagi", afternoon: "Siang", evening: "Malam" };
  if (!curation) return <div className="rounded-3xl border border-[#E8E9E5] bg-white p-5 text-sm text-[#7B8776]">{isEn ? "Recommendations are being prepared. Check back after saving today's check-in." : "Rekomendasi sedang disiapkan. Cek kembali setelah menyimpan kabar hari ini."}</div>;
  return <div className="space-y-4">
    <div className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm">
      <p className="text-xs leading-relaxed text-[#526053]">{curation.observation}</p>
      <p className="mt-2 text-xs font-semibold text-[#7B8776]">{curation.contextSynthesis.careFocus}</p>
      {curation.contextSynthesis.selectedContexts.length > 0 && <p className="mt-2 text-xs text-[#7B8776]">{isEn ? "Active context: " : "Konteks aktif: "}{curation.contextSynthesis.selectedContexts.map((item) => item.label).join(", ")}</p>}
    </div>
    {periods.map((pack) => {
      const expanded = expandedId === pack.period;
      const periodDescription = isEn ? `These are recommended practices for the ${labels[pack.period].toLowerCase()}.` : `Ini adalah rekomendasi untuk kegiatan di ${labels[pack.period].toLowerCase()}.`;
      return <div key={pack.period} className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-[#4F5E52]">{labels[pack.period]}</h3>
        {!expanded && <p className="mt-2 text-sm leading-relaxed text-[#526053]">{periodDescription}</p>}
        <button type="button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : pack.period)} className="mt-4 text-xs font-bold text-[#4F5E52] underline underline-offset-4">
          {expanded ? (isEn ? "Hide details" : "Tutup detail") : (isEn ? "View details" : "Lihat detail selengkapnya")}
        </button>
        {expanded && <div className="mt-4 space-y-3 border-t border-[#E8E9E5] pt-4">
          <p className="text-sm leading-relaxed text-[#526053]">{periodDescription}</p>
          {pack.recommendations.length === 0 ? <p className="rounded-2xl bg-[#FCFAF5] p-4 text-sm text-[#7B8776]">{isEn ? "No safe practices matching this period yet." : "Belum ada praktik yang aman dan sesuai untuk periode ini."}</p> : pack.recommendations.map((rec) => {
            const done = curation.completedActivityIds.includes(rec.id);
            return <article key={rec.id} className="rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9AA394]">{rec.humanPriority}</p><h4 className="mt-1 font-serif text-lg font-bold text-[#4F5E52]">{rec.title}</h4></div><span className="text-xs text-[#7B8776]">{rec.estimatedDuration} {isEn ? "min" : "mnt"}</span></div>
              <p className="mt-2 text-sm leading-relaxed text-[#526053]">{rec.description}</p><p className="mt-2 text-xs italic leading-relaxed text-[#7B8776]">{rec.reason}</p>
              <p className="mt-2 text-xs text-[#7B8776]">{isEn ? `Category: ${rec.domain} · Intensity: ${rec.intensity}` : `Kategori: ${rec.domain} · Intensitas: ${rec.intensity}`}</p>
              <p className="mt-2 text-xs leading-relaxed text-[#7B8776]">{rec.safetyAdjustment}</p>
              <div className="mt-4 flex flex-wrap gap-2"><a href={getRecommendationSearchHref(rec.title, rec.domain)} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#4F5E52]/20 px-4 py-2 text-xs font-bold text-[#4F5E52]">{isEn ? "Open Practice" : "Buka Praktik"}</a><button type="button" disabled={done || busyId === rec.id} onClick={async () => { setBusyId(rec.id); await acknowledgeWellnessActivity(uid, date, rec.id, snapshot || undefined, pack.period as "morning" | "afternoon" | "evening").catch(() => undefined); setBusyId(null); onReload(); }} className="rounded-full bg-[#4F5E52] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{done ? (isEn ? "Saved" : "Tersimpan") : busyId === rec.id ? (isEn ? "Saving…" : "Menyimpan…") : (isEn ? "Complete" : "Selesai")}</button></div>
            </article>;
          })}
        </div>}
      </div>;
    })}
  </div>;
}

function WellnessConditionCards({
  intelligence,
  mapping,
  navigator,
  results,
  expanded,
  onToggleExpanded,
  isEn = false,
}: {
  intelligence: WellnessDailyIntelligence | null;
  mapping: WellnessMapping | null;
  navigator: WellnessNavigatorState | null;
  results: AssessmentResult | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  isEn?: boolean;
}) {
  const snapshot = intelligence?.wellnessState?.wellnessSnapshot;
  const lowest = results ? getLowestDimension(results, "id", isEn) : null;
  const dominantTheme = mapping?.results?.[0];
  const energy = snapshot?.metrics.energy;
  const dimensionRows = results
    ? [
        { label: isEn ? "Body" : "Tubuh", value: results.body.score },
        { label: isEn ? "Emotion" : "Emosi", value: results.emotion.score },
        { label: isEn ? "Relationship" : "Relasi", value: results.relationship.score },
        { label: isEn ? "Meaning" : "Makna", value: results.meaning.score },
        { label: isEn ? "Spirituality" : "Spirit", value: results.spirituality.score },
      ]
    : [];

  const dominantLabel = (isEn && dominantTheme?.category ? CATEGORY_METADATA_EN[dominantTheme.category]?.label : null) || dominantTheme?.label || intelligence?.currentIssue.title || (isEn ? "Daily theme not yet available." : "Tema harian belum tersedia.");
  const dominantExplanation = (isEn && dominantTheme?.category ? CATEGORY_METADATA_EN[dominantTheme.category]?.explanation : null) || dominantTheme?.explanation;

  return (
    <div className="space-y-4">
      <WellnessInfoCard title={isEn ? "Your Condition Today" : "Kondisimu Hari Ini"} eyebrow={isEn ? "Summary" : "Ringkasan"}>
        <p>{intelligence?.currentIssue.title || (isEn ? "Bhumi is gently tuning into your daily signals." : "Bhumi sedang membaca sinyal harianmu dengan lembut.")}</p>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52] underline underline-offset-4"
        >
          {expanded ? (isEn ? "Hide Details" : "Tutup Detail") : (isEn ? "View Details" : "Lihat Detail Selengkapnya")}
        </button>
      </WellnessInfoCard>

      {expanded && (
        <div className="space-y-4">
          <WellnessInfoCard title={isEn ? "Today's Priority" : "Prioritas Hari Ini"} eyebrow={isEn ? "Key Focus Area" : "Yang paling perlu dijaga"}>
            <p>
              {lowest
                ? (isEn ? `${lowest.label} is the area calling for the most attention today (${lowest.score}%).` : `${lowest.label} menjadi area yang paling meminta perhatian hari ini (${lowest.score}%).`)
                : (isEn ? "Priorities will appear once daily check-in and mapping are available." : "Prioritas akan muncul setelah check-in dan pemetaan harian tersedia.")}
            </p>
          </WellnessInfoCard>

          <WellnessInfoCard title={isEn ? "Today's Energy" : "Energi Hari Ini"} eyebrow={isEn ? "Rhythm" : "Ritme"}>
            <div className="flex items-center justify-between gap-4">
              <p>{isEn ? "Your body energy indicates: " : "Energi tubuhmu terbaca: "}<strong>{getMetricLabel(energy, isEn)}</strong>.</p>
              {typeof energy === "number" && (
                <span className="shrink-0 rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-bold text-[#4F5E52]">{energy}/10</span>
              )}
            </div>
            <p className="mt-2 text-xs text-[#7B8776]">{isEn ? `Mode: ${getNavigatorLabel(navigator, isEn)}` : `Mode: ${getNavigatorLabel(navigator, isEn)}`}</p>
          </WellnessInfoCard>

          <WellnessInfoCard title={isEn ? "Dimension Mapping" : "Pemetaan Dimensi"} eyebrow={isEn ? "Five Areas" : "Lima area"}>
            {dimensionRows.length ? (
              <div className="space-y-2">
                {dimensionRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 rounded-2xl bg-[#FCFAF5] px-3 py-2">
                    <span className="text-xs font-bold text-[#4F5E52]">{row.label}</span>
                    <span className="text-xs font-bold text-[#7B8776]">{row.value}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>{isEn ? "Dimension mapping is not yet available." : "Pemetaan dimensi belum tersedia."}</p>
            )}
          </WellnessInfoCard>

          <WellnessInfoCard title={isEn ? "Active Theme" : "Tema yang Sedang Aktif"} eyebrow={isEn ? "Pattern" : "Pola"}>
            <p>{dominantLabel}</p>
            {dominantExplanation && (
              <p className="mt-2 text-xs italic text-[#7B8776]">{dominantExplanation}</p>
            )}
          </WellnessInfoCard>
        </div>
      )}
    </div>
  );
}

function EnoughnessChecklist({
  state,
  onToggle,
  isEn = false,
}: {
  state: EnoughnessState;
  onToggle: (id: keyof EnoughnessState) => void;
  isEn?: boolean;
}) {
  const completedCount = ENOUGHNESS_ITEMS.filter((item) => state[item.id]).length;
  const allCompleted = completedCount === ENOUGHNESS_ITEMS.length;

  return (
    <div className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F5E52]">{isEn ? "Today Is Enough" : "Hari Ini Cukup"}</h3>
        <p className="text-sm text-[#7B8776]">{isEn ? "Select the small steps you've taken today." : "Pilih langkah kecil yang sudah kamu lakukan hari ini."}</p>
      </div>

      <div className="mt-5 space-y-3">
        {ENOUGHNESS_ITEMS.map((item) => {
          const checked = state[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-4 text-left transition-all active:scale-[0.99]"
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-sm font-bold ${
                checked ? "border-[#4F5E52] bg-[#4F5E52] text-white" : "border-[#9AA394] bg-white text-transparent"
              }`}>
                ✓
              </span>
              <span className="text-sm font-bold text-[#4F5E52]">{item.label[isEn ? "en" : "id"]}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-[#F5F1E8]/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">{isEn ? "Today's Progress" : "Progress Hari Ini"}</p>
        <p className="mt-1 font-serif text-2xl font-bold text-[#4F5E52]">{completedCount} / {ENOUGHNESS_ITEMS.length}</p>
        {allCompleted && (
          <p className="mt-3 text-sm font-semibold leading-relaxed text-[#4F5E52]">
            {isEn ? (
              <>Today is enough.<br />We continue tomorrow.</>
            ) : (
              <>Hari ini sudah cukup.<br />Besok kita lanjut lagi.</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

function WellnessSummaryMapping({
  mapping,
  navigator,
  results,
  language,
  isExpanded,
  onToggleExpand,
  onRepeat,
}: {
  mapping: WellnessMapping;
  navigator: WellnessNavigatorState | null;
  results: AssessmentResult;
  language: "id" | "en";
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRepeat: () => void;
}) {
  const isEn = isEnlEdition() || language === "en";
  const lowest = getLowestDimension(results, language, isEn);
  const dominantTheme = mapping.results[0];
  const dominantLabel = (isEn && dominantTheme?.category ? CATEGORY_METADATA_EN[dominantTheme.category]?.label : null) || dominantTheme?.label || "-";
  const dominantExplanation = (isEn && dominantTheme?.category ? CATEGORY_METADATA_EN[dominantTheme.category]?.explanation : null) || dominantTheme?.explanation;
  
  const modeLabel = navigator ? (
    isEn
      ? (navigator.mode === "RECOVERY" ? "Recovery Mode" : navigator.mode === "REFLECTION" ? "Reflection Mode" : "Growth Mode")
      : (navigator.mode === "RECOVERY" ? "Mode Pemulihan" : navigator.mode === "REFLECTION" ? "Mode Refleksi" : "Mode Pertumbuhan")
  ) : "-";

  return (
    <div className="bhumi-card p-6 bg-white border-none shadow-sm space-y-4">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">{isEn ? "Active Theme" : "Tema yang Sedang Aktif"}</p>
          <p className="text-sm font-bold text-[#4F5E52] mt-1">{dominantLabel}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">{isEn ? "Main Focus" : "Fokus Perhatian"}</p>
            <p className="text-sm font-bold text-[#4F5E52] mt-1">{lowest.label} ({lowest.score}%)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">{isEn ? "Energy State" : "Kondisi Energi"}</p>
            <p className="text-sm font-bold text-[#4F5E52] mt-1">{modeLabel}</p>
          </div>
        </div>

        {dominantExplanation && (
          <div className="pt-2 border-t border-[#F5F1E8]">
            <p className="text-xs text-[#526053] leading-relaxed italic">
              {dominantExplanation}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#F5F1E8]">
        <button
          onClick={onToggleExpand}
          className="text-xs font-bold text-[#4F5E52] underline hover:text-[#4F5E52]/80 transition-colors"
        >
          {isExpanded 
            ? (isEn ? "Hide Details" : "Tutup Detail")
            : (isEn ? "View Details" : "Lihat Detail")}
        </button>
        <button
          onClick={onRepeat}
          className="text-[10px] font-bold text-[#7B8776] uppercase tracking-widest underline hover:text-[#4F5E52] transition-colors"
        >
          {isEn ? "Repeat Reflection" : "Lakukan Refleksi Ulang"}
        </button>
      </div>
    </div>
  );
}

export function WellnessPageClient() {
  const auth = useAuth();
  const isEn = false;
  const [appNow, setAppNow] = React.useState(() => new Date());
  const effectiveLang: "id" | "en" = "id";
  const t = translations["id"];
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;

  const [intelligence, setIntelligence] = React.useState<WellnessDailyIntelligence | null>(null);
  const [decision, setDecision] = React.useState<InnerworkDailyDecision | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [checkInCompleted, setCheckInCompleted] = React.useState(false);
  const [curation, setCuration] = React.useState<WellnessCurationState | null>(null);
  

  const PRACTICES = React.useMemo(() => {
    const issue = intelligence?.currentIssue.key;
    const theme = intelligence?.currentIssue.title;

    const getThemedHref = (base: string, category: ZoneBPracticeCategory, label: string) => {
      if (!intelligence || !issue || !theme) return base;
      return buildZoneBHref(base, {
        issue,
        practiceId: `hub-${category}`,
        practiceCategory: category,
        sourceTheme: theme,
        title: `${label}: ${theme}`,
        durationMinutes: 10,
      });
    };

    const practices = [
      { id: "journaling", label: t.innerwork.journaling, href: getThemedHref("/innerwork/journaling", "journaling", t.innerwork.journaling), Icon: BookOpen },
      { id: "meditation", label: t.innerwork.meditation, href: getThemedHref("/innerwork/meditation", "meditation", t.innerwork.meditation), Icon: Brain },
      { id: "yoga", label: t.innerwork.yoga, href: getThemedHref("/innerwork/yoga", "yoga", t.innerwork.yoga), Icon: Flower2 },
      { id: "workout", label: t.innerwork.workout, href: getThemedHref("/innerwork/workout", "workout", t.innerwork.workout), Icon: Dumbbell },
      { id: "audio", label: t.innerwork.audio, href: "/innerwork/audio-healing", Icon: Music },
      { id: "herbal", label: t.innerwork.herbal, href: getThemedHref("/innerwork/herbal", "healthyFood", t.innerwork.herbal), Icon: Utensils },
      { id: "manifestation", label: t.innerwork.manifestasi, href: getThemedHref("/innerwork/manifestasi", "manifestation", t.innerwork.manifestasi), Icon: Activity },
    ];
    const context = curation?.contextSynthesis.activeContext.toLowerCase() || "";
    const restorative = curation?.contextSynthesis.safetyLevel === "restorative";
    const environment = curation?.environment;
    const unsafeOutdoor = environment?.precipitationLevel === "heavy_rain" || environment?.precipitationLevel === "storm" || environment?.windLevel === "strong" || environment?.temperatureLevel === "extreme" || environment?.airQualityLevel === "poor" || environment?.airQualityLevel === "hazardous";
    const activeHazard = environment?.hazardSeverity === "active";
    const akashiPatterns = curation?.akashiContext?.activatedPatternIds || [];
    const localDay = intelligence?.date ? new Date(`${intelligence.date}T12:00:00Z`).getUTCDay() : null;
    const isWeekend = localDay === 0 || localDay === 6;
    const hasContext = restorative || isWeekend || akashiPatterns.length > 0 || context.includes("kesehatan") || context.includes("ekonomi") || context.includes("pekerjaan") || context.includes("pasangan") || context.includes("perceraian") || context.includes("hubungan");
    const contextualOrder = activeHazard || restorative || context.includes("kesehatan")
      ? ["meditation", "audio", "journaling", "herbal", "yoga", "manifestation", "workout"]
      : unsafeOutdoor
        ? ["meditation", "journaling", "audio", "herbal", "yoga", "manifestation", "workout"]
      : isWeekend && curation?.contextSynthesis.capacityLevel !== "low"
        ? ["meditation", "yoga", "journaling", "audio", "herbal", "manifestation", "workout"]
      : context.includes("ekonomi") || context.includes("pekerjaan")
        ? ["journaling", "meditation", "audio", "manifestation", "herbal", "yoga", "workout"]
      : context.includes("pasangan") || context.includes("perceraian") || context.includes("hubungan")
          ? ["journaling", "meditation", "audio", "manifestation", "herbal", "yoga", "workout"]
          : akashiPatterns.includes("overthinking") || akashiPatterns.includes("grounding_need")
            ? ["meditation", "journaling", "yoga", "audio", "manifestation", "herbal", "workout"]
            : akashiPatterns.includes("love_block") || akashiPatterns.includes("emotional_suppression")
              ? ["journaling", "meditation", "audio", "yoga", "manifestation", "herbal", "workout"]
              : akashiPatterns.includes("over_responsibility") || akashiPatterns.includes("self_sabotage")
                ? ["meditation", "audio", "journaling", "manifestation", "herbal", "yoga", "workout"]
          : practices.map((practice) => practice.id);
    const rank = new Map(contextualOrder.map((id, index) => [id, index]));
    return practices.sort((a, b) => (rank.get(a.id) ?? 99) - (rank.get(b.id) ?? 99)).map((practice, index) => ({
      ...practice,
      contextual: hasContext && index < 2,
    }));
  }, [curation, intelligence, t]);

  // Results & assessment state
  const [assessmentStage, setAssessmentStage] = React.useState<"intro" | "questions" | "results">("intro");
  const [mapping, setMapping] = React.useState<WellnessMapping | null>(null);
  const [navigator, setNavigator] = React.useState<WellnessNavigatorState | null>(null);
  const [support, setSupport] = React.useState<SupportEngineState | null>(null);
  const [results, setResults] = React.useState<AssessmentResult | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [startFresh, setStartFresh] = React.useState(false);
  const [enoughnessState, setEnoughnessState] = React.useState<EnoughnessState>(() => createEmptyEnoughnessState());
  const [conditionExpanded, setConditionExpanded] = React.useState(false);

  const isBaselinePending = !auditUser && (!auth?.userProfile?.baselineWellnessCompleted || auth?.userProfile?.baselineWellnessProfile?.version !== 'V3_BASELINE');

  React.useEffect(() => {
    const interval = window.setInterval(() => setAppNow(new Date()), APP_TIME_REFRESH_MS);
    return () => window.clearInterval(interval);
  }, []);
  const activeUid = auth?.user?.uid || (auditUser ? `${auditUser}_uid` : "");

  const loadDailyIntelligence = React.useCallback(async () => {
      if (!auth?.user?.uid && !auditUser) return;
      try {
        let [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint(),
        ]);
        if (!profile && auth?.userProfile) {
          profile = auth.userProfile as any;
        }
        if (auditUser && (!profile || !blueprint)) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          profile = profile || getMockProfile(auditUser) as any;
          blueprint = blueprint || getMockBlueprint(auditUser) as any;
        }
        
        if (!profile) return;
        const result = await loadWellnessDailyIntelligence({
          uid: activeUid,
          profile,
          blueprint,
        });
        setIntelligence(result);
        setDecision(buildInnerworkDailyDecision(result.recommendationInput));

        const snapshot = result.wellnessState?.wellnessSnapshot as WellnessSnapshot | undefined;
        if (snapshot?.checkInCompleted) {
          const dailyContext = await loadCanonicalWellnessContext(result.date);
          const akashiContext = buildAkashiWellnessContext(profile, snapshot);
          const curated = await loadWellnessCuration(
            activeUid,
            result.date,
            snapshot,
            undefined,
            dailyContext,
            akashiContext,
            result.journeyIntelligence.recentPracticePatterns,
          ).catch(() => null);
          setCuration(curated);
        } else {
          setCuration(null);
        }

        const completed = result.wellnessState?.wellnessSnapshot?.checkInCompleted || false;
        setCheckInCompleted(completed);

        if (result.mapping) {
          setMapping(result.mapping);
          setResults(result.mapping.assessment);
          const navState = wellnessNavigatorEngine.calculateNavigator(result.mapping);
          const supState = wellnessSupportEngine.calculateSupportPath(result.mapping);
          setNavigator(navState);
          setSupport(supState);
          setAssessmentStage("results");
        }
      } finally {
        setLoading(false);
      }
  }, [auth?.user?.uid, auditUser, activeUid]);

  const handleCheckInCompleted = React.useCallback(() => {
    setCheckInCompleted(true);
    void loadDailyIntelligence();
  }, [loadDailyIntelligence]);

  React.useEffect(() => {
    if (auth?.authStateResolved && (auth?.user?.uid || auditUser)) void loadDailyIntelligence();
  }, [auth?.authStateResolved, auth?.user?.uid, auditUser, loadDailyIntelligence]);

  const handleRepeat = () => {
    setAssessmentStage("intro");
    setStartFresh(true);
    setMapping(null);
    setNavigator(null);
    setSupport(null);
    setResults(null);
  };

  React.useEffect(() => {
    const todayRecord = intelligence?.journeyMemory.last30Days.find((record) => record.appDate === intelligence.date || record.date === intelligence.date);
    const savedChecklist = todayRecord?.wellnessState?.enoughnessChecklist;
    if (!savedChecklist || typeof savedChecklist !== "object") {
      setEnoughnessState(createEmptyEnoughnessState());
      return;
    }

    const savedItems = (savedChecklist as { items?: Record<string, boolean> }).items;
    if (!savedItems) {
      setEnoughnessState(createEmptyEnoughnessState());
      return;
    }

    setEnoughnessState(ENOUGHNESS_ITEMS.reduce((acc, item) => {
      acc[item.id] = Boolean(savedItems[item.id]);
      return acc;
    }, {} as EnoughnessState));
  }, [intelligence?.date, intelligence?.journeyMemory.last30Days]);

  const handleEnoughnessToggle = React.useCallback((id: keyof EnoughnessState) => {
    if (!activeUid || !intelligence?.date) return;

    setEnoughnessState((current) => {
      const next = { ...current, [id]: !current[id] };
      const completedCount = ENOUGHNESS_ITEMS.filter((item) => next[item.id]).length;
      const checklistPayload = {
        items: next,
        completedCount,
        total: ENOUGHNESS_ITEMS.length,
        completed: completedCount === ENOUGHNESS_ITEMS.length,
        updatedAt: new Date().toISOString(),
      };

      void (async () => {
        const existingRecord = await journeyRepository.getDailyRecord(activeUid, intelligence.date).catch(() => null);
        await journeyRepository.updateDailyRecord(activeUid, intelligence.date, {
          dominantIssue: intelligence.currentIssue.key,
          issueCategory: intelligence.currentIssue.title,
          navigatorMode: navigator?.mode || "REFLECTION",
          dailyScanCompleted: true,
          wellnessState: {
            ...(existingRecord?.wellnessState ?? {}),
            enoughnessChecklist: checklistPayload,
          },
        }).catch((error) => {
          console.warn("[WELLNESS_ENOUGHNESS_JOURNEY_UPDATE_FAILED]", error);
        });
      })();

      return next;
    });
  }, [activeUid, intelligence, navigator?.mode]);

  if (loading) {
    return <main className="min-h-screen bg-[#FCFAF5] grid place-items-center text-[#4F5E52]">{t.wellness.preparing}</main>;
  }

  

  // Focus layout for answering questions
  if (assessmentStage === "questions") {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 animate-in fade-in duration-500">
        <AppNav />
        <div className="mx-auto max-w-lg space-y-12">
          <BhumiPageHeader />
          <WellnessAssessmentFlow
            key={startFresh ? "fresh" : "saved"}
            uid={activeUid}
            language={effectiveLang}
            startFresh={startFresh}
            initialStage={assessmentStage === "questions" ? "questions" : "intro"}
            onResultsLoaded={async (m, n, s, r) => {
              setMapping(m);
              setNavigator(n);
              setSupport(s);
              setResults(r);
              setAssessmentStage("results");
              if (auth?.refreshUserProfile) {
                await auth.refreshUserProfile();
              }
            }}
            onStageChange={setAssessmentStage}
          />
        </div>
      </main>
    );
  }

  // Baseline Lock Flow
  if (isBaselinePending) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 animate-in fade-in duration-500">
        <AppNav />
        <div className="mx-auto max-w-lg space-y-12">
          <BhumiPageHeader />
          <header className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">{t.wellness.title}</p>
            <h1 className="mt-2 font-serif text-3xl text-[#4F5E52]">{t.wellness.headerTitle}</h1>
            <p className="mt-2 text-sm text-[#7B8776]">{t.wellness.subtitle}</p>
          </header>

          <WellnessSection number="1" title={isEn ? "Your Initial Mapping" : "Pemetaan Awal Dirimu"} isEn={isEn}>
            <WellnessAssessmentFlow
              key="baseline"
              uid={activeUid}
              language={effectiveLang}
              startFresh={true}
              onResultsLoaded={async (m, n, s, r) => {
                setMapping(m);
                setNavigator(n);
                setSupport(s);
                setResults(r);
                setAssessmentStage("results");
                if (auth?.refreshUserProfile) {
                  await auth.refreshUserProfile();
                }
              }}
            />
          </WellnessSection>
        </div>
      </main>
    );
  }

  // Daily Scan Lock Flow
  if (!checkInCompleted) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 animate-in fade-in duration-500">
        <AppNav />
        <div className="mx-auto max-w-lg space-y-12">
          <BhumiPageHeader />
          <header className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">{t.wellness.title}</p>
            <h1 className="mt-2 font-serif text-3xl text-[#4F5E52]">{t.wellness.headerTitle}</h1>
            <p className="mt-2 text-sm text-[#7B8776]">{t.wellness.subtitle}</p>
          </header>

          <WellnessSection number="1" title={t.wellness.checkIn} isEn={isEn}>
            <div className="space-y-4">
              <WellnessCheckInCard
                uid={activeUid}
                initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
                onCompleted={handleCheckInCompleted}
                isEn={isEn}
              />
            </div>
          </WellnessSection>
        </div>
      </main>
    );
  }

  // Fully Unlocked Flow
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 animate-in fade-in duration-500">
      <AppNav />
      <div className="mx-auto max-w-lg space-y-12">
        <BhumiPageHeader />
        <header className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">{t.wellness.title}</p>
          <h1 className="mt-2 font-serif text-3xl text-[#4F5E52]">{t.wellness.headerTitle}</h1>
          <p className="mt-2 text-sm text-[#7B8776]">{t.wellness.subtitle}</p>
        </header>

        {/* Section 1: Check-in Hari Ini (Completed state) */}
        <WellnessSection number="1" title={t.wellness.checkIn} isEn={isEn}>
          <div className="space-y-4">
            <WellnessCheckInCard
              uid={activeUid}
              initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
              onCompleted={handleCheckInCompleted}
              isEn={isEn}
            />
            {intelligence?.wellnessState?.emotionalWord && (
              <p className="rounded-2xl bg-white p-4 text-sm text-[#526053] shadow-sm">
                {isEn ? "Your emotional state: " : "Kondisi emosimu: "}<strong>{intelligence.wellnessState.emotionalWord}</strong>
              </p>
            )}
          </div>
        </WellnessSection>

        {/* Section 2: Kondisimu Hari Ini */}
        <WellnessSection number="2" title={isEn ? "Your Condition Today" : "Kondisimu Hari Ini"} isEn={isEn}>
          <WellnessConditionCards
            intelligence={intelligence}
            mapping={mapping}
            navigator={navigator}
            results={results}
            expanded={conditionExpanded}
            onToggleExpanded={() => setConditionExpanded((value) => !value)}
            isEn={isEn}
          />
          {curation && <div className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm"><p className="text-sm leading-relaxed text-[#526053]">{curation.contextSynthesis.explanation}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#7B8776]"><span>{isEn ? "Condition: " : "Kondisi: "}{curation.contextSynthesis.primaryCondition}</span><span>{isEn ? "Capacity: " : "Kapasitas: "}{(isEn ? { low: "Low", medium: "Moderate", high: "High" } : { low: "Rendah", medium: "Sedang", high: "Tinggi" })[curation.contextSynthesis.capacityLevel]}</span><span className="col-span-2">{isEn ? "Context: " : "Konteks: "}{curation.contextSynthesis.activeContext}</span></div><p className="mt-2 text-xs font-semibold text-[#7B8776]">{curation.contextSynthesis.careFocus}</p></div>}
        </WellnessSection>

        {/* Section 3: Rekomendasi Hari Ini */}
        <WellnessSection number="3" title={t.wellness.recommended} isEn={isEn}>
          <WellnessRecommendationSection uid={activeUid} date={intelligence!.date} curation={curation} snapshot={intelligence!.wellnessState?.wellnessSnapshot || null} onReload={() => void loadDailyIntelligence()} isEn={isEn} />
        </WellnessSection>

        {/* Section 4: Praktik Tambahan */}
        <WellnessSection number="4" title={t.wellness.additional} isEn={isEn}>
          {intelligence?.currentIssue?.title && (
            <p className="text-xs font-medium leading-relaxed text-[#7B8776]">
              {isEn ? "Your current practice focus: " : "Pusat latihanmu saat ini: "}<span className="font-bold text-[#4F5E52]">{intelligence.currentIssue.title}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {PRACTICES.map(({ label, href, Icon, contextual }) => (
              <Link key={label} href={href} className={`rounded-2xl border p-5 text-center shadow-sm transition-all active:scale-[0.98] group ${contextual ? "border-[#4F5E52]/40 bg-[#F5F1E8]" : "border-[#E8E9E5] bg-white hover:border-[#4F5E52]/20"}`}>
                <Icon size={22} className="mx-auto text-[#4F5E52] group-hover:scale-105 transition-transform" />
                <span className="mt-3 block text-xs font-bold text-[#4F5E52]">{label}</span>
                {contextual && <span className="mt-2 block text-[9px] font-semibold text-[#7B8776]">{isEn ? "Relevant for today's condition" : "Relevan untuk kondisi hari ini"}</span>}
              </Link>
            ))}
          </div>
        </WellnessSection>

        {/* Section 5: Dukungan untukmu */}
        <WellnessSection number="5" title={t.wellness.support} isEn={isEn}>
          <div className="space-y-3">
            <SupportCard
              title={isEn ? "Bhumi Inner Circle Community" : "Sobat Mistis Bhumi Amartya"}
              description={isEn ? "Learn, grow, and walk alongside the Bhumi community." : "Belajar, bertumbuh, dan berjalan bersama komunitas Bhumi."}
              href={COMMUNITY_CONFIG.whatsappLink}
              status="ACTIVE"
              Icon={Users}
              isEn={isEn}
            />
            <SupportCard
              title="Bhumi Amartya"
              description={isEn ? "Visit Bhumi's web space for guidance, updates, and resources." : "Kunjungi ruang web Bhumi untuk informasi, pembaruan, dan pintu masuk pendampingan."}
              href="https://bhumiamartya.my.id/"
              action={isEn ? "Open bhumiamartya.my.id" : "Buka bhumiamartya.my.id"}
              Icon={Sparkles}
              isEn={isEn}
            />
            <SupportCard
              title={isEn ? "Nearby Professional Care" : "Psikolog Terdekat"}
              description={isEn ? "Find psychological or counseling services available in your local area." : "Temukan layanan psikolog yang tersedia di area terdekatmu."}
              href={isEn ? "https://www.google.com/search?q=psychologist+counselor+near+me" : "https://www.google.com/search?q=psikolog+terdekat"}
              action={isEn ? "Find Nearby Care" : "Cari Psikolog Terdekat"}
              Icon={BriefcaseMedical}
              isEn={isEn}
            />
            <SupportCard
              title={isEn ? "Bhumi Guidance Network" : "Mitra Pendamping Bhumi"}
              description={isEn ? "A curated network of practitioners and guides is in preparation." : "Jaringan pendamping terkurasi sedang dipersiapkan."}
              status="COMING SOON"
              locked
              Icon={HeartHandshake}
              isEn={isEn}
            />
            <SupportCard
              title="Lentera Sintas Indonesia"
              description={isEn ? "A safe space to learn, share, and heal together. Educational mental health resources, survivor community support, and recovery spaces." : "Ruang aman untuk belajar, berbagi, dan bertumbuh bersama para penyintas. Berisi edukasi kesehatan mental, dukungan komunitas, dan kegiatan pemulihan berbasis pengalaman penyintas."}
              href="https://www.instagram.com/lentera_id/"
              status="Trauma Recovery & Survivor Support"
              Icon={HeartHandshake}
              isEn={isEn}
            />
            <SupportCard
              title={isEn ? "Sejiwa Mental Health Support" : "Sejiwa"}
              description={isEn ? "Access mental health education, guidance, and support services from Sejiwa." : "Akses informasi dan dukungan kesehatan mental dari Sejiwa."}
              href="https://sejiwa.org/"
              Icon={HeartHandshake}
              isEn={isEn}
            />
            <SupportCard
              title={isEn ? "National Health Services (JKN / SATUSEHAT)" : "JKN Mobile / SATUSEHAT"}
              description={isEn ? "Access national healthcare services and personal health records." : "Akses layanan kesehatan nasional dan informasi kesehatanmu."}
              href="https://www.bpjs-kesehatan.go.id/"
              secondaryHref="https://satusehat.kemkes.go.id/"
              Icon={BriefcaseMedical}
              isEn={isEn}
            />
          </div>
        </WellnessSection>
      </div>
    </main>
  );
}

function WellnessSection({ number, title, isEn = false, children }: { number: string; title: string; isEn?: boolean; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">
          {isEn ? `Part ${number}` : `Bagian ${number}`}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-[#4F5E52]">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function SupportCard(props: {
  title: string; description: string; href?: string; secondaryHref?: string; action?: string;
  status?: string; locked?: boolean; isEn?: boolean; Icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const isMultiLink = Boolean(props.secondaryHref);

  const cardContent = (
    <div className="flex items-start gap-4 rounded-3xl border border-[#E8E9E5] bg-white p-5">
      <div className="rounded-2xl bg-[#F5F1E8] p-3 text-[#4F5E52]"><props.Icon size={20} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#4F5E52]">{props.title}</h3>
          {props.status && <span className="rounded-full bg-[#F5F1E8] px-2 py-1 text-[8px] font-bold text-[#7B8776]">{props.status}</span>}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#7B8776]">{props.description}</p>

        {isMultiLink ? (
          <div className="mt-3 flex gap-4">
            {props.href && (
              <a href={props.href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#4F5E52] flex items-center gap-1 hover:underline">
                {props.isEn ? "Open JKN Mobile" : "Buka JKN Mobile"} <ExternalLink size={11} className="inline" />
              </a>
            )}
            {props.secondaryHref && (
              <a href={props.secondaryHref} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#4F5E52] flex items-center gap-1 hover:underline">
                {props.isEn ? "Open SATUSEHAT" : "Buka SATUSEHAT"} <ExternalLink size={11} className="inline" />
              </a>
            )}
          </div>
        ) : (
          <>
            {props.action && <p className="mt-3 text-xs font-bold text-[#4F5E52]">{props.action}</p>}
          </>
        )}
      </div>
      {!isMultiLink && (
        props.locked ? <Lock size={16} className="text-[#9AA394]" /> : props.href ? <ExternalLink size={16} className="text-[#9AA394]" /> : null
      )}
    </div>
  );

  if (isMultiLink) {
    return cardContent;
  }

  return props.href && !props.locked
    ? <a href={props.href} target="_blank" rel="noopener noreferrer" className="block">{cardContent}</a>
    : cardContent;
}

