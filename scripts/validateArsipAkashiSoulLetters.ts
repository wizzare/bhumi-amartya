import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildInsightModel, renderSoulLetters } from "../lib/arsipAkashi/synthesis";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

function sentenceCount(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length >= 6).length;
}

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
  const allDomains: ArsipAkashiFactDomain[] = domainFilter ?? ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];
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

const fixtureA = makeFixture();
const fixtureB = makeFixture({ userId: "test-user-b", blueprintFingerprint: "test-fp-xyz789" });
for (const sys of CANONICAL_SYSTEM_IDS) {
  fixtureB.systems[sys]!.normalizedFacts[0]!.value = `different-${sys}-user-b`;
}
const fixtureLow = makeFixture(undefined, ["identity", "shadow", "growth"]);
const fixtureZero = makeFixture(undefined, []);
const fixtureTiming = makeFixture(undefined, ["timing", "identity", "growth"]);
const fixtureSymbolic = makeFixture(undefined, ["karma", "spirituality", "identity"]);

const modelA = buildInsightModel(fixtureA);
const lettersA = renderSoulLetters(modelA);
const modelB = buildInsightModel(fixtureB);
const lettersB = renderSoulLetters(modelB);
const lettersLow = renderSoulLetters(buildInsightModel(fixtureLow));
const lettersZero = renderSoulLetters(buildInsightModel(fixtureZero));
const lettersTiming = renderSoulLetters(buildInsightModel(fixtureTiming));
const lettersSymbolic = renderSoulLetters(buildInsightModel(fixtureSymbolic));

check("exactly three letters render", lettersA.length === 3, `Got ${lettersA.length}`);
check("canonical letter IDs present",
  lettersA[0]?.letterId === "letter-to-past-self" &&
    lettersA[1]?.letterId === "letter-to-present-self" &&
    lettersA[2]?.letterId === "letter-from-future-self",
  `Got ${lettersA.map(l => l.letterId).join(", ")}`);

for (const letter of lettersA) {
  check(`${letter.letterId} has exactly 5 paragraphs`, letter.paragraphs.length === 5, `Got ${letter.paragraphs.length}`);
  for (const p of letter.paragraphs) {
    const sc = sentenceCount(p);
    check(`${letter.letterId} paragraph has exactly 5 sentences`, sc === 5, `Got ${sc} for: ${p}`);
    check(`${letter.letterId} paragraph has >=20 words`, p.trim().split(/\s+/).length >= 20, `Too short: ${p}`);
  }
  const normalized = letter.paragraphs.map((p) => p.toLowerCase().trim());
  check(`${letter.letterId} no duplicate paragraphs`, new Set(normalized).size === normalized.length, "Duplicate paragraph");
  const sentences = letter.paragraphs.flatMap((p) => p.split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean));
  check(`${letter.letterId} no repeated sentences`, new Set(sentences).size === sentences.length, "Repeated sentence");
}

const pastSentences = new Set(lettersA[0].paragraphs.flatMap((p) => p.split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean)));
const futureSentences = new Set(lettersA[2].paragraphs.flatMap((p) => p.split(/(?<=[.!?])\s+/).map((s) => s.trim().toLowerCase()).filter(Boolean)));
let shared = 0;
for (const s of pastSentences) if (futureSentences.has(s)) shared++;
check("no identical sentence between past and future letters", shared === 0, `Shared sentence count: ${shared}`);

check("past-self voice contains temporal self-address", lettersA[0].title.includes("Masa Lalu"), lettersA[0].title);
check("present-self voice contains temporal self-address", lettersA[1].title.includes("Masa Sekarang"), lettersA[1].title);
check("future-self voice contains temporal self-address", lettersA[2].title.includes("Masa Depan"), lettersA[2].title);
check("present letter has a current-phase plan", !!lettersA[1].presentPlan, "Present plan missing");
check("present letter records a reference date", lettersA[1].presentPlan?.referenceDate === fixtureA.referenceDate, "Reference date mismatch");
check("present letter includes timing provenance", (lettersA[1].presentPlan?.contributingFactIds.length ?? 0) > 0, "Present provenance missing");
check("present letter contributes astrology context", lettersA[1].presentPlan?.contributingSystems.includes("natal-chart") === true, "Natal context missing");

