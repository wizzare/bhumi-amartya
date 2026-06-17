import type { Timestamp } from "firebase/firestore";

export type HumanDesignStatus =
  | "ready"
  | "pending"
  | "error"
  | "needs_verified_engine"
  | "verified"
  | "needs_verified_timezone"
  | "service_unavailable";
export type HumanDesignSource =
  | "hdkit"
  | "pending"
  | "error"
  | "local-fallback"
  | "fallback_approximation"
  | "human-design-py"
  | "verified-override"
  | "manual_verified";

export type HumanDesignCalculationQuality =
  | "verified"
  | "manual_verified_owner_override"
  | "fallback_approximation"
  | "service_unavailable"
  | "timeout"
  | "connection_error"
  | "unavailable";

export type HumanDesignAccuracy = "verified" | "approximate" | "unavailable";

export type HumanDesignCenters = {
  head: boolean | null;
  ajna: boolean | null;
  throat: boolean | null;
  g: boolean | null;
  ego: boolean | null;
  spleen: boolean | null;
  sacral: boolean | null;
  solarPlexus: boolean | null;
  root: boolean | null;
};

export type HumanDesignChart = {
  type: string | null;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  incarnationCross: {
    name: string | null;
    gates: (number | string)[];
  };
  centers: HumanDesignCenters;
  gates: number[];
  channels: string[];
  variables: Record<string, unknown> | null;
  digestion: string | null;
  cognition: string | null;
  motivation: string | null;
  environment: string | null;
  status: HumanDesignStatus;
  source: HumanDesignSource;
  accuracy?: HumanDesignAccuracy;
  calculationQuality?: HumanDesignCalculationQuality;
  note?: string;
  generatedAt: string | Timestamp;
  updatedAt: string | Timestamp;
  calculationStatus:
    | "completed"
    | "pending"
    | "error"
    | "needs_verified_engine"
    | "needs_verified_timezone"
    | "service_unavailable"
    | "timeout"
    | "connection_error";
  // Build 31 Audit Metadata
  timezone?: string | null;
  timezoneSource?: "user" | "city-fallback" | "browser-guess" | "longitude-approx" | "verified-lookup" | "default";
  calculationSource?: string;
  calculatedAt?: string;
  inputHash?: string;
  needsUpgrade?: boolean;
  hdEngineVersion?: string;
  hdAuditStatus?: "validated" | "pending" | "invalid";
};

export type HumanDesignBirthProfile = {
  birthDate?: string | null;
  birthTime?: string | null;
  birthCity?: string | null;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
};

export const emptyHumanDesignCenters = (): HumanDesignCenters => ({
  head: null,
  ajna: null,
  throat: null,
  g: null,
  ego: null,
  spleen: null,
  sacral: null,
  solarPlexus: null,
  root: null,
});

export const createPendingHumanDesignChart = (note: string): HumanDesignChart => {
  const now = new Date().toISOString();

  return {
    type: null,
    strategy: null,
    authority: null,
    profile: null,
    definition: null,
    incarnationCross: {
      name: null,
      gates: [],
    },
    centers: emptyHumanDesignCenters(),
    gates: [],
    channels: [],
    variables: null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    status: "pending",
    source: "pending",
    note,
    generatedAt: now,
    updatedAt: now,
    calculationStatus: "pending",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "pending",
  };
};

export const createErrorHumanDesignChart = (note: string): HumanDesignChart => {
  const now = new Date().toISOString();

  return {
    ...createPendingHumanDesignChart(note),
    status: "error",
    source: "error",
    generatedAt: now,
    updatedAt: now,
    calculationStatus: "error",
  };
};
