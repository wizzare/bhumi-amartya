import { UserProfile } from "../repositories/userRepository";
import { Timestamp } from "firebase/firestore";
import { getUserRole } from "@/lib/auth/getUserRole";

export type PremiumFeature = "meditation" | "journaling" | "audio-healing";

export function isTrialActive(profile: UserProfile): boolean {
  const role = getUserRole({ email: profile.email ?? null });
  if (role.isAdmin || role.isDev) return true;
  if (profile.plan === "developer" || profile.plan === "premium" || (profile.plan as unknown) === "pro") return true;
  if (!profile.trialEndsAt) return false;

  const now = Timestamp.now();
  return now.seconds < profile.trialEndsAt.seconds;
}

export function canAccessPremiumFeature(profile: UserProfile | null, feature: PremiumFeature): boolean {
  if (!profile) return false;
  const role = getUserRole({ email: profile.email ?? null });
  if (role.isAdmin || role.isDev) return true;
  if (profile.plan === "developer" || profile.plan === "premium" || (profile.plan as unknown) === "pro") return true;
  
  return isTrialActive(profile);
}

export function getUserAccess(profile: UserProfile | null) {
  if (!profile) {
    return {
      plan: "free",
      isPremium: false,
      isTrialActive: false,
      lockedFeatures: ["meditation", "journaling", "audio-healing"] as PremiumFeature[]
    };
  }

  const active = isTrialActive(profile);
  const isPremium = profile.plan === "premium" || profile.plan === "developer";

  return {
    plan: profile.plan,
    isPremium,
    isTrialActive: active,
    lockedFeatures: (isPremium || active) ? [] : ["meditation", "journaling", "audio-healing"] as PremiumFeature[]
  };
}
