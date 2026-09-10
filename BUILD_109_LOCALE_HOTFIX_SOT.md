# BUILD 109 LOCALE HOTFIX — MASTER SOURCE OF TRUTH (SOT)

```text
STATUS                             = IMPLEMENTATION_COMPLETE_AWAITING_FOUNDER_REVIEW
CURRENT_BRANCH                     = hotfix/build109-locale-authority
SOURCE_BASE                        = 2da21d31208a2101017759ea85cf7b27bf58a779
CANONICAL_LOCALE_AUTHORITY         = EXPLICIT_CURRENT_SELECTION > STORED_USER_PROFILE_LANGUAGE > PERSISTED_APP_LANGUAGE > SUPPORTED_DEVICE_LOCALE > id-ID
DEFAULT_LOCALE                     = id-ID
EDITION_LANGUAGE_OVERRIDE_REMOVED  = YES
ID_ID_RUNTIME                      = VERIFIED_IN_TESTS_AND_EMULATOR
EN_US_RUNTIME                      = VERIFIED_IN_TESTS_AND_EMULATOR
MS_MY_RUNTIME                      = VERIFIED_IN_TESTS_AND_EMULATOR
DEVICE_RUNTIME                     = PASS_ON_PIXEL_8_EMULATOR
BUILD109_TESTS                     = PASS (52/52 assertions OK)
BUILD109_STATUS                    = VERIFIED_AND_COMMITTED
BUILD109_CAN_PROCEED_TO_RELEASE    = NO (FOUNDER_SIGN_OFF_REQUIRED)
NEXT_SAFE_ACTION                   = STOP_FOR_FOUNDER_REVIEW
```

## 1. Executive Summary & Root Cause

The Build 108 release candidate implemented `NEXT_PUBLIC_APP_EDITION="ENL"`, but coupled the edition flag directly to language state machine initialization and forced all sessions, components, and headers to English regardless of the user's explicit selection, stored Firestore profile preference, or Indonesian device environment.

### Confirmed Root Cause
1. **Edition Conflated with Runtime Locale:** `LanguageContext.tsx`, `i18n/index.ts`, `app/page.tsx`, `app/settings/page.tsx`, and major dashboard components evaluated `isEnlEdition()` to force `en-US` and hide or ignore language switchers.
2. **Profile Inversion:** Stored localStorage application language took precedence over authenticated Firestore profile language, causing relogins across devices to desynchronize.
3. **Cache Partitioning Failure:** Daily guidance and AI reflections stored local cache under keys that did not isolate language, causing an Indonesian-selected session to display cached English reflections or vice versa.

## 2. Canonical Locale Precedence Architecture

The runtime authority hierarchy for Build 109 is strictly:
```text
1. Explicit in-memory user selection (bound to authenticated UID)
2. Stored user profile language (users/{uid}.language)
3. Persisted application language (localStorage "bhumiLanguage")
4. Supported device locale (navigator.languages / navigator.language matching id/en/ms)
5. Default fallback: id-ID
```

### Invariants
- `DEFAULT_LOCALE = "id-ID"`.
- `NEXT_PUBLIC_APP_EDITION` must NEVER override runtime locale. Edition controls packaging/edition metadata, not the user's active tongue.
- System UI renders pure Indonesian for `id-ID`, pure English for `en-US`, and supported Malay for `ms-MY`. No mixed system surfaces.
- User-authored content (journal entries, reflections, custom notes) is preserved strictly unmutated.
- Generated content partitions caches by `uid:date:language` to avoid template/cache language mismatch.
- Date formatters dynamically resolve runtime locale tags (`id-ID`, `en-US`, `ms-MY`).

## 3. Surface-by-Surface Remediation Ledger

| Surface / System | Previous Flaw | Build 109 Resolution | Status |
|---|---|---|---|
| **LanguageContext** | Initialized & locked to `en` if `isEnlEdition()` | Implemented `resolveEffectiveLocale` precedence chain; UID-bound selection; async queue for non-blocking profile writes | **FIXED** |
| **i18n Core** | Defaulted to `en` in ENL; passed raw short codes to i18next | Defaults to `id-ID`; normalizes tags to canonical BCP47 (`id-ID`, `en-US`, `ms-MY`) | **FIXED** |
| **Landing (`app/page.tsx`)** | Switcher hidden via `!isEnlEdition()` | Switcher visible and functional across all editions | **FIXED** |
| **Settings (`app/settings/page.tsx`)** | Select was hardcoded 2 options (id/en); forced `isEn` | Accessible 3-language selector (`id`, `en`, `ms`); immediate reactivity | **FIXED** |
| **Dashboard (`DashboardClient.tsx`)** | Ignored LanguageContext, read profile tag directly | Consumes `useLanguage()`; cache keys partitioned by `language`; localized headers & footers | **FIXED** |
| **Weekly Guidance (`WeeklyGuidanceCard.tsx`)** | Forced `isEnlEdition()`; date range locked `en-US` | Dynamically formats date range via `normalizeLocale(language)`; respects active tongue | **FIXED** |
| **Weekly Report (`reports/weekly/page.tsx`)** | Forced `isEnlEdition()` | Uses `useLanguage()` reactive tongue | **FIXED** |
| **Profile (`app/profile/page.tsx`)** | Forced `isEnlEdition()` | Uses `useLanguage()` reactive tongue; localized greeting & hub cards | **FIXED** |
| **Environment (`dashboard/environment/page.tsx`)** | Forced `isEnlEdition()` | Uses `language === "en"` reactive tongue | **FIXED** |
| **Paywall (`premium-bhumi/page.tsx`)** | Forced `isEnlEdition()` | Uses `language === "en"` reactive tongue; price label localized | **FIXED** |
| **DailyNoteV2 (`DailyNoteV2.tsx`)** | Forced `isEnlEdition()` | Supports `id`, `en`, `ms`; localized headers & date formatting | **FIXED** |
| **Root Layout (`app/layout.tsx`)** | Hardcoded `<html lang="en">` | Default set to `<html lang="id-ID">`; updated dynamically via `LanguageContext` | **FIXED** |

## 4. Continuity & Regression Guardrails

All verified Build 107/108 invariants remain 100% intact:
1. **Human Design Identity Core Convergence:** 19/19 checks PASS; historical HD types converge immediately.
2. **Production Surface Guard:** 131/131 checks PASS; 48 product routes classified; 3 admin routes gated; 5 orphan routes remain deleted.
3. **Core Data Integrity (CDI):** Chiron ephemeris accuracy (< 0.001°), IANA timezone resolution, HD advanced variables safety, and Schumann fail-closed honest state are completely intact.
4. **Billing & Lifetime Admin:** Google Play pricing, entitlement security, and the 4 canonical Lifetime Admin accounts are untouched.
5. **ENV2 Compliance:** Open-Meteo production call gate (0 calls), atmospheric column SO2 unavailable, and Smithsonian GVP fail-closed attribution are untouched.
