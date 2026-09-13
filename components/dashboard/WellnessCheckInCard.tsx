"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Battery,
  Moon,
  Target,
  CheckCircle2,
  Check,
  ArrowRight,
  Zap,
  Users
} from "lucide-react";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { WellnessSnapshot, WellnessNeed } from "@/lib/data/types";
import { getWellnessRecommendation, WellnessRecommendation } from "@/lib/engines/wellnessRecommendationEngine";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { participationEngine } from "@/lib/engines/participationEngine";
import { isEnlEdition } from "@/lib/config/edition";

interface WellnessCheckInCardProps {
  uid: string;
  initialSnapshot?: WellnessSnapshot | null;
  onCompleted?: (snapshot: WellnessSnapshot) => void;
  isEn?: boolean;
}

const STANDARDIZED_NEEDS: { value: WellnessNeed; label: { id: string; en: string }; emoji: string }[] = [
  { value: "REST", label: { id: "Istirahat", en: "Rest" }, emoji: "😴" },
  { value: "CLARITY", label: { id: "Kejernihan", en: "Clarity" }, emoji: "💎" },
  { value: "CONNECTION", label: { id: "Koneksi", en: "Connection" }, emoji: "🤝" },
  { value: "MOVEMENT", label: { id: "Gerak", en: "Movement" }, emoji: "🏃" },
  { value: "PEACE", label: { id: "Ketenangan", en: "Peace" }, emoji: "🍃" },
  { value: "COURAGE", label: { id: "Keberanian", en: "Courage" }, emoji: "🦁" },
  { value: "FOCUS", label: { id: "Fokus", en: "Focus" }, emoji: "🎯" },
  { value: "HEALING", label: { id: "Pemulihan", en: "Healing" }, emoji: "🩹" },
];

const HEALTH_OPTIONS = [
  { value: "normal", label: { id: "Normal", en: "Normal" } },
  { value: "kurang_fit", label: { id: "Kurang Fit", en: "Under the Weather" } },
  { value: "ringan", label: { id: "Ringan", en: "Mild" } },
  { value: "sedang", label: { id: "Sedang", en: "Moderate" } },
  { value: "berat", label: { id: "Berat", en: "Severe" } },
] as const;

const LIFE_SITUATION_GROUPS = [
  { id: "work", label: { id: "Ekonomi & Kerja", en: "Work & Finances" } },
  { id: "relationship", label: { id: "Cinta & Rumah Tangga", en: "Love & Family" } },
  { id: "other", label: { id: "Kondisi Lain", en: "Other Conditions" } },
] as const;

const LIFE_SITUATION_OPTIONS = [
  { value: "wf_none", label: { id: "Normal atau baik-baik saja", en: "Normal or doing well" }, groupId: "work" },
  { value: "wf_job_hunting", label: { id: "Sedang mencari pekerjaan", en: "Job seeking" }, groupId: "work" },
  { value: "wf_economic_strain", label: { id: "Tekanan ekonomi", en: "Financial stress" }, groupId: "work" },
  { value: "wf_high_workload", label: { id: "Tekanan atau tuntutan kantor", en: "Workplace pressure" }, groupId: "work" },
  { value: "wf_work_conflict", label: { id: "Konflik pekerjaan", en: "Workplace conflict" }, groupId: "work" },
  { value: "rel_none", label: { id: "Normal atau baik-baik saja", en: "Normal or doing well" }, groupId: "relationship" },
  { value: "rel_partner_conflict", label: { id: "Konflik pasangan", en: "Partner conflict" }, groupId: "relationship" },
  { value: "rel_family_conflict", label: { id: "Konflik keluarga", en: "Family conflict" }, groupId: "relationship" },
  { value: "rel_divorce", label: { id: "Dalam proses perceraian", en: "Going through divorce" }, groupId: "relationship" },
  { value: "rel_heartbreak", label: { id: "Perpisahan atau putus hubungan", en: "Breakup or separation" }, groupId: "relationship" },
  { value: "fam_parent_care", label: { id: "Merawat keluarga", en: "Caring for family" }, groupId: "other" },
  { value: "fam_major_transition", label: { id: "Masa transisi", en: "Major life transition" }, groupId: "other" },
  { value: "soc_lonely", label: { id: "Tekanan sosial atau kesepian", en: "Social pressure or loneliness" }, groupId: "other" },
] as const;

function checkInFingerprint(input: Pick<WellnessSnapshot, "metrics" | "needs" | "lifeSituation" | "healthCondition">): string {
  return JSON.stringify({
    metrics: input.metrics,
    needs: [...input.needs].sort(),
    lifeSituation: [...(input.lifeSituation || [])].sort(),
    healthCondition: input.healthCondition || "normal",
  });
}

