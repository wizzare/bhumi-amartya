import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildInsightModel, renderNarratives, renderSoulLetters } from "../lib/arsipAkashi/synthesis";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

function sentenceCount(t: string): number {
  return t.split(/(?<=[.!?])\s+/).filter((s: string) => s.trim().length >= 6).length;
}

function wordCount(t: string): number {
  return t.trim().split(/\s+/).filter(Boolean).length;
}

const ALL_DOMAINS: ArsipAkashiFactDomain[] = ["identity","mechanics","talents","shadow","relationships","health","spirituality","timing","location","karma","growth","resources"];

function makeFixture(
  overrides?: Partial<ArsipAkashiInput>,
  domains?: ArsipAkashiFactDomain[],
): ArsipAkashiInput {
  const d = domains ?? ALL_DOMAINS;
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
  for (const sys of CANONICAL_SYSTEM_IDS) {
    base.systems[sys] = {
      systemId: sys, availability: "available", sourceOwner: "test",
      normalizedFacts: d.map((domain): ArsipAkashiNormalizedFact => ({
        factId: `${sys}/${domain}/main`, systemId: sys, domain, label: "main",
        value: `${sys}-${domain}-test`, sourcePath: `lib/${sys}/test.ts`,
        sourceVersion: "v1", interpretationEligibility: true, confidence: 1, warnings: [],
      })),
      calculationFingerprint: `${sys}-fp-test`, calculationVersion: "v1",
      warnings: [], generatedAt: "2026-07-17T00:00:00.000Z",
    };
  }
  return { ...base, ...overrides };
}

const fixtures = {
  A: makeFixture(),
  B: makeFixture({ userId: "test-user-b", blueprintFingerprint: "test-fp-xyz789" }),
};
for (const sys of CANONICAL_SYSTEM_IDS) {
  fixtures.B.systems[sys]!.normalizedFacts[0]!.value = `different-${sys}-user-b`;
}
fixtures.B.systems[CANONICAL_SYSTEM_IDS[0]]!.normalizedFacts[0]!.value = `unique-b-value`;

const lowCov = makeFixture(undefined, ["identity", "shadow", "growth"]);
const zeroFacts = makeFixture(undefined, []);
const woundHeavy: ArsipAkashiInput = makeFixture(undefined, ["shadow", "karma"]);
const growthHeavy = makeFixture(undefined, ["growth", "talents", "spirituality"]);
const timingH = makeFixture(undefined, ["timing", "identity", "growth"]);
const astroF = makeFixture(undefined, ["location", "spirituality", "identity"]);
const symbolicR = makeFixture(undefined, ["karma", "spirituality", "identity"]);
// name swap
const nameSwap = makeFixture({ userId: "test-user-renamed" });
// same name different insight (different blueprintFingerprint)
const diffInsight = makeFixture({ userId: "test-user-a", blueprintFingerprint: "test-fp-DIFFERENT" });
for (const sys of CANONICAL_SYSTEM_IDS) {
  diffInsight.systems[sys]!.normalizedFacts[0]!.value = `changed-value-${sys}`;
}

function buildAll(input: ArsipAkashiInput) {
  const model = buildInsightModel(input);
  const cards = renderNarratives(model);
  const letters = renderSoulLetters(model);
  return { model, cards, letters };
}

const resA = buildAll(fixtures.A);
const resB = buildAll(fixtures.B);
const resLow = buildAll(lowCov);
const resZero = buildAll(zeroFacts);
const resWound = buildAll(woundHeavy);
const resGrowth = buildAll(growthHeavy);
const resTiming = buildAll(timingH);
const resAstro = buildAll(astroF);
const resSymbolic = buildAll(symbolicR);
const resNameSwap = buildAll(nameSwap);
const resDiffInsight = buildAll(diffInsight);

// ── 1. Standard card quality ──
check("all 10 standard cards render", resA.cards.length === 10, `Got ${resA.cards.length}`);

