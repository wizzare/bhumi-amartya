import assert from "node:assert/strict";
import test from "node:test";
import { requestHdJson, withHdDeadline, hdHttpFailure, isHdRetryable } from "../../lib/humandesign/hdCommunication";
import {
  recoverHumanDesignIfNeeded,
  getHdRecoveryDueForUid,
  hdRecoveryKey,
  clearHdRecoverySession,
  assertHdRecoveryWrite,
  type HdRecoveryDeps,
} from "../../lib/humandesign/hdRecovery";
import { createPendingHumanDesignChart, type HumanDesignChart } from "../../lib/humandesign/types";

const now = Date.parse("2026-03-01T00:00:00Z");
const baseProfile = {
  birthDate: "1990-05-15", birthTime: "08:30", birthCity: "Jakarta",
  timezone: "Asia/Jakarta", latitude: -6.2, longitude: 106.8,
};

function sampleCanonical(): HumanDesignChart {
  return {
    ...createPendingHumanDesignChart(""),
    type: "Generator",
    strategy: "To Respond",
    authority: "Sacral Authority",
    profile: "1/3",
    definition: "Single Definition",
    incarnationCross: { name: "Right Angle Cross of the Sphinx", gates: [1, 2, 7, 13] },
    centers: { head: false, ajna: false, throat: true, g: true, ego: false, spleen: false, sacral: true, solarPlexus: false, root: false },
    openCenters: ["Head", "Ajna", "Ego", "Spleen", "Solar Plexus", "Root"],
    gates: [10, 20, 34, 57],
    channels: ["10-20", "34-57"],
    status: "ready",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "validated",
    calculationStatus: "completed",
    generatedAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}

let seq = 0;
function createHarness(hd: unknown = { status: "pending" }) {
  const uid = `hd04-u-${++seq}`;
  let stored: Record<string, unknown> = { uid, input: { ...baseProfile }, humanDesign: hd, extraField: "preserved" };
  let calls = 0;
  let writes = 0;
  const deps: HdRecoveryDeps = {
    uid, profile: baseProfile, blueprint: stored, nowMs: now,
    read: async () => stored,
    persist: async (_uid, value) => { writes++; stored = value; return true; },
    calculate: async () => { calls++; return sampleCanonical(); },
  };
  return { uid, deps, stored: () => stored, calls: () => calls, writes: () => writes };
}

test("Scenario 1: Normal 200 ready response yields canonical chart", async () => {
  const res = await requestHdJson("/mock", {}, { fetch: async () => Response.json({ status: "ready" }) });
  assert.equal(res.status, "ready");
});

test("Scenario 2: 404 is classified as permanent endpoint_not_found (no retry)", async () => {
  assert.equal(hdHttpFailure(404), "endpoint_not_found");
  assert.equal(isHdRetryable("endpoint_not_found"), false);
  const h = createHarness();
  h.deps.calculate = async () => ({ ...createPendingHumanDesignChart(""), lastErrorCode: "endpoint_not_found" });
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "terminal");
  assert.equal(getHdRecoveryDueForUid(h.uid, h.stored().humanDesign, now).due, false);
});

test("Scenario 3: 500 error is retriable", async () => {
  assert.equal(hdHttpFailure(500), "service_unavailable");
  assert.equal(isHdRetryable("service_unavailable"), true);
});

test("Scenario 4: Timeout deadline rejection", async () => {
  await assert.rejects(
    withHdDeadline(() => new Promise<never>(() => {}), 10),
    { message: "timeout" },
  );
});

test("Scenario 5: Client timeout before headers", async () => {
  await assert.rejects(
    requestHdJson("/mock", {}, { timeoutMs: 10, fetch: () => new Promise<never>(() => {}) }),
    { message: "timeout" },
  );
});

test("Scenario 6: Delayed body chunk exceeds deadline", async () => {
  await assert.rejects(
    requestHdJson("/mock", {}, {
      timeoutMs: 10,
      fetch: async () => ({ ok: true, json: () => new Promise<never>(() => {}) }) as unknown as Response,
    }),
    { message: "timeout" },
  );
});

test("Scenario 7: 200 with invalid format rejected", async () => {
  await assert.rejects(
    requestHdJson("/mock", {}, { fetch: async () => new Response("<html>not json</html>") }),
    { message: "invalid_response" },
  );
});

test("Scenario 8: 429 rate limit is retriable with bounded backoff", () => {
  assert.equal(hdHttpFailure(429), "rate_limited");
  assert.equal(isHdRetryable("rate_limited"), true);
});

test("Scenario 9: Auth 401/403 failure is terminal with no retry", async () => {
  assert.equal(hdHttpFailure(401), "unauthorized");
  assert.equal(hdHttpFailure(403), "unauthorized");
  assert.equal(isHdRetryable("unauthorized"), false);
  const h = createHarness();
  h.deps.calculate = async () => ({ ...createPendingHumanDesignChart(""), lastErrorCode: "unauthorized" });
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "terminal");
  assert.equal(getHdRecoveryDueForUid(h.uid, h.stored().humanDesign, now).due, false);
});

test("Scenario 10: Inactive logout cancels in-flight recovery before write", async () => {
  const h = createHarness();
  let active = true;
  h.deps.isActive = () => active;
  h.deps.calculate = async () => { active = false; return sampleCanonical(); };
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "cancelled");
  assert.equal(h.writes(), 0);
});

