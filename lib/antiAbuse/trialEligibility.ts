import type { AntiAbuseFeatureFlags } from "./featureFlags";

export type TrialEligibilityStatus =
  | "ELIGIBLE_FREE"
  | "ALREADY_GRANTED"
  | "DEVICE_FREE_TRIAL_USED"
  | "PREMIUM_ACTIVE"
  | "SUSPECTED_DUPLICATE"
  | "VERIFICATION_REQUIRED"
  | "SIGNAL_UNAVAILABLE";

export type EligibilityReasonCode =
  | "HIGHER_ENTITLEMENT"
  | "EXISTING_TRIAL_SAME_UID"
  | "LEGACY_VC121_USER"
  | "FIRST_DEVICE_CLAIM"
  | "DEVICE_CLAIM_EXISTS_OTHER_UID"
  | "CONCURRENT_DEVICE_CLAIM_CONFLICT"
  | "BIRTH_PROFILE_SIMILARITY_OBSERVED"
  | "PLAY_INTEGRITY_FAILED"
  | "APP_CHECK_FAILED"
  | "MISSING_DEVICE_SIGNALS"
  | "MODE_OBSERVE_ONLY"
  | "MODE_OFF";

export type DeviceClaimRecord = {
  claimKey: string;
  firstUid: string;
  firstClaimedAt: string;
  lastSeenAt: string;
  claimCount: number;
  platform?: string | null;
  appVersionCode?: number | null;
  uidHistory?: string[];
};

export type BirthClaimRecord = {
  hmac: string;
  firstUidHash: string;
  uidCount: number;
  uidHashes: string[];
  firstSeenAt: string;
  lastSeenAt: string;
};

export type EligibilitySignalsInput = {
  platform?: "android" | "web" | "ios" | "unknown";
  appVersionCode?: number | null;
  deviceIdHash?: string | null;
  appSetIdHash?: string | null;
  installIdHash?: string | null;
  playIntegrityVerified?: boolean | null;
  appCheckVerified?: boolean | null;
  birthCoreHmac?: string | null;
};

export type UserEntitlementSnapshot = {
  uid: string;
  hasHigherEntitlement: boolean;
  hasExistingTrial: boolean;
  isLegacyVc121User?: boolean;
};

export type EligibilityDecision = {
  status: TrialEligibilityStatus;
  allowFreeTrialProvision: boolean;
  recordDeviceClaim: boolean;
  recordBirthObservation: boolean;
  observedRiskFlags: string[];
  reasons: EligibilityReasonCode[];
  primaryDeviceKey: string | null;
  mode: AntiAbuseFeatureFlags["mode"];
};

export function selectPrimaryDeviceKey(signals: EligibilitySignalsInput): string | null {
  const candidates = [
    signals.appSetIdHash ? `appset:${signals.appSetIdHash.trim()}` : null,
    signals.deviceIdHash ? `dev:${signals.deviceIdHash.trim()}` : null,
    signals.installIdHash ? `inst:${signals.installIdHash.trim()}` : null,
  ];
  for (const candidate of candidates) {
    if (candidate && candidate.split(":")[1]?.length >= 16) {
      return candidate;
    }
  }
  return null;
}

export function hasMatchingBirthClusterOtherUid(
  birthClaim: BirthClaimRecord | null,
  uidHash: string | null,
): boolean {
  if (!birthClaim || !uidHash) return false;
  if (birthClaim.firstUidHash && birthClaim.firstUidHash !== uidHash) return true;
  return Array.isArray(birthClaim.uidHashes) && birthClaim.uidHashes.some((h) => h !== uidHash);
}

/**
 * Pure deterministic server decision engine for Free Tier & Anti-Multi Account protection.
 * Guarantees:
 * 1. Paid/Founder/Tester entitlements NEVER lose access.
 * 2. Existing trials on the same UID remain idempotent (logout/login/reinstall safe).
 * 3. Legacy VC 121 users are preserved cleanly.
 * 4. Duplicate names, birth dates, or twin birth profiles NEVER hard-block alone.
 * 5. Device free claim limit is controlled safely via server feature flags.
 */