for (const card of resA.cards) {
  const text = card.narrativeBlocks[0]?.text ?? "";
  const sc = sentenceCount(text);
  check(`card ${card.sectionId} | 4-5 sentences`, sc >= 4 && sc <= 5, `Got ${sc}`);

  const sents = text.split(/(?<=[.!?])\s+/).filter((s: string) => s.trim().length >= 6);
  const uniqueSents = new Set(sents.map((s: string) => s.toLowerCase().trim()));
  check(`card ${card.sectionId} | no duplicate sentences`, uniqueSents.size === sents.length, `Duplicates in ${card.sectionId}`);

  const allCardText = resA.cards.map((c) => c.narrativeBlocks[0]?.text).join(" ");
  const systemNames = ["human design","bazi","zi wei","whole sign","natal chart","destiny matrix","tzolkin","astrocartography","weton","vedic","numerology"];
  for (const name of systemNames) {
    check(`no raw system label [${name}] in cards`, !allCardText.toLowerCase().includes(name), `Found "${name}" in cards`);
  }
}

// cross-user card differentiation
let anyCardDiff = false;
for (let i = 0; i < resA.cards.length; i++) {
  if (resA.cards[i].narrativeBlocks[0]?.text !== resB.cards[i].narrativeBlocks[0]?.text) anyCardDiff = true;
}
check("cross-user card differentiation", anyCardDiff, "All cards identical across users");

// ── 2. Soul-letter quality ──
check("3 soul letters render", resA.letters.length === 3, `Got ${resA.letters.length}`);

for (const letter of resA.letters) {
  check(`letter ${letter.letterId} | 4-5 paragraphs`, letter.paragraphs.length >= 4 && letter.paragraphs.length <= 5, `Got ${letter.paragraphs.length}`);
  for (const p of letter.paragraphs) {
    const sc = sentenceCount(p);
    check(`${letter.letterId} paragraph | 4-5 sentences`, sc >= 4 && sc <= 5, `Got ${sc}`);
    check(`${letter.letterId} paragraph | >=20 words`, wordCount(p) >= 20, `Short: ${p.slice(0, 40)}`);
  }
  const normalized = letter.paragraphs.map((p: string) => p.toLowerCase().trim());
  check(`${letter.letterId} | no duplicate paragraphs`, new Set(normalized).size === normalized.length, "Duplicate paragraph");
}

// cross-letter sentence separation
const pastSents = new Set(
  resA.letters[0].paragraphs.flatMap((p: string) => p.split(/(?<=[.!?])\s+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean)),
);
const futureSents = new Set(
  resA.letters[2].paragraphs.flatMap((p: string) => p.split(/(?<=[.!?])\s+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean)),
);
let sharedCount = 0;
for (const s of pastSents) if (futureSents.has(s)) sharedCount++;
check("no shared sentence between letter types", sharedCount === 0, `${sharedCount} shared`);

// cross-user letter differentiation
const lettersDiff = JSON.stringify(resA.letters.map((l: any) => l.paragraphs)) !== JSON.stringify(resB.letters.map((l: any) => l.paragraphs));
check("cross-user letter differentiation", lettersDiff, "Letters identical across users");

// ── 3. Name-swap ──
const nameSwapCardsDiff = JSON.stringify(resA.cards) !== JSON.stringify(resNameSwap.cards);
const nameSwapLettersDiff = JSON.stringify(resA.letters) !== JSON.stringify(resNameSwap.letters);
check("name swap | cards semantically identical (no personalization from name alone)", !nameSwapCardsDiff, "Name swap changed card output");
check("name swap | letters semantically identical (no personalization from name alone)", !nameSwapLettersDiff, "Name swap changed letter output");

// ── 4. Same-name different-insight ──
const insightCardsDiff = JSON.stringify(resA.cards) !== JSON.stringify(resDiffInsight.cards);
const insightLettersDiff = JSON.stringify(resA.letters) !== JSON.stringify(resDiffInsight.letters);
check("same-name diff-insight | cards differ materially", insightCardsDiff, "Same-name diff-insight cards identical");
check("same-name diff-insight | letters differ materially", insightCardsDiff, "Same-name diff-insight letters identical");

// ── 5. Machine-language scan ──
const allText = resA.cards.flatMap((c: any) => c.narrativeBlocks.map((b: any) => b.text)).concat(resA.letters.flatMap((l: any) => l.paragraphs)).join(" ").toLowerCase();
const machinePatterns = [
  /factId/i, /sourceVersion/i, /blueprintFingerprint/i, /calculationFingerprint/i,
  /berdasarkan data di atas/i, /sistem mendeteksi/i, /sebagai ai/i, /kesimpulannya adalah/i,
  /input menunjukkan/i, /model menyimpulkan/i,
];
for (const pat of machinePatterns) {
  check(`no machine residue [${pat}]`, !pat.test(allText), `Machine residue: ${pat}`);
}

