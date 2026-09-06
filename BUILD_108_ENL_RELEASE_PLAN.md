# BUILD 108 ENL — RELEASE PLAN & GOVERNANCE
**Release Gates, Verification Criteria & Deployment Protocol**

```text
STATUS                          = RELEASE LOCKED — CDI IN PROGRESS; ENV2 AND FRA PLANNED
TARGET_BUILD                    = BUILD 108 ENL
TARGET_VERSION_CODE             = 108
TARGET_VERSION_NAME             = "5.0.8"
BASELINE_BUILD                  = BUILD 107 (versionCode 107, versionName 5.0.7)
RELEASE_GATE_STATUS             = LOCKED (FOUNDER_SIGN_OFF_REQUIRED)
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
SPRINT_108_ENV2                 = PLANNED
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = CONTINUE_CURRENT_GATE_108_CDI
```

---

## 1. Release Objective

To release a dedicated, dignified, and production-ready **English-Language Edition** of Bhumi Amartya that:
1. Presents an entirely native English user experience across all 51 routes, 11 blueprint systems, AI guidance narratives, and legal documentation.
2. Preserves 100% of Build 107 fixes, calculations, admin protections, and continuity.
3. Completely satisfies all 7 strict Release Gates prior to any production artifact publication.
4. Completes the approved Environmental Intelligence v2 scope and all authorized remediation,
   then passes `GATE_108_FRA` before the release version bump, final production build, or signing.

### 1.1 Mandatory Final Release Audit prerequisite

`GATE_108_FRA` is **FINAL_RELEASE_AUDIT**; current state **PLANNED**. The canonical protocol is
[`BUILD_108_FINAL_RELEASE_AUDIT.md`](BUILD_108_FINAL_RELEASE_AUDIT.md). Do not execute it yet.

Required order: all Build 108 implementation sprints + CDI closure + ENV2 + all Founder-approved
remediation → Sprint 8 pre-release verification and complete-product FRA → FRA PASS → explicitly
authorized versionCode 108 / versionName 5.0.8 bump → final production build → signing → final
artifact/release checks and Founder publication approval → Play upload. Sprints 5–8 keep their
numbers. FRA is a mandatory prerequisite, not a replacement/renumbering of the seven gates below.

FRA re-audits new and legacy users, auth/setup/timezone, billing/entitlements, every Build 108
requirement, all production routes/child surfaces, core data/ENV2, actual AI/generated/fallback
English, security/privacy, and release source provenance. Require requirement-level implementation,
test, runtime evidence and PASS/PARTIAL/DEFERRED/FAIL dispositions; UNKNOWN=0, UNACCOUNTED=0,
FALSE_PASS=0, and RELEASE_CRITICAL_GAPS_OPEN=0. The final report and all domain requirements in the
audit document are mandatory. Prior sprint tests alone cannot satisfy FRA.

FRA's `ALL_BUILD_108_GATES_PASS` records all **pre-artifact** implementation/acceptance gates with
an explicit phase-labelled matrix. Final Gate 6 artifact/signing evidence and Gate 7 publication
approval are collected afterward and must remain pending until executed. FRA PASS is not proof
of those later gates, not permission to perform restricted operations, and not a released artifact.
No version bump, final build, signing, or upload is permitted while FRA is PLANNED/PARTIAL/FAIL.

---

## 2. Release Gates Matrix

No artifact may be uploaded to Google Play or marked released until every gate in this matrix
is proven with executed evidence. Version bump/final build/signing first require FRA PASS and
separate Founder authorization; Gate 6 records the resulting artifact/signing proof and Gate 7
the final publication approval. Do not demand an already signed artifact to enter FRA.

| Gate | Name | Verification Method | Pass Criteria | Status |
|---|---|---|---|---|
| **GATE 1** | **Type & Surface Integrity** | `npx tsc --noEmit` & `build107-production-surface-guard.test.ts` | Zero TypeScript errors (Exit 0); exactly 51 routes classified; zero admin/diagnostics exposed in production; orphan routes remain absent. | `PENDING` |
| **GATE 2** | **Automated Test Suite** | Full Firebase emulator release suite (`npm run test:release`) | 100% passing tests (29+ test files, 0 failures, 0 skipped); state machines green. | `PENDING` |
| **GATE 3** | **Build 107 Continuity** | `build107-hd-existing-user-convergence.test.ts` | 19/19 passing; legacy HD records converge immediately; zero perpetual calculating states. | `PENDING` |
| **GATE 4** | **English Language Verification** | Automated static regex scanner + manual rendered audit | Zero Indonesian strings detected across visible product routes, buttons, headers, error toasts, and fallback states. | `PENDING` |
| **GATE 5** | **AI Narrative & Fallback Audit** | API testing + `localDailyGuidanceFallback.test.ts` | Guidance output is 100% native English; zero Indonesian greetings or cliches; local fallback returns full English text. | `PENDING` |
| **GATE 6** | **Deterministic Build & Signing** | `run-prod-build.mjs`, `guard-release-bundle.ts`, Gradle `bundleRelease` | Zero security violations; exit 0 web export; release-signed AAB and APK matching expected hash and size. | `PENDING` |
| **GATE 7** | **Founder Final Sign-Off** | Explicit written approval by Founder | Founder approval of rendered English experience, Play Store listing, and release metadata. | `LOCKED` |

