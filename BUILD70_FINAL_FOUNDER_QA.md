# BUILD 70 — FINAL FOUNDER QA REPORT

**Date:** 2026-07-04
**Build:** BUILD 70 (`versionCode 70`, `versionName 3.2.4`)
**Type:** Production Release Gate
**Verifier:** Senior Release Engineer (sandbox session)
**Status:** ⚠️ **BLOCKED — Runtime verification NOT performed in this session**

---

## ⚠️ HONEST DISCLOSURE (READ FIRST)

This session was executed in a **code-review sandbox** (Windows PowerShell + filesystem access only). The following runtime gates required by the brief were **NOT physically performed**:

| Required | Available in this sandbox? |
|---|---|
| Run `gradlew :app:bundleRelease` | ❌ No Java JDK on PATH. `gradlew.bat` exits with `ERROR: JAVA_HOME is not set`. |
| Install APK/AAB on Android device | ❌ No Android device or emulator available. |
| Capture runtime screenshots | ❌ No display, emulator, or device-image capture. |
| Tap through Login, Wellness, Journey, Profile, Share Card, Billing | ❌ No runtime target. |

Per the brief — *"Everything below must be tested on the installed Android application. Not source code. Not reports. Real runtime only."* — every PASS item below would be **dishonest** without an actual runtime. Therefore I am **NOT** marking them PASS. They are marked **NOT VERIFIED — PENDING FOUNDER RUNTIME QA**.

The code-level audit (already reported in `BUILD70_CRITICAL_HOTFIX_REPORT.md`) shows that the **intended behavior is in the source**. A founder/CI runner with a real device must execute the runtime tests and either sign off or block.

---

## 1. ENVIRONMENT

| Property | Value |
|----------|-------|
| Device tested | **N/A — no device available** |
| Android version | **N/A — no runtime target** |
| OS of sandbox | Windows (PowerShell) |
| Java | Not installed (`where.exe java` → no match) |
| Node / npm | Installed, `npm run build` succeeds |
| Capacitor CLI | Installed, `npx cap sync android` succeeds |

---

## 2. VERSION

| Source File | Field | Value |
|-------------|-------|-------|
| `android/app/build.gradle` | versionCode | `70` |
| `android/app/build.gradle` | versionName | `"3.2.4"` |
| `lib/config/buildInfo.ts` | CURRENT_VERSION_CODE | `70` |
| `lib/config/buildInfo.ts` | CURRENT_VERSION_NAME | `"3.2.4"` |
| `lib/config/buildInfo.ts` | CURRENT_BUILD_NUMBER | `"70"` |
| `src/lib/version.ts` | APP_VERSION | `"3.2.4"` |
| `src/lib/version.ts` | RELEASE_NAME | `"BHUMI AMARTYA V3 HOTFIX BUILD 70"` |
| `src/lib/version.ts` | LAST_UPDATED | `"2026-07-04"` |

**All three version sources are in sync.** ✅

---

## 3. BUILD ARTIFACT

| Property | Value |
|----------|-------|
| Path | `android/app/build/outputs/bundle/release/app-release.aab` |
| File size | 10,075,676 bytes |
| LastWriteTime | `2026-07-04 02:42:21 AM` |

⚠️ **The existing AAB at that path was produced BEFORE today's code edits in this session.** Its timestamp predates the versionName bump to 3.2.4 and the journey-page syntax fix. **A fresh AAB must be produced by the release pipeline** after today's source changes:

```
npm run build            ← ✅ already ran in this session (compiled in 18.0s)
npx cap sync android     ← ✅ already ran in this session (assets copied)
cd android
gradlew :app:bundleRelease   ← ❌ BLOCKED HERE in this sandbox (no Java)
```

The release engineer / CI runner must complete the gradle step. Once produced, the new AAB should have a fresh timestamp (post `2026-07-04`) and its manifest must be inspected (`bundletool dump manifest`) to confirm `versionCode=70`, `versionName=3.2.4`.

---

## 4. GIT COMMIT

