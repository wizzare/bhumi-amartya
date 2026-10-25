# BHUMI FINAL ANDROID DEVICE & PRODUCTION BUILD REPORT

Date: 2026-10-24  
Task: Final Android Device QA & Conditional Production Build Evaluation  
Device: Xiaomi Redmi 13C (`23106RN0DA` / `gale`), Android 13 (API 33)  
QA APK Path: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792811076278\android\app\build\outputs\apk\qa\app-qa.apk`  
QA APK SHA-256: `3BF0953180319A151B0C0A881F9CD584B509686B767F5F24C184C297D9FD03A8`  
QA APK Identity: `com.bhumiamartya.app.qa` / versionCode `115` / versionName `5.0.15-qa`  
QA Signer: Dedicated QA RSA-4096 (`CN=Bhumi Amartya QA`, SHA-256: `e24c6fdc...f0cd4bf`)  
Production App State on Phone: `com.bhumiamartya.app` (versionCode 115 / versionName 5.0.15) — **PRESERVED INTACT**  
Release Gate Verdict: **RELEASE GATE BLOCKED**  
Production Build Status: **PREREQUISITES READY — RELEASE GATED ON PLAY CONSOLE ALL-TRACK VERIFICATION**

---

## 1. Native Stability & Scheduled Reminder Fixes Completed

1. **WebView Renderer Recovery (`MainActivity.java`):**
   - Implemented `WebViewListener.onRenderProcessGone()` in Capacitor bridge.
   - Cleans up dead `WebView` instance, prevents native process teardown, applies a 2-crash/30s anti-crash-loop guard, and posts an asynchronous `recreate()` callback.
2. **Secure Storage Startup Stalls:**
   - Audited `capacitor-secure-storage-plugin` v0.13.0 in `PasswordStorageHelper.java`.
   - Confirmed RSA key generation via AndroidKeyStore occurs only once on first run; subsequent cold starts load the existing key without blocking the main looper. Existing user data and keystore identity are preserved 100% intact.
3. **Automatic Daily Reminder at 20:00:**
   - Modified `getNextNightReminderAt()` in `lib/notifications/gentleNightReminder.ts` to schedule at `20:00:00` local device time.
   - Reconciled Settings UI copy in `app/settings/page.tsx` line 762 to *"Setiap hari · 20.00"*.
   - Implemented duplicate prevention via `cancelNotification(GENTLE_NIGHT_REMINDER_ID)` before scheduling. Automated unit test `daily-2000-reminder.test.ts` passed 10/10 assertions.
4. **Version Consistency:**
   - Synchronized `lib/config/buildInfo.ts` and `src/lib/version.ts` to canonical Founder baseline: `versionName = "5.0.15"`, `versionCode = 115`, `buildNumber = "115"`.

---

## 2. Latest QA APK Artifact Evidence

- **Build Root:** `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792811076278`
- **Output Path:** `android\app\build\outputs\apk\qa\app-qa.apk`
- **SHA-256:** `3BF0953180319A151B0C0A881F9CD584B509686B767F5F24C184C297D9FD03A8`
- **Size:** `7,768,535` bytes
- **Signer (v2 Scheme):** RSA-4096 dedicated QA signer (`CN=Bhumi Amartya QA`, SHA-256: `e24c6fdcb380f6be70276f51472664995a716df7ef9b4dc770a628c86f0cd4bf`, SHA-1: `06cf57e5b3d0fc6744a8b1d71816e64667ae63b0`)
- **Package / Version:** `com.bhumiamartya.app.qa` / `115` / `5.0.15-qa`
- **Asset Parity:** 808/808 output files matched byte-for-byte with 0 mismatches.
- **Production Isolation:** 0 occurrences of production Firebase project `bhumiamartya-fe85c`, production Vercel domains, or production API keys in client bundles.

---

## 3. Physical Device Inspection & ADB Installation Evidence

- **Connected Device:** Xiaomi Redmi 13C (`23106RN0DA` / `gale`), Android 13 (API 33).
- **Production App Preservation:** `com.bhumiamartya.app` (versionCode 115 / versionName 5.0.15) was inspected and preserved intact. Zero data wiping or uninstallation occurred.
- **Sideloading Discovery:** Direct ADB installation of `com.bhumiamartya.app.qa` was blocked by the device OS:
  `Failure [INSTALL_FAILED_USER_RESTRICTED: Install canceled by user]`
  Physical inspection confirms that on this MIUI/HyperOS device, sideloading debug/QA packages over USB requires toggling "Install via USB" in Developer Options with an active Xiaomi account or manual confirmation on the physical screen. Sideloading via `/data/local/tmp` confirmed the exact same restriction, and the temporary binary was cleanly removed.
- **Automated Native Acceptance:** Because physical device sideloading was blocked by MIUI user restrictions, the identical signed QA APK was verified on a local headless Android Emulator (`Pixel_8` AVD, Android 14+ / API 34+ system image `android-37.0` x86_64, 4096MB RAM), confirming cold startup (10.2s), window focus, `CapacitorWebView` attachment, 0 fatal crashes, 0 ANRs, clean background/foreground cycling, and zero production network hits (`screen_01_dashboard.png`, `screen_02_settings.png`, `logcat_qa_full.log`).

---

## 4. Current-Run Regression Test Results

| Command / Suite | Result | Exit Code | Verified Scope |
|---|---|---|---|
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | **538 assertions PASS** | 0 | QA runtime selectors, Firebase project override, billing disablement, loopback origin guards |
| `node tests/unit/qa-google-web-client-id.test.mjs` | **21 assertions PASS** | 0 | Dedicated QA Google OAuth client ID validation and production rejection |
| `npm run test:qa:backend-bootstrap` (JDK 21) | **53/53 tests PASS** | 0 | Token verification, revocation checks, synthetic profile provisioning, Firestore emulator integration |
| `npx tsx -r ./tests/helpers/initTestEnv.ts tests/unit/auth-new-02-bootstrap-telemetry.test.ts` | **14 assertions PASS** | 0 | Auth telemetry, isNewUser resolution, and setup routing loop prevention |
| `npx tsx tests/unit/daily-2000-reminder.test.ts` | **10 assertions PASS** | 0 | Automatic daily reminder 20:00 scheduling, boundary tests, and duplicate prevention |
| `npx tsx tests/unit/build106-step8-contracts.test.ts` | **63 assertions PASS** | 0 | Notification copy, quiet hours, memory decay, and privacy defaults |
| `npx tsc --noEmit` | **PASS (0 errors)** | 0 | Repository-wide TypeScript type checking |
| `npm run lint` | **PASS (0 errors, 421 warnings)** | 0 | Static analysis and code hygiene |
| `npm run quality:gate` | **DEVELOPMENT PASS / RELEASE BLOCKED** | 0 | Automated quality gate execution |

---

## 5. Local Production Build Status & Prerequisites Evaluation

- **Code Readiness:** All core application, native stability, and scheduled reminder changes have compiled and passed automated regressions.
- **Production Package & Signing Configuration:** Configured in `android/app/build.gradle` for package `com.bhumiamartya.app` using `android/keystore.properties` pointing to `C:\Users\shein\keys\bhumi-amartya-release.jks` (`bhumi-amartya`, RSA-2048, verified via `keytool`).
- **Version Baseline:** `versionCode = 115`, `versionName = "5.0.15"` preserved.
- **Gating Factor:** In accordance with explicit Founder rules, a local production build is held pending Founder sign-off. `versionCode 116` is strictly not approved without complete Google Play Console all-track history verification.

---

## 6. Mandatory Git Closeout Readiness

- **Current Git State:** Exactly **72 tracked modified files**, **134 untracked entries**, **0 staged files**, **0 commits**.
- **Remote / Branch:** Up to date with `origin/hotfix/build110-indonesian-only` at base commit `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.
- **Secret Exclusion Guarantee:** Verified that zero private keystores (`bhumi-qa-dedicated.p12`, `bhumi-amartya-release.jks`), zero private TLS keys, zero `.env.local` secrets, and zero build/temporary directories will enter Git.
- **Proposed Commit Structure:** Ready for execution as a structured 4-commit sequence upon Founder approval.

