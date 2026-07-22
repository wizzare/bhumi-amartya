import type { HumanDesignBirthProfile, HumanDesignChart } from "./types";

export const HD_ENGINE_VERSION = "gaia-hd-v1";

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

function normalizeBirthDate(value?: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function utcDateTime(profile: HumanDesignBirthProfile): string | null {
  if (!profile.birthDate || !profile.birthTime || !profile.timezone) return null;
  try {
    const timezone = profile.timezone.trim();
    const offset = /^[+-]\d{2}:\d{2}$/.test(timezone) ? timezone : "";
    if (!offset) return null;
    const time = /^\d{2}:\d{2}:\d{2}$/.test(profile.birthTime)
      ? profile.birthTime
      : `${profile.birthTime}:00`;
    const date = new Date(`${profile.birthDate}T${time}${offset}`);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

export function isCanonicalHumanDesign(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const hd = value as Partial<HumanDesignChart>;
  const status = String(hd.status || "").toLowerCase();
  const source = String(hd.source || "").toLowerCase();
  const quality = String(hd.calculationQuality || "").toLowerCase();
  const invalidSources = new Set(["local-fallback", "fallback_approximation", "pending", "error"]);
  return Boolean(
    hd.type
      && ["ready", "verified"].includes(status)
      && !invalidSources.has(source)
      && quality !== "fallback_approximation"
      && hd.hdEngineVersion === HD_ENGINE_VERSION,
  );
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

export function getCanonicalHumanDesign(value: unknown): Partial<HumanDesignChart> | null {
  return isCanonicalHumanDesign(value) ? value as Partial<HumanDesignChart> : null;
}

export function getCanonicalHumanDesignType(value: unknown): string | null {
  return getCanonicalHumanDesign(value)?.type ?? null;
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
  console.info("[GAIA HD AUDIT]", {
    rawBirthDate: profile.birthDate ?? null,
    normalizedBirthDate: normalizeBirthDate(profile.birthDate),
    birthTime: profile.birthTime ?? null,
    timezone: profile.timezone ?? null,
    city: profile.birthCity ?? null,
    country: profile.birthCountry ?? null,
    latitude: profile.latitude ?? null,
    longitude: profile.longitude ?? null,
    utcDateTime: utcDateTime(profile),
    hdSource: source,
    cacheKey: createHdCacheKey(profile),
    returnedType: result.type ?? null,
    hdEngineVersion: HD_ENGINE_VERSION,
    hdAuditStatus: result.hdAuditStatus ?? (isCanonicalHumanDesign(result) ? "validated" : "pending"),
    status: result.status ?? "pending",
  });
}