export function WellnessCheckInCard({ uid, initialSnapshot, onCompleted, isEn: isEnProp }: WellnessCheckInCardProps) {
  const isEn = false;
  const langKey = "id";
  const [step, setStep] = useState<"pending" | "active" | "completed">(
    initialSnapshot?.checkInCompleted ? "completed" : "pending"
  );
  const [metrics, setMetrics] = useState({
    sleep: initialSnapshot?.metrics.sleep || 5,
    energy: initialSnapshot?.metrics.energy || 5,
    emotion: initialSnapshot?.metrics.emotion || 5,
    focus: initialSnapshot?.metrics.focus || 5,
    social: initialSnapshot?.metrics.social || 5,
  });
  const [selectedNeeds, setSelectedNeeds] = useState<WellnessNeed[]>(initialSnapshot?.needs || []);
  const legacyHealthMap: Record<string, typeof HEALTH_OPTIONS[number]["value"]> = { Healthy: "normal", "Less Fit": "kurang_fit", "Mild Illness": "ringan", "Moderate Illness": "sedang", "Severe Illness": "berat" };
  const [healthCondition, setHealthCondition] = useState<typeof HEALTH_OPTIONS[number]["value"]>(
    legacyHealthMap[initialSnapshot?.healthCondition || ""] || (initialSnapshot?.healthCondition as typeof HEALTH_OPTIONS[number]["value"]) || "normal"
  );
  const [lifeSituation, setLifeSituation] = useState<string[]>(initialSnapshot?.lifeSituation || []);
  const [saving, setSaving] = useState(false);
  const [recommendation, setRecommendation] = useState<WellnessRecommendation | null>(
    initialSnapshot ? getWellnessRecommendation(initialSnapshot) : null
  );

  const handleMetricChange = (name: string, value: number) => {
    setMetrics((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNeed = (need: WellnessNeed) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { storageProvider } = await import("@/lib/storage/storageProvider");
      const profile = await storageProvider.getUserProfile();
      const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const dateKey = getLocalDateKey(new Date(), timezone);

      const snapshot: WellnessSnapshot = {
        metrics,
        needs: selectedNeeds,
        lifeSituation,
        healthCondition,
        checkInCompleted: true,
        updatedAt: new Date().toISOString(),
      };
      const existingState = await dailyStateRepository.getDailyState(uid, dateKey).catch(() => null);
      const fingerprint = checkInFingerprint(snapshot);
      const checkInRevision = existingState?.checkInFingerprint === fingerprint
        ? existingState.checkInRevision || 1
        : (existingState?.checkInRevision || 0) + 1;
      await dailyStateRepository.saveDailyState(uid, dateKey, {
        wellnessSnapshot: snapshot,
        checkInRevision,
        checkInFingerprint: fingerprint,
      });
      setRecommendation(getWellnessRecommendation(snapshot));
      setStep("completed");
      trackEvent("wellness_checkin_completed", uid);
      void participationEngine.recordActivity(uid, "check-in");
      if (onCompleted) onCompleted(snapshot);
    } catch (error) {
      console.error("Failed to save wellness check-in:", error);
    } finally {
      setSaving(false);
    }
  };

  if (step === "pending") {
    return (
      <div className="bhumi-card p-8 bg-white border-none shadow-sm group">
        <header className="mb-6">
          <h3 className="text-[#4F6658] font-bold text-xl italic flex items-center gap-2">
            <Zap size={20} className="text-yellow-500 fill-yellow-500" />
            {isEn ? "Pause for a Moment" : "Jeda Sejenak"}
          </h3>
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {isEn ? "Help Bhumi understand how you feel today in 1 minute." : "Bantu Bhumi memahami kondisimu hari ini dalam 1 menit."}
          </p>
        </header>

        <button
          onClick={() => setStep("active")}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#4F5E52] text-white text-sm font-bold hover:bg-[#3D4A3F] transition-all shadow-md active:scale-[0.98]"
        >
          {isEn ? "Start Self Check-In" : "Mulai Check-in Diri"}
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (step === "active") {
    return (
      <div className="bhumi-card p-8 bg-white border-none shadow-sm">
        <header className="mb-8">
          <h3 className="text-[#4F6658] font-bold text-xl italic">{isEn ? "How Are You Today?" : "Bagaimana Kabarmu?"}</h3>
          <div className="h-1 w-full bg-[#F5F1E8] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#4F5E52] transition-all duration-500 w-1/2" />
          </div>
        </header>

        <div className="space-y-8 mb-10">
          <MetricSlider
            label={isEn ? "Sleep Quality" : "Kualitas Tidur"}
            icon={<Moon size={18} />}
            value={metrics.sleep}
            onChange={(v) => handleMetricChange("sleep", v)}
            isEn={isEn}
          />
          <MetricSlider
            label={isEn ? "Energy Level" : "Kondisi Energi"}
            icon={<Battery size={18} />}
            value={metrics.energy}
            onChange={(v) => handleMetricChange("energy", v)}
            isEn={isEn}
          />
          <MetricSlider
            label={isEn ? "Emotional State" : "Kondisi Emosi"}
            icon={<Heart size={18} />}
            value={metrics.emotion}
            onChange={(v) => handleMetricChange("emotion", v)}
            isEn={isEn}
          />
          <MetricSlider
            label={isEn ? "Mental Focus" : "Fokus Mental"}
            icon={<Target size={18} />}
            value={metrics.focus}
            onChange={(v) => handleMetricChange("focus", v)}
            isEn={isEn}
          />
          <MetricSlider
            label={isEn ? "Social Connection" : "Koneksi Sosial"}
            icon={<Users size={18} />}
            value={metrics.social}
            onChange={(v) => handleMetricChange("social", v)}
            isEn={isEn}
          />
        </div>

        <div className="mb-10">
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
            {isEn ? "What does your soul need most right now?" : "Apa yang paling jiwamu butuhkan saat ini?"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {STANDARDIZED_NEEDS.map((need) => (
              <button
                key={need.value}
                onClick={() => toggleNeed(need.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-xs font-bold ${
                  selectedNeeds.includes(need.value)
                    ? "bg-[#4F5E52] text-white border-[#4F5E52]"
                    : "bg-[#FCFAF5] text-[#7B8776] border-[#E8E9E5] hover:border-[#7B8776]"
                }`}
              >
                <span>{need.emoji}</span>
                {need.label[langKey]}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10 space-y-5">
          <div>
            <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
              {isEn ? "Health condition today" : "Kondisi kesehatan hari ini"}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {HEALTH_OPTIONS.map((option) => (
                <button key={option.value} type="button" onClick={() => setHealthCondition(option.value)}
                  className={`rounded-xl border px-2 py-3 text-[11px] font-bold ${healthCondition === option.value ? "border-[#4F5E52] bg-[#4F5E52] text-white" : "border-[#E8E9E5] bg-[#FCFAF5] text-[#7B8776]"}`}>
                  {option.label[langKey]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
              {isEn ? "What's taking up your space? (optional)" : "Hal yang sedang memenuhi ruangmu (opsional)"}
            </p>
            <div className="space-y-3">
              {LIFE_SITUATION_GROUPS.map((group) => (
                <div key={group.id}>
                  <p className="mb-2 text-xs font-semibold text-[#526053]">{group.label[langKey]}</p>
                  <div className="flex flex-wrap gap-2">
                    {LIFE_SITUATION_OPTIONS.filter((option) => option.groupId === group.id).map((option) => {
                      const selected = lifeSituation.includes(option.value);
                      return <button key={option.value} type="button" onClick={() => setLifeSituation((current) => selected ? current.filter((id) => id !== option.value) : [...current, option.value])}
                        className={`rounded-full border px-3 py-2 text-[11px] font-semibold ${selected ? "border-[#4F5E52] bg-[#4F5E52] text-white" : "border-[#E8E9E5] bg-white text-[#7B8776]"}`}>{option.label[langKey]}</button>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-[#4F5E52] text-white text-sm font-bold shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? (isEn ? "Saving..." : "Menyimpan...") : (isEn ? "Save Today's Check-In" : "Simpan Kabar Hari Ini")}
        </button>
      </div>
    );
  }

  return (
    <div className="bhumi-card p-8 bg-[#FCFAF5] border border-[#E8E9E5]/50 shadow-sm">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-[#4F6658] font-bold text-xl italic">{isEn ? "Your Condition Today" : "Kondisimu Hari Ini"}</h3>
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">{isEn ? "Check-In Saved" : "Kabar Tersimpan"}</p>
        </div>
        <CheckCircle2 className="text-emerald-500" size={28} />
      </header>

      <div className="grid grid-cols-5 gap-2 mb-8">
        <StatusMiniCard label={isEn ? "Sleep" : "Tidur"} value={metrics.sleep} color="indigo" />
        <StatusMiniCard label={isEn ? "Energy" : "Energi"} value={metrics.energy} color="orange" />
        <StatusMiniCard label={isEn ? "Emotion" : "Emosi"} value={metrics.emotion} color="red" />
        <StatusMiniCard label={isEn ? "Focus" : "Fokus"} value={metrics.focus} color="blue" />
        <StatusMiniCard label={isEn ? "Connection" : "Koneksi"} value={metrics.social} color="teal" />
      </div>

      <button
        onClick={() => setStep("active")}
        className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest block mx-auto hover:text-[#4F6658]"
      >
        {isEn ? "Update Check-In" : "Perbarui Kabar"}
      </button>
    </div>
  );
}

const AGREEMENT_SCALE = [
  { point: 1, storedValue: 10, tone: "agreement", size: "h-8 w-8 min-[420px]:h-10 min-[420px]:w-10", label: { id: "Sangat baik", en: "Very good" } },
  { point: 2, storedValue: 8, tone: "agreement", size: "h-7 w-7 min-[420px]:h-9 min-[420px]:w-9", label: { id: "Baik", en: "Good" } },
  { point: 3, storedValue: 7, tone: "agreement", size: "h-6 w-6 min-[420px]:h-8 min-[420px]:w-8", label: { id: "Cukup baik", en: "Fairly good" } },
  { point: 4, storedValue: 5, tone: "neutral", size: "h-5 w-5 min-[420px]:h-7 min-[420px]:w-7", label: { id: "Netral", en: "Neutral" } },
  { point: 5, storedValue: 4, tone: "disagreement", size: "h-6 w-6 min-[420px]:h-8 min-[420px]:w-8", label: { id: "Agak tidak baik", en: "Slightly low" } },
  { point: 6, storedValue: 3, tone: "disagreement", size: "h-7 w-7 min-[420px]:h-9 min-[420px]:w-9", label: { id: "Tidak baik", en: "Low" } },
  { point: 7, storedValue: 1, tone: "disagreement", size: "h-8 w-8 min-[420px]:h-10 min-[420px]:w-10", label: { id: "Sangat tidak baik", en: "Very low" } },
] as const;

function scalePointFromStoredValue(value: number): (typeof AGREEMENT_SCALE)[number]["point"] {
  const match = AGREEMENT_SCALE.reduce((nearest, option) => (
    Math.abs(option.storedValue - value) < Math.abs(nearest.storedValue - value) ? option : nearest
  ), AGREEMENT_SCALE[0]);
  return match.point;
}

function toneClasses(tone: (typeof AGREEMENT_SCALE)[number]["tone"], selected: boolean) {
  if (tone === "agreement") {
    return selected
      ? "border-[#2FA36F] bg-[#2FA36F] text-white"
      : "border-[#2FA36F] bg-white text-[#2FA36F]";
  }
  if (tone === "disagreement") {
    return selected
      ? "border-[#8A5B9F] bg-[#8A5B9F] text-white"
      : "border-[#8A5B9F] bg-white text-[#8A5B9F]";
  }
  return selected
    ? "border-[#9AA1AD] bg-[#9AA1AD] text-white"
    : "border-[#9AA1AD] bg-white text-[#9AA1AD]";
}

function MetricSlider({ label, icon, value, onChange, isEn = false }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void; isEn?: boolean }) {
  const selectedPoint = scalePointFromStoredValue(value);
  const selectedOption = AGREEMENT_SCALE.find((option) => option.point === selectedPoint) ?? AGREEMENT_SCALE[3];
  const langKey = isEn ? "en" : "id";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-[#4F6658]">
        <div className="flex items-center gap-2">
          <span className="opacity-60">{icon}</span>
          <span className="text-sm font-bold">{label}</span>
        </div>
        <span className="text-xs font-bold text-[#7B8776]">{selectedOption.label[langKey]}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[12px] font-semibold text-[#2FA36F] min-[420px]:text-sm">{isEn ? "Good" : "Baik"}</span>
          <span className="text-right text-[12px] font-semibold text-[#8A5B9F] min-[420px]:text-sm">{isEn ? "Low" : "Tidak Baik"}</span>
        </div>
        <div className="flex min-w-0 items-center justify-between gap-1 min-[420px]:gap-2">
          {AGREEMENT_SCALE.map((option) => {
            const selected = option.point === selectedPoint;
            return (
              <button
                key={option.point}
                type="button"
                onClick={() => onChange(option.storedValue)}
                aria-label={`${label}: ${option.label[langKey]}`}
                aria-pressed={selected}
                className="flex h-9 w-8 shrink-0 items-center justify-center rounded-full min-[420px]:h-11 min-[420px]:w-10"
              >
                <span
                  className={`${option.size} flex items-center justify-center rounded-full border-[2.5px] transition-all ${toneClasses(option.tone, selected)} ${selected ? "shadow-sm" : ""}`}
                >
                  {selected && <Check size={15} strokeWidth={2.4} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusMiniCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-teal-50 text-teal-600",
  };
  return (
    <div className={`p-3 rounded-2xl text-center ${colors[color]}`}>
      <p className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-70">{label}</p>
      <p className="text-lg font-serif italic font-bold leading-none">{value}</p>
    </div>
  );
}
