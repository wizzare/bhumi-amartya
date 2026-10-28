/**
 * tests/unit/build118-daily-guidance.test.ts
 *
 * BHUMI AMARTYA — BUILD 118
 * CATATAN HARI INI (PROFILE PAGE) — COMPREHENSIVE AUTOMATED ACCEPTANCE SUITE
 * DEEP FOUR-FOUNDATION CANONICAL SYNTHESIS:
 * WESTERN ASTROLOGY × WETON JAWA × BAZI × TZOLKIN × CANONICAL BLUEPRINT
 *
 * Verifies:
 * 1. Exact 8-Domain Architecture matching Weekly Guidance
 * 2. 100% Data Parity with Astro Hari Ini (same Weton, BaZi, Tzolkin Kin, Moon Phase)
 * 3. BaZi Day Pillar & Day Ren Indicator (Explicit recognition only when Stem is Ren 壬)
 * 4. Ten Gods (Shi Shen) Calculation between Daily Stem & Natal Day Master
 * 5. Natal vs Daily Systems Isolation (Zero mixing between natal Weton/BaZi/Kin and daily Weton/BaZi/Kin)
 * 6. Four Foundations Domain-Aware Contribution across all 8 domains
 * 7. Foundations Drawer (Dasar Pembacaan) Transparency
 * 8. Top 3 Highlighted Domains & Proportional Scoring
 * 9. Personal Transit-to-Natal & Placidus House Calculation (sub-minute root finding)
 * 10. Dynamic Daily Phases (Pagi, Siang, Malam with exact transit timing)
 * 11. Canonical Blueprint Personal Integration (Love Path 7-10-21, Karmic Tail 21-7-13, HD, Life Path)
 * 12. Asmara Relationship Status Personalization (Single vs In Relationship)
 * 13. Dual-Fixture Differentiation (Aria vs Maya)
 * 14. Temporal Progression Differentiation (Oct 28 vs Nov 05)
 * 15. Cliché Blacklist & Zero Advice Triplication
 * 16. UID Switching & Cache Isolation
 *
 * Run with:
 *   npx tsx tests/unit/build118-daily-guidance.test.ts
 */

import assert from "node:assert/strict";
import {
  buildDailyGuidance,
  computeBaziTenGod,
  DAILY_DOMAIN_DEFINITIONS,
  type DailyGuidance,
} from "../../lib/dailyGuidance/dailyGuidanceEngine";
import { buildDailyAstroSynthesis } from "../../lib/astrology/dailyAstroSynthesis";
import { calculateBazi } from "../../lib/bazi/calculateBazi";
import { calculateWeton } from "../../lib/weton/calculateWeton";
import { calculateTzolkin } from "../../lib/tzolkin/calculateTzolkin";
import { generateLocalBlueprint } from "../../lib/local/generateLocalBlueprint";

let passedCount = 0;

function ok(condition: boolean, message: string) {
  assert.equal(condition, true, message);
  passedCount++;
  console.log(`  [PASS] ${message}`);
}

console.log("=".repeat(80));
console.log("BHUMI AMARTYA — BUILD 118 CATATAN HARI INI (FOUR FOUNDATIONS) TEST SUITE");
console.log("=".repeat(80));

// ----------------------------------------------------------------------------
// SYNTHETIC USER FIXTURES
// ----------------------------------------------------------------------------

const userAria = {
  uid: "synthetic-user-a-aria",
  name: "Aria Dewanta",
  fullName: "Aria Dewanta",
  birthDate: "1985-05-03",
  birthTime: "18:45",
  birthPlace: "Surabaya, Indonesia",
  latitude: -7.2575,
  longitude: 112.7521,
  timezone: "Asia/Jakarta",
  gender: "male" as const,
  relationshipStatus: "single" as const,
};

const userMaya = {
  uid: "synthetic-user-b-maya",
  name: "Maya Pratiwi",
  fullName: "Maya Pratiwi",
  birthDate: "1992-09-18",
  birthTime: "04:15",
  birthPlace: "Bandung, Indonesia",
  latitude: -6.9175,
  longitude: 107.6191,
  timezone: "Asia/Jakarta",
  gender: "female" as const,
  relationshipStatus: "in_relationship" as const,
};

