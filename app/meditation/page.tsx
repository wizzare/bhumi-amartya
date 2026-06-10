"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FeatureLocked } from "@/components/billing/FeatureLocked";
import { AppNav } from "@/components/navigation/AppNav";
import { loadLocalJournalEntries } from "@/lib/journal/localJournal";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { hasFeatureAccess } from "@/lib/billing/accessControl";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { storageProvider } from "@/lib/storage/storageProvider";
import { useAuth } from "@/context/AuthContext";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import {
  createDailyMeditationPractice,
  createMeditationReflection,
  loadMeditationEntries,
  saveMeditationEntry,
  type DailyMeditationPractice,
  type MeditationReflection,
} from "@/lib/meditation/createDailyMeditationPractice";
import { type MudraName } from "@/lib/meditation/mudraGuides";
import { trackError, trackEvent } from "@/lib/analytics/usageAnalytics";

const EMOTIONAL_STATES = [
  "😊 Lebih ringan",
  "😌 Lebih tenang",
  "😢 Sedih",
  "😔 Bingung",
  "😠 Marah",
  "💭 Campur aduk",
  "⚡ Lebih berenergi",
  "🫧 Lebih kosong / lega",
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
  "Tidak ada sensasi khusus",
];

function createGoogleImageSearchUrl(query: string) {
  return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
}

function createYoutubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} mudra tutorial`)}`;
}

