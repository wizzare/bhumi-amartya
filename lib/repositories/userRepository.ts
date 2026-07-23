import { db } from "../firebase/firebase";
import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { BlueprintStatus } from "@/lib/types/blueprint";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";
import { BuildInfo, getRuntimeBuildInfo, hasBuildInfoChanged } from "@/lib/config/buildInfo";
import type { GaiaProfile } from "@/lib/profile/gaia/types";

export type BaselineWellnessProfile = {
  bodyScore: number;
  emotionScore: number;
  mindScore: number;
  relationshipScore: number;
  meaningScore: number;
  regulationScore: number;
  navigatorMode: "RECOVERY" | "REFLECTION" | "GROWTH";
  strongestDomain: string;
  growthDomain: string;
  attentionDomain: string;
  completedAt: string;
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  version: string;
};

export type UserProfile = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  fullName?: string;
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  birthPlace?: string;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  language?: "id" | "en";
  onboardingCompleted: boolean;
  baselineWellnessCompleted: boolean;
  baselineWellnessProfile?: BaselineWellnessProfile;
  blueprintStatus: BlueprintStatus;
  setupCompleted: boolean;
  plan?: "trial" | "pro" | "expired" | "free" | "premium" | "developer" | "lifetime_free" | "free_access" | "free_trial";
  planLabel?: string | null;
  membershipStartDate?: Timestamp | null;
  accessStart?: Timestamp | string | null;
  accessUntil?: Timestamp | string | null;
  trialStartedAt?: Timestamp;
  trialEndsAt?: Timestamp;
  trialLoginCount?: number;
  trialStatus?: "active" | "free" | string;
  lastSuccessfulLoginAt?: Timestamp | string | null;
  trialCompletedAt?: Timestamp | string | null;
  isPremium?: boolean;
  isDeveloper?: boolean;
  isFoundingMember?: boolean;
  effectiveTier?: string;
  testerBadge?: "Founder" | "Penjaga Bhumi Inti" | "Penjaga Bhumi Alfa" | "Penjaga Bhumi";
  guardianRole?: "founder" | "admin" | "user";
  guardianBadge?: "core_guardian" | "guardian";
  recognitionTier?: "FOUNDER" | "CORE_GUARDIAN" | "CORE_GUARDIAN_CANDIDATE" | "GUARDIAN";
  isInternalTester?: boolean;
  excludeFromAdminAnalytics?: boolean;
  internalTesterLabel?: string;
  recognitionDate?: string;
  membershipType?: "FREE" | "TRIAL" | "PREMIUM" | "LIFETIME" | "PENJAGA_BHUMI_INTI" | "REGULAR" | string | null;
  membershipExpiryDate?: Timestamp | null;
  role?: string | null;
  versionName?: string | null;
  versionCode?: number | null;
  buildNumber?: string | null;
  platform?: string | null;
  appVersion?: string | null;
  profileVersion?: string | null;
  engineVersion?: string | null;
  migrationVersion?: string | null;
  gaiaGeneratedAt?: string | null;
  gaiaProfile?: GaiaProfile | null;
  lastSeen?: Timestamp | string | null;
  registeredAt?: Timestamp | string | null;
  guardianCandidate?: boolean;
  guardianApproved?: boolean;
  guardianApprovedAt?: Timestamp | string | null;
  guardianApprovedBy?: string | null;
  participationMetrics?: {
    loginCount: number;
    lastSeen: string;
    lastLoginAt?: string;
    lastCheckInAt?: string;
    lastAssessmentAt?: string;
    buildNumber?: string;
    versionName?: string;
    versionCode?: number;
    appVersion?: string;
    platform?: string;
    hasCompletedCheckIn: boolean;
    hasCompletedAssessment: boolean;
    activeDays: string[];
  };
  healingProgress: {
    healingStreak: number;
    totalJournalEntries: number;
    totalMeditationMinutes: number;
    totalInnerworkSessions: number;
    consciousnessLevel: number;
  };
  emotionalState: {
    currentMood: number | null;
    lastCheckInAt: string | null;
    recurringThemes: string[];
  };
  profile: {
    language: "id" | "en";
    onboardingCompleted: boolean;
    timezone?: string | null;
    birthCity?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    blueprintInput?: {
      birthDate?: string;
      birthTime?: string;
      birthCity?: string;
    };
  };
  settings: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const SERVER_OWNED_ACCESS_FIELDS = new Set([
  "plan",
  "plans",
  "planLabel",
  "tier",
  "tiers",
  "role",
  "roles",
  "guardianRole",
  "badge",
  "badges",
  "testerBadge",
  "guardianBadge",
  "recognitionTier",
  "isDeveloper",
  "isFoundingMember",
  "premium",
  "isPremium",
  "subscription",
  "subscriptionStatus",
  "entitlement",
  "entitlements",
  "membership",
  "membershipType",
  "memberType",
  "membershipStartDate",
  "membershipExpiryDate",
  "membershipExpiresAt",
  "billing",
  "purchase",
  "purchases",
  "productId",
  "expiryDate",
  "accessStart",
  "accessUntil",
  "validUntil",
  "trial",
  "trialStartedAt",
  "trialEndsAt",
  "quota",
  "limits",
  "credits",
  "founder",
  "admin",
  "staff",
  "paid",
  "paymentStatus",
  "isInternalTester",
  "excludeFromAdminAnalytics",
  "internalTesterLabel",
]);

function stripServerOwnedAccessFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !SERVER_OWNED_ACCESS_FIELDS.has(key)),
  ) as Partial<T>;
}

const upsertUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  const now = Timestamp.now();

  const payload = {
    ...data,
    uid,
    updatedAt: now,
  };
  const safePayload = stripServerOwnedAccessFields(payload);

  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: Object.keys(safePayload) },
    () => setDoc(userRef, sanitizeForFirestore(safePayload), { merge: true }),
  );
};

const recordHealingPractice = async (uid: string, meditationMinutes: number) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  const profile = await getUserProfile(uid);
  if (!profile) return;

  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: ["healingProgress", "updatedAt"] },
    () => setDoc(userRef, sanitizeForFirestore({
      healingProgress: {
        healingStreak: (profile.healingProgress?.healingStreak || 0) + 1,
        totalMeditationMinutes: (profile.healingProgress?.totalMeditationMinutes || 0) + meditationMinutes,
        totalInnerworkSessions: (profile.healingProgress?.totalInnerworkSessions || 0) + 1,
      },
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

const recordJournalProgress = async (uid: string) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  const profile = await getUserProfile(uid);
  if (!profile) return;

  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: ["healingProgress", "updatedAt"] },
    () => setDoc(userRef, sanitizeForFirestore({
      healingProgress: {
        totalJournalEntries: (profile.healingProgress?.totalJournalEntries || 0) + 1,
      },
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

const updateEmotionalState = async (uid: string, state: Partial<UserProfile["emotionalState"]>) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: ["emotionalState", "updatedAt"] },
    () => setDoc(userRef, sanitizeForFirestore({
      emotionalState: state,
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

const updateBlueprintStatus = async (uid: string, status: UserProfile["blueprintStatus"]) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: ["blueprintStatus", "updatedAt"] },
    () => setDoc(userRef, sanitizeForFirestore({
      blueprintStatus: status,
      updatedAt: Timestamp.now(),
    }), { merge: true }),
  );
};

const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const docSnap = await debugFirestoreOperation(
    { operation: "getDoc", path: `users/${uid}`, uid },
    () => getDoc(userRef),
  );
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

const updatePresence = async (
  uid: string,
  data: {
    email?: string | null;
    displayName?: string | null;
    role?: string | null;
    buildInfo?: Partial<BuildInfo>;
    registered?: boolean;
  } = {},
) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  const existingProfile = await getUserProfile(uid).catch(() => null);
  const runtimeBuildInfo = await getRuntimeBuildInfo();
  const buildInfo = { ...runtimeBuildInfo, ...data.buildInfo };
  const lastSeenIso = new Date().toISOString();
  const existingMetrics = existingProfile?.participationMetrics;
  const buildInfoChanged = hasBuildInfoChanged(existingProfile, buildInfo);
  const metricsBuildInfoChanged = hasBuildInfoChanged(existingMetrics, buildInfo);

  const payload = {
    uid,
    email: data.email ?? existingProfile?.email ?? null,
    displayName: data.displayName ?? existingProfile?.displayName ?? existingProfile?.fullName ?? null,
    lastSeen: serverTimestamp(),
    registeredAt: data.registered && !existingProfile?.registeredAt
      ? serverTimestamp()
      : existingProfile?.registeredAt ?? serverTimestamp(),
    participationMetrics: {
      loginCount: existingMetrics?.loginCount || 0,
      hasCompletedCheckIn: existingMetrics?.hasCompletedCheckIn || false,
      hasCompletedAssessment: existingMetrics?.hasCompletedAssessment || false,
      activeDays: existingMetrics?.activeDays || [],
      ...existingMetrics,
      lastSeen: lastSeenIso,
    },
    updatedAt: Timestamp.now(),
  } as Partial<UserProfile>;

  if (buildInfoChanged) {
    payload.versionName = buildInfo.versionName;
    payload.appVersion = buildInfo.versionName;
    payload.versionCode = buildInfo.versionCode;
    payload.buildNumber = buildInfo.buildNumber;
    payload.platform = buildInfo.platform;
  }

  if (metricsBuildInfoChanged && payload.participationMetrics) {
    payload.participationMetrics = {
      ...payload.participationMetrics,
      buildNumber: buildInfo.buildNumber,
      versionName: buildInfo.versionName,
      appVersion: buildInfo.versionName,
      versionCode: buildInfo.versionCode,
      platform: buildInfo.platform,
    };
  }

  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: Object.keys(payload) },
    () => setDoc(userRef, sanitizeForFirestore(payload), { merge: true }),
  );
};

export const userRepository = {
  upsertUserProfile,
  getUserProfile,
  updatePresence,
  recordHealingPractice,
  recordJournalProgress,
  updateEmotionalState,
  updateBlueprintStatus,
};
