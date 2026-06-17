"use client";

import React, { useEffect, useState } from "react";
import {
    ChevronRight,
    Lock,
    BookOpen,
    Brain,
    Music,
    Target,
    Sparkles,
    Users,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { WellnessMappingView } from "./WellnessMappingView";
import { WellnessMapView } from "./WellnessMapView";
import { WellnessNavigatorView } from "./WellnessNavigatorView";
import { WellnessSupportPathView } from "./WellnessSupportPathView";
import { translations } from "@/lib/data/translations";
import { wellnessMappingRepository } from "@/lib/repositories/wellnessMappingRepository";
import { wellnessMappingEngine, WellnessMapping } from "@/lib/engines/wellnessMappingEngine";
import { wellnessNavigatorEngine, WellnessNavigatorState } from "@/lib/engines/wellnessNavigatorEngine";
import { wellnessSupportEngine, SupportEngineState } from "@/lib/engines/wellnessSupportEngine";
import { COMMUNITY_CONFIG } from "@/lib/config/community";
import { AssessmentResult } from "@/lib/engines/assessmentScoringEngine";

interface WellnessAssessmentFlowProps {
  uid: string;
  language: "id" | "en";
}

type Stage = "intro" | "questions" | "results";

const QUESTIONS = [
  { id: 1, dimension: "BODY" as const, text: { id: "Saya bangun pagi dengan perasaan segar dan cukup istirahat.", en: "I wake up in the morning feeling refreshed and well-rested." } },
  { id: 2, dimension: "BODY" as const, text: { id: "Saya memiliki energi yang cukup untuk menyelesaikan tugas harian.", en: "I have enough energy to complete my daily tasks." } },
  { id: 3, dimension: "BODY" as const, text: { id: "Saya mendengarkan sinyal tubuh (kapan harus makan, istirahat, atau bergerak).", en: "I listen to my body's signals (when to eat, rest, or move)." } },
  { id: 7, dimension: "EMOTION" as const, text: { id: "Saya menyadari apa yang saya rasakan saat menjalani hari.", en: "I am aware of what I am feeling throughout the day." } },
  { id: 8, dimension: "EMOTION" as const, text: { id: "Saya mampu menghadapi emosi sulit tanpa merasa kewalahan.", en: "I am able to face difficult emotions without feeling overwhelmed." } },
  { id: 13, dimension: "RELATIONSHIP" as const, text: { id: "Saya memiliki orang-orang yang bisa saya hubungi saat butuh dukungan.", en: "I have people I can reach out to when I need support." } },
  { id: 19, dimension: "MEANING" as const, text: { id: "Saya merasa aktivitas harian saya memiliki makna dan nilai.", en: "I feel my daily activities have meaning and value." } },
  { id: 25, dimension: "SPIRITUALITY" as const, text: { id: "Saya meluangkan waktu untuk refleksi diri atau kontemplasi harian.", en: "I make time for self-reflection or daily contemplation." } },
];

export function WellnessAssessmentFlow({ uid, language }: WellnessAssessmentFlowProps) {
  const t = translations[language];
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [mapping, setMapping] = useState<WellnessMapping | null>(null);
  const [navigator, setNavigator] = useState<WellnessNavigatorState | null>(null);
  const [support, setSupport] = useState<SupportEngineState | null>(null);
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const loadExisting = async () => {
      if (!uid) return;
      try {
        const existing = await wellnessMappingRepository.getMapping(uid);
        if (existing?.assessment) {
          setMapping(existing);
          setNavigator(wellnessNavigatorEngine.calculateNavigator(existing));
          setSupport(wellnessSupportEngine.calculateSupportPath(existing));
          setResults(existing.assessment);
          setStage("results");
        }
      } catch (loadError) {
        console.error("[Kenali Diri] Failed to load saved reflection", loadError);
      }
    };
    void loadExisting();
  }, [uid]);

  const handleStart = () => setStage("questions");

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) return;
    if (!uid) {
      setError(language === "id" ? "Sesi akun belum siap. Silakan masuk kembali lalu coba lagi." : "Your account session is not ready. Please sign in again and retry.");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const mappingInput = QUESTIONS.map(q => ({
        questionId: q.id,
        dimension: q.dimension,
        score: answers[q.id]
      }));

      const result = wellnessMappingEngine.calculateMapping(uid, mappingInput);
      if (!result.assessment || result.results.length === 0) {
        throw new Error("Assessment result is incomplete");
      }

      setMapping(result);
      setNavigator(wellnessNavigatorEngine.calculateNavigator(result));
      setSupport(wellnessSupportEngine.calculateSupportPath(result));
      setResults(result.assessment);
      setStage("results");

      try {
        await wellnessMappingRepository.saveMapping(uid, result);
      } catch (saveError) {
        console.error("[Kenali Diri] Reflection calculated but could not be saved", saveError);
        setNotice(language === "id" ? "Refleksi berhasil dibuat. Kamu bisa melanjutkan perjalananmu dari sini." : "Your reflection is ready. You can continue your journey from here.");
      }
    } catch (analysisError) {
      console.error("[Kenali Diri] Failed to calculate reflection", analysisError);
      setError(language === "id" ? "Hasil refleksi belum dapat dibuat. Silakan periksa jawabanmu dan coba lagi." : "Your reflection could not be created. Please review your answers and retry.");
    } finally {
      setLoading(false);
    }
  };

  if (stage === "intro") {
    return (
      <div className="bhumi-card p-10 text-center space-y-8 bg-white border-none shadow-sm">
        <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#4F5E52]">
          <Sparkles size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-serif text-[#4F5E52]">{t.kenaliDiri.title}</h2>
          <p className="text-[#7B8776] leading-relaxed max-w-sm mx-auto">
            {t.kenaliDiri.subtitle}
          </p>
        </div>
        <div className="pt-4">
          <button onClick={handleStart} className="bhumi-button w-full py-4 text-lg">
            Mulai Refleksi →
          </button>
          <p className="mt-6 text-[10px] text-[#9AA394] italic px-8">
            {t.kenaliDiri.note}
          </p>
        </div>
      </div>
    );
  }

  if (stage === "questions") {
    const progress = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="flex justify-between items-end px-2">
            <div>
                <p className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest mb-1">Refleksi Harian</p>
                <h3 className="text-xl font-serif text-[#4F5E52]">Pemetaan Kondisi</h3>
            </div>
            <p className="text-sm font-bold text-[#4F5E52]">{progress}%</p>
        </header>

        <div className="h-1 w-full bg-[#E8E9E5] rounded-full overflow-hidden">
            <div className="h-full bg-[#4F5E52] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-10 py-4">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-6">
              <p className="text-lg font-medium text-[#4F5E52] leading-relaxed">
                {q.text[language]}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleAnswer(q.id, score)}
                    className={`h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all ${
                      answers[q.id] === score
                      ? 'bg-[#4F5E52] text-white shadow-md scale-[1.05]'
                      : 'bg-white text-[#7B8776] border border-[#E8E9E5] hover:border-[#4F5E52]'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between px-1">
                <span className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Tidak Sesuai</span>
                <span className="text-[10px] font-bold text-[#9AA394] uppercase tracking-widest">Sangat Sesuai</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 pb-20">
          {error && (
            <p role="alert" className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              {error}
            </p>
          )}
          <button
            disabled={Object.keys(answers).length < QUESTIONS.length || loading}
            onClick={handleSubmit}
            className="bhumi-button w-full py-5 text-xl disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "Menganalisis..." : "Lihat Hasil Refleksi →"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === "results") {
    return (
      <div className="bhumi-card p-8 bg-white border-none shadow-sm space-y-12">
        {error && (
          <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </p>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-[#4F6658] font-bold text-2xl italic">{t.kenaliDiri.title}</h3>
            <p className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest mt-1">
              {t.kenaliDiri.reviewTitle} - {new Date().toLocaleDateString(language === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short" })}
            </p>
          </div>
          <button
            onClick={() => setStage("intro")}
            className="text-[10px] font-bold text-[#7B8776] uppercase tracking-widest underline"
          >
            {language === "id" ? "Ulangi Refleksi" : "Repeat Reflection"}
          </button>
        </div>

        <section>
          <h4 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-6 border-b border-[#F5F1E8] pb-2">{t.kenaliDiri.results.theme}</h4>
          {navigator ? <WellnessNavigatorView state={navigator} language={language} /> : <p className="text-sm italic text-gray-400">Loading theme...</p>}
        </section>

        <section>
          <h4 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-6 border-b border-[#F5F1E8] pb-2">{t.kenaliDiri.results.patterns}</h4>
          {mapping ? <WellnessMappingView mapping={mapping} language={language} /> : <p className="text-sm italic text-gray-400">Loading patterns...</p>}
        </section>

        <section>
          <h4 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-6 border-b border-[#F5F1E8] pb-2">{t.kenaliDiri.results.attention}</h4>
          {results ? <WellnessMapView results={results} language={language} /> : <p className="text-sm italic text-gray-400">Loading attention areas...</p>}
        </section>

        <section>
          <h4 className="text-[10px] font-bold text-[#9BB89A] uppercase tracking-[0.2em] mb-6 border-b border-[#F5F1E8] pb-2">{t.kenaliDiri.results.safePath}</h4>
          {support ? <WellnessSupportPathView state={support} language={language} /> : <p className="text-sm italic text-gray-400">Loading safe path...</p>}
        </section>

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
               <RecommendationButton href="/innerwork" icon={<Sparkles size={16} />} label={t.kenaliDiri.recommendations.innerwork} />
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

        <div className="p-6 rounded-[2rem] bg-[#4F5E52] text-white shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 mb-2">
            {language === "id" ? "Langkah Berikutnya" : "Next Steps"}
          </p>
          <p className="text-sm font-medium leading-relaxed">
            {language === "id"
              ? "Refleksi ini menjadi landasan bagi Bhumi untuk menyesuaikan saran Bhumi dan pilihan praktik yang paling mendukungmu hari ini."
              : "This reflection becomes the foundation for Bhumi to tailor mentor advice and practice options that best support you today."}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function RecommendationButton({ href, icon, label, disabled = false }: { href: string; icon: React.ReactNode; label: string; disabled?: boolean }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 opacity-60 cursor-not-allowed">
        <div className="text-[#9BB89A]">{icon}</div>
        <span className="text-xs font-bold text-[#4F6658]">{label}</span>
        <Lock size={12} className="ml-auto text-gray-400" />
      </div>
    );
  }
  const isExternal = /^https?:\/\//i.test(href);
  const className = "flex items-center gap-3 p-4 rounded-2xl bg-[#FCFAF5] border border-[#E8E9E5]/60 hover:border-[#4F6658]/30 transition-all group";
  const content = <>
    <div className="text-[#9BB89A] group-hover:text-[#4F5E52] transition-colors">{icon}</div>
    <span className="text-xs font-bold text-[#4F6658]">{label}</span>
    <ChevronRight size={12} className="ml-auto text-[#9BB89A] group-hover:translate-x-0.5 transition-transform" />
  </>;

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>;
  }
  return (
    <Link href={href} className={className}>{content}</Link>
  );
}
