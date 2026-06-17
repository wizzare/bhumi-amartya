import type { UserProfile as StorageUserProfile } from "@/lib/firebase/service";
import type { UserProfile as RepoUserProfile } from "@/lib/repositories/userRepository";
import type { CoreIdentity, UserProfile as DashboardUserProfile } from "@/lib/data/types";
import type { Blueprint } from "@/lib/types/blueprint";
import { getCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";

/**
 * Maps a repository UserProfile to a simplified Dashboard user view.
 */
export function profileToDashboardUser(profile: any): DashboardUserProfile {
  const p = profile;
  return {
    uid: p.uid,
    name: p.fullName || p.displayName || "Jiwa",
    birthDate: p.birthDate || p.profile?.blueprintInput?.birthDate || "",
    birthTime: p.birthTime || p.profile?.blueprintInput?.birthTime || "",
    birthPlace: p.birthPlace || p.birthCity || p.profile?.blueprintInput?.birthCity || "",
    timezone: p.timezone || "UTC",
    language: p.language || p.profile?.language || "id",
    createdAt: p.createdAt?.toString?.() || new Date().toISOString(),
    lastActive: p.lastSeen?.toString?.() || new Date().toISOString(),
    email: p.email || "",
    guardianRole: p.guardianRole || p.role || "user",
  };
}

/**
 * Maps a profile and blueprint to the CoreIdentity used by logic engines.
 */
export function profileToCoreIdentity(profile: any, blueprint: Blueprint): CoreIdentity {
  const b = blueprint as any;
  const humanDesign = getCanonicalHumanDesign(b.humanDesign);

  return {
    name: profile.fullName || profile.displayName || "Jiwa",
    sunSign: b.astrology?.sunSign || b.sunSign?.sign || "Unknown",
    moonSign: b.astrology?.moonSign || "Unknown",
    lifePath: Number(b.lifePath?.number || 0),
    lifePathArchetype: b.lifePath?.archetype || "Explorer",
    humanDesign: humanDesign?.type || "",
    humanDesignProfile: humanDesign?.profile || "",
    arcanaCenter: Number(b.destinyMatrix?.center || 0),
    arcanaMeaning: b.destinyMatrix?.centerMeaning || "Purpose",
  };
}
