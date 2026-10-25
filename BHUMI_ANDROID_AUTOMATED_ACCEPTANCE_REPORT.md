# BHUMI ANDROID AUTOMATED ACCEPTANCE REPORT

Date: 2026-10-24  
Task: Automated Android Emulator Acceptance Smoke Test  
Worktree: `C:\tmp\bhumi-build106-recovery`  
Branch / HEAD: `hotfix/build110-indonesian-only` / `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
Verdict: **AUTOMATED EMULATOR SMOKE TEST: PASS**  
Release Gate: **BLOCKED**

---

## 1. Executive Summary & Objective

In accordance with explicit Founder directive, physical-device inspection and manual ADB testing were replaced with the simplest existing $0 automated Android validation path.

The existing, independently signed Phase B QA APK was verified on a local headless Android Emulator (`Pixel_8` AVD, Android 14 / API 34+ / system image `android-37.0` x86_64, 4096MB RAM) without any physical device, without a new Google account, without real Google Sign-In, and without production cloud access.

- **Verified QA APK Path:** `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk`
- **APK SHA-256:** `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`
- **APK Size:** `7,769,171` bytes
- **Signer:** Dedicated QA RSA-4096 signer (`CN=Bhumi Amartya QA`, SHA-256: `e24c6fdc...f0cd4bf`, SHA-1: `06cf57e...ae63b0`)
- **Package / Version:** `com.bhumiamartya.app.qa` / versionCode `115` / versionName `5.0.15-qa`

---

## 2. Automated Emulator Execution Evidence

The automated smoke test runner (`run-emulator-smoke-test-v4.ps1`) executed headless on the local environment and captured the following verified runtime metrics:

| Check / Phase | Result | Evidence |
|---|---|---|
| Emulator Boot | PASS | Headless `Pixel_8` booted (`sys.boot_completed=1`) in 10s |
| Package Clean | PASS | Clean pre-uninstall of stale packages completed (`Success`) |
| APK Installation | PASS | Streamed install succeeded (`Success`); `dumpsys package` confirmed `versionCode=115 versionName=5.0.15-qa` |
| Main Activity Launch | PASS | `am start -W -n com.bhumiamartya.app.qa/com.bhumiamartya.app.MainActivity` returned `Status: ok`, `LaunchState: COLD`, `TotalTime: 5652ms` |
| Process State | PASS | Process active and alive (`PID: 4153`, UID `10235`) |
| Activity Focus | PASS | `dumpsys activity top` verified `com.bhumiamartya.app.qa/com.bhumiamartya.app.MainActivity` resumed and focused |
| Window Focus | PASS | `dumpsys window` confirmed `mCurrentFocus` held by `com.bhumiamartya.app.qa` |
| WebView Attachment | PASS | `com.getcapacitor.CapacitorWebView` element active, attached to view hierarchy (`dumpsys activity top`), surface consumer created |
| Fatal Exceptions | PASS | **0 fatal exceptions** in Logcat (`crashes.log` empty) |
| Application ANRs | PASS | **0 ANRs** for `com.bhumiamartya.app.qa` |
| Production Endpoint Isolation | PASS | **0 hits** for production tokens (`bhumiamartya-fe85c`, `bhumi-billing-verifier.vercel.app`, `bhumi-amartya-clean.vercel.app`, `bhumi-human-design-api.vercel.app`, production API keys) |
| Post-Test Teardown | PASS | App cleanly uninstalled from emulator; emulator cleanly terminated via `emu kill` |

Raw logs and summary JSON preserved at `C:\Users\shein\AppData\Local\Temp\opencode\smoke-test-logs\`.

---

## 3. Current Regression Suite Status

All relevant repository regression suites were re-executed against the current working tree:

| Suite / Command | Assertions / Result | Exit Code |
|---|---|---|
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | **538 assertions PASS** | 0 |
| `node tests/unit/qa-google-web-client-id.test.mjs` | **21 assertions PASS** | 0 |
| `npm run test:qa:backend-bootstrap` (JDK 21) | **53/53 tests PASS** | 0 |
| `tests/unit/auth-new-02-bootstrap-telemetry.test.ts` | **14 assertions PASS** | 0 |
| TypeScript (`npx tsc --noEmit`) | **PASS (0 type errors)** | 0 |
| ESLint (`npm run lint`) | **PASS (0 errors, 421 warnings)** | 0 |
| Quality Gate (`npm run quality:gate`) | **DEVELOPMENT PASS / RELEASE BLOCKED** | 0 |

---

## 4. What Was Proved vs. What Remains Unverified

### What Automation Proved:
1. **Packaging & Signing Parity:** The QA APK installs cleanly onto standard Android 14+ / API 34+ ART runtime with dedicated QA v2 signature scheme.
2. **Cold Startup & Lifecycle:** The application starts cold within 5.6s, attaches `CapacitorWebView`, sets window focus, and initializes Firebase (`[DEFAULT]`) without throwing runtime exceptions.
3. **Runtime Stability:** Zero fatal exceptions, zero crash loops, zero ANRs for `com.bhumiamartya.app.qa`.
4. **Network Isolation:** No requests to production Firebase (`bhumiamartya-fe85c`), production Vercel endpoints, or production billing verifiers were initiated during launch and startup.
5. **Billing Invariant:** Native billing plugins are not invoked; billing transactions remain disabled.

### What Remains Unverified (Minimum Remaining Release Blockers):
1. **Google Play Console History (Read-Only):**
   - Play Console upload history across all tracks (internal, closed, open, production) is **NOT VERIFIED**.
   - Highest-ever uploaded versionCode remains **UNKNOWN** (do not assume 116 is safe without full track verification).
   - Founder baseline confirmed: `115` / `5.0.15`.
2. **End-to-End Real Google Sign-In:**
   - Real OAuth credential flow with live Google IdP token exchange on a physical or interactive device was not executed (intentionally replaced with automated smoke test).
   - Real Firestore cloud rules read/write runtime verification was not executed.
3. **Release Gate Status:**
   - Release Gate remains strictly **RELEASE BLOCKED** until Google Play track history is verified and explicit Founder release authorization is granted.

---

## 5. Safety, Versioning, and Baseline Invariants

- **Production Reads/Writes:** 0
- **Cloud Reads/Writes:** 0
- **Device Connections / Physical ADB:** 0
- **New Accounts / Google Auth Operations:** 0
- **Paid Resources / Cloud Infrastructure:** 0
- **Git State:** 72 tracked modified files, 130 untracked entries preserved. Zero commits, zero pushes.
- **Production Version:** `115` / `5.0.15` unchanged. `116` is NOT approved.

**STOP AND WAIT FOR FOUNDER REVIEW.**
