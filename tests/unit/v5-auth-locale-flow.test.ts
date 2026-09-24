import { normalizeLocale, getDictionaryKey } from "@/lib/locale/normalizeLocale";
import { translations } from "@/lib/data/translations";

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    console.error(`[FAIL] ${message}: Expected "${expected}", got "${actual}"`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

function assertExists(value: unknown, message: string) {
  if (value === undefined || value === null || value === "") {
    console.error(`[FAIL] ${message}: Value is missing or empty`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log("=== RUNNING V5 AUTH LOCALE FLOW & PRECEDENCE UNIT TESTS ===");

const locales = ["id-ID", "en-US", "ms-MY"] as const;

// 1. Verify Login Page Dictionary Keys across all 3 canonical locales
locales.forEach((loc) => {
  const dictKey = getDictionaryKey(loc);
  const t = translations[dictKey] as any;

  assertExists(t.login?.title, `[${loc}] login.title exists`);
  assertExists(t.login?.subtitle, `[${loc}] login.subtitle exists`);
  assertExists(t.login?.continueWithGoogle, `[${loc}] login.continueWithGoogle exists`);
  assertExists(t.login?.termsNotice, `[${loc}] login.termsNotice exists`);
  assertExists(t.login?.verifying, `[${loc}] login.verifying exists`);
});

// 2. Exact copy check for Login surface
// Build 110 Indonesian-only policy: en-US and ms-MY alias the id-ID bundle; all resolve to the Indonesian label.
assertEqual((translations[getDictionaryKey("en-US")] as any).login.continueWithGoogle, "Lanjutkan dengan Google", "EN Google login button label matches (id-ID alias per Build 110)");
assertEqual((translations[getDictionaryKey("ms-MY")] as any).login.continueWithGoogle, "Lanjutkan dengan Google", "MS Google login button label matches (id-ID alias per Build 110)");
assertEqual((translations[getDictionaryKey("id-ID")] as any).login.continueWithGoogle, "Lanjutkan dengan Google", "ID Google login button label matches");

// 3. Simulating Source-of-Truth Precedence Contract:
// Explicit active choice / session localStorage MUST take precedence over stale profile.language
function resolveActiveLocale(sessionSavedLocale: string | null, profileLocale: string | null): string {
  const activeSession = sessionSavedLocale ? normalizeLocale(sessionSavedLocale) : null;
  const userProfileLocale = profileLocale ? normalizeLocale(profileLocale) : null;

  // Active user session choice wins over stale profile default
  const effectiveLocale = activeSession || userProfileLocale || "id-ID";
  return getDictionaryKey(effectiveLocale);
}

// Test Precedence Scenarios:
// Scenario A: User selected English on Onboarding ("en-US"), profile has old "id"
assertEqual(resolveActiveLocale("en-US", "id"), "en", "Explicit en-US session choice beats stale profile 'id'");

// Scenario B: User selected Malay on Onboarding ("ms-MY"), profile has "en-US"
assertEqual(resolveActiveLocale("ms-MY", "en-US"), "ms", "Explicit ms-MY session choice beats profile 'en-US'");

// Scenario C: No session choice, profile has "en-US"
assertEqual(resolveActiveLocale(null, "en-US"), "en", "Profile 'en-US' used when no explicit session override exists");

// Scenario D: No session choice, no profile language
assertEqual(resolveActiveLocale(null, null), "id", "Default fallback is 'id'");

console.log("=== ALL V5 AUTH LOCALE FLOW UNIT TESTS PASSED ===");
