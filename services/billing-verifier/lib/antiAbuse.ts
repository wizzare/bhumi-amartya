import { createHash, createHmac } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";

export type AntiAbuseMode = "off" | "observe" | "enforce";

export type AntiAbuseFeatureFlags = {
  mode: AntiAbuseMode;
  enforceDeviceFreeClaim: boolean;
  allowSignalUnavailableFallback: boolean;
  enableBirthFingerprintObservation: boolean;
  requirePlayIntegrity: boolean;
  requireAppCheck: boolean;
  enableVc121MigrationGrace: boolean;
};

export type TrialEligibilityStatus =
  | "ELIGIBLE_FREE"
  | "ALREADY_GRANTED"
  | "DEVICE_FREE_TRIAL_USED"
  | "PREMIUM_ACTIVE"
  | "SUSPECTED_DUPLICATE"
  | "VERIFICATION_REQUIRED"
  | "SIGNAL_UNAVAILABLE";

export type TrialBootstrapOutcome =
  | "PROVISIONED"
  | "ALREADY_PRESENT"
  | "HIGHER_ENTITLEMENT"
  | "FREE_LIMIT_REACHED"
  | "VERIFICATION_REQUIRED"
  | "SIGNAL_UNAVAILABLE"
  | "EXPIRED_BY_ACCOUNT_AGE"
  | "DATA_CONFLICT"
  | "AUTH_CREATION_TIME_UNAVAILABLE"
  | "RETRYABLE_ERROR";

export type TrialBootstrapResponse = {
  ok: boolean;
  outcome: TrialBootstrapOutcome;
  eligibilityStatus?: TrialEligibilityStatus;
  reasons?: string[];
  mode?: AntiAbuseMode;
  trialStartedAt?: string;
  trialEndsAt?: string;
  error?: string;
};

export type BootstrapSignals = {
  platform: "android" | "web" | "ios" | "unknown";
  appVersionCode: number | null;
  deviceIdHash: string | null;
  appSetIdHash: string | null;
  installIdHash: string | null;
  birthCoreHmac: string | null;
  playIntegrityVerified: boolean | null;
  appCheckVerified: boolean | null;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SOURCE = "server_access_bootstrap";

function parseBoolEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  const v = value.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return fallback;
}

function parseModeEnv(value: string | undefined, fallback: AntiAbuseMode): AntiAbuseMode {
  const v = (value || "").trim().toLowerCase();
  if (v === "off" || v === "observe" || v === "enforce") return v;
  return fallback;
}

export function resolveVerifierAntiAbuseFlags(
  remoteConfig?: Record<string, unknown> | null,
): AntiAbuseFeatureFlags {
  const env = process.env;
  if (env.BHUMI_ANTI_ABUSE_KILL_SWITCH === "true") {
    return {
      mode: "off",
      enforceDeviceFreeClaim: false,
      allowSignalUnavailableFallback: true,
      enableBirthFingerprintObservation: false,
      requirePlayIntegrity: false,
      requireAppCheck: false,
      enableVc121MigrationGrace: true,
    };
  }
  const envMode = parseModeEnv(env.BHUMI_ANTI_ABUSE_MODE, "observe");
  const mode =
    remoteConfig && typeof remoteConfig.mode === "string"
      ? parseModeEnv(remoteConfig.mode, envMode)
      : envMode;

  if (mode === "off") {
    return {
      mode: "off",
      enforceDeviceFreeClaim: false,
      allowSignalUnavailableFallback: true,
      enableBirthFingerprintObservation: false,
      requirePlayIntegrity: false,
      requireAppCheck: false,
      enableVc121MigrationGrace: true,
    };
  }

  const pick = (key: keyof AntiAbuseFeatureFlags, envKey: string, fallback: boolean) =>
    remoteConfig && typeof remoteConfig[key] === "boolean"
      ? (remoteConfig[key] as boolean)
      : parseBoolEnv(env[envKey], fallback);

  return {
    mode,
    enforceDeviceFreeClaim: mode === "enforce" && pick("enforceDeviceFreeClaim", "BHUMI_ANTI_ABUSE_ENFORCE_DEVICE", true),
    allowSignalUnavailableFallback: pick("allowSignalUnavailableFallback", "BHUMI_ANTI_ABUSE_SIGNAL_FALLBACK", true),
    enableBirthFingerprintObservation: pick("enableBirthFingerprintObservation", "BHUMI_ANTI_ABUSE_BIRTH_FINGERPRINT", true),
    requirePlayIntegrity: mode === "enforce" && pick("requirePlayIntegrity", "BHUMI_ANTI_ABUSE_REQUIRE_PLAY_INTEGRITY", false),
    requireAppCheck: mode === "enforce" && pick("requireAppCheck", "BHUMI_ANTI_ABUSE_REQUIRE_APP_CHECK", false),
    enableVc121MigrationGrace: pick("enableVc121MigrationGrace", "BHUMI_ANTI_ABUSE_VC121_GRACE", true),
  };
}