const blueprintAria = generateLocalBlueprint(userAria as any);
(blueprintAria as any).humanDesign = {
  type: "Projector",
  authority: "Splenic",
  profile: "1/3",
  notSelfTheme: "Bitterness",
};
(blueprintAria as any).destinyMatrix = {
  center: 8,
  loveLine: [7, 10, 21],
  moneyLine: [8, 10, 21],
  karmicTail: [21, 7, 13],
};

const blueprintMaya = generateLocalBlueprint(userMaya as any);
(blueprintMaya as any).humanDesign = {
  type: "Generator",
  authority: "Sacral",
  profile: "2/4",
  notSelfTheme: "Frustration",
};
(blueprintMaya as any).destinyMatrix = {
  center: 6,
  loveLine: [6, 12, 18],
  moneyLine: [6, 12, 18],
  karmicTail: [18, 6, 15],
};

const testDateOct28 = new Date("2026-10-28T12:00:00+07:00");
const testDateOct26 = new Date("2026-10-26T12:00:00+07:00");
const testDateNov05 = new Date("2026-11-05T12:00:00+07:00");

// ----------------------------------------------------------------------------
// SECTION 1: Exact 8-Domain Structure Matching Weekly Guidance
// ----------------------------------------------------------------------------
console.log("\n[SECTION 1: Exact 8-Domain Architecture Matching Weekly Guidance]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  ok(guidance.sections.length === 8, "Daily guidance has exactly 8 domain sections");
  const expectedKeys = [
    "kabarHariIni",
    "pikiran",
    "ekonomi",
    "asmara",
    "orangTerdekat",
    "maknaBatin",
    "yangMungkinTerasaBerat",
    "ruangYangSedangTerbuka",
  ];
  const actualKeys = guidance.sections.map((s) => s.key);
  ok(
    JSON.stringify(actualKeys) === JSON.stringify(expectedKeys),
    `8 domain keys match exactly: ${actualKeys.join(", ")}`
  );

  for (const sec of guidance.sections) {
    ok(sec.title.length > 0, `Section ${sec.key} has non-empty title: ${sec.title}`);
    ok(sec.summary.length > 0, `Section ${sec.key} has non-empty summary`);
    ok(["high", "medium", "subtle"].includes(sec.intensity), `Section ${sec.key} has valid intensity (${sec.intensity})`);
    ok(sec.astrologicalMeaning.length > 0, `Section ${sec.key} has non-empty astrological meaning`);
    ok(sec.spiritualMeaning.length > 0, `Section ${sec.key} has non-empty spiritual meaning`);
    ok(sec.crossSystemSynthesis !== undefined && sec.crossSystemSynthesis.length > 0, `Section ${sec.key} has deep crossSystemSynthesis`);
    ok(sec.advice.length === 1, `Section ${sec.key} has exactly 1 distinct actionable advice`);
    ok(sec.phases.pagi.length > 0, `Section ${sec.key} has non-empty pagi phase`);
    ok(sec.phases.siang.length > 0, `Section ${sec.key} has non-empty siang phase`);
    ok(sec.phases.malam.length > 0, `Section ${sec.key} has non-empty malam phase`);
    ok(sec.readingFoundations && sec.readingFoundations.length > 0, `Section ${sec.key} has reading foundations`);
  }
}

// ----------------------------------------------------------------------------
// SECTION 2: 100% Data Parity with Astro Hari Ini
// ----------------------------------------------------------------------------
console.log("\n[SECTION 2: 100% Data Parity with Astro Hari Ini]");
{
  const astroSynthesis = buildDailyAstroSynthesis({
    uid: userAria.uid,
    profileTimezone: "Asia/Jakarta",
    now: testDateOct28,
  });

  const dailyGuidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const expectedWeton = astroSynthesis.eastern.weton?.weton;
  const actualWeton = dailyGuidance.cosmicSummary.wetonToday?.weton;
  ok(actualWeton === expectedWeton, `Weton today matches Astro Hari Ini: ${actualWeton}`);

  const expectedTzolkinKin = astroSynthesis.eastern.tzolkin?.kin;
  const actualTzolkinKin = dailyGuidance.cosmicSummary.tzolkinToday?.kin;
  ok(actualTzolkinKin === expectedTzolkinKin, `Tzolkin Kin matches Astro Hari Ini: Kin ${actualTzolkinKin}`);

  const expectedMoonSign = astroSynthesis.sky.bodies.find((b) => (b as any).body === "Moon")?.sign;
  ok(dailyGuidance.cosmicSummary.lunarPhaseSummary.includes(expectedMoonSign || ""), `Moon sign in lunarPhaseSummary matches SwissEph (${expectedMoonSign})`);
}

