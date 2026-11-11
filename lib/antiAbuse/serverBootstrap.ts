import type { Firestore } from "firebase-admin/firestore";
import {
  computeBirthProfileHmac,
  computeDeviceIdentityHash,
  computeUidHash,
  resolveHmacSecret,
  type NormalizedBirthInput,
} from "./birthFingerprint";
import {
  DEFAULT_ANTI_ABUSE_FLAGS,
  resolveAntiAbuseFeatureFlags,
  type AntiAbuseFeatureFlags,
  type AntiAbuseMode,
} from "./featureFlags";
import {
  evaluateTrialEligibility,
  type BirthClaimRecord,
  type DeviceClaimRecord,
  type EligibilityReasonCode,
  type EligibilitySignalsInput,
  type TrialEligibilityStatus,
} from "./trialEligibility";

export const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
export const SERVER_BOOTSTRAP_SOURCE = "server_access_bootstrap";

export type ExtendedTrialBootstrapOutcome =
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

export type ExtendedTrialBootstrapResponse = {
  ok: boolean;
  outcome: ExtendedTrialBootstrapOutcome;
  eligibilityStatus?: TrialEligibilityStatus;
  reasons?: EligibilityReasonCode[];
  observedRiskFlags?: string[];
  mode?: AntiAbuseMode;
  trialStartedAt?: string;
  trialEndsAt?: string;
  error?: string;
};

export type ParsedBootstrapRequestSignals = EligibilitySignalsInput & {
  birthInput: NormalizedBirthInput | null;
  legacyEmptyBody: boolean;
  challengeToken?: string | null;
  integrityToken?: string | null;
  nonceHash?: string | null;
};

function asCleanHash(value: unknown, maxLen = 128): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!/^[a-f0-9-]{16,128}$/i.test(trimmed)) return null;
  return trimmed.slice(0, maxLen);
}

export function parseBootstrapSignalsBody(
  rawBody: unknown,
  headers?: { appCheckVerified?: boolean | null; playIntegrityVerified?: boolean | null },
): { valid: boolean; parsed: ParsedBootstrapRequestSignals } {
  if (rawBody == null || rawBody === "") {
    return {
      valid: true,
      parsed: {
        platform: "unknown",
        appVersionCode: null,
        deviceIdHash: null,
        appSetIdHash: null,
        installIdHash: null,
        playIntegrityVerified: headers?.playIntegrityVerified ?? null,
        appCheckVerified: headers?.appCheckVerified ?? null,
        birthCoreHmac: null,
        birthInput: null,
        legacyEmptyBody: true,
      },
    };
  }

  if (typeof rawBody !== "object" || Array.isArray(rawBody)) {
    return {
      valid: false,
      parsed: {
        platform: "unknown",
        birthInput: null,
        legacyEmptyBody: false,


      nonceHash: null,
      },
    };
  }

  const obj = rawBody as Record<string, unknown>;
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return {
      valid: true,
      parsed: {
        platform: "unknown",
        appVersionCode: null,
        deviceIdHash: null,
        appSetIdHash: null,
        installIdHash: null,
        playIntegrityVerified: headers?.playIntegrityVerified ?? null,
        appCheckVerified: headers?.appCheckVerified ?? null,
        birthCoreHmac: null,
        birthInput: null,
        legacyEmptyBody: true,
      },
    };
  }

  const rawPlatform = typeof obj.platform === "string" ? obj.platform.toLowerCase() : "unknown";
  const platform: EligibilitySignalsInput["platform"] =
    rawPlatform === "android" || rawPlatform === "web" || rawPlatform === "ios"
      ? rawPlatform
      : "unknown";

  const birthDate = typeof obj.birthDate === "string" ? obj.birthDate : null;
  const birthTime = typeof obj.birthTime === "string" ? obj.birthTime : null;
  const latitude = typeof obj.latitude === "number" && Number.isFinite(obj.latitude) ? obj.latitude : null;
  const longitude = typeof obj.longitude === "number" && Number.isFinite(obj.longitude) ? obj.longitude : null;
  const birthCity = typeof obj.birthCity === "string" ? obj.birthCity : null;
  const birthCountry = typeof obj.birthCountry === "string" ? obj.birthCountry : null;
  const fullName = typeof obj.fullName === "string" ? obj.fullName : null;

  return {
    valid: true,
    parsed: {
      platform,
      appVersionCode:
        typeof obj.appVersionCode === "number" && Number.isFinite(obj.appVersionCode)
          ? obj.appVersionCode
          : null,
      deviceIdHash: asCleanHash(obj.deviceIdHash),
      appSetIdHash: asCleanHash(obj.appSetIdHash),
      installIdHash: asCleanHash(obj.installIdHash),
      playIntegrityVerified: headers?.playIntegrityVerified ?? null,
      appCheckVerified: headers?.appCheckVerified ?? null,
      // Client-supplied HMAC hashes are ignored; server computes HMAC only from server secrets.
      birthCoreHmac: null,
      birthInput: birthDate
        ? { birthDate, birthTime, latitude, longitude, birthCity, birthCountry, fullName }
        : null,
      legacyEmptyBody: false,


      nonceHash: null,
    },
  };
}