### 2.1 ENV2 evidence within the existing gates

`SPRINT_108_ENV2 = PLANNED`; implementation is not authorized by this scope approval. ENV2 follows
CDI closure and must be completed before FRA/final release. Unsupported optional timeline/map
requires explicit disposition; unresolved mandatory scope remains a release blocker or requires
an explicit Founder scope amendment. No silent release waiver is created here.

| Existing gate | Additional mandatory ENV2 evidence at future execution |
|---|---|
| Gate 1 — Type & Surface | Canonical payload and datum-level SOURCE/OBSERVED_AT/FETCHED_AT/FRESHNESS/QUALITY/PROVENANCE; original units and independent surface SO2, column SO2, attribution; updated route inventory if a route is actually added. |
| Gate 2 — Tests | Valid/partial/malformed/missing inputs, provider failure/timeouts, fresh/stale/no cache, provenance persistence, time/spatial mismatch, history gaps, domain isolation, evidence-supported attribution and weak/SO2-only null-source cases. |
| Gate 3 — Continuity | HD convergence, completed Chiron/timezone/HD CDI, admin/diagnostics removal, security/billing, Schumann fail-closed behavior, and existing Environment provenance separation preserved. |
| Gate 4 — English | Actual Dashboard Atmosphere & Volcanic card/detail rendering, available/unavailable/unknown/stale/error states, optional timeline/map, and conservative English health copy; no invented Normal/Stable/Safe/plume/source volcano. |
| Gate 5 — Generated/Fallback | No column-SO2 personal exposure claims, no SO2-only volcanic attribution; surface advice grounded in relevant surface/AQI data; no Schumann/NOAA/USGS/weather substitution; spiritual interpretation separated from measured facts. |
| Gate 6 — Runtime/Artifact | After FRA PASS and separate build authorization, verify final Android/static-export path, HTTPS/CORS/proxy/cache behavior and provenance display against the accepted source contract. Tests/HTTP success do not replace rendered/device proof. |
| Gate 7 — Founder Sign-Off | Review provider comparison/terms and architecture, attribution evidence/limits, freshness/quality policy, rendered acceptance, and all residual/conditional scope dispositions. Paid/external commitment and deployment need their own approval. |

Before ENV2 implementation, research surface air quality, column SO2, wind, and volcanic/plume
sources separately using the full matrix in `MASTER_SOT §4.3`; Windy screenshots/visualization
are not canonical source data. Compare direct APIs/proxy/scheduled ingestion/hybrid, preferring
provider changes isolated from Android. `ENV2_BACKEND_REQUIRED = UNDETERMINED`.
`ENV2_RELEASE_RISK = OPEN` for source access/licensing, attribution, freshness, and runtime evidence.

---

## 3. Versioning & Build Information

Only in the release phase of **Sprint 8**, after `GATE_108_FRA = PASS` and explicit Founder
version/build authorization, may the following files be atomically synchronized. These are future
targets; current versionCode 107 / versionName 5.0.7 remains unchanged:

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

Expected artifacts in the authorized **Sprint 8 release phase**, after FRA PASS:

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
BUILD_108_ENL_IMPLEMENTATION_STATUS = PAUSED_FOR_CORE_DATA_INTEGRITY
SPRINT_108_ENV2                 = PLANNED
GATE_108_FRA                    = PLANNED
BUILD_108_CAN_PROCEED_TO_RELEASE = NO
NEXT_SAFE_ACTION                = CONTINUE_CURRENT_GATE_108_CDI
RELEASE_GATE                    = LOCKED
```

**MANDATORY RULE:** This checkpoint authorizes documentation only. No ENV2 implementation or FRA
execution now. FRA PASS plus separate Founder authorization is required before release versioning,
final production build, signing, or upload. No deployment or production mutation is authorized.
