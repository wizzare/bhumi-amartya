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
      timingTheme = isId ? "Pemulihan & Peninjauan" : "Restoration & Review";
      timingInsight = isId
        ? `Hidupmu sedang mengajakmu untuk sedikit melambat. Ini bukan tentang berhenti, melainkan membereskan fondasi ${yearlyTheme.toLowerCase()} agar langkah berikutnya lebih ringan.`
        : `Life is inviting you to slow down slightly. This isn't about stopping, but tidying up the foundation of your ${yearlyTheme.toLowerCase()} so the next step feels lighter.`;
    } else if (isHeavyAction) {
      timingTheme = isId ? "Aksi & Keberanian" : "Action & Courage";
      timingInsight = isId
        ? `Momentum saat ini mendukungmu untuk mewujudkan ${integrated.coreNarrative.split("untuk")[1]?.split(".")[0] || "langkah baru"}. Keberanianmu hari ini adalah bentuk nyata dari misi jiwamu.`
        : `The current momentum supports you in manifesting ${integrated.coreNarrative.split("to")[1]?.split(".")[0] || "a new step"}. Your courage today is a living form of your soul mission.`;
    } else {
      timingInsight = isId
        ? `Kamu berada di fase ${dmV3?.lifeCycle.ageLesson.toLowerCase() || "pembelajaran baru"}. Cuaca batin hari ini mendukungmu untuk melihat pola ${yearlyTheme.toLowerCase()} dengan lebih jernih.`
        : `You are in a phase of ${dmV3?.lifeCycle.ageLesson.toLowerCase() || "new learning"}. Today's inner weather supports you in seeing your ${yearlyTheme.toLowerCase()} patterns more clearly.`;
    }

    timingFocus = isId
      ? `Fokuslah pada satu hal yang paling dekat: caramu ${integrated.lifestyleAdvice.split("prioritaskan")[1]?.split(" ")[1] || "bergerak"} secara jujur.`
      : `Focus on the nearest thing: how you honestly ${integrated.lifestyleAdvice.split("prioritize")[1]?.split(" ")[1] || "move"}.`;

    return {
      timingTheme,
      timingInsight,
      timingFocus
    };
  }
};