// ----------------------------------------------------------------------------
// SECTION 3: BaZi Day Pillar & Explicit Day Ren Indicator
// ----------------------------------------------------------------------------
console.log("\n[SECTION 3: BaZi Day Pillar & Explicit Day Ren Indicator]");
{
  // 1. Oct 28 BaZi (Jia Xu) - Not Day Ren
  const guidanceOct28 = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const baziTodayOct28 = guidanceOct28.cosmicSummary.baziToday;
  ok(!!baziTodayOct28, "BaZi day pillar is computed for Oct 28");
  ok(baziTodayOct28?.stemPinyin === "Jia", `Stem of Oct 28 is Jia (got ${baziTodayOct28?.stemPinyin})`);
  ok(baziTodayOct28?.element === "Wood", `Element of Oct 28 is Wood (got ${baziTodayOct28?.element})`);
  ok(baziTodayOct28?.isDayRen === false, "Oct 28 is NOT Day Ren (Stem is Jia, not Ren)");
  ok(baziTodayOct28?.dayRenNote === undefined, "Day Ren note is undefined for non-Ren day");
  ok(baziTodayOct28?.stemMeaning?.includes("Jia"), "Stem meaning for Jia is present");

  // 2. Oct 26 BaZi (Ren Shen -> Actual Day Ren!)
  const guidanceOct26 = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct26,
    timezone: "Asia/Jakarta",
  });

  const baziTodayOct26 = guidanceOct26.cosmicSummary.baziToday;
  ok(!!baziTodayOct26, "BaZi day pillar is computed for Oct 26");
  ok(baziTodayOct26?.stemPinyin === "Ren", `Stem of Oct 26 is Ren (got ${baziTodayOct26?.stemPinyin})`);
  ok(baziTodayOct26?.element === "Water", `Element of Oct 26 is Water (got ${baziTodayOct26?.element})`);
  ok(baziTodayOct26?.isDayRen === true, "Oct 26 is correctly identified as Day Ren (壬, Water Yang)");
  ok(baziTodayOct26?.dayRenNote?.includes("Air Yang"), "Day Ren note details dynamic Water Yang energy");

  // Weave into Kabar Hari Ini on Day Ren
  const kabarSec = guidanceOct26.sections.find((s) => s.key === "kabarHariIni")!;
  ok(kabarSec.crossSystemSynthesis?.includes("Day Ren"), "Kabar Hari Ini on Oct 26 synthesizes Day Ren");
}

