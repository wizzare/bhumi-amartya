import { characteristicEngine } from "@/lib/humanMeaningRuntime/characteristicEngine";
import { conflictEngine } from "@/lib/humanMeaningRuntime/conflictEngine";
import { explainabilityEngine } from "@/lib/humanMeaningRuntime/explainabilityEngine";
import { growthEngine } from "@/lib/humanMeaningRuntime/growthEngine";
import { humanMeaningEngine } from "@/lib/humanMeaningRuntime/humanMeaningEngine";
import { listBlueprintSystems, normalizeBlueprintInput } from "@/lib/humanMeaningRuntime/inputValidator";
import { knowledgeExtractionEngine } from "@/lib/humanMeaningRuntime/knowledgeExtractionEngine";
import { needEngine } from "@/lib/humanMeaningRuntime/needEngine";
import { patternEngine } from "@/lib/humanMeaningRuntime/patternEngine";
import { humanMeaningRuntimeCache } from "@/lib/humanMeaningRuntime/runtimeCache";
import { assertValidHumanMeaningRuntime } from "@/lib/humanMeaningRuntime/runtimeValidator";
import { createInputFingerprint, createProvenanceFingerprint, createRuntimeOutputFingerprint, deepFreeze, weakestConfidence } from "@/lib/humanMeaningRuntime/runtimeUtils";
import { traitEngine } from "@/lib/humanMeaningRuntime/traitEngine";
import type { HumanMeaningRuntime, RuntimeProvenance, UnifiedBlueprintInput } from "@/lib/humanMeaningRuntime/types";
import { HUMAN_MEANING_VERSIONS } from "@/lib/humanMeaningRuntime/versions";

export interface HumanMeaningRuntimeOptions {
  readonly now?: Date;
  readonly bypassCache?: boolean;
  readonly cacheScope?: string;
}

const PROVENANCE_LINEAGE = [
  "blueprint-inputs",
  "knowledge-extraction",
  "characteristics",
  "traits",
  "patterns",
  "conflict-resolution",
  "human-meaning",
  "needs",
  "growth",
  "explainability",
  "validation",
] as const;

export const humanMeaningRuntime = {
  build(input: UnifiedBlueprintInput, options: HumanMeaningRuntimeOptions = {}): HumanMeaningRuntime {
    const normalizedInput = normalizeBlueprintInput(input);
    const inputFingerprint = createInputFingerprint(normalizedInput);
    const cacheKey = humanMeaningRuntimeCache.createKey(inputFingerprint, HUMAN_MEANING_VERSIONS, options.cacheScope);
    if (!options.bypassCache) {
      const cached = humanMeaningRuntimeCache.get(cacheKey);
      if (cached) return cached;
    }

    const extraction = knowledgeExtractionEngine.extract(normalizedInput);
    const characteristics = characteristicEngine.derive(extraction.signals);
    const traits = traitEngine.derive(characteristics);
    const patterns = patternEngine.derive(traits);
    const conflicts = conflictEngine.resolve(traits, patterns);
    const humanMeanings = humanMeaningEngine.derive(patterns);
    const needs = needEngine.derive(humanMeanings);
    const growth = growthEngine.derive(needs);
    const explainability = explainabilityEngine.build({ traits, patterns, meanings: humanMeanings, needs, growth });
    const confidence = weakestConfidence(humanMeanings.map((meaning) => meaning.confidence));

    const provenanceBase: Omit<RuntimeProvenance, "fingerprint"> = {
      ...HUMAN_MEANING_VERSIONS,
      inputFingerprint,
      inputSystems: listBlueprintSystems(normalizedInput),
      evidenceIds: extraction.evidence.map((item) => item.id).sort(),
      lineage: PROVENANCE_LINEAGE,
    };
    const provenanceFingerprint = createProvenanceFingerprint(provenanceBase);
    const provenance: RuntimeProvenance = { ...provenanceBase, fingerprint: provenanceFingerprint };

    const identityBase = {
      ...HUMAN_MEANING_VERSIONS,
      inputFingerprint,
      generatedAt: (options.now || new Date()).toISOString(),
      signals: extraction.signals,
      characteristics,
      traits,
      patterns,
      conflicts,
      humanMeanings,
      needs,
      growth,
      evidence: extraction.evidence,
      explainability,
      provenance,
      provenanceFingerprint,
      confidence,
    };
    const candidate: Omit<HumanMeaningRuntime, "validation"> = {
      ...identityBase,
      outputFingerprint: createRuntimeOutputFingerprint(identityBase),
    };

    assertValidHumanMeaningRuntime(candidate);
    const runtime = deepFreeze({ ...candidate, validation: { valid: true as const, issues: [] as const } }) as HumanMeaningRuntime;
    if (!options.bypassCache) humanMeaningRuntimeCache.set(cacheKey, runtime);
    return runtime;
  },
};
