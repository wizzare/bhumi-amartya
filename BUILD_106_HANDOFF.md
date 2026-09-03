# BHUMI AMARTYA — BUILD 106 CONTINUITY HANDOFF

Status: **`BUILD_106_ADMIN_LIFETIME_RECONCILIATION_CODE_COMPLETE_EMULATOR_VERIFIED_PRODUCTION_PENDING` — source and local/emulator verification are complete; production account provisioning and a replacement signed artifact are not authorized and have not been performed.**
Primary agent: CLAUDE_CODE (Handover from CODEX / Antigravity).
Date: 2026-09-03

```text
NEXT_PRIMARY_AGENT               = CLAUDE_CODE
PREVIOUS_PRIMARY_AGENT           = CODEX (Admin & Lifetime Reconciliation; Build 103/104 continuity audit)
CURRENT_PROGRAM                  = BUILD_106_PRODUCT_CONTINUITY_RECOVERY
AUTHORIZED_WORKTREE              = C:\tmp\bhumi-build106-recovery
CURRENT_BRANCH                   = recovery/build106-product-continuity
CURRENT_HEAD                     = resolve with `git rev-parse HEAD` (documentation descendant of 2d625bd72befbd10487bb83748e850c4bdf1c37c)
RECONCILED_SOURCE_HEAD           = 2d625bd72befbd10487bb83748e850c4bdf1c37c
ADMIN_LIFETIME_SOURCE_COMMIT     = 36a32cd
ADMIN_LIFETIME_TEST_COMMIT       = e5d1592
LEGACY_AUDIT_DOC_COMMIT          = 0e1f634
RECONCILIATION_REPORT_COMMIT     = 2d625bd
HISTORICAL_RELEASE_READY_HEAD    = 3c8620d6ffaa8a893380d78ff367842f8a18842c
BUILD_106_PHASE                  = ADMIN + LIFETIME RECONCILIATION CODE COMPLETE / EMULATOR VERIFIED / PRODUCTION PENDING
HISTORICAL_BUILD_106_ARTIFACT    = bhumi-amartya-v5.0.6-build106-release-signed.aab — SUPERSEDED (built from pre-reconciliation HEAD 3c8620d6; does not contain 36a32cd / e5d1592)
SIGNED_ARTIFACT_STATUS           = SUPERSEDED (replacement signed artifact from reconciled HEAD not yet built)
SIGNING_KEY                      = CN=Bhumi Amartya (alias bhumi-amartya) — SHA-256 1BC13061AAB6F7EB362BFD0A71E3DB106DB8615736A337B197FC5F0DB592B518 (== authorized Play upload key)
SMOKE_TEST                       = HISTORICAL PASS FOR 3c8620d6 — not rerun for current reconciled source
versionCode / versionName       = 106 / 5.0.6   (RELEASE_NAME "BHUMI AMARTYA V5 BUILD 106")
BUILD_103_CONTINUITY            = COMPLETE (22/22 commits, 53 files accounted)
BUILD_104_CONTINUITY            = COMPLETE (2/2 commits, 4 files accounted)
HISTORICAL_ADMINS_IDENTIFIED    = 4/4 (Maulina, Septi, Nandra / Nanda Viandra, Azian Meirdania)
ADMIN_LIFETIME_RECONCILIATION   = VERIFIED in source/emulator (27/27 release suites PASS, 21/21 admin unit PASS, 23/23 admin emulator PASS)
ADMIN_PRODUCTION_PROVISIONING    = PENDING
FINAL_SIGNED_ARTIFACT_FROM_RECONCILED_HEAD = PENDING
DEVICE_ADMIN_ACCEPTANCE          = PENDING
RELEASE_CRITICAL_GAPS_OPEN      = 3
BUILD_106_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = NO
BUILD_106_MARKER                = BUILD_106_ADMIN_LIFETIME_RECONCILIATION_CODE_COMPLETE_EMULATOR_VERIFIED_PRODUCTION_PENDING
STEP_12_ACCEPTANCE              = ACCEPTED (emulator-hydration browser run)
GATE_07 / RC-1                  = ACCEPTED (emulator-hydration); production / Play-device run is the ideal final proof, not a blocker
RC-2                            = ADVANCED (non-blocking)
RC-3 / RC-4 / RC-5 / RC-6 / RC-7 = ACCEPTED_DEFERRED_NON_BLOCKING (Reconciliation Report §11.4)
RC-8 / DS-P1                    = CLOSED
RC-9 / RC-10 / RC-11 / RC-12    = CLOSED / local-logic-closed (non-blocking)
F-2                             = FIXED + tested
PLAY_STORE_UPLOAD               = NOT AUTHORIZED / NOT PERFORMED
DEPLOY / PUBLISH / PRODUCTION_WRITE = NOT DONE / NOT AUTHORIZED
PRODUCTION_FIRESTORE_READS_WRITES = 0 / 0
NEXT_SAFE_ACTION                = WAIT_FOR_FOUNDER_AUTHORIZATION_FOR_PRODUCTION_ADMIN_LIFETIME_PROVISIONING
NEXT_ACTION_MODE                = APPROVAL_GATED
ADMIN_TARGET_STATE              = CODE_RECONCILED / LOCAL_EMULATOR VERIFIED / PRODUCTION PROVISIONING PENDING
ADMIN_UNACCOUNTED_ITEMS         = PRODUCTION_FIRESTORE_ROLE_AND_LIFETIME_PROVISIONING_FOR_4; NEW_SIGNED_ARTIFACT_AND_DEVICE_ACCEPTANCE_FOR_RECONCILED_HEAD
PRODUCT_CODE_CHANGES            = COMPLETE IN 36a32cd; NO FURTHER CHANGES AUTHORIZED
FORENSIC_WORKTREE               = C:\tmp\bhumi-build83-access-hotfix (feat/build99 @ 57479c9) — READ ONLY
```

Canonical Step 13 record: `BUILD_106_RELEASE_PROVENANCE.md` (§10 = authorized production signing + device smoke test).

## Handover to Claude Code — Product Continuity & Release Gaps (2026-09-03)

This section formally records the operational handover of Build 106 product continuity and recovery to **Claude Code**.

