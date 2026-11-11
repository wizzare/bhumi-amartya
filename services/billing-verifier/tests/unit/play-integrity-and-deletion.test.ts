import test from "node:test";
import { deepEqual, equal, ok } from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  decodeAndVerifyPlayIntegrityToken,
  issueIntegrityChallenge,
  verifyAppCheckHeaderToken,
  verifyIntegrityChallengeToken,
} from "../../lib/playIntegrity";

process.env.BHUMI_ANTI_ABUSE_HMAC_SECRET = "test-play-integrity-hmac-secret-32chars!!";

test("Play Integrity challenge issuance, verification, decode, and App Check", async () => {
  const secret = process.env.BHUMI_ANTI_ABUSE_HMAC_SECRET!;
  const nowMs = Date.UTC(2026, 10, 11, 12, 0, 0);
  const issued = issueIntegrityChallenge("synthetic-uid-1", secret, nowMs);
  ok(issued.nonce.length >= 20);
  ok(issued.challengeToken.includes("."));

  const valid = verifyIntegrityChallengeToken(issued.challengeToken, "synthetic-uid-1", secret, nowMs + 10_000);
  equal(valid.valid, true);
  if (valid.valid) {
    equal(valid.nonce, issued.nonce);
    equal(valid.nonceHash.length, 64);
  }

  // Wrong UID rejected
  const wrongUid = verifyIntegrityChallengeToken(issued.challengeToken, "synthetic-uid-2", secret, nowMs + 10_000);
  equal(wrongUid.valid, false);
  if (!wrongUid.valid) equal(wrongUid.reason, "CHALLENGE_UID_MISMATCH");

  // Tampered signature rejected
  const tampered = verifyIntegrityChallengeToken(`${issued.challengeToken}00`, "synthetic-uid-1", secret, nowMs + 10_000);
  equal(tampered.valid, false);
  if (!tampered.valid) equal(tampered.reason, "CHALLENGE_SIGNATURE_INVALID");

  // Expired challenge rejected
  const expired = verifyIntegrityChallengeToken(issued.challengeToken, "synthetic-uid-1", secret, nowMs + 6 * 60 * 1000);
  equal(expired.valid, false);
  if (!expired.valid) equal(expired.reason, "CHALLENGE_EXPIRED");

  // Play Integrity decode: genuine PLAY_RECOGNIZED + MEETS_DEVICE_INTEGRITY passes
  const passFetch = (async () =>
    new Response(
      JSON.stringify({
        tokenPayloadExternal: {
          requestDetails: {
            requestPackageName: "com.bhumiamartya.app",
            nonce: issued.nonce,
            timestampMillis: String(nowMs + 5000),
          },
          appIntegrity: { appRecognitionVerdict: "PLAY_RECOGNIZED" },
          deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;

  const decodedPass = await decodeAndVerifyPlayIntegrityToken({
    integrityToken: "synthetic-pi-token",
    expectedNonce: issued.nonce,
    nowMs: nowMs + 10_000,
    fetchImpl: passFetch,
    accessTokenProvider: async () => "synthetic-google-oauth",
  });
  equal(decodedPass.verified, true);
  equal(decodedPass.appRecognitionVerdict, "PLAY_RECOGNIZED");
  deepEqual(decodedPass.deviceRecognitionVerdict, ["MEETS_DEVICE_INTEGRITY"]);

  // Sideloaded / UNRECOGNIZED_VERSION rejected
  const badAppVerdict = await decodeAndVerifyPlayIntegrityToken({
    integrityToken: "synthetic-pi-token",
    expectedNonce: issued.nonce,
    nowMs: nowMs + 10_000,
    fetchImpl: (async () =>
      new Response(
        JSON.stringify({
          tokenPayloadExternal: {
            requestDetails: {
              requestPackageName: "com.bhumiamartya.app",
              nonce: issued.nonce,
              timestampMillis: String(nowMs + 5000),
            },
            appIntegrity: { appRecognitionVerdict: "UNRECOGNIZED_VERSION" },
            deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] },
          },
        }),
        { status: 200 },
      )) as typeof fetch,
    accessTokenProvider: async () => "synthetic-google-oauth",
  });
  equal(badAppVerdict.verified, false);
  equal(badAppVerdict.reason, "APP_NOT_PLAY_RECOGNIZED");

  // Spoofed nonce rejected
  const badNonce = await decodeAndVerifyPlayIntegrityToken({
    integrityToken: "synthetic-pi-token",
    expectedNonce: "different-nonce-value-here",
    nowMs: nowMs + 10_000,
    fetchImpl: passFetch,
    accessTokenProvider: async () => "synthetic-google-oauth",
  });
  equal(badNonce.verified, false);
  equal(badNonce.reason, "INTEGRITY_NONCE_MISMATCH");

  // Rooted / emulator (empty deviceRecognitionVerdict) rejected
  const badDevice = await decodeAndVerifyPlayIntegrityToken({
    integrityToken: "synthetic-pi-token",
    expectedNonce: issued.nonce,
    nowMs: nowMs + 10_000,
    fetchImpl: (async () =>
      new Response(
        JSON.stringify({
          tokenPayloadExternal: {
            requestDetails: {
              requestPackageName: "com.bhumiamartya.app",
              nonce: issued.nonce,
              timestampMillis: String(nowMs + 5000),
            },
            appIntegrity: { appRecognitionVerdict: "PLAY_RECOGNIZED" },
            deviceIntegrity: { deviceRecognitionVerdict: [] },
          },
        }),
        { status: 200 },
      )) as typeof fetch,
    accessTokenProvider: async () => "synthetic-google-oauth",
  });
  equal(badDevice.verified, false);
  equal(badDevice.reason, "DEVICE_INTEGRITY_UNMET");

  // App Check helper
  equal(await verifyAppCheckHeaderToken(undefined, async () => ({})), false);
  equal(await verifyAppCheckHeaderToken("valid-ac", async () => ({ appId: "synthetic" })), true);
  equal(await verifyAppCheckHeaderToken("bad-ac", async () => { throw new Error("invalid"); }), false);
});

test("reconcile-deletion authenticates, strips raw firstUid, cleans birth claims, and stamps audit retention", async () => {
  const uid = "synthetic-del-uid";
  const uidHash = createHash("sha256").update(`bhumi-uid-v1:${uid}`).digest("hex").slice(0, 32);

  const birthDocs = new Map<string, Record<string, unknown>>([
    ["antiAbuseBirthClaims/solo", { hmac: "solo", uidHashes: [uidHash], firstUidHash: uidHash, uidCount: 1 }],
    ["antiAbuseBirthClaims/shared", { hmac: "shared", uidHashes: [uidHash, "other-hash"], firstUidHash: uidHash, uidCount: 2 }],
  ]);
  const deviceDocs = new Map<string, Record<string, unknown>>([
    ["antiAbuseDeviceClaims/dev1", { claimKey: "appset:1", firstUid: uid, uidHistory: [uidHash] }],
  ]);
  const auditDocs = new Map<string, Record<string, unknown>>([
    ["antiAbuseAuditLogs/aud1", { uidHash, birthCoreHmac: "sensitive-hmac", status: "ELIGIBLE_FREE" }],
  ]);

  const makeSnap = (path: string, store: Map<string, Record<string, unknown>>) => ({
    id: path.split("/")[1],
    ref: {
      path,
      async delete() { store.delete(path); },
      async set(patch: Record<string, unknown>, opts?: { merge?: boolean }) {
        const cur = opts?.merge ? { ...(store.get(path) || {}) } : {};
        for (const [k, v] of Object.entries(patch)) {
          if (v && typeof v === "object" && (v as { constructor?: { name?: string } }).constructor?.name === "DeleteTransform") {
            delete cur[k];
          } else {
            cur[k] = v;
          }
        }
        store.set(path, cur);
      },
    },
    data: () => store.get(path),
  });

  const adminPath = require.resolve("../../lib/firebaseAdmin");
  require.cache[adminPath] = {
    exports: {
      adminAuth: () => ({
        async verifyIdToken(token: string) {
          if (token !== "synthetic-token") throw new Error("bad token");
          return { uid };
        },
      }),
      adminDb: () => ({
        collection(name: string) {
          return {
            where(field: string, _op: string, val: unknown) {
              return {
                async get() {
                  if (name === "antiAbuseBirthClaims" && field === "uidHashes") {
                    const docs = [...birthDocs.entries()]
                      .filter(([, d]) => Array.isArray(d.uidHashes) && d.uidHashes.includes(val))
                      .map(([p]) => makeSnap(p, birthDocs));
                    return { docs };
                  }
                  if (name === "antiAbuseDeviceClaims" && field === "firstUid") {
                    const docs = [...deviceDocs.entries()]
                      .filter(([, d]) => d.firstUid === val)
                      .map(([p]) => makeSnap(p, deviceDocs));
                    return { docs };
                  }
                  if (name === "antiAbuseDeviceClaims" && field === "uidHistory") {
                    const docs = [...deviceDocs.entries()]
                      .filter(([, d]) => Array.isArray(d.uidHistory) && d.uidHistory.includes(val))
                      .map(([p]) => makeSnap(p, deviceDocs));
                    return { docs };
                  }
                  if (name === "antiAbuseAuditLogs" && field === "uidHash") {
                    const docs = [...auditDocs.entries()]
                      .filter(([, d]) => d.uidHash === val)
                      .map(([p]) => makeSnap(p, auditDocs));
                    return { docs };
                  }
                  return { docs: [] };
                },
              };
            },
          };
        },
      }),
    },
  } as NodeModule;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const handler = require("../../api/account/reconcile-deletion").default;

  const invoke = async (method = "POST", headers: Record<string, string> = { authorization: "Bearer synthetic-token", origin: "https://localhost" }) => {
    let status = 200;
    let body: Record<string, unknown> = {};
    const outHeaders: Record<string, string> = {};
    await handler({ method, headers }, {
      setHeader(k: string, v: string) { outHeaders[k] = v; },
      status(s: number) { status = s; return this; },
      json(v: Record<string, unknown>) { body = v; },
      end() {},
    });
    return { status, body, outHeaders };
  };

  equal((await invoke("POST", { origin: "https://localhost" })).status, 401);
  equal((await invoke("GET")).status, 405);
  const res = await invoke("POST");
  equal(res.status, 200);
  deepEqual(res.body, { ok: true, birthClaimsCleaned: 2, deviceClaimsScrubbed: 1, auditLogsRedacted: 1 });
  equal(birthDocs.has("antiAbuseBirthClaims/solo"), false);
  deepEqual(birthDocs.get("antiAbuseBirthClaims/shared")?.uidHashes, ["other-hash"]);
  equal(birthDocs.get("antiAbuseBirthClaims/shared")?.firstUidHash, "other-hash");
  equal(deviceDocs.get("antiAbuseDeviceClaims/dev1")?.firstUid, undefined);
  equal(deviceDocs.get("antiAbuseDeviceClaims/dev1")?.firstUidHash, uidHash);
  ok(typeof deviceDocs.get("antiAbuseDeviceClaims/dev1")?.retainUntil === "string");
  equal(auditDocs.get("antiAbuseAuditLogs/aud1")?.birthCoreHmac, null);
  ok(typeof auditDocs.get("antiAbuseAuditLogs/aud1")?.retainUntil === "string");
});
