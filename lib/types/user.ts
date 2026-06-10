import { BlueprintStatus } from './blueprint';

export type UserBlueprintInput = {
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
};

export type UserProfileData = {
  fullName: string | null;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  createdAt: string;
  updatedAt: string;
  language: 'id' | 'en';
  onboardingCompleted: boolean;
  blueprintInput?: UserBlueprintInput;
};

export type UserEmotionalState = {
  currentMood: number | null;
  lastCheckInAt: string | null;
  recurringThemes: string[];
};

export type UserHealingProgress = {
  healingStreak: number;
  totalJournalEntries: number;
  totalMeditationMinutes: number;
  totalInnerworkSessions: number;
  consciousnessLevel: number;
  updatedAt: string;
};

export type UserProfile = {
  uid: string;
  fullName?: string | null;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  birthPlace?: string;
  cityOfBirth?: string;
  birthCountry?: string;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  language?: 'id' | 'en';
  blueprintStatus: BlueprintStatus;
  setupCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  profile: UserProfileData;
  emotionalState: UserEmotionalState;
  healingProgress: UserHealingProgress;
  settings: Record<string, unknown>;
};
