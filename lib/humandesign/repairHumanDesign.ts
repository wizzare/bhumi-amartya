import { calculateHumanDesignTypeFromBirthData, calculateHumanDesignProfileFromBirthData } from "@/lib/humandesign/calculateHumanDesignType";

type AnyRecord = Record<string, any>;

const authorityByType: Record<string, string> = {
  Generator: "Sacral",
  "Manifesting Generator": "Sacral",
  Projector: "Emotional",
  Manifestor: "Emotional",
  Reflector: "Lunar",
};

const strategyByType: Record<string, string> = {
  Generator: "Wait to Respond",
  "Manifesting Generator": "Wait to Respond",
  Projector: "Wait for Invitation",
  Manifestor: "Inform Before Action",
  Reflector: "Wait a Lunar Cycle",
};

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

  // BUILD 31 PROTECTION: Do not recalculate if already verified or ready
  const isProtected =
    ["ready", "verified", "manual_verified"].includes(status) ||
    ["verified", "manual_override", "verified-override", "manual_verified"].includes(source);

  if (isProtected) {
    console.log(`[HD REPAIR SKIPPED] User ${uid}: Status "${status}" is protected/canonical.`);
    return { blueprint, repaired: false, reason: "protected-canonical" };
  }

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
    return { blueprint, repaired: false, reason: "missing-birth-data" };
  }

  // Check for input changes before recalculating (avoiding unnecessary writes)
  const currentHash = generateInputHash({ birthDate, birthTime, latitude, longitude, timezone });
  const storedHash = readString(current.inputHash);

  if (storedHash && currentHash === storedHash && status === "ready") {
     console.log(`[HD REPAIR SKIPPED] User ${uid}: Inputs match stored hash.`);
     return { blueprint, repaired: false, reason: "input-unchanged" };
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
      reason: "missing-timezone"
    };
  }

  console.log(`[HD RECALCULATING] User ${uid}: Status="${status}", Reason="repair-or-input-change"`);

  const recalculatedType = calculateHumanDesignTypeFromBirthData(birthDate, birthTime, timezone, longitude);
  if (!recalculatedType) {
    console.error(`[HD REPAIR FAILED] User ${uid}: Calculation engine returned null.`);
    return { blueprint, repaired: false, reason: "calculation-failed" };
  }

  const recalculatedProfile = calculateHumanDesignProfileFromBirthData(birthDate, birthTime, timezone, longitude) || readString(current.profile);

  const repairedHumanDesign = {
    ...current,
    type: recalculatedType,
    profile: recalculatedProfile,
    authority: authorityByType[recalculatedType] || "Sacral",
    strategy: strategyByType[recalculatedType] || "Wait to Respond",
    status: "ready",
    source: "local-fallback",
    accuracy: "approximate",
    calculationQuality: "fallback_approximation",
    calculationStatus: "completed",
    inputHash: currentHash,
    timezone,
    calculatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    note: "Calculated via Build 31 stable approximation engine.",
  };

  console.log(`[HD REPAIR SUCCESS] User ${uid}: Recalculated ${recalculatedType} ${recalculatedProfile}`);

  return {
    blueprint: {
      ...blueprint,
      humanDesign: repairedHumanDesign,
      updatedAt: new Date().toISOString(),
    },
    repaired: true,
    reason: "stabilized-recalculation",
  };
}
