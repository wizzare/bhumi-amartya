import type {
  CoreIdentity,
  EmotionalAnalysis,
  EmotionalMemory,
  MeditationRecommendation,
} from "../data/types";

const chakraMap: Record<string, string> = {
  root: "Root chakra offers steadiness when you feel unanchored.",
  sacral: "Sacral chakra suggests creative release through safe sensation.",
  solar: "Solar plexus invites gentle confidence and boundaries.",
  heart: "Heart center asks for tenderness toward yourself and others.",
  throat: "Throat chakra wants your true voice to be held kindly.",
  thirdEye: "Third eye supports quiet inner listening and embodied insight.",
  crown: "Crown chakra opens to surrender and quiet trust.",
};

function inferChakraFocus(
  coreIdentity: CoreIdentity,
  analysis: EmotionalAnalysis,
  memory: EmotionalMemory
) {
  if (analysis.recurringWounds.includes("self-worth") || analysis.primaryEmotion.includes("shame")) {
    return "Solar Plexus & Heart";
  }

  if (analysis.recurringThemes.includes("money") || analysis.recurringWounds.includes("money block")) {
    return "Root & Sacral";
  }

  if (analysis.recurringThemes.includes("communication") || analysis.primaryEmotion.includes("silence")) {
    return "Throat & Third Eye";
  }

  const arcanaRoot = coreIdentity.arcanaCenter;
  if (arcanaRoot <= 7) {
    return "Root & Sacral";
  }

  if (arcanaRoot >= 8 && arcanaRoot <= 14) {
    return "Solar Plexus & Heart";
  }

  return "Heart & Third Eye";
}

function chooseBreathwork(analysis: EmotionalAnalysis) {
  if (analysis.groundingNeed === "body-connection") {
    return "Slow belly breathing, paying attention to the weight of the ribs and belly.";
  }
  if (analysis.groundingNeed === "nature") {
    return "Deep earth breaths with each exhale releasing tension into the ground.";
  }
  if (analysis.groundingNeed === "movement") {
    return "Soft breath with gentle shoulder rolls, staying present to every inhale.";
  }

  return "Gentle counting breath: inhale 4, hold 2, exhale 6, with a soft attention to the body.";
}

function chooseTitle(coreIdentity: CoreIdentity, analysis: EmotionalAnalysis) {
  if (analysis.emotionalExhaustion === "critical") {
    return "Restorative Earth Meditation";
  }

  if (analysis.primaryEmotion.includes("anger") || analysis.emotionalTone === "anger") {
    return "Soften the Flame Meditation";
  }

  if (analysis.emotionalTone === "confusion") {
    return "Clear Light Listening Meditation";
  }

  return "Heart-Centered Presence Meditation";
}

export function generateMeditationPlan(
  coreIdentity: CoreIdentity,
  analysis: EmotionalAnalysis,
  memory: EmotionalMemory
): MeditationRecommendation {
  const focusArea = inferChakraFocus(coreIdentity, analysis, memory);
  const title = chooseTitle(coreIdentity, analysis);
  const duration = analysis.emotionalExhaustion === "critical" ? 20 : analysis.emotionalExhaustion === "high" ? 15 : 12;
  const technique = chooseBreathwork(analysis);
  const energyEffect = [
    "This meditation helps you feel grounded, seen, and safe in your own body.",
    "It creates a wise container for your inner child and your shadow to be present.",
  ].join(" ");

  return {
    title,
    duration,
    type: "grounding",
    focusArea,
    description: `A soulful meditation built for your current healing edge, supporting ${focusArea.toLowerCase()} with calm and gentle attention.`,
    technique,
    energyEffect,
  };
}
