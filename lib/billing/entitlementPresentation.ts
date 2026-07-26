import type { EntitlementStatus } from "./entitlementService";

export type BillingPresentationState =
  | "free"
  | "trial_active"
  | "trial_exhausted"
  | "premium_active"
  | "premium_expired";

export type BillingPresentation = {
  state: BillingPresentationState;
  hasAccess: boolean;
};

export function getBillingPresentation(
  entitlement: EntitlementStatus | null,
): BillingPresentation {
  if (!entitlement) return { state: "free", hasAccess: false };

  if (entitlement.reason === "trial") {
    return { state: "trial_active", hasAccess: entitlement.isPremium };
  }

  if (entitlement.isPremium) {
    return { state: "premium_active", hasAccess: true };
  }

  if (entitlement.status === "Trial Exhausted") {
    return { state: "trial_exhausted", hasAccess: false };
  }

  if (entitlement.status === "Expired") {
    return { state: "premium_expired", hasAccess: false };
  }

  return { state: "free", hasAccess: false };
}
