import { Timestamp } from "firebase/firestore";
import { UserProfile, userRepository } from "@/lib/repositories/userRepository";
import { getPenjagaBhumiIntiGrant } from "@/lib/billing/membershipGrant";

export async function processMembershipGrant(profile: UserProfile): Promise<UserProfile> {
  const grant = getPenjagaBhumiIntiGrant(profile.email);

  if (!grant) return profile;

  // Don't downgrade paid users
  if (profile.plan === "pro" || profile.plan === "premium") {
    return profile;
  }

  // Check if already granted and not expired
  if (profile.membershipType === "PENJAGA_BHUMI_INTI") {
    return profile;
  }

  const now = Timestamp.now();
  const expiryDate = new Timestamp(
    now.seconds + grant.durationDays * 24 * 60 * 60,
    now.nanoseconds
  );

  const updatedData: Partial<UserProfile> = {
    membershipType: grant.membershipType,
    plan: "free",
    planLabel: grant.planLabel,
    membershipStartDate: now,
    membershipExpiryDate: expiryDate,
    updatedAt: now,
  };

  await userRepository.upsertUserProfile(profile.uid, updatedData);

  return {
    ...profile,
    ...updatedData,
  } as UserProfile;
}
