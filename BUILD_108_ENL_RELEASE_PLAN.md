# BUILD 108 ENL — RELEASE PLAN & GOVERNANCE
**Release Gates, Verification Criteria & Deployment Protocol**

```text
STATUS                          = NOT_STARTED (FOUNDATION AUDIT & SPECIFICATION COMPLETE)
TARGET_BUILD                    = BUILD 108 ENL
TARGET_VERSION_CODE             = 108
TARGET_VERSION_NAME             = "5.0.8"
BASELINE_BUILD                  = BUILD 107 (versionCode 107, versionName 5.0.7)
RELEASE_GATE_STATUS             = LOCKED (FOUNDER_SIGN_OFF_REQUIRED)
BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_BUILD_108_ENL_SOT
```

---

## 1. Release Objective

To release a dedicated, dignified, and production-ready **English-Language Edition** of Bhumi Amartya that:
1. Presents an entirely native English user experience across all 51 routes, 11 blueprint systems, AI guidance narratives, and legal documentation.
2. Preserves 100% of Build 107 fixes, calculations, admin protections, and continuity.
3. Completely satisfies all 7 strict Release Gates prior to any production artifact publication.

---

## 2. Release Gates Matrix

No build artifact may be signed, uploaded to Google Play, or marked as released until every gate in this matrix is proven with executed evidence:

| Gate | Name | Verification Method | Pass Criteria | Status |
|---|---|---|---|---|
| **GATE 1** | **Type & Surface Integrity** | `npx tsc --noEmit` & `build107-production-surface-guard.test.ts` | Zero TypeScript errors (Exit 0); exactly 51 routes classified; zero admin/diagnostics exposed in production; orphan routes remain absent. | `PENDING` |
| **GATE 2** | **Automated Test Suite** | Full Firebase emulator release suite (`npm run test:release`) | 100% passing tests (29+ test files, 0 failures, 0 skipped); state machines green. | `PENDING` |
| **GATE 3** | **Build 107 Continuity** | `build107-hd-existing-user-convergence.test.ts` | 19/19 passing; legacy HD records converge immediately; zero perpetual calculating states. | `PENDING` |
| **GATE 4** | **English Language Verification** | Automated static regex scanner + manual rendered audit | Zero Indonesian strings detected across visible product routes, buttons, headers, error toasts, and fallback states. | `PENDING` |
| **GATE 5** | **AI Narrative & Fallback Audit** | API testing + `localDailyGuidanceFallback.test.ts` | Guidance output is 100% native English; zero Indonesian greetings or cliches; local fallback returns full English text. | `PENDING` |
| **GATE 6** | **Deterministic Build & Signing** | `run-prod-build.mjs`, `guard-release-bundle.ts`, Gradle `bundleRelease` | Zero security violations; exit 0 web export; release-signed AAB and APK matching expected hash and size. | `PENDING` |
| **GATE 7** | **Founder Final Sign-Off** | Explicit written approval by Founder | Founder approval of rendered English experience, Play Store listing, and release metadata. | `LOCKED` |

---

## 3. Versioning & Build Information

When entering Sprint 6 (Release Preparation), the following files must be atomically synchronized:

| File | Target Property | Target Value |
|---|---|---|
| `android/app/build.gradle` | `versionCode` | `108` |
| `android/app/build.gradle` | `versionName` | `"5.0.8"` |
| `lib/config/buildInfo.ts` | `CURRENT_VERSION_CODE` | `108` |
| `lib/config/buildInfo.ts` | `CURRENT_VERSION_NAME` | `"5.0.8"` |
| `lib/config/buildInfo.ts` | `CURRENT_BUILD_NUMBER` | `"108"` |
| `src/lib/version.ts` | `APP_VERSION` | `"5.0.8"` |
| `src/lib/version.ts` | `RELEASE_NAME` | `"BHUMI AMARTYA V5 BUILD 108"` |
| `tests/unit/version-reconciliation.test.ts` | Retargeted assertions | Asserts 108 / 5.0.8, checks Build 107 stale-guard |

---

## 4. Artifact Specification

Expected artifacts upon completion of Sprint 6:

```text
AAB (Google Play Bundle)        = android/app/build/outputs/bundle/release/app-release.aab
AAB Staged Copy                 = bhumi-amartya-v5.0.8-build108-release-signed.aab
APK (Companion Testing)         = android/app/build/outputs/apk/release/app-release.apk
APK Staged Copy                 = bhumi-amartya-v5.0.8-build108-release-signed.apk
```

Verification requirements for artifacts:
- Signed with the canonical production keystore using JDK 17.
- Minification: `minifyEnabled false` (consistent with Build 106 & 107).
- SHA-256 and byte size explicitly computed and recorded in release report.

---

## 5. Google Play Store Release Checklist

Before enabling track rollout on Google Play Console:

- [ ] **App Title:** Localized English title configured.
- [ ] **Short Description:** Clear English value proposition (80 characters max).
- [ ] **Full Description:** Comprehensive English description detailing the 11 soul blueprints, daily reflections, and wellness integration.
- [ ] **Screenshots & Graphics:** High-resolution English screenshots reflecting the updated UI.
- [ ] **Privacy Policy:** Active, valid URL pointing to the English Privacy Policy.
- [ ] **Content Rating:** Questionnaire re-verified if necessary.
- [ ] **Target Countries / Regions:** Configured per Founder distribution decision (Global vs selected English-speaking regions).
- [ ] **Internal Testing Track:** Upload AAB to Internal Testing track first; perform smoke test on physical device.

---

## 6. Emergency Rollback Strategy

If an unforeseen defect occurs during rollout:
1. **Instant Rollback Baseline:** Build 107 (`versionCode 107`, `versionName 5.0.7`, commit `d2ecb5e`) is fully tagged, tested, signed, and proven.
2. **Halt Rollout:** Pause track rollout in Google Play Console immediately.
3. **Emergency Fix:** If required, hotfix from `d2ecb5e` using the established Build 107 hotfix protocol.

---

## 7. Current Governance Status

```text
BUILD_108_ENL_IMPLEMENTATION_STATUS = NOT_STARTED
NEXT_SAFE_ACTION                = FOUNDER_REVIEW_OF_BUILD_108_ENL_SOT
RELEASE_GATE                    = LOCKED
```

**MANDATORY RULE:** Zero code modification, zero version bumping, and zero artifact generation may proceed without explicit Founder authorization.
