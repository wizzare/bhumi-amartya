import "../helpers/phase-h-setup";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeBlueprint } from "../../lib/repositories/blueprintRepository";
import { calculateBhumiMatrix } from "../../lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel } from "../../lib/visual/destinyMatrixVisualModel";
import { buildDestinyMatrixReadings } from "../../lib/destiny-matrix/readings";
import { buildUnifiedBlueprintSynthesis } from "../../lib/dailyGuidance/unifiedBlueprintSynthesis";
import { buildArsipAkashiInputFromProfile } from "../../lib/arsipAkashi/profile/inputBuilder";
import { calculateCanonicalDestinyMatrixBlueprint } from "../../lib/engines/destinyMatrixBlueprintAdapter";
import { calculateWeton } from "../../lib/weton/calculateWeton";
import { calculateBazi } from "../../lib/bazi/calculateBazi";

describe("BP04 Final Release Safety Gate — Strict Verification Suite", () => {
  const pitaUID = "uASPHCJSp0P60g9YtcwFxmJnxOc2";
  const pitaDOB = "1984-03-28";
  const founderUID = "vybyLLFpBxhF1L1m9liGHm5chgG2";
  const founderDOB = "1985-05-03";

  const pitaWeton = calculateWeton({ birthDate: pitaDOB, birthTime: "11:45" });
  const pitaBazi = calculateBazi({ birthDate: pitaDOB, birthTime: "11:45", timezone: "Asia/Jakarta" });

  const legacyPitaBlueprint = {
    uid: pitaUID,
    input: {
      birthDate: pitaDOB,
      birthTime: "11:45",
      birthCity: "Jakarta Timur",
      timezone: "Asia/Jakarta",
    },
    destinyMatrix: {
      center: 7,
      arcanaCenter: 7,
      dayPoint: 10,
      monthPoint: 3,
      yearPoint: 22,
      bottomPoint: 15,
      karmicTail: [10, 3, 22], // Legacy Build 31 birth anchors
      loveLine: [17, 7, 10],
      moneyLine: [15, 7, 11],
      calculationStatus: "completed",
    },
    weton: pitaWeton,
    bazi: pitaBazi,
  };

  it("Gate 1: Load legacy blueprint yields canonical Karmic Tail across all readers", () => {
    // Repository level read normalization
    const normalized = normalizeBlueprint(pitaUID, legacyPitaBlueprint as any);
    assert.deepEqual(normalized.destinyMatrix?.karmicTail, [15, 5, 8]);

    // Visual model from canonical engine
    const canonicalDM = calculateBhumiMatrix(pitaDOB);
    const vm = buildDestinyMatrixVisualModel(canonicalDM);
    assert.deepEqual(vm.karmic.values, [15, 5, 8]);

    // Destiny Matrix readings
    const readings = buildDestinyMatrixReadings(canonicalDM, vm, { birthDate: pitaDOB });
    assert.deepEqual(readings.karmicTail.numbers, [15, 5, 8]);

    // Daily guidance synthesis
    const syn = buildUnifiedBlueprintSynthesis({
      blueprint: legacyPitaBlueprint as any,
      profile: { birthDate: pitaDOB } as any,
      language: "id",
    });
    assert.deepEqual(syn.fullBlueprint.destinyMatrix.karmicTail, [15, 5, 8]);

    // Arsip Akashi facts
    const arsipInput = buildArsipAkashiInputFromProfile(
      { uid: pitaUID, birthDate: pitaDOB },
      legacyPitaBlueprint as any
    );
    const ktFact = arsipInput.systems["destiny-matrix"].normalizedFacts.find(
      (f) => f.factId === "destiny-matrix/shadow/karmicTail"
    );
    assert.equal(ktFact?.value, "15-5-8");
  });

  it("Gate 2: Save blueprint produces canonical value and does not mutate unrelated fields", () => {
    const normalized = normalizeBlueprint(pitaUID, legacyPitaBlueprint as any);

    // Verified canonical
    assert.deepEqual(normalized.destinyMatrix?.karmicTail, [15, 5, 8]);

    // Unrelated fields MUST remain intact
    assert.equal(normalized.destinyMatrix?.center, 7);
    assert.equal(normalized.destinyMatrix?.arcanaCenter, 7);
    assert.deepEqual(normalized.destinyMatrix?.loveLine, [17, 7, 10]);
    assert.deepEqual(normalized.destinyMatrix?.moneyLine, [15, 7, 11]);
    assert.equal((normalized.weton as any)?.weton, pitaWeton.weton);
    assert.equal((normalized.bazi as any)?.dayMaster, pitaBazi.dayMaster);
  });

  it("Gate 3: Save idempotency — repeated saves produce zero additional mutations", () => {
    const firstPass = normalizeBlueprint(pitaUID, legacyPitaBlueprint as any);
    const secondPass = normalizeBlueprint(pitaUID, firstPass);
    const thirdPass = normalizeBlueprint(pitaUID, secondPass);

    assert.deepEqual(secondPass.destinyMatrix?.karmicTail, [15, 5, 8]);
    assert.deepEqual(thirdPass.destinyMatrix?.karmicTail, [15, 5, 8]);

    // JSON serialization equality
    assert.equal(
      JSON.stringify(secondPass.destinyMatrix),
      JSON.stringify(thirdPass.destinyMatrix)
    );
  });

  it("Gate 4: UID Isolation — distinct user profiles do not leak or cross-contaminate", () => {
    const legacyFounderBlueprint = {
      uid: founderUID,
      input: { birthDate: founderDOB, birthTime: "23:45", timezone: "Asia/Jakarta" },
      destinyMatrix: {
        center: 8,
        karmicTail: [21, 7, 13],
      },
    };

    const normPita = normalizeBlueprint(pitaUID, legacyPitaBlueprint as any);
    const normFounder = normalizeBlueprint(founderUID, legacyFounderBlueprint as any);

    // Verify Pita
    assert.equal(normPita.uid, pitaUID);
    assert.deepEqual(normPita.destinyMatrix?.karmicTail, [15, 5, 8]);
    assert.equal(normPita.destinyMatrix?.center, 7);

    // Verify Founder
    assert.equal(normFounder.uid, founderUID);
    assert.deepEqual(normFounder.destinyMatrix?.karmicTail, [21, 7, 13]);
    assert.equal(normFounder.destinyMatrix?.center, 8);
  });

  it("Gate 5: Inconclusive records policy — missing DOB never fabricates or claims canonical", () => {
    const legacyInconclusive = {
      uid: "inconclusive-uid",
      input: { birthDate: "" },
      destinyMatrix: {
        center: 0,
        karmicTail: [99, 99, 99],
        calculationStatus: "incomplete",
      },
    };

    const normalized = normalizeBlueprint("inconclusive-uid", legacyInconclusive as any);

    // Must preserve historical value without fabricating defaults
    assert.deepEqual(normalized.destinyMatrix?.karmicTail, [99, 99, 99]);

    // calculateCanonicalDestinyMatrixBlueprint throws or fails gracefully on empty string
    assert.throws(() => {
      calculateCanonicalDestinyMatrixBlueprint("");
    });
  });
});
