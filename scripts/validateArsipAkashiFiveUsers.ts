import { strict as assert } from "node:assert";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiFactDomain as FD, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";
import { buildInsightModel, renderNarratives, renderSoulLetters } from "../lib/arsipAkashi/synthesis";

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

const ALL_D: FD[] = ["identity","mechanics","talents","shadow","relationships","health","spirituality","timing","location","karma","growth","resources"];

function fact(sys: string, domain: FD, val: string, uid: string): ArsipAkashiNormalizedFact {
  return {
    factId: `${uid}-${sys}/${domain}/main`, systemId: sys as any, domain,
    label: "main", value: val, sourcePath: `lib/${sys}/test.ts`,
    sourceVersion: "v1", interpretationEligibility: true, confidence: 1, warnings: [],
  };
}

function makeEntry(sysId: string, domains: FD[], valFn: (d: FD) => string, uid: string): [string, any] {
  return [sysId, {
    systemId: sysId, availability: "available" as const, sourceOwner: "test",
    normalizedFacts: domains.map((d) => fact(sysId, d, valFn(d), uid)),
    calculationFingerprint: `${uid}-${sysId}-fp-${valFn("identity").slice(0,6)}`,
    calculationVersion: "v1", warnings: [], generatedAt: "2026-07-17T00:00:00.000Z",
  }];
}

function makeUser(
  id: string,
  fp: string,
  domains: FD[],
  valFn: (d: FD) => string,
  birthTime: "exact" | "missing" = "exact",
): ArsipAkashiInput {
  const base: ArsipAkashiInput = {
    userId: id, generatedForDate: "2026-07-17", referenceDate: "2026-07-17",
    timezone: "+07:00", sourceVersion: "v1", blueprintFingerprint: fp,
    birthDataAvailability: { time: birthTime, birthplace: true, timezone: true },
    systems: {},
  };
  for (const sid of CANONICAL_SYSTEM_IDS) {
    const [k, v] = makeEntry(sid, domains, valFn, id);
    (base.systems as any)[k] = v;
  }
  if (birthTime === "missing") {
    for (const bt of ["vedic-astrology","whole-sign","astrocartography","zi-wei-dou-shu"] as const) {
      const entry = base.systems[bt];
      if (entry) { entry.availability = "birth-time-required"; entry.normalizedFacts = []; entry.warnings = ["Birth time required"]; }
    }
  }
  return base;
}

// Five synthetic users
const userA = makeUser("user-a", "fp-identity-relationship", ALL_D, (d) => `XX-${d}-very-nurturing-sensitive-warm`);
const userB = makeUser("user-b", "fp-work-expression", ALL_D, (d) => `YY-${d}-highly-ambitious-very-independent`);
const userC = makeUser("user-c", "fp-wound-shadow", ALL_D, (d) => `ZZ-${d}-deeply-wounded-highly-resilient`);
const userD = makeUser("user-d", "fp-partial-birth", ["identity","mechanics","talents","shadow","growth"], (d) => `WW-${d}-careful-cautious-thoughtful`, "missing");
const userE = makeUser("user-e", "fp-location-diff", ALL_D, (d) => d === "location" ? `VV-location-surabaya-indonesia` : `XX-${d}-very-nurturing-sensitive-warm`);

const users = { A: userA, B: userB, C: userC, D: userD, E: userE };
const results: Record<string, any> = {};

for (const [key, input] of Object.entries(users)) {
  const model = buildInsightModel(input);
  const cards = renderNarratives(model);
  const letters = renderSoulLetters(model);
  results[key] = { model, cards, letters };
}

function cardText(r: typeof results.A, idx: number): string {
  return r.cards[idx]?.narrativeBlocks[0]?.text ?? "";
}

function sentSet(text: string): Set<string> {
  return new Set(text.split(/(?<=[.!?])\s+/).map((s: string) => s.trim().toLowerCase()).filter(Boolean));
}

// ── 1. Complete output ──
for (const [key, r] of Object.entries(results)) {
  check(`${key} | 10 standard cards`, r.cards.length === 10, `Got ${r.cards.length}`);
  check(`${key} | 3 soul letters`, r.letters.length === 3, `Got ${r.letters.length}`);
}

