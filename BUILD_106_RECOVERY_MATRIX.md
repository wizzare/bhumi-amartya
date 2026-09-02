# BHUMI AMARTYA — BUILD 106 RECOVERY MATRIX

Status: CANONICAL WORKING MANIFEST
Primary authority: `BUILD_106_MASTER_SOT.md`

This matrix is the execution ledger for Build 106. Agents must update this file as evidence is produced. Do not mark any row PASS without executed evidence.

## Status vocabulary

- `PRESENT_CORRECT`
- `PRESENT_BUT_REGRESSED`
- `PARTIAL`
- `MISSING`
- `RECOVERED_UNVERIFIED`
- `RECOVERED_VERIFIED`
- `NEW_IMPLEMENTATION_REQUIRED`
- `PASS`
- `BLOCKED`

## Canonical requirement matrix

| ID | Requirement | Build 105 | Recovery source | Build 106 status | Required evidence |
|---|---|---|---|---|---|
| R-01 | Adaptive orientation | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-02 | Optional need discovery | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-03 | Check-in + Memory -> Daily Note | PARTIAL | CP-036 Daily Context | RECOVERY_REQUIRED | unit + browser |
| R-04 | Tiny Step inline | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-05 | Optional user paths | PARTIAL | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-06 | Do Nothing valid | PRESENT_CORRECT | Build 105 | PRESERVE | regression test |
| R-07 | Evening reflection | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | timezone/browser test |
| R-08 | No checklist/streak Dashboard | PRESENT_CORRECT | Build 105 | PRESERVE | regression test |
| R-09 | Returning context | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-10 | Graceful Daily Rhythm failures | PARTIAL | CP-036 | RECOVERY_REQUIRED | fallback tests |
| R-11 | Shared journal model + discriminator | MISSING | CP-036 | RECOVERY_REQUIRED | contract tests |
| R-12 | Five journal modes | MISSING | CP-036 | RECOVERY_REQUIRED | UI + persistence tests |
| R-13 | Structured safe CBT | MISSING | CP-036 | RECOVERY_REQUIRED | safety + browser tests |
| R-14 | Comfort Mode | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-15 | Draft autosave/conflict | MISSING | CP-036 | RECOVERY_REQUIRED | timer/conflict tests |
| R-16 | Journal history/search/filter/export | MISSING | CP-036 partial | RECOVERY_AND_COMPLETION_REQUIRED | integration tests |
| R-17 | Continue Yesterday | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | browser acceptance |
| R-18 | Mood trend | PARTIAL | existing components | RECONCILE | integration test |
| R-19 | Reflective AI + crisis safety | PARTIAL | CP-036 | RECOVERY_REQUIRED | crisis suppression tests |
| R-20 | Entry privacy | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | privacy tests |
| R-21 | Useful Memory continuity | PARTIAL | CP-036 | RECOVERY_REQUIRED | memory pipeline tests |
| R-22 | No automatic raw sensitive storage | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | consent/provenance tests |
| R-23 | Memory visibility/control | MISSING | CP-036 `app/journey/memory` | RECOVERY_REQUIRED | browser + CRUD tests |
| R-24 | Context-aware retrieval | PARTIAL | CP-036 | RECOVERY_REQUIRED | retrieval tests |
| R-25 | Journal->Memory->Insight->Experience | PARTIAL | CP-036 | RECOVERY_REQUIRED | end-to-end pipeline test |
| R-26 | Memory boundaries | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | boundary/suppression tests |
| R-27 | 90-day decay/pinning | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | lifecycle tests |
| R-28 | Weekly/monthly reflection | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | opt-in + synthesis tests |
| R-29 | id/en/ms locales | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | locale runtime tests |
| R-30 | Locale fallback missing->en->id | MISSING | CP-036 | RECOVERY_REQUIRED | fallback tests |
| R-31 | AI in user locale | PARTIAL | CP-036 | RECOVERY_REQUIRED | localized AI tests |
| R-32 | Localized notifications | MISSING | CP-036 scheduler | RECOVERY_REQUIRED | notification tests |
| R-33 | Locale persistence | PARTIAL | CP-036 | RECOVERY_REQUIRED | persistence tests |
| R-34 | Visible functional switcher | PARTIAL | CP-036 | RECOVERY_REQUIRED | browser tests |
| R-35 | Single Daily Astro synthesis | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | synthesis tests |
| R-36 | Astro feeds Wellness/Catatan/Weekly | MISSING | CP-036 | RECOVERY_REQUIRED | integration tests |
| R-37 | Variable Western events | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | variable-count tests |
| R-38 | Current-day Tzolkin/Weton | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVE | date tests |
| R-39 | Dynamic eclipses | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | astronomy tests |
| R-40 | No Blueprint group in Astro | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | UI test |
| R-41 | Astro non-diagnostic lens | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVE | copy/priority regression |
| R-42 | Rp25.000 display/live Play price wins | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | UI/store-price test |
| R-43 | Canonical environment sources | PARTIAL | CP-036 | RECOVERY_REQUIRED | service/provenance tests |
| R-44 | Provenance/unavailable honesty | PRESENT_BUT_REGRESSED | CP-036 | RECOVERY_REQUIRED | unavailable-state tests |
| R-45 | Three-layer Schumann | MISSING | CP-036 | RECOVERY_REQUIRED | unit + graph + browser tests |
| R-46 | Environment as weak context | PARTIAL | CP-036 | RECOVERY_REQUIRED | integration tests |

