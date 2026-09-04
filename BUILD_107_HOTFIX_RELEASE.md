# BHUMI AMARTYA — BUILD 107 PRODUCTION REGRESSION HOTFIX

Status: **`BUILD_107_RECONCILED` — Founder-approved hotfix committed, versioned, built, production-signed,
verified, and device-QA'd. Play Console upload is the only remaining step and is separately gated
(`PLAY_STORE_UPLOAD` NOT AUTHORIZED here).**
Primary authority for Build 106 lineage: `BUILD_106_MASTER_SOT.md`. This file is the canonical
Build 107 record.
Date: 2026-09-04. Primary agent: CLAUDE_CODE.

```text
BRANCH                       = recovery/build106-product-continuity
HEAD (post-fix, pre-docs)    = 4e6ca26  (this docs commit is its direct child)
BASE (released Build 106)    = f16f5cf
versionCode                  = 107
versionName                  = 5.0.7
RELEASE_NAME                 = BHUMI AMARTYA V5 BUILD 107
applicationId                = com.bhumiamartya.app
RELEASE_CRITICAL_GAPS_OPEN   = 0
```

## 1. Why Build 107 exists

The published Build 106 carried three live production regressions (audit: this session):

1. **Human Design Identity Core stuck on "menghitung ulang" for existing / legacy users.**
2. **The legacy in-app admin console was exposed in the production "Lainnya" menu.**
3. **The Auth Diagnostics page was exposed in the production "Lainnya" menu.**

Plus five stale orphan routes (`/status /test /roadmap /changelog /onboarding`) shipped in the
static export, unlinked but reachable, carrying stale content (e.g. `/status`:
"Version Code 45 / BHUMI V3 FANTA").

The published Build 106 artifact is **superseded** and must not be reused.

## 2. Fix commits (on `recovery/build106-product-continuity`, child of `f16f5cf`)

| Commit | Scope |
|---|---|
| `49af553` | **fix(build107): converge existing-user Human Design to a resolved Identity Core** — `CoreIdentity.tsx` renders any recognized/settled stored HD type as the resolved value (no perpetual "Menghitung..." / "Perlu dihitung ulang" / "perlu kalkulasi ulang"); `AccuracyUpgradeBanner.tsx` + `PendingHdRecoveryBanner.tsx` persist a recalculation only when `isCanonicalHumanDesign(nextHD)`, so a failed recalc can no longer strip a recoverable historical type. Canonical Gaia-engine path, background retry, and `/blueprint/human-design` detail view unchanged; new-user HD calculates normally. |
| `07ae6e0` | **fix(build107): withdraw the in-app admin console and Auth Diagnostics from the production UI** — `AppNav.tsx` drops the "Admin" + "Auth Diagnostics" items and all privileged-role logic; new `lib/config/adminUiExposure.ts` (`isAdminUiExposed()` = `NEXT_PUBLIC_ENABLE_ADMIN_UI === "true"`, default off); `app/admin/page.tsx` + `app/admin/activity/page.tsx` + `app/admin/diagnostics/page.tsx` redirect to `/dashboard` and render nothing when the flag is off, so a production build cannot reach them by direct navigation; `scripts/run-prod-build.mjs` pins the flag `false`; delete `patch_nav.js`. The `hasPrivilegedPageAccessForUid` role check is kept as the second layer for an internal web/dev console. |
| `58adcc4` | **chore(build107): remove obsolete orphan dev/marketing routes** — delete `app/status`, `app/test`, `app/roadmap`, `app/changelog`, `app/onboarding`, and `components/audit/AuditReadiness.tsx` (only consumed by `/status`). |
| `d3a9674` | **test(build107): cover HD convergence, production-surface exposure, and route inventory** — new `tests/unit/build107-hd-existing-user-convergence.test.ts` (19 assertions) + `tests/unit/build107-production-surface-guard.test.ts` (STATIC_GUARD, classifies every `app/**/page.tsx`, asserts the five removed routes stay gone); both registered in `tests/release-manifest.mjs`; `build106-admin-lifetime-continuity.test.ts` nav assertion inverted (authorization assertions kept); `scripts/validateInboxNavRoleVisibility.ts` reworked for the product-only menu. |
| `4e6ca26` | **chore(release): prepare Build 107 — versionCode 107 / versionName 5.0.7** — `android/app/build.gradle` (106→107, 5.0.6→5.0.7; signing config unchanged), `lib/config/buildInfo.ts` (`5.0.7` / `107` / `"107"`), `tests/unit/version-reconciliation.test.ts` retargeted + Build 106 stale-guard added. |

## 3. Preserved (authorization — untouched)