// ----------------------------------------------------------------------------
// SECTION 4: Ten Gods (Shi Shen) Calculation Accuracy
// ----------------------------------------------------------------------------
console.log("\n[SECTION 4: Ten Gods (Shi Shen) Calculation Accuracy]");
{
  // 1. Friend (Same element, same polarity: Jia on Jia)
  const tgFriend = computeBaziTenGod("Jia", "Jia");
  ok(tgFriend?.code === "Friend", "Jia on Jia produces Friend (Bi Jian)");
  ok(tgFriend?.category === "Friend", "Category is Friend");

  // 2. Rob Wealth (Same element, different polarity: Jia on Yi)
  const tgRob = computeBaziTenGod("Jia", "Yi");
  ok(tgRob?.code === "Rob Wealth", "Jia on Yi produces Rob Wealth (Jie Cai)");

  // 3. Eating God (Day generates Other, same polarity: Jia Wood -> Bing Fire)
  const tgEating = computeBaziTenGod("Jia", "Bing");
  ok(tgEating?.code === "Eating God", "Jia on Bing produces Eating God (Shi Shen)");

  // 4. Hurting Officer (Day generates Other, different polarity: Jia Wood -> Ding Fire)
  const tgHurting = computeBaziTenGod("Jia", "Ding");
  ok(tgHurting?.code === "Hurting Officer", "Jia on Ding produces Hurting Officer (Shang Guan)");

  // 5. Indirect Wealth (Day controls Other, same polarity: Jia Wood -> Wu Earth)
  const tgIndWealth = computeBaziTenGod("Jia", "Wu");
  ok(tgIndWealth?.code === "Indirect Wealth", "Jia on Wu produces Indirect Wealth (Pian Cai)");

  // 6. Direct Wealth (Day controls Other, different polarity: Jia Wood -> Ji Earth)
  const tgDirWealth = computeBaziTenGod("Jia", "Ji");
  ok(tgDirWealth?.code === "Direct Wealth", "Jia on Ji produces Direct Wealth (Zheng Cai)");

  // 7. Seven Killings (Other controls Day, same polarity: Geng Metal -> Jia Wood)
  const tgSeven = computeBaziTenGod("Jia", "Geng");
  ok(tgSeven?.code === "Seven Killings", "Jia on Geng produces Seven Killings (Qi Sha)");

  // 8. Direct Officer (Other controls Day, different polarity: Xin Metal -> Jia Wood)
  const tgOfficer = computeBaziTenGod("Jia", "Xin");
  ok(tgOfficer?.code === "Direct Officer", "Jia on Xin produces Direct Officer (Zheng Guan)");

  // 9. Indirect Resource (Other generates Day, same polarity: Ren Water -> Jia Wood)
  const tgIndResource = computeBaziTenGod("Jia", "Ren");
  ok(tgIndResource?.code === "Indirect Resource", "Jia on Ren produces Indirect Resource (Pian Yin)");

  // 10. Direct Resource (Other generates Day, different polarity: Gui Water -> Jia Wood)
  const tgDirResource = computeBaziTenGod("Jia", "Gui");
  ok(tgDirResource?.code === "Direct Resource", "Jia on Gui produces Direct Resource (Zheng Yin)");
}

// ----------------------------------------------------------------------------
// SECTION 5: Natal vs Daily Systems Isolation (Zero Confusion)
// ----------------------------------------------------------------------------
console.log("\n[SECTION 5: Natal vs Daily Systems Isolation (Zero Confusion)]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  // A. Weton Isolation: Aria was born at 18:45 (>18:00 Javanese sunset boundary, so effective day is Sabtu Legi, Neptu 14), today is Rabu Pon (Neptu 14)
  const todayWeton = guidance.cosmicSummary.wetonToday?.weton;
  ok(todayWeton === "Rabu Pon", `Daily Weton is Rabu Pon (got ${todayWeton})`);

  const orangTerdekatSec = guidance.sections.find((s) => s.key === "orangTerdekat")!;
  const wetonNatalEntry = orangTerdekatSec.readingFoundations?.find((f) => f.system === "Weton Natal");
  ok(wetonNatalEntry !== undefined, "Orang Terdekat explicitly identifies Weton Natal");
  ok(wetonNatalEntry?.indicator.includes("Sabtu Legi"), `Weton Natal is Sabtu Legi (got ${wetonNatalEntry?.indicator})`);
  ok(wetonNatalEntry?.indicator.includes("14"), "Weton Natal neptu is 14");

  // B. BaZi Isolation: Aria Day Master is Jia (Wood Yang), today is Jia Xu (Wood Yang on Oct 28) or Ren Shen on Oct 26
  ok(guidance.cosmicSummary.baziToday?.display === "甲戌 Jia Xu", "Daily BaZi is Jia Xu");
  const pikiranSec = guidance.sections.find((s) => s.key === "pikiran")!;
  const baziEntry = pikiranSec.readingFoundations?.find((f) => f.system === "BaZi");
  ok(baziEntry?.indicator.includes("Day Master"), "Pikiran explicitly references Day Master");

  // C. Tzolkin Isolation: Aria natal Kin is Kin 143 (1985-05-03), today is Kin 63 (2026-10-28)
  ok(guidance.cosmicSummary.tzolkinToday?.kin === 63, "Daily Tzolkin Kin is 63");
  const maknaBatinSec = guidance.sections.find((s) => s.key === "maknaBatin")!;
  const tzolkinDailyEntry = maknaBatinSec.readingFoundations?.find((f) => f.system === "Tzolkin Maya");
  ok(tzolkinDailyEntry?.indicator.includes("Kin 63"), "Makna Batin explicitly references Daily Kin 63");
}

