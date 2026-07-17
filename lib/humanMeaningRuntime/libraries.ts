import type { GrowthType, NeedHorizon } from "@/lib/humanMeaningRuntime/types";

export const CHARACTERISTIC_LIBRARY = {
  CHAR_RESPONDS_THROUGH_INTERACTION: { name: "Responds Through Interaction", traitId: "TRAIT_RESPONSIVE" },
  CHAR_VALUES_STRUCTURE: { name: "Values Structure", traitId: "TRAIT_STRUCTURED" },
  CHAR_EMOTIONALLY_PERMEABLE: { name: "Emotionally Permeable", traitId: "TRAIT_SENSITIVE" },
  CHAR_ADAPTS_TO_CHANGING_CONTEXT: { name: "Adapts to Changing Context", traitId: "TRAIT_ADAPTIVE" },
  CHAR_PROCESSES_BEFORE_ACTION: { name: "Processes Before Action", traitId: "TRAIT_REFLECTIVE" },
  CHAR_INITIATES_DIRECTION: { name: "Initiates Direction", traitId: "TRAIT_INITIATING" },
} as const;

export const TRAIT_LIBRARY = {
  TRAIT_RESPONSIVE: { name: "Responsive" },
  TRAIT_STRUCTURED: { name: "Structured" },
  TRAIT_SENSITIVE: { name: "Sensitive" },
  TRAIT_ADAPTIVE: { name: "Adaptive" },
  TRAIT_REFLECTIVE: { name: "Reflective" },
  TRAIT_INITIATING: { name: "Initiating" },
} as const;

export const PATTERN_LIBRARY = {
  SPATTERN_PROCESS_BEFORE_COMMITMENT: { name: "Process Before Commitment", kind: "stable", traitIds: ["TRAIT_REFLECTIVE", "TRAIT_SENSITIVE"] },
  SPATTERN_DIRECTION_THROUGH_RESPONSE: { name: "Direction Through Response", kind: "stable", traitIds: ["TRAIT_RESPONSIVE", "TRAIT_ADAPTIVE"] },
  SPATTERN_STRUCTURE_SUPPORTS_FREEDOM: { name: "Structure Supports Freedom", kind: "stable", traitIds: ["TRAIT_STRUCTURED", "TRAIT_ADAPTIVE"] },
  SPATTERN_INITIATE_WITH_CLARITY: { name: "Initiate With Clarity", kind: "stable", traitIds: ["TRAIT_INITIATING", "TRAIT_REFLECTIVE"] },
  SPATTERN_SAFETY_BEFORE_OPENNESS: { name: "Safety Before Openness", kind: "stable", traitIds: ["TRAIT_SENSITIVE", "TRAIT_STRUCTURED"] },
} as const;

export const CONFLICT_LIBRARY = [
  { id: "CONFLICT_STRUCTURE_FREEDOM", traitIds: ["TRAIT_STRUCTURED", "TRAIT_ADAPTIVE"] as const, status: "integrated", synthesisPatternId: "SPATTERN_STRUCTURE_SUPPORTS_FREEDOM" },
  { id: "CONFLICT_ACTION_REFLECTION", traitIds: ["TRAIT_INITIATING", "TRAIT_REFLECTIVE"] as const, status: "sequenced", synthesisPatternId: "SPATTERN_INITIATE_WITH_CLARITY" },
] as const;

export const HUMAN_MEANING_LIBRARY = {
  MEANING_CLARITY_THROUGH_PROCESSING: { name: "Clarity Through Processing", domain: "mind", patternIds: ["SPATTERN_PROCESS_BEFORE_COMMITMENT"] },
  MEANING_DIRECTION_THROUGH_RESPONSE: { name: "Direction Through Response", domain: "identity", patternIds: ["SPATTERN_DIRECTION_THROUGH_RESPONSE"] },
  MEANING_STRUCTURE_THAT_SUPPORTS_FREEDOM: { name: "Structure That Supports Freedom", domain: "identity", patternIds: ["SPATTERN_STRUCTURE_SUPPORTS_FREEDOM"] },
  MEANING_ACTION_AFTER_INNER_CLARITY: { name: "Action After Inner Clarity", domain: "mind", patternIds: ["SPATTERN_INITIATE_WITH_CLARITY"] },
  MEANING_SAFETY_BEFORE_OPENNESS: { name: "Safety Before Openness", domain: "relationship", patternIds: ["SPATTERN_SAFETY_BEFORE_OPENNESS"] },
} as const;

