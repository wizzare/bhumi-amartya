import assert from "node:assert/strict";
import test from "node:test";

import {
  getHumanDesignCompleteness,
  ENGINE_UNSUPPORTED_ENRICHMENT_FIELDS,
} from "./completeness";

const baseCenters = {
  head: false, ajna: false, throat: true, g: true, ego: true,
  spleen: true, sacral: true, solarPlexus: true, root: true,
};

const baseCore = {
  type: "Manifesting Generator",
  strategy: "Wait to Respond",
  authority: "Emotional Authority",
  profile: "1/3",
  definition: "Single Definition",
  gates: [1, 2, 3],
  channels: ["1-8"],
  centers: baseCenters,
  status: "ready",
  source: "human-design-py",
  calculationQuality: "verified",
  hdEngineVersion: "gaia-hd-v1",
  incarnationCross: { name: "Left Angle Cross of Incarnation", gates: [] },
};

const fullActivation = { planet: "Sun", gate: 1, line: 1, color: 1, tone: 1, base: 1 };

const advancedComplete = {
  digestion: "Active",
  environment: "Observer",
  motivation: "Receptive",
  perspective: "Personal",
  cognition: "Outer Vision",
  variables: { short_code: "PRR DLR" },
};

test("current-engine shape (core+advanced complete, zero enrichment) is CANONICAL_CORE_COMPLETE with ENGINE_UNSUPPORTED enrichment — not penalized", () => {
  const chart = { ...baseCore, ...advancedComplete, designActivations: [], personalityActivations: [] };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE");
  assert.deepEqual(result.missingCoreFields, []);
  assert.equal(result.advancedVariables.status, "COMPLETE");
  assert.equal(result.enrichment.status, "ENGINE_UNSUPPORTED");
  for (const f of ENGINE_UNSUPPORTED_ENRICHMENT_FIELDS) {
    assert.ok(result.enrichment.missing.includes(f), `expected ${f} in enrichment.missing`);
  }
});

