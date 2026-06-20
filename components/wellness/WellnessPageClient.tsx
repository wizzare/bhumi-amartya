"use client";

import React from "react";
import Link from "next/link";
import {
  Activity, BookOpen, Brain, BriefcaseMedical, ChevronRight, Dumbbell,
  ExternalLink, Flower2, HeartHandshake, Lock, Music, Sparkles, Users, Wind,
  MessageSquare, Target, Clock, Info
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
import type { WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import type { WellnessNavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import type { SupportEngineState } from "@/lib/engines/wellnessSupportEngine";
import type { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";

const PRACTICES = [
  { label: "Journaling", href: "/innerwork/journaling", Icon: BookOpen },
  { label: "Meditasi", href: "/innerwork/meditation", Icon: Brain },
  { label: "Breathwork", href: "/innerwork/meditation", Icon: Wind },
  { label: "Mudra", href: "/innerwork/meditation", Icon: Sparkles },
  { label: "Yoga", href: "/innerwork/yoga", Icon: Flower2 },
  { label: "Workout", href: "/innerwork/workout", Icon: Dumbbell },
  { label: "Audio Healing", href: "/innerwork/audio-healing", Icon: Music },
  { label: "Manifestation", href: "/innerwork/manifestasi", Icon: Activity },
];

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
  const t = translations[language];
  const [intelligence, setIntelligence] = React.useState<WellnessDailyIntelligence | null>(null);
  const [decision, setDecision] = React.useState<InnerworkDailyDecision | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Results & assessment state
  const [assessmentStage, setAssessmentStage] = React.useState<"intro" | "questions" | "results">("intro");
  const [mapping, setMapping] = React.useState<WellnessMapping | null>(null);
  const [navigator, setNavigator] = React.useState<WellnessNavigatorState | null>(null);
  const [support, setSupport] = React.useState<SupportEngineState | null>(null);
  const [results, setResults] = React.useState<AssessmentResult | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);
  const [startFresh, setStartFresh] = React.useState(false);

  React.useEffect(() => {
    async function load() {
      if (!auth?.user?.uid) return;
      try {
        const [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint(),
        ]);
        if (!profile) return;
        const result = await loadWellnessDailyIntelligence({
          uid: auth.user.uid,
          profile,
          blueprint,
        });
        setIntelligence(result);
        setDecision(buildInnerworkDailyDecision(result.recommendationInput));
      } finally {
        setLoading(false);
      }
    }
    if (auth?.authStateResolved && auth?.user?.uid) void load();
  }, [auth?.authStateResolved, auth?.user?.uid]);

  const handleRepeat = () => {
    setAssessmentStage("intro");
    setStartFresh(true);
    setMapping(null);
    setNavigator(null);
    setSupport(null);
    setResults(null);
  };

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
            uid={auth?.user?.uid || ""}
            language={language}
            startFresh={startFresh}
            onResultsLoaded={(m, n, s, r) => {
              setMapping(m);
              setNavigator(n);
              setSupport(s);
              setResults(r);
              setAssessmentStage("results");
            }}
            onStageChange={setAssessmentStage}
          />
        </div>
      </main>
    );
  }

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

        {/* Section 1: Check-in Hari Ini */}
        <WellnessSection number="1" title={t.wellness.checkIn}>
          <div className="space-y-4">
            <WellnessCheckInCard
              uid={auth?.user?.uid || ""}
              initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
            />
            {intelligence?.wellnessState?.emotionalWord && (
              <p className="rounded-2xl bg-white p-4 text-sm text-[#526053] shadow-sm">
                Emosi saat ini: <strong>{intelligence.wellnessState.emotionalWord}</strong>
              </p>
            )}
          </div>
        </WellnessSection>

        {/* Section 2: Summary Mapping or Assessment Intro */}
        {assessmentStage === "results" && mapping && results ? (
          <WellnessSection number="2" title={t.wellness.summaryMapping}>
            <WellnessSummaryMapping
              mapping={mapping}
              navigator={navigator}
              results={results}
              language={language}
              isExpanded={isDetailsExpanded}
              onToggleExpand={() => setIsDetailsExpanded(!isDetailsExpanded)}
              onRepeat={handleRepeat}
            />
          </WellnessSection>
        ) : (
          <WellnessSection number="2" title={t.wellness.mapping}>
            <WellnessAssessmentFlow 
              key={startFresh ? "fresh" : "saved"}
              uid={auth?.user?.uid || ""}
              language={language}
              startFresh={startFresh}
              onResultsLoaded={(m, n, s, r) => {
                setMapping(m);
                setNavigator(n);
                setSupport(s);
                setResults(r);
                setAssessmentStage("results");
              }}
              onStageChange={setAssessmentStage}
            />
          </WellnessSection>
        )}

        {/* Section 3: Recommended Today */}
        <WellnessSection number="3" title={t.wellness.recommended}>
          <div className="space-y-4">
            {intelligence && (
              <div className="rounded-3xl bg-[#F5F1E8]/60 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BB89A]">Tema Saat Ini</p>
                <p className="mt-2 font-serif text-xl text-[#4F5E52]">{intelligence.currentIssue.title}</p>
              </div>
            )}
            {decision ? (
              <div className="space-y-4">
                {/* Main Practice Card */}
                {(() => {
                  const mainBaseHref = getMainPracticeHref(decision.mainPractice.type, decision.mainPractice.category);
                  const mainCategoryForParam = (
                    ["journaling", "meditation", "breathwork", "mudra", "yoga", "workout"].includes(decision.mainPractice.category)
                      ? decision.mainPractice.category
                      : (mainBaseHref === "/innerwork/journaling" ? "journaling" : mainBaseHref === "/innerwork/yoga" ? "yoga" : mainBaseHref === "/innerwork/workout" ? "workout" : "meditation")
                  ) as ZoneBPracticeCategory;

                  const mainPracticeHref = buildZoneBHref(mainBaseHref, {
                    issue: decision.mainPractice.issueKey || intelligence?.currentIssue.key || "difficulty_resting",
                    practiceId: decision.mainPractice.practiceId,
                    practiceCategory: mainCategoryForParam,
                    sourceTheme: decision.mainPractice.issueCategory || "body recovery",
                    title: decision.mainPractice.title,
                    durationMinutes: decision.mainPractice.durationMinutes,
                  });

                  return (
                    <div className="bhumi-card border-none bg-white p-6 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BB89A]">Praktik Utama</p>
                          <h3 className="mt-1 font-serif text-xl font-bold text-[#4F5E52]">{decision.mainPractice.title}</h3>
                        </div>
                        <span className="px-2.5 py-1 bg-[#F5F1E8] rounded-full text-[10px] font-bold text-[#7B8776] shrink-0 flex items-center gap-1.5">
                          <Clock size={10} />
                          {decision.mainPractice.durationMinutes} menit
                        </span>
                      </div>
                      
                      <p className="text-xs leading-relaxed text-[#526053]">{decision.mainPractice.description}</p>
                      
                      <div className="border-t border-[#F5F1E8] pt-3 space-y-3">
                        {decision.mainPractice.whyThisPractice && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-wider flex items-center gap-1">
                              <Info size={10} />
                              Kenapa ini dipilih?
                            </p>
                            <p className="text-xs text-[#526053] leading-relaxed italic">
                              "{decision.mainPractice.whyThisPractice}"
                            </p>
                          </div>
                        )}

                        {decision.mainPractice.instructions && decision.mainPractice.instructions.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-wider">Cara melakukan</p>
                            <ol className="space-y-1 text-xs text-[#526053] leading-relaxed list-decimal pl-4">
                              {decision.mainPractice.instructions.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {decision.mainPractice.expectedBenefit && decision.mainPractice.expectedBenefit.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-wider">Fokus hari ini</p>
                            <div className="flex flex-wrap gap-1.5">
                              {decision.mainPractice.expectedBenefit.map((benefit, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-[#F5F1E8] rounded-full text-[10px] font-bold text-[#7B8776]">
                                  {benefit}
                                </span>
                              ))}
                              <span className="px-2.5 py-1 bg-[#F5F1E8]/50 rounded-full text-[10px] font-bold text-[#7B8776] capitalize">
                                Intensitas: {decision.mainPractice.intensity === "gentle" ? "Lembut" : decision.mainPractice.intensity === "moderate" ? "Sedang" : "Aktif"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <Link
                        href={mainPracticeHref}
                        className="bhumi-button w-full block text-center py-3.5 text-sm font-bold mt-4"
                      >
                        Mulai Praktik →
                      </Link>
                    </div>
                  );
                })()}

                {/* Supporting Practices */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#4F5E52]">Praktik Pendukung</p>
                  {decision.supportPractices.map((practice) => (
                    <Link
                      key={practice.practiceId}
                      href={buildZoneBHref(practice.href, {
                        issue: practice.issueKey || intelligence?.currentIssue.key || "difficulty_resting",
                        practiceId: practice.practiceId,
                        practiceCategory: practice.category as ZoneBPracticeCategory,
                        sourceTheme: practice.sourceTheme || decision.mainPractice.issueCategory || "body recovery",
                        title: practice.title,
                        durationMinutes: practice.durationMinutes,
                      })}
                      className="flex items-center justify-between rounded-2xl border border-[#E8E9E5] bg-white p-4 shadow-sm hover:border-[#4F5E52]/20 transition-all active:scale-[0.99] group"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#4F5E52] group-hover:text-[#4F5E52]/80">{practice.title}</p>
                        <p className="mt-1 text-xs text-[#7B8776]">{practice.reason}</p>
                      </div>
                      <ChevronRight size={16} className="shrink-0 text-[#9BB89A] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-[#7B8776]">{t.wellness.recsPreparing}</p>}
          </div>
        </WellnessSection>

        {/* Section 4: Detail Analysis (collapsed by default, only shown in results stage) */}
        {assessmentStage === "results" && (
          <WellnessSection number="4" title={t.wellness.detailAnalysis}>
            {isDetailsExpanded ? (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* Navigator Steps */}
                {navigator && <WellnessNavigatorView state={navigator} language={language} />}
                
                {/* 1. Kemungkinan Tema Saat Ini */}
                {mapping && <WellnessMappingView mapping={mapping} language={language} />}
                
                {/* 2. Pemetaan Dimensi */}
                {results && <WellnessMapView results={results} language={language} />}
                
                {/* 3. Jalur Aman */}
                {support && <WellnessSupportPathView state={support} language={language} />}
                
                {/* 4. Pendampingan */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-4 border-b border-[#F5F1E8] pb-2">
                    {t.kenaliDiri.recommendations.title}
                  </h4>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-[#4F5E52] uppercase tracking-wider">{t.kenaliDiri.recommendations.level1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <RecommendationButton href="/innerwork/journaling" icon={<BookOpen size={16} />} label={t.kenaliDiri.recommendations.journaling} />
                       <RecommendationButton href="/innerwork/meditation" icon={<Brain size={16} />} label={t.kenaliDiri.recommendations.meditation} />
                       <RecommendationButton href="/innerwork/audio-healing" icon={<Music size={16} />} label={t.kenaliDiri.recommendations.audio} />
                       <RecommendationButton href="/innerwork/manifestasi" icon={<Target size={16} />} label={t.kenaliDiri.recommendations.manifestation} />
                       <RecommendationButton href="/wellness" icon={<Sparkles size={16} />} label={t.kenaliDiri.recommendations.innerwork} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-[#4F5E52] uppercase tracking-wider">{t.kenaliDiri.recommendations.level2}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <RecommendationButton href={COMMUNITY_CONFIG.whatsappLink} icon={<Users size={16} />} label={language === "id" ? "Gabung Sobat Mistis Bhumi" : "Join Sobat Mistis Bhumi"} disabled={!COMMUNITY_CONFIG.whatsappLink} />
                       <RecommendationButton href="#" icon={<MessageSquare size={16} />} label={t.kenaliDiri.recommendations.circle} disabled />
                       <RecommendationButton href="#" icon={<Users size={16} />} label={t.kenaliDiri.recommendations.buddy} disabled />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-white rounded-3xl border border-[#E8E9E5] shadow-sm">
                <p className="text-sm text-[#7B8776] mb-3">Detail analisis batinmu tersembunyi.</p>
                <button
                  onClick={() => setIsDetailsExpanded(true)}
                  className="bhumi-button px-6 py-2.5 text-xs font-bold"
                >
                  {language === "id" ? "Lihat Detail Analisis" : "View Detail Analysis"}
                </button>
              </div>
            )}
          </WellnessSection>
        )}

        {/* Section 5 or 4: Praktik Tambahan */}
        <WellnessSection number={assessmentStage === "results" ? "5" : "4"} title={t.wellness.additional}>
          <div className="grid grid-cols-2 gap-3">
            {PRACTICES.map(({ label, href, Icon }) => (
              <Link key={label} href={href} className="rounded-2xl border border-[#E8E9E5] bg-white p-5 text-center shadow-sm hover:border-[#4F5E52]/20 transition-all active:scale-[0.98] group">
                <Icon size={22} className="mx-auto text-[#4F5E52] group-hover:scale-105 transition-transform" />
                <span className="mt-3 block text-xs font-bold text-[#4F5E52]">{label}</span>
              </Link>
            ))}
          </div>
        </WellnessSection>

        {/* Section 6 or 5: Dukungan untukmu */}
        <WellnessSection number={assessmentStage === "results" ? "6" : "5"} title={t.wellness.support}>
          <div className="space-y-3">
            <SupportCard title="Sobat Mistis Bhumi Amartya" description="Belajar, bertumbuh, dan berjalan bersama komunitas Bhumi." href={COMMUNITY_CONFIG.whatsappLink} status="ACTIVE" Icon={Users} />
            <SupportCard title="Psikolog Terdekat" description="Temukan layanan psikolog yang tersedia di area terdekatmu." href="https://www.google.com/search?q=psikolog+terdekat" action="Cari Psikolog Terdekat" Icon={BriefcaseMedical} />
            <SupportCard title="Mitra Pendamping Bhumi" description="Jaringan pendamping terkurasi sedang dipersiapkan." status="COMING SOON" locked Icon={HeartHandshake} />
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
  const content = (
    <div className="flex items-start gap-4 rounded-3xl border border-[#E8E9E5] bg-white p-5">
      <div className="rounded-2xl bg-[#F5F1E8] p-3 text-[#4F5E52]"><props.Icon size={20} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#4F5E52]">{props.title}</h3>
          {props.status && <span className="rounded-full bg-[#F5F1E8] px-2 py-1 text-[8px] font-bold text-[#7B8776]">{props.status}</span>}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#7B8776]">{props.description}</p>
        {props.action && <p className="mt-3 text-xs font-bold text-[#4F5E52]">{props.action}</p>}
        {props.secondaryHref && <a href={props.secondaryHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-bold text-[#4F5E52]">Buka SATUSEHAT <ExternalLink size={11} className="inline" /></a>}
      </div>
      {props.locked ? <Lock size={16} className="text-[#9AA394]" /> : props.href ? <ExternalLink size={16} className="text-[#9AA394]" /> : null}
    </div>
  );
  return props.href && !props.locked
    ? <a href={props.href} target="_blank" rel="noopener noreferrer">{content}</a>
    : content;
}
