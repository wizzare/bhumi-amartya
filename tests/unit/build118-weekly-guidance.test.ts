/**
 * BHUMI AMARTYA — BUILD 118
 * Personal Weekly Cosmic & Soul Guidance Test Suite
 */

import assert from "node:assert";
import fs from "node:fs";
import { computeWeeklyTimeWindow, calculateWeeklyCollectiveSky, extractNatalPlacements, calculateTransitToNatalAspects, resolveSafeTimezone } from "@/lib/weeklyGuidance/weeklyTransitCalculator";
import { buildWeeklyGuidance, extractRelationshipStatus } from "@/lib/weeklyGuidance/weeklyGuidanceEngine";
import { calculateCanonicalDestinyMatrixBlueprint } from "@/lib/engines/destinyMatrixBlueprintAdapter";
import { CURRENT_VERSION_CODE, CURRENT_VERSION_NAME } from "@/lib/config/buildInfo";
import type { ArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";

let totalPassed = 0;
let totalFailed = 0;

function ok(condition: unknown, message: string) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    totalPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    totalFailed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

const mockArsip: ArsipAkashiProfileViewModel = {
  status: "ready",
  readings: [{ id: "r1", deepNarrativeProvenance: [{ contributingSystems: ["astrology"] }] }] as any,
  rooms: [],
  soulLetters: [],
  synthesisVersion: "1.0",
  contentVersion: "1.0",
};

const userA = {
  uid: "synthetic_user_a",
  profile: { fullName: "Nanda Viandra", timezone: "Asia/Jakarta", birthDate: "1990-08-15" },
  blueprint: {
    input: { birthDate: "1990-08-15" },
    astrology: {
      sunSign: "Leo",
      moonSign: "Aries",
      ascendant: "Scorpio",
      planets: {
        Sun: { sign: "Leo", degree: 15, longitude: 135, house: 10 },
        Moon: { sign: "Aries", degree: 20, longitude: 20, house: 6 },
        Ascendant: { sign: "Scorpio", degree: 5, longitude: 215, house: 1 },
      },
      placidusHouses: {
        1: { house: 1, sign: "Scorpio", degree: 5 },
        2: { house: 2, sign: "Sagittarius", degree: 8 },
        3: { house: 3, sign: "Capricorn", degree: 14 },
        4: { house: 4, sign: "Aquarius", degree: 20 },
        5: { house: 5, sign: "Pisces", degree: 22 },
        6: { house: 6, sign: "Aries", degree: 18 },
        7: { house: 7, sign: "Taurus", degree: 5 },
        8: { house: 8, sign: "Gemini", degree: 8 },
        9: { house: 9, sign: "Cancer", degree: 14 },
        10: { house: 10, sign: "Leo", degree: 20 },
        11: { house: 11, sign: "Virgo", degree: 22 },
        12: { house: 12, sign: "Libra", degree: 18 },
      },
    },
    numerology: { number: 9, expression: 3, soulUrge: 11 },
    lifePath: { number: 9 },
    humanDesign: {
      type: "Manifestor",
      authority: "Emotional",
      profile: "5/1",
      definedCenters: ["Solar Plexus", "Throat", "Heart"],
      openCenters: ["Sacral", "Root", "G-Center"],
      notSelfTheme: "Amarah (Anger)",
      signature: "Kedamaian (Peace)",
    },
    destinyMatrix: {
      center: 8,
      loveLine: [6, 12, 18],
      moneyLine: [3, 7, 10],
      karmicTail: [18, 6, 15],
      ancestorLine: [4, 8, 12],
      talentsGreat: [1, 7, 17],
    },
    bazi: {
      dayMaster: { element: "Api", polarity: "Yang", stemPinyin: "Bing" },
    },
    vedic: {
      nakshatra: { name: "Bharani" },
      nakshatraLord: "Venus",
      moonSign: { sign: "Aries" },
    },
    weton: {
      weton: "Senin Pon",
      totalNeptu: 11,
      wuku: { name: "Warigalit" },
      pancasuda: { name: "Wasesa Segara" },
    },
    tzolkin: {
      kin: 114,
      solarSeal: { name: "Ix (Penyihir Putih)" },
      galacticTone: { name: "Resonan (7)" },
    },
  },
  arsipViewModel: mockArsip,
  referenceDate: new Date("2026-10-28T12:00:00Z"),
  timezone: "Asia/Jakarta",
};

const userB = {
  uid: "synthetic_user_b",
  profile: { fullName: "Rian Kusuma", timezone: "Asia/Jakarta", birthDate: "1988-01-05" },
  blueprint: {
    input: { birthDate: "1988-01-05" },
    astrology: {
      sunSign: "Capricorn",
      moonSign: "Cancer",
      ascendant: "Libra",
      planets: {
        Sun: { sign: "Capricorn", degree: 10, longitude: 280, house: 4 },
        Moon: { sign: "Cancer", degree: 5, longitude: 95, house: 10 },
        Ascendant: { sign: "Libra", degree: 12, longitude: 192, house: 1 },
      },
      placidusHouses: {
        1: { house: 1, sign: "Libra", degree: 12 },
        2: { house: 2, sign: "Scorpio", degree: 10 },
        3: { house: 3, sign: "Sagittarius", degree: 12 },
        4: { house: 4, sign: "Capricorn", degree: 15 },
        5: { house: 5, sign: "Aquarius", degree: 18 },
        6: { house: 6, sign: "Pisces", degree: 16 },
        7: { house: 7, sign: "Aries", degree: 12 },
        8: { house: 8, sign: "Taurus", degree: 10 },
        9: { house: 9, sign: "Gemini", degree: 12 },
        10: { house: 10, sign: "Cancer", degree: 15 },
        11: { house: 11, sign: "Leo", degree: 18 },
        12: { house: 12, sign: "Virgo", degree: 16 },
      },
    },
    numerology: { number: 4, expression: 7, soulUrge: 2 },
    lifePath: { number: 4 },
    humanDesign: {
      type: "Projector",
      authority: "Splenic",
      profile: "2/4",
      definedCenters: ["Spleen", "Ajna", "Head"],
      openCenters: ["Sacral", "Solar Plexus", "Heart", "Root"],
      notSelfTheme: "Kepahitan (Bitterness)",
      signature: "Keberhasilan (Success)",
    },
    destinyMatrix: {
      center: 12,
      loveLine: [9, 15, 6],
      moneyLine: [4, 8, 12],
      karmicTail: [12, 19, 7],
      ancestorLine: [5, 10, 15],
      talentsGreat: [2, 5, 14],
    },
    bazi: {
      dayMaster: { element: "Logam", polarity: "Yin", stemPinyin: "Xin" },
    },
    vedic: {
      nakshatra: { name: "Pushya" },
      nakshatraLord: "Saturn",
      moonSign: { sign: "Cancer" },
    },
    weton: {
      weton: "Jumat Kliwon",
      totalNeptu: 14,
      wuku: { name: "Kulawu" },
      pancasuda: { name: "Satria Wirang" },
    },
    tzolkin: {
      kin: 78,
      solarSeal: { name: "Lamat (Bintang Kuning)" },
      galacticTone: { name: "Planetari (10)" },
    },
  },
  arsipViewModel: mockArsip,
  referenceDate: new Date("2026-10-28T12:00:00Z"),
  timezone: "Asia/Jakarta",
};

console.log("================================================================================");
console.log("BHUMI AMARTYA — BUILD 118 PERSONAL WEEKLY GUIDANCE TEST SUITE");
console.log("================================================================================");

// 1. ISO Week Boundaries & Collision Prevention
{
  console.log("\n[SECTION 1: ISO Week Boundaries & Collision Prevention]");
  const oct02 = computeWeeklyTimeWindow(new Date("2026-10-02T12:00:00Z"), "Asia/Jakarta");
  const oct30 = computeWeeklyTimeWindow(new Date("2026-10-30T12:00:00Z"), "Asia/Jakarta");
  ok(oct02.weekKey === "2026-W40", "2026-10-02 is ISO week 2026-W40");
  ok(oct30.weekKey === "2026-W44", "2026-10-30 is ISO week 2026-W44");
  ok(oct02.weekKey !== oct30.weekKey, "Oct 02 and Oct 30 produce distinct week keys (no collision)");

  const newYearWeek = computeWeeklyTimeWindow(new Date("2027-01-04T12:00:00Z"), "Asia/Jakarta");
  ok(newYearWeek.weekKey === "2027-W01", "2027-01-04 begins ISO week 2027-W01 (W01 is not skipped)");

  const safeTz = resolveSafeTimezone("Invalid/Unknown_Tz");
  ok(safeTz === "Asia/Jakarta", "Invalid timezone string safely falls back to Asia/Jakarta");
}

// 2. Weekly Collective Sky Weather
{
  console.log("\n[SECTION 2: Weekly Collective Sky Weather]");
  const window = computeWeeklyTimeWindow(new Date("2026-10-28T12:00:00Z"), "Asia/Jakarta");
  const collective = calculateWeeklyCollectiveSky(window);
  ok(collective.lunarPhaseName.length > 0, "Lunar phase name is calculated");
  ok(collective.lunarIlluminationPct >= 0 && collective.lunarIlluminationPct <= 100, "Lunar illumination percentage is bounded between 0 and 100");
  ok(collective.motions.length === 8, "Planetary motions check all 8 planets Mercury through Pluto");
  ok(collective.retrogradePlanets.length > 0, "Retrograde planets detected in late October 2026");
  ok(collective.collectiveTheme.length > 20, "Collective energetic theme is synthesized");
}

// 3. Transit-to-Natal Calculations
{
  console.log("\n[SECTION 3: Transit-to-Natal Calculations]");
  const window = computeWeeklyTimeWindow(new Date("2026-10-28T12:00:00Z"), "Asia/Jakarta");
  const { placements, placidusHouses } = extractNatalPlacements(userA.blueprint);
  ok(placements.length >= 3, "Natal placements extracted (Sun, Moon, Ascendant)");
  ok(placidusHouses.length === 12, "Placidus houses extracted (12 houses)");

  const aspects = calculateTransitToNatalAspects(window, placements, placidusHouses);
  ok(aspects.length > 0, "Active transit-to-natal aspects found");
  const top = aspects[0];
  ok(top.transitHouse >= 1 && top.transitHouse <= 12, "Transit planet Placidus house is 1..12");
  ok(top.natalPlacement.house >= 1 && top.natalPlacement.house <= 12, "Natal placement Placidus house is 1..12");
  ok(top.orb <= 5.5, "Aspect orb is strictly within limit <= 5.5°");
  ok(["applying", "exact", "separating"].includes(top.nature), "Aspect nature is applying, exact, or separating");
}

// 4. Eight Domains Mapping
{
  console.log("\n[SECTION 4: Eight Domains Mapping]");
  const res = buildWeeklyGuidance(userA);
  ok(res.sections.length === 8, "Exactly 8 life domains are produced");

  const expectedKeys = [
    "kabarMingguIni", "pikiran", "ekonomi", "asmara",
    "orangTerdekat", "maknaBatin", "yangMungkinTerasaBerat", "ruangYangSedangTerbuka"
  ];
  const keys = res.sections.map((s) => s.key);
  ok(expectedKeys.every((k) => keys.includes(k)), "All 8 canonical domain keys are present");

  for (const sec of res.sections) {
    ok(sec.evidence.activationSummary.length > 10, `${sec.title} has explicit activation summary`);
    ok(sec.astrologicalMeaning.length > 20, `${sec.title} has astrological meaning`);
    ok(sec.spiritualMeaning.length > 20, `${sec.title} has spiritual meaning`);
    ok(sec.advice.length > 0 && sec.advice[0].length > 10, `${sec.title} has specific Saran Bhumi`);
    ok(sec.phases.awalPekan.length > 0, `${sec.title} has awalPekan phase`);
    ok(sec.phases.tengahPekan.length > 0, `${sec.title} has tengahPekan phase`);
    ok(sec.phases.akhirPekan.length > 0, `${sec.title} has akhirPekan phase`);
  }
}

// 5. User A vs User B Differentiation
{
  console.log("\n[SECTION 5: Two Different Users Differentiation]");
  const resA = buildWeeklyGuidance(userA);
  const resB = buildWeeklyGuidance(userB);

  ok(resA.cosmicSummary.mostActivePersonalTransit?.summary !== resB.cosmicSummary.mostActivePersonalTransit?.summary,
    "User A and User B have different most active transits");
  ok(resA.sections[0].evidence.activationSummary !== resB.sections[0].evidence.activationSummary,
    "User A and User B have different Kabar Minggu Ini astrological evidence");
  ok(JSON.stringify(resA.sections) !== JSON.stringify(resB.sections),
    "User A and User B produce distinct, non-generic readings");
}

// 6. Missing Birth Data Fallback
{
  console.log("\n[SECTION 6: Missing Birth Data Fallback]");
  const userEmpty = {
    ...userA,
    blueprint: { astrology: {} },
  };
  const resEmpty = buildWeeklyGuidance(userEmpty);
  ok(resEmpty.state === "limited", "User without natal placements receives state 'limited'");
  ok(resEmpty.sections.length === 8, "8 domains still render with calm fallback");
}

// 7. Spiritual Safety & Ethical Restraint
{
  console.log("\n[SECTION 7: Spiritual Safety & Ethical Restraint]");
  const res = buildWeeklyGuidance(userA);
  const fullText = JSON.stringify(res).toLowerCase();

  const forbiddenPsychiatric = ["depresi klinis", "bipolar", "skizofrenia", "gangguan jiwa"];
  for (const term of forbiddenPsychiatric) {
    ok(!fullText.includes(term), `No clinical psychiatric diagnosis (${term})`);
  }

  const forbiddenSupernatural = ["kutukan", "serangan gaib", "santet", "entitas jahat"];
  for (const term of forbiddenSupernatural) {
    ok(!fullText.includes(term), `No supernatural fearmongering (${term})`);
  }

  const forbiddenMedical = ["hentikan obat", "tinggalkan terapi"];
  for (const term of forbiddenMedical) {
    ok(!fullText.includes(term), `No advice to stop medical treatment (${term})`);
  }
}

// 8. Zero Chinese Characters & Glitch Artifacts
{
  console.log("\n[SECTION 8: Zero Typo / Chinese Character Artifacts]");
  const resA = buildWeeklyGuidance(userA);
  const resB = buildWeeklyGuidance(userB);
  const fullContent = JSON.stringify(resA) + JSON.stringify(resB);
  const hasChinese = /[\u4e00-\u9fa5]/.test(fullContent);
  ok(!hasChinese, "Zero Chinese characters or copy artifacts in output (clean Indonesian)");
}

// 9. Build 118 Versioning & Release Metadata
{
  console.log("\n[SECTION 9: Build 118 Versioning & Release Metadata]");
  ok(CURRENT_VERSION_CODE === 118, "CURRENT_VERSION_CODE is 118");
  ok(CURRENT_VERSION_NAME === "5.0.18", "CURRENT_VERSION_NAME is 5.0.18");
}

// 10. Vertical Accordion Domain Cards UI Verification
{
  console.log("\n[SECTION 10: Vertical Accordion Domain Cards UI Verification]");
  const cardCode = fs.readFileSync("components/dashboard/WeeklyGuidanceCard.tsx", "utf8");
  const dashCode = fs.readFileSync("components/dashboard/DashboardClient.tsx", "utf8");

  ok(!cardCode.includes("overflow-x-auto"), "WeeklyGuidanceCard has removed horizontal pill tab overflow");
  ok(cardCode.includes("aria-expanded={isOpen}"), "WeeklyGuidanceCard has accessible aria-expanded attribute");
  ok(cardCode.includes("aria-controls="), "WeeklyGuidanceCard has accessible aria-controls attribute");
  ok(cardCode.includes("id={`weekly-domain-${sec.key}`}"), "WeeklyGuidanceCard renders unique domain card anchors");
  ok(cardCode.includes("id={`domain-panel-${sec.key}`}"), "WeeklyGuidanceCard renders expandable accordion panels");
  ok(cardCode.includes("DomainIcon"), "WeeklyGuidanceCard renders domain icon component");
  ok(dashCode.includes("grid-cols-1 gap-2 sm:grid-cols-3"), "DashboardClient stacks 3-domain summary vertically on mobile");
  ok(dashCode.includes("setWeeklyExpandedDomainKey(d.key)"), "DashboardClient wires 3-domain summary click to open accordion");
}

// 11. Cross-System Synthesis & Canonical Depth Verification
{
  console.log("\n[SECTION 11: Cross-System Synthesis & Canonical Depth Verification]");
  const resA = buildWeeklyGuidance(userA);
  const resB = buildWeeklyGuidance(userB);

  // Check every section has synthesis and technical drawer
  for (const sec of resA.sections) {
    ok(typeof sec.crossSystemSynthesis === "string" && sec.crossSystemSynthesis.length > 40,
      `User A ${sec.title} has rich crossSystemSynthesis (${sec.crossSystemSynthesis?.length} chars)`);
    ok(Array.isArray(sec.readingFoundations) && sec.readingFoundations.length >= 2,
      `User A ${sec.title} has >= 2 technical reading foundations (${sec.readingFoundations?.length} entries)`);
  }

  // User A specific canonical indicators in narrative
  const asmaraA = resA.sections.find((s) => s.key === "asmara")!;
  const fullAsmaraA = JSON.stringify(asmaraA);
  ok(fullAsmaraA.includes("6–12–18") || fullAsmaraA.includes("6-12-18") || fullAsmaraA.includes("Love Path") || fullAsmaraA.includes("Garis Cinta"),
    "User A Asmara explicitly weaves Destiny Matrix Love Line / Love Path (6-12-18)");
  ok(fullAsmaraA.toLowerCase().includes("emotional") || fullAsmaraA.toLowerCase().includes("solar plexus") || fullAsmaraA.toLowerCase().includes("emosi"),
    "User A Asmara weaves Human Design emotional/solar plexus dynamics");

  const ekonomiA = resA.sections.find((s) => s.key === "ekonomi")!;
  const fullEkonomiA = JSON.stringify(ekonomiA);
  ok(fullEkonomiA.includes("3-7-10") || fullEkonomiA.includes("Money Line") || fullEkonomiA.includes("Arcana"),
    "User A Ekonomi explicitly weaves Destiny Matrix Money Line (3-7-10)");

  const beratA = resA.sections.find((s) => s.key === "yangMungkinTerasaBerat")!;
  const fullBeratA = JSON.stringify(beratA);
  ok(fullBeratA.includes("18-6-15") || fullBeratA.includes("Karmic Tail"),
    "User A Yang Mungkin Terasa Berat explicitly weaves Destiny Matrix Karmic Tail (18-6-15)");
  ok(fullBeratA.includes("Amarah") || fullBeratA.includes("Not-Self"),
    "User A Yang Mungkin Terasa Berat explicitly weaves Human Design Not-Self theme (Amarah)");

  // User B specific canonical indicators in narrative
  const asmaraB = resB.sections.find((s) => s.key === "asmara")!;
  const fullAsmaraB = JSON.stringify(asmaraB);
  ok(fullAsmaraB.includes("9–15–6") || fullAsmaraB.includes("9-15-6") || fullAsmaraB.includes("Love Path") || fullAsmaraB.includes("Garis Cinta"),
    "User B Asmara explicitly weaves Destiny Matrix Love Line / Love Path (9-15-6)");

  const beratB = resB.sections.find((s) => s.key === "yangMungkinTerasaBerat")!;
  const fullBeratB = JSON.stringify(beratB);
  ok(fullBeratB.includes("12-19-7") || fullBeratB.includes("Karmic Tail"),
    "User B Yang Mungkin Terasa Berat explicitly weaves Destiny Matrix Karmic Tail (12-19-7)");
  ok(fullBeratB.includes("Kepahitan") || fullBeratB.includes("Not-Self"),
    "User B Yang Mungkin Terasa Berat explicitly weaves Human Design Not-Self theme (Kepahitan)");
}

// 12. Narrative Quality & Anti-Template Humanization Verification
{
  console.log("\n[SECTION 12: Narrative Quality & Anti-Template Humanization Verification]");
  const resA = buildWeeklyGuidance(userA);
  const resB = buildWeeklyGuidance(userB);
  const combinedA = JSON.stringify(resA);
  const combinedB = JSON.stringify(resB);
  const allProse = combinedA + " " + combinedB;

  // 1. No awkward duplicate houses ("rumah ke-9 dan rumah ke-9" or "rumah ke-X dan ke-X")
  const dupHouseRegex = /rumah ke-(\d+) dan (?:rumah )?ke-\1\b/i;
  ok(!dupHouseRegex.test(allProse), "No awkward duplicate houses ('rumah ke-X dan rumah ke-X') in generated guidance");

  // 2. No repetitive AI boilerplate formulas
  const forbiddenBoilerplates = [
    "awal pekan dimulai dengan kesadaran penuh terhadap",
    "arus keuangan terhubung dengan rumah",
    "kosmos mengarahkan kita",
    "bagi perjalanan jiwamu",
    "setiap transit adalah cermin kesadaran",
    "kesempatan suci untuk melangkah lebih bijaksana",
  ];
  for (const formula of forbiddenBoilerplates) {
    ok(!allProse.toLowerCase().includes(formula), `Output is free of repetitive AI boilerplate: "${formula}"`);
  }

  // 3. Collective sky retrograde format check
  const collective = calculateWeeklyCollectiveSky(computeWeeklyTimeWindow(new Date("2026-10-28T12:00:00Z"), "Asia/Jakarta"));
  ok(!collective.collectiveTheme.includes("5 retrograde (Merkurius, Venus, Saturnus)"),
    "Retrograde theme in collective sky does not have truncated awkward slice");

  // 4. Foundations Drawer verification in UI code
  const cardSource = fs.readFileSync("components/dashboard/WeeklyGuidanceCard.tsx", "utf8");
  ok(cardSource.includes("<details"), "WeeklyGuidanceCard contains HTML5 <details> foundations drawer");
  ok(cardSource.includes("Dasar Pembacaan (Indikator Sistem yang Digunakan)"),
    "WeeklyGuidanceCard labels foundations drawer accurately");
  ok(cardSource.includes("f.system") && cardSource.includes("f.indicator"),
    "WeeklyGuidanceCard renders system and indicator chips in drawer");
}

// 13. Canonical Love Path Data Integrity (Founder Issue & Fixtures)
{
  console.log("\n[SECTION 13: Canonical Love Path Data Integrity & Non-Generic Arcana Interpretation]");

  // 13.1 Canonical Destiny Matrix Engine directly for Founder date 1985-05-03
  const founderDM = calculateCanonicalDestinyMatrixBlueprint("1985-05-03");
  ok(Array.isArray(founderDM?.loveLine), "Canonical Destiny Matrix returns array loveLine");
  ok(
    founderDM?.loveLine?.[0] === 7 &&
    founderDM?.loveLine?.[1] === 10 &&
    founderDM?.loveLine?.[2] === 21,
    `Founder birth date (1985-05-03) resolves to canonical Love Path [7, 10, 21], got [${founderDM?.loveLine?.join(", ")}]`
  );

  // 13.2 Legacy cached blueprint with prepended center [8, 10, 7] gets hydrated to [7, 10, 21]
  const userFounderLegacy = {
    uid: "founder_account",
    profile: { fullName: "Founder", timezone: "Asia/Jakarta", birthDate: "1985-05-03" },
    blueprint: {
      input: { birthDate: "1985-05-03" },
      astrology: userA.blueprint.astrology,
      numerology: { number: 4, expression: 8, soulUrge: 1 },
      humanDesign: { type: "Projector", authority: "Splenic" },
      destinyMatrix: {
        center: 8,
        loveLine: [8, 10, 7], // The legacy bug that triggered the Founder directive!
        moneyLine: [8, 10, 21],
        karmicTail: [18, 6, 15],
      },
    },
    arsipViewModel: mockArsip,
    referenceDate: new Date("2026-10-28T12:00:00Z"),
    timezone: "Asia/Jakarta",
  };

  const resFounder = buildWeeklyGuidance(userFounderLegacy);
  const asmaraFounder = resFounder.sections.find((s) => s.key === "asmara")!;
  const fullAsmaraFounder = JSON.stringify(asmaraFounder);

  // Verify it healed [8, 10, 7] into [7, 10, 21]
  ok(fullAsmaraFounder.includes("7–10–21") || fullAsmaraFounder.includes("7-10-21"),
    "Weekly Guidance heals legacy [8, 10, 7] into canonical Love Path 7–10–21");
  ok(!fullAsmaraFounder.includes("8–10–7") && !fullAsmaraFounder.includes("8-10-7"),
    "Weekly Guidance strictly eliminates the legacy bug string '8–10–7'");

  // Verify non-generic Arcana narrative for 7-10-21
  ok(fullAsmaraFounder.includes("The Chariot") || fullAsmaraFounder.includes("Arcana 7"),
    "Narrative for 7-10-21 reflects Arcana 7 The Chariot");
  ok(fullAsmaraFounder.includes("Wheel of Fortune") || fullAsmaraFounder.includes("Arcana 10"),
    "Narrative for 7-10-21 reflects Arcana 10 Wheel of Fortune");
  ok(fullAsmaraFounder.includes("The World") || fullAsmaraFounder.includes("Arcana 21"),
    "Narrative for 7-10-21 reflects Arcana 21 The World");

  // Zero recycled sacrifice text from 6-12-18
  ok(!fullAsmaraFounder.includes("pola pengorbanan sepihak"),
    "Love Path 7-10-21 does NOT recycle generic 'pola pengorbanan sepihak' narrative");

  // 13.3 Fixture with [6, 12, 18] correctly receives Lovers / Hanged Man / Moon interpretation
  const userFixture61218 = {
    uid: "user_61218",
    profile: { fullName: "User 6-12-18", timezone: "Asia/Jakarta", birthDate: "1990-08-15" },
    blueprint: {
      input: { birthDate: "1990-08-15" },
      astrology: userA.blueprint.astrology,
      destinyMatrix: {
        center: 8,
        loveLine: [6, 12, 18],
      },
    },
    arsipViewModel: mockArsip,
    referenceDate: new Date("2026-10-28T12:00:00Z"),
    timezone: "Asia/Jakarta",
  };
  const res61218 = buildWeeklyGuidance(userFixture61218);
  const asmara61218 = res61218.sections.find((s) => s.key === "asmara")!;
  const fullAsmara61218 = JSON.stringify(asmara61218);

  ok(fullAsmara61218.includes("6–12–18") || fullAsmara61218.includes("6-12-18"),
    "Fixture 6-12-18 renders canonical Love Path 6–12–18");
  ok(fullAsmara61218.includes("The Lovers") || fullAsmara61218.includes("Arcana 6"),
    "Fixture 6-12-18 reflects Arcana 6 The Lovers");
  ok(fullAsmara61218.includes("The Hanged Man") || fullAsmara61218.includes("Arcana 12"),
    "Fixture 6-12-18 reflects Arcana 12 The Hanged Man");
  ok(fullAsmara61218.includes("The Moon") || fullAsmara61218.includes("Arcana 18"),
    "Fixture 6-12-18 reflects Arcana 18 The Moon");
}

// 14. Asmara Single vs Berpasangan vs Unspecified Personalization
{
  console.log("\n[SECTION 14: Asmara Single vs Berpasangan vs Unspecified Personalization]");

  // 14.1 Helper extractRelationshipStatus resolution
  ok(extractRelationshipStatus("single") === "single", "extractRelationshipStatus('single') => 'single'");
  ok(extractRelationshipStatus("lajang") === "single", "extractRelationshipStatus('lajang') => 'single'");
  ok(extractRelationshipStatus("in_relationship") === "in_relationship", "extractRelationshipStatus('in_relationship') => 'in_relationship'");
  ok(extractRelationshipStatus("berpasangan") === "in_relationship", "extractRelationshipStatus('berpasangan') => 'in_relationship'");
  ok(extractRelationshipStatus("married") === "in_relationship", "extractRelationshipStatus('married') => 'in_relationship'");
  ok(extractRelationshipStatus(undefined, { relationshipStatus: "single" }) === "single",
    "extractRelationshipStatus resolves profile.relationshipStatus");
  ok(extractRelationshipStatus(undefined, { statusHubungan: "berpasangan" }) === "in_relationship",
    "extractRelationshipStatus resolves profile.statusHubungan");
  ok(extractRelationshipStatus(undefined, { settings: { relationshipStatus: "single" } }) === "single",
    "extractRelationshipStatus resolves profile.settings.relationshipStatus");
  ok(extractRelationshipStatus(undefined, {}) === "unspecified",
    "extractRelationshipStatus defaults safely to 'unspecified'");

  // 14.2 Single user test
  const resSingle = buildWeeklyGuidance({
    ...userA,
    relationshipStatus: "single",
  });
  ok(resSingle.relationshipStatus === "single", "Weekly guidance top-level reflects relationshipStatus 'single'");
  const asmaraSingle = resSingle.sections.find((s) => s.key === "asmara")!;
  const textSingle = JSON.stringify(asmaraSingle).toLowerCase();

  ok(textSingle.includes("mandiri") || textSingle.includes("lajang"),
    "Single Asmara narrative explicitly recognizes single/mandiri phase");
  ok(textSingle.includes("kesiapan") || textSingle.includes("pola") || textSingle.includes("luka"),
    "Single Asmara explores readiness, selection pattern, and emotional shadow work");
  ok(!textSingle.includes("pasti datang") && !textSingle.includes("jodoh akan tiba"),
    "Single Asmara does NOT make false promises of a partner arriving this week");
  ok(asmaraSingle.readingFoundations?.some((f) => f.system === "Status Hubungan" && f.indicator.includes("Lajang")),
    "Single Asmara includes Status Hubungan foundation entry");

  // 14.3 In-relationship user test
  const resPartnered = buildWeeklyGuidance({
    ...userA,
    relationshipStatus: "in_relationship",
  });
  ok(resPartnered.relationshipStatus === "in_relationship", "Weekly guidance top-level reflects relationshipStatus 'in_relationship'");
  const asmaraPartnered = resPartnered.sections.find((s) => s.key === "asmara")!;
  const textPartnered = JSON.stringify(asmaraPartnered).toLowerCase();

  ok(textPartnered.includes("berpasangan"),
    "Partnered Asmara narrative explicitly recognizes in_relationship phase");
  ok(textPartnered.includes("komunikasi") || textPartnered.includes("keintiman") || textPartnered.includes("komitmen"),
    "Partnered Asmara explores communication, intimacy, and commitment dynamics");
  ok(!textPartnered.includes("selingkuh") && !textPartnered.includes("bercerai") && !textPartnered.includes("putus hubungan") && !/\bputus\b/.test(textPartnered.replace(/keputusan/g, "")),
    "Partnered Asmara does NOT accuse partner of infidelity or predict breakups");
  ok(asmaraPartnered.readingFoundations?.some((f) => f.system === "Status Hubungan" && f.indicator.includes("Berpasangan")),
    "Partnered Asmara includes Status Hubungan foundation entry");

  // 14.4 Unspecified status test (neutral, universal reflection)
  const resUnspecified = buildWeeklyGuidance({
    ...userA,
    relationshipStatus: "unspecified",
  });
  ok(resUnspecified.relationshipStatus === "unspecified", "Weekly guidance defaults to 'unspecified'");
  const asmaraUnspecified = resUnspecified.sections.find((s) => s.key === "asmara")!;
  const textUnspecified = JSON.stringify(asmaraUnspecified).toLowerCase();

  ok(textUnspecified.includes("kerentanan") || textUnspecified.includes("kehangatan"),
    "Unspecified Asmara provides rich, universal reflection on intimate connection");
  ok(!textUnspecified.includes("fase mandiri") && !textUnspecified.includes("sedang berpasangan"),
    "Unspecified Asmara does not make forced assumptions about single vs partnered");

  // 14.5 Single vs Partnered distinctness with IDENTICAL astrological chart
  ok(asmaraSingle.astrologicalMeaning !== asmaraPartnered.astrologicalMeaning,
    "Single and Partnered have distinct astrological meanings for identical charts");
  ok(asmaraSingle.spiritualMeaning !== asmaraPartnered.spiritualMeaning,
    "Single and Partnered have distinct spiritual meanings for identical charts");
  ok(asmaraSingle.advice[0] !== asmaraPartnered.advice[0],
    "Single and Partnered have distinct actionable advice for identical charts");
}

// 15. Targeted Verification Matrix: UID Isolation, Profile Storage, and Zero Regression
{
  console.log("\n[SECTION 15: Targeted Verification Matrix: UID Isolation & Profile Storage]");

  // 15.1 Settings Page UI Contract: Status Hubungan options
  const settingsSource = fs.readFileSync("app/settings/page.tsx", "utf8");
  ok(settingsSource.includes("Status Hubungan"), "Settings page contains 'Status Hubungan' label");
  ok(settingsSource.includes("single") && settingsSource.includes("in_relationship") && settingsSource.includes("unspecified"),
    "Settings page contains Single, Berpasangan, and Tidak ingin menyebutkan options");
  ok(settingsSource.includes("setRelationshipStatus"), "Settings page manages relationshipStatus in state");
  ok(settingsSource.includes("relationshipStatus: relationshipStatus"), "Settings page includes relationshipStatus in saved profile");

  // 15.2 UID switching: Account isolation between user_1 and user_2
  const user1 = {
    ...userA,
    uid: "user_alpha_1",
    profile: { ...userA.profile, uid: "user_alpha_1", relationshipStatus: "single" as const },
    relationshipStatus: "single" as const,
  };
  const user2 = {
    ...userB,
    uid: "user_beta_2",
    profile: { ...userB.profile, uid: "user_beta_2", relationshipStatus: "in_relationship" as const },
    relationshipStatus: "in_relationship" as const,
  };

  const resUser1 = buildWeeklyGuidance(user1);
  const resUser2 = buildWeeklyGuidance(user2);

  ok(resUser1.uid === "user_alpha_1", "User 1 guidance bound to user_alpha_1");
  ok(resUser1.relationshipStatus === "single", "User 1 guidance reflects status 'single'");
  ok(resUser2.uid === "user_beta_2", "User 2 guidance bound to user_beta_2");
  ok(resUser2.relationshipStatus === "in_relationship", "User 2 guidance reflects status 'in_relationship'");
  ok(resUser1.synthesisFingerprint !== resUser2.synthesisFingerprint,
    "Distinct synthesis fingerprints prevent cross-user cache collisions");

  // 15.3 Profile Repository Persistence Schema Contract
  const userRepoSource = fs.readFileSync("lib/repositories/userRepository.ts", "utf8");
  ok(userRepoSource.includes('relationshipStatus?: "single" | "in_relationship" | "unspecified" | null'),
    "userRepository UserProfile type declares canonical relationshipStatus");

  const firebaseServiceSource = fs.readFileSync("lib/firebase/service.ts", "utf8");
  ok(firebaseServiceSource.includes('relationshipStatus?: "single" | "in_relationship" | "unspecified" | null'),
    "firebase/service UserProfile interface declares canonical relationshipStatus");

  const localBlueprintSource = fs.readFileSync("lib/local/generateLocalBlueprint.ts", "utf8");
  ok(localBlueprintSource.includes('relationshipStatus?: "single" | "in_relationship" | "unspecified" | null'),
    "generateLocalBlueprint LocalUserProfile type declares canonical relationshipStatus");

  // 15.4 DashboardClient Hydration Guard
  const dashClientSource = fs.readFileSync("components/dashboard/DashboardClient.tsx", "utf8");
  ok(dashClientSource.includes("isLegacyLoveLine"), "DashboardClient contains legacy Love Line detection guard");
  ok(dashClientSource.includes("calculateCanonicalDestinyMatrixBlueprint(birthDate)"),
    "DashboardClient self-heals legacy destinyMatrix via canonical calculator");

  // SECTION 16: Activation Intensity Distribution, Summary Differentiation & Phase Dynamics
  console.log("\n[SECTION 16: Activation Intensity Distribution, Summary Differentiation & Phase Dynamics]");
  
  const highCount = resUser1.sections.filter((s) => s.intensity === "high").length;
  const mediumCount = resUser1.sections.filter((s) => s.intensity === "medium").length;
  const subtleCount = resUser1.sections.filter((s) => s.intensity === "subtle").length;

  ok(highCount < 8, `Not all domains are marked high intensity (high: ${highCount}, med: ${mediumCount}, subtle: ${subtleCount})`);
  ok(subtleCount > 0 || mediumCount > 0, "Proportional scoring produces subtle or medium activations");

  for (const s of resUser1.sections) {
    ok(typeof s.summary === "string" && s.summary.length > 10, `Domain ${s.key} has rich summary`);
    ok(s.summary !== s.advice[0], `Domain ${s.key} summary is distinct from advice[0] (no triple duplication)`);
    ok(s.phases.awalPekan.length > 0, `Domain ${s.key} has awalPekan phase`);
    ok(s.phases.tengahPekan.length > 0, `Domain ${s.key} has tengahPekan phase`);
    ok(s.phases.akhirPekan.length > 0, `Domain ${s.key} has akhirPekan phase`);
  }

  const weeklyGuidanceCardSource = fs.readFileSync("components/dashboard/WeeklyGuidanceCard.tsx", "utf8");
  ok(weeklyGuidanceCardSource.includes("sec.summary"), "WeeklyGuidanceCard renders sec.summary in header preview");
  ok(!weeklyGuidanceCardSource.includes("sec.advice[0]"), "WeeklyGuidanceCard does NOT use advice[0] as summary preview");
}

console.log("\n================================================================================");
console.log(`TOTAL RESULT: ${totalPassed} PASSED, ${totalFailed} FAILED`);
console.log("================================================================================");
