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
import {
  isCurrentAuthInvocation,
  resolveCurrentAuthOperation,
  resolveProfileLoad,
  type ProfileLoadOutcome,
} from '@/lib/auth/profileLoadOutcome';
import { enforceFounderQaAllowlist } from '@/lib/auth/founderQaGuard';

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
let nextAuthEffectInstanceId = 0;

const isEmulatorMode = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

function logProfileLoad(
  effectId: number,
  uid: string,
  stage: string,
  outcome?: ProfileLoadOutcome<UserProfile>,
) {
  if (!isEmulatorMode) return;
  console.info("[AUTH PROFILE LOAD]", {
    effectId,
    uid,
    documentPath: `users/${uid}`,
    stage,
    status: outcome?.status,
    elapsedMs: outcome?.elapsedMs,
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const refreshUserProfile = async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setUserProfile(null);
      return;
    }

    const refreshUid = firebaseUser.uid;
    const isCurrentRefresh = () => auth.currentUser?.uid === refreshUid;
    if (!isCurrentRefresh()) return;
    setProfileError(null);
    if (!isCurrentRefresh()) return;
    setProfileLoading(true);
    try {
      const guardedOutcome = await resolveCurrentAuthOperation(
        () => resolveProfileLoad(ensureMinimalUserProfile(firebaseUser), PROFILE_LOAD_TIMEOUT_MS),
        isCurrentRefresh,
      );
      if (guardedOutcome.status === "stale") return;
      const outcome = guardedOutcome.value;
      if (outcome.status === "success") {
        if (!isCurrentRefresh()) return;
        setUserProfile(outcome.value);
      } else if (outcome.status === "missing") {
        if (!isCurrentRefresh()) return;
        setUserProfile(null);
      } else if (outcome.status === "timeout") {
        console.warn("Auth profile refresh timed out.", { elapsedMs: outcome.elapsedMs });
        if (!isCurrentRefresh()) return;
        setUserProfile(null);
        if (!isCurrentRefresh()) return;
        setProfileError("Profil masih disiapkan. Silakan coba lagi.");
      } else {
        console.error("Auth profile refresh error:", outcome.error);
        if (!isCurrentRefresh()) return;
        setUserProfile(null);
        if (!isCurrentRefresh()) return;
        setProfileError("Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.");
        throw outcome.error;
      }
    } catch (error) {
      if (!isCurrentRefresh()) return;
      setUserProfile(null);
      if (!isCurrentRefresh()) return;
      setProfileError("Profil belum bisa dimuat. Periksa koneksi lalu coba lagi.");
      throw error;
    } finally {
      if (isCurrentRefresh()) setProfileLoading(false);
    }
  };

  const logout = async () => {
    await signOutAction();
    clearBhumiSessionForSignOut();
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    const effectId = ++nextAuthEffectInstanceId;
    let activeAuthStateId = 0;

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
          const authStateId = ++activeAuthStateId;
          const authStateUid = firebaseUser?.uid ?? null;
          const isActive = () => isCurrentAuthInvocation(
            authStateId,
            activeAuthStateId,
            cancelled,
            authStateUid,
            auth.currentUser?.uid ?? null,
          );
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

          if (!isActive()) return;
          setUser(firebaseUser);
          if (!isActive()) return;
          setAuthLoading(false);
          if (!isActive()) return;
          setProfileError(null);

          if (!firebaseUser) {
            console.log("[AUTH] No firebase user, clearing profile state.");
            if (!isActive()) return;
            setUserProfile(null);
            if (!isActive()) return;
            setProfileLoading(false);
            return;
          }

          const allowlistResult = await enforceFounderQaAllowlist(firebaseUser.email);
          if (!allowlistResult.allowed) {
            console.warn("[AUTH FOUNDER QA] Unauthorized account rejected:", allowlistResult.reason);
            if (!isActive()) return;
            setUserProfile(null);
            if (!isActive()) return;
            setProfileLoading(false);
            return;
          }

          if (!isActive()) return;
          setProfileLoading(true);
          try {
            logProfileLoad(effectId, firebaseUser.uid, "start");
            const guardedPrimaryOutcome = await resolveCurrentAuthOperation(
              () => resolveProfileLoad(
                ensureMinimalUserProfile(firebaseUser),
                PROFILE_LOAD_TIMEOUT_MS,
              ),
              isActive,
            );
            if (guardedPrimaryOutcome.status === "stale") return;
            const primaryOutcome = guardedPrimaryOutcome.value;
            logProfileLoad(effectId, firebaseUser.uid, "primary-settled", primaryOutcome);
            if (!isActive()) return;

            let profile: UserProfile | null = primaryOutcome.status === "success" ? primaryOutcome.value : null;

            if (profile) {
              const saveResult = await resolveCurrentAuthOperation(
                () => storageProvider.saveUserProfile(profile as any),
                isActive,
              );
              if (saveResult.status === "stale") return;
            } else if (primaryOutcome.status === "missing" || primaryOutcome.status === "timeout") {
              const guardedFallbackOutcome = await resolveCurrentAuthOperation(
                () => resolveProfileLoad(
                  storageProvider.getUserProfile() as Promise<UserProfile | null>,
                  PROFILE_LOAD_TIMEOUT_MS,
                ),
                isActive,
              );
              if (guardedFallbackOutcome.status === "stale") return;
              const fallbackOutcome = guardedFallbackOutcome.value;
              logProfileLoad(effectId, firebaseUser.uid, "cache-fallback-settled", fallbackOutcome);
              if (!isActive()) return;
              profile = fallbackOutcome.status === "success" ? fallbackOutcome.value : null;
              if (primaryOutcome.status === "timeout") {
                console.warn("[AUTH] Profile load timed out; continuing without a profile.", {
                  effectId,
                  uid: firebaseUser.uid,
                  documentPath: `users/${firebaseUser.uid}`,
                  elapsedMs: primaryOutcome.elapsedMs,
                });
              }
            } else if (primaryOutcome.status === "error") {
              console.error("Auth profile loading error:", primaryOutcome.error);
              if (!isActive()) return;
              setProfileError("Profil belum bisa dimuat. Silakan coba lagi.");
            }

            if (!isActive()) return;

            if (profile && profile.uid !== firebaseUser.uid) {
              console.error("[USER DATA MISMATCH BLOCKED]", {
                reason: "profile_uid_mismatch_in_auth_context",
                authUid: firebaseUser.uid,
                profileUid: profile.uid
              });
              if (!isActive()) return;
              setUserProfile(null);
              if (!isActive()) return;
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
              const grantResult = await resolveCurrentAuthOperation(
                () => processMembershipGrant(profile as UserProfile),
                isActive,
              );
              if (grantResult.status === "stale") return;
              const grantedProfile = grantResult.value;

              const migrationResult = await resolveCurrentAuthOperation(
                () => migrateUserToGaia(grantedProfile).catch((error) => {
                  if (isActive()) console.warn("[GAIA MIGRATION DEFERRED]", error);
                  return grantedProfile;
                }),
                isActive,
              );
              if (migrationResult.status === "stale") return;
              const migratedProfile = migrationResult.value;

              const birthdayResult = await resolveCurrentAuthOperation(
                () => CommunicationCenterService.ensureBirthdayMessage({
                  uid: firebaseUser.uid,
                  birthDate: (migratedProfile as any).birthDate || (migratedProfile as any).dateOfBirth,
                  timezone: (migratedProfile as any).timezone,
                  displayName: firebaseUser.displayName || (migratedProfile as any).displayName,
                  fullName: (migratedProfile as any).fullName,
                }).catch((error) => {
                  if (isActive()) console.warn('[BIRTHDAY MESSAGE CHECK FAILED]', error);
                }),
                isActive,
              );
              if (birthdayResult.status === "stale") return;

              const activityResult = await resolveCurrentAuthOperation(
                () => participationEngine.recordActivity(firebaseUser.uid, "login", {
                  ...migratedProfile,
                  email: firebaseUser.email || migratedProfile.email || "",
                  displayName: firebaseUser.displayName ?? migratedProfile.displayName ?? migratedProfile.fullName ?? "",
                }).catch((error) => {
                  if (isActive()) console.warn("[LOGIN PARTICIPATION UPDATE FAILED]", error);
                }),
                isActive,
              );
              if (activityResult.status === "stale") return;
              if (!isActive()) return;
              setUserProfile(migratedProfile);
            } else {
              if (!isActive()) return;
              setUserProfile(null);
            }
          } catch (error) {
            if (!isActive()) return;
            console.error("Auth profile loading error:", error);

            // Final fallback: try local-only storage just in case
            const guardedFallbackOutcome = await resolveCurrentAuthOperation(
              () => resolveProfileLoad(
                storageProvider.getUserProfile() as Promise<UserProfile | null>,
                PROFILE_LOAD_TIMEOUT_MS,
              ),
              isActive,
            );
            if (guardedFallbackOutcome.status === "stale") return;
            const fallbackOutcome = guardedFallbackOutcome.value;
            const localFallback = fallbackOutcome.status === "success" ? fallbackOutcome.value : null;
            if (localFallback && localFallback.uid === firebaseUser.uid) {
               console.log("[AUTH] Using local fallback profile after error");
               if (!isActive()) return;
               setUserProfile(localFallback);
            } else {
              if (!isActive()) return;
              setUserProfile(null);
              if (!isActive()) return;
              setProfileError("Profil belum bisa dimuat. Silakan coba lagi.");
            }
          } finally {
            if (isActive()) {
              setProfileLoading(false);
            }
          }
        },
        (error) => {
          if (cancelled) return;
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
      if (isEmulatorMode) {
        console.info("[AUTH PROFILE LOAD]", { effectId, stage: "cleanup" });
      }
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
