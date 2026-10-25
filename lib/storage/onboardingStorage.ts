import { Preferences } from "@capacitor/preferences";

export const ONBOARDING_WALKTHROUGH_KEY = "bhumi:onboarding:walkthrough:v1";

export async function hasSeenOnboardingWalkthrough(): Promise<boolean> {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const { value } = await Preferences.get({ key: ONBOARDING_WALKTHROUGH_KEY });
    if (value === "true") {
      return true;
    }
  } catch {
    // Preferences unavailable, fallback to localStorage below
  }

  try {
    return window.localStorage.getItem(ONBOARDING_WALKTHROUGH_KEY) === "true";
  } catch {
    return false;
  }
}

export async function setHasSeenOnboardingWalkthrough(seen: boolean = true): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  const valStr = seen ? "true" : "false";

  try {
    await Preferences.set({ key: ONBOARDING_WALKTHROUGH_KEY, value: valStr });
  } catch {
    // Ignore native preference error and continue to localStorage
  }

  try {
    window.localStorage.setItem(ONBOARDING_WALKTHROUGH_KEY, valStr);
  } catch {
    // Ignore storage quota or access errors
  }
}
