import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Timestamp } from "firebase/firestore";
import { auth } from "../firebase/firebase";
import { userRepository, UserProfile } from "../repositories/userRepository";

type GoogleRedirectProcessingResult = {
  user: User | null;
  redirectResultUser: User | null;
};

type NativeGoogleSignInResult = {
  credential?: {
    idToken?: string | null;
    accessToken?: string | null;
  } | null;
  user?: {
    email?: string | null;
  } | null;
};

type NativeGoogleAuthWithLegacyOptions = typeof FirebaseAuthentication & {
  signInWithGoogle(options: {
    webClientId: string;
    useCredentialManager: boolean;
  }): Promise<NativeGoogleSignInResult>;
};

export const GOOGLE_POPUP_TIMEOUT_MS = 35_000;
const SERVER_PROFILE_WAIT_TIMEOUT_MS = 10_000;
const SERVER_PROFILE_POLL_INTERVAL_MS = 250;
const FIRST_LOGIN_CLOCK_SKEW_MS = 60_000;

export class GooglePopupTimeoutError extends Error {
  readonly code = "auth/popup-timeout";

  constructor(timeoutMs: number) {
    super(`Google sign-in popup did not settle within ${timeoutMs}ms.`);
    this.name = "GooglePopupTimeoutError";
  }
}

export class ServerIssuedProfilePendingError extends Error {
  constructor() {
    super("Server-issued access profile is still pending.");
    this.name = "ServerIssuedProfilePendingError";
  }
}

function hasHigherServerEntitlement(profile: UserProfile | null): boolean {
  if (!profile) return false;
  if (profile.membershipType === "LIFETIME") return true;
  if (profile.membershipType === "PREMIUM" && (profile as any).entitlementSource === "google_play") return true;
  const badge = profile.testerBadge || (profile as any).badge;
  return badge === "Founder" || badge === "Penjaga Bhumi Inti" || badge === "Penjaga Bhumi Alfa";
}

export function isServerIssuedProfilePending(
  user: User,
  profile: UserProfile | null,
  nowMs = Date.now(),
): boolean {
  const creationMs = Date.parse(user.metadata?.creationTime || "");
  const lastSignInMs = Date.parse(user.metadata?.lastSignInTime || "");
  const firstLogin = Number.isFinite(creationMs)
    && Number.isFinite(lastSignInMs)
    && Math.abs(lastSignInMs - creationMs) <= FIRST_LOGIN_CLOCK_SKEW_MS;
  if (!firstLogin || nowMs < creationMs) return false;
  if (hasHigherServerEntitlement(profile)) return false;
  return !profile?.trialStartedAt || !profile?.trialEndsAt;
}

async function waitForServerIssuedProfile(
  user: User,
  initialProfile: UserProfile,
  profileWasJustCreated = false,
): Promise<UserProfile> {
  let profile = initialProfile;
  const deadline = Date.now() + SERVER_PROFILE_WAIT_TIMEOUT_MS;
  const isPending = () => profileWasJustCreated
    ? !hasHigherServerEntitlement(profile) && (!profile.trialStartedAt || !profile.trialEndsAt)
    : isServerIssuedProfilePending(user, profile);

  while (isPending() && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, SERVER_PROFILE_POLL_INTERVAL_MS));
    try {
      profile = (await userRepository.getUserProfile(user.uid)) ?? profile;
    } catch {
      // Keep waiting for the server-owned profile until the bounded deadline.
    }
  }

  if (isPending()) {
    throw new ServerIssuedProfilePendingError();
  }
  return profile;
}

export function waitForGooglePopupResult<T>(operation: Promise<T>, timeoutMs = GOOGLE_POPUP_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new GooglePopupTimeoutError(timeoutMs));
    }, timeoutMs);

    operation.then(
      (result) => {
        clearTimeout(timeoutId);
        resolve(result);
      },
      (error) => {
        clearTimeout(timeoutId);
        reject(error);
      },
    );
  });
}

