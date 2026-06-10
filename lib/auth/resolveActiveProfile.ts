import { storageProvider } from "@/lib/storage/storageProvider";
import { safeJsonParse } from "@/lib/storage/safeJson";

export type ResolvedProfileResult = {
  profile: Record<string, unknown> | null;
  isLoading: boolean;
  isMissing: boolean;
  source: "authContext" | "storageProvider" | "localStorage" | "none";
};

type AuthLike = {
  user?: unknown;
  userProfile?: unknown;
  authLoading?: boolean;
  profileLoading?: boolean;
  authStateResolved?: boolean;
} | null | undefined;

export async function resolveActiveProfile(auth?: AuthLike): Promise<ResolvedProfileResult> {
  if (auth?.authLoading || auth?.profileLoading || !auth?.authStateResolved) {
    return { profile: null, isLoading: true, isMissing: false, source: "none" };
  }

  const authUid = (auth?.user as { uid?: string } | undefined)?.uid;

  if (auth?.userProfile) {
    const profile = auth.userProfile as unknown as Record<string, unknown>;
    if (authUid && profile.uid !== authUid) {
      console.error("[USER DATA MISMATCH BLOCKED]", { reason: "auth_context_uid_mismatch", authUid, profileUid: profile.uid });
      return { profile: null, isLoading: false, isMissing: true, source: "none" };
    }
    return { profile, isLoading: false, isMissing: false, source: "authContext" };
  }

  if (authUid) {
    const providerProfile = await storageProvider.getUserProfile();
    console.log("[USER DATA LOAD]", {
      uid: authUid,
      email: (auth?.user as { email?: string } | undefined)?.email ?? null,
      source: "resolveActiveProfile:storageProvider",
      profileExists: !!providerProfile,
    });

    if (providerProfile) {
      if (providerProfile.uid !== authUid) {
        console.error("[USER DATA MISMATCH BLOCKED]", { reason: "storage_provider_uid_mismatch", authUid, profileUid: providerProfile.uid });
        return { profile: null, isLoading: false, isMissing: true, source: "none" };
      }
      return { profile: providerProfile as unknown as Record<string, unknown>, isLoading: false, isMissing: false, source: "storageProvider" };
    }
  }

  // Strictly no fallback to unscoped localStorage if we have an auth user
  if (authUid) {
    return { profile: null, isLoading: false, isMissing: true, source: "none" };
  }

  // If no auth user, we check for ANY scoped profile to determine if we should redirect to setup/login
  // but we don't return it as "active" unless it's properly resolved.
  return { profile: null, isLoading: false, isMissing: true, source: "none" };
}
