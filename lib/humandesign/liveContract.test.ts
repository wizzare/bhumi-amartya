import assert from "node:assert/strict";
import test from "node:test";

import { mergeVerifiedHumanDesignChart } from "./liveContract";
import type { HumanDesignChart } from "./types";

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