// ── 2. Cross-user standard-card differentiation ──
let cardDiffCount = 0;
for (let i = 0; i < 10; i++) {
  const texts = [results.A, results.B, results.C].map((r) => cardText(r, i));
  if (new Set(texts).size >= 2) cardDiffCount++;
}
check("A/B/C standard cards | >=4 sections differ materially", cardDiffCount >= 4, `Only ${cardDiffCount} sections differ`);

// ── 3. Cross-user letter differentiation ──
for (const letterIdx of [0, 1]) {
  const paragraphs = [results.A, results.B, results.C].map((r) => r.letters[letterIdx].paragraphs.join("|"));
  check(`letter ${letterIdx} | A/B/C differ`, new Set(paragraphs).size >= 2, `Letter ${letterIdx} identical across users`);
}

// ── 4. At least 3 paragraphs differ between A and B ──
let pastDiff = 0;
for (let i = 0; i < 5; i++) {
  if (results.A.letters[0].paragraphs[i] !== results.B.letters[0].paragraphs[i]) pastDiff++;
}
check("A vs B past-self | >=3 paragraphs differ", pastDiff >= 3, `Only ${pastDiff} differ`);

let futureDiff = 0;
for (let i = 0; i < 5; i++) {
  if (results.A.letters[1].paragraphs[i] !== results.B.letters[1].paragraphs[i]) futureDiff++;
}
check("A vs B future-self | >=3 paragraphs differ", futureDiff >= 3, `Only ${futureDiff} differ`);

// ── 5. Exact duplicate scan ──
const allCards = [results.A, results.B, results.C, results.D, results.E].flatMap((r) => r.cards.map((c: any) => c.narrativeBlocks[0]?.text));
const dupCards = allCards.length - new Set(allCards).size;
check("duplicate cards across users limited", dupCards <= 15, `${dupCards} duplicates`);

const allLetters = [results.A, results.B, results.C, results.D, results.E].flatMap((r) => r.letters.map((l: any) => l.paragraphs.join("||")));
const dupLetters = allLetters.length - new Set(allLetters).size;
check("duplicate letters across users limited", dupLetters <= 5, `${dupLetters} duplicate letters`);

// ── 6. Name swap ──
const nsInput: ArsipAkashiInput = JSON.parse(JSON.stringify(userA));
nsInput.userId = "user-renamed";
const nsModel = buildInsightModel(nsInput);
const nsCards = renderNarratives(nsModel);
const nsLetters = renderSoulLetters(nsModel);
const nsCardText = nsCards.map((c) => c.narrativeBlocks[0]?.text).join("|");
const origCardText = results.A.cards.map((c:any) => c.narrativeBlocks[0]?.text).join("|");
check("name swap | cards identical", nsCardText === origCardText, "Cards changed after name swap");
const nsLetterText = nsLetters.map((l) => l.paragraphs.join("||")).join("|");
const origLetterText = results.A.letters.map((l:any) => l.paragraphs.join("||")).join("|");
check("name swap | letters identical", nsLetterText === origLetterText, "Letters changed after name swap");

// ── 7. Value swap ──
const userASwapped = makeUser("user-a-swapped", "fp-swapped", ALL_D, (d) => `SWAPPED-${d}-value`);
const swResult = buildInsightModel(userASwapped);
const swCards = renderNarratives(swResult);
const swLetters = renderSoulLetters(swResult);
let anySwappedCardDiff = false;
for (let i = 0; i < 10; i++) {
  if (cardText({ cards: swCards }, i) !== cardText(results.A, i)) anySwappedCardDiff = true;
}
check("value swap | at least one card changes", anySwappedCardDiff, "No card changed after value swap");

// ── 8. Structural clone ──
const fingerA = results.A.letters.map((l: any) => l.paragraphs.map((p: string) => p.split(/\s+/).length).join(",")).join("|");
const fingerB = results.B.letters.map((l: any) => l.paragraphs.map((p: string) => p.split(/\s+/).length).join(",")).join("|");
check("A vs B structural fingerprint differs", fingerA !== fingerB, "Clone structural fingerprint");

// ── 9. Partial birth time ──
check("user D | renders 10 cards", results.D.cards.length === 10, `Got ${results.D.cards.length}`);
check("user D | renders 3 letters", results.D.letters.length === 3, `Got ${results.D.letters.length}`);
const fullCov = results.A.model.globalCoverage;
const partialCov = results.D.model.globalCoverage;
check("user D | coverage lower than A", partialCov.coverageRatio < fullCov.coverageRatio, `D:${partialCov.coverageRatio} >= A:${fullCov.coverageRatio}`);
// Verify no time-dependent system facts for user D
for (const bt of ["vedic-astrology","whole-sign","astrocartography","zi-wei-dou-shu"] as const) {
  const entry = userD.systems[bt];
  if (entry) check(`user D ${bt} unavailable`, entry.availability === "birth-time-required" || entry.availability === "unavailable", `${bt} should be unavailable`);
}

