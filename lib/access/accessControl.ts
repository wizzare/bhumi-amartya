import { UserProfile } from '../repositories/userRepository';
import { getEntitlementStatus } from '../billing/entitlementService';

export type PremiumFeature =
  | 'meditation'
  | 'journaling'
  | 'audio-healing'
  | 'journey'
  | 'wellness'
  | 'yoga'
  | 'workout'
  | 'healthy-food'
  | 'herbal'
  | 'manifestasi'
  | 'refleksi-jiwa'
  | 'catatan-hari-ini'
  | 'ai-memory'
  | 'premium-content'
  | 'profile'
  | 'dashboard';

const NON_DASHBOARD_FEATURES: PremiumFeature[] = [
  'meditation',
  'journaling',
  'audio-healing',
  'journey',
  'wellness',
  'yoga',
  'workout',
  'healthy-food',
  'herbal',
  'manifestasi',
  'refleksi-jiwa',
  'catatan-hari-ini',
  'ai-memory',
  'premium-content',
  'profile',
];

export function isTrialActive(profile: UserProfile): boolean {
  return getEntitlementStatus(profile).reason === 'trial';
}

export function canAccessPremiumFeature(profile: UserProfile | null, feature: PremiumFeature): boolean {
  if (feature === 'dashboard') return true;
  return getEntitlementStatus(profile).isPremium;
}

export function getUserAccess(profile: UserProfile | null) {
  const entitlement = getEntitlementStatus(profile);
  if (!profile) {
    return {
      plan: 'free',
      isPremium: false,
      isTrialActive: false,
      lockedFeatures: NON_DASHBOARD_FEATURES,
    };
  }

  return {
    plan: profile.plan,
    isPremium: entitlement.isPremium,
    isTrialActive: entitlement.reason === 'trial',
    lockedFeatures: entitlement.isPremium ? [] : NON_DASHBOARD_FEATURES
  };
}
