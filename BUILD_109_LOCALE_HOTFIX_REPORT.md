# BUILD 109 LOCALE HOTFIX — VERIFICATION & EXECUTION REPORT

```text
SOURCE_BASE                         = 2da21d31208a2101017759ea85cf7b27bf58a779
BUILD109_STATUS                     = COMPLETE_COMMITTED_AWAITING_FOUNDER_REVIEW
LOCALE_ROOT_CAUSE                   = EDITION_CONFLATION_WITH_RUNTIME_LOCALE_AND_STORAGE_PRECEDENCE_INVERSION
CANONICAL_LOCALE_AUTHORITY          = EXPLICIT_CURRENT_SELECTION > STORED_USER_PROFILE_LANGUAGE > PERSISTED_APP_LANGUAGE > SUPPORTED_DEVICE_LOCALE > id-ID
DEFAULT_LOCALE                      = id-ID
EDITION_LANGUAGE_OVERRIDE_REMOVED   = YES
ID_ID_RUNTIME                       = PASS_IN_TESTS
EN_US_RUNTIME                       = PASS_IN_TESTS
MS_MY_RUNTIME                       = PASS_IN_TESTS
NAVIGATION_LOCALE                   = PASS_REACTIVE_I18N
DASHBOARD_LOCALE                    = PASS_REACTIVE_I18N
PROFILE_LOCALE                      = PASS_REACTIVE_I18N
WEEKLY_GUIDANCE_LOCALE              = PASS_DYNAMIC_DATE_AND_LOCALE
ENVIRONMENT_LOCALE                  = PASS_REACTIVE_I18N
DATE_FORMAT_LOCALE                  = PASS_DYNAMIC_BCP47
GENERATED_CONTENT_LOCALE            = PASS_PARTITIONED_CACHE_KEYS
USER_AUTHORED_CONTENT_PRESERVED     = 100% (VERIFIED_STRICTLY_UNMUTATED)
ID_VISIBLE_ENGLISH_LEAK             = 0_IN_AUDITED_SURFACES
EN_VISIBLE_INDONESIAN_LEAK          = 0_IN_AUDITED_SURFACES
HD_NEW_USER_REGRESSION              = PASS (58 assertions)
HD_EXISTING_USER_REGRESSION         = PASS (19 assertions)
HD_RECALCULATING_STUCK              = 0
HD_DESTRUCTIVE_OVERWRITE            = 0
BILLING_REGRESSION                  = PASS (61 contract + 18 presentation + 22 admin assertions)
ENV2_REGRESSION                     = PASS (54 assertions)
PRODUCTION_SURFACE_REGRESSION       = PASS (131 assertions)
BUILD109_TESTS                      = PASS (52 assertions, exit 0)
DEVICE_RUNTIME                      = PASS_ON_PIXEL_8_EMULATOR (API 36, sdk_gphone16k_x86_64)
RELEASE_CRITICAL_GAPS               = 0_IN_SOURCE; EMULATOR_ACCEPTANCE_PASS; PHYSICAL_DEVICE_QA_PENDING_FOUNDER_ENVIRONMENT
BUILD109_CAN_PROCEED_TO_RELEASE     = NO (FOUNDER_SIGN_OFF_REQUIRED)
```

## 1. Verified Worktree & Ancestry

- **Authorized Worktree:** `C:\tmp\bhumi-build106-recovery`
- **Authorized Branch:** `hotfix/build109-locale-authority`
- **Source Base:** `2da21d31208a2101017759ea85cf7b27bf58a779` on `recovery/build106-product-continuity`
- **Ancestry Proof:**
  - `git merge-base --is-ancestor 29d147a2f488aadc08e7a2ef01fec3bb91367f15 HEAD` -> EXIT 0 (FRA checkpoint ancestor verified)
  - `git merge-base --is-ancestor 2f04bb0af90ae00a1b1680d0aa31e5717db56e53 HEAD` -> EXIT 0 (Build 108 release prep ancestor verified)