export function evaluateTrialEligibility(params: {
  user: UserEntitlementSnapshot;
  signals: EligibilitySignalsInput;
  existingDeviceClaim: DeviceClaimRecord | null;
  existingBirthClaim?: BirthClaimRecord | null;
  uidHash?: string | null;
  flags: AntiAbuseFeatureFlags;
}): EligibilityDecision {
  const { user, signals, existingDeviceClaim, existingBirthClaim = null, uidHash = null, flags } = params;
  const primaryDeviceKey = selectPrimaryDeviceKey(signals);
  const reasons: EligibilityReasonCode[] = [];
  const observedRiskFlags: string[] = [];

  if (user.hasHigherEntitlement) {
    return {
      status: "PREMIUM_ACTIVE",
      allowFreeTrialProvision: false,
      recordDeviceClaim: false,
      recordBirthObservation: false,
      observedRiskFlags: [],
      reasons: ["HIGHER_ENTITLEMENT"],
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  if (user.hasExistingTrial) {
    return {
      status: "ALREADY_GRANTED",
      allowFreeTrialProvision: false,
      recordDeviceClaim: Boolean(primaryDeviceKey && !existingDeviceClaim),
      recordBirthObservation: false,
      observedRiskFlags: [],
      reasons: ["EXISTING_TRIAL_SAME_UID"],
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  if (flags.mode === "off") {
    return {
      status: "ELIGIBLE_FREE",
      allowFreeTrialProvision: true,
      recordDeviceClaim: false,
      recordBirthObservation: false,
      observedRiskFlags: [],
      reasons: ["MODE_OFF", "FIRST_DEVICE_CLAIM"],
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  // Birth fingerprint similarity is NEVER a standalone hard block (twins/family/shared names).
  const birthDuplicateDetected =
    flags.enableBirthFingerprintObservation && hasMatchingBirthClusterOtherUid(existingBirthClaim, uidHash);
  if (birthDuplicateDetected) {
    observedRiskFlags.push("SUSPECTED_DUPLICATE_BIRTH_PROFILE");
    reasons.push("BIRTH_PROFILE_SIMILARITY_OBSERVED");
  }

  // Optional Play Integrity / App Check enforcement
  if (flags.requirePlayIntegrity && signals.platform === "android" && signals.playIntegrityVerified !== true) {
    reasons.push("PLAY_INTEGRITY_FAILED");
    return {
      status: "VERIFICATION_REQUIRED",
      allowFreeTrialProvision: false,
      recordDeviceClaim: false,
      recordBirthObservation: Boolean(signals.birthCoreHmac),
      observedRiskFlags: [...observedRiskFlags, "PLAY_INTEGRITY_UNVERIFIED"],
      reasons,
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  if (flags.requireAppCheck && signals.appCheckVerified !== true) {
    reasons.push("APP_CHECK_FAILED");
    return {
      status: "VERIFICATION_REQUIRED",
      allowFreeTrialProvision: false,
      recordDeviceClaim: false,
      recordBirthObservation: Boolean(signals.birthCoreHmac),
      observedRiskFlags: [...observedRiskFlags, "APP_CHECK_UNVERIFIED"],
      reasons,
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  // VC 121 migration grace: legacy accounts created before Build 122 without signals
  const isLegacyMissingSignals =
    flags.enableVc121MigrationGrace &&
    user.isLegacyVc121User === true &&
    !primaryDeviceKey;
  if (isLegacyMissingSignals) {
    return {
      status: "ELIGIBLE_FREE",
      allowFreeTrialProvision: true,
      recordDeviceClaim: false,
      recordBirthObservation: Boolean(signals.birthCoreHmac),
      observedRiskFlags,
      reasons: [...reasons, "LEGACY_VC121_USER"],
      primaryDeviceKey: null,
      mode: flags.mode,
    };
  }

  // Check if device has already claimed a free trial under another UID
  if (existingDeviceClaim && existingDeviceClaim.firstUid !== user.uid) {
    reasons.push("DEVICE_CLAIM_EXISTS_OTHER_UID");
    observedRiskFlags.push("DEVICE_MULTI_ACCOUNT_FREE_CLAIM");

    if (flags.enforceDeviceFreeClaim) {
      return {
        status: "DEVICE_FREE_TRIAL_USED",
        allowFreeTrialProvision: false,
        recordDeviceClaim: false,
        recordBirthObservation: Boolean(signals.birthCoreHmac),
        observedRiskFlags,
        reasons,
        primaryDeviceKey,
        mode: flags.mode,
      };
    }

    // Observe mode: record risk flag cleanly, preserve access continuity until Founder flips enforce=true
    reasons.push("MODE_OBSERVE_ONLY");
    return {
      status: "ELIGIBLE_FREE",
      allowFreeTrialProvision: true,
      recordDeviceClaim: false,
      recordBirthObservation: Boolean(signals.birthCoreHmac),
      observedRiskFlags,
      reasons,
      primaryDeviceKey,
      mode: flags.mode,
    };
  }

  // Device signals missing on native Android
  if (!primaryDeviceKey && signals.platform === "android") {
    reasons.push("MISSING_DEVICE_SIGNALS");
    observedRiskFlags.push("MISSING_DEVICE_SIGNALS");
    if (flags.enforceDeviceFreeClaim && !flags.allowSignalUnavailableFallback) {
      return {
        status: "SIGNAL_UNAVAILABLE",
        allowFreeTrialProvision: false,
        recordDeviceClaim: false,
        recordBirthObservation: Boolean(signals.birthCoreHmac),
        observedRiskFlags,
        reasons,
        primaryDeviceKey: null,
        mode: flags.mode,
      };
    }
    return {
      status: "ELIGIBLE_FREE",
      allowFreeTrialProvision: true,
      recordDeviceClaim: false,
      recordBirthObservation: Boolean(signals.birthCoreHmac),
      observedRiskFlags,
      reasons: [...reasons, ...(flags.mode === "observe" ? (["MODE_OBSERVE_ONLY"] as const) : [])],
      primaryDeviceKey: null,
      mode: flags.mode,
    };
  }

  // First clean claim on this device
  reasons.push("FIRST_DEVICE_CLAIM");
  if (flags.mode === "observe" && !reasons.includes("MODE_OBSERVE_ONLY")) {
    reasons.push("MODE_OBSERVE_ONLY");
  }
  return {
    status: birthDuplicateDetected && flags.mode === "enforce" ? "SUSPECTED_DUPLICATE" : "ELIGIBLE_FREE",
    allowFreeTrialProvision: true,
    recordDeviceClaim: Boolean(primaryDeviceKey),
    recordBirthObservation: Boolean(signals.birthCoreHmac),
    observedRiskFlags,
    reasons,
    primaryDeviceKey,
    mode: flags.mode,
  };
}
