import assert from "node:assert/strict";
import test from "node:test";
import { characteristicEngine, humanMeaningRuntime, humanMeaningRuntimeCache, knowledgeExtractionEngine, validateHumanMeaningRuntime } from "@/lib/humanMeaningRuntime";
import type { HumanMeaningRuntime, UnifiedBlueprintInput } from "@/lib/humanMeaningRuntime";

const BLUEPRINT: UnifiedBlueprintInput = {
  humanDesign: { type: "Generator" },
  bazi: { dayMaster: { element: "Metal" } },
  natalChart: { moon: { sign: "Pisces" } },
  lifePath: { number: 5 },
};
const NOW = new Date("2026-07-13T12:00:00.000Z");

test("extraction dan characteristic engine berhenti sebelum Human Meaning", () => {
  const extraction = knowledgeExtractionEngine.extract(BLUEPRINT);
  const characteristics = characteristicEngine.derive(extraction.signals);
  assert.deepEqual(new Set(characteristics.map((item) => item.id)), new Set([
    "CHAR_RESPONDS_THROUGH_INTERACTION",
    "CHAR_VALUES_STRUCTURE",
    "CHAR_EMOTIONALLY_PERMEABLE",
    "CHAR_ADAPTS_TO_CHANGING_CONTEXT",
  ]));
  assert.equal("humanMeanings" in extraction, false);
});

test("runtime integration menghasilkan object canonical immutable", () => {
  humanMeaningRuntimeCache.clear();
  const runtime = humanMeaningRuntime.build(BLUEPRINT, { now: NOW });
  assert.equal(runtime.runtimeVersion, "human-meaning-runtime-v1");
  assert.equal(runtime.validation.valid, true);
  assert.ok(runtime.traits.length >= 4);
  assert.ok(runtime.patterns.some((item) => item.id === "SPATTERN_STRUCTURE_SUPPORTS_FREEDOM"));
  assert.ok(runtime.conflicts.some((item) => item.id === "CONFLICT_STRUCTURE_FREEDOM" && item.status === "integrated"));
  assert.ok(runtime.humanMeanings.length > 0);
  assert.ok(runtime.needs.some((item) => item.horizon === "current"));
  assert.ok(runtime.needs.some((item) => item.horizon === "growth"));
  assert.ok(runtime.needs.some((item) => item.horizon === "long-term"));
  assert.ok(runtime.growth.length > 0);
  assert.equal(Object.isFrozen(runtime), true);
  assert.equal(Object.isFrozen(runtime.traits), true);
});

test("stable runtime cache dimiliki runtime dan mengembalikan object yang sama", () => {
  humanMeaningRuntimeCache.clear();
  const first = humanMeaningRuntime.build(BLUEPRINT, { now: NOW });
  const second = humanMeaningRuntime.build(BLUEPRINT, { now: new Date("2026-07-14T12:00:00.000Z") });
  assert.equal(first, second);
  assert.equal(humanMeaningRuntimeCache.size(), 1);
});

test("validator fail-closed untuk missing evidence", () => {
  const runtime = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  const { validation: _validation, ...candidate } = runtime;
  void _validation;
  const invalid = {
    ...candidate,
    traits: [{ ...runtime.traits[0], evidenceIds: [] }, ...runtime.traits.slice(1)],
  } as Omit<HumanMeaningRuntime, "validation">;
  const issues = validateHumanMeaningRuntime(invalid);
  assert.ok(issues.some((issue) => issue.code === "MISSING_EVIDENCE"));
});

test("validator menolak conflict dan confidence yang tidak canonical", () => {
  const runtime = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  const { validation: _validation, ...candidate } = runtime;
  void _validation;
  const invalid = {
    ...candidate,
    traits: [{ ...runtime.traits[0], confidence: "certain" }, ...runtime.traits.slice(1)],
    conflicts: [{
      id: "CONFLICT_INVALID",
      traitIds: [runtime.traits[0].id, "TRAIT_NOT_CANONICAL"],
      status: "integrated",
      synthesisPatternId: "SPATTERN_NOT_CANONICAL",
      evidenceIds: runtime.traits[0].evidenceIds,
    }],
  } as unknown as Omit<HumanMeaningRuntime, "validation">;
  const issues = validateHumanMeaningRuntime(invalid);
  assert.ok(issues.some((issue) => issue.code === "INVALID_CONFIDENCE"));
  assert.ok(issues.some((issue) => issue.code === "INVALID_CONFLICT"));
});

test("consistency menjaga seluruh object pada namespace canonical", () => {
  const runtime = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  assert.ok(runtime.characteristics.every((item) => item.id.startsWith("CHAR_")));
  assert.ok(runtime.traits.every((item) => item.id.startsWith("TRAIT_")));
  assert.ok(runtime.patterns.every((item) => item.id.startsWith("SPATTERN_") || item.id.startsWith("DPATTERN_")));
  assert.ok(runtime.humanMeanings.every((item) => item.id.startsWith("MEANING_")));
  assert.ok(runtime.needs.every((item) => item.id.startsWith("NEED_")));
  assert.ok(runtime.growth.every((item) => item.id.startsWith("GROWTH_")));
});

test("explainability menghubungkan Growth ke Need, Meaning, Pattern, dan Trait", () => {
  const runtime = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  const growth = runtime.growth[0];
  const explanation = runtime.explainability.find((item) => item.objectId === growth.id);
  assert.ok(explanation);
  assert.ok(explanation.chain.some((id) => id.startsWith("NEED_")));
  assert.ok(explanation.chain.some((id) => id.startsWith("MEANING_")));
  assert.ok(explanation.chain.some((id) => id.startsWith("SPATTERN_")));
  assert.ok(explanation.chain.some((id) => id.startsWith("TRAIT_")));
  assert.ok(explanation.evidenceIds.length > 0);
});

test("runtime parity deterministik untuk input, waktu, dan release yang sama", () => {
  const first = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  const second = humanMeaningRuntime.build(BLUEPRINT, { now: NOW, bypassCache: true });
  assert.deepEqual(first, second);
});

test("input tanpa cukup canonical knowledge gagal validasi", () => {
  assert.throws(() => humanMeaningRuntime.build({ humanDesign: {} }, { now: NOW, bypassCache: true }), /MISSING_TRAITS/);
});
