import { CHARACTERISTIC_LIBRARY, GROWTH_LIBRARY, HUMAN_MEANING_LIBRARY, NEED_LIBRARY, PATTERN_LIBRARY, TRAIT_LIBRARY } from "@/lib/humanMeaningRuntime/libraries";
import type { HumanMeaningRuntime, KnowledgeConfidence, RuntimeValidationIssue } from "@/lib/humanMeaningRuntime/types";
import { createProvenanceFingerprint, createRuntimeOutputFingerprint } from "@/lib/humanMeaningRuntime/runtimeUtils";
import { HUMAN_MEANING_VERSIONS } from "@/lib/humanMeaningRuntime/versions";

const CONFIDENCE = new Set<KnowledgeConfidence>(["very-high", "high", "moderate", "emerging", "weak"]);

export class HumanMeaningRuntimeValidationError extends Error {
  constructor(public readonly issues: readonly RuntimeValidationIssue[]) {
    super(`HUMAN_MEANING_RUNTIME_INVALID:${issues.map((issue) => issue.code).join(",")}`);
    this.name = "HumanMeaningRuntimeValidationError";
  }
}

export function validateHumanMeaningRuntime(runtime: Omit<HumanMeaningRuntime, "validation">): RuntimeValidationIssue[] {
  const issues: RuntimeValidationIssue[] = [];
  const evidenceIds = new Set(runtime.evidence.map((item) => item.id));
  const traitIds = new Set(runtime.traits.map((item) => item.id));
  const patternIds = new Set(runtime.patterns.map((item) => item.id));

  if (
    runtime.runtimeVersion !== HUMAN_MEANING_VERSIONS.runtimeVersion
    || runtime.knowledgeVersion !== HUMAN_MEANING_VERSIONS.knowledgeVersion
    || runtime.behaviorVersion !== HUMAN_MEANING_VERSIONS.behaviorVersion
  ) {
    issues.push({ code: "INVALID_VERSION_METADATA", objectId: "runtime", message: "Runtime, knowledge, or behavior version is unsupported." });
  }
  if (!/^hmr-[0-9a-f]{8}$/.test(runtime.inputFingerprint)) {
    issues.push({ code: "INVALID_INPUT_FINGERPRINT", objectId: "runtime", message: "Input fingerprint is malformed." });
  }
  const { fingerprint: _fingerprint, ...provenanceBase } = runtime.provenance;
  void _fingerprint;
  const expectedProvenanceFingerprint = createProvenanceFingerprint(provenanceBase);
  if (
    runtime.provenance.runtimeVersion !== runtime.runtimeVersion
    || runtime.provenance.knowledgeVersion !== runtime.knowledgeVersion
    || runtime.provenance.behaviorVersion !== runtime.behaviorVersion
    || runtime.provenance.inputFingerprint !== runtime.inputFingerprint
    || runtime.provenance.fingerprint !== expectedProvenanceFingerprint
    || runtime.provenanceFingerprint !== expectedProvenanceFingerprint
  ) {
    issues.push({ code: "INVALID_PROVENANCE", objectId: "provenance", message: "Runtime provenance does not match canonical lineage or versions." });
  }
  if (!runtime.provenance.inputSystems.length || runtime.provenance.evidenceIds.some((id) => !evidenceIds.has(id))) {
    issues.push({ code: "INVALID_PROVENANCE_LINEAGE", objectId: "provenance", message: "Provenance lacks Blueprint systems or references unknown Evidence." });
  }
  if (runtime.outputFingerprint !== createRuntimeOutputFingerprint(runtime as unknown as Readonly<Record<string, unknown>>)) {
    issues.push({ code: "INVALID_OUTPUT_FINGERPRINT", objectId: "runtime", message: "Output fingerprint does not match canonical runtime output." });
  }
  if (Number.isNaN(Date.parse(runtime.generatedAt))) {
    issues.push({ code: "INVALID_GENERATED_AT", objectId: "runtime", message: "Runtime generation time is malformed." });
  }

  if (!runtime.traits.length) issues.push({ code: "MISSING_TRAITS", objectId: "runtime", message: "Runtime requires at least one canonical Trait." });
  if (!runtime.patterns.length) issues.push({ code: "MISSING_PATTERNS", objectId: "runtime", message: "Runtime requires at least one canonical Pattern." });
  if (!runtime.humanMeanings.length) issues.push({ code: "MISSING_HUMAN_MEANINGS", objectId: "runtime", message: "Runtime requires at least one canonical Human Meaning." });
  if (!runtime.needs.length) issues.push({ code: "MISSING_NEEDS", objectId: "runtime", message: "Runtime requires at least one canonical Need." });

  const knowledgeObjects = [...runtime.signals, ...runtime.characteristics, ...runtime.traits, ...runtime.patterns, ...runtime.humanMeanings, ...runtime.needs, ...runtime.growth];
  for (const object of knowledgeObjects) {
    if (!object.evidenceIds.length || object.evidenceIds.some((id) => !evidenceIds.has(id))) {
      issues.push({ code: "MISSING_EVIDENCE", objectId: object.id, message: "Every knowledge object requires valid Evidence." });
    }
    if (!CONFIDENCE.has(object.confidence)) issues.push({ code: "INVALID_CONFIDENCE", objectId: object.id, message: "Confidence is not canonical." });
  }

  for (const item of runtime.characteristics) {
    if (!(item.id in CHARACTERISTIC_LIBRARY)) issues.push({ code: "UNKNOWN_CHARACTERISTIC", objectId: item.id, message: "Characteristic is absent from its canonical library." });
  }
  for (const item of runtime.traits) {
    if (!(item.id in TRAIT_LIBRARY)) issues.push({ code: "UNKNOWN_TRAIT", objectId: item.id, message: "Trait is absent from its canonical library." });
  }
  for (const item of runtime.patterns) {
    if (!(item.id in PATTERN_LIBRARY) || item.traitIds.some((id) => !traitIds.has(id))) issues.push({ code: "INVALID_PATTERN", objectId: item.id, message: "Pattern lacks canonical definition or supporting Traits." });
  }
  for (const item of runtime.conflicts) {
    if (item.traitIds.some((id) => !traitIds.has(id)) || (item.synthesisPatternId && !patternIds.has(item.synthesisPatternId))) issues.push({ code: "INVALID_CONFLICT", objectId: item.id, message: "Conflict lacks Traits or canonical synthesis Pattern." });
  }
  for (const item of runtime.humanMeanings) {
    if (!(item.id in HUMAN_MEANING_LIBRARY) || item.patternIds.some((id) => !patternIds.has(id))) issues.push({ code: "INVALID_HUMAN_MEANING", objectId: item.id, message: "Human Meaning lacks canonical definition or supporting Pattern." });
  }
  for (const item of runtime.needs) {
    if (!(item.id in NEED_LIBRARY)) issues.push({ code: "UNKNOWN_NEED", objectId: item.id, message: "Need is absent from its canonical library." });
  }
  for (const item of runtime.growth) {
    if (!(item.id in GROWTH_LIBRARY)) issues.push({ code: "UNKNOWN_GROWTH", objectId: item.id, message: "Growth is absent from its canonical library." });
  }
  for (const item of [...runtime.humanMeanings, ...runtime.needs, ...runtime.growth]) {
    const explanation = runtime.explainability.find((entry) => entry.objectId === item.id);
    if (!explanation || explanation.chain.length < 2 || !explanation.evidenceIds.length) issues.push({ code: "BROKEN_EXPLAINABILITY", objectId: item.id, message: "Applied knowledge requires a complete Explainability Chain." });
  }
  if (!CONFIDENCE.has(runtime.confidence)) issues.push({ code: "INVALID_RUNTIME_CONFIDENCE", objectId: "runtime", message: "Runtime confidence is not canonical." });
  return issues;
}

export function assertValidHumanMeaningRuntime(runtime: Omit<HumanMeaningRuntime, "validation">): void {
  const issues = validateHumanMeaningRuntime(runtime);
  if (issues.length) throw new HumanMeaningRuntimeValidationError(issues);
}
