/**
 * Build 106 — localization foundation (Recovery Matrix R-29 / R-30 / R-33 / R-34, D-V5-35).
 *
 * Proves the recovered CP-036 i18n foundation:
 *   - id / en / ms are the CURRENT locales; es/pt/fr are never loaded (DEFERRED).
 *   - fallback chain active -> en -> id-ID is materialized in the compat store.
 *   - swapping lib/data/translations.ts to the getCompatDictionaries() shim loses
 *     no key that Build 105 UI consumed (curated leaf-path guard).
 *   - `translations["ms"]` resolves (no phantom-dict crash — the R-29 regression).
 *   - normalizeLocale round-trips the profile-persistence value.
 *
 * Runner: tsx tests/unit/build106-i18n-foundation.test.ts   (no env / no emulator)
 */
import assert from "node:assert";

import { translations } from "../../lib/data/translations.ts";
import {
  getI18n,
  SUPPORTED_LOCALES,
  DEFAULT_SHORT,
  deepMerge,
  getCompatDictionaries,
} from "../../lib/i18n/index.ts";
import { normalizeLocale, getDictionaryKey } from "../../lib/locale/normalizeLocale.ts";

let assertions = 0;
function ok(cond: unknown, msg: string): void {
  assertions += 1;
  assert.ok(cond, msg);
}
function eq<T>(a: T, b: T, msg: string): void {
  assertions += 1;
  assert.strictEqual(a, b, msg);
}

const SHORTS = ["id", "en", "ms"] as const;

// Curated leaf paths actually read by Build 105 UI via translations[language].section.key
const CONSUMED_PATHS = [
  "welcome.title", "welcome.subtitle", "welcome.newUser", "welcome.returningUser", "welcome.melayu",
  "login.title", "login.subtitle", "login.continueWithGoogle", "login.termsNotice", "login.verifying",
  "login.popupTimeout", "login.popupBlocked", "login.genericError",
  "setup.title", "setup.subtitle", "setup.fullName", "setup.birthDate", "setup.birthTime", "setup.birthPlace",
  "dashboard.lifePath", "dashboard.coreIdentity", "dashboard.sunSign", "dashboard.arcanaCenter",
  "common.signOut", "nav.lainnya",
  "premiumBhumi.subscriptionNote",
];

function leaf(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

/* ------------------------------------------------- 1. locale scope (D-V5-35) */
function testLocaleScope(): void {
  eq(SUPPORTED_LOCALES.length, 3, "exactly three CURRENT locales");
  eq(SUPPORTED_LOCALES.map((l) => l.tag).sort().join(","), "en-US,id-ID,ms-MY", "tags are id-ID / en-US / ms-MY");
  eq(DEFAULT_SHORT, "id", "default short code is id");
  const i18n = getI18n();
  const resourceTags = Object.keys((i18n.options.resources ?? {}) as Record<string, unknown>).sort();
  eq(resourceTags.join(","), "en-US,id-ID,ms-MY", "i18next loads ONLY the three current bundles");
  for (const deferred of ["es-ES", "pt-BR", "fr-FR", "es", "pt", "fr"]) {
    ok(!(deferred in ((i18n.options.resources ?? {}) as Record<string, unknown>)), `deferred locale ${deferred} is never loaded`);
  }
  console.log("  locale scope (D-V5-35) ......................... PASS");
}

/* ------------------------------------------------- 2. fallback chain active->en->id */
function testFallbackChain(): void {
  const fb = getI18n().options.fallbackLng as Record<string, string[]>;
  eq(JSON.stringify(fb.ms), JSON.stringify(["en", "id"]), "ms falls back to en then id");
  eq(JSON.stringify(fb.en), JSON.stringify(["id"]), "en falls back to id");
  eq(JSON.stringify(fb.default), JSON.stringify(["en"]), "unknown falls back to en");

  // deepMerge priority: later source wins; used to build the compat store.
  const merged = deepMerge({ a: 1, nest: { x: 1, y: 1 } }, { a: 2, nest: { y: 2, z: 2 } });
  eq((merged as any).a, 2, "deepMerge: later scalar wins");
  eq((merged as any).nest.x, 1, "deepMerge: untouched nested key kept");
  eq((merged as any).nest.y, 2, "deepMerge: later nested key wins");
  eq((merged as any).nest.z, 2, "deepMerge: later-only nested key added");

  // In the compat store, a key present only in one locale still surfaces for the
  // other two via the id<-en<-active merge.
  const compat = getCompatDictionaries();
  for (const s of SHORTS) {
    ok(typeof compat[s].welcome?.title === "string" && compat[s].welcome.title.length > 0,
      `compat ${s}: welcome.title resolves through the merge`);
  }
  console.log("  fallback chain active->en->id ................. PASS");
}

/* ------------------------------------------------- 3. no key loss vs legacy consumption */
function testNoKeyLoss(): void {
  for (const s of SHORTS) {
    for (const path of CONSUMED_PATHS) {
      const v = leaf((translations as any)[s], path);
      ok(typeof v === "string" && v.trim().length > 0, `translations.${s}.${path} is a non-empty string`);
    }
  }
  // top-level section parity across the three codes
  const sections = (code: string) => Object.keys((translations as any)[code]).sort().join(",");
  eq(sections("id"), sections("en"), "id and en expose the same top-level sections");
  eq(sections("id"), sections("ms"), "id and ms expose the same top-level sections");
  console.log("  no key loss vs legacy consumption ............. PASS");
}

/* ------------------------------------------------- 4. R-29: ms is not a phantom/crash */
function testMsNotPhantom(): void {
  ok(!!(translations as any).ms, "translations.ms exists");
  // The Build 105 regression: reaching translations['ms'].<section>.<key> threw
  // because ms was unreachable / empty. It must now resolve without throwing.
  assertions += 1;
  assert.doesNotThrow(() => {
    const v = (translations as any).ms.welcome.title + (translations as any).ms.login.continueWithGoogle;
    if (typeof v !== "string" || !v) throw new Error("ms strings empty");
  }, "translations.ms deep access does not throw and is populated");
  eq((translations as any).ms.login.continueWithGoogle, "Teruskan dengan Google", "ms login CTA is the Malay string");
  console.log("  R-29: ms locale is real, not a phantom ........ PASS");
}

/* ------------------------------------------------- 5. R-33: profile-persist value shape */
function testProfilePersistValue(): void {
  // LanguageContext.changeLanguage persists normalizeLocale(short) to the profile.
  eq(normalizeLocale("id"), "id-ID", "short id -> id-ID for the profile");
  eq(normalizeLocale("en"), "en-US", "short en -> en-US for the profile");
  eq(normalizeLocale("ms"), "ms-MY", "short ms -> ms-MY for the profile");
  // and the read path maps any stored form back to a short code
  eq(getDictionaryKey("ms-MY"), "ms", "stored ms-MY reads back as ms");
  eq(getDictionaryKey("en_US"), "en", "underscore tag reads back as en");
  console.log("  R-33: profile-persist value shape ............ PASS");
}

function run(): void {
  console.log("build106-i18n-foundation:");
  testLocaleScope();
  testFallbackChain();
  testNoKeyLoss();
  testMsNotPhantom();
  testProfilePersistValue();
  console.log(`PASS build106-i18n-foundation (${assertions} assertions)`);
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
