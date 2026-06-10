import type { LocalUserProfile } from "@/lib/local/generateLocalBlueprint";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { auth } from "@/lib/firebase/firebase";

const USER_PROFILE_STORAGE_KEY = "bhumiUserProfile";

export type LocalAuthProvider = "google" | "local" | null;

export type LocalUserSession = {
  isLoggedIn: boolean;
  profile: LocalUserProfile | null;
  email: string | null;
  setupCompleted: boolean;
  authProvider: LocalAuthProvider;
};

const emptySession: LocalUserSession = {
  isLoggedIn: false,
  profile: null,
  email: null,
  setupCompleted: false,
  authProvider: null,
};

function normalizeEmail(email?: string | null) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function normalizeAuthProvider(profile: LocalUserProfile): "google" | "local" {
  return profile.authProvider === "google" ? "google" : "local";
}

export function getLocalUserSession(): LocalUserSession {
  if (typeof window === "undefined") return emptySession;

  try {
    const authUid = auth.currentUser?.uid;
    let storedProfile = null;

    if (authUid) {
      storedProfile = window.localStorage.getItem(`bhumiProfile:${authUid}`);
    }

    if (!storedProfile) return emptySession;

    const profile = safeJsonParse<LocalUserProfile | null>(storedProfile, null);
    if (!profile) return emptySession;

    if (authUid && profile.uid !== authUid) {
       return emptySession;
    }

    const email = typeof profile.email === "string" && profile.email.trim()
      ? profile.email.trim()
      : null;
    const setupCompleted = profile.setupCompleted === true;
    const authProvider = normalizeAuthProvider(profile);

    return {
      isLoggedIn: setupCompleted || Boolean(email),
      profile,
      email,
      setupCompleted,
      authProvider,
    };
  } catch (error) {
    console.error("[Local Session] Failed to read local user profile", error);
    return emptySession;
  }
}

export function getCompletedLocalProfileByEmail(email?: string | null): LocalUserProfile | null {
  const session = getLocalUserSession();
  const targetEmail = normalizeEmail(email);

  if (!session.profile || !session.setupCompleted || !targetEmail) return null;
  if (normalizeEmail(session.profile.email) !== targetEmail) return null;

  return session.profile;
}
