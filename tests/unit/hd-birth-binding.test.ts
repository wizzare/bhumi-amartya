import assert from "node:assert/strict";
import test from "node:test";
import {
  computeBirthInputFingerprint,
  compareBirthInputMatch,
} from "../../lib/humandesign/birthFingerprint";
import {
  recoverHumanDesignIfNeeded,
  mergeBlueprintPreservingCanonical,
  type HdRecoveryDeps,
} from "../../lib/humandesign/hdRecovery";
import type { HumanDesignChart } from "../../lib/humandesign/types";

const baseProfile = {
  birthDate: "1990-05-15",
  birthTime: "08:30",
  birthCity: "Jakarta",
  timezone: "Asia/Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
};

function buildSampleCanonical(type = "Generator"): HumanDesignChart {
  return {
    type,
    strategy: "To Respond",
    authority: "Sacral Authority",
    profile: "1/3",
    definition: "Single Definition",
    incarnationCross: { name: "Right Angle Cross of the Sphinx", gates: [1, 2, 7, 13] },
    centers: {
      head: false, ajna: false, throat: true, g: true, ego: false,
      spleen: false, sacral: true, solarPlexus: false, root: false,
    },
    openCenters: ["Head", "Ajna", "Ego", "Spleen", "Solar Plexus", "Root"],
    gates: [10, 20, 34, 57],
    channels: ["10-20", "34-57"],
    diagnostic: null,
    personalityActivations: [],
    designActivations: [],
    raw_personality_gates: [],
    raw_design_gates: [],
    variables: null,
    digestion: null,
    cognition: null,
    motivation: null,
    environment: null,
    perspective: null,
    status: "ready",
    source: "human-design-py",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "validated",
    generatedAt: "2026-10-07T00:00:00.000Z",
    updatedAt: "2026-10-07T00:00:00.000Z",
    calculationStatus: "completed",
  };
}

// 1. Input sama menghasilkan fingerprint sama (deterministik)
test("HD-03 BIND-01: Same birth input produces identical fingerprint hash", () => {
  const fp1 = computeBirthInputFingerprint("user-1", baseProfile);
  const fp2 = computeBirthInputFingerprint("user-1", { ...baseProfile });
  assert.ok(fp1 !== null && fp2 !== null);
  assert.equal(fp1.revisionHash, fp2.revisionHash);
});

// 2. Perubahan jam lahir menghasilkan revision berbeda
test("HD-03 BIND-02: Birth time change yields different revision hash", () => {
  const fp1 = computeBirthInputFingerprint("user-1", baseProfile);
  const fp2 = computeBirthInputFingerprint("user-1", { ...baseProfile, birthTime: "08:45" });
  assert.ok(fp1 && fp2);
  assert.notEqual(fp1.revisionHash, fp2.revisionHash);
});

// 3. Perubahan lokasi / timezone menghasilkan revision berbeda
test("HD-03 BIND-03: Timezone or coordinate change yields different revision hash", () => {
  const fp1 = computeBirthInputFingerprint("user-1", baseProfile);
  const fpTz = computeBirthInputFingerprint("user-1", { ...baseProfile, timezone: "Europe/London" });
  const fpCoord = computeBirthInputFingerprint("user-1", { ...baseProfile, latitude: 51.5074, longitude: -0.1278 });
  assert.ok(fp1 && fpTz && fpCoord);
  assert.notEqual(fp1.revisionHash, fpTz.revisionHash);
  assert.notEqual(fp1.revisionHash, fpCoord.revisionHash);
});

// 4. Kalkulasi lama selesai setelah data lahir diperbarui ditolak (stale overwrite prevention)
test("HD-03 BIND-04: Calculation completes after birth input changed is cancelled", async () => {
  let storedInput = { ...baseProfile };
  const chartOld = buildSampleCanonical("Generator");
  
  const deps: HdRecoveryDeps = {
    uid: "user-race-1",
    profile: baseProfile,
    blueprint: { uid: "user-race-1", input: storedInput, humanDesign: { status: "pending" } },
    read: async () => ({
      uid: "user-race-1",
      input: storedInput, // Will reflect updated input on second read
      humanDesign: { status: "pending" },
    }),
    calculate: async () => {
      // Simulate input update while calculate is in flight
      storedInput = { ...baseProfile, birthTime: "12:00" };
      return chartOld;
    },
    persist: async () => {
      assert.fail("Persistence must NOT be called when input revision changed in-flight");
    },
  };

  const res = await recoverHumanDesignIfNeeded(deps);
  assert.equal(res.action, "cancelled");
  assert.equal(res.reason, "input_revision_changed_during_calculation");
});

