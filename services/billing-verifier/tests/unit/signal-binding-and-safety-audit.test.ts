import assert from "node:assert/strict";
import test from "node:test";
import type { Firestore } from "firebase-admin/firestore";
import { parseVerifierSignals, runVerifierTrialBootstrap } from "../../lib/antiAbuse";
import {
  decodeAndVerifyPlayIntegrityToken,
  issueIntegrityChallenge,
  normalizeCertDigestToBase64Url,
  verifyIntegrityChallengeToken,
} from "../../lib/playIntegrity";

function createInMemoryDb(initial: {
  users?: Record<string, Record<string, unknown>>;
  claims?: Record<string, Record<string, unknown>>;
  remoteConfig?: Record<string, unknown> | null;
}) {
  const users = new Map<string, Record<string, unknown>>(Object.entries(initial.users || {}));
  const claims = new Map<string, Record<string, unknown>>(Object.entries(initial.claims || {}));
  const usedNonces = new Map<string, Record<string, unknown>>();
  const auditLogs: Array<{ id: string; data: Record<string, unknown> }> = [];
  let remoteConfig = initial.remoteConfig ?? null;

  const getStore = (docPath: string) => {
    if (docPath.startsWith("users/")) return users;
    if (docPath.startsWith("antiAbuseDeviceClaims/")) return claims;
    if (docPath.startsWith("antiAbuseUsedNonces/")) return usedNonces;
    return null;
  };

  const makeRef = (docPath: string) => ({
    id: docPath.split("/").pop() || docPath,
    path: docPath,
    get: async () => {
      if (docPath === "app_config/antiAbuse") {
        return { exists: remoteConfig !== null, data: () => remoteConfig || undefined };
      }
      const store = getStore(docPath);
      const val = store?.get(docPath);
      return { exists: val !== undefined, data: () => val };
    },
  });

  const db = {
    doc: (docPath: string) => makeRef(docPath),
    collection: (name: string) => ({
      doc: () => makeRef(`${name}/audit-${auditLogs.length + 1}`),
    }),
    runTransaction: async <T>(cb: (tx: unknown) => Promise<T>): Promise<T> => {
      const tx = {
        get: async (ref: { path: string }) => {
          const store = getStore(ref.path);
          const val = store?.get(ref.path);
          return { exists: val !== undefined, data: () => val };
        },
        set: (ref: { path: string }, payload: Record<string, unknown>, opts?: { merge?: boolean }) => {
          if (ref.path.startsWith("antiAbuseAuditLogs/")) {
            auditLogs.push({ id: ref.path, data: payload });
            return;
          }
          const store = getStore(ref.path);
          if (!store) throw new Error(`UNEXPECTED_WRITE_PATH:${ref.path}`);
          const prev = opts?.merge ? store.get(ref.path) || {} : {};
          store.set(ref.path, { ...prev, ...payload });
        },
      };
      return cb(tx);
    },
  };

  return {
    db: db as unknown as Firestore,
    users,
    claims,
    usedNonces,
    auditLogs,
    setRemoteConfig: (cfg: Record<string, unknown> | null) => {
      remoteConfig = cfg;
    },
  };
}

