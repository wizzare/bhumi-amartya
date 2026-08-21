import { UserProfile } from "../repositories/userRepository";
import { isPrivilegedUser } from "../auth/privilegedUser";
import { isGaiaAccessOverrideActive } from "./gaiaAccess";
import {
  ALFA_ACCESS_UNTIL,
  ALFA_GRANT_STARTS_AT,
  INTI_ACCESS_UNTIL,
  INTI_GRANT_STARTS_AT,
  type FounderTesterRecord,
} from "./founderTesterSourceOfTruth";

export type EntitlementStatus = {
  isPremium: boolean;
  reason: "founder" | "inti_badge" | "alfa_badge" | "trial" | "subscriber" | "override" | "none";
  expiresAt: Date | null;
  daysRemaining: number | null;
  effectiveTier: string;
  source: string;
  status: string;
  trialLoginsRemaining?: string | null;
};

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null) {
    if ("toDate" in value && typeof (value as any).toDate === "function") {
      return (value as any).toDate();
    }
    if ("seconds" in value && typeof (value as any).seconds === "number") {
      return new Date((value as any).seconds * 1000);
    }
  }
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

type CanonicalTrialWindow =
  | { state: "missing"; start: null; end: null }
  | { state: "invalid"; start: Date | null; end: Date | null }
  | { state: "valid"; start: Date; end: Date };

export function getCanonicalTrialWindow(profile: UserProfile): CanonicalTrialWindow {
  const rawStart = profile.trialStartedAt;
  const rawEnd = profile.trialEndsAt;
  if (!rawStart && !rawEnd) return { state: "missing", start: null, end: null };

  const start = toDate(rawStart);
  const end = toDate(rawEnd);
  const source = String((profile as any).entitlementSource || "");
  const accessSource = String((profile as any).accessSource || "");
  const trustedSource = source === "firebase_auth_creation_time"
    || accessSource === "firebase_auth_on_create"
    || (profile.membershipType === "TRIAL" && profile.plan === "free_trial");
  const exactWindow = Boolean(start && end && end.getTime() - start.getTime() === SEVEN_DAYS_MS);

  if (!trustedSource || !start || !end || !exactWindow) return { state: "invalid", start, end };
  return { state: "valid", start, end };
}

/**
 * Single entitlement source for Build 78.
 * Precedence:
 * 1. Founder / Lifetime
 * 2. Active Explicit Inti / Alfa / Tester Grant
 * 3. Active Paid Premium
 * 4. Active Time-Based 7-Day Free Trial
 * 5. Free
 */
