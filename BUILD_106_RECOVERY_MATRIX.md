# BHUMI AMARTYA — BUILD 106 RECOVERY MATRIX

Status: CANONICAL WORKING MANIFEST
Primary authority: `BUILD_106_MASTER_SOT.md`
Continuity handoff: `BUILD_106_HANDOFF.md` (operational snapshot; not a higher authority)

This matrix is the execution ledger for Build 106. Agents must update this file as evidence is produced. Do not mark any row PASS without executed evidence.

## Continuity snapshot — handoff to Claude Code after Step 8 (2026-09-02)

```text
NEXT_PRIMARY_AGENT                = CLAUDE_CODE
PREVIOUS_PRIMARY_AGENT            = CODEX (Steps 7–8)
CURRENT_BRANCH                    = recovery/build106-product-continuity
CURRENT_HEAD_BEFORE_HANDOFF_DOCS  = 0eea40c65fa51d0efaabe8e1ef61c554cd923257
BUILD_106_PHASE                   = RECOVERY_AND_RECONCILIATION_IN_PROGRESS
BUILD_106_ARTIFACT                = DOES_NOT_EXIST
BUILD_106_RELEASE_GATE            = CLOSED
NEXT_SAFE_ACTION                  = Step 9 — Premium copy / price
```

Operational snapshot: `BUILD_106_HANDOFF.md` (Codex → Claude Code). At handoff the worktree also
holds an **uncommitted partial Step 9 start** by Codex (`app/premium-bhumi/page.tsx` fallback copy
Rp50.000→Rp25.000, `tests/unit/v5-08-premium-residual.test.ts`, `tests/release-manifest.mjs`
entry) — to be audited and reconciled in Step 9, not assumed complete.

`CURRENT_HEAD_BEFORE_STEP8_DOCS` is the clean implementation/test HEAD before this matrix and the
continuity handoff were updated. After checkout, use `git rev-parse HEAD` for the newer docs commit.

### Steps 1–8 status

| Step | Recovery unit | Status at handoff | Remaining/deferred boundary |
|---|---|---|---|
| 1 | Governance / canonical docs | **DONE** | Canonical authority is the Master SOT → this matrix → Agent Protocol. |
| 2 | Genuine-new-user lifecycle | **CODE_COMPLETE / BLOCKED_ON_EXTERNAL_ACCEPTANCE** | Unit + emulator gates pass; DS-2C1, DS-2C2, and externally blocked DS-GATE07 remain. |
| 3 | Localization foundation | **RECOVERED_VERIFIED (unit foundation)** | DS-I1 UI migration, DS-I2 Step-7-coupled suite, browser locale round-trip, R-31, and R-32 remain. |
| 4 | Journaling / CBT / data contracts | **RECOVERED_VERIFIED (contract)** | DS-J1, DS-J2, and DS-J3 remain; contract recovery is not UI/browser PASS. |
| 5 | Memory / Daily Context / Daily Note | **RECOVERED_VERIFIED (pipeline/contract)** | DS-M1, DS-M2, DS-M3, and the `upsertFromEntry` call site in DS-J2 remain. |
| 6 | Astrology synthesis / regressions | **RECOVERED_VERIFIED (unit/core)** | DS-DC1 is DONE; DS-A1, DS-A2, and Astro browser UI evidence remain open. |
| 7 | Environment / Schumann | **RECOVERED_VERIFIED (unit/integration contract); browser deferred** | R-43, R-44, and R-46 verified; R-45 UI/contract verified by source + unit but browser rendering remains DS-E1. DS-I2 is DONE. |
| 8 | Notifications / privacy / remaining canonical requirements | **PARTIAL_COMPLETION_VERIFIED (contract/source); external/UI gates deferred** | Notification/privacy/Daily Rhythm/decay contracts pass. DS-R1, DS-N1, and DS-P1 retain consumer UI, backend delivery, and privacy acceptance work. |

Step 8 was completed by Codex with file/hunk-level provenance reconciliation and explicit rejection
of unsafe historical behavior; no wholesale checkpoint merge or protected-worktree copy was used.

### Last recorded test evidence

Fresh Step-8 evidence produced by Codex on 2026-09-02:

- `build106-step8-contracts.test.ts`: **63 assertions**, EXIT 0;
- retained focused regressions: `build106-journal-contracts` **38 assertions**,
  `v5-05-daily-context` **7 checks**, and `behavior_sync_logger_privacy` **15/15**, all EXIT 0;
- `build106-memory-pipeline`, `v5-03-journaling-acceptance`, and the focused Step-8 dependencies:
  all EXIT 0;
- `tsc --noEmit --incremental false`: EXIT 0;
- scoped ESLint: EXIT 0, **0 errors / 9 warnings** (pre-existing warnings in touched legacy files;
  no lint errors);
- release runner without emulator: **PASS=11 FAIL=0 SKIPPED=8 TOTAL=19**, EXIT 0;
- full local Firestore + Auth emulator suite: **PASS=19 FAIL=0 SKIPPED=0 TOTAL=19**,
  `RELEASE_TESTS_PASS`, EXIT 0.

No browser/device/production proof was produced. Starting Next dev would create `.next`, which was
outside this task's explicit no-build-artifact boundary.

### Open gates at handoff

- Deferred register still open: DS-J1, DS-J2, DS-J3, DS-I1, DS-2C1, DS-2C2,
  DS-GATE07, DS-M1, DS-M2, DS-M3 (partial), DS-A1, DS-A2, DS-E1, DS-R1, DS-N1,
  and DS-P1. DS-DC1 and DS-I2 are DONE.
- R-45 browser rendering evidence remains open as DS-E1; do not promote it to full PASS yet.
- Genuine fresh non-sample account browser acceptance remains externally blocked (DS-GATE07).
- Browser evidence remains open for the reconciled onboarding/locale/Astro surfaces.
- Steps 9–12 and full R-PRD-01..46 reconciliation remain open.
- Versioning, build artifact creation, deploy, publish, and release-ready claims remain unauthorized.

Canonical continuation marker:

