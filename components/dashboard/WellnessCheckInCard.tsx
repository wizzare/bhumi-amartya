"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Battery,
  Moon,
  Target,
  CheckCircle2,
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

interface WellnessCheckInCardProps {
  uid: string;
  initialSnapshot?: WellnessSnapshot | null;
  onCompleted?: (snapshot: WellnessSnapshot) => void;
}

const STANDARDIZED_NEEDS: { value: WellnessNeed; label: string; emoji: string }[] = [
  { value: "REST", label: "Istirahat", emoji: "😴" },
  { value: "CLARITY", label: "Kejernihan", emoji: "💎" },
  { value: "CONNECTION", label: "Koneksi", emoji: "🤝" },
  { value: "MOVEMENT", label: "Gerak", emoji: "🏃" },
  { value: "PEACE", label: "Ketenangan", emoji: "🍃" },
  { value: "COURAGE", label: "Keberanian", emoji: "🦁" },
  { value: "FOCUS", label: "Fokus", emoji: "🎯" },
  { value: "HEALING", label: "Pemulihan", emoji: "🩹" },
];

export function WellnessCheckInCard({ uid, initialSnapshot, onCompleted }: WellnessCheckInCardProps) {
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
        checkInCompleted: true,
        updatedAt: new Date().toISOString(),
      };

      await dailyStateRepository.saveDailyState(uid, dateKey, {
        wellnessSnapshot: snapshot,
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
            Mari Berhenti Sejenak
          </h3>
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Hanya butuh 1 menit untuk check-in harimu.
          </p>
        </header>

        <button
          onClick={() => setStep("active")}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#4F5E52] text-white text-sm font-bold hover:bg-[#3D4A3F] transition-all shadow-md active:scale-[0.98]"
        >
          Mulai Check-In
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  if (step === "active") {
    return (
      <div className="bhumi-card p-8 bg-white border-none shadow-sm">
        <header className="mb-8">
          <h3 className="text-[#4F6658] font-bold text-xl italic">Kondisi Saat Ini</h3>
          <div className="h-1 w-full bg-[#F5F1E8] rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-[#4F5E52] transition-all duration-500 w-1/2" />
          </div>
        </header>

        <div className="space-y-8 mb-10">
          <MetricSlider
            label="Kualitas Tidur"
            icon={<Moon size={18} />}
            value={metrics.sleep}
            onChange={(v) => handleMetricChange("sleep", v)}
          />
          <MetricSlider
            label="Level Energi"
            icon={<Battery size={18} />}
            value={metrics.energy}
            onChange={(v) => handleMetricChange("energy", v)}
          />
          <MetricSlider
            label="Kondisi Emosi"
            icon={<Heart size={18} />}
            value={metrics.emotion}
            onChange={(v) => handleMetricChange("emotion", v)}
          />
          <MetricSlider
            label="Fokus Mental"
            icon={<Target size={18} />}
            value={metrics.focus}
            onChange={(v) => handleMetricChange("focus", v)}
          />
          <MetricSlider
            label="Koneksi Sosial"
            icon={<Users size={18} />}
            value={metrics.social}
            onChange={(v) => handleMetricChange("social", v)}
          />
        </div>

        <div className="mb-10">
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Apa yang kamu butuhkan?</p>
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
                {need.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-[#4F5E52] text-white text-sm font-bold shadow-md active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Selesaikan Check-In"}
        </button>
      </div>
    );
  }

  return (
    <div className="bhumi-card p-8 bg-[#FCFAF5] border border-[#E8E9E5]/50 shadow-sm">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-[#4F6658] font-bold text-xl italic">Kondisimu Hari Ini</h3>
          <p className="text-[#7B8776] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Refleksi Selesai</p>
        </div>
        <CheckCircle2 className="text-emerald-500" size={28} />
      </header>

      <div className="grid grid-cols-5 gap-2 mb-8">
        <StatusMiniCard label="Tidur" value={metrics.sleep} color="indigo" />
        <StatusMiniCard label="Energi" value={metrics.energy} color="orange" />
        <StatusMiniCard label="Emosi" value={metrics.emotion} color="red" />
        <StatusMiniCard label="Fokus" value={metrics.focus} color="blue" />
        <StatusMiniCard label="Koneksi" value={metrics.social} color="teal" />
      </div>

      <button
        onClick={() => setStep("active")}
        className="text-[10px] text-[#7B8776] font-bold uppercase tracking-widest block mx-auto hover:text-[#4F6658]"
      >
        Update Kondisi
      </button>
    </div>
  );
}

function MetricSlider({ label, icon, value, onChange }: { label: string; icon: React.ReactNode; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-[#4F6658]">
        <div className="flex items-center gap-2">
          <span className="opacity-60">{icon}</span>
          <span className="text-sm font-bold">{label}</span>
        </div>
        <span className="text-lg font-serif italic font-bold">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-[#F5F1E8] rounded-full appearance-none cursor-pointer accent-[#4F5E52]"
      />
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