`lib/auth/privilegedUser.ts`, `lib/auth/requireFounder.ts`, `lib/auth/adminContinuity.ts`,
`getEntitlementStatus` admin-lifetime path, `firestore.rules`, `GuardianIdentityCard` recognition.
The four historical admin identities (Maulina, Septi, Nandra / Nanda Viandra, Azian Meirdania),
their `role:"admin"` Firestore state, and their non-expiring Lifetime entitlement are unaffected —
covered green by the release suite (`build106-admin-lifetime-continuity` 22/22 + the emulator
four-admin authorization / persistence / negative-access / relogin suite). `firestore.rules` diff
vs Build 105 is empty; no backend deploy.

## 4. Ancestry verification (before build)

`git merge-base --is-ancestor <c> HEAD` = true for every required commit:

- Build 106 reconciled source — `2d625bd` ✔
- admin / lifetime reconciliation — `36a32cd` (fix) + `e5d1592` (test) ✔
- Build 106 release prep — `0b55f99` ✔
- Build 107 HD convergence fix — `49af553` ✔
- Build 107 production-surface cleanup — `07ae6e0` + `58adcc4` ✔
- Build 107 version bump — `4e6ca26` ✔

Forensic worktree `C:/tmp/bhumi-build83-access-hotfix` (`feat/build99` @ `57479c9`) — untouched.

## 5. Build

- **Web export:** `node scripts/run-prod-build.mjs` (`NEXT_PUBLIC_ENABLE_ADMIN_UI=false` +
  emulator flags off, `NODE_ENV=production`; `next build`, `output:'export'` → `out/`) — **EXIT 0**.
  Route tree shows no `/status /test /roadmap /changelog /onboarding`. Ephemeral `.env.local`
  copied from `C:/tmp/bhumi-v5-build104/.env.local` (canonical `bhumiamartya-fe85c` client config;
  gitignored) and deleted afterward.
- `tsx scripts/guard-release-bundle.ts` — **0 release security violations**.
- `cap sync android` — OK, 9 Capacitor plugins (unchanged from Build 106).
- **Signed bundle + apk:** authorized `keystore.properties` copied to `android/keystore.properties`
  (gitignored), `cd android && ./gradlew :app:bundleRelease :app:assembleRelease` (JDK 17,
  `ANDROID_HOME=$HOME/AppData/Local/Android/Sdk`) — **BUILD SUCCESSFUL**; `android/keystore.properties`
  removed immediately after. `minifyEnabled false` ⇒ no `mapping.txt` (same as Build 106).

## 6. Artifacts

| | AAB | APK (device-QA companion) |
|---|---|---|
| Build path | `android/app/build/outputs/bundle/release/app-release.aab` | `android/app/build/outputs/apk/release/app-release.apk` |
| Staged copy | `bhumi-amartya-v5.0.7-build107-release-signed.aab` | `bhumi-amartya-v5.0.7-build107-release-signed.apk` |
| Size (bytes) | **10,833,021** | **11,033,120** |
| SHA-256 | **`3ac83cdc4ddbdc6bc3fb719f2809477a91779961d482d7edb1dd2e8c4f9b210a`** | **`bb0729be6d2282fad28c50aaba14a9cd3821a4af9b0d317ac4a6009de857a1f2`** |

## 7. Verify

| Check | Result |
|---|---|
| `npx tsc --noEmit` @ `4e6ca26` | **EXIT 0** |
| Full Firestore/Auth emulator release suite (`npm run test:release`, JDK 21) | **`RELEASE_TESTS_PASS` — PASS=29 FAIL=0 SKIPPED=0** (state machines `passed=33/33`, `35/35`, `9/9`) — includes both Build 107 hotfix suites + four-admin authorization + owner isolation |
| `tests/unit/build107-hd-existing-user-convergence.test.ts` | 19/19 — legacy no-engine-version record and stale local-fallback resolve to their type; banners only persist a canonical result; genuine no-type pending still shows the calculating label; hard error → honest unavailable |
| `tests/unit/build107-production-surface-guard.test.ts` | 131/131 — nav exposes no admin/diagnostics entry, no privileged-role logic; every `app/admin` route carries the `isAdminUiExposed()` gate; `run-prod-build` pins the flag off; admin AUTHORIZATION primitives intact; every route classified; the five removed routes + `AuditReadiness` stay gone |
| `tests/unit/version-reconciliation.test.ts` | 21/21 — 5.0.7 / 107 across `buildInfo.ts` + `src/lib/version.ts` + `android/app/build.gradle`; Build 105/106 stale-guards |
| `scripts/validateInboxNavRoleVisibility.ts` | PASS |
| `scripts/guard-release-bundle.ts` | 0 violations |
| `eslint` (touched files) | 0 errors (pre-existing warnings only) |
| AAB `unzip -t` | No errors detected |
| AAB `jarsigner -verify` | `jar verified.` |
| AAB signer cert (`keytool -printcert` on `META-INF/BHUMI-AM.RSA`) | `CN=Bhumi Amartya, O=Bhumi Amartya, C=ID`; **SHA-256 `1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18`** = authorized Play upload key; valid 2026-06-06 → 2053-10-22 |
| APK `apksigner verify --print-certs` | `Verifies`; **v2 scheme = true**; signer SHA-256 `1bc13061…b592b518`, SHA-1 `b51c84d0…f792cc52`, RSA 2048; 1 signer |
| AAB packaged manifest (`bundletool dump manifest`) | `package="com.bhumiamartya.app"` · `versionCode="107"` · `versionName="5.0.7"` · `minSdkVersion="24"` · `targetSdkVersion="36"` · `MainActivity` MAIN+LAUNCHER · no `android:debuggable` · no `.qa` |
| APK `aapt2 dump badging` | `com.bhumiamartya.app` / `107` / `5.0.7`; targetSdk 36; launchable `com.bhumiamartya.app.MainActivity`; **no new permissions vs Build 105/106** |