export default function MeditationPage() {
  const router = useRouter();
  const auth = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [blueprint, setBlueprint] = useState<Record<string, unknown> | null>(null);
  const [practice, setPractice] = useState<DailyMeditationPractice | null>(null);
  const [emotionalState, setEmotionalState] = useState("");
  const [bodySignals, setBodySignals] = useState<string[]>([]);
  const [bodyReflection, setBodyReflection] = useState("");
  const [reflection, setReflection] = useState<MeditationReflection | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWellnessLocked, setIsWellnessLocked] = useState(false);

  useEffect(() => {
    trackEvent("meditation_open");
  }, []);

  useEffect(() => {
    const initialize = async () => {
    try {
      const resolved = await resolveActiveProfile(auth);
      if (resolved.isLoading) return;
      if (resolved.isMissing) {
        router.replace("/setup");
        return;
      }
      setIsWellnessLocked(!hasFeatureAccess(resolved.profile as any, "meditation"));
      const parsedBlueprint = await storageProvider.getUserBlueprint();

      if (!resolved.profile || !parsedBlueprint) {
        router.replace("/setup");
        return;
      }

      const parsedProfile = resolved.profile as Record<string, unknown>;
      if (!parsedProfile || !parsedBlueprint) {
        setError("Data lokal belum siap. Silakan ulangi setup.");
        return;
      }
      const previousMeditationEntries = loadMeditationEntries();
      const previousJournalEntries = loadLocalJournalEntries();

      setProfile(parsedProfile);
      setBlueprint(parsedBlueprint as any);
      setPractice(
        createDailyMeditationPractice({
          profile: parsedProfile,
          blueprint: parsedBlueprint as any,
          previousMeditationEntries,
          previousJournalEntries,
        }),
      );
    } catch (loadError) {
      console.error("[Meditation Page] Failed to load local data", loadError);
      setError("Data lokal belum siap. Silakan ulangi setup.");
    } finally {
      setLoading(false);
    }
    };
    void initialize();
  }, [router, auth]);

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
    if (!practice) return;

    const generatedReflection = createMeditationReflection({
      theme: practice.theme,
      emotionalState,
      bodySignals,
      bodyReflection,
      blueprint,
    });
    const createdAt = new Date().toISOString();

    try {
      saveMeditationEntry({
        id: `meditation-${Date.now()}`,
        date: createdAt.slice(0, 10),
        theme: practice.theme,
        practices: practice.practices,
        emotionalState,
        bodySignals,
        bodyReflection,
        createdAt,
        insight: generatedReflection.insight,
        nextFocus: generatedReflection.nextFocus,
        mudraName: practice.mudra?.name as MudraName,
      });
      trackEvent("meditation_completed");
    } catch (error) {
      console.error("[Meditation Page] Failed to save meditation", error);
      trackError("failed_meditation_save", undefined, "local");
      return;
    }

    setReflection(generatedReflection);
    setSaved(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Menyiapkan ruang meditasi hari ini...</p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#E8E9E5]">
            <div className="h-full w-3/4 animate-pulse rounded-full bg-[#4F5E52]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !practice) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">{error || "Praktik meditasi belum siap."}</p>
        </div>
      </main>
    );
  }

  if (isWellnessLocked) {
    return <FeatureLocked />;
  }

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const firstName = typeof profile?.fullName === "string" ? profile.fullName.split(" ")[0] : "Jiwa";

  return (
    <main className="min-h-screen px-5 py-8 pb-24 bg-[#FCFAF5]">
      <AppNav />
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="bhumi-card p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <p className="text-sm text-[#7B8776]">{today}</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#4F5E52]">
            🧘 Meditasi Hari Ini
          </h1>
          <p className="mt-4 text-[#7B8776] leading-relaxed">
            {firstName}, meditasi membantu tubuh kembali merasa aman sebelum pikiran mencari jawaban. Ambil beberapa menit untuk mendengar ritme tubuhmu hari ini.
          </p>
        </header>

        <section className="bhumi-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9BB89A]">Theme</p>
          <h2 className="mt-2 text-2xl font-semibold text-[#4F5E52]">{practice.theme}</h2>
          <p className="mt-4 text-sm font-semibold text-[#7B8776]">Daily practice list</p>
          <p className="mt-2 text-[#4F5E52] leading-relaxed">
            Praktik hari ini menggabungkan meditasi, mudra, gerakan tubuh ringan, napas, dan afirmasi penutup.
          </p>
        </section>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Section A · Daily To-Do Practice</h2>
          <ol className="mt-5 space-y-4">
            {practice.practices.map((item, index) => (
              <li key={`${item}-${index}`} className="rounded-2xl bg-white/70 p-4 text-[#4F5E52] leading-relaxed">
                <span className="mr-3 text-sm font-semibold text-[#9BB89A]">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Panduan Mudra</h2>
          {practice.mudra ? (
            <>
              <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
                Mudra dilakukan selama meditasi berlangsung kecuali ada instruksi khusus.
              </p>
              <div className="mt-5 space-y-5">
                <article className="rounded-3xl bg-white/70 p-5 text-[#4F5E52]">
                  <h3 className="text-lg font-semibold">🖐 {practice.mudra.name}</h3>

                  <div className="mt-4 space-y-4 text-sm leading-relaxed">
                    <div>
                      <p className="font-semibold text-[#4F5E52]">Tujuan:</p>
                      <p className="mt-1 text-[#7B8776]">{practice.mudra.benefits}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#4F5E52]">Cara Melakukan:</p>
                      <ol className="mt-1 list-inside list-decimal text-[#7B8776]">
                        {practice.mudra.steps.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <p className="font-semibold text-[#4F5E52]">Durasi:</p>
                      <p className="mt-1 text-[#7B8776]">{practice.mudra.duration}</p>
                    </div>

                    {practice.mudra.affirmation && (
                       <div>
                         <p className="font-semibold text-[#4F5E52]">Afirmasi:</p>
                         <p className="mt-1 text-[#7B8776]">{practice.mudra.affirmation}</p>
                       </div>
                    )}

                    <div className="rounded-2xl bg-[#FCFAF5] p-4">
                      <p className="font-semibold text-[#4F5E52]">Referensi Belajar</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <a
                          href={createGoogleImageSearchUrl(practice.mudra.name)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#E8E9E5] bg-white px-4 py-3 text-center text-sm font-medium text-[#4F5E52] transition hover:bg-[#F5F1E8]"
                        >
                          Lihat Gambar Mudra
                        </a>
                        <a
                          href={createYoutubeSearchUrl(practice.mudra.name)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border border-[#E8E9E5] bg-white px-4 py-3 text-center text-sm font-medium text-[#4F5E52] transition hover:bg-[#F5F1E8]"
                        >
                          Lihat Video Tutorial
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </>
          ) : (
             <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">
              Panduan mudra sedang disiapkan.
            </p>
          )}
        </section>

        <section className="bhumi-card p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52]">Section B · Body Awareness After Practice</h2>
          <p className="mt-5 text-sm font-medium text-[#7B8776]">
            Bagaimana perasaanmu setelah praktik hari ini?
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

          <label className="mt-6 block text-sm font-medium text-[#7B8776]" htmlFor="bodyReflection">
            Apa yang kamu sadari dari tubuhmu hari ini?
          </label>
          <textarea
            id="bodyReflection"
            value={bodyReflection}
            onChange={(event) => setBodyReflection(event.target.value)}
            onInput={(event) => {
              event.currentTarget.style.height = "auto";
              event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
            }}
            className="mt-3 min-h-36 w-full resize-none rounded-3xl border border-[#E8E9E5] bg-white p-5 text-[#4F5E52] outline-none transition focus:border-[#9BB89A] focus:ring-2 focus:ring-[#9BB89A]/20"
            placeholder="Tuliskan satu atau dua hal yang tubuhmu sampaikan..."
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
            {saved ? "Praktik tersimpan..." : "Simpan Praktik"}
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
  );
}
