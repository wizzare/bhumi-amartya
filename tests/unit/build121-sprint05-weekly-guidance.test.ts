import test from "node:test";
import assert from "node:assert/strict";
import { buildWeeklyGuidance } from "../../lib/weeklyGuidance/weeklyGuidanceEngine";
import { computeWeeklyTimeWindow } from "../../lib/weeklyGuidance/weeklyTransitCalculator";
import { buildArsipAkashiInputFromProfile } from "../../lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel } from "../../lib/arsipAkashi/profile/viewModel";
import { calculateWeton } from "../../lib/weton/calculateWeton";
import { calculateBazi } from "../../lib/bazi/calculateBazi";
import { calculateTzolkin } from "../../lib/tzolkin/calculateTzolkin";

function countSentences(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 5).length;
}

// 1. Synthetic Profiles
const profileAlpha = {
  uid: "alpha-001",
  name: "Citra Kirana",
  birthDate: "1995-04-12",
  birthTime: "08:30",
  birthCity: "Bandung",
  timezone: "Asia/Jakarta",
  relationshipStatus: "single",
};

const blueprintAlpha: any = {
  humanDesign: { type: "Generator", profile: "1/3", authority: "Sacral", strategy: "To Respond" },
  numerology: { lifePath: 1, lifePathNumber: 1, expression: 3, soulUrge: 5, birthdayNumber: 12 },
  astrology: {
    sun: { sign: "Aries" },
    moon: { sign: "Leo" },
    ascendant: { sign: "Sagittarius" },
    planets: {
      Sun: { sign: "Aries", degree: 22, house: 5 },
      Moon: { sign: "Leo", degree: 14, house: 9 },
      Ascendant: { sign: "Sagittarius", degree: 10, house: 1 },
      Venus: { sign: "Taurus", degree: 5, house: 6 },
      Mars: { sign: "Leo", degree: 28, house: 9 },
      Jupiter: { sign: "Sagittarius", degree: 16, house: 1 },
      Saturn: { sign: "Pisces", degree: 19, house: 4 },
    },
    houses: [
      { house: 1, sign: "Sagittarius", degree: 10 },
      { house: 2, sign: "Capricorn", degree: 14 },
      { house: 3, sign: "Aquarius", degree: 20 },
      { house: 4, sign: "Pisces", degree: 25 },
      { house: 5, sign: "Aries", degree: 24 },
      { house: 6, sign: "Taurus", degree: 18 },
      { house: 7, sign: "Gemini", degree: 10 },
      { house: 8, sign: "Cancer", degree: 14 },
      { house: 9, sign: "Leo", degree: 20 },
      { house: 10, sign: "Virgo", degree: 25 },
      { house: 11, sign: "Libra", degree: 24 },
      { house: 12, sign: "Scorpio", degree: 18 },
    ],
  },
  destinyMatrix: { energyType: 7, dayPoint: 7, destinyPoint: 10, center: 7, loveLine: [7, 10, 21], moneyLine: [3, 7, 10], karmicTail: [18, 6, 15] },
  weton: calculateWeton({ birthDate: "1995-04-12", birthTime: "08:30" }),
  bazi: calculateBazi({ birthDate: "1995-04-12", birthTime: "08:30" }),
  tzolkin: calculateTzolkin({ birthDate: "1995-04-12" }),
};

const journeyAlpha = {
  activeFocus: "Membangun batas relasi yang sehat",
  stage: "Fase Penataan Diri",
  challenge: "Sulit menolak permintaan yang menguras energi",
  latestReflection: "Mulai merasakan ketenangan saat melambat sejenak",
  nextStep: "Menyediakan waktu hening 15 menit setiap pagi",
};

const profileBeta = {
  uid: "beta-002",
  name: "Budi Santoso",
  birthDate: "1982-11-23",
  birthTime: "23:45",
  birthCity: "Surabaya",
  timezone: "Asia/Jakarta",
  relationshipStatus: "in_relationship",
};

