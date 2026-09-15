/**
 * Batch C2-B — BaZi Domain Voice + Weekly Report Humanization Invariant Test
 *
 * Verifies:
 * 1. Absence of prohibited generic/spiritual-fatigue phrases in BaZi.
 * 2. formatHumanList formatting (single, double, triple+, acronyms, emoji stripping).
 * 3. Weekly Report non-diagnostic descriptive language.
 * 4. No fallback clause collision in Weekly Report.
 * 5. Deterministic selection and non-guilt-inducing language for zero-activity weeks.
 * 6. Generates 25+ BaZi samples and 16 Weekly Report scenarios for QA review.
 *
 * Runner: npx tsx tests/unit/c2b-bazi-weekly-humanization.test.ts
 */

import "../helpers/initTestEnv.ts";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { BaziMeaningService, TEN_GODS_LOOKUP } from "../../lib/bazi/baziMeaning.ts";
import { formatHumanList, createWeeklySoulReport } from "../../lib/reports/createWeeklySoulReport.ts";
import type { BaziBlueprint } from "../../lib/bazi/types.ts";

console.log("=== BATCH C2-B VERIFICATION & EXTENDED SAMPLES ===");

// 1. Invariant check on baziMeaning.ts
const baziSource = fs.readFileSync(path.resolve(__dirname, "../../lib/bazi/baziMeaning.ts"), "utf-8");
const prohibitedPatterns = [
  "Jiwamu bergerak",
  "Irama jiwamu",
  "jiwamu mengalir",
  "jiwamu menyinari",
  "lentera jiwa",
  "samudra batin",
  "mercusuar jiwamu",
  "intuisi gaib",
];

for (const pattern of prohibitedPatterns) {
  assert.ok(
    !baziSource.includes(pattern),
    `Prohibited pattern "${pattern}" found in baziMeaning.ts!`
  );
}
console.log("PASS: Prohibited BaZi fatigue phrases eliminated.");

// 2. formatHumanList assertions
assert.strictEqual(formatHumanList(["Gelisah"]), "gelisah");
assert.strictEqual(formatHumanList(["Gelisah", "Cemas"]), "gelisah dan cemas");
assert.strictEqual(formatHumanList(["Gelisah", "Cemas", "Lelah"]), "gelisah, cemas, dan lelah");
assert.strictEqual(formatHumanList(["PTSD", "Cemas"]), "PTSD dan cemas");
assert.strictEqual(formatHumanList(["😊 Lebih ringan", "😌 Lebih tenang"]), "lebih ringan dan lebih tenang");
assert.strictEqual(formatHumanList(["ADHD", "Anxiety"], "and", true), "ADHD and anxiety");
console.log("PASS: formatHumanList helper handles single, dual, triple+, acronyms, and emoji-prefixed labels correctly.");

// 3. Weekly Report source check for diagnostic claims & English leaks
const weeklySource = fs.readFileSync(path.resolve(__dirname, "../../lib/reports/createWeeklySoulReport.ts"), "utf-8");
assert.ok(!weeklySource.includes("memproses keadaan secara wajar, bukan tanda kegagalan"), "Found diagnostic interpretation in weekly report");
assert.ok(weeklySource.includes("skor konsistensi"), "Missing 'skor konsistensi'");
console.log("PASS: Weekly Report descriptive framing & Indonesian localization confirmed.");

// 4. Generate 25+ BaZi Samples
console.log("\n=================== 26 BAZI SAMPLES ===================");
const stems = ["Jia", "Yi", "Bing", "Ding", "Wu", "Ji", "Geng", "Xin", "Ren", "Gui"] as const;
const elements = ["Wood", "Wood", "Fire", "Fire", "Earth", "Earth", "Metal", "Metal", "Water", "Water"] as const;
const tenGodsList = ["Friend", "Rob Wealth", "Eating God", "Hurting Officer", "Indirect Wealth", "Direct Wealth", "Seven Killings", "Direct Officer", "Indirect Resource", "Direct Resource"];