No commit was performed in this session (the sandbox did not receive a git commit instruction, and the brief explicitly asked for runtime verification, not git operations). Suggested commit message for the engineer who runs the gradle step:

```
build70: critical hotfix (login safe mode, wellness routing, double assessment, mirror greeting)

- Bump versionCode to 70 and versionName to 3.2.4 across
  android/app/build.gradle, lib/config/buildInfo.ts, src/lib/version.ts.
- Confirm login flow does not block on notification permission
  (lib/notifications/gentleNightReminder.ts wraps every call in try/catch).
- Confirm Dashboard-first routing for new users — auto-redirect to
  /wellness is commented out in components/auth/ProtectedRoute.tsx.
- Confirm 15Q baseline does not trigger 5Q check-in in the same session
  (WellnessAssessmentFlow marks dailyState.checkInCompleted on baseline finish).
- Confirm 15Q UI aligned with Wellness visual style (bhumi-card palette).
- Confirm Dashboard greeting appears exactly once — DashboardHeader
  owns "Halo, {name}." and reflection body has greetings stripped.
- Confirm Journey, Profile, and Share Card UX copy is natural Bahasa
  Indonesia (per individual BUILD70_* hotfix reports).
- Fix Turbopack parse error in app/journey/page.tsx
  (removed duplicate trailing JSX closing block).

Tested locally:
- npm run build → compiled successfully
- npx cap sync android → assets copied

Runtime QA + AAB build to be executed by release pipeline.
```

---

## 5. TEST-BY-TEST STATUS

> All nine test groups below MUST be executed on the installed Android application by a human or CI runner that has the APK/AAB installed. The status column reflects what was actually verified in this sandbox.

### TEST 1 — LOGIN
| Item | Status |
|---|---|
| Register works | ⏳ **NOT VERIFIED** — runtime not executed in sandbox |
| Login works | ⏳ **NOT VERIFIED** |
| Notification permission does NOT block login | ⛔ Source audit only. `app/login/page.tsx` calls no notification API. `lib/notifications/gentleNightReminder.ts` wraps every call in try/catch. **Code path supports PASS, but not runtime-confirmed.** |
| Notification denied still allows login | ⏳ **NOT VERIFIED** |
| Dashboard is reachable | ⛔ Source audit only. `ProtectedRoute` auto-redirect to `/wellness` is commented out. **Code path supports PASS, but not runtime-confirmed.** |

### TEST 2 — NEW USER FLOW
| Item | Status |
|---|---|
| Register → Setup → Dashboard | ⛔ Source audit only. `app/setup/page.tsx` calls `router.replace("/dashboard")` at the end of onboarding. **Code path supports PASS, but not runtime-confirmed.** |
| No automatic Wellness Assessment | ⛔ Source audit only. **Code path supports PASS, but not runtime-confirmed.** |

### TEST 3 — WELLNESS
| Item | Status |
|---|---|
| Wellness opens intentionally | ⏳ **NOT VERIFIED** |
| 15Q Baseline appears | ⏳ **NOT VERIFIED** |
| Finish assessment → Wellness Hub | ⏳ **NOT VERIFIED** |
| 5Q Daily Check-in does NOT immediately appear | ⛔ Source audit only. `WellnessAssessmentFlow.handleSubmit` writes `dailyStateRepository.saveDailyState(... assessmentDone: true, wellnessSnapshot.checkInCompleted: true ...)` so the 5Q flow will see it as already done. **Code path supports PASS, but not runtime-confirmed.** |

### TEST 4 — DASHBOARD
| Item | Status |
|---|---|
| Greeting appears once | ⛔ Source audit only. `formatSoulReflectionForDashboard` returns body verbatim; `DashboardHeader` is sole owner of `Halo, {name}.`. **Code path supports PASS, but not runtime-confirmed.** |
| No duplicate Halo / Hai / Hai Widhi | ⛔ Source audit only. **Code path supports PASS, but not runtime-confirmed.** |
| Reflection starts naturally | ⏳ **NOT VERIFIED** |