test("chart with everything present including enrichment is CANONICAL_CORE_COMPLETE with ENRICHMENT_COMPLETE", () => {
  const chart = {
    ...baseCore,
    ...advancedComplete,
    incarnationCross: { name: "Left Angle Cross of Incarnation", gates: [1, 2, 3, 4] },
    designActivations: [fullActivation],
    personalityActivations: [fullActivation],
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE");
  assert.equal(result.enrichment.status, "ENRICHMENT_COMPLETE");
  assert.deepEqual(result.enrichment.missing, []);
});

test("core+activation-name present but advanced variables absent is CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL, not downgraded by enrichment", () => {
  const chart = {
    ...baseCore,
    designActivations: [],
    personalityActivations: [],
    digestion: null,
    environment: null,
    motivation: null,
    perspective: null,
    cognition: null,
    variables: null,
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL");
  assert.deepEqual(result.missingCoreFields, []);
  assert.equal(result.advancedVariables.status, "UNAVAILABLE_FROM_ENGINE");
});

test("partial advanced variables (some present) is PARTIAL, not UNAVAILABLE_FROM_ENGINE", () => {
  const chart = {
    ...baseCore,
    designActivations: [],
    personalityActivations: [],
    digestion: "Active",
    environment: null,
    motivation: "Receptive",
    perspective: null,
    cognition: null,
    variables: { short_code: "PRR DLR" },
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL");
  assert.equal(result.advancedVariables.status, "PARTIAL");
});

test("screenshot bug pattern: type/profile/authority present, gates/channels/centers empty -> CANONICAL_INCOMPLETE (core, not enrichment, is the cause)", () => {
  const chart = {
    type: "Projector",
    strategy: "Wait for Invitation",
    authority: "Splenic",
    profile: "5/1",
    definition: "Single Definition",
    gates: [],
    channels: [],
    centers: { head: null, ajna: null, throat: null, g: null, ego: null, spleen: null, sacral: null, solarPlexus: null, root: null },
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    incarnationCross: { name: null, gates: [] },
    designActivations: [],
    personalityActivations: [],
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("gates"));
  assert.ok(result.missingCoreFields.includes("channels"));
  assert.ok(result.missingCoreFields.includes("centers"));
  assert.ok(!result.missingCoreFields.includes("incarnationCross.gates"), "incarnationCross.gates must not appear in core fields anymore");
});

test("enrichment partial: cross gates present but activations still absent", () => {
  const chart = {
    ...baseCore,
    ...advancedComplete,
    incarnationCross: { name: "Left Angle Cross of Incarnation", gates: [1, 2, 3, 4] },
    designActivations: [],
    personalityActivations: [],
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE");
  assert.equal(result.enrichment.status, "ENRICHMENT_PARTIAL");
  assert.ok(result.enrichment.missing.includes("designActivations"));
  assert.ok(!result.enrichment.missing.includes("incarnationCross.gates"));
});

test("FALLBACK_LABELED hdState maps to FALLBACK regardless of structural fields", () => {
  const chart = { ...baseCore, source: "local-fallback", calculationQuality: "fallback_approximation" };
  assert.equal(getHumanDesignCompleteness(chart).coreState, "FALLBACK");
});

test("pending payload maps to PENDING", () => {
  assert.equal(getHumanDesignCompleteness({ status: "pending" }).coreState, "PENDING");
});

test("missing payload maps to PENDING (via hdState missing_payload)", () => {
  assert.equal(getHumanDesignCompleteness(null).coreState, "PENDING");
});

test("terminal error status maps to ERROR", () => {
  assert.equal(getHumanDesignCompleteness({ ...baseCore, status: "error" }).coreState, "ERROR");
});

// FIELD PRESENT != FIELD MUST BE NON-EMPTY: Reflector-specific channel semantics.

const allOpenCenters = {
  head: false, ajna: false, throat: false, g: false, ego: false,
  spleen: false, sacral: false, solarPlexus: false, root: false,
};

test("Reflector + [] channels + 9 undefined centers -> CANONICAL_CORE_COMPLETE (empty channels is the CORRECT result, not missing)", () => {
  const chart = {
    ...baseCore,
    type: "Reflector",
    strategy: "Wait a Lunar Cycle",
    authority: "Lunar Authority",
    profile: "5/1",
    channels: [],
    gates: [3, 9, 17],
    centers: allOpenCenters,
    digestion: "Active", environment: "Observer", motivation: "Receptive", perspective: "Personal", cognition: "Outer Vision",
    variables: { short_code: "PRR DLR" },
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_CORE_COMPLETE");
  assert.deepEqual(result.missingCoreFields, []);
});

test("Reflector with a missing/undefined channels field (not merely empty) -> still incomplete", () => {
  const chart = {
    ...baseCore,
    type: "Reflector",
    strategy: "Wait a Lunar Cycle",
    authority: "Lunar Authority",
    profile: "5/1",
    channels: undefined,
    centers: allOpenCenters,
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("channels"));
});

test("Reflector-labeled but centers NOT all open (inconsistent with a true Reflector) -> empty channels still flagged incomplete for review", () => {
  const chart = {
    ...baseCore,
    type: "Reflector",
    strategy: "Wait a Lunar Cycle",
    authority: "Lunar Authority",
    profile: "5/1",
    channels: [],
    centers: { ...allOpenCenters, throat: true }, // one center defined: inconsistent with Reflector
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("channels"));
});

test("Reflector-labeled but centers not fully determined -> empty channels still flagged incomplete", () => {
  const chart = {
    ...baseCore,
    type: "Reflector",
    channels: [],
    centers: { ...allOpenCenters, throat: null },
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("channels"));
});

test("non-Reflector with suspicious empty channels -> incomplete/review, never silently accepted", () => {
  const chart = {
    ...baseCore,
    type: "Manifesting Generator",
    channels: [],
    centers: baseCenters, // has defined centers, which structurally requires >=1 channel
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("channels"));
});

test("non-Reflector with all-open centers and empty channels -> also incomplete (only Reflector gets the exemption)", () => {
  const chart = {
    ...baseCore,
    type: "Manifestor",
    channels: [],
    centers: allOpenCenters,
  };
  const result = getHumanDesignCompleteness(chart);
  assert.equal(result.coreState, "CANONICAL_INCOMPLETE");
  assert.ok(result.missingCoreFields.includes("channels"));
});