function asCleanHash(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return /^[a-f0-9-]{16,128}$/i.test(trimmed) ? trimmed : null;
}

export function parseVerifierSignals(rawBody: unknown, appCheckHeader: string | undefined): {
  valid: boolean;
  signals: BootstrapSignals;
} {
  const emptySignals: BootstrapSignals = {
    platform: "unknown",
    appVersionCode: null,
    deviceIdHash: null,
    appSetIdHash: null,
    installIdHash: null,
    birthCoreHmac: null,
    playIntegrityVerified: null,
    appCheckVerified: appCheckHeader ? null : false,
  };
  if (rawBody == null || rawBody === "") {
    return { valid: true, signals: emptySignals };
  }
  if (typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return { valid: false, signals: emptySignals };
  }
  const obj = rawBody as Record<string, unknown>;
  if (Object.keys(obj).length === 0) {
    return { valid: true, signals: emptySignals };
  }
  const rawPlatform = typeof obj.platform === "string" ? obj.platform.toLowerCase() : "unknown";
  const platform: BootstrapSignals["platform"] =
    rawPlatform === "android" || rawPlatform === "web" || rawPlatform === "ios"
      ? rawPlatform
      : "unknown";

  return {
    valid: true,
    signals: {
      platform,
      appVersionCode: typeof obj.appVersionCode === "number" && Number.isFinite(obj.appVersionCode) ? obj.appVersionCode : null,
      deviceIdHash: asCleanHash(obj.deviceIdHash),
      appSetIdHash: asCleanHash(obj.appSetIdHash),
      installIdHash: asCleanHash(obj.installIdHash),
      birthCoreHmac: asCleanHash(obj.birthCoreHmac),
      playIntegrityVerified: null,
      appCheckVerified: appCheckHeader ? null : false,
    },
  };
}

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function selectPrimaryKey(signals: BootstrapSignals): string | null {
  if (signals.appSetIdHash) return `appset:${signals.appSetIdHash}`;
  if (signals.deviceIdHash) return `dev:${signals.deviceIdHash}`;
  if (signals.installIdHash) return `inst:${signals.installIdHash}`;
  return null;
}

function computeBirthHmacFromUser(data: Record<string, unknown>): string | null {
  const secret = process.env.BHUMI_ANTI_ABUSE_HMAC_SECRET?.trim();
  const birthDate = typeof data.birthDate === "string" ? data.birthDate.trim() : "";
  if (!secret || secret.length < 16 || !birthDate) return null;
  const birthTime = typeof data.birthTime === "string" ? data.birthTime.trim() : "UNKNOWN";
  const lat = typeof data.latitude === "number" && Number.isFinite(data.latitude) ? data.latitude.toFixed(2) : "";
  const lng = typeof data.longitude === "number" && Number.isFinite(data.longitude) ? data.longitude.toFixed(2) : "";
  const loc = lat && lng ? `${lat},${lng}` : `${String(data.birthCity || "").trim().toLowerCase()}|${String(data.birthCountry || "").trim().toLowerCase()}`;
  return createHmac("sha256", secret).update(`v1|${birthDate}|${birthTime}|${loc}`).digest("hex");
}

