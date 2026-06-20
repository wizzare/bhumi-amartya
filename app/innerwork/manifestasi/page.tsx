"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Zap, Target, ArrowLeft, Loader2 } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import { cleanMarkdown } from "@/lib/utils/markdown";
import { dailyStateRepository } from "@/lib/repositories/dailyStateRepository";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { InnerworkCelebration } from "@/components/ui/InnerworkCelebration";
import { generateLocalManifestation } from "@/lib/orchestrators/localDailyGuidanceFallback";
import { useRouter } from "next/navigation";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import { storageProvider } from "@/lib/storage/storageProvider";

export default function ManifestasiPage() {
  const auth = useAuth();
  const router = useRouter();
  const [manifestation, setManifestation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchManifestation = async () => {
      if (!auth?.user?.uid) return;

      try {
        const profile = auth.userProfile;
        const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
        const today = getLocalDateKey(new Date(), timezone);

        const params = new URLSearchParams(window.location.search);
        const incomingIssue = params.get("issue");
        const incomingTheme = params.get("sourceTheme");

        if (incomingIssue && incomingTheme) {
           // Create input with mocked wellness results for generation
           const blueprint = await storageProvider.getUserBlueprint();

           // Ensure the category is recognizable by generateLocalManifestation
           // It maps topWellnessTheme -> category (grounding, expansion, worth, clarity, processing)
           const mappedCategory = incomingIssue.toUpperCase();

           const input: any = {
             user: profileToDashboardUser(profile as any),
             identity: profileToCoreIdentity(profile as any, blueprint as any),
             blueprint: blueprint as any,
             emotionalState: (profile as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
             emotionalMemory: (profile as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
             healingProgress: (profile as any)?.healingProgress || { healingStreak: 0 },
             astrologyTransits: null,
             language: (profile as any)?.language || "id",
             generatedAt: new Date().toISOString(),
             adaptiveContext: { dailyVariationSeed: today } as any,
             wellnessMapping: {
                results: [{ category: mappedCategory }]
             }
           };
           const themed = generateLocalManifestation(input, "zone_b_alignment");
           setManifestation(themed);
        } else {
          const dg = await dailyGuidanceRepository.getDailyGuidance(auth.user.uid, today);
          if (dg?.manifestation) {
            setManifestation(dg.manifestation);
          } else {
            // Fallback generation if missing in DG
            console.log("[MANIFESTASI] Missing in DG, using local fallback");
            const blueprint = await storageProvider.getUserBlueprint();

            // Safety fallback if blueprint is missing or calculation fails
            const input: any = {
              user: profileToDashboardUser(profile as any),
              identity: profileToCoreIdentity(profile as any, blueprint as any),
              blueprint: blueprint as any,
              emotionalState: (profile as any)?.emotionalState || { currentMood: 5, recurringThemes: [] },
              emotionalMemory: (profile as any)?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
              healingProgress: (profile as any)?.healingProgress || { healingStreak: 0 },
              astrologyTransits: null,
              language: (profile as any)?.language || "id",
              generatedAt: new Date().toISOString(),
              adaptiveContext: { dailyVariationSeed: today } as any,
            };

            const localFallback = generateLocalManifestation(input, "ui_fallback");
            setManifestation(localFallback);
          }
        }
      } catch (err) {
        console.error("[MANIFESTASI_FETCH_ERROR]", err);
        // Absolute fallback to prevent empty page
        setManifestation({
          affirmation: "Hari ini aku memilih untuk hadir sepenuhnya bagi diriku sendiri.",
          assumption: "Aku percaya bahwa setiap langkah kecilku membawa dampak besar.",
          attraction: "Aku mengundang kedamaian dan kejernihan dalam setiap tindakanku."
        });
      } finally {
        setLoading(false);
      }
    };

    if (auth?.authStateResolved) {
      fetchManifestation();
    }
  }, [auth]);

  const handleComplete = async () => {
    if (!auth?.user?.uid || saved) return;

    setSaved(true);
    trackEvent("practice_completed", auth.user.uid);

    const profile = auth.userProfile;
    const timezone = profile?.timezone || (profile as any)?.profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const dateKey = getLocalDateKey(new Date(), timezone);

    await dailyStateRepository.saveDailyState(auth.user.uid, dateKey, {
      manifestDone: true,
    }).catch(err => console.error("[MANIFESTASI_SAVE_ERROR]", err));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <Loader2 className="animate-spin text-[#4F5E52]" size={32} />
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />

        <div className="mx-auto max-w-lg">
          <Link href="/wellness" className="flex items-center gap-2 text-[#7B8776] mb-6 hover:text-[#4F5E52] transition-colors">
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Kembali ke Wellness</span>
          </Link>

          <header className="mb-10">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-6">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-serif text-[#4F5E52] mb-2">Manifestasi Hari Ini</h1>
            <p className="text-[#7B8776]">Menyelaraskan batin dengan energi dan niatmu.</p>
          </header>

          <div className="space-y-6">
            <section className="bhumi-card p-8 bg-white border-none shadow-sm space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />

              {/* A. Affirmation */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="mt-1 p-2.5 rounded-2xl bg-orange-50 text-orange-500 shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
                    Affirmation
                  </p>
                  <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
                    &quot;{cleanMarkdown(manifestation.affirmation)}&quot;
                  </p>
                </div>
              </div>

              {/* B. Assumption */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="mt-1 p-2.5 rounded-2xl bg-blue-50 text-blue-500 shrink-0">
                  <Target size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
                    Assumption
                  </p>
                  <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
                    &quot;{cleanMarkdown(manifestation.assumption)}&quot;
                  </p>
                </div>
              </div>

              {/* C. Attraction */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="mt-1 p-2.5 rounded-2xl bg-emerald-50 text-emerald-500 shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#7B8776] mb-1.5">
                    Attraction
                  </p>
                  <p className="text-[15px] text-[#3C3C3C] leading-relaxed font-bold italic">
                    &quot;{cleanMarkdown(manifestation.attraction)}&quot;
                  </p>
                </div>
              </div>
            </section>

            <div className="pt-4">
              <p className="mb-4 text-[10px] text-[#7B8776] font-bold uppercase tracking-wider text-center">
                Klik save hanya jika kamu sudah melakukan.
              </p>
              <button
                onClick={handleComplete}
                disabled={saved}
                className={`w-full py-5 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-lg active:scale-[0.98] ${saved ? 'bg-emerald-600 text-white' : 'bg-[#4F5E52] text-white hover:bg-[#3D4A3F]'}`}
              >
                {saved ? 'Selesai ✨' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <InnerworkCelebration isOpen={saved} />
    </ProtectedRoute>
  );
}