const blueprintBeta: any = {
  humanDesign: { type: "Projector", profile: "2/4", authority: "Splenic", strategy: "Wait for Invitation" },
  numerology: { lifePath: 7, lifePathNumber: 7, expression: 9, soulUrge: 2, birthdayNumber: 23 },
  astrology: {
    sun: { sign: "Scorpio" },
    moon: { sign: "Pisces" },
    ascendant: { sign: "Cancer" },
    planets: {
      Sun: { sign: "Scorpio", degree: 1, house: 5 },
      Moon: { sign: "Pisces", degree: 20, house: 9 },
      Ascendant: { sign: "Cancer", degree: 15, house: 1 },
      Venus: { sign: "Scorpio", degree: 12, house: 5 },
      Mars: { sign: "Capricorn", degree: 8, house: 7 },
      Jupiter: { sign: "Scorpio", degree: 28, house: 5 },
      Saturn: { sign: "Libra", degree: 29, house: 4 },
    },
    houses: [
      { house: 1, sign: "Cancer", degree: 15 },
      { house: 2, sign: "Leo", degree: 8 },
      { house: 3, sign: "Virgo", degree: 5 },
      { house: 4, sign: "Libra", degree: 8 },
      { house: 5, sign: "Scorpio", degree: 14 },
      { house: 6, sign: "Sagittarius", degree: 18 },
      { house: 7, sign: "Capricorn", degree: 15 },
      { house: 8, sign: "Aquarius", degree: 8 },
      { house: 9, sign: "Pisces", degree: 5 },
      { house: 10, sign: "Aries", degree: 8 },
      { house: 11, sign: "Taurus", degree: 14 },
      { house: 12, sign: "Gemini", degree: 18 },
    ],
  },
  destinyMatrix: { energyType: 9, dayPoint: 9, destinyPoint: 18, center: 9, loveLine: [9, 15, 6], moneyLine: [9, 18, 9], karmicTail: [12, 19, 7] },
  weton: calculateWeton({ birthDate: "1982-11-23", birthTime: "23:45" }),
  bazi: calculateBazi({ birthDate: "1982-11-23", birthTime: "23:45" }),
  tzolkin: calculateTzolkin({ birthDate: "1982-11-23" }),
};

const profileGamma = {
  uid: "gamma-003",
  name: "Dewi Lestari",
  birthDate: "1990-05-18",
  birthTime: "04:15",
  birthCity: "Yogyakarta",
  timezone: "Asia/Jakarta",
  relationshipStatus: "unspecified",
};

const blueprintGamma: any = {
  humanDesign: { type: "Manifestor", profile: "5/1", authority: "Emotional", strategy: "To Inform" },
  numerology: { lifePath: 4, lifePathNumber: 4, expression: 8, soulUrge: 6, birthdayNumber: 18 },
  astrology: {
    sun: { sign: "Taurus" },
    moon: { sign: "Capricorn" },
    ascendant: { sign: "Virgo" },
    planets: {
      Sun: { sign: "Taurus", degree: 27, house: 9 },
      Moon: { sign: "Capricorn", degree: 10, house: 5 },
      Ascendant: { sign: "Virgo", degree: 2, house: 1 },
      Venus: { sign: "Aries", degree: 15, house: 8 },
      Mars: { sign: "Pisces", degree: 22, house: 7 },
      Jupiter: { sign: "Cancer", degree: 8, house: 11 },
      Saturn: { sign: "Capricorn", degree: 25, house: 5 },
    },
    houses: [
      { house: 1, sign: "Virgo", degree: 2 },
      { house: 2, sign: "Libra", degree: 1 },
      { house: 3, sign: "Scorpio", degree: 3 },
      { house: 4, sign: "Sagittarius", degree: 6 },
      { house: 5, sign: "Capricorn", degree: 8 },
      { house: 6, sign: "Aquarius", degree: 7 },
      { house: 7, sign: "Pisces", degree: 2 },
      { house: 8, sign: "Aries", degree: 1 },
      { house: 9, sign: "Taurus", degree: 3 },
      { house: 10, sign: "Gemini", degree: 6 },
      { house: 11, sign: "Cancer", degree: 8 },
      { house: 12, sign: "Leo", degree: 7 },
    ],
  },
  destinyMatrix: { energyType: 4, dayPoint: 4, destinyPoint: 8, center: 4, loveLine: [4, 8, 12], moneyLine: [4, 10, 14], karmicTail: [15, 20, 5] },
  weton: calculateWeton({ birthDate: "1990-05-18", birthTime: "04:15" }),
  bazi: calculateBazi({ birthDate: "1990-05-18", birthTime: "04:15" }),
  tzolkin: calculateTzolkin({ birthDate: "1990-05-18" }),
};

// Partial Blueprint Profile (no astrology natal placements, no journey)
const profilePartial = {
  uid: "partial-004",
  name: "Rian Pratama",
  birthDate: "1998-02-10",
  timezone: "Asia/Jakarta",
};

