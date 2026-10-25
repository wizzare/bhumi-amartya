import assert from "node:assert/strict";
import test from "node:test";
import {
  verifyHdRequestAuthentication,
  isLocalDevBypassAllowed,
} from "../../lib/auth/hdEndpointAuth";
import { POST as calculatePOST } from "../../app/api/humandesign/calculate/route";
import { POST as astrologyPOST } from "../../app/api/humandesign/astrology/route";
import { POST as bodygraphPOST } from "../../app/api/humandesign/bodygraph/route";

const SAMPLE_BODY = JSON.stringify({
  birthDate: "1990-05-15",
  birthTime: "08:30",
  birthPlace: "Jakarta",
  timezone: "Asia/Jakarta",
  latitude: -6.2,
  longitude: 106.8,
});

test("HD-01 AUTH-01: Request without Authorization header is rejected (401)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: SAMPLE_BODY,
  });
  const res = await calculatePOST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.status, "error");
  assert.equal(data.calculationStatus, "unauthorized");
});

test("HD-01 AUTH-02: Astrology request without Authorization is rejected (401)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/astrology", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: SAMPLE_BODY,
  });
  const res = await astrologyPOST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.status, "error");
  assert.equal(data.calculationStatus, "unauthorized");
});

test("HD-01 AUTH-03: Invalid ID token is rejected (403)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer invalid.token.payload",
    },
    body: SAMPLE_BODY,
  });
  const authRes = await verifyHdRequestAuthentication(req, {
    verifyIdToken: async () => {
      throw new Error("auth/argument-error");
    },
  });
  assert.equal(authRes.authenticated, false);
  assert.equal(authRes.status, 403);
});

test("HD-01 AUTH-04: Expired token is rejected (403)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer expired.token",
    },
    body: SAMPLE_BODY,
  });
  const authRes = await verifyHdRequestAuthentication(req, {
    verifyIdToken: async () => {
      const err = new Error("auth/id-token-expired");
      (err as { code?: string }).code = "auth/id-token-expired";
      throw err;
    },
  });
  assert.equal(authRes.authenticated, false);
  assert.equal(authRes.status, 403);
});

test("HD-01 AUTH-05: Wrong-project / invalid payload token is rejected (403)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer wrong.project.token",
    },
    body: SAMPLE_BODY,
  });
  const authRes = await verifyHdRequestAuthentication(req, {
    verifyIdToken: async () => {
      return { uid: "", aud: "wrong-project-123" };
    },
  });
  assert.equal(authRes.authenticated, false);
  assert.equal(authRes.status, 403);
});

test("HD-01 AUTH-06: AppCheck token alone without Firebase Auth is rejected (401)", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Firebase-AppCheck": "valid.appcheck.token.only",
    },
    body: SAMPLE_BODY,
  });
  const authRes = await verifyHdRequestAuthentication(req);
  assert.equal(authRes.authenticated, false);
  assert.equal(authRes.status, 401);
});

test("HD-01 AUTH-07: Bypass header in production is strictly rejected (401)", async () => {
  const prevEnv = process.env.NODE_ENV;
  try {
    (process.env as { NODE_ENV?: string }).NODE_ENV = "production";
    const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-dev-secret": "bhumi-dev-bypass",
      },
      body: SAMPLE_BODY,
    });
    assert.equal(isLocalDevBypassAllowed(req), false);
    const authRes = await verifyHdRequestAuthentication(req);
    assert.equal(authRes.authenticated, false);
    assert.equal(authRes.status, 401);
  } finally {
    (process.env as { NODE_ENV?: string }).NODE_ENV = prevEnv;
  }
});

test("HD-01 AUTH-08: Bypass header from external host even in development is rejected", () => {
  const prevEnv = process.env.NODE_ENV;
  try {
    (process.env as { NODE_ENV?: string }).NODE_ENV = "development";
    const req = new Request("https://evil.external-origin.com/api/humandesign/calculate", {
      headers: { "x-dev-secret": "bhumi-dev-bypass" },
    });
    assert.equal(isLocalDevBypassAllowed(req), false);
  } finally {
    (process.env as { NODE_ENV?: string }).NODE_ENV = prevEnv;
  }
});

test("HD-01 AUTH-09: Valid authenticated token verifies user identity", async () => {
  const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer valid.synthetic.token.user123",
    },
    body: SAMPLE_BODY,
  });
  const authRes = await verifyHdRequestAuthentication(req, {
    verifyIdToken: async (token) => {
      assert.equal(token, "valid.synthetic.token.user123");
      return { uid: "user-synthetic-123", email: "user@example.test" };
    },
  });
  assert.equal(authRes.authenticated, true);
  assert.equal(authRes.uid, "user-synthetic-123");
});

test("HD-01 AUTH-10: Concurrent authenticated requests resolve independently without race", async () => {
  const uids = ["user-101", "user-102", "user-103", "user-104", "user-105"];
  const results = await Promise.all(
    uids.map(async (expectedUid) => {
      const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
        headers: { Authorization: `Bearer token.${expectedUid}` },
      });
      return verifyHdRequestAuthentication(req, {
        verifyIdToken: async (tok) => ({ uid: tok.replace("token.", "") }),
      });
    }),
  );
  results.forEach((r, idx) => {
    assert.equal(r.authenticated, true);
    assert.equal(r.uid, uids[idx]);
  });
});

test("HD-01 AUTH-11: Unauthorized request does not call upstream calculation service", async () => {
  let upstreamCalled = false;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    upstreamCalled = true;
    return new Response(JSON.stringify({ status: "ready" }));
  };
  try {
    const req = new Request("https://bhumiamartya.app/api/humandesign/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: SAMPLE_BODY,
    });
    const res = await calculatePOST(req);
    assert.equal(res.status, 401);
    assert.equal(upstreamCalled, false, "Upstream must NEVER be called when auth fails");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("HD-01 AUTH-12: Decommissioned bodygraph route returns 410 Gone for all callers", async () => {
  const res = await bodygraphPOST();
  assert.equal(res.status, 410);
  const data = await res.json();
  assert.equal(data.status, "error");
  assert.equal(data.code, "ENDPOINT_DECOMMISSIONED");
});
