import { buildServerOwnedAccessGrant, getFounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import {
  buildDefaultNewUserAccessGrant,
  DEFAULT_USER_POLICY_EFFECTIVE_AT,
  type ServerOwnedAccessGrant,
} from "@/lib/billing/registrationPolicy";

export type MembershipType = "REGULAR" | "PENJAGA_BHUMI_INTI";

export type July1AccessGrantInput = {
  uid?: string | null;
  email?: string | null;
  fullName?: string | null;
  displayName?: string | null;
  registeredAt?: string | Date | null;
};

export async function getJuly1AccessGrant(input: July1AccessGrantInput): Promise<ServerOwnedAccessGrant> {
  const record = await getFounderTesterRecord(input.uid);
  if (record) {
    return buildServerOwnedAccessGrant(record);
  }

  return buildDefaultNewUserAccessGrant(input.registeredAt ?? DEFAULT_USER_POLICY_EFFECTIVE_AT);
}
