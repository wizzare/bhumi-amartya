import { HD_ENGINE_VERSION, isCanonicalHumanDesign, isRecognizedHumanDesignType } from "./hdAudit";
import { getHumanDesignCompleteness } from "./completeness";
import {
  emptyHumanDesignCenters,
  type HumanDesignActivation,
  type HumanDesignAdvancedFieldSources,
  type HumanDesignChart,
  type HumanDesignCenters,
  type HumanDesignVariables,
} from "./types";

type LivePayload = Record<string, unknown>;

const asText = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))] : [];

const asNumberArray = (value: unknown): number[] =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => Number.parseInt(String(item), 10)).filter(Number.isFinite))].sort((a, b) => a - b)
    : [];

const asActivations = (value: unknown): HumanDesignActivation[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    const gate = Number(item.gate);
    const line = Number(item.line);
    if (!Number.isFinite(gate) || !Number.isFinite(line)) return [];
    const optionalNumber = (key: "color" | "tone" | "base") => Number.isFinite(Number(item[key])) ? Number(item[key]) : undefined;
    return [{ planet: String(item.planet || ""), gate, line, color: optionalNumber("color"), tone: optionalNumber("tone"), base: optionalNumber("base") }];
  });
};

export const normalizeHumanDesignCenters = (definedCenters: unknown, openCenters?: unknown): HumanDesignCenters => {
  const centers = emptyHumanDesignCenters();
  const setCenter = (value: string, defined: boolean) => {
    const key = value.toLowerCase().replace(/[^a-z]/g, "");
    if (key === "head") centers.head = defined;
    if (key === "ajna") centers.ajna = defined;
    if (key === "throat") centers.throat = defined;
    if (key === "g" || key === "gcenter") centers.g = defined;
    if (key === "ego" || key === "heart") centers.ego = defined;
    if (key === "spleen" || key === "splenic") centers.spleen = defined;
    if (key === "sacral") centers.sacral = defined;
    if (key === "solarplexus") centers.solarPlexus = defined;
    if (key === "root") centers.root = defined;
  };
  asStringArray(openCenters).forEach((center) => setCenter(center, false));
  asStringArray(definedCenters).forEach((center) => setCenter(center, true));
  return centers;
};

export const normalizeHumanDesignVariables = (value: unknown): HumanDesignVariables | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as HumanDesignVariables;
  const nested = raw.advanced && typeof raw.advanced === "object" && !Array.isArray(raw.advanced)
    ? raw.advanced as HumanDesignVariables
    : null;
  const canonical = nested && (nested.short_code || nested.top_right || nested.bottom_right || nested.top_left || nested.bottom_left)
    ? { ...nested }
    : { ...raw };
  if (!asText(canonical.short_code) && asText(canonical.shortCode)) canonical.short_code = canonical.shortCode;
  return canonical;
};

const derivePerspective = (variables: HumanDesignVariables | null): string | null => {
  const arrow = variables?.bottom_right;
  if (!arrow || typeof arrow !== "object") return null;
  const value = arrow as Record<string, unknown>;
  return asText(value.name)?.toLowerCase() === "perspective" ? asText(value.def_type) : null;
};

