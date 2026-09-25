import { DateTime } from "luxon";
import { isValidBirthDate } from "../birthday/birthdayMessage";
import { normalizeLiveHumanDesignResponse } from "./liveContract";
import { getHumanDesignCompleteness } from "./completeness";
import { HD_ENGINE_VERSION } from "./hdAudit";
import { getHdState } from "./hdState";
import type { HumanDesignBirthProfile } from "./types";

export function validateHumanDesignBirthData(value: unknown): string[] {
  const input = value && typeof value === "object" ? value as HumanDesignBirthProfile : {};
  const invalid: string[] = [];
  if (typeof input.birthDate !== "string" || !isValidBirthDate(input.birthDate)) invalid.push("birthDate");
  if (typeof input.birthTime !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.birthTime)) invalid.push("birthTime");
  if (typeof input.birthCity !== "string" || !input.birthCity.trim()) invalid.push("birthCity");
  if (typeof input.latitude !== "number" || !Number.isFinite(input.latitude) || Math.abs(input.latitude) > 90) invalid.push("latitude");
  if (typeof input.longitude !== "number" || !Number.isFinite(input.longitude) || Math.abs(input.longitude) > 180) invalid.push("longitude");
  const zone = typeof input.timezone === "string" && /^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(input.timezone) ? `UTC${input.timezone}` : input.timezone;
  if (typeof zone !== "string" || !zone.trim() || !DateTime.now().setZone(zone).isValid) invalid.push("timezone");
  if (!invalid.includes("birthDate") && !invalid.includes("birthTime") && !invalid.includes("timezone")) {
    const local = `${input.birthDate}T${input.birthTime}`;
    const instant = DateTime.fromISO(local, { zone: zone! });
    if (!instant.isValid || instant.toFormat("yyyy-MM-dd'T'HH:mm") !== local || instant.getPossibleOffsets().length !== 1) invalid.push("birthDateTime");
  }
  return invalid;
}

export function resolveHumanDesignBirthSources(...sources: unknown[]) {
  const aliases = { birthDate: ["birthDate", "dateOfBirth"], birthTime: ["birthTime", "timeOfBirth"], birthCity: ["birthCity", "birthPlace", "cityOfBirth", "placeOfBirth"], timezone: ["timezone"], latitude: ["latitude"], longitude: ["longitude"], birthCountry: ["birthCountry"] };
  const profile: Record<string, unknown> = {};
  const conflictingFields: string[] = [];
  for (const [field, keys] of Object.entries(aliases)) {
    const values = sources.flatMap((source) => source && typeof source === "object" ? keys.map((key) => (source as Record<string, unknown>)[key]) : [])
      .filter((value) => value !== undefined && value !== null && value !== "")
      .map((value) => typeof value === "string" ? value.trim() : value);
    const distinct = [...new Set(values)];
    if (distinct.length > 1) conflictingFields.push(field);
    else if (distinct.length === 1) profile[field] = distinct[0];
  }
  const invalidFields = validateHumanDesignBirthData(profile);
  return { profile: profile as HumanDesignBirthProfile, conflictingFields, invalidFields, complete: !conflictingFields.length && !invalidFields.length };
}

export function getPendingHumanDesignPresentation(hd: unknown, ...sources: unknown[]) {
  const state = getHdState(hd).state;
  return {
    shouldDisplay: state === "PENDING" || state === "RETRIABLE_ERROR",
    isRetriableError: state === "RETRIABLE_ERROR",
    birth: resolveHumanDesignBirthSources(...sources),
  };
}

export async function saveHumanDesignSettings(
  uid: string,
  profile: Record<string, unknown>,
  blueprint: Record<string, unknown>,
  saveProfile: (value: Record<string, unknown>) => Promise<unknown>,
  saveBlueprint: (value: Record<string, unknown>) => Promise<unknown>,
) {
  if (!uid || profile.uid !== uid || (blueprint.uid && blueprint.uid !== uid)) throw new Error("SETTINGS_OWNER_MISMATCH");
  if (validateHumanDesignBirthData(profile).length) throw new Error("SETTINGS_BIRTH_INVALID");
  await saveProfile(profile);
  await saveBlueprint({ ...blueprint, uid });
}

export async function auditHumanDesignCalculation(sources: unknown[], existingChart?: unknown) {
  const birth = resolveHumanDesignBirthSources(...sources);
  const { calculateHumanDesign } = await import("./calculateHumanDesign");
  const chart = birth.complete ? await calculateHumanDesign(birth.profile) : null;
  const stored = existingChart && typeof existingChart === "object" ? existingChart as Record<string, unknown> : {};
  const completeness = getHumanDesignCompleteness(chart);
  return {
    chart,
    completeness,
    accepted: completeness.coreState === "CANONICAL_CORE_COMPLETE" || completeness.coreState === "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL",
    invalidBirthFields: birth.invalidFields,
    conflictingBirthFields: birth.conflictingFields,
    ownerOverridePresent: stored.source === "manual_verified" || stored.source === "verified-override" || stored.calculationQuality === "manual_verified_owner_override",
    clientSchemaStamp: HD_ENGINE_VERSION,
    verifiedDeploymentProvenance: null,
    productionEligible: false as const,
  };
}

export function auditHumanDesignResponse(birthData: unknown, response: unknown) {
  const invalidBirthFields = validateHumanDesignBirthData(birthData);
  const chart = invalidBirthFields.length === 0 && response && typeof response === "object" && !Array.isArray(response)
    ? normalizeLiveHumanDesignResponse(response as Record<string, unknown>)
    : null;
  return {
    chart,
    completeness: getHumanDesignCompleteness(chart),
    invalidBirthFields,
    clientSchemaStamp: HD_ENGINE_VERSION,
    verifiedDeploymentProvenance: null,
    productionEligible: false as const,
  };
}
