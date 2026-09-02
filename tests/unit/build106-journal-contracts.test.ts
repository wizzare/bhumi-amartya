/**
 * Build 106 Step 4 — journaling / CBT / data contracts (R-11..R-13, R-19, R-21, R-22, R-26).
 *
 * Covers the recovered CP-036 contract layer:
 *   - lib/journal/journalMemoryExtraction.ts  extractMemorySignals (mode-aware, crisis-suppressed)
 *   - lib/memory/memoryCandidate.ts           confidence / promotable / grounded label
 *   - lib/journal/journalAIContract.ts        reflective-only, crisis suppression, non-diagnostic
 *
 * Runner: tsx tests/unit/build106-journal-contracts.test.ts   (no env / no emulator)
 */
import assert from "node:assert";

import { extractMemorySignals } from "../../lib/journal/journalMemoryExtraction.ts";
import {
  computeConfidence,
  isPromotable,
  groundedThemeLabel,
} from "../../lib/memory/memoryCandidate.ts";
import { generateJournalAIResponse } from "../../lib/journal/journalAIContract.ts";
import { containsDiagnosticLanguage, sanitizeAIOutput } from "../../lib/journal/journalSafety.ts";
import type { LocalJournalEntry } from "../../lib/journal/localJournal.ts";

let assertions = 0;
function ok(cond: unknown, msg: string): void { assertions += 1; assert.ok(cond, msg); }
function eq<T>(a: T, b: T, msg: string): void { assertions += 1; assert.strictEqual(a, b, msg); }

const baseEntry = (over: Partial<LocalJournalEntry>): LocalJournalEntry => ({
  date: "2026-08-25",
  theme: "Proses Pelepasan",
  questions: ["Q1"],
  journalText: "isi catatan",
  emotionalState: "Sedih",
  bodySignals: ["dada berat"],
  createdAt: new Date().toISOString(),
  insight: "i",
  tomorrowFocus: "t",
  previousEntryCount: 0,
  ...over,
} as LocalJournalEntry);

/* --------------------------------------- extractMemorySignals: mode-aware (R-21) */
function testExtractionModeAware(): void {
  const cbt = extractMemorySignals(baseEntry({
    id: "e-cbt", journalType: "CBT",
    cbt: { situation: "kehilangan", automaticThought: "semua salahku", evidenceFor: "x", evidenceAgainst: "y", alternativePerspective: "z", nextStep: "n" },
  }), "uid-1");
  ok(cbt, "CBT extraction returns signals");
  eq(cbt!.mode, "CBT", "CBT mode carried");
  eq((cbt!.signals as any).situation, "kehilangan", "CBT: situation signal");
  eq((cbt!.signals as any).alternativeThought, "z", "CBT: alternative-perspective signal");
  eq(cbt!.suppressed, false, "CBT normal entry not suppressed");

  const emo = extractMemorySignals(baseEntry({
    id: "e-emo", journalType: "EMOTION",
    emotion: { primaryFeeling: "marah", bodySensation: "dada", triggerContext: "kerja", needBehindFeeling: "dihargai" },
  }), "uid-1");
  eq((emo!.signals as any).emotion, "marah", "EMOTION: primary feeling signal");
  eq((emo!.signals as any).need, "dihargai", "EMOTION: need-behind-feeling signal");

  const spirit = extractMemorySignals(baseEntry({
    id: "e-sp", journalType: "SPIRITUAL_AWAKENING",
    spiritual: { experienceDescription: "hening", meaningExplored: "makna", connectionTheme: "kesatuan" },
  }), "uid-1");
  eq((spirit!.signals as any).meaning, "makna", "SPIRITUAL_AWAKENING: meaning signal");

  const guided = extractMemorySignals(baseEntry({
    id: "e-g", journalType: "GUIDED",
    guided: { promptResponses: [{ question: "Q1", answer: "jawaban satu" }, { question: "Q2", answer: "jawaban dua" }] },
  }), "uid-1");
  eq((guided!.signals as any).response, "jawaban satu jawaban dua", "GUIDED: response joined from prompt answers");

  const free = extractMemorySignals(baseEntry({ id: "e-f", journalType: "FREE", journalText: "menulis bebas panjang sekali ".repeat(10) }), "uid-1");
  eq((free!.signals as any).contentDerived, true, "FREE: content-derived signals only");

  // legacy entry with no journalType -> treated as FREE (per the discriminator contract)
  const legacy = extractMemorySignals(baseEntry({ id: "e-legacy" }), "uid-1");
  eq(legacy!.mode, "FREE", "missing journalType is treated as FREE");
  console.log("  extractMemorySignals mode-aware (R-21) ......... PASS");
}