const blueprintPartial: any = {
  numerology: { lifePath: 3, lifePathNumber: 3, expression: 5 },
  humanDesign: { type: "Reflector", profile: "4/6", authority: "Lunar" },
  destinyMatrix: { energyType: 10, center: 10 },
};

test("SPRINT 121-05 TEST 1: Monday-Sunday Local Week Boundaries & Temporal Isolation", () => {
  // Test across multiple reference dates and timezones
  const refOct = new Date("2026-10-14T10:00:00Z"); // Wednesday
  const winOct = computeWeeklyTimeWindow(refOct, "Asia/Jakarta", "current");

  assert.equal(winOct.start.weekday, 1, "Week window must start on Monday (weekday 1)");
  assert.equal(winOct.end.weekday, 7, "Week window must end on Sunday (weekday 7)");
  assert.equal(winOct.start.hour, 0, "Start must be at 00:00 local time");
  assert.equal(winOct.end.hour, 23, "End must be at 23:59 local time");

  // Two consecutive weeks must produce distinct weekKeys
  const winCurrent = computeWeeklyTimeWindow(new Date("2026-10-14"), "Asia/Jakarta", "current");
  const winUpcoming = computeWeeklyTimeWindow(new Date("2026-10-14"), "Asia/Jakarta", "upcoming");

  assert.notEqual(winCurrent.weekKey, winUpcoming.weekKey, "Current and upcoming week must have distinct week keys");
  assert.notEqual(winCurrent.weekStart, winUpcoming.weekStart, "Start dates must differ");
});

test("SPRINT 121-05 TEST 2: Nine Sections Structure & Sentence Count Contracts", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inputA);

  const guidanceA = buildWeeklyGuidance({
    uid: profileAlpha.uid,
    profile: profileAlpha,
    blueprint: blueprintAlpha,
    arsipViewModel: vmA,
    journey: journeyAlpha,
    referenceDate: new Date("2026-10-14T10:00:00Z"),
  });

  // Verify exactly 8 domain sections + 1 Arah Minggu Ini = 9 sections
  assert.equal(guidanceA.sections.length, 8, "Must contain exactly 8 domain sections");
  assert.ok(guidanceA.weeklyDirection, "Must contain section 9: Arah Minggu Ini");
  assert.equal(guidanceA.weeklyDirection.title, "Arah Minggu Ini");

  const expectedCanonicalKeys = [
    "kabarMingguIni",
    "pikiran",
    "ekonomi",
    "asmara",
    "orangTerdekat",
    "maknaBatin",
    "yangMungkinTerasaBerat",
    "ruangYangSedangTerbuka",
  ];
  assert.deepEqual(
    guidanceA.sections.map((s) => s.key),
    expectedCanonicalKeys,
    "All 8 canonical domain keys must be present in exact order"
  );

  // Check sentence count for sections 1-8: 3-4 body sentences, 1-2 advice sentences
  for (const sec of guidanceA.sections) {
    const bodyText = sec.paragraphs.join(" ");
    const bodySentences = countSentences(bodyText);
    assert.ok(
      bodySentences >= 3 && bodySentences <= 4,
      `Section ${sec.title} body must contain 3–4 sentences (got ${bodySentences})`
    );

    const adviceText = sec.advice.join(" ");
    const adviceSentences = countSentences(adviceText);
    assert.ok(
      adviceSentences >= 1 && adviceSentences <= 2,
      `Section ${sec.title} advice must contain 1–2 sentences (got ${adviceSentences})`
    );

    // Phases must each have 1 sentence
    assert.equal(sec.phases.awalPekan.length, 1);
    assert.equal(sec.phases.tengahPekan.length, 1);
    assert.equal(sec.phases.akhirPekan.length, 1);
  }

  // Check section 9: Arah Minggu Ini must contain 4–6 sentences
  const directionText = guidanceA.weeklyDirection.paragraphs.join(" ");
  const directionSentences = countSentences(directionText);
  assert.ok(
    directionSentences >= 4 && directionSentences <= 6,
    `Arah Minggu Ini must contain 4–6 synthesis sentences (got ${directionSentences})`
  );
  assert.match(
    directionText,
    /prioritas mingguanmu adalah/i,
    "Arah Minggu Ini must declare an explicit single weekly priority"
  );
});