export const normalizeLiveHumanDesignResponse = (data: LivePayload, now = new Date().toISOString()): HumanDesignChart | null => {
  const type = asText(data.type);
  if (data.status !== "ready" || !type || !isRecognizedHumanDesignType(type)) return null;

  const variables = normalizeHumanDesignVariables(data.variables);
  const topLevelPerspective = asText(data.perspective);
  const derivedPerspective = topLevelPerspective || derivePerspective(variables);
  const sources: HumanDesignAdvancedFieldSources = {
    digestion: asText(data.digestion) ? "live-top-level" : "unavailable",
    environment: asText(data.environment) ? "live-top-level" : "unavailable",
    motivation: asText(data.motivation) ? "live-top-level" : "unavailable",
    cognition: asText(data.cognition) ? "live-top-level" : "unavailable",
    perspective: topLevelPerspective ? "live-top-level" : derivedPerspective ? "variables.bottom_right.def_type" : "unavailable",
  };
  const personality = asActivations(data.personalityActivations || (data.diagnostic as Record<string, unknown> | undefined)?.raw_personality_gates);
  const design = asActivations(data.designActivations || (data.diagnostic as Record<string, unknown> | undefined)?.raw_design_gates);

  return {
    type,
    strategy: asText(data.strategy),
    authority: asText(data.authority),
    profile: asText(data.profile),
    definition: asText(data.definition) || "Single Definition",
    incarnationCross: { name: asText(data.inc_cross) || asText(data.incarnationCross), gates: [] },
    centers: normalizeHumanDesignCenters(data.definedCenters, data.openCenters),
    openCenters: asStringArray(data.openCenters),
    gates: [...new Set([...asNumberArray(data.gatesPersonality), ...asNumberArray(data.gatesDesign)])],
    channels: asStringArray(data.channels),
    diagnostic: personality.length || design.length ? { raw_personality_gates: personality, raw_design_gates: design } : null,
    personalityActivations: personality,
    designActivations: design,
    raw_personality_gates: personality,
    raw_design_gates: design,
    variables,
    digestion: asText(data.digestion),
    cognition: asText(data.cognition),
    motivation: asText(data.motivation),
    environment: asText(data.environment),
    perspective: derivedPerspective,
    advancedFieldSources: sources,
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
};

export type MergeVerifiedHumanDesignOptions = {
  /**
   * Default false — every existing caller keeps today's behavior (a
   * metadata-CANONICAL existing chart is never replaced).
   *
   * Opt-in for scripts/mass-recover-hd.ts ONLY, after it has independently
   * confirmed `getHumanDesignCompleteness(existing).coreState ===
   * "CANONICAL_INCOMPLETE"` (the CDI-108 case: `getHdState()` reports
   * CANONICAL from metadata alone even though gates/channels/centers are
   * structurally empty). When true, this function re-verifies that same
   * condition itself — it does not trust the caller's opt-in blindly — and
   * additionally requires the candidate to structurally improve on the
   * existing record before allowing the merge. A structurally COMPLETE
   * canonical chart is still never replaced, opt-in or not.
   *
   * This function does not re-check identity-field (type/strategy/
   * authority/profile) stability — that guard lives in the caller
   * (mass-recover-hd.ts's compareSnapshots), which must run before opting
   * in here, per the same reasoning as the coreState check above.
   */
  allowCanonicalIncompleteRepair?: boolean;
};

export const mergeVerifiedHumanDesignChart = (
  existing: unknown,
  candidate: HumanDesignChart,
  options: MergeVerifiedHumanDesignOptions = {},
): HumanDesignChart | null => {
  if (!isCanonicalHumanDesign(candidate)) return null;
  if (isCanonicalHumanDesign(existing)) {
    if (!options.allowCanonicalIncompleteRepair) return null;
    const existingCompleteness = getHumanDesignCompleteness(existing);
    if (existingCompleteness.coreState !== "CANONICAL_INCOMPLETE") return null;
    const candidateCompleteness = getHumanDesignCompleteness(candidate);
    const improves = candidateCompleteness.missingCoreFields.length < existingCompleteness.missingCoreFields.length;
    if (!improves) return null;
  }
  const prior = existing && typeof existing === "object" ? existing as Partial<HumanDesignChart> : {};
  const pickArray = <T>(fresh: T[] | undefined, saved: T[] | undefined) => fresh?.length ? fresh : (saved || []);
  return {
    ...prior,
    ...candidate,
    variables: candidate.variables ?? prior.variables ?? null,
    digestion: candidate.digestion ?? prior.digestion ?? null,
    environment: candidate.environment ?? prior.environment ?? null,
    motivation: candidate.motivation ?? prior.motivation ?? null,
    perspective: candidate.perspective ?? prior.perspective ?? null,
    cognition: candidate.cognition ?? prior.cognition ?? null,
    openCenters: candidate.openCenters?.length ? candidate.openCenters : (prior.openCenters || []),
    personalityActivations: pickArray(candidate.personalityActivations, prior.personalityActivations),
    designActivations: pickArray(candidate.designActivations, prior.designActivations),
    raw_personality_gates: pickArray(candidate.raw_personality_gates, prior.raw_personality_gates),
    raw_design_gates: pickArray(candidate.raw_design_gates, prior.raw_design_gates),
  };
};