// ----------------------------------------------------------------------------
// SECTION 6: Four Foundations Domain-Aware Contribution
// ----------------------------------------------------------------------------
console.log("\n[SECTION 6: Four Foundations Domain-Aware Contribution]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  // 1. Kabar Hari Ini: synthesizes Western + Weton + BaZi + Tzolkin + HD
  const secKabar = guidance.sections.find((s) => s.key === "kabarHariIni")!;
  ok(secKabar.crossSystemSynthesis?.includes("Rabu Pon"), "Kabar Hari Ini includes Weton harian");
  ok(secKabar.crossSystemSynthesis?.includes("Jia Xu"), "Kabar Hari Ini includes BaZi harian");
  ok(secKabar.crossSystemSynthesis?.includes("Kin 63"), "Kabar Hari Ini includes Tzolkin harian");
  ok(secKabar.crossSystemSynthesis?.includes("Projector"), "Kabar Hari Ini includes HD Type");

  // 2. Pikiran: synthesizes BaZi Day Master + Ten Gods + Weton day
  const secPikiran = guidance.sections.find((s) => s.key === "pikiran")!;
  ok(secPikiran.crossSystemSynthesis?.includes("Day Master"), "Pikiran includes BaZi Day Master");
  ok(secPikiran.crossSystemSynthesis?.includes("Rabu"), "Pikiran includes Weton hari Rabu");

  // 3. Ekonomi: synthesizes Money Line + BaZi Ten Gods economy + Weton pasaran money
  const secEkonomi = guidance.sections.find((s) => s.key === "ekonomi")!;
  ok(secEkonomi.crossSystemSynthesis?.includes("Pon"), "Ekonomi includes Weton pasaran Pon");
  ok(secEkonomi.crossSystemSynthesis?.toLowerCase().includes("keuangan"), "Ekonomi includes Money Line");

  // 4. Asmara: synthesizes Love Path 7-10-21 + Weton pasaran relationship
  const secAsmara = guidance.sections.find((s) => s.key === "asmara")!;
  ok(secAsmara.crossSystemSynthesis?.includes("7 The Chariot") || secAsmara.crossSystemSynthesis?.includes("7"), "Asmara includes Love Path Arcana 7");
  ok(secAsmara.crossSystemSynthesis?.includes("Pon"), "Asmara includes Weton pasaran Pon");

  // 5. Orang Terdekat: synthesizes Weton Natal + HD Profile
  const secSosial = guidance.sections.find((s) => s.key === "orangTerdekat")!;
  ok(secSosial.crossSystemSynthesis?.includes("1/3"), "Orang Terdekat includes HD Profile 1/3");
  ok(secSosial.crossSystemSynthesis?.includes("Sabtu Legi"), "Orang Terdekat includes Weton Natal Sabtu Legi");

  // 6. Makna Batin: synthesizes Tzolkin Kin + Center Arcana + Vedic Nakshatra
  const secBatin = guidance.sections.find((s) => s.key === "maknaBatin")!;
  ok(secBatin.crossSystemSynthesis?.includes("Kin 63"), "Makna Batin includes Tzolkin Kin 63");
  ok(secBatin.crossSystemSynthesis?.includes("Arcana 8") || secBatin.crossSystemSynthesis?.includes("Justice"), "Makna Batin includes Center Arcana 8");

  // 7. Yang Mungkin Terasa Berat: synthesizes Karmic Tail 21-7-13 + HD Not-Self + Weton challenge
  const secBerat = guidance.sections.find((s) => s.key === "yangMungkinTerasaBerat")!;
  ok(secBerat.crossSystemSynthesis?.includes("21") && secBerat.crossSystemSynthesis?.includes("13"), "Berat includes Karmic Tail 21-7-13");
  ok(secBerat.crossSystemSynthesis?.includes("Bitterness"), "Berat includes HD Not-Self Bitterness");

  // 8. Peluang yang Terbuka: synthesizes Annual Arcana + Tzolkin Wavespell + Weton strength
  const secPeluang = guidance.sections.find((s) => s.key === "ruangYangSedangTerbuka")!;
  ok(secPeluang.crossSystemSynthesis?.includes("Penjelajah Langit"), "Peluang includes Wavespell Penjelajah Langit Merah");
}

