"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureLocked } from "@/components/billing/FeatureLocked";
import { PremiumLock } from "@/components/auth/PremiumLock";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { AppNav } from "@/components/navigation/AppNav";
import { APP_MODE } from "@/lib/config/appMode";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { hasFeatureAccess } from "@/lib/billing/accessControl";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { useAuth } from "@/context/AuthContext";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import {
  AUDIO_HEALING_EMBED_URL,
  AUDIO_HEALING_PLAYLIST_URL,
  createAudioHealingReflection,
  saveAudioHealingEntry,
  type AudioHealingReflection,
} from "@/lib/audioHealing/localAudioHealing";

const EMOTIONAL_STATES = [
  "😊 Lebih ringan",
  "😌 Lebih tenang",
  "😢 Sedih",
  "😔 Bingung",
  "😠 Marah",
  "💭 Campur aduk",
  "🫧 Lebih lega",
  "🌙 Mengantuk",
  "⚡ Lebih berenergi",
];

const BODY_SIGNALS = [
  "Bahu tegang",
  "Dada terasa berat",
  "Tenggorokan terasa mengganjal",
  "Perut tidak nyaman",
  "Mata berkaca-kaca",
  "Tubuh lebih rileks",
  "Napas lebih panjang",
  "Kepala lebih ringan",
  "Mengantuk",
  "Tidak ada sensasi khusus",
];

