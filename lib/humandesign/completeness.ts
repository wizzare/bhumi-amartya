import { getHdState } from "./hdState";
import { normalizeHumanDesignAdvancedFields } from "./liveContract";
import type { HumanDesignChart } from "./types";

/**
 * Structural completeness contract — separate from `getHdState()`.
 *
 * `getHdState()` (hdState.ts) classifies a record from METADATA only
 * (status/source/quality/hdEngineVersion) and was never intended to assert
 * that gates/channels/centers/activations/incarnation-cross-gates are
 * actually populated. That gap is why records exist that are `CANONICAL`
 * per hdState yet show empty gates/channels/centers in the UI.
 *
 * Founder decision (2026-09-19, after forensic verification against the
 * live production engine): designActivations[], personalityActivations[],
 * incarnationCross.gates, and color/tone/base are on a SEPARATE dimension
 * ("enrichment") from core chart completeness, because the currently
 * deployed engine cannot supply them regardless of any client-side fix
 * (verified live — see BUILD_108 HD forensic notes). A core-complete chart
 * MUST NOT be labeled incomplete for missing enrichment.
 */

export type HumanDesignCoreState =
  | "CANONICAL_CORE_COMPLETE"
  | "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL"
  | "CANONICAL_INCOMPLETE"
  | "FALLBACK"
  | "PENDING"
  | "ERROR";

export type AdvancedVariableStatus = "COMPLETE" | "PARTIAL" | "UNAVAILABLE_FROM_ENGINE";
export type EnrichmentStatus = "ENRICHMENT_COMPLETE" | "ENRICHMENT_PARTIAL" | "ENGINE_UNSUPPORTED";

/** Core structural fields. A chart is not usable in the Bodygraph UI without these. */
export const CORE_REQUIRED_FIELDS = [
  "type",
  "strategy",
  "authority",
  "profile",
  "definition",
  "gates",
  "channels",
  "centers",
  "incarnationCross.name",
  "status",
  "source",
  "calculationQuality",
  "hdEngineVersion",
] as const;

export const ADVANCED_VARIABLE_FIELDS = [
  "digestion",
  "environment",
  "motivation",
  "perspective",
  "cognition",
  "variables",
] as const;

/**
 * Fields the CURRENTLY DEPLOYED calculation engine (bhumi-human-design-api.vercel.app)
 * cannot provide, confirmed by direct forensic inspection (2026-09-19):
 *   - The production-aliased deployment (dpl_3UbEiamgyBZKrhBmW5KDV5JKVpD2, created
 *     2026-07-29) was pushed via `vercel --prod` CLI with no git commit association
 *     (empty deployment meta) — it predates and does not match any commit in this
 *     repo's history, including the "fix: preserve Human Design advanced variables"
 *     commit (b7dcbe16, 2026-09-06) that added unconditional activations/diagnostic
 *     fields to the checked-in services/humandesign-api/main.py. Every later
 *     git-triggered build is a PREVIEW deployment only (target: null) — none has
 *     ever been promoted to production since that manual push.
 *   - Live POST to the production URL (with and without `debug: true`, both body
 *     and query-string forms) returns no `personalityActivations`, no
 *     `designActivations`, no `diagnostic` block, and no incarnation-cross gate
 *     list in any observed response.
 * These are ENRICHMENT fields, not core fields, per Founder decision — their
 * absence must never downgrade an otherwise-complete core chart. Re-verify this
 * list if the production alias is ever repromoted to a current commit.
 */
export const ENGINE_UNSUPPORTED_ENRICHMENT_FIELDS = [
  "incarnationCross.gates",
  "designActivations",
  "personalityActivations",
  "color",
  "tone",
  "base",
] as const;

export type HumanDesignEnrichmentResult = {
  status: EnrichmentStatus;
  missing: string[];
};

export type HumanDesignCompletenessResult = {
  /** Core chart completeness — never gated by enrichment field availability. */
  coreState: HumanDesignCoreState;
  missingCoreFields: string[];
  semanticFields: "COMPLETE" | "PARTIAL" | "UNAVAILABLE";
  variableStructure: "AVAILABLE" | "UNAVAILABLE";
  advancedVariables: {
    status: AdvancedVariableStatus;
    missing: string[];
  };
  /** Independent dimension: designActivations/personalityActivations/incarnationCross.gates/color/tone/base. */
  enrichment: HumanDesignEnrichmentResult;
};

function nonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}
function nonEmptyArray(v: unknown): boolean {
  return Array.isArray(v) && v.length > 0;
}
const CENTER_KEYS = ["head", "ajna", "throat", "g", "ego", "spleen", "sacral", "solarPlexus", "root"] as const;
function centersComplete(centers: unknown): boolean {
  if (!centers || typeof centers !== "object") return false;
  const c = centers as Record<string, unknown>;
  return CENTER_KEYS.every((k) => c[k] === true || c[k] === false);
}
function activationEntryComplete(a: unknown): boolean {
  if (!a || typeof a !== "object") return false;
  const entry = a as Record<string, unknown>;
  return nonEmptyString(entry.planet) && Number.isFinite(entry.gate) && Number.isFinite(entry.line);
}
function activationsComplete(activations: unknown): boolean {
  return Array.isArray(activations) && activations.length > 0 && activations.every(activationEntryComplete);
}
function activationsHaveColorToneBase(activations: unknown): boolean {
  if (!Array.isArray(activations) || activations.length === 0) return false;
  return activations.every((a) => {
    if (!a || typeof a !== "object") return false;
    const entry = a as Record<string, unknown>;
    return Number.isFinite(entry.color) && Number.isFinite(entry.tone) && Number.isFinite(entry.base);
  });
}

/**
 * FIELD PRESENT != FIELD MUST BE NON-EMPTY. A Reflector is mechanically
 * defined by zero connected channels across all nine open (undefined)
 * centers — that is the correct, complete result for this type, not a
 * missing field. This only recognizes the valid case when Type AND the
 * centers state are BOTH consistent with a genuine Reflector (all 9
 * determined and all false) — a record merely labeled Reflector with
 * inconsistent center data still falls through to "incomplete", which is
 * the conservative/reviewable outcome, not silently accepted.
 */
function isValidZeroChannelReflector(hd: Partial<HumanDesignChart>): boolean {
  const type = typeof hd.type === "string" ? hd.type.trim().toLowerCase() : "";
  if (type !== "reflector") return false;
  if (!centersComplete(hd.centers)) return false;
  const centers = hd.centers as Record<string, unknown>;
  return CENTER_KEYS.every((k) => centers[k] === false);
}

function checkCoreField(field: (typeof CORE_REQUIRED_FIELDS)[number], hd: Partial<HumanDesignChart>): boolean {
  switch (field) {
    case "type": return nonEmptyString(hd.type);
    case "strategy": return nonEmptyString(hd.strategy);
    case "authority": return nonEmptyString(hd.authority);
    case "profile": return nonEmptyString(hd.profile);
    case "definition": return nonEmptyString(hd.definition);
    case "gates": return nonEmptyArray(hd.gates);
    case "channels": {
      if (nonEmptyArray(hd.channels)) return true;
      // Only an explicit `[]` (the engine confirmed zero channels) can qualify
      // for the Reflector exemption — a missing/undefined field is never
      // silently treated as "confirmed empty".
      if (Array.isArray(hd.channels) && hd.channels.length === 0) return isValidZeroChannelReflector(hd);
      return false;
    }
    case "centers": return centersComplete(hd.centers);
    case "incarnationCross.name": return nonEmptyString(hd.incarnationCross?.name);
    case "status": return nonEmptyString(hd.status);
    case "source": return nonEmptyString(hd.source);
    case "calculationQuality": return nonEmptyString(hd.calculationQuality);
    case "hdEngineVersion": return nonEmptyString(hd.hdEngineVersion);
    default: return false;
  }
}

function getAdvancedVariableStatus(hd: Partial<HumanDesignChart>): { status: AdvancedVariableStatus; missing: string[] } {
  const missing = ADVANCED_VARIABLE_FIELDS.filter((f) => {
    if (f === "variables") return !(hd.variables && typeof hd.variables === "object");
    return !nonEmptyString((hd as Record<string, unknown>)[f]);
  });
  if (missing.length === 0) return { status: "COMPLETE", missing: [] };
  if (missing.length === ADVANCED_VARIABLE_FIELDS.length) return { status: "UNAVAILABLE_FROM_ENGINE", missing: [...missing] };
  return { status: "PARTIAL", missing: [...missing] };
}