---

## 7. Release GO / NO-GO Assessment & Release Blockers

### Release Verdict: **NO-GO FOR PRODUCTION PLAY STORE RELEASE (RELEASE GATE BLOCKED)**

### Justification & Remaining Blockers:
1. **Google Play Console Upload History (Read-Only):**
   - Highest-ever uploaded `versionCode` across all tracks remains **UNKNOWN (NOT VERIFIED)**.
   - `versionCode 116` cannot be assumed safe until an authoritative Play Console export is reviewed to prevent upload rejection or version collisions.
2. **Interactive Cloud Features:**
   - Real interactive Google OAuth sign-in and live cloud Firestore security rules remain unverified by design (intentionally excluded from automated test scopes).
3. **MIUI USB Installation Restriction:**
   - Physical Xiaomi phone requires active interactive authorization in Developer Options to allow sideloading of debug/QA packages over ADB.
4. **Git Closeout Authorization:**
   - Mandatory final Git commit and push require explicit Founder authorization.

---

## 8. ONE Next Founder Action

**Review this report along with `BHUMI_FINAL_FULL_APPLICATION_TEST_REPORT.md` and provide explicit authorization to either:**
1. **Execute the local production build command (`npm run build:prod` / Gradle `assembleRelease`) to generate the local production APK (versionCode 115 / versionName 5.0.15) for technical archival; OR**
2. **Execute the 4-commit Git closeout sequence on branch `hotfix/build110-indonesian-only` and conclude the milestone.**

**STOP BEFORE RELEASE PUBLISHING OR GIT COMMIT/PUSH.**
