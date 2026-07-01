import {
  buildDefaultNewUserAccessGrant,
  buildServerOwnedAccessGrant,
  DEFAULT_USER_POLICY_EFFECTIVE_AT,
  getFounderTesterRecord,
  type ServerOwnedAccessGrant,
} from "@/lib/billing/founderTesterSourceOfTruth";

export type MembershipType = "REGULAR" | "PENJAGA_BHUMI_INTI";

export type July1AccessGrantInput = {
  uid?: string | null;
  email?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  registeredAt?: string | Date | null;
};

export function getJuly1AccessGrant(input: July1AccessGrantInput): ServerOwnedAccessGrant {
  const record = getFounderTesterRecord(input);
  if (record) {
    return buildServerOwnedAccessGrant(record);
  }

  return buildDefaultNewUserAccessGrant(input.registeredAt ?? DEFAULT_USER_POLICY_EFFECTIVE_AT);
}
