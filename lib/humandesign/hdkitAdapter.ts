import {
  createPendingHumanDesignChart,
  emptyHumanDesignCenters,
  type HumanDesignBirthProfile,
  type HumanDesignChart,
} from "./types";

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
    generatedAt: now,
    updatedAt: now,
    calculationStatus: "completed",
  };
};

export async function calculateWithHdkit(
  _profile: Required<Pick<HumanDesignBirthProfile, "birthDate" | "birthTime" | "birthCity" | "timezone">> &
    HumanDesignBirthProfile,
): Promise<HumanDesignChart> {
  void _profile;
  return createPendingHumanDesignChart(HDKIT_UNAVAILABLE_NOTE);
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
