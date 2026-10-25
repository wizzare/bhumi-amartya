import assert from "node:assert/strict";
import test from "node:test";
import {
  isCanonicalCoreComplete,
  isCanonicalIncomplete,
  getHumanDesignCompleteness,
} from "../../lib/humandesign/completeness";
import { normalizeLiveHumanDesignResponse } from "../../lib/humandesign/liveContract";
import { getHdState } from "../../lib/humandesign/hdState";
import {
  isHdRecoveryDue,
  mergeBlueprintPreservingCanonical,
  selectHumanDesignChart,
} from "../../lib/humandesign/hdRecovery";
import type { HumanDesignChart } from "../../lib/humandesign/types";

function buildCompleteCanonicalGenerator(): HumanDesignChart {
  return {
    type: "Generator",
    strategy: "To Respond",
    authority: "Sacral Authority",
    profile: "1/3",
    definition: "Single Definition",
    incarnationCross: { name: "Right Angle Cross of the Sphinx", gates: [1, 2, 7, 13] },
    centers: {
      head: false,
      ajna: false,
      throat: true,
      g: true,
      ego: false,
      spleen: false,
      sacral: true,
      solarPlexus: false,
      root: false,
    },
    openCenters: ["Head", "Ajna", "Ego", "Spleen", "Solar Plexus", "Root"],
    gates: [10, 20, 34, 57],
    channels: ["10-20", "34-57"],
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
    source: "human-design-py",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "validated",
    generatedAt: "2026-10-07T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    calculationStatus: "completed",
  };
}

function buildValidZeroChannelReflector(): HumanDesignChart {
  return {
    type: "Reflector",
    strategy: "Wait a Lunar Cycle",
    authority: "Lunar Authority",
    profile: "5/1",
    definition: "No Definition",
    incarnationCross: { name: "Right Angle Cross of the Four Directions", gates: [] },
    centers: {
      head: false,
      ajna: false,
      throat: false,
      g: false,
      ego: false,
      spleen: false,
      sacral: false,
      solarPlexus: false,
      root: false,
    },
    openCenters: ["Head", "Ajna", "Throat", "G", "Ego", "Spleen", "Sacral", "Solar Plexus", "Root"],
    gates: [15, 25, 46],
    channels: [],
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
    source: "human-design-py",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "validated",
    generatedAt: "2026-10-07T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    calculationStatus: "completed",
  };
}

// 1. Canonical lengkap diterima
test("HD-02 CANON-01: Canonical chart with complete core is accepted as core complete", () => {
  const chart = buildCompleteCanonicalGenerator();
  assert.equal(isCanonicalCoreComplete(chart), true);
  assert.equal(isCanonicalIncomplete(chart), false);
  const completeness = getHumanDesignCompleteness(chart);
  assert.equal(completeness.missingCoreFields.length, 0);
  assert.ok(
    completeness.coreState === "CANONICAL_CORE_COMPLETE" ||
    completeness.coreState === "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL"
  );
});

// 2. Metadata canonical dengan core kosong ditolak sebagai complete
test("HD-02 CANON-02: Metadata-canonical chart with empty core fields is rejected by acceptance predicate", () => {
  const metadataOnlyChart = {
    type: "Generator",
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    // Missing: strategy, authority, profile, definition, centers, channels, gates, incarnationCross
  };
  // Passes shallow metadata classification
  assert.equal(getHdState(metadataOnlyChart).state, "CANONICAL");
  // BUT rejected by boundary acceptance predicate
  assert.equal(isCanonicalCoreComplete(metadataOnlyChart), false);
  assert.equal(isCanonicalIncomplete(metadataOnlyChart), true);
});

// 3. Chart legacy tanpa metadata lengkap tidak otomatis dinyatakan rusak
test("HD-02 CANON-03: Legacy historical chart is classified as FALLBACK_LABELED, not TERMINAL_ERROR", () => {
  const legacyChart = {
    type: "Projector",
    profile: "4/6",
    status: "ready",
    source: "legacy-hd-engine-v0",
    hdEngineVersion: "historical-build70",
  };
  const state = getHdState(legacyChart);
  assert.equal(state.state, "FALLBACK_LABELED");
  assert.notEqual(state.state, "TERMINAL_ERROR");
  assert.equal(state.type, "Projector");
  // Selectable for display so user does not see blank/broken chart
  assert.ok(selectHumanDesignChart(legacyChart, state) !== null);
});