type NeedDefinition = { name: string; horizon: NeedHorizon; meaningIds: readonly string[] };
export const NEED_LIBRARY: Readonly<Record<string, NeedDefinition>> = {
  NEED_CLARITY_CURRENT: { name: "Clarity", horizon: "current", meaningIds: ["MEANING_CLARITY_THROUGH_PROCESSING", "MEANING_ACTION_AFTER_INNER_CLARITY"] },
  NEED_INTEGRATION_GROWTH: { name: "Integration", horizon: "growth", meaningIds: ["MEANING_CLARITY_THROUGH_PROCESSING", "MEANING_STRUCTURE_THAT_SUPPORTS_FREEDOM"] },
  NEED_DIRECTION_LONG_TERM: { name: "Direction", horizon: "long-term", meaningIds: ["MEANING_DIRECTION_THROUGH_RESPONSE", "MEANING_ACTION_AFTER_INNER_CLARITY"] },
  NEED_AUTONOMY_CURRENT: { name: "Autonomy", horizon: "current", meaningIds: ["MEANING_DIRECTION_THROUGH_RESPONSE"] },
  NEED_STABILITY_CURRENT: { name: "Stability", horizon: "current", meaningIds: ["MEANING_STRUCTURE_THAT_SUPPORTS_FREEDOM"] },
  NEED_AUTONOMY_GROWTH: { name: "Autonomy", horizon: "growth", meaningIds: ["MEANING_STRUCTURE_THAT_SUPPORTS_FREEDOM"] },
  NEED_SAFETY_CURRENT: { name: "Safety", horizon: "current", meaningIds: ["MEANING_SAFETY_BEFORE_OPENNESS"] },
  NEED_TRUST_GROWTH: { name: "Trust", horizon: "growth", meaningIds: ["MEANING_SAFETY_BEFORE_OPENNESS", "MEANING_DIRECTION_THROUGH_RESPONSE"] },
  NEED_CONNECTION_LONG_TERM: { name: "Connection", horizon: "long-term", meaningIds: ["MEANING_SAFETY_BEFORE_OPENNESS"] },
};

type GrowthDefinition = { name: string; type: GrowthType; needIds: readonly string[] };
export const GROWTH_LIBRARY: Readonly<Record<string, GrowthDefinition>> = {
  GROWTH_RECOVER_CLARITY: { name: "Recover Clarity", type: "recovery", needIds: ["NEED_CLARITY_CURRENT", "NEED_SAFETY_CURRENT"] },
  GROWTH_EXPAND_AUTONOMY: { name: "Expand Autonomy", type: "expansion", needIds: ["NEED_AUTONOMY_CURRENT", "NEED_AUTONOMY_GROWTH"] },
  GROWTH_INTEGRATE_STRUCTURE_FREEDOM: { name: "Integrate Structure and Freedom", type: "integration", needIds: ["NEED_STABILITY_CURRENT", "NEED_INTEGRATION_GROWTH"] },
  GROWTH_DEVELOP_TRUSTED_CONNECTION: { name: "Develop Trusted Connection", type: "long-term-growth", needIds: ["NEED_TRUST_GROWTH", "NEED_CONNECTION_LONG_TERM"] },
  GROWTH_DEVELOP_DIRECTION: { name: "Develop Direction", type: "long-term-growth", needIds: ["NEED_DIRECTION_LONG_TERM"] },
};
