import "../helpers/build115-offline-setup.mts";
import assert from "node:assert/strict";
import test from "node:test";
import { auditHumanDesignCalculation, resolveHumanDesignBirthSources, auditHumanDesignResponse, validateHumanDesignBirthData } from "../../lib/humandesign/normalizedAudit";
import { normalizeLiveHumanDesignResponse } from "../../lib/humandesign/liveContract";
import { evaluateIdentityCorrection, buildIdentityCorrectionAuditPayload } from "../../lib/humandesign/identityCorrection";

import { calculateHumanDesign } from "../../lib/humandesign/calculateHumanDesign";

const birth = { birthDate: "2000-01-01", birthTime: "00:00", birthCity: "Synthetic", timezone: "UTC", latitude: 0, longitude: 0 };
const centers = ["Head", "Ajna", "Throat", "G", "Heart", "Spleen", "Sacral", "Solar Plexus", "Root"];
const payload = (type = "Generator") => ({ status: "ready", type, strategy: "Synthetic strategy", authority: "Synthetic authority", profile: "1/3", definition: "Single Definition", inc_cross: "Synthetic cross", gatesPersonality: [1, 8], gatesDesign: [2], channels: type === "Reflector" ? [] : ["1-8"], definedCenters: type === "Reflector" ? [] : ["G", "Throat"], openCenters: type === "Reflector" ? centers : centers.filter((c) => c !== "G" && c !== "Throat") });
let assertions = 0;
function equal(actual: unknown, expected: unknown) { assert.deepEqual(actual, expected); assertions++; }
test.after(() => console.log(`BUILD115_ASSERTIONS=${assertions}`));

test("shared transport, ambiguity, invalid input, failure and successful retry", async () => {
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const logs: unknown[][] = [];
  let calls = 0;
  let failed = false;
  globalThis.fetch = async (_url, init) => {
    calls++;
    const body = JSON.parse(String(init?.body));
    equal(body.birthPlace, birth.birthCity);
    equal(body.latitude, 0);
    if (failed) throw new Error("synthetic-private-error");
    return new Response(JSON.stringify(payload("Reflector")), { status: 200 });
  };
  console.info = (...args) => { logs.push(args); };
  console.warn = (...args) => { logs.push(args); };
  try {
    for (const patch of [{ birthDate: "2000-02-30" }, { birthTime: "" }, { latitude: 91 }, { timezone: "Invalid/Zone" }]) {
      equal((await auditHumanDesignCalculation([{ ...birth, ...patch }])).accepted, false);
      equal((await calculateHumanDesign({ ...birth, ...patch })).status, "pending");
    }
    equal(calls, 0);
    equal(resolveHumanDesignBirthSources(birth, { birthTime: "12:00" }).complete, false);
    equal(resolveHumanDesignBirthSources({ ...birth, timeOfBirth: "12:00" }).conflictingFields, ["birthTime"]);
    equal((await auditHumanDesignCalculation([birth, { birthTime: "12:00" }])).chart, null);
    equal(calls, 0);
    const app = await calculateHumanDesign(birth);
    const audit = await auditHumanDesignCalculation([birth], { source: "manual_verified" });
    equal(audit.chart?.centers, app.centers);
    equal(audit.chart?.channels, app.channels);
    equal(audit.accepted, true);
    equal(audit.ownerOverridePresent, true);
    equal(audit.verifiedDeploymentProvenance, null);
    failed = true;
    equal((await auditHumanDesignCalculation([birth])).accepted, false);
    failed = false;
    equal((await auditHumanDesignCalculation([birth])).accepted, true);
    equal(JSON.stringify(logs).includes("synthetic-private-error"), false);
    equal(JSON.stringify(logs).includes(birth.birthDate), false);
    equal(JSON.stringify(logs).includes(birth.birthCity), false);
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    console.warn = originalWarn;
  }
});

test("five types through app and audit transport", async () => {
  const original = globalThis.fetch;
  try {
    for (const type of ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"]) {
      globalThis.fetch = async () => new Response(JSON.stringify(payload(type)));
      const app = await calculateHumanDesign(birth);
      const audit = await auditHumanDesignCalculation([birth]);
      equal(audit.accepted, true);
      for (const key of ["type", "channels", "centers", "gates", "profile", "authority", "strategy", "variables"] as const) equal(app[key], audit.chart?.[key]);
      if (type === "Reflector") {
        equal(app.channels, []);
        equal(Object.values(app.centers), Array(9).fill(false));
        equal(audit.completeness.coreState, "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL");
      }
    }
  } finally { globalThis.fetch = original; }
});