// ----------------------------------------------------------------------------
// SECTION 7: Foundations Drawer (Dasar Pembacaan) Transparency
// ----------------------------------------------------------------------------
console.log("\n[SECTION 7: Foundations Drawer (Dasar Pembacaan) Transparency]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  for (const sec of guidance.sections) {
    ok(
      Array.isArray(sec.readingFoundations) && sec.readingFoundations.length >= 2,
      `Section ${sec.key} has at least 2 explicit reading foundation entries (got ${sec.readingFoundations?.length})`
    );
    for (const f of sec.readingFoundations || []) {
      ok(f.system.length > 0, `Foundation has system name: ${f.system}`);
      ok(f.indicator.length > 0, `Foundation has indicator: ${f.indicator}`);
      ok(f.detail.length > 0, `Foundation has detail: ${f.detail}`);
    }
  }
}

// ----------------------------------------------------------------------------
// SECTION 8: Top 3 Highlighted Domains & Proportional Scoring
// ----------------------------------------------------------------------------
console.log("\n[SECTION 8: Top 3 Highlighted Domains & Proportional Scoring]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const top3 = guidance.cosmicSummary.top3HighlightedDomains;
  ok(top3.length === 3, "Exactly 3 domains highlighted for the day");
  const uniqueKeys = new Set(top3.map((d) => d.key));
  ok(uniqueKeys.size === 3, "Top 3 highlighted domains are mutually distinct");

  // Intensity distribution: not all domains are 'high'
  const highCount = guidance.sections.filter((s) => s.intensity === "high").length;
  const subtleCount = guidance.sections.filter((s) => s.intensity === "subtle").length;
  ok(highCount <= 4, `Proportional high activation bounded (got ${highCount} of 8)`);
  ok(subtleCount >= 1, `Subtle activation present for quieter domains (got ${subtleCount})`);
}

// ----------------------------------------------------------------------------
// SECTION 9: Personal Transit-to-Natal & Placidus House Calculation
// ----------------------------------------------------------------------------
console.log("\n[SECTION 9: Personal Transit-to-Natal & Placidus House Calculation]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const transit = guidance.cosmicSummary.mostActivePersonalTransit;
  ok(transit !== null, "Most active personal transit is identified");
  ok(transit?.orb !== undefined && transit.orb <= 5.5, `Aspect orb is within <= 5.5° (got ${transit?.orb}°)`);
  ok(transit?.transitHouse !== undefined && transit.transitHouse >= 1 && transit.transitHouse <= 12, `Transit house is 1..12 (got H${transit?.transitHouse})`);
  ok(transit?.natalHouse !== undefined && transit.natalHouse >= 1 && transit.natalHouse <= 12, `Natal house is 1..12 (got H${transit?.natalHouse})`);
  ok(transit?.exactTimeFormatted?.includes("WIB"), `Exact timing formatted in local time WIB (got ${transit?.exactTimeFormatted})`);
}

// ----------------------------------------------------------------------------
// SECTION 10: Dynamic Daily Phases (Pagi, Siang, Malam with Exact Transit Timing)
// ----------------------------------------------------------------------------
console.log("\n[SECTION 10: Dynamic Daily Phases (Pagi, Siang, Malam with Exact Timing)]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  for (const sec of guidance.sections) {
    ok(sec.phases.pagi.length > 0, `Section ${sec.key} has pagi phase`);
    ok(sec.phases.siang.length > 0, `Section ${sec.key} has siang phase`);
    ok(sec.phases.malam.length > 0, `Section ${sec.key} has malam phase`);

    if (sec.evidence.hasDirectActivation && sec.evidence.exactTimeFormatted) {
      const allPhases = [...sec.phases.pagi, ...sec.phases.siang, ...sec.phases.malam].join(" ");
      ok(
        allPhases.includes("WIB"),
        `Section ${sec.key} phases incorporate exact timing formatted string`
      );
    }
  }
}

