import assert from "node:assert/strict";
import test from "node:test";

import { mergeVerifiedHumanDesignChart, normalizeHumanDesignAdvancedFields, normalizeLiveHumanDesignResponse, presentHumanDesignAdvancedFields } from "./liveContract";
import type { HumanDesignChart } from "./types";

const advancedFields = ["digestion", "environment", "motivation", "perspective", "cognition"] as const;
const engineArrows = {
  top_left: { name: "Digestion", def_type: "Passive", tone: 4 },
  bottom_left: { name: "Environment", def_type: "Observer" },
  top_right: { name: "Motivation", def_type: "Receptive" },
  bottom_right: { name: "Perspective", def_type: "Focused" },
  short_code: "PRL DRR",
};
let advancedAssertions = 0;
const checkAdvanced = (actual: unknown, expected: unknown) => { assert.deepEqual(actual, expected); advancedAssertions++; };
test.after(() => console.log(`BUILD115_ADVANCED_ASSERTIONS=${advancedAssertions}`));

test("A top-level values and provenance win over all arrows", () => {
  const top = Object.fromEntries(advancedFields.map(field => [field, ` top-${field} `]));
  const result = normalizeHumanDesignAdvancedFields({ ...top, variables: { ...engineArrows, advanced: engineArrows } });
  for (const field of advancedFields) {
    checkAdvanced(result[field], `top-${field}`);
    checkAdvanced(result.advancedFieldSources[field], "live-top-level");
  }
});

test("B five semantics from variables alone is unsupported: engine supplies four, not cognition", () => {
  const result = normalizeHumanDesignAdvancedFields({ variables: engineArrows });
  checkAdvanced(advancedFields.map(field => result[field]), ["Passive", "Observer", "Receptive", "Focused", null]);
  checkAdvanced(result.advancedFieldSources, { digestion: "variables.top_left.def_type", environment: "variables.bottom_left.def_type", motivation: "variables.top_right.def_type", perspective: "variables.bottom_right.def_type", cognition: "unavailable" });
});

test("C mixed values use the same shared main runtime normalizer deterministically", () => {
  const data = { status: "ready", type: "Generator", channels: ["1-8"], digestion: " Active ", motivation: " ", variables: engineArrows };
  const chart = normalizeLiveHumanDesignResponse(data, "synthetic-time")!;
  const advanced = normalizeHumanDesignAdvancedFields(data);
  for (const field of advancedFields) checkAdvanced(chart[field], advanced[field]);
  checkAdvanced(chart.advancedFieldSources, advanced.advancedFieldSources);
  checkAdvanced(chart, normalizeLiveHumanDesignResponse(data, "synthetic-time"));
  checkAdvanced(chart.digestion, "Active");
  checkAdvanced(chart.motivation, "Receptive");
});

test("D perspective-only does not invent other semantics", () => {
  const result = normalizeHumanDesignAdvancedFields({ variables: { bottom_right: engineArrows.bottom_right } });
  checkAdvanced(advancedFields.map(field => result[field]), [null, null, null, "Focused", null]);
  checkAdvanced(result.advancedFieldSources.perspective, "variables.bottom_right.def_type");
});

test("E cognition remains unavailable despite tone, activations and unsupported aliases", () => {
  const result = normalizeHumanDesignAdvancedFields({ variables: { ...engineArrows, cognition: "unsupported", advanced: { cognition: "unsupported" } }, designActivations: [{ planet: "Sun", tone: 4 }], cognation: "unsupported", cognitive: "unsupported", cognision: "unsupported", cognitionType: "unsupported" });
  checkAdvanced(result.cognition, null);
  checkAdvanced(result.advancedFieldSources.cognition, "unavailable");
});

test("F variables presence, directions, wrong labels and malformed values are not semantics", () => {
  for (const variables of [null, [], {}, { shortCode: "PRL DRR" }, { top_left: { value: "left", tone: 1 } }, { top_left: { name: "Environment", def_type: "Active" } }, { top_left: { name: "Digestion", def_type: {} }, advanced: [] }]) {
    const result = normalizeHumanDesignAdvancedFields({ variables, cognition: 4 });
    checkAdvanced(advancedFields.map(field => result[field]), [null, null, null, null, null]);
    checkAdvanced(advancedFields.map(field => result.advancedFieldSources[field]), advancedFields.map(() => "unavailable"));
  }
  checkAdvanced(normalizeHumanDesignAdvancedFields({ variables: { shortCode: "PRL DRR" } }).variables?.short_code, "PRL DRR");
});

