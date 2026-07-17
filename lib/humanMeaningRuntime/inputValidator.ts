import { deepFreeze, sortValue } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { RuntimeValidationIssue, UnifiedBlueprintInput } from "@/lib/humanMeaningRuntime/types";

const BLUEPRINT_SYSTEMS = [
  "humanDesign",
  "bazi",
  "natalChart",
  "astrology",
  "numerology",
  "lifePath",
  "destinyMatrix",
  "vedic",
  "weton",
  "tzolkin",
] as const;

export class HumanMeaningInputValidationError extends Error {
  constructor(public readonly issues: readonly RuntimeValidationIssue[]) {
    super(`HUMAN_MEANING_INPUT_INVALID:${issues.map((issue) => issue.code).join(",")}`);
    this.name = "HumanMeaningInputValidationError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isCanonicalValue(value: unknown, seen = new Set<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every((item) => isCanonicalValue(item, seen));
  if (!isRecord(value) || seen.has(value)) return false;
  seen.add(value);
  const valid = Object.values(value).every((item) => item === undefined || isCanonicalValue(item, seen));
  seen.delete(value);
  return valid;
}

export function validateBlueprintInput(input: unknown): RuntimeValidationIssue[] {
  if (!isRecord(input)) {
    return [{ code: "INVALID_INPUT_SHAPE", objectId: "input", message: "Blueprint input must be a plain object." }];
  }

  const present = BLUEPRINT_SYSTEMS.filter((system) => input[system] !== null && input[system] !== undefined);
  if (!present.length) {
    return [{ code: "MISSING_REQUIRED_SYSTEM_DATA", objectId: "input", message: "At least one recognized Blueprint system is required." }];
  }

  const issues: RuntimeValidationIssue[] = [];
  for (const system of present) {
    const value = input[system];
    const validShape = system === "lifePath" ? typeof value === "number" || isRecord(value) : isRecord(value);
    if (!validShape || !isCanonicalValue(value)) {
      issues.push({ code: "INVALID_SYSTEM_DATA", objectId: system, message: `${system} contains malformed or unsupported data.` });
    }
  }
  return issues;
}

export function normalizeBlueprintInput(input: unknown): UnifiedBlueprintInput {
  const issues = validateBlueprintInput(input);
  if (issues.length) throw new HumanMeaningInputValidationError(issues);
  const record = input as Record<string, unknown>;
  const normalized = Object.fromEntries(
    BLUEPRINT_SYSTEMS
      .filter((system) => record[system] !== null && record[system] !== undefined)
      .map((system) => [system, sortValue(record[system])]),
  ) as UnifiedBlueprintInput;
  return deepFreeze(normalized) as UnifiedBlueprintInput;
}

export function listBlueprintSystems(input: UnifiedBlueprintInput): string[] {
  return BLUEPRINT_SYSTEMS.filter((system) => input[system] !== null && input[system] !== undefined);
}