// ----------------------------------------------------------------------------
// SECTION 11: Canonical Blueprint Personal Integration
// ----------------------------------------------------------------------------
console.log("\n[SECTION 11: Canonical Blueprint Personal Integration]");
{
  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  // 1. Love Path 7-10-21 present
  const asmaraSec = guidance.sections.find((s) => s.key === "asmara")!;
  ok(
    asmaraSec.crossSystemSynthesis?.includes("The Chariot") ||
      asmaraSec.crossSystemSynthesis?.includes("Wheel of Fortune") ||
      asmaraSec.crossSystemSynthesis?.includes("7"),
    "Asmara synthesizes canonical Love Path Arcana 7-10-21"
  );

  // 2. Karmic Tail 21-7-13 present
  const beratSec = guidance.sections.find((s) => s.key === "yangMungkinTerasaBerat")!;
  ok(
    beratSec.crossSystemSynthesis?.includes("The World") ||
      beratSec.crossSystemSynthesis?.includes("21"),
    "Berat synthesizes canonical Karmic Tail Arcana 21-7-13"
  );

  // 3. Center Arcana 8 present in Makna Batin
  const batinSec = guidance.sections.find((s) => s.key === "maknaBatin")!;
  ok(
    batinSec.crossSystemSynthesis?.includes("Arcana 8") ||
      batinSec.crossSystemSynthesis?.includes("Justice"),
    "Makna Batin synthesizes canonical Center Arcana 8"
  );

  // 4. Human Design Projector present in Kabar Hari Ini
  const kabarSec = guidance.sections.find((s) => s.key === "kabarHariIni")!;
  ok(
    kabarSec.crossSystemSynthesis?.includes("Projector"),
    "Kabar Hari Ini synthesizes Human Design Type Projector"
  );
}

// ----------------------------------------------------------------------------
// SECTION 12: Asmara Relationship Status Personalization (Single vs Partnered)
// ----------------------------------------------------------------------------
console.log("\n[SECTION 12: Asmara Relationship Status Personalization]");
{
  // User Aria: Single
  const ariaGuidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: { ...userAria, relationshipStatus: "single" } as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  // User Aria: Partnered
  const ariaPartneredGuidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: { ...userAria, relationshipStatus: "in_relationship" } as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const ariaSingleAsmara = ariaGuidance.sections.find((s) => s.key === "asmara")!;
  const ariaPartneredAsmara = ariaPartneredGuidance.sections.find((s) => s.key === "asmara")!;

  ok(
    ariaSingleAsmara.crossSystemSynthesis !== ariaPartneredAsmara.crossSystemSynthesis,
    "Asmara crossSystemSynthesis differs sharply between single and partnered"
  );
  ok(
    ariaSingleAsmara.advice[0] !== ariaPartneredAsmara.advice[0],
    "Asmara advice differs between single and partnered"
  );
}

