"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  Download,
  Heart,
  Info,
  Layers3,
  MapPin,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import CityAutocomplete, { CitySelection } from "@/components/ui/CityAutocomplete";
import { AuraResult } from "@/lib/services/auraResultGenerator";
import { useLanguage } from "@/app/context/LanguageContext";
import { isEnlEdition } from "@/lib/config/edition";

interface AuraColorStyle {
  name: string;
  bgGradient: string;
  glowClass: string;
  textColor: string;
  badgeBg: string;
  iconBg: string;
  keyword: string;
}

const AURA_COLORS_CONFIG_ID: Record<string, AuraColorStyle> = {
  MERAH: {
    name: "Merah",
    bgGradient: "from-red-500 to-rose-600",
    glowClass: "shadow-[0_0_50px_rgba(239,68,68,0.55)] border-red-500/30",
    textColor: "text-red-600",
    badgeBg: "bg-red-50 text-red-700 border border-red-200",
    iconBg: "bg-red-50 text-red-600",
    keyword: "Keberanian · Aksi · Ketegasan",
  },
  JINGGA: {
    name: "Jingga",
    bgGradient: "from-orange-500 to-amber-600",
    glowClass: "shadow-[0_0_50px_rgba(249,115,22,0.55)] border-orange-500/30",
    textColor: "text-orange-600",
    badgeBg: "bg-orange-50 text-orange-700 border border-orange-200",
    iconBg: "bg-orange-50 text-orange-600",
    keyword: "Kreativitas · Ekspresi · Antusiasme",
  },
  KUNING: {
    name: "Kuning",
    bgGradient: "from-yellow-400 to-amber-500",
    glowClass: "shadow-[0_0_50px_rgba(234,179,8,0.55)] border-yellow-500/30",
    textColor: "text-yellow-600",
    badgeBg: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    iconBg: "bg-yellow-50 text-yellow-600",
    keyword: "Pertumbuhan · Optimisme · Pembelajaran",
  },
  HIJAU: {
    name: "Hijau",
    bgGradient: "from-emerald-500 to-teal-600",
    glowClass: "shadow-[0_0_50px_rgba(16,185,129,0.55)] border-emerald-500/30",
    textColor: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
    keyword: "Empati · Hubungan · Penyembuhan",
  },
  BIRU: {
    name: "Biru",
    bgGradient: "from-blue-500 to-indigo-600",
    glowClass: "shadow-[0_0_50px_rgba(59,130,246,0.55)] border-blue-500/30",
    textColor: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
    keyword: "Komunikasi · Inspirasi · Pengetahuan",
  },
  UNGU: {
    name: "Ungu",
    bgGradient: "from-purple-500 to-fuchsia-600",
    glowClass: "shadow-[0_0_50px_rgba(168,85,247,0.55)] border-purple-500/30",
    textColor: "text-purple-600",
    badgeBg: "bg-purple-50 text-purple-700 border border-purple-200",
    iconBg: "bg-purple-50 text-purple-600",
    keyword: "Intuisi · Makna Hidup · Refleksi",
  },
  EMAS: {
    name: "Emas",
    bgGradient: "from-[#F2D07B] via-[#D4AF37] to-[#B08D23]",
    glowClass: "shadow-[0_0_50px_rgba(212,175,55,0.55)] border-[#D4AF37]/30",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-50 text-amber-800 border border-amber-200",
    iconBg: "bg-amber-50 text-amber-700",
    keyword: "Kepemimpinan · Pengaruh · Manifestasi",
  },
  PERAK: {
    name: "Perak",
    bgGradient: "from-slate-400 via-slate-500 to-slate-600",
    glowClass: "shadow-[0_0_50px_rgba(148,163,184,0.55)] border-slate-500/30",
    textColor: "text-slate-600",
    badgeBg: "bg-slate-50 text-slate-700 border border-slate-200",
    iconBg: "bg-slate-50 text-slate-600",
    keyword: "Kebijaksanaan · Pengamatan · Kedewasaan",
  },
};