function encodeClaimDocId(primaryDeviceKey: string): string {
  return computeDeviceIdentityHash(primaryDeviceKey, "bhumi-claim-doc-v1");
}

function isLegacyVc121UserData(data: Record<string, unknown>, hasSignals: boolean): boolean {
  if (hasSignals) return false;
  if (data.setupCompleted === true || typeof data.birthDate === "string" || typeof data.createdAt === "object" || typeof data.createdAt === "string") {
    return true;
  }
  return false;
}

export async function runServerTrialBootstrapTransaction(params: {
  db: Firestore;
  uid: string;
  signals: ParsedBootstrapRequestSignals;
  now?: Date;
  flagOverrides?: Partial<AntiAbuseFeatureFlags>;
  hmacSecretOverride?: string;
}): Promise<ExtendedTrialBootstrapResponse> {
  const { db, uid, signals, now = new Date(), flagOverrides, hmacSecretOverride } = params;
  const nowIso = now.toISOString();

  // Compute pseudonymous HMAC secret cleanly
  let hmacSecret = hmacSecretOverride || "";
  if (!hmacSecret) {
    try {
      hmacSecret = resolveHmacSecret().secret;
    } catch {
      hmacSecret = "";
    }
  }

  let birthCoreHmac = signals.birthCoreHmac ?? null;
  if (!birthCoreHmac && signals.birthInput && hmacSecret) {
    birthCoreHmac = computeBirthProfileHmac(signals.birthInput, hmacSecret).birthCoreHmac;
  }

  const uidHash = hmacSecret ? computeUidHash(uid, hmacSecret) : computeDeviceIdentityHash(uid, "uid-fallback");

  // Resolve runtime feature flags from Firestore app_config/antiAbuse (optional) + env + test overrides
  const configSnap = await db.doc("app_config/antiAbuse").get().catch(() => null);
  const remoteFlags = configSnap?.exists ? (configSnap.data() as Record<string, unknown>) : null;
  const baseFlags = resolveAntiAbuseFeatureFlags(remoteFlags);
  const flags: AntiAbuseFeatureFlags = flagOverrides
    ? { ...baseFlags, ...flagOverrides }
    : baseFlags || DEFAULT_ANTI_ABUSE_FLAGS;

  const evalSignals: EligibilitySignalsInput = {
    ...signals,
    birthCoreHmac,
  };

  const userRef = db.doc(`users/${uid}`);
  const preliminaryKey =
    (evalSignals.appSetIdHash && `appset:${evalSignals.appSetIdHash}`) ||
    (evalSignals.deviceIdHash && `dev:${evalSignals.deviceIdHash}`) ||
    (evalSignals.installIdHash && `inst:${evalSignals.installIdHash}`) ||
    null;

  const deviceClaimRef = preliminaryKey
    ? db.doc(`antiAbuseDeviceClaims/${encodeClaimDocId(preliminaryKey)}`)
    : null;
  const birthClaimRef = birthCoreHmac ? db.doc(`antiAbuseBirthClaims/${birthCoreHmac}`) : null;
  const auditRef = db.collection("antiAbuseAuditLogs").doc();
  const usedNonceRef = signals.nonceHash ? db.doc(`antiAbuseUsedNonces/${signals.nonceHash}`) : null;
  const retainUntil180d = new Date(now.getTime() + 180 * 86400_000).toISOString();
  const retainUntil90d = new Date(now.getTime() + 90 * 86400_000).toISOString();
  const retainUntil7d = new Date(now.getTime() + 7 * 86400_000).toISOString();

  return db.runTransaction(async (transaction) => {
    const userSnap = await transaction.get(userRef);
    const deviceSnap = deviceClaimRef ? await transaction.get(deviceClaimRef) : null;
    const birthSnap = birthClaimRef ? await transaction.get(birthClaimRef) : null;
    const usedNonceSnap = usedNonceRef ? await transaction.get(usedNonceRef) : null;

    let effectiveSignals = evalSignals;
    if (usedNonceRef && usedNonceSnap?.exists) {
      effectiveSignals = { ...evalSignals, playIntegrityVerified: false };
    } else if (usedNonceRef && evalSignals.playIntegrityVerified === true) {
      transaction.set(usedNonceRef, { uidHash, usedAt: nowIso, retainUntil: retainUntil7d }, { merge: true });
    }

    const data = (userSnap.exists ? userSnap.data() : null) || {};
    const badge = data.badge || data.testerBadge || data.guardianBadge;
    const hasHigherEntitlement =
      ["Founder", "Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"].includes(String(badge || "")) ||
      data.membershipType === "LIFETIME" ||
      data.membershipType === "PREMIUM" ||
      data.isPremium === true ||
      data.entitlementSource === "google_play";

    const hasExistingTrial = Boolean(data.trialStartedAt && data.trialEndsAt);

    // If profile already carries birthDate on user doc & no signal birthCoreHmac yet, compute from profile
    if (!birthCoreHmac && typeof data.birthDate === "string" && hmacSecret) {
      birthCoreHmac = computeBirthProfileHmac(
        {
          birthDate: String(data.birthDate),
          birthTime: typeof data.birthTime === "string" ? data.birthTime : null,
          latitude: typeof data.latitude === "number" ? data.latitude : null,
          longitude: typeof data.longitude === "number" ? data.longitude : null,
          birthCity: typeof data.birthCity === "string" ? data.birthCity : null,
          birthCountry: typeof data.birthCountry === "string" ? data.birthCountry : null,
        },
        hmacSecret,
      ).birthCoreHmac;
    }

    const existingDeviceClaim = deviceSnap?.exists ? (deviceSnap.data() as DeviceClaimRecord) : null;
    const existingBirthClaim = birthSnap?.exists ? (birthSnap.data() as BirthClaimRecord) : null;

    const decision = evaluateTrialEligibility({
      user: {
        uid,
        hasHigherEntitlement,
        hasExistingTrial,
        isLegacyVc121User: isLegacyVc121UserData(data, Boolean(preliminaryKey)),
      },
      signals: { ...effectiveSignals, birthCoreHmac },
      existingDeviceClaim,
      existingBirthClaim,
      uidHash,
      flags,
    });

    if (decision.status === "PREMIUM_ACTIVE") {
      return {
        ok: true,
        outcome: "HIGHER_ENTITLEMENT",
        eligibilityStatus: "PREMIUM_ACTIVE",
        reasons: decision.reasons,
        mode: decision.mode,
      };
    }

    if (decision.status === "ALREADY_GRANTED") {
      if (decision.recordDeviceClaim && deviceClaimRef && preliminaryKey) {
        transaction.set(
          deviceClaimRef,
          {
            claimKey: preliminaryKey,
            firstUidHash: uidHash,
            firstClaimedAt: String(data.trialStartedAt || nowIso),
            lastSeenAt: nowIso,
          retainUntil: retainUntil180d,
            claimCount: 1,
            platform: signals.platform || "unknown",
            appVersionCode: signals.appVersionCode ?? null,
            uidHistory: [uidHash],
          },
          { merge: true },
        );
      }
      return {
        ok: true,
        outcome: "ALREADY_PRESENT",
        eligibilityStatus: "ALREADY_GRANTED",
        reasons: decision.reasons,
        mode: decision.mode,
        trialStartedAt: String(data.trialStartedAt),
        trialEndsAt: String(data.trialEndsAt),
      };
    }

    // Blocked / Denial paths (Fail-closed Free Tier)
    if (!decision.allowFreeTrialProvision) {
      transaction.set(
        userRef,
        {
          trialEligibilityStatus: decision.status,
          antiAbuseDecision: decision.reasons.join(","),
          antiAbuseMode: decision.mode,
          antiAbuseEvaluatedAt: nowIso,
          updatedBy: SERVER_BOOTSTRAP_SOURCE,
          updatedAt: nowIso,
        },
        { merge: true },
      );

      if (deviceClaimRef && existingDeviceClaim) {
        const nextHistory = Array.isArray(existingDeviceClaim.uidHistory)
          ? Array.from(new Set([...existingDeviceClaim.uidHistory, uidHash])).slice(0, 15)
          : [uidHash];
        transaction.set(
          deviceClaimRef,
          {
            lastSeenAt: nowIso,
          retainUntil: retainUntil180d,
            claimCount: (existingDeviceClaim.claimCount || 1) + 1,
            uidHistory: nextHistory,
          },
          { merge: true },
        );
      }

      transaction.set(auditRef, {
        uidHash,
        deviceClaimId: deviceClaimRef ? deviceClaimRef.id : null,
        birthCoreHmac: birthCoreHmac || null,
        status: decision.status,
        reasons: decision.reasons,
        observedRiskFlags: decision.observedRiskFlags,
        mode: decision.mode,
        platform: signals.platform || "unknown",
        appVersionCode: signals.appVersionCode ?? null,
        createdAt: nowIso,
        retainUntil: retainUntil90d,
      });

      const outcome: ExtendedTrialBootstrapOutcome =
        decision.status === "DEVICE_FREE_TRIAL_USED"
          ? "FREE_LIMIT_REACHED"
          : decision.status === "SIGNAL_UNAVAILABLE"
            ? "SIGNAL_UNAVAILABLE"
            : "VERIFICATION_REQUIRED";

      return {
        ok: false,
        outcome,
        eligibilityStatus: decision.status,
        reasons: decision.reasons,
        observedRiskFlags: decision.observedRiskFlags,
        mode: decision.mode,
      };
    }

    // Eligible: Provision 7-day trial atomically + record device claim & optional birth observation
    const trialEndsAt = new Date(now.getTime() + SEVEN_DAYS_MS).toISOString();
    transaction.set(
      userRef,
      {
        plan: "free_trial",
        membership: "REGULAR_TRIAL",
        membershipType: "TRIAL",
        subscriptionStatus: "trialing",
        trialStartedAt: nowIso,
        trialEndsAt,
        accessStart: nowIso,
        accessUntil: trialEndsAt,
        entitlementSource: SERVER_BOOTSTRAP_SOURCE,
        accessSource: SERVER_BOOTSTRAP_SOURCE,
        accessSourceVersion: "2026-09-13",
        entitlementUpdatedAt: nowIso,
        trialEligibilityStatus: decision.status,
        antiAbuseDecision: decision.reasons.join(","),
        antiAbuseMode: decision.mode,
        antiAbuseEvaluatedAt: nowIso,
        deviceClaimRecorded: Boolean(decision.recordDeviceClaim && deviceClaimRef),
        updatedBy: SERVER_BOOTSTRAP_SOURCE,
        updatedAt: nowIso,
      },
      { merge: true },
    );

    if (decision.recordDeviceClaim && deviceClaimRef && preliminaryKey) {
      const nextHistory = existingDeviceClaim?.uidHistory
        ? Array.from(new Set([...existingDeviceClaim.uidHistory, uidHash])).slice(0, 15)
        : [uidHash];
      transaction.set(
        deviceClaimRef,
        {
          claimKey: preliminaryKey,
          firstUidHash: existingDeviceClaim?.firstUidHash || uidHash,
          firstClaimedAt: existingDeviceClaim?.firstClaimedAt || nowIso,
          lastSeenAt: nowIso,
          retainUntil: retainUntil180d,
          claimCount: (existingDeviceClaim?.claimCount || 0) + 1,
          platform: signals.platform || "unknown",
          appVersionCode: signals.appVersionCode ?? null,
          uidHistory: nextHistory,
        },
        { merge: true },
      );
    }

    if (decision.recordBirthObservation && birthClaimRef && birthCoreHmac) {
      const existingHashes = Array.isArray(existingBirthClaim?.uidHashes)
        ? existingBirthClaim.uidHashes
        : [];
      const nextUidHashes = Array.from(new Set([...existingHashes, uidHash])).slice(0, 20);
      transaction.set(
        birthClaimRef,
        {
          hmac: birthCoreHmac,
          firstUidHash: existingBirthClaim?.firstUidHash || uidHash,
          uidCount: nextUidHashes.length,
          uidHashes: nextUidHashes,
          firstSeenAt: existingBirthClaim?.firstSeenAt || nowIso,
          lastSeenAt: nowIso,
          retainUntil: retainUntil180d,
        },
        { merge: true },
      );
    }

    transaction.set(auditRef, {
      uidHash,
      deviceClaimId: deviceClaimRef ? deviceClaimRef.id : null,
      birthCoreHmac: birthCoreHmac || null,
      status: decision.status,
      reasons: decision.reasons,
      observedRiskFlags: decision.observedRiskFlags,
      mode: decision.mode,
      platform: signals.platform || "unknown",
      appVersionCode: signals.appVersionCode ?? null,
      retainUntil: retainUntil90d,
      createdAt: nowIso,
    });

    return {
      ok: true,
      outcome: "PROVISIONED",
      eligibilityStatus: decision.status,
      reasons: decision.reasons,
      observedRiskFlags: decision.observedRiskFlags,
      mode: decision.mode,
      trialStartedAt: nowIso,
      trialEndsAt,
    };
  });
}