## New-user lifecycle gate

This is a release-blocking gate independent of the numbered product requirement rows.

Current state: `IN_PROGRESS` — race + monotonicity fixed and unit-proven (Phase 2B, 2026-09-02);
fresh-account acceptance + emulator/browser passes still required before `PASS`.

Root cause (VERIFIED): `ensureMinimalUserProfile()` (`lib/auth/authActions.ts`) decided
create-vs-reconcile from a `getUserProfile` read taken *before* an unbounded
`await bootstrapCanonicalAccess(...)`. When that await outlived AuthContext's
`SERVER_PROFILE_LOAD_TIMEOUT_MS` (15s) the user could finish `/setup` in the gap; the late
call then resumed on its stale `null` observation and ran
`upsertUserProfile(uid, buildMinimalUserProfile(...))` — a shallow `{merge:true}` write of
`setupCompleted:false`, `blueprintStatus:"missing"`, empty birth fields — over the finalized
profile. Every route guard (`userRouteState.ts:37`, `landingCtaRoute.ts:32`,
`DashboardClient.tsx:614`) then sent the user back to `/setup`.

| Requirement | Status | Evidence |
|---|---|---|
| Bootstrap cannot overwrite newer completed setup | FIXED (unit) | `ensureMinimalUserProfile` re-reads authoritative state *after* the bootstrap await (only when `needsBootstrap`) and routes a raced call into the existing-profile reconcile path, never the create/clobber branch. `tests/unit/build106-new-user-lifecycle.test.ts` TEST_1 (`calls.upsert === 0`, finalized profile intact). |
| Stale continuation cannot reset state | FIXED (unit) | Reconcile now goes through `userRepository.reconcileMinimalProfile()` — read + `guardMonotonicProfilePatch` + write in one Firestore `runTransaction`, so a concurrent finalize forces a retry that re-observes the finalized state. TEST_6 (concurrent calls converge). |
| `setupCompleted` / `blueprintStatus` monotonic | FIXED (unit) | `lib/auth/profileMonotonicity.ts` `guardMonotonicProfilePatch` strips `setupCompleted:false` / `onboardingCompleted:false` / `baselineWellnessCompleted:false` when persisted is `true`, and `blueprintStatus:"missing"` when persisted is any advanced state; also protects non-empty birth strings and non-null lat/long/tz/country. TEST_2, TEST_3. RED/GREEN contrast recorded (Build 105 shallow-merge regresses; guard preserves). |
| AuthContext refreshed after setup before routing | RECOVERED (static) | `app/setup/page.tsx` `finalizeSetup` awaits `auth.refreshUserProfile()` before `router.replace("/dashboard")` — recovered from historical commit `0f0ad14e`. TEST_5 (source-order assertion). Runtime E2E pending. |
| Server-authoritative wins over localStorage | OPEN | `finalizeSetup` still verifies against `localStorage(bhumiProfile:${uid})` (`app/setup/page.tsx:316`). Not yet changed. |
| Missing profile distinguished from read error | HELD (VERIFIED) | `userRepository.getUserProfile` throws on read failure / returns `null` only for a genuinely absent doc; `ensureMinimalUserProfile` propagates the throw (AuthContext maps `status:"error"` distinctly). TEST_4. |
| Dashboard recovery finalizes profile state | OPEN | `DashboardClient.tsx:614` bails to setup on `setupCompleted !== true` without an authoritative server reconcile. Deferred — the race that produced the inconsistency is now closed upstream. |
| Fresh birth data → persisted blueprint schema | OPEN | Requires fresh-account acceptance run. |
| Sample/dev-audit not used as proof | HELD | Audit-mock seam catalogued (`lib/dailyGuidance/auditMocks.ts` `getMockProfile`/`getMockBlueprint`); the new tests use synthetic non-mock identities only. |