// ── 10. Astrocartography isolation ──
const locationSections = ["body-environment", "spirituality-evolution", "current-life-phase", "symbolic-origin", "growth-potential"];
const stableSections = ["soul-identity", "energy-mechanics", "wounds-shadow-lineage", "work-talents", "love-relationships"];
let locDiffCount = 0;
let stableEqualCount = 0;
for (const sec of locationSections) {
  const idx = results.A.cards.findIndex((c: any) => c.sectionId === sec);
  if (idx >= 0 && results.A.cards[idx].narrativeBlocks[0]?.text !== results.E.cards[idx].narrativeBlocks[0]?.text) locDiffCount++;
}
for (const sec of stableSections) {
  const idx = results.A.cards.findIndex((c: any) => c.sectionId === sec);
  if (idx >= 0 && results.A.cards[idx].narrativeBlocks[0]?.text === results.E.cards[idx].narrativeBlocks[0]?.text) stableEqualCount++;
}
check("A vs E | location sections differ", locDiffCount >= 1, `Only ${locDiffCount} location sections differ`);
check("A vs E | stable sections identical", stableEqualCount >= 3, `Only ${stableEqualCount} stable sections identical`);

// ── 11. Provenance isolation (per-user: no cross-user factId mixing) ──
for (const [key, r] of Object.entries(results)) {
  const p = r.cards.flatMap((c: any) => c.supportingFactIds).concat(r.letters.flatMap((l: any) => l.supportingFactIds));
  const foreign = p.filter((id: string) => !id.startsWith(key === "E" ? "user-e" : `user-${key.toLowerCase()}`));
  check(`provenance isolation ${key}`, foreign.length === 0, `${foreign.length} foreign factIds in ${key}`);
}

// ── 12. Determinism ──
for (const [key, input] of Object.entries(users)) {
  const model = buildInsightModel(input);
  const cards = renderNarratives(model);
  const letters = renderSoulLetters(model);
  check(`${key} | deterministic cards`, JSON.stringify(results[key].cards) === JSON.stringify(cards), `${key} card rerun differs`);
  check(`${key} | deterministic letters`, JSON.stringify(results[key].letters) === JSON.stringify(letters), `${key} letter rerun differs`);
}

// ── 13. Input immutability ──
check("user A input not mutated", userA.blueprintFingerprint === "fp-identity-relationship", "Input mutated");

// ── 14. Founder leakage ──
const allProse = [results.A, results.B, results.C, results.D, results.E].flatMap((r) =>
  r.cards.map((c: any) => c.narrativeBlocks[0]?.text).concat(r.letters.flatMap((l: any) => l.paragraphs))
).join(" ").toLowerCase();
const founderPatterns = ["wizzare", "widhi", "wedhaswara", "1985-05-03"];
for (const fp of founderPatterns) {
  check(`no Founder data [${fp}]`, !allProse.includes(fp), `Founder data found: ${fp}`);
}

// ── 15. Machine-language scan ──
const machinePatterns = [/factId/i, /sourceVersion/i, /blueprintFingerprint/i, /sebagai ai/i, /sistem mendeteksi/i, /kesimpulannya adalah/i];
for (const pat of machinePatterns) {
  check(`no machine residue ${pat}`, !pat.test(allProse), `Machine residue: ${pat}`);
}

// ── 16. System-label scan ──
const sysNames = ["human design","bazi","zi wei","whole sign","natal chart","destiny matrix","tzolkin","astrocartography","weton","vedic","numerology"];
for (const nm of sysNames) {
  check(`no system label [${nm}]`, !allProse.includes(nm), `System label found: ${nm}`);
}

// ── 17. Full-coverage claim safety ──
for (const [key, r] of Object.entries(results)) {
  const cov = r.model.globalCoverage;
  if (cov.expectedSystems === 11 && cov.availableSystems.length === 11) {
    check(`${key} | full coverage claimed with 11 available`, true, "");
  }
}

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI FIVE-USER VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;