### 1. Workspace, Branch & Worktree State
- **Primary Agent**: `CLAUDE_CODE` (handover from CODEX / Antigravity).
- **Authorized Worktree**: `C:\tmp\bhumi-build106-recovery`
- **Current Branch**: `recovery/build106-product-continuity`
- **Current Reconciled HEAD**: `2d625bd72befbd10487bb83748e850c4bdf1c37c` (or latest documentation-only descendant)
- **Tracked Worktree State**: Clean.
- **Build Metadata (MUST REMAIN UNCHANGED)**:
  - `versionCode = 106`
  - `versionName = 5.0.6`
  - `RELEASE_NAME = "BHUMI AMARTYA V5 BUILD 106"`

### 2. Continuity & Reconciliation Audit Results
- **Build 103 Continuity**: **COMPLETE** (22/22 commits, 53 files accounted and verified in git lineage).
- **Build 104 Continuity**: **COMPLETE** (2/2 commits, 4 files accounted and verified in git lineage).
- **Historical Admin Identities Accounted (4/4)**:
  1. **Maulina** — source/local-emulator verified; production provisioning pending.
  2. **Septi** — source/local-emulator verified; production provisioning pending.
  3. **Nandra / Nanda Viandra** — source/local-emulator verified; production provisioning pending.
  4. **Azian Meirdania** (identified from repository Auth/migration evidence) — source/local-emulator verified; production provisioning pending.
- **UID-Based Admin + Lifetime Implementation**: **VERIFIED IN SOURCE & EMULATOR**.
  - Reconciled in source commit `36a32cd` using canonical `users/{uid}` Firestore profile fields (`role`, `guardianRole`, `membershipType`, `membershipExpiryDate`, `entitlementSource`).
  - Covered by comprehensive regression tests in commit `e5d1592`.
  - Zero hardcoding of admin names, emails, or UIDs in client authorization logic.
  - Zero client-side `isPremium:true` bypass; Google Play and signed-entitlement integrity strictly preserved.
  - Full release test suite: **PASS=27 / FAIL=0 / SKIPPED=0** (`RELEASE_TESTS_PASS`).
  - Focused admin unit suite: **21/21 PASS**.
  - Focused admin emulator suite: **23/23 PASS**.
- **Production Account Provisioning**: **NOT DONE / NOT AUTHORIZED**.
  - Zero production Firestore reads or writes performed (`0 / 0`).
  - Production provisioning remains gated on explicit Founder authorization.
- **Signed Artifact Status**: **SUPERSEDED**.
  - Historical signed artifact `bhumi-amartya-v5.0.6-build106-release-signed.aab` is **SUPERSEDED** because it was built from pre-admin-reconciliation HEAD (`3c8620d6ffaa8a893380d78ff367842f8a18842c`) and does not contain reconciled source `36a32cd` or tests `e5d1592`.
  - A new signed artifact built from the reconciled HEAD has **NOT YET BEEN BUILT**.

### 3. Current Release Gaps & Gate Verdict
The exact three remaining release-critical gaps are:
1. `ADMIN_PRODUCTION_PROVISIONING = PENDING`
2. `FINAL_SIGNED_ARTIFACT_FROM_RECONCILED_HEAD = PENDING`
3. `DEVICE_ADMIN_ACCEPTANCE = PENDING`

Therefore:
```text
RELEASE_CRITICAL_GAPS_OPEN = 3
BUILD_106_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = NO
```

### 4. Mandatory Safety Rule & Next Safe Action
Any production write, production account provisioning, artifact rebuild, version bump, or Play Store action is **PROHIBITED** without separate explicit Founder authorization.

```text
NEXT_SAFE_ACTION = WAIT_FOR_FOUNDER_AUTHORIZATION_FOR_PRODUCTION_ADMIN_LIFETIME_PROVISIONING
NEXT_ACTION_MODE = APPROVAL_GATED
```

## Current Founder-approved reconciliation boundary

The Founder-approved Build 106 admin + lifetime reconciliation is implemented in `36a32cd` and
covered by the regression package in `e5d1592`. The implementation uses the existing canonical
`users/{uid}` Firestore profile fields and UID-bound role checks. It does not embed any of the four
admin names, emails, or UIDs in client authorization logic, does not use `isPremium:true`, and does
not weaken Google Play or signed-entitlement handling.

All four historical identities are accounted in the protected audit evidence:

1. **Maulina** — source/local-emulator reconciled; production Firestore provisioning pending.
2. **Septi** — source/local-emulator reconciled; production Firestore provisioning pending.
3. **Nandra** (repository evidence: Nanda Viandra) — source/local-emulator reconciled; production
   Firestore provisioning pending.
4. **Azian Meirdania** — source/local-emulator reconciled; production Firestore provisioning
   pending.

The full Firebase Auth/Firestore emulator release manifest passes **27/27** suites. The focused
admin unit suite passes **21/21**, and the admin emulator suite passes **23/23**. No production
Firestore read/write was made. The existing signed artifact remains valid historical evidence for
`3c8620d6`, but it predates the reconciliation and cannot be uploaded as proof of the current
source.

Current blockers are: (1) separately authorized production preflight and UID-scoped provisioning
of role + non-expiring lifetime state for all four accounts; and (2) separately authorized rebuild,
production signing, and device acceptance for the reconciled HEAD. Play Internal Testing remains
**NO** until these gates close.

## Historical completed audit boundary

The read-only `BUILD_103_104_LEGACY_CONTINUITY_AUDIT` below was completed and committed at
`0e1f634`. Its operational next action is superseded by the current reconciliation boundary above.

The next task is **`BUILD_103_104_LEGACY_CONTINUITY_AUDIT`**. It is a **READ-ONLY** continuity
audit only; it must account for all Build 103 and Build 104 work in Build 106 and must not change
product code. "Four admins" means four historical admin identities/accounts, not four admin feature
categories:

1. **Maulina**.
2. **Septi**.
3. **Nandra**.
4. **UNKNOWN** — identify from actual Build 103/104 repository, history, and evidence; do not guess.

