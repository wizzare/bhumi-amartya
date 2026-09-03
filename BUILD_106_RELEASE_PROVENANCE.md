# BHUMI AMARTYA — BUILD 106 RELEASE PROVENANCE (Step 13)

Status: **RECONCILED — local release artifact built + verified. Production signing + Play upload
are the only remaining steps and are OUT OF SCOPE for this worktree (no keystore; not authorized).**
Primary authority: `BUILD_106_MASTER_SOT.md` §7.13 / §8 / §10.
Date: 2026-09-03.

```text
FINAL_COMMIT / HEAD          = resolve with `git rev-parse HEAD` — the Step 13 docs commit; version bump = 0b55f99
BRANCH                       = recovery/build106-product-continuity
versionCode                  = 106
versionName                  = 5.0.6
RELEASE_NAME                 = BHUMI AMARTYA V5 BUILD 106
applicationId                = com.bhumiamartya.app
RELEASE_CRITICAL_GAPS_OPEN   = 0
ARTIFACT_TYPE                = Android App Bundle (.aab), UNSIGNED (release variant, no local keystore)
ARTIFACT_FILE                = bhumi-amartya-v5.0.6-build106-release-unsigned.aab
ARTIFACT_BUILD_PATH          = android/app/build/intermediates/intermediary_bundle/release/packageReleaseBundle/intermediary-bundle.aab
ARTIFACT_SIZE_BYTES          = 27003050
ARTIFACT_SHA256              = 9a67aace816dfa0ea7a84d4ed9f38e6e01148205810833676410a0e894af9977
SIGNED_PRODUCTION_ARTIFACT   = NOT PRODUCED (keystore absent by design; forbidden to add signing secrets)
DEPLOY / PUBLISH / PLAY UPLOAD = NOT DONE (NOT APPROVED)
```

## 1. Preflight

| Check | Result |
|---|---|
| Branch | `recovery/build106-product-continuity` |
| HEAD at start | `37dbca7` (final pre-release gap closure docs) |
| Worktree | clean |
| `RELEASE_CRITICAL_GAPS_OPEN` | **0** (Reconciliation Report §11.4; all RC-1..RC-12 CLOSED or Founder-dispositioned ACCEPTED_DEFERRED_NON_BLOCKING; every `DS-*` reconciled; zero `RELEASE_BLOCKER`) |
| Canonical release/versioning rule | Mirrors the Build 105 prep commit (`8fc3c23`) surface: `android/app/build.gradle` + `lib/config/buildInfo.ts` + `tests/unit/version-reconciliation.test.ts`. `src/lib/version.ts` / `app/layout.tsx` derive from `buildInfo.ts` (no edit). |
| Founder authorization | Step 13 approved. `VERSION_BUMP`, `BUILD_106_ARTIFACT`, `LOCAL_RELEASE_BUILD`, `LOCAL_ARTIFACT_VERIFICATION` = APPROVED. `DEPLOY` / `PUBLISH` / `PLAY_STORE_UPLOAD` / `PRODUCTION_WRITE` = NOT APPROVED. |

## 2. Version bump — commit `0b55f99`

| File | Change |
|---|---|
| `android/app/build.gradle` | `versionCode 105 → 106`, `versionName "5.0.5" → "5.0.6"` |
| `lib/config/buildInfo.ts` | `CURRENT_VERSION_NAME "5.0.5" → "5.0.6"`, `CURRENT_VERSION_CODE 105 → 106`, `CURRENT_BUILD_NUMBER "105" → "106"` |
| `tests/unit/version-reconciliation.test.ts` | assertions retargeted to Build 106 / 5.0.6 / versionCode 106; stale-display guard now rejects Build 105 |

`RELEASE_NAME` resolves via `formatReleaseName` to **"BHUMI AMARTYA V5 BUILD 106"**.

## 3. Build

