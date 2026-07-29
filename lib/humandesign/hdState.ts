export const HD_ENGINE_VERSION = "gaia-hd-v1";
export const HD_PENDING_TTL_MS = 60_000;

export type HdState =
  | "CANONICAL"
  | "FALLBACK_LABELED"
  | "PENDING"
  | "RETRIABLE_ERROR"
  | "TERMINAL_ERROR";

export type HdStateResult = {
  state: HdState;
  type: string | null;
  provenance: "canonical" | "historical" | "local_fallback" | "pending" | "service" | "error";
  reason: string;
  needsUpgrade: boolean;
};

type HdStateOptions = {
  now?: number;
};

type HdRecord = Record<string, unknown>;

function asRecord(value: unknown): HdRecord | null {
  return value && typeof value === "object" ? value as HdRecord : null;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getAttemptMs(record: HdRecord): number | null {
  for (const key of ["lastCalculationAttempt", "calculatedAt", "updatedAt", "generatedAt"]) {
    const value = record[key];
    if (value instanceof Date && Number.isFinite(value.getTime())) return value.getTime();
    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value).getTime();
      if (Number.isFinite(parsed)) return parsed;
    }
    if (value && typeof value === "object" && "toMillis" in value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
      const millis = (value as { toMillis: () => unknown }).toMillis();
      if (typeof millis === "number" && Number.isFinite(millis)) return millis;
    }
    if (value && typeof value === "object" && "seconds" in value) {
      const seconds = (value as { seconds?: unknown }).seconds;
      if (typeof seconds === "number" && Number.isFinite(seconds)) return seconds * 1_000;
    }
  }
  return null;
}

function result(
  state: HdState,
  type: string | null,
  provenance: HdStateResult["provenance"],
  reason: string,
  needsUpgrade = false,
): HdStateResult {
  return { state, type, provenance, reason, needsUpgrade };
}

/**
 * Classifies one stored Human Design payload. Consumers must use this result
 * rather than reinterpreting status, source, quality, or engine-version fields.
 */
export function getHdState(value: unknown, options: HdStateOptions = {}): HdStateResult {
  const hd = asRecord(value);
  if (!hd) return result("PENDING", null, "pending", "missing_payload");

  const type = readString(hd.type) || readString(hd.auditCandidateType) || null;
  const status = readString(hd.status).toLowerCase();
  const calculationStatus = readString(hd.calculationStatus).toLowerCase();
  const source = readString(hd.source).toLowerCase();
  const quality = readString(hd.calculationQuality).toLowerCase();
  const engineVersion = readString(hd.hdEngineVersion);

  if ([status, calculationStatus].includes("error")) {
    return result("TERMINAL_ERROR", type, "error", "terminal_error");
  }

  if (["retriable_error", "timeout", "connection_error", "service_unavailable"].includes(status)
    || ["retriable_error", "timeout", "connection_error", "service_unavailable"].includes(calculationStatus)
    || ["timeout", "connection_error", "service_unavailable"].includes(quality)) {
    return result("RETRIABLE_ERROR", type, "service", calculationStatus || status || quality);
  }

  const isCanonical = Boolean(
    type
      && ["ready", "verified"].includes(status)
      && !["local-fallback", "fallback_approximation", "pending", "error"].includes(source)
      && quality !== "fallback_approximation"
      && engineVersion === HD_ENGINE_VERSION,
  );
  if (isCanonical) {
    return result("CANONICAL", type, "canonical", "canonical");
  }

  const isHistorical = Boolean(type && engineVersion !== HD_ENGINE_VERSION);
  const isLocalFallback = source === "local-fallback"
    || source === "fallback_approximation"
    || quality === "fallback_approximation";
  if (isHistorical || isLocalFallback || (Boolean(type) && ["ready", "verified", "needs_verified_engine"].includes(status))) {
    return result(
      "FALLBACK_LABELED",
      type,
      isHistorical ? "historical" : "local_fallback",
      isHistorical ? "historical_or_legacy_chart" : "noncanonical_fallback",
      true,
    );
  }

  const attemptMs = getAttemptMs(hd);
  const now = options.now ?? Date.now();
  if (attemptMs !== null && now - attemptMs >= HD_PENDING_TTL_MS) {
    return result("RETRIABLE_ERROR", type, "pending", "pending_ttl_exceeded");
  }

  return result("PENDING", type, "pending", status || calculationStatus || "pending");
}