Audit each identity individually. For each admin, determine: name/identity; UID/email only when it
is present in authorized repository evidence; assigned role (`founder`, `admin`, `dev_admin`, or
equivalent); where role/access is defined; accessible admin routes/features; permissions;
support/reply capability; broadcast/messaging capability; inbox/user-management capability; any
other privileged tools; Firestore/security-rule implications; and the identity's state in Builds
103, 104, 105, and 106.

For all four identities, the intended historical state to audit and verify is:

```text
ADMIN_ROLE = ACTIVE
LIFETIME_ACCESS = ACTIVE
```

Required target behavior:

- The admin identity is persisted through the canonical Firestore role/access model.
- Admin privileges survive logout/login and device changes.
- Lifetime access does not expire and does not depend on an active Google Play subscription.
- There is no client-side `isPremium:true` bypass.
- `getEntitlementStatus()` and billing security are not weakened.
- UI authorization contains no hardcoded name-based privilege check.
- Authorization resolves from UID/account identity through the existing canonical admin model.

Trace authorization end-to-end for each identity:

`ADMIN IDENTITY → ROLE → ACCESS CHECK → ADMIN ACTION → WRITE/READ → PERSISTENCE → USER/ADMIN UI`

Trace lifetime entitlement end-to-end for each identity:

`IDENTITY → LIFETIME ENTITLEMENT → getEntitlementStatus()/canonical access resolver → PREMIUM FEATURES`

Explicitly search Build 103/104 repository history for Maulina, Septi, Nandra, the fourth admin
identity, admin allowlists, admin UIDs/emails, role maps, `founder`/`admin`/`dev_admin`, privileged
route guards, and support/admin-reply/broadcast implementation. Admin UI presence alone is not
proof that all four identities retain working authorization.

For each of the four admins, report:

```text
ADMIN_NAME =
ACCOUNT_RESOLUTION =
UID =
FIRESTORE_ADMIN_STATE =
ROLE =
LIFETIME_ACCESS_STATE =
ENTITLEMENT_SOURCE =
ADMIN_FEATURE_ACCESS =
PREMIUM_FEATURE_ACCESS =
BUILD_103_STATE =
BUILD_104_STATE =
BUILD_106_STATE =
VERDICT =
```

The audit report must end with this verdict block:

```text
ADMIN_1_MAULINA =
ADMIN_2_SEPTI =
ADMIN_3_NANDRA =
ADMIN_4_NAME =
ADMIN_4_STATUS =

ADMIN_IDENTITIES_EXPECTED = 4
ADMIN_IDENTITIES_ACCOUNTED =

ADMIN_AUTHORIZATION_CONTINUITY = COMPLETE / INCOMPLETE
ADMIN_FEATURE_CONTINUITY = COMPLETE / INCOMPLETE
ADMIN_UNACCOUNTED_ITEMS =
```

If an historical admin cannot be identified or cannot access a capability they historically had,
record the exact regression and release impact. If Build 106 does not preserve the intended
admin-role or lifetime-access state, classify it explicitly as
**`MISSING_HISTORICAL_ADMIN_CONTINUITY`**.

Do not invent new Firestore fields when an existing canonical admin/entitlement schema exists.
Search for the exact fourth identity and the original Build 103/104 admin/lifetime implementation
before proposing changes. If implementation is required after the audit, propose the minimum safe
reconciliation through the existing Firestore and entitlement architecture. The READ-ONLY audit
must perform no production Firestore writes.

Do not rebuild, version bump, deploy, publish, upload to Play, perform production writes, or push.
The forensic worktree `C:\tmp\bhumi-build83-access-hotfix` (`feat/build99` @ `57479c9`) must remain
read-only. The remainder of this document preserves historical recovery evidence; where an older
next-action or signing statement conflicts with this section, this current handover boundary wins.

## Final pre-release gap closure — what Claude Code did (2026-09-03)

`AUDIT → ANALYZE → FIX only where required → VERIFY → REPORT`. Founder-directed disposition of
RC-3..RC-8, the Step 12.5 F-2 finding, and every remaining `DS-*`. Canonical detail:
`BUILD_106_RECONCILIATION_REPORT.md` **§11.4**. Commits: `29781d6` (fix), `2877b31` (test), then
this docs commit.

- **F-2 — FIXED.** Reachability confirmed: `generateLocalDailyGuidance`'s outer catch **re-throws**,
  so all-providers-fail + a deterministic sub-generator throw ⇒ `runProviderCascade` `ok:false`
  ⇒ `dailyGuidanceEngine.generateFallbackFace` ⇒ persisted `aiInsight: "Hari ini tentang ."` +
  empty reflection/note/prompt/meditation. Minimum correctness fix in
  `lib/engines/dailyGuidanceEngine.ts`: id/en fallback copy block (`ms → id` per D-V5-36) fills
  the five fields with coherent sentences; malformed literal removed. Build-105-identical → not a
  regression.
- **RC-8 — CLOSED.** Audit run: auth PII-logging clean; `firestore.rules` unchanged from Build 105
  (owner-isolation + `journalMemoryCandidates` / `fcmTokens` contracts pass in the release suite);
  per-entry privacy enforcement fail-closed. **Defect found + fixed:**
  `firebaseService.deleteUserDataCompletely` used drifted collection names + omitted `activities`,
  `dailyStates`, `journalMemoryCandidates`, `wellnessAssessments`, `wellnessMappings`,
  `progressData` — sensitive wellness/emotional/journal-derived data survived account deletion.
  Fixed in `lib/firebase/service.ts` (generic `deleteNestedEntries` + canonical schema coverage;
  legacy aliases kept as no-ops). Regression test cross-checks every repo collection literal
  against deletion coverage.
- **RC-3 / RC-4 / RC-5 / RC-6 / RC-7 — ACCEPTED_DEFERRED_NON_BLOCKING.** Each is an un-built
  canonical V5 surface that Build 105 also never shipped; the recovered contracts are verified;
  the Build 105 baseline is intact (no regression). **RC-4 verified:**
  `memoryCandidateRepository.upsertFromEntry` has zero runtime callers → no memory data exists →
  no exposure (re-open guard recorded). **RC-5 verified:** `app/journal/page.tsx` +
  `app/innerwork/journaling/page.tsx` save (local + cloud) + load history at the Build 105 baseline.