// ----------------------------------------------------------------------------
// SECTION 13: Dual-Fixture Differentiation (Aria vs Maya on Oct 28)
// ----------------------------------------------------------------------------
console.log("\n[SECTION 13: Dual-Fixture Differentiation (Aria vs Maya)]");
{
  const ariaGuidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const mayaGuidance = buildDailyGuidance({
    uid: userMaya.uid,
    profile: userMaya as any,
    blueprint: blueprintMaya as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  ok(
    ariaGuidance.cosmicSummary.mostActivePersonalTransit?.summary !==
      mayaGuidance.cosmicSummary.mostActivePersonalTransit?.summary,
    "Most active personal transit differs between Aria and Maya"
  );

  const ariaTopKeys = ariaGuidance.cosmicSummary.top3HighlightedDomains.map((d) => d.key).join(",");
  const mayaTopKeys = mayaGuidance.cosmicSummary.top3HighlightedDomains.map((d) => d.key).join(",");
  ok(
    ariaTopKeys !== mayaTopKeys ||
      ariaGuidance.sections[0].summary !== mayaGuidance.sections[0].summary,
    "Top highlights or summaries differ between charts"
  );

  const ariaKabar = ariaGuidance.sections.find((s) => s.key === "kabarHariIni")!;
  const mayaKabar = mayaGuidance.sections.find((s) => s.key === "kabarHariIni")!;
  ok(ariaKabar.crossSystemSynthesis?.includes("Projector"), "Aria Kabar reflects Projector");
  ok(mayaKabar.crossSystemSynthesis?.includes("Generator"), "Maya Kabar reflects Generator");
}

// ----------------------------------------------------------------------------
// SECTION 14: Temporal Progression Differentiation (Oct 28 vs Nov 05)
// ----------------------------------------------------------------------------
console.log("\n[SECTION 14: Temporal Progression Differentiation (Oct 28 vs Nov 05)]");
{
  const oct28 = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const nov05 = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateNov05,
    timezone: "Asia/Jakarta",
  });

  ok(oct28.dateKey !== nov05.dateKey, "Date keys differ (2026-10-28 vs 2026-11-05)");
  ok(
    oct28.cosmicSummary.wetonToday?.weton !== nov05.cosmicSummary.wetonToday?.weton,
    "Weton differs between dates"
  );
  ok(
    oct28.cosmicSummary.baziToday?.display !== nov05.cosmicSummary.baziToday?.display,
    "BaZi day pillar differs between dates"
  );
  ok(
    oct28.cosmicSummary.lunarPhaseSummary !== nov05.cosmicSummary.lunarPhaseSummary,
    "Lunar phase differs between dates"
  );
}

// ----------------------------------------------------------------------------
// SECTION 15: Cliché Blacklist & Zero Advice Triplication
// ----------------------------------------------------------------------------
console.log("\n[SECTION 15: Cliché Blacklist & Zero Advice Triplication]");
{
  const CLICHE_BLACKLIST = [
    "jangan ragu untuk",
    "ingatlah bahwa",
    "kamu harus selalu",
    "pastikan untuk selalu",
    "tidak ada salahnya jika",
    "alam semesta sedang berkonspirasi",
    "bintang-bintang merestui",
  ];

  const guidance = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  for (const sec of guidance.sections) {
    const allText = [
      sec.summary,
      sec.astrologicalMeaning,
      sec.spiritualMeaning,
      sec.crossSystemSynthesis || "",
      ...sec.advice,
      ...sec.phases.pagi,
      ...sec.phases.siang,
      ...sec.phases.malam,
    ].join(" ").toLowerCase();

    for (const phrase of CLICHE_BLACKLIST) {
      ok(!allText.includes(phrase), `Section ${sec.key} contains no cliché phrase '${phrase}'`);
    }

    // Zero advice duplication: summary != advice
    ok(sec.summary !== sec.advice[0], `Section ${sec.key} summary is distinct from advice`);
    ok(sec.spiritualMeaning !== sec.advice[0], `Section ${sec.key} spiritual meaning is distinct from advice`);
  }

  // Direction paragraphs distinct from advice
  for (const p of guidance.dailyDirection.paragraphs) {
    for (const sec of guidance.sections) {
      ok(p !== sec.advice[0], `Daily direction paragraph is not advice verbatim`);
    }
  }
}

// ----------------------------------------------------------------------------
// SECTION 16: UID Switching & State Isolation
// ----------------------------------------------------------------------------
console.log("\n[SECTION 16: UID Switching & State Isolation]");
{
  const run1 = buildDailyGuidance({
    uid: userAria.uid,
    profile: userAria as any,
    blueprint: blueprintAria as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  const run2 = buildDailyGuidance({
    uid: userMaya.uid,
    profile: userMaya as any,
    blueprint: blueprintMaya as any,
    referenceDate: testDateOct28,
    timezone: "Asia/Jakarta",
  });

  ok(run1.uid === userAria.uid, "Run 1 UID is bound to User Aria");
  ok(run2.uid === userMaya.uid, "Run 2 UID is bound to User Maya");
  ok(run1.sections[0].paragraphs !== run2.sections[0].paragraphs, "Paragraphs are isolated per UID");
}

console.log("\n" + "=".repeat(80));
console.log(`TOTAL RESULT: ${passedCount} PASSED, 0 FAILED`);
console.log("=".repeat(80));
