import assert from "node:assert/strict";
import { normalizeArsipFactValue } from "@/lib/arsipAkashi/factValue";
import { buildArsipAkashiInputFromProfile } from "@/lib/arsipAkashi/profile/inputBuilder";
import { buildInsightModel } from "@/lib/arsipAkashi/synthesis/insightEngine";
import { renderSoulLetters } from "@/lib/arsipAkashi/synthesis/soulLetterRenderer";

assert.equal(normalizeArsipFactValue(42), "42");
assert.equal(normalizeArsipFactValue(false), "false");
assert.equal(normalizeArsipFactValue({ unexpected: true }), "unknown");
assert.equal(normalizeArsipFactValue(["unexpected"]), "unknown");
assert.equal(normalizeArsipFactValue(null), "unknown");

const input = buildArsipAkashiInputFromProfile(
  { uid: "synthetic-arsip-fact-guard", timezone: "Asia/Jakarta", birthDate: "1990-01-01", birthTime: "12:00" },
  {
    numerology: { lifePathNumber: 7, expression: 42 },
    humanDesign: { type: { unexpected: true }, authority: ["emotional"], strategy: null, profile: undefined },
    astrology: { sun: { sign: { unexpected: true } }, moon: { sign: 12 }, ascendant: { sign: ["array"] } },
    destinyMatrix: { energyType: false },
  } as any,
);

const normalizedValues = Object.values(input.systems)
  .flatMap((system) => system?.normalizedFacts ?? [])
  .map((fact) => fact.value);
assert(normalizedValues.every((value) => typeof value === "string"), "input boundary must normalize every fact value to text");

const model = buildInsightModel(input);
const mutableFacts = model.sections.flatMap((section) => section.selectedFacts) as Array<{ value: unknown }>;
assert(mutableFacts.length >= 5, "fixture must provide enough selected facts for every malformed runtime type");
for (const [index, value] of [42, { unexpected: true }, ["array"], null, undefined].entries()) {
  mutableFacts[index].value = value;
}

assert.doesNotThrow(() => renderSoulLetters(model), "legacy malformed selectedFacts values must not crash soul-letter rendering");
assert.equal(renderSoulLetters(model).length, 3, "all soul letters still render");

console.log("PASS arsip-soul-letter-value-guard (9 assertions)");
