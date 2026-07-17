import { isPrivilegedUser } from '@/lib/auth/privilegedUser';
import { UserProfile } from '../repositories/userRepository';
import { Timestamp } from 'firebase/firestore';
import { isGaiaAccessOverrideActive } from '@/lib/billing/gaiaAccess';
import {
  getCurrentBadge,
  hasActiveBadgeAccess,
  isTrialUser,
  type BadgeAccessProfile,
} from '@/lib/billing/billingPreparation';

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

function hasActivePremiumMembership(profile: UserProfile): boolean {
  if (profile.membershipType === 'LIFETIME') return true;
  if (profile.membershipType !== 'PREMIUM') return false;
  if (!profile.membershipExpiryDate) return false;
  return Timestamp.now().seconds < profile.membershipExpiryDate.seconds;
}

export function isTrialActive(profile: UserProfile): boolean {
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) return true;
  if (hasActivePremiumMembership(profile)) return true;
  return isTrialUser(profile as BadgeAccessProfile);
}

export function canAccessPremiumFeature(profile: UserProfile | null, feature: PremiumFeature): boolean {
  if (feature === 'dashboard') return true;
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) return true;
  if (!profile) return false;
  if (hasActivePremiumMembership(profile)) return true;
  return hasActiveBadgeAccess(profile as BadgeAccessProfile);
}

export function getUserAccess(profile: UserProfile | null) {
  if (isGaiaAccessOverrideActive() || isPrivilegedUser(profile)) {
    return {
      plan: profile?.plan ?? 'free',
      isPremium: false,
      isTrialActive: true,
      lockedFeatures: [] as PremiumFeature[],
    };
  }
  if (!profile) {
    return {
      plan: 'free',
      isPremium: false,
      isTrialActive: false,
      lockedFeatures: NON_DASHBOARD_FEATURES,
    };
  }

  const active = isTrialActive(profile);
  const badge = getCurrentBadge(profile as BadgeAccessProfile);
  const isPremium = hasActivePremiumMembership(profile) || badge === 'Founder' || badge === 'Penjaga Bhumi Inti' || badge === 'Penjaga Bhumi Alfa';
  const hasAccess = canAccessPremiumFeature(profile, 'premium-content');

  return {
    plan: profile.plan,
    isPremium,
    isTrialActive: active,
    lockedFeatures: hasAccess ? [] : NON_DASHBOARD_FEATURES
  };
}