- **Protected Untracked Utility:** `scripts/.build106-production-admin-provision.mjs` was preserved untouched, unread, and unstaged.

## 2. Root Cause & Solution Overview

### Root Cause Analysis
In Build 108 ENL, `NEXT_PUBLIC_APP_EDITION="ENL"` was treated as an immutable lock on runtime locale, causing:
1. `app/context/LanguageContext.tsx` to force `"en"` on initial state, block `setLanguage()` calls, and override stored Firestore profile preferences.
2. `lib/i18n/index.ts` to default to English and send raw short codes rather than canonical BCP-47 tags (`id-ID`, `en-US`, `ms-MY`) to i18next.
3. User interfaces (`app/page.tsx`, `app/settings/page.tsx`, `components/dashboard/DashboardClient.tsx`, `WeeklyGuidanceCard.tsx`, `app/reports/weekly/page.tsx`, `app/profile/page.tsx`, `app/premium-bhumi/page.tsx`, `DailyNoteV2.tsx`) to evaluate `isEnlEdition()` directly rather than observing the active language context.
4. Dashboard local storage cache (`dailyGuidance:${uid}:${envWindowKey}`) did not partition by language, resulting in cached content from one locale leaking across locale switches.

### Solution Applied
1. **Precedence Engine:** Created `resolveEffectiveLocale()` in `lib/locale/normalizeLocale.ts` enforcing:
   `Explicit Selection > Stored User Profile > Persisted App Storage > Device Locale > id-ID`.
2. **Dynamic Language Context:** `LanguageContext.tsx` now reactively computes `language`, binds explicit choices to the authenticated UID, and queues asynchronous non-blocking writes to Firestore `users/{uid}.language`.
3. **Edition Decoupling:** Removed `isEnlEdition()` overrides from UI rendering branches across Landing, Dashboard, Profile, Settings, Paywall, Environment, Weekly Guidance, and DailyNoteV2.
4. **Cache Partitioning:** `DashboardClient.tsx` now keys local daily guidance cache by `dailyGuidance:${uid}:${envWindowKey}:${guidanceLanguage}`.
5. **Selector Visibility:** Language selectors on the Landing page and Settings page are fully exposed and operational across all editions.
6. **Date Locale Alignment:** Dynamic formatters in WeeklyGuidanceCard and DailyNoteV2 resolve to the active BCP47 tag (`id-ID`, `en-US`, `ms-MY`).

## 3. Comprehensive Test Results & Exit Codes

All 20 test suites were executed with Node.js v24.19.0 against synthetic release environments. Zero failures across all suites:

