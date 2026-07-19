import { strict as assert } from "node:assert";
import { sanitizeNarrative } from "../lib/arsipAkashi/synthesis/narrativeSanitizer";
import { sanitizeSoulLetterParagraph } from "../lib/arsipAkashi/synthesis/soulLetterSanitizer";
import { sanitizeUserNarrative } from "../lib/narrative/presentationSafety";
import { buildArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";
import { buildInsightModel, renderNarratives, renderSoulLetters } from "../lib/arsipAkashi/synthesis";
import { adaptTzolkinToArsipAkashi } from "../lib/arsipAkashi/adapters/tzolkinAdapter";
import { adaptVedicToArsipAkashi } from "../lib/arsipAkashi/adapters/vedicAdapter";
import type { ArsipAkashiInput, ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";

// Leakage patterns detection function
function detectLeakage(text: string): string[] {
  const findings: string[] = [];
  
  // Tzolkin codes in parentheses
  if (/\((?:Imix|Ik|Akbal|Kan|Chicchan|Cimi|Manik|Lamat|Muluc|Oc|Chuen|Eb|Ben|Ix|Men|Cib|Caban|Etznab|Cauac|Ahau)\)/i.test(text)) {
    findings.push("Tzolkin codes in parentheses");
  }
  
  // Untranslated astrology English
  const englishKeywords = [
    "wealth-house lords", "lords of angular", "lords of trinal", "lords of angular/trinal",
    "conjoin Pisces", "conjoined in", "Venus and Mercury", "Jupiter 4th from the Moon",
    "4th from the Moon", "from the Moon"
  ];
  for (const kw of englishKeywords) {
    if (text.toLowerCase().includes(kw.toLowerCase())) {
      findings.push(`untranslated astrology English: "${kw}"`);
    }
  }
  
  // unexplained symbolic name
  const rawSymbolic = ["imix", "cauac", "oc"];
  for (const sym of rawSymbolic) {
    const regex = new RegExp(`\\b${sym}\\b`, "i");
    if (regex.test(text) && !/simbol|energi|kualitas|arti/i.test(text)) {
      findings.push(`unexplained symbolic name: "${sym}"`);
    }
  }
  
  // camelCase fields
  if (/[a-z][a-z0-9]*[A-Z][a-z0-9]*/.test(text)) {
    findings.push("camelCase fields");
  }
  
  // snake_case fields
  if (/[a-z0-9]+_[a-z0-9_]+/.test(text)) {
    findings.push("snake_case fields");
  }
  
  // JSON fragments
  if (/\{[^{}]*\}|\[[^\[\]]*\]/.test(text)) {
    findings.push("JSON fragments");
  }
  
  // enum constants
  if (/\b(?:HIGH_CONFIDENCE|LOW_CONFIDENCE|UNRESOLVED)\b/.test(text)) {
    findings.push("enum constants");
  }
  
  // null and undefined
  if (/\b(?:null|undefined)\b/i.test(text)) {
    findings.push("null and undefined");
  }
  
  // [object Object]
  if (/\[object\s+Object\]/i.test(text)) {
    findings.push("[object Object]");
  }
  
  // prompt/provider residue
  const residues = [
    "sourceVersion", "factId", "systemId", "fingerprint", "provenance", "providerResponse", "fallbackReason",
    "berdasarkan data di atas", "sistem mendeteksi", "input menunjukkan", "model menyimpulkan",
    "hasil kalkulasi", "berdasarkan sistem", "menurut algoritma", "data mengindikasikan",
    "sebagai AI", "berikut adalah", "kesimpulannya adalah"
  ];
  for (const res of residues) {
    if (text.toLowerCase().includes(res.toLowerCase())) {
      findings.push(`prompt/provider residue: "${res}"`);
    }
  }
  
  return findings;
}

// 6 Fixture Groups:
// 1. Newly generated template
// 2. Cached narrative
// 3. Legacy narrative
// 4. Fallback narrative
// 5. Soul-letter narrative
// 6. Incomplete blueprint narrative

console.log("RUNNING ARSIP AKASHI LEAKAGE VALIDATOR...");

// Unsafe inputs definitions
const unsafeInputs = [
  "Anjing Putih (Oc)",
  "Badai Biru (Cauac)",
  "Naga Merah (Imix)",
  "Jupiter 4th from the Moon",
  "wealth-house lords conjoin Pisces",
  "Venus and Mercury conjoined in Aries",
  "null",
  "undefined",
  "[object Object]",
  '{"systemId":"vedic","confidence":HIGH_CONFIDENCE}',
  "model menyimpulkan berdasarkan data di atas bahwa ada systemId."
];

// Test sanitizers directly
for (const raw of unsafeInputs) {
  const resGlobal = sanitizeUserNarrative(raw);
  const globalLeakages = detectLeakage(resGlobal.text);
  assert.equal(globalLeakages.length, 0, `Global sanitizer failed to clean: ${raw}. Findings: ${globalLeakages.join(", ")}`);

  const resNarrative = sanitizeNarrative(raw);
  const narrativeLeakages = detectLeakage(resNarrative.cleaned);
  assert.equal(narrativeLeakages.length, 0, `Narrative sanitizer failed to clean: ${raw}. Findings: ${narrativeLeakages.join(", ")}`);

  const resSoul = sanitizeSoulLetterParagraph(raw);
  const soulLeakages = detectLeakage(resSoul.cleaned);
  assert.equal(soulLeakages.length, 0, `Soul letter sanitizer failed to clean: ${raw}. Findings: ${soulLeakages.join(", ")}`);
}
console.log("PASS: Direct sanitizer checks on raw unsafe inputs.");

// Define makeBaseInput
function makeBaseInput(userId = "test-user"): ArsipAkashiInput {
  return {
    userId,
    generatedForDate: "2026-07-18",
    referenceDate: "2026-07-18T09:00:00+07:00",
    timezone: "Asia/Jakarta",
    sourceVersion: "v1",
    blueprintFingerprint: `fp-${userId}`,
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true },
    systems: {},
  };
}

// Group 1: Newly generated template path
const inputNewGen = makeBaseInput("new-gen");
inputNewGen.systems.tzolkin = {
  systemId: "tzolkin",
  availability: "available",
  sourceOwner: "test",
  normalizedFacts: [
    { factId: "tzolkin/identity/kin", systemId: "tzolkin", domain: "identity", label: "kin", value: "Kin 260: Matahari Kuning (Ahau)", interpretationEligibility: true, confidence: 1, sourcePath: "test", sourceVersion: "v1", warnings: [] }
  ],
  calculationFingerprint: "fp-tz",
  calculationVersion: "v1",
  warnings: [],
  generatedAt: "2026-07-18T09:00:00Z"
};
const modelNewGen = buildInsightModel(inputNewGen);
const cardsNewGen = renderNarratives(modelNewGen);
for (const card of cardsNewGen) {
  const text = card.narrativeBlocks[0]?.text ?? "";
  const leakages = detectLeakage(text);
  assert.equal(leakages.length, 0, `New generation card contains leakage: ${text}. Findings: ${leakages.join(", ")}`);
}
console.log("PASS: NEW_GENERATION_PASS");

// Group 2: Cache path
// Documented as NOT_APPLICABLE because there's no cache read logic in Arsip Akashi.
console.log("PASS: CACHE_PATH_PASS (NOT_APPLICABLE - all view model generations are processed in-memory)");

// Group 3: Legacy adapter path
// Adapt raw tzolkin and vedic containing paren codes and English fragments
const adaptedTzolkin = adaptTzolkinToArsipAkashi({
  kin: 260,
  kinName: "Matahari Kuning (Ahau)",
  color: "Kuning",
  galacticTone: { name: "13 - Cosmic", function: "Presence" },
  solarSeal: { name: "Matahari Kuning (Ahau)", keyword: "Enlightenment", gift: "Love", challenge: "Ego", purpose: "Light" },
  wavespell: { name: "Gelombang Bintang Kuning", theme: "Beauty" },
  castle: { name: "Kastil Tengah Hijau", theme: "Transcendence" },
  gap: true,
  oracle: {
    destiny: { seal: { name: "Matahari Kuning (Ahau)" } },
    guide: { seal: { name: "Benih Kuning (Kan)" } },
    analog: { seal: { name: "Badai Biru (Cauac)" } },
    antipode: { seal: { name: "Anjing Putih (Oc)" } },
    occult: { seal: { name: "Naga Merah (Imix)" } }
  }
} as any);

// Feed adapted legacy facts into synthesis
const adaptedVedic = adaptVedicToArsipAkashi({
  lagna: { sign: "Aries", house: 1 },
  moonSign: { sign: "Taurus", house: 2 },
  sunSign: { sign: "Gemini", house: 3 },
  nakshatra: "Ashwini",
  pada: 1,
  atmakaraka: { planet: "Sun", sign: "Aries" },
  darakaraka: { planet: "Venus", sign: "Taurus" },
  currentMahadasha: { planet: "Ketu", startDate: "2020", endDate: "2027" },
  currentAntardasha: { planet: "Venus", startDate: "2026", endDate: "2027" },
  dharmaFocus: {},
  arthaFocus: {},
  kamaFocus: {},
  mokshaFocus: {},
  majorYogas: [
    { name: "Budha Aditya Yoga", planets: ["Sun", "Mercury"], evidence: "Sun and Mercury are conjunct conjunct conjunct." }
  ]
} as any);

const inputLegacy = makeBaseInput("legacy-user");
inputLegacy.systems.tzolkin = adaptedTzolkin;
inputLegacy.systems["vedic-astrology"] = adaptedVedic;

const vmLegacy = buildArsipAkashiProfileViewModel(inputLegacy);
for (const r of vmLegacy.readings) {
  const text = `${r.narrative} ${r.deepExplanation} ${r.practicalReflection}`;
  const leakages = detectLeakage(text);
  assert.equal(leakages.length, 0, `Legacy path card contains leakage: ${text}. Findings: ${leakages.join(", ")}`);
}
console.log("PASS: LEGACY_PATH_PASS");

// Group 4: Fallback narrative path
const inputFallback = makeBaseInput("fallback-user");
const modelFallback = buildInsightModel(inputFallback);
const cardsFallback = renderNarratives(modelFallback);
for (const card of cardsFallback) {
  const text = card.narrativeBlocks[0]?.text ?? "";
  const leakages = detectLeakage(text);
  assert.equal(leakages.length, 0, `Fallback card contains leakage: ${text}. Findings: ${leakages.join(", ")}`);
}
console.log("PASS: FALLBACK_PATH_PASS");

// Group 5: Soul-letter narrative path
const modelSoul = buildInsightModel(inputNewGen);
const lettersSoul = renderSoulLetters(modelSoul);
for (const letter of lettersSoul) {
  for (const para of letter.paragraphs) {
    const leakages = detectLeakage(para);
    assert.equal(leakages.length, 0, `Soul letter paragraph contains leakage: ${para}. Findings: ${leakages.join(", ")}`);
  }
}
console.log("PASS: SOUL_LETTER_PATH_PASS");

// Group 6: Incomplete blueprint narrative path
const inputIncomplete = makeBaseInput("incomplete-user");
inputIncomplete.systems.tzolkin = {
  systemId: "tzolkin",
  availability: "partial",
  sourceOwner: "test",
  normalizedFacts: [],
  calculationFingerprint: "fp-part",
  calculationVersion: "v1",
  warnings: [],
  generatedAt: "2026-07-18T09:00:00Z"
};
const modelIncomplete = buildInsightModel(inputIncomplete);
const cardsIncomplete = renderNarratives(modelIncomplete);
for (const card of cardsIncomplete) {
  const text = card.narrativeBlocks[0]?.text ?? "";
  const leakages = detectLeakage(text);
  assert.equal(leakages.length, 0, `Incomplete card contains leakage: ${text}. Findings: ${leakages.join(", ")}`);
}
console.log("PASS: INCOMPLETE_DATA_PASS");

console.log("ALL ARSIP AKASHI LEAKAGE VALIDATION CHECKS PASSED!");
process.exit(0);
