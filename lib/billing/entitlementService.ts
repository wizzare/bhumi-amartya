import { UserProfile } from "../repositories/userRepository";
import { isPrivilegedUser } from "../auth/privilegedUser";
import { isGaiaAccessOverrideActive } from "./gaiaAccess";
import type { FounderTesterRecord } from "./founderTesterSourceOfTruth";

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

  // 1. Founder (Rule Priority 1) - Lifetime bypass
  if (isPrivilegedUser(profile) || profile.membershipType === "LIFETIME") {
    return {
      isPremium: true,
      reason: "founder",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Founder (Lifetime)",
      source: "Founder Privileged",
      status: "Active",
      trialLoginsRemaining: null,
    };
  }

  // 2. Badge & Tester Grant (Rule Priority 2) - Inti, Alfa, or active Tester Registry record
  // testerRecord must be fetched by the caller (async Firestore lookup keyed by uid)
  // and passed in here; this function stays synchronous.
  const badge = profile.testerBadge || (profile as any).badge || (profile as any).guardianBadge;

  const effectiveBadge = testerRecord?.badge || badge;
  if (effectiveBadge === "Founder") {
    return {
      isPremium: true,
      reason: "founder",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Founder (Lifetime)",
      source: "Founder Privileged",
      status: "Active",
      trialLoginsRemaining: null,
    };
  }
  if (effectiveBadge === "Penjaga Bhumi Inti" || effectiveBadge === "Penjaga Bhumi Alfa") {
    const isInti = effectiveBadge === "Penjaga Bhumi Inti";
    const startStr = "2026-06-29T00:00:00+07:00";
    const untilStr = profile.accessUntil ? String(profile.accessUntil) : (isInti ? "2026-08-30T00:00:00+07:00" : "2026-07-30T00:00:00+07:00");
    const startDate = new Date(startStr);
    const untilDate = new Date(untilStr);

    let status = "Active";
    if (now < startDate) status = "Scheduled";
    else if (now >= untilDate) status = "Expired";

    if (now >= startDate && now < untilDate) {
      const daysRemaining = Math.max(0, Math.ceil((untilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        isPremium: true,
        reason: isInti ? "inti_badge" : "alfa_badge",
        expiresAt: untilDate,
        daysRemaining,
        effectiveTier: isInti ? "Penjaga Bhumi Inti" : "Penjaga Bhumi Alfa",
        source: "Explicit Grant",
        status,
        trialLoginsRemaining: null,
      };
    }
    if (now >= untilDate) {
      return {
        isPremium: false,
        reason: "none",
        expiresAt: untilDate,
        daysRemaining: 0,
        effectiveTier: isInti ? "Penjaga Bhumi Inti (Expired)" : "Penjaga Bhumi Alfa (Expired)",
        source: "Explicit Grant",
        status: "Expired",
        trialLoginsRemaining: null,
      };
    }
    // NOTE: if now < startDate (grant scheduled but not yet started), execution
    // intentionally falls through to Priority 3/4 below. See merge review notes
    // for build82-integration: this is a pre-existing structural gap, currently
    // unreachable since INTI_GRANT_STARTS_AT/ALFA_GRANT_STARTS_AT are both fixed
    // in the past. Flagged as a follow-up hardening item, not fixed here.
  }
  if (effectiveBadge === "Penjaga Bhumi" && testerRecord) {
    return {
      isPremium: true,
      reason: "subscriber",
      expiresAt: null,
      daysRemaining: null,
      effectiveTier: "Penjaga Bhumi",
      source: "Explicit Grant",
      status: "Active",
      trialLoginsRemaining: null,
    };
  }

  // 3. Paid Subscriber (Rule Priority 3) - Authoritative Google Play status
  let expiredSubscriberAt: Date | null = null;
  const verifiedPaid = (profile as any).entitlementSource === "google_play" && profile.membershipType === "PREMIUM";
  if (verifiedPaid) {
    const expiry = toDate(profile.membershipExpiryDate) || toDate(profile.accessUntil);
    if (!expiry || now < expiry) {
      return {
        isPremium: true,
        reason: "subscriber",
        expiresAt: expiry,
        daysRemaining: expiry ? Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null,
        effectiveTier: profile.effectiveTier || "Paid Premium",
        source: "Google Play Billing",
        status: "Active",
        trialLoginsRemaining: null,
      };
    }
    expiredSubscriberAt = expiry;
  }

  // 4. Time-Based 7-Day Free Trial (Rule Priority 4)
  const trialWindow = getCanonicalTrialWindow(profile);
  const trialStart = trialWindow.start;
  const trialEnd = trialWindow.end;

  // Canonical server-issued trial timestamps outrank all legacy plan/status
  // labels. Expiry is determined only by the immutable canonical end time.

  // If no setup timestamp exists at all (trialStart is null and trialEnd is null), return explicit safe non-premium status
  if (trialWindow.state === "missing") {
    if (expiredSubscriberAt) {
      return {
        isPremium: false,
        reason: "none",
        expiresAt: expiredSubscriberAt,
        daysRemaining: 0,
        effectiveTier: "Paid Premium (Expired)",
        source: "Google Play Billing",
        status: "Expired",
        trialLoginsRemaining: null,
      };
    }
    return {
      isPremium: false,
      reason: "none",
      expiresAt: null,
      daysRemaining: 0,
      effectiveTier: "Free",
      source: "Free Account",
      status: "Missing Setup Timestamp",
      trialLoginsRemaining: null,
    };
  }

  if (trialWindow.state === "invalid") {
    if (expiredSubscriberAt) {
      return {
        isPremium: false,
        reason: "none",
        expiresAt: expiredSubscriberAt,
        daysRemaining: 0,
        effectiveTier: "Paid Premium (Expired)",
        source: "Google Play Billing",
        status: "Expired",
        trialLoginsRemaining: null,
      };
    }
    return {
      isPremium: false,
      reason: "none",
      expiresAt: null,
      daysRemaining: 0,
      effectiveTier: "Free",
      source: "Free Account",
      status: "Invalid Trial Setup",
      trialLoginsRemaining: null,
    };
  }

  if (trialEnd && now < trialEnd) {
    const msLeft = trialEnd.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    return {
      isPremium: true,
      reason: "trial",
      expiresAt: trialEnd,
      daysRemaining,
      effectiveTier: "Trial",
      source: "7-Day Trial",
      status: "Active",
      trialLoginsRemaining: `Sisa Trial: ${daysRemaining} Hari`,
    };
  }

  if (expiredSubscriberAt) {
    return {
      isPremium: false,
      reason: "none",
      expiresAt: expiredSubscriberAt,
      daysRemaining: 0,
      effectiveTier: "Paid Premium (Expired)",
      source: "Google Play Billing",
      status: "Expired",
      trialLoginsRemaining: null,
    };
  }

  // 5. Everyone Else - Free account
  const isTrialExhausted = Boolean(trialEnd && now >= trialEnd);
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