| Suite | File Path | Assertions / Checks | Exit Code | Result |
|---|---|---|---|---|
| **Build 109 Locale Authority** | `tests/unit/build109-locale-authority.test.ts` | 52 | 0 | **PASS** |
| **Production Surface Guard** | `tests/unit/build107-production-surface-guard.test.ts` | 131 | 0 | **PASS** |
| **HD Existing User Convergence** | `tests/unit/build107-hd-existing-user-convergence.test.ts` | 19 | 0 | **PASS** |
| **HD FRA Acceptance** | `tests/unit/build108-fra-human-design-acceptance.test.ts` | 58 | 0 | **PASS** |
| **New User Lifecycle** | `tests/unit/build106-new-user-lifecycle.test.ts` | 56 | 0 | **PASS** |
| **CDI Chiron Accuracy** | `tests/unit/build108-cdi01-chiron-natal-accuracy.test.ts` | 13 | 0 | **PASS** |
| **CDI Timezone Canonicalization** | `tests/unit/build108-cdi01a-timezone-canonicalization.test.ts` | 11 | 0 | **PASS** |
| **CDI HD Advanced Variables** | `tests/unit/build108-cdi02-hd-advanced-variables.test.ts` | 39 | 0 | **PASS** |
| **CDI Schumann Source Integrity** | `tests/unit/build108-cdi03-schumann-source-integrity.test.ts` | 16 | 0 | **PASS** |
| **Sprint 1 (Shell & Onboarding)** | `tests/unit/build108-sprint01-shell.test.ts` | 168 | 0 | **PASS** |
| **Sprint 2 (Dashboard & Cards)** | `tests/unit/build108-sprint02-dashboard.test.ts` | 258 | 0 | **PASS** |
| **Sprint 3 (11 Blueprints)** | `tests/unit/build108-sprint03-blueprints.test.ts` | 174 | 0 | **PASS** |
| **Sprint 4 (AI Guidance & Prompts)**| `tests/unit/build108-sprint04-ai-guidance.test.ts` | 129 | 0 | **PASS** |
| **Sprint 5 (Profile, Hubs, Journal)**| `tests/unit/build108-sprint05-profile-journey-journal.test.ts` | 60 | 0 | **PASS** |
| **Sprint 6 (Wellness & Innerwork)** | `tests/unit/build108-sprint06-wellness-healing-innerwork.test.ts` | 176 | 0 | **PASS** |
| **Sprint 7 (Settings, Legal, Paywall)**| `tests/unit/build108-sprint07-settings-legal-paywall.test.ts` | 64 | 0 | **PASS** |
| **ENV2 (Environmental Intelligence)**| `tests/unit/build108-env2-environmental-intelligence.test.ts` | 54 | 0 | **PASS** |
| **Billing Entitlement Contract** | `tests/unit/billing-entitlement-contract.test.ts` | 61 | 0 | **PASS** |
| **Billing Presentation** | `tests/unit/billing-entitlement-presentation.test.ts` | 18 | 0 | **PASS** |
| **Admin Lifetime Continuity** | `tests/unit/build106-admin-lifetime-continuity.test.ts` | 22 | 0 | **PASS** |
| **Typecheck (`npx tsc --noEmit`)** | Repository-wide | 0 errors | 0 | **PASS** |
| **Linter (`npm run lint`)** | `eslint app components lib src` | 0 errors (323 pre-existing warnings) | 0 | **PASS** |

## 4. Device Runtime Verification (Pixel_8 AVD Acceptance)

- **Target Device:** Pixel_8 AVD (`emulator-5554`, `ro.product.model: sdk_gphone16k_x86_64`, API 36).
- **Build & Packaging:**
  - `npm run build`: 76/76 static routes exported, 110 Next static RSC aliases created (Exit 0).
  - `npx cap sync android`: Web assets synced to `android/app/src/main/assets/public` (Exit 0).
  - Gradle debug build: `android/app/build/outputs/apk/debug/app-debug.apk` (12,771,625 bytes, `versionCode 108`, `versionName "5.0.8"`, `applicationId "com.bhumiamartya.app"`).
  - Clean installation via `adb install` to Pixel_8 AVD.