export function getEntitlementStatus(
  profile: UserProfile | null,
  now = new Date(),
  testerRecord: FounderTesterRecord | null = null,
): EntitlementStatus {
  if (!profile) {
    return {
      isPremium: false,
      reason: "none",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Free",
      source: "-",
      status: "No Data",
      trialLoginsRemaining: null,
    };
  }

  // 0. Gaia Access Override (Historical/Dev)
  if (isGaiaAccessOverrideActive(now)) {
    return {
      isPremium: true,
      reason: "override",
      expiresAt: new Date("2026-07-01T00:00:00Z"),
      daysRemaining: 0,
      effectiveTier: "Gaia Override",
      source: "System Override",
      status: "Active",
      trialLoginsRemaining: null,
    };
  }

  const activeEntitlements: EntitlementStatus[] = [];
  const expiredEntitlements: EntitlementStatus[] = [];

  // 1. Founder (Rule Priority 1) - Lifetime bypass
  const badge = profile.testerBadge || (profile as any).badge || (profile as any).guardianBadge;
  const effectiveBadge = testerRecord?.badge || badge;
  
  if (isPrivilegedUser(profile) || profile.membershipType === "LIFETIME" || effectiveBadge === "Founder") {
    activeEntitlements.push({
      isPremium: true,
      reason: "founder",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Founder (Lifetime)",
      source: "Founder Privileged",
      status: "Active",
      trialLoginsRemaining: null,
    });
  }

  // 2. Badge & Tester Grant (Rule Priority 2)
  if (effectiveBadge === "Penjaga Bhumi Inti" || effectiveBadge === "Penjaga Bhumi Alfa") {
    const isInti = effectiveBadge === "Penjaga Bhumi Inti";
    const startStr = isInti ? INTI_GRANT_STARTS_AT : ALFA_GRANT_STARTS_AT;
    const canonicalUntilStr = isInti ? INTI_ACCESS_UNTIL : ALFA_ACCESS_UNTIL;
    const profileUntilStr = profile.accessUntil ? String(profile.accessUntil) : null;
    const untilStr =
      profileUntilStr && new Date(profileUntilStr) > new Date(canonicalUntilStr)
        ? profileUntilStr
        : canonicalUntilStr;
    const startDate = new Date(startStr);
    const untilDate = new Date(untilStr);

    if (now >= startDate && now < untilDate) {
      activeEntitlements.push({
        isPremium: true,
        reason: isInti ? "inti_badge" : "alfa_badge",
        expiresAt: untilDate,
        daysRemaining: Math.max(0, Math.ceil((untilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))),
        effectiveTier: isInti ? "Penjaga Bhumi Inti" : "Penjaga Bhumi Alfa",
        source: "Explicit Grant",
        status: "Active",
        trialLoginsRemaining: null,
      });
    } else if (now >= untilDate) {
      expiredEntitlements.push({
        isPremium: false,
        reason: "none",
        expiresAt: untilDate,
        daysRemaining: 0,
        effectiveTier: isInti ? "Penjaga Bhumi Inti (Expired)" : "Penjaga Bhumi Alfa (Expired)",
        source: "Explicit Grant",
        status: "Expired",
        trialLoginsRemaining: null,
      });
    }
  }
  if (effectiveBadge === "Penjaga Bhumi" && testerRecord) {
    activeEntitlements.push({
      isPremium: true,
      reason: "subscriber",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Penjaga Bhumi",
      source: "Explicit Grant",
      status: "Active",
      trialLoginsRemaining: null,
    });
  }

  // 3. Paid Subscriber (Rule Priority 3) - Authoritative Google Play status
  const verifiedPaid = (profile as any).entitlementSource === "google_play" && profile.membershipType === "PREMIUM";
  let expiredSubscriberAt: Date | null = null;
  if (verifiedPaid) {
    const expiry = toDate(profile.membershipExpiryDate) || toDate(profile.accessUntil);
    if (!expiry || now < expiry) {
      activeEntitlements.push({
        isPremium: true,
        reason: "subscriber",
        expiresAt: expiry,
        daysRemaining: expiry ? Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null,
        effectiveTier: profile.effectiveTier || "Paid Premium",
        source: "Google Play Billing",
        status: "Active",
        trialLoginsRemaining: null,
      });
    } else {
      expiredSubscriberAt = expiry;
      expiredEntitlements.push({
        isPremium: false,
        reason: "none",
        expiresAt: expiry,
        daysRemaining: 0,
        effectiveTier: "Paid Premium (Expired)",
        source: "Google Play Billing",
        status: "Expired",
        trialLoginsRemaining: null,
      });
    }
  }

  // 4. Time-Based 7-Day Free Trial (Rule Priority 4)
  const trialWindow = getCanonicalTrialWindow(profile);
  const trialStart = trialWindow.start;
  const trialEnd = trialWindow.end;
  let invalidTrialState: EntitlementStatus | null = null;

  if (trialWindow.state === "missing") {
    invalidTrialState = {
      isPremium: false,
      reason: "none",
      expiresAt: null,
      daysRemaining: 0,
      effectiveTier: "Free",
      source: "Free Account",
      status: "Missing Setup Timestamp",
      trialLoginsRemaining: null,
    };
  } else if (trialWindow.state === "invalid") {
    invalidTrialState = {
      isPremium: false,
      reason: "none",
      expiresAt: null,
      daysRemaining: 0,
      effectiveTier: "Free",
      source: "Free Account",
      status: "Invalid Trial Setup",
      trialLoginsRemaining: null,
    };
  } else if (trialEnd && now < trialEnd) {
    const msLeft = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    activeEntitlements.push({
      isPremium: true,
      reason: "trial",
      expiresAt: trialEnd,
      daysRemaining,
      effectiveTier: "Trial",
      source: "7-Day Trial",
      status: "Active",
      trialLoginsRemaining: `Sisa Trial: ${daysRemaining} Hari`,
    });
  } else if (trialEnd && now >= trialEnd) {
    expiredEntitlements.push({
      isPremium: false,
      reason: "none",
      expiresAt: trialEnd,
      daysRemaining: 0,
      effectiveTier: "Free (Trial Exhausted)",
      source: "Free Account",
      status: "Trial Exhausted",
      trialLoginsRemaining: "Sisa Trial: 0 Hari",
    });
  }

  // --- MULTI-SOURCE ENTITLEMENT UNIONING ---
  if (activeEntitlements.length > 0) {
    // If any active entitlement is lifetime (expiresAt === null), it wins entirely.
    const lifetime = activeEntitlements.find(e => e.expiresAt === null);
    if (lifetime) return lifetime;

    // Otherwise, find the one with the LATEST expiry date.
    let latestExpiryEntitlement = activeEntitlements[0];
    for (const entitlement of activeEntitlements) {
      if (entitlement.expiresAt && latestExpiryEntitlement.expiresAt && entitlement.expiresAt > latestExpiryEntitlement.expiresAt) {
        latestExpiryEntitlement = entitlement;
      }
    }

    // Preserve the highest precedence tier/reason, but apply the latest expiry.
    // Precedence: founder > inti_badge/alfa_badge > subscriber > trial
    const reasonPrecedence = { "founder": 1, "inti_badge": 2, "alfa_badge": 2, "subscriber": 3, "trial": 4, "override": 5, "none": 6 };
    let highestTierEntitlement = activeEntitlements[0];
    for (const entitlement of activeEntitlements) {
      if (reasonPrecedence[entitlement.reason] < reasonPrecedence[highestTierEntitlement.reason]) {
        highestTierEntitlement = entitlement;
      }
    }

    const effectiveDaysRemaining = latestExpiryEntitlement.expiresAt
      ? Math.max(0, Math.ceil((latestExpiryEntitlement.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      ...highestTierEntitlement,
      expiresAt: latestExpiryEntitlement.expiresAt,
      daysRemaining: effectiveDaysRemaining,
      trialLoginsRemaining:
        highestTierEntitlement.reason === "trial" ? `Sisa Trial: ${effectiveDaysRemaining} Hari` : null,
    };
  }

  // No active entitlements. Fallback to expired/free states.
  if (expiredSubscriberAt) {
    return expiredEntitlements.find(e => e.source === "Google Play Billing")!;
  }
  
  if (invalidTrialState) {
    return invalidTrialState;
  }

  const isTrialExhausted = Boolean(trialEnd && now >= trialEnd);
  const trialExpiredFallback = expiredEntitlements.find(e => e.source === "Free Account" && e.status === "Trial Exhausted");
  if (trialExpiredFallback) return trialExpiredFallback;

  return {
    isPremium: false,
    reason: "none",
    expiresAt: trialEnd,
    daysRemaining: 0,
    effectiveTier: isTrialExhausted ? "Free (Trial Exhausted)" : "Free",
    source: "Free Account",
    status: isTrialExhausted ? "Trial Exhausted" : "Free Access",
    trialLoginsRemaining: isTrialExhausted ? "Sisa Trial: 0 Hari" : null,
  };
}
