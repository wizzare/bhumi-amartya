import { isGaiaAccessOverrideActive } from "@/lib/billing/gaiaAccess";
import {
  getCurrentBadge,
  hasActiveBadgeAccess,
  isExpiredUser,
  isTrialUser,
  type BadgeAccessProfile,
} from "@/lib/billing/billingPreparation";

// ============================================================================
// CANONICAL ENTITLEMENT ARCHITECTURE RULE (Build 99+, enforced 2026-08-20)
// ============================================================================
// There MUST be exactly ONE source of truth for premium-access decisions in
// the app: lib/billing/entitlementService.ts#getEntitlementStatus(profile,
// now, testerRecord). It implements multi-source union semantics
// (Founder > Tester > Paid > Trial > Free).
//
// This file (lib/billing/accessControl.ts) is a THIN DERIVATIVE for cases
// where a page only needs a boolean gate (e.g. localFeatureAccess checks).
// It MUST stay in sync with the canonical resolver. If you change union
// semantics, change it in BOTH files.
//
// Rules:
//   1. hasFeatureAccess MUST be called with a `testerRecord` parameter
//      whenever the user has a uid. Pages fetch it via getFounderTesterRecord.
//   2. Adding new FeatureKey values: add to FeatureKey AND add to the test
//      suite (tests/unit/billing-entitlement-contract.test.ts) at the same
//      time.
//   3. NEVER add a new entitlement reader. If you need a new gate, route it
//      through getEntitlementStatus and read its `isPremium` field.
//
// See: WIDYA_CASE_AUDIT_FINDINGS_2026_08_20.md (root cause #2)
//      Build 99/100 regression guard in billing-entitlement-contract.test.ts
// ============================================================================

export type TrialPlan = "trial" | "pro" | "expired";

export type TrialProfile = {
  email?: string | null;
  badge?: string | null;
  testerBadge?: string | null;
  plan?: TrialPlan | string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  accessUntil?: unknown;
  membership?: string | null;
  createdAt?: string | null;
  isPro?: boolean | null;
  membershipType?: string | null;
  membershipExpiryDate?: unknown;
};

export type FeatureKey =
  | "journal"
  | "meditation"
  | "audioHealing"
  | "journey"
  | "weeklyReport"
  | "healingMemory"
  | "wellness"
  | "yoga"
  | "workout"
  | "healthyFood"
  | "herbal"
  | "manifestasi"
  | "refleksiJiwa"
  | "catatanHariIni"
  | "premiumContent"
  | "dashboard";

const TRIAL_DAYS = 7;

function toDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value !== "string" && typeof value !== "number") return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasActivePremiumMembership(profile: TrialProfile, now = new Date()): boolean {
  if (profile.membershipType === "LIFETIME") return true;
  if (profile.membershipType !== "PREMIUM") return false;
  const expiry = toDate(profile.membershipExpiryDate);
  return Boolean(expiry && now.getTime() <= expiry.getTime());
}

export function computeTrialWindow(profile: TrialProfile, now = new Date()) {
  const accessUntil = toDate(profile.accessUntil);
  if (accessUntil) {
    const start = toDate(profile.trialStartedAt) || toDate(profile.createdAt) || now;
    return { start, end: accessUntil };
  }

  if (profile.membershipType === "PREMIUM" && profile.membershipExpiryDate) {
    const start = toDate(profile.createdAt) || now;
    const end = toDate(profile.membershipExpiryDate) || now;
  return { start, end };
  }

  const start =
    toDate(profile.trialStartedAt)
    || toDate(profile.createdAt)
    || now;
  const end = toDate(profile.trialEndsAt) || new Date(start.getTime() + TRIAL_DAYS * 86_400_000);
  return { start, end };
}

export function isTrialExpired(
  profile: TrialProfile,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  if (isGaiaAccessOverrideActive(now)) return false;
  if (hasActivePremiumMembership(profile, now)) return false;
  if (String(profile.plan).toLowerCase() === "expired") return true;
  return isExpiredUser(profile as BadgeAccessProfile, now, testerRecord);
}

function hasLifetimeOrActiveAccess(
  profile: TrialProfile,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  if (isExpiredUser(profile as BadgeAccessProfile, now, testerRecord)) return false;
  if (hasActivePremiumMembership(profile, now)) return true;
  return hasActiveBadgeAccess(profile as BadgeAccessProfile, now, testerRecord);
}

export function getTrialDaysLeft(
  profile: TrialProfile,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): number {
  if (isGaiaAccessOverrideActive(now)) return 999;
  if (hasActivePremiumMembership(profile, now)) return 999;
  if (getCurrentBadge(profile as BadgeAccessProfile, testerRecord) === "Founder") return 999;
  if (!isTrialUser(profile as BadgeAccessProfile, now, testerRecord)) return 0;

  const { end } = computeTrialWindow(profile, now);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function hasFeatureAccess(
  profile: TrialProfile,
  feature: FeatureKey,
  now = new Date(),
  testerRecord?: { badge?: string | null } | null,
): boolean {
  if (feature === "dashboard") return true;
  if (isGaiaAccessOverrideActive(now)) return true;
  return hasLifetimeOrActiveAccess(profile, now, testerRecord);
}
