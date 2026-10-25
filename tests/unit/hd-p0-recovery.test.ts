import assert from "node:assert/strict";
import test from "node:test";
import { getHdState, HD_PENDING_TTL_MS } from "../../lib/humandesign/hdState";
import { HD_RETRY_MAX_ATTEMPTS } from "../../lib/humandesign/hdRetry";
import { getHdRecoveryDueForUid, isHdRecoveryDue, recoverHumanDesignIfNeeded, scheduleHdRecovery, selectHumanDesignChart, type HdRecoveryDeps } from "../../lib/humandesign/hdRecovery";
import { createPendingHumanDesignChart, type HumanDesignChart } from "../../lib/humandesign/types";

const now = Date.parse("2026-01-01T00:00:00Z");
const profile = { birthDate: "1990-05-15", birthTime: "08:30", birthCity: "Jakarta", timezone: "Asia/Jakarta", latitude: -6.2, longitude: 106.8 };
const pending = () => ({ ...createPendingHumanDesignChart(""), generatedAt: new Date(now).toISOString(), updatedAt: new Date(now).toISOString() });
const canonical = (): HumanDesignChart => ({
  ...pending(),
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
  calculationStatus: "completed",
  source: "human-design-py",
  calculationQuality: "verified",
  hdEngineVersion: "gaia-hd-v1",
});
let sequence = 0;
function fixture(hd: unknown = { status: "pending" }) {
  const uid = `synthetic-hd-${++sequence}`;
  let stored: Record<string, unknown> = { uid, input: profile, humanDesign: hd, untouched: { value: 7 } };
  let calculations = 0;
  let writes = 0;
  const deps: HdRecoveryDeps = {
    uid, profile, blueprint: stored, nowMs: now,
    read: async () => stored,
    persist: async (_uid, value) => { writes++; stored = value; },
    calculate: async () => { calculations++; return canonical(); },
  };
  return { deps, stored: () => stored, calculations: () => calculations, writes: () => writes };
}

test("fresh pending waits for TTL; expired and timestamp-free pending are eligible", () => {
  assert.equal(isHdRecoveryDue(pending(), now).due, false);
  assert.equal(isHdRecoveryDue(pending(), now).retryAt, now + HD_PENDING_TTL_MS);
  assert.equal(isHdRecoveryDue(pending(), now + HD_PENDING_TTL_MS).due, true);
  assert.equal(isHdRecoveryDue({ status: "pending" }, now).due, true);
  assert.equal(isHdRecoveryDue(null, now).due, true);
});

test("nextRetryAt and lastAttempt are honored", () => {
  assert.equal(isHdRecoveryDue({ ...pending(), nextRetryAt: new Date(now + 100000).toISOString() }, now).retryAt, now + 100000);
  assert.equal(isHdRecoveryDue({ status: "pending", lastAttempt: new Date(now).toISOString() }, now).retryAt, now + HD_PENDING_TTL_MS);
});

test("fresh pending executor does not calculate or write", async () => {
  const f = fixture(pending());
  assert.equal((await recoverHumanDesignIfNeeded(f.deps)).action, "scheduled");
  assert.equal(f.calculations(), 0);
  assert.equal(f.writes(), 0);
});

test("canonical is never recalculated, including authoritative upgrade during stale read", async () => {
  const f = fixture(canonical());
  assert.equal((await recoverHumanDesignIfNeeded(f.deps)).action, "preserved-canonical");
  assert.equal(f.calculations(), 0);
  const g = fixture();
  g.deps.read = async () => ({ ...g.stored(), humanDesign: canonical() });
  assert.equal((await recoverHumanDesignIfNeeded(g.deps)).action, "preserved-canonical");
  assert.equal(g.calculations(), 0);
});

test("success requires one persistence and authoritative reread; unrelated fields survive", async () => {
  const f = fixture();
  const result = await recoverHumanDesignIfNeeded(f.deps);
  assert.equal(result.action, "recovered-canonical");
  assert.equal(result.persisted, true);
  assert.equal(result.blueprint, f.stored());
  assert.equal(f.writes(), 1);
  assert.deepEqual(f.stored().untouched, { value: 7 });
});

