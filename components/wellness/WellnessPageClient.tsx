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
import type { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { WellnessNavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import type { SupportEngineState } from "@/lib/engines/wellnessSupportEngine";
import type { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";

function getLowestDimension(assessment: AssessmentResult, language: "id" | "en") {
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
      minLabel = dim.label[language];
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
  { id: "journaling", label: "Journaling" },
  { id: "meditation", label: "Meditasi" },
  { id: "water", label: "Minum Air Putih" },
  { id: "walk", label: "Jalan Kaki" },
  { id: "sleep", label: "Tidur sebelum 22.30" },
] as const;

type EnoughnessState = Record<(typeof ENOUGHNESS_ITEMS)[number]["id"], boolean>;

function createEmptyEnoughnessState(): EnoughnessState {
  return ENOUGHNESS_ITEMS.reduce((acc, item) => {
    acc[item.id] = false;
    return acc;
  }, {} as EnoughnessState);
}

function getNavigatorLabel(navigator: WellnessNavigatorState | null): string {
  if (!navigator) return "-";
  if (navigator.mode === "RECOVERY") return "Pemulihan";
  if (navigator.mode === "GROWTH") return "Pertumbuhan";
  return "Refleksi";
}

function getMetricLabel(value: number | null | undefined): string {
  if (typeof value !== "number") return "-";
  if (value >= 8) return "Stabil";
  if (value >= 5) return "Cukup";
  if (value >= 3) return "Perlu dilembutkan";
  return "Butuh pemulihan";
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

function WellnessConditionCards({
  intelligence,
  mapping,
  navigator,
  results,
  expanded,
  onToggleExpanded,
}: {
  intelligence: WellnessDailyIntelligence | null;
  mapping: WellnessMapping | null;
  navigator: WellnessNavigatorState | null;
  results: AssessmentResult | null;
  expanded: boolean;
  onToggleExpanded: () => void;
}) {
  const snapshot = intelligence?.wellnessState?.wellnessSnapshot;
  const lowest = results ? getLowestDimension(results, "id") : null;
  const dominantTheme = mapping?.results?.[0];
  const energy = snapshot?.metrics.energy;
  const dimensionRows = results
    ? [
        { label: "Tubuh", value: results.body.score },
        { label: "Emosi", value: results.emotion.score },
        { label: "Relasi", value: results.relationship.score },
        { label: "Makna", value: results.meaning.score },
        { label: "Spirit", value: results.spirituality.score },
      ]
    : [];

  return (
    <div className="space-y-4">
      <WellnessInfoCard title="Kondisimu Hari Ini" eyebrow="Ringkasan">
        <p>{intelligence?.currentIssue.title || "Bhumi sedang membaca sinyal harianmu dengan lembut."}</p>
        <button
          type="button"
          onClick={onToggleExpanded}
          className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#4F5E52] underline underline-offset-4"
        >
          {expanded ? "Tutup penjelasan" : "Penjelasan lebih"}
        </button>
      </WellnessInfoCard>

      {expanded && (
        <div className="space-y-4">
          <WellnessInfoCard title="Prioritas Hari Ini" eyebrow="Yang paling perlu dijaga">
            <p>
              {lowest
                ? `${lowest.label} menjadi area yang paling meminta perhatian hari ini (${lowest.score}%).`
                : "Prioritas akan muncul setelah check-in dan pemetaan harian tersedia."}
            </p>
          </WellnessInfoCard>

          <WellnessInfoCard title="Energi Hari Ini" eyebrow="Ritme">
            <div className="flex items-center justify-between gap-4">
              <p>Energi tubuhmu terbaca: <strong>{getMetricLabel(energy)}</strong>.</p>
              {typeof energy === "number" && (
                <span className="shrink-0 rounded-full bg-[#F5F1E8] px-3 py-1 text-xs font-bold text-[#4F5E52]">{energy}/10</span>
              )}
            </div>
            <p className="mt-2 text-xs text-[#7B8776]">Mode: {getNavigatorLabel(navigator)}</p>
          </WellnessInfoCard>

          <WellnessInfoCard title="Pemetaan Dimensi" eyebrow="Lima area">
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
              <p>Pemetaan dimensi belum tersedia.</p>
            )}
          </WellnessInfoCard>

          <WellnessInfoCard title="Tema yang Sedang Aktif" eyebrow="Pola">
            <p>{dominantTheme?.label || intelligence?.currentIssue.title || "Tema harian belum tersedia."}</p>
            {dominantTheme?.explanation && (
              <p className="mt-2 text-xs italic text-[#7B8776]">{dominantTheme.explanation}</p>
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
}: {
  state: EnoughnessState;
  onToggle: (id: keyof EnoughnessState) => void;
}) {
  const completedCount = ENOUGHNESS_ITEMS.filter((item) => state[item.id]).length;
  const allCompleted = completedCount === ENOUGHNESS_ITEMS.length;

  return (
    <div className="rounded-3xl border border-[#E8E9E5] bg-white p-5 shadow-sm">
      <div className="space-y-1">
        <h3 className="font-serif text-2xl font-bold text-[#4F5E52]">Hari Ini Cukup</h3>
        <p className="text-sm text-[#7B8776]">Pilih langkah kecil yang sudah kamu lakukan hari ini.</p>
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
              <span className="text-sm font-bold text-[#4F5E52]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-[#F5F1E8]/70 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Progress Hari Ini</p>
        <p className="mt-1 font-serif text-2xl font-bold text-[#4F5E52]">{completedCount} / {ENOUGHNESS_ITEMS.length}</p>
        {allCompleted && (
          <p className="mt-3 text-sm font-semibold leading-relaxed text-[#4F5E52]">
            Hari ini sudah cukup.<br />
            Besok kita lanjut lagi.
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
  const lowest = getLowestDimension(results, language);
  const dominantTheme = mapping.results[0];
  
  const modeLabel = navigator ? (
    language === "id" 
      ? (navigator.mode === "RECOVERY" ? "Pemulihan (Recovery)" : navigator.mode === "REFLECTION" ? "Refleksi (Reflection)" : "Pertumbuhan (Growth)")
      : (navigator.mode === "RECOVERY" ? "Recovery Mode" : navigator.mode === "REFLECTION" ? "Reflection Mode" : "Growth Mode")
  ) : "-";

  return (
    <div className="bhumi-card p-6 bg-white border-none shadow-sm space-y-4">
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Tema Dominan</p>
          <p className="text-sm font-bold text-[#4F5E52] mt-1">{dominantTheme ? dominantTheme.label : "-"}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Area Perhatian Utama</p>
            <p className="text-sm font-bold text-[#4F5E52] mt-1">{lowest.label} ({lowest.score}%)</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Energi Umum</p>
            <p className="text-sm font-bold text-[#4F5E52] mt-1">{modeLabel}</p>
          </div>
        </div>

        {dominantTheme?.explanation && (
          <div className="pt-2 border-t border-[#F5F1E8]">
            <p className="text-xs text-[#526053] leading-relaxed italic">
              {dominantTheme.explanation}
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
            ? (language === "id" ? "[Tutup Detail]" : "[Lihat Detail]")
            : (language === "id" ? "[Lihat Detail]" : "[View Details]")}
        </button>
        <button
          onClick={onRepeat}
          className="text-[10px] font-bold text-[#7B8776] uppercase tracking-widest underline hover:text-[#4F5E52] transition-colors"
        >
          {language === "id" ? "Ulangi Refleksi" : "Repeat Reflection"}
        </button>
      </div>
    </div>
  );
}

export function WellnessPageClient() {
  const auth = useAuth();
  const { language } = useLanguage();
  const [appNow, setAppNow] = React.useState(() => new Date());
  const t = translations[language];
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;

  const [intelligence, setIntelligence] = React.useState<WellnessDailyIntelligence | null>(null);
  const [decision, setDecision] = React.useState<InnerworkDailyDecision | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [checkInCompleted, setCheckInCompleted] = React.useState(false);
  

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

    return [
      { label: t.innerwork.journaling, href: getThemedHref("/innerwork/journaling", "journaling", t.innerwork.journaling), Icon: BookOpen },
      { label: t.innerwork.meditation, href: getThemedHref("/innerwork/meditation", "meditation", t.innerwork.meditation), Icon: Brain },
      { label: t.innerwork.yoga, href: getThemedHref("/innerwork/yoga", "yoga", t.innerwork.yoga), Icon: Flower2 },
      { label: t.innerwork.workout, href: getThemedHref("/innerwork/workout", "workout", t.innerwork.workout), Icon: Dumbbell },
      { label: t.innerwork.audio, href: "/innerwork/audio-healing", Icon: Music },
      { label: t.innerwork.herbal, href: "/innerwork/herbal", Icon: Utensils },
      { label: t.innerwork.manifestasi, href: getThemedHref("/innerwork/manifestasi", "manifestation" as any, t.innerwork.manifestasi), Icon: Activity },
    ];
  }, [intelligence, t, language]);

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
            language={language}
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

          <WellnessSection number="1" title="Baseline Scan">
            <WellnessAssessmentFlow
              key="baseline"
              uid={activeUid}
              language={language}
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

          <WellnessSection number="1" title={t.wellness.checkIn}>
            <div className="space-y-4">
              <WellnessCheckInCard
                uid={activeUid}
                initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
                onCompleted={handleCheckInCompleted}
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
        <WellnessSection number="1" title={t.wellness.checkIn}>
          <div className="space-y-4">
            <WellnessCheckInCard
              uid={activeUid}
              initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
              onCompleted={handleCheckInCompleted}
            />
            {intelligence?.wellnessState?.emotionalWord && (
              <p className="rounded-2xl bg-white p-4 text-sm text-[#526053] shadow-sm">
                Emosi saat ini: <strong>{intelligence.wellnessState.emotionalWord}</strong>
              </p>
            )}
          </div>
        </WellnessSection>

        {/* Section 2: Kondisimu Hari Ini */}
        <WellnessSection number="2" title="Kondisimu Hari Ini">
          <WellnessConditionCards
            intelligence={intelligence}
            mapping={mapping}
            navigator={navigator}
            results={results}
            expanded={conditionExpanded}
            onToggleExpanded={() => setConditionExpanded((value) => !value)}
          />
        </WellnessSection>

        {/* Section 3: Hari Ini Cukup */}
        <WellnessSection number="3" title="Hari Ini Cukup">
          <EnoughnessChecklist state={enoughnessState} onToggle={handleEnoughnessToggle} />
        </WellnessSection>

        {/* Section 4: Praktik Tambahan */}
        <WellnessSection number="4" title={t.wellness.additional}>
          {intelligence?.currentIssue?.title && (
            <p className="text-xs font-medium leading-relaxed text-[#7B8776]">
              Fokus praktik saat ini: <span className="font-bold text-[#4F5E52]">{intelligence.currentIssue.title}</span>
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {PRACTICES.map(({ label, href, Icon }) => (
              <Link key={label} href={href} className="rounded-2xl border border-[#E8E9E5] bg-white p-5 text-center shadow-sm hover:border-[#4F5E52]/20 transition-all active:scale-[0.98] group">
                <Icon size={22} className="mx-auto text-[#4F5E52] group-hover:scale-105 transition-transform" />
                <span className="mt-3 block text-xs font-bold text-[#4F5E52]">{label}</span>
              </Link>
            ))}
          </div>
        </WellnessSection>

        {/* Section 5: Dukungan untukmu */}
        <WellnessSection number="5" title={t.wellness.support}>
          <div className="space-y-3">
            <SupportCard title="Sobat Mistis Bhumi Amartya" description="Belajar, bertumbuh, dan berjalan bersama komunitas Bhumi." href={COMMUNITY_CONFIG.whatsappLink} status="ACTIVE" Icon={Users} />
            <SupportCard title="Bhumi Amartya" description="Kunjungi ruang web Bhumi untuk informasi, pembaruan, dan pintu masuk pendampingan." href="https://bhumiamartya.my.id/" action="Buka bhumiamartya.my.id" Icon={Sparkles} />
            <SupportCard title="Psikolog Terdekat" description="Temukan layanan psikolog yang tersedia di area terdekatmu." href="https://www.google.com/search?q=psikolog+terdekat" action="Cari Psikolog Terdekat" Icon={BriefcaseMedical} />
            <SupportCard title="Mitra Pendamping Bhumi" description="Jaringan pendamping terkurasi sedang dipersiapkan." status="COMING SOON" locked Icon={HeartHandshake} />
            <SupportCard title="Lentera Sintas Indonesia" description="Ruang aman untuk belajar, berbagi, dan bertumbuh bersama para penyintas. Berisi edukasi kesehatan mental, dukungan komunitas, dan kegiatan pemulihan berbasis pengalaman penyintas." href="https://www.instagram.com/lentera_id/" status="Trauma Recovery & Survivor Support" Icon={HeartHandshake} />
            <SupportCard title="Sejiwa" description="Akses informasi dan dukungan kesehatan mental dari Sejiwa." href="https://sejiwa.org/" Icon={HeartHandshake} />
            <SupportCard title="JKN Mobile / SATUSEHAT" description="Akses layanan kesehatan nasional dan informasi kesehatanmu." href="https://www.bpjs-kesehatan.go.id/" secondaryHref="https://satusehat.kemkes.go.id/" Icon={BriefcaseMedical} />
          </div>
        </WellnessSection>
      </div>
    </main>
  );
}

function WellnessSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">Section {number}</p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-[#4F5E52]">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function SupportCard(props: {
  title: string; description: string; href?: string; secondaryHref?: string; action?: string;
  status?: string; locked?: boolean; Icon: React.ComponentType<{ size?: number; className?: string }>;
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
                Buka JKN Mobile <ExternalLink size={11} className="inline" />
              </a>
            )}
            {props.secondaryHref && (
              <a href={props.secondaryHref} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#4F5E52] flex items-center gap-1 hover:underline">
                Buka SATUSEHAT <ExternalLink size={11} className="inline" />
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