test("SPRINT 121-05 TEST 3: Substantive Personalization Differentiation Across Distinct Profiles", () => {
  const inA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const inB = buildArsipAkashiInputFromProfile(profileBeta, blueprintBeta);
  const inG = buildArsipAkashiInputFromProfile(profileGamma, blueprintGamma);

  const vmA = buildArsipAkashiProfileViewModel(inA);
  const vmB = buildArsipAkashiProfileViewModel(inB);
  const vmG = buildArsipAkashiProfileViewModel(inG);

  const refDate = new Date("2026-10-14T10:00:00Z");

  const guidA = buildWeeklyGuidance({ uid: profileAlpha.uid, profile: profileAlpha, blueprint: blueprintAlpha, arsipViewModel: vmA, journey: journeyAlpha, referenceDate: refDate });
  const guidB = buildWeeklyGuidance({ uid: profileBeta.uid, profile: profileBeta, blueprint: blueprintBeta, arsipViewModel: vmB, journey: null, referenceDate: refDate });
  const guidG = buildWeeklyGuidance({ uid: profileGamma.uid, profile: profileGamma, blueprint: blueprintGamma, arsipViewModel: vmG, journey: null, referenceDate: refDate });

  // Compare sections across Alpha, Beta, and Gamma
  for (let i = 0; i < 8; i++) {
    const textA = guidA.sections[i].paragraphs.join(" ");
    const textB = guidB.sections[i].paragraphs.join(" ");
    const textG = guidG.sections[i].paragraphs.join(" ");

    assert.notEqual(textA, textB, `Section ${guidA.sections[i].key} must differ between Alpha and Beta`);
    assert.notEqual(textA, textG, `Section ${guidA.sections[i].key} must differ between Alpha and Gamma`);
    assert.notEqual(textB, textG, `Section ${guidB.sections[i].key} must differ between Beta and Gamma`);
  }

  // Weekly Direction must differ substantially
  const dirA = guidA.weeklyDirection.paragraphs.join(" ");
  const dirB = guidB.weeklyDirection.paragraphs.join(" ");
  const dirG = guidG.weeklyDirection.paragraphs.join(" ");

  assert.notEqual(dirA, dirB, "Weekly Direction must differ between Alpha and Beta");
  assert.notEqual(dirA, dirG, "Weekly Direction must differ between Alpha and Gamma");
});

test("SPRINT 121-05 TEST 4: Temporal Differentiation Across Distinct Weeks", () => {
  const inA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inA);

  const dateWeek1 = new Date("2026-10-07T12:00:00Z"); // W41
  const dateWeek2 = new Date("2026-10-28T12:00:00Z"); // W44

  const guidW1 = buildWeeklyGuidance({ uid: profileAlpha.uid, profile: profileAlpha, blueprint: blueprintAlpha, arsipViewModel: vmA, journey: journeyAlpha, referenceDate: dateWeek1 });
  const guidW2 = buildWeeklyGuidance({ uid: profileAlpha.uid, profile: profileAlpha, blueprint: blueprintAlpha, arsipViewModel: vmA, journey: journeyAlpha, referenceDate: dateWeek2 });

  assert.notEqual(guidW1.weekKey, guidW2.weekKey, "Week keys must differ between distinct weeks");
  assert.notEqual(guidW1.cosmicSummary.collectiveTheme, guidW2.cosmicSummary.collectiveTheme, "Collective cosmic theme must differ");
  assert.notEqual(guidW1.synthesisFingerprint, guidW2.synthesisFingerprint, "Synthesis fingerprint must invalidate cache across weeks");

  // Dynamic phase text or transits must reflect temporal changes
  const kabarW1 = guidW1.sections.find((s) => s.key === "kabarMingguIni")!;
  const kabarW2 = guidW2.sections.find((s) => s.key === "kabarMingguIni")!;
  assert.notEqual(kabarW1.evidence.activationSummary, kabarW2.evidence.activationSummary, "Astrological transits must shift across calendar weeks");
});