## 8. Device QA

| Step | Result |
|---|---|
| Emulator | `Pixel_8` AVD (`sdk_gphone16k_x86_64`, Android SDK 37), `sys.boot_completed=1` |
| `adb install -r app-release.apk` | **Success** — signature accepted; installed `versionCode=107` / `versionName=5.0.7` / `signatures{version:2}` |
| `am start com.bhumiamartya.app/.MainActivity` | `Status: ok`; `topResumedActivity` / `ResumedActivity` / `mCurrentFocus` = `com.bhumiamartya.app/.MainActivity`; process alive ~60s+, no restart |
| Render | Welcome screen renders — logo, "Bhumi Amartya", tagline "Ruang Untuk Pulang dan Kenali Diri", CTA "Pengguna Baru", "Saya Sudah Punya Akun", language selector **Indonesia / English / Melayu**. Capacitor + WebView 145.x + sandboxed render process healthy. |
| Crash scan | **No `FATAL EXCEPTION`, no `ANR in com.bhumiamartya.app`, no `E AndroidRuntime`, no `Fatal signal`.** `dumpsys dropbox` has **zero** entries for `com.bhumiamartya.app`. (Post-boot `ActivityManager` "has died" lines are all unrelated system packages under emulator memory pressure.) |
| Teardown | app uninstalled; emulator killed; `android/keystore.properties` removed; ephemeral `.env.local` / `out/` / `.next/` removed; `cap sync` gradle-file eol churn reverted. **Worktree clean.** |

Note: this QA is install + launch + render + stability. A rendered pass on a real legacy account
(Identity Core resolves a historical HD type; "Lainnya" shows no admin/diagnostics; direct
`/admin/activity` navigation redirects to `/dashboard`) is the ideal final proof and is described
in the manual test plan in the session report.

## 9. Verdict

```text
HUMAN_DESIGN_EXISTING_USER_FIX               = FIXED (code + unit/static; committed 49af553)
ADMIN_UI_PRODUCTION_EXPOSURE                 = REMOVED (nav item dropped + route gated off in prod build; 07ae6e0)
AUTH_DIAGNOSTICS_PRODUCTION_EXPOSURE         = REMOVED (nav item dropped + route gated off in prod build; 07ae6e0)
DEV_ONLY_ROUTES_PRODUCTION_EXPOSURE          = REMOVED (/status /test /roadmap /changelog /onboarding deleted; 58adcc4)
ADMIN_AUTHORIZATION_PRESERVED               = YES (privilegedUser / requireFounder / adminContinuity / entitlement / firestore.rules untouched; 4-admin suite green)
FINAL_SIGNED_BUILD_107                       = VERIFIED (AAB sha256 3ac83cdc…210a + APK sha256 bb0729be…a1f2; upload key 1BC13061…B518; pkg com.bhumiamartya.app / 107 / 5.0.7)
DEVICE_QA                                    = PASS (install + launch + MainActivity topResumed + Build 107 welcome render; no FATAL / ANR)
RELEASE_CRITICAL_GAPS_OPEN                  = 0
BUILD_107_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = YES (gated on Founder manual Play Store upload)
```

`PLAY_STORE_UPLOAD` is NOT AUTHORIZED and was NOT performed. No deploy, publish, backend deploy,
or production Firestore read/write occurred.

`NEXT_SAFE_ACTION = STOP_AND_WAIT_FOR_FOUNDER_PLAY_STORE_UPLOAD`
`NEXT_ACTION_MODE = APPROVAL_GATED`
