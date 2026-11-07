import test from "node:test";
import assert from "node:assert/strict";
import { buildArsipAkashiInputFromProfile } from "../../lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel } from "../../lib/arsipAkashi/profile/viewModel";
import { STARSEED_CATALOG, CIVILIZATION_CATALOG } from "../../lib/arsipAkashi/readings/symbolicCatalog";
import { calculateWeton } from "../../lib/weton/calculateWeton";
import { calculateBazi } from "../../lib/bazi/calculateBazi";
import { calculateTzolkin } from "../../lib/tzolkin/calculateTzolkin";

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

test("SPRINT 121-04 TEST 1: 11 Blueprint Systems Grounding & Provenance Traceability", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);

  // Check that all provided systems are mapped to available with normalized facts
  assert.equal(inputA.systems["human-design"]?.availability, "available");
  assert.equal(inputA.systems["numerology"]?.availability, "available");
  assert.equal(inputA.systems["natal-chart"]?.availability, "available");
  assert.equal(inputA.systems["destiny-matrix"]?.availability, "available");
  assert.equal(inputA.systems["weton"]?.availability, "available");
  assert.equal(inputA.systems["bazi"]?.availability, "available");
  assert.equal(inputA.systems["tzolkin"]?.availability, "available");

  // Verify that facts have exact paths, versions, and no forged values
  const hdFacts = inputA.systems["human-design"]!.normalizedFacts;
  const typeFact = hdFacts.find((f) => f.label === "type");
  assert.equal(typeFact?.value, "Generator");
  assert.equal(typeFact?.sourcePath, "lib/humandesign");

  const numFacts = inputA.systems["numerology"]!.normalizedFacts;
  const lpFact = numFacts.find((f) => f.label === "lifePathNumber");
  assert.equal(lpFact?.value, "1");

  // Verify view model generation has provenance attached to each paragraph
  const vmA = buildArsipAkashiProfileViewModel(inputA);
  assert.ok(vmA.readings.length > 0);

  const regularReadings = vmA.readings.filter(
    (r) => r.roomId !== "symbolic-origin" && r.roomId !== "current-life-phase"
  );

  for (const reading of regularReadings) {
    assert.ok(reading.deepNarrativeProvenance, `Reading ${reading.id} must have narrative provenance`);
    assert.equal(reading.deepNarrativeProvenance.length, 3, "Each regular reading must have 3 paragraph provenance entries");
    for (const prov of reading.deepNarrativeProvenance) {
      assert.ok(prov.selectedFactIds.length > 0, "Paragraph must trace to selected fact IDs");
      assert.ok(prov.contributingSystems.length > 0, "Paragraph must trace to contributing systems");
      assert.ok(prov.paragraphFingerprint, "Paragraph must have fingerprint");
    }
  }
});

