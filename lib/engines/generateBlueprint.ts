import { calculateLifePath } from "../calculations/calculateLifePath";
import { calculateDestinyMatrixForBlueprint } from "../calculations/destinyMatrix/mapToBlueprint";
import calculateSunSign from "../calculations/calculateSunSign";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { applyOwnerOverrideIfApplicable } from "@/lib/humandesign/ownerOverride";
import { calculateNatalBasics } from "@/lib/astrology/calculateNatalBasics";
import { Blueprint } from "../types/blueprint";
import { auth } from "@/lib/firebase/firebase";

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
  const destinyMatrix = calculateDestinyMatrixForBlueprint(birthDate);

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

  const natalBasics = calculateNatalBasics({
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
  });

  console.log("[ASTROLOGY INPUT]", {
    birthDate,
    birthTime,
    birthCity,
    birthCountry,
    latitude,
    longitude,
    timezone,
    natalBasics,
  });

  const natalChart = {
    sunSign: natalBasics.sunSign,
    moonSign: natalBasics.moonSign ?? undefined,
    risingSign: natalBasics.ascendant ?? undefined,
    calculationStatus: (natalBasics.status === "ready" ? "completed" : "pending") as
      | "completed"
      | "pending"
      | "error",
  };

  const blueprint: Omit<Blueprint, "generatedAt" | "updatedAt" | "status" | "input"> = {
    uid,
    lifePath: lifePathBlueprint,
    natalChart,
    numerology: lifePathBlueprint,
    astrology: natalChart,
    humanDesign,
    destinyMatrix: {
      ...destinyMatrix,
      arcanaCenter: destinyMatrix.center,
      calculationStatus: "completed",
    },
  };

  // Add metadata for the full Blueprint type
  const fullBlueprint: Blueprint = {
    ...blueprint,
    status: "ready",
    input: {
      birthDate,
      birthTime: birthTime || "12:00",
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