test("five synthetic types use the exact app normalizer", () => {
  for (const type of ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"]) {
    const result = auditHumanDesignResponse(birth, payload(type));
    equal(result.chart?.type, type);
    equal(result.completeness.coreState, "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL");
    equal(result.completeness.advancedVariables.status, "UNAVAILABLE_FROM_ENGINE");
    equal(result.chart?.centers, normalizeLiveHumanDesignResponse(payload(type))?.centers);
    equal(result.productionEligible, false);
    equal(result.verifiedDeploymentProvenance, null);
  }
});

test("missing and malformed response contracts fail closed", () => {
  for (const channels of [undefined, null, {}, [null], ["invalid"]]) equal(auditHumanDesignResponse(birth, { ...payload("Reflector"), channels }).chart, null);
  for (const response of [null, [], {}, { status: "error" }, { status: "service_unavailable" }, { status: "timeout" }, { ...payload(), type: "Unknown" }]) equal(auditHumanDesignResponse(birth, response).chart, null);
  const missingCenters = auditHumanDesignResponse(birth, { ...payload(), definedCenters: undefined, openCenters: undefined });
  equal(missingCenters.completeness.missingCoreFields.includes("centers"), true);
  equal(auditHumanDesignResponse(birth, { ...payload(), inc_cross: undefined }).completeness.missingCoreFields.includes("incarnationCross.name"), true);
  equal(auditHumanDesignResponse(birth, { ...payload(), channels: [] }).completeness.missingCoreFields.includes("channels"), true);
});

test("advanced status is independent of core and enrichment", () => {
  const partial = auditHumanDesignResponse(birth, { ...payload(), digestion: "Synthetic" });
  equal(partial.completeness.advancedVariables.status, "PARTIAL");
  const complete = auditHumanDesignResponse(birth, { ...payload(), digestion: "Synthetic", environment: "Synthetic", motivation: "Synthetic", cognition: "Synthetic", perspective: "Synthetic", variables: { short_code: "PLR DRL" } });
  equal(complete.completeness.advancedVariables.status, "COMPLETE");
  equal(complete.completeness.coreState, "CANONICAL_CORE_COMPLETE");
  equal(complete.completeness.enrichment.status, "ENGINE_UNSUPPORTED");
});

test("observational dimensions do not change legacy classifiers", async () => {
  const { getHumanDesignCompleteness } = await import("../../lib/humandesign/completeness");
  const base = normalizeLiveHumanDesignResponse(payload())!;
  for (const status of ["ready", "pending", "error"] as const) {
    for (let mask = 0; mask < 64; mask++) {
      const fields = ["digestion", "environment", "motivation", "perspective", "cognition", "variables"] as const;
      const chart = { ...base, status, ...Object.fromEntries(fields.map((field, index) => [field, mask & (1 << index) ? field === "variables" ? { shortCode: "synthetic" } : "explicit" : null])) };
      const result = getHumanDesignCompleteness(chart);
      const count = fields.filter((_, index) => mask & (1 << index)).length;
      equal(result.advancedVariables.status, status === "ready" ? count === 6 ? "COMPLETE" : count ? "PARTIAL" : "UNAVAILABLE_FROM_ENGINE" : "UNAVAILABLE_FROM_ENGINE");
      if (status === "ready") equal(result.coreState, count === 6 ? "CANONICAL_CORE_COMPLETE" : "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL");
      const semanticCount = fields.slice(0, 5).filter((_, index) => mask & (1 << index)).length;
      equal(result.semanticFields, semanticCount === 5 ? "COMPLETE" : semanticCount ? "PARTIAL" : "UNAVAILABLE");
      equal(result.variableStructure, mask & 32 ? "AVAILABLE" : "UNAVAILABLE");
    }
  }
});

test("birth contract never invents missing values", () => {
  equal(validateHumanDesignBirthData(birth), []);
  for (const key of Object.keys(birth)) {
    equal(validateHumanDesignBirthData({ ...birth, [key]: undefined }).includes(key), true);
    equal(auditHumanDesignResponse({ ...birth, [key]: undefined }, payload()).chart, null);
  }
  for (const patch of [{ birthDate: "2000-02-30" }, { birthTime: "24:00" }, { birthCity: " " }, { timezone: "Invalid/Zone" }, { latitude: NaN }, { latitude: 91 }, { longitude: Infinity }, { longitude: -181 }, { latitude: "0" }]) equal(validateHumanDesignBirthData({ ...birth, ...patch }).length > 0, true);
  for (const patch of [{ birthDate: "2024-03-10", birthTime: "02:30" }, { birthDate: "2024-11-03", birthTime: "01:30" }]) equal(validateHumanDesignBirthData({ ...birth, ...patch, timezone: "America/New_York" }), ["birthDateTime"]);
});

