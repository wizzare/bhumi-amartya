import {
  calculateHumanDesignTypeFromBirthData,
  calculateHumanDesignProfileFromBirthData,
  centersByChannel
} from "./calculateHumanDesignType";
import { emptyHumanDesignCenters } from "./types";
import {
  HD_ENGINE_VERSION,
  getHumanDesignCanonicalFailureReason,
  isCanonicalHumanDesign,
} from "./hdAudit";

// Legacy blueprint shapes are intentionally heterogeneous at this repair boundary.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export function isProtectedHumanDesign(current: AnyRecord): boolean {
  const source = readString(current.source);
  const isOwnerManualVerified =
    source === "manual_verified" &&
    readString(current.calculationQuality) === "manual_verified_owner_override" &&
    current.hdEngineVersion === HD_ENGINE_VERSION &&
    Boolean(readString(current.type));

  return isCanonicalHumanDesign(current) || isOwnerManualVerified;
}

export function getHumanDesignRepairReason(current: AnyRecord): string {
  const source = readString(current.source);
  const canonicalFailure = getHumanDesignCanonicalFailureReason(current);

  if (source === "local-fallback" || readString(current.calculationQuality) === "fallback_approximation") {
    return "legacy_local_fallback";
  }
  if (canonicalFailure === "missing_engine_version") return "legacy_missing_engine";
  if (canonicalFailure === "missing_type") return "missing_type";
  if (canonicalFailure === "invalid_status") return "invalid_status";
  return "invalid_source";
}

function readString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function readNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * Build 31: Generates a stable hash of birth inputs to detect changes.
 */
function generateInputHash(input: AnyRecord): string {
  const parts = [
    input.birthDate,
    input.birthTime,
    input.latitude,
    input.longitude,
    input.timezone,
  ].map(p => String(p || "").trim());
  return parts.join("|");
}

export function hasReadyHumanDesign(blueprint?: AnyRecord | null): boolean {
  const humanDesign = blueprint?.humanDesign;
  return Boolean(
    readString(humanDesign?.type) &&
      readString(humanDesign?.profile) &&
      readString(humanDesign?.authority) &&
      readString(humanDesign?.strategy) &&
      (humanDesign?.status === "ready" || humanDesign?.status === "verified"),
  );
}

export function repairHumanDesignIfPossible<T extends AnyRecord>(
  blueprint: T,
  profile?: AnyRecord | null,
): { blueprint: T; repaired: boolean; reason: string } {
  const current = blueprint.humanDesign ?? {};
  const status = readString(current.status);
  const source = readString(current.source);
  const uid = blueprint.uid;

  const isProtected = isProtectedHumanDesign(current);

  if (isProtected) {
    console.log(`[HD REPAIR SKIPPED] User ${uid}: Status "${status}" is protected/canonical.`);
    return { blueprint, repaired: false, reason: "protected-canonical" };
  }

  const repairReason = getHumanDesignRepairReason(current);

  // BUILD 31 HARDENING: If profile fetch failed and we have no input data, do NOT guess.
  const input = blueprint.input ?? {};
  const birthDate =
    readString(input.birthDate) ||
    readString(profile?.birthDate) ||
    readString(profile?.profile?.blueprintInput?.birthDate);
  const birthTime =
    readString(input.birthTime) ||
    readString(profile?.birthTime) ||
    readString(profile?.profile?.blueprintInput?.birthTime) ||
    "12:00";
  const longitude =
    readNumber(input.longitude) ??
    readNumber(profile?.longitude);
  const latitude =
    readNumber(input.latitude) ??
    readNumber(profile?.latitude);
  const timezone =
    readString(input.timezone) ||
    readString(profile?.timezone);

  if (!birthDate || !birthTime) {
    console.warn(`[HD REPAIR BLOCKED] User ${uid}: Missing birth date/time in both blueprint and profile.`);
    return { blueprint, repaired: false, reason: repairReason };
  }

  // Check for input changes before recalculating (avoiding unnecessary writes)
  const currentHash = generateInputHash({ birthDate, birthTime, latitude, longitude, timezone });
  const storedHash = readString(current.inputHash);

  if (storedHash && currentHash === storedHash && status === "ready") {
     // BUILD 40: Check if it needs accuracy upgrade (if it's from legacy fallback)
     if (source === "local-fallback" && !current.needsUpgrade) {
       console.log(`[HD UPGRADE DETECTED] User ${uid}: Marking for accuracy upgrade.`);
       return {
         blueprint: {
           ...blueprint,
           humanDesign: { ...current, needsUpgrade: true }
         },
         repaired: true,
         reason: repairReason
       };
     }
     console.log(`[HD REPAIR SKIPPED] User ${uid}: Inputs match stored hash.`);
     return { blueprint, repaired: false, reason: repairReason };
  }

  // BUILD 31: Check if timezone is missing. We no longer use longitude-only guesswork as canonical.
  if (!timezone) {
    console.warn(`[HD REPAIR DEFERRED] User ${uid}: Timezone missing. Marking as needs_verified_timezone.`);
    return {
      blueprint: {
        ...blueprint,
        humanDesign: {
          ...current,
          status: "needs_verified_timezone",
          calculationStatus: "needs_verified_timezone",
          note: "Human Design requires a verified timezone offset for accuracy.",
          updatedAt: new Date().toISOString(),
        }
      },
      repaired: true,
      reason: repairReason
    };
  }

  console.log(`[HD VALIDATION DEFERRED] User ${uid}: local approximation cannot become canonical Gaia data.`);

  const result = calculateHumanDesignTypeFromBirthData(birthDate, birthTime, timezone, longitude);
  if (!result) {
    console.error(`[HD REPAIR FAILED] User ${uid}: Calculation engine returned null.`);
    return { blueprint, repaired: false, reason: repairReason };
  }

  const recalculatedType = result.type;
  const recalculatedProfile = calculateHumanDesignProfileFromBirthData(birthDate, birthTime, timezone, longitude) || readString(current.profile);

  const centers = emptyHumanDesignCenters();
  result.channels.forEach(ch => {
      centersByChannel[ch].forEach(c => {
          const key = c.toLowerCase().replace(/[^a-z]/g, "");
          if (key === "head") centers.head = true;
          if (key === "ajna") centers.ajna = true;
          if (key === "throat") centers.throat = true;
          if (key === "g") centers.g = true;
          if (key === "ego") centers.ego = true;
          if (key === "spleen") centers.spleen = true;
          if (key === "sacral") centers.sacral = true;
          if (key === "solarplexus") centers.solarPlexus = true;
          if (key === "root") centers.root = true;
      });
  });

  const repairedHumanDesign = {
    ...current,
    type: null,
    profile: null,
    authority: null,
    strategy: null,
    definition: result.definition,
    centers,
    gates: result.activeGates,
    channels: result.channels,
    status: "pending",
    source: "local-fallback",
    accuracy: "approximate",
    calculationQuality: "fallback_approximation",
    calculationStatus: "pending",
    inputHash: currentHash,
    timezone,
    calculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: "Human Design sedang diproses.",
    needsUpgrade: true,
    auditCandidateType: recalculatedType,
    auditCandidateProfile: recalculatedProfile,
  };

  console.log(`[HD AUDIT CANDIDATE] User ${uid}: approximation retained internally, UI remains pending.`);

  return {
    blueprint: {
      ...blueprint,
      humanDesign: repairedHumanDesign,
      updatedAt: new Date().toISOString(),
    },
    repaired: true,
    reason: repairReason,
  };
}
