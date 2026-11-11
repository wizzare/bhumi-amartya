import assert from "node:assert/strict";
import { resolveVerifierAntiAbuseFlags } from "../../lib/antiAbuse";
import { decodeAndVerifyPlayIntegrityToken } from "../../lib/playIntegrity";

async function run() {
  const prevEnv = { ...process.env };
  try {
    // 1. Server env BHUMI_ANTI_ABUSE_MODE=enforce cannot be downgraded by remoteConfig.
    process.env.BHUMI_ANTI_ABUSE_MODE = "enforce";
    delete process.env.BHUMI_ANTI_ABUSE_KILL_SWITCH;
    delete process.env.BHUMI_ANTI_ABUSE_ENFORCE_DEVICE;
    delete process.env.BHUMI_ANTI_ABUSE_REQUIRE_PLAY_INTEGRITY;
    const enforced = resolveVerifierAntiAbuseFlags({
      mode: "observe",
      enforceDeviceFreeClaim: false,
      requirePlayIntegrity: false,
    });
    assert.equal(enforced.mode, "enforce");
    assert.equal(enforced.enforceDeviceFreeClaim, true);
    assert.equal(enforced.requirePlayIntegrity, true);

    // 2. Production runtime refuses unsafe remote policy { mode: "enforce", requirePlayIntegrity: false }.
    process.env.BHUMI_ANTI_ABUSE_MODE = "observe";
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    const prodSafe = resolveVerifierAntiAbuseFlags({
      mode: "enforce",
      enforceDeviceFreeClaim: true,
      requirePlayIntegrity: false,
    });
    assert.equal(prodSafe.mode, "enforce");
    assert.equal(prodSafe.requirePlayIntegrity, true);

    // 3. Emergency kill switch works via both remoteConfig.killSwitch and server env.
    process.env.BHUMI_ANTI_ABUSE_MODE = "enforce";
    const remoteKilled = resolveVerifierAntiAbuseFlags({ killSwitch: true, mode: "enforce" });
    assert.equal(remoteKilled.mode, "off");
    assert.equal(remoteKilled.enforceDeviceFreeClaim, false);
    assert.equal(remoteKilled.requirePlayIntegrity, false);

    process.env.BHUMI_ANTI_ABUSE_KILL_SWITCH = "true";
    const envKilled = resolveVerifierAntiAbuseFlags({ mode: "enforce" });
    assert.equal(envKilled.mode, "off");
    delete process.env.BHUMI_ANTI_ABUSE_KILL_SWITCH;

    // 4. Request-bound appIntegrity checks: packageName, versionCode >= 122, certificateSha256Digest.
    const now = Date.now();
    const makeFetch = (appIntegrityOverride: Record<string, unknown>) =>
      (async () =>
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
                certificateSha256Digest: ["expected-play-cert-b64"],
                ...appIntegrityOverride,
              },
              deviceIntegrity: {
                deviceRecognitionVerdict: ["MEETS_DEVICE_INTEGRITY"],
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )) as typeof fetch;

    const pkgMismatch = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "tok",
      expectedNonce: "nonce-1234567890123456",
      nowMs: now,
      accessTokenProvider: async () => "access-tok",
      fetchImpl: makeFetch({ packageName: "com.clone.app" }),
    });
    assert.equal(pkgMismatch.verified, false);
    assert.equal(pkgMismatch.reason, "INTEGRITY_PACKAGE_MISMATCH");

    const oldVersion = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "tok",
      expectedNonce: "nonce-1234567890123456",
      nowMs: now,
      accessTokenProvider: async () => "access-tok",
      fetchImpl: makeFetch({ versionCode: 121 }),
    });
    assert.equal(oldVersion.verified, false);
    assert.equal(oldVersion.reason, "INTEGRITY_VERSION_TOO_OLD");

    const badCert = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "tok",
      expectedNonce: "nonce-1234567890123456",
      expectedCertDigests: ["expected-play-cert-b64"],
      nowMs: now,
      accessTokenProvider: async () => "access-tok",
      fetchImpl: makeFetch({ certificateSha256Digest: ["wrong-cert-b64"] }),
    });
    assert.equal(badCert.verified, false);
    assert.equal(badCert.reason, "INTEGRITY_CERT_MISMATCH");

    const validResult = await decodeAndVerifyPlayIntegrityToken({
      integrityToken: "tok",
      expectedNonce: "nonce-1234567890123456",
      expectedCertDigests: ["expected-play-cert-b64"],
      nowMs: now,
      accessTokenProvider: async () => "access-tok",
      fetchImpl: makeFetch({ versionCode: 122 }),
    });
    assert.equal(validResult.verified, true);
    assert.equal(validResult.reason, "VERIFIED");
    assert.equal(validResult.appPackageName, "com.bhumiamartya.app");
    assert.equal(validResult.appVersionCode, 122);

    console.log("CONFIG_PRECEDENCE_AND_INTEGRITY_BINDING_PASS assertions=18");
  } finally {
    process.env = prevEnv;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