test("G legacy advanced arrow envelope is lossless with explicit path provenance and direct-arrow precedence", () => {
  const variables = { shortCode: "outer-code", retained: { synthetic: true }, advanced: { ...engineArrows, extra: "retained" } };
  const before = JSON.stringify(variables);
  const result = normalizeHumanDesignAdvancedFields({ variables });
  checkAdvanced(advancedFields.map(field => result[field]), ["Passive", "Observer", "Receptive", "Focused", null]);
  for (const [field, arrow] of [["digestion", "top_left"], ["environment", "bottom_left"], ["motivation", "top_right"], ["perspective", "bottom_right"]] as const) checkAdvanced(result.advancedFieldSources[field], `variables.advanced.${arrow}.def_type`);
  checkAdvanced(result.variables, { ...variables, ...engineArrows });
  checkAdvanced(JSON.stringify(variables), before);
  const mixed = normalizeHumanDesignAdvancedFields({ variables: { ...variables, top_left: { name: "Digestion", def_type: "Active" } } });
  checkAdvanced(mixed.digestion, "Active");
  checkAdvanced(mixed.advancedFieldSources.digestion, "variables.top_left.def_type");
  checkAdvanced(mixed.variables?.advanced, variables.advanced);
});

test("merged structure and semantic precedence are independent for every arrow", () => {
  for (const [field, key] of [["digestion", "top_left"], ["environment", "bottom_left"], ["motivation", "top_right"], ["perspective", "bottom_right"]] as const) {
    const outer = { name: field, def_type: "outer" };
    const nested = { name: field, def_type: "nested" };
    for (const invalid of [undefined, null, [], "invalid", {}]) {
      const result = normalizeHumanDesignAdvancedFields({ variables: { [key]: outer, advanced: { [key]: invalid } } });
      checkAdvanced(result[field], "outer");
      checkAdvanced(result.variables?.[key], outer);
      checkAdvanced(result.advancedFieldSources[field], `variables.${key}.def_type`);
    }
    const result = normalizeHumanDesignAdvancedFields({ variables: { ...engineArrows, [key]: outer, short_code: "outer-code", advanced: { [key]: nested } } });
    checkAdvanced(result[field], "outer");
    checkAdvanced(result.variables?.[key], nested);
    checkAdvanced(result.variables?.short_code, "outer-code");
    checkAdvanced(normalizeHumanDesignAdvancedFields({ variables: { [key]: outer, advanced: { shortCode: "nested-code" } } }).variables, { [key]: outer, advanced: { shortCode: "nested-code" }, short_code: "nested-code" });
    checkAdvanced(normalizeHumanDesignAdvancedFields({ variables: { advanced: { [key]: nested } } }).advancedFieldSources[field], `variables.advanced.${key}.def_type`);
    checkAdvanced(normalizeHumanDesignAdvancedFields({ [field]: "top", variables: { [key]: outer, advanced: { [key]: nested } } })[field], "top");
    checkAdvanced(normalizeHumanDesignAdvancedFields({ variables: { [key]: { name: "unsupported", def_type: "unsupported" } } })[field], null);
  }
});

test("Bodygraph runtime presenter renders authoritative, mixed and unavailable semantics without placeholders", () => {
  const unavailable = "Tidak tersedia pada blueprint tersimpan ini";
  for (const cognition of [undefined, null, "", " ", "undefined", "null", "-"]) {
    const result = presentHumanDesignAdvancedFields({ digestion: "authoritative", cognition, variables: engineArrows }, unavailable);
    checkAdvanced(result.fields.map(row => row.value), ["authoritative", "Observer", "Receptive", "Focused", unavailable]);
  }
  checkAdvanced(presentHumanDesignAdvancedFields({}, unavailable).fields.map(row => row.value), advancedFields.map(() => unavailable));
  checkAdvanced(presentHumanDesignAdvancedFields({ cognition: "explicit" }, unavailable).fields[4].value, "explicit");
});

const baseCenters = {
  head: false, ajna: false, throat: true, g: true, ego: true,
  spleen: true, sacral: true, solarPlexus: true, root: true,
};

const emptyCenters = {
  head: null, ajna: null, throat: null, g: null, ego: null,
  spleen: null, sacral: null, solarPlexus: null, root: null,
};

/** A stored record that is CANONICAL per hdState metadata but structurally incomplete (the CDI-108 bug). */
function structurallyIncompleteCanonical(): Partial<HumanDesignChart> {
  return {
    type: "Manifesting Generator",
    strategy: "Wait to Respond",
    authority: "Emotional Authority",
    profile: "1/3",
    definition: null as any,
    gates: [],
    channels: [],
    centers: emptyCenters as any,
    incarnationCross: { name: null, gates: [] },
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    designActivations: [],
    personalityActivations: [],
  };
}