test("SPRINT 121-04 TEST 2: Substantive Personalization Differentiation (Alpha vs Beta vs Gamma)", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const inputB = buildArsipAkashiInputFromProfile(profileBeta, blueprintBeta);
  const inputG = buildArsipAkashiInputFromProfile(profileGamma, blueprintGamma);

  const vmA = buildArsipAkashiProfileViewModel(inputA);
  const vmB = buildArsipAkashiProfileViewModel(inputB);
  const vmG = buildArsipAkashiProfileViewModel(inputG);

  assert.equal(vmA.readings.length, vmB.readings.length);
  assert.equal(vmA.readings.length, vmG.readings.length);

  // Compare each reading across profiles to ensure substantial narrative differentiation
  let identicalReadingCount = 0;
  for (let i = 0; i < vmA.readings.length; i++) {
    const textA = vmA.readings[i].narrative + vmA.readings[i].deepExplanation;
    const textB = vmB.readings[i].narrative + vmB.readings[i].deepExplanation;
    const textG = vmG.readings[i].narrative + vmG.readings[i].deepExplanation;

    if (textA === textB || textA === textG || textB === textG) {
      identicalReadingCount++;
      console.log(`Identical reading: ${vmA.readings[i].id} (room: ${vmA.readings[i].roomTitle}) | AB:${textA === textB} AG:${textA === textG} BG:${textB === textG}`);
    }

    // Must not contain raw JSON, NaN, or undefined
    assert.doesNotMatch(textA, /\b(undefined|null|NaN|\[object Object\])\b/);
    assert.doesNotMatch(textB, /\b(undefined|null|NaN|\[object Object\])\b/);
    assert.doesNotMatch(textG, /\b(undefined|null|NaN|\[object Object\])\b/);
  }

  assert.equal(identicalReadingCount, 0, "All readings must be distinctly personalized across distinct blueprints");

  // Compare Soul Letters across profiles
  const soulLetterA = vmA.soulLetters.map((sl) => sl.paragraphs.join(" ")).join("\n");
  const soulLetterB = vmB.soulLetters.map((sl) => sl.paragraphs.join(" ")).join("\n");
  const soulLetterG = vmG.soulLetters.map((sl) => sl.paragraphs.join(" ")).join("\n");

  assert.notEqual(soulLetterA, soulLetterB);
  assert.notEqual(soulLetterA, soulLetterG);
  assert.notEqual(soulLetterB, soulLetterG);
});

test("SPRINT 121-04 TEST 3: Blueprint Value Mutation Drives Domain Reading Change", () => {
  // Take Profile Alpha, mutate HD and Numerology, verify that affected readings change
  const inputOriginal = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmOriginal = buildArsipAkashiProfileViewModel(inputOriginal);

  const modifiedBlueprint = {
    ...blueprintAlpha,
    humanDesign: { type: "Reflector", profile: "6/2", authority: "Lunar", strategy: "Wait a Lunar Cycle" },
    numerology: { lifePath: 9, lifePathNumber: 9, expression: 7, soulUrge: 9 },
  };

  const inputModified = buildArsipAkashiInputFromProfile(profileAlpha, modifiedBlueprint);
  const vmModified = buildArsipAkashiProfileViewModel(inputModified);

  // Mechanics reading (Ritme Energi Alami / Cara Mengambil Keputusan) must change
  const readingOrig = vmOriginal.readings.find((r) => r.id === "ritme-energi-alami");
  const readingMod = vmModified.readings.find((r) => r.id === "ritme-energi-alami");

  assert.ok(readingOrig && readingMod);
  assert.notEqual(
    readingOrig.deepExplanation,
    readingMod.deepExplanation,
    "Altering Human Design mechanics must change Ritme Energi Alami reading"
  );
});

test("SPRINT 121-04 TEST 4: Sparse Profile Honestly Degrades to UNAVAILABLE / LIMITED", () => {
  // 1. Sparse / empty profile -> UNAVAILABLE
  const inputSparse = buildArsipAkashiInputFromProfile(profileSparse, null);
  const vmSparse = buildArsipAkashiProfileViewModel(inputSparse);
  assert.equal(vmSparse.status, "unavailable", "Sparse profile with no blueprint systems must degrade to unavailable");

  // 2. Partial profile with only Numerology -> LIMITED
  const partialBlueprint = {
    numerology: { lifePath: 3, lifePathNumber: 3, expression: 5 },
  } as any;
  const inputPartial = buildArsipAkashiInputFromProfile({ uid: "partial-1", timezone: "+07:00" }, partialBlueprint);
  const vmPartial = buildArsipAkashiProfileViewModel(inputPartial);
  assert.equal(vmPartial.status, "limited", "Partial profile with incomplete systems must be limited");
  assert.ok(vmPartial.readings.length > 0, "Partial profile still provides available limited readings");
});

