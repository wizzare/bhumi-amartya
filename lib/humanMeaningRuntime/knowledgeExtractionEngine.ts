import type { BlueprintSignal, ExtractionResult, KnowledgeConfidence, RuntimeEvidence, UnifiedBlueprintInput } from "@/lib/humanMeaningRuntime/types";
import { normalizedString, readPath } from "@/lib/humanMeaningRuntime/runtimeUtils";

type Rule = {
  source: string;
  paths: readonly (readonly string[])[];
  values: readonly string[];
  characteristicId: string;
  confidence: KnowledgeConfidence;
};

const RULES: readonly Rule[] = [
  { source: "humanDesign", paths: [["humanDesign", "type"]], values: ["generator", "manifestinggenerator"], characteristicId: "CHAR_RESPONDS_THROUGH_INTERACTION", confidence: "high" },
  { source: "humanDesign", paths: [["humanDesign", "type"]], values: ["manifestor"], characteristicId: "CHAR_INITIATES_DIRECTION", confidence: "high" },
  { source: "humanDesign", paths: [["humanDesign", "type"]], values: ["projector", "reflector"], characteristicId: "CHAR_PROCESSES_BEFORE_ACTION", confidence: "moderate" },
  { source: "bazi", paths: [["bazi", "dayMaster", "element"], ["bazi", "dayMasterElement"]], values: ["metal", "logam"], characteristicId: "CHAR_VALUES_STRUCTURE", confidence: "high" },
  { source: "bazi", paths: [["bazi", "dayMaster", "element"], ["bazi", "dayMasterElement"]], values: ["water", "air"], characteristicId: "CHAR_ADAPTS_TO_CHANGING_CONTEXT", confidence: "high" },
  { source: "natalChart", paths: [["natalChart", "moon", "sign"], ["natalChart", "moonSign"], ["astrology", "moonSign"]], values: ["pisces", "cancer", "scorpio"], characteristicId: "CHAR_EMOTIONALLY_PERMEABLE", confidence: "high" },
  { source: "natalChart", paths: [["natalChart", "mercury", "sign"], ["natalChart", "mercury"]], values: ["virgo", "capricorn"], characteristicId: "CHAR_VALUES_STRUCTURE", confidence: "moderate" },
  { source: "numerology", paths: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]], values: ["1"], characteristicId: "CHAR_INITIATES_DIRECTION", confidence: "moderate" },
  { source: "numerology", paths: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]], values: ["2"], characteristicId: "CHAR_EMOTIONALLY_PERMEABLE", confidence: "moderate" },
  { source: "numerology", paths: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]], values: ["4"], characteristicId: "CHAR_VALUES_STRUCTURE", confidence: "moderate" },
  { source: "numerology", paths: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]], values: ["5"], characteristicId: "CHAR_ADAPTS_TO_CHANGING_CONTEXT", confidence: "moderate" },
  { source: "numerology", paths: [["lifePath", "number"], ["numerology", "lifePath"], ["lifePath"]], values: ["7"], characteristicId: "CHAR_PROCESSES_BEFORE_ACTION", confidence: "moderate" },
];

export const knowledgeExtractionEngine = {
  extract(input: UnifiedBlueprintInput): ExtractionResult {
    const evidence: RuntimeEvidence[] = [];
    const signals: BlueprintSignal[] = [];

    for (const rule of RULES) {
      const match = rule.paths.map((path) => ({ path, value: readPath(input, path) })).find(({ value }) => rule.values.includes(normalizedString(value)));
      if (!match) continue;
      const observedValue = String(match.value);
      const suffix = `${rule.source}-${rule.characteristicId}-${signals.length}`.toLowerCase();
      const evidenceId = `EVIDENCE_${suffix.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`;
      const signalId = `SIGNAL_${rule.source.toUpperCase()}_${rule.characteristicId.replace("CHAR_", "")}`;
      evidence.push({ id: evidenceId, source: rule.source, path: match.path.join("."), observedValue, supports: signalId, confidence: rule.confidence });
      signals.push({ id: signalId, source: rule.source, characteristicId: rule.characteristicId, evidenceIds: [evidenceId], confidence: rule.confidence });
    }

    return { signals, evidence };
  },
};
