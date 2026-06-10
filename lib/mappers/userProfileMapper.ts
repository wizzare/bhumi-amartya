import type { CoreIdentity, UserProfile as DashboardUserProfile } from "@/lib/data/types";
import type { UserProfile } from "@/lib/types/user";
import type { Blueprint } from "@/lib/types/blueprint";

const lifePathArchetypes: Record<number, string> = {
  1: "The Pioneer",
  2: "The Harmonizer",
  3: "The Communicator",
  4: "The Builder",
  5: "The Explorer",
  6: "The Nurturer",
  7: "The Seeker",
  8: "The Manifestor",
  9: "The Humanitarian",
};

const arcanaMeanings: Record<number, string> = {
  0: "The Fool - trust, openness, and new beginnings",
  1: "The Magician - will, focus, and creation",
  2: "The High Priestess - intuition and inner knowing",
  3: "The Empress - nourishment and embodied creativity",
  4: "The Emperor - structure and stewardship",
  5: "The Hierophant - devotion and living wisdom",
  6: "The Lovers - alignment and sacred choice",
  7: "The Chariot - direction and emotional mastery",
  8: "Strength - courage and compassionate power",
  9: "The Hermit - contemplation and inner light",
  10: "Wheel of Fortune - cycles and right timing",
  11: "Justice - balance and truthful action",
  12: "The Hanged One - surrender and perspective",
  13: "Death - transformation and release",
  14: "Temperance - balance and integration",
  15: "The Devil - shadow, desire, and liberation",
  16: "The Tower - awakening and necessary change",
  17: "The Star - healing and renewed faith",
  18: "The Moon - dreams, emotion, and subconscious truth",
  19: "The Sun - vitality and clear expression",
  20: "Judgement - calling and self-recognition",
  21: "The World - completion and embodiment",
};

function displayName(profile: UserProfile): string {
  return profile.fullName || profile.displayName || profile.profile?.fullName || profile.profile?.displayName || "Dirimu";
}

export function profileToDashboardUser(profile: UserProfile): DashboardUserProfile {
  const safeProfile = profile || {};
  const nestedProfile = safeProfile.profile ?? {};
  const blueprintInput = nestedProfile.blueprintInput ?? {};
  return {
    id: safeProfile.uid || "",
    name: displayName(safeProfile as any),
    birthDate: safeProfile.birthDate || blueprintInput.birthDate || "",
    birthTime: safeProfile.birthTime || blueprintInput.birthTime || "",
    birthPlace: safeProfile.birthCity || blueprintInput.birthCity || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    language: nestedProfile.language ?? safeProfile.language ?? "id",
    createdAt: nestedProfile.createdAt ?? safeProfile.createdAt ?? new Date().toISOString(),
    lastActive: new Date().toISOString(),
    email: nestedProfile.email || safeProfile.email || undefined,
  };
}

export function profileToCoreIdentity(profile: UserProfile, blueprint: Blueprint): CoreIdentity {
  const safeBlueprint = blueprint || {};
  const lifePath = safeBlueprint.lifePath ?? safeBlueprint.numerology;
  const natalChart = safeBlueprint.natalChart ?? safeBlueprint.astrology;
  const arcanaCenter = safeBlueprint.destinyMatrix?.center ?? safeBlueprint.destinyMatrix?.arcanaCenter ?? 0;
  const hasVerifiedHumanDesign =
    safeBlueprint.humanDesign?.status === "ready" ||
    safeBlueprint.humanDesign?.status === "verified";

  return {
    name: profile?.fullName || profile?.displayName || "Soul",
    lifePath: lifePath?.number ?? 0,
    lifePathArchetype: lifePath?.role ?? "Pending",
    arcanaCenter,
    arcanaMeaning: "Soul Core",
    sunSign: natalChart?.sunSign ?? "Pending",
    moonSign: natalChart?.moonSign ?? "Pending",
    risingSign: natalChart?.risingSign ?? "Pending",
    humanDesign: hasVerifiedHumanDesign ? safeBlueprint.humanDesign?.type || "Pending" : "Pending",
    humanDesignProfile: hasVerifiedHumanDesign ? safeBlueprint.humanDesign?.profile || "Pending" : "Pending",
  };
}