/* --------------------------------------- crisis suppresses extraction (R-19 + R-22) */
function testCrisisSuppression(): void {
  const crisis = extractMemorySignals(baseEntry({
    id: "e-crisis", journalType: "EMOTION", journalText: "aku ingin mati saja",
    emotion: { primaryFeeling: "putus asa" },
  }), "uid-1");
  ok(crisis, "crisis entry still returns a (safety) signal object");
  eq(crisis!.suppressed, true, "crisis content suppresses AI memory extraction");
  eq((crisis!.signals as any).crisis, true, "crisis flag recorded");
  ok(Array.isArray((crisis!.signals as any).matched) && (crisis!.signals as any).matched.length > 0, "matched crisis keywords recorded");

  // R-22 / R-26: evidence stores a short grounded snippet, never the full raw text
  ok(typeof crisis!.evidence.snippet === "string", "evidence snippet is a string");
  ok((crisis!.evidence.snippet as string).length <= 41, "crisis evidence snippet is a short excerpt, not the full entry");
  console.log("  crisis suppresses extraction (R-19/R-22) ....... PASS");
}

/* --------------------------------------- evidence snippet is bounded (R-22 / R-26) */
function testEvidenceSnippetBounded(): void {
  const longText = "kata ".repeat(200);
  const sig = extractMemorySignals(baseEntry({ id: "e-long", journalType: "FREE", journalText: longText }), "uid-1");
  ok((sig!.evidence.snippet as string).length <= 81, "normal evidence snippet is capped (~80 chars), not raw text");
  ok((sig!.evidence.snippet as string).length < longText.length, "snippet is strictly shorter than the raw entry");
  console.log("  evidence snippet bounded (R-22/R-26) .......... PASS");
}

/* --------------------------------------- memoryCandidate: no auto-promotion of one-offs (R-26 §5) */
function testMemoryCandidateThresholds(): void {
  eq(isPromotable(1), false, "one-off is NOT promotable to a durable pattern");
  eq(isPromotable(2), false, "two occurrences still not auto-promoted");
  eq(isPromotable(3), true, "3+ occurrences may be promoted");
  ok(computeConfidence(4) > computeConfidence(2), "confidence grows with evidence count");
  ok(computeConfidence(1) <= 0.25, "single-evidence confidence stays low");
  ok(groundedThemeLabel("kehilangan", 1, 1).toLowerCase().includes("belum menjadi pola"), "1 occurrence -> 'not yet a pattern' wording");
  ok(!/depresi|disorder|diagnos/i.test(groundedThemeLabel("kesedihan", 4, 20)), "grounded label is non-diagnostic");
  console.log("  memoryCandidate thresholds (R-26 §5) ......... PASS");
}

/* --------------------------------------- AI contract: reflective-only + non-diagnostic (R-13/R-19) */
function testAIContract(): void {
  const normal = generateJournalAIResponse({ journalType: "CBT", content: "aku merasa cemas soal kerja", locale: "id", theme: "Refleksi" });
  eq(normal.suppressed, false, "normal entry: AI not suppressed");
  eq(normal.provenance, "ai-insight", "normal entry: provenance ai-insight");
  ok(!!normal.reflectiveText && !containsDiagnosticLanguage(normal.reflectiveText), "reflective text carries no diagnostic language");

  const crisis = generateJournalAIResponse({ journalType: "FREE", content: "aku ingin bunuh diri", locale: "id" });
  eq(crisis.suppressed, true, "crisis: AI suppressed");
  eq(crisis.provenance, "none", "crisis: provenance none");
  eq(crisis.reflectiveText, undefined, "crisis: no reflective text emitted");

  eq(containsDiagnosticLanguage("Kamu menderita depresi berat"), true, "diagnostic phrase detected");
  eq(containsDiagnosticLanguage("Satu kemungkinan refleksi tentang perasaanmu"), false, "reflective phrase not flagged");
  ok(sanitizeAIOutput("You have anxiety disorder").startsWith("Satu kemungkinan refleksi"), "diagnostic output is replaced with a reflective fallback");

  for (const locale of ["id", "en", "ms"] as const) {
    const r = generateJournalAIResponse({ journalType: "EMOTION", content: "hari ini berat", locale });
    ok(!!r.reflectiveText, `AI response produced for locale ${locale}`);
  }
  console.log("  AI contract reflective + non-diagnostic (R-13/R-19)  PASS");
}

function run(): void {
  console.log("build106-journal-contracts:");
  testExtractionModeAware();
  testCrisisSuppression();
  testEvidenceSnippetBounded();
  testMemoryCandidateThresholds();
  testAIContract();
  console.log(`PASS build106-journal-contracts (${assertions} assertions)`);
}

try { run(); } catch (error) { console.error(error); process.exitCode = 1; }
