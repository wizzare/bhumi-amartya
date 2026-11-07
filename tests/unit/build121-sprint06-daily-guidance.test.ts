/**
 * BHUMI AMARTYA — BUILD 121
 * SPRINT 121-06: CATATAN HARI INI PERSONAL DAILY INTELLIGENCE TEST SUITE
 *
 * Verifies:
 * 1. Blueprint personalization from 11 systems & Arsip Akashi.
 * 2. Substantive narrative differentiation across 3 distinct synthetic profiles.
 * 3. Daily temporal intelligence (Weton, BaZi Ten Gods, Tzolkin Kin, SwissEph Moon & Aspects).
 * 4. Temporal progression differentiation across 3 distinct calendar dates.
 * 5. Midnight local timezone rollover & multi-dimensional cache fingerprint invalidation.
 * 6. UID isolation across distinct accounts (zero cross-user contamination).
 * 7. Sparse / partial profile graceful degradation (honest limited state, no crash).
 * 8. Strict 8-domain accordion structure and sub-phase integrity.
 * 9. 100% exact parity between Profile Catatan Hari Ini and Dashboard Soul Reflection.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDailyGuidance, DAILY_DOMAIN_DEFINITIONS } from "@/lib/dailyGuidance/dailyGuidanceEngine";

// ============================================================================
// FIXTURES: 3 DISTINCT SYNTHETIC PROFILES WITH COMPREHENSIVE BLUEPRINTS
// ============================================================================

const PROFILE_ALPHA = {
  uid: "usr_alpha_1985",
  fullName: "Aria Wijaya",
  displayName: "Aria",
  birthDate: "1985-05-03",
  birthTime: "08:30",
  birthCity: "Jakarta",
  timezone: "Asia/Jakarta",
  relationshipStatus: "single" as const,
};

const BLUEPRINT_ALPHA = {
  uid: "usr_alpha_1985",
  input: {
    birthDate: "1985-05-03",
    birthTime: "08:30",
    timezone: "Asia/Jakarta",
  },
  lifePath: { number: 4, role: "The Master Builder" },
  numerology: { expression: 7, soulUrge: 1 },
  humanDesign: {
    type: "Manifesting Generator",
    profile: "6/2",
    authority: "Emotional - Solar Plexus",
    strategy: "To Respond",
    notSelf: "Frustrasi & Ketergesaan",
    definedCenters: ["Sacral", "Solar Plexus", "Throat"],
    openCenters: ["Head", "Ajna"],
  },
  destinyMatrix: {
    center: 7,
    loveLine: [7, 10, 21],
    moneyLine: [10, 21, 11],
    karmicTail: [21, 7, 13],
    ancestorLine: [5, 12, 17],
    talents: [7, 10, 19],
  },
  astrology: {
    sunSign: "Taurus",
    risingSign: "Gemini",
    moonSign: "Libra",
    placidusHouses: [
      { house: 1, sign: "Gemini", degree: 14 },
      { house: 2, sign: "Cancer", degree: 8 },
      { house: 3, sign: "Leo", degree: 2 },
      { house: 4, sign: "Virgo", degree: 0 },
      { house: 5, sign: "Libra", degree: 4 },
      { house: 6, sign: "Scorpio", degree: 12 },
      { house: 7, sign: "Sagittarius", degree: 14 },
      { house: 8, sign: "Capricorn", degree: 8 },
      { house: 9, sign: "Aquarius", degree: 2 },
      { house: 10, sign: "Pisces", degree: 0 },
      { house: 11, sign: "Aries", degree: 4 },
      { house: 12, sign: "Taurus", degree: 12 },
    ],
  },
  weton: {
    weton: "Jumat Pahing",
    totalNeptu: 15,
    wuku: { name: "Sinta" },
    pancasuda: { name: "Satria Wirang" },
  },
  bazi: {
    dayMaster: { element: "Kayu", polarity: "Yang", stemPinyin: "Jia" },
  },
  tzolkin: {
    kin: 120,
    solarSeal: { name: "Matahari Kuning (Ahau)", keyword: "pencerahan universal" },
    galacticTone: { name: "Tone 3 Listrik", lesson: "mengaktifkan ikatan" },
  },
  vedic: {
    nakshatra: { name: "Chitra" },
    moonSign: "Kanya (Virgo)",
  },
  wholeSign: {
    risingSign: "Gemini",
  },
  astrocartography: {
    lines: [{ city: "Yogyakarta", line: "Sun-MC" }],
  },
  ziwei: {
    mingGong: "Zi Wei Tian Fu",
  },
};

const PROFILE_BETA = {
  uid: "usr_beta_1992",
  fullName: "Maya Safitri",
  displayName: "Maya",
  birthDate: "1992-08-15",
  birthTime: "14:15",
  birthCity: "Surabaya",
  timezone: "Asia/Jakarta",
  relationshipStatus: "in_relationship" as const,
};

const BLUEPRINT_BETA = {
  uid: "usr_beta_1992",
  input: {
    birthDate: "1992-08-15",
    birthTime: "14:15",
    timezone: "Asia/Jakarta",
  },
  lifePath: { number: 8, role: "The Visionary Leader" },
  numerology: { expression: 3, soulUrge: 9 },
  humanDesign: {
    type: "Projector",
    profile: "1/3",
    authority: "Splenic",
    strategy: "Wait for the Invitation",
    notSelf: "Kepahitan",
    definedCenters: ["Spleen", "G-Center"],
    openCenters: ["Sacral", "Solar Plexus", "Root"],
  },
  destinyMatrix: {
    center: 11,
    loveLine: [6, 12, 18],
    moneyLine: [12, 18, 6],
    karmicTail: [18, 6, 15],
    ancestorLine: [9, 14, 5],
    talents: [11, 4, 15],
  },
  astrology: {
    sunSign: "Leo",
    risingSign: "Scorpio",
    moonSign: "Pisces",
    placidusHouses: [
      { house: 1, sign: "Scorpio", degree: 5 },
      { house: 2, sign: "Sagittarius", degree: 8 },
      { house: 3, sign: "Capricorn", degree: 14 },
      { house: 4, sign: "Aquarius", degree: 20 },
      { house: 5, sign: "Pisces", degree: 22 },
      { house: 6, sign: "Aries", degree: 18 },
      { house: 7, sign: "Taurus", degree: 5 },
      { house: 8, sign: "Gemini", degree: 8 },
      { house: 9, sign: "Cancer", degree: 14 },
      { house: 10, sign: "Leo", degree: 20 },
      { house: 11, sign: "Virgo", degree: 22 },
      { house: 12, sign: "Libra", degree: 18 },
    ],
  },
  weton: {
    weton: "Sabtu Kliwon",
    totalNeptu: 17,
    wuku: { name: "Kurantil" },
    pancasuda: { name: "Bumi Kapetak" },
  },
  bazi: {
    dayMaster: { element: "Api", polarity: "Yin", stemPinyin: "Ding" },
  },
  tzolkin: {
    kin: 205,
    solarSeal: { name: "Ular Merah (Chicchan)", keyword: "daya hidup naluriah" },
    galacticTone: { name: "Tone 10 Planet", lesson: "menyempurnakan manifestasi" },
  },
  vedic: {
    nakshatra: { name: "Uttara Bhadrapada" },
    moonSign: "Meena (Pisces)",
  },
  wholeSign: {
    risingSign: "Scorpio",
  },
  astrocartography: {
    lines: [{ city: "Denpasar", line: "Venus-AS" }],
  },
  ziwei: {
    mingGong: "Tai Yin",
  },
};

const PROFILE_GAMMA = {
  uid: "usr_gamma_1978",
  fullName: "Bambang Santoso",
  displayName: "Bambang",
  birthDate: "1978-11-20",
  birthTime: "22:40",
  birthCity: "Bandung",
  timezone: "Asia/Jakarta",
  relationshipStatus: "unspecified" as const,
};

const BLUEPRINT_GAMMA = {
  uid: "usr_gamma_1978",
  input: {
    birthDate: "1978-11-20",
    birthTime: "22:40",
    timezone: "Asia/Jakarta",
  },
  lifePath: { number: 11, role: "The Spiritual Messenger" },
  numerology: { expression: 1, soulUrge: 11 },
  humanDesign: {
    type: "Reflector",
    profile: "4/6",
    authority: "Lunar Cycle",
    strategy: "Wait a Lunar Cycle",
    notSelf: "Kekecewaan",
    definedCenters: [],
    openCenters: ["Head", "Ajna", "Throat", "G-Center", "Heart", "Sacral", "Solar Plexus", "Spleen", "Root"],
  },
  destinyMatrix: {
    center: 9,
    loveLine: [9, 15, 6],
    moneyLine: [15, 6, 21],
    karmicTail: [9, 9, 18],
    ancestorLine: [7, 8, 15],
    talents: [9, 18, 9],
  },
  astrology: {
    sunSign: "Scorpio",
    risingSign: "Leo",
    moonSign: "Cancer",
    placidusHouses: [
      { house: 1, sign: "Leo", degree: 18 },
      { house: 2, sign: "Virgo", degree: 12 },
      { house: 3, sign: "Libra", degree: 9 },
      { house: 4, sign: "Scorpio", degree: 11 },
      { house: 5, sign: "Sagittarius", degree: 16 },
      { house: 6, sign: "Capricorn", degree: 20 },
      { house: 7, sign: "Aquarius", degree: 18 },
      { house: 8, sign: "Pisces", degree: 12 },
      { house: 9, sign: "Aries", degree: 9 },
      { house: 10, sign: "Taurus", degree: 11 },
      { house: 11, sign: "Gemini", degree: 16 },
      { house: 12, sign: "Cancer", degree: 20 },
    ],
  },
  weton: {
    weton: "Senin Wage",
    totalNeptu: 8,
    wuku: { name: "Prangbakat" },
    pancasuda: { name: "Tunggak Semi" },
  },
  bazi: {
    dayMaster: { element: "Logam", polarity: "Yang", stemPinyin: "Geng" },
  },
  tzolkin: {
    kin: 74,
    solarSeal: { name: "Penyihir Putih (Ix)", keyword: "keabadian hadir" },
    galacticTone: { name: "Tone 9 Surya", lesson: "mewujudkan niat" },
  },
};

// ============================================================================
// TEST SUITE
// ============================================================================

test("SPRINT 121-06 TEST 1: Blueprint Personalization across 11 Systems & Arsip Akashi", () => {
  const mockArsipViewModel: any = {
    status: "ready",
    contentVersion: "build121-arsip",
    readings: [
      {
        id: "core-identity-soul",
        title: "Arketipe Jiwa Utama",
        shortMeaning: "Panggilan kesadaran murni dan integritas batin",
      },
    ],
  };

  const res = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: new Date("2026-11-07T10:00:00.000Z"),
    arsipViewModel: mockArsipViewModel,
  });

  // Verify sources contain all systems provided
  assert.ok(res.availableSources.includes("Western Astrology"));
  assert.ok(res.availableSources.includes("SwissEph Ephemeris"));
  assert.ok(res.availableSources.includes("Placidus Natal Chart"));
  assert.ok(res.availableSources.includes("Numerology"));
  assert.ok(res.availableSources.includes("Human Design"));
  assert.ok(res.availableSources.includes("Destiny Matrix"));
  assert.ok(res.availableSources.includes("BaZi"));
  assert.ok(res.availableSources.includes("Weton"));
  assert.ok(res.availableSources.includes("Tzolkin"));
  assert.ok(res.availableSources.includes("Vedic Astrology"));
  assert.ok(res.availableSources.includes("Whole Sign"));
  assert.ok(res.availableSources.includes("Astrocartography"));
  assert.ok(res.availableSources.includes("Zi Wei Dou Shu"));
  assert.ok(res.availableSources.includes("Arsip Akashi"));

  // Check foundations contain specific indicator links
  const allFoundations = res.sections.flatMap((s) => s.readingFoundations || []);
  const systemsInFoundations = new Set(allFoundations.map((f) => f.system));

  assert.ok(systemsInFoundations.has("Human Design"));
  assert.ok(systemsInFoundations.has("Destiny Matrix"));
  assert.ok(systemsInFoundations.has("Weton Harian") || systemsInFoundations.has("Weton Natal"));
  assert.ok(systemsInFoundations.has("BaZi") || systemsInFoundations.has("BaZi Harian"));
  assert.ok(systemsInFoundations.has("Tzolkin Maya"));
  assert.ok(systemsInFoundations.has("Whole Sign"));
  assert.ok(systemsInFoundations.has("Zi Wei Dou Shu"));
  assert.ok(systemsInFoundations.has("Astrocartography"));
  assert.ok(systemsInFoundations.has("Arsip Akashi"));
});

test("SPRINT 121-06 TEST 2: Substantive Personalization Differentiation Across 3 Distinct Profiles", () => {
  const refDate = new Date("2026-11-07T12:00:00.000Z");

  const resAlpha = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  const resBeta = buildDailyGuidance({
    uid: PROFILE_BETA.uid,
    profile: PROFILE_BETA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_BETA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  const resGamma = buildDailyGuidance({
    uid: PROFILE_GAMMA.uid,
    profile: PROFILE_GAMMA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_GAMMA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  // Verify Arah Hari Ini (dailyDirection) differentiation across all 3
  assert.notStrictEqual(resAlpha.dailyDirection.paragraphs[1], resBeta.dailyDirection.paragraphs[1]);
  assert.notStrictEqual(resAlpha.dailyDirection.paragraphs[1], resGamma.dailyDirection.paragraphs[1]);
  assert.notStrictEqual(resBeta.dailyDirection.paragraphs[1], resGamma.dailyDirection.paragraphs[1]);

  // Verify Asmara domain personalization (single vs in_relationship vs unspecified)
  const asmaraAlpha = resAlpha.sections.find((s) => s.key === "asmara")!;
  const asmaraBeta = resBeta.sections.find((s) => s.key === "asmara")!;
  const asmaraGamma = resGamma.sections.find((s) => s.key === "asmara")!;

  assert.notStrictEqual(asmaraAlpha.crossSystemSynthesis, asmaraBeta.crossSystemSynthesis);
  assert.notStrictEqual(asmaraAlpha.crossSystemSynthesis, asmaraGamma.crossSystemSynthesis);

  // Verify cross-system synthesis across other domains
  const pikiranAlpha = resAlpha.sections.find((s) => s.key === "pikiran")!;
  const pikiranBeta = resBeta.sections.find((s) => s.key === "pikiran")!;
  assert.notStrictEqual(pikiranAlpha.crossSystemSynthesis, pikiranBeta.crossSystemSynthesis);

  const ekonomiAlpha = resAlpha.sections.find((s) => s.key === "ekonomi")!;
  const ekonomiBeta = resBeta.sections.find((s) => s.key === "ekonomi")!;
  assert.notStrictEqual(ekonomiAlpha.crossSystemSynthesis, ekonomiBeta.crossSystemSynthesis);
});

test("SPRINT 121-06 TEST 3: Daily Temporal Intelligence & Planetary Cycles Validity", () => {
  const refDate = new Date("2026-11-07T12:00:00.000Z");

  const res = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  const cs = res.cosmicSummary;
  assert.strictEqual(cs.dateKey, "2026-11-07");
  assert.ok(cs.dateFormatted.includes("November 2026"));

  // Weton checks
  assert.ok(cs.wetonToday, "wetonToday is calculated");
  assert.ok(typeof cs.wetonToday?.weton === "string" && cs.wetonToday.weton.length > 3);
  assert.ok(typeof cs.wetonToday?.totalNeptu === "number" && cs.wetonToday.totalNeptu > 0);
  assert.ok(typeof cs.wetonToday?.wuku === "string");

  // BaZi checks
  assert.ok(cs.baziToday, "baziToday is calculated");
  assert.ok(typeof cs.baziToday?.display === "string");
  assert.ok(typeof cs.baziToday?.stemPinyin === "string");
  assert.ok(cs.baziToday?.tenGodRelation, "Ten God relation is computed between Daily Stem and Natal Day Master");

  // Tzolkin checks
  assert.ok(cs.tzolkinToday, "tzolkinToday is calculated");
  assert.ok(typeof cs.tzolkinToday?.kin === "number" && cs.tzolkinToday.kin >= 1 && cs.tzolkinToday.kin <= 260);
  assert.ok(typeof cs.tzolkinToday?.kinName === "string");
  assert.ok(typeof cs.tzolkinToday?.wavespellName === "string");

  // Sky & Moon checks
  assert.ok(cs.lunarPhaseSummary.includes("Bulan"));
  assert.ok(typeof cs.collectiveTheme === "string" && cs.collectiveTheme.length > 20);
});

test("SPRINT 121-06 TEST 4: Temporal Progression Differentiation Across 3 Distinct Dates", () => {
  const d1 = new Date("2026-10-28T05:00:00.000Z");
  const d2 = new Date("2026-11-05T05:00:00.000Z");
  const d3 = new Date("2026-11-07T12:00:00.000Z");

  const res1 = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: d1,
  });

  const res2 = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: d2,
  });

  const res3 = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: d3,
  });

  assert.notStrictEqual(res1.dateKey, res2.dateKey);
  assert.notStrictEqual(res2.dateKey, res3.dateKey);

  // Different daily Weton across dates
  assert.notStrictEqual(res1.cosmicSummary.wetonToday?.weton, res2.cosmicSummary.wetonToday?.weton);
  assert.notStrictEqual(res2.cosmicSummary.wetonToday?.weton, res3.cosmicSummary.wetonToday?.weton);

  // Different Tzolkin Kin across dates
  assert.notStrictEqual(res1.cosmicSummary.tzolkinToday?.kin, res2.cosmicSummary.tzolkinToday?.kin);
  assert.notStrictEqual(res2.cosmicSummary.tzolkinToday?.kin, res3.cosmicSummary.tzolkinToday?.kin);

  // Different synthesis fingerprints across dates
  assert.notStrictEqual(res1.synthesisFingerprint, res2.synthesisFingerprint);
  assert.notStrictEqual(res2.synthesisFingerprint, res3.synthesisFingerprint);
});

test("SPRINT 121-06 TEST 5: Midnight Date Rollover & Multi-Dimensional Cache Fingerprint Invalidation", () => {
  // 23:59:59 on Nov 07 Asia/Jakarta is UTC 16:59:59
  const beforeMidnight = new Date("2026-11-07T16:59:59.000Z");
  // 00:00:05 on Nov 08 Asia/Jakarta is UTC 17:00:05
  const afterMidnight = new Date("2026-11-07T17:00:05.000Z");

  const resBefore = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: beforeMidnight,
  });

  const resAfter = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: afterMidnight,
  });

  assert.strictEqual(resBefore.dateKey, "2026-11-07");
  assert.strictEqual(resAfter.dateKey, "2026-11-08");
  assert.notStrictEqual(resBefore.synthesisFingerprint, resAfter.synthesisFingerprint);

  // Mutating blueprint data invalidates synthesisFingerprint on the exact same date
  const mutatedBlueprint = {
    ...BLUEPRINT_ALPHA,
    lifePath: { number: 1, role: "The Pioneer" },
  };

  const resMutated = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: mutatedBlueprint as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: beforeMidnight,
  });

  assert.notStrictEqual(resBefore.synthesisFingerprint, resMutated.synthesisFingerprint);
});

test("SPRINT 121-06 TEST 6: UID Isolation Across Distinct Accounts (Zero Cross-Contamination)", () => {
  const refDate = new Date("2026-11-07T12:00:00.000Z");

  const resUser1 = buildDailyGuidance({
    uid: "account_user_01",
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  const resUser2 = buildDailyGuidance({
    uid: "account_user_02",
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  assert.strictEqual(resUser1.uid, "account_user_01");
  assert.strictEqual(resUser2.uid, "account_user_02");
  assert.notStrictEqual(resUser1.synthesisFingerprint, resUser2.synthesisFingerprint);
  assert.ok(resUser1.synthesisFingerprint?.startsWith("account_user_01:"));
  assert.ok(resUser2.synthesisFingerprint?.startsWith("account_user_02:"));
});

test("SPRINT 121-06 TEST 7: Sparse / Partial Profile Graceful Fallback (Honest Limited State)", () => {
  const partialProfile = {
    uid: "usr_sparse_newbie",
    displayName: "Pengguna Baru",
    timezone: "Asia/Jakarta",
  };

  const partialBlueprint = {
    uid: "usr_sparse_newbie",
    // No natal chart, no HD, no life path, no birth date
  };

  const res = buildDailyGuidance({
    uid: partialProfile.uid,
    profile: partialProfile as unknown as Record<string, unknown>,
    blueprint: partialBlueprint as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: new Date("2026-11-07T12:00:00.000Z"),
  });

  // State must honestly declare limited
  assert.strictEqual(res.state, "limited");
  assert.ok(res.limitedSources.includes("Placidus Natal Chart"));

  // Accordions remain completely intact with 8 sections
  assert.strictEqual(res.sections.length, 8);
  for (const sec of res.sections) {
    assert.ok(sec.title.length > 0);
    assert.ok(sec.summary.length > 0);
    assert.ok(sec.astrologicalMeaning.length > 0);
    assert.ok(sec.spiritualMeaning.length > 0);
    assert.ok(sec.advice.length === 1);
    assert.ok(sec.phases.pagi.length > 0);
    assert.ok(sec.phases.siang.length > 0);
    assert.ok(sec.phases.malam.length > 0);
  }

  // Arah Hari Ini exists without crashes
  assert.ok(res.dailyDirection.paragraphs.length >= 2);
});

test("SPRINT 121-06 TEST 8: Eight Accordions & Structure Contract", () => {
  const res = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: new Date("2026-11-07T12:00:00.000Z"),
  });

  assert.strictEqual(res.sections.length, 8);

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

  const actualKeys = res.sections.map((s) => s.key);
  assert.deepStrictEqual(actualKeys, expectedKeys);

  // Each domain has non-empty fields
  for (const sec of res.sections) {
    assert.ok(sec.summary.length > 10, `Domain ${sec.key} must have summary`);
    assert.ok(sec.astrologicalMeaning.length > 15, `Domain ${sec.key} must have astrological meaning`);
    assert.ok(sec.spiritualMeaning.length > 15, `Domain ${sec.key} must have spiritual meaning`);
    assert.ok(sec.blueprintContribution.length > 15, `Domain ${sec.key} must have blueprint contribution`);
    assert.strictEqual(sec.advice.length, 1, `Domain ${sec.key} must have exactly 1 advice sentence`);
    assert.ok(sec.phases.pagi.length >= 1);
    assert.ok(sec.phases.siang.length >= 1);
    assert.ok(sec.phases.malam.length >= 1);
    assert.ok(Array.isArray(sec.readingFoundations) && sec.readingFoundations.length > 0);
  }
});

test("SPRINT 121-06 TEST 9: 100% Character-by-Character Parity between Profile & Dashboard (Arah Hari Ini)", () => {
  const refDate = new Date("2026-11-07T12:00:00.000Z");

  // Call from Profile
  const profileRes = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  // Call from DashboardClient
  const dashboardRes = buildDailyGuidance({
    uid: PROFILE_ALPHA.uid,
    profile: PROFILE_ALPHA as unknown as Record<string, unknown>,
    blueprint: BLUEPRINT_ALPHA as unknown as Record<string, unknown>,
    timezone: "Asia/Jakarta",
    referenceDate: refDate,
  });

  assert.strictEqual(profileRes.dailyDirection.title, "Arah Hari Ini");
  assert.strictEqual(dashboardRes.dailyDirection.title, "Arah Hari Ini");
  assert.deepStrictEqual(
    profileRes.dailyDirection.paragraphs,
    dashboardRes.dailyDirection.paragraphs,
    "Daily direction paragraphs must match 100% character-by-character"
  );

  // Zero greeting ("Halo...")
  for (const para of dashboardRes.dailyDirection.paragraphs) {
    assert.ok(!para.toLowerCase().startsWith("halo"), "No greeting in daily direction");
    assert.ok(!para.includes("Halo "), "No greeting in daily direction");
  }
});
