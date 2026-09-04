/**
 * Build 108 ENL — Sprint 1 (Shell, Landing, Login, Setup) Unit & Invariant Test
 *
 * Verifies:
 * 1. Application edition configuration (`lib/config/edition.ts`).
 * 2. i18n initialization respects ENL edition (`lib/i18n/index.ts`).
 * 3. Locale dictionaries have 100% key parity for welcome, login, setup.
 * 4. Landing page (`app/page.tsx`) has no hardcoded Indonesian copy and hides switcher in ENL.
 * 5. Login page (`app/login/page.tsx`) has no hardcoded Indonesian copy in labels, buttons, or errors.
 * 6. Setup page (`app/setup/page.tsx`) has no hardcoded Indonesian copy in labels, errors, or loading states.
 * 7. Non-destructive profile continuity: ENL edition does not overwrite existing profile language.
 *
 * Runner: node --import tsx tests/unit/build108-sprint01-shell.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

import { getAppEdition, isEnlEdition } from "../../lib/config/edition.ts";
import { getCompatDictionaries, SUPPORTED_LOCALES, DEFAULT_SHORT } from "../../lib/i18n/index.ts";

let assertions = 0;
function ok(condition: unknown, msg: string): void {
  assertions += 1;
  assert.ok(condition, msg);
}
function eq<T>(a: T, b: T, msg: string): void {
  assertions += 1;
  assert.strictEqual(a, b, msg);
}

const ROOT = path.resolve(process.cwd());

/* ------------------------------------------------- 1. Edition Configuration */
function testEditionConfig(): void {
  const originalEnv = process.env.NEXT_PUBLIC_APP_EDITION;

  try {
    delete process.env.NEXT_PUBLIC_APP_EDITION;
    eq(getAppEdition(), "standard", "Default edition is standard when env unset");
    eq(isEnlEdition(), false, "isEnlEdition() is false by default");

    process.env.NEXT_PUBLIC_APP_EDITION = "ENL";
    eq(getAppEdition(), "ENL", "getAppEdition() returns ENL when env is ENL");
    eq(isEnlEdition(), true, "isEnlEdition() is true when env is ENL");
  } finally {
    if (originalEnv !== undefined) {
      process.env.NEXT_PUBLIC_APP_EDITION = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_APP_EDITION;
    }
  }

  console.log("  1. Edition configuration .......................... PASS");
}

/* ------------------------------------------------- 2. Dictionary Parity */
function testDictionaryParity(): void {
  const dicts = getCompatDictionaries();

  const requiredWelcomeKeys = [
    "title", "subtitle", "newUser", "returningUser",
    "connecting", "relogin", "connectionSlow", "reload"
  ];
  const requiredLoginKeys = [
    "title", "subtitle", "verifying", "errorTitle", "useRedirect",
    "connecting", "continueWithGoogle", "termsNotice",
    "popupTimeout", "popupBlocked", "popupClosed", "genericError"
  ];
  const requiredSetupKeys = [
    "title", "subtitle", "fullName", "birthDate", "birthTime", "birthPlace",
    "birthTimeRequired", "cityRequired", "saving", "goToDashboard",
    "mustLogin", "goToLogin", "blueprintSaveFailed", "verificationFailed",
    "aligningProfile", "profileLoadError", "genericError"
  ];

  for (const lang of ["en", "id", "ms"] as const) {
    const d = dicts[lang];
    ok(d.welcome, `welcome exists for ${lang}`);
    for (const key of requiredWelcomeKeys) {
      ok(typeof d.welcome[key] === "string" && d.welcome[key].length > 0, `welcome.${key} exists and non-empty for ${lang}`);
    }

    ok(d.login, `login exists for ${lang}`);
    for (const key of requiredLoginKeys) {
      ok(typeof d.login[key] === "string" && d.login[key].length > 0, `login.${key} exists and non-empty for ${lang}`);
    }

    ok(d.setup, `setup exists for ${lang}`);
    for (const key of requiredSetupKeys) {
      ok(typeof d.setup[key] === "string" && d.setup[key].length > 0, `setup.${key} exists and non-empty for ${lang}`);
    }
  }

  // English values must be fluent native English
  eq(dicts.en.welcome.newUser, "I Am New Here", "welcome.newUser in English");
  eq(dicts.en.welcome.returningUser, "I Already Have an Account", "welcome.returningUser in English");
  eq(dicts.en.login.continueWithGoogle, "Continue with Google", "login.continueWithGoogle in English");
  eq(dicts.en.setup.fullName, "Full Name", "setup.fullName in English");
  eq(dicts.en.setup.birthPlace, "Birth Place", "setup.birthPlace in English");
  eq(dicts.en.setup.goToDashboard, "Continue to Dashboard", "setup.goToDashboard in English");

  console.log("  2. Dictionary parity & English strings ............. PASS");
}

