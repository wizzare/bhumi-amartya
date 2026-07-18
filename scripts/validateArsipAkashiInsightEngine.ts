import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildInsightModel } from "../lib/arsipAkashi/synthesis";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

function makeFixture(overrides?: Partial<ArsipAkashiInput>): ArsipAkashiInput {
  const base: ArsipAkashiInput = {
    userId: "test-user-a",
    generatedForDate: "2026-07-17",
    referenceDate: "2026-07-17",
    timezone: "+07:00",
    sourceVersion: "test-fixture-v1",
    blueprintFingerprint: "test-fp-abc123",
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true },
    systems: {},
  };

  const allDomains: ArsipAkashiFactDomain[] = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];

  for (const sys of CANONICAL_SYSTEM_IDS) {
    base.systems[sys] = {
      systemId: sys,
      availability: "available",
      sourceOwner: "test",
      normalizedFacts: allDomains.map((domain): ArsipAkashiNormalizedFact => ({
        factId: `${sys}/${domain}/main`,
        systemId: sys,
        domain,
        label: "main",
        value: `${sys}-${domain}-test-value`,
        sourcePath: `lib/${sys}/test.ts`,
        sourceVersion: "v1",
        interpretationEligibility: true,
        confidence: 1,
        warnings: [],
      })),
      calculationFingerprint: `${sys}-fp-test`,
      calculationVersion: "v1",
      warnings: [],
      generatedAt: "2026-07-17T00:00:00.000Z",
    };
  }

  return { ...base, ...overrides };
}

const fullFixture = makeFixture();

// 1. Basic model
const model = buildInsightModel(fullFixture);
check("insight model created", true, "buildInsightModel returned successfully");
check("model has userId", model.userId === "test-user-a", `Got ${model.userId}`);
check("model has deterministicKey", model.deterministicKey.startsWith("insight-"), `Got ${model.deterministicKey}`);

// 2. Coverage
check("global coverage expectedSystems=11", model.globalCoverage.expectedSystems === 11, `Got ${model.globalCoverage.expectedSystems}`);
check("global coverage ratio=1 for full fixture", model.globalCoverage.coverageRatio === 1, `Got ${model.globalCoverage.coverageRatio}`);

// 3. Sections
check("all 10 standard sections generated", model.sections.length === 10, `Got ${model.sections.length}`);
for (const s of model.sections) {
  check(`section ${s.sectionId} has selectedFacts`, s.selectedFacts.length > 0, `0 facts for ${s.sectionId}`);
  check(`section ${s.sectionId} has primaryThemes`, s.primaryThemes.length > 0, `0 themes for ${s.sectionId}`);
  check(`section ${s.sectionId} has provenance`, s.provenance.length > 0, `No provenance for ${s.sectionId}`);
}

const sectionIds = new Set(model.sections.map((s) => s.sectionId));
check("all section IDs unique", sectionIds.size === model.sections.length, "Duplicate section IDs");

// 4. Soul-letter themes
check("soul-letter themes count", model.soulLetterThemes.length === 10, `Got ${model.soulLetterThemes.length}`);
for (const t of model.soulLetterThemes) {
  check(`soul theme ${t.themeId} has systems`, t.contributingSystems.length > 0, `0 systems for ${t.themeId}`);
  check(`soul theme ${t.themeId} has coverage`, t.coverageStatus !== undefined, `No coverage for ${t.themeId}`);
}

// 5. No final prose
for (const s of model.sections) {
  check(`no final prose in ${s.sectionId}.emotionalMeaning`, s.emotionalMeaning === "", `Expected empty, got "${s.emotionalMeaning.slice(0, 20)}"`);
  check(`no final prose in ${s.sectionId}.practicalDirection`, s.practicalDirection === "", `Expected empty, got "${s.practicalDirection.slice(0, 20)}"`);
}

// 6. Determinism
const model2 = buildInsightModel(fullFixture);
check("deterministic key match", model.deterministicKey === model2.deterministicKey, "Keys differ");
check("deterministic section count", model.sections.length === model2.sections.length, "Section count differs");
for (let i = 0; i < model.sections.length; i++) {
  check(`deterministic section ${i} fact count`,
    model.sections[i].selectedFacts.length === model2.sections[i].selectedFacts.length,
    `Fact count differs for section ${model.sections[i].sectionId}`);
  check(`deterministic section ${i} primary theme count`,
    model.sections[i].primaryThemes.length === model2.sections[i].primaryThemes.length,
    `Primary theme count differs for section ${model.sections[i].sectionId}`);
}

// 7. Cross-user differentiation
const userBFixture = makeFixture({ userId: "test-user-b", blueprintFingerprint: "test-fp-xyz789" });
for (const sys of CANONICAL_SYSTEM_IDS) {
  userBFixture.systems[sys]!.normalizedFacts[0]!.value = `value-${sys}-user-b`;
}
const modelB = buildInsightModel(userBFixture);
check("cross-user deterministic keys differ", model.deterministicKey !== modelB.deterministicKey, "Cross-user keys should differ");

// 8. Missing-system fixture
const missingFixture = makeFixture();
delete missingFixture.systems["weton"];
delete missingFixture.systems["bazi"];
delete missingFixture.systems["zi-wei-dou-shu"];
const missingModel = buildInsightModel(missingFixture);
check("missing systems reduces coverage", missingModel.globalCoverage.coverageRatio < 1, `Ratio ${missingModel.globalCoverage.coverageRatio} should be <1`);
check("missing systems recorded", missingModel.globalCoverage.unavailableSystems.length > 0, "No unavailable systems recorded");

// 9. Missing birth-time fixture
const partialBirthFixture = makeFixture({
  birthDataAvailability: { time: "missing", birthplace: true, timezone: true },
});
for (const sys of ["vedic-astrology", "whole-sign", "astrocartography", "zi-wei-dou-shu"] as const) {
  if (partialBirthFixture.systems[sys]) {
    partialBirthFixture.systems[sys]!.availability = "birth-time-required";
    partialBirthFixture.systems[sys]!.normalizedFacts = [];
    partialBirthFixture.systems[sys]!.warnings = ["Birth time required"];
  }
}
const partialModel = buildInsightModel(partialBirthFixture);
check("partial birth-time reduces coverage", partialModel.globalCoverage.coverageRatio < 1, `Ratio ${partialModel.globalCoverage.coverageRatio} should be <1`);

// 10. Input immutability
const preInputFingerprint = fullFixture.blueprintFingerprint;
buildInsightModel(fullFixture);
check("input not mutated", fullFixture.blueprintFingerprint === preInputFingerprint, "Input fingerprint changed");

// 11. No Founder data
const founderSamples = ["wizzare", "widhi", "wedhaswara"];
const allText = model.sections.flatMap((s) => s.selectedFacts.map((f) => f.value.toLowerCase())).join(" ");
for (const pattern of founderSamples) {
  check(`no Founder data [${pattern}]`, !allText.includes(pattern), `Founder pattern "${pattern}" found`);
}

// 12. No soul-letters section in standard sections (handled separately)
check("soul-letters not in standard sections",
  !model.sections.some((s) => s.sectionId === "soul-letters"),
  "soul-letters should not appear in standard sections");

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI INSIGHT ENGINE VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
