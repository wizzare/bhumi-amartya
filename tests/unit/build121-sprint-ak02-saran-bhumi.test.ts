import test from "node:test";
import assert from "node:assert/strict";
import { buildArsipAkashiInputFromProfile } from "../../lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel } from "../../lib/arsipAkashi/profile/viewModel";
import { applyArsipAkashiContentToV3Section } from "../../lib/arsipAkashi/profile/v3ContentBridge";
import { calculateWeton } from "../../lib/weton/calculateWeton";
import { calculateBazi } from "../../lib/bazi/calculateBazi";
import { calculateTzolkin } from "../../lib/tzolkin/calculateTzolkin";
import type { ProfileSection } from "../../lib/types/profileRuntime";

// Helper sentence counter handling Indonesian abbreviations and punctuation
function countSentences(text: string): number {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 5).length;
}

// 1. Synthetic Profile Fixtures
const profileAlpha = {
  uid: "alpha-001",
  name: "Citra Kirana",
  birthDate: "1995-04-12",
  birthTime: "08:30",
  birthCity: "Bandung",
  timezone: "+07:00",
};

const blueprintAlpha: any = {
  humanDesign: { type: "Generator", profile: "1/3", authority: "Sacral", strategy: "To Respond" },
  numerology: { lifePath: 1, lifePathNumber: 1, expression: 3, soulUrge: 5, birthdayNumber: 12 },
  astrology: {
    sun: { sign: "Aries" },
    moon: { sign: "Leo" },
    ascendant: { sign: "Sagittarius" },
  },
  destinyMatrix: { energyType: 7, dayPoint: 7, destinyPoint: 10, center: 7 },
  weton: calculateWeton({ birthDate: "1995-04-12", birthTime: "08:30" }),
  bazi: calculateBazi({ birthDate: "1995-04-12", birthTime: "08:30" }),
  tzolkin: calculateTzolkin({ birthDate: "1995-04-12" }),
};

const profileBeta = {
  uid: "beta-002",
  name: "Budi Santoso",
  birthDate: "1982-11-23",
  birthTime: "23:45",
  birthCity: "Surabaya",
  timezone: "+07:00",
};

const blueprintBeta: any = {
  humanDesign: { type: "Projector", profile: "2/4", authority: "Splenic", strategy: "Wait for Invitation" },
  numerology: { lifePath: 7, lifePathNumber: 7, expression: 9, soulUrge: 2, birthdayNumber: 23 },
  astrology: {
    sun: { sign: "Scorpio" },
    moon: { sign: "Pisces" },
    ascendant: { sign: "Cancer" },
  },
  destinyMatrix: { energyType: 9, dayPoint: 9, destinyPoint: 18, center: 9 },
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
  timezone: "+07:00",
};

const blueprintGamma: any = {
  humanDesign: { type: "Manifestor", profile: "5/1", authority: "Emotional", strategy: "To Inform" },
  numerology: { lifePath: 4, lifePathNumber: 4, expression: 8, soulUrge: 6, birthdayNumber: 18 },
  astrology: {
    sun: { sign: "Taurus" },
    moon: { sign: "Capricorn" },
    ascendant: { sign: "Virgo" },
  },
  destinyMatrix: { energyType: 4, dayPoint: 4, destinyPoint: 8, center: 4 },
  weton: calculateWeton({ birthDate: "1990-05-18", birthTime: "04:15" }),
  bazi: calculateBazi({ birthDate: "1990-05-18", birthTime: "04:15" }),
  tzolkin: calculateTzolkin({ birthDate: "1990-05-18" }),
};

const profileSparse = {
  uid: "sparse-004",
  name: "Anonymous User",
  birthDate: "",
  birthTime: "",
  timezone: "+07:00",
};

test("AK-02 TEST 1: All 49 Standard Readings Have Non-Empty Saran Bhumi (practicalReflection)", () => {
  const input = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vm = buildArsipAkashiProfileViewModel(input);

  assert.equal(vm.readings.length, 49, "Arsip Akashi must contain exactly 49 standard readings");

  for (const reading of vm.readings) {
    assert.ok(
      reading.practicalReflection && reading.practicalReflection.trim().length > 20,
      `Reading ${reading.id} (${reading.title}) must have non-empty practicalReflection (Saran Bhumi)`,
    );

    // Sentence count should be natural (3 to 5 sentences)
    const sCount = countSentences(reading.practicalReflection);
    assert.ok(
      sCount >= 3 && sCount <= 5,
      `Reading ${reading.id} Saran Bhumi sentence count must be 3-5 (actual: ${sCount}): "${reading.practicalReflection}"`,
    );

    // Must address "kamu"
    assert.match(
      reading.practicalReflection,
      /\b(kamu|dirimu|batinmu|ragamu|pikiranmu)\b/i,
      `Reading ${reading.id} Saran Bhumi must address user with 'kamu' or personal pronoun`,
    );

    // Must NOT contain raw JSON or corruption
    assert.doesNotMatch(reading.practicalReflection, /\b(undefined|null|NaN|\[object Object\])\b/);
  }
});

