import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
  signOut as firebaseSignOut,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { Timestamp } from 'firebase/firestore';
import { auth } from '../firebase/firebase';
import { userRepository, UserProfile } from '../repositories/userRepository';
import { firstUserProfileSeed, isFirstUserEmail } from '@/lib/data/firstUser';

const GOOGLE_REDIRECT_PENDING_KEY = "bhumi.googleRedirectPending";

type GoogleRedirectProcessingResult = {
  user: User | null;
  redirectResultUser: User | null;
};

export const ensureMinimalUserProfile = async (user: User) => {
  const existingProfile = await userRepository.getUserProfile(user.uid);
  if (existingProfile) {
    return existingProfile;
  }

  const now = Timestamp.now();
  const sevenDaysInSeconds = 7 * 24 * 60 * 60;
  const trialEndsAt = new Timestamp(now.seconds + sevenDaysInSeconds, now.nanoseconds);

  // REMOVED: firstUser/wizzare fallback logic to ensure isolation

  const minimalProfile: UserProfile = {
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
    setupCompleted: false,
    blueprintStatus: "missing",
    plan: "free",
    trialStartedAt: now,
    trialEndsAt,
    isDeveloper: false,
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
    createdAt: now,
    updatedAt: now,
  };

  await userRepository.upsertUserProfile(user.uid, minimalProfile);
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
  return createdProfile;
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

      // FALLBACK: Disabling Credential Manager to use legacy Google Sign-In flow
      // This is often more reliable when SHA-1/Signature issues occur on newer Android versions.
      const result = await (FirebaseAuthentication as any).signInWithGoogle({
        webClientId: WEB_CLIENT_ID,
        useCredentialManager: false,
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

      // Attempt to extract more info from Capacitor error
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

  const googleProvider = new GoogleAuthProvider();

  if (options?.promptSelectAccount) {
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  await setPersistence(auth, browserLocalPersistence);
  console.log("[GOOGLE AUTH START]", { method: "signInWithPopup" });
  await signInWithPopup(auth, googleProvider);
  console.log("[GOOGLE AUTH RESULT]", { status: "success" });
};

export const handleGoogleRedirectResult = async (): Promise<GoogleRedirectProcessingResult> => {
  const redirectUser = auth.currentUser;
  return {
    user: redirectUser ?? null,
    redirectResultUser: null,
  };
};

export const signOut = async (): Promise<void> => {
  console.log("[AUTH] Starting signOut flow...");

  try {
    // 1. Firebase Sign Out
    await firebaseSignOut(auth);
    console.log("[AUTH] Firebase signOut successful");

    // 2. Native Plugin Sign Out (if applicable)
    if (Capacitor.isNativePlatform()) {
      try {
        await FirebaseAuthentication.signOut();
        console.log("[AUTH] Native FirebaseAuthentication.signOut successful");
      } catch (nativeError) {
        console.warn("[AUTH] Native signOut failed (non-critical):", nativeError);
      }
    }

    // 3. Clear Local Storage / Session Data
    // We clear everything starting with 'bhumi' to be safe,
    // and explicitly target profile/auth related keys.
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

    // 4. Final redirect is usually handled by the AuthListener or the component calling this,
    // but we ensure we return a clean slate.
  } catch (error) {
    console.error("[AUTH] Error during signOut flow:", error);
    throw error;
  }
};
