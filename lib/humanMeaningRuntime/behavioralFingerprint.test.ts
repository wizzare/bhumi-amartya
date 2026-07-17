import assert from "node:assert/strict";
import test from "node:test";
import {
  executeHumanMeaningRuntime,
  humanMeaningRuntime,
  humanMeaningRuntimeCache,
  HUMAN_MEANING_VERSIONS,
  validateHumanMeaningRuntime,
} from "@/lib/humanMeaningRuntime";
import {
  buildR1ABehavioralFingerprintReport,
  CONFLICTING_PATTERN_FIXTURE,
  FULL_EIGHT_SYSTEM_FIXTURE,
  MULTI_SYSTEM_PARTIAL_FIXTURE,
  R1A_FIXTURE_TIME,
} from "@/lib/humanMeaningRuntime/behavioralFixtures";
import { stableSerialize } from "@/lib/humanMeaningRuntime/runtimeUtils";
import type { HumanMeaningRuntime } from "@/lib/humanMeaningRuntime/types";

test("identical canonical input produces deterministic output and fingerprints", () => {
  const first = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const second = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.deepEqual(first, second);
  assert.equal(first.inputFingerprint, second.inputFingerprint);
  assert.equal(first.outputFingerprint, second.outputFingerprint);
  assert.equal(first.provenanceFingerprint, second.provenanceFingerprint);
});

test("object key order and volatile execution time do not alter deterministic identity", () => {
  const reordered = { numerology: { lifePath: 5 }, bazi: { dayMaster: { element: "Metal" } }, humanDesign: { authority: "Emotional", type: "Generator" }, natalChart: { mercury: { sign: "Virgo" }, moon: { sign: "Pisces" } }, tzolkin: { kin: 42 }, weton: { day: "Jumat Kliwon" }, vedic: { moonSign: "Cancer" }, destinyMatrix: { center: 7 } };
  const first = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const second = humanMeaningRuntime.build(reordered, { now: new Date("2026-07-14T00:00:00.000Z"), bypassCache: true });
  assert.equal(first.inputFingerprint, second.inputFingerprint);
  assert.equal(first.outputFingerprint, second.outputFingerprint);
  assert.notEqual(first.generatedAt, second.generatedAt);
});

test("complete and supported partial Blueprint inputs validate", () => {
  assert.equal(executeHumanMeaningRuntime(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true }).ok, true);
  assert.equal(executeHumanMeaningRuntime(MULTI_SYSTEM_PARTIAL_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true }).ok, true);
});

test("invalid and missing input return predictable failures", () => {
  const invalid = executeHumanMeaningRuntime("invalid");
  const malformedSystem = executeHumanMeaningRuntime({ humanDesign: new Date() });
  const missing = executeHumanMeaningRuntime({});
  assert.equal(invalid.ok, false);
  assert.equal(malformedSystem.ok, false);
  assert.equal(missing.ok, false);
  if (!invalid.ok) assert.equal(invalid.error.code, "INVALID_INPUT");
  if (!missing.ok) assert.ok(missing.error.issues.some((issue) => issue.code === "MISSING_REQUIRED_SYSTEM_DATA"));
});

test("single unsupported knowledge state fails without fabricating values", () => {
  const result = executeHumanMeaningRuntime({ humanDesign: { type: "Generator" } }, { bypassCache: true });
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.error.issues.some((issue) => issue.code === "MISSING_PATTERNS"));
});

