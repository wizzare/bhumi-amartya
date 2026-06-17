import assert from "node:assert/strict";
import { getGaiaAccessState, isGaiaAccessOverrideActive } from "../lib/billing/gaiaAccess";
import { HD_ENGINE_VERSION, isCanonicalHumanDesign } from "../lib/humandesign/hdAudit";
import { synthesizeGaiaProfile } from "../lib/profile/gaia/synthesisEngine";
import { getShareSafeGaiaInsights } from "../lib/profile/gaia/selectors";
import { INNERWORK_VARIATION_LIBRARY } from "../lib/data/innerworkVariationLibrary";

assert.equal(isGaiaAccessOverrideActive(new Date("2026-06-30T23:59:59+07:00")), true);
assert.equal(isGaiaAccessOverrideActive(new Date("2026-07-01T00:00:00+07:00")), false);
const override = getGaiaAccessState(new Date("2026-06-30T23:59:59+07:00"));
assert.equal(override.billingExpired, false);
assert.equal(override.trialExpired, false);
assert.ok(override.canAccessCoreFeatures && override.canAccessInnerwork && override.canAccessMeditation && override.canAccessAudio && override.canAccessJournal && override.canAccessWeeklyReport);
assert.equal(isCanonicalHumanDesign({ type: "Projector", status: "ready", source: "local-fallback", hdEngineVersion: HD_ENGINE_VERSION }), false);
assert.equal(isCanonicalHumanDesign({ type: "Generator", status: "ready", source: "human-design-py", calculationQuality: "verified", hdEngineVersion: HD_ENGINE_VERSION }), true);

const profile = synthesizeGaiaProfile({
  lifePath: { number: 4, role: "Pembangun", positiveTraits: ["Tekun"] },
  destinyMatrix: { arcanaCenter: 8, moneyLine: [4, 8], talentsGreat: [3, 6], loveLine: [2, 6], karmicTail: [12], destinyIntelligence: { healthChart: { ajna: { physics: 5, energy: 8, emotion: 6 }, manipura: { physics: 7, energy: 9, emotion: 5 }, anahata: { physics: 6, energy: 7, emotion: 8 } } } },
  astrology: { sunSign: "Taurus", moonSign: "Cancer", midheaven: "Capricorn", planets: { venus: { sign: "Taurus" }, mars: { sign: "Aries" } } },
  humanDesign: { type: "Projector", status: "ready", source: "local-fallback", authority: "Emotional" },
});

assert.deepEqual(Object.keys(profile.identity), ["lifePath", "arcanaCenter", "humanDesignType", "sunSign"]);
assert.equal(profile.identity.humanDesignType, "Human Design sedang diproses.");
assert.equal(profile.internal.humanDesignAuthority, null);
assert.equal(profile.profileVersion, "gaia-v1");
assert.equal(profile.sections.shadow.length, 10);
assert.equal(profile.sections.talents.length, 9);
assert.equal(profile.sections.energy.length, 8);
assert.equal(profile.sections.relationships.length, 9);
assert.equal(profile.sections.career.length, 9);
assert.equal(profile.sections.spirituality.length, 8);
assert.deepEqual(profile.sections.career.map((insight) => insight.id), ["careerDNA", "sacredBusiness", "idealWorkEnvironment", "valueCreation", "leadershipStyle", "valuePotential", "moneyBlock", "businessPotential", "careerGrowthPattern"]);
assert.equal(profile.sections.shadow.find((insight) => insight.id === "coreFear")?.meta.sensitive, true);
assert.ok(Object.values(profile.sections).flat().every((insight) => insight.guidance[0].length >= 300));
assert.ok(Object.values(profile.sections).flat().every((insight) => insight.guidance[0].includes("\n\n")));
assert.ok(Object.values(profile.sections).flat().every((insight) => Array.isArray(insight.dataPoints) && insight.effect.length > 20));
assert.ok(profile.sections.energy.find((insight) => insight.id === "chakraProfile")?.dataPoints.length);
assert.deepEqual(profile.sections.energy.find((insight) => insight.id === "chakraProfile")?.dataPoints.map((item) => item.label), ["Ajna", "Manipura", "Anahata"]);
assert.deepEqual(profile.sections.talents.find((insight) => insight.id === "elementComposition")?.dataPoints.map((item) => item.label), ["Earth", "Water", "Air", "Fire", "Ether"]);
assert.equal(profile.sections.talents.find((insight) => insight.id === "giftGeneKeys")?.dataPoints.length, 0);
const sectionGuidanceOpenings = Object.values(profile.sections).map((insights) => insights[0].guidance[0].split(" ").slice(0, 16).join(" "));
assert.equal(new Set(sectionGuidanceOpenings).size, 6);
assert.ok(profile.sections.career[0].guidance[0].includes("eksperimen kerja"));
assert.ok(profile.sections.relationships[0].guidance[0].includes("satu relasi"));
assert.ok(profile.sections.energy[0].guidance[0].includes("ritme harian"));

assert.deepEqual(Object.keys(INNERWORK_VARIATION_LIBRARY).sort(), ["audioHealing", "healthyFood", "journaling", "manifestation", "meditation", "workout", "yoga"]);
assert.ok(Object.values(INNERWORK_VARIATION_LIBRARY).every((items) => items.length >= 4));
assert.ok(getShareSafeGaiaInsights(profile).every((insight) => insight.meta.publicSafe && !insight.meta.sensitive && insight.meta.strength !== "LOW"));

console.log("Gaia policy and synthesis tests passed.");