test("privacy runtime paths", async () => {
  const { inspect } = await import("node:util");
  const methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "table", "assert", "group", "groupCollapsed", "groupEnd", "time", "timeEnd", "timeLog", "count", "countReset", "dirxml", "clear"] as const;
  const originals = new Map(methods.map(method => [method, console[method]]));
  const captured: unknown[][] = [];
  const sentinels = ["SENTINEL_UID_115", "sentinel115@example.invalid", "SENTINEL_NAME_115", "1987-06-23", "13:47", "SENTINEL_CITY_115", "12.345678", "45.678912"];
  const privateBirth = { birthDate: sentinels[3], birthTime: sentinels[4], birthCity: sentinels[5], timezone: "UTC", latitude: 12.345678, longitude: 45.678912 };
  const profile = { ...privateBirth, uid: sentinels[0], email: sentinels[1], fullName: sentinels[2] };
  const detect = (entries: unknown[][]) => {
    const text = inspect(entries, { depth: Infinity });
    assert.equal(sentinels.some(value => text.includes(value)), false, "PRIVATE_DIAGNOSTIC_REJECTED");
  };
  const originalFetch = globalThis.fetch;
  for (const method of methods) console[method] = (...args: unknown[]) => { captured.push(args); };
  try {
    console.error(new Error(sentinels.join("|")));
    assert.throws(() => detect(captured), /PRIVATE_DIAGNOSTIC_REJECTED/); assertions++;
    captured.length = 0;
    const { generateBlueprint } = await import("../../lib/engines/generateBlueprint");
    const { triggerBackgroundHdCalculation, recoverUserBlueprint } = await import("../../lib/engines/blueprintRecoveryEngine");
    const { blueprintRepository } = await import("../../lib/repositories/blueprintRepository");
    const { storageProvider } = await import("../../lib/storage/storageProvider");
    const saved = [blueprintRepository.saveUserBlueprint, storageProvider.saveUserBlueprint];
    blueprintRepository.saveUserBlueprint = async () => { throw new Error("OFFLINE_TEST_PERSISTENCE_BLOCKED"); };
    storageProvider.saveUserBlueprint = async () => { throw new Error("OFFLINE_TEST_PERSISTENCE_BLOCKED"); };
    try {
      for (const status of [200, 400, 500]) {
        globalThis.fetch = async () => new Response(JSON.stringify(status === 200 ? payload("Reflector") : { message: sentinels.join("|"), body: sentinels }), { status });
        await calculateHumanDesign(privateBirth);
        await auditHumanDesignCalculation([privateBirth]);
        await triggerBackgroundHdCalculation(profile.uid, profile, { uid: profile.uid, input: privateBirth });
      }
      const error = new Error(sentinels.join("|"), { cause: { response: { body: sentinels } } });
      globalThis.fetch = async () => { throw error; };
      await generateBlueprint(profile);
      await recoverUserBlueprint(profile.uid, profile);
      await auditHumanDesignCalculation([privateBirth]);
      globalThis.fetch = async () => new Response("malformed");
      await calculateHumanDesign(privateBirth);
      globalThis.fetch = async () => { throw new DOMException(sentinels.join("|"), "AbortError"); };
      await calculateHumanDesign(privateBirth);
      await calculateHumanDesign({ ...privateBirth, birthTime: "" });
      await auditHumanDesignCalculation([privateBirth, { birthTime: "02:19" }]);
      detect(captured); assertions++;
      for (const entry of captured) {
        equal(entry.length, 2);
        equal(entry[0], "[DIAGNOSTIC]");
        const record = entry[1] as Record<string, unknown>;
        equal(Object.keys(record).every(key => ["category", "stage", "failed", "complete", "preserved", "started", "valid", "conflict", "offline", "elapsedMs", "retries"].includes(key)), true);
      }
    } finally {
      blueprintRepository.saveUserBlueprint = saved[0] as typeof blueprintRepository.saveUserBlueprint;
      storageProvider.saveUserBlueprint = saved[1] as typeof storageProvider.saveUserBlueprint;
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const method of methods) console[method] = originals.get(method)!;
  }
});

test("network negative controls", async () => {
  await assert.rejects(fetch("https://synthetic.invalid"), /OFFLINE_TEST_NETWORK_BLOCKED/); assertions++;
  for (const [module, method] of [["node:http", "request"], ["node:https", "request"], ["node:net", "connect"], ["node:tls", "connect"], ["node:dgram", "createSocket"]]) {
    const api = await import(module);
    assert.throws(() => api[method](), /OFFLINE_TEST_NETWORK_BLOCKED/); assertions++;
  }
});

test("persistence negative controls", async () => {
  const { createRequire } = await import("node:module");
  const api = createRequire(import.meta.url)("firebase/firestore");
  for (const method of ["getDoc", "getDocFromCache", "getDocFromServer", "getDocs", "getDocsFromCache", "getDocsFromServer", "setDoc", "updateDoc", "addDoc", "deleteDoc", "writeBatch", "runTransaction", "onSnapshot"]) {
    assert.throws(() => api[method](), /OFFLINE_TEST_PERSISTENCE_BLOCKED/); assertions++;
  }
});