/** A stored record that is both metadata-CANONICAL and structurally CANONICAL_CORE_COMPLETE. */
function structurallyCompleteCanonical(): Partial<HumanDesignChart> {
  return {
    type: "Manifesting Generator",
    strategy: "Wait to Respond",
    authority: "Emotional Authority",
    profile: "1/3",
    definition: "Single Definition",
    gates: [1, 2, 3],
    channels: ["1-8"],
    centers: baseCenters as any,
    incarnationCross: { name: "Left Angle Cross of Incarnation", gates: [] },
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    designActivations: [],
    personalityActivations: [],
  };
}

/** A canonical candidate (freshly normalized live chart) that improves on the incomplete record above, same identity. */
function structurallyImprovedCandidate(overrides: Partial<HumanDesignChart> = {}): HumanDesignChart {
  return {
    type: "Manifesting Generator",
    strategy: "Wait to Respond",
    authority: "Emotional Authority",
    profile: "1/3",
    definition: "Single Definition",
    gates: [1, 2, 3, 4],
    channels: ["1-8", "2-9"],
    centers: baseCenters as any,
    incarnationCross: { name: "Left Angle Cross of Incarnation", gates: [] },
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    designActivations: [],
    personalityActivations: [],
    generatedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    calculationStatus: "completed",
    variables: null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    perspective: null,
    ...overrides,
  } as HumanDesignChart;
}

test("existing metadata-CANONICAL + structurally incomplete + opt-in FALSE -> rejected (default, unchanged behavior)", () => {
  const result = mergeVerifiedHumanDesignChart(structurallyIncompleteCanonical(), structurallyImprovedCandidate());
  assert.equal(result, null);
});

test("existing metadata-CANONICAL + structurally incomplete + opt-in TRUE -> allowed", () => {
  const result = mergeVerifiedHumanDesignChart(structurallyIncompleteCanonical(), structurallyImprovedCandidate(), {
    allowCanonicalIncompleteRepair: true,
  });
  assert.notEqual(result, null);
  assert.equal(result?.type, "Manifesting Generator");
  assert.deepEqual(result?.gates, [1, 2, 3, 4]);
});

test("existing structurally COMPLETE canonical + opt-in TRUE -> still rejected (never replaces a complete chart)", () => {
  const result = mergeVerifiedHumanDesignChart(structurallyCompleteCanonical(), structurallyImprovedCandidate(), {
    allowCanonicalIncompleteRepair: true,
  });
  assert.equal(result, null);
});

test("opt-in TRUE but candidate does NOT structurally improve on the incomplete existing record -> rejected", () => {
  // Candidate is canonical but just as incomplete as existing (same missing core fields).
  const noImprovementCandidate = structurallyImprovedCandidate({
    gates: [], channels: [], centers: emptyCenters as any, definition: null as any,
    incarnationCross: { name: null, gates: [] },
  });
  const result = mergeVerifiedHumanDesignChart(structurallyIncompleteCanonical(), noImprovementCandidate, {
    allowCanonicalIncompleteRepair: true,
  });
  assert.equal(result, null);
});

test("fallback/retriable recovery behavior remains valid: existing is FALLBACK_LABELED (not metadata-canonical) -> merge proceeds regardless of opt-in", () => {
  const existingFallback: Partial<HumanDesignChart> = {
    type: "Generator",
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
    status: "ready",
  };
  const withoutOptIn = mergeVerifiedHumanDesignChart(existingFallback, structurallyImprovedCandidate());
  const withOptIn = mergeVerifiedHumanDesignChart(existingFallback, structurallyImprovedCandidate(), { allowCanonicalIncompleteRepair: true });
  assert.notEqual(withoutOptIn, null);
  assert.notEqual(withOptIn, null);
});

test("incoming noncanonical chart -> rejected regardless of opt-in", () => {
  const nonCanonicalCandidate = { ...structurallyImprovedCandidate(), status: "pending", source: "pending" } as HumanDesignChart;
  const result = mergeVerifiedHumanDesignChart(structurallyIncompleteCanonical(), nonCanonicalCandidate, {
    allowCanonicalIncompleteRepair: true,
  });
  assert.equal(result, null);
});

test("identity-sensitive fields remain protected: this function does not itself alter type/strategy/authority/profile beyond what the candidate carries", () => {
  // The merge function trusts the caller to have already run the identity guard;
  // it does not silently invent or drop identity fields — the merged record's
  // identity fields come straight from the (already identity-checked) candidate.
  const existing = structurallyIncompleteCanonical();
  const candidate = structurallyImprovedCandidate();
  const result = mergeVerifiedHumanDesignChart(existing, candidate, { allowCanonicalIncompleteRepair: true });
  assert.equal(result?.type, candidate.type);
  assert.equal(result?.strategy, candidate.strategy);
  assert.equal(result?.authority, candidate.authority);
  assert.equal(result?.profile, candidate.profile);
});
