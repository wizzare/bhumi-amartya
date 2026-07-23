import { calculateLifePath } from "../calculations/calculateLifePath";
import { calculateNumerology } from "../calculations/calculateNumerology";
import { calculateDestinyMatrixForBlueprint } from "../calculations/destinyMatrix/mapToBlueprint";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { calculateNatalBasicsAsync } from "@/lib/astrology/calculateNatalBasics";
import { blueprintRepository } from "@/lib/repositories/blueprintRepository";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { applyOwnerOverrideIfApplicable } from "@/lib/humandesign/ownerOverride";
import { isCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";

const inFlightRecoveries = new Map<string, Promise<any>>();

export interface UserProfileInput {
  uid: string;
  fullName?: string;
  displayName?: string;
  email?: string | null;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  [key: string]: any;
}

/**
 * Fast basic blueprint generator that does NOT block on Human Design API call.
 */
export async function generateBasicBlueprintFast(input: UserProfileInput): Promise<any> {
  const birthDate = input.birthDate || "1995-01-01";
  const birthTime = input.birthTime || "12:00";
  const birthCity = input.birthCity || "";
  const birthCountry = input.birthCountry || null;
  const latitude = input.latitude ?? null;
  const longitude = input.longitude ?? null;
  const timezone = input.timezone || "UTC";
  const fullName = input.fullName || input.displayName || "User";

  const lifePathBlueprint = calculateLifePath(birthDate);
  const nameNumerology = calculateNumerology(fullName, birthDate);
  const destinyMatrix = calculateDestinyMatrixForBlueprint(birthDate);
  const weton = calculateWeton({ birthDate, birthTime });
  const bazi = calculateBazi({ birthDate, birthTime, timezone });
  const vedic = calculateVedic({ birthDate, birthTime, birthCity, latitude, longitude, timezone });
  const tzolkin = calculateTzolkin({ birthDate });

  const natalBasics: any = await calculateNatalBasicsAsync({
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
  }).catch(() => ({
    sunSign: "Aries",
    moonSign: "Aries",
    ascendant: "Aries",
  }));

  const natalChart = {
    sunSign: natalBasics.sunSign || "Aries",
    moonSign: natalBasics.moonSign || undefined,
    risingSign: natalBasics.ascendant || undefined,
    ascendant: natalBasics.ascendant || undefined,
    midheaven: natalBasics.midheaven || undefined,
    mc: natalBasics.midheaven || undefined,
    planets: natalBasics.planets || undefined,
    northNode: natalBasics.northNode || undefined,
    southNode: natalBasics.southNode || undefined,
    chiron: natalBasics.chiron || undefined,
    lilith: natalBasics.lilith || undefined,
    houses: natalBasics.houses || undefined,
    placidusHouses: natalBasics.placidusHouses || undefined,
    wholeSignHouses: natalBasics.wholeSignHouses || undefined,
    elements: natalBasics.elements || undefined,
  };

  return {
    type: "user_blueprint",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    input: {
      birthDate,
      birthTime,
      birthCity,
      birthCountry,
      latitude,
      longitude,
      timezone,
    },
    lifePath: lifePathBlueprint,
    numerology: nameNumerology,
    destinyMatrix,
    weton,
    bazi,
    vedic,
    tzolkin,
    natalChart,
    humanDesign: {
      status: "pending",
      type: null,
      source: "pending",
      calculatedAt: null,
    },
  };
}

/**
 * Idempotent recovery for missing blueprints/{uid} document.
 */
export function recoverUserBlueprint(uid: string, profile: UserProfileInput): Promise<any> {
  if (!uid) throw new Error("RECOVERY_FAILED_NO_UID");

  // Check in-flight promise to prevent concurrent duplicate recoveries
  if (inFlightRecoveries.has(uid)) {
    console.log(`[BLUEPRINT RECOVERY] In-flight recovery detected for UID ${uid}, re-using promise.`);
    return inFlightRecoveries.get(uid)!;
  }

  const recoveryPromise = (async () => {
    try {
      console.log(`[BLUEPRINT RECOVERY] Starting automatic recovery check for UID ${uid}`);
      
      // Cross-runtime check 1: Verify if blueprint already exists in Firestore/repository layer
      const existingDoc = await blueprintRepository.getUserBlueprint(uid).catch(() => null);
      if (existingDoc && ((existingDoc as any).type || (existingDoc as any).lifePath)) {
        console.log(`[BLUEPRINT RECOVERY] Existing valid blueprint found in repository layer for UID ${uid}. Preserving.`);
        await storageProvider.saveUserBlueprint(existingDoc as any).catch(() => {});
        
        // ONLY trigger HD calculation if HD is NOT canonical/valid
        if (!isCanonicalHumanDesign(existingDoc.humanDesign)) {
          void triggerBackgroundHdCalculation(uid, profile, existingDoc);
        }
        return existingDoc;
      }

      const basicBlueprint = await generateBasicBlueprintFast(profile);

      // Cross-runtime check 2: Atomic re-check before write to prevent race condition across devices
      const recheckDoc = await blueprintRepository.getUserBlueprint(uid).catch(() => null);
      if (recheckDoc && ((recheckDoc as any).type || (recheckDoc as any).lifePath)) {
        console.log(`[BLUEPRINT RECOVERY] Race condition resolved. Existing document created concurrently for UID ${uid}.`);
        await storageProvider.saveUserBlueprint(recheckDoc as any).catch(() => {});
        return recheckDoc;
      }

      // Save to Firestore and local storage
      await blueprintRepository.saveUserBlueprint(uid, basicBlueprint).catch((err) => {
        console.warn(`[BLUEPRINT RECOVERY] Firestore save warning:`, err);
      });
      await storageProvider.saveUserBlueprint(basicBlueprint).catch(() => {});

      // Trigger non-blocking HD calculation in background
      void triggerBackgroundHdCalculation(uid, profile, basicBlueprint);

      return basicBlueprint;
    } finally {
      inFlightRecoveries.delete(uid);
    }
  })();

  inFlightRecoveries.set(uid, recoveryPromise);
  return recoveryPromise;
}

/**
 * Non-blocking background Human Design calculation and persistence.
 * Existing valid HD is NOT modified.
 */
export async function triggerBackgroundHdCalculation(
  uid: string,
  profile: UserProfileInput,
  currentBlueprint: any
) {
  if (!currentBlueprint) return;

  // RULE: Existing canonical valid HD for historical users must NOT be re-opened or modified!
  if (isCanonicalHumanDesign(currentBlueprint.humanDesign)) {
    console.log(`[BACKGROUND HD] HD already valid and canonical for UID ${uid}. Skipping.`);
    return;
  }

  const birthDate = profile.birthDate || currentBlueprint.input?.birthDate;
  const birthTime = profile.birthTime || currentBlueprint.input?.birthTime || "12:00";
  const birthCity = profile.birthCity || currentBlueprint.input?.birthCity || "";
  const birthCountry = profile.birthCountry || currentBlueprint.input?.birthCountry || null;
  const latitude = profile.latitude ?? currentBlueprint.input?.latitude ?? null;
  const longitude = profile.longitude ?? currentBlueprint.input?.longitude ?? null;
  const timezone = profile.timezone || currentBlueprint.input?.timezone || "UTC";

  if (!birthDate) return;

  try {
    console.log(`[BACKGROUND HD] Starting non-blocking HD calculation for UID ${uid}`);
    let hdCalculated = await calculateHumanDesign({
      birthDate,
      birthTime,
      birthCity,
      birthCountry,
      latitude,
      longitude,
      timezone,
    });

    const userEmail = profile.email || null;
    hdCalculated = applyOwnerOverrideIfApplicable(userEmail, hdCalculated);

    if (hdCalculated && isCanonicalHumanDesign(hdCalculated)) {
      const updatedBlueprint = {
        ...currentBlueprint,
        humanDesign: hdCalculated,
        updatedAt: new Date().toISOString(),
      };
      await blueprintRepository.saveUserBlueprint(uid, updatedBlueprint).catch(() => {});
      await storageProvider.saveUserBlueprint(updatedBlueprint).catch(() => {});
      console.log(`[BACKGROUND HD] HD calculation completed & updated for UID ${uid}`);
    }
  } catch (err) {
    console.warn(`[BACKGROUND HD FAILED] Non-blocking HD calculation failed for UID ${uid}:`, err);
  }
}
