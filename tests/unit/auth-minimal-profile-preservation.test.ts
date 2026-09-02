import assert from "node:assert";

import { ensureMinimalUserProfile } from "../../lib/auth/authActions.ts";
import { userRepository, type UserProfile } from "../../lib/repositories/userRepository.ts";
import { guardMonotonicProfilePatch } from "../../lib/auth/profileMonotonicity.ts";

let assertionCount = 0;

function assertEqual<T>(actual: T, expected: T, message: string): void {
  assertionCount += 1;
  assert.strictEqual(actual, expected, message);
}

const existingProfile = {
  uid: "test-user",
  fullName: "",
  displayName: "",
  email: "",
  photoURL: null,
  birthDate: "1990-01-02",
  birthTime: "03:04",
  birthCity: "Jakarta",
  birthPlace: "Jakarta, Indonesia",
  birthCountry: null,
  latitude: null,
  longitude: null,
  timezone: null,
  language: "id",
  onboardingCompleted: true,
  baselineWellnessCompleted: false,
  setupCompleted: true,
  blueprintStatus: "missing",
  healingProgress: {
    healingStreak: 0,
    totalJournalEntries: 0,
    totalMeditationMinutes: 0,
    totalInnerworkSessions: 0,
    consciousnessLevel: 0,
  },
  emotionalState: {
    currentMood: null,
    lastCheckInAt: null,
    recurringThemes: [],
  },
  profile: {
    language: "id",
    onboardingCompleted: false,
    blueprintInput: {
      birthDate: "",
      birthTime: "",
      birthCity: "",
    },
  },
  settings: {},
  registeredAt: {} as UserProfile["registeredAt"],
  createdAt: {} as UserProfile["createdAt"],
  updatedAt: {} as UserProfile["updatedAt"],
} as UserProfile;
delete (existingProfile as Partial<UserProfile>).healingProgress;

async function run(): Promise<void> {
  const originalGetUserProfile = userRepository.getUserProfile;
  const originalUpsertUserProfile = userRepository.upsertUserProfile;
  const originalReconcileMinimalProfile = userRepository.reconcileMinimalProfile;
  const originalUpdatePresence = userRepository.updatePresence;
  let persistedProfile = existingProfile as UserProfile;
  let persistedPatch: Partial<UserProfile> | null = null;

  userRepository.getUserProfile = async () => persistedProfile;
  userRepository.upsertUserProfile = async (_uid, patch) => {
    persistedPatch = patch;
    persistedProfile = { ...persistedProfile, ...patch };
  };
  // Build 106: the existing-profile reconcile now runs through the transactional
  // monotonicity guard. Stand in for it with the real guard + a merge.
  userRepository.reconcileMinimalProfile = async (_uid, patch) => {
    const guarded = guardMonotonicProfilePatch(persistedProfile, patch);
    persistedPatch = guarded;
    const keys = Object.keys(guarded);
    if (keys.length > 0) persistedProfile = { ...persistedProfile, ...guarded };
    return keys;
  };
  userRepository.updatePresence = async () => undefined;

  try {
    await ensureMinimalUserProfile({
      uid: "test-user",
      displayName: "Test User",
      email: "test@example.invalid",
      photoURL: null,
    } as Parameters<typeof ensureMinimalUserProfile>[0]);
  } finally {
    userRepository.getUserProfile = originalGetUserProfile;
    userRepository.upsertUserProfile = originalUpsertUserProfile;
    userRepository.reconcileMinimalProfile = originalReconcileMinimalProfile;
    userRepository.updatePresence = originalUpdatePresence;
  }

  assert.deepStrictEqual(
    Object.keys(persistedPatch ?? {}),
    ["healingProgress"],
    "ensureMinimalUserProfile adds only the missing healingProgress field",
  );
  assertionCount += 1;

  assertEqual(persistedProfile.birthDate, "1990-01-02", "birthDate is preserved");
  assertEqual(persistedProfile.birthTime, "03:04", "birthTime is preserved");
  assertEqual(persistedProfile.birthCity, "Jakarta", "birthCity is preserved");
  assertEqual(
    persistedProfile.birthPlace,
    "Jakarta, Indonesia",
    "birthPlace is preserved",
  );
  assertEqual(persistedProfile.setupCompleted, true, "setupCompleted is preserved");
  assertEqual(
    persistedProfile.baselineWellnessCompleted,
    false,
    "defined false values are preserved rather than treated as missing",
  );
  assert.strictEqual(
    persistedProfile.healingProgress?.healingStreak,
    0,
    "healingProgress is added from the minimal profile",
  );
  assertionCount += 1;

  console.log(`PASS auth-minimal-profile-preservation (${assertionCount} assertions)`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
