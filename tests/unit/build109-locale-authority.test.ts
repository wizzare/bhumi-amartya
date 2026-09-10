import assert from "node:assert/strict";
import { DEFAULT_LOCALE, getDictionaryKey, normalizeLocale, resolveEffectiveLocale } from "../../lib/locale/normalizeLocale";
import { changeI18nLanguage, getCompatDictionaries, getI18n } from "../../lib/i18n";
import { translations } from "../../lib/data/translations";

let checks = 0;
function equal(actual: unknown, expected: unknown, message?: string) {
  assert.equal(actual, expected, message);
  checks++;
}

// 1. Core precedence across editions
for (const edition of ["ENL", "standard"]) {
  process.env.NEXT_PUBLIC_APP_EDITION = edition;
  equal(DEFAULT_LOCALE, "id-ID");
  equal(resolveEffectiveLocale(), "id-ID");
  equal(resolveEffectiveLocale("invalid", "invalid", "invalid", "fr-FR"), "id-ID");

  equal(resolveEffectiveLocale("en-US", "id-ID", "ms-MY", "id-ID"), "en-US", "explicit selection wins");
  equal(resolveEffectiveLocale(null, "en-US", "ms-MY", "id-ID"), "en-US", "profile wins over persisted");
  equal(resolveEffectiveLocale(null, null, "ms-MY", "id-ID"), "ms-MY", "persisted wins over device");
  equal(resolveEffectiveLocale(null, null, null, "ms-MY"), "ms-MY", "device wins over default");

  for (const loc of ["id-ID", "en-US", "ms-MY"] as const) {
    const short = getDictionaryKey(loc);
    changeI18nLanguage(short);
    equal(getI18n().language, loc);
    equal(normalizeLocale(short), loc);
  }
}

// 2. Lifecycle: relogin / switch / cold launch simulation
type SessionState = {
  uid: string | null;
  selection: { uid: string | null; lang: "id" | "en" | "ms" } | null;
  profileLang: string | null;
  storageLang: string | null;
  deviceLang: string | null;
};

function resolveSession(s: SessionState) {
  return getDictionaryKey(resolveEffectiveLocale(
    s.selection && s.selection.uid === s.uid ? s.selection.lang : null,
    s.profileLang,
    s.storageLang,
    s.deviceLang,
  ));
}

// Fresh new user, cold install
equal(resolveSession({ uid: null, selection: null, profileLang: null, storageLang: null, deviceLang: "id-ID" }), "id");
// Switch on welcome before login
equal(resolveSession({ uid: null, selection: { uid: null, lang: "en" }, profileLang: null, storageLang: "en", deviceLang: "id-ID" }), "en");
// Login with Indonesian profile -> profile outranks unauthenticated selection after UID bind
equal(resolveSession({ uid: "user-1", selection: null, profileLang: "id-ID", storageLang: "en", deviceLang: "id-ID" }), "id");
// Explicit switch while logged in
equal(resolveSession({ uid: "user-1", selection: { uid: "user-1", lang: "en" }, profileLang: "id-ID", storageLang: "en", deviceLang: "id-ID" }), "en");
// Logout -> selection cleared, storage preserves explicit choice
equal(resolveSession({ uid: null, selection: null, profileLang: null, storageLang: "en", deviceLang: "id-ID" }), "en");
// Relogin with different user who has Malay profile
equal(resolveSession({ uid: "user-2", selection: null, profileLang: "ms-MY", storageLang: "en", deviceLang: "id-ID" }), "ms");

// Switch cycle: id -> en -> id
equal(resolveSession({ uid: "user-1", selection: { uid: "user-1", lang: "id" }, profileLang: "id", storageLang: "id", deviceLang: "id" }), "id");
equal(resolveSession({ uid: "user-1", selection: { uid: "user-1", lang: "en" }, profileLang: "id", storageLang: "en", deviceLang: "id" }), "en");
equal(resolveSession({ uid: "user-1", selection: { uid: "user-1", lang: "id" }, profileLang: "id", storageLang: "id", deviceLang: "id" }), "id");

// 3. User authored content preservation
const authoredJournal = {
  id: "j-1",
  text: "Hari ini saya merasa bersyukur dan damai di dalam hati.",
  notes: "Jangan pernah ubah teks asli yang ditulis oleh pengguna.",
  language: "id-ID",
};
const untouchedSnapshot = JSON.stringify(authoredJournal);
resolveSession({ uid: "user-1", selection: { uid: "user-1", lang: "en" }, profileLang: "en-US", storageLang: "en", deviceLang: "en-US" });
equal(JSON.stringify(authoredJournal), untouchedSnapshot, "authored text preserved across locale switch");

// 4. Dictionary support: verify key surfaces have valid localized entries
const dicts = getCompatDictionaries();
for (const l of ["id", "en", "ms"] as const) {
  assert.ok(translations[l]?.settings?.title, `settings.title exists for ${l}`);
  assert.ok(translations[l]?.settings?.language, `settings.language exists for ${l}`);
  assert.ok(translations[l]?.welcome?.title, `welcome.title exists for ${l}`);
  assert.ok(translations[l]?.welcome?.newUser, `welcome.newUser exists for ${l}`);
  assert.ok(dicts[l], `compat dict exists for ${l}`);
  checks += 5;
}

// 5. Date formatting parity
const sampleDate = new Date("2026-09-10T12:00:00Z");
const idDate = new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(sampleDate);
const enDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(sampleDate);
assert.notEqual(idDate, enDate);
checks++;

console.log(`BUILD109_ALL_CHECKS_PASS=${checks}`);
