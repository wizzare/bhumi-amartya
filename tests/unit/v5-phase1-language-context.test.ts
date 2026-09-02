import { normalizeLocale, getDictionaryKey, DEFAULT_LOCALE } from "../../lib/locale/normalizeLocale";

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`[FAIL] ${message}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
  console.log(`[PASS] ${message}`);
}

function runTests() {
  console.log("=== RUNNING V5 PHASE 1 LANGUAGE CONTEXT UNIT TESTS ===");

  // 1. Canonical inputs
  assertEqual(normalizeLocale("id-ID"), "id-ID", "Canonical id-ID returns id-ID");
  assertEqual(normalizeLocale("en-US"), "en-US", "Canonical en-US returns en-US");
  assertEqual(normalizeLocale("ms-MY"), "ms-MY", "Canonical ms-MY returns ms-MY");

  // 2. Legacy short code inputs
  assertEqual(normalizeLocale("id"), "id-ID", "Legacy 'id' normalizes to id-ID");
  assertEqual(normalizeLocale("en"), "en-US", "Legacy 'en' normalizes to en-US");
  assertEqual(normalizeLocale("ms"), "ms-MY", "Legacy 'ms' normalizes to ms-MY");

  // 3. Variations and case insensitivity
  assertEqual(normalizeLocale("ID"), "id-ID", "Uppercase 'ID' normalizes to id-ID");
  assertEqual(normalizeLocale("EN-us"), "en-US", "Mixed case 'EN-us' normalizes to en-US");
  assertEqual(normalizeLocale("ms_MY"), "ms-MY", "Underscore 'ms_MY' normalizes to ms-MY");

  // 4. Invalid and empty values
  assertEqual(normalizeLocale(""), DEFAULT_LOCALE, "Empty string returns DEFAULT_LOCALE (id-ID)");
  assertEqual(normalizeLocale(null), DEFAULT_LOCALE, "null returns DEFAULT_LOCALE (id-ID)");
  assertEqual(normalizeLocale(undefined), DEFAULT_LOCALE, "undefined returns DEFAULT_LOCALE (id-ID)");
  assertEqual(normalizeLocale("invalid_locale_xyz"), DEFAULT_LOCALE, "Invalid locale string returns DEFAULT_LOCALE (id-ID)");
  assertEqual(normalizeLocale(12345), DEFAULT_LOCALE, "Non-string number returns DEFAULT_LOCALE (id-ID)");

  // 5. Dictionary Key mapping for backwards compatibility with translations.ts
  assertEqual(getDictionaryKey("id-ID"), "id", "id-ID maps to dictionary key 'id'");
  assertEqual(getDictionaryKey("en-US"), "en", "en-US maps to dictionary key 'en'");
  assertEqual(getDictionaryKey("ms-MY"), "ms", "ms-MY maps to dictionary key 'ms'");

  console.log("=== ALL V5 PHASE 1 LANGUAGE CONTEXT UNIT TESTS PASSED ===");
}

runTests();