test("settings workflow preserves same-user saved fields and unrelated blueprint with no duplicate writes", async () => {
  const { saveHumanDesignSettings } = await import("../../lib/humandesign/normalizedAudit");
  const profile = { ...birth, uid: "synthetic-settings", fullName: "Synthetic" };
  const blueprint = { uid: profile.uid, unrelated: { retained: true }, humanDesign: { status: "pending" } };
  const writes: unknown[] = [];
  await saveHumanDesignSettings(profile.uid, profile, blueprint, async value => { writes.push(value); }, async value => { writes.push(value); });
  equal(writes, [profile, blueprint]);
  await assert.rejects(saveHumanDesignSettings("other", profile, blueprint, async () => { throw new Error("unexpected"); }, async () => { throw new Error("unexpected"); }), /SETTINGS_OWNER_MISMATCH/); assertions++;
  await assert.rejects(saveHumanDesignSettings(profile.uid, profile, blueprint, async () => { throw new Error("synthetic-write-failed"); }, async () => { throw new Error("unexpected"); }), /synthetic-write-failed/); assertions++;
  equal(writes.length, 2);
});

test("settings and banner runtime privacy", async () => {
  const { getPendingHumanDesignPresentation, saveHumanDesignSettings } = await import("../../lib/humandesign/normalizedAudit");
  const methods = ["log", "info", "warn", "error", "debug", "trace", "dir", "table"] as const;
  const originals = methods.map(key => console[key]);
  const captured: unknown[] = [];
  methods.forEach(key => { console[key] = (...args: unknown[]) => { captured.push(args); }; });
  try {
    const profile = { ...birth, uid: "SENTINEL_SETTINGS_115" };
    equal(getPendingHumanDesignPresentation(null, profile).shouldDisplay, true);
    equal(getPendingHumanDesignPresentation(null, profile).birth.complete, true);
    equal(getPendingHumanDesignPresentation(null, { ...profile, birthTime: "" }).birth.complete, false);
    equal(getPendingHumanDesignPresentation(null, profile, { birthTime: "12:00" }).birth.complete, false);
    equal(getPendingHumanDesignPresentation(normalizeLiveHumanDesignResponse(payload()), profile).shouldDisplay, false);
    const failure = new Error("SENTINEL_SETTINGS_115", { cause: { body: profile } });
    await assert.rejects(saveHumanDesignSettings(profile.uid, profile, {}, async () => { throw failure; }, async () => { throw new Error("unexpected-write"); }), error => error === failure); assertions++;
    equal(captured, []);
  } finally { methods.forEach((key, index) => { console[key] = originals[index]; }); }
});

test("repository wrapper negative controls", async () => {
  const { blueprintRepository } = await import("../../lib/repositories/blueprintRepository");
  const { createRequire } = await import("node:module");
  const firestore = createRequire(import.meta.url)("firebase/firestore");
  let intercepted = 0;
  const originals = [firestore.getDoc, firestore.setDoc];
  const blocked = () => { intercepted++; throw new Error("OFFLINE_TEST_PERSISTENCE_BLOCKED"); };
  firestore.getDoc = blocked;
  firestore.setDoc = blocked;
  const original = console.error;
  const diagnostics: unknown[] = [];
  console.error = (...args) => { diagnostics.push(args); };
  try {
    await blueprintRepository.getUserBlueprint("synthetic-repository").catch(() => null);
    equal(intercepted > 0, true);
    const before = intercepted;
    await assert.rejects(blueprintRepository.saveUserBlueprint("synthetic-repository", { input: { birthDate: "", birthTime: "", birthCity: "" } } as never), /OFFLINE_TEST_PERSISTENCE_BLOCKED/); assertions++;
    equal(intercepted > before, true);
  } finally {
    firestore.getDoc = originals[0];
    firestore.setDoc = originals[1];
    console.error = original;
  }
});

test("identity evaluation is offline review, not write approval", () => {
  const chart = auditHumanDesignResponse(birth, payload()).chart!;
  const result = evaluateIdentityCorrection({ existingChart: null, freshCalculatedChart: chart, birthData: birth, founderApproved: true });
  equal(result.status, "IDENTITY_CORRECTION_REVIEW_REQUIRED");
  equal(evaluateIdentityCorrection({ existingChart: chart, freshCalculatedChart: chart, birthData: { ...birth, latitude: null } }).status, "IDENTITY_CORRECTION_BLOCKED");
  const metadata = buildIdentityCorrectionAuditPayload(result, "synthetic-client-schema", "Synthetic review");
  equal(metadata.clientSchemaStamp, "synthetic-client-schema");
  equal(metadata.verifiedDeploymentProvenance, null);
});
