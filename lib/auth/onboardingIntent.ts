export type OnboardingIntent = "register" | "login";

const ONBOARDING_INTENT_KEY = "bhumi.onboardingIntent";
const LEGACY_INTENT_KEYS = [
  ONBOARDING_INTENT_KEY,
  "bhumiOnboardingIntent",
  "authIntent",
  "loginIntent",
  "registerIntent",
];
const PRESERVED_LOCAL_STORAGE_KEYS = new Set(["bhumiLanguage", "bhumi-language"]);
const PRESERVED_SESSION_STORAGE_KEYS = new Set([ONBOARDING_INTENT_KEY, "bhumi.googleRedirectPending"]);

export function setOnboardingIntent(intent: OnboardingIntent) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ONBOARDING_INTENT_KEY, intent);
}

export function getOnboardingIntent(): OnboardingIntent | null {
  if (typeof window === "undefined") return null;
  const intent = window.sessionStorage.getItem(ONBOARDING_INTENT_KEY);
  return intent === "register" || intent === "login" ? intent : null;
}

export function clearOnboardingIntent() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_INTENT_KEYS) {
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  }
}

export function clearBhumiAuthCache() {
  if (typeof window === "undefined") return;

  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("bhumi") && !PRESERVED_LOCAL_STORAGE_KEYS.has(key)) {
      window.localStorage.removeItem(key);
    }
  }

  window.localStorage.removeItem("setupCompleted");

  for (const key of Object.keys(window.sessionStorage)) {
    if (key.startsWith("bhumi") && !PRESERVED_SESSION_STORAGE_KEYS.has(key)) {
      window.sessionStorage.removeItem(key);
    }
  }
}

export function clearBhumiSessionForSignOut() {
  if (typeof window === "undefined") return;
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearOnboardingIntent();
  console.log("[SIGN OUT CLEAR]", {
    localStorageCleared: true,
    sessionStorageCleared: true,
    intentsCleared: true,
  });
}