function getEnrichmentStatus(hd: Partial<HumanDesignChart>): HumanDesignEnrichmentResult {
  const missing: string[] = [];
  const hasCrossGates = nonEmptyArray(hd.incarnationCross?.gates);
  const hasDesignActivations = activationsComplete(hd.designActivations);
  const hasPersonalityActivations = activationsComplete(hd.personalityActivations);
  const hasColorToneBase = activationsHaveColorToneBase(hd.designActivations) || activationsHaveColorToneBase(hd.personalityActivations);

  if (!hasCrossGates) missing.push("incarnationCross.gates");
  if (!hasDesignActivations) missing.push("designActivations");
  if (!hasPersonalityActivations) missing.push("personalityActivations");
  if (!hasColorToneBase) missing.push("color", "tone", "base");

  if (missing.length === 0) return { status: "ENRICHMENT_COMPLETE", missing: [] };
  // All four enrichment dimensions absent = the known current-engine shape.
  if (!hasCrossGates && !hasDesignActivations && !hasPersonalityActivations && !hasColorToneBase) {
    return { status: "ENGINE_UNSUPPORTED", missing };
  }
  return { status: "ENRICHMENT_PARTIAL", missing };
}

/**
 * Structural completeness on top of `getHdState()`. Core-chart completeness
 * (coreState) is never downgraded by missing enrichment or missing advanced
 * variables — those are reported as independent dimensions instead. Never
 * reclassifies a stored record as more complete than it structurally is.
 */
export function getHumanDesignCompleteness(value: unknown): HumanDesignCompletenessResult {
  const hdState = getHdState(value);
  const hd = (value && typeof value === "object" ? value : {}) as Partial<HumanDesignChart>;

  const normalized = normalizeHumanDesignAdvancedFields(hd as Record<string, unknown>);
  const semanticCount = [normalized.digestion, normalized.environment, normalized.motivation, normalized.perspective, normalized.cognition].filter(nonEmptyString).length;
  const observation = {
    semanticFields: (semanticCount === 5 ? "COMPLETE" : semanticCount ? "PARTIAL" : "UNAVAILABLE") as HumanDesignCompletenessResult["semanticFields"],
    variableStructure: (normalized.variables && (nonEmptyString(normalized.variables.short_code) || ["top_left", "bottom_left", "top_right", "bottom_right"].some(key => {
      const arrow = normalized.variables?.[key];
      return arrow && typeof arrow === "object" && !Array.isArray(arrow) && Object.keys(arrow).length > 0;
    })) ? "AVAILABLE" : "UNAVAILABLE") as HumanDesignCompletenessResult["variableStructure"],
  };
  const emptyEnrichment: HumanDesignEnrichmentResult = { status: "ENGINE_UNSUPPORTED", missing: [...ENGINE_UNSUPPORTED_ENRICHMENT_FIELDS] };
  const emptyAdvanced = { status: "UNAVAILABLE_FROM_ENGINE" as AdvancedVariableStatus, missing: [...ADVANCED_VARIABLE_FIELDS] };

  const nonCanonical = (coreState: HumanDesignCoreState): HumanDesignCompletenessResult => ({
    coreState,
    ...observation,
    missingCoreFields: [],
    advancedVariables: emptyAdvanced,
    enrichment: emptyEnrichment,
  });

  if (hdState.state === "FALLBACK_LABELED") return nonCanonical("FALLBACK");
  if (hdState.state === "PENDING") return nonCanonical("PENDING");
  if (hdState.state === "RETRIABLE_ERROR" || hdState.state === "TERMINAL_ERROR") return nonCanonical("ERROR");

  // hdState.state === "CANONICAL": run the structural check the metadata check skips.
  const missingCoreFields = CORE_REQUIRED_FIELDS.filter((f) => !checkCoreField(f, hd));
  const advancedVariables = getAdvancedVariableStatus(hd);
  const enrichment = getEnrichmentStatus(hd);

  let coreState: HumanDesignCoreState;
  if (missingCoreFields.length === 0) {
    coreState = advancedVariables.status === "COMPLETE" ? "CANONICAL_CORE_COMPLETE" : "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL";
  } else {
    coreState = "CANONICAL_INCOMPLETE";
  }

  return { coreState, missingCoreFields, advancedVariables, enrichment, ...observation };
}
