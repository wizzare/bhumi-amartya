import assert from "node:assert/strict";
import test from "node:test";

import { calculateWithHdkit } from "../../lib/humandesign/hdkitAdapter";
import { calculateHumanDesign } from "../../lib/humandesign/calculateHumanDesign";
import { isCanonicalHumanDesign, getHumanDesignCanonicalFailureReason } from "../../lib/humandesign/hdAudit";
import { getHdState } from "../../lib/humandesign/hdState";

const ponorogo = {
  birthDate: "1997-11-03",
  birthTime: "10:45",
  birthCity: "Ponorogo",
  timezone: "+07:00",
  latitude: -7.87,
  longitude: 111.46,
} as const;

const originalFetch = globalThis.fetch;

function mockResponse(data: unknown, status = 200): void {
  globalThis.fetch = async () => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

// CASE 1 / CASE A: canonical API succeeds -> READY_CANONICAL, correct Projector.
test("CASE 1: canonical success returns Projector (not Generator)", async () => {
  mockResponse({
    type: "Projector",
    profile: "4/6",
    authority: "Self-Projected Authority",
    strategy: "Wait for the Invitation",
    inc_cross: "((44, 24), (33, 19))-RAC",
    incarnationCross: "((44, 24), (33, 19))-RAC",
    channels: ["47-64", "33-13"],
    definition: 2,
    definedCenters: ["Ajna", "G_Center", "Head", "Throat"],
    openCenters: ["Heart", "Root", "Sacral", "Spleen", "Solar Plexus"],
    gatesPersonality: ["44", "24", "5", "47"],
    gatesDesign: ["33", "19", "59", "47"],
    status: "ready",
    source: "human-design-py",
    calculationStatus: "completed",
  });

  const result = await calculateHumanDesign({ ...ponorogo });

  assert.equal(result.status, "ready", "canonical is ready");
  assert.equal(result.type, "Projector", "canonical service dictates Projector");
  assert.equal(isCanonicalHumanDesign(result), true, "is canonical");
  assert.equal(getHdState(result).state, "CANONICAL", "state machine reports CANONICAL");
  assert.equal(getHumanDesignCanonicalFailureReason(result), "canonical");
});

// CASE 2 / CASE B: canonical API timeout -> PROCESSING, not READY, no Type exposed.
test("CASE 2: timeout keeps chart PENDING (never READY, no Type)", async () => {
  globalThis.fetch = (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => reject(new DOMException("The operation was aborted.", "AbortError")));
  });

  const result = await calculateHumanDesign({ ...ponorogo });

  assert.notEqual(result.status, "ready", "must not be READY on timeout");
  assert.equal(result.type, null, "no Type exposed on timeout");
  assert.equal(getHdState(result).state, "PENDING", "user sees PROCESSING");
  assert.equal(isCanonicalHumanDesign(result), false, "timeout result is not canonical");
  assert.equal(result.calculationQuality, "fallback_approximation", "diagnostic fallback retained as approximation");
  assert.ok(result.retryCount !== undefined, "retry metadata present");
  assert.ok(result.nextRetryAt !== undefined, "nextRetryAt present for future scheduler");
});

// CASE 2 / CASE C: API offline -> PROCESSING, not READY, no Type.
test("CASE 3: offline (connection error) keeps chart PENDING", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("connect ECONNREFUSED");
  };

  const result = await calculateHumanDesign({ ...ponorogo });

  assert.notEqual(result.status, "ready", "HOTFIX: never READY on offline");
  assert.equal(result.type, null, "no Type on offline");
  assert.equal(getHdState(result).state, "PENDING", "user sees PROCESSING");
  assert.equal(isCanonicalHumanDesign(result), false);
  assert.ok(result.retryCount !== undefined, "metadata on retriable failure");
  assert.ok(result.nextRetryAt !== undefined);
});

// CASE 4 guard: existing canonical must never be overwritten.
test("CASE 4: existing canonical doc must not be overwritten by a later fallback write", async () => {
  const existingCanonical = {
    type: "Projector",
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
  };
  // Simulate a write attempt that would overwrite: repository guard is asserted in
  // blueprintRepository.test; here we verify the canonical predicate is stable.
  assert.equal(isCanonicalHumanDesign(existingCanonical), true, "existing canonical is protected");
  const fallbackCandidate = {
    status: "pending",
    type: null,
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
  };
  assert.equal(isCanonicalHumanDesign(fallbackCandidate), false, "fallback candidate is not canonical");
  assert.equal(getHdState(fallbackCandidate).state, "PENDING", "live fallback attempt is PROCESSING, not final");
});

// CASE 5: legacy FALLBACK_LABELED source is recognized but never canonical.
test("CASE 5: settled legacy local-fallback is FALLBACK_LABELED, not canonical", async () => {
  const legacy = {
    type: "Generator",
    status: "ready",
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
  };
  const state = getHdState(legacy);
  assert.equal(state.state, "FALLBACK_LABELED");
  assert.equal(state.provenance, "local_fallback");
  assert.equal(state.needsUpgrade, true);
  assert.equal(isCanonicalHumanDesign(legacy), false);
});

test("CASE 6: legacy fallback + unavailable service stays PENDING (diagnostic only)", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("connect ECONNREFUSED");
  };
  const result = await calculateHumanDesign({ ...ponorogo });
  assert.equal(result.type, null, "HOTFIX: no Type exposed when canonical unavailable");
  assert.notEqual(result.status, "ready");
  assert.equal(getHdState(result).state, "PENDING", "user still sees PROCESSING");
});

test("auditCandidate fields preserve TS diagnostic on failure without exposing final Type", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("connect ECONNREFUSED");
  };

  const result = await calculateWithHdkit({ ...ponorogo, birthTime: "10:45" });
  assert.equal(result.type, null, "not exposed as final");
  assert.ok(result.auditCandidateType, "diagnostic Type retained for audit");
});