const AURA_COLORS_CONFIG_EN: Record<string, AuraColorStyle> = {
  MERAH: {
    name: "Red",
    bgGradient: "from-red-500 to-rose-600",
    glowClass: "shadow-[0_0_50px_rgba(239,68,68,0.55)] border-red-500/30",
    textColor: "text-red-600",
    badgeBg: "bg-red-50 text-red-700 border border-red-200",
    iconBg: "bg-red-50 text-red-600",
    keyword: "Courage · Action · Resolve",
  },
  JINGGA: {
    name: "Orange",
    bgGradient: "from-orange-500 to-amber-600",
    glowClass: "shadow-[0_0_50px_rgba(249,115,22,0.55)] border-orange-500/30",
    textColor: "text-orange-600",
    badgeBg: "bg-orange-50 text-orange-700 border border-orange-200",
    iconBg: "bg-orange-50 text-orange-600",
    keyword: "Creativity · Expression · Enthusiasm",
  },
  KUNING: {
    name: "Yellow",
    bgGradient: "from-yellow-400 to-amber-500",
    glowClass: "shadow-[0_0_50px_rgba(234,179,8,0.55)] border-yellow-500/30",
    textColor: "text-yellow-600",
    badgeBg: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    iconBg: "bg-yellow-50 text-yellow-600",
    keyword: "Growth · Optimism · Learning",
  },
  HIJAU: {
    name: "Green",
    bgGradient: "from-emerald-500 to-teal-600",
    glowClass: "shadow-[0_0_50px_rgba(16,185,129,0.55)] border-emerald-500/30",
    textColor: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
    keyword: "Empathy · Connection · Harmony",
  },
  BIRU: {
    name: "Blue",
    bgGradient: "from-blue-500 to-indigo-600",
    glowClass: "shadow-[0_0_50px_rgba(59,130,246,0.55)] border-blue-500/30",
    textColor: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-700 border border-blue-200",
    iconBg: "bg-blue-50 text-blue-600",
    keyword: "Communication · Inspiration · Insight",
  },
  UNGU: {
    name: "Violet",
    bgGradient: "from-purple-500 to-fuchsia-600",
    glowClass: "shadow-[0_0_50px_rgba(168,85,247,0.55)] border-purple-500/30",
    textColor: "text-purple-600",
    badgeBg: "bg-purple-50 text-purple-700 border border-purple-200",
    iconBg: "bg-purple-50 text-purple-600",
    keyword: "Intuition · Life Meaning · Reflection",
  },
  EMAS: {
    name: "Gold",
    bgGradient: "from-[#F2D07B] via-[#D4AF37] to-[#B08D23]",
    glowClass: "shadow-[0_0_50px_rgba(212,175,55,0.55)] border-[#D4AF37]/30",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-50 text-amber-800 border border-amber-200",
    iconBg: "bg-amber-50 text-amber-700",
    keyword: "Leadership · Presence · Manifestation",
  },
  PERAK: {
    name: "Silver",
    bgGradient: "from-slate-400 via-slate-500 to-slate-600",
    glowClass: "shadow-[0_0_50px_rgba(148,163,184,0.55)] border-slate-500/30",
    textColor: "text-slate-600",
    badgeBg: "bg-slate-50 text-slate-700 border border-slate-200",
    iconBg: "bg-slate-50 text-slate-600",
    keyword: "Wisdom · Observation · Maturity",
  },
};

const LOADING_PHRASES_ID = [
  "Membaca pola energi...",
  "Menyusun peta aura...",
  "Menghubungkan aspek diri...",
  "Menyelaraskan hasil...",
  "Menyusun insight personal...",
];

const LOADING_PHRASES_EN = [
  "Reading energy patterns...",
  "Mapping aura fields...",
  "Connecting self dimensions...",
  "Aligning results...",
  "Composing personal insights...",
];

