import assert from "node:assert";

import { getHdState, HD_PENDING_TTL_MS } from "../../lib/humandesign/hdState.ts";
import { isCanonicalHumanDesign } from "../../lib/humandesign/hdAudit.ts";

let assertions = 0;

function equal<T>(actual: T, expected: T, message: string): void {
  assertions += 1;
  assert.strictEqual(actual, expected, message);
}

const historicalBuild70to73 = {
  type: "Generator",
  status: "ready",
  source: "legacy-build-73",
  calculationQuality: "verified",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
const historicalState = getHdState(historicalBuild70to73);
equal(historicalState.state, "FALLBACK_LABELED", "Build 70-73 chart is labeled fallback");
equal(historicalState.type, "Generator", "historical type is preserved");
equal(historicalState.needsUpgrade, true, "historical chart remains eligible for canonical upgrade");
equal(isCanonicalHumanDesign(historicalBuild70to73), false, "historical chart is not canonical");

const canonicalChart = {
  type: "Projector",
  status: "ready",
  source: "human-design-py",
  calculationQuality: "verified",
  hdEngineVersion: "gaia-hd-v1",
};
equal(getHdState(canonicalChart).state, "CANONICAL", "current gaia chart is canonical");
equal(isCanonicalHumanDesign(canonicalChart), true, "compatibility wrapper delegates to the selector");

const terminalErrorState = getHdState({
  status: "error",
  calculationStatus: "error",
  type: null,
  source: "error",
});
equal(terminalErrorState.state, "TERMINAL_ERROR", "error without a type is terminal, not partial");
equal(terminalErrorState.type, null, "terminal error preserves null type");

const pendingAt = Date.parse("2026-01-01T00:00:00.000Z");
equal(
  getHdState({ status: "pending", type: null, updatedAt: new Date(pendingAt).toISOString() }, { now: pendingAt + HD_PENDING_TTL_MS - 1 }).state,
  "PENDING",
  "pending stays pending before the 60-second TTL",
);
equal(
  getHdState({ status: "pending", type: null, updatedAt: new Date(pendingAt).toISOString() }, { now: pendingAt + HD_PENDING_TTL_MS }).state,
  "RETRIABLE_ERROR",
  "pending becomes retriable at the 60-second TTL",
);

console.log(`PASS hd-state (${assertions} assertions)`);
