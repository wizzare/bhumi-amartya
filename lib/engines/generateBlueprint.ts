import { calculateLifePath } from "../calculations/calculateLifePath";
import { calculateNumerology } from "../calculations/calculateNumerology";
import { calculateDestinyMatrixForBlueprint } from "../calculations/destinyMatrix/mapToBlueprint";
import calculateSunSign from "../calculations/calculateSunSign";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { applyOwnerOverrideIfApplicable } from "@/lib/humandesign/ownerOverride";
import { calculateNatalBasicsAsync } from "@/lib/astrology/calculateNatalBasics";
import { calculateAstrocartography } from "@/lib/astrocartography/calculateAstrocartography";
import { safeDiagnostic } from "@/lib/humandesign/safeDiagnostic";
import { auth } from "@/lib/firebase/firebase";
import { calculateWeton } from "@/lib/weton/calculateWeton";
import { calculateBazi } from "@/lib/bazi/calculateBazi";
import { calculateVedic } from "@/lib/vedic/calculateVedic";
import { calculateTzolkin } from "@/lib/tzolkin/calculateTzolkin";
import { Blueprint } from "../types/blueprint";

type BlueprintInput = {
  uid: string;
  fullName: string;
  email?: string | null;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  birthCity: string;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};

export const generateBlueprint = async (input: BlueprintInput): Promise<Blueprint> => {
  const { uid, birthDate, birthTime, birthCity, birthCountry, latitude, longitude, timezone, email } = input;

  const lifePathBlueprint = calculateLifePath(birthDate);
  const nameNumerology = calculateNumerology(input.fullName, birthDate);
  const destinyMatrix = calculateDestinyMatrixForBlueprint(birthDate);
  const weton = calculateWeton({ birthDate, birthTime });
  const bazi = calculateBazi({
    birthDate,
    birthTime: birthTime ?? "",
    timezone,
  });
  const vedic = calculateVedic({
    birthDate,
    birthTime,
    birthCity,
    latitude,
    longitude,
    timezone,
  });
  const tzolkin = calculateTzolkin({ birthDate });

  let humanDesign = await calculateHumanDesign({
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
  });

  // Apply owner override if applicable
  const userEmail = email || auth.currentUser?.email || null;
  humanDesign = applyOwnerOverrideIfApplicable(userEmail, humanDesign);

  const natalBasics = await calculateNatalBasicsAsync({
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
  });

  const astrocartography = calculateAstrocartography({
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
  }, natalBasics);

  safeDiagnostic("blueprint", "calculate", { complete: Boolean(natalBasics && astrocartography) });

  // CDI-108-01: persist `chiron` ONLY when it came from a real ephemeris. When it
  // did not, leave the field undefined — sanitizeForFirestore drops undefined and
  // the { merge: true } write preserves any previously-stored (verified) value.
  const chironIsEphemeris = natalBasics.chironAccuracy === "ephemeris";
  const genuinePlacidus = natalBasics.houseSystem === "placidus";
  const natalChart = {
    sunSign: natalBasics.sunSign,
    moonSign: natalBasics.moonSign ?? undefined,
    risingSign: natalBasics.ascendant ?? undefined,
    ascendant: natalBasics.ascendant ?? undefined,
    midheaven: natalBasics.midheaven ?? undefined,
    mc: natalBasics.midheaven ?? undefined,
    ascendantLongitude: natalBasics.ascendantLongitude ?? undefined,
    midheavenLongitude: natalBasics.midheavenLongitude ?? undefined,
    planets: natalBasics.planets ?? undefined,
    northNode: natalBasics.northNode ?? natalBasics.planets?.NorthNode?.sign ?? undefined,
    southNode: natalBasics.southNode ?? natalBasics.planets?.SouthNode?.sign ?? undefined,
    chiron: chironIsEphemeris ? (natalBasics.chiron ?? natalBasics.planets?.Chiron?.sign ?? undefined) : undefined,
    chironAccuracy: natalBasics.chironAccuracy,
    houseSystem: natalBasics.houseSystem,
    lilith: natalBasics.lilith,
    houses: genuinePlacidus ? (natalBasics.houses ?? natalBasics.placidusHouses ?? undefined) : undefined,
    placidusHouses: genuinePlacidus ? (natalBasics.placidusHouses ?? natalBasics.houses ?? undefined) : undefined,
    wholeSignHouses: natalBasics.wholeSignHouses ?? undefined,
    elements: natalBasics.elements ?? undefined,
    modalities: natalBasics.modalities ?? undefined,
    polarities: natalBasics.polarities ?? undefined,
    aspects: natalBasics.aspects ?? undefined,
    patterns: natalBasics.patterns ?? undefined,
    dominance: natalBasics.dominance ?? undefined,
    dominantPlanet: natalBasics.dominance?.dominantPlanet,
    dominantSign: natalBasics.dominance?.dominantSign,
    dominantElement: natalBasics.dominance?.dominantElement,
    dominantModality: natalBasics.dominance?.dominantModality,
    dominantHouse: natalBasics.dominance?.dominantHouse,
    engine: natalBasics.source,
    calculationStatus: (natalBasics.status === "ready" ? "completed" : "pending") as
      | "completed"
      | "pending"
      | "error",
  };

  const blueprint: Omit<Blueprint, "generatedAt" | "updatedAt" | "status" | "input"> = {
    uid,
    lifePath: lifePathBlueprint,
    natalChart,
    numerology: {
      ...lifePathBlueprint,
      expression: nameNumerology.expression,
      soulUrge: nameNumerology.soulUrge,
      personality: nameNumerology.personality,
    } as any,
    astrology: natalChart,
    humanDesign,
    destinyMatrix: {
      ...destinyMatrix,
      arcanaCenter: destinyMatrix.center,
      calculationStatus: "completed",
    },
    weton,
    bazi,
    vedic,
    tzolkin,
    astrocartography,
    // ziWei is not generated here because it requires gender, which is not on BlueprintInput
  };

  // Add metadata for the full Blueprint type
  const fullBlueprint: Blueprint = {
    ...blueprint,
    status: "ready",
    input: {
      birthDate,
      birthTime: birthTime ?? null,
      birthCity,
      birthCountry: birthCountry ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      timezone: timezone ?? null,
    },
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as Blueprint;

  return fullBlueprint;
};