test("Audit 1: altered appSetIdHash/deviceIdHash with valid Play Integrity token bypasses claim key in VC122 architecture", async () => {
  const prevMode = process.env.BHUMI_ANTI_ABUSE_MODE;
  process.env.BHUMI_ANTI_ABUSE_MODE = "enforce";
  try {
    const store = createInMemoryDb({});
    const realAppSet = "a".repeat(64);
    const realDeviceId = "b".repeat(64);
    const forgedAppSet = "c".repeat(64);
    const forgedDeviceId = "d".repeat(64);
    const secret = "unit-test-hmac-secret-at-least-32-chars";

    // Account A claims genuine Device X with valid Play Integrity
    const chA = issueIntegrityChallenge("uid-A", secret);
    const verA = verifyIntegrityChallengeToken(chA.challengeToken, "uid-A", secret);
    assert.equal(verA.valid, true);
    if (!verA.valid) throw new Error("unreachable");

    const resA = await runVerifierTrialBootstrap(store.db, "uid-A", {
      platform: "android",
      appVersionCode: 122,
      appSetIdHash: realAppSet,
      deviceIdHash: realDeviceId,
      installIdHash: null,
      birthCoreHmac: null,
      nonceHash: verA.nonceHash,
      playIntegrityVerified: true,
      appCheckVerified: false,
    });
    assert.equal(resA.body.outcome, "PROVISIONED");
    assert.equal(store.claims.size, 1);

    // Account B reuses the same physical device, issues valid Play Integrity challenge for uid-B,
    // but alters appSetIdHash/deviceIdHash in HTTP JSON body.
    // Play Integrity nonce in VC122 binds uid+nonce ONLY (not client appSetIdHash/deviceIdHash).
    const chB = issueIntegrityChallenge("uid-B", secret);
    const verB = verifyIntegrityChallengeToken(chB.challengeToken, "uid-B", secret);
    assert.equal(verB.valid, true);
    if (!verB.valid) throw new Error("unreachable");

    const now = Date.now();
    const piRes = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "valid-pi-token-from-uid-B",
      expectedNonce: verB.nonce,
      nowMs: now,
      accessTokenProvider: async () => "access-tok",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            tokenPayloadExternal: {
              requestDetails: {
                requestPackageName: "com.bhumiamartya.app",
                nonce: verB.nonce,
                timestampMillis: String(now),
              },
              appIntegrity: {
                appRecognitionVerdict: "PLAY_RECOGNIZED",
                packageName: "com.bhumiamartya.app",
                versionCode: 122,
              },
              deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] },
            },
          }),
          { status: 200 },
        ),
    });
    assert.equal(piRes.verified, true);

    const parsedForged = parseVerifierSignals({
      platform: "android",
      appVersionCode: 122,
      appSetIdHash: forgedAppSet,
      deviceIdHash: forgedDeviceId,
    });
    assert.equal(parsedForged.valid, true);

    const resB = await runVerifierTrialBootstrap(store.db, "uid-B", {
      ...parsedForged.signals,
      nonceHash: verB.nonceHash,
      playIntegrityVerified: piRes.verified,
    });
    // Explicitly asserts current VC122 bypass limitation: forged claim key creates a second claim & grants trial.
    assert.equal(resB.body.outcome, "PROVISIONED");
    assert.equal(store.claims.size, 2);
  } finally {
    process.env.BHUMI_ANTI_ABUSE_MODE = prevMode;
  }
});

