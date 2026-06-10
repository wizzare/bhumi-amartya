import { calculateWithHdkit } from "./hdkitAdapter";
import {
  createErrorHumanDesignChart,
  createPendingHumanDesignChart,
  type HumanDesignBirthProfile,
  type HumanDesignChart,
  emptyHumanDesignCenters,
} from "./types";
import { calculateHumanDesignTypeFromBirthData, calculateHumanDesignProfileFromBirthData } from "./calculateHumanDesignType";

const hasRequiredBirthData = (profile: HumanDesignBirthProfile) => {
  return Boolean(profile.birthDate && profile.birthTime && profile.birthCity);
};

export async function calculateHumanDesign(
  profile: HumanDesignBirthProfile,
): Promise<HumanDesignChart> {
  if (!hasRequiredBirthData(profile)) {
    return createPendingHumanDesignChart(
      "Human Design requires birth date, birth time, and birth location.",
    );
  }

  // Attempt local fallback
  const fallback = calculateLocalFallback(profile);

  // BUILD 31: If timezone is completely missing, we return a specialized status
  if (!profile.timezone) {
    return {
      ...fallback,
      status: "needs_verified_timezone",
      calculationStatus: "needs_verified_timezone",
      note: "Human Design requires a verified timezone offset for accuracy.",
    };
  }

  if (profile.latitude == null || profile.longitude == null) {
    return {
      ...fallback,
      note: "Human Design fallback used due to missing precise location data.",
    };
  }

  try {
    const result = await calculateWithHdkit({
      birthDate: profile.birthDate ?? "",
      birthTime: profile.birthTime ?? "",
      birthCity: profile.birthCity ?? "",
      birthCountry: profile.birthCountry ?? null,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
    });

    if (result.status === "ready") {
       console.log("[HD CALCULATION QUALITY]", {
         source: result.source,
         quality: (result as any).calculationQuality || "verified",
         type: result.type
       });
       return {
         ...result,
         timezone: profile.timezone,
         calculatedAt: new Date().toISOString(),
       };
    }

    return {
      ...fallback,
      timezone: profile.timezone,
      calculatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      ...fallback,
      timezone: profile.timezone,
      calculatedAt: new Date().toISOString(),
    };
  }
}

function calculateLocalFallback(profile: HumanDesignBirthProfile): HumanDesignChart {
  const now = new Date().toISOString();

  // BUILD 31: Generate Input Hash for stability tracking
  const inputHash = [
    profile.birthDate,
    profile.birthTime,
    profile.latitude,
    profile.longitude,
    profile.timezone
  ].map(p => String(p || "").trim()).join("|");

  const type = calculateHumanDesignTypeFromBirthData(
    profile.birthDate || "",
    profile.birthTime || "",
    profile.timezone,
    profile.longitude
  );

  const hdProfile = calculateHumanDesignProfileFromBirthData(
    profile.birthDate || "",
    profile.birthTime || "",
    profile.timezone,
    profile.longitude
  );

  const strategyByType: Record<string, string> = {
    "Generator": "Wait to Respond",
    "Manifesting Generator": "Wait to Respond",
    "Projector": "Wait for Invitation",
    "Manifestor": "Inform Before Action",
    "Reflector": "Wait a Lunar Cycle",
  };

  const authorityByType: Record<string, string> = {
    "Generator": "Sacral",
    "Manifesting Generator": "Sacral",
    "Projector": "Emotional",
    "Manifestor": "Emotional",
    "Reflector": "Lunar",
  };

  return {
    type,
    strategy: type ? strategyByType[type] : null,
    authority: type ? authorityByType[type] : null,
    profile: hdProfile,
    definition: null,
    incarnationCross: { name: null, gates: [] },
    centers: emptyHumanDesignCenters(),
    gates: [],
    channels: [],
    variables: null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    status: type ? "ready" : "pending",
    source: "local-fallback",
    accuracy: "approximate",
    calculationQuality: "fallback_approximation",
    generatedAt: now,
    updatedAt: now,
    calculationStatus: type ? "completed" : "pending",
    inputHash,
    timezone: profile.timezone || null,
    calculatedAt: now,
    note: "Calculated via stable Build 31 local approximation engine.",
  };
}
