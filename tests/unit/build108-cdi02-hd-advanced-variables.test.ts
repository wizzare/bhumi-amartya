import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { isCanonicalHumanDesign } from "../../lib/humandesign/hdAudit";
import { buildHumanDesignHumanMeaning } from "../../lib/humandesign/presentation";
import { mergeVerifiedHumanDesignChart, normalizeLiveHumanDesignResponse, presentHumanDesignAdvancedFields } from "../../lib/humandesign/liveContract";

Object.assign(process.env, {
  NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-cdi10802-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-cdi10802.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-cdi10802",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-cdi10802.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:cdi10802",
});

let assertions = 0;
const ok = (condition: unknown, message: string) => {
  assertions += 1;
  assert.ok(condition, message);
};
const equal = <T>(actual: T, expected: T, message: string) => {
  assertions += 1;
  assert.strictEqual(actual, expected, message);
};

const liveFixture = {
  status: "ready",
  type: "Projector",
  strategy: "Wait for the Invitation",
  authority: "Splenic",
  profile: "2/4",
  definition: "Single Definition",
  inc_cross: "Right Angle Cross",
  definedCenters: ["Ajna", "G Center"],
  openCenters: ["Head", "Sacral"],
  gatesPersonality: [1, 2],
  gatesDesign: [3],
  channels: ["1-8"],
  variables: {
    top_left: { name: "Digestion", def_type: "Active" },
    bottom_left: { name: "Environment", def_type: "Observer" },
    top_right: { name: "Motivation", def_type: "Receptive" },
    bottom_right: { name: "Perspective", def_type: "Peripheral" },
    short_code: "PRR DLR",
  },
  digestion: "Active",
  environment: "Observer",
  motivation: "Receptive",
  cognition: "Outer Vision",
  personalityActivations: [{ planet: "Sun", gate: 1, line: 2, color: 3, tone: 4, base: 5 }],
  designActivations: [{ planet: "Earth", gate: 2, line: 3, color: 1, tone: 2, base: 3 }],
};

const chart = normalizeLiveHumanDesignResponse(liveFixture, "2026-09-06T00:00:00.000Z");
ok(chart, "fresh live fixture normalizes only as a ready recognized chart");
if (!chart) throw new Error("fixture normalization failed");

equal(chart.digestion, "Active", "digestion survives the adapter contract");
equal(chart.environment, "Observer", "environment survives the adapter contract");
equal(chart.motivation, "Receptive", "motivation survives the adapter contract");
equal(chart.cognition, "Outer Vision", "cognition survives the adapter contract");
equal(chart.perspective, "Peripheral", "perspective derives only from labelled bottom_right source data");
equal(chart.advancedFieldSources?.perspective, "variables.bottom_right.def_type", "perspective provenance is retained");
equal(chart.variables?.short_code, "PRR DLR", "canonical variables representation preserves short_code");
equal(chart.centers.ajna, true, "defined centers normalize to typed keys");
equal(chart.centers.sacral, false, "open centers normalize to typed keys");
equal(chart.openCenters?.includes("Sacral"), true, "openCenters persists separately");
equal(chart.personalityActivations?.[0]?.color, 3, "personality Color is retained when source provides it");
equal(chart.designActivations?.[0]?.base, 3, "design Base is retained when source provides it");
ok(isCanonicalHumanDesign(chart), "fresh verified chart is canonical");

const { normalizeBlueprint } = require("../../lib/repositories/blueprintRepository");
const normalized = normalizeBlueprint("synthetic-cdi-108-02", {
  input: { birthDate: "1990-01-01", birthTime: "12:00", birthCity: "Jakarta", timezone: "Asia/Jakarta", latitude: -6.2, longitude: 106.8 },
  humanDesign: chart,
} as any);
equal(normalized.humanDesign?.perspective, "Peripheral", "normalizeBlueprint readback preserves perspective");
equal(normalized.humanDesign?.cognition, "Outer Vision", "normalizeBlueprint readback preserves cognition");
equal(normalized.humanDesign?.variables?.short_code, "PRR DLR", "normalizeBlueprint readback preserves variables.short_code");
equal(normalized.humanDesign?.centers?.g, true, "normalizeBlueprint readback preserves typed centers");
equal(normalized.humanDesign?.personalityActivations?.[0]?.tone, 4, "normalizeBlueprint readback preserves activation detail");