test("Audit 2 & 3 & 4 & 6: unsupported signal fallback, cert normalization, kill switch, and VC121/Premium/Founder/shared-device retention", async () => {
  const prevMode = process.env.BHUMI_ANTI_ABUSE_MODE;
  process.env.BHUMI_ANTI_ABUSE_MODE = "enforce";
  try {
    // Cert digest normalization converts Play Console hex SHA-256 -> base64url cleanly
    const hexExample = "48:B1:AE:1A:9B:D5:AF:31:03:0A:D3:67:59:25:B5:99:C5:75:8D:FA:CE:F1:86:B1:59:7D:F1:C7:68:75:4F:D1";
    const expectedB64Url = normalizeCertDigestToBase64Url(hexExample);
    assert.equal(expectedB64Url, Buffer.from(hexExample.replace(/:/g, ""), "hex").toString("base64url"));

    const now = Date.now();
    const certCheckOk = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "tok-cert",
      expectedNonce: "nonce-1234567890123456",
      expectedCertDigests: [hexExample],
      nowMs: now,
      accessTokenProvider: async () => "tok",
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            tokenPayloadExternal: {
              requestDetails: {
                requestPackageName: "com.bhumiamartya.app",
                nonce: "nonce-1234567890123456",
                timestampMillis: String(now),
              },
              appIntegrity: {
                appRecognitionVerdict: "PLAY_RECOGNIZED",
                packageName: "com.bhumiamartya.app",
                versionCode: 122,
                certificateSha256Digest: [`${expectedB64Url}=`],
              },
              deviceIntegrity: { deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"] },
            },
          }),
          { status: 200 },
        ),
    });
    assert.equal(certCheckOk.verified, true);

    const store = createInMemoryDb({
      users: {
        "users/vc121-user": {
          plan: "free_trial",
          membership: "REGULAR_TRIAL",
          membershipType: "TRIAL",
          subscriptionStatus: "trialing",
          trialStartedAt: "2026-11-10T00:00:00.000Z",
          trialEndsAt: "2026-11-17T00:00:00.000Z",
          accessStart: "2026-11-10T00:00:00.000Z",
          accessUntil: "2026-11-17T00:00:00.000Z",
          entitlementSource: "server_access_bootstrap",
          accessSource: "server_access_bootstrap",
          updatedBy: "server_access_bootstrap",
          accessSourceVersion: "2026-09-13",
        },
        "users/premium-user": { membershipType: "PREMIUM", isPremium: true, entitlementSource: "google_play" },
        "users/lifetime-user": { membershipType: "LIFETIME" },
        "users/founder-user": { badge: "Founder" },
      },
    });

    // Existing VC 121, Premium, Lifetime, Founder retain access even in enforce mode with no device/PI signals
    const vc121 = await runVerifierTrialBootstrap(store.db, "vc121-user", {
      platform: "android",
      appVersionCode: 121,
      deviceIdHash: null,
      appSetIdHash: null,
      installIdHash: null,
      birthCoreHmac: null,
      playIntegrityVerified: false,
      appCheckVerified: false,
    });
    assert.equal(vc121.body.outcome, "ALREADY_PRESENT");

    for (const vipUid of ["premium-user", "lifetime-user", "founder-user"]) {
      const vipRes = await runVerifierTrialBootstrap(store.db, vipUid, {
        platform: "android",
        appVersionCode: 122,
        deviceIdHash: null,
        appSetIdHash: null,
        installIdHash: null,
        birthCoreHmac: null,
        playIntegrityVerified: false,
        appCheckVerified: false,
      });
      assert.equal(vipRes.body.outcome, "HIGHER_ENTITLEMENT");
    }

    // Unsupported/missing device signals do NOT cause automatic denial when allowSignalUnavailableFallback=true
    const missingSignalsOk = await runVerifierTrialBootstrap(store.db, "missing-sig-user", {
      platform: "android",
      appVersionCode: 122,
      deviceIdHash: null,
      appSetIdHash: null,
      installIdHash: null,
      birthCoreHmac: null,
      playIntegrityVerified: true,
      appCheckVerified: false,
    });
    assert.equal(missingSignalsOk.body.outcome, "PROVISIONED");

    // Same shared birthCoreHmac on a separate legitimate device is NEVER denied
    const sharedBirthHmac = "e".repeat(64);
    await runVerifierTrialBootstrap(store.db, "household-1", {
      platform: "android",
      appVersionCode: 122,
      deviceIdHash: null,
      appSetIdHash: "1".repeat(64),
      installIdHash: null,
      birthCoreHmac: sharedBirthHmac,
      playIntegrityVerified: true,
      appCheckVerified: false,
    });
    const household2 = await runVerifierTrialBootstrap(store.db, "household-2", {
      platform: "android",
      appVersionCode: 122,
      deviceIdHash: null,
      appSetIdHash: "2".repeat(64),
      installIdHash: null,
      birthCoreHmac: sharedBirthHmac,
      playIntegrityVerified: true,
      appCheckVerified: false,
    });
    assert.equal(household2.body.outcome, "PROVISIONED");

    // Duplicate claim denies in enforce, then remote killSwitch=true immediately restores mode=off
    const duplicateDenied = await runVerifierTrialBootstrap(store.db, "dup-uid", {
      platform: "android",
      appVersionCode: 122,
      deviceIdHash: null,
      appSetIdHash: "1".repeat(64),
      installIdHash: null,
      birthCoreHmac: null,
      playIntegrityVerified: true,
      appCheckVerified: false,
    });
    assert.equal(duplicateDenied.body.outcome, "FREE_LIMIT_REACHED");

    store.setRemoteConfig({ killSwitch: true, mode: "enforce" });
    const afterKill = await runVerifierTrialBootstrap(store.db, "dup-uid-after-kill", {
      platform: "android",
      appVersionCode: 122,
      deviceIdHash: null,
      appSetIdHash: "1".repeat(64),
      installIdHash: null,
      birthCoreHmac: null,
      playIntegrityVerified: false,
      appCheckVerified: false,
    });
    assert.equal(afterKill.body.mode, "off");
    assert.equal(afterKill.body.outcome, "PROVISIONED");
  } finally {
    process.env.BHUMI_ANTI_ABUSE_MODE = prevMode;
  }
});
