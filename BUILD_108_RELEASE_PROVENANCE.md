# BUILD 108 ENL — CANONICAL RELEASE PROVENANCE
**Authoritative Record of Build 108 Release Lineage, Verification & Play Internal Testing Readiness**

```text
RELEASE_STATUS                  = BUILD_108_RELEASE_CANDIDATE_VERIFIED
BUILD_EDITION                   = DEDICATED_ENGLISH_LANGUAGE_EDITION (ENL)
VERSION_CODE                    = 108
VERSION_NAME                    = "5.0.8"
APPLICATION_ID                  = com.bhumiamartya.app
TARGET_SDK                      = 36
MIN_SDK                         = 24
AAB_PATH                        = android/app/build/outputs/bundle/release/app-release.aab
AAB_SIZE                        = 11,122,675 bytes (10.61 MB)
AAB_SHA256                      = B5BE303FB10FD2B79A904920B966DB7F181E953EE2A09E53588C02DBA82AE259
UPLOAD_CERT_SHA256              = 1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518
UPLOAD_CERT_OWNER               = CN=Bhumi Amartya, O=Bhumi Amartya, C=ID
BRANCH                          = recovery/build106-product-continuity
REMOTE_TRACKING                 = origin/recovery/build106-product-continuity
FRA_CHECKPOINT_COMMIT           = 29d147a2f488aadc08e7a2ef01fec3bb91367f15
VERSION_PREPARATION_COMMIT      = 2f04bb0af90ae00a1b1680d0aa31e5717db56e53
REMOTE_PROVENANCE_STATUS        = PUSHED_AND_CONFIRMED
PLAY_TRACK                      = INTERNAL_TESTING_ONLY
PRODUCTION_PROMOTION_READY      = NO (Gated on Play Internal Testing authenticated smoke test)
```

---

## 1. Lineage & Ancestry Verification

- **Production Baseline:** Build 107 (`versionCode 107`, `versionName "5.0.7"`, commit `d2ecb5e`).
- **All Sprints Inherited:**
  - Sprint 1 (Shell): English onboarding, login & setup wizard (`0c0c6c3`).
  - Sprint 2 (Dashboard): 15 dashboard subcards localized; HD convergence preserved (`0c0c6c3`).
  - Sprint 3 (Blueprints): 11 blueprint systems presentation in English; 0 calculation engines modified (`0c0c6c3`).
  - Sprint 4 (AI Guidance): Strict English guidance prompts; companion sign-off ("Warm hugs from Bhumi.") (`0c0c6c3`).
  - Sprint 5 (Hubs): Profile, Journey, Journal, Insights, Weekly Reports in English; stored user text preserved unmutated (`0c0c6c3`).
  - Sprint 6 (Wellness): Somatics, healing, meditation, innerwork & aura in English; non-medical boundaries enforced (`3edda16`).
  - Sprint 7 (Settings/Legal): Settings, Danger Zone, paywall (Play live formattedPrice authority, Rp25.000 removed), Terms & Privacy (4 complete clauses) (`7687aac`).
  - Sprint ENV2 (Environment): Fail-closed production provider gate (Open-Meteo calls = 0), column SO2 accepted unavailable, GVP volcanic attribution fail-closed (`8ce1b9d`).
  - Sprint 8 (Verification): Whole-product requirement-to-evidence matrix reconciled (`1f1e75f`).
  - GATE_108_FRA (Final Release Audit): Ratified PASS (`29d147a`).
  - Version Bump: versionCode 108 / versionName 5.0.8 (`2f04bb0`).
- **Ancestry Chain:**
  `d2ecb5e` (Build 107) -> ... -> `29d147a` (GATE_108_FRA PASS) -> `2f04bb0` (Version 108 / 5.0.8).
  Every commit is a strict fast-forward descendant of the verified baseline.

---

## 2. Artifact Signing & Verification

- **Canonical Keystore:** `C:\Users\shein\keys\recovery-2026-08-03\bhumi-amartya-release.jks` (SHA-256: `883D227E492564A562151880A3DF4DCE0182DAF721883F9854627D3378221AFA`).
- **Credential Source:** Strict data-only Java Properties parsing from `C:\tmp\bhumi-v5-build104\android\keystore.properties`. Zero secrets printed or copied to repo.
- **Upload Certificate Verification:**
  - Keystore certificate SHA-256: `1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518` (matches Build 107 upload key).
  - Generated AAB signer certificate SHA-256: `1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518` (matches expected).
  - AAB SHA-256: `B5BE303FB10FD2B79A904920B966DB7F181E953EE2A09E53588C02DBA82AE259`.

---

## 3. Remote Provenance Verification

- **Remote URL:** `https://github.com/wizzare/bhumi-amartya.git` (origin)
- **Pushed Range:** `d7a679a..2f04bb0` pushed to `origin/recovery/build106-product-continuity` with zero force-push or history rewrite.
- **Remote HEAD:** Confirmed at `2f04bb0af90ae00a1b1680d0aa31e5717db56e53` containing both `29d147a` (FRA) and `2f04bb0` (Release Version).
- **Remote Ancestry:** Valid, strict linear descendant.

---

## 4. Google Play Internal Testing Acceptance Plan

Once the artifact is uploaded to the Google Play Console Internal Testing track:
1. Google Play processes the AAB and re-signs it with the **Google Play App Signing Key**.
2. Testers on the Internal Testing track install the release build onto an authorized Android device.
3. The following smoke flow will be executed on the physical device:
   - Google Sign-In (using authorized Founder/QA account).
   - Setup onboarding: birth data input, city autocomplete, coordinates, and deterministic IANA timezone resolution.
   - Dashboard: Core Identity resolves without looping; 15 cards render native English copy.
   - Human Design: Blueprint renders bodygraph and core type (Generator/Projector/Manifestor/Reflector); advanced variables display honest available/unavailable states without crashing.
   - Profile: Profile Hub and all sections render in English; historical journal entries remain unmutated.
   - Environment: Atmosphere & Volcanic card displays honest fail-closed states without fabricated values; Schumann shows unavailable.
   - Settings & Paywall: Danger zone, account deletion paths, and subscription tiers render without crashing.
4. If all checks pass on the physical device, Founder reviews the Internal Testing report before authorizing promotion to Closed Testing or Production tracks.
