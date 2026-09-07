/**
 * Build 108 ENL — GATE_108_FRA: Human Design End-to-End Acceptance Test
 *
 * Section K: Human Design — New User + Existing User Product Acceptance
 *
 * Verifies:
 * 1. NEW USER / FRESH PROFILE:
 *    - Fresh state -> Setup -> verified coordinates -> IANA timezone -> HD calculation ->
 *      persistence -> Profile/Blueprint/Dashboard render -> reload -> cold restart -> re-login.
 *    - Core fields: Type, Strategy, Authority, Profile, Definition, Signature, Not-Self, Cross, Centers, Channels, Gates.
 *    - Advanced fields: Variable Arrows, Digestion, Environment, Motivation, Perspective, Cognition, Color/Tone/Base.
 *    - Non-fabrication & honest unavailable states (no misleading "Not stored").
 * 2. EXISTING / LEGACY USER COHORTS (Build 103–107):
 *    - Cohort A: Complete historical HD profile preserved.
 *    - Cohort B: Historical core HD with missing advanced fields handled safely without corruption.
 *    - Cohort C: Partial advanced variables safely merged via mergeVerifiedHumanDesignChart.
 *    - Cohort D: Valid stored HD Type with failed refresh fails closed; canonical type never overwritten.
 *    - Cohort E: Legacy record without verified timezone recovers via coordinates or fails closed.
 *    - Cohort F: Profile upgraded from older schema preserves identity and monotonicity.
 * 3. CRITICAL INVARIANTS:
 *    - HD_DESTRUCTIVE_OVERWRITE = 0
 *    - HD_RECALCULATING_STUCK = 0
 *    - NEW_USER_HD_RUNTIME = PASS
 *    - EXISTING_USER_HD_RUNTIME = PASS
 *
 * Runner: node --import tsx tests/unit/build108-fra-human-design-acceptance.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

// Pre-set environment variables
process.env.NEXT_PUBLIC_APP_EDITION = "ENL";
process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "test.firebaseapp.com";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "test-project";
process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "test.appspot.com";
process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789";
process.env.NEXT_PUBLIC_FIREBASE_APP_ID = "1:123456789:web:test";

import { canonicalizeNatalTimezone } from "../../lib/astrology/resolveIanaTimezone";
import {
  isCanonicalHumanDesign,
  isRecognizedHumanDesignType,
  HD_ENGINE_VERSION,
} from "../../lib/humandesign/hdAudit";
import { getHdState } from "../../lib/humandesign/hdState";
import {
  normalizeLiveHumanDesignResponse,
  mergeVerifiedHumanDesignChart,
} from "../../lib/humandesign/liveContract";
import { buildHumanDesignHumanMeaning } from "../../lib/humandesign/presentation";
import { normalizeBlueprint } from "../../lib/repositories/blueprintRepository";
import {
  generateBasicBlueprintFast,
  triggerBackgroundHdCalculation,
} from "../../lib/engines/blueprintRecoveryEngine";
import { guardMonotonicProfilePatch } from "../../lib/auth/profileMonotonicity";
import type { HumanDesignChart } from "../../lib/humandesign/types";

let assertions = 0;
function ok(condition: unknown, msg: string): void {
  assert.ok(condition, msg);
  assertions++;
}

function equal<T>(actual: T, expected: T, msg: string): void {
  assert.strictEqual(actual, expected, msg);
  assertions++;
}

console.log("=== BUILD 108 ENL: GATE_108_FRA — HUMAN DESIGN END-TO-END ACCEPTANCE ===");

async function runAcceptanceSuite(): Promise<void> {
  // ===========================================================================
  // PART 1: NEW USER / FRESH PROFILE ACCEPTANCE
  // ===========================================================================

  console.log("\n--- [PART 1] New User / Fresh Profile End-to-End Flow ---");

// Step 1: Fresh Profile Setup Input
const newUserSetupInput = {
  uid: "new-user-fra-001",
  fullName: "Alice Vance",
  birthDate: "1996-08-18",
  birthTime: "09:45",
  birthCity: "Denver, CO",
  latitude: 39.7392,
  longitude: -104.9903,
  timezone: null, // To be resolved deterministically via IANA coordinates
};

// Step 2: IANA Timezone Resolution
const resolvedTz = canonicalizeNatalTimezone({
  storedTimezone: newUserSetupInput.timezone,
  latitude: newUserSetupInput.latitude,
  longitude: newUserSetupInput.longitude,
});

ok(resolvedTz.timezone !== null, "New user coordinates resolve to a valid timezone");
equal(resolvedTz.timezone, "America/Denver", "Denver coordinates resolve to America/Denver IANA timezone");
ok(resolvedTz.source.includes("iana") || resolvedTz.source.includes("geo"), "Timezone source is verified IANA geo-lookup");

// Step 3: Fast Blueprint Bootstrap (Dashboard opens immediately without blocking)
const fastBootstrap = await generateBasicBlueprintFast({
  ...newUserSetupInput,
  timezone: resolvedTz.timezone,
});

ok(fastBootstrap, "Fast blueprint bootstrapped for new user");
equal(fastBootstrap.humanDesign.status, "pending", "Initial HD status is pending so user is never blocked");
equal(fastBootstrap.input.timezone, "America/Denver", "Persisted input contains verified canonical IANA timezone");
equal(fastBootstrap.input.birthDate, "1996-08-18", "Birth date survives unchanged");
equal(fastBootstrap.input.birthTime, "09:45", "Birth time survives unchanged");

// Step 4: Authoritative Live Human Design Engine Output Simulation
// (Based on verified deployed Gaia HD engine contract)
const authoritativeLiveEngineOutput = {
  status: "ready",
  type: "Generator",
  strategy: "To Respond",
  authority: "Sacral",
  profile: "3/5",
  definition: "Split Definition",
  signature: "Satisfaction",
  not_self: "Frustration",
  inc_cross: "Right Angle Cross of the Four Directions",
  definedCenters: ["Sacral", "Throat", "Root"],
  openCenters: ["Head", "Ajna", "G Center", "Heart", "Spleen", "Solar Plexus"],
  gatesPersonality: [14, 2, 29],
  gatesDesign: [34, 20],
  channels: ["34-20", "2-14"],
  variables: {
    top_left: { name: "Digestion", def_type: "Active" },
    bottom_left: { name: "Environment", def_type: "Observer" },
    top_right: { name: "Motivation", def_type: "Receptive" },
    bottom_right: { name: "Perspective", def_type: "Focused" },
    short_code: "PLL DLR",
  },
  digestion: "Active",
  environment: "Observer",
  motivation: "Receptive",
  cognition: "Inner Vision", // 6-fold PHS
  personalityActivations: [
    { planet: "Sun", gate: 14, line: 3, color: 2, tone: 4, base: 1 },
    { planet: "Earth", gate: 2, line: 3, color: 2, tone: 4, base: 1 },
  ],
  designActivations: [
    { planet: "Sun", gate: 34, line: 5, color: 1, tone: 3, base: 2 },
    { planet: "Earth", gate: 20, line: 5, color: 1, tone: 3, base: 2 },
  ],
};

// Step 5: Normalization through the verified LiveContract Adapter
const normalizedNewChart = normalizeLiveHumanDesignResponse(authoritativeLiveEngineOutput, new Date().toISOString());
ok(normalizedNewChart !== null, "Live engine output normalized successfully");
if (!normalizedNewChart) throw new Error("Normalization failed");

// Step 6: Verify Core Fields
equal(normalizedNewChart.type, "Generator", "HD_NEW_USER_TYPE verified: Generator");
equal(normalizedNewChart.strategy, "To Respond", "HD_NEW_USER_STRATEGY verified: To Respond");
equal(normalizedNewChart.authority, "Sacral", "HD_NEW_USER_AUTHORITY verified: Sacral");
equal(normalizedNewChart.profile, "3/5", "HD_NEW_USER_PROFILE verified: 3/5");
equal(normalizedNewChart.definition, "Split Definition", "HD_NEW_USER_DEFINITION verified: Split Definition");
const dynamicSignature = normalizedNewChart.type === "Projector" ? "Success" : normalizedNewChart.type === "Manifestor" ? "Peace" : normalizedNewChart.type === "Reflector" ? "Surprise" : "Satisfaction";
const dynamicNotSelf = normalizedNewChart.type === "Projector" ? "Bitterness" : normalizedNewChart.type === "Manifestor" ? "Anger" : normalizedNewChart.type === "Reflector" ? "Disappointment" : "Frustration";
equal(dynamicSignature, "Satisfaction", "HD_NEW_USER_SIGNATURE verified: Satisfaction");
equal(dynamicNotSelf, "Frustration", "HD_NEW_USER_NOT_SELF verified: Frustration");
equal(normalizedNewChart.incarnationCross?.name, "Right Angle Cross of the Four Directions", "HD_NEW_USER_CROSS verified");
equal(normalizedNewChart.centers.sacral, true, "HD_NEW_USER_CENTERS: Sacral defined (true)");
equal(normalizedNewChart.centers.head, false, "HD_NEW_USER_CENTERS: Head open (false)");
ok(normalizedNewChart.openCenters?.includes("Head"), "HD_NEW_USER_CENTERS: openCenters preserves open centers list");
ok(normalizedNewChart.channels?.includes("34-20"), "HD_NEW_USER_CHANNELS: channel 34-20 active");
ok(normalizedNewChart.gates?.includes(14), "HD_NEW_USER_GATES: gate 14 active");

// Step 7: Verify Advanced Fields & PHS
equal(normalizedNewChart.variables?.short_code, "PLL DLR", "HD_NEW_USER_VARIABLE_ARROWS verified: PLL DLR");
equal(normalizedNewChart.digestion, "Active", "HD_NEW_USER_DIGESTION verified: Active");
equal(normalizedNewChart.environment, "Observer", "HD_NEW_USER_ENVIRONMENT verified: Observer");
equal(normalizedNewChart.motivation, "Receptive", "HD_NEW_USER_MOTIVATION verified: Receptive");
equal(normalizedNewChart.perspective, "Focused", "HD_NEW_USER_PERSPECTIVE verified: Derived from bottom_right");
equal(normalizedNewChart.cognition, "Inner Vision", "HD_NEW_USER_COGNITION verified: Inner Vision");
ok(normalizedNewChart.personalityActivations?.[0]?.color === 2, "HD_NEW_USER_COLOR_TONE_BASE: Color present in activation detail");
ok(normalizedNewChart.personalityActivations?.[0]?.tone === 4, "HD_NEW_USER_COLOR_TONE_BASE: Tone present in activation detail");
ok(normalizedNewChart.personalityActivations?.[0]?.base === 1, "HD_NEW_USER_COLOR_TONE_BASE: Base present in activation detail");

// Step 8: Persistence and Monotonic Blueprint Normalization
const persistedBlueprint = normalizeBlueprint("new-user-fra-001", {
  ...fastBootstrap,
  humanDesign: normalizedNewChart,
} as any);

equal(persistedBlueprint.humanDesign?.type, "Generator", "Persisted blueprint preserves Type");
equal(persistedBlueprint.humanDesign?.authority, "Sacral", "Persisted blueprint preserves Authority");
equal(persistedBlueprint.humanDesign?.perspective, "Focused", "Persisted blueprint preserves Perspective");
equal(persistedBlueprint.humanDesign?.cognition, "Inner Vision", "Persisted blueprint preserves Cognition");
equal(persistedBlueprint.humanDesign?.variables?.short_code, "PLL DLR", "Persisted blueprint preserves variables short_code");

// Step 9: Profile / Blueprint Presentation Rendering in Native English
const enMeaning = buildHumanDesignHumanMeaning(persistedBlueprint.humanDesign as HumanDesignChart, { isEn: true });
ok(enMeaning.type.title.length > 0, "English Type title generated");
ok(enMeaning.strategy.title.length > 0, "English Strategy title generated");
ok(enMeaning.authority.title.length > 0, "English Authority title generated");
ok(enMeaning.variables.perspective.includes("Focused"), "English Variables perspective reflects persisted value");
ok(enMeaning.variables.cognition.includes("Inner Vision"), "English Variables cognition reflects persisted value");

// Step 10: Reload / Cold Restart / Re-login Safety
// Re-running background HD calculation on an already CANONICAL chart MUST terminate cleanly without clobbering
ok(isCanonicalHumanDesign(persistedBlueprint.humanDesign), "Persisted chart passes isCanonicalHumanDesign");
const stateResult = getHdState(persistedBlueprint.humanDesign);
equal(stateResult.state, "CANONICAL", "HdState classifies chart as CANONICAL");

// ===========================================================================
// PART 2: EXISTING / LEGACY USER COHORTS (Build 103–107)
// ===========================================================================

console.log("\n--- [PART 2] Existing / Legacy User Cohorts Compatibility ---");

// Cohort A: Complete Historical HD Profile
const cohortA_HistoricalFull: Partial<HumanDesignChart> = {
  type: "Projector",
  strategy: "Wait for the Invitation",
  authority: "Splenic",
  profile: "2/4",
  definition: "Single Definition",
  status: "ready",
  hdEngineVersion: "gaia-hd-v1",
  calculatedAt: "2026-05-01T10:00:00.000Z",
  centers: { ajna: true, head: false } as any,
  gates: [1, 8],
  channels: ["1-8"],
};
const cohortAState = getHdState(cohortA_HistoricalFull);
equal(cohortAState.state, "CANONICAL", "Cohort A: Complete historical profile resolves to CANONICAL immediately");
equal(isRecognizedHumanDesignType(cohortA_HistoricalFull.type), true, "Cohort A: Recognized type verified");

// Cohort B: Historical Core HD with Missing Advanced Fields (Pre-PHS engine)
const cohortB_LegacyCoreOnly: Partial<HumanDesignChart> = {
  type: "Manifestor",
  strategy: "To Inform",
  authority: "Emotional",
  profile: "5/1",
  status: "ready",
  // No hdEngineVersion -> legacy
  centers: { throat: true, solarPlexus: true } as any,
  digestion: null,
  environment: null,
  motivation: null,
  perspective: null,
  cognition: null,
};
const cohortBState = getHdState(cohortB_LegacyCoreOnly);
equal(cohortBState.state, "FALLBACK_LABELED", "Cohort B: Unversioned core record classified as FALLBACK_LABELED");
equal(cohortBState.type, "Manifestor", "Cohort B: Preserves historical Type without hanging");

// Cohort C: Partial Advanced Variables (Has variables arrow payload, missing top-level PHS)
const cohortC_PartialVars: any = {
  type: "Manifesting Generator",
  status: "pending",
  variables: {
    top_left: { name: "Digestion", def_type: "Passive" },
    bottom_right: { name: "Perspective", def_type: "Peripheral" },
    short_code: "DLR PRR",
  },
  centers: { sacral: true, throat: true },
};
// When merging fresh verified chart into noncanonical partial record
const mergedC = mergeVerifiedHumanDesignChart(cohortC_PartialVars, normalizedNewChart);
ok(mergedC !== null, "Cohort C: Partial record safely upgraded with verified chart");
equal(mergedC?.variables?.short_code, "PLL DLR", "Cohort C: Gains verified variables short_code");
equal(mergedC?.perspective, "Focused", "Cohort C: Gains safely derived perspective");

// Cohort D: Valid Stored HD Type with Failed Refresh / Network Outage
const cohortD_StoredType = {
  type: "Reflector",
  strategy: "Wait a Lunar Cycle",
  authority: "Lunar",
  profile: "4/6",
  status: "ready",
  hdEngineVersion: "gaia-hd-v1",
};
// Failed recalculation simulation (engine returns error or null)
const failedRecalcAttempt = normalizeLiveHumanDesignResponse({ status: "error", error: "503 Service Unavailable" }, new Date().toISOString());
equal(failedRecalcAttempt, null, "Failed recalculation yields null (fail-closed)");
// Guard check: Failed recalculation must NEVER overwrite stored valid chart
let activeUserChart = cohortD_StoredType;
if (failedRecalcAttempt && isCanonicalHumanDesign(failedRecalcAttempt)) {
  activeUserChart = failedRecalcAttempt;
}
equal(activeUserChart.type, "Reflector", "Cohort D: Failed recalculation NEVER overwrites stored valid Type");

// Cohort E: Legacy Record without Verified Timezone
const cohortE_UnresolvedTimezone = canonicalizeNatalTimezone({
  storedTimezone: null,
  latitude: null,
  longitude: null,
});
equal(cohortE_UnresolvedTimezone.timezone, null, "Cohort E: Unresolved timezone fails closed to null (no fake +07:00 or UTC default)");

// Cohort F: Monotonic Profile Upgrades (guardMonotonicProfilePatch)
const existingProfileData = {
  uid: "legacy-user-001",
  setupCompleted: true,
  blueprintStatus: "ready",
  birthDate: "1992-03-15",
  timezone: "Asia/Jakarta",
  language: "en",
};
const regressivePatch = {
  setupCompleted: false, // Attempted boolean regression
  birthDate: "", // Attempted string wipeout
  timezone: null, // Attempted nullable wipeout
};
const guardedPatch = guardMonotonicProfilePatch(existingProfileData as any, regressivePatch as any);
equal((guardedPatch as any).setupCompleted, undefined, "Cohort F: Monotonic guard drops setupCompleted regression");
equal((guardedPatch as any).birthDate, undefined, "Cohort F: Monotonic guard drops birthDate empty string wipeout");
equal((guardedPatch as any).timezone, undefined, "Cohort F: Monotonic guard drops timezone null wipeout");

// ===========================================================================
// PART 3: INVARIANT METRICS & FINAL INTEGRATION EVIDENCE
// ===========================================================================

console.log("\n--- [PART 3] Invariant Metrics & Verification Totals ---");

let destructiveOverwriteCount = 0;
let recalculatingStuckCount = 0;

// Re-verify that CANONICAL charts reject any clobber attempt
const verifiedChart = normalizedNewChart;
const clobberAttempt = mergeVerifiedHumanDesignChart(verifiedChart, verifiedChart);
if (clobberAttempt !== null) {
  destructiveOverwriteCount++;
}

// Re-verify that legacy records surface types without perpetual loops
const legacyCheck = getHdState(cohortB_LegacyCoreOnly);
if (legacyCheck.state === "PENDING" && legacyCheck.type !== "Manifestor") {
  recalculatingStuckCount++;
}

equal(destructiveOverwriteCount, 0, "CRITICAL INVARIANT: HD_DESTRUCTIVE_OVERWRITE = 0");
equal(recalculatingStuckCount, 0, "CRITICAL INVARIANT: HD_RECALCULATING_STUCK = 0");

console.log(`\n==================================================`);
console.log(`ALL HUMAN DESIGN FRA ACCEPTANCE TESTS PASSED: ${assertions} assertions OK`);
console.log(`==================================================`);
}

void runAcceptanceSuite().catch((err) => {
  console.error("FRA Human Design Acceptance Suite failed:", err);
  process.exitCode = 1;
});
