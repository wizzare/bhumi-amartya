import type { EntitlementStatus } from "./entitlementService";
import type { FounderTesterRecord } from "./founderTesterSourceOfTruth";

export type BillingPresentationState =
  | "free"
  | "trial_active"
  | "trial_exhausted"
  | "premium_active"
  | "premium_expired";

export type BillingPresentation = {
  state: BillingPresentationState;
  hasAccess: boolean;
  commercialStatus: string;
  communityBadge: string;
  entitlementSource: string;
  isDualDisplay: boolean;
  isLifetime: boolean;
  accessExpiry: Date | null;
  formattedExpiry: string | null;
  daysRemaining: number | null;
};

function formatDateId(date: Date | null): string | null {
  if (!date || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function toDateSafe(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value && typeof (value as any).toDate === "function") {
    return (value as any).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function getBillingPresentation(
  entitlement: EntitlementStatus | null,
  profile?: any,
  testerRecord?: FounderTesterRecord | null,
  now: Date = new Date(),
): BillingPresentation {
  if (!entitlement) {
    return {
      state: "free",
      hasAccess: false,
      commercialStatus: "Gratis / Akses Publik",
      communityBadge: "Penghuni Bhumi",
      entitlementSource: "-",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: null,
      formattedExpiry: null,
      daysRemaining: 0,
    };
  }

  // 1. Resolve community / tester badge
  const rawBadge = (profile as any)?.testerBadge || (profile as any)?.badge || (profile as any)?.guardianBadge;
  const effectiveBadge = testerRecord?.badge || rawBadge || (
    entitlement.reason === "founder" ? "Founder" :
    entitlement.reason === "inti_badge" ? "Penjaga Bhumi Inti" :
    entitlement.reason === "alfa_badge" ? "Penjaga Bhumi Alfa" :
    "Penghuni Bhumi"
  );

  // 2. Resolve paid status directly from profile & entitlement
  const profileExpiry = toDateSafe((profile as any)?.membershipExpiryDate) || toDateSafe((profile as any)?.accessUntil);

  const hasPaidGooglePlay = Boolean(
    ((profile as any)?.entitlementSource === "google_play" &&
     (profile as any)?.membershipType === "PREMIUM" &&
     profileExpiry &&
     profileExpiry.getTime() > now.getTime()) ||
    (entitlement.reason === "subscriber" && entitlement.isPremium)
  );

  const effectiveExpiry = entitlement.expiresAt || (hasPaidGooglePlay ? profileExpiry : null);
  const formattedExpiry = formatDateId(effectiveExpiry);
  const calculatedDays = effectiveExpiry && effectiveExpiry.getTime() > now.getTime()
    ? Math.max(1, Math.ceil((effectiveExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;
  const effectiveDaysRemaining = entitlement.daysRemaining ?? calculatedDays;

  // 3. Founder / Lifetime
  const isFounder = (profile as any)?.role === "founder" || effectiveBadge === "Founder" || entitlement.reason === "founder";
  const isExplicitLifetime = (profile as any)?.membershipType === "LIFETIME" || entitlement.reason === "lifetime" || entitlement.reason === "admin";

  if (isFounder || isExplicitLifetime) {
    return {
      state: "premium_active",
      hasAccess: true,
      commercialStatus: isFounder ? "Founder Lifetime" : "Akses Lifetime",
      communityBadge: isFounder ? "Founder" : effectiveBadge,
      entitlementSource: isFounder ? "Founder" : "Lifetime",
      isDualDisplay: false,
      isLifetime: true,
      accessExpiry: null,
      formattedExpiry: null,
      daysRemaining: null,
    };
  }

  // 4. Dual Display: User has BOTH Paid Google Play subscription AND Tester Grant badge (e.g. Penjaga Bhumi Inti)
  const isTesterBadge = effectiveBadge === "Penjaga Bhumi Inti" || effectiveBadge === "Penjaga Bhumi Alfa";
  if (hasPaidGooglePlay && isTesterBadge) {
    return {
      state: "premium_active",
      hasAccess: true,
      commercialStatus: "Premium Aktif",
      communityBadge: effectiveBadge,
      entitlementSource: "Google Play",
      isDualDisplay: true,
      isLifetime: false,
      accessExpiry: effectiveExpiry,
      formattedExpiry,
      daysRemaining: effectiveDaysRemaining,
    };
  }

  // 5. Standard Paid Subscriber (without special tester badge)
  if (hasPaidGooglePlay || (entitlement.reason === "subscriber" && entitlement.isPremium)) {
    return {
      state: "premium_active",
      hasAccess: true,
      commercialStatus: "Premium Aktif",
      communityBadge: effectiveBadge === "Penghuni Bhumi" ? "Penghuni Bhumi" : effectiveBadge,
      entitlementSource: "Google Play",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: effectiveExpiry,
      formattedExpiry,
      daysRemaining: effectiveDaysRemaining,
    };
  }

  // 6. Tester Grant alone (without paid subscription)
  if (isTesterBadge && entitlement.isPremium) {
    return {
      state: "premium_active",
      hasAccess: true,
      commercialStatus: "Akses Komunitas (Grant)",
      communityBadge: effectiveBadge,
      entitlementSource: "Grant Komunitas",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: effectiveExpiry,
      formattedExpiry,
      daysRemaining: effectiveDaysRemaining,
    };
  }

  // 7. Active 7-Day Trial
  if (entitlement.reason === "trial" && entitlement.isPremium) {
    return {
      state: "trial_active",
      hasAccess: true,
      commercialStatus: "Masa Uji Coba Aktif",
      communityBadge: effectiveBadge,
      entitlementSource: "Uji Coba 7 Hari",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: effectiveExpiry,
      formattedExpiry,
      daysRemaining: effectiveDaysRemaining,
    };
  }

  // 8. Trial Exhausted
  if (entitlement.status === "Trial Exhausted") {
    return {
      state: "trial_exhausted",
      hasAccess: false,
      commercialStatus: "Masa Uji Coba Berakhir",
      communityBadge: effectiveBadge,
      entitlementSource: "-",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: null,
      formattedExpiry: null,
      daysRemaining: 0,
    };
  }

  // 9. Premium Expired
  if (entitlement.status === "Expired") {
    return {
      state: "premium_expired",
      hasAccess: false,
      commercialStatus: "Langganan Berakhir",
      communityBadge: effectiveBadge,
      entitlementSource: (profile as any)?.entitlementSource === "google_play" ? "Google Play" : "-",
      isDualDisplay: false,
      isLifetime: false,
      accessExpiry: effectiveExpiry,
      formattedExpiry,
      daysRemaining: 0,
    };
  }

  // 10. Generic Free
  return {
    state: "free",
    hasAccess: false,
    commercialStatus: "Gratis / Akses Publik",
    communityBadge: effectiveBadge,
    entitlementSource: "-",
    isDualDisplay: false,
    isLifetime: false,
    accessExpiry: null,
    formattedExpiry: null,
    daysRemaining: 0,
  };
}