Required tests:

1. deterministic bootstrap-timeout / late-completion race — **DONE** (TEST_1, EXIT 0);
2. fresh-user setup success — pending (fresh-account acceptance);
3. blueprint generation failure — pending (`setup_and_blueprint_recovery.test.ts`, emulator);
4. final-profile write failure — pending (emulator);
5. recovery-required transition — covered by existing `markBlueprintRecoveryRequired` guard; emulator re-run pending;
6. dashboard recovery finalization — pending;
7. pre-existing persisted user regression protection — **DONE** (`auth-minimal-profile-preservation.test.ts` updated, EXIT 0) + TEST_2/TEST_3.

Focused unit evidence (2026-09-02, `tsx --import ./tests/helpers/releaseTestEnv.mjs`):

- `tests/unit/build106-new-user-lifecycle.test.ts` — 56 assertions, EXIT 0
- `tests/unit/auth-minimal-profile-preservation.test.ts` — 8 assertions, EXIT 0
- `tests/unit/auth-profile-load-outcome.test.ts` — 19 assertions, EXIT 0
- `tests/unit/auth-landing-route.test.ts` — 22 assertions, EXIT 0
- `npx tsc --noEmit` — EXIT 0, 0 errors

## Historical source identifiers

`CP-036` = checkpoint `036225f23b4c07636ab875f9939afbebdbdad9d7`.

Other important evidence:

- Build 105: `8fc3c23dcdeb9670a33922deec5e44ae545affd9`
- recovery worktree HEAD: `57479c928ba75e6a363613bb003809bd44a6c09d`
- genuine-user historical runtime evidence: `cd42784dcf55257f1160871c8b1a4d3676f48681`
- non-blocking HD/dashboard evidence: `e3ef4570fa14e5df03e8001430a61d14142f7483`
- historical setup refresh behavior: `0f0ad14e9a0801b51245289952b9875f0fa64c83`

## Matrix completion rule

The Build 106 release gate is closed while any requirement remains `MISSING`, `PARTIAL`, `PRESENT_BUT_REGRESSED`, `RECOVERY_REQUIRED`, `RECOVERED_UNVERIFIED`, `NEW_IMPLEMENTATION_REQUIRED`, or `BLOCKED` without Founder-approved deferral.

Do not convert a requirement to `PASS` merely because code was copied or committed. `PASS` requires executed verification appropriate to the requirement.

---

## Worktrees (Build 106)

| Role | Path | Branch @ HEAD | Mutability |
|---|---|---|---|
| Forensic evidence (a.k.a. "protected recovery worktree" in Master SOT §6) | `C:\tmp\bhumi-build83-access-hotfix` | `feat/build99` @ `57479c928…` + ~366 dirty entries | **READ ONLY** |
| Implementation workspace | `C:\tmp\bhumi-build106-recovery` | `recovery/build106-product-continuity` @ `d7a679a` (base) | **AUTHORIZED** — all Build 106 edits/tests/commits here |

Local branch `recovery/build106-product-continuity` created 2026-09-02, tracking
`origin/recovery/build106-product-continuity` (remote HEAD `d7a679ab98a7583e34fc11fb58da4ec462cd945f`).

---

## V5 documentation provenance ledger (Phase 2A — 2026-09-02)