- **Every `DS-*` reconciled** to CLOSED / ACCEPTED_DEFERRED_NON_BLOCKING / RELEASE_BLOCKER
  (§11.4 table). **Zero RELEASE_BLOCKER.** DS-P1 release-critical portion CLOSED; its
  entry-controls UI + external pen-test → non-blocking.
- **No F-1 / F-3 / F-4 / F-5 / F-6 / F-7 / F-8 work** — post-Build-106 Daily Guidance roadmap
  (Step 12.5 audit §6); no new evidence proved any a release-critical defect.
- **Verification:** `npx tsc --noEmit` EXIT 0; full Firestore/Auth emulator release suite
  **PASS=25 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`);
  `build106-final-pre-release-gap-closure` 89 assertions EXIT 0.
- No version bump, Build 106 artifact, deploy, publish, push, or production write.

## Step 12 (cont.) — what Claude Code did (2026-09-03)

`AUDIT → ANALYZE → FIX → VERIFY → REPORT`. Founder **OPTION A (ADOPT)**.

- **Unreported in-flight work found + adopted.** At HEAD `0b8e8a4` the worktree was unexpectedly
  dirty (10 tracked source files + 6 test files incl. a new `build106-ds2c3-cold-nav.test.ts` +
  ephemeral `.playwright-cli/` / `.env.local`) from a parallel Codex/Antigravity session with no
  report. Per the Founder directive it was **not** discarded/stashed/reset — audited hunk-by-hunk
  against canonical Build 106, verified, and adopted. Provenance: **parallel Build 106 recovery
  session, unreported.** Commits `c9f3d04` (source, +417 −86 / 10 files), `1808852` (tests,
  +198 −7 / 6 files), then this docs commit.
- **DS-2C3 / RC-12 CLOSED.** `lib/auth/authoritativeProfileGate.ts` `isCompletedProfileForUser`;
  `lib/auth/resolveActiveProfile.ts` `isUnavailable` + authoritative `refreshUserProfile()` re-read
  on a cold/stale context (read failure ⇒ fail-closed, not "missing"); `app/setup/page.tsx` mount
  guard (completed user ⇒ `/dashboard`, read failure ⇒ retry card); `components/auth/AccessGuard.tsx`
  reconciles before the entitlement check; `components/insights/InsightPageClient.tsx` cold-nav uses
  `resolveActiveProfile` + scoped `storageProvider.getUserBlueprint()`, drops the unscoped
  `bhumiUserProfile` read.
- **BUILD_106_REGRESSION fixed (found by the RC-2 rendered run, Founder OPTION A item 4).**
  `components/dashboard/DashboardClient.tsx` read `translations[profile.language]` directly, so a
  BCP47 tag from the Step-3 switcher (`en-US`/`ms-MY`) made `translations[tag]` undefined and
  white-screened the dashboard for every en/ms switcher user. Fixed via
  `getDictionaryKey(profile?.language)`. Latent since Step 3; not in the adopted diff.
- **DS-J4 / DS-AI1 rendered fixes** carried in the adopted diff (verified on-scope): de-streaked
  `lib/insights/createInsightProgress.ts`; `lib/dailyGuidance/mirrorDailyReflection.ts` id/en/ms
  `MIRROR_COPY` + locale daypart; `unifiedBlueprintSynthesis` / `localDailyGuidanceFallback` now
  propagate `language`.
- **RC-2 rendered re-verification (emulator-hydration):** `/setup` hard-nav as a completed user →
  `/dashboard`; `/insights` hard-nav → no bounce; `/dashboard/environment` Schumann "Data belum
  tersedia" with **no fabricated "Stabil"** (R-PRD-44 rendered PASS); Soul Reflection wrapper native
  en ("Warm hugs from Bhumi.") + ms ("Pelukan hangat daripada Bhumi."), `crashed:false`.
- **Verification:** `npx tsc --noEmit` EXIT 0; full Firestore/Auth emulator release suite
  **PASS=24 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`); DS suites
  EXIT 0 (ds2c3-cold-nav 11, ds-ai1 38, ds-j4 30, authoritative-profile-gate 27,
  mirror-daily-reflection-contract 32, ds2c1 10). Ephemeral artifacts removed; worktree clean.
- No version bump, Build 106 artifact, deploy, publish, push, or production write.

## Handover snapshot — what Claude Code did (Steps 9–12)

- **Step 9** — Premium copy / price (R-42): Rp25.000 display + live Play `formattedPrice` authority (`b341c82`). RECOVERED_VERIFIED (unit + static + Step-12 rendered browser).
- **Step 10** — Full R-PRD-01..46 reconciliation (`ecc5ed6`): canonical `BUILD_106_RECONCILIATION_REPORT.md`; all 46 reconciled, zero UNKNOWN, zero false PASS; assigned **DS-J4** ← R-18 and **DS-AI1** ← R-31; enumerated RC-1..RC-11.
- **Step 11** — owned-gap closure + local-logic close (`1a686db`, `6e16274`, `ff52611`, `2528df1`):
  - **DS-2C1 DONE / RC-10 CLOSED** — `firebaseService.getUserProfile` propagates read failures (`null` = absent doc only); non-routing callers keep tolerance via `.catch(() => null)`; state-machine "I" step rewritten + green.
  - **DS-AI1 local logic CLOSED** — daily-guidance prompt `outputLanguageRule` + `attributionRule`; id/en/ms carried end to end; **native Bahasa Melayu** in `unifiedBlueprintSynthesis` + `adaptiveDailyPracticeGenerator` (new `lib/i18n/pickLocale.ts`); `localDailyGuidanceFallback` wrapper `ms → id`.
  - **DS-J4 local logic CLOSED** — rendered streak UI removed + `progressCalculationEngine` score/growth-phase de-streaked (`activeDays30`, no consecutive term; milestone `"7 Hari Aktif"`).
  - Full emulator suite **PASS=23/23** `RELEASE_TESTS_PASS`; state-machine `passed=33 failed=0`.