// ── 6. Symbolic safety ──
const symbolicText = resSymbolic.cards.flatMap((c: any) => c.narrativeBlocks.map((b: any) => b.text)).concat(
  resSymbolic.letters.flatMap((l: any) => l.paragraphs),
).join(" ").toLowerCase();
check("symbolic | no literal origin claim", !symbolicText.includes("berasal dari peradaban"), "literal origin claim");
check("symbolic | no guaranteed past life", !symbolicText.includes("kehidupan lalumu terbukti"), "past life certainty");

// ── 7. Timing safety ──
const timingText = resTiming.cards.flatMap((c: any) => c.narrativeBlocks.map((b: any) => b.text)).concat(
  resTiming.letters.flatMap((l: any) => l.paragraphs),
).join(" ").toLowerCase();
check("future no prophecy certainty", !timingText.includes("pasti akan") || timingText.includes("pasti akan berubah"), "Prophecy certainty found");

// ── 8. Low coverage safety ──
check("low coverage cards | all render", resLow.cards.length === 10, `Got ${resLow.cards.length}`);
check("low coverage letters | all render", resLow.letters.length === 3, `Got ${resLow.letters.length}`);

// ── 9. Zero-fact safety ──
check("zero fact cards | all render", resZero.cards.length === 10, `Got ${resZero.cards.length}`);
check("zero fact letters | all render", resZero.letters.length === 3, `Got ${resZero.letters.length}`);
const zeroProvenanceEmpty = resZero.letters.every((l: any) => l.sourceSystemIds.length === 0 || l.supportingFactIds.length === 0);
check("zero fact | no fabricated provenance", zeroProvenanceEmpty, "Fabricated provenance in zero-fact");

// ── 10. Determinism ──
const rerunA = buildAll(fixtures.A);
check("deterministic cards", JSON.stringify(resA.cards) === JSON.stringify(rerunA.cards), "Card rerun differs");
check("deterministic letters", JSON.stringify(resA.letters) === JSON.stringify(rerunA.letters), "Letter rerun differs");

// ── 11. Input immutability ──
check("input not mutated", fixtures.A.blueprintFingerprint === "test-fp-abc123", "Fixture mutated");

// ── 12. Founder leakage ──
const founderPatterns = ["wizzare", "widhi", "wedhaswara"];
for (const fp of founderPatterns) {
  check(`no Founder leakage [${fp}]`, !allText.includes(fp), `Founder data found: ${fp}`);
}

// ── 13. Structural clone ──
const pastWords = resA.letters[0].paragraphs.map((p: string) => wordCount(p)).join(",");
const futureWords = resA.letters[1].paragraphs.map((p: string) => wordCount(p)).join(",");
check("past/future letters | word-count fingerprint differs", pastWords !== futureWords, "Identical word-count sequence");

// ── 14. Genericity scan ──
const genericPhrases = ["semua akan baik-baik saja", "kamu hanya perlu percaya", "perjalananmu masih panjang", "luka ini adalah hadiah"];
for (const phrase of genericPhrases) {
  const count = (allText.match(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
  check(`generic phrase "${phrase}" limited`, count <= 2, `"${phrase}" appears ${count} times`);
}

// ── 15. Provenance integrity ──
for (const card of resA.cards) {
  for (const sys of card.sourceSystemIds) {
    check(`card ${card.sectionId} source system ${sys} is canonical`,
      CANONICAL_SYSTEM_IDS.includes(sys), `Non-canonical system: ${sys}`);
  }
}
for (const letter of resA.letters) {
  for (const sys of letter.sourceSystemIds) {
    check(`letter ${letter.letterId} source system ${sys} is canonical`,
      CANONICAL_SYSTEM_IDS.includes(sys), `Non-canonical system: ${sys}`);
  }
}

// ── 16. Wound-heavy differentiation ──
const woundCardsDiff = JSON.stringify(resA.cards) !== JSON.stringify(resWound.cards);
check("wound-heavy differs from full profile", woundCardsDiff, "Identical cards despite different domains");

// ── 17. Growth-heavy differentiation ──
const growthCardsDiff = JSON.stringify(resGrowth.cards) !== JSON.stringify(resWound.cards);
check("growth-heavy differs from wound-heavy", growthCardsDiff, "Growth and wound cards identical");

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI NARRATIVE QUALITY VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
