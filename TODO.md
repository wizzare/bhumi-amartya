# Bhumi Amartya Build 80 TODO

## 1. Status Legend

- DONE
- IN PROGRESS
- BLOCKED
- PENDING VERIFICATION
- NOT STARTED
- ROADMAP

## 2. Completed Build 80 Work

| Item | Evidence |
|---|---|
| Orphaned dependency incident closed (5/5 admitted) | BUILD80_STATUS.md |
| Daily Guidance emulator evidence (29/29 PASS) | Committed |
| Behavior Memory emulator evidence (53/53 PASS) | Committed |
| Firestore Rules Path.matches defect fixed | Committed |
| Admin internal-account exclusion integrated | 22/22 + 48/48 tests PASS |
| Android API 36 targetSdk bumped | assembleDebug/lintDebug PASS |
| AGP 9 compatibility bridge applied | Built-in Kotlin disabled |
| AppUpdatePlugin lint contract fixed | Typed InstallStatus |
| Foundation documents created (10/10) | AGENTS, RULES, SOT, ARCHITECTURE, SCHEMA, SECURITY, DESIGN, PRD, VERSIONING_AND_RELEASE, TODO |

## 3. Critical Release Blockers

| # | Item | Status | Owner |
|---|---|---|---|
| 1 | Android 16 / API 36 runtime QA | PENDING | — |
| 2 | TSC error scope decision (21 pre-existing) | PENDING | Founder |
| 3 | Firestore Rules production deployment verification | PENDING | Founder |
| 4 | Authenticated browser regression | PENDING | — |
| 5 | Billing/entitlement runtime verification | PENDING | — |
| 6 | Version/build metadata reconciliation | PENDING | — |
| 7 | Signed AAB and signing verification | PENDING | — |
| 8 | Internal testing track | PENDING | — |
| 9 | Founder release approval | PENDING | Founder |

## 4. High-Priority Follow-ups

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Admin exclusion production/runtime verification | PENDING | Not yet deployed |
| 2 | Admin stale-snapshot fix reconciliation | PENDING | External commit fad0f65d; cherry-pick previously conflicted |
| 3 | Force-update/version telemetry verification | PENDING | Not activated (minBuild=80 pending) |
| 4 | Build 80 debug APK creation | PENDING | assembleDebug verified, APK exists locally |
| 5 | Build 80 AAB creation | PENDING | Requires signing config |
| 6 | Browser regression | PENDING | Requires authenticated runtime session |
| 7 | Physical-device Android QA | PENDING | No evidence of device test |

## 5. Technical Debt

| # | Item | Impact | Owner |
|---|---|---|---|
| 1 | AGP built-in Kotlin bridge (builtInKotlin=false) | Temporary; must resolve before AGP 10 | — |
| 2 | New DSL opt-out (newDsl=false) | Temporary | — |
| 3 | Cross-runtime Daily Guidance deduplication | Last-write-wins risk; unbounded cache | — |
| 4 | Firestore Rules field validation absent | No schema enforcement | — |
| 5 | TSC baseline errors (21) | Pre-existing; blocks clean TSC | Founder |
| 6 | Web/Android version metadata discrepancy | 4.4.1/78 vs 4.4.4/79 | — |

## 6. Security and Privacy Follow-ups

| # | Item | Status |
|---|---|---|
| 1 | Behavior Memory schema validation in Rules | ABSENT |
| 2 | Founder/Admin bypass runtime verification | NOT FULLY VERIFIED |
| 3 | Systematic console.log/console.error audit | NOT PERFORMED |

## 7. Documentation Status

| Document | Status |
|---|---|
| AGENTS.md | COMPLETE |
| RULES.md | COMPLETE |
| SOT.md | COMPLETE |
| ARCHITECTURE.md | COMPLETE |
| SCHEMA.md | COMPLETE |
| SECURITY.md | COMPLETE |
| DESIGN.md | COMPLETE |
| PRD.md | COMPLETE |
| VERSIONING_AND_RELEASE.md | COMPLETE |
| TODO.md | COMPLETE (this file) |

Documentation completion is 10/10. This does not imply release readiness.

## 8. V5 Roadmap Boundary

The following are V5 roadmap items, not Build 80 requirements:

- Language expansion / localization
- Major UI redesign or design token system
- New Blueprint systems beyond the 8 currently implemented
- Cross-runtime generation deduplication (documented follow-up, not release-blocking)
- Formal accessibility audit and WCAG compliance
- Dark mode
- Analytics intelligence or moat features beyond committed telemetry

## 9. Recommended Execution Order

1. Resolve Admin stale-snapshot fix into Build 80
2. Run API 36 runtime QA (emulator or device)
3. Run authenticated browser regression
4. Reconcile version metadata
5. Configure signing and create signed AAB
6. Internal testing track
7. Firestore Rules deployment
8. Billing backend deployment and verification
9. Founder approval
10. Production release

## 10. Stop Conditions

The following actions require explicit Founder approval before execution:

- Firestore production reads beyond routine admin monitoring
- Any Firestore production write
- Firebase Rules deployment
- Billing backend deployment
- Play Console submission or release
- Real purchase or billing operation
- User data deletion or modification
- Git history rewrite (amend, rebase, force push)
- Broad refactor or dependency upgrade