test("AK-02 TEST 2: Domain Relevance & Substantive Differentiation (No Mass Duplicate Advice)", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const inputB = buildArsipAkashiInputFromProfile(profileBeta, blueprintBeta);
  const vmA = buildArsipAkashiProfileViewModel(inputA);
  const vmB = buildArsipAkashiProfileViewModel(inputB);

  const adviceSet = new Set<string>();
  for (const reading of vmA.readings) {
    adviceSet.add(reading.practicalReflection);
  }

  // Across 49 readings in profile A, advice must not be a repetitive copy-paste
  assert.equal(
    adviceSet.size,
    49,
    `All 49 readings in profile Alpha must have distinct Saran Bhumi (got ${adviceSet.size} unique)`,
  );

  // Across distinct profiles Alpha and Beta, personalized advice must differ
  let identicalAdviceCount = 0;
  for (let i = 0; i < vmA.readings.length; i++) {
    if (vmA.readings[i].practicalReflection === vmB.readings[i].practicalReflection) {
      identicalAdviceCount++;
      // Only generic sparse fallback would be identical, which complete profiles shouldn't have
      console.log(`Identical advice in: ${vmA.readings[i].id}`);
    }
  }

  assert.equal(identicalAdviceCount, 0, "Saran Bhumi must be substantively differentiated across profiles");
});

test("AK-02 TEST 3: Similar Blueprints with Different Domain Facts Drive Different Advice", () => {
  // Similar users: both HD Generator 1/3, but different Destiny Matrix money points
  const userSimA = {
    uid: "user-sim-a",
    birthDate: "1995-04-12",
    birthTime: "08:30",
    timezone: "+07:00",
  };
  const bpSimA: any = {
    humanDesign: { type: "Generator", profile: "1/3", authority: "Sacral", strategy: "To Respond" },
    destinyMatrix: { energyType: 10, dayPoint: 10, destinyPoint: 10, center: 10 },
    weton: calculateWeton({ birthDate: "1995-04-12", birthTime: "08:30" }),
    bazi: calculateBazi({ birthDate: "1995-04-12", birthTime: "08:30" }),
  };

  const userSimB = {
    uid: "user-sim-b",
    birthDate: "1995-04-12",
    birthTime: "08:30",
    timezone: "+07:00",
  };
  const bpSimB: any = {
    humanDesign: { type: "Generator", profile: "1/3", authority: "Sacral", strategy: "To Respond" },
    destinyMatrix: { energyType: 15, dayPoint: 15, destinyPoint: 15, center: 15 },
    weton: calculateWeton({ birthDate: "1995-04-12", birthTime: "08:30" }),
    bazi: calculateBazi({ birthDate: "1995-04-12", birthTime: "08:30" }),
  };

  const inputSimA = buildArsipAkashiInputFromProfile(userSimA, bpSimA);
  const inputSimB = buildArsipAkashiInputFromProfile(userSimB, bpSimB);
  const vmSimA = buildArsipAkashiProfileViewModel(inputSimA);
  const vmSimB = buildArsipAkashiProfileViewModel(inputSimB);

  const moneyBlockA = vmSimA.readings.find((r) => r.id === "money-block")?.practicalReflection;
  const moneyBlockB = vmSimB.readings.find((r) => r.id === "money-block")?.practicalReflection;

  assert.ok(moneyBlockA && moneyBlockB);
  assert.notEqual(
    moneyBlockA,
    moneyBlockB,
    "Users with different Destiny Matrix facts must receive differentiated money-block Saran Bhumi",
  );
});

test("AK-02 TEST 4: Sparse Profile Honestly Degrades to Grounded, Non-Fabricated Guidance", () => {
  const inputSparse = buildArsipAkashiInputFromProfile(profileSparse, null);
  const vmSparse = buildArsipAkashiProfileViewModel(inputSparse);

  assert.equal(vmSparse.status, "unavailable");

  for (const reading of vmSparse.readings) {
    assert.ok(reading.practicalReflection.length > 20, `Sparse reading ${reading.id} must have advice`);

    // Must NOT claim specific fake birth facts or unverified certainty
    assert.doesNotMatch(reading.practicalReflection, /\b(karena wetonmu|karena bintangmu|menurut tanggal lahirmu)\b/i);

    // Must remain grounded and useful
    assert.match(reading.practicalReflection, /\b(kamu|dirimu|langkah|pola|perhatikan)\b/i);
  }
});

