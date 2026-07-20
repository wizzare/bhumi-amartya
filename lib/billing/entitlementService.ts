import { UserProfile } from "../repositories/userRepository";
import { isPrivilegedUser } from "../auth/privilegedUser";
import { isGaiaAccessOverrideActive } from "./gaiaAccess";
import { getFounderTesterRecord } from "./founderTesterSourceOfTruth";

export type EntitlementStatus = {
  isPremium: boolean;
  reason: "founder" | "inti_badge" | "alfa_badge" | "trial" | "subscriber" | "override" | "none";
  expiresAt: Date | null;
  daysRemaining: number | null;
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

/**
 * Single entitlement source for Build 78.
 * Precedence:
 * 1. Founder / Lifetime
 * 2. Active Explicit Inti / Alfa / Tester Grant
 * 3. Active Paid Premium
 * 4. Active Internal 7-Successful-Login Trial
 * 5. Free
 */
export function getEntitlementStatus(profile: UserProfile | null, now = new Date()): EntitlementStatus {
  if (!profile) return { isPremium: false, reason: "none", expiresAt: null, daysRemaining: null };

  // 0. Gaia Access Override (Historical/Dev)
  if (isGaiaAccessOverrideActive(now)) {
    return { isPremium: true, reason: "override", expiresAt: new Date("2026-07-01T00:00:00Z"), daysRemaining: 0 };
  }

  // 1. Founder (Rule Priority 1) - Lifetime bypass
  if (isPrivilegedUser(profile) || profile.membershipType === "LIFETIME") {
    return { isPremium: true, reason: "founder", expiresAt: null, daysRemaining: null };
  }

  // 2. Badge & Tester Grant (Rule Priority 2) - Inti, Alfa, or active Tester SoT record
  const badge = profile.testerBadge || (profile as any).badge || (profile as any).guardianBadge;
  const testerRecord = getFounderTesterRecord({
    uid: profile.uid,
    email: profile.email,
    fullName: profile.fullName,
    displayName: profile.displayName,
  });

  const effectiveBadge = badge || testerRecord?.badge;
  if (effectiveBadge === "Founder") {
    return { isPremium: true, reason: "founder", expiresAt: null, daysRemaining: null };
  }
  if (effectiveBadge === "Penjaga Bhumi Inti" || effectiveBadge === "Penjaga Bhumi Alfa") {
    const isInti = effectiveBadge === "Penjaga Bhumi Inti";
    const startStr = "2026-06-29T00:00:00+07:00";
    const untilStr = profile.accessUntil ? String(profile.accessUntil) : (isInti ? "2026-08-30T00:00:00+07:00" : "2026-07-30T00:00:00+07:00");
    const startDate = new Date(startStr);
    const untilDate = new Date(untilStr);

    if (now >= startDate && now < untilDate) {
      const daysRemaining = Math.max(0, Math.ceil((untilDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return {
        isPremium: true,
        reason: isInti ? "inti_badge" : "alfa_badge",
        expiresAt: untilDate,
        daysRemaining,
      };
    }
    if (now >= untilDate) {
      return {
        isPremium: false,
        reason: "none",
        expiresAt: untilDate,
        daysRemaining: 0,
      };
    }
  }
  if (effectiveBadge === "Penjaga Bhumi" && testerRecord) {
    return { isPremium: true, reason: "subscriber", expiresAt: null, daysRemaining: null };
  }

  // 3. Paid Subscriber (Rule Priority 3) - Authoritative Google Play status
  if (profile.membershipType === "PREMIUM" || profile.isPremium === true) {
    const expiry = toDate(profile.membershipExpiryDate) || toDate(profile.accessUntil);
    if (!expiry || now < expiry) {
      return {
        isPremium: true,
        reason: "subscriber",
        expiresAt: expiry,
        daysRemaining: expiry ? Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : null,
      };
    }
  }

  // 4. Internal Bhumi 7-Successful-Login Trial (Rule Priority 4)
  const loginCount = typeof profile.trialLoginCount === "number" ? profile.trialLoginCount : (profile.setupCompleted ? 1 : 0);
  const isExplicitFree = profile.trialStatus === "free" || String(profile.plan).toLowerCase() === "free" || String(profile.plan).toLowerCase() === "expired";
  if (loginCount <= 7 && !isExplicitFree) {
    return {
      isPremium: true,
      reason: "trial",
      expiresAt: null,
      daysRemaining: Math.max(0, 7 - loginCount),
    };
  }

  // 5. Everyone Else - Free account
  return { isPremium: false, reason: "none", expiresAt: null, daysRemaining: 0 };
}
