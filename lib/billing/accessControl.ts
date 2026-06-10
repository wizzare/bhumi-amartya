import { getUserRole } from "@/lib/auth/getUserRole";
import { isPenjagaBhumiInti } from "@/lib/billing/membershipGrant";

export type TrialPlan = "trial" | "pro" | "expired";

export type TrialProfile = {
  email?: string | null;
  plan?: TrialPlan | string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  createdAt?: string | null;
  isPro?: boolean | null;
  membershipType?: string | null;
  membershipExpiryDate?: string | null;
};

export type FeatureKey =
  | "journal"
  | "meditation"
  | "audioHealing"
  | "journey"
  | "weeklyReport"
  | "healingMemory";

const TRIAL_DAYS = 7;

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function computeTrialWindow(profile: TrialProfile, now = new Date()) {
  if (profile.membershipType === "PENJAGA_BHUMI_INTI" && profile.membershipExpiryDate) {
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
  const role = getUserRole({ email: profile.email ?? null });
  if (role.isAdmin || role.isDev) return false;

  // Penjaga Bhumi Inti check
  if (profile.membershipType === "PENJAGA_BHUMI_INTI" && profile.membershipExpiryDate) {
    const expiry = toDate(profile.membershipExpiryDate);
    if (expiry && now.getTime() <= expiry.getTime()) return false;
  }

  if (profile.isPro || String(profile.plan).toLowerCase() === "pro") return false;
  if (String(profile.plan).toLowerCase() === "expired") return true;

  const { end } = computeTrialWindow(profile, now);
  return now.getTime() > end.getTime();
}

export function getTrialDaysLeft(profile: TrialProfile, now = new Date()): number {
  const role = getUserRole({ email: profile.email ?? null });
  if (role.isAdmin || role.isDev || profile.isPro || String(profile.plan).toLowerCase() === "pro") return 999;

  if (profile.membershipType === "PENJAGA_BHUMI_INTI" && profile.membershipExpiryDate) {
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
  const role = getUserRole({ email: profile.email ?? null });
  if (role.isAdmin || role.isDev) return true;
  if (profile.isPro || String(profile.plan).toLowerCase() === "pro") return true;
  return !isTrialExpired(profile, now);
}