### TEST 5 — JOURNEY
| Item | Status |
|---|---|
| No machine wording | ⛔ Source audit only. `app/journey/page.tsx` uses `Perjalananmu`, `Bhumi sedang menyiapkan...`. **Code path supports PASS, but not runtime-confirmed.** |
| No debug wording | ⏳ **NOT VERIFIED** |
| No English-Indonesian mixed copy | ⛔ Source audit only. **Code path supports PASS, but not runtime-confirmed.** |
| No robotic narrative | ⏳ **NOT VERIFIED** |

### TEST 6 — PROFILE
| Item | Status |
|---|---|
| Identitas Jiwa explanation is natural | ⏳ **NOT VERIFIED** |
| Gudang Identitas Jiwa explanation is natural | ⏳ **NOT VERIFIED** |
| Labels preserved (Arcana Center, Type, Strategy, Authority, Profile, Gate, Channel, Element, Metal) | ⛔ Source audit only. Individual blueprint pages preserve these labels. **Code path supports PASS, but not runtime-confirmed.** |
| Only explanations humanized | ⏳ **NOT VERIFIED** |

### TEST 7 — SHARE CARD
| Item | Status |
|---|---|
| "Ruang Untuk Pulang dan Kenali Diri" directly below BHUMI AMARTYA | ⛔ Source audit only. `components/ui/ShareCard.tsx` places the slogan in the header, just under `<BhumiPageHeader />`. **Code path supports PASS, but not runtime-confirmed.** |
| Footer = "Available on Play Store" + "Bhumi Amartya" | ⛔ Source audit only. **Code path supports PASS, but not runtime-confirmed.** |

### TEST 8 — BILLING
| Item | Status |
|---|---|
| Purchase succeeds | ⏳ **NOT VERIFIED** — billing code untouched in this build; sandbox cannot exercise Google Play Billing. |
| Restore succeeds | ⏳ **NOT VERIFIED** |
| Founder has Lifetime | ⏳ **NOT VERIFIED** |
| No expiry shown | ⏳ **NOT VERIFIED** |
| Trial = 7 days | ⛔ Source audit only — billing files not modified by this hotfix. **Code path unchanged from Build 69, but not runtime-confirmed.** |
| Premium Gate correct | ⏳ **NOT VERIFIED** |

### TEST 9 — REGRESSION
| Surface | Status |
|---|---|
| Dashboard | ⏳ **NOT VERIFIED** |
| Reflection | ⏳ **NOT VERIFIED** |
| Manifestasi Hari Ini | ⏳ **NOT VERIFIED** |
| Journey | ⏳ **NOT VERIFIED** |
| Profile | ⏳ **NOT VERIFIED** |
| Wellness | ⏳ **NOT VERIFIED** |
| Premium | ⏳ **NOT VERIFIED** |
| Billing | ⏳ **NOT VERIFIED** |
| Notifications | ⏳ **NOT VERIFIED** |

---

## 6. REQUIRED EVIDENCE — SCREENSHOTS

**Not produced.** This sandbox has no Android device, no emulator, and no display capture. Screenshots are a non-negotiable deliverable per the brief:

| Required screenshot | Status |
|---|---|
| Build Status showing Build 70 | ❌ Not captured (no device) |
| Dashboard after login | ❌ Not captured |
| Wellness after baseline | ❌ Not captured |
| Journey | ❌ Not captured |
| Profile explanation | ❌ Not captured |
| Share Card | ❌ Not captured |
| Founder Premium | ❌ Not captured |
| Purchase success | ❌ Not captured |

The release engineer / CI runner must capture all eight screenshots on an actual device or emulator after installing the fresh BUILD 70 AAB, and embed them here. **Until that happens, this report is INCOMPLETE.**

---

## 7. REMAINING ISSUES / BLOCKERS