export async function runVerifierTrialBootstrap(
  db: Firestore,
  uid: string,
  signals: BootstrapSignals,
): Promise<{ statusCode: number; body: TrialBootstrapResponse }> {
  const now = new Date();
  const nowIso = now.toISOString();
  const configSnap = await db.doc("app_config/antiAbuse").get().catch(() => null);
  const flags = resolveVerifierAntiAbuseFlags(configSnap?.exists ? configSnap.data() || null : null);

  const primaryKey = selectPrimaryKey(signals);
  const deviceClaimRef = primaryKey
    ? db.doc(`antiAbuseDeviceClaims/${sha256Hex(`bhumi-claim-doc-v1:${primaryKey}`)}`)
    : null;
  const userRef = db.doc(`users/${uid}`);
  const auditRef = db.collection("antiAbuseAuditLogs").doc();

  const uidHash = sha256Hex(`bhumi-uid-v1:${uid}`).slice(0, 32);

  const result = await db.runTransaction<{ statusCode: number; body: TrialBootstrapResponse }>(async (transaction) => {
    const snapshot = await transaction.get(userRef);
    const deviceSnap = deviceClaimRef ? await transaction.get(deviceClaimRef) : null;
    const data = snapshot.data() || {};

    if (
      [data.badge, data.testerBadge, data.guardianBadge].some((value) =>
        ["Founder", "Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"].includes(String(value || "")),
      ) ||
      data.membershipType === "LIFETIME" ||
      data.membershipType === "PREMIUM" ||
      data.isPremium === true ||
      data.entitlementSource === "google_play"
    ) {
      return {
        statusCode: 200,
        body: { ok: true, outcome: "HIGHER_ENTITLEMENT", eligibilityStatus: "PREMIUM_ACTIVE", mode: flags.mode },
      };
    }

    const hasTrial =
      ["trialStartedAt", "trialEndsAt", "accessStart", "accessUntil", "entitlementSource", "accessSource", "trialLoginCount", "trialStatus", "trialCompletedAt", "trialGranted"].some((key) =>
        Object.hasOwn(data, key),
      ) ||
      data.membershipType === "TRIAL" ||
      data.membership === "REGULAR_TRIAL" ||
      data.plan === "free_trial" ||
      data.subscriptionStatus === "trialing";

    if (hasTrial) {
      const start = typeof data.trialStartedAt === "string" ? Date.parse(data.trialStartedAt) : NaN;
      const end = typeof data.trialEndsAt === "string" ? Date.parse(data.trialEndsAt) : NaN;
      const valid =
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        end - start === SEVEN_DAYS_MS &&
        start <= Date.now() &&
        data.entitlementSource === SOURCE &&
        data.accessSource === SOURCE &&
        data.updatedBy === SOURCE &&
        data.accessSourceVersion === "2026-09-13" &&
        data.accessStart === data.trialStartedAt &&
        data.accessUntil === data.trialEndsAt &&
        data.membershipType === "TRIAL" &&
        data.membership === "REGULAR_TRIAL" &&
        data.plan === "free_trial" &&
        data.subscriptionStatus === "trialing";

      if (valid && deviceClaimRef && !deviceSnap?.exists && primaryKey) {
        transaction.set(
          deviceClaimRef,
          {
            claimKey: primaryKey,
            firstUid: uid,
            firstClaimedAt: String(data.trialStartedAt || nowIso),
            lastSeenAt: nowIso,
            claimCount: 1,
            platform: signals.platform,
            appVersionCode: signals.appVersionCode,
            uidHistory: [uidHash],
          },
          { merge: true },
        );
      }

      return {
        statusCode: valid ? 200 : 409,
        body: {
          ok: valid,
          outcome: valid ? "ALREADY_PRESENT" : "DATA_CONFLICT",
          eligibilityStatus: "ALREADY_GRANTED",
          mode: flags.mode,
          ...(valid ? { trialStartedAt: String(data.trialStartedAt), trialEndsAt: String(data.trialEndsAt) } : {}),
        },
      };
    }

    const existingDeviceClaim = deviceSnap?.exists ? deviceSnap.data() || null : null;
    const claimedByOtherUid = Boolean(existingDeviceClaim && existingDeviceClaim.firstUid !== uid);
    const reasons: string[] = [];

    if (flags.mode !== "off") {
      if (flags.requirePlayIntegrity && signals.platform === "android" && signals.playIntegrityVerified !== true) {
        reasons.push("PLAY_INTEGRITY_FAILED");
        transaction.set(
          userRef,
          {
            trialEligibilityStatus: "VERIFICATION_REQUIRED",
            antiAbuseDecision: reasons.join(","),
            antiAbuseMode: flags.mode,
            antiAbuseEvaluatedAt: nowIso,
            updatedBy: SOURCE,
            updatedAt: nowIso,
          },
          { merge: true },
        );
        transaction.set(auditRef, {
          uidHash,
          deviceClaimId: deviceClaimRef ? deviceClaimRef.id : null,
          status: "VERIFICATION_REQUIRED",
          reasons,
          mode: flags.mode,
          platform: signals.platform,
          createdAt: nowIso,
        });
        return {
          statusCode: 200,
          body: {
            ok: false,
            outcome: "VERIFICATION_REQUIRED",
            eligibilityStatus: "VERIFICATION_REQUIRED",
            reasons,
            mode: flags.mode,
          },
        };
      }

      if (claimedByOtherUid) {
        reasons.push("DEVICE_CLAIM_EXISTS_OTHER_UID");
        if (flags.enforceDeviceFreeClaim) {
          transaction.set(
            userRef,
            {
              trialEligibilityStatus: "DEVICE_FREE_TRIAL_USED",
              antiAbuseDecision: reasons.join(","),
              antiAbuseMode: flags.mode,
              antiAbuseEvaluatedAt: nowIso,
              updatedBy: SOURCE,
              updatedAt: nowIso,
            },
            { merge: true },
          );
          if (deviceClaimRef && existingDeviceClaim) {
            const history = Array.isArray(existingDeviceClaim.uidHistory)
              ? Array.from(new Set([...existingDeviceClaim.uidHistory, uidHash])).slice(0, 15)
              : [uidHash];
            transaction.set(
              deviceClaimRef,
              {
                lastSeenAt: nowIso,
                claimCount: Number(existingDeviceClaim.claimCount || 1) + 1,
                uidHistory: history,
              },
              { merge: true },
            );
          }
          transaction.set(auditRef, {
            uidHash,
            deviceClaimId: deviceClaimRef ? deviceClaimRef.id : null,
            status: "DEVICE_FREE_TRIAL_USED",
            reasons,
            mode: flags.mode,
            platform: signals.platform,
            createdAt: nowIso,
          });
          return {
            statusCode: 200,
            body: {
              ok: false,
              outcome: "FREE_LIMIT_REACHED",
              eligibilityStatus: "DEVICE_FREE_TRIAL_USED",
              reasons,
              mode: flags.mode,
            },
          };
        }
        reasons.push("MODE_OBSERVE_ONLY");
      }

      if (!primaryKey && signals.platform === "android") {
        reasons.push("MISSING_DEVICE_SIGNALS");
        if (flags.enforceDeviceFreeClaim && !flags.allowSignalUnavailableFallback) {
          transaction.set(auditRef, {
            uidHash,
            deviceClaimId: null,
            status: "SIGNAL_UNAVAILABLE",
            reasons,
            mode: flags.mode,
            platform: signals.platform,
            createdAt: nowIso,
          });
          return {
            statusCode: 200,
            body: {
              ok: false,
              outcome: "SIGNAL_UNAVAILABLE",
              eligibilityStatus: "SIGNAL_UNAVAILABLE",
              reasons,
              mode: flags.mode,
            },
          };
        }
      }
    } else {
      reasons.push("MODE_OFF");
    }

    const end = new Date(now.getTime() + SEVEN_DAYS_MS).toISOString();
    transaction.set(
      userRef,
      {
        plan: "free_trial",
        membership: "REGULAR_TRIAL",
        membershipType: "TRIAL",
        subscriptionStatus: "trialing",
        trialStartedAt: nowIso,
        trialEndsAt: end,
        accessStart: nowIso,
        accessUntil: end,
        entitlementSource: SOURCE,
        accessSource: SOURCE,
        accessSourceVersion: "2026-09-13",
        entitlementUpdatedAt: nowIso,
        trialEligibilityStatus: "ELIGIBLE_FREE",
        antiAbuseDecision: reasons.length ? reasons.join(",") : "FIRST_DEVICE_CLAIM",
        antiAbuseMode: flags.mode,
        antiAbuseEvaluatedAt: nowIso,
        deviceClaimRecorded: Boolean(deviceClaimRef && !claimedByOtherUid),
        updatedBy: SOURCE,
        updatedAt: nowIso,
      },
      { merge: true },
    );

    if (flags.mode !== "off" && deviceClaimRef && primaryKey && !claimedByOtherUid) {
      transaction.set(
        deviceClaimRef,
        {
          claimKey: primaryKey,
          firstUid: existingDeviceClaim?.firstUid || uid,
          firstClaimedAt: existingDeviceClaim?.firstClaimedAt || nowIso,
          lastSeenAt: nowIso,
          claimCount: Number(existingDeviceClaim?.claimCount || 0) + 1,
          platform: signals.platform,
          appVersionCode: signals.appVersionCode,
          uidHistory: [uidHash],
        },
        { merge: true },
      );
    }

    const birthHmac = signals.birthCoreHmac || computeBirthHmacFromUser(data);
    transaction.set(auditRef, {
      uidHash,
      deviceClaimId: deviceClaimRef ? deviceClaimRef.id : null,
      birthCoreHmac: birthHmac || null,
      status: "ELIGIBLE_FREE",
      reasons: reasons.length ? reasons : ["FIRST_DEVICE_CLAIM"],
      mode: flags.mode,
      platform: signals.platform,
      createdAt: nowIso,
    });

    return {
      statusCode: 200,
      body: {
        ok: true,
        outcome: "PROVISIONED",
        eligibilityStatus: "ELIGIBLE_FREE",
        reasons: reasons.length ? reasons : ["FIRST_DEVICE_CLAIM"],
        mode: flags.mode,
        trialStartedAt: nowIso,
        trialEndsAt: end,
      },
    };
  });

  return result;
}
