import assert from "node:assert/strict";
import test from "node:test";

import { calculateWithHdkit } from "./hdkitAdapter";
import { getHumanDesignCanonicalFailureReason, HD_ENGINE_VERSION, isCanonicalHumanDesign } from "./hdAudit";
import { calculateHumanDesign } from "./calculateHumanDesign";
import {
  getHumanDesignRepairReason,
  isProtectedHumanDesign,
} from "./repairHumanDesign";

const originalFetch = globalThis.fetch;

function mockResponse(data: Record<string, unknown>) {
  globalThis.fetch = async () => new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

const profile = {
  birthDate: "1990-01-01",
  birthTime: "12:00",
  birthCity: "Jakarta",
  timezone: "+07:00",
};

test("pending response with null type stays pending", async () => {
  mockResponse({ status: "pending", type: null });
  const result = await calculateWithHdkit(profile);
  assert.equal(result.status, "pending");
  assert.notEqual(result.calculationQuality, "verified");
});

test("ready response with a valid type becomes ready", async () => {
  mockResponse({ status: "ready", type: "Generator" });
  const result = await calculateWithHdkit(profile);
  assert.equal(result.status, "ready");
  assert.equal(result.type, "Generator");
});

test("python service connection refused returns pending chart with missing_type reason", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("connect ECONNREFUSED");
  };

  const result = await calculateHumanDesign({
    ...profile,
    latitude: -6.2,
    longitude: 106.8,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.type, null);
  assert.equal(getHumanDesignCanonicalFailureReason(result), "missing_type");
});

test("adapter preserves service unavailable diagnostic as pending chart", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    type: null,
    status: "service_unavailable",
    source: "human-design-py",
    hdEngineVersion: HD_ENGINE_VERSION,
    calculationStatus: "service_unavailable",
    calculationQuality: "service_unavailable",
    note: "Human Design service is not reachable.",
  }), {
    status: 503,
    headers: { "Content-Type": "application/json" },
  });

  const result = await calculateHumanDesign({
    ...profile,
    latitude: -6.2,
    longitude: 106.8,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.type, null);
  assert.equal(result.source, "human-design-py");
  assert.equal(result.calculationStatus, "service_unavailable");
  assert.equal(result.calculationQuality, "service_unavailable");
  assert.equal(getHumanDesignCanonicalFailureReason(result), "service_unavailable");
});

test("valid python service response maps to canonical ready chart", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    type: "Generator",
    profile: "1/3",
    authority: "Sacral",
    strategy: "Wait to Respond",
    inc_cross: "((1, 2), (3, 4))-RAC",
    incarnationCross: "((1, 2), (3, 4))-RAC",
    channels: ["1-8"],
    definition: 1,
    definedCenters: ["Sacral"],
    openCenters: ["Head"],
    gatesPersonality: ["1"],
    gatesDesign: ["2"],
    status: "ready",
    source: "human-design-py",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const result = await calculateWithHdkit(profile);

  assert.equal(result.status, "ready");
  assert.equal(result.type, "Generator");
  assert.equal(result.calculationQuality, "verified");
  assert.equal(result.incarnationCross.name, "((1, 2), (3, 4))-RAC");
  assert.deepEqual(result.channels, ["1-8"]);
  assert.equal(result.definition, 1);
  assert.equal(isCanonicalHumanDesign(result), true);
});

test("successful calculateHumanDesign response exposes complete HD fields", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({
    type: "Manifesting Generator",
    profile: "6/3",
    authority: "Sacral Authority",
    strategy: "Wait to Respond",
    inc_cross: "((24, 44), (13, 7))-LAC",
    incarnationCross: "((24, 44), (13, 7))-LAC",
    channels: ["10-20", "2-14"],
    definition: 1,
    definedCenters: ["Sacral", "Throat"],
    openCenters: ["Head"],
    gatesPersonality: ["24"],
    gatesDesign: ["13"],
    status: "ready",
    source: "human-design-py",
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  const result = await calculateHumanDesign({
    ...profile,
    latitude: -6.2,
    longitude: 106.8,
  });

  assert.equal(result.type, "Manifesting Generator");
  assert.equal(result.authority, "Sacral Authority");
  assert.equal(result.profile, "6/3");
  assert.equal(result.incarnationCross.name, "((24, 44), (13, 7))-LAC");
  assert.deepEqual(result.channels, ["10-20", "2-14"]);
  assert.equal(result.definition, 1);
  assert.equal(result.status, "ready");
  assert.equal(result.source, "human-design-py");
  assert.equal(result.calculationQuality, "verified");
  assert.equal(result.hdEngineVersion, HD_ENGINE_VERSION);
});

test("2xx response without type remains pending and not verified", async () => {
  mockResponse({ status: "pending", type: null });
  const result = await calculateWithHdkit(profile);
  assert.equal(result.status, "pending");
  assert.equal(result.type, null);
  assert.notEqual(result.calculationQuality, "verified");
  assert.equal(getHumanDesignCanonicalFailureReason(result), "missing_type");
});

test("python service timeout returns pending chart with missing_type reason", async () => {
  globalThis.fetch = (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("The operation was aborted.", "AbortError"));
    });
  });

  const result = await calculateHumanDesign({
    ...profile,
    latitude: -6.2,
    longitude: 106.8,
  });

  assert.equal(result.status, "pending");
  assert.equal(result.type, null);
  assert.equal(getHumanDesignCanonicalFailureReason(result), "missing_type");
});

test("ready local fallback is repair eligible", () => {
  const hd = {
    status: "ready",
    type: "Generator",
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
  };
  assert.equal(isProtectedHumanDesign(hd), false);
  assert.equal(getHumanDesignRepairReason(hd), "legacy_local_fallback");
});

test("canonical human-design-py record is protected", () => {
  const hd = {
    status: "ready",
    type: "Generator",
    source: "human-design-py",
    calculationQuality: "verified",
    hdEngineVersion: HD_ENGINE_VERSION,
  };
  assert.equal(isProtectedHumanDesign(hd), true);
});

test("owner manual verified record is protected", () => {
  const hd = {
    status: "ready",
    type: "Manifesting Generator",
    source: "manual_verified",
    calculationQuality: "manual_verified_owner_override",
    hdEngineVersion: HD_ENGINE_VERSION,
  };
  assert.equal(isProtectedHumanDesign(hd), true);
});
