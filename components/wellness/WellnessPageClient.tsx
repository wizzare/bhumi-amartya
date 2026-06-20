"use client";

import React from "react";
import Link from "next/link";
import {
  Activity, BookOpen, Brain, BriefcaseMedical, ChevronRight, Dumbbell,
  ExternalLink, Flower2, HeartHandshake, Lock, Music, Sparkles, Users, Wind,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { WellnessCheckInCard } from "@/components/dashboard/WellnessCheckInCard";
import { WellnessAssessmentFlow } from "@/components/wellness/WellnessAssessmentFlow";
import { COMMUNITY_CONFIG } from "@/lib/config/community";
import { storageProvider } from "@/lib/storage/storageProvider";
import { buildInnerworkDailyDecision, type InnerworkDailyDecision } from "@/lib/engines/innerworkIntelligence";
import { buildZoneBHref, type ZoneBPracticeCategory } from "@/lib/innerwork/zoneBContext";
import {
  loadWellnessDailyIntelligence,
  type WellnessDailyIntelligence,
} from "@/lib/services/wellnessDailyIntelligence";

const PRACTICES = [
  { label: "Journaling", href: "/innerwork/journaling", Icon: BookOpen },
  { label: "Meditation", href: "/innerwork/meditation", Icon: Brain },
  { label: "Breathwork", href: "/innerwork/meditation", Icon: Wind },
  { label: "Mudra", href: "/innerwork/meditation", Icon: Sparkles },
  { label: "Yoga", href: "/innerwork/yoga", Icon: Flower2 },
  { label: "Workout", href: "/innerwork/workout", Icon: Dumbbell },
  { label: "Audio Healing", href: "/innerwork/audio-healing", Icon: Music },
  { label: "Manifestation", href: "/innerwork/manifestasi", Icon: Activity },
];

export function WellnessPageClient() {
  const auth = useAuth();
  const { language } = useLanguage();
  const [intelligence, setIntelligence] = React.useState<WellnessDailyIntelligence | null>(null);
  const [decision, setDecision] = React.useState<InnerworkDailyDecision | null>(null);
  const [loading, setLoading] = React.useState(true);

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
    if (auth?.authStateResolved) void load();
  }, [auth?.authStateResolved, auth?.user?.uid]);

  if (loading) {
    return <main className="min-h-screen bg-[#FCFAF5] grid place-items-center text-[#4F5E52]">Mempersiapkan Wellness...</main>;
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
      <AppNav />
      <div className="mx-auto max-w-lg space-y-12">
        <BhumiPageHeader />
        <header className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9BB89A]">Wellness</p>
          <h1 className="mt-2 font-serif text-3xl text-[#4F5E52]">Ruang untuk Merawat Hari Ini</h1>
          <p className="mt-2 text-sm text-[#7B8776]">Periksa keadaanmu, pahami polanya, lalu pilih satu tindakan yang mendukung.</p>
        </header>

        <WellnessSection number="1" title="Check-in Hari Ini">
          <WellnessCheckInCard
            uid={auth?.user?.uid || ""}
            initialSnapshot={intelligence?.wellnessState?.wellnessSnapshot}
          />
          {intelligence?.wellnessState?.emotionalWord && (
            <p className="rounded-2xl bg-white p-4 text-sm text-[#526053]">
              Emosi saat ini: <strong>{intelligence.wellnessState.emotionalWord}</strong>
            </p>
          )}
        </WellnessSection>

        <WellnessSection number="2" title="Hasil Pemetaan">
          <WellnessAssessmentFlow uid={auth?.user?.uid || ""} language={language} />
        </WellnessSection>

        <WellnessSection number="3" title="Recommended Today">
          {intelligence && (
            <div className="rounded-3xl bg-[#F5F1E8]/60 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BB89A]">Tema Saat Ini</p>
              <p className="mt-2 font-serif text-xl text-[#4F5E52]">{intelligence.currentIssue.title}</p>
            </div>
          )}
          {decision ? (
            <>
              <div className="bhumi-card border-none bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9BB89A]">Praktik Utama</p>
                <h3 className="mt-2 font-serif text-xl font-bold text-[#4F5E52]">{decision.mainPractice.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#526053]">{decision.mainPractice.description}</p>
                <p className="mt-3 text-xs font-bold text-[#7B8776]">{decision.mainPractice.durationMinutes} menit</p>
              </div>
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
                    className="flex items-center justify-between rounded-2xl border border-[#E8E9E5] bg-white p-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#4F5E52]">{practice.title}</p>
                      <p className="mt-1 text-xs text-[#7B8776]">{practice.reason}</p>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-[#9BB89A]" />
                  </Link>
                ))}
              </div>
            </>
          ) : <p className="text-sm text-[#7B8776]">Rekomendasi sedang disiapkan.</p>}
        </WellnessSection>

        <WellnessSection number="4" title="Praktik Tambahan">
          <div className="grid grid-cols-2 gap-3">
            {PRACTICES.map(({ label, href, Icon }) => (
              <Link key={label} href={href} className="rounded-2xl border border-[#E8E9E5] bg-white p-5 text-center">
                <Icon size={22} className="mx-auto text-[#4F5E52]" />
                <span className="mt-3 block text-xs font-bold text-[#4F5E52]">{label}</span>
              </Link>
            ))}
          </div>
        </WellnessSection>

        <WellnessSection number="5" title="Dukungan untukmu">
          <SupportCard title="Sobat Mistis Bhumi Amartya" description="Belajar, bertumbuh, dan berjalan bersama komunitas Bhumi." href={COMMUNITY_CONFIG.whatsappLink} status="ACTIVE" Icon={Users} />
          <SupportCard title="Psikolog Terdekat" description="Temukan layanan psikolog yang tersedia di area terdekatmu." href="https://www.google.com/search?q=psikolog+terdekat" action="Cari Psikolog Terdekat" Icon={BriefcaseMedical} />
          <SupportCard title="Mitra Pendamping Bhumi" description="Jaringan pendamping terkurasi sedang dipersiapkan." status="COMING SOON" locked Icon={HeartHandshake} />
          <SupportCard title="Sejiwa" description="Akses informasi dan dukungan kesehatan mental dari Sejiwa." href="https://sejiwa.org/" Icon={HeartHandshake} />
          <SupportCard title="JKN Mobile / SATUSEHAT" description="Akses layanan kesehatan nasional dan informasi kesehatanmu." href="https://www.bpjs-kesehatan.go.id/" secondaryHref="https://satusehat.kemkes.go.id/" Icon={BriefcaseMedical} />
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