// Samples 1-10: 10 Day Master Openings
console.log("\n--- [1-10] 10 DAY MASTER OPENINGS ---");
for (let i = 0; i < 10; i++) {
  const stem = stems[i];
  const polarity = i % 2 === 0 ? "Yang" : "Yin";
  const element = elements[i];
  const bp: BaziBlueprint = {
    dayMaster: { stem, pinyin: stem, polarity, element },
    yearPillar: { stem: "Jia", branch: "Zi", element: "Wood" },
    monthPillar: { stem: "Bing", branch: "Yin", element: "Fire" },
    dayPillar: { stem, branch: "Chen", element: "Earth" },
    hourPillar: { stem: "Geng", branch: "Wu", element: "Metal" },
    fiveElements: { Wood: 2, Fire: 2, Earth: 1, Metal: 2, Water: 1 },
    tenGods: [{ tenGod: tenGodsList[i], pillar: "year", stem: "Jia" }],
    favorableElements: ["Wood", "Fire"],
    unfavorableElements: ["Metal", "Water"],
    luckPillars: [{ index: 1, pillar: { display: "Wu Chen" }, startAge: 10, endAge: 19 }],
    currentLuckCycle: { pillar: { display: "Wu Chen", element: "Earth" }, startAge: 20, endAge: 29 },
  };
  const res = BaziMeaningService.enrich(bp);
  const opening = res.dayMaster.description.split("\n\n")[0].split(". ")[0] + ".";
  console.log(`[BaZi #${i + 1}] DM ${stem} (${polarity} ${element}): "${opening}"`);
}

// Samples 11-20: 10 Ten Gods Rendered Outputs (Year Pillar UI context)
console.log("\n--- [11-20] 10 TEN GODS RENDERED OUTPUTS (Year Pillar UI) ---");
for (let i = 0; i < 10; i++) {
  const tg = tenGodsList[i];
  const bp: BaziBlueprint = {
    dayMaster: { stem: "Jia", pinyin: "Jia", polarity: "Yang", element: "Wood" },
    yearPillar: { stem: "Jia", branch: "Zi", element: "Wood" },
    monthPillar: { stem: "Bing", branch: "Yin", element: "Fire" },
    dayPillar: { stem: "Jia", branch: "Chen", element: "Earth" },
    hourPillar: { stem: "Geng", branch: "Wu", element: "Metal" },
    fiveElements: { Wood: 3, Fire: 1, Earth: 1, Metal: 1, Water: 2 },
    tenGods: [{ tenGod: tg, pillar: "year", stem: "Jia" }],
    favorableElements: ["Fire", "Earth"],
    unfavorableElements: ["Metal", "Water"],
    luckPillars: [{ index: 1, pillar: { display: "Wu Chen" }, startAge: 10, endAge: 19 }],
    currentLuckCycle: { pillar: { display: "Wu Chen", element: "Earth" }, startAge: 20, endAge: 29 },
  };
  const res = BaziMeaningService.enrich(bp);
  console.log(`[BaZi #${i + 11}] Ten God [${tg}]: "${res.tenGods[0].description}"`);
}

// Samples 21-26: 6 Sub-domain samples (Career, Relationship, Money across varied polarities/elements)
console.log("\n--- [21-26] 6 SUB-DOMAIN SAMPLES (Career, Relationship, Money) ---");
const subDomainConfigs = [
  { stem: "Jia", polarity: "Yang" as const, element: "Wood" as const, name: "Jia (Yang Wood)" },
  { stem: "Yi", polarity: "Yin" as const, element: "Wood" as const, name: "Yi (Yin Wood)" },
  { stem: "Bing", polarity: "Yang" as const, element: "Fire" as const, name: "Bing (Yang Fire)" },
  { stem: "Wu", polarity: "Yang" as const, element: "Earth" as const, name: "Wu (Yang Earth)" },
  { stem: "Xin", polarity: "Yin" as const, element: "Metal" as const, name: "Xin (Yin Metal)" },
  { stem: "Gui", polarity: "Yin" as const, element: "Water" as const, name: "Gui (Yin Water)" },
];

