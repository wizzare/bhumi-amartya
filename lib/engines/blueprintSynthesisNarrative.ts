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
    // Combines LP Purpose + HD Type Processing + Natal MC Social Role + DM Center Lesson
    const coreNarrative = isId
      ? `Kamu hadir dengan binar ${sunSign}, membawa kualitas ${hdStyle.creativity.toLowerCase()} Melalui peran sosialmu, kamu sedang belajar menyelaraskan ${dmV3.lifeCycle.growthFocus.toLowerCase()} dengan cara batinmu yang ${hdStyle.communication.toLowerCase()}.`
      : `You shine with the essence of ${sunSign}, bringing ${hdStyle.creativity.toLowerCase()} through your social role. You are currently learning to align your ${dmV3.lifeCycle.growthFocus.toLowerCase()} with your ${hdStyle.communication.toLowerCase()} inner processing.`;

    // 2. Lifestyle Advice (Actionable Pattern)
    // HD Variables + Natal Dominant Planet + DM Health Chart + HD Authority
    const lifestyleAdvice = isId
      ? `Untuk menjaga kejernihan hari ini, prioritaskan ${hdStyle.productivity.toLowerCase()} Mengingat pengaruh batinmu, pastikan area diri mendapatkan perhatian ekstra terutama dalam mengolah ${dmV3.family.familyGift.toLowerCase()}.`
      : `To maintain clarity today, prioritize ${hdStyle.productivity.toLowerCase()} Given your inner influence, ensure your personal space receives extra attention, especially in nurturing your ${dmV3.family.familyGift.toLowerCase()}.`;

    // 3. Growth Story (Generational & Life Phase)
    // DM Family Patterns + Natal Aspects + HD Profile + Journey Streak
    const growthStory = isId
      ? `Langkahmu saat ini adalah tentang ${dmV3.lifeCycle.ageLesson.toLowerCase()} Ini adalah jembatan untuk ${dmV3.family.generationalLegacy.toLowerCase()} yang didukung oleh ${dmV3.family.fatherPattern.toLowerCase()}`
      : `Your current step is about ${dmV3.lifeCycle.ageLesson.toLowerCase()} This serves as a bridge to ${dmV3.family.generationalLegacy.toLowerCase()} supported by ${dmV3.family.fatherPattern.toLowerCase()}`;

    // 4. Interpersonal Dynamic (Relationship DNA)
    // Natal Relationship DNA + HD Connection Style + DM Love Line
    const interpersonalDynamic = isId
      ? `Dalam relasi, kamu memiliki kecenderungan ${natal.relationshipDNA.toLowerCase()}. Keharmonisanmu sangat bergantung pada ${hdStyle.relationship.toLowerCase()} serta caramu mengolah ${dmV3.family.motherPattern.toLowerCase()}`
      : `In relationships, you have a ${natal.relationshipDNA.toLowerCase()} tendency. Your harmony depends on ${hdStyle.relationship.toLowerCase()} and how you process your ${dmV3.family.motherPattern.toLowerCase()}`;

    return {
      coreNarrative,
      lifestyleAdvice,
      growthStory,
      interpersonalDynamic
    };
  }
};