test("SPRINT 121-04 TEST 5: Cross-UID Isolation & Deterministic Idempotency", () => {
  // 1. Cross-UID Isolation: verify generating for User A doesn't leak User A's data into User B
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const inputB = buildArsipAkashiInputFromProfile(profileBeta, blueprintBeta);

  const vmA = buildArsipAkashiProfileViewModel(inputA);
  const vmB = buildArsipAkashiProfileViewModel(inputB);

  // Ensure User B's provenance has no facts belonging to User A
  for (const readingB of vmB.readings) {
    if (readingB.deepNarrativeProvenance) {
      for (const prov of readingB.deepNarrativeProvenance) {
        for (const factId of prov.selectedFactIds) {
          assert.ok(!factId.includes("alpha-001"), "User B must never contain User A facts");
        }
      }
    }
  }

  // 2. Deterministic Idempotency: generating twice with identical input yields exact same output
  const vmA2 = buildArsipAkashiProfileViewModel(inputA);
  assert.equal(vmA.status, vmA2.status);
  assert.equal(vmA.readings.length, vmA2.readings.length);
  assert.equal(vmA.readings[0].deepExplanation, vmA2.readings[0].deepExplanation);
  assert.equal(vmA.soulLetters[0].paragraphs.join(" "), vmA2.soulLetters[0].paragraphs.join(" "));
});

test("SPRINT 121-04 TEST 6: Strict 3x3 Reading & 5x5 Soul Letter Contract Compliance", () => {
  const inputA = buildArsipAkashiInputFromProfile(profileAlpha, blueprintAlpha);
  const vmA = buildArsipAkashiProfileViewModel(inputA);

  const regularReadings = vmA.readings.filter(
    (r) => r.roomId !== "symbolic-origin" && r.roomId !== "current-life-phase"
  );

  // 3x3 Contract: 3 paragraphs of exactly 3 sentences each (9 sentences total)
  for (const reading of regularReadings) {
    const paragraphs = reading.deepExplanation.split("\n\n").filter((p) => p.trim().length > 0);
    assert.equal(paragraphs.length, 3, `Reading ${reading.id} must have exactly 3 paragraphs`);

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const p = paragraphs[pIdx];
      const sCount = countSentences(p);
      assert.equal(
        sCount,
        3,
        `Reading ${reading.id} paragraph ${pIdx + 1} must have exactly 3 sentences, got: ${sCount}`
      );
    }
  }

  // 5x5 Contract: 5 paragraphs of exactly 5 sentences each for Soul Letters
  for (const letter of vmA.soulLetters) {
    assert.equal(letter.paragraphs.length, 5, `Soul letter ${letter.id} must have exactly 5 paragraphs`);
    for (let pIdx = 0; pIdx < letter.paragraphs.length; pIdx++) {
      const p = letter.paragraphs[pIdx];
      const sCount = countSentences(p);
      assert.equal(
        sCount,
        5,
        `Soul letter ${letter.id} paragraph ${pIdx + 1} must have exactly 5 sentences, got: ${sCount}`
      );
    }
  }
});

test("SPRINT 121-04 TEST 7: Symbolic Safeguards for Starseed, Civilization & Asal Usul", () => {
  assert.equal(STARSEED_CATALOG.length, 20);
  assert.equal(CIVILIZATION_CATALOG.length, 20);

  // Check each catalog entry for symbolic safeguards against literal claims
  for (const entry of STARSEED_CATALOG) {
    const fullText = `${entry.contextDetail} ${entry.integration} ${entry.growthPractice} ${entry.nameOrigin}`;
    assert.match(
      fullText,
      /simbol|astronomi|tidak membuktikan|etis|batin/i,
      `Starseed entry ${entry.id} must have explicit symbolic framing`
    );
  }

  for (const entry of CIVILIZATION_CATALOG) {
    const fullText = `${entry.contextDetail} ${entry.integration} ${entry.growthPractice} ${entry.nameOrigin}`;
    assert.match(
      fullText,
      /simbol|mitologi|hipotetis|tidak terbukti|arkeologis|etis|batin/i,
      `Civilization entry ${entry.id} must have explicit symbolic framing`
    );
  }
});
