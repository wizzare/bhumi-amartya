import { isGaiaAccessOverrideActive } from "@/lib/billing/gaiaAccess";
import { GOOGLE_PLAY_BILLING_ENABLED } from "@/lib/billing/googlePlayBilling";

export type TrialPlan = "trial" | "pro" | "expired";

export type TrialProfile = {
  email?: string | null;
  plan?: TrialPlan | string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
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
  | "healingMemory";

const TRIAL_DAYS = 3;

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

export function isTrialExpired(profile: TrialProfile, now = new Date()): boolean {
  if (!GOOGLE_PLAY_BILLING_ENABLED) return false;
  if (isGaiaAccessOverrideActive(now)) return false;
  if (hasActivePremiumMembership(profile, now)) return false;
  if (String(profile.plan).toLowerCase() === "expired") return true;

  const { end } = computeTrialWindow(profile, now);
  return now.getTime() > end.getTime();
}

export function getTrialDaysLeft(profile: TrialProfile, now = new Date()): number {
  if (!GOOGLE_PLAY_BILLING_ENABLED) return 999;
  if (isGaiaAccessOverrideActive(now)) return 999;
  if (hasActivePremiumMembership(profile, now)) return 999;

  if (profile.membershipType === "PREMIUM" && profile.membershipExpiryDate) {
    const expiry = toDate(profile.membershipExpiryDate);
    if (expiry) {
      const diff = expiry.getTime() - now.getTime();
      return Math.max(0, Math.ceil(diff / 86_400_000));
    }
  }

  const { end } = computeTrialWindow(profile, now);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export function hasFeatureAccess(profile: TrialProfile, feature: FeatureKey, now = new Date()): boolean {
  void feature;
  if (!GOOGLE_PLAY_BILLING_ENABLED) return true;
  if (isGaiaAccessOverrideActive(now)) return true;
  if (hasActivePremiumMembership(profile, now)) return true;
  return !isTrialExpired(profile, now);
}