test("AK-02 TEST 5: Claim Integrity — No Assumed Marriage, Trauma, or Medical/Financial Claims", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inputA);

  const forbiddenTerms = [
    /\bsuami\b/i,
    /\bistri\b/i,
    /\bpernikahanmu hancur\b/i,
    /\btrauma masa kecilmu\b/i,
    /\bgangguan jiwa\b/i,
    /\bdepresi klinis\b/i,
    /\bobat\b/i,
    /\bterapi medis\b/i,
    /\bdiagnosis\b/i,
    /\binvestasi saham\b/i,
    /\bbeli reksa dana\b/i,
    /\bkarma burukmu pasti\b/i,
    /\bpenyakitmu sembuh karena energi\b/i,
  ];

  for (const reading of vmA.readings) {
    for (const term of forbiddenTerms) {
      assert.doesNotMatch(
        reading.practicalReflection,
        term,
        `Reading ${reading.id} Saran Bhumi contains forbidden/unsupported claim term: ${term}`,
      );
    }
  }
});

test("AK-02 TEST 6: Semester Reading Adapts to Active Year & Semester Dynamically", () => {
  const profile2026 = {
    ...profileAlpha,
    referenceDate: "2026-03-15T00:00:00Z",
  };
  const profile2027 = {
    ...profileAlpha,
    referenceDate: "2027-03-15T00:00:00Z",
  };

  const input2026 = buildArsipAkashiInputFromProfile(profile2026, blueprintAlpha);
  const input2027 = buildArsipAkashiInputFromProfile(profile2027, blueprintAlpha);

  const vm2026 = buildArsipAkashiProfileViewModel(input2026);
  const vm2027 = buildArsipAkashiProfileViewModel(input2027);

  const sem1_2026 = vm2026.readings.find((r) => r.id === "current-life-semester-1");
  const sem1_2027 = vm2027.readings.find((r) => r.id === "current-life-semester-1");

  assert.ok(sem1_2026, "Must find semester 1 for 2026");
  assert.ok(sem1_2027, "Must find semester 1 for 2027");

  assert.match(sem1_2026.practicalReflection, /2026/, "2026 semester advice must mention 2026");
  assert.match(sem1_2027.practicalReflection, /2027/, "2027 semester advice must mention 2027");
  assert.notEqual(sem1_2026.practicalReflection, sem1_2027.practicalReflection);
});

test("AK-02 TEST 7: UI Integration — Single Advice Block 'Saran Bhumi' Without Duplication", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inputA);

  const mockV3Section: ProfileSection = {
    title: "KARYA & TALENTA",
    cards: [
      {
        title: "Money Block",
        shortMeaning: "Pola hambatan kelimpahan",
        expandableInsight: "Penjelasan mendalam 3x3...",
        actionableReflection: "Refleksi lama...",
      },
    ],
  };

  const bridgedSection = applyArsipAkashiContentToV3Section(mockV3Section, vmA);
  assert.ok(bridgedSection);
  const bridgedCard = bridgedSection.cards[0];

  assert.equal(bridgedCard.title, "Money Block");
  // actionableReflection must now contain the rich Saran Bhumi from reading.practicalReflection
  const readingMoney = vmA.readings.find((r) => r.id === "money-block");
  assert.ok(readingMoney);
  assert.equal(bridgedCard.actionableReflection, readingMoney.practicalReflection);

  // Must not have two conflicting advice fields
  assert.equal((bridgedCard as any).practicalReflection, undefined);
  assert.ok(bridgedCard.actionableReflection.length > 50);
});

test("AK-02 TEST 8: Surat Jiwa Preserves 5x5 Format and Intact Letters", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inputA);

  assert.equal(vmA.soulLetters.length, 3, "Must have exactly 3 soul letters");

  for (const letter of vmA.soulLetters) {
    assert.equal(letter.paragraphs.length, 5, `Soul Letter ${letter.title} must have 5 paragraphs`);
    for (const paragraph of letter.paragraphs) {
      const sCount = countSentences(paragraph);
      assert.equal(sCount, 5, `Each paragraph of ${letter.title} must have 5 sentences (got ${sCount})`);
    }
  }
});