`NEXT_SAFE_ACTION = Step 9 — Premium copy / price`

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
| R-01 | Adaptive orientation | PARTIAL | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | `resolveOrientation` covers new/same-day/next-day/3/7/30-day states; Step-8 assertions pass. Dashboard wiring/browser acceptance deferred. |
| R-02 | Optional need discovery | PARTIAL | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | `getNeedOptions` preserves seven optional choices and adaptively reduces familiar-user choices to three; UI remains deferred. |
| R-03 | Check-in + Memory -> Daily Note | PARTIAL | CP-036 Daily Context | CONTRACT RECOVERED (unit); surfacing = DS-M2, astro wiring = DS-A1 | `lib/dailyContext/buildDailyContext.ts` — canonical 5-source priority builder (User Input > Wellness > Confirmed Memory > Astro > Env; higher never overridden). `v5-05-daily-context` (7 checks). Astro source now typed to the real `DailyAstroSynthesis` (DS-DC1 DONE). Daily-note text is surfaced on Dashboard via `SoulReflectionCard`/`catatanSummary`; dedicated card = DS-M2; the Daily Context → Catatan wiring = DS-A1. |
| R-04 | Tiny Step inline | MISSING | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | Three-locale invitational `buildTinyStep`; inline Daily Note consumer/browser deferred. |
| R-05 | Optional user paths | PARTIAL | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | Equal `learn/reflect/journal/explore/comfort/do-nothing` path contract; UI choice surface deferred. |
| R-06 | Do Nothing valid | PRESENT_CORRECT | Build 105 | PRESERVED + VERIFIED (unit contract) | `availablePaths()` contains `do-nothing`; no mandatory completion added. |
| R-07 | Evening reflection | MISSING | none proven | CONTRACT NEWLY_IMPLEMENTED; wiring = DS-R1 | Offered only 18:00–21:59 local and only after journaling; timezone/browser consumer deferred. |
| R-08 | No checklist/streak Dashboard | PRESENT_CORRECT | Build 105 + new copy correction | COPY RECONCILED (static/unit); browser = DS-R1 | `DailyUserFlowGuide` changed from “Recommended/Disarankan” task framing to optional spaces; footer no longer demands a next-day return. |
| R-09 | Returning context | MISSING | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | Orientation state contract covers return windows; themed greeting rendering remains deferred. |
| R-10 | Graceful Daily Rhythm failures | PARTIAL | CP-036 requirement; no usable runtime source | CONTRACT NEWLY_IMPLEMENTED; consumer = DS-R1 | id/en/ms AI/network/empty fallbacks tested; actual Dashboard error-state wiring/browser acceptance deferred. |
| R-11 | Shared journal model + discriminator | MISSING | CP-036 | RECOVERED_VERIFIED (contract) | `JournalType` union + optional `journalType?` discriminator + `cbt/emotion/guided/spiritual` payloads in `lib/data/types.ts` + `lib/journal/localJournal.ts` `LocalJournalEntry`. `v5-03-journaling-acceptance` 1.1/2.*/3.*/1.11 + `build106-journal-contracts`. |
| R-12 | Five journal modes | MISSING | CP-036 | CONTRACT RECOVERED; UI DEFERRED | `JournalType = FREE\|CBT\|EMOTION\|GUIDED\|SPIRITUAL_AWAKENING` (J0-01: uppercase `SPIRITUAL_AWAKENING`, not `spiritual`). i18n `journaling.modes` (5) in all 3 bundles (Step 3). The 5-mode radiogroup UI (`app/wellness/journaling/page.tsx`) is the deferred journaling-UI sub-step. |
| R-13 | Structured safe CBT | MISSING | CP-036 | RECOVERED_VERIFIED (contract) | `JournalEntry.cbt` = Situation / Automatic Thought / Interpretation / Evidence For+Against / Alternative Perspective / Underlying Need / Next Step / Reflection Summary (R-PRD-13). Non-diagnostic enforced by `journalSafety.sanitizeAIOutput`. `build106-journal-contracts` AI-contract block. CBT UI = deferred sub-step. |
| R-14 | Comfort Mode | MISSING | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | Comfort is an equal path; tired/overwhelmed/unknown resolve to Comfort; notification policy suppresses non-return categories. Full interaction state/browser remains new UI work. |
| R-15 | Draft autosave/conflict | MISSING | CP-036 | CONTRACT RECOVERED; wiring DEFERRED | `localJournal.ts` `savePerModeDraft` / `loadPerModeDraft` / `clearPerModeDraft` + `getScopedDraftKey(JOURNAL_DRAFT_PREFIX:${journalType}:${uid})` mode-isolated, timestamped. `v5-03-journaling-acceptance` 6.5/6.6. 30s autosave wiring is in the deferred journaling page. |
| R-16 | Journal history/search/filter/export | MISSING | CP-036 partial | CONTRACT RECOVERED; UI/export DEFERRED | `localJournal.ts` `loadLocalJournalEntries` (multi-entry, newest-first — legacy per-day singleton removed), `getJournalHistoryGroupedByWeek`, `getEntriesByType`. history/search/filter/export UI in the deferred page. |
| R-17 | Continue Yesterday | MISSING | none proven | CONTRACT NEWLY_IMPLEMENTED; UI = DS-R1 | `canContinueYesterday` accepts only the prior local-calendar-day draft; selector wiring/browser deferred. |
| R-18 | Mood trend | PARTIAL | existing components | RECONCILE (not Step 4) | Existing components; reconcile later. |
| R-19 | Reflective AI + crisis safety | PARTIAL | CP-036 | RECOVERED_VERIFIED (contract) | `lib/journal/journalSafety.ts` `crisisScanJournalText` (id/en/ms keywords) → resource card + `shouldSuppressAI`; `journalAIContract.ts` `generateJournalAIResponse` reflective-only (2-4 sentences), crisis → `{suppressed, provenance:"none"}`, `sanitizeAIOutput` strips diagnostic language. `build106-journal-contracts` + `v5-03-journaling-acceptance` §7/§8. |
| R-20 | Entry privacy | MISSING | none proven | PARTIAL COMPLETION (new contract/enforcement); UI = DS-P1 | New per-entry `locked/hiddenFromHistory/localOnly/excludeFromMemory` contract. Local-only is rejected by cloud repository; local-only/excluded content is blocked before Memory extraction. Unlock/hide controls and browser acceptance remain deferred. |
| R-21 | Useful Memory continuity | PARTIAL | CP-036 | RECOVERED_VERIFIED (contract); Dashboard UI = DS-M1 | Step 4 extraction + Step 5 `lib/repositories/memoryCandidateRepository.ts` (Firestore `journalMemoryCandidates/{uid}/candidates/{id}` + local cache; `upsertFromEntry` evidence accumulation, `getActiveCandidates`) + `lib/memory/memoryPatternAggregator.ts` (`aggregateForJourney`) + `lib/livingIntelligence/memoryCompiler.ts` hunk (active candidates → `dominantThemes` supplement, capped 8). `build106-memory-pipeline` (23). |
| R-22 | No automatic raw sensitive storage | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (contract) | `extractMemorySignals` stores a bounded grounded `snippet` (~40 chars crisis / ~80 normal), never full raw text; `MemoryCandidateEvidence.provenance` distinguishes `user-written` / `ai-interpretation` / `ai-insight`. `build106-journal-contracts` snippet-bounded block. |
| R-23 | Memory visibility/control | MISSING | CP-036 `app/journey/memory` | CRUD CONTRACT RECOVERED (unit); Dashboard UI = DS-M1 | `memoryCandidateRepository` `confirm` / `correct` (user label) / `dismiss` / `deleteCandidate` state machine (PENDING→CONFIRMED/CORRECTED/DISMISSED). `build106-memory-pipeline` control block. The visual Memory Dashboard (`app/journey/memory/page.tsx` + `MemoryCandidateCard` + `useTranslation` wiring + `/journey` link) is DS-M1. |
| R-24 | Context-aware retrieval | PARTIAL | CP-036 | RECOVERED_VERIFIED (contract) | `getActiveCandidates` (CONFIRMED/CORRECTED only) feeds `memoryCompiler` `dominantThemes` (confidence ≥ 0.4) and `buildDailyContext` priority-3 `confirmedMemory`. `build106-memory-pipeline` + `v5-05-daily-context`. |
| R-25 | Journal->Memory->Insight->Experience | PARTIAL | CP-036 | RECOVERED_VERIFIED (contract); entry-point wiring = DS-J2 | Journal → `extractMemorySignals` → `memoryCandidateRepository.upsertFromEntry` → `aggregateForJourney` / `memoryCompiler` / `buildDailyContext`. `build106-memory-pipeline`. `upsertFromEntry` is *called* from the journaling save flow — that call site lands with DS-J2. |
| R-26 | Memory boundaries | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (contract) | Step 4 (`isPromotable` ≥3, non-diagnostic `groundedThemeLabel`, crisis suppresses extraction) + Step 5: DISMISSED excluded from `getActiveCandidates` / `aggregateForJourney`; a dismissed theme keeps accumulating evidence but does **not** silently re-promote. `build106-memory-pipeline`. |
| R-27 | 90-day decay/pinning | MISSING | CP-036 (pinning) + new (decay) | RECOVERED + NEW COMPLETION VERIFIED (unit) | Pinning remains recovered. Step 8 adds canonical 90-day inactivity decay; pinned candidates bypass it; invalid/stale unpinned candidates are excluded. |
| R-28 | Weekly/monthly reflection | MISSING | none proven | PARTIAL COMPLETION (new eligibility contract); synthesis/UI = DS-M3 | Opt-in + activity + Sunday/first-of-month eligibility tested; synthesis, persistence, and rendered flow remain open. |
| R-29 | id/en/ms locales | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | 3 bundles (507 keys each) recovered; `ms` no longer phantom — `build106-i18n-foundation.test.ts` + `v5-auth-locale-flow.test.ts`. Browser E2E pending. |
| R-30 | Locale fallback missing->en->id | MISSING | CP-036 | RECOVERED_VERIFIED (unit) | `getI18n().fallbackLng = {ms:[en,id], en:[id], default:[en]}`; `getCompatDictionaries()` merges id<-en<-active — `build106-i18n-foundation.test.ts`. |
| R-31 | AI in user locale | PARTIAL | CP-036 | DEFERRED to AI step | Out of localization-foundation scope; tracked for the AI recovery step. |
| R-32 | Localized notifications | MISSING | CP-036 partial + Step-8 corrections | PARTIAL COMPLETION VERIFIED; external delivery = DS-N1 | id/en/ms copy, explicit opt-in default, timezone quiet hours, Comfort/low-energy/dismissal suppression, frequency/absence gates, real web-token-only registration, owner-scoped fail-closed persistence, SW, and Android local scheduling are covered. No fake fallback token or false FCM-sent claim. Backend FCM sender, VAPID/browser round-trip, native remote push, per-category settings UI, and device delivery acceptance remain open. |
| R-33 | Locale persistence | PARTIAL | CP-036 + new | RECOVERED + COMPLETED (unit) | `LanguageContext` reads profile + localStorage; `changeLanguage` now also persists `normalizeLocale(short)` (BCP47 tag) to `users/{uid}.language` (NEW — CP-036 gap). `UserProfile.language` widened to accept id/en/ms tags. `build106-i18n-foundation.test.ts` R-33 block. Browser E2E pending. |
| R-34 | Visible functional switcher | PARTIAL | CP-036 | RECOVERED (static) | `app/page.tsx` static "Indonesia \| English" label replaced by the CP-036 functional 3-button id/en/ms switcher wired to `setLanguage`. Browser E2E pending. |
| R-35 | Single Daily Astro synthesis | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | `lib/astrology/dailyAstroSynthesis.ts` `buildDailyAstroSynthesis` — ONE object (sky/moon/westernEvents/eastern/eclipses/majorCycles), `sourceVersion` stamped, composes the already-proven engines. `AstroTodayCard.tsx` now renders it. `v5-daily-synthesis` (22) + `v5-astro-core` (20) + `build106-astro-regressions` (29). |
| R-36 | Astro feeds Wellness/Catatan/Weekly | MISSING | CP-036 | ADAPTERS RECOVERED (unit); consumer wiring = DS-A1 | `dailyAstroSynthesis.ts` exports `astroContextFromSynthesis` (→ `wellnessRecommendationEngine.EnvironmentalContext.astroContext`) and `weeklyAstroContextFromSynthesis`. `buildDailyContext.ts` priority-4 astro source now typed to the real `DailyAstroSynthesis`. The Dashboard/Wellness/Weekly call sites that pass the synthesis in = **DS-A1**. |
| R-37 | Variable Western events | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | `lib/astrology/relevantWesternEvents.ts` `selectRelevantWesternEvents` — variable-count (retrograde / aspect orb ≤ 6° / ingress ≤ 3 days), never padded. `AstroTodayCard.tsx` `.slice(0, 5)` on `sky.bodies` **removed**; renders `synthesis.westernEvents`. `v5-astro-core` "quiet day yields ZERO events (no slice(0,5) padding)"; `build106-astro-regressions` R-37 block. |
| R-38 | Current-day Tzolkin/Weton | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVED (unit) | `buildDailyAstroSynthesis` `eastern.{tzolkin,weton}` from `calculateTzolkin`/`calculateWeton` on `canonical.localDateKey` (no birth-data personalization). `v5-daily-synthesis`. |
| R-39 | Dynamic eclipses | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | `lib/astrology/calculateEclipses.ts` (astronomy-engine, Meeus) `findNextGlobalEclipse` / `findNextVisibleEclipse` (null without observer coords — honest unavailable, D-V5-29). `KNOWN_ECLIPSES` array **retired** from `lib/data/astronomicalEvents.ts`; `astroAwarenessEngine.ts` uses `buildUpcomingEclipseEvents`. `AstroTodayCard.tsx` hardcoded "12/28 Agustus 2026" dates + `daysUntil("2026-…")` countdown **removed**; Global Next + Local/Visible Next cards. `v5-astro-core` + `build106-astro-regressions` R-39 block. |
| R-40 | No Blueprint group in Astro | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | The `{ id: "blueprint", title: "Menyentuh Blueprint-mu Hari Ini", … activations.slice(0, 5) }` group and the `Zap` import **removed** from `AstroTodayCard.tsx`. Blueprint activations still feed `buildTransitNarrative` context but are not a standalone Astro group. `build106-astro-regressions` R-40 block. Browser UI check pending. |
| R-41 | Astro non-diagnostic lens | PRESENT_CORRECT | Build 105 / CP-036 | PRESERVED (unit) | `astroContextFromSynthesis` tags describe the sky (`{body}-retrograde`, `{body}-in-{sign}`, intensity enum), never the user's condition; `majorCycles: { openScope: true }` (no invented signals, D-V5-26). `build106-astro-regressions` R-41 block. |
| R-42 | Rp25.000 display/live Play price wins | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit + static); device render = DS-PR1 | Display price `Rp25.000/bulan` (id/ms) / `Rp25.000/month` (en) in all three `src/locales/*` bundles (Step 3); `app/premium-bhumi/page.tsx:274` fallback `Rp50.000`→`Rp25.000` (byte-identical to CP-036). No `Rp50.000` in any current user-facing source. `app/upgrade/page.tsx` renders the live Google Play `formattedPrice` for base plan `monthly` (`|| "Google Play"` neutral last), no hardcoded monetary string; native bridge emits `formattedPrice`. `tests/unit/v5-08-premium-residual.test.ts` (46 assertions, in release manifest). Rendered device proof of the live price = DS-PR1. |
| R-43 | Canonical environment sources | PARTIAL | CP-036 + reconciled corrections | RECOVERED_VERIFIED (unit/source) | `service.tsx`: Open-Meteo weather/AQ, astronomy-engine Sun/Moon/circadian, USGS seismic, NOAA SWPC Kp, and Schumann Resonance Live. Each source remains a distinct domain. `v5-environment-context` 29/29. |
| R-44 | Provenance/unavailable honesty | PRESENT_BUT_REGRESSED | CP-036 + reconciled corrections | RECOVERED_VERIFIED (unit) | Every returned domain has source/status/observedAt; unavailable remote providers stay unavailable. USGS outage no longer fabricates `Stabil`; non-finite/out-of-range Schumann/Kp values fail closed. Exact unavailable copy is localized. |
| R-45 | Three-layer Schumann | MISSING | CP-036 + reconciled corrections | CONTRACT/UI RECOVERED_VERIFIED (unit/static); browser = DS-E1 | Model-labelled SR1–SR5 snapshot, honest local 24h accumulation/window states, graph component, provenance/freshness, Bhumi interpretation, spiritual lens, grounding practice, and non-deterministic disclaimer. `v5-environment-context` + DS-I2 pass; browser rendering remains open. |
| R-46 | Environment as weak context | PARTIAL | Build 105 consumers + CP-036 adapters | RECOVERED_VERIFIED (unit/integration contract) | `buildAIEnvironmentContext` keeps NOAA and Schumann separate and only emits seismic state when available. Existing Daily Context priority remains user → wellness → memory → astro → environment; `v5-05-daily-context` 7 checks EXIT 0. |

