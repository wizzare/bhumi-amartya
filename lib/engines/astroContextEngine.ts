/**
 * BHUMI AMARTYA - Astro Context Engine
 * Focus: Real-time 'Life Timing' Synthesis.
 * Principle: Never mentions astrology jargon to the user.
 */

import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { IntegratedIdentity } from "./blueprintSynthesisNarrative";

export interface AstroContextResult {
  timingTheme: string;
  timingInsight: string;
  timingFocus: string;
}

export const astroContextEngine = {
  /**
   * Synthesizes Transit Weather + Fixed Blueprint + Growth Phase.
   */
  synthesize(
    synthesis: UnifiedBlueprintSynthesis,
    transits: any,
    integrated: IntegratedIdentity,
    language: string = "id"
  ): AstroContextResult {
    const isId = language !== "en";

    // 1. Extract Transit "Weather"
    const activeTransits = transits?.activeTransits || [];
    const moonPhase = transits?.moonPhase || "Normal";
    const retrogrades = transits?.retrogrades || [];

    // Detect Dominant Weather Pattern
    const isHeavyMental = activeTransits.some((t: any) => t.planet === "Mercury" || t.themes?.includes("thought"));
    const isHeavyEmotion = activeTransits.some((t: any) => t.planet === "Moon" || t.planet === "Venus" || t.themes?.includes("relationship"));
    const isHeavyAction = activeTransits.some((t: any) => t.planet === "Mars" || t.themes?.includes("action"));
    const isReflective = moonPhase.includes("New") || retrogrades.length > 2;

    // 2. Map to Growth Timing (Integrating DM Usia/Tahun + Transits)
    const dmV3 = synthesis.fullBlueprint.destinyMatrix.dmV3;
    const yearlyTheme = dmV3?.lifeCycle.yearlyTheme || "Pertumbuhan";

    // 3. Generate Narratives
    let timingTheme = isId ? "Menyelaraskan Ritme" : "Aligning Rhythm";
    let timingInsight = "";
    let timingFocus = "";

    if (isReflective) {
      timingTheme = isId ? "Waktu untuk Jeda" : "Time for Pause";
      timingInsight = isId
        ? "Jika tubuhmu meminta jeda hari ini, tidak apa-apa mendengarkannya. Ini saat yang baik untuk merapikan apa yang ada di depan mata secara tenang."
        : "If your body asks for a pause today, it is okay to listen. This is a good time to quietly tidy up what is right in front of you.";
    } else if (isHeavyAction) {
      timingTheme = isId ? "Langkah Kecil" : "Small Steps";
      timingInsight = isId
        ? "Hari ini membawa kesiapan untuk bergerak secara nyata. Mulailah dari satu tindakan paling sederhana yang bisa kamu lakukan sekarang."
        : "Today brings a readiness to move in a real way. Begin with the simplest action you can take right now.";
    } else {
      timingTheme = isId ? "Menemani Hari" : "Companioning Today";
      timingInsight = isId
        ? "Tidak semua hal perlu dipaksa hari ini. Beberapa hal mungkin bekerja lebih baik ketika diberi ruang untuk berkembang secara alami."
        : "Not everything needs to be forced today. Some things might work better when given space to unfold naturally.";
    }

    timingFocus = isId
      ? "Fokuslah pada hal yang paling dekat dan bisa kamu sentuh hari ini, tanpa membebani dirimu dengan hasil akhir."
      : "Focus on the nearest thing you can touch today, without placing the burden of the final outcome on yourself.";

    return {
      timingTheme,
      timingInsight,
      timingFocus
    };
  }
};
