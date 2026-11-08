import "../helpers/phase-h-setup";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateBhumiMatrix } from "../../lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixVisualModel } from "../../lib/visual/destinyMatrixVisualModel";
import { buildDestinyMatrixReadings } from "../../lib/destiny-matrix/readings";
import { extractFullCanonicalBlueprint } from "../../lib/weeklyGuidance/weeklyGuidanceEngine";
import { normalizeBlueprint } from "../../lib/repositories/blueprintRepository";
import { CanonicalTranslatorService } from "../../lib/services/canonicalTranslatorService";
import { buildUnifiedBlueprintSynthesis } from "../../lib/dailyGuidance/unifiedBlueprintSynthesis";
import { buildArsipAkashiInputFromProfile } from "../../lib/arsipAkashi/profile/inputBuilder";
import { calculateDestinyMatrixForBlueprint } from "../../lib/calculations/destinyMatrix/mapToBlueprint";

describe("BP04 Phase H — End-to-End Consistency & Production Release Gate", () => {
  const refDate = new Date("2026-10-28T12:00:00Z");

  // ==========================================================================
  // CASE A: PITA MARTINA (1984-03-28)
  // Stored in Firestore: [10, 3, 22] (Build 31 birth anchors)
  // Expected canonical: [15, 5, 8]
  // ==========================================================================
  describe("Case A: Pita Martina (1984-03-28, stored [10, 3, 22])", () => {
    const pitaDOB = "1984-03-28";
    const pitaUID = "uASPHCJSp0P60g9YtcwFxmJnxOc2";
    const rawPitaBlueprint = {
      uid: pitaUID,
      input: { birthDate: pitaDOB, birthTime: "11:45", birthCity: "Jakarta Timur", timezone: "Asia/Jakarta" },
      destinyMatrix: {
        center: 7,
        arcanaCenter: 7,
        karmicTail: [10, 3, 22], // Legacy Build 31
        loveLine: [17, 7, 10],
        moneyLine: [15, 7, 11],
      },
    };

    it("Path 1 (Diagram & Readings): calculateBhumiMatrix & visual model produce [15, 5, 8]", () => {
      const canonical = calculateBhumiMatrix(pitaDOB);
      const vm = buildDestinyMatrixVisualModel(canonical);
      assert.deepEqual(vm.karmic.values, [15, 5, 8]);

      const readings = buildDestinyMatrixReadings(canonical, vm, { birthDate: pitaDOB });
      assert.deepEqual(readings.karmicTail.numbers, [15, 5, 8]);
    });

    it("Path 2 (Repository Normalization): normalizeBlueprint heals stored [10, 3, 22] to [15, 5, 8]", () => {
      const normalized = normalizeBlueprint(pitaUID, rawPitaBlueprint as any);
      assert.deepEqual(normalized.destinyMatrix?.karmicTail, [15, 5, 8]);
    });

    it("Path 3 (Guidance Extraction): extractFullCanonicalBlueprint heals to [15, 5, 8]", () => {
      const extracted = extractFullCanonicalBlueprint(rawPitaBlueprint, {}, refDate);
      assert.deepEqual(extracted.dmKarmicTail, [15, 5, 8]);
    });

    it("Path 4 (Canonical Translation / Profile): CanonicalTranslatorService translates to [15, 5, 8]", () => {
      const canonical = CanonicalTranslatorService.translate(rawPitaBlueprint as any);
      assert.deepEqual(canonical.shadow.karmicTail, [15, 5, 8]);
      assert.deepEqual(canonical.shadow.soulTrace.karmicTail, [15, 5, 8]);
      assert.deepEqual(canonical.soulIdentity.lessons.destinyKarmicTail, [15, 5, 8]);
      assert.deepEqual(canonical.soulIdentity.shadow.destinyKarmicTail, [15, 5, 8]);
    });

    it("Path 5 (AI Narrative Synthesis): buildUnifiedBlueprintSynthesis weaves [15, 5, 8]", () => {
      const syn = buildUnifiedBlueprintSynthesis({
        blueprint: rawPitaBlueprint as any,
        profile: { birthDate: pitaDOB } as any,
        language: "id",
      });
      assert.deepEqual(syn.fullBlueprint.destinyMatrix.karmicTail, [15, 5, 8]);
    });

    it("Path 6 (Arsip Akashi Facts): buildArsipAkashiInputFromProfile assigns 15-5-8 to factId", () => {
      const arsipInput = buildArsipAkashiInputFromProfile(
        { uid: pitaUID, birthDate: pitaDOB, birthTime: "11:45" },
        rawPitaBlueprint as any
      );
      const dmSystem = arsipInput.systems["destiny-matrix"];
      assert.equal(dmSystem.availability, "available");
      const ktFact = dmSystem.normalizedFacts.find((f) => f.factId === "destiny-matrix/shadow/karmicTail");
      assert.ok(ktFact, "karmicTail fact must exist");
      assert.equal(ktFact.value, "15-5-8");
    });
  });

  // ==========================================================================
  // CASE B: FOUNDER (1985-05-03)
  // Stored in Firestore: [21, 7, 13] (Already canonical)
  // Expected canonical: [21, 7, 13] (Unchanged)
  // ==========================================================================
  describe("Case B: Founder (1985-05-03, stored [21, 7, 13])", () => {
    const founderDOB = "1985-05-03";
    const founderUID = "vybyLLFpBxhF1L1m9liGHm5chgG2";
    const rawFounderBlueprint = {
      uid: founderUID,
      input: { birthDate: founderDOB, birthTime: "23:45", timezone: "Asia/Jakarta" },
      destinyMatrix: {
        center: 8,
        arcanaCenter: 8,
        karmicTail: [21, 7, 13],
      },
    };

    it("All paths preserve canonical [21, 7, 13] with zero mutation churn", () => {
      // Diagram
      const vm = buildDestinyMatrixVisualModel(calculateBhumiMatrix(founderDOB));
      assert.deepEqual(vm.karmic.values, [21, 7, 13]);

      // Repository
      const normalized = normalizeBlueprint(founderUID, rawFounderBlueprint as any);
      assert.deepEqual(normalized.destinyMatrix?.karmicTail, [21, 7, 13]);

      // Guidance
      const extracted = extractFullCanonicalBlueprint(rawFounderBlueprint, {}, refDate);
      assert.deepEqual(extracted.dmKarmicTail, [21, 7, 13]);

      // Translation
      const canonical = CanonicalTranslatorService.translate(rawFounderBlueprint as any);
      assert.deepEqual(canonical.shadow.karmicTail, [21, 7, 13]);

      // Synthesis
      const syn = buildUnifiedBlueprintSynthesis({
        blueprint: rawFounderBlueprint as any,
        profile: { birthDate: founderDOB } as any,
        language: "id",
      });
      assert.deepEqual(syn.fullBlueprint.destinyMatrix.karmicTail, [21, 7, 13]);

      // Arsip Akashi
      const arsipInput = buildArsipAkashiInputFromProfile(
        { uid: founderUID, birthDate: founderDOB, birthTime: "23:45" },
        rawFounderBlueprint as any
      );
      const ktFact = arsipInput.systems["destiny-matrix"].normalizedFacts.find((f) => f.factId === "destiny-matrix/shadow/karmicTail");
      assert.equal(ktFact?.value, "21-7-13");
    });
  });

  // ==========================================================================
  // CASE C: GAIA LEGACY INVERTED ORDER (1984-03-28, stored [8, 5, 15])
  // Expected canonical: [15, 5, 8]
  // ==========================================================================
  describe("Case C: Gaia Legacy Inverted Order ([8, 5, 15] -> [15, 5, 8])", () => {
    const rawGaiaBlueprint = {
      uid: "gaia-legacy-uid",
      input: { birthDate: "1984-03-28" },
      destinyMatrix: {
        center: 7,
        karmicTail: [8, 5, 15], // Gaia inverted order [BM04, BM17, BM10]
      },
    };

    it("Re-orders bottom-to-top to canonical top-down across repository, guidance, translation, and synthesis", () => {
      const normalized = normalizeBlueprint("gaia-legacy-uid", rawGaiaBlueprint as any);
      assert.deepEqual(normalized.destinyMatrix?.karmicTail, [15, 5, 8]);

      const extracted = extractFullCanonicalBlueprint(rawGaiaBlueprint, {}, refDate);
      assert.deepEqual(extracted.dmKarmicTail, [15, 5, 8]);

      const canonical = CanonicalTranslatorService.translate(rawGaiaBlueprint as any);
      assert.deepEqual(canonical.shadow.karmicTail, [15, 5, 8]);

      const syn = buildUnifiedBlueprintSynthesis({
        blueprint: rawGaiaBlueprint as any,
        profile: { birthDate: "1984-03-28" } as any,
        language: "id",
      });
      assert.deepEqual(syn.fullBlueprint.destinyMatrix.karmicTail, [15, 5, 8]);
    });
  });

  // ==========================================================================
  // CASE D: MISSING OR INVALID BIRTH DATE
  // Expected: Fails closed, preserves historical data, does NOT fabricate
  // ==========================================================================
  describe("Case D: Missing or Invalid Birth Date", () => {
    const legacySnapshot = [10, 3, 22];

    it("Missing birthDate in input preserves historical array without crash or overwrite", () => {
      const bpMissingDOB = {
        uid: "missing-dob-uid",
        input: { birthDate: "" },
        destinyMatrix: {
          center: 7,
          karmicTail: legacySnapshot,
        },
      };

      const normalized = normalizeBlueprint("missing-dob-uid", bpMissingDOB as any);
      assert.deepEqual(normalized.destinyMatrix?.karmicTail, legacySnapshot);

      const extracted = extractFullCanonicalBlueprint(bpMissingDOB, {}, refDate);
      assert.deepEqual(extracted.dmKarmicTail, legacySnapshot);

      const canonical = CanonicalTranslatorService.translate(bpMissingDOB as any);
      assert.deepEqual(canonical.shadow.karmicTail, legacySnapshot);
    });

    it("Invalid date format does not throw and preserves historical array", () => {
      const bpInvalidDOB = {
        uid: "invalid-dob-uid",
        input: { birthDate: "9999-99-99" },
        weton: {} as any,
        bazi: {} as any,
        destinyMatrix: {
          center: 7,
          karmicTail: [7, 7, 7],
        },
      };

      const normalized = normalizeBlueprint("invalid-dob-uid", bpInvalidDOB as any);
      assert.deepEqual(normalized.destinyMatrix?.karmicTail, [7, 7, 7]);

      const extracted = extractFullCanonicalBlueprint(bpInvalidDOB, {}, refDate);
      assert.deepEqual(extracted.dmKarmicTail, [7, 7, 7]);
    });
  });

  // ==========================================================================
  // TASK 2: NEW DATA WRITE PATH VALIDATION
  // ==========================================================================
  describe("Task 2: New Data Write Path Validation", () => {
    it("calculateDestinyMatrixForBlueprint in mapToBlueprint.ts produces canonical karmicTail", () => {
      const resultPita = calculateDestinyMatrixForBlueprint("1984-03-28");
      assert.deepEqual(resultPita.karmicTail, [15, 5, 8]);

      const resultFounder = calculateDestinyMatrixForBlueprint("1985-05-03");
      assert.deepEqual(resultFounder.karmicTail, [21, 7, 13]);
    });

    it("normalizeBlueprint for freshly created blueprint outputs canonical karmicTail", () => {
      const newBP = normalizeBlueprint("fresh-uid", {
        input: { birthDate: "1984-03-28", birthTime: "11:45" },
      });
      assert.deepEqual(newBP.destinyMatrix?.karmicTail, [15, 5, 8]);
    });
  });
});