- **D-V5-36 ratified** (`15428ba`) — narrative-prose `ms → id` fallback (translation-KEY fallback unchanged).
- **Step 12** — genuine fresh-account acceptance + RC-2 rendered browser (`8617155`, AUDIT → VERIFY → REPORT, **no product code changed**): see §11.2 of the reconciliation report and the "Step 12" section of the matrix.

## Verified worktree state (at handover)

```text
authorized worktree   = C:\tmp\bhumi-build106-recovery
branch                = recovery/build106-product-continuity
reconciled source HEAD = 2d625bd72befbd10487bb83748e850c4bdf1c37c
HEAD                  = resolve with `git rev-parse HEAD` (documentation descendant of 2d625bd)
forensic worktree     = C:\tmp\bhumi-build83-access-hotfix  (feat/build99 @ 57479c9, ~366 dirty) — READ ONLY, untouched
worktree status       = clean tracked worktree
versionCode           = 106
versionName           = 5.0.6
BUILD_106_ARTIFACT    = SUPERSEDED (historical signed AAB from 3c8620d6; replacement from reconciled HEAD not yet built)
```

Step 9 (Premium copy / price, R-42) — the uncommitted partial start left at the Codex → Claude
Code handoff was audited against `V5_PRD.md` R-PRD-42, `V5_DECISION_LOG.md` D-V5-32, the recovered
locale bundles, and CP-036, and **adopted** in `b341c82`. Step 10 (Full R-PRD-01..46
reconciliation) is a docs/audit pass — canonical deliverable `BUILD_106_RECONCILIATION_REPORT.md`
plus matrix updates; no product code changed.

## Canonical authority and reading order

The repository Markdown set is the authority. Read in order before any further work:

1. `AGENTS.md` — agent operating contract (authorized worktree/branch, audit-before-edit,
   minimal diff, evidence discipline, git safety, release restrictions).
2. `BUILD_106_MASTER_SOT.md` — primary canonical product/recovery authority.
3. `BUILD_106_RECOVERY_MATRIX.md` — canonical status, evidence, deferred-work, and gate ledger.
4. `BUILD_106_RECONCILIATION_REPORT.md` — canonical R-PRD-01..46 reconciliation + the
   **RC-1..RC-12** release-critical gap list (§11.1 Step 11, §11.2 Step 12, §11.3 Step 12 cont.,
   **§11.4 final pre-release gap closure — `RELEASE_CRITICAL_GAPS_OPEN = 0`**).
5. `BUILD_106_AGENT_PROTOCOL.md` — mandatory recovery, safety, and evidence procedure.
6. `BUILD_106_HANDOFF.md` — this operational snapshot (not a higher authority than the above).
7. `RULES.md` — engineering/product invariants where not superseded above.
8. `CLAUDE.md` — Claude Code's operational entrypoint; its build/release lock and worktree rules
   restate the same Build 106 constraints.

The work must be reconstructable from the repo Markdown alone. On any conflict, the Build 106
Markdown wins.

## Continuity state — Steps 1–12 (cont.)

