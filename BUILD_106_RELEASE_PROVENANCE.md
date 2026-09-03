# BHUMI AMARTYA — BUILD 106 RELEASE PROVENANCE (Step 13)

Status: **`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY` — production-signed AAB produced,
signature + identity + integrity verified, device smoke test PASS. Play Console upload is the
only remaining step and is separately gated (`PLAY_STORE_UPLOAD` NOT AUTHORIZED here).**
Primary authority: `BUILD_106_MASTER_SOT.md` §7.13 / §8 / §10.
Date: 2026-09-03. §1–§9 = local (unsigned) build; **§10 = authorized production signing + device smoke test.**

```text
FINAL_COMMIT / HEAD          = resolve with `git rev-parse HEAD` — the Step 13 docs commits; version bump = 0b55f99
BRANCH                       = recovery/build106-product-continuity
versionCode                  = 106
versionName                  = 5.0.6
RELEASE_NAME                 = BHUMI AMARTYA V5 BUILD 106
applicationId                = com.bhumiamartya.app
RELEASE_CRITICAL_GAPS_OPEN   = 0

# --- Production-signed artifact (§10) ---
SIGNED_ARTIFACT_TYPE         = Android App Bundle (.aab), PRODUCTION-SIGNED (v1/JAR, upload key)
SIGNED_ARTIFACT_FILE         = bhumi-amartya-v5.0.6-build106-release-signed.aab
SIGNED_ARTIFACT_BUILD_PATH   = android/app/build/outputs/bundle/release/app-release.aab
SIGNED_ARTIFACT_SIZE_BYTES   = 10834020
SIGNED_ARTIFACT_SHA256       = 460f44e246ad3c5d8b219dac45da32994cf4c0d166a33be7a1c74791522a303d
SIGNING_KEY                  = CN=Bhumi Amartya, O=Bhumi Amartya, C=ID  (alias bhumi-amartya)
SIGNING_KEY_SHA256           = 1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18
SIGNING_KEY_SHA1            = B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52
SIGNATURE_VERIFY            = jarsigner "jar verified"; cert fingerprint == authorized upload key
SMOKE_TEST                   = PASS — signed release APK installed on Android emulator (SDK 37),
                               launched, rendered the Build 106 welcome screen (id/en/ms selector),
                               no crash / FATAL / ANR
SMOKE_TEST_APK_SHA256        = dfbae26953844ca37cb1ecd12a6eded1382297bdccbe5d1dd9b15258bcd64438

# --- Local unsigned build (§1–§9, superseded by §10 for the release artifact) ---
UNSIGNED_ARTIFACT_FILE       = bhumi-amartya-v5.0.6-build106-release-unsigned.aab
UNSIGNED_ARTIFACT_SHA256     = 9a67aace816dfa0ea7a84d4ed9f38e6e01148205810833676410a0e894af9977

DEPLOY / PUBLISH / PLAY UPLOAD = NOT DONE (PLAY_STORE_UPLOAD NOT AUTHORIZED)
PRODUCTION_WRITE             = NONE
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

## 9. Release readiness verdict (local unsigned build)

- The **Build 106 codebase is reconciled** against canonical V5 (R-PRD-01..46, zero UNKNOWN), all
  known regressions resolved, `RELEASE_CRITICAL_GAPS_OPEN = 0`, genuine new-user lifecycle accepted
  (emulator-hydration), no Firestore/backend change to deploy.
- The **local release artifact (unsigned AAB) is built and verified**: correct version metadata,
  valid bundle structure, verified web payload, security guard clean.
- Production signing + Play upload were the remaining steps → **production signing is now done in §10.**

---

## 10. Authorized production signing + device smoke test (2026-09-03)

Founder-authorized: "Use the existing authorized production signing configuration/keystore …
Produce the production-signed Build 106 AAB." `PLAY_STORE_UPLOAD` remains separately gated
(not done). No product code changed.

### 10.1 Signing configuration — the existing authorized upload key

The production upload keystore is the one already used for Build 104 / Build 105 (required for
Play update continuity):

```text
BHUMI_RELEASE_STORE_FILE  = C:/Users/shein/keys/recovery-2026-08-03/bhumi-amartya-release.jks
                            (2678-byte PKCS12 — the INTACT recovery keystore; the 2632-byte
                             C:/Users/shein/keys/bhumi-amartya-release.jks is the known-corrupt
                             copy and was NOT used)
BHUMI_RELEASE_KEY_ALIAS   = bhumi-amartya
key identity              = CN=Bhumi Amartya, O=Bhumi Amartya, C=ID
                            valid 2026-06-06 → 2053-10-22, SHA384withRSA, 2048-bit RSA