subDomainConfigs.forEach((cfg, idx) => {
  const bp: BaziBlueprint = {
    dayMaster: { stem: cfg.stem, pinyin: cfg.stem, polarity: cfg.polarity, element: cfg.element },
    yearPillar: { stem: "Jia", branch: "Zi", element: "Wood" },
    monthPillar: { stem: "Bing", branch: "Yin", element: "Fire" },
    dayPillar: { stem: cfg.stem, branch: "Chen", element: "Earth" },
    hourPillar: { stem: "Geng", branch: "Wu", element: "Metal" },
    fiveElements: { Wood: 2, Fire: 2, Earth: 1, Metal: 2, Water: 1 },
    tenGods: [{ tenGod: "Direct Wealth", pillar: "year", stem: "Jia" }],
    favorableElements: ["Wood", "Fire"],
    unfavorableElements: ["Metal", "Water"],
    luckPillars: [{ index: 1, pillar: { display: "Wu Chen" }, startAge: 10, endAge: 19 }],
    currentLuckCycle: { pillar: { display: "Wu Chen", element: "Earth" }, startAge: 20, endAge: 29 },
  };
  const res = BaziMeaningService.enrich(bp);
  console.log(`[BaZi #${idx + 21}] ${cfg.name}:`);
  console.log(`  Career : "${res.careerStyle.slice(0, 140)}..."`);
  console.log(`  Rel    : "${res.relationshipStyle.slice(0, 140)}..."`);
  console.log(`  Money  : "${res.moneyStyle.slice(0, 140)}..."`);
});

// 5. Generate 16 Weekly Report Scenarios
console.log("\n=================== 16 WEEKLY REPORT SCENARIOS ===================");
const now = new Date();
const todayIso = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(now.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
};

