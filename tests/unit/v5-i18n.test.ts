import { readFileSync } from "node:fs";
import { translations } from "../../lib/data/translations";
import { resolveSchumannUiState, formatSchumannLocalTimestamp } from "../../lib/environment/schumann";
import { getDictionaryKey, normalizeLocale } from "../../lib/locale/normalizeLocale";

let passed = 0;
let failed = 0;
function test(label: string, condition: boolean) {
  if (condition) { passed += 1; console.log(`PASS: ${label}`); }
  else { failed += 1; console.error(`FAIL: ${label}`); }
}

const SHORTS = ["id", "en", "ms"] as const;

test("normalize id variants -> id-ID", normalizeLocale("id") === "id-ID" && normalizeLocale("id-ID") === "id-ID");
test("normalize en variants -> en-US", normalizeLocale("en") === "en-US" && normalizeLocale("en-US") === "en-US");
test("normalize ms variants -> ms-MY", normalizeLocale("ms") === "ms-MY" && normalizeLocale("ms-my") === "ms-MY");
test("dictionary keys map", getDictionaryKey("id-ID") === "id" && getDictionaryKey("en-US") === "en" && getDictionaryKey("ms-MY") === "ms");

for (const tag of ["id-ID", "en-US", "ms-MY"] as const) {
  const bundle = JSON.parse(readFileSync(`src/locales/${tag}/translation.json`, "utf8"));
  test(`${tag} bundle has core sections`, ["welcome", "login", "dashboard", "settings", "premiumBhumi", "astroToday", "environment"].every((key) => Boolean(bundle[key])));
}

test("id welcome title", translations.id.welcome.title === "Bhumi Amartya");
test("en premium localized", translations.en.premiumBhumi.subscriptionNote.includes("Rp25.000/month"));
test("ms environment localized", translations.ms.environment.title === "Keadaan Persekitaran");
test("ms fallback chain materializes a welcome title", typeof translations.ms.welcome?.title === "string" && translations.ms.welcome.title.length > 0);
test("compat store exposes all supported codes", Boolean(translations.id && translations.en && translations.ms));

const RAW_KEY_RE = /^t\.[A-Za-z]+$/;
function containsNoRawKeys(value: unknown): boolean {
  if (typeof value === "string") return !RAW_KEY_RE.test(value);
  if (value && typeof value === "object") return Object.values(value).every(containsNoRawKeys);
  return true;
}
for (const short of SHORTS) test(`${short}: no raw t.* values`, containsNoRawKeys(translations[short]));

const environmentCard = readFileSync("components/dashboard/EnvironmentContextCard.tsx", "utf8");
test("environment card has no bare translation-key text nodes", !/>\s*t\.[A-Za-z]+\s*</.test(environmentCard) && !/^[ \t]*t\.[A-Za-z]+[ \t]*\r?$/m.test(environmentCard));
test("short codes exactly match AI locale contract", JSON.stringify([...SHORTS].sort()) === JSON.stringify(["en", "id", "ms"]));

for (const short of SHORTS) {
  const environment = translations[short].environment;
  test(`${short}: Schumann, geomagnetic, and model labels exist`, Boolean(environment.fSchumann && environment.fGeomagnetic && environment.disclosureModel));
}
test("Indonesian insufficient-history copy is honest", translations.id.environment.insufficient.includes("Belum cukup data"));
test("Indonesian stale-state copy exists", Boolean(translations.id.environment.lastKnownLabel));

for (const short of SHORTS) {
  const astro = translations[short].astroToday;
  test(`${short}: Astro planet and eclipse labels exist`, Boolean(astro.planets?.Sun && astro.eclipseGlobalNext));
}
test("Premium price copy exists in all locales",
  translations.id.premiumBhumi.subscriptionNote.includes("Rp25.000/bulan")
  && translations.en.premiumBhumi.subscriptionNote.includes("Rp25.000/month")
  && translations.ms.premiumBhumi.subscriptionNote.includes("Rp25.000/bulan"));

const now = Date.parse("2026-08-24T10:00:00Z");
test("Schumann snapshot state keeps zero-hour history honest", resolveSchumannUiState(
  { updatedAtIso: new Date(now - 60_000).toISOString() },
  [{ t: now - 60_000, f: [7.79, null, null, null, null] }],
  now,
).kind === "snapshot");
test("Schumann timestamp uses profile timezone", formatSchumannLocalTimestamp("2026-08-24T09:50:05Z", "Asia/Jakarta").includes("16.50"));

console.log(`\nV5_I18N_TESTS: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
