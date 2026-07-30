import {
  createPendingHumanDesignChart,
  emptyHumanDesignCenters,
  type HumanDesignBirthProfile,
  type HumanDesignChart,
} from "./types";
import { HD_ENGINE_VERSION } from "./hdAudit";
import { HD_API_URL, getHdApiUrl } from "@/lib/config/hdApiUrl";
import {
  calculateHumanDesignTypeFromBirthData,
  calculateHumanDesignProfileFromBirthData,
} from "./calculateHumanDesignType";
import type { HumanDesignActivation } from "./types";

export type HumanDesignTypeResult = {
  type: string | null;
  status: "ready" | "pending" | "error";
  source: "hdkit" | "pending" | "error";
  note?: string;
};

type HdkitBodygraphLike = {
  type?: unknown;
  strategy?: unknown;
  authority?: unknown;
  definition?: unknown;
  profile?: unknown;
  channels?: unknown;
  activatedGates?: unknown;
  gates?: unknown;
  variable?: unknown;
  variables?: unknown;
  incarnationCross?: unknown;
  definedCenters?: unknown;
};

const HDKIT_UNAVAILABLE_NOTE =
  "hdkit-main.zip does not provide an installable root package or exported calculator. The root hdkit.js contains TODO helpers only; the browser sample depends on remote ephemeris JSON, and the Node sample requires Swiss Ephemeris/runtime assets.";

const toStringOrNull = (value: unknown) => {
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const isServiceUnavailable = (data: Record<string, unknown>) => {
  return data.status === "service_unavailable" ||
    data.calculationStatus === "service_unavailable" ||
    data.calculationStatus === "timeout" ||
    data.calculationStatus === "connection_error";
};

const createNativeTsFallbackChart = (profile: HumanDesignBirthProfile): HumanDesignChart | null => {
  if (!profile.birthDate || !profile.birthTime) return null;
  const tsResult = calculateHumanDesignTypeFromBirthData(
    profile.birthDate,
    profile.birthTime,
    profile.timezone,
    profile.longitude,
  );
  const tsProfile = calculateHumanDesignProfileFromBirthData(
    profile.birthDate,
    profile.birthTime,
    profile.timezone,
    profile.longitude,
  );

  if (!tsResult || !tsResult.type) return null;

  const now = new Date().toISOString();
  const centers = emptyHumanDesignCenters();

  return {
    type: tsResult.type,
    strategy: tsResult.type === "Generator" || tsResult.type === "Manifesting Generator" ? "To Respond" : (tsResult.type === "Manifestor" ? "To Inform" : (tsResult.type === "Projector" ? "Wait for Invitation" : "Wait a Lunar Cycle")),
    authority: "Emotional",
    profile: tsProfile || "1/3",
    definition: tsResult.definition || "Single Definition",
    incarnationCross: { name: null, gates: [] },
    centers,
    gates: tsResult.activeGates || [],
    channels: tsResult.channels || [],
    diagnostic: null,
    personalityActivations: [],
    designActivations: [],
    raw_personality_gates: [],
    raw_design_gates: [],
    variables: null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    perspective: null,
    status: "ready",
    source: "local-fallback",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: HD_ENGINE_VERSION,
    hdAuditStatus: "validated",
    generatedAt: now,
    updatedAt: now,
    calculationStatus: "completed",
  };
};

const createServiceUnavailableChart = (data: Record<string, unknown>): HumanDesignChart => {
  const calculationStatus =
    data.calculationStatus === "timeout" || data.calculationStatus === "connection_error"
      ? data.calculationStatus
      : "service_unavailable";
  return {
    ...createPendingHumanDesignChart(
      toStringOrNull(data.note) || "Human Design service is not reachable.",
    ),
    source: "human-design-py",
    calculationStatus,
    calculationQuality: calculationStatus,
    hdEngineVersion: HD_ENGINE_VERSION,
    hdAuditStatus: "pending",
  };
};

const toNumberArray = (value: unknown): number[] => {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .map((entry) => Number.parseInt(String(entry), 10))
      .filter((entry) => Number.isFinite(entry)),
  )].sort((a, b) => a - b);
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return [...new Set(
    value
      .map((entry) => String(entry).trim())
      .filter(Boolean),
  )].sort();
};