| Step | Status | Continuation note |
|---|---|---|
| 1 — Governance | DONE | Build 106 canonical docs, `CLAUDE.md` entrypoint, provenance-verified V5 docs committed. |
| 2 — New-user lifecycle | CODE_COMPLETE / BLOCKED_ON_EXTERNAL_ACCEPTANCE | Race + monotonicity + authoritative verification fixed; unit + full emulator evidence pass. Browser fresh-account acceptance is external (DS-GATE07); Playwright E2E of setup/dashboard/login is DS-2C2; `lib/firebase/service.ts` read-error-swallow is DS-2C1. |
| 3 — Localization foundation | RECOVERED_VERIFIED (unit foundation) | i18next instance + id/en/ms bundles + fallback + persistence + welcome-page switcher. Full `useTranslation()` component migration = DS-I1; browser locale round-trip = DS-2C2. |
| 4 — Journaling / CBT / data contracts | RECOVERED_VERIFIED (contract) | JournalType discriminator + 5-mode payloads + safety/AI/extraction libs + local-journal multi-entry/draft functions. Journaling UI relocation = DS-J1, behaviour wiring = DS-J2, full acceptance rows = DS-J3. Enum resolved to `SPIRITUAL_AWAKENING`. |
| 5 — Memory / Daily Context | RECOVERED_VERIFIED (pipeline/contract) | `memoryCandidateRepository` CRUD + `memoryPatternAggregator` + `buildDailyContext` 5-source priority + `memoryCompiler` wiring. Memory Dashboard UI = DS-M1; Dashboard Daily Note decision = DS-M2; reflection synthesis/UI = DS-M3; `upsertFromEntry` call site lands with DS-J2. |
| 6 — Astrology | RECOVERED_VERIFIED (unit/core) | `buildDailyAstroSynthesis` + dynamic eclipses + variable western events; `.slice(0,5)` / hardcoded eclipses / Blueprint-in-Astro regressions fixed; DS-DC1 DONE. R-36 consumer wiring = DS-A1; major-cycle scope = DS-A2; browser check open. |
| 7 — Environment / Schumann | RECOVERED_VERIFIED (unit/integration contract); browser deferred | R-43/R-44/R-46 verified; R-45 code/unit/static complete. Unavailable states no longer fabricate `Stabil`; three-layer Schumann separated; NOAA Kp kept distinct from modelled SR. DS-I2 DONE (`v5-i18n.test.ts` 28/28, in manifest). Browser rendering = DS-E1. |
| 8 — Notifications / privacy / remaining | PARTIAL_COMPLETION_VERIFIED (contract/source) | Five canonical specs recovered byte-identically; quiet-hours + FCM-token foundations reconciled (unsafe fake-token / false-delivery paths NOT adopted). New: notification policy + localized copy + opt-in + real-token-only registration + fail-closed persistence; Daily Rhythm runtime contracts; per-entry privacy enforcement; 90-day unpinned Memory decay; safe auth diagnostics; no-guilt copy. R-32 remote delivery = DS-N1; R-20 privacy UI + deletion = DS-P1; R-28 synthesis/persistence/UI = DS-M3; Daily Rhythm consumer UI = DS-R1. |
| 9 — Premium copy / price | RECOVERED_VERIFIED (unit + static) | R-42: display price `Rp25.000` in all three `src/locales` bundles + `app/premium-bhumi/page.tsx` fallback (byte-identical to CP-036); no `Rp50.000` in any current user-facing source; `app/upgrade/page.tsx` renders the live Google Play `formattedPrice` for base plan `monthly` with no hardcoded price; entitlement/billing/Android sources unmodified. `tests/unit/v5-08-premium-residual.test.ts` 46 assertions, in manifest. Rendered device proof = DS-PR1. |
| 10 — Full R-PRD-01..46 reconciliation | DONE (audit/reconciliation pass) | Canonical deliverable `BUILD_106_RECONCILIATION_REPORT.md`. All 46 reconciled, **zero `UNKNOWN`**, **zero requirements counted `PASS` on contract/source alone**. Historical recovery (4 preserved + 27 CP-036) vs new implementation (13 + 2 hybrids) tallied with provenance. Two un-owned deferrals assigned: **DS-J4** ← R-18 mood trend, **DS-AI1** ← R-31 AI-in-locale. Release-critical gaps enumerated RC-1..RC-11, each owned. No Step 1–9 regression at HEAD `1b4e41c`. |
| 11 — Focused verification + owned-gap closure | DONE (local logic closed; rendered browser pass completed in Step 12 cont.) | **DS-2C1 DONE** (RC-10 CLOSED): `firebaseService.getUserProfile` propagates read failures (`null` = absent doc only); non-routing callers keep tolerance via `.catch(() => null)`; state-machine "I" step updated + green. **DS-AI1 — local logic CLOSED** (RC-9): daily-guidance prompt `outputLanguageRule` + `attributionRule`; id/en/ms end to end; **native Bahasa Melayu** in `unifiedBlueprintSynthesis` + `adaptiveDailyPracticeGenerator` (new `lib/i18n/pickLocale.ts`); `localDailyGuidanceFallback` wrapper `ms → id`. Remainder = **DS-AI1-themes** (deep theme dicts + full fallback ms) + rendered en/ms browser (RC-2). **DS-J4 — local logic CLOSED** (RC-11): rendered streak UI removed + `progressCalculationEngine` score/growth-phase de-streaked (`activeDays30`, no consecutive term; `"7 Hari Aktif"`). Remainder = `/insights` rendered browser (RC-2). Full emulator **PASS=23/23** `RELEASE_TESTS_PASS`; two passes, no regression. Local `next dev` browser QA: all 8 Step-11 routes compile + serve HTTP 200, no compile errors; interactive SPA rendering not possible without a real Firebase project (env limitation, ephemeral `.next` + `.env.local` deleted, worktree clean). Version bump / build / deploy / publish still LOCKED. |
| 12 — Genuine fresh-account acceptance + RC-2 rendered browser | ACCEPTED @ emulator-hydration; RC-2 advanced | **D-V5-36 ratified** (`15428ba` — narrative-prose `ms → id`). **RC-1 / DS-GATE07 ACCEPTED at emulator-hydration** — brand-new emulator account → `/setup` → **real blueprint** (LP4 Builder / Gemini / Projector) → rules-enforced Firestore → **`/dashboard` rendered**; hard-reload stays; logout → `/login`, re-login (cold mirror) → `/dashboard`. DS-PR1 browser part done; R-34 switcher visible + persists. NEW finding DS-2C3. AUDIT → VERIFY → REPORT; no product code changed. |
| 12 (cont.) — DS-2C3 closure + RC-2 rendered re-verification | DS-2C3 / RC-12 CLOSED; RC-2 ADVANCED | Founder **OPTION A (ADOPT)**. Unreported parallel-session in-flight change audited hunk-by-hunk + adopted (`c9f3d04` source, `1808852` tests). **DS-2C3 CLOSED** — `isCompletedProfileForUser`; `/setup` mount guard; `resolveActiveProfile` authoritative cold re-read + `isUnavailable`; `AccessGuard` / `InsightPageClient` reconcile before gating. **BUILD_106_REGRESSION fixed** — `DashboardClient` BCP47 `translations[tag]` white-screen for en/ms switcher users → `getDictionaryKey`. **RC-2 ADVANCED** — `/setup` completed-user hard-nav → `/dashboard`; `/insights` hard-nav no bounce; `/dashboard/environment` "Data belum tersedia" no fabricated "Stabil" (R-PRD-44); Soul Reflection native en/ms. Full emulator suite **PASS=24/24**. |
| Final pre-release gap closure | `RELEASE_CRITICAL_GAPS_OPEN = 0` | Founder-directed disposition of RC-3..RC-8 + F-2 + all `DS-*` (§11.4). **F-2 FIXED** (`dailyGuidanceEngine` ultimate fallback — reachability confirmed, malformed `aiInsight` + empty fields replaced with coherent id/en copy). **RC-8 CLOSED** (`deleteUserDataCompletely` drift + 6 omitted per-user collections fixed; auth/rules/privacy audit clean). **RC-3/4/5/6/7 = ACCEPTED_DEFERRED_NON_BLOCKING** (un-built V5 surfaces Build 105 also never shipped; contracts verified; baseline intact). New suite `build106-final-pre-release-gap-closure` 89 assertions. Fix `29781d6`, test `2877b31`. Full emulator suite **PASS=25/25**. |

Step 7 commits: `1bde634` (feat), `0ff5aa8` + `0293517` (test), `99db503` (docs).
Step 8 commits: `901ad94` (feat), `d106cb7` (test), `0eea40c` (docs).
Handoff + Step 9 commits: `fe271e8` (docs: Codex → Claude Code), `b341c82` (feat+test: R-42 premium price), `1b4e41c` (docs).
Step 10 commit: `ecc5ed6` — docs only — `BUILD_106_RECONCILIATION_REPORT.md` (new) + matrix + handoff.
Step 11 commits: `1a686db` (fix: DS-2C1 / DS-AI1 / DS-J4 source), `6e16274` (test: guards + state-machine "I" step + manifest), `ff52611` (fix: DS-AI1 native ms synthesis + DS-J4 score/phase de-streak + extended guards), `2528df1` (docs).
Step 12 commit: `15428ba` (docs: ratify D-V5-36) + docs. Step 12 was AUDIT → VERIFY → REPORT — no product code changed.
Step 12 (cont.) commits: `c9f3d04` (fix: DS-2C3 + DS-J4/DS-AI1 rendered + BCP47 `DashboardClient` regression — adopted parallel-session source, +417 −86 / 10 files), `1808852` (test: DS-2C3 cold-nav suite + manifest + extended guards, +198 −7 / 6 files), then this docs commit + `.gitignore`.

