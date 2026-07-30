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
| 5 | Billing/entitlement runtime verification | PENDING (contract source-tested 33/33) | — |
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
| 7 | Billing verifier ESLint v9 configuration | `npm run lint` ignores `api`/`lib`; source lint is unavailable | — |
| 8 | Billing verifier auth validator contract drift | Validator requires `AUTH_INVALID`, but the route emits categorized auth errors instead | — |
| 9 | Arsip Akashi timezone contract mismatch | `localDateParts` passes `+07:00` to `Intl.DateTimeFormat`, which requires an IANA zone; the 3x3 regression test cannot execute | — |
| 10 | `billing-entitlement-presentation.test.ts` failing | Pre-existing on rescue/opencode-sharecard-66f8871f prior to build82-integration; not caused by the PII/trial-timing integration work. Not yet fixed. | — |
| 11 | `hd-url-resolution.test.ts` — previously documented as failing 4/8; **re-verified 2026-07-30 and now passes 8/8** on current build82-integration state | Superseded by item 10's original note; no longer a known failure. Retained here only as a correction of the prior entry. | — |
| 12 | First full end-to-end run of the entire test suite (~55 files, not just spot-checked ones) performed 2026-07-30, after Priority Fix #4 work + build82-full-fix pointer moved to build82-integration. Surfaced 10 previously-undocumented pre-existing failures, all confirmed identical on the pristine rescue/opencode-sharecard-66f8871f baseline (not caused by tonight's work): `hotfix-010-wellness-journey-all-sections.test.ts` (1 assertion — trial-login-count-based expectation conflicts with the time-based trial fix), `hotfix-011-inbox-communication.test.ts` (1 assertion — same root cause), `hotfix-012-billing-ack-cleanup.test.ts` (2/18 failed), `hotfix-014-founder-dashboard-audit.test.ts`, `hotfix-015-new-user-card-funnel.test.ts`, `hotfix-016-founder-dashboard-consistency.test.ts` (all 3: `AssertionError: Expected values to be strictly equal`, not yet root-caused), `hotfix-018-journey-share-card-contract.test.ts` (1/35 failed), `tests/unit/billing_callable_only.test.ts` (1 assertion — "callable verification is invoked"), `tests/unit/production-mode-lock.test.ts` (test file itself has a syntax error — esbuild "Expected `}` but found `]`" at line 26:6, cannot even parse), `tests/unit/version-reconciliation.test.ts` (4/18 failed — test hardcodes versionName 4.4.4/versionCode 80, current Android version is legitimately 4.4.5/82 per rescue's own version bump; test is stale, not a product bug) | None of these are release-blocking regressions from tonight's work — all reproduce identically on the pristine rescue tip. Several (hotfix-010/011, version-reconciliation) have an identified likely cause; several (hotfix-014/015/016, billing_callable_only, production-mode-lock) need dedicated root-cause investigation before a fix. Not fixed here per standing instruction to document, not patch, pre-existing failures during this integration pass. | — |

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