| Step | Command | Result |
|---|---|---|
| Web production build | `node scripts/run-prod-build.mjs` (`next build`, `output: 'export'` → `out/`) | **EXIT 0** — "Production build completed successfully", 112 Next static RSC aliases created. Synthetic placeholder Firebase / HD / billing env used (`.env.local`, ephemeral, deleted) — this is a **local artifact-verification build**, not wired to production. |
| Release bundle security guard | `tsx scripts/guard-release-bundle.ts` (scans HD API source + `out/` bundle) | **✅ PASS — 0 violations** (no dev-bypass token, no hardcoded localhost HD URL, no hardcoded JWT). |
| Capacitor sync | `cap sync android` | **success** — web assets → `android/app/src/main/assets/public/`; 9 Capacitor plugins registered; `capacitor.config.json` written (non-emulator: Google provider + LocalNotifications, no `server` block). |
| Android bundle | `gradlew :app:bundleRelease` (JDK 17, Android SDK 36, Gradle 9.4.1) | `:app:packageReleaseBundle` **succeeded** → `intermediary-bundle.aab` (27,003,050 bytes). `:app:signReleaseBundle` **FAILED** — see §6. |
| Android APK (fallback attempt) | `gradlew :app:assembleRelease` | FAILED at `:app:packageRelease` — `SigningConfig "release" is missing required property "storeFile"` (same root cause as the bundle sign failure). |
| Android debug APK (smoke-test attempt) | `gradlew :app:assembleDebug` | FAILED at `:app:processDebugGoogleServices` — `google-services.json` has no client for the `.qa` debug applicationId. Pre-existing; unrelated to the release variant. |

