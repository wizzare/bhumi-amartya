import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  computeBirthProfileHmac,
  computeDeviceIdentityHash,
  normalizeBirthDate,
  normalizeBirthLocation,
  normalizeBirthTime,
  resolveHmacSecret,
} from "../../lib/antiAbuse/birthFingerprint";
import { resolveAntiAbuseFeatureFlags } from "../../lib/antiAbuse/featureFlags";
import {
  evaluateTrialEligibility,
  type BirthClaimRecord,
  type DeviceClaimRecord,
} from "../../lib/antiAbuse/trialEligibility";
import {
  parseBootstrapSignalsBody,
  runServerTrialBootstrapTransaction,
} from "../../lib/antiAbuse/serverBootstrap";
import {
  issueIntegrityChallenge,
  verifyIntegrityChallengeToken,
} from "../../lib/antiAbuse/playIntegrity";
import { getAntiAbuseUxCopy } from "../../lib/antiAbuse/eligibilityUx";

/**
 * Lightweight transactional in-memory Firestore mock that supports optimistic
 * concurrency retries (matching Firestore runTransaction semantics) so concurrent
 * double-claim tests execute against the real runServerTrialBootstrapTransaction.
 */
function createTransactionalFirestoreMock(initialDocs: Record<string, Record<string, unknown>> = {}) {
  const store = new Map<string, { version: number; data: Record<string, unknown> }>();
  for (const [k, v] of Object.entries(initialDocs)) {
    store.set(k, { version: 1, data: structuredClone(v) });
  }
  let autoId = 0;

  const makeDocRef = (docPath: string) => ({
    id: docPath.split("/").pop() || docPath,
    path: docPath,
    async get() {
      const entry = store.get(docPath);
      return {
        id: docPath.split("/").pop() || docPath,
        exists: Boolean(entry),
        data: () => (entry ? structuredClone(entry.data) : undefined),
      };
    },
  });

  const db = {
    doc: (docPath: string) => makeDocRef(docPath),
    collection: (colPath: string) => ({
      doc: (id?: string) => makeDocRef(`${colPath}/${id || `auto_${++autoId}`}`),
    }),
    async runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
      for (let attempt = 0; attempt < 5; attempt++) {
        const readVersions = new Map<string, number>();
        const pendingWrites: Array<{ path: string; data: Record<string, unknown>; merge: boolean }> = [];
        const tx = {
          async get(ref: { path: string; id: string }) {
            // Simulate async DB read boundary so concurrent calls interleave realistically
            await Promise.resolve();
            const entry = store.get(ref.path);
            readVersions.set(ref.path, entry ? entry.version : 0);
            return {
              id: ref.id,
              exists: Boolean(entry),
              data: () => (entry ? structuredClone(entry.data) : undefined),
            };
          },
          set(ref: { path: string }, data: Record<string, unknown>, opts?: { merge?: boolean }) {
            pendingWrites.push({ path: ref.path, data: structuredClone(data), merge: Boolean(opts?.merge) });
          },
        };

        const result = await fn(tx);

        // Verify read versions did not change while transaction ran
        let conflict = false;
        for (const [p, v] of readVersions.entries()) {
          const currentVersion = store.get(p)?.version || 0;
          if (currentVersion !== v) {
            conflict = true;
            break;
          }
        }
        if (conflict) {
          continue;
        }

        for (const write of pendingWrites) {
          const prev = store.get(write.path);
          const nextData = write.merge && prev ? { ...prev.data, ...write.data } : write.data;
          store.set(write.path, { version: (prev?.version || 0) + 1, data: nextData });
        }
        return result;
      }
      throw new Error("TRANSACTION_CONTENTION_EXCEEDED");
    },
    _dump: () => Object.fromEntries(Array.from(store.entries()).map(([k, v]) => [k, v.data])),
  };

  return db;
}

