export const BUILD106_ADMIN_IDENTITY_SLOTS = [
  "ADMIN_1",
  "ADMIN_2",
  "ADMIN_3",
  "ADMIN_4",
] as const;

export type Build106AdminIdentitySlot = typeof BUILD106_ADMIN_IDENTITY_SLOTS[number];

export const ADMIN_LIFETIME_ENTITLEMENT_SOURCE = "admin_lifetime" as const;

export type AdminLifetimeProfilePatch = {
  role: "admin";
  membershipType: "LIFETIME";
  membershipExpiryDate: null;
  entitlementSource: typeof ADMIN_LIFETIME_ENTITLEMENT_SOURCE;
};

/**
 * Existing server-owned users/{uid} fields only. Deliberately excludes email,
 * display name, isPremium, subscription data, and purchase-token state.
 */
export function buildAdminLifetimeProfilePatch(): AdminLifetimeProfilePatch {
  return {
    role: "admin",
    membershipType: "LIFETIME",
    membershipExpiryDate: null,
    entitlementSource: ADMIN_LIFETIME_ENTITLEMENT_SOURCE,
  };
}

export function validateAdminUidAssignments(
  assignments: Record<Build106AdminIdentitySlot, string>,
): Record<Build106AdminIdentitySlot, string> {
  const normalized = Object.fromEntries(
    BUILD106_ADMIN_IDENTITY_SLOTS.map((slot) => [slot, assignments[slot]?.trim() ?? ""]),
  ) as Record<Build106AdminIdentitySlot, string>;

  const uids = Object.values(normalized);
  if (uids.some((uid) => !uid)) {
    throw new Error("All four historical admin UID assignments are required.");
  }
  if (new Set(uids).size !== BUILD106_ADMIN_IDENTITY_SLOTS.length) {
    throw new Error("Historical admin UID assignments must be unique.");
  }
  return normalized;
}