export default function AuraPage() {
  const { language } = useLanguage();
  const isEn = language === "en" || isEnlEdition();

  const auraColorsConfig = isEn ? AURA_COLORS_CONFIG_EN : AURA_COLORS_CONFIG_ID;
  const loadingPhrases = isEn ? LOADING_PHRASES_EN : LOADING_PHRASES_ID;

  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [cityData, setCityData] = useState<CitySelection | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [result, setResult] = useState<AuraResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitting) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 8000 / loadingPhrases.length);
    }
    return () => clearInterval(interval);
  }, [isSubmitting, loadingPhrases.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !birthDate || !birthCity) {
      setError(isEn ? "Please fill in all required fields." : "Mohon isi semua field wajib.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setLoadingPhraseIndex(0);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/kenali-diri/aura/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          birthDate,
          birthTime: birthTime || null,
          birthCity,
          latitude: cityData?.latitude || null,
          longitude: cityData?.longitude || null,
          timezone: null,
          language: isEn ? "en" : "id",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isEn ? "Failed to calculate Aura." : "Gagal menghitung Aura."));
      }

      const elapsedTime = Date.now() - startTime;
      const minDelay = 3500;
      const remainingDelay = Math.max(0, minDelay - elapsedTime);

      setTimeout(() => {
        setResult(data);
        setIsSubmitting(false);
      }, remainingDelay);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isEn ? "A system error occurred. Please try again." : "Terjadi kesalahan sistem. Silakan coba kembali."));
      setIsSubmitting(false);
    }
  };

  const handleCitySelect = (selection: CitySelection) => {
    setBirthCity(selection.formattedCity);
    setCityData(selection);
  };

  if (isSubmitting) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FCFAF5] px-6 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[#7D977B]/10" />
          <div className="absolute inset-4 animate-pulse rounded-full bg-[#7D977B]/20" />
          <div className="absolute inset-8 rounded-full bg-[#7D977B]/30" />
          <Sparkles className="relative z-10 h-8 w-8 animate-spin text-white" style={{ animationDuration: "3s" }} />
        </div>
        <p className="mt-8 text-lg font-serif font-medium text-[#4F5E52] transition-all duration-500">
          {loadingPhrases[loadingPhraseIndex]}
        </p>
        <p className="mt-2 text-xs text-[#7B8776] uppercase tracking-widest font-mono">Bhumi Synthesis Layer</p>
      </main>
    );
  }

  if (result) {
    const config = auraColorsConfig[result.primaryAura] || auraColorsConfig.KUNING;
    const secondaryConfig = auraColorsConfig[result.secondaryAura] || auraColorsConfig.HIJAU;
    const shadowConfig = auraColorsConfig[result.shadowAura] || auraColorsConfig.PERAK;

    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 selection:bg-[#7D977B]/15">
        <div className="mx-auto max-w-lg">
          <header className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setResult(null)}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7B8776] hover:text-[#4F5E52] transition"
            >
              <ArrowLeft size={16} />
              {isEn ? "Retake Test" : "Ulangi Tes"}
            </button>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">
              {isEn ? "Aura Analysis Result" : "Hasil Analisis Aura"}
            </span>
          </header>

          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#9AA394]">
              {isEn ? "YOUR AURA" : "AURA KAMU"}
            </p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">
              {isEn ? "Your Dominant Energy" : "Energi Dominan Kamu"}
            </h1>
          </div>

          <div className="space-y-6">
            <section className={`rounded-[2.5rem] border bg-white p-8 text-center transition-all ${config.glowClass}`}>
              <div className="flex justify-center mb-6">
                <div
                  className={`relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-tr ${config.bgGradient} p-1 shadow-lg`}
                >
                  <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-tr opacity-50 blur-md" />
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white/95">
                    <span className="text-3xl font-serif font-bold text-[#4F5E52]">{config.name}</span>
                    <span className="mt-1 text-xs font-bold text-[#7B8776]">
                      {result.scores[result.primaryAura.toLowerCase()]}% Match
                    </span>
                  </div>
                </div>
              </div>

              <div className={`inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest ${config.badgeBg} mb-4`}>
                {config.keyword}
              </div>

              <p className="text-sm leading-relaxed text-[#7B8776] font-medium text-left">
                {result.summary}
              </p>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.iconBg}`}>
                  <Sparkles size={16} />
                </div>
                <h2 className="font-serif text-lg font-bold text-[#4F5E52]">{isEn ? "Natural Strengths" : "Kekuatan Alami"}</h2>
              </div>
              <ul className="space-y-3.5 text-sm leading-relaxed text-[#7B8776] font-medium">
                {result.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${config.textColor}`} />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                  <Layers3 size={16} />
                </div>
                <h2 className="font-serif text-lg font-bold text-[#4F5E52]">{isEn ? "Inner Challenges" : "Tantangan Diri"}</h2>
              </div>
              <ul className="space-y-3.5 text-sm leading-relaxed text-[#7B8776] font-medium">
                {result.challenges.map((chal, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <span>{chal}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${config.iconBg}`}>
                  <Sun size={16} />
                </div>
                <h2 className="font-serif text-lg font-bold text-[#4F5E52]">{isEn ? "Growing Energy" : "Energi yang Sedang Berkembang"}</h2>
              </div>
              <p className="text-sm leading-relaxed text-[#7B8776] font-medium">
                {result.growth}
              </p>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${secondaryConfig.iconBg}`}>
                  <Heart size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">
                    {isEn ? "Supporting Aura" : "Aura Pendukung"}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#4F5E52]">
                    {secondaryConfig.name} ({result.scores[result.secondaryAura.toLowerCase()]}%)
                  </h2>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#7B8776] font-medium">
                {result.supportExplanation}
              </p>
            </section>

            <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${shadowConfig.iconBg}`}>
                  <Info size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA394]">
                    {isEn ? "Shadow Aura" : "Aura Bayangan (Shadow)"}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#4F5E52]">
                    {shadowConfig.name} ({result.scores[result.shadowAura.toLowerCase()]}%)
                  </h2>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[#7B8776] font-medium">
                {result.shadowExplanation}
              </p>
            </section>

            <section className="rounded-[2.2rem] bg-[#F5F1E8] p-7 border border-[#E8E1D3]">
              <h2 className="mb-5 font-serif text-lg font-bold text-[#4F5E52] text-center">{isEn ? "Aura Map Summary" : "Ringkasan Peta Aura"}</h2>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-black/5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#9AA394]">{isEn ? "Primary" : "Utama"}</span>
                  <p className={`mt-2 font-serif text-base font-bold ${config.textColor}`}>{config.name}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-black/5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#9AA394]">{isEn ? "Supporting" : "Pendukung"}</span>
                  <p className={`mt-2 font-serif text-base font-bold ${secondaryConfig.textColor}`}>{secondaryConfig.name}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-black/5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#9AA394]">{isEn ? "Shadow" : "Bayangan"}</span>
                  <p className={`mt-2 font-serif text-base font-bold ${shadowConfig.textColor}`}>{shadowConfig.name}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[2.5rem] bg-[#4F5E52] p-8 text-white text-center relative overflow-hidden shadow-lg">
              <div className="absolute -top-12 -right-12 text-white/5">
                <Compass size={220} />
              </div>
              <div className="relative z-10">
                <h2 className="font-serif text-2xl font-bold mb-3">{isEn ? "Want to Understand Yourself More Deeply?" : "Ingin Mengenal Dirimu Lebih Dalam?"}</h2>
                <p className="text-sm leading-relaxed text-[#D2D8D0] mb-6 font-medium">
                  {isEn ? "Aura is a surface reflection of your broader energetic blueprint. In the Bhumi Amartya app, unlock deeper insights into:" : "Aura hanyalah gambaran permukaan dari pola dirimu. Di aplikasi Bhumi Amartya kamu dapat melihat insight yang lebih mendalam mengenai:"}
                </p>
                <div className="mb-8 grid grid-cols-2 gap-x-4 gap-y-2 text-left text-xs font-semibold text-[#D2D8D0] max-w-xs mx-auto">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Personal Blueprint" : "Blueprint Diri"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Gifts & Talents" : "Potensi & Bakat"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Recurring Patterns" : "Pola Berulang"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Relations & Career" : "Relasi & Karir"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Soul Reflection" : "Refleksi Jiwa"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-[#D6B36A] shrink-0" />
                    <span>{isEn ? "Daily Insights" : "Insight Harian"}</span>
                  </div>
                </div>

                <a
                  href="https://play.google.com/store/apps/details?id=id.my.bhumiamartya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white py-4 px-6 text-sm font-bold uppercase tracking-wider text-[#4F5E52] shadow-md hover:bg-slate-50 transition active:scale-98"
                >
                  <Download size={16} />
                  {isEn ? "Download Bhumi Amartya App" : "Download Aplikasi Bhumi Amartya"}
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32 selection:bg-[#7D977B]/15">
      <div className="mx-auto max-w-lg">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7B8776] hover:text-[#4F5E52] transition"
          >
            <ArrowLeft size={16} />
            {isEn ? "Home" : "Beranda"}
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">
            Closed Beta
          </span>
        </header>

        <section className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm border border-black/5 animate-pulse">
            <Image src="/images/logo.png" alt="Logo Bhumi" width={44} height={44} />
          </div>
          <h1 className="font-serif text-4xl font-bold text-[#4F5E52]">{isEn ? "Your Aura Test" : "Tes Aura Kamu"}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[#7B8776] font-medium px-4">
            {isEn
              ? "Everyone carries a unique energy pattern. Discover your dominant energy tendencies, natural strengths, inner challenges, and growth potential through Bhumi Aura analysis."
              : "Setiap orang memiliki pola energi yang unik. Temukan kecenderungan energi, kekuatan alami, tantangan, dan potensi dirimu melalui analisis Aura Bhumi."}
          </p>
        </section>

        <section className="rounded-[2.2rem] border border-[#E8E1D3] bg-white p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-2.5 block text-xs font-bold uppercase tracking-widest text-[#7B8776]">
                {isEn ? "Full Name" : "Nama Lengkap"}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-4 text-[#9AA394]">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  id="fullName"
                  placeholder={isEn ? "Full Name" : "Nama Lengkap"}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-black/5 bg-[#FCFAF5] pl-12 pr-5 py-4 outline-none focus:border-[#7D977B] focus:bg-white transition"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="birthDate" className="mb-2.5 block text-xs font-bold uppercase tracking-widest text-[#7B8776]">
                  {isEn ? "Birth Date" : "Tanggal Lahir"}
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-[#9AA394]">
                    <Calendar size={16} />
                  </span>
                  <input
                    type="date"
                    id="birthDate"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-2xl border border-black/5 bg-[#FCFAF5] pl-12 pr-5 py-4 outline-none focus:border-[#7D977B] focus:bg-white transition text-sm text-[#4F5E52] font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthTime" className="mb-2.5 block text-xs font-bold uppercase tracking-widest text-[#7B8776]">
                  {isEn ? "Birth Time " : "Jam Lahir "}
                  <span className="text-[10px] text-[#9AA394] font-normal lowercase">{isEn ? "(optional)" : "(opsional)"}</span>
                </label>
                <div className="relative">
                  <span className="absolute left-5 top-4 text-[#9AA394]">
                    <Clock size={16} />
                  </span>
                  <input
                    type="time"
                    id="birthTime"
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    className="w-full rounded-2xl border border-black/5 bg-[#FCFAF5] pl-12 pr-5 py-4 outline-none focus:border-[#7D977B] focus:bg-white transition text-sm text-[#4F5E52] font-semibold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-widest text-[#7B8776]">
                {isEn ? "Birth City" : "Kota Lahir"}
              </label>
              <div className="relative">
                <span className="absolute left-5 top-4 z-10 text-[#9AA394]">
                  <MapPin size={16} />
                </span>
                <div className="pl-7">
                  <CityAutocomplete
                    value={birthCity}
                    placeholder={isEn ? "Enter Birth City" : "Masukkan Kota Kelahiran"}
                    onInputChange={(val) => {
                      setBirthCity(val);
                      if (cityData && cityData.formattedCity !== val) {
                        setCityData(null);
                      }
                    }}
                    onCitySelect={handleCitySelect}
                  />
                </div>
              </div>
              <p className="mt-2 text-[10px] leading-relaxed text-[#9AA394] font-medium pl-1">
                {isEn
                  ? "Select your birth city from suggestions for optimal accuracy. Leave birth time empty if unknown."
                  : "Gunakan kota kelahiran dari menu saran untuk akurasi peta energi. Jika tidak mengetahui jam lahir, biarkan kosong."}
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-200">
                <Info size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="bhumi-button w-full mt-4 flex items-center justify-center gap-2 text-base font-bold uppercase tracking-wider py-4 shadow-md"
            >
              <Sparkles size={16} />
              {isEn ? "Analyze My Aura" : "Analisis Aura Saya"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