function createGoogleProvider(promptSelectAccount?: boolean): GoogleAuthProvider {
  const googleProvider = new GoogleAuthProvider();

  if (promptSelectAccount) {
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  return googleProvider;
}

function buildMinimalUserProfile(user: User, now: Timestamp): UserProfile {
  return {
    uid: user.uid,
    fullName: user.displayName ?? "",
    displayName: user.displayName ?? "",
    email: user.email || "",
    photoURL: user.photoURL || null,
    birthDate: "",
    birthTime: "",
    birthCity: "",
    birthPlace: "",
    birthCountry: null,
    latitude: null,
    longitude: null,
    timezone: null,
    language: "id",
    onboardingCompleted: false,
    baselineWellnessCompleted: false,
    setupCompleted: false,
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
    registeredAt: now,
    createdAt: now,
    updatedAt: now,
  } as UserProfile;
}

/**
 * Builds a merge patch for fields that are absent from a persisted profile.
 * Defined values, including false, empty strings, and null, are preserved.
 */
export function buildMissingMinimalProfilePatch(
  existingProfile: UserProfile,
  minimalProfile: UserProfile,
): Partial<UserProfile> {
  const patch: Partial<UserProfile> = {};

  for (const [field, value] of Object.entries(minimalProfile) as Array<
    [keyof UserProfile, unknown]
  >) {
    if (existingProfile[field] === undefined) {
      Object.assign(patch, { [field]: value });
    }
  }

  return patch;
}

export const ensureMinimalUserProfile = async (user: User) => {
  const existingProfile = await userRepository.getUserProfile(user.uid);
  const now = Timestamp.now();
  if (existingProfile) {
    const missingFieldsPatch = buildMissingMinimalProfilePatch(
      existingProfile,
      buildMinimalUserProfile(user, now),
    );
    if (Object.keys(missingFieldsPatch).length > 0) {
      await userRepository.upsertUserProfile(user.uid, missingFieldsPatch);
    }
    await userRepository.updatePresence(user.uid, {
      email: user.email || existingProfile.email || "",
      displayName: user.displayName ?? existingProfile.displayName ?? existingProfile.fullName ?? "",
      role: existingProfile.guardianRole || existingProfile.role || "user",
    });
    const refreshedProfile = (await userRepository.getUserProfile(user.uid)) ?? existingProfile;
    return waitForServerIssuedProfile(user, refreshedProfile);
  }

  const minimalProfile = buildMinimalUserProfile(user, now);

  await userRepository.upsertUserProfile(user.uid, minimalProfile);
  await userRepository.updatePresence(user.uid, {
    email: user.email || "",
    displayName: user.displayName ?? "",
    role: "user",
    registered: true,
  });
  const createdProfile = (await userRepository.getUserProfile(user.uid)) ?? minimalProfile;
  console.log("[PROFILE CREATED]", {
    uid: user.uid,
    email: user.email ?? null,
    firestorePath: `users/${user.uid}`,
    localCacheKey: `bhumiProfile:${user.uid}`,
    setupCompleted: createdProfile.setupCompleted,
    blueprintStatus: createdProfile.blueprintStatus,
    source: "ensureMinimalUserProfile",
  });
  return waitForServerIssuedProfile(user, createdProfile, true);
};

export const signInWithGoogle = async (options?: {
  promptSelectAccount?: boolean;
}): Promise<void> => {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  console.log("[AUTH PLATFORM]", { platform, isNative });
  console.log("[CAPACITOR IS_NATIVE]", isNative);

  if (isNative) {
    try {
      const WEB_CLIENT_ID = "59259824153-vldlev9s91l6sss3ulqbh8mnaah4n4c9.apps.googleusercontent.com";
      console.log("[NATIVE GOOGLE AUTH START]", {
        platform,
        webClientId: WEB_CLIENT_ID,
        forceCodeForRefreshToken: true
      });

      const nativeAuth = FirebaseAuthentication as NativeGoogleAuthWithLegacyOptions;
      const result = await nativeAuth.signInWithGoogle({
        webClientId: WEB_CLIENT_ID,
        useCredentialManager: true,
      });

      console.log("[NATIVE GOOGLE AUTH RESULT SUCCESS]", {
        hasCredential: !!result?.credential,
        hasIdToken: !!result?.credential?.idToken,
        hasAccessToken: !!result?.credential?.accessToken,
        user: result?.user?.email
      });

      const idToken = result?.credential?.idToken ?? null;
      const accessToken = result?.credential?.accessToken ?? null;

      if (!idToken && !accessToken) {
        console.error("[NATIVE GOOGLE AUTH ERROR] Missing tokens", result);
        throw new Error("Native Google sign-in did not return idToken/accessToken.");
      }

      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      console.log("[NATIVE GOOGLE AUTH CREDENTIAL]", {
        hasIdToken: !!idToken,
        hasAccessToken: !!accessToken,
      });
      await signInWithCredential(auth, credential);
      console.log("[GOOGLE AUTH RESULT]", { status: "success", mode: "native" });
      return;
    } catch (error) {
      console.error("[NATIVE GOOGLE AUTH CRITICAL FAILURE]", error);
      const err = error as { name?: string; message?: string; code?: string; stack?: string, errorMessage?: string };

      const detailedError = {
        name: err?.name,
        message: err?.message || err?.errorMessage,
        code: err?.code,
        stack: err?.stack,
        platform: platform,
        timestamp: new Date().toISOString()
      };

      console.error("[DETAILED AUTH ERROR]", detailedError);
      throw error;
    }
  }

  const googleProvider = createGoogleProvider(options?.promptSelectAccount);

  await setPersistence(auth, browserLocalPersistence);
  console.log("[GOOGLE AUTH START]", { method: "signInWithPopup" });
  await waitForGooglePopupResult(signInWithPopup(auth, googleProvider));
  console.log("[GOOGLE AUTH RESULT]", { status: "success" });
};

export const signInWithGoogleRedirect = async (options?: {
  promptSelectAccount?: boolean;
}): Promise<never> => {
  if (Capacitor.isNativePlatform()) {
    throw new Error("Google redirect sign-in is only available on the web.");
  }

  const googleProvider = createGoogleProvider(options?.promptSelectAccount);
  await setPersistence(auth, browserLocalPersistence);
  console.log("[GOOGLE AUTH START]", { method: "signInWithRedirect" });
  return signInWithRedirect(auth, googleProvider);
};

export const handleGoogleRedirectResult = async (): Promise<GoogleRedirectProcessingResult> => {
  const redirectResult = await getRedirectResult(auth);
  const redirectUser = redirectResult?.user ?? auth.currentUser;
  return {
    user: redirectUser ?? null,
    redirectResultUser: redirectResult?.user ?? null,
  };
};

export const signOut = async (): Promise<void> => {
  console.log("[AUTH] Starting signOut flow...");

  try {
    await firebaseSignOut(auth);
    console.log("[AUTH] Firebase signOut successful");

    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
        console.log("[AUTH] Native FirebaseAuthentication.signOut successful");
      } catch (nativeError) {
        console.warn("[AUTH] Native signOut failed (non-critical):", nativeError);
      }
    }

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("bhumi") || key.includes("auth") || key.includes("User"))) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`[AUTH] Cleared localStorage key: ${key}`);
    });

    sessionStorage.clear();
    console.log("[AUTH] sessionStorage cleared");
  } catch (error) {
    console.error("[AUTH] Error during signOut flow:", error);
    throw error;
  }
};