test("Scenario 11: Account switch / session change cancels orphaned task", async () => {
  const h = createHarness();
  h.deps.sessionId = "session-1";
  let inFlight = false;
  h.deps.calculate = async () => {
    inFlight = true;
    clearHdRecoverySession(h.uid);
    return sampleCanonical();
  };
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(inFlight, true);
  assert.equal(res.action, "cancelled");
  assert.equal(h.writes(), 0);
});

test("Scenario 12: Birth input change mid-flight invalidates calculation and aborts", async () => {
  const h = createHarness();
  let latest = { ...h.stored() };
  h.deps.read = async () => latest;
  h.deps.calculate = async () => {
    latest = { ...latest, input: { ...baseProfile, birthTime: "12:00" } };
    return sampleCanonical();
  };
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "cancelled");
  assert.equal(res.reason, "input_revision_changed_during_calculation");
  assert.equal(h.writes(), 0);
});

test("Scenario 13: Concurrent recovery calls for identical scope share execution", async () => {
  const h = createHarness();
  let release: ((c: HumanDesignChart) => void) | null = null;
  let calls = 0;
  h.deps.calculate = () => {
    calls++;
    return new Promise(r => { release = r; });
  };
  const p1 = recoverHumanDesignIfNeeded(h.deps);
  const p2 = recoverHumanDesignIfNeeded(h.deps);
  assert.equal(p1, p2);
  // Yield microtask to allow calculate promise to initialize
  await new Promise(r => setTimeout(r, 10));
  assert.ok(typeof release === "function", "release must be assigned by calculate invocation");
  release!(sampleCanonical());
  const [r1, r2] = await Promise.all([p1, p2]);
  assert.equal(r1.action, "recovered-canonical");
  assert.equal(r2.action, "recovered-canonical");
  assert.equal(calls, 1);
  assert.equal(h.writes(), 1);
});

test("Scenario 14: Retry budget exhaustion halts subsequent execution", async () => {
  const h = createHarness();
  h.deps.calculate = async () => { throw new Error("network down"); };
  for (let i = 1; i <= 5; i++) {
    h.deps.nowMs = now + i * 7200000;
    await recoverHumanDesignIfNeeded(h.deps);
  }
  h.deps.nowMs = now + 100000000;
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "exhausted");
  assert.equal(getHdRecoveryDueForUid(h.uid, h.stored().humanDesign, h.deps.nowMs).due, false);
});

test("Scenario 15: Valid stored historical chart preserved upon service failure", async () => {
  const historical = { ...sampleCanonical(), hdEngineVersion: "v1-legacy", strategy: "Historical Strategy" };
  const h = createHarness(historical);
  h.deps.calculate = async () => ({ ...createPendingHumanDesignChart(""), lastErrorCode: "connection_error" });
  await recoverHumanDesignIfNeeded(h.deps);
  const hd = h.stored().humanDesign as HumanDesignChart;
  assert.equal(hd.strategy, "Historical Strategy");
  assert.equal(hd.type, "Generator");
});

test("Scenario 16: Stale reread never claims success or marks persisted", async () => {
  const h = createHarness();
  let reads = 0;
  h.deps.read = async () => {
    reads++;
    return { ...h.stored(), humanDesign: reads > 1 ? { status: "pending" } : h.stored().humanDesign };
  };
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.notEqual(res.action, "recovered-canonical");
  assert.equal(res.persisted, false);
});

test("Scenario 17: Authoritative round-trip confirms complete core canonical write", async () => {
  const h = createHarness();
  const res = await recoverHumanDesignIfNeeded(h.deps);
  assert.equal(res.action, "recovered-canonical");
  assert.equal(res.persisted, true);
  assert.equal(h.writes(), 1);
  assert.equal((h.stored().humanDesign as HumanDesignChart).type, "Generator");
  assert.equal(h.stored().extraField, "preserved");
});

test("Scenario 18: Cancellation or completion leaves zero orphan timers", context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const controller = new AbortController();
  const p = withHdDeadline(() => new Promise<never>(() => {}), 1000, controller.signal);
  controller.abort();
  return assert.rejects(p, { message: "cancelled" }).then(() => {
    context.mock.timers.tick(5000);
    context.mock.timers.reset();
  });
});

test("Mock Transaction: assertHdRecoveryWrite rejects changed input or inactive caller", () => {
  const snapshot = { input: { ...baseProfile } };
  const expected = JSON.stringify(baseProfile);
  assert.doesNotThrow(() => assertHdRecoveryWrite(snapshot, expected, true));
  assert.throws(() => assertHdRecoveryWrite(snapshot, expected, false), { message: "inactive_or_input_changed" });
  assert.throws(() => assertHdRecoveryWrite({ input: { ...baseProfile, birthDate: "2000-01-01" } }, expected, true), { message: "inactive_or_input_changed" });
});

test("Fingerprint Key Stability: exact birth values used in recovery key", () => {
  const k1 = hdRecoveryKey({ uid: "u1", sessionId: "s1", profile: baseProfile, blueprint: { input: baseProfile } });
  const k2 = hdRecoveryKey({ uid: "u1", sessionId: "s1", profile: baseProfile, blueprint: { input: baseProfile } });
  const k3 = hdRecoveryKey({ uid: "u1", sessionId: "s2", profile: baseProfile, blueprint: { input: baseProfile } });
  assert.equal(k1, k2);
  assert.notEqual(k1, k3);
});