## Deferred sub-steps and open gates (after final pre-release gap closure)

Canonical reconciliation: `BUILD_106_RECONCILIATION_REPORT.md` **§11.4** (each `DS-*` classed
CLOSED / ACCEPTED_DEFERRED_NON_BLOCKING / RELEASE_BLOCKER). **Zero RELEASE_BLOCKER.**

- **CLOSED:** DS-DC1 (Step 6), DS-I2 (Step 7), DS-2C1 (Step 11 — RC-10), DS-2C3 (Step 12 cont. —
  RC-12), **DS-P1 release-critical portion** (final gap closure — account-deletion inventory
  fixed + verified).
- **ACCEPTED_DEFERRED_NON_BLOCKING:** DS-J1, DS-J2, DS-J3 (V5 journaling UI; journaling
  functional at Build 105 baseline), DS-J4 (both engines de-streaked; `/insights` no-bounce;
  residual = streak section with seeded data), DS-I1 (`useTranslation()` migration; foundation
  verified), DS-AI1 (local logic closed + mirror wrapper rendered en/ms), DS-AI1-themes (D-V5-36
  `ms → id` prose ratified), DS-2C2 (flows exercised; residual = Playwright + locale copy),
  DS-M1 (extraction unwired → no data → no exposure; re-open guard), DS-M2 / DS-A2 (Founder
  decisions), DS-M3 (opt-in synthesis; decay + eligibility done), DS-A1 (astro consumer wiring;
  adapters typed), DS-E1 (`/dashboard/environment` honest-unavailable rendered PASS; residual =
  populated 3-layer render), DS-R1 (Daily Rhythm consumer UI; all contracts verified), DS-N1
  (remote FCM infra; external config + device), DS-PR1 (Premium rendered; residual = real Play
  price on device), DS-GATE07 (ACCEPTED at emulator-hydration, Founder-accepted).
- **RC-1..RC-12** in `BUILD_106_RECONCILIATION_REPORT.md` §11 / §11.1 / §11.2 / §11.3 / **§11.4**.
  After final gap closure: **RC-1 ACCEPTED**; **RC-8 / RC-10 / RC-12 CLOSED**; **RC-9 / RC-11**
  local logic closed; **RC-2 ADVANCED**; **RC-3 / RC-4 / RC-5 / RC-6 / RC-7 =
  ACCEPTED_DEFERRED_NON_BLOCKING**. **`RELEASE_CRITICAL_GAPS_OPEN = 0`.**
- Version bump, production build, Build 106 APK/AAB, deploy, publish, `.next` artifact, production
  read/write, and release-ready claims are unauthorized until the Founder approves Step 13.

## Last recorded evidence (end of final pre-release gap closure, Claude Code — 2026-09-03)

- TypeScript `npx tsc --noEmit`: **EXIT 0**.
- **Full Firestore/Auth emulator release suite** (`firebase emulators:exec --project
  demo-release-suite "node scripts/run-release-tests.mjs"`, JDK 21): **PASS=25 FAIL=0 SKIPPED=0**,
  `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`; by evidence STRONG_REAL_SDK=6
  STRONG_UNIT=11 STATIC_GUARD=5 MOCK_UNIT=1).
- New suite `build106-final-pre-release-gap-closure` — **89 assertions**, EXIT 0 (F-2 behavioural
  id/en/ms + reachability guards + RC-8 repo-collection-vs-deletion cross-check). In the manifest.
- Prior DS guard suites unchanged and green: `build106-ds2c3-cold-nav` 11,
  `build106-ds-ai1-ai-locale-attribution` 38, `build106-ds-j4-mood-trend-no-streak` 30,
  `build106-authoritative-profile-gate` 27, `mirror-daily-reflection-contract` 32,
  `build106-ds2c1-profile-read-error` 10.
- **RC-8 audit executed:** auth PII-logging clean; `firestore.rules` unchanged from Build 105;
  per-entry privacy enforcement fail-closed; `deleteUserDataCompletely` collection-name drift +
  6 omitted per-user collections **fixed**.
- **F-2 reachability confirmed** (`generateLocalDailyGuidance` outer catch re-throws →
  `runProviderCascade` `ok:false` → `generateFallbackFace`); malformed `aiInsight` + empty
  fields **fixed** (id/en coherent copy).
- **RC-2 rendered re-verification — emulator-hydration browser run** (`next dev` Turbopack wired to
  local Auth `:9099` + Firestore `:8080`; ephemeral `.env.local` + `.next` + `.playwright-cli/` +
  debug logs deleted afterward; servers stopped; **worktree clean; no `next build`**):
  - `/setup` hard-nav as an already-`setupCompleted` user → **redirects to `/dashboard`** (mount
    guard); no strand, no 20 s "pending".
  - `/insights` hard-nav with a cold AuthContext → **no bounce to `/setup`**; page reconciles and
    renders.
  - `/dashboard/environment` → Schumann **"Data belum tersedia"**, **no fabricated "Stabil"**
    (R-PRD-44 honest-unavailable rendered PASS).
  - Dashboard Soul Reflection: `profile.language = "en-US"` → "Good morning" / "Hello, RC2 QA. How
    are you this morning?" / "Warm hugs from Bhumi.", `crashed:false`; `"ms-MY"` → "Selamat pagi" /
    "Hai, RC2 QA. Apa khabar pada pagi ini?" / "Pelukan hangat daripada Bhumi.", `crashed:false`.
  - **BUILD_106_REGRESSION found + fixed:** before the fix, `profile.language = "en-US"` white-
    screened the dashboard (`translations["en-US"]` undefined). `getDictionaryKey` resolves it.
