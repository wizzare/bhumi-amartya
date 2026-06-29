import type { UserProfile } from "@/lib/repositories/userRepository";

export async function processMembershipGrant(profile: UserProfile): Promise<UserProfile> {
  return profile;
}