test("Anti-Abuse 20-Case Matrix & Security Verification", async () => {
  const secret = "test-hmac-secret-at-least-32-chars!!";
  const enforceFlags = resolveAntiAbuseFeatureFlags(
    {
      mode: "enforce",
      enforceDeviceFreeClaim: true,
      allowSignalUnavailableFallback: true,
      enableBirthFingerprintObservation: true,
      requirePlayIntegrity: false,
      requireAppCheck: false,
      enableVc121MigrationGrace: true,
    },
    { NODE_ENV: "test" },
  );

  const observeFlags = resolveAntiAbuseFeatureFlags({ mode: "observe" }, { NODE_ENV: "test" });

  // 1. New user on new device -> gets 1 free trial + atomic claim recorded
  {
    const db = createTransactionalFirestoreMock();
    const res = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "user-1",
      signals: parseBootstrapSignalsBody({
        platform: "android",
        appVersionCode: 122,
        deviceIdHash: computeDeviceIdentityHash("android-device-A"),
      }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(res.ok, true);
    assert.equal(res.outcome, "PROVISIONED");
    assert.equal(res.eligibilityStatus, "ELIGIBLE_FREE");
    assert.ok(res.trialStartedAt && res.trialEndsAt);
  }

  // 2. Same device + second Google account -> blocked cleanly in enforce, allowed-with-observation in observe
  {
    const devHash = computeDeviceIdentityHash("android-device-shared");
    const db = createTransactionalFirestoreMock();
    const first = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "user-first",
      signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: devHash }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(first.outcome, "PROVISIONED");

    const secondEnforced = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "user-second-gmail",
      signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: devHash }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(secondEnforced.ok, false);
    assert.equal(secondEnforced.outcome, "FREE_LIMIT_REACHED");
    assert.equal(secondEnforced.eligibilityStatus, "DEVICE_FREE_TRIAL_USED");
    assert.equal(Boolean(db._dump()["users/user-second-gmail"]?.trialStartedAt), false);

    // Observe mode preserves access continuity while flagging
    const secondObserved = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "user-second-observe",
      signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: devHash }).parsed,
      flagOverrides: observeFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(secondObserved.ok, true);
    assert.equal(secondObserved.outcome, "PROVISIONED");
    assert.ok(secondObserved.reasons?.includes("MODE_OBSERVE_ONLY"));
  }

  // 3. Same Gmail logging into new device -> ALREADY_PRESENT, preserves original trial dates
  {
    const db = createTransactionalFirestoreMock({
      "users/uid-returning": {
        trialStartedAt: "2026-10-01T00:00:00.000Z",
        trialEndsAt: "2026-10-08T00:00:00.000Z",
        membershipType: "TRIAL",
      },
    });
    const res = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "uid-returning",
      signals: parseBootstrapSignalsBody({
        platform: "android",
        deviceIdHash: computeDeviceIdentityHash("brand-new-phone"),
      }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(res.ok, true);
    assert.equal(res.outcome, "ALREADY_PRESENT");
    assert.equal(res.trialStartedAt, "2026-10-01T00:00:00.000Z");
  }

  // 4. Two family members sharing same device -> non-hostile Indonesian UX copy & no crash
  {
    const ux = getAntiAbuseUxCopy({ trialEligibilityStatus: "DEVICE_FREE_TRIAL_USED" });
    assert.ok(ux);
    assert.equal(ux.title, "Akses Gratis Telah Digunakan");
    assert.equal(ux.primaryCtaLabel, "Lihat Bhumi Premium");
    assert.equal(ux.switchAccountCtaLabel, "Masuk Akun Lama");
  }

  // 5, 6, 7. Identical names, identical birthdates, identical twins on different devices -> NEVER hard-blocked!
  {
    const fp1 = computeBirthProfileHmac(
      {
        fullName: "Raka Pratama",
        birthDate: "1994-05-12",
        birthTime: "08:30",
        latitude: -6.2,
        longitude: 106.8,
      },
      secret,
    );
    const fp2 = computeBirthProfileHmac(
      {
        fullName: "Raka Pratama",
        birthDate: "1994-05-12",
        birthTime: "08:30",
        latitude: -6.201,
        longitude: 106.802,
      },
      secret,
    );
    assert.equal(fp1.birthCoreHmac, fp2.birthCoreHmac);

    const twinDecision = evaluateTrialEligibility({
      user: { uid: "twin-b", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "android", deviceIdHash: computeDeviceIdentityHash("twin-b-phone"), birthCoreHmac: fp1.birthCoreHmac },
      existingDeviceClaim: null,
      existingBirthClaim: {
        hmac: fp1.birthCoreHmac!,
        firstUidHash: "twin-a-hash",
        uidCount: 1,
        uidHashes: ["twin-a-hash"],
        firstSeenAt: "2026-11-01T00:00:00.000Z",
        lastSeenAt: "2026-11-01T00:00:00.000Z",
      } satisfies BirthClaimRecord,
      uidHash: "twin-b-hash",
      flags: enforceFlags,
    });
    assert.equal(twinDecision.allowFreeTrialProvision, true);
    assert.equal(twinDecision.status, "SUSPECTED_DUPLICATE");
    assert.ok(twinDecision.reasons.includes("BIRTH_PROFILE_SIMILARITY_OBSERVED"));
  }

  // 8, 9, 10. Free->Premium upgrade, Premium device switch, Restore purchase on second device -> ALWAYS PREMIUM_ACTIVE
  {
    const usedDeviceClaim: DeviceClaimRecord = {
      claimKey: `dev:${computeDeviceIdentityHash("used-device")}`,
      firstUid: "some-free-uid",
      firstClaimedAt: "2026-10-01T00:00:00.000Z",
      lastSeenAt: "2026-10-01T00:00:00.000Z",
      claimCount: 1,
    };
    const premiumDecision = evaluateTrialEligibility({
      user: { uid: "paid-user-2", hasHigherEntitlement: true, hasExistingTrial: false },
      signals: { platform: "android", deviceIdHash: computeDeviceIdentityHash("used-device") },
      existingDeviceClaim: usedDeviceClaim,
      flags: enforceFlags,
    });
    assert.equal(premiumDecision.status, "PREMIUM_ACTIVE");
    assert.equal(premiumDecision.reasons[0], "HIGHER_ENTITLEMENT");
  }

  // 11. Concurrent free claim attempts on the same device by two different UIDs -> ONLY 1 succeeds
  {
    const db = createTransactionalFirestoreMock();
    const sharedHash = computeDeviceIdentityHash("race-condition-phone");
    const [r1, r2] = await Promise.all([
      runServerTrialBootstrapTransaction({
        db: db as any,
        uid: "race-uid-1",
        signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: sharedHash }).parsed,
        flagOverrides: enforceFlags,
        hmacSecretOverride: secret,
      }),
      runServerTrialBootstrapTransaction({
        db: db as any,
        uid: "race-uid-2",
        signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: sharedHash }).parsed,
        flagOverrides: enforceFlags,
        hmacSecretOverride: secret,
      }),
    ]);
    const outcomes = [r1.outcome, r2.outcome].sort();
    assert.deepEqual(outcomes, ["FREE_LIMIT_REACHED", "PROVISIONED"]);
  }

  // 12. Missing device signals fallback vs strict fail-closed
  {
    const fallbackAllowed = evaluateTrialEligibility({
      user: { uid: "u-nosig-1", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "android" },
      existingDeviceClaim: null,
      flags: enforceFlags,
    });
    assert.equal(fallbackAllowed.allowFreeTrialProvision, true);
    assert.ok(fallbackAllowed.reasons.includes("MISSING_DEVICE_SIGNALS"));

    const strictFailClosed = evaluateTrialEligibility({
      user: { uid: "u-nosig-2", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "android" },
      existingDeviceClaim: null,
      flags: { ...enforceFlags, allowSignalUnavailableFallback: false },
    });
    assert.equal(strictFailClosed.allowFreeTrialProvision, false);
    assert.equal(strictFailClosed.status, "SIGNAL_UNAVAILABLE");
  }

  // 13 & 14. Play Integrity failed & App Check failed when required
  {
    const integrityFail = evaluateTrialEligibility({
      user: { uid: "u-int", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "android", deviceIdHash: computeDeviceIdentityHash("dev-int"), playIntegrityVerified: false },
      existingDeviceClaim: null,
      flags: { ...enforceFlags, requirePlayIntegrity: true },
    });
    assert.equal(integrityFail.allowFreeTrialProvision, false);
    assert.equal(integrityFail.status, "VERIFICATION_REQUIRED");
    assert.ok(getAntiAbuseUxCopy({ trialEligibilityStatus: integrityFail.status })?.title === "Kami Perlu Memverifikasi Aksesmu");

    const appCheckFail = evaluateTrialEligibility({
      user: { uid: "u-ac", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "web", installIdHash: computeDeviceIdentityHash("web-inst"), appCheckVerified: false },
      existingDeviceClaim: null,
      flags: { ...enforceFlags, requireAppCheck: true },
    });
    assert.equal(appCheckFail.allowFreeTrialProvision, false);
    assert.equal(appCheckFail.status, "VERIFICATION_REQUIRED");
  }

  // 15, 16, 17. Logout/relogin, App reinstall (new installIdHash, same deviceIdHash), Account deletion -> claim persists
  {
    const persistentAndroidHash = computeDeviceIdentityHash("ssaid-persists-across-reinstall");
    const db = createTransactionalFirestoreMock();

    // First account claims trial
    const a1 = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "deleted-uid-1",
      signals: parseBootstrapSignalsBody({
        platform: "android",
        deviceIdHash: persistentAndroidHash,
        installIdHash: computeDeviceIdentityHash("install-1"),
      }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(a1.outcome, "PROVISIONED");

    // Account deletion removes users/deleted-uid-1 in Auth, user reinstalls app (new install-2) & signs up as new UID
    const a2 = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "recreated-uid-2",
      signals: parseBootstrapSignalsBody({
        platform: "android",
        deviceIdHash: persistentAndroidHash,
        installIdHash: computeDeviceIdentityHash("install-2"),
      }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(a2.ok, false);
    assert.equal(a2.outcome, "FREE_LIMIT_REACHED");
  }

  // 18. VC 121 migration compatibility (legacy user doc without signals -> safe grace)
  {
    const db = createTransactionalFirestoreMock({
      "users/vc121-legacy": {
        setupCompleted: true,
        birthDate: "1991-09-01",
      },
    });
    const res = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "vc121-legacy",
      signals: parseBootstrapSignalsBody({}).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(res.ok, true);
    assert.equal(res.outcome, "PROVISIONED");
    assert.ok(res.reasons?.includes("LEGACY_VC121_USER"));
  }

  // 19. Feature flag rollback / kill switch
  {
    const killed = resolveAntiAbuseFeatureFlags(
      { mode: "enforce", enforceDeviceFreeClaim: true },
      { BHUMI_ANTI_ABUSE_KILL_SWITCH: "true" },
    );
    assert.equal(killed.mode, "off");
    assert.equal(killed.enforceDeviceFreeClaim, false);
    assert.throws(() => resolveHmacSecret({ NODE_ENV: "production" }), /ANTI_ABUSE_HMAC_SECRET_MISSING/);
  }

  // 20. Security rules + normalization + Android plugin invariants
  {
    const rules = fs.readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8");
    assert.ok(rules.includes("match /antiAbuseDeviceClaims/{claimId}"));
    assert.ok(rules.includes("match /antiAbuseBirthClaims/{hmacId}"));
    assert.ok(rules.includes("match /antiAbuseAuditLogs/{logId}"));
    assert.ok(rules.includes('"trialEligibilityStatus"'));
    assert.ok(rules.includes('"antiAbuseDecision"'));

    const pluginJava = fs.readFileSync(
      path.join(process.cwd(), "android/app/src/main/java/com/bhumiamartya/app/DeviceIntegrityPlugin.java"),
      "utf8",
    );
    assert.ok(pluginJava.includes("MessageDigest.getInstance(\"SHA-256\")"));
    assert.ok(!pluginJava.includes("getImei"));

    assert.equal(normalizeBirthDate("1995-03-09T12:00:00Z"), "1995-03-09");
    assert.equal(normalizeBirthTime("7:5"), "07:05");
    assert.equal(normalizeBirthLocation({ latitude: -6.2146, longitude: 106.8451 }), "-6.21,106.85");

    const parsedSpoofed = parseBootstrapSignalsBody({
      platform: "android",
      deviceIdHash: computeDeviceIdentityHash("real-device-1"),
      birthCoreHmac: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
    assert.equal(parsedSpoofed.valid, true);
    assert.equal(parsedSpoofed.parsed.birthCoreHmac, null);
  }

  // 21. Privacy: raw firstUid never written on new claims; firstUidHash stored instead; legacy firstUid read still works
  {
    const devHash = computeDeviceIdentityHash("privacy-device-hash-only");
    const db = createTransactionalFirestoreMock();
    const res = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "privacy-uid-1",
      signals: parseBootstrapSignalsBody({ platform: "android", deviceIdHash: devHash }).parsed,
      flagOverrides: enforceFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(res.outcome, "PROVISIONED");
    const dump = db._dump();
    const claimEntry = Object.entries(dump).find(([k]) => k.startsWith("antiAbuseDeviceClaims/"));
    assert.ok(claimEntry);
    assert.equal((claimEntry[1] as Record<string, unknown>).firstUid, undefined);
    assert.equal(typeof (claimEntry[1] as Record<string, unknown>).firstUidHash, "string");
    assert.ok(typeof (claimEntry[1] as Record<string, unknown>).retainUntil === "string");

    // Legacy record with raw firstUid (no firstUidHash) still allows same user retry/recovery
    const legacyAllow = evaluateTrialEligibility({
      user: { uid: "legacy-owner-uid", hasHigherEntitlement: false, hasExistingTrial: false },
      signals: { platform: "android", deviceIdHash: devHash },
      existingDeviceClaim: {
        claimKey: `dev:${devHash}`,
        firstUid: "legacy-owner-uid",
        firstClaimedAt: "2026-09-01T00:00:00.000Z",
        lastSeenAt: "2026-09-01T00:00:00.000Z",
        claimCount: 1,
      },
      uidHash: "unrelated-hash",
      flags: enforceFlags,
    });
    assert.equal(legacyAllow.allowFreeTrialProvision, true);
  }

  // 22. Single-use nonce replay guard prevents reusing one verified Play Integrity attestation
  {
    const db = createTransactionalFirestoreMock();
    const sharedNonceHash = "b".repeat(64);
    const strictPiFlags = { ...enforceFlags, requirePlayIntegrity: true };

    const first = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "nonce-uid-1",
      signals: {
        ...parseBootstrapSignalsBody({
          platform: "android",
          deviceIdHash: computeDeviceIdentityHash("nonce-dev-1"),
        }).parsed,
        playIntegrityVerified: true,
        nonceHash: sharedNonceHash,
      },
      flagOverrides: strictPiFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(first.outcome, "PROVISIONED");
    assert.ok(db._dump()[`antiAbuseUsedNonces/${sharedNonceHash}`]);

    const replayed = await runServerTrialBootstrapTransaction({
      db: db as any,
      uid: "nonce-uid-2",
      signals: {
        ...parseBootstrapSignalsBody({
          platform: "android",
          deviceIdHash: computeDeviceIdentityHash("nonce-dev-2"),
        }).parsed,
        playIntegrityVerified: true,
        nonceHash: sharedNonceHash,
      },
      flagOverrides: strictPiFlags,
      hmacSecretOverride: secret,
    });
    assert.equal(replayed.ok, false);
    assert.equal(replayed.outcome, "VERIFICATION_REQUIRED");
  }

  // 23. Android plugin & Firestore Rules & Privacy Policy / Settings deletion reconciliation checks
  {
    const pluginJava = fs.readFileSync(
      path.join(process.cwd(), "android/app/src/main/java/com/bhumiamartya/app/DeviceIntegrityPlugin.java"),
      "utf8",
    );
    assert.ok(pluginJava.includes("AppSet.getClient"));
    assert.ok(pluginJava.includes("requestIntegrityToken"));
    assert.ok(pluginJava.includes("IntegrityManagerFactory.create"));
    assert.ok(!pluginJava.includes("READ_PHONE_STATE"));

    const rules = fs.readFileSync(path.join(process.cwd(), "firestore.rules"), "utf8");
    assert.ok(rules.includes("match /antiAbuseUsedNonces/{nonceHash}"));

    const privacy = fs.readFileSync(path.join(process.cwd(), "app/kebijakan-privasi/page.tsx"), "utf8");
    assert.ok(privacy.includes("pseudonim") && privacy.includes("bukan data anonim"));
    assert.ok(privacy.includes("180 hari") || privacy.includes("180 days"));
    assert.ok(privacy.includes("App Set ID"));
    assert.ok(privacy.includes("Play Integrity"));

    const settings = fs.readFileSync(path.join(process.cwd(), "app/settings/page.tsx"), "utf8");
    assert.ok(settings.includes("reconcileAntiAbuseAccountDeletion"));

    const bantuan = fs.readFileSync(path.join(process.cwd(), "app/bantuan/page.tsx"), "utf8");
    assert.ok(bantuan.includes('id="verifikasi-perangkat"'));

    const premiumLock = fs.readFileSync(path.join(process.cwd(), "components/auth/PremiumLock.tsx"), "utf8");
    assert.ok(premiumLock.includes("retryCanonicalAccessVerification"));

    const defaultEnforce = resolveAntiAbuseFeatureFlags({ mode: "enforce" }, { NODE_ENV: "production" });
    assert.equal(defaultEnforce.enforceDeviceFreeClaim, true);
    assert.equal(defaultEnforce.requirePlayIntegrity, true);

    const dsDoc = fs.readFileSync(path.join(process.cwd(), "docs/VC122_DATA_SAFETY_AND_ANTI_ABUSE.md"), "utf8");
    assert.ok(dsDoc.includes("NOT anonymous") && dsDoc.includes("180 days"));
  }

  // 24. VC 123 challenge signal binding rejects altered appSetIdHash / deviceIdHash while preserving VC 122 unbound compatibility
  {
    const nowMs = Date.UTC(2026, 10, 12, 0, 0, 0);
    const sigs = {
      deviceIdHash: computeDeviceIdentityHash("bound-device-1"),
      appSetIdHash: computeDeviceIdentityHash("bound-appset-1"),
      installIdHash: computeDeviceIdentityHash("bound-install-1"),
    };
    const ch = issueIntegrityChallenge("uid-bound-1", secret, nowMs, sigs);
    assert.equal(ch.signalBound, true);
    assert.ok(ch.nonce.includes("."));

    const verifiedSame = verifyIntegrityChallengeToken(ch.challengeToken, "uid-bound-1", secret, nowMs + 1000, sigs);
    assert.equal(verifiedSame.valid, true);

    const verifiedAlteredAppSet = verifyIntegrityChallengeToken(
      ch.challengeToken,
      "uid-bound-1",
      secret,
      nowMs + 1000,
      { ...sigs, appSetIdHash: computeDeviceIdentityHash("spoofed-appset-2") },
    );
    assert.equal(verifiedAlteredAppSet.valid, false);
    if (!verifiedAlteredAppSet.valid) {
      assert.equal(verifiedAlteredAppSet.reason, "CHALLENGE_SIGNAL_BINDING_MISMATCH");
    }

    const legacyUnbound = issueIntegrityChallenge("uid-vc122-1", secret, nowMs, null);
    assert.equal(legacyUnbound.signalBound, false);
    const legacyVerified = verifyIntegrityChallengeToken(
      legacyUnbound.challengeToken,
      "uid-vc122-1",
      secret,
      nowMs + 1000,
      sigs,
    );
    assert.equal(legacyVerified.valid, true);
  }
});
