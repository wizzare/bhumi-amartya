/**
 * BHUMI AMARTYA - Blueprint Synthesis Narrative Engine
 * Pure logic for combining multi-source intelligence into cohesive narratives.
 * Principle: No single engine defines the output.
 */

import { UnifiedBlueprintSynthesis } from "@/lib/dailyGuidance/unifiedBlueprintSynthesis";
import { HumanDesignStyle } from "@/lib/humandesign/intelligence/styleEngine";
import { CareerIntelligence } from "./careerIntelligenceEngine";
import { NatalIntelligence } from "@/lib/astrology/natalIntelligence";
import { DestinyMatrixV3 } from "./destinyMatrixV3";

export interface IntegratedIdentity {
  coreNarrative: string;
  lifestyleAdvice: string;
  growthStory: string;
  interpersonalDynamic: string;
}

export const blueprintSynthesisNarrative = {
  /**
   * Generates a deeply integrated identity narrative.
   * Minimal Synthesis: LP + HD + Natal + DM
   */
  generateIdentityNarrative(
    synthesis: UnifiedBlueprintSynthesis,
    hdStyle: HumanDesignStyle,
    career: CareerIntelligence,
    natal: NatalIntelligence,
    dmV3: DestinyMatrixV3,
    language: string = "id"
  ): IntegratedIdentity {
    const isId = language !== "en";

    const lp = synthesis.identitySignals.lifePath;
    const hdType = synthesis.identitySignals.humanDesignType;
    const sunSign = synthesis.identitySignals.sunSign;
    const mc = synthesis.fullBlueprint.natalChart.mc;
    const arcana = synthesis.identitySignals.arcanaCenter;

    // 1. Core Narrative (Identity DNA)
    const coreNarrative = isId
      ? `Hari ini ada ruang untuk membawa kenyamanan dalam ${hdStyle.creativity.toLowerCase()}. Coba selaraskan fokus pertumbuhan batinmu dengan ${dmV3.lifeCycle.growthFocus.toLowerCase()} secara perlahan, tanpa harus terburu-buru.`
      : `Today, there is room to bring comfort to your ${hdStyle.creativity.toLowerCase()}. Gently align your inner growth focus with ${dmV3.lifeCycle.growthFocus.toLowerCase()}, without any rush.`;

    // 2. Lifestyle Advice (Actionable Pattern)
    const lifestyleAdvice = isId
      ? `Untuk menjaga ketenangan hari ini, cobalah merawat ${hdStyle.productivity.toLowerCase()}. Berikan perhatian ekstra pada ruang kecil di sekitarmu, terutama dalam mengolah ${dmV3.family.familyGift.toLowerCase()}.`
      : `To maintain peace today, try nurturing your ${hdStyle.productivity.toLowerCase()}. Give extra attention to your immediate surroundings, especially in processing ${dmV3.family.familyGift.toLowerCase()}.`;

    // 3. Growth Story (Generational & Life Phase)
    const growthStory = isId
      ? `Perjalananmu saat ini adalah tentang ${dmV3.lifeCycle.ageLesson.toLowerCase()}. Ini menjadi bagian penting dalam menyelaraskan ${dmV3.family.generationalLegacy.toLowerCase()}.`
      : `Your journey right now is about ${dmV3.lifeCycle.ageLesson.toLowerCase()}. This forms an important part of aligning your ${dmV3.family.generationalLegacy.toLowerCase()}.`;

    // 4. Interpersonal Dynamic (Relationship DNA)
    const interpersonalDynamic = isId
      ? `Dalam hubungan dengan orang lain, ada dorongan untuk ${natal.relationshipDNA.toLowerCase()}. Kehangatan hari ini dapat dirawat melalui ${hdStyle.relationship.toLowerCase()}.`
      : `In relationships, there is a natural desire to ${natal.relationshipDNA.toLowerCase()}. Today's warmth can be nurtured through ${hdStyle.relationship.toLowerCase()}.`;

    return {
      coreNarrative,
      lifestyleAdvice,
      growthStory,
      interpersonalDynamic
    };
  }
};
