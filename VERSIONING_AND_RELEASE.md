# Bhumi Amartya Versioning and Release Process

## 1. Purpose

This document describes the current versioning model, release process, and Build 80 release status.

## 2. Version Sources

| Source | Purpose | Current Value | Authority | Known Gap |
|---|---|---|---|---|
| `src/lib/version.ts` | Web/app display version | 4.4.1, Build 78 | COMMITTED | Disagrees with Android gradle |
| `android/app/build.gradle` | Android versionName/versionCode | versionName 4.4.4, versionCode 79 | COMMITTED | Disagrees with web metadata |
| `android/variables.gradle` | compileSdk/targetSdk | compileSdk 36, targetSdk 36, minSdk 24 | COMMITTED (targetSdk bumped) | — |
| `package.json` | npm package version | — | COMMITTED | Not the application release version |
| Play Console (Founder-reported) | Production release | versionName 4.4.4, Build 79 | FOUNDER-CONFIRMED EXTERNAL | Not derived from repository alone |
| Build 80 target | Development target | versionName 4.4.4, versionCode 80 | PENDING | NOT YET IMPLEMENTED CONSISTENTLY IN COMMITTED METADATA |

## 3. Versioning Model

- **versionName:** Human-readable version string (e.g., "4.4.4"). Used in application display and Play Store listing.
- **versionCode:** Monotonically increasing integer for Android builds. Used for force-update comparison and Play Store versioning.
- **Build number:** Historically tracked separately (e.g., Build 78, Build 79, Build 80). Currently synchronized with Android versionCode.
- **Telemetry version:** `user_activity` records per-session `appVersion` and `buildNumber`. These are user-scoped and not equivalent to global build metadata.

## 4. Current Version Reality

| Context | Version | Build | Status |
|---|---|---|---|
| Web metadata (`version.ts`) | 4.4.1 | 78 | COMMITTED |
| Android metadata (`build.gradle`) | 4.4.4 | 79 | COMMITTED |
| Founder-confirmed Play production | 4.4.4 | 79 | FOUNDER-CONFIRMED EXTERNAL |
| Build 80 target | 4.4.4 | 80 | PENDING METADATA RECONCILIATION |

Web and Android version metadata are inconsistent. Build 80 target metadata is not yet implemented in committed files. This discrepancy is a release blocker.

## 5. Android Release Requirements

| Requirement | Status |
|---|---|
| compileSdk 36 | COMMITTED |
| targetSdk 36 | COMMITTED |
| minSdk 24 | COMMITTED |
| API 36 build verification | PASS (assembleDebug, lintDebug) |
| API 36 runtime QA | PENDING |
| AGP compatibility bridge | ACTIVE (temporary — builtInKotlin=false, newDsl=false) |
| Release keystore | NOT CONFIGURED |
| Signed APK/AAB | NOT CREATED |
| Play App Signing | NOT CONFIGURED |
| Internal testing track | NOT SET UP |
| Pre-launch report | NOT RUN |

## 6. Web and Admin Deployment

- Branch integration does not equal deployment.
- Local tests do not equal production activation.
- Admin internal-account exclusion is integrated in Build 80 branch but not verified deployed to production.
- Deployment requires explicit Founder authorization.

## 7. Firebase Release Controls

| Control | Status |
|---|---|
| Firestore Rules fix | COMMITTED in branch |
| Rules production deployment | NOT PERFORMED |
| Cloud Functions (billing) | NOT DEPLOYED |
| Emulator verification | Daily Guidance 29/29, Behavior Memory 53/53 |

## 8. Release Gates

| Gate | Status |
|---|---|
| Code integrated | PARTIAL (Admin stale-snapshot fix pending) |
| Tracked worktree clean | YES |
| Focused tests passing | Daily Guidance 29/29, Behavior Memory 53/53, Admin 22/22, Legacy 48/48 |
| TypeScript | FAIL (21 pre-existing errors; no new regression) |
| Browser regression | PENDING |
| Android runtime QA (API 36) | PENDING |
| Billing runtime verification | PENDING |
| Firestore Rules deployment | PENDING |
| Version metadata reconciliation | PENDING |
| Signed AAB verified | PENDING |
| Founder approval | PENDING |
| Production rollout | PENDING |
| Post-release smoke test | PENDING |

## 9. Release Procedure

1. Checkpoint: verify worktree, HEAD, tracked changes, and untracked files
2. Test: focused test suites, TypeScript, Android build/lint
3. Version reconciliation: resolve metadata discrepancy, commit Build 80 target
4. Build: create signed AAB
5. Runtime QA: API 36 emulator, browser regression, physical device
6. Signing: keystore configuration, Play App Signing
7. Internal testing: Play Console internal track
8. Founder approval: explicit written authorization
9. Deployment/release: Firestore Rules, backend, Play Store production
10. Post-release verification: smoke test, monitoring

## 10. Rollback and Incident Handling

- Preserve evidence: exact commit, deployment record, affected documents
- Rollback via previous working commit or deployment
- No silent data repair
- Document root cause before solution

## 11. Release Status Vocabulary

| Term | Definition |
|---|---|
| Implemented | Code exists in committed branch |
| Committed | Changes merged to target branch |
| Tested | Evidence of test execution (unit, emulator, integration) |
| Build verified | Android build and lint pass |
| Runtime verified | Confirmed working on actual device/emulator |
| Deployed | Changes released to production environment |
| Rollout verified | Confirmed working after production deployment |
| Released | Available to end users in production |

## 12. Current Build 80 Release Status

**NOT RELEASED. NOT DEPLOYED. RUNTIME QA PENDING.**

Build 80 is under active development. No APK, AAB, or Play Console submission has been made. No production deployment has occurred.