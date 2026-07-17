export type KnowledgeConfidence = "very-high" | "high" | "moderate" | "emerging" | "weak";
export type NeedHorizon = "current" | "growth" | "long-term";
export type GrowthType = "recovery" | "expansion" | "integration" | "long-term-growth";

export interface UnifiedBlueprintInput {
  readonly humanDesign?: Readonly<Record<string, unknown>> | null;
  readonly bazi?: Readonly<Record<string, unknown>> | null;
  readonly natalChart?: Readonly<Record<string, unknown>> | null;
  readonly astrology?: Readonly<Record<string, unknown>> | null;
  readonly numerology?: Readonly<Record<string, unknown>> | null;
  readonly lifePath?: Readonly<Record<string, unknown>> | number | null;
  readonly destinyMatrix?: Readonly<Record<string, unknown>> | null;
  readonly vedic?: Readonly<Record<string, unknown>> | null;
  readonly weton?: Readonly<Record<string, unknown>> | null;
  readonly tzolkin?: Readonly<Record<string, unknown>> | null;
  readonly [key: string]: unknown;
}

export interface RuntimeEvidence {
  readonly id: string;
  readonly source: string;
  readonly path: string;
  readonly observedValue: string;
  readonly supports: string;
  readonly confidence: KnowledgeConfidence;
}

export interface BlueprintSignal {
  readonly id: string;
  readonly source: string;
  readonly characteristicId: string;
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface CanonicalCharacteristic {
  readonly id: string;
  readonly name: string;
  readonly traitId: string;
  readonly signalIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface CanonicalTrait {
  readonly id: string;
  readonly name: string;
  readonly characteristicIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface CanonicalPattern {
  readonly id: string;
  readonly name: string;
  readonly kind: "stable" | "dynamic";
  readonly traitIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface ResolvedConflict {
  readonly id: string;
  readonly traitIds: readonly [string, string];
  readonly status: "integrated" | "sequenced" | "preserved";
  readonly synthesisPatternId: string | null;
  readonly evidenceIds: readonly string[];
}

export interface CanonicalHumanMeaning {
  readonly id: string;
  readonly name: string;
  readonly domain: string;
  readonly patternIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface CanonicalNeed {
  readonly id: string;
  readonly name: string;
  readonly horizon: NeedHorizon;
  readonly meaningIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface CanonicalGrowth {
  readonly id: string;
  readonly name: string;
  readonly type: GrowthType;
  readonly needIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly confidence: KnowledgeConfidence;
}

export interface RuntimeExplainability {
  readonly objectId: string;
  readonly chain: readonly string[];
  readonly evidenceIds: readonly string[];
}

export interface RuntimeValidationIssue {
  readonly code: string;
  readonly objectId: string;
  readonly message: string;
}

export interface RuntimeProvenance {
  readonly runtimeVersion: "human-meaning-runtime-v1";
  readonly knowledgeVersion: "human-meaning-knowledge-v1";
  readonly behaviorVersion: "human-meaning-behavior-v1";
  readonly inputFingerprint: string;
  readonly inputSystems: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly lineage: readonly [
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
  ];
  readonly fingerprint: string;
}

export interface HumanMeaningRuntime {
  readonly runtimeVersion: "human-meaning-runtime-v1";
  readonly knowledgeVersion: "human-meaning-knowledge-v1";
  readonly behaviorVersion: "human-meaning-behavior-v1";
  readonly inputFingerprint: string;
  readonly outputFingerprint: string;
  readonly provenanceFingerprint: string;
  readonly generatedAt: string;
  readonly signals: readonly BlueprintSignal[];
  readonly characteristics: readonly CanonicalCharacteristic[];
  readonly traits: readonly CanonicalTrait[];
  readonly patterns: readonly CanonicalPattern[];
  readonly conflicts: readonly ResolvedConflict[];
  readonly humanMeanings: readonly CanonicalHumanMeaning[];
  readonly needs: readonly CanonicalNeed[];
  readonly growth: readonly CanonicalGrowth[];
  readonly evidence: readonly RuntimeEvidence[];
  readonly explainability: readonly RuntimeExplainability[];
  readonly provenance: RuntimeProvenance;
  readonly confidence: KnowledgeConfidence;
  readonly validation: { readonly valid: true; readonly issues: readonly [] };
}

export interface ExtractionResult {
  readonly signals: readonly BlueprintSignal[];
  readonly evidence: readonly RuntimeEvidence[];
}

export interface HumanMeaningRuntimeError {
  readonly code: "INVALID_INPUT" | "INVALID_RUNTIME_OUTPUT" | "UNSUPPORTED_RUNTIME_STATE";
  readonly message: string;
  readonly issues: readonly RuntimeValidationIssue[];
}

export type HumanMeaningRuntimeResult =
  | { readonly ok: true; readonly output: HumanMeaningRuntime }
  | { readonly ok: false; readonly error: HumanMeaningRuntimeError };
