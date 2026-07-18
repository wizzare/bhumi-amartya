"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { ensureMinimalUserProfile, signOut as signOutAction } from '@/lib/auth/authActions';
import { UserProfile, userRepository } from '@/lib/repositories/userRepository';
import { clearBhumiSessionForSignOut } from '@/lib/auth/onboardingIntent';
import { storageProvider } from '@/lib/storage/storageProvider';
import { processMembershipGrant } from '@/lib/billing/membershipLogic';
import { participationEngine } from '@/lib/engines/participationEngine';
import { migrateUserToGaia } from '@/lib/profile/gaia/migration';
import { CommunicationCenterService } from '@/lib/services/communicationCenterService';

interface AuthContextType {
  user: User | null;
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authLoading: boolean;
  authStateResolved: boolean;
  profileLoading: boolean;
  profileError: string | null;
  refreshUserProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PROFILE_LOAD_TIMEOUT_MS = 5000;

const withProfileTimeout = (profilePromise: Promise<UserProfile | null>) => {
  return Promise.race([
    profilePromise,
    new Promise<UserProfile | null>((_, reject) => {
      window.setTimeout(() => reject(new Error("Profile loading timed out.")), PROFILE_LOAD_TIMEOUT_MS);
    }),
  ]);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshUserProfile = async () => {
    const firebaseUser = auth.currentUser;
    setProfileError(null);

    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    setProfileLoading(true);
    try {
      const profile = await withProfileTimeout(ensureMinimalUserProfile(firebaseUser));
      setUserProfile(profile);
    } catch (error) {
      console.error("Auth profile refresh error:", error);
      setUserProfile(null);
      setProfileError("Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.");
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const logout = async () => {
    await signOutAction();
    clearBhumiSessionForSignOut();
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    console.log("[AUTH INIT START]", {
      source: "AuthContext",
      hasCurrentUser: Boolean(auth.currentUser),
      uid: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
    });

    // Safety timeout to resolve loading state if Firebase hangs
    const safetyTimeout = setTimeout(() => {
      if (!cancelled && authLoading) {
        console.warn("[LOADING TIMEOUT]", {
          source: "AuthContext",
          reason: "firebase_auth_not_ready_after_8s",
        });
        setAuthLoading(false);
      }
    }, 8000);

    const subscribeToAuthState = async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (error) {
        console.error("Auth persistence setup error:", error);
      }

      if (cancelled) return;

      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          clearTimeout(safetyTimeout);
          if (cancelled) return;
          console.info("[AUTH] onAuthStateChanged", {
            uid: firebaseUser?.uid ?? null,
            email: firebaseUser?.email ?? null,
            route: typeof window !== "undefined" ? window.location.pathname : null,
            authState: firebaseUser ? "authenticated" : "unauthenticated",
          });
          console.info("[AUTH USER]", {
            uid: firebaseUser?.uid ?? null,
            email: firebaseUser?.email ?? null,
            providerId: firebaseUser?.providerData?.[0]?.providerId ?? null,
          });
          console.info("[AUTH INIT READY]", {
            currentUserExists: Boolean(firebaseUser),
            uid: firebaseUser?.uid ?? null,
            email: firebaseUser?.email ?? null,
          });

          setUser(firebaseUser);
          setAuthLoading(false);
          setProfileError(null);

          if (!firebaseUser) {
            console.log("[AUTH] No firebase user, clearing profile state.");
            setUserProfile(null);
            setProfileLoading(false);
            return;
          }

          setProfileLoading(true);
          try {
            // 1. Force refresh from Firestore to avoid stale local cache (Critical Hotfix July 5)
            // This ensure we get the latest trialEndsAt/badge state even if localStorage is old.
            const freshProfile = await withProfileTimeout(ensureMinimalUserProfile(firebaseUser));
            let profile = freshProfile;

            // 2. If fresh fetch succeeded, sync to local storage immediately (Invalidates stale cache)
            if (profile) {
              await storageProvider.saveUserProfile(profile as any);
            } else {
              // Fallback to cache ONLY if Firestore is unreachable
              console.warn("[AUTH] Firestore fetch returned null, attempting local cache fallback.");
              profile = await withProfileTimeout(storageProvider.getUserProfile() as Promise<UserProfile | null>);
            }

            if (cancelled) return;

            if (profile && profile.uid !== firebaseUser.uid) {
              console.error("[USER DATA MISMATCH BLOCKED]", {
                reason: "profile_uid_mismatch_in_auth_context",
                authUid: firebaseUser.uid,
                profileUid: profile.uid
              });
              setUserProfile(null);
              setProfileError("Terjadi kesalahan sinkronisasi akun.");
            } else if (profile) {
              console.log("[USER DATA LOAD]", {
                authUid: firebaseUser.uid,
                profileUid: profile?.uid ?? null,
                source: "AuthContext",
                profileExists: !!profile,
                setupCompleted: profile?.setupCompleted
              });

              // Apply membership grant if eligible
              const grantedProfile = await processMembershipGrant(profile as UserProfile);
              const migratedProfile = await migrateUserToGaia(grantedProfile).catch((error) => {
                console.warn("[GAIA MIGRATION DEFERRED]", error);
                return grantedProfile;
              });
              await CommunicationCenterService.ensureBirthdayMessage({
                uid: firebaseUser.uid,
                birthDate: (migratedProfile as any).birthDate || (migratedProfile as any).dateOfBirth,
                timezone: (migratedProfile as any).timezone,
                displayName: firebaseUser.displayName || (migratedProfile as any).displayName,
                fullName: (migratedProfile as any).fullName,
              }).catch((error) => console.warn('[BIRTHDAY MESSAGE CHECK FAILED]', error));
              await participationEngine.recordActivity(firebaseUser.uid, "login", {
                ...migratedProfile,
                email: firebaseUser.email || migratedProfile.email || "",
                displayName: firebaseUser.displayName ?? migratedProfile.displayName ?? migratedProfile.fullName ?? "",
              }).catch((error) => {
                console.warn("[LOGIN PARTICIPATION UPDATE FAILED]", error);
              });
              setUserProfile(migratedProfile);
            } else {
              setUserProfile(null);
            }
          } catch (error) {
            if (cancelled) return;
            console.error("Auth profile loading error:", error);

            // Final fallback: try local-only storage just in case
            const localFallback = await storageProvider.getUserProfile() as UserProfile | null;
            if (localFallback && localFallback.uid === firebaseUser.uid) {
               console.log("[AUTH] Using local fallback profile after error");
               setUserProfile(localFallback);
            } else {
              setUserProfile(null);
              setProfileError("Profil belum bisa dimuat. Silakan coba lagi.");
            }
          } finally {
            if (!cancelled) {
              setProfileLoading(false);
            }
          }
        },
        (error) => {
          console.error("Auth state listener error:", error);
          setUser(null);
          setUserProfile(null);
          setAuthLoading(false);
          setProfileLoading(false);
          setProfileError("Sesi login belum bisa diperiksa. Muat ulang halaman atau coba lagi.");
        },
      );
    };

    void subscribeToAuthState();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const updateResumePresence = () => {
      const firebaseUser = auth.currentUser;
      if (document.visibilityState !== "visible" || !firebaseUser) return;

      void userRepository.updatePresence(firebaseUser.uid, {
        email: firebaseUser.email || userProfile?.email || "",
        displayName: firebaseUser.displayName ?? userProfile?.displayName ?? userProfile?.fullName ?? "",
        role: userProfile?.guardianRole || userProfile?.role || "user",
      }).catch((error) => {
        console.warn("[PRESENCE RESUME UPDATE FAILED]", error);
      });
    };

    document.addEventListener("visibilitychange", updateResumePresence);
    return () => document.removeEventListener("visibilitychange", updateResumePresence);
  }, [userProfile]);


  const loading = authLoading || profileLoading;
  const authStateResolved = !authLoading;

  const value = {
    user,
    firebaseUser: user,
    userProfile,
    loading,
    authLoading,
    authStateResolved,
    profileLoading,
    profileError,
    refreshUserProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