Method: for each document, compared the CP-036 blob against (a) the latest agent checkpoint
`d2cb236` (2026-09-02) and (b) the protected forensic worktree's untracked copy; checked Build 105
(`8fc3c23`) for any competing committed version; checked checkpoint `3a4b08b` (2026-08-31).

Result: **single-source, zero drift.** For all eight documents the CP-036 blob SHA is byte-identical
to both `d2cb236` and the forensic worktree. Build 105 contains none of them. Checkpoint `3a4b08b`
holds only empty (`e69de29`) placeholders and is not a source. Adopted verbatim from CP-036 into the
recovery branch — no body rewrite (historical requirements preserved).

| Document | Source | Adopted blob SHA | Recovery status | Superseded / stale sub-content flagged (NOT rewritten) |
|---|---|---|---|---|
| `V5_SOURCE_OF_TRUTH.md` | CP-036 `036225f` | `970cc767…` | RECOVERED_VERIFIED (provenance) | §4 stray "6 target locales" phrasing — CURRENT canonical scope is 3 (id/en/ms) + 3 deferred, D-V5-35. §6 "V4 Closure Requirements" OPEN list predates Build 105 hardening — reconcile per item during the relevant recovery step; Master SOT wins. |
| `V5_PRD.md` | CP-036 `036225f` | `8bbaf34e…` | RECOVERED_VERIFIED (provenance) | Canonical source of the `R-PRD-01..46` text used by this matrix. Consistent with Master SOT §3. No stale content found. |
| `V5_DATA_MODEL.md` | CP-036 `036225f` | `dc21c258…` | RECOVERED_VERIFIED (provenance) | §6 acceptance "supports all six canonical locales" — stale; CURRENT = 3 + 3 deferred (D-V5-35). `journalType` enum shows `spiritual`; V5 SOT/PRD rename fifth mode to `SPIRITUAL_AWAKENING` (display "Spiritual Awakening", directive J0-01) — internal key value to be resolved in recovery Step 4. Code-fence prefixes are corrupted in the snapshot (cosmetic). |
| `V5_DECISION_LOG.md` | CP-036 `036225f` | `4e8c8f56…` | RECOVERED_VERIFIED (provenance) | Full decision reconciliation deferred to the recovery steps that consume each decision (localization = Step 3, journaling = Step 4, astro = Step 6, environment = Step 7). |
| `V5_TODO.md` | CP-036 `036225f` | `bfd6f13d…` | RECOVERED_VERIFIED (provenance) | Historical phased task list (P0–P8). Superseded as an execution driver by this matrix + Master SOT §7 recovery order; retained as context. |
| `V5_CBT_JOURNAL_DESIGN.md` | CP-036 `036225f` | `c36749b3…` | RECOVERED_VERIFIED (provenance) | Detailed reconciliation belongs to recovery Step 4 (Journaling/CBT). |
| `V5_I18N_SPEC.md` | CP-036 `036225f` | `30f688ac…` | RECOVERED_VERIFIED (provenance) | Detailed reconciliation belongs to recovery Step 3 (Localization). Confirm CURRENT scope id/en/ms + fallback active→en→id-ID against D-V5-35. |
| `DOCUMENTATION_INDEX.md` | CP-036 `036225f` (then reconciled) | adopted then edited on the recovery branch | RECONCILED | Added Build 106 authority block; fixed stale "Six canonical locales" and "D-V5-01..12" index cells; expanded historical/superseded table. |

`RECOVERED_VERIFIED (provenance)` means the file's origin is proven and it was adopted intact. It
does **not** mean every requirement inside has been implemented or tested — those still track through
the `R-01..R-46` rows above.

Broader `V5_*.md` set referenced by `V5_SOURCE_OF_TRUTH.md` §8 (e.g. `V5_DAILY_RHYTHM_SPEC.md`,
`V5_JOURNAL_INNER_WORK_SPEC.md`, `V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md`,
`V5_EXPERIENCE_ARCHITECTURE.md`, `V5_NOTIFICATION_FCM_SPEC.md`, `V5_SECURITY_PRIVACY.md`, …) remains
available in CP-036 and will be adopted with the same provenance method when its recovery step is
reached.