test("false persistence, thrown persistence, stale reread and failed reread never claim success", async () => {
  for (const mode of ["false", "throw", "stale", "read-throw"]) {
    const f = fixture();
    let reads = 0;
    const original = f.stored();
    f.deps.read = async () => {
      if (++reads > 1 && mode === "read-throw") throw new Error("synthetic");
      return original;
    };
    f.deps.persist = async () => {
      if (mode === "throw") throw new Error("synthetic");
      return mode === "false" ? false : undefined;
    };
    const result = await recoverHumanDesignIfNeeded(f.deps);
    assert.notEqual(result.action, "recovered-canonical");
    assert.equal(result.retryCount, 1);
    assert.equal(getHdRecoveryDueForUid(f.deps.uid, original.humanDesign, now).due, false);
  }
});

test("thrown calculations and failed persistence exhaust budget even with stale caller data", async () => {
  for (const persistenceFails of [false, true]) {
    const f = fixture();
    let calls = 0;
    f.deps.calculate = async () => { calls++; throw new Error("sensitive error must not escape"); };
    if (persistenceFails) f.deps.persist = async () => { throw new Error("synthetic"); };
    for (let index = 1; index <= HD_RETRY_MAX_ATTEMPTS; index++) {
      f.deps.nowMs = now + index * 7200000;
      const result = await recoverHumanDesignIfNeeded(f.deps);
      assert.equal(result.retryCount, index);
      assert.equal(result.reason.includes("sensitive"), false);
    }
    f.deps.nowMs = now + 100000000;
    assert.equal((await recoverHumanDesignIfNeeded(f.deps)).action, "exhausted");
    assert.equal(calls, HD_RETRY_MAX_ATTEMPTS);
  }
});

test("failed historical upgrade preserves complete historical payload", async () => {
  const historical = { ...canonical(), hdEngineVersion: "legacy", gates: [1, 2], strategy: "Stored strategy" };
  const f = fixture(historical);
  f.deps.calculate = async () => pending();
  await recoverHumanDesignIfNeeded(f.deps);
  const saved = f.stored().humanDesign as HumanDesignChart;
  assert.equal(saved.type, historical.type);
  assert.equal(saved.strategy, historical.strategy);
  assert.deepEqual(saved.gates, historical.gates);
  assert.equal(getHdState(saved).state, "FALLBACK_LABELED");
  assert.equal(selectHumanDesignChart(saved, getHdState(saved)), saved);
});

test("same UID shares in-flight execution; another UID is independent", async () => {
  const f = fixture();
  let release!: (chart: HumanDesignChart) => void;
  f.deps.calculate = () => new Promise(resolve => { release = resolve; });
  const first = recoverHumanDesignIfNeeded(f.deps);
  const second = recoverHumanDesignIfNeeded(f.deps);
  assert.equal(first, second);
  const other = fixture();
  assert.equal((await recoverHumanDesignIfNeeded(other.deps)).action, "recovered-canonical");
  release(canonical());
  await first;
  assert.equal(f.writes(), 1);
});

test("auth switch or unmount during calculation prevents persistence", async () => {
  for (const lifecycle of ["auth-switch", "unmount"]) {
    const f = fixture();
    let active = true;
    f.deps.isActive = () => active;
    f.deps.calculate = async () => { active = false; return canonical(); };
    assert.equal((await recoverHumanDesignIfNeeded(f.deps)).action, "cancelled", lifecycle);
    assert.equal(f.writes(), 0);
  }
});

test("wrong owner and incomplete birth never calculate", async () => {
  const f = fixture();
  f.deps.blueprint = { ...f.deps.blueprint, uid: "other-synthetic" };
  assert.equal((await recoverHumanDesignIfNeeded(f.deps)).action, "cancelled");
  assert.equal(f.calculations(), 0);
  const g = fixture();
  g.deps.profile = {};
  g.deps.read = async () => ({ uid: g.deps.uid, humanDesign: { status: "pending" } });
  assert.equal((await recoverHumanDesignIfNeeded(g.deps)).action, "incomplete-birth");
  assert.equal(g.calculations(), 0);
});

test("open-page timer wakes at schedule and cleanup cancels; exhaustion schedules nothing", context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  const cancel = scheduleHdRecovery("synthetic-timer", pending(), () => calls++, now);
  context.mock.timers.tick(HD_PENDING_TTL_MS - 1);
  assert.equal(calls, 0);
  context.mock.timers.tick(1);
  assert.equal(calls, 1);
  cancel();
  const cleanup = scheduleHdRecovery("synthetic-timer", pending(), () => calls++, now);
  cleanup();
  scheduleHdRecovery("synthetic-exhausted", { retryCount: HD_RETRY_MAX_ATTEMPTS }, () => calls++, now);
  context.mock.timers.tick(7200000);
  assert.equal(calls, 1);
  context.mock.timers.reset();
});
