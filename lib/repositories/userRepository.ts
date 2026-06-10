import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { BlueprintStatus } from "@/lib/types/blueprint";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

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
  blueprintStatus: BlueprintStatus;
  setupCompleted: boolean;
  plan: "trial" | "pro" | "expired" | "free" | "premium" | "developer";
  planLabel?: string | null;
  membershipType?: "REGULAR" | "PENJAGA_BHUMI_INTI" | string | null;
  membershipStartDate?: Timestamp | null;
  membershipExpiryDate?: Timestamp | null;
  trialStartedAt?: Timestamp;
  trialEndsAt?: Timestamp;
  isDeveloper?: boolean;
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

const upsertUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  const now = Timestamp.now();

  const payload = {
    ...data,
    uid,
    updatedAt: now,
  };

  // Add createdAt only if it's missing in existing doc or provided data
  // Using merge: true will keep existing createdAt if we don't send it
  if (!data.createdAt) {
    // We don't want to overwrite if it exists, but setDoc with merge: true
    // handles this if we just omit it. However, for a new user, we want it.
  }

  await debugFirestoreOperation(
    { operation: "setDoc", path, uid, payloadKeys: Object.keys(payload) },
    () => setDoc(userRef, sanitizeForFirestore(payload), { merge: true }),
  );
};

const recordHealingPractice = async (uid: string, meditationMinutes: number) => {
  const userRef = doc(db, "users", uid);
  const path = `users/${uid}`;
  // This is a simplified version. Ideally we'd use increment()
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

export const userRepository = {
  upsertUserProfile,
  getUserProfile,
  recordHealingPractice,
  recordJournalProgress,
  updateEmotionalState,
  updateBlueprintStatus,
};