- **DS-AI1-themes** remains OPEN — the LLM-down local fallback body still emits Indonesian
  theme-label fragments; per D-V5-36 `ms → id` narrative prose is ratified ⇒ not release-critical.

No production read/write, build artifact, deploy, publish, push, or version bump occurred in
Steps 9–12 (cont.).

## Step 13 — Build 106 version bump + local release artifact (2026-09-03)

`PREFLIGHT → VERSION → BUILD → VERIFY → SMOKE TEST → REPORT`. Founder-approved. Canonical record:
**`BUILD_106_RELEASE_PROVENANCE.md`**.

- **Version bump** (commit `0b55f99`): versionCode **106**, versionName **5.0.6**, RELEASE_NAME
  "BHUMI AMARTYA V5 BUILD 106". `android/app/build.gradle` + `lib/config/buildInfo.ts` +
  `tests/unit/version-reconciliation.test.ts` (20/20 PASS). Mirrors the Build 105 prep-commit surface.
- **Build:** `next build` (`output:'export'` → `out/`) EXIT 0; `guard-release-bundle.ts` 0 violations;
  `cap sync android` OK (9 plugins); `gradlew :app:bundleRelease` — `:app:packageReleaseBundle`
  **succeeded**, `:app:signReleaseBundle` **failed** (no keystore — environment/credential
  limitation, **not** a Build 106 defect; Provenance §6).
- **Artifact:** `bhumi-amartya-v5.0.6-build106-release-unsigned.aab` — Android App Bundle,
  **unsigned** — **27,003,050 bytes** — sha256
  **`9a67aace816dfa0ea7a84d4ed9f38e6e01148205810833676410a0e894af9977`**. Build path
  `android/app/build/intermediates/intermediary_bundle/release/packageReleaseBundle/intermediary-bundle.aab`;
  stable copy in the session scratchpad.
- **Verify:** `tsc --noEmit` EXIT 0; full Firestore/Auth emulator release suite **PASS=25 FAIL=0
  SKIPPED=0** `RELEASE_TESTS_PASS`; AAB `unzip -t` no errors; packaged manifest =
  `com.bhumiamartya.app` / versionCode **106** / versionName **5.0.6** / minSdk 24 / targetSdk 36 /
  MainActivity MAIN+LAUNCHER / no `.qa` / no `debuggable`; AAB bundles the verified Build 106 web
  export + 9 plugins + non-emulator config; no new permissions vs Build 105; no
  `firestore.rules` / backend change to deploy.
- **Smoke test:** device install/launch **not locally possible** (no keystore; cannot modify
  signing or `google-services.json`) — static/structural smoke test performed, all pass.
- **Marker:** `BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY` — **pending production signing +
  Play upload on the authorized release machine.** No deploy / publish / Play upload / production
  write performed.

## Historical Step 13 continuation boundary — signing completed; Play upload remains gated

Before any edit: verify branch `recovery/build106-product-continuity`, `git rev-parse HEAD` = the
Step 13 docs commit (this file), `git status --short` clean; read the canonical Build 106 files in
the order above (+ Reconciliation Report §11.1–§11.5 + `BUILD_106_RELEASE_PROVENANCE.md`); do not
mutate the forensic worktree `C:\tmp\bhumi-build83-access-hotfix`.

State: **`RELEASE_CRITICAL_GAPS_OPEN = 0`; version 106 / 5.0.6; local unsigned release AAB built
and verified.** Master SOT §8 gates all satisfied (46/46 reconciled; genuine new-user lifecycle
accepted at emulator-hydration; race regression test executed; recovered-module + owner-isolation
tests pass; primary surfaces browser-QA'd; no provenance conflict; Founder approved release
creation) **except** the production-signed-artifact + device evidence, which require the Play
upload key and are done on the authorized release machine.

The production-signing action described below has since been completed and verified. The list is
retained as historical provenance only; it is not the current task. Play upload remains separately
gated and is not authorized.

Historical next steps recorded before signing (on the release machine, Founder-directed, NOT from
this worktree):

1. **Production signing** — build `:app:bundleRelease` with `BHUMI_RELEASE_STORE_FILE` /
   `_STORE_PASSWORD` / `_KEY_ALIAS` / `_KEY_PASSWORD` (or `android/keystore.properties`) present →
   signed `app-release.aab`. Re-hash; keep the mapping file. Never commit signing secrets.
2. **Device smoke test** on the signed build (or a debug build with a `.qa` `google-services.json`
   client) — install, launch, onboarding → dashboard, Premium screen, locale switcher.
3. **Play Console upload** to Internal Testing — Founder action; `PLAY_STORE_UPLOAD` is separately
   gated.
4. **DS-GATE07 / RC-1** — a production / Play-device genuine-new-user acceptance run is the ideal
   final proof (already accepted at emulator-hydration; not a blocker).
5. Post-Build-106 roadmap (NOT Build 106): F-1 / F-3 / F-4 / F-5 / F-6 / F-7 / F-8 (Step 12.5 §6);
   the DS-* ACCEPTED_DEFERRED_NON_BLOCKING items.
6. **Re-open guard:** if any change wires `memoryCandidateRepository.upsertFromEntry` into a live
   save flow before DS-M1 ships, RC-4 becomes release-critical again.

`NEXT_SAFE_ACTION = WAIT_FOR_FOUNDER_AUTHORIZATION_FOR_PRODUCTION_ADMIN_LIFETIME_PROVISIONING`
`NEXT_ACTION_MODE = APPROVAL_GATED`
`NEXT_PRIMARY_AGENT = CLAUDE_CODE`
`ADMIN_PRODUCTION_PROVISIONING = PENDING`
`FINAL_SIGNED_ARTIFACT_FROM_RECONCILED_HEAD = PENDING`
`DEVICE_ADMIN_ACCEPTANCE = PENDING`
`RELEASE_CRITICAL_GAPS_OPEN = 3`
`BUILD_106_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = NO`

`BUILD_106_ADMIN_LIFETIME_RECONCILIATION_CODE_COMPLETE_EMULATOR_VERIFIED_PRODUCTION_PENDING`

STOP AND WAIT FOR FOUNDER REVIEW