## 4. Verify

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **EXIT 0** |
| `tests/unit/version-reconciliation.test.ts` | **20 / 20 PASS** (APP_VERSION 5.0.6, RELEASE_NAME "…BUILD 106", CURRENT_VERSION_CODE 106, android versionName 5.0.6, android versionCode 106, Android⇄display agree, versionCode⇄build-number agree) |
| Full Firestore/Auth emulator release suite | `firebase emulators:exec --project demo-release-suite --only firestore,auth "node scripts/run-release-tests.mjs"` → **PASS=25 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`; STRONG_REAL_SDK=6 STRONG_UNIT=11 STATIC_GUARD=5 MOCK_UNIT=1) |
| No-emulator release suite | **PASS=17 FAIL=0 SKIPPED=8** (the 8 skipped are the emulator suites, covered by the run above) |
| Release bundle security guard | ✅ PASS (see §3) |
| **AAB integrity** — `unzip -t intermediary-bundle.aab` | **No errors detected in compressed data.** Valid ZIP; canonical AAB layout: `BundleConfig.pb` (bundletool 1.18.3 format), `base/manifest/AndroidManifest.xml`, `base/resources.pb`, `base/assets.pb`, `BUNDLE-METADATA/` (baseline profiles + dependency graph). 1417 entries, ~26.7 MB uncompressed. |
| **Version metadata in the packaged manifest** (`app/build/intermediates/bundle_manifest/release/.../AndroidManifest.xml`) | `package="com.bhumiamartya.app"`, `android:versionCode="106"`, `android:versionName="5.0.6"`, `minSdkVersion="24"`, `targetSdkVersion="36"`, `MainActivity` MAIN/LAUNCHER, `allowBackup="true"`, no `.qa` suffix, no `android:debuggable`. The `5.0.6` string is present in the AAB's proto manifest. |
| **AAB content** | `base/assets/public/index.html` (15,249 B) + `_next/static/chunks/*` — the Build 106 web build; `base/assets/capacitor.plugins.json` — 9 plugins (FirebaseAuthentication, app, filesystem, geolocation, local-notifications, preferences, share, toast, secure-storage); `base/assets/capacitor.config.json` — non-emulator production config. |
| Permissions (merged manifest) | INTERNET, ACCESS_COARSE/FINE_LOCATION, RECEIVE_BOOT_COMPLETED, WAKE_LOCK, POST_NOTIFICATIONS, `com.android.vending.BILLING`; Google-Play billing queries present. No new/unexpected permission vs Build 105. |
| Firestore rules / backend deploy evidence | **N/A** — Build 106 made **no** `firestore.rules` or backend change (`git diff 8fc3c23..HEAD -- firestore.rules` empty). Nothing to deploy. |

## 5. Smoke test

**Device install + launch is NOT locally possible** and was not performed: the `release` variant
cannot be signed (no keystore) and the `.qa` debug variant cannot build (`google-services.json`
has no `.qa` client) — and modifying signing secrets or `google-services.json` is forbidden.

**Static / structural smoke test performed instead** (all pass):

- AAB is a well-formed Android App Bundle (zip integrity OK; canonical AAB structure; bundletool
  1.18.3 `BundleConfig.pb`).
- Carries the correct release identity: `com.bhumiamartya.app`, versionCode 106, versionName 5.0.6.
- Bundles the verified Build 106 web export (`index.html` + Next chunks) that passed the release
  security guard with 0 violations.
- Registers all 9 Capacitor plugins; uses the non-emulator production Capacitor config.
- No debug flag, no `.qa` suffix, no new permissions.

An installable smoke test (and the production-signed AAB) is a **release-machine / CI step** using
the Play upload key — outside this worktree.

## 6. Build-exposed conditions — classified (Founder rule 6)

| # | Condition | Classification | Action |
|---|---|---|---|
| 1 | `:app:signReleaseBundle` → `NullPointerException` (bundletool `FinalizeBundleTask`) | **Environment / credential limitation — NOT a Build 106 defect.** `signingConfigs.release` is empty because no keystore is present: `android/keystore.properties`, `*.jks`, and `BHUMI_RELEASE_STORE_FILE`/`_PASSWORD`/`KEY_ALIAS`/`KEY_PASSWORD` are all absent (correct — signing secrets are not in the repo; forbidden to add). | No code change. Production signing is a release-machine step. |
| 2 | `:app:assembleRelease` → `SigningConfig "release" is missing required property "storeFile"` | Same root cause as (1). | No code change. |
| 3 | `:app:assembleDebug` → `No matching client found for package name 'com.bhumiamartya.app.qa'` in `google-services.json` | **Pre-existing config limitation — NOT a Build 106 defect.** `google-services.json` has never carried a `.qa` client (byte-unchanged since before Build 106); affects only the local debug variant, never the release. | No code change (would require editing production Firebase config). |

None of these is a code defect or a release blocker for the Build 106 **codebase**. They gate only
the *local production-signing + install* step, which the authorization scope explicitly excludes.

## 7. Worktree state

```text
tracked status               = clean (Capacitor-generated `capacitor.build.gradle` /
                               `capacitor.settings.gradle` whitespace churn from `cap sync`
                               reverted; content unchanged)
ephemeral removed            = .env.local, out/, .next/, firebase-debug.log, firestore-debug.log,
                               /tmp/aabcheck
build outputs               = android/app/build/** retained (gitignored) — source of the AAB;
                               a stable copy is staged in the session scratchpad
forensic worktree           = C:\tmp\bhumi-build83-access-hotfix — untouched
```

## 8. Remaining accepted deferred items (post-Build-106, non-blocking)

From Reconciliation Report §11.4:

- **RC-3** (remote FCM infra / DS-N1) — external config + device.
- **RC-4** (Memory Dashboard / DS-M1) — extraction unwired → no data → no exposure (re-open guard).
- **RC-5** (V5 journaling UI relocation / DS-J1–J3) — journaling functional at the Build 105 baseline.
- **RC-6 / RC-7** (Comfort Mode / adaptive check-in rendered / DS-R1) — contracts verified; consumer UI deferred.
- **RC-8 residual** — DS-P1 entry-controls UI + a formal external penetration test (deletion inventory + enforcement audit already CLOSED).
- **DS-AI1-themes** — native `ms` deep-fallback dictionaries (D-V5-36 `ms → id` prose ratified).
- **DS-I1** (`useTranslation()` migration), **DS-2C2** (scripted Playwright), **DS-M2 / DS-A2** (Founder decisions), **DS-M3**, **DS-A1**, **DS-E1** (populated 3-layer Schumann render), **DS-PR1** (real Play `formattedPrice` on device), **DS-GATE07** (production / Play-device acceptance run).
- Post-Build-106 Daily Guidance roadmap: F-1 / F-3 / F-4 / F-5 / F-6 / F-7 / F-8 (Step 12.5 audit §6).

## 9. Release readiness verdict

- The **Build 106 codebase is reconciled** against canonical V5 (R-PRD-01..46, zero UNKNOWN), all
  known regressions resolved, `RELEASE_CRITICAL_GAPS_OPEN = 0`, genuine new-user lifecycle accepted
  (emulator-hydration), no Firestore/backend change to deploy.
- The **local release artifact (unsigned AAB) is built and verified**: correct version metadata,
  valid bundle structure, verified web payload, security guard clean.
- **The only remaining steps are production signing (Play upload key, on the authorized release
  machine) and Play Console upload — both explicitly NOT APPROVED / OUT OF SCOPE here.**

`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY` — **pending production signing + Play upload
on the authorized release machine.** No deploy, publish, Play Store upload, or production write
was performed.

STOP AND WAIT FOR FOUNDER REVIEW
