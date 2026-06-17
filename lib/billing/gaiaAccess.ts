export const GAIA_ACCESS_END = new Date("2026-07-01T00:00:00+07:00");

export type GaiaAccessState = {
  accessStatus: "active" | "billing-managed";
  billingExpired: boolean;
  trialExpired: boolean;
  canAccessCoreFeatures: boolean;
  canAccessInnerwork: boolean;
  canAccessMeditation: boolean;
  canAccessAudio: boolean;
  canAccessJournal: boolean;
  canAccessWeeklyReport: boolean;
  overrideActive: boolean;
};

export function isGaiaAccessOverrideActive(now = new Date()): boolean {
  return now.getTime() < GAIA_ACCESS_END.getTime();
}

export function getGaiaAccessState(now = new Date()): GaiaAccessState {
  const overrideActive = isGaiaAccessOverrideActive(now);
  return {
    accessStatus: overrideActive ? "active" : "billing-managed",
    billingExpired: false,
    trialExpired: false,
    // After the override, billing-specific gates decide access. These flags must
    // remain neutral so merging this state cannot blanket-lock every user.
    canAccessCoreFeatures: true,
    canAccessInnerwork: true,
    canAccessMeditation: true,
    canAccessAudio: true,
    canAccessJournal: true,
    canAccessWeeklyReport: true,
    overrideActive,
  };
}

export function applyGaiaAccessOverride<T extends Record<string, unknown>>(profile: T, now = new Date()): T & GaiaAccessState {
  const state = getGaiaAccessState(now);
  return { ...profile, ...state };
}
