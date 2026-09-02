import type { UserProfile } from "@/lib/repositories/userRepository";

/**
 * Build 106 new-user lifecycle gate — authoritative-state helpers
 * (BUILD_106_MASTER_SOT.md §4.1 / BUILD_106_RECOVERY_MATRIX.md "New-user lifecycle gate").
 *
 * Two Invariants close the remaining onboarding holes:
 *
 *  D  Setup completion is verified against authoritative persisted state, never
 *     against localStorage alone. Audit/dev identities — whose Firestore writes
 *     are permission-denied by design — fall back to the local mirror.
 *
 *  G  Before an authenticated surface routes a user toward first-time /setup
 *     because the *cached* profile looks incomplete, it reconciles against
 *     authoritative server state. If the server says setup is complete, the
 *     surface hydrates from it and converges the cache; it only routes to
 *     /setup when the server also says incomplete.
 *
 * Both functions are pure so they can be unit-tested without AuthContext,
 * storageProvider, or a live Firestore (see tests/unit/build106-authoritative-profile-gate.test.ts).
 */

type MinimalProfile = { uid?: string | null; setupCompleted?: boolean | null };

export type SetupPersistenceSource = "server" | "audit-local" | "none";

export interface SetupPersistenceVerdict {
  ok: boolean;
  source: SetupPersistenceSource;
  reason: string;
}

export function verifySetupPersisted(input: {
  uid: string;
  isAudit: boolean;
  serverProfile: MinimalProfile | null | undefined;
  serverBlueprintPresent: boolean;
  localProfile: MinimalProfile | null | undefined;
  localBlueprintPresent: boolean;
}): SetupPersistenceVerdict {
  const {
    uid,
    isAudit,
    serverProfile,
    serverBlueprintPresent,
    localProfile,
    localBlueprintPresent,
  } = input;

  if (isAudit) {
    const uidOk = localProfile?.uid == null || localProfile.uid === uid;
    const ok = localProfile?.setupCompleted === true && localBlueprintPresent && uidOk;
    return {
      ok,
      source: ok ? "audit-local" : "none",
      reason: ok
        ? "audit local mirror confirms setupCompleted + blueprint"
        : "audit local mirror missing setupCompleted / blueprint / uid mismatch",
    };
  }

  if (serverProfile?.uid != null && serverProfile.uid !== uid) {
    return { ok: false, source: "none", reason: "server profile uid mismatch" };
  }
  if (serverProfile?.setupCompleted !== true) {
    return { ok: false, source: "none", reason: "server profile setupCompleted is not true" };
  }
  if (!serverBlueprintPresent) {
    return { ok: false, source: "none", reason: "server blueprint not persisted" };
  }
  return {
    ok: true,
    source: "server",
    reason: "authoritative server state confirms setupCompleted + blueprint",
  };
}

export type CachedProfileReconcileAction = "use-cached" | "hydrate-from-server" | "incomplete";

export interface CachedProfileReconcile {
  profile: UserProfile | null;
  action: CachedProfileReconcileAction;
  shouldPersistCache: boolean;
}

export function reconcileCachedProfileWithServer(input: {
  uid: string;
  cached: UserProfile | null | undefined;
  server: UserProfile | null | undefined;
}): CachedProfileReconcile {
  const { uid, cached, server } = input;

  if (cached && cached.uid === uid && cached.setupCompleted === true) {
    return { profile: cached, action: "use-cached", shouldPersistCache: false };
  }

  const serverUidOk = server?.uid == null || server.uid === uid;
  if (server && serverUidOk && server.setupCompleted === true) {
    return {
      profile: { ...server, uid } as UserProfile,
      action: "hydrate-from-server",
      shouldPersistCache: true,
    };
  }

  return { profile: null, action: "incomplete", shouldPersistCache: false };
}