test("SPRINT 121-05 TEST 5: Journey Context Integration & Honest Degradation When Empty", () => {
  const inA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inA);

  // Profile with Journey
  const guidWithJourney = buildWeeklyGuidance({
    uid: profileAlpha.uid,
    profile: profileAlpha,
    blueprint: blueprintAlpha,
    arsipViewModel: vmA,
    journey: journeyAlpha,
    referenceDate: new Date("2026-10-14T10:00:00Z"),
  });

  assert.ok(guidWithJourney.availableSources.includes("journey"), "Available sources must include journey when present");
  assert.ok(guidWithJourney.sourceProvenance.journeyFactIds.length > 0, "Journey fact IDs must be recorded");
  assert.match(
    guidWithJourney.weeklyDirection.paragraphs.join(" "),
    new RegExp(journeyAlpha.activeFocus, "i"),
    "Weekly direction must weave actual journey active focus"
  );

  // Profile WITHOUT Journey (honest LIMITED status)
  const guidNoJourney = buildWeeklyGuidance({
    uid: profileBeta.uid,
    profile: profileBeta,
    blueprint: blueprintBeta,
    arsipViewModel: vmA,
    journey: null,
    referenceDate: new Date("2026-10-14T10:00:00Z"),
  });

  assert.ok(guidNoJourney.limitedSources.includes("journey"), "Limited sources must include journey when empty");
  assert.equal(guidNoJourney.sourceProvenance.journeyFactIds.length, 0, "Journey fact IDs must be empty when journey is not provided");
  assert.doesNotMatch(
    guidNoJourney.weeklyDirection.paragraphs.join(" "),
    /Fase Penataan Diri|Sulit menolak permintaan/i,
    "No fabricated journey progress or reflections when journey is absent"
  );
});

test("SPRINT 121-05 TEST 6: Partial Blueprint Degradation & Cross-UID Cache Isolation", () => {
  const inPartial = buildArsipAkashiInputFromProfile(profilePartial, blueprintPartial);
  const vmPartial = buildArsipAkashiProfileViewModel(inPartial);

  const guidPartial = buildWeeklyGuidance({
    uid: profilePartial.uid,
    profile: profilePartial,
    blueprint: blueprintPartial,
    arsipViewModel: vmPartial,
    referenceDate: new Date("2026-10-14T10:00:00Z"),
  });

  // State must honestly be limited due to absence of natal chart
  assert.equal(guidPartial.state, "limited", "Partial blueprint must honestly report state 'limited'");
  assert.ok(guidPartial.limitedSources.includes("personal-astrology"), "Personal astrology must be reported in limitedSources");
  assert.equal(guidPartial.sections.length, 8, "All 8 domain cards must still render cleanly under calm rhythm");

  // Synthesis fingerprint isolation
  const inA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inA);
  const guidA = buildWeeklyGuidance({ uid: profileAlpha.uid, profile: profileAlpha, blueprint: blueprintAlpha, arsipViewModel: vmA, referenceDate: new Date("2026-10-14T10:00:00Z") });

  assert.notEqual(guidA.synthesisFingerprint, guidPartial.synthesisFingerprint, "Fingerprint must differ between users");

  // Dynamic blueprint mutation invalidates cache
  const mutatedBlueprint = { ...blueprintAlpha, numerology: { ...blueprintAlpha.numerology, lifePathNumber: 9 } };
  const guidMutated = buildWeeklyGuidance({ uid: profileAlpha.uid, profile: profileAlpha, blueprint: mutatedBlueprint, arsipViewModel: vmA, referenceDate: new Date("2026-10-14T10:00:00Z") });
  assert.notEqual(guidA.synthesisFingerprint, guidMutated.synthesisFingerprint, "Fingerprint must invalidate when blueprint values mutate");
});

test("SPRINT 121-05 TEST 7: Arsip Akashi Fact Bundles Grounding (No Verbatim Prose Copying)", () => {
  const inA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inA);

  const guidanceA = buildWeeklyGuidance({
    uid: profileAlpha.uid,
    profile: profileAlpha,
    blueprint: blueprintAlpha,
    arsipViewModel: vmA,
    journey: journeyAlpha,
    referenceDate: new Date("2026-10-14T10:00:00Z"),
  });

  // Check that Arsip Akashi is listed in sourceProvenance
  assert.ok(guidanceA.sourceProvenance.sourceReadingIds.length > 0, "Source reading IDs must be populated");
  assert.ok(guidanceA.availableSources.includes("arsip-akashi"), "Arsip Akashi must be in available sources");

  // Verify that full 3-paragraph raw narrative from Arsip Akashi is NOT copied verbatim into weekly guidance
  for (const reading of vmA.readings) {
    const fullProse = reading.narrative;
    for (const sec of guidanceA.sections) {
      assert.notEqual(
        sec.paragraphs.join(" "),
        fullProse,
        `Section ${sec.title} must not copy full raw prose from reading ${reading.id}`
      );
    }
  }

  // Foundations drawer must include Arsip Akashi entries
  const allFoundations = guidanceA.sections.flatMap((s) => s.readingFoundations || []);
  const akashiFoundations = allFoundations.filter((f) => f.system === "Arsip Akashi");
  assert.ok(akashiFoundations.length > 0, "Foundations drawer must record Arsip Akashi indicators with provenance");
});