## New-user lifecycle gate

This is a release-blocking gate independent of the numbered product requirement rows.

Current state: `CODE_COMPLETE / BLOCKED_ON_EXTERNAL_ACCEPTANCE` (Phase 2B + 2C, 2026-09-02).
Every code-level and emulator-level requirement passes. The one remaining item — a genuine
fresh non-sample account browser acceptance run — cannot be executed in this environment (no
authorized authenticated test account; no signup browser driver). That is the sole `PASS` gap.

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
| Bootstrap cannot overwrite newer completed setup | PASS (unit + emulator) | `ensureMinimalUserProfile` re-reads authoritative state *after* the bootstrap await (only when `needsBootstrap`) and routes a raced call into the existing-profile reconcile path, never the create/clobber branch. `build106-new-user-lifecycle.test.ts` TEST_1 (`calls.upsert === 0`, finalized profile intact). Release suite: "Setup/recovery state machine" §11–§13, `INVARIANT 1`. |
| Stale continuation cannot reset state | PASS (unit + emulator) | Reconcile goes through `userRepository.reconcileMinimalProfile()` — read + `guardMonotonicProfilePatch` + write in one Firestore `runTransaction`; a concurrent finalize forces a retry that re-observes the finalized state. TEST_6. Release suite: "Setup/recovery state machine" `8D-2 §11` ("concurrent finalize + stale failure (both orders) -> once the txn sees ready it cannot downgrade"), `SETUP_RECOVERY_STATE_MACHINE PASS passed=33 failed=0`. |
| `setupCompleted` / `blueprintStatus` monotonic | PASS (unit + emulator) | `lib/auth/profileMonotonicity.ts` `guardMonotonicProfilePatch` strips `setupCompleted:false` / `onboardingCompleted:false` / `baselineWellnessCompleted:false` over a persisted `true`, and `blueprintStatus:"missing"` over any advanced state; protects non-empty birth strings and non-null lat/long/tz/country. TEST_2, TEST_3. RED/GREEN contrast recorded. Release suite: `8D-2` monotonic-recovery scenarios, `INVARIANT 1` ("no code path writes setupCompleted=true before a blueprint exists"). |
| AuthContext refreshed after setup before routing | RECOVERED (static + emulator-model) | `app/setup/page.tsx` `finalizeSetup` awaits `auth.refreshUserProfile()` before `router.replace("/dashboard")` — recovered from historical commit `0f0ad14e`. `build106-new-user-lifecycle.test.ts` TEST_5 (source-order assertion). Release suite: "Setup/recovery state machine" `H4` ("after final profile-ready update -> restart: route=dashboard"). Real-browser E2E still pending. |
| Server-authoritative verification wins over localStorage | FIXED (helper unit) | `finalizeSetup` now verifies with `verifySetupPersisted()` — a fresh `userRepository.getUserProfile(uid)` + the authoritative `blueprints/{uid}` read; audit/dev identities keep the local-mirror fallback. `build106-authoritative-profile-gate.test.ts` (`localStorage`-complete-but-server-incomplete → not verified). Real-browser E2E pending. |
| Dashboard recovery reconciles before routing to /setup | FIXED (helper unit) | `DashboardClient` boot, when the *cached* profile looks incomplete for the auth uid, calls `userRepository.getUserProfile(uid)` and `reconcileCachedProfileWithServer()`; on `hydrate-from-server` it converges the local cache and continues instead of stranding the user. `build106-authoritative-profile-gate.test.ts`. Release suite: `C` restart scenario still fires `recoverUserBlueprint` after hydration. Real-browser E2E pending. |
| Re-login (logout → login) lands on dashboard | FIXED (helper unit) | `app/login/page.tsx` post-login routing now prefers `auth.userProfile` (server-loaded) over the sign-out-cleared local mirror, with a `userRepository.getUserProfile(uid)` confirmation before any `/setup` route. `build106-authoritative-profile-gate.test.ts`. Real-browser E2E pending. |
| Missing profile distinguished from read error | PASS (unit + emulator) | `userRepository.getUserProfile` throws on read failure / returns `null` only for a genuinely absent doc; `ensureMinimalUserProfile` propagates the throw. TEST_4. Release suite: `I` ("getUserProfile THROWS on read denial -> resolveProfileLoad = error -> route=reauth"). NOTE the suite's divergence flag: `lib/firebase/service.ts` `getUserProfile` *swallows* read errors to `null`, but that path is not on the AuthContext route — tracked as follow-up, not a gate blocker. |
| Fresh birth data → persisted blueprint schema | PASS (emulator) | Release suite: "P0 blueprint persistence (Firestore SDK)", "Setup & blueprint recovery", "Persistence E2E" all PASS with real Firestore SDK against the emulator. |
| Sample/dev-audit not used as proof | HELD | Audit-mock seam catalogued (`lib/dailyGuidance/auditMocks.ts` `getMockProfile`/`getMockBlueprint`); every Build 106 test uses synthetic non-mock identities; the release state-machine suite uses "fresh anon uid per scenario". |
| Genuine fresh non-sample account browser acceptance | **BLOCKED (external)** | No authorized authenticated test account and no signup browser driver in this environment (documented limitation, CLAUDE.md Build 85 §E). This is the only requirement not satisfied. |