check("cross-user letters differ materially",
  JSON.stringify(lettersA.map((l) => l.paragraphs)) !== JSON.stringify(lettersB.map((l) => l.paragraphs)),
  "Letters identical across materially different users");

const changedParagraphs = lettersA.flatMap((l, i) => l.paragraphs.filter((p, idx) => p !== lettersB[i].paragraphs[idx]));
check("at least three paragraphs differ semantically", changedParagraphs.length >= 3, `Only ${changedParagraphs.length} differ`);

const systemNames = ["human design", "bazi", "zi wei", "whole sign", "natal chart", "destiny matrix", "tzolkin", "astrocartography", "weton", "vedic", "numerology"];
const allText = lettersA.flatMap((l) => l.paragraphs).join(" ").toLowerCase();
check("no ellipsis remains in letter prose", !allText.includes("..."), "Ellipsis found");
check("contrast conjunctions use a preceding comma",
  !/(^|[^,;])\s+(tetapi|melainkan|sedangkan)\s+/i.test(allText),
  "Missing comma before contrast conjunction");
check("common introductory phrases use a trailing comma",
  !/(^|[.!?]\s+)(meski begitu|saat itu|hari ini|perlahan|pelan-pelan|suatu saat|di suatu titik|pada suatu titik|seiring waktu|karena itu|dari situlah)\s+/i.test(allText),
  "Missing comma after introductory phrase");
for (const name of systemNames) {
  check(`no system label ${name}`, !allText.includes(name), `Found ${name}`);
}

const machinePatterns = [/factId/i, /sourceVersion/i, /blueprintFingerprint/i, /berdasarkan data di atas/i, /sistem mendeteksi/i, /sebagai ai/i];
for (const pattern of machinePatterns) {
  check(`no machine residue ${pattern}`, !pattern.test(allText), `Found machine residue ${pattern}`);
}

check("symbolic theme remains symbolic", !lettersSymbolic.flatMap(l => l.paragraphs).join(" ").toLowerCase().includes("berasal dari peradaban"), "Literal origin claim found");
check("future letter avoids prophecy certainty", !lettersA[2].paragraphs.join(" ").toLowerCase().includes("pasti akan"), "Prophecy certainty found");
check("three letters use distinct openings", new Set(lettersA.map((letter) => letter.paragraphs[0])).size === 3, "Opening paragraph reused");
check("three letters use distinct closings", new Set(lettersA.map((letter) => letter.paragraphs[letter.paragraphs.length - 1])).size === 3, "Closing paragraph reused");
const laterPresent = renderSoulLetters(buildInsightModel(makeFixture({ referenceDate: "2026-07-19" })))[1];
check("changing reference date changes present letter", JSON.stringify(lettersA[1].paragraphs) !== JSON.stringify(laterPresent.paragraphs), "Present letter ignored reference date");
check("low coverage degrades safely", lettersLow.every((l) => l.paragraphs.length === 5), "Low coverage should produce 5 paragraphs");
check("zero fact does not fabricate", lettersZero.every((l) => l.sourceSystemIds.length === 0 || l.supportingFactIds.length === 0), "Zero-fact letters fabricated provenance");

const rerun = renderSoulLetters(buildInsightModel(fixtureA));
check("deterministic rerun", JSON.stringify(lettersA) === JSON.stringify(rerun), "Rerun differs");
check("input immutability", fixtureA.blueprintFingerprint === "test-fp-abc123", "Fixture mutated");

const founderPatterns = ["wizzare", "widhi", "wedhaswara"];
for (const pattern of founderPatterns) {
  check(`no Founder leakage ${pattern}`, !allText.includes(pattern), `Found ${pattern}`);
}

const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI SOUL LETTERS VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
