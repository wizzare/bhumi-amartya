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
| R-11 | Shared journal model + discriminator | MISSING | CP-036 | RECOVERED_VERIFIED (contract) | `JournalType` union + optional `journalType?` discriminator + `cbt/emotion/guided/spiritual` payloads in `lib/data/types.ts` + `lib/journal/localJournal.ts` `LocalJournalEntry`. `v5-03-journaling-acceptance` 1.1/2.*/3.*/1.11 + `build106-journal-contracts`. |
| R-12 | Five journal modes | MISSING | CP-036 | CONTRACT RECOVERED; UI DEFERRED | `JournalType = FREE\|CBT\|EMOTION\|GUIDED\|SPIRITUAL_AWAKENING` (J0-01: uppercase `SPIRITUAL_AWAKENING`, not `spiritual`). i18n `journaling.modes` (5) in all 3 bundles (Step 3). The 5-mode radiogroup UI (`app/wellness/journaling/page.tsx`) is the deferred journaling-UI sub-step. |
| R-13 | Structured safe CBT | MISSING | CP-036 | RECOVERED_VERIFIED (contract) | `JournalEntry.cbt` = Situation / Automatic Thought / Interpretation / Evidence For+Against / Alternative Perspective / Underlying Need / Next Step / Reflection Summary (R-PRD-13). Non-diagnostic enforced by `journalSafety.sanitizeAIOutput`. `build106-journal-contracts` AI-contract block. CBT UI = deferred sub-step. |
| R-14 | Comfort Mode | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED (not Step 4) | Its own concept — not journaling data contract. |
| R-15 | Draft autosave/conflict | MISSING | CP-036 | CONTRACT RECOVERED; wiring DEFERRED | `localJournal.ts` `savePerModeDraft` / `loadPerModeDraft` / `clearPerModeDraft` + `getScopedDraftKey(JOURNAL_DRAFT_PREFIX:${journalType}:${uid})` mode-isolated, timestamped. `v5-03-journaling-acceptance` 6.5/6.6. 30s autosave wiring is in the deferred journaling page. |
| R-16 | Journal history/search/filter/export | MISSING | CP-036 partial | CONTRACT RECOVERED; UI/export DEFERRED | `localJournal.ts` `loadLocalJournalEntries` (multi-entry, newest-first — legacy per-day singleton removed), `getJournalHistoryGroupedByWeek`, `getEntriesByType`. history/search/filter/export UI in the deferred page. |
| R-17 | Continue Yesterday | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED (not Step 4) | New implementation, later. |
| R-18 | Mood trend | PARTIAL | existing components | RECONCILE (not Step 4) | Existing components; reconcile later. |
| R-19 | Reflective AI + crisis safety | PARTIAL | CP-036 | RECOVERED_VERIFIED (contract) | `lib/journal/journalSafety.ts` `crisisScanJournalText` (id/en/ms keywords) → resource card + `shouldSuppressAI`; `journalAIContract.ts` `generateJournalAIResponse` reflective-only (2-4 sentences), crisis → `{suppressed, provenance:"none"}`, `sanitizeAIOutput` strips diagnostic language. `build106-journal-contracts` + `v5-03-journaling-acceptance` §7/§8. |
| R-20 | Entry privacy | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED (not Step 4) | New implementation, later. |
| R-21 | Useful Memory continuity | PARTIAL | CP-036 | JOURNAL-SIDE RECOVERED; storage/retrieval = step 5 | `lib/journal/journalMemoryExtraction.ts` `extractMemorySignals` (mode-aware FREE/CBT/EMOTION/GUIDED/SPIRITUAL_AWAKENING); `lib/memory/memoryCandidate.ts` contract (provenance / confidence / promotable). `build106-journal-contracts`. Memory Dashboard + persistence = step 5. |
| R-22 | No automatic raw sensitive storage | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (contract) | `extractMemorySignals` stores a bounded grounded `snippet` (~40 chars crisis / ~80 normal), never full raw text; `MemoryCandidateEvidence.provenance` distinguishes `user-written` / `ai-interpretation` / `ai-insight`. `build106-journal-contracts` snippet-bounded block. |
| R-23 | Memory visibility/control | MISSING | CP-036 `app/journey/memory` | DEFERRED to step 5 | `app/journey/memory/page.tsx` — Memory/Daily Context step. |
| R-24 | Context-aware retrieval | PARTIAL | CP-036 | DEFERRED to step 5 | Retrieval side — Memory step. |
| R-25 | Journal->Memory->Insight->Experience | PARTIAL | CP-036 | JOURNAL+EXTRACTION side recovered; pipeline end = step 5 | `journalMemoryExtraction` + `memoryCandidate` are the journal→candidate half. |
| R-26 | Memory boundaries | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (contract) | `memoryCandidate.isPromotable` (no auto-promotion of one-offs, ≥3 required — §5), `groundedThemeLabel` non-diagnostic, crisis suppresses extraction. `build106-journal-contracts` thresholds block. |
| R-27 | 90-day decay/pinning | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED (step 5) | `MemoryCandidate.pinned?` field present; decay lifecycle = Memory step. |
| R-28 | Weekly/monthly reflection | MISSING | none proven | NEW_IMPLEMENTATION_REQUIRED | opt-in + synthesis tests |
| R-29 | id/en/ms locales | PRESENT_BUT_REGRESSED | CP-036 | RECOVERED_VERIFIED (unit) | 3 bundles (507 keys each) recovered; `ms` no longer phantom — `build106-i18n-foundation.test.ts` + `v5-auth-locale-flow.test.ts`. Browser E2E pending. |
| R-30 | Locale fallback missing->en->id | MISSING | CP-036 | RECOVERED_VERIFIED (unit) | `getI18n().fallbackLng = {ms:[en,id], en:[id], default:[en]}`; `getCompatDictionaries()` merges id<-en<-active — `build106-i18n-foundation.test.ts`. |
| R-31 | AI in user locale | PARTIAL | CP-036 | DEFERRED to AI step | Out of localization-foundation scope; tracked for the AI recovery step. |
| R-32 | Localized notifications | MISSING | CP-036 scheduler | DEFERRED to notifications step (8) | Out of localization-foundation scope. |
| R-33 | Locale persistence | PARTIAL | CP-036 + new | RECOVERED + COMPLETED (unit) | `LanguageContext` reads profile + localStorage; `changeLanguage` now also persists `normalizeLocale(short)` (BCP47 tag) to `users/{uid}.language` (NEW — CP-036 gap). `UserProfile.language` widened to accept id/en/ms tags. `build106-i18n-foundation.test.ts` R-33 block. Browser E2E pending. |
| R-34 | Visible functional switcher | PARTIAL | CP-036 | RECOVERED (static) | `app/page.tsx` static "Indonesia \| English" label replaced by the CP-036 functional 3-button id/en/ms switcher wired to `setLanguage`. Browser E2E pending. |
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
| `V5_DATA_MODEL.md` | CP-036 `036225f` | `dc21c258…` | RECONCILED (Step 4, enum) | §6 acceptance "supports all six canonical locales" — stale; CURRENT = 3 + 3 deferred (D-V5-35). `journalType` enum shows lowercase `spiritual` — **SUPERSEDED**: the canonical value is `SPIRITUAL_AWAKENING` (uppercase; Founder directive J0-01 / D-V5-07), matching `lib/data/types.ts` and `lib/journal/localJournal.ts` recovered in Step 4. Code-fence prefixes are corrupted in the snapshot (cosmetic). |
| `V5_DECISION_LOG.md` | CP-036 `036225f` | `4e8c8f56…` | RECOVERED_VERIFIED (provenance) | Full decision reconciliation deferred to the recovery steps that consume each decision (localization = Step 3, journaling = Step 4, astro = Step 6, environment = Step 7). |
| `V5_TODO.md` | CP-036 `036225f` | `bfd6f13d…` | RECOVERED_VERIFIED (provenance) | Historical phased task list (P0–P8). Superseded as an execution driver by this matrix + Master SOT §7 recovery order; retained as context. |
| `V5_CBT_JOURNAL_DESIGN.md` | CP-036 `036225f` | `c36749b3…` | RECOVERED_VERIFIED (provenance) | Detailed reconciliation belongs to recovery Step 4 (Journaling/CBT). |
| `V5_I18N_SPEC.md` | CP-036 `036225f` | `30f688ac…` | RECONCILED (Step 3, 2026-09-02) | Foundation recovered per this doc (§1 CURRENT id/en/ms per D-V5-35; §2 i18next + `src/locales/{tag}/translation.json` + active→en→id-ID fallback; §4 switcher persists). SUPERSEDED sub-content: §4 "All **six** locale dictionaries exist" — pre-D-V5-35 wording; CURRENT scope is 3 + 3 DEFERRED. §3 "retire `normalizeLocale.ts`" — the CP-036 implementation instead rebuilt it safely at `lib/locale/normalizeLocale.ts`; implementation is authority. Full `useTranslation()` component migration (§3) deferred to a later sprint. |
| `DOCUMENTATION_INDEX.md` | CP-036 `036225f` (then reconciled) | adopted then edited on the recovery branch | RECONCILED | Added Build 106 authority block; fixed stale "Six canonical locales" and "D-V5-01..12" index cells; expanded historical/superseded table. |

`RECOVERED_VERIFIED (provenance)` means the file's origin is proven and it was adopted intact. It
does **not** mean every requirement inside has been implemented or tested — those still track through
the `R-01..R-46` rows above.

Broader `V5_*.md` set referenced by `V5_SOURCE_OF_TRUTH.md` §8 (e.g. `V5_DAILY_RHYTHM_SPEC.md`,
`V5_JOURNAL_INNER_WORK_SPEC.md`, `V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md`,
`V5_EXPERIENCE_ARCHITECTURE.md`, `V5_NOTIFICATION_FCM_SPEC.md`, `V5_SECURITY_PRIVACY.md`, …) remains
available in CP-036 and will be adopted with the same provenance method when its recovery step is
reached.