// 5. Dua kalkulasi berjalan bersamaan untuk UID sama di-deduplikasi
test("HD-03 BIND-05: Concurrent calculations for same UID share in-flight promise", async () => {
  let calcCount = 0;
  const deps: HdRecoveryDeps = {
    uid: "user-concurrent-1",
    profile: baseProfile,
    blueprint: { uid: "user-concurrent-1", input: baseProfile, humanDesign: { status: "pending" } },
    read: async () => ({ uid: "user-concurrent-1", input: baseProfile, humanDesign: { status: "pending" } }),
    calculate: async () => {
      calcCount++;
      await new Promise((r) => setTimeout(r, 20));
      return buildSampleCanonical();
    },
    persist: async () => true,
  };

  const [res1, res2] = await Promise.all([
    recoverHumanDesignIfNeeded(deps),
    recoverHumanDesignIfNeeded(deps),
  ]);

  assert.equal(res1, res2);
  assert.equal(calcCount, 1, "Calculation must be executed exactly once");
});

// 6. Logout / isActive false ketika kalkulasi berlangsung membatalkan persistensi
test("HD-03 BIND-06: Inactive/logout during calculation aborts persistence", async () => {
  let active = true;
  const deps: HdRecoveryDeps = {
    uid: "user-logout-1",
    profile: baseProfile,
    blueprint: { uid: "user-logout-1", input: baseProfile, humanDesign: { status: "pending" } },
    isActive: () => active,
    read: async () => ({ uid: "user-logout-1", input: baseProfile, humanDesign: { status: "pending" } }),
    calculate: async () => {
      active = false; // User logged out while calculating
      return buildSampleCanonical();
    },
    persist: async () => {
      assert.fail("Persistence must NOT be called when session became inactive");
    },
  };

  const res = await recoverHumanDesignIfNeeded(deps);
  assert.equal(res.action, "cancelled");
  assert.equal(res.reason, "inactive");
});

// 7. Hasil user A tidak dapat ditulis ke user B (owner mismatch)
test("HD-03 BIND-07: Owner mismatch between deps UID and blueprint UID is cancelled", async () => {
  const deps: HdRecoveryDeps = {
    uid: "user-A",
    profile: baseProfile,
    blueprint: { uid: "user-B", input: baseProfile, humanDesign: { status: "pending" } },
    persist: async () => {
      assert.fail("Persistence must NOT be called on owner mismatch");
    },
  };

  const res = await recoverHumanDesignIfNeeded(deps);
  assert.equal(res.action, "cancelled");
  assert.equal(res.reason, "owner_mismatch");
});

// 8. Chart legacy tanpa fingerprint diperlakukan sebagai UNKNOWN_LEGACY (bukan otomatis invalid)
test("HD-03 BIND-08: Legacy chart without inputHash returns UNKNOWN_LEGACY", () => {
  const legacyChart = {
    type: "Projector",
    status: "ready",
    source: "legacy-v0",
    // No inputHash
  };
  const match = compareBirthInputMatch("user-1", legacyChart, baseProfile);
  assert.equal(match, "UNKNOWN_LEGACY");
});

// 9. Input matching fingerprint returns MATCH
test("HD-03 BIND-09: Matching fingerprint returns MATCH", () => {
  const fp = computeBirthInputFingerprint("user-1", baseProfile);
  assert.ok(fp);
  const chartWithHash = {
    type: "Generator",
    status: "ready",
    inputHash: fp.revisionHash,
  };
  const match = compareBirthInputMatch("user-1", chartWithHash, baseProfile);
  assert.equal(match, "MATCH");
});

// 10. Chart canonical lengkap tidak tertimpa payload parsial
test("HD-03 BIND-10: Stored canonical is never overwritten by partial incoming chart", () => {
  const stored = buildSampleCanonical("Projector");
  const partial = { type: "Generator", status: "pending" };
  const result = mergeBlueprintPreservingCanonical(stored, partial);
  assert.equal(result, stored);
  assert.equal((result as HumanDesignChart).type, "Projector");
});
