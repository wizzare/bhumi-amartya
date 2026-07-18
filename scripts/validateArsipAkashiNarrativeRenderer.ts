import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { ARSIP_AKASHI_SECTION_IDS } from "../lib/arsipAkashi/contracts";
import { buildInsightModel, renderNarratives } from "../lib/arsipAkashi/synthesis";
import { sanitizeNarrative } from "../lib/arsipAkashi/synthesis";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length >= 6).length;
}

const allDomains: ArsipAkashiFactDomain[] = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];

function makeFixture(overrides?: Partial<ArsipAkashiInput>, domainFilter?: ArsipAkashiFactDomain[]): ArsipAkashiInput {
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
  const domains = domainFilter ?? allDomains;
  for (const sys of CANONICAL_SYSTEM_IDS) {
    base.systems[sys] = {
      systemId: sys,
      availability: "available",
      sourceOwner: "test",
      normalizedFacts: domains.map((domain): ArsipAkashiNormalizedFact => ({
        factId: `${sys}/${domain}/main`,
        systemId: sys,
        domain,
        label: "main",
        value: `${sys}-${domain}-test`,
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

const fullA = makeFixture();
const modelA = buildInsightModel(fullA);
const sectionsA = renderNarratives(modelA);

const userBFixture = makeFixture({ userId: "test-user-b", blueprintFingerprint: "test-fp-xyz789" });
for (const sys of CANONICAL_SYSTEM_IDS) {
  userBFixture.systems[sys]!.normalizedFacts[0]!.value = `user-b-value-${sys}`;
}
const modelB = buildInsightModel(userBFixture);
const sectionsB = renderNarratives(modelB);

// 1. All standard sections render
check("all 10 standard sections rendered", sectionsA.length === 10, `Got ${sectionsA.length}`);
for (const section of sectionsA) {
  check(`soul-letters not rendered as standard section`, section.sectionId !== "soul-letters", "soul-letters found");
}

// 2. Sentence count
for (const section of sectionsA) {
  for (const block of section.narrativeBlocks) {
    const count = sentenceCount(block.text);
    check(`card ${section.sectionId} has 4-5 sentences (${count})`, count >= 4 && count <= 5, `Got ${count} sentences`);
  }
}

// 3. No duplicate sentences within card
for (const section of sectionsA) {
  const sentences = section.narrativeBlocks[0]?.text.split(/(?<=[.!?])\s+/) ?? [];
  const unique = new Set(sentences);
  check(`no duplicate sentences in ${section.sectionId}`, unique.size === sentences.length, `Duplicates in ${section.sectionId}`);
}

// 4. No raw system labels
const allText = sectionsA.map((s) => s.narrativeBlocks.map((b) => b.text).join(" ")).join(" ");
const systemNames = ["human design", "bazi", "zi wei", "whole sign", "natal chart", "destiny matrix", "tzolkin", "astrocartography", "weton", "vedic", "numerology"];
for (const name of systemNames) {
  check(`no system label "${name}" in prose`, !allText.toLowerCase().includes(name), `Found "${name}"`);
}

// 5. No machine-language residue
const machinePatterns = [/factId/, /blueprintFingerprint/, /berdasarkan data di atas/i, /sistem mendeteksi/i, /input menunjukkan/i];
for (const pat of machinePatterns) {
  check(`no machine residue [${pat}]`, !pat.test(allText), `Found pattern ${pat}`);
}

// 6. Sanitizer
const sanitized = sanitizeNarrative("test camelCase dan snake_case dan fakta: berdasarkan data di atas");
check("sanitizer reports issues for machine language", sanitized.issues.length > 0, `Got ${sanitized.issues.length} issues`);
const clean = sanitizeNarrative("test clean narrative.");
check("sanitizer accepts clean text", clean.issues.length === 0, `Got ${clean.issues.length} issues`);

// 7. Determinism
const sectionsA2 = renderNarratives(modelA);
check("deterministic sentence count", sectionsA.length === sectionsA2.length, "Section count differs");
for (let i = 0; i < sectionsA.length; i++) {
  check(`deterministic card ${i} text`, sectionsA[i].narrativeBlocks[0]?.text === sectionsA2[i].narrativeBlocks[0]?.text, `Card ${i} text differs on rerun`);
}

// 8. Cross-user differentiation
let anyDifferent = false;
for (let i = 0; i < sectionsA.length; i++) {
  const a = sectionsA[i].narrativeBlocks[0]?.text ?? "";
  const b = sectionsB[i]?.narrativeBlocks[0]?.text ?? "";
  if (a !== b) anyDifferent = true;
}
check("cross-user texts differ", anyDifferent, "All cards produce identical text across users");

// 9. Low-coverage
const lowCovFixture = makeFixture(undefined, ["identity"]);
const lowCovModel = buildInsightModel(lowCovFixture);
const lowCovSections = renderNarratives(lowCovModel);
check("low-coverage sections still render", lowCovSections.length === 10, `Got ${lowCovSections.length}`);

// 10. Provenance preserved
for (const section of sectionsA) {
  check(`provenance preserved in ${section.sectionId}`, section.supportingFactIds.length > 0, `No provenance for ${section.sectionId}`);
}

// 11. No Founder data
const founderPatterns = ["wizzare", "widhi", "wedhaswara"];
for (const pattern of founderPatterns) {
  check(`no Founder data [${pattern}]`, !allText.toLowerCase().includes(pattern), `Found "${pattern}"`);
}

// 12. No Surat Jiwa emission
check("no Surat Jiwa content in standard renderer",
  !sectionsA.some((s) => s.sectionId === "soul-letters" || s.title.toLowerCase().includes("surat")),
  "Surat Jiwa content found in standard renderer");

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI NARRATIVE RENDERER VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