/* ------------------------------------------------- 3. Landing Page English Completeness */
function testLandingPageSource(): void {
  const landingPath = path.join(ROOT, "app", "page.tsx");
  const source = fs.readFileSync(landingPath, "utf-8");

  // Invariant: Landing page must import isEnlEdition and translations
  ok(source.includes("isEnlEdition"), "Landing imports isEnlEdition");
  ok(source.includes("translations"), "Landing imports translations");

  // Invariant: Language switcher is guarded
  ok(source.includes("!isEnlEdition()"), "Language switcher is hidden in ENL mode");

  // Invariant: No hardcoded Indonesian literals in UI render tree
  const forbiddenHardcoded = [
    ">Ruang Untuk Pulang dan Kenali Diri<",
    ">Pengguna Baru<",
    ">Saya Sudah Punya Akun<",
    ">Menghubungkan perjalanan...<",
    ">Sepertinya koneksi melambat atau sesi terganggu.<",
    ">Coba Lagi<",
    ">Masuk Ulang<"
  ];

  for (const str of forbiddenHardcoded) {
    ok(!source.includes(str), `Landing page does not contain hardcoded '${str}'`);
  }

  console.log("  3. Landing page English source verification ........ PASS");
}

/* ------------------------------------------------- 4. Login Page English Completeness */
function testLoginPageSource(): void {
  const loginPath = path.join(ROOT, "app", "login", "page.tsx");
  const source = fs.readFileSync(loginPath, "utf-8");

  // Invariant: Login page imports isEnlEdition
  ok(source.includes("isEnlEdition"), "Login imports isEnlEdition");

  // Invariant: No hardcoded Indonesian literals in error messages or buttons
  const forbiddenHardcoded = [
    "Google belum merespons. Periksa apakah pop-up diblokir",
    "Pop-up Google diblokir oleh browser.",
    "Jendela masuk Google ditutup sebelum proses selesai.",
    "Masuk dengan Google belum berhasil.",
    ">Memverifikasi akun...<",
    ">Masuk untuk melanjutkan perjalanan pengenalan dirimu.<",
    ">Masuk dengan Google belum selesai<",
    ">Gunakan halaman masuk Google<",
    ">Lanjutkan dengan Google",
    ">Menghubungkan...<",
    "Dengan melanjutkan, kamu menyetujui Ketentuan Layanan"
  ];

  for (const str of forbiddenHardcoded) {
    ok(!source.includes(str), `Login page does not contain raw string '${str}'`);
  }

  console.log("  4. Login page English source verification .......... PASS");
}

/* ------------------------------------------------- 5. Setup Page English Completeness */
function testSetupPageSource(): void {
  const setupPath = path.join(ROOT, "app", "setup", "page.tsx");
  const source = fs.readFileSync(setupPath, "utf-8");

  // Invariant: Setup page imports isEnlEdition
  ok(source.includes("isEnlEdition"), "Setup imports isEnlEdition");

  // Invariant: No hardcoded Indonesian validation, loading or placeholder strings
  const forbiddenHardcoded = [
    'setFormError("Jam kelahiran wajib diisi',
    'setFormError("Pilih kota kelahiran dari daftar',
    'throw new Error("Gagal menyimpan blueprint',
    'throw new Error("Verifikasi data gagal',
    ">Menyelaraskan profil...<",
    ">Profil belum bisa dimuat. Periksa koneksi",
    ">Kamu harus login terlebih dahulu.<",
    ">Ke Halaman Login<",
    'placeholder="Nama Lengkap"',
    'placeholder="Kota Kelahiran"',
    '>Menyimpan...<',
    '>Lanjut ke Dashboard<'
  ];

  for (const str of forbiddenHardcoded) {
    ok(!source.includes(str), `Setup page does not contain raw string '${str}'`);
  }

  console.log("  5. Setup page English source verification .......... PASS");
}

/* ------------------------------------------------- 6. LanguageContext Safety Invariants */
function testLanguageContextSource(): void {
  const contextPath = path.join(ROOT, "app", "context", "LanguageContext.tsx");
  const source = fs.readFileSync(contextPath, "utf-8");

  ok(source.includes("isEnlEdition()"), "LanguageContext checks isEnlEdition()");
  // Must return "en" when isEnlEdition() is true
  ok(source.includes('if (isEnlEdition()) {\n        return "en";\n      }'), "Initializes to 'en' in ENL edition");
  // Must not persist profile rewrite in ENL edition
  ok(source.includes('if (isEnlEdition()) {\n        setLanguage("en");\n        return;\n      }'), "ENL edition prevents destructive profile rewrite on changeLanguage");

  console.log("  6. LanguageContext safety & continuity invariants .. PASS");
}

function run(): void {
  console.log("Running Build 108 Sprint 1 (Shell, Landing, Login, Setup) test suite:");
  testEditionConfig();
  testDictionaryParity();
  testLandingPageSource();
  testLoginPageSource();
  testSetupPageSource();
  testLanguageContextSource();
  console.log(`PASS build108-sprint01-shell (${assertions} assertions)`);
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
