# Bhumi Amartya Build 80 TODO

---

# BUILD 85 — CURRENT SCOPE

**Worktree:** `C:\tmp\bhumi-build83-access-hotfix`
**Branch:** `hotfix/build84-access-recovery`
**HEAD before Build 85 work:** `942d84e6851af5cd773ddf1b8a0f9c1e446d47f3`

> Project source of truth for repositories: see **CLAUDE.md**. The standalone Founder Dashboard lives in a SEPARATE repository (`C:\tmp\bhumi-founder-dashboard`) — do NOT implement dashboard work from this repo.

## P0 — Trial Presentation Fix (USER APP) — ✅ DONE

| File | Status | Notes |
|---|---|---|
| `app/upgrade/page.tsx` | DONE | Canonical entitlement (`getEntitlementStatus()`); UI states TRIAL / PREMIUM / FREE. No redesign. |
| `app/premium-bhumi/page.tsx` | DONE | Active-trial label renders "Trial"; paid renders "Premium Bhumi"; free renders "Penghuni Bhumi (Gratis)". |

- Regression cover: `tests/unit/build85-trial-presentation.test.ts` (TRIAL / PREMIUM / FREE, tsx EXIT 0).

## P1-D — Welcome / Entry Screen — ✅ DONE

| Option | Status | Notes |
|---|---|---|
| Tagline | DONE | `Ruang Untuk Pulang dan Kenali Diri` |
| Primary CTA | DONE | `Mulai Perjalanan` → `Pengguna Baru` |
| Secondary CTA | DONE | "Saya Sudah Punya Akun" as real button (same style family) |
| Version label | DONE | `CLOSED BETA V1.0`/`Versi 4` removed; bottom shows ONLY `Indonesia | English` with safe-area spacing |
| Language placeholder | DONE | Non-functional `Indonesia | English` (V5 prep, no localization system) |

- Viewport-verified headless @ 375×812 — fully visible, no clipping (`app/page.tsx`).

## P1 — Billing B1.4.1 (Category A executed 2026-08-08)

**Status: PARTIAL — 12/13 PASS, 1 PHYSICAL DEVICE VERIFICATION REMAINING. NOT a Build 85 RC blocker.**

- 12/13 requirements proven in Category A (non-Android): single-flight, restore cooldown, cached entitlement, TTL, offline grace, grace expiry, UID/context mismatch, invalid signature, malformed entitlement, future timestamp, clock rollback, stale-cache-online — all PASS (see below).
- 1/13 remains **secure-storage persistence after force-stop** (Option-A androidTest harness `android/app/src/androidTest/java/com/bhumiamartya/app/harness/` SOURCE-PRESENT but not executed, results dir empty). Requires physical Android device. Do NOT run QEMU.
- Manifest tested: `build84-offline-grace` (7), `build84-accessrecovery.behavior` (14), `build84-verifier-timeout-retry` (10), `build84-paid-orchestration` (13), `scripts/qa/b14-preflight-loader.mjs`. All EXIT 0.
- `billing-entitlement-contract.test.ts` + `trial-boundary.test.ts`: NOT VERIFIED — legacy env/import-order precondition; OUT OF B1.4.1 SCOPE.

## P1 — Review & Rating Prompt (IMPLEMENTED / STATIC VERIFIED / RUNTIME E2E NOT VERIFIED)

- ✅ Existing review-prompt implementation exists: `lib/rating/reviewTriggerService.ts` (eligibility + localStorage state), `components/rating/DashboardReviewPrompt.tsx` (dashboard-entry trigger), `components/rating/ReviewDialog.tsx` (modal), `android/app/src/main/java/com/bhumiamartya/app/ReviewPlugin.java` (Google Play in-app review), validator `scripts/validateDashboardReviewPrompt.ts`.
- ✅ **Eligibility threshold is already 3 days (not 7)** — `REVIEW_LIMITS` MIN_INSTALL_DAYS / MIN_LOGIN_DAYS / MIN_SESSIONS all `3`; cooldown `30` days. Git history (commit `05539a8`) shows no 7-day threshold ever existed.
- ✅ Dashboard entry wiring confirmed — `<DashboardReviewPrompt/>` mounted in `components/dashboard/DashboardClient.tsx`, gated on `/dashboard`, `dashboardReady`, `blockedByModal`.
- ✅ Anti-repeat state confirmed — `bhumi_review_prompt_shown`, `bhumi_review_next_prompt_date` (30d), `bhumi_review_prompt_opt_out`, `bhumi_review_action_requested_at`.
- ✅ Positive review action confirmed — native Play in-app review (`requestReview`), web fallback to Play Store listing, `PROMPT_SHOWN`+cooldown after success.
- **NO CODE CHANGE REQUIRED.** No functional bug proven.
- ⏳ Manual authenticated smoke test on a physical Android device remains a pre-production check (runtime E2E not executed on emulator — no authorized test account; env-resource constraints).

## P1 — Founder Dashboard (HANDOFF NOTE ONLY)

- Single line only, as handoff note: the standalone Founder Dashboard lives at `C:\tmp\bhumi-founder-dashboard`, branch `main`.
- Do NOT add Founder Dashboard implementation tasks into this repository's TODO.
- Future dashboard work continues in the separate repository. When trial status rendering is added there, it must use canonical entitlement: **TRIAL / PREMIUM / FREE**, not raw membership strings.

## Post-release maintenance — TypeScript 6 configuration (DO NOT CHANGE DURING BUILD 85)

- Safely migrate `services/billing-verifier/tsconfig.json` away from deprecated `moduleResolution: "node"`/`"node10"` only after verifying billing verifier runtime/module compatibility.
- Safely remove or replace deprecated root `tsconfig.json` `baseUrl` only after verifying all path resolution/runtime compatibility.
- Current build, typecheck, and tests pass; no tsconfig change is authorized during Build 85.

---

# BUILD 80 (FROZEN — historical context below)

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