Required tests:

1. deterministic bootstrap-timeout / late-completion race — **DONE** (`build106-new-user-lifecycle.test.ts` TEST_1, EXIT 0);
2. fresh-user setup success — **DONE at emulator level** ("Setup/recovery state machine" B/finalize, `H4`); browser acceptance BLOCKED;
3. blueprint generation failure — **DONE** (release suite "Setup & blueprint recovery" scenario D, EXIT 0);
4. final-profile write failure — **DONE** (release suite scenario E, EXIT 0);
5. recovery-required transition — **DONE** (release suite `8D-2` §8–§13, `markBlueprintRecoveryRequired` transaction, EXIT 0);
6. dashboard recovery finalization — **DONE at helper + emulator-model level** (`reconcileCachedProfileWithServer` unit; release suite `C` restart); browser E2E pending;
7. pre-existing persisted user regression protection — **DONE** (`auth-minimal-profile-preservation.test.ts` + TEST_2/TEST_3 + release `8D-2 §13`).

Evidence (2026-09-02):

- `tests/unit/build106-new-user-lifecycle.test.ts` — 56 assertions, EXIT 0
- `tests/unit/build106-authoritative-profile-gate.test.ts` — 23 assertions, EXIT 0
- `tests/unit/auth-minimal-profile-preservation.test.ts` — 8 assertions, EXIT 0
- `tests/unit/auth-profile-load-outcome.test.ts` — 19 assertions, EXIT 0
- `tests/unit/auth-landing-route.test.ts` — 22 assertions, EXIT 0
- `npx tsc --noEmit` — EXIT 0, 0 errors
- **Full release suite with Firestore + Auth emulator** (`firebase emulators:exec --project demo-release-suite`, JDK 21) — **PASS=16 FAIL=0 SKIPPED=0**, `RELEASE_TESTS_PASS`, EXIT 0 (STRONG_REAL_SDK=6, STRONG_UNIT=7, STATIC_GUARD=2, MOCK_UNIT=1). Includes "Setup & blueprint recovery", "Setup/recovery state machine" (`passed=33 failed=0`), "Concurrent recovery dedup (dual runtime)", "Persistence E2E".

Follow-ups (not gate blockers): `lib/firebase/service.ts` `getUserProfile` swallows read errors to `null` (off the AuthContext route); real-browser Playwright E2E of the three reconciled surfaces; the genuine fresh-account acceptance run.

## Localization foundation (canonical recovery order Step 3 — 2026-09-02)

Scope: the i18n **foundation** — canonical instance, id/en/ms bundles, fallback chain,
persistence, functional switcher. The full `useTranslation()` component migration
(V5_I18N_SPEC §3) is a later sprint and is NOT in scope here.

Recovered verbatim from CP-036 (`036225f`), blob-SHA verified:

- `src/locales/{id-ID,en-US,ms-MY}/translation.json` — 619 lines / ~27 KB each, **507 leaf keys** each. Verified a strict **superset** of the legacy `lib/data/translations.ts` `id` dict (233 keys) — 0 consumed keys lost.
- `lib/i18n/index.ts` — one canonical `i18next` instance; `fallbackLng = { ms: ["en","id"], en: ["id"], default: ["en"] }`; `SUPPORTED_LOCALES` = id/en/ms only; `deepMerge` + `getCompatDictionaries()` (id<-en<-active pre-merge). es-ES/pt-BR/fr-FR are never loaded.
- `lib/locale/normalizeLocale.ts` — BCP47 ↔ short mapper (`normalizeLocale`, `getDictionaryKey`, `DEFAULT_LOCALE`). NOTE the V5_I18N_SPEC §3 text says "retire normalizeLocale"; the CP-036 *implementation* rebuilt it safely under `lib/locale/` — implementation is authority (see provenance ledger).
- `lib/data/translations.ts` — 851-line legacy flat dict **replaced** by CP-036's 8-line shim: `export const translations = getCompatDictionaries()`. Every `translations[language].section.key` consumer keeps working, and `translations["ms"]` now resolves (R-29 phantom/crash gone).
- `app/context/LanguageContext.tsx` — CP-036 version: `Language = "id"|"en"|"ms"`, `fromProfileLanguage()` maps `"ms-MY"`/`"ms_MY"` → `"ms"`, i18next sync effect.
- `tests/unit/v5-phase1-language-context.test.ts` (17 assertions) + `tests/unit/v5-auth-locale-flow.test.ts` (22 assertions) — recovered verbatim, both EXIT 0.

Newly implemented (CP-036 gaps, labelled NEW):

- `LanguageContext.changeLanguage` now persists `normalizeLocale(short)` (BCP47 tag) to `users/{uid}.language` on an explicit choice — CP-036 wrote localStorage only (R-33 completion).
- `lib/repositories/userRepository.ts` `UserProfile.language` widened to `"id-ID"|"en-US"|"ms-MY"|"id"|"en"|"ms"`.
- `app/page.tsx` switcher hunk recovered on top of Build 105's newer `decideLandingCtaRoute` routing (hunk-level, routing preserved).
- `tests/unit/build106-i18n-foundation.test.ts` (108 assertions, EXIT 0) — locale scope / fallback chain / no-key-loss / ms-not-phantom / persist-value-shape.

Deps: `i18next@^23.16.8` + `react-i18next@^14.1.3` re-added to `package.json` (Build 105 had dropped them; present in CP-036). `react-i18next` is dormant until the component-migration sprint.

Widening ripple contained at 4 boundaries (not-yet-localized legacy surfaces fall `ms → en` per the canonical chain): `app/setup/page.tsx` (`preferredLanguage` type), `components/wellness/WellnessPageClient.tsx` ×2 (`WellnessAssessmentFlow` prop), `components/journey/details/JourneyDetailClient.tsx` (`buildUnifiedBlueprintSynthesis` arg). Full component-type widening + `ms` copy in inline dictionaries is the react-i18next migration sprint.

Evidence (2026-09-02): `npx tsc --noEmit` EXIT 0; 8 unit suites EXIT 0 (i18n-foundation 108, v5-phase1-language-context 17, v5-auth-locale-flow 22, + new-user/auth suites); full release suite + Firestore/Auth emulator **PASS=16 FAIL=0 SKIPPED=0** (`userRepository` type change did not regress the setup/recovery state machine — `passed=33 failed=0`).

Deferred to later steps: `useTranslation()` migration across UI (V5_I18N_SPEC §3); `tests/unit/v5-i18n.test.ts` (couples to `lib/environment/schumann` — Environment step 7); R-31 AI-in-locale (AI step); R-32 localized notifications (step 8); browser E2E of the switcher.

## Journaling / CBT / data contracts (canonical recovery order Step 4 — 2026-09-02)

Scope: the journaling **data contracts** + safety / AI / mode-aware extraction libs.
The V5 journaling **UI relocation** (a new `app/wellness/journaling/page.tsx`, `next.config.ts`
`/journal` + `/innerwork/journaling` → `/wellness/journaling` redirects, and gutting the two
legacy pages to stubs) is a **deferred journaling-UI sub-step** — an architectural URL change,
not a data contract; the existing Build 105 journal pages keep working meanwhile.

Recovered verbatim from CP-036 (`036225f`), blob-SHA verified:

- `lib/journal/journalSafety.ts` (70L) — `crisisScanJournalText` (id/en/ms crisis + support keywords) → `{ level, matchedKeywords, shouldShowResourceCard, shouldSuppressAI }`; `containsDiagnosticLanguage` / `sanitizeAIOutput` (reflective fallback, never a diagnostic claim). Zero imports.
- `lib/journal/journalAIContract.ts` (63L) — `generateJournalAIResponse` reflective-only 2-4 sentences, per-mode hint, `provenance: "ai-insight" | "none"`, crisis → `{ suppressed:true, provenance:"none" }`.
- `lib/journal/journalMemoryExtraction.ts` (149L) — `extractMemorySignals(entry, uid)` mode-aware per FREE / CBT / EMOTION / GUIDED / SPIRITUAL_AWAKENING; crisis content → `suppressed:true`; evidence carries a bounded grounded `snippet`, never full raw text.
- `lib/memory/memoryCandidate.ts` (64L) — `MemoryCandidate` / `MemoryCandidateEvidence` / `MemoryProvenance` contract; `computeConfidence`, `isPromotable` (≥3, no one-off auto-promotion — R-26 §5), `groundedThemeLabel` (non-diagnostic).
- `lib/journal/localJournal.ts` (263L → 388L) — `LocalJournalEntry` extended with `journalType?` / `provenance?` / mode payloads / optional `id?`; `theme: JournalTheme` widened to `theme: string`; `loadLocalJournalEntries` now returns the **full multi-entry collection newest-first** (legacy per-day-singleton clearing removed — the R-16 regression); + `getScopedDraftKey` / `savePerModeDraft` / `loadPerModeDraft` / `clearPerModeDraft` (mode-isolated, timestamped — R-15) + `getJournalHistoryGroupedByWeek` / `getEntriesByType` (R-16) + `GENERIC_JOURNAL_THEME` / `createGenericJournalPrompt` (honest empty-context, no fabricated theme).
- `lib/repositories/journalRepository.ts` (90L → 118L) — journal Firestore contract.
- `tests/unit/v5-03-journaling-acceptance.test.ts` (155L) — recovered then **trimmed to the contract-layer subset** (rows that read the deferred `app/wellness/journaling/page.tsx` / `next.config.ts` are marked and return with the UI sub-step). 36 assertions, EXIT 0.

