import type { HumanDesignBirthProfile, HumanDesignChart } from "./types";
import { safeDiagnostic } from "./safeDiagnostic";
import { getHdState, HD_ENGINE_VERSION as HD_STATE_ENGINE_VERSION } from "./hdState";

export const HD_ENGINE_VERSION = HD_STATE_ENGINE_VERSION;

export type HumanDesignCanonicalFailureReason =
  | "canonical"
  | "missing_type"
  | "invalid_status"
  | "invalid_source"
  | "fallback_quality"
  | "service_unavailable"
  | "timeout"
  | "connection_error"
  | "missing_engine_version"
  | "unknown";

export function isCanonicalHumanDesign(value: unknown): boolean {
  return getHdState(value).state === "CANONICAL";
}

export function getHumanDesignCanonicalFailureReason(
  value: unknown,
): HumanDesignCanonicalFailureReason {
  if (!value || typeof value !== "object") return "unknown";

  const hd = value as Partial<HumanDesignChart>;
  const type = String(hd.type || "").trim();
  const status = String(hd.status || "").toLowerCase();
  const source = String(hd.source || "").toLowerCase();
  const quality = String(hd.calculationQuality || "").toLowerCase();
  const calculationStatus = String(hd.calculationStatus || "").toLowerCase();
  const invalidSources = new Set(["local-fallback", "fallback_approximation", "pending", "error"]);

  if (calculationStatus === "timeout" || quality === "timeout") return "timeout";
  if (calculationStatus === "connection_error" || quality === "connection_error") return "connection_error";
  if (calculationStatus === "service_unavailable" || quality === "service_unavailable" || status === "service_unavailable") {
    return "service_unavailable";
  }
  if (!type) return "missing_type";
  if (!["ready", "verified"].includes(status)) return "invalid_status";
  if (!source || invalidSources.has(source)) return "invalid_source";
  if (quality === "fallback_approximation") return "fallback_quality";
  if (hd.hdEngineVersion !== HD_ENGINE_VERSION) return "missing_engine_version";

  return isCanonicalHumanDesign(hd) ? "canonical" : "unknown";
}

export function isValidHistoricalHumanDesign(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const hd = value as Partial<HumanDesignChart> & Record<string, unknown>;
  const type = String(hd.type || hd.auditCandidateType || "").trim();
  const status = String(hd.status || "").toLowerCase();
  if (!type) return false;
  if (status === "error" || status === "missing_input") return false;
  return true;
}

export function getCanonicalHumanDesign(value: unknown): Partial<HumanDesignChart> | null {
  return isCanonicalHumanDesign(value) ? value as Partial<HumanDesignChart> : null;
}

export function getCanonicalHumanDesignType(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const hd = value as Partial<HumanDesignChart> & Record<string, unknown>;
  if (isCanonicalHumanDesign(hd)) return hd.type ?? null;
  if (isValidHistoricalHumanDesign(hd)) return (hd.type || hd.auditCandidateType || null) as string | null;
  return null;
}

export function createHdCacheKey(profile: HumanDesignBirthProfile): string {
  return [profile.birthDate, profile.birthTime, profile.timezone, profile.latitude, profile.longitude].map((value) => String(value ?? "").trim()).join("|");
}

export function isRecognizedHumanDesignType(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return ["generator", "manifesting generator", "projector", "manifestor", "reflector"].includes(normalized);
}

export function normalizeHumanDesignType(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "-") return null;
  const lower = trimmed.toLowerCase();
  if (lower === "generator") return "Generator";
  if (lower === "manifesting generator" || lower === "manifesting_generator") return "Manifesting Generator";
  if (lower === "projector") return "Projector";
  if (lower === "manifestor") return "Manifestor";
  if (lower === "reflector") return "Reflector";
  return trimmed;
}

export function preserveCalculatedHumanDesign(existing?: unknown, candidate?: unknown): Partial<HumanDesignChart> {
  if (isCanonicalHumanDesign(existing)) return existing as Partial<HumanDesignChart>;
  if (isCanonicalHumanDesign(candidate)) return candidate as Partial<HumanDesignChart>;
  return (candidate || existing || {}) as Partial<HumanDesignChart>;
}

export function logHumanDesignAudit(profile: HumanDesignBirthProfile, result: Partial<HumanDesignChart>, source: string) {
  safeDiagnostic("human-design", "calculate", {
    valid: Boolean(profile.birthDate && profile.birthTime && profile.timezone && profile.latitude != null && profile.longitude != null),
    complete: isCanonicalHumanDesign(result),
    started: Boolean(source),
  });
}