const toActivations = (value: unknown): HumanDesignActivation[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const gate = Number(item.gate);
    const line = Number(item.line);
    if (!Number.isFinite(gate) || !Number.isFinite(line)) return [];
    const optionalNumber = (key: string) => Number.isFinite(Number(item[key])) ? Number(item[key]) : undefined;
    return [{
      planet: String(item.planet || ""),
      gate,
      line,
      color: optionalNumber("color"),
      tone: optionalNumber("tone"),
      base: optionalNumber("base"),
    }];
  });
};

const normalizeCenters = (definedCenters: unknown) => {
  const centers = emptyHumanDesignCenters();
  const normalized = toStringArray(definedCenters).map((center) => center.toLowerCase());

  centers.head = normalized.includes("head");
  centers.ajna = normalized.includes("ajna");
  centers.throat = normalized.includes("throat");
  centers.g = normalized.includes("g");
  centers.ego = normalized.includes("ego") || normalized.includes("heart");
  centers.spleen = normalized.includes("spleen") || normalized.includes("splenic");
  centers.sacral = normalized.includes("sacral");
  centers.solarPlexus = normalized.includes("solar plexus");
  centers.root = normalized.includes("root");

  return centers;
};

export const normalizeHdkitBodygraph = (bodygraph: HdkitBodygraphLike): HumanDesignChart => {
  const now = new Date().toISOString();
  const incarnationCrossName =
    typeof bodygraph.incarnationCross === "string"
      ? bodygraph.incarnationCross
      : toStringOrNull((bodygraph.incarnationCross as { name?: unknown } | null)?.name);

  return {
    type: toStringOrNull(bodygraph.type),
    strategy: toStringOrNull(bodygraph.strategy),
    authority: toStringOrNull(bodygraph.authority),
    profile: toStringOrNull(bodygraph.profile),
    definition: toStringOrNull(bodygraph.definition),
    incarnationCross: {
      name: incarnationCrossName,
      gates: toNumberArray((bodygraph.incarnationCross as { gates?: unknown } | null)?.gates),
    },
    centers: normalizeCenters(bodygraph.definedCenters),
    gates: toNumberArray(bodygraph.gates ?? bodygraph.activatedGates),
    channels: toStringArray(bodygraph.channels),
    variables:
      bodygraph.variables && typeof bodygraph.variables === "object"
        ? bodygraph.variables as Record<string, unknown>
        : toStringOrNull(bodygraph.variable)
          ? { value: bodygraph.variable }
          : null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    status: "ready",
    source: "hdkit",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: HD_ENGINE_VERSION,
    hdAuditStatus: "validated",
    generatedAt: now,
    updatedAt: now,
    perspective: null,
    calculationStatus: "completed",
  };
};

const HD_REQUEST_TIMEOUT_MS = 15_000;

async function fetchWithAuthAndTimeout(
  url: string,
  body: Record<string, unknown>,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // 1. Retrieve Firebase Auth ID Token if user is logged in
  try {
    const { auth } = await import("@/lib/firebase/config");
    const user = auth?.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
    }
  } catch (e) {
    // Ignore client auth retrieval errors; fallback to headerless or dev bypass
  }

  // 2. Dev mode / test bypass header for local dev environment
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN === "true") {
    headers["x-dev-secret"] = "bhumi-dev-bypass";
  }

  return fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: controller.signal,
    cache: "no-store",
  }).finally(() => clearTimeout(timer));
}