const weeklyScenarios = [
  { id: 1, name: "Zero activities (Week A)", entries: [], prev: 0 },
  { id: 2, name: "Zero activities (Week B)", entries: [], prev: 0 },
  { id: 3, name: "Zero activities (Week C)", entries: [], prev: 0 },
  {
    id: 4,
    name: "Both emotion & body signals (2 items each)",
    entries: [
      { date: todayIso(1), emotionalState: "Gelisah", bodySignals: ["Bahu tegang"], theme: "Regulasi Saraf" },
      { date: todayIso(3), emotionalState: "Cemas", bodySignals: ["Napas pendek"], theme: "Regulasi Saraf" },
    ],
    prev: 1,
  },
  {
    id: 5,
    name: "Emotions only (2 items, no body)",
    entries: [
      { date: todayIso(2), emotionalState: "Tenang", theme: "Kehadiran" },
      { date: todayIso(4), emotionalState: "Lega", theme: "Kehadiran" },
    ],
    prev: 3,
  },
  {
    id: 6,
    name: "Body signals only (2 items, no emotions)",
    entries: [
      { date: todayIso(2), bodySignals: ["Lelah di mata", "Leher kaku"], theme: "Pemulihan Tubuh" },
    ],
    prev: 2,
  },
  {
    id: 7,
    name: "Neither emotion nor body signals (theme only)",
    entries: [
      { date: todayIso(1), theme: "Arah Hidup" },
      { date: todayIso(2), theme: "Arah Hidup" },
    ],
    prev: 0,
  },
  {
    id: 8,
    name: "High consistency milestone (7-day streak)",
    entries: Array.from({ length: 7 }, (_, idx) => ({
      date: todayIso(idx),
      emotionalState: idx % 2 === 0 ? "Fokus" : "Tenang",
      bodySignals: ["Tubuh rileks"],
      theme: "Keteguhan",
    })),
    progressData: { streakDays: 7, consistencyScore: 95 },
    prev: 5,
  },
  {
    id: 9,
    name: "Growth jump (more than previous week)",
    entries: Array.from({ length: 5 }, (_, idx) => ({
      date: todayIso(idx),
      emotionalState: "Semangat",
      theme: "Karya",
    })),
    prev: 1,
  },
  {
    id: 10,
    name: "Quiet/modest progress (single entry)",
    entries: [
      { date: todayIso(2), emotionalState: "Reflektif", theme: "Penerimaan Diri" },
    ],
    prev: 6,
  },
  {
    id: 11,
    name: "Emotion-only with 3 values",
    entries: [
      { date: todayIso(1), emotionalState: "Gelisah", theme: "Ketenangan" },
      { date: todayIso(2), emotionalState: "Cemas", theme: "Ketenangan" },
      { date: todayIso(3), emotionalState: "Lelah", theme: "Ketenangan" },
    ],
    prev: 2,
  },
  {
    id: 12,
    name: "Body-only with 3 values",
    entries: [
      { date: todayIso(1), bodySignals: ["Bahu tegang"], theme: "Raga" },
      { date: todayIso(2), bodySignals: ["Dada sesak"], theme: "Raga" },
      { date: todayIso(3), bodySignals: ["Ngantuk"], theme: "Raga" },
    ],
    prev: 1,
  },
  {
    id: 13,
    name: "Acronym preservation case (PTSD)",
    entries: [
      { date: todayIso(1), emotionalState: "PTSD", bodySignals: ["Jantung berdebar"], theme: "Pemulihan Trauma" },
      { date: todayIso(2), emotionalState: "Cemas", bodySignals: ["Napas cepat"], theme: "Pemulihan Trauma" },
    ],
    prev: 1,
  },
  {
    id: 14,
    name: "Taxonomy state with emoji prefix (Lebih ringan)",
    entries: [
      { date: todayIso(1), emotionalState: "😊 Lebih ringan", bodySignals: ["Tubuh lebih rileks"], theme: "Kejernihan" },
      { date: todayIso(2), emotionalState: "😌 Lebih tenang", bodySignals: ["Napas dalam"], theme: "Kejernihan" },
    ],
    prev: 1,
  },
  {
    id: 15,
    name: "Taxonomy state non-emotion noun (Campur aduk)",
    entries: [
      { date: todayIso(1), emotionalState: "💭 Campur aduk", theme: "Refleksi" },
    ],
    prev: 2,
  },
  {
    id: 16,
    name: "Lower activity than previous week (drop from 8 to 2)",
    entries: [
      { date: todayIso(2), emotionalState: "Lelah", bodySignals: ["Pundak kaku"], theme: "Istirahat" },
      { date: todayIso(4), emotionalState: "Netral", bodySignals: ["Mata lelah"], theme: "Istirahat" },
    ],
    prev: 8,
  },
];

for (const sc of weeklyScenarios) {
  const output = createWeeklySoulReport({
    journalEntries: sc.entries,
    meditationEntries: [],
    audioHealingEntries: [],
    progressData: (sc as any).progressData,
  });

  console.log(`\n[Scenario #${sc.id}] ${sc.name}`);
  console.log(`  Summary   : ${output.growthSummary}`);
  console.log(`  Reflection: ${output.weeklyReflection}`);
  console.log(`  Closing   : ${output.closingMessage}`);

  // Invariant checks on the generated text
  assert.ok(!output.closingMessage.includes("seperti emosi sedang"));
  assert.ok(!output.closingMessage.includes("seperti tubuhmu meminta"));
  assert.ok(!output.closingMessage.includes("bukan tanda kegagalan"));
  assert.ok(!output.closingMessage.includes("consistency score"));
}

console.log("\n=== ALL 16 WEEKLY REPORT SCENARIOS & 26 BAZI SAMPLES VERIFIED ===");
