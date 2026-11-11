import { createHash, createHmac } from "node:crypto";

export type NormalizedBirthInput = {
  birthDate?: string | null;
  birthTime?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  birthCity?: string | null;
  birthCountry?: string | null;
  fullName?: string | null;
};

export function normalizeBirthDate(value?: string | null): string {
  if (!value) return "";
  const trimmed = value.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed.toLowerCase();
  return parsed.toISOString().slice(0, 10);
}

export function normalizeBirthTime(value?: string | null): string {
  if (!value) return "UNKNOWN";
  const match = /(\d{1,2}):(\d{1,2})/.exec(value.trim());
  if (!match) return "UNKNOWN";
  const hh = match[1].padStart(2, "0");
  const mm = match[2].padStart(2, "0");
  return `${hh}:${mm}`;
}

export function normalizeBirthLocation(input: NormalizedBirthInput): string {
  if (
    typeof input.latitude === "number" &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.longitude)
  ) {
    return `${input.latitude.toFixed(2)},${input.longitude.toFixed(2)}`;
  }
  const city = (input.birthCity || "").trim().toLowerCase().replace(/\s+/g, " ");
  const country = (input.birthCountry || "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!city && !country) return "UNKNOWN";
  return `${city}|${country}`;
}

export function normalizeDisplayName(value?: string | null): string {
  return (value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function resolveHmacSecret(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {},
): { secret: string; ephemeral: boolean } {
  const configured = env.BHUMI_ANTI_ABUSE_HMAC_SECRET?.trim();
  if (configured && configured.length >= 16) {
    return { secret: configured, ephemeral: false };
  }
  if (env.NODE_ENV === "production") {
    throw new Error("ANTI_ABUSE_HMAC_SECRET_MISSING");
  }
  return {
    secret: "bhumi-dev-local-anti-abuse-hmac-key-only",
    ephemeral: true,
  };
}

export function computeBirthProfileHmac(
  input: NormalizedBirthInput,
  secret: string,
): { birthCoreHmac: string | null; birthWithNameHmac: string | null } {
  const date = normalizeBirthDate(input.birthDate);
  if (!date) {
    return { birthCoreHmac: null, birthWithNameHmac: null };
  }
  const time = normalizeBirthTime(input.birthTime);
  const loc = normalizeBirthLocation(input);
  const corePayload = `v1|${date}|${time}|${loc}`;
  const birthCoreHmac = createHmac("sha256", secret).update(corePayload).digest("hex");

  const name = normalizeDisplayName(input.fullName);
  const birthWithNameHmac = name
    ? createHmac("sha256", secret).update(`${corePayload}|${name}`).digest("hex")
    : null;

  return { birthCoreHmac, birthWithNameHmac };
}

export function computeDeviceIdentityHash(rawValue: string, salt = "bhumi-device-v1"): string {
  const cleaned = rawValue.trim();
  return createHash("sha256").update(`${salt}:${cleaned}`).digest("hex");
}

export function computeUidHash(uid: string, secret: string): string {
  return createHmac("sha256", secret).update(`uid:${uid}`).digest("hex").slice(0, 32);
}