function AudioHealingExperience() {
  const router = useRouter();
  const auth = useAuth();
  const [emotionalState, setEmotionalState] = useState("");
  const [bodySignals, setBodySignals] = useState<string[]>([]);
  const [reflectionText, setReflectionText] = useState("");
  const [reflection, setReflection] = useState<AudioHealingReflection | null>(null);
  const [saved, setSaved] = useState(false);
  const [isWellnessLocked, setIsWellnessLocked] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const resolved = await resolveActiveProfile(auth);
      if (resolved.isLoading) return;
      if (resolved.isMissing) return;
      setIsWellnessLocked(!hasFeatureAccess(resolved.profile as any, "audioHealing"));
    };
    void initialize();
  }, [auth]);

  const toggleBodySignal = (signal: string) => {
    setBodySignals((current) => {
      if (signal === "Tidak ada sensasi khusus") {
        return current.includes(signal) ? [] : [signal];
      }

      const withoutNone = current.filter((item) => item !== "Tidak ada sensasi khusus");
      if (withoutNone.includes(signal)) {
        return withoutNone.filter((item) => item !== signal);
      }

      return [...withoutNone, signal];
    });
  };

  const handleSave = () => {
    const generatedReflection = createAudioHealingReflection({
      emotionalState,
      bodySignals,
      reflectionText,
    });
    const createdAt = new Date().toISOString();

    saveAudioHealingEntry({
      id: `audio-healing-${Date.now()}`,
      date: createdAt.slice(0, 10),
      playlistUrl: AUDIO_HEALING_PLAYLIST_URL,
      emotionalState,
      bodySignals,
      reflectionText,
      createdAt,
      insight: generatedReflection.insight,
      nextFocus: generatedReflection.nextFocus,
    });

    setReflection(generatedReflection);
    setSaved(true);
  };

  return (
    isWellnessLocked ? (
      <FeatureLocked />
    ) : (
    <main className="min-h-screen px-5 py-8 pb-24 bg-[#FCFAF5]">
      <AppNav />
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bhumi-card p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <h1 className="text-3xl font-semibold text-[#4F5E52]">
            🎧 Audio Healing
          </h1>
          <p className="mt-4 text-[#7B8776] leading-relaxed">
            Pilih audio yang ingin kamu dengarkan hari ini. Setelah selesai, luangkan waktu sejenak untuk mencatat apa yang kamu rasakan di tubuh dan emosimu.
          </p>
        </header>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Section A · Playlist</h2>
          <div className="mt-5 overflow-hidden rounded-3xl bg-black shadow-sm">
            <div className="relative w-full pt-[56.25%]">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={AUDIO_HEALING_EMBED_URL}
                title="Audio Healing YouTube Playlist"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          
          <div className="mt-4 rounded-2xl bg-[#F5F1E8] p-4 text-center">
            <p className="text-sm font-medium text-[#4F5E52]">Playlist tidak dapat diputar di dalam aplikasi?</p>
            <a 
              href={AUDIO_HEALING_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#4F5E52] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#3D4A3F]"
            >
              🎧 Buka Playlist di YouTube
            </a>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-[#7B8776]">
            Dengarkan tanpa memaksa tubuhmu untuk langsung tenang. Cukup perhatikan apa yang muncul.
          </p>
        </section>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Section B · Audio Healing Reflection</h2>
          <p className="mt-5 text-sm font-medium text-[#7B8776]">
            Bagaimana perasaanmu setelah mendengar audio healing?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {EMOTIONAL_STATES.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setEmotionalState(state)}
                className={`rounded-2xl border p-4 text-left text-sm transition ${
                  emotionalState === state
                    ? "border-[#4F5E52] bg-[#F5F1E8] text-[#4F5E52]"
                    : "border-[#E8E9E5] bg-white text-[#7B8776]"
                }`}
              >
                {state}
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm font-medium text-[#7B8776]">
            Apakah ada sensasi pada tubuhmu?
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {BODY_SIGNALS.map((signal) => (
              <label
                key={signal}
                className="flex items-center gap-3 rounded-2xl border border-[#E8E9E5] bg-white p-4 text-sm text-[#4F5E52]"
              >
                <input
                  type="checkbox"
                  checked={bodySignals.includes(signal)}
                  onChange={() => toggleBodySignal(signal)}
                  className="h-4 w-4 rounded border-[#9BB89A] text-[#4F5E52]"
                />
                {signal}
              </label>
            ))}
          </div>

          <label className="mt-6 block text-sm font-medium text-[#7B8776]" htmlFor="audioReflection">
            Apa yang kamu sadari setelah mendengar audio ini?
          </label>
          <textarea
            id="audioReflection"
            value={reflectionText}
            onChange={(event) => setReflectionText(event.target.value)}
            onInput={(event) => {
              event.currentTarget.style.height = "auto";
              event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
            }}
            className="mt-3 min-h-36 w-full resize-none rounded-3xl border border-[#E8E9E5] bg-white p-5 text-[#4F5E52] outline-none transition focus:border-[#9BB89A] focus:ring-2 focus:ring-[#9BB89A]/20"
            placeholder="Tuliskan respons tubuhmu, emosimu, atau suara yang paling terasa..."
          />
        </section>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Section C · Save</h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className="mt-5 w-full rounded-full bg-[#4F5E52] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#3D4A3F] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saved ? "Pengalaman tersimpan..." : "Simpan Pengalaman"}
          </button>

          {reflection && (
            <div className="mt-6 space-y-4 rounded-3xl bg-[#FCFAF5] p-5">
              <div>
                <p className="text-sm font-semibold text-[#4F5E52]">🌱 Insight Hari Ini</p>
                <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{reflection.insight}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#4F5E52]">✨ Fokus Besok</p>
                <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">{reflection.nextFocus}</p>
              </div>
              <p className="text-xs text-[#9BB89A]">Mengembalikanmu ke dashboard...</p>
            </div>
          )}
        </section>
      </div>
      <InnerworkCelebration isOpen={saved} />
    </main>
    )
  );
}

export default function AudioHealingPage() {
  if (APP_MODE === "local-first") {
    return (
      <AccessGuard feature="audio-healing">
        <AudioHealingExperience />
      </AccessGuard>
    );
  }

  return (
    <ProtectedRoute requireProfile>
      <AccessGuard feature="audio-healing">
      <PremiumLock feature="audio-healing">
        <AudioHealingExperience />
      </PremiumLock>
      </AccessGuard>
    </ProtectedRoute>
  );
}