test("conflicting traits are resolved through recovered canonical patterns", () => {
  const result = humanMeaningRuntime.build(CONFLICTING_PATTERN_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.ok(result.conflicts.some((item) => item.id === "CONFLICT_ACTION_REFLECTION" && item.status === "sequenced"));
});

test("provenance lineage and fingerprints validate", () => {
  const runtime = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const { validation: _validation, ...candidate } = runtime;
  void _validation;
  assert.deepEqual(validateHumanMeaningRuntime(candidate), []);
  assert.equal(runtime.provenance.fingerprint, runtime.provenanceFingerprint);
  assert.ok(runtime.provenance.lineage.includes("knowledge-extraction"));
});

test("cache supports miss, hit, scoped isolation, and version-aware invalidation", () => {
  humanMeaningRuntimeCache.clear();
  const probe = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const keyA = humanMeaningRuntimeCache.createKey(probe.inputFingerprint, HUMAN_MEANING_VERSIONS, "user-a");
  const keyB = humanMeaningRuntimeCache.createKey(probe.inputFingerprint, HUMAN_MEANING_VERSIONS, "user-b");
  const changedVersionKey = humanMeaningRuntimeCache.createKey(probe.inputFingerprint, { ...HUMAN_MEANING_VERSIONS, knowledgeVersion: "human-meaning-knowledge-v2" }, "user-a");
  assert.equal(humanMeaningRuntimeCache.get(keyA), null);
  const first = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, cacheScope: "user-a" });
  const second = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: new Date(), cacheScope: "user-a" });
  assert.equal(first, second);
  assert.equal(humanMeaningRuntimeCache.has(keyA), true);
  assert.notEqual(keyA, keyB);
  assert.notEqual(keyA, changedVersionKey);
  assert.equal(humanMeaningRuntimeCache.has(changedVersionKey), false);
});

test("user metadata does not leak into shared knowledge fingerprints", () => {
  const base = { humanDesign: { type: "Generator" }, bazi: { dayMaster: { element: "Metal" } }, lifePath: { number: 5 } };
  const a = humanMeaningRuntime.build({ ...base, userId: "user-a" }, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const b = humanMeaningRuntime.build({ ...base, userId: "user-b" }, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.equal(a.inputFingerprint, b.inputFingerprint);
  assert.equal(a.outputFingerprint, b.outputFingerprint);
});

test("distinct Blueprint inputs do not collide in canonical fixtures", () => {
  const a = humanMeaningRuntime.build(MULTI_SYSTEM_PARTIAL_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const b = humanMeaningRuntime.build(CONFLICTING_PATTERN_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.notEqual(a.inputFingerprint, b.inputFingerprint);
  assert.notEqual(a.outputFingerprint, b.outputFingerprint);
});

test("runtime, nested output, public result, and serialization are immutable and stable", () => {
  const result = executeHumanMeaningRuntime(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.equal(result.ok, true);
  assert.equal(Object.isFrozen(result), true);
  if (result.ok) {
    assert.equal(Object.isFrozen(result.output), true);
    assert.equal(Object.isFrozen(result.output.provenance), true);
    assert.equal(stableSerialize({ b: 2, a: 1 }), stableSerialize({ a: 1, b: 2 }));
  }
});

test("validator rejects malformed version, provenance, and output fingerprints", () => {
  const runtime = humanMeaningRuntime.build(FULL_EIGHT_SYSTEM_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const { validation: _validation, ...candidate } = runtime;
  void _validation;
  const invalid = { ...candidate, behaviorVersion: "invalid", outputFingerprint: "hmr-00000000" } as unknown as Omit<HumanMeaningRuntime, "validation">;
  const issues = validateHumanMeaningRuntime(invalid);
  assert.ok(issues.some((issue) => issue.code === "INVALID_VERSION_METADATA"));
  assert.ok(issues.some((issue) => issue.code === "INVALID_OUTPUT_FINGERPRINT"));
});

test("legacy build interface remains compatible and repeated execution is idempotent", () => {
  const first: HumanMeaningRuntime = humanMeaningRuntime.build(MULTI_SYSTEM_PARTIAL_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  const second: HumanMeaningRuntime = humanMeaningRuntime.build(MULTI_SYSTEM_PARTIAL_FIXTURE, { now: R1A_FIXTURE_TIME, bypassCache: true });
  assert.deepEqual(first, second);
});

test("behavioral fingerprint matrix reruns deterministically", () => {
  const report = buildR1ABehavioralFingerprintReport();
  assert.ok(report.length >= 7);
  assert.ok(report.every((item) => item.deterministicRerun));
});