1. **No Java JDK in this sandbox.** Cannot run `gradlew :app:bundleRelease`. The fresh BUILD 70 AAB has not been generated yet in this session. The existing AAB on disk is from `2026-07-04 02:42:21`, which is **before** this session's edits (versionName bump, journey-page syntax fix).
2. **No Android device or emulator.** All nine runtime tests and all eight required screenshots remain un-captured.
3. **No git commit was made.** (The brief did not explicitly request a commit in this session, but for hygiene the release engineer should commit before tagging the AAB.)

---

## 8. RELEASE DECISION

The brief explicitly states:

> *"Only after every mandatory test passes may you conclude: STATUS READY FOR GOOGLE PLAY PRODUCTION. Otherwise: BLOCKED. Include exact blocker(s). Do not recommend Production without successful runtime verification."*

**Mandatory tests have not been performed.** Therefore:

```
╔═══════════════════════════════════════════════════════════╗
║  STATUS: BLOCKED                                          ║
║                                                           ║
║  Production upload is NOT authorized by this report.      ║
║                                                           ║
║  Blockers:                                                ║
║  1. Fresh BUILD 70 AAB has not been produced              ║
║     (gradle step blocked — no Java in sandbox).           ║
║  2. Runtime verification has not been executed.           ║
║  3. Required screenshots have not been captured.           ║
║                                                           ║
║  Next action: release engineer / CI runner with a Java-   ║
║  enabled Android build environment must:                  ║
║  - Run npm run build (already done in this session)       ║
║  - Run npx cap sync android (already done in this session)║
║  - Run gradlew :app:bundleRelease                         ║
║  - Install the resulting AAB on a device or emulator      ║
║  - Execute all 9 test groups and capture 8 screenshots    ║
║  - Update this report with PASS / FAIL evidence           ║
║  - Then, only if every test PASSES, change status to      ║
║    "READY FOR GOOGLE PLAY PRODUCTION".                    ║
╚═══════════════════════════════════════════════════════════╝
```

---

**Senior Release Engineer (sandbox session)**
Bhumi Amartya
2026-07-04

---

## APPENDIX A — SOURCE-LEVEL EVIDENCE OF FIXES (already in tree)

For the release engineer's convenience when they execute runtime tests, the source diffs that should manifest as the expected behavior are:

| Expected runtime behavior | Source-level evidence |
|---|---|
| Login never blocked by notifications | `lib/notifications/gentleNightReminder.ts` — all permission/schedule calls wrapped in try/catch returning status objects; never throws. |
| New user → Dashboard (not Wellness) | `components/auth/ProtectedRoute.tsx` lines 50–62 — auto-redirect block is commented out. |
| 5Q does not auto-trigger after 15Q | `components/wellness/WellnessAssessmentFlow.tsx` `handleSubmit` — writes `assessmentDone: true` and `wellnessSnapshot.checkInCompleted: true` together with `baselineWellnessCompleted: true`. |
| Single greeting on Dashboard | `components/dashboard/DashboardClient.tsx` `formatSoulReflectionForDashboard` returns body only; `DashboardHeader` owns `Halo, {name}.`. |
| 15Q UI matches Wellness aesthetic | `components/wellness/WellnessAssessmentFlow.tsx` uses shared `bhumi-card` / `bhumi-button` palette. |
| Slogan above brand line in Share Card | `components/ui/ShareCard.tsx` header section places `"Ruang Untuk Pulang dan Kenali Diri"` directly after `<BhumiPageHeader />`. |
| Play Store / Bhumi Amartya in Share Card footer | Same file, footer block uses `Available on Play Store` + `Bhumi Amartya`. |
| Journey in Bahasa Indonesia | `app/journey/page.tsx` title `Perjalananmu`, loading text `Bhumi sedang menyiapkan...`. |
| Profile explanations humanized | Per `BUILD70_PROFILE_EXPLANATION_COPY_CLEANUP_REPORT.md`. |
| Journey parses (no Turbopack error) | Stray duplicate closing JSX removed at end of `app/journey/page.tsx` in this session. |

When the release engineer runs the runtime tests, every row above should manifest as PASS. **Until then, this report stands at BLOCKED.**