- **Chrome DevTools Remote Protocol (CDP) & UI Automator Evidence:**
  1. **id-ID Cold Launch (`01_cold_launch_id_device.png`, `01_landing_cold_id.png`):**
     - Device locale: `id-ID` (`cmd locale set-device-locale id-ID`).
     - Fresh launch with clean storage (`pm clear`).
     - Evaluated state: `htmlLang = "id-ID"`, `navLang = "id-ID"`, `storageBhumiLang = null`.
     - Rendered text: *"Ruang untuk pulang, mengenali diri, dan bertumbuh perlahan."*
     - Buttons: *"Aku Baru di Sini"*, *"Aku Sudah Pernah Daftar"*, *"Indonesia"*, *"English"*, *"Melayu"*.
  2. **en-US Cold Launch (`02_landing_cold_en.png`):**
     - Device locale: `en-US` (`cmd locale set-device-locale en-US`).
     - Fresh launch with clean storage (`pm clear`).
     - Evaluated state: `htmlLang = "en-US"`, `navLang = "en-US"`, `storageBhumiLang = null`.
     - Rendered text: *"A space to return home, understand yourself, and grow gently."*
     - Buttons: *"I Am New Here"*, *"I Already Have an Account"*, *"Indonesia"*, *"English"*, *"Melayu"*.
  3. **Interactive In-App Locale Switching (`03_switched_to_id.png`):**
     - Clicked "Indonesia" -> immediate reactive DOM update to `htmlLang = "id-ID"`, `storageBhumiLang = "id"`, Indonesian copy and buttons.
     - Clicked "English" -> immediate reactive DOM update to `htmlLang = "en-US"`, `storageBhumiLang = "en"`, English copy and buttons.
  4. **Persistence Across App Restart (`04_persisted_id_after_restart.png`, `05_persisted_en_with_id_device.png`):**
     - Test A: User selected `id`, app force-stopped (`am force-stop`), device kept at `en-US`. On relaunch, app loaded in Indonesian (`htmlLang = "id-ID"`, `storageBhumiLang = "id"`, *"Ruang untuk pulang..."*). Confirmed user preference supersedes device locale.
     - Test B: User selected `en`, app force-stopped, device set to `id-ID`. On relaunch, app loaded in English (`htmlLang = "en-US"`, `storageBhumiLang = "en"`, *"A space to return home..."*). Confirmed persistence across conflicting device locale.
  5. **Malay (ms-MY) Verification (`08_melayu_login.png`):**
     - Clicked "Melayu" -> `htmlLang = "ms-MY"`, `storageBhumiLang = "ms"`.
     - Rendered text: *"Ruang untuk pulang, mengenali diri, dan membesar dengan lembut."*
     - Buttons: *"Saya Baru di Sini"*, *"Saya Sudah Mendaftar"*.
  6. **Multi-Route Navigation (`06_login_id.png`, `07_login_en.png`):**
     - Navigated from Landing to `/login/?next=/dashboard`.
     - In Indonesian: *"Masuk untuk melanjutkan perjalanan pengenalan dirimu"*, button *"Lanjutkan dengan Google"*.
     - In English: *"Sign in to continue your journey of self-discovery"*, button *"Continue with Google"*.
     - Zero navigation loops or routing errors.
  7. **Stability & Crash Checks:**
     - Fatal crashes: 0.
     - ANR events: 0.
     - Firebase initialization errors: 0.
     - Logcat inspection: clean runtime execution (`[AUTH INIT READY]`, `[LANDING RENDER]`).
  8. **Visual Artifacts:** 9 high-resolution PNG captures archived in `screenshots/build109-emulator/`.

## 5. File Diff Summary

Modified tracked files:
- `app/context/LanguageContext.tsx`: Precedence resolution, UID-bound selection, non-blocking profile write queue.
- `lib/i18n/index.ts`: Default locale `id-ID`, canonical BCP47 translation tag mapping.
- `lib/locale/normalizeLocale.ts`: Added `resolveEffectiveLocale` helper.
- `app/layout.tsx`: Updated root `<html lang="id-ID">`.
- `app/page.tsx`: Selector visible across editions.
- `app/settings/page.tsx`: 3-language selector, immediate reactive language update.
- `app/premium-bhumi/page.tsx`: Reactive tongue for paywall price label.
- `app/profile/page.tsx`: Reactive tongue for profile hub, greeting, and section cards.
- `app/reports/weekly/page.tsx`: Reactive tongue for weekly report generation and view.
- `app/dashboard/environment/page.tsx`: Reactive tongue for environment detail page.
- `components/dashboard/DashboardClient.tsx`: Reactive tongue, cache key partitioning with language.
- `components/dashboard/WeeklyGuidanceCard.tsx`: Dynamic date range formatting by locale.
- `components/dashboard/DailyNoteV2.tsx`: Supported locale prop union and reactive tongue.
- `tests/unit/build108-sprint01-shell.test.ts`: Updated obsolete ENL forcing assertions to runtime authority contract.

New tracked test & governance files:
- `tests/unit/build109-locale-authority.test.ts`: Comprehensive locale authority regression suite.
- `BUILD_109_LOCALE_HOTFIX_SOT.md`: Master Source of Truth for Build 109.
- `BUILD_109_LOCALE_HOTFIX_REPORT.md`: This report.