Hunk-recovered:

- `lib/data/types.ts` — the `JournalType` union + `JournalEntry` `journalType?` discriminator + `cbt/emotion/guided/spiritual` optional payloads (purely additive; legacy entries → treated as GUIDED). The unrelated CP-036 enneagram-field removal was NOT taken; `UserProfile.language` widened to `+"ms"` (D-V5-35 consistency).

New:

- `tests/unit/build106-journal-contracts.test.ts` (38 assertions, EXIT 0) — `extractMemorySignals` mode-aware + legacy-as-FREE; crisis suppression; evidence-snippet bounded (R-22/R-26); `memoryCandidate` thresholds (no one-off promotion); AI contract reflective + non-diagnostic + crisis-suppressed across id/en/ms.

Enum reconciliation: V5_DATA_MODEL.md's `journalType: ... | spiritual` (lowercase) is superseded — the canonical value is **`SPIRITUAL_AWAKENING`** (uppercase, Founder directive J0-01 / D-V5-07), per `lib/data/types.ts`. Provenance ledger row for V5_DATA_MODEL updated.

Evidence (2026-09-02): `npx tsc --noEmit` EXIT 0 (`localJournal` + `journalRepository` + `types.ts` recovery is drop-in — no consumer ripple); 10 unit suites EXIT 0; full release suite + Firestore/Auth emulator PASS=16 FAIL=0 SKIPPED=0.

Deferred: journaling-UI sub-step (`app/wellness/journaling/page.tsx`, redirects, legacy stubs, 30s autosave wiring, history/search/filter/export UI, `SafetyActionCard` wiring); R-21/R-23/R-24/R-25/R-27 Memory-storage/retrieval/dashboard/decay → step 5; R-14 Comfort Mode / R-17 Continue Yesterday / R-18 Mood trend / R-20 Entry privacy → their own steps.

## Memory / Daily Context / Daily Note (canonical recovery order Step 5 — 2026-09-02)

Scope: the Memory **persistence + retrieval + aggregation pipeline** and the **Daily
Context** builder. The visual Memory Dashboard is a deferred UI sub-step (DS-M1); the
"dedicated Dashboard Daily Note card" is a reconciliation question (DS-M2).

Recovered verbatim from CP-036 (`036225f`), blob-SHA verified:

- `lib/dailyContext/buildDailyContext.ts` (129L) — `buildDailyContext` canonical 5-source priority resolver (**User Input > Wellness > Confirmed Memory > Astro > Env**; higher never overridden by lower); `shouldApplyMemory`. Output feeds Catatan Hari Ini / Wellness curation / Panduan Minggu. The one `import type { DailyAstroSynthesis }` is locally stubbed to `any` (marked — reconcile in Step 6; the builder only reads astro as a weak 4th-priority source via `as any`).
- `lib/memory/memoryPatternAggregator.ts` (49L) — `aggregateForJourney` (filter to `isPromotable` ≥3 **or `pinned`**, exclude `DISMISSED`, sort by confidence); `conciseJourneyNote` (id/en/ms, non-diagnostic).
- `lib/repositories/memoryCandidateRepository.ts` (204L) — Firestore `journalMemoryCandidates/{uid}/candidates/{id}` + `bhumiMemoryCandidates:{uid}` local cache (offline, cloud-wins); `getCandidates` / `getActiveCandidates` (CONFIRMED+CORRECTED) / `getNonDismissedCandidates`; `upsertFromEntry` (mode-aware via `extractMemorySignals`, evidence accumulation slice(-10), crisis-suppressed skip); `confirm` / `correct(label)` / `dismiss` / `deleteCandidate` state machine; dismissed themes keep accumulating evidence but never silently re-promote.
- `tests/unit/v5-05-daily-context.test.ts` (51L) — 5-source priority (7 checks), EXIT 0.

Hunk-recovered:

- `lib/livingIntelligence/memoryCompiler.ts` (166→174L) — `+ import memoryCandidateRepository`; `+ safeFetch(getActiveCandidates(uid), [])` into the `Promise.all`; active candidates with confidence ≥ 0.4 supplement `dominantThemes` (capped 8); `memoryCandidates` added to the `MemoryContext` snapshot (cast, non-breaking).

New:

- `tests/unit/build106-memory-pipeline.test.ts` (23 assertions, EXIT 0) — one-off = PENDING (no auto-promotion); evidence accumulation across modes/dates; aggregator promotes ≥3-evidence / pinned only, excludes DISMISSED; confirm/correct/dismiss control; dismissed keeps evidence but stays dismissed; pinned one-off surfaces; `conciseJourneyNote` locale + non-diagnostic.

Not recovered: `scripts/validateDailyNoteV2MirrorContract.ts` — its `./validateDailyNoteV2Helpers` dependency is absent from CP-036 (broken snapshot). Skipped.