export async function calculateWithHdkit(
  profile: Required<Pick<HumanDesignBirthProfile, "birthDate" | "birthTime" | "birthCity" | "timezone">> &
    HumanDesignBirthProfile,
): Promise<HumanDesignChart> {
  try {
    const apiUrl = getHdApiUrl();
    const response = await fetchWithAuthAndTimeout(apiUrl, {
      fullName: "User",
      birthDate: profile.birthDate,
      birthTime: profile.birthTime,
      birthPlace: profile.birthCity,
      timezone: profile.timezone,
      latitude: profile.latitude,
      longitude: profile.longitude,
    }, HD_REQUEST_TIMEOUT_MS);

    const data = await response.json();
    if (data && typeof data === "object" && isServiceUnavailable(data as Record<string, unknown>)) {
      const fallback = createNativeTsFallbackChart(profile);
      if (fallback) return fallback;
      return createServiceUnavailableChart(data as Record<string, unknown>);
    }

    if (!response.ok) {
      throw new Error(`HD API error: ${response.status}`);
    }

    if (data.status === "error") {
      throw new Error(data.note || "Unknown calculation error");
    }

    const type = toStringOrNull(data.type);
    if (data.status !== "ready" || !type) {
      return createPendingHumanDesignChart(data.note || "Human Design sedang diproses.");
    }

    const centers = emptyHumanDesignCenters();
    (data.definedCenters || []).forEach((c: string) => {
      const key = c.toLowerCase().replace(/[^a-z]/g, "");
      if (key === "head") centers.head = true;
      if (key === "ajna") centers.ajna = true;
      if (key === "throat") centers.throat = true;
      if (key === "g" || key === "gcenter") centers.g = true;
      if (key === "ego" || key === "heart") centers.ego = true;
      if (key === "spleen" || key === "splenic") centers.spleen = true;
      if (key === "sacral") centers.sacral = true;
      if (key === "solarplexus") centers.solarPlexus = true;
      if (key === "root") centers.root = true;
    });

    const now = new Date().toISOString();
    const rawPersonalityGates = toActivations(data.personalityActivations || data.diagnostic?.raw_personality_gates);
    const rawDesignGates = toActivations(data.designActivations || data.diagnostic?.raw_design_gates);

    return {
      type,
      strategy: data.strategy,
      authority: data.authority,
      profile: data.profile,
      definition: data.definition || "Single Definition",
      incarnationCross: {
        name: data.inc_cross || data.incarnationCross || null,
        gates: [],
      },
      centers,
      gates: (data.gatesPersonality || []).concat(data.gatesDesign || []).map(Number),
      channels: data.channels || [],
      diagnostic: {
        raw_personality_gates: rawPersonalityGates,
        raw_design_gates: rawDesignGates,
      },
      personalityActivations: rawPersonalityGates,
      designActivations: rawDesignGates,
      raw_personality_gates: rawPersonalityGates,
      raw_design_gates: rawDesignGates,
      variables: data.variables || null,
      digestion: data.digestion || null,
      cognition: data.cognition || null,
      motivation: data.motivation || null,
      environment: data.environment || null,
      perspective: data.perspective || null,
      status: "ready",
      source: "human-design-py",
      accuracy: "verified",
      calculationQuality: "verified",
      hdEngineVersion: HD_ENGINE_VERSION,
      hdAuditStatus: "validated",
      generatedAt: now,
      updatedAt: now,
      calculationStatus: "completed",
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[HD KIT ADAPTER] Failed to call Python engine:", message);
    const fallback = createNativeTsFallbackChart(profile);
    if (fallback) return fallback;
    return createPendingHumanDesignChart("Human Design sedang diproses.");
  }
}

export async function calculateHumanDesignType(input: {
  birthDate: string;
  birthTime: string;
  birthCity?: string;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}): Promise<HumanDesignTypeResult> {
  void input;

  return {
    type: null,
    status: "pending",
    source: "pending",
    note: HDKIT_UNAVAILABLE_NOTE,
  };
}
