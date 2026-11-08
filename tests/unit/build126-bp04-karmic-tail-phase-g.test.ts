import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { extractFullCanonicalBlueprint } from "../../lib/weeklyGuidance/weeklyGuidanceEngine";
import { buildDailyGuidance } from "../../lib/dailyGuidance/dailyGuidanceEngine";
import { generateLocalBlueprint } from "../../lib/local/generateLocalBlueprint";

describe("BP04 Karmic Tail Phase G — Canonical Consistency Repair", () => {
  const refDate = new Date("2026-10-28T12:00:00Z");

  it("Fixture 1: Pita Martina (1984-03-28) heals legacy birth-anchor [10, 3, 22] to canonical [15, 5, 8]", () => {
    const rawBlueprint = {
      input: { birthDate: "1984-03-28", birthTime: "11:45" },
      destinyMatrix: {
        center: 7,
        arcanaCenter: 7,
        karmicTail: [10, 3, 22], // Legacy Build 31 birth anchors stored in production
        loveLine: [17, 7, 10],
        moneyLine: [15, 7, 11],
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.deepEqual(
      extracted.dmKarmicTail,
      [15, 5, 8],
      "extractFullCanonicalBlueprint must heal [10, 3, 22] to canonical [15, 5, 8]"
    );
  });

  it("Fixture 1b: Pita Martina Daily Guidance Cross-System Synthesis renders Ekor Karma: 15–5–8", () => {
    const userPita = {
      uid: "uASPHCJSp0P60g9YtcwFxmJnxOc2",
      name: "Pita Martina",
      fullName: "Pita Martina",
      birthDate: "1984-03-28",
      birthTime: "11:45",
      birthPlace: "Jakarta Timur, Indonesia",
      latitude: -6.225,
      longitude: 106.900,
      timezone: "Asia/Jakarta",
      gender: "female" as const,
      relationshipStatus: "single" as const,
    };

    const bp = generateLocalBlueprint(userPita as any);
    (bp as any).destinyMatrix = {
      ...(bp as any).destinyMatrix,
      center: 7,
      arcanaCenter: 7,
      karmicTail: [10, 3, 22], // Stale stored value
    };

    const daily = buildDailyGuidance({
      uid: userPita.uid,
      profile: userPita as any,
      blueprint: bp as any,
      referenceDate: refDate,
      timezone: "Asia/Jakarta",
    });

    const berat = daily.sections.find((s) => s.key === "yangMungkinTerasaBerat");
    assert.ok(berat, "Section yangMungkinTerasaBerat must exist");

    const dmFoundation = berat.readingFoundations.find((f) => f.system === "Destiny Matrix");
    assert.ok(dmFoundation, "Destiny Matrix foundation must exist in yangMungkinTerasaBerat");
    assert.equal(
      dmFoundation.indicator,
      "Ekor Karma: 15–5–8",
      "Indicator in daily guidance must display canonical 15–5–8"
    );
    assert.doesNotMatch(
      dmFoundation.indicator,
      /10–3–22/,
      "Indicator must NOT contain legacy birth anchors 10-3-22"
    );
    assert.match(
      berat.crossSystemSynthesis,
      /15 The Devil, 5 The Hierophant, 8 Justice/i,
      "Cross-System Synthesis must reference canonical Karmic Tail arcana 15-5-8"
    );
  });

  it("Fixture 2: Founder (1985-05-03) preserves canonical [21, 7, 13]", () => {
    const rawBlueprint = {
      input: { birthDate: "1985-05-03", birthTime: "23:45" },
      destinyMatrix: {
        center: 8,
        arcanaCenter: 8,
        karmicTail: [21, 7, 13],
        loveLine: [7, 10, 21],
        moneyLine: [3, 7, 10],
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.deepEqual(
      extracted.dmKarmicTail,
      [21, 7, 13],
      "extractFullCanonicalBlueprint must preserve canonical [21, 7, 13]"
    );
  });

  it("Synthetic 1: Legacy Gaia inverted mapping [BM04, BM17, BM10] is re-ordered to canonical [BM10, BM17, BM04]", () => {
    // For 1984-03-28: BM04=8, BM17=5, BM10=15. Gaia inverted was [8, 5, 15].
    const rawBlueprint = {
      input: { birthDate: "1984-03-28" },
      destinyMatrix: {
        center: 7,
        karmicTail: [8, 5, 15], // Gaia inverted order
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.deepEqual(
      extracted.dmKarmicTail,
      [15, 5, 8],
      "Gaia inverted [8, 5, 15] must be healed to canonical top-down [15, 5, 8]"
    );
  });

  it("Synthetic 2: Array with length 3 but corrupted numbers is healed to canonical", () => {
    const rawBlueprint = {
      input: { birthDate: "1984-03-28" },
      destinyMatrix: {
        center: 7,
        karmicTail: [99, 88, 77],
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.deepEqual(
      extracted.dmKarmicTail,
      [15, 5, 8],
      "Corrupted numbers [99, 88, 77] must be replaced with canonical [15, 5, 8]"
    );
  });

  it("Synthetic 3: Missing or empty karmicTail with valid birthDate is populated with canonical", () => {
    const rawBlueprint = {
      input: { birthDate: "1985-05-03" },
      destinyMatrix: {
        center: 8,
        karmicTail: [],
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.deepEqual(
      extracted.dmKarmicTail,
      [21, 7, 13],
      "Empty karmicTail must be populated with canonical [21, 7, 13]"
    );
  });

  it("Synthetic 4: Missing or invalid birthDate safely preserves historical karmicTail without throwing or fabricating defaults", () => {
    const rawBlueprint1 = {
      input: { birthDate: "" },
      destinyMatrix: {
        center: 8,
        karmicTail: [10, 3, 22],
      },
    };
    const extracted1 = extractFullCanonicalBlueprint(rawBlueprint1, {}, refDate);
    assert.deepEqual(
      extracted1.dmKarmicTail,
      [10, 3, 22],
      "Missing birthDate must preserve historical array without mutating"
    );

    const rawBlueprint2 = {
      input: { birthDate: "invalid-date-format" },
      destinyMatrix: {
        center: 8,
        karmicTail: [7, 7, 7],
      },
    };
    const extracted2 = extractFullCanonicalBlueprint(rawBlueprint2, {}, refDate);
    assert.deepEqual(
      extracted2.dmKarmicTail,
      [7, 7, 7],
      "Invalid date must not throw and must preserve historical array"
    );
  });

  it("Synthetic 5: Other Destiny Matrix elements (center, loveLine, moneyLine) remain intact", () => {
    const rawBlueprint = {
      input: { birthDate: "1984-03-28" },
      destinyMatrix: {
        center: 7,
        arcanaCenter: 7,
        karmicTail: [10, 3, 22],
        loveLine: [17, 7, 10],
        moneyLine: [15, 7, 11],
      },
    };

    const extracted = extractFullCanonicalBlueprint(rawBlueprint, {}, refDate);
    assert.equal(extracted.dmCenter, 7, "Center must remain 7");
    assert.deepEqual(extracted.dmKarmicTail, [15, 5, 8], "Karmic tail healed to [15, 5, 8]");
    assert.ok(Array.isArray(extracted.dmLoveLine), "Love line remains array");
    assert.ok(Array.isArray(extracted.dmMoneyLine), "Money line remains array");
  });
});