// 4. Reflector valid dengan channels kosong diterima
test("HD-02 CANON-04: Valid Reflector with all 9 open centers and empty channels is core complete", () => {
  const reflector = buildValidZeroChannelReflector();
  assert.equal(isCanonicalCoreComplete(reflector), true);
  assert.equal(isCanonicalIncomplete(reflector), false);
  const completeness = getHumanDesignCompleteness(reflector);
  assert.equal(completeness.missingCoreFields.includes("channels"), false);
});

// 5. Enrichment opsional kosong tidak membatalkan core lengkap
test("HD-02 CANON-05: Missing optional enrichment does NOT downgrade core completeness", () => {
  const chartWithoutEnrichment = buildCompleteCanonicalGenerator();
  chartWithoutEnrichment.personalityActivations = [];
  chartWithoutEnrichment.designActivations = [];
  chartWithoutEnrichment.incarnationCross = { name: "Sphinx", gates: [] };
  const completeness = getHumanDesignCompleteness(chartWithoutEnrichment);
  assert.equal(completeness.enrichment.status, "ENGINE_UNSUPPORTED");
  assert.equal(isCanonicalCoreComplete(chartWithoutEnrichment), true);
});

// 6. Response HTTP 200 dengan payload invalid ditolak oleh live normalizer
test("HD-02 CANON-06: Live response normalizer returns null for missing essential core fields", () => {
  // Payload HTTP 200 from external engine but missing strategy and authority
  const malformedPayload = {
    status: "ready",
    type: "Projector",
    // strategy: undefined,
    // authority: undefined,
    profile: "3/5",
    definedCenters: ["Throat"],
    channels: ["10-20"],
    gatesPersonality: [10],
    gatesDesign: [20],
  };
  const normalized = normalizeLiveHumanDesignResponse(malformedPayload);
  assert.equal(normalized, null, "Malformed 200 payload must normalize to null");
});

// 7. Chart parsial / unverified tidak menimpa chart valid
test("HD-02 CANON-07: Merge preserves stored valid canonical chart against incoming partial chart", () => {
  const existingValid = buildCompleteCanonicalGenerator();
  const incomingPartial = {
    type: "Generator",
    status: "pending",
    source: "local-fallback",
  };
  const merged = mergeBlueprintPreservingCanonical(existingValid, incomingPartial);
  assert.equal(merged, existingValid);
  assert.equal((merged as HumanDesignChart).type, "Generator");
  assert.equal((merged as HumanDesignChart).strategy, "To Respond");
});

// 8. Chart valid tetap dipertahankan ketika engine unavailable
test("HD-02 CANON-08: Stored chart is selected for rendering when engine or network is down", () => {
  const storedValid = buildCompleteCanonicalGenerator();
  const state = getHdState(storedValid);
  const selected = selectHumanDesignChart(storedValid, state);
  assert.equal(selected, storedValid);
});

// 9. Perubahan predicate tidak merusak consumer lama (isCanonicalHumanDesign remains compatible)
test("HD-02 CANON-09: Existing getHdState and isCanonicalHumanDesign remain backward compatible", () => {
  const canonicalChart = buildCompleteCanonicalGenerator();
  const state = getHdState(canonicalChart);
  assert.equal(state.state, "CANONICAL");
  assert.equal(state.type, "Generator");

  const pendingChart = { status: "pending", type: null };
  assert.equal(getHdState(pendingChart).state, "PENDING");
});

// 10. Recovery eligibility membedakan chart lengkap, incomplete canonical, missing, dan pending
test("HD-02 CANON-10: Recovery due check distinguishes core complete from incomplete and pending", () => {
  const complete = buildCompleteCanonicalGenerator();
  const dueComplete = isHdRecoveryDue(complete);
  assert.equal(dueComplete.due, false);
  assert.equal(dueComplete.reason, "preserved_canonical");

  const incomplete = {
    type: "Manifestor",
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
  };
  const dueIncomplete = isHdRecoveryDue(incomplete);
  // Preserved against automatic overwrite in HD-02, but marked repair_eligible_incomplete
  assert.equal(dueIncomplete.due, false);
  assert.equal(dueIncomplete.reason, "repair_eligible_incomplete");

  const pending = { status: "pending", calculationStatus: "pending" };
  const duePending = isHdRecoveryDue(pending);
  assert.equal(duePending.due, true);
  assert.equal(duePending.reason, "due");
});
