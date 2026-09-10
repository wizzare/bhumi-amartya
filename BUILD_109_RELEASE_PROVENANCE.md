# BUILD 109 — CANONICAL RELEASE PROVENANCE
**Authoritative Record of Build 109 Release Lineage, Verification & Play Internal Testing Readiness**

```text
RELEASE_STATUS                  = BUILD_109_RELEASE_CANDIDATE_VERIFIED
BUILD_EDITION                   = LOCALE_AUTHORITY_EDITION (ENL + Multi-Locale Canonical Precedence)
VERSION_CODE                    = 109
VERSION_NAME                    = "5.0.9"
APPLICATION_ID                  = com.bhumiamartya.app
TARGET_SDK                      = 36
MIN_SDK                         = 24
AAB_PATH                        = android/app/build/outputs/bundle/release/app-release.aab
AAB_SIZE                        = 11,121,531 bytes (10.61 MB)
AAB_SHA256                      = 11439CDAE028D625DD6B1F4BFE184A617879AB772E64490BA37DE927217CCB25
UPLOAD_CERT_SHA256              = 1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518
UPLOAD_CERT_OWNER               = CN=Bhumi Amartya, O=Bhumi Amartya, C=ID
BRANCH                          = hotfix/build109-locale-authority
ANCESTRY_BASE                   = dc6911e (docs(build109): record PASS for emulator locale acceptance and release readiness)
PLAY_TRACK                      = INTERNAL_TESTING_ONLY
PRODUCTION_PROMOTION_READY      = NO (Gated on Play Internal Testing authenticated smoke test)
```

---

## 1. Lineage & Ancestry Verification

- **Production Baseline:** Build 107 (`versionCode 107`, `versionName "5.0.7"`, commit `d2ecb5e`).
- **Build 108 Predecessor:** Build 108 (`versionCode 108`, `versionName "5.0.8"`, commit `2f04bb0` / `2da21d3`).
- **Build 109 Hotfix Core:**
  - Commit `641fa06`: Established canonical runtime locale authority (`Explicit Current Selection > Stored User Profile > Persisted App Storage > Device Locale > id-ID`), decoupled `isEnlEdition()` from runtime language overrides, enabled cache partitioning for daily guidance.
  - Commit `dc6911e`: Recorded device emulator runtime acceptance on Pixel_8 AVD (API 36).
  - Version Preparation: `versionCode 109`, `versionName "5.0.9"`.

---

## 2. Artifact Signing & Verification

- **Canonical Keystore:** `C:\Users\shein\keys\recovery-2026-08-03\bhumi-amartya-release.jks` (SHA-256: `883D227E492564A562151880A3DF4DCE0182DAF721883F9854627D3378221AFA`).
- **Credential Source:** Strict data-only Java Properties parsing from `C:\tmp\bhumi-v5-build104\android\keystore.properties`. Zero secrets printed or committed to repo.
- **Upload Certificate Verification:**
  - Keystore certificate SHA-256: `1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518` (matches Build 107 & 108 upload keys).
  - Generated AAB signer certificate SHA-256: `1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518` (100% verified match).
  - AAB SHA-256: `11439CDAE028D625DD6B1F4BFE184A617879AB772E64490BA37DE927217CCB25`.
  - AAB Size: `11,121,531 bytes`.
  - Packaged Manifest Verification: `package="com.bhumiamartya.app"`, `versionCode="109"`, `versionName="5.0.9"`, `minSdkVersion="24"`, `targetSdkVersion="36"`.

---

## 3. Ephemeral Environment & Worktree Hygiene

- `.env.local` copied ephemerally for production Next.js static export (`npm run build:prod`) and verified deleted immediately after.
- `android/keystore.properties` populated ephemerally for Gradle release bundle (`./gradlew bundleRelease`) and verified removed immediately after.
- Protected script `scripts/.build106-production-admin-provision.mjs` was preserved untouched, unread, and unstaged.
- Release security guard (`tsx scripts/guard-release-bundle.ts`) passed with 0 violations.

---

## 4. Acceptance & Verification Summary

| Suite / Gate | Assertions / Status | Exit Code |
|---|---|---|
| `npx tsc --noEmit` | 0 errors | 0 |
| `npm run lint` | 0 errors (324 pre-existing warnings) | 0 |
| `build109-locale-authority.test.ts` | 52 assertions PASS | 0 |
| `version-reconciliation.test.ts` | 23 assertions PASS (5.0.9 / 109) | 0 |
| `build107-production-surface-guard.test.ts` | 131 assertions PASS | 0 |
| `build107-hd-existing-user-convergence.test.ts` | 19 assertions PASS | 0 |
| `build108-fra-human-design-acceptance.test.ts` | 58 assertions PASS | 0 |
| `build106-new-user-lifecycle.test.ts` | 56 assertions PASS | 0 |
| `build108-cdi01-chiron-natal-accuracy.test.ts` | 13 assertions PASS | 0 |
| `build108-cdi01a-timezone-canonicalization.test.ts` | 11 assertions PASS | 0 |
| `build108-cdi02-hd-advanced-variables.test.ts` | 39 assertions PASS | 0 |
| `build108-cdi03-schumann-source-integrity.test.ts` | 16 assertions PASS | 0 |
| Sprint 1–7 regression suites | 1029 assertions PASS | 0 |
| ENV2 environmental intelligence | 54 assertions PASS | 0 |
| Billing contract & presentation | 79 assertions PASS | 0 |
| Admin Lifetime continuity | 22 assertions PASS | 0 |
