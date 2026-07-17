import type { KnowledgeConfidence } from "@/lib/humanMeaningRuntime/types";

const CONFIDENCE_ORDER: KnowledgeConfidence[] = ["weak", "emerging", "moderate", "high", "very-high"];

export function strongestConfidence(values: readonly KnowledgeConfidence[]): KnowledgeConfidence {
  if (!values.length) return "weak";
  const strongest = Math.max(...values.map((value) => CONFIDENCE_ORDER.indexOf(value)));
  const convergenceBonus = new Set(values).size > 0 && values.length > 1 ? 1 : 0;
  return CONFIDENCE_ORDER[Math.min(CONFIDENCE_ORDER.length - 1, strongest + convergenceBonus)];
}

export function weakestConfidence(values: readonly KnowledgeConfidence[]): KnowledgeConfidence {
  if (!values.length) return "weak";
  return CONFIDENCE_ORDER[Math.min(...values.map((value) => CONFIDENCE_ORDER.indexOf(value)))];
}

export function readPath(source: unknown, path: readonly string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Record<string, unknown>)[key];
  }, source);
}

export function normalizedString(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "")
    : "";
}

export function stableFingerprint(value: unknown): string {
  const canonical = stableSerialize(value);
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `hmr-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function stableSerialize(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => [key, sortValue(item)]),
  );
}

export function createInputFingerprint(input: unknown): string {
  return stableFingerprint({ kind: "human-meaning-input", input });
}

export function createProvenanceFingerprint(provenance: Omit<import("@/lib/humanMeaningRuntime/types").RuntimeProvenance, "fingerprint">): string {
  return stableFingerprint({ kind: "human-meaning-provenance", provenance });
}

export function createRuntimeOutputFingerprint(runtime: Readonly<Record<string, unknown>>): string {
  const { generatedAt: _generatedAt, outputFingerprint: _outputFingerprint, validation: _validation, ...canonical } = runtime;
  void _generatedAt;
  void _outputFingerprint;
  void _validation;
  return stableFingerprint({ kind: "human-meaning-output", runtime: canonical });
}

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value as Record<string, unknown>)) deepFreeze(nested);
  }
  return value;
}

export function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
