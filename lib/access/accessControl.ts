import { isPrivilegedUser } from '@/lib/auth/privilegedUser';
import { UserProfile } from "../repositories/userRepository";
import { Timestamp } from "firebase/firestore";
import { isGaiaAccessOverrideActive } from "@/lib/billing/gaiaAccess";

export type PremiumFeature = "meditation" | "journaling" | "audio-healing";

function hasActivePremiumMembership(profile: UserProfile): boolean {
  if (profile.membershipType === "LIFETIME") return true;
  if (profile.membershipType !== "PREMIUM") return false;
  if (!profile.membershipExpiryDate) return false;
  return Timestamp.now().seconds < profile.membershipExpiryDate.seconds;
}

export function isTrialActive(profile: UserProfile): boolean {
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) return true;
  if (hasActivePremiumMembership(profile)) return true;
  if (!profile.trialEndsAt) return false;

  const now = Timestamp.now();
  return now.seconds < profile.trialEndsAt.seconds;
}

export function canAccessPremiumFeature(profile: UserProfile | null, feature: PremiumFeature): boolean {
  void feature;
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) return true;
  if (!profile) return false;
  if (hasActivePremiumMembership(profile)) return true;
  
  return isTrialActive(profile);
}

export function getUserAccess(profile: UserProfile | null) {
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) {
    return {
      plan: profile?.plan ?? "free",
      isPremium: false,
      isTrialActive: true,
      lockedFeatures: [] as PremiumFeature[],
    };
  }
  if (!profile) {
    return {
      plan: "free",
      isPremium: false,
      isTrialActive: false,
      lockedFeatures: ["meditation", "journaling", "audio-healing"] as PremiumFeature[]
    };
  }

  const active = isTrialActive(profile);
  const isPremium = hasActivePremiumMembership(profile);

  return {
    plan: profile.plan,
    isPremium,
    isTrialActive: active,
    lockedFeatures: (isPremium || active) ? [] : ["meditation", "journaling", "audio-healing"] as PremiumFeature[]
  };
}


