import { calculateWithHdkit } from "./hdkitAdapter";
import {
  createPendingHumanDesignChart,
  type HumanDesignBirthProfile,
  type HumanDesignChart,
} from "./types";
import { HD_ENGINE_VERSION, logHumanDesignAudit } from "./hdAudit";

const hasRequiredBirthData = (profile: HumanDesignBirthProfile) => {
  return Boolean(profile.birthDate && profile.birthTime && profile.birthCity);
};

export async function calculateHumanDesign(
  profile: HumanDesignBirthProfile,
): Promise<HumanDesignChart> {
  if (!hasRequiredBirthData(profile)) {
    const pending = createPendingHumanDesignChart(
      "Human Design requires birth date, birth time, and birth location.",
    );
    logHumanDesignAudit(profile, pending, "missing-input");
    return pending;
  }

  // BUILD 31: If timezone is completely missing, we return a specialized status
  if (!profile.timezone) {
    const pending: HumanDesignChart = {
      ...createPendingHumanDesignChart("Human Design sedang diproses."),
      status: "needs_verified_timezone",
      calculationStatus: "needs_verified_timezone",
      note: "Human Design requires a verified timezone offset for accuracy.",
    };
    logHumanDesignAudit(profile, pending, "missing-timezone");
    return pending;
  }

  if (profile.latitude == null || profile.longitude == null) {
    const pending = createPendingHumanDesignChart("Human Design sedang diproses.");
    logHumanDesignAudit(profile, pending, "missing-location");
    return pending;
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
         quality: result.calculationQuality || "verified",
         type: result.type
       });
       const validated: HumanDesignChart = {
         ...result,
         timezone: profile.timezone,
         calculatedAt: new Date().toISOString(),
         hdEngineVersion: HD_ENGINE_VERSION,
         hdAuditStatus: "validated",
       };
       logHumanDesignAudit(profile, validated, result.source);
       return validated;
    }

    if (
      result.calculationStatus === "service_unavailable" ||
      result.calculationStatus === "timeout" ||
      result.calculationStatus === "connection_error"
    ) {
      logHumanDesignAudit(profile, result, result.source || "human-design-py");
      return result;
    }

    const pending = createPendingHumanDesignChart("Human Design sedang diproses.");
    logHumanDesignAudit(profile, pending, result.source || "unverified-result");
    return pending;
  } catch {
    const pending = createPendingHumanDesignChart("Human Design sedang diproses.");
    logHumanDesignAudit(profile, pending, "calculation-error");
    return pending;
  }
}

