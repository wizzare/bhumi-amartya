import type {
  CoreIdentity,
  EmotionalAnalysis,
  EmotionalMemory,
  HealingProgressSummary,
} from "../data/types";

const chakraGuidance = {
  root: "Invite safety in the body and receive the presence of the earth.",
  sacral: "Allow emotion and creativity to move without shame.",
  solar: "Practice soft boundaries with compassion.",
  heart: "Open to tenderness for what is tender.",
  throat: "Speak your truth with simple kindness.",
  thirdEye: "Listen inward before you decide.",
  crown: "Rest in the space beyond shoulds.",
};

function detectTone(memory: EmotionalMemory): EmotionalAnalysis["emotionalTone"] {
  const themes = memory.recurringThemes.map((theme) => theme.theme.toLowerCase());
  if (themes.some((item) => item.includes("fear") || item.includes("anxiety") || item.includes("uncertainty"))) {
    return "grounding";
  }
  if (themes.some((item) => item.includes("anger") || item.includes("power"))) {
    return "introspective";
  }
  if (themes.some((item) => item.includes("joy") || item.includes("gift"))) {
    return "celebratory";
  }
  return "gentle";
}

function detectPrimaryEmotion(memory: EmotionalMemory): string {
  if (memory.recurringWounds.length > 0) {
    return memory.recurringWounds[0].wound;
  }
  if (memory.recurringThemes.length > 0) {
    return memory.recurringThemes[0].theme;
  }
  return "quiet uncertainty";
}

function deriveNervousSystem(memory: EmotionalMemory): EmotionalAnalysis["nervousSystemDetection"] {
  const hasOverwhelm = memory.emotionalTrends.some((trend) => trend.emotion.includes("overwhelm") && trend.frequency >= 2);
  const hasCalm = memory.emotionalTrends.some((trend) => trend.emotion.includes("peace") || trend.emotion.includes("rest"));
  if (hasOverwhelm) return "dysregulated";
  if (hasCalm) return "grounded";
  return memory.healingActions.length > 2 ? "calm" : "activated";
}

function inferChakraFocus(memory: EmotionalMemory, coreIdentity: CoreIdentity) {
  const focus: HealingProgressSummary["chakraFocus"] = [];

  if (memory.recurringWounds.some((w) => w.wound.includes("money") || w.wound.includes("worth"))) {
    focus.push({ chakra: "Root", status: "open to grounding", guidance: chakraGuidance.root });
  }

  if (memory.recurringWounds.some((w) => w.wound.includes("self") || w.wound.includes("love"))) {
    focus.push({ chakra: "Heart", status: "inviting balance", guidance: chakraGuidance.heart });
  }

  if (memory.recurringThemes.some((t) => t.theme.includes("voice") || t.theme.includes("communication"))) {
    focus.push({ chakra: "Throat", status: "asking for expression", guidance: chakraGuidance.throat });
  }

  if (focus.length === 0) {
    const arcanaSeed = coreIdentity.arcanaCenter % 3;
    if (arcanaSeed === 0) {
      focus.push({ chakra: "Sacral", status: "soft and receptive", guidance: chakraGuidance.sacral });
    } else if (arcanaSeed === 1) {
      focus.push({ chakra: "Solar Plexus", status: "steadying", guidance: chakraGuidance.solar });
    } else {
      focus.push({ chakra: "Third Eye", status: "silent awareness", guidance: chakraGuidance.thirdEye });
    }
  }

  return focus;
}

function buildSupportiveMessage(memory: EmotionalMemory): string {
  if (memory.healingMilestones.length > 0) {
    return "Your gentle consistency is visible here. Each small step is evidence that the nervous system can trust itself again.";
  }
  if (memory.recurringWounds.length > 0) {
    return "The places that ache most are also the places that carry your invitation to more tenderness.";
  }
  return "Today asks for softness, curiosity, and a quiet permission to be exactly as you are.";
}

export function analyzeHealingProgress(
  memory: EmotionalMemory,
  coreIdentity: CoreIdentity
): {
  analysis: EmotionalAnalysis;
  progressSummary: HealingProgressSummary;
} {
  const currentPhase = memory.healingMilestones.length === 0
    ? "Settling into the sacred field"
    : "Integration and gentle expansion";

  const nextIntensity = memory.healingActions.length >= 3
    ? "steady embodiment"
    : memory.healingActions.length === 0
      ? "restorative grounding"
      : "tender inquiry";

  const analysis: EmotionalAnalysis = {
    emotionalTone: detectTone(memory),
    primaryEmotion: detectPrimaryEmotion(memory),
    secondaryEmotions: memory.recurringThemes.slice(0, 2).map((theme) => theme.theme),
    nervousSystemDetection: deriveNervousSystem(memory),
    recurringThemes: memory.recurringThemes.map((theme) => theme.theme),
    recurringWounds: memory.recurringWounds.map((wound) => wound.wound),
    selfTalkPatterns: memory.recurringThemes.map((theme) => ({
      pattern: `Recurring thought around ${theme.theme}`,
      tone: "compassionate",
      frequency: theme.count > 2 ? "recurring" : "occasional",
    })),
    emotionalExhaustion: memory.emotionalTrends.some((t) => t.emotion.includes("exhaustion") && t.frequency >= 2)
      ? "high"
      : "moderate",
    avoidancePatterns: memory.recurringThemes.length > 2 ? ["distraction"] : [],
    gentleInsight: memory.nextHealingEdge,
    healingDirection: memory.suggestedFocus,
    suggestedNextInnerwork: memory.suggestedFocus,
    groundingNeed: memory.emotionalCycles.length > 0 ? "body-connection" : "breathing",
  };

  const progressSummary: HealingProgressSummary = {
    currentPhase,
    nextIntensity,
    chakraFocus: inferChakraFocus(memory, coreIdentity),
    supportiveMessage: buildSupportiveMessage(memory),
    topThemes: memory.recurringThemes.slice(0, 3).map((t) => t.theme),
    topWounds: memory.recurringWounds.slice(0, 3).map((w) => w.wound),
  };

  return { analysis, progressSummary };
}
