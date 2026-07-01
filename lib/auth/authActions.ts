import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCredential,
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

function hasMinimalProfileFields(profile: UserProfile): boolean {
  return (
    typeof profile.onboardingCompleted === "boolean" &&
    typeof profile.baselineWellnessCompleted === "boolean" &&
    typeof profile.setupCompleted === "boolean" &&
    Boolean(profile.healingProgress) &&
    Boolean(profile.emotionalState) &&
    Boolean(profile.profile) &&
    Boolean(profile.settings)
  );
}

export const ensureMinimalUserProfile = async (user: User) => {
  const existingProfile = await userRepository.getUserProfile(user.uid);
  const now = Timestamp.now();
  if (existingProfile) {
    if (!hasMinimalProfileFields(existingProfile)) {
      await userRepository.upsertUserProfile(user.uid, buildMinimalUserProfile(user, now));
    }
    await userRepository.updatePresence(user.uid, {
      email: user.email || existingProfile.email || "",
      displayName: user.displayName ?? existingProfile.displayName ?? existingProfile.fullName ?? "",
      role: existingProfile.guardianRole || existingProfile.role || "user",
    });
    return (await userRepository.getUserProfile(user.uid)) ?? existingProfile;
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

      const nativeAuth = FirebaseAuthentication as NativeGoogleAuthWithLegacyOptions;
      const result = await nativeAuth.signInWithGoogle({
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
