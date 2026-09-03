import { storageProvider } from "@/lib/storage/storageProvider";
import { isCompletedProfileForUser } from "@/lib/auth/authoritativeProfileGate";

export type ResolvedProfileResult = {
  profile: Record<string, unknown> | null;
  isLoading: boolean;
  isMissing: boolean;
  isUnavailable: boolean;
  source: "authContext" | "storageProvider" | "localStorage" | "none";
};

type AuthLike = {
  user?: unknown;
  userProfile?: unknown;
  authLoading?: boolean;
  profileLoading?: boolean;
  authStateResolved?: boolean;
  refreshUserProfile?: () => Promise<unknown>;
} | null | undefined;

export async function resolveActiveProfile(auth?: AuthLike): Promise<ResolvedProfileResult> {
  const authUid = (auth?.user as { uid?: string } | undefined)?.uid;
  if (!authUid && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const auditUser = window.localStorage.getItem("bhumi_audit_user");
    if (auditUser) {
      const { getMockProfile } = await import("@/lib/dailyGuidance/auditMocks");
      return {
        profile: getMockProfile(auditUser) as unknown as Record<string, unknown>,
        isLoading: false,
        isMissing: false,
        isUnavailable: false,
        source: "localStorage",
      };
    }
  }

  if (auth?.authLoading || auth?.profileLoading || !auth?.authStateResolved) {
    return { profile: null, isLoading: true, isMissing: false, isUnavailable: false, source: "none" };
  }

  if (auth?.userProfile) {
    const profile = auth.userProfile as unknown as Record<string, unknown>;
    if (authUid && profile.uid !== authUid) {
      console.error("[USER DATA MISMATCH BLOCKED]", { reason: "auth_context_uid_mismatch", authUid, profileUid: profile.uid });
      return { profile: null, isLoading: false, isMissing: true, isUnavailable: false, source: "none" };
    }
    if (!authUid || isCompletedProfileForUser(authUid, profile)) {
      return { profile, isLoading: false, isMissing: false, isUnavailable: false, source: "authContext" };
    }
  }

  if (authUid) {
    // DS-2C3: a cold or stale AuthContext must reconcile against the server before
    // a feature page can classify this user as missing/incomplete and route to
    // /setup. refreshUserProfile owns the authoritative read and hydrates context.
    if (auth?.refreshUserProfile) {
      try {
        const refreshed = await auth.refreshUserProfile() as Record<string, unknown> | null;
        if (refreshed) {
          if (refreshed.uid !== authUid) {
            console.error("[USER DATA MISMATCH BLOCKED]", { reason: "refreshed_profile_uid_mismatch" });
            return { profile: null, isLoading: false, isMissing: true, isUnavailable: false, source: "none" };
          }
          return { profile: refreshed, isLoading: false, isMissing: false, isUnavailable: false, source: "authContext" };
        }
      } catch {
        return { profile: null, isLoading: false, isMissing: false, isUnavailable: true, source: "none" };
      }
    }

    if (auth?.userProfile) {
      return {
        profile: auth.userProfile as unknown as Record<string, unknown>,
        isLoading: false,
        isMissing: false,
        isUnavailable: false,
        source: "authContext",
      };
    }

    // DS-2C1: getUserProfile now propagates genuine read failures; this feature-page
    // resolver keeps its prior semantics (unresolved read -> treated as missing below).
    const providerProfile = await storageProvider.getUserProfile().catch(() => null);
    console.log("[USER DATA LOAD]", {
      hasAuthenticatedUser: true,
      source: "resolveActiveProfile:storageProvider",
      profileExists: !!providerProfile,
    });

    if (providerProfile) {
      if (providerProfile.uid !== authUid) {
        console.error("[USER DATA MISMATCH BLOCKED]", { reason: "storage_provider_uid_mismatch", authUid, profileUid: providerProfile.uid });
        return { profile: null, isLoading: false, isMissing: true, isUnavailable: false, source: "none" };
      }
      return { profile: providerProfile as unknown as Record<string, unknown>, isLoading: false, isMissing: false, isUnavailable: false, source: "storageProvider" };
    }
  }

  // Strictly no fallback to unscoped localStorage if we have an auth user
  if (authUid) {
    return { profile: null, isLoading: false, isMissing: true, isUnavailable: false, source: "none" };
  }

  // If no auth user, we check for ANY scoped profile to determine if we should redirect to setup/login
  // but we don't return it as "active" unless it's properly resolved.
  return { profile: null, isLoading: false, isMissing: true, isUnavailable: false, source: "none" };
}