const legacyVariablesOnly = { type: "Projector", status: "pending", variables: { short_code: "LEGACY" }, digestion: null };
const mergedLegacy = mergeVerifiedHumanDesignChart(legacyVariablesOnly, chart);
ok(mergedLegacy, "verified fresh chart can safely improve a noncanonical legacy record");
equal(mergedLegacy?.variables?.short_code, "PRR DLR", "verified variables replace legacy arrow payload");
equal(mergedLegacy?.perspective, "Peripheral", "legacy record gains safely-derived perspective");
equal(mergedLegacy?.centers?.ajna, true, "legacy recovery does not write raw center arrays");
equal(mergeVerifiedHumanDesignChart(chart, chart), null, "canonical full record is never overwritten by recovery");
equal(normalizeLiveHumanDesignResponse({ ...liveFixture, status: "error" }), null, "failed recalculation fails closed");
equal(normalizeLiveHumanDesignResponse({ ...liveFixture, type: "" }), null, "missing recognized type fails closed");

const enPresentation = buildHumanDesignHumanMeaning(chart, { isEn: true });
ok(enPresentation.variables.perspective.includes("Peripheral"), "EN presentation uses persisted perspective value");
ok(enPresentation.variables.cognition.includes("Outer Vision"), "EN presentation uses persisted cognition value");

const root = path.resolve(process.cwd());
const ui = fs.readFileSync(path.join(root, "components/blueprint/HumanDesignBodygraphLite.tsx"), "utf8");
const recovery = fs.readFileSync(path.join(root, "scripts/mass-recover-hd.ts"), "utf8");
const service = fs.readFileSync(path.join(root, "services/humandesign-api/main.py"), "utf8");
const repository = fs.readFileSync(path.join(root, "lib/repositories/blueprintRepository.ts"), "utf8");
ok(repository.includes("perspective: savedHumanDesign?.perspective ?? null"), "normalizeBlueprint explicitly preserves perspective");
ok(repository.includes("advancedFieldSources: savedHumanDesign?.advancedFieldSources ?? {}"), "normalizeBlueprint preserves field provenance");
ok(repository.includes("openCenters: savedHumanDesign?.openCenters ?? []"), "normalizeBlueprint preserves openCenters separately");
ok(repository.includes("personalityActivations: savedHumanDesign?.personalityActivations"), "normalizeBlueprint preserves activation detail");
ok(ui.includes("presentHumanDesignAdvancedFields"), "UI uses the shared runtime presenter");
equal(presentHumanDesignAdvancedFields({ variables: { short_code: "canonical", shortCode: "legacy" } }, "unavailable").variableCode, "canonical", "UI presenter reads canonical short_code before legacy formats");
ok(ui.includes("Unavailable from current calculation source"), "UI distinguishes unavailable source data from persistence loss in ENL");
ok(recovery.includes("normalizeLiveHumanDesignResponse") && recovery.includes("mergeVerifiedHumanDesignChart"), "recovery shares the canonical verified mapping");
ok(!recovery.includes("centers: data.definedCenters || []"), "recovery no longer writes raw center arrays");
ok(!recovery.includes('|| "+07:00"'), "recovery does not fabricate a timezone");
ok(service.includes('"personalityActivations": personality_gates') && service.includes('"designActivations": design_gates'), "local service contract emits activation arrays");
ok(service.includes('"cognition": None'), "local service honestly marks unavailable cognition instead of synthesizing it");

console.log(`CDI_108_02_HD_ADVANCED_VARIABLES_PASS assertions=${assertions}`);