`DailyNoteV2` component (224L) is **identical** in Build 105 and CP-036 and is mounted on
`app/profile/page.tsx:377` in both. CP-036's `DashboardClient.tsx` composition is identical to
Build 105's (`SafetyActionCard → GuardianIdentityCard → SoulReflectionCard → AstroTodayCard →
EnvironmentContextCard → WeeklyGuidanceCard → DailyUserFlowGuide`) and surfaces the daily-note
text via `catatanSummary` on `SoulReflectionCard`. Whether the Master SOT §5 "Daily Note absent
from Dashboard" item requires a *dedicated* card beyond that is DS-M2.

Evidence (2026-09-02): `npx tsc --noEmit` EXIT 0 (memoryCompiler hunk drop-in — no ripple);
12 unit suites EXIT 0; full release suite + Firestore/Auth emulator PASS=16 FAIL=0 SKIPPED=0
("Persistence E2E journal/journey/memory" + "journalMemoryCandidates contracts" PASS).

Deferred: DS-M1 (Memory Dashboard UI), DS-M2 (Dashboard Daily Note reconciliation), R-27 90-day
time-decay (new implementation), R-28 weekly/monthly reflection (new implementation),
`upsertFromEntry` call site (lands with DS-J2). (DS-DC1 astro-type reconciliation in
`buildDailyContext` — **DONE in Step 6**.)

## Astrology (canonical recovery order Step 6 — 2026-09-02)

Scope: the Astro Today surface + the canonical **Daily Astro Synthesis** + the known Build 105
regression fixes. Deep consumer wiring (Astro → Wellness curation / Catatan Hari Ini) is DS-A1.

Recovered verbatim from CP-036 (`036225f`), blob-SHA verified:

- `lib/astrology/calculateEclipses.ts` (108L) — astronomy-engine (Meeus) `findNextGlobalEclipse` / `findNextVisibleEclipse` / `buildUpcomingEclipseEvents`. No hardcoded dates. `findNextVisibleEclipse` returns `null` without observer coordinates (honest unavailable — D-V5-29). **R-39.**
- `lib/astrology/relevantWesternEvents.ts` (131L) — `selectRelevantWesternEvents` variable-count (retrograde / aspect orb ≤ 6° / ingress ≤ 3 days; the Sun appears only with a reason → count varies 0..15+, never padded); `computeAspects` pure. **R-37.**
- `lib/astrology/dailyAstroSynthesis.ts` (159L) — `buildDailyAstroSynthesis`: ONE canonical object (sky/moonPhase/westernEvents/eastern{tzolkin,weton}/eclipses{globalNext,localVisible,localAvailable}/majorCycles{openScope:true}), `sourceVersion` stamped. Adapters `astroContextFromSynthesis` (→ `wellnessRecommendationEngine.EnvironmentalContext.astroContext`) and `weeklyAstroContextFromSynthesis`. **R-35 / R-36 (adapters).**
- `lib/dailyGuidance/canonicalToday.ts` (148L) — `getCanonicalToday` (timezone hierarchy profile > browser > UTC; `localDateKey` for grouping, `calculationInstant` for engines), `getYesterdayCanonical`, `getCalculationInstantForLocalDate`. Dep of the synthesis.
- `lib/data/astronomicalEvents.ts` (38L → 16L) — `KNOWN_ECLIPSES` array **retired** (comment points to the dynamic source). **R-39.**
- `components/dashboard/AstroTodayCard.tsx` (51L → 112L) — renders `buildDailyAstroSynthesis`: western group maps `synthesis.westernEvents` (**`.slice(0, 5)` on `sky.bodies` removed** — R-37); eclipse group is `Global Next` + `Local/Visible Next` cards computed from `synthesis.eclipses`, conditionally rendered (**hardcoded "12/28 Agustus 2026" + `daysUntil("2026-…")` countdown removed** — R-39); the **`{ id: "blueprint", title: "Menyentuh Blueprint-mu Hari Ini" }` group + `Zap` import removed** (R-40); labels via `translations[language].astroToday` (i18n, Step-3 bundles).
- `tests/unit/{v5-astro-core, v5-daily-synthesis, t-astro-10-canonical-today}.test.ts` — recovered. `t-astro-10` had a buggy `instantInTimezone` test helper (crossed a day boundary for 23:59 near a large +offset); corrected in-file (marked) — the product utility is verbatim and proven by the other two suites.

Hunk-recovered:

- `lib/engines/astroAwarenessEngine.ts` (180L → 195L) — `- import KNOWN_ECLIPSES` / `+ import buildUpcomingEclipseEvents`; the "5. ECLIPSES" block replaced with a dynamic `buildUpcomingEclipseEvents(baseDate, limitDays)` → `AstroEvent[]` map. **R-39.**
- `lib/dailyContext/buildDailyContext.ts` — `type DailyAstroSynthesis = any` → `import type { DailyAstroSynthesis } from "@/lib/astrology/dailyAstroSynthesis"`. **DS-DC1 DONE.**

New:

- `tests/unit/build106-astro-regressions.test.ts` (29 assertions, EXIT 0) — pins the R-37 (no `.slice(0,5)`, renders `synthesis.westernEvents`), R-39 (no `KNOWN_ECLIPSES`, no hardcoded dates/countdown, dynamic `findNextGlobalEclipse`, honest null visibility), R-40 (no blueprint group / `Zap`), R-35 (one synthesis object, `sourceVersion`, `majorCycles.openScope`), R-38 (Tzolkin/Weton in synthesis), R-41 (lens tags describe the sky, non-diagnostic) fixes + DS-DC1 closure.

Evidence (2026-09-02): `npx tsc --noEmit` EXIT 0 (astro recovery + `astroAwarenessEngine` hunk +
DS-DC1 drop-in — no ripple); 16 unit suites EXIT 0; full release suite + Firestore/Auth emulator
**PASS=16 FAIL=0 SKIPPED=0** ("Daily Guidance fail-closed" + all others PASS with the dynamic-eclipse engine).

Deferred: DS-A1 (R-36 consumer wiring into Dashboard/Wellness/Weekly), DS-A2 (major-cycle scope
beyond eclipses — Founder decision). DS-I2 is now DONE in Step 7. Browser UI check of the Astro
Today card (R-40) remains pending.

## Environment / Schumann (canonical recovery order Step 7 — 2026-09-02)

Scope: R-43..R-46 plus DS-I2. Candidate blobs for the Environment page/card, service, types,
context bridge, Schumann helpers/graph, and tests were verified identical across CP-036, checkpoint
`d2cb236`, and the protected forensic worktree before file/hunk reconciliation. The checkpoint was
not merged wholesale. Corrections were applied where checkpoint behavior conflicted with current
canonical rules.

Recovered and reconciled:

- `lib/environment/{types,service,schumann,context_utils,index}.ts(x)` — one canonical Environment
  contract; bounded remote calls; per-domain source/status/observedAt; Open-Meteo weather/AQ;
  astronomy-engine Sun/Moon/circadian; USGS seismic availability separated from observed state;
  NOAA SWPC Kp kept distinct from modelled Schumann SR data; finite/range validation; 90-second
  polling respect; idempotent local 24h accumulation; honest none/snapshot/partial/full/stale states.
- `components/dashboard/EnvironmentContextCard.tsx`, `SchumannGraph.tsx`, and
  `app/dashboard/environment/page.tsx` — unavailable states no longer fabricate `Stabil`; graph
  renders only accumulated observations; observation/model disclosure, provenance/freshness,
  Bhumi interpretation, spiritual/energetic lens, grounding practice, and non-deterministic
  disclaimer are separate layers.
- `src/locales/{id-ID,en-US,ms-MY}/translation.json` — explicit localized unavailable copy.
- `tests/unit/v5-environment-context.test.ts` (29/29) — source normalization, finite/range guards,
  accumulation/idempotency, window states, separate NOAA/Schumann bands, layered reading, source
  provenance, and all-provider-outage fail-closed behavior.
- DS-I2 `tests/unit/v5-i18n.test.ts` (28/28) — three-locale bundle, Environment/Schumann labels,
  snapshot honesty, and timezone rendering. Added to the release manifest. **DS-I2 DONE.**

Canonical corrections beyond the historical checkpoint: Sun timing no longer comes from
Open-Meteo under a `weather_api` label; circadian has its own astronomy provenance; `calm` is no
longer cast into the canonical `quiet|mild|active|storm` union; invalid numeric provider values fail
closed; test termination now occurs after all Schumann state assertions.

Evidence: focused Environment **29 passed / 0 failed**; DS-I2 **28 / 0**; `v5-05-daily-context`
**7 checks** confirms environment remains priority 5 after user/wellness/memory/astro; TypeScript
EXIT 0; scoped ESLint EXIT 0 (0 errors, 4 pre-existing warnings); no-emulator release runner
**PASS=10 FAIL=0 SKIPPED=8 TOTAL=18**; full local Firestore/Auth emulator runner after final source
changes **PASS=17 FAIL=0 SKIPPED=0**. Browser rendering is DS-E1 because this task prohibited the
`.next` artifact required by a local Next dev server.

Deferred: DS-E1 only for the Step-7 browser surface. DS-I1 remains the broader post-recovery
`useTranslation()` migration and is not part of Step 7.

## Notifications / privacy / remaining canonical requirements (Step 8 — 2026-09-02)

Scope: R-01, R-02, R-04..R-10, R-14, R-17, R-20, R-27, R-28, and R-32. The
audit compared Build 105, CP-036, checkpoint `d2cb236`, and the protected forensic worktree. No
historical source was adopted merely because it existed.

### Historical-source recovery

- Five canonical requirement documents were recovered intact from CP-036 after their blobs were
  proven identical in checkpoint `d2cb236` and the forensic worktree: `V5_NOTIFICATION_FCM_SPEC.md`,
  `V5_SECURITY_PRIVACY.md`, `V5_DAILY_RHYTHM_SPEC.md`, `V5_EXPERIENCE_ARCHITECTURE.md`, and
  `V5_COMFORT_MODE_UX_SPEC.md`. Their exact hashes are in the provenance ledger below.
- `lib/notifications/quietHours.ts`, the FCM registration/token-repository foundations, and
  `public/firebase-messaging-sw.js` began from byte-identified CP-036 source, then were reconciled
  to current fail-closed/privacy rules.
- Historical notification scheduler/history/inbox-bridge tests and account-deletion modules were
  **not adopted**: the notification path could mint a fake `local_*` token and record inbox creation
  as delivery without an FCM sender; account deletion remains incomplete against the current data
  inventory. This is historical evidence, not current completion proof.

### New implementation required and completed in Step 8

- `lib/notifications/notificationPolicy.ts` adds id/en/ms copy, explicit opt-in defaults, quiet-hour,
  Comfort/low-energy/dismissal suppression, absence return, frequency, and deduplication contracts.
- `lib/dailyRhythm/runtime.ts` adds adaptive orientation/needs, equal optional paths including
  Comfort and Do Nothing, invitational Tiny Steps, Continue Yesterday, contextual evening
  reflection, graceful fallbacks, and weekly/monthly eligibility contracts.
- `lib/journal/privacy.ts` plus repository/extraction enforcement adds per-entry locked/hidden/
  local-only/exclude-from-Memory semantics; local-only entries cannot be written to cloud storage.
- Unpinned Memory candidates now decay after 90 inactive days; pinning remains the recovered
  exception. Auth diagnostics no longer print raw UID/email/path/error objects. Reminder and
  Dashboard copy was reconciled to no-pressure/no-guilt language.

Source commit: `901ad94` (`feat(build106): recover notification and privacy contracts`). Test commit:
`d106cb7` (`test(build106): verify Step 8 safety contracts`).

### Partial completion — do not promote to PASS

- R-32 has policy, local scheduling, real-web-token-only registration, fail-closed persistence, and
  service-worker contracts; it does not have a trusted backend FCM sender, native remote-push
  configuration, or browser/device delivery proof (DS-N1).
- R-20 has data contracts and repository/Memory enforcement; it does not yet have entry controls,
  unlock/hide UX, history filtering acceptance, or complete account-deletion coverage (DS-P1).
- R-28 has opt-in/activity/date eligibility only; synthesis, persistence, and rendered weekly/
  monthly reflection remain DS-M3.
- R-01/R-02/R-04..R-10/R-14/R-17 have verified runtime/copy contracts but their complete consumer
  UI and browser acceptance remain DS-R1.

### Deferred browser / external acceptance

- DS-R1 owns Daily Rhythm/Comfort consumer UI and browser acceptance.
- DS-N1 owns trusted remote notification delivery, configuration, truthful delivery history, and
  browser/device proof.
- DS-P1 owns entry-privacy UI and complete deletion/privacy acceptance.
- No browser/device/production read or write occurred. A local Next browser run was not started
  because it would create `.next`, prohibited by this task's no-build-artifact boundary.

Evidence: Step-8 focused contract suite **63 assertions**, EXIT 0; focused journal/Daily Context/
privacy regressions EXIT 0; TypeScript EXIT 0; scoped ESLint EXIT 0 (**0 errors / 9 pre-existing
warnings**); no-emulator release runner **PASS=11 FAIL=0 SKIPPED=8 TOTAL=19**; full local synthetic
Firestore/Auth emulator runner **PASS=19 FAIL=0 SKIPPED=0 TOTAL=19**, `RELEASE_TESTS_PASS`.

## Premium copy / price (canonical recovery order Step 9 — 2026-09-02)

Scope: R-42 (R-PRD-42 / D-V5-32) — canonical monthly subscription **display** price
`Rp25.000/bulan` across all subscription surfaces; the real Google Play charge is governed by Play
Console (`bhumi_premium_monthly` / base plan `monthly`) and is never spoofed client-side; where a
live Play `formattedPrice` is shown it wins over the copy.

Continued from an uncommitted partial Step 9 start left at handoff. Audited against `V5_PRD.md`
R-PRD-42, `V5_DECISION_LOG.md` D-V5-32, the recovered locale bundles, and CP-036; adopted.

State (working tree, verified):

- **Display price** — `premiumBhumi.subscriptionNote` = `Rp25.000/bulan` (`id-ID`, `ms-MY`) /
  `Rp25.000/month` (`en-US`) in all three `src/locales/*` bundles (recovered Step 3). The
  `app/premium-bhumi/page.tsx:274` fallback string is `Rp50.000` → `Rp25.000` — **byte-identical to
  the CP-036 line** (file/hunk reconciliation, not an invention).
- **No stale price** — zero `Rp50.000` / `50.000` in any current user-facing source (`app/`,
  `components/`, `lib/`, `src/locales/`).
- **Live Play price wins** — `app/upgrade/page.tsx` renders
  `product.offers.find(basePlanId === "monthly").pricingPhases[0].formattedPrice
  || offers[0]…formattedPrice || "Google Play"` via `<Row label="Harga" value={price} />`; no
  hardcoded monetary string (`!/Rp\s?\d/`). The native bridge
  (`BhumiBillingPlugin.java`) emits `phaseJson.put("formattedPrice", phase.getFormattedPrice())`.
- **No entitlement / billing regression** — `getEntitlementStatus` remains the single authority in
  `PremiumLock` / `AccessGuard`; founder/tester/subscriber/trial/free priority, Premium-state UI
  (active / trial / free / pending / cancelled / retryable / persistence-failure / expired /
  restore), canonical Google Play product IDs, and the purchase/verify flows are unchanged; no
  client-side `isPremium: true` bypass; no `DATABASE_URL` / `purchaseToken` / `BillingResponseCode`
  in the UI.

Recovered / reconciled:

- `tests/unit/v5-08-premium-residual.test.ts` — recovered from CP-036 (which had 18 terse checks)
  and **reconciled** to a 46-assertion static acceptance guard adding the native `formattedPrice`
  bridge, canonical Google Play ID (`bhumi_premium_monthly` / `monthly` /
  `com.bhumiamartya.app`), and purchase/verify-flow-preservation checks. **46 assertions, EXIT 0.**
- `tests/release-manifest.mjs` — added the entry
  "Build 106 Step 9 Premium display price and live Google Play authority" (`node` / `STATIC_GUARD`).
  CP-036 had no `tests/release-manifest.mjs`; this is Build-106 test infra.
- `app/premium-bhumi/page.tsx` — the one-line fallback-copy hunk (as above).

No product-logic change beyond the fallback string; billing, entitlement, and Android sources were
read only, never modified.

Evidence (2026-09-02): `npx tsc --noEmit` EXIT 0; `v5-08-premium-residual` **46 assertions EXIT 0**;
i18n / daily-context / astro / auth regressions EXIT 0; no-emulator release runner
**PASS=12 FAIL=0 SKIPPED=8 TOTAL=20** (Step-9 suite PASS); full release suite + Firestore/Auth
emulator **PASS=20 FAIL=0 SKIPPED=0**, `RELEASE_TESTS_PASS`, EXIT 0.

Deferred: **DS-PR1** — rendered device/browser proof of the display price + live Play
`formattedPrice` substitution (no production purchase). R-42 is not full `PASS` until DS-PR1.

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

A recovered **contract layer** is NOT `PASS` for a requirement whose acceptance also needs UI /
wiring / browser evidence. Contract-recovered rows read `RECOVERED_VERIFIED (contract)` or
`CONTRACT RECOVERED; … DEFERRED` — never `PASS` — until the deferred sub-step below is executed
and verified.

---

## Deferred sub-steps register

Every deferred item has an explicit owner/future step. None of these is counted toward `PASS`
for its requirement; the release gate stays closed on all of them.

| ID | Deferred work | Requirements it gates | Owner / scheduled step | Status |
|---|---|---|---|---|
| **DS-J1** | Journaling UI relocation: recover `app/wellness/journaling/page.tsx` (594L, CP-036); add `next.config.ts` redirects `/journal` + `/innerwork/journaling` → `/wellness/journaling` (`:path*`); reduce `app/journal/page.tsx` + `app/innerwork/journaling/page.tsx` to redirect stubs. | R-12 (5-mode radiogroup UI), R-16 (history/search/filter UI + export PDF/JSON/text), R-13 (CBT form UI) | Build 106 — journaling-UI sub-step, scheduled **after Step 5** (Memory Dashboard + journaling page land together as the Inner Work surface); or on explicit Founder priority. | OPEN |
| **DS-J2** | Journaling UI behaviour wiring: 5-mode radiogroup + per-mode state; 30s per-mode autosave wiring (`save/load/clearPerModeDraft` + `draftInfo` indicator); `SafetyActionCard` wiring on `crisisScanJournalText`; `zoneBContext` / `getRecommendedMode` advisory context; `<article>` history rendering; export. | R-15 (autosave wiring), R-16 (history UI), R-19 (crisis card render), R-12 | Same as DS-J1. | OPEN |
| **DS-J3** | Restore the full `tests/unit/v5-03-journaling-acceptance.test.ts` rows removed for the contract subset (original 1.2–1.10, 4.1/4.3–4.6, 5.1–5.4/5.6–5.7, 6.1–6.4, 7.2–7.3, 8.2/8.3/8.7, 9.2, 10.5, 11.*) + browser E2E of a journaling session. | R-12, R-13, R-15, R-16, R-19 (acceptance) | With DS-J1/DS-J2. | OPEN |
| **DS-I1** | Full `useTranslation()` migration of UI components off the `translations[language]` compat layer (V5_I18N_SPEC §3); widen the ~40 `"id"\|"en"` component prop/param types + add `ms` copy to inline dictionaries. | R-29..R-34 (full UI localization, beyond foundation) | Build 106 — localization component-migration sprint, after the feature-recovery steps. | OPEN |
| **DS-I2** | Recover `tests/unit/v5-i18n.test.ts` (couples to `lib/environment/schumann`). | R-29/R-30 (extended) | **Step 7** (Environment / Schumann). | **DONE (Step 7, 2026-09-02)** — 28/28, EXIT 0; suite is in the release manifest. |
| **DS-2C1** | `lib/firebase/service.ts` `getUserProfile` swallows read errors to `null` (off the AuthContext route; flagged by the release state-machine suite). | new-user gate (Invariant E, secondary path) | Build 106 — auth-hardening follow-up, before final R-01..46 reconciliation. | OPEN |
| **DS-2C2** | Real-browser Playwright E2E of the 3 reconciled onboarding surfaces (setup / dashboard boot / login) + the locale switcher + locale persistence round-trip. | GATE_07, R-33/R-34 (browser) | Build 106 — verification step (11) / fresh-account acceptance. | OPEN |
| **DS-GATE07** | Genuine fresh non-sample account acceptance run (register → … → dashboard → reload → logout/login). | GATE_07_GENUINE_NEW_USER | **External** — needs an authorized authenticated test account + signup browser driver. Founder/ops to schedule. | BLOCKED (external) |
| **DS-M1** | Memory Dashboard UI: recover `app/journey/memory/page.tsx` (83L, CP-036) + `components/journey/MemoryCandidateCard` + `app/journey/page.tsx` link; needs `useTranslation()` (react-i18next) wiring — **prereq DS-I1**. Plus browser + CRUD E2E. | R-23 (visual visibility/control), R-21 (browser) | Build 106 — Memory-Dashboard UI sub-step, scheduled with DS-J1/DS-J2 (Inner Work / Journey surfaces land together); DS-I1 first. | OPEN |
| **DS-M2** | "Daily Note on Dashboard" reconciliation: CP-036 keeps `DailyNoteV2` on Profile and surfaces daily-note text on Dashboard via `catatanSummary`/`SoulReflectionCard`. Decide whether Master SOT §5 "Daily Note absent from Dashboard" requires a dedicated Dashboard card; if yes, design + wire it. | R-03 (Dashboard surfacing), Master SOT §5 | Build 106 — Founder reconciliation decision, then Daily Rhythm / Dashboard step. | OPEN (decision) |
| **DS-M3** | Complete opt-in weekly/monthly reflection synthesis, persistence, and rendered experience. Step 8 completed the 90-day unpinned decay (R-27) and reflection eligibility gates only. | R-28; R-27 no longer gated | Build 106 — Daily Rhythm/Memory consumer work. | **PARTIAL** — decay + eligibility DONE; synthesis/persistence/UI OPEN. |
| **DS-DC1** | `lib/dailyContext/buildDailyContext.ts` `DailyAstroSynthesis` type stub → real import. | R-03 (astro source typing) | Step 6 (Astrology). | **DONE (Step 6, 2026-09-02)** — now `import type { DailyAstroSynthesis } from "@/lib/astrology/dailyAstroSynthesis"`; `build106-astro-regressions` DS-DC1 block, tsc EXIT 0. |
| **DS-A1** | R-36 consumer wiring: pass `buildDailyAstroSynthesis()` / `astroContextFromSynthesis()` / `weeklyAstroContextFromSynthesis()` into the call sites — `components/dashboard/DashboardClient.tsx` (Catatan Hari Ini, T-ASTRO-08; ~6 lines but embedded in a file with Phase-2C edits), `components/wellness/WellnessPageClient.tsx` + `lib/services/wellnessDailyIntelligence.ts` (~111-line diff) wellness curation, `lib/weeklyGuidance/weeklyGuidanceEngine.ts` (~22-line clean hunk: `astroContext?` param + one lens line). | R-36 (integration) | Build 106 — astro-integration sub-step, per-file hunk reconciliation; `weeklyGuidanceEngine` hunk is low-risk and could land first. | OPEN |
| **DS-A2** | Major-cycle scope beyond eclipses — `DailyAstroSynthesis.majorCycles` is `{ openScope: true }` by contract (D-V5-26 / handover §5.4): only canonical V5 signals may be added, none invented. Define + wire the allowed large-cycle signals if/when the Founder ratifies them. | R-35 (completeness) | Build 106 — Founder decision, then wire. | OPEN (decision) |
| **DS-E1** | Browser rendering of Environment/Schumann with mocked geolocation/providers: unavailable USGS must not show `Stabil`; validate none/snapshot/partial/stale/full Schumann states, model/provenance labels, three-layer order, and no merged NOAA+Schumann energy score. | R-45 (browser), R-44 (rendered unavailable state) | Build 106 — verification Step 11, when a local Next runtime/build artifact is authorized. | OPEN (current task prohibited `.next` / build artifacts) |
| **DS-R1** | Wire and render the Step-8 Daily Rhythm contracts: adaptive greeting/orientation, optional needs and equal paths, inline Tiny Step, Continue Yesterday, evening reflection, Comfort interaction, truthful failure states, and weekly/monthly reflection consumer. Add browser acceptance. | R-01, R-02, R-04..R-10, R-14, R-17, R-28 | Build 106 — consumer/UI work in Steps 10–11; browser only when local runtime artifacts are authorized. | OPEN |
| **DS-N1** | Implement a trusted backend FCM sender/scheduler, per-category notification controls, VAPID web round-trip, Android remote-push plugin/configuration, token lifecycle acceptance, and truthful delivery history; verify in browser/device. | R-32 | Build 106 — notification external/integration acceptance; requires authorized configuration and device/browser test. | OPEN (external/configuration + implementation) |
| **DS-P1** | Add entry-level lock/unlock, hide-from-history, local-only, and exclude-from-Memory UI; verify filtering/export behavior; reconcile account deletion with the complete data inventory, realtime deletion, entitlement cleanup, and acceptance evidence. | R-20 and privacy/deletion acceptance | Build 106 — privacy consumer and account-deletion hardening before final verification. | OPEN |
| **DS-PR1** | Rendered device/browser proof of the Premium display price: the `Rp25.000` copy shows on the Premium + Upgrade surfaces, and a real Google Play `formattedPrice` (base plan `monthly`) replaces the copy when the native product is available, with a neutral fallback when it is not. No production purchase. | R-42 (rendered) | Build 106 — verification Step 11 / device QA, when a local runtime / Play sandbox is authorized. | OPEN |

---

## Worktrees (Build 106)

| Role | Path | Branch @ HEAD | Mutability |
|---|---|---|---|
| Forensic evidence (a.k.a. "protected recovery worktree" in Master SOT §6) | `C:\tmp\bhumi-build83-access-hotfix` | `feat/build99` @ `57479c928…` + ~366 dirty entries | **READ ONLY** |
| Implementation workspace | `C:\tmp\bhumi-build106-recovery` | `recovery/build106-product-continuity` @ `d106cb7` (Step-8 implementation/test baseline before docs) | **AUTHORIZED** — all Build 106 edits/tests/commits here |

Local branch `recovery/build106-product-continuity` created 2026-09-02. Its remote branch remains at
`d7a679ab98a7583e34fc11fb58da4ec462cd945f`; local recovery work through Step 8 is ahead and has not
been pushed by this task.

---

## V5 documentation provenance ledger (Phase 2A — 2026-09-02)

Method: for each document, compared the CP-036 blob against (a) the latest agent checkpoint
`d2cb236` (2026-09-02) and (b) the protected forensic worktree's untracked copy; checked Build 105
(`8fc3c23`) for any competing committed version; checked checkpoint `3a4b08b` (2026-08-31).

Result: **single-source, zero drift.** The first eight documents and the five Step-8 documents have
CP-036 blob SHAs byte-identical to both `d2cb236` and the forensic worktree. Build 105 contains none
of them. Checkpoint `3a4b08b` holds only empty (`e69de29`) placeholders and is not a source. They
were adopted verbatim from CP-036 — no body rewrite (historical requirements preserved).

| Document | Source | Adopted blob SHA | Recovery status | Superseded / stale sub-content flagged (NOT rewritten) |
|---|---|---|---|---|
| `V5_SOURCE_OF_TRUTH.md` | CP-036 `036225f` | `970cc767…` | RECOVERED_VERIFIED (provenance) | §4 stray "6 target locales" phrasing — CURRENT canonical scope is 3 (id/en/ms) + 3 deferred, D-V5-35. §6 "V4 Closure Requirements" OPEN list predates Build 105 hardening — reconcile per item during the relevant recovery step; Master SOT wins. |
| `V5_PRD.md` | CP-036 `036225f` | `8bbaf34e…` | RECOVERED_VERIFIED (provenance) | Canonical source of the `R-PRD-01..46` text used by this matrix. Consistent with Master SOT §3. No stale content found. |
| `V5_DATA_MODEL.md` | CP-036 `036225f` | `dc21c258…` | RECONCILED (Step 4, enum) | §6 acceptance "supports all six canonical locales" — stale; CURRENT = 3 + 3 deferred (D-V5-35). `journalType` enum shows lowercase `spiritual` — **SUPERSEDED**: the canonical value is `SPIRITUAL_AWAKENING` (uppercase; Founder directive J0-01 / D-V5-07), matching `lib/data/types.ts` and `lib/journal/localJournal.ts` recovered in Step 4. Code-fence prefixes are corrupted in the snapshot (cosmetic). |
| `V5_DECISION_LOG.md` | CP-036 `036225f` | `4e8c8f56…` | RECOVERED_VERIFIED (provenance) | Full decision reconciliation deferred to the recovery steps that consume each decision (localization = Step 3, journaling = Step 4, astro = Step 6, environment = Step 7). |
| `V5_TODO.md` | CP-036 `036225f` | `bfd6f13d…` | RECOVERED_VERIFIED (provenance) | Historical phased task list (P0–P8). Superseded as an execution driver by this matrix + Master SOT §7 recovery order; retained as context. |
| `V5_CBT_JOURNAL_DESIGN.md` | CP-036 `036225f` | `c36749b3…` | RECOVERED_VERIFIED (provenance) | Detailed reconciliation belongs to recovery Step 4 (Journaling/CBT). |
| `V5_I18N_SPEC.md` | CP-036 `036225f` | `30f688ac…` | RECONCILED (Step 3, 2026-09-02) | Foundation recovered per this doc (§1 CURRENT id/en/ms per D-V5-35; §2 i18next + `src/locales/{tag}/translation.json` + active→en→id-ID fallback; §4 switcher persists). SUPERSEDED sub-content: §4 "All **six** locale dictionaries exist" — pre-D-V5-35 wording; CURRENT scope is 3 + 3 DEFERRED. §3 "retire `normalizeLocale.ts`" — the CP-036 implementation instead rebuilt it safely at `lib/locale/normalizeLocale.ts`; implementation is authority. Full `useTranslation()` component migration (§3) deferred to a later sprint. |
| `DOCUMENTATION_INDEX.md` | CP-036 `036225f` (then reconciled) | adopted then edited on the recovery branch | RECONCILED | Added Build 106 authority block; fixed stale "Six canonical locales" and "D-V5-01..12" index cells; expanded historical/superseded table. |
| `V5_NOTIFICATION_FCM_SPEC.md` | CP-036 `036225f` | `19dd9e0c…` | RECOVERED_VERIFIED (provenance); implementation PARTIAL | "6 supported locales" is stale; current scope is id/en/ms per D-V5-35. Actual sender/browser/device acceptance remains DS-N1. |
| `V5_SECURITY_PRIVACY.md` | CP-036 `036225f` | `939c59c7…` | RECOVERED_VERIFIED (provenance); implementation PARTIAL | Requirements remain canonical; implementation status is governed by matrix rows. Entry privacy is partial and account deletion remains incomplete (DS-P1). |
| `V5_DAILY_RHYTHM_SPEC.md` | CP-036 `036225f` | `58d98eee…` | RECOVERED_VERIFIED (provenance); runtime PARTIAL | Step 8 implements/test-covers runtime contracts; full consumer UI/browser remains DS-R1. |
| `V5_EXPERIENCE_ARCHITECTURE.md` | CP-036 `036225f` | `75027637…` | RECOVERED_VERIFIED (provenance); reconciled by matrix | Six-locale references are stale. "We missed you" conflicts with current no-guilt policy and must not be implemented; Step-8 neutral return copy governs. |
| `V5_COMFORT_MODE_UX_SPEC.md` | CP-036 `036225f` | `9a6442c6…` | RECOVERED_VERIFIED (provenance); runtime PARTIAL | Historical reconstruction-authority note is preserved. Contract exists; full Comfort interaction/browser acceptance remains DS-R1. |

`RECOVERED_VERIFIED (provenance)` means the file's origin is proven and it was adopted intact. It
does **not** mean every requirement inside has been implemented or tested — those still track through
the `R-01..R-46` rows above.

Broader `V5_*.md` documents not yet adopted (for example `V5_JOURNAL_INNER_WORK_SPEC.md` and
`V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md`) remain available in CP-036 and will be adopted with the
same provenance method when their recovery step is reached.
