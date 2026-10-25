import type { HumanDesignBirthProfile } from "./types";

export type NormalizedBirthFingerprint = {
  uid: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
  revisionHash: string;
};

function normalizeCoord(val: unknown): number | null {
  if (typeof val === "number" && Number.isFinite(val)) {
    return Math.round(val * 10000) / 10000;
  }
  if (typeof val === "string") {
    const parsed = parseFloat(val.trim());
    if (Number.isFinite(parsed)) return Math.round(parsed * 10000) / 10000;
  }
  return null;
}

function normalizeTime(val: unknown): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  const match = trimmed.match(/^([01]?\d|2[0-3]):([0-5]\d)/);
  if (!match) return "";
  const h = match[1].padStart(2, "0");
  const m = match[2];
  return `${h}:${m}`;
}

function normalizeDate(val: unknown): string {
  if (typeof val !== "string") return "";
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return "";
}

function normalizeTimezone(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.trim();
}

function normalizeCity(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.trim().toLowerCase();
}

function fnv1a32(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Computes a deterministic, precision-preserving fingerprint for Human Design birth input.
 * Scoped to UID and canonicalized birth dimensions.
 */
export function computeBirthInputFingerprint(
  uid: string,
  input: HumanDesignBirthProfile | Record<string, unknown> | null | undefined,
): NormalizedBirthFingerprint | null {
  if (!uid || typeof uid !== "string") return null;
  if (!input || typeof input !== "object") return null;

  const birthDate = normalizeDate(input.birthDate);
  const birthTime = normalizeTime(input.birthTime);
  const birthCity = normalizeCity(input.birthCity || (input as Record<string, unknown>).birthPlace);
  const timezone = normalizeTimezone(input.timezone);
  const latitude = normalizeCoord(input.latitude);
  const longitude = normalizeCoord(input.longitude);

  if (!birthDate || !birthTime) return null;

  const canonicalString = [
    uid.trim(),
    birthDate,
    birthTime,
    birthCity,
    timezone,
    latitude !== null ? latitude.toFixed(4) : "",
    longitude !== null ? longitude.toFixed(4) : "",
  ].join("::");

  const revisionHash = `bip_v1_${fnv1a32(canonicalString)}`;

  return {
    uid: uid.trim(),
    birthDate,
    birthTime,
    birthCity,
    timezone,
    latitude,
    longitude,
    revisionHash,
  };
}

export type InputMatchStatus = "MATCH" | "CHANGED" | "UNKNOWN_LEGACY";

/**
 * Compares an existing chart's recorded input fingerprint with current input.
 * Legacy charts without a fingerprint are UNKNOWN_LEGACY (never automatically declared changed or corrupted).
 */
export function compareBirthInputMatch(
  uid: string,
  storedHumanDesign: unknown,
  currentInput: HumanDesignBirthProfile | Record<string, unknown> | null | undefined,
): InputMatchStatus {
  if (!storedHumanDesign || typeof storedHumanDesign !== "object") return "UNKNOWN_LEGACY";
  const hd = storedHumanDesign as Record<string, unknown>;
  const storedHash = typeof hd.inputHash === "string" && hd.inputHash.trim() ? hd.inputHash.trim() : null;

  if (!storedHash) {
    return "UNKNOWN_LEGACY";
  }

  const currentFp = computeBirthInputFingerprint(uid, currentInput);
  if (!currentFp) return "CHANGED";

  return storedHash === currentFp.revisionHash ? "MATCH" : "CHANGED";
}