key SHA-256               = 1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18
key SHA-1                 = B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52
```

`android/keystore.properties` was populated for the build **from the identical authorized config
already present in the Build 104 / forensic worktrees** (a file copy of established config — no
secret was authored or transcribed), and **removed immediately after the build**. It is gitignored;
the worktree carries no signing material. `android/app/build.gradle` was **not** modified — its
existing `signingConfigs.release` block (env vars → `keystore.properties` fallback) was used as-is.
`RELEASE_SIGNING_GUIDE.md` in the repo is stale (its "keystore Not Found" audit + `bhumi-alias`
predate the real upload key) and was not followed.

### 10.2 Build + signature verification

| Check | Result |
|---|---|
| `gradlew :app:bundleRelease` (JDK 17, SDK 36, Gradle 9.4.1, keystore configured) | **BUILD SUCCESSFUL** — `:app:packageReleaseBundle` UP-TO-DATE (identical content to §3), `:app:signReleaseBundle` + `:app:bundleRelease` executed. |
| **Signed AAB** | `android/app/build/outputs/bundle/release/app-release.aab` — **10,834,020 bytes** — sha256 **`460f44e246ad3c5d8b219dac45da32994cf4c0d166a33be7a1c74791522a303d`** |
| AAB zip integrity (`unzip -t`) | **No errors detected in compressed data.** |
| Signature files | `META-INF/BHUMI-AM.RSA` + `BHUMI-AM.SF` + `MANIFEST.MF` (v1 / JAR signing — the scheme Play requires for an AAB upload). |
| `jarsigner -verify` | **"jar verified."** Signed by `CN=Bhumi Amartya, O=Bhumi Amartya, C=ID`, SHA384withRSA, 2048-bit. (Benign, expected warnings: self-signed upload cert / no chain / no timestamp — normal for an Android upload key.) |
| **Signing cert fingerprint (from `BHUMI-AM.RSA`)** | SHA-256 `1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18` — **exact match to the authorized upload key**. SHA-1 `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52` ✓ |
| Package identity + version (packaged manifest) | `com.bhumiamartya.app` / versionCode **106** / versionName **5.0.6** / minSdk 24 / targetSdk 36 / `MainActivity` MAIN+LAUNCHER / no `.qa` / no `debuggable` — unchanged from §4. |

### 10.3 Device smoke test — signed release APK on an Android emulator

A companion **signed release APK** (`gradlew :app:assembleRelease`, same keystore) was built for an
installable smoke test (the AAB itself is not directly installable):

```text
signed APK                 = android/app/build/outputs/apk/release/app-release.apk
size                       = 11,032,601 bytes
sha256                     = dfbae26953844ca37cb1ecd12a6eded1382297bdccbe5d1dd9b15258bcd64438
apksigner verify           = Verifies — v2 APK Signature Scheme = true
apksigner signer cert      = SHA-256 1bc13061aab6f7eb362bfd0a71e3db106db8615736a337b197fc5f0db592b518  ✓ (authorized key)
aapt2 badging              = package 'com.bhumiamartya.app' versionCode='106' versionName='5.0.6'
                             targetSdk 36; application-label 'Bhumi Amartya';
                             launchable-activity com.bhumiamartya.app.MainActivity
```

| Step | Result |
|---|---|
| Emulator | `Pixel_8` AVD booted (`sdk_gphone16k_x86_64`, Android SDK 37), `sys.boot_completed=1` |
| `adb install -r app-release.apk` | **Success** — Android accepted the signature; installed `versionCode=106` / `versionName=5.0.6` / `signatures{version:2}` |
| `am start com.bhumiamartya.app/.MainActivity` | `topResumedActivity = com.bhumiamartya.app/.MainActivity`; process stayed alive for the full session |
| Runtime | `D Capacitor: Starting BridgeActivity`; WebView `com.google.android.webview 145.0.7632.218` loaded; sandboxed render process spawned; app requested INTERNET |
| Crash scan | **No `FATAL EXCEPTION`, no `ANR`, no Capacitor error** in the full logcat session |
| Rendered UI | The **Build 106 welcome screen** rendered: logo + "Bhumi Amartya" + tagline "Ruang Untuk Pulang dan Kenali Diri" + CTA "Pengguna Baru" + button "Saya Sudah Punya Akun" + the **Indonesia / English / Melayu** language selector (Build 85 §D + Build 106 localization foundation). Screenshots in the session scratchpad. |

The web layer used synthetic placeholder Firebase/HD/billing config (this is an
artifact-verification build, not wired to production); the smoke test proves the signed package
installs, launches, boots the Capacitor + WebView runtime, and renders the correct localized
Build 106 UI without crashing. A production-config functional pass on a real device is the ideal
final proof (DS-GATE07 / RC-1, already accepted at emulator-hydration; not a blocker).

### 10.4 Teardown

`app` uninstalled from the emulator; emulator killed; `android/keystore.properties` **removed**
(no signing material in the worktree); ephemeral `.env.local` / `out/` / `.next/` / debug logs /
`/tmp/sigcheck` / `/tmp/aabcheck` removed; Capacitor gradle-file whitespace churn reverted.
**Worktree tracked status: clean.** Forensic worktree `C:\tmp\bhumi-build83-access-hotfix`:
untouched (its `keystore.properties` was read, never modified).

### 10.5 Verdict

- **Production-signed Build 106 AAB produced and verified** — signature valid, signing cert ==
  the authorized Play upload key, package `com.bhumiamartya.app`, versionCode 106 / versionName
  5.0.6, bundle integrity OK.
- **Device smoke test PASS** — signed build installs, launches, and renders the correct Build 106
  UI on an Android emulator with no crash.
- Signing/build verification exposed **no release-blocking defect**; no product code was modified.
- **`PLAY_STORE_UPLOAD` remains separately gated and was NOT performed.** No deploy, publish, or
  production write.

`BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY` — signed artifact ready for Play Console
upload on separate Founder authorization.

STOP AND WAIT FOR FOUNDER REVIEW
