export type FounderTesterBadge =
  | "Founder"
  | "Penjaga Bhumi Inti"
  | "Penjaga Bhumi Alfa"
  | "Penjaga Bhumi";

export type FounderTesterMembership =
  | "LIFETIME_PREMIUM"
  | "PREMIUM_2_MONTHS"
  | "PREMIUM_1_MONTH"
  | "REGULAR_TRIAL";

export type ServerOwnedAccessGrant = {
  badge: FounderTesterBadge;
  plan: "lifetime_free" | "free_access" | "free_trial";
  membership: FounderTesterMembership;
  membershipType: "LIFETIME" | "PREMIUM" | "TRIAL";
  accessStart: string | null;
  accessUntil: string | null;
  trialStartedAt?: string;
  trialEndsAt?: string;
  subscriptionStatus: "active" | "trialing" | "expired";
  isPremium: boolean;
  entitlements: {
    dashboard: true;
    premiumFeatures: boolean;
  };
};

export const DEFAULT_USER_POLICY_EFFECTIVE_AT = new Date("2026-07-01T00:00:00+07:00");

export function toPolicyDate(value?: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate();
  }
  if (typeof value === "object" && "seconds" in value && typeof value.seconds === "number") {
    return new Date(value.seconds * 1000);
  }
  return null;
}

export function shouldApplyDefaultRegistrationPolicy(createdAt?: unknown): boolean {
  const createdDate = toPolicyDate(createdAt);
  return Boolean(createdDate && createdDate.getTime() >= DEFAULT_USER_POLICY_EFFECTIVE_AT.getTime());
}

export function buildDefaultNewUserAccessGrant(
  registeredAt: string | Date,
): ServerOwnedAccessGrant {
  const regMs = registeredAt instanceof Date ? registeredAt.getTime() : new Date(`${registeredAt}T00:00:00.000Z`).getTime();
  const startMs = Math.max(regMs, DEFAULT_USER_POLICY_EFFECTIVE_AT.getTime());
  const start = new Date(startMs);
  const end = new Date(startMs + 3 * 24 * 60 * 60 * 1000);
  return {
    badge: "Penjaga Bhumi",
    plan: "free_trial",
    membership: "REGULAR_TRIAL",
    membershipType: "TRIAL",
    accessStart: start.toISOString(),
    accessUntil: end.toISOString(),
    trialStartedAt: start.toISOString(),
    trialEndsAt: end.toISOString(),
    subscriptionStatus: "trialing",
    isPremium: true,
    entitlements: { dashboard: true, premiumFeatures: true },
  };
}
