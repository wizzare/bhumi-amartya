# BHUMI AMARTYA — BUILD 106 FULL RECONCILIATION REPORT (R-PRD-01..46)

Status: CANONICAL — canonical recovery order **Step 10**
Primary authority: `BUILD_106_MASTER_SOT.md` §7.10 / §10
Execution ledger: `BUILD_106_RECOVERY_MATRIX.md`
Date: 2026-09-02
Branch: `recovery/build106-product-continuity`
Implementation HEAD reconciled: `1b4e41c` (end of Step 9)

This report is the Step 10 deliverable: a full walk of every canonical requirement
`R-PRD-01..46` and every deferred sub-step, assigning each an **accepted final reconciled
status** with executed evidence or an explicit, owned gap. It does not add product features.

---

## 1. Method

For each requirement:

1. Read the canonical text in `V5_PRD.md` §2 and the Master SOT §3–§5.
2. Read the corresponding `BUILD_106_RECOVERY_MATRIX.md` row (R-01..R-46 map 1:1 to
   R-PRD-01..46 — verified, no gaps, no collisions after the 2026-08-24 ID reconciliation).
3. Confirm the claimed recovery/implementation against repository evidence in the authorized
   worktree (file presence, hunk spot-checks, and the executed test suites below).
4. Classify the recovery as **historical recovery** (provenance-verified CP-036 source) vs
   **new implementation / completion** (no recoverable source, or recoverable source proven
   incomplete/unsafe and rebuilt).
5. Assign a reconciled status from the vocabulary in §2.
6. Confirm any remaining work has a named owner (a `DS-*` register row) **and** a scheduled
   verification step. Where Step 10 found an un-owned deferral, it created the owner (see §6).

Cross-feature / dependency regression was checked by re-running the full TypeScript project
check and the full release suite (unit + real Firestore/Auth emulator) at the reconciled HEAD —
see §7. No Step 1–9 work regressed.

---

## 2. Reconciled status vocabulary

| Status | Meaning | Counts toward release `PASS`? |
|---|---|---|
| `PRESERVED_VERIFIED` | Build 105 already satisfied the requirement; retained unchanged (or copy-reconciled) and covered by executed unit/static evidence. | Contract/behaviour: yes. Full surface acceptance: only after Step 11 browser sanity where a UI is involved. |
| `RECOVERED_VERIFIED (contract)` | Provenance-verified historical source recovered file/hunk-level; executed unit/contract evidence passes. | **No** — not until the named consumer-UI / browser / device sub-step is executed. |
| `NEW_CONTRACT_VERIFIED` | No recoverable source (or recoverable source unsafe); new contract/runtime logic implemented; executed unit evidence passes. | **No** — consumer UI + browser acceptance is the named `DS-*`. |
| `PARTIAL_COMPLETION` | Some sub-parts done and verified; the remainder is a named, owned `DS-*`. | **No.** |
| `BLOCKED_EXTERNAL` | Code + emulator complete; the only remaining item needs an external resource (authorized account / device / Play sandbox). | **No** until the external run is done. |

**No requirement is classified as bare `PASS` (full acceptance).** Every requirement whose
acceptance needs rendered/browser/device evidence sits at contract/unit level with a named
owner. **Zero requirements are `UNKNOWN`.** **Zero requirements are counted `PASS` merely
because a contract or source file exists** — this was checked explicitly against every row.

---

## 3. Requirement reconciliation — Daily Rhythm (R-PRD-01..10) + Astro (R-PRD-35..42)

| ID | Requirement (abbrev) | Build 105 | Recovery type | Reconciled status | Evidence | Remainder owner |
|---|---|---|---|---|---|---|
| R-PRD-01 | Adaptive orientation (new/returning/same-day/absence) | PARTIAL | **NEW** (no source proven) | `NEW_CONTRACT_VERIFIED` | `lib/dailyRhythm/runtime.ts` `resolveOrientation`; Step-8 contract suite 63 assertions EXIT 0 | DS-R1 (consumer UI + browser) |
| R-PRD-02 | Optional need discovery (7 options) | PARTIAL | **NEW** | `NEW_CONTRACT_VERIFIED` | `getNeedOptions` preserves 7 options, reduces to 3 for familiar users; Step-8 suite | DS-R1 |
| R-PRD-03 | Check-in + Memory → Daily Note | PARTIAL | **RECOVERED** (CP-036 Daily Context) | `RECOVERED_VERIFIED (contract)` | `lib/dailyContext/buildDailyContext.ts` 5-source priority; `v5-05-daily-context` 7 checks EXIT 0; astro source typed (DS-DC1 done) | DS-M2 (dedicated Dashboard card decision), DS-A1 (Daily Context→Catatan wiring) |
| R-PRD-04 | Tiny Step inline in Daily Note | MISSING | **NEW** | `NEW_CONTRACT_VERIFIED` | `buildTinyStep` invitational, 3-locale; Step-8 suite | DS-R1 |
| R-PRD-05 | Optional paths (Learn/Reflect/Journal/Talk/Explore/Rest/Do Nothing) | PARTIAL | **NEW** | `NEW_CONTRACT_VERIFIED` | equal-path contract in `runtime.ts`; Step-8 suite | DS-R1 |
| R-PRD-06 | Do Nothing is a valid completion | PRESENT_CORRECT | **PRESERVED** | `PRESERVED_VERIFIED (unit)` | `availablePaths()` contains `do-nothing`; no mandatory completion added; Step-8 suite | DS-R1 (browser sanity only) |
| R-PRD-07 | Evening reflection optional + contextual | MISSING | **NEW** | `NEW_CONTRACT_VERIFIED` | offered 18:00–21:59 local and only after journaling; Step-8 suite | DS-R1 (timezone/browser consumer) |
| R-PRD-08 | No mandatory checklist / no streak UI | PRESENT_CORRECT + copy fix | **PRESERVED + COPY RECONCILED** | `PRESERVED_VERIFIED (static/unit)` | `DailyUserFlowGuide` de-task-framed; footer no longer demands next-day return; Step-8 suite | DS-R1 (browser) |
| R-PRD-09 | Returning context, no guilt language | MISSING | **NEW** | `NEW_CONTRACT_VERIFIED` | orientation return-window contract; Step-8 no-guilt copy reconciliation | DS-R1 (themed greeting render) |
| R-PRD-10 | Graceful empty/failure states | PARTIAL | **NEW** (no usable runtime source) | `NEW_CONTRACT_VERIFIED` | id/en/ms AI/network/empty fallbacks; Step-8 suite | DS-R1 (Dashboard error-state wiring) |
| R-PRD-35 | Single Daily Astro Synthesis | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | `lib/astrology/dailyAstroSynthesis.ts` one object + `sourceVersion`; `v5-daily-synthesis` 22 + `v5-astro-core` 20 + `build106-astro-regressions` 29, all EXIT 0 | DS-A2 (large-cycle scope beyond eclipses — Founder decision) |
| R-PRD-36 | Astro feeds Wellness / Catatan / Panduan Minggu | MISSING | **RECOVERED** (CP-036 adapters) | `RECOVERED_VERIFIED (adapters, unit)` | `astroContextFromSynthesis` / `weeklyAstroContextFromSynthesis`; `buildDailyContext` priority-4 typed | DS-A1 (Dashboard / Wellness / Weekly call sites) |
| R-PRD-37 | Variable-count Western sky events | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | `selectRelevantWesternEvents`; `AstroTodayCard.tsx:50` renders `synthesis.westernEvents`, **no `.slice(0,5)` padding** (verified 2026-09-02); `v5-astro-core` "quiet day yields ZERO events" | Step 11 browser check |
| R-PRD-38 | Current-day Tzolkin/Weton only | PRESENT_CORRECT | **PRESERVED** | `PRESERVED_VERIFIED (unit)` | `eastern.{tzolkin,weton}` on `localDateKey`, no birth personalization; `v5-daily-synthesis` | — |
| R-PRD-39 | Eclipse contract (Global + Local/Visible, no countdown, no hardcoded list) | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | `calculateEclipses.ts` dynamic; `export const KNOWN_ECLIPSES` **retired** (only retirement comments remain — verified 2026-09-02); `AstroTodayCard` hardcoded "12/28 Agustus 2026" + `daysUntil` countdown removed; `build106-astro-regressions` R-39 block | Step 11 browser check |
| R-PRD-40 | Blueprint section removed from Astro Today | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | `{id:"blueprint"}` group + `Zap` import removed from `AstroTodayCard.tsx` (verified 2026-09-02); activations still feed narrative context only; `build106-astro-regressions` R-40 block | Step 11 browser check |
| R-PRD-41 | Astrology is contextual lens, never diagnostic | PRESENT_CORRECT | **PRESERVED** | `PRESERVED_VERIFIED (unit)` | lens tags describe the sky, not the user; `majorCycles.openScope:true` (no invented signals); `build106-astro-regressions` R-41 block | — |
| R-PRD-42 | Rp25.000 display / live Play `formattedPrice` wins | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit + static)` | `premiumBhumi.subscriptionNote` = Rp25.000 in 3 bundles; `app/premium-bhumi/page.tsx:274` fallback Rp50.000→Rp25.000 (byte-identical to CP-036); **zero `Rp50.000`/`50.000` in any current source — verified 2026-09-02**; `app/upgrade/page.tsx` renders live `formattedPrice` for base plan `monthly`, no hardcoded Rp; `v5-08-premium-residual` 46 assertions EXIT 0 | DS-PR1 (rendered device / Play-sandbox proof) |

---

## 4. Requirement reconciliation — Inner Work / Journaling (R-PRD-11..20)

| ID | Requirement (abbrev) | Build 105 | Recovery type | Reconciled status | Evidence | Remainder owner |
|---|---|---|---|---|---|---|
| R-PRD-11 | Shared JournalEntry model + `journalType` discriminator | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `lib/data/types.ts` `JournalType` union + optional discriminator + mode payloads; `lib/journal/localJournal.ts` `LocalJournalEntry`; `v5-03-journaling-acceptance` + `build106-journal-contracts` 38, EXIT 0 | — (data contract complete; consumed by DS-J*) |
| R-PRD-12 | Five modes FREE/CBT/EMOTION/GUIDED/SPIRITUAL_AWAKENING | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | enum resolved to uppercase `SPIRITUAL_AWAKENING` (J0-01 / D-V5-07); `journaling.modes` (5) in 3 bundles | DS-J1 (5-mode radiogroup UI), DS-J2, DS-J3 |
| R-PRD-13 | Structured safe CBT (8 fields, non-diagnostic) | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `JournalEntry.cbt` 8-field contract; `journalSafety.sanitizeAIOutput` strips diagnostic language; `build106-journal-contracts` AI block | DS-J1 (CBT form UI), DS-J3 |
| R-PRD-14 | Comfort Mode as first-class path | MISSING | **NEW** | `NEW_CONTRACT_VERIFIED` | tired/overwhelmed/unknown → Comfort; notification policy suppresses non-return categories; Step-8 suite | DS-R1 (interaction state + browser) |
| R-PRD-15 | Draft autosave 30s + conflict + per-mode list | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `savePerModeDraft`/`loadPerModeDraft`/`clearPerModeDraft`, mode-isolated timestamped keys; `v5-03-journaling-acceptance` 6.5/6.6 | DS-J2 (30s autosave wiring + conflict UI) |
| R-PRD-16 | History + search + filters + export | MISSING | **RECOVERED (partial)** (CP-036) | `RECOVERED_VERIFIED (contract)` | `loadLocalJournalEntries` multi-entry newest-first (per-day singleton regression removed), `getJournalHistoryGroupedByWeek`, `getEntriesByType` | DS-J1/DS-J2 (history/search/filter UI), DS-J3 (export PDF/JSON/text + acceptance) |
| R-PRD-17 | Continue Yesterday shortcut | MISSING | **NEW** | `NEW_CONTRACT_VERIFIED` | `canContinueYesterday` accepts only prior local-day draft; Step-8 suite | DS-R1 (selector wiring + browser) |
| R-PRD-18 | Mood trend visualization (no streaks) | PARTIAL | **PRESERVED (existing components) — reconcile** | `PARTIAL_COMPLETION` | Build 105 mood components exist; not audited against the no-streak / progress-without-streak contract; no unit coverage added in Steps 1–9 | **DS-J4 (NEW — created by Step 10)** |
| R-PRD-19 | Reflective-only AI + crisis → resource card | PARTIAL | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `crisisScanJournalText` (id/en/ms) → resource card + `shouldSuppressAI`; `generateJournalAIResponse` reflective 2–4 sentences, crisis→suppressed; `build106-journal-contracts` + `v5-03-journaling-acceptance` §7/§8 | DS-J2 (crisis card render), DS-J3 |
| R-PRD-20 | Per-entry privacy (lock / hide / local-only) | MISSING | **NEW (partial)** | `PARTIAL_COMPLETION` | `lib/journal/privacy.ts` + repository/extraction enforcement: locked/hiddenFromHistory/localOnly/excludeFromMemory; local-only rejected by cloud repo; excluded content blocked before Memory extraction; Step-8 suite | DS-P1 (entry controls UI + deletion acceptance) |

---

## 5. Requirement reconciliation — Living Intelligence / Memory (R-PRD-21..28) + Global Foundation (R-PRD-29..34) + Environment (R-PRD-43..46)

| ID | Requirement (abbrev) | Build 105 | Recovery type | Reconciled status | Evidence | Remainder owner |
|---|---|---|---|---|---|---|
| R-PRD-21 | Memory retains useful continuity | PARTIAL | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | Step-4 extraction + Step-5 `memoryCandidateRepository` + `memoryPatternAggregator` + `memoryCompiler` hunk; `build106-memory-pipeline` 23, EXIT 0 | DS-M1 (Dashboard UI + browser) |
| R-PRD-22 | No automatic raw/sensitive storage without consent | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `extractMemorySignals` stores bounded `snippet` (~40/~80 chars), never full raw; provenance enum; `build106-journal-contracts` snippet-bounded block | — |
| R-PRD-23 | Memory visibility/control (view/edit/delete/export) | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (CRUD contract)` | `confirm`/`correct(label)`/`dismiss`/`deleteCandidate` state machine; `build106-memory-pipeline` control block | DS-M1 (Memory Dashboard UI + CRUD E2E) |
| R-PRD-24 | Context-aware retrieval | PARTIAL | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `getActiveCandidates` → `memoryCompiler` `dominantThemes` (≥0.4) + `buildDailyContext` priority-3; `build106-memory-pipeline` + `v5-05-daily-context` | — |
| R-PRD-25 | Journal→Extraction→Memory→Pattern→Insight→Experience | PARTIAL | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | full chain wired; `build106-memory-pipeline` | DS-J2 (`upsertFromEntry` call site in the journaling save flow) |
| R-PRD-26 | Boundary rules (no diagnosis, max 1 theme, max 1/week, opt-in raw, user-scoped) | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (contract)` | `isPromotable` ≥3, non-diagnostic label, crisis suppresses extraction; DISMISSED excluded, no silent re-promote; `build106-memory-pipeline` | — |
| R-PRD-27 | 90-day decay (configurable) + user pin | MISSING | **RECOVERED (pin) + NEW (decay)** | `RECOVERED + NEW COMPLETION VERIFIED (unit)` | Step-8 90-day inactivity decay; pinned bypass; invalid/stale unpinned excluded; Step-8 suite | Reconciliation note: user-facing "configurable" period surface is not exposed; pin is the user control and is verified. No further gate unless Founder wants a settings surface. |
| R-PRD-28 | Weekly reflection synthesis (opt-in) + monthly summary | MISSING | **NEW (partial)** | `PARTIAL_COMPLETION` | opt-in + activity + Sunday/first-of-month eligibility tested; Step-8 suite | DS-M3 (synthesis + persistence + rendered flow) |
| R-PRD-29 | CURRENT locales id-ID / en-US / ms-MY | PRESENT_BUT_REGRESSED | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | 3 bundles 619L / 507 leaf keys each; `ms` no longer phantom; `build106-i18n-foundation` 108 + `v5-auth-locale-flow` 22 | DS-I1 (full `useTranslation()` migration), DS-2C2 (browser) |
| R-PRD-30 | Fallback missing key → en → id-ID | MISSING | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (unit)` | `fallbackLng = {ms:[en,id], en:[id], default:[en]}`; `getCompatDictionaries()` id←en←active; `build106-i18n-foundation` | — |
| R-PRD-31 | AI content in user locale + source attribution | PARTIAL | **RECOVERED (spec) — deferred** | `PARTIAL_COMPLETION` | `V5_I18N_SPEC` recovered; no AI-generation-path locale enforcement implemented in Steps 1–9 (out of localization-foundation scope) | **DS-AI1 (NEW — created by Step 10)** |
| R-PRD-32 | All notifications localized | MISSING | **RECOVERED (partial) + NEW** (CP-036 + Step-8) | `PARTIAL_COMPLETION` | id/en/ms copy, opt-in default, quiet hours, suppression gates, real-token-only registration, fail-closed persistence, SW, Android local scheduling; **no** fake token / false "FCM sent" | DS-N1 (backend FCM sender, VAPID round-trip, native remote push, per-category UI, device delivery) |
| R-PRD-33 | Locale persists to profile + localStorage | PARTIAL | **RECOVERED + NEW COMPLETION** (CP-036 + new) | `RECOVERED + COMPLETED (unit)` | `changeLanguage` now persists `normalizeLocale(short)` to `users/{uid}.language` (CP-036 wrote localStorage only); `UserProfile.language` widened; `build106-i18n-foundation` R-33 block | DS-2C2 (browser round-trip) |
| R-PRD-34 | Locale switcher visible + functional | PARTIAL | **RECOVERED** (CP-036) | `RECOVERED_VERIFIED (static)` | `app/page.tsx` static label → CP-036 functional 3-button id/en/ms switcher wired to `setLanguage` | DS-2C2 (browser) |
| R-PRD-43 | Canonical environment sources (one primary per domain) | PARTIAL | **RECOVERED + corrections** (CP-036) | `RECOVERED_VERIFIED (unit/source)` | `service.tsx`: Open-Meteo weather/AQ, astronomy-engine Sun/Moon/circadian, USGS seismic, NOAA SWPC Kp, Schumann Resonance Live — each a distinct domain; `v5-environment-context` 29/29 | — |
| R-PRD-44 | Provenance + honest unavailable ("Data belum tersedia", no fabricated defaults) | PRESENT_BUT_REGRESSED | **RECOVERED + corrections** (CP-036) | `RECOVERED_VERIFIED (unit)` | every domain has source/status/observedAt; **USGS outage no longer fabricates `Stabil`**; non-finite/out-of-range Kp/SR fail closed; localized unavailable copy; `v5-environment-context` | DS-E1 (rendered unavailable state) |
| R-PRD-45 | Three-layer Schumann (Observation MODEL-labelled / Interpretation / Spiritual; no medical claims) | MISSING | **RECOVERED + corrections** (CP-036) | `RECOVERED_VERIFIED (contract/UI, unit/static)` | model-labelled SR1–SR5 snapshot, honest 24h accumulation/window states, `SchumannGraph.tsx`, provenance/freshness, interpretation + spiritual lens + grounding practice + non-deterministic disclaimer as separate layers; `v5-environment-context` + `v5-i18n` 28/28 | DS-E1 (browser rendering) |
| R-PRD-46 | Environment is weak context, never merged NOAA+Schumann into one "energy level" | PARTIAL | **RECOVERED** (CP-036 adapters) | `RECOVERED_VERIFIED (unit/integration)` | `buildAIEnvironmentContext` keeps NOAA and Schumann separate; Daily Context priority user→wellness→memory→astro→env unchanged; `v5-05-daily-context` 7 checks | — |

---

## 6. Un-owned deferrals found by Step 10 — now assigned

Step 10's owner-discipline pass found **two** requirements whose remaining work had **no
`DS-*` id and no scheduled verification step** — a violation of the Founder rule "partial/
deferred memiliki owner dan verification step". Both are now assigned. See the matrix
**Deferred sub-steps register** for the full rows.

| New ID | Requirement | Why it was un-owned | Assigned owner / verification step |
|---|---|---|---|
| **DS-J4** | R-PRD-18 Mood trend visualization | Matrix row said only "Existing components; reconcile later" — no id, no step. | Build 106 — journaling/insights consumer work (with DS-J1/DS-J2). Verification: audit the existing mood/progress components against the "progress without streaks" contract (R-PRD-18 + R-XC-02), add a unit/static guard that asserts no streak/consecutive-day UI, then browser check in Step 11. |
| **DS-AI1** | R-PRD-31 AI content in user locale + attribution | Matrix row said "DEFERRED to AI step" — there is no numbered "AI step" in the recovery order (1–13). | Build 106 — AI-output reconciliation sub-step, scheduled **before Step 11 full verification**. Verification: enforce user-locale + source attribution on the daily-guidance / journal-AI generation paths; unit coverage that a non-id locale profile yields locale-tagged AI output with provenance; then Step 11 browser check. |

No other requirement was found un-owned. Every other partial/deferred item already maps to a
register row with an owner and a step.

---

## 7. Dependency / cross-feature regression check (reconciled HEAD)

Re-run at `1b4e41c` on 2026-09-02 (Node 24.18.0; JDK 21 for the emulator):

| Check | Command | Result |
|---|---|---|
| TypeScript project | `npx tsc --noEmit` | **EXIT 0**, 0 errors |
| Release suite (no emulator) | `node scripts/run-release-tests.mjs --skip-emulator` | **PASS=12 FAIL=0 SKIPPED=8 TOTAL=20**, EXIT 0 (`STRONG_UNIT=8 STATIC_GUARD=3 MOCK_UNIT=1`) |
| Full release suite + Firestore/Auth emulator | `firebase emulators:exec --project demo-release-suite --only firestore,auth "node scripts/run-release-tests.mjs"` | **PASS=20 FAIL=0 SKIPPED=0 TOTAL=20**, `RELEASE_TESTS_PASS`, EXIT 0 (`STRONG_REAL_SDK=6 STRONG_UNIT=10 STATIC_GUARD=3 MOCK_UNIT=1`) |

Cross-feature findings:

- The Step-3 `UserProfile.language` widening did **not** regress the setup/recovery state
  machine (`passed=33 failed=0`) or owner-isolation blocks.
- The Step-6 dynamic-eclipse engine did **not** regress Daily Guidance fail-closed.
- The Step-8 privacy enforcement (`localOnly` rejected by the cloud repository) is exercised by
  "Persistence E2E — journal / journey / memory lifecycle" (real SDK) — PASS.
- The Step-9 premium copy change is UI-only; billing / entitlement / Android sources are byte-
  unchanged; "Billing server state machine" + `v5-08-premium-residual` PASS.
- No Build 105 hardening/security/release fix was reverted by Steps 1–9 (route guards,
  Firestore rules deploy guard, import-boundary guard, app-update policy — all PASS).

---

## 8. Historical recovery vs new implementation — final tally

Reconciled classification of all 46 (matches Master SOT §3's "recoverable 30 / new 12" split,
with 4 preserved-correct that needed no recovery):

| Class | Count | Requirement IDs |
|---|---|---|
| **PRESERVED_VERIFIED** (Build 105 already correct) | 4 | R-PRD-06, 38, 41, and R-PRD-08 (preserved + copy-reconciled) |
| **RECOVERED_VERIFIED** from CP-036 (provenance-verified, file/hunk) | 27 | R-PRD-03, 11, 12, 13, 15, 16, 19, 21, 22, 23, 24, 25, 26, 29, 30, 33, 34, 35, 36, 37, 39, 40, 42, 43, 44, 45, 46 |
| **NEW_CONTRACT_VERIFIED / NEW COMPLETION** (no recoverable source, or unsafe source rebuilt) | 13 | R-PRD-01, 02, 04, 05, 07, 09, 10, 14, 17, 20 (partial), 27 (decay half), 28 (partial), 32 (partial) |
| **PARTIAL / un-owned → now owned** | 2 | R-PRD-18 → DS-J4, R-PRD-31 → DS-AI1 |

(R-PRD-27 and R-PRD-32 appear once, in their dominant class; both are hybrids —
recovered pin/copy + new decay/policy.)

Provenance for every recovered file is recorded in the matrix per-step sections and the
V5 documentation provenance ledger. No recovered code is described as "historical restoration"
without a verified blob SHA. Checkpoint `036225f` was never merged wholesale; the protected
forensic worktree was never copied wholesale or mutated.

---

## 9. Deferred sub-step register — owner + verification confirmation

Every `DS-*` has an owner and a verification step. Status at end of Step 10:

| ID | Gates | Owner / step | Status |
|---|---|---|---|
| DS-J1 | R-PRD-12/13/16 (journaling UI) | Build 106 journaling-UI sub-step (with DS-M1) | OPEN |
| DS-J2 | R-PRD-15/16/19/25/12 (UI behaviour wiring, `upsertFromEntry` call site) | with DS-J1 | OPEN |
| DS-J3 | R-PRD-12/13/15/16/19 (full acceptance rows + journaling E2E) | with DS-J1/DS-J2 | OPEN |
| **DS-J4** | R-PRD-18 (mood trend, no-streak) | journaling/insights consumer work + browser | **PARTIAL (Step 11)** — rendered streak UI removed **and** `progressCalculationEngine` score/growth-phase de-streaked (`activeDays30`, no consecutive term); guard 26 (behavioral). Remainder: `/insights` rendered browser check (RC-2) |
| DS-I1 | R-PRD-29..34 full UI localization | localization component-migration sprint | OPEN |
| DS-I2 | R-PRD-29/30 extended (`v5-i18n.test.ts`) | Step 7 | **DONE** (28/28, in manifest) |
| **DS-AI1** | R-PRD-31 (AI in user locale + attribution) | AI-output reconciliation sub-step | **PARTIAL (Step 11)** — journal AI locked; daily-guidance prompt locale/attribution contract + end-to-end id/en/ms plumbing; **native Bahasa Melayu** in `unifiedBlueprintSynthesis` + `adaptiveDailyPracticeGenerator` (new `lib/i18n/pickLocale.ts`); guard 31 (behavioral ms). Remainder: **DS-AI1-themes** + rendered en/ms browser (RC-2 / RC-9) |
| **DS-AI1-themes** | R-PRD-31 deterministic-fallback completeness | i18n follow-up sprint (post browser pass) | **OPEN (new — Step 11)** — Indonesian-only theme-label dictionaries + full `localDailyGuidanceFallback` ms (~70 sites, currently `ms → id`). Not release-critical on its own — primary AI path renders true ms |
| DS-2C1 | new-user gate Invariant E secondary path (`lib/firebase/service.ts` read-error swallow) | auth-hardening follow-up | **DONE (Step 11)** — read failure propagates (null = absent doc only); guard (10) + state-machine "I" step updated; emulator PASS=23/23 |
| DS-2C2 | GATE_07, R-PRD-33/34 browser | verification | **PARTIAL (Step 12)** — setup→dashboard, dashboard hard-reload, logout→login exercised in a real emulator-hydration browser run. Remaining: scripted Playwright regression + locale visible-copy round-trip (needs DS-I1) |
| DS-GATE07 | GATE_07_GENUINE_NEW_USER | verification Step 12 | **ACCEPTED (emulator-hydration, Step 12)** — brand-new emulator account, real hydration/auth/blueprint, rules-enforced Firestore, dashboard rendered + reload + logout/login all correct. Production / Play-device run still ideal |
| DS-2C3 | GATE_07 residual trap (feature-page trigger) | auth-hardening follow-up, before the DS-E1/DS-J4/DS-AI1 rendered browser pass | **OPEN (new — Step 12)** — `/setup` has no mount guard for an already-complete user; a gated-feature-page cold hard-nav can strand a genuine complete user there |
| DS-M1 | R-PRD-23 (Memory Dashboard UI), R-PRD-21 browser | Memory-Dashboard UI sub-step (DS-I1 first) | OPEN |
| DS-M2 | R-PRD-03 Dashboard surfacing, Master SOT §5 | Founder reconciliation decision, then Daily Rhythm/Dashboard step | OPEN (decision) |
| DS-M3 | R-PRD-28 | Daily Rhythm/Memory consumer work | PARTIAL (decay + eligibility done; synthesis/persistence/UI open) |
| DS-DC1 | R-PRD-03 astro source typing | Step 6 | **DONE** |
| DS-A1 | R-PRD-36 consumer wiring | astro-integration sub-step | OPEN |
| DS-A2 | R-PRD-35 large-cycle scope | Founder decision, then wire | OPEN (decision) |
| DS-E1 | R-PRD-45 browser, R-PRD-44 rendered unavailable | verification Step 11 (needs authorized local Next runtime) | OPEN |
| DS-R1 | R-PRD-01/02/04..10/14/17/28 consumer UI | consumer/UI work Steps 10–11; browser in Step 11 | OPEN |
| DS-N1 | R-PRD-32 remote delivery | notification external/integration acceptance | OPEN (external/config + impl) |
| DS-P1 | R-PRD-20 + privacy/deletion acceptance | privacy consumer + account-deletion hardening, before Step 11 | OPEN |
| DS-PR1 | R-PRD-42 rendered | device / Play-sandbox QA | **BROWSER PART DONE (Step 12)** — `/premium-bhumi` renders "Rp25.000/bulan", `/upgrade` renders `bhumi_premium_monthly` / base plan `monthly` / Harga = "Google Play" neutral fallback; zero `Rp50.000`. Remaining: real Play `formattedPrice` on an installed Android build |

---

## 10. Cross-cutting requirements (R-XC-01..10) — carried, not separately gated

The Master SOT counts 46 numbered requirements; the cross-cutting set is folded into them:

| R-XC | Carried by | Status |
|---|---|---|
| R-XC-01 Companion-first | product philosophy across all touchpoints | carried |
| R-XC-02 No streak pressure | R-PRD-08 + DS-J4 no-streak guard | on track |
| R-XC-03 Return without guilt | R-PRD-09 + Step-8 no-guilt copy reconciliation; `V5_EXPERIENCE_ARCHITECTURE` "We missed you" explicitly rejected | verified (copy/contract) |
| R-XC-04 AI as companion not authority | R-PRD-19/41 non-diagnostic contracts | verified (contract) |
| R-XC-05 Privacy-first memory | R-PRD-20/22/26 | verified (contract); UI = DS-P1 |
| R-XC-06 Cultural respect in localization | R-PRD-29 (id/en/ms bundles) | verified (foundation); UI = DS-I1 |
| R-XC-07 No clinical/diagnostic claims | R-PRD-13/19 + `sanitizeAIOutput` | verified (contract) |
| R-XC-08 User agency — always optional | R-PRD-05/06/08 | verified (contract); UI = DS-R1 |
| R-XC-09 No fake personalization — attributed | R-PRD-24 provenance enum, R-PRD-41 lens tags; R-PRD-31 attribution = **DS-AI1** | partial → DS-AI1 |
| R-XC-10 Do Nothing as valid completion | R-PRD-06 | verified (contract) |

---

## 11. Unresolved release-critical gaps (explicit)

The Build 106 release gate is **CLOSED**. The following are the release-critical open items,
each owned. None is a silent gap.

| # | Gap | Master SOT / PRD gate | Owner | Blocking type |
|---|---|---|---|---|
| RC-1 | Genuine fresh non-sample new-user browser acceptance | Master SOT §8, §10.3; PRD §5 | DS-GATE07 | **ACCEPTED at emulator-hydration level (Step 12)** — brand-new emulator account, full lifecycle to a rendered `/dashboard` (real blueprint, rules-enforced Firestore), dashboard hard-reload + logout/login all correct. A production / Play-device run is still the ideal final proof |
| RC-2 | Browser/device QA for affected primary surfaces (Daily Rhythm, Schumann, Memory Dashboard, Premium, locale switcher, Astro Today, onboarding) | Master SOT §8 | DS-R1, DS-E1, DS-M1, DS-PR1, DS-2C2, DS-A1 | **PARTIAL (Step 12)** — onboarding (setup→dashboard, reload, logout/login), **Premium `/premium-bhumi` + `/upgrade`** (DS-PR1 browser part), and the **locale switcher visibility/persistence** (R-34) all verified in a real emulator-hydration browser run. DS-E1 (Schumann), DS-J4 (`/insights`), DS-AI1 (rendered en/ms) not reached — blocked by **DS-2C3** (cold hard-nav to gated feature pages bounces to `/setup`) + in-app-browser SPA-nav limits |
| RC-12 | `/setup` mount guard for an already-complete user | Master SOT §4.1 (residual trap, narrower trigger) | DS-2C3 | **OPEN (new — Step 12)** — add the guard + extend the cold-nav authoritative reconcile to `AccessGuard` / `resolveActiveProfile`; regression test |
| RC-3 | FCM infrastructure live (backend sender, VAPID round-trip, native remote push, device delivery) | PRD §5 "FCM infrastructure live"; Master SOT §5 | DS-N1 | Needs authorized configuration + device test |
| RC-4 | Memory Dashboard (view/edit/delete/export) functional | PRD §5 | DS-M1 (needs DS-I1 first) | UI implementation + browser |
| RC-5 | Journal draft recovery + history/search functional (rendered) | PRD §5 | DS-J1/DS-J2/DS-J3 | UI implementation + browser |
| RC-6 | Comfort Mode as first-class path functional (rendered) | PRD §5 | DS-R1 | UI implementation + browser |
| RC-7 | Adaptive check-in + returning-user behaviour functional (rendered) | PRD §5 | DS-R1 | UI implementation + browser |
| RC-8 | Security audit + Privacy audit passed; account deletion reconciled to full data inventory | PRD §5; Master SOT §5 | DS-P1 + a dedicated audit pass | Audit not yet run |
| RC-9 | AI content localization + attribution | R-PRD-31 / R-XC-09 | DS-AI1 | **LOCAL LOGIC CLOSED (Step 11)** — prompt locale/attribution contract + end-to-end id/en/ms plumbing + native Bahasa Melayu synthesis/practice output. Remaining: DS-AI1-themes (deep theme dicts) + rendered en/ms browser check (RC-2) |
| RC-10 | `lib/firebase/service.ts` `getUserProfile` swallows read errors to `null` (secondary path) | new-user gate Invariant E | DS-2C1 | **CLOSED (Step 11)** — read failure propagates; guard + state-machine "I" step updated; full emulator suite PASS=23/23 |
| RC-11 | Mood trend audited against no-streak contract | R-PRD-18 / R-XC-02 | DS-J4 | **LOCAL LOGIC CLOSED (Step 11)** — rendered streak UI removed **and** `progressCalculationEngine` score/growth-phase de-streaked (`activeDays30`, no consecutive term). Remaining: `/insights` rendered browser check (RC-2) |

Non-blocking reconciliation decisions pending Founder input: DS-M2 (dedicated Dashboard Daily
Note card y/n), DS-A2 (which large-cycle astro signals, if any, are ratified).

Out of Build 106 scope (V5 Non-Requirement — do not rebuild): golden-dataset validation for the
identity/calculation engines is a pre-existing separate track, not a Build 106 recovery item.

### 11.1 Step 11 progress (2026-09-02)

Two passes — see the matrix "Focused verification + owned-gap closure" section for detail.

- **RC-10 / DS-2C1 — CLOSED (code + emulator).** `firebaseService.getUserProfile` propagates
  a denied/unavailable read; `null` now means "document absent" only. Non-routing callers keep
  tolerance explicitly. Release state-machine suite corrected to the fixed contract and green
  (`passed=33 failed=0`).
- **RC-9 / DS-AI1 — LOCAL LOGIC CLOSED.** Daily-guidance prompt carries a locale-keyed
  `outputLanguageRule` (overrides the "(Bahasa Indonesia)" hints) + an `attributionRule`;
  id/en/ms flows end to end. Journal AI path already compliant. Native Bahasa Melayu added to
  `unifiedBlueprintSynthesis` (`mergeThemes`, 21 `humanizeNeed` clauses, `blueprintSummary`) and
  `adaptiveDailyPracticeGenerator` (all practice copy) via the new `lib/i18n/pickLocale.ts`;
  `localDailyGuidanceFallback` wrapper resolves `ms → id` (Bahasa Melayu/Indonesia mutual
  intelligibility — a **deliberate deviation from the D-V5-35 `ms → en` key-fallback chain for
  generated prose**, flagged for Founder ratification). Remainder: **DS-AI1-themes** (Indonesian-
  only theme-label dictionaries + full fallback ms) + rendered en/ms browser check (RC-2).
- **RC-11 / DS-J4 — LOCAL LOGIC CLOSED.** Rendered streak UI removed **and** the score /
  growth-phase logic de-streaked: `progressCalculationEngine.consistencyScore` now weights
  frequency 30% / active-days-in-last-30 40% / recent-7d 30% (no consecutive-day term);
  `determineJourneyPhase` gates on `activeDays30`; milestone `"7 Hari Bertumbuh"` →
  `"7 Hari Aktif"`; `streakDays` kept as a raw metric only. Behavioral guard: an unbroken run
  and the same active-day count with a gap now score identically. Remainder: `/insights`
  rendered browser check (RC-2).

Verification: `tsc` EXIT 0; no-emulator PASS=15/23; full Firestore/Auth emulator
**PASS=23 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`; no
regression across two passes). **Local `next dev` browser QA** (Founder-authorized ephemeral
`.next` + synthetic `.env.local`, both deleted; worktree clean): all 8 Step-11-touched routes
compile + serve HTTP 200 with no compile errors — the diffs are build-safe app-wide. Interactive
SPA rendering is not achievable without a real Firebase project (env limitation), so no
browser-evidence-class gap is marked `PASS`. No version bump / build artifact / deploy /
publish / production write.

### 11.2 Step 12 — genuine fresh-account acceptance + RC-2 rendered browser (2026-09-02)

`AUDIT → VERIFY → REPORT`; no product code changed. Founder ratified the narrative-prose
fallback (D-V5-36, commit `15428ba`) and authorised an environment "capable of real
hydration/auth flow", forbidding sample/audit users as proof.

**Environment.** `next dev` (Turbopack) with an **ephemeral** `.env.local`
(`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`, demo project `demo-build106-qa`) wired to the local
Firebase **Auth** (`:9099`) + **Firestore** (`:8080`) emulators. Ephemeral `.next`, `.env.local`,
debug logs **deleted afterward**; servers stopped; **worktree clean; no `next build`**.

**RC-1 / DS-GATE07 — ACCEPTED (emulator-hydration).** A brand-new email/password account
(`fresh-<epoch>@build106qa.test`, uid `hrudN1PA…`) was created via the Auth emulator REST
**seconds before** the run — no audit fixture, no `getMockProfile`, no precomputed blueprint.
Full lifecycle verified in a real hydrating browser client:
`sign-in → /setup → real birth data (1990-06-15, 08:30, Jakarta, geocode) → finalize →
**real blueprint generated** (Life Path 4 "The Builder", Sun Gemini, HD Projector; numerology +
HD + Destiny Matrix present) → Firestore persisted rules-enforced (profile setupCompleted:true,
blueprintStatus:"ready") → /dashboard rendered (Soul Reflection + Core Identity + Astro)`.
**Dashboard hard-reload → stays on /dashboard** (Invariant G). **Logout → /login; re-login
(cold mirror) → /dashboard** (cold-mirror fix). Production / Play-device run still ideal.

**RC-2 — PARTIAL.**
- **DS-PR1 browser part DONE** — `/premium-bhumi` renders "Langganan bulanan Rp25.000/bulan…";
  `/upgrade` renders `bhumi_premium_monthly` / base plan `monthly` / `Harga` = "Google Play"
  neutral fallback; **zero `Rp50.000`**.
- **R-34** — the `Indonesia / English / Melayu` switcher renders on `/` and each click persists
  `bhumiLanguage` to localStorage; the fresh user's profile carried `language`. Visible-copy
  round-trip on the welcome page itself is still **DS-I1** (`useTranslation()` migration).
- **DS-E1 (Schumann) / DS-J4 (`/insights` rendered) / DS-AI1 (rendered en/ms)** — **not reached**:
  hard-navigation to these gated feature pages with a cold AuthContext bounces to `/setup`
  (**DS-2C3**), and the in-app browser cannot drive Next App-Router deep SPA nav / screenshots.

**NEW — RC-12 / DS-2C3.** `app/setup/page.tsx` redirects to `/dashboard` only after a successful
`finalizeSetup` — it has **no mount guard** for an already-`setupCompleted` user. A genuine
complete user redirected to `/setup` by a gated-feature-page cold hard-nav is **stranded there**
("Profile: pending", no self-correction). Residual instance of the Master-SOT-§4.1 trap on a
narrower trigger; the onboarding gate itself is verified working. Fix + regression test are
DS-2C3, scheduled before the DS-E1 / DS-J4 / DS-AI1 rendered browser pass.

Evidence discipline: no production read/write, no build artifact, no deploy/publish/push, no
version bump. The acceptance is an **emulator-hydration browser run** — stronger than every
prior GATE_07 evidence class, still not a production/device run.

RC-3..RC-8 unchanged — FCM infra, Memory Dashboard, journal draft/history, Comfort Mode,
adaptive check-in, security/privacy audit.

---

## 12. Step 10 conclusion

- **All 46 canonical requirements R-PRD-01..46 have an accepted reconciled status. Zero
  `UNKNOWN`.**
- **Zero requirements are counted `PASS` on the strength of a contract or source file alone.**
  Every requirement needing rendered/browser/device acceptance is held at contract/unit level
  with a named owner.
- **Every partial/deferred item has an owner and a verification step.** Step 10 created
  `DS-J4` (R-PRD-18) and `DS-AI1` (R-PRD-31) to close the two un-owned deferrals it found.
- **Historical recovery (31: 4 preserved + 27 CP-036) is distinguished from new
  implementation (13 + 2 hybrids)** with per-file provenance.
- **No Step 1–9 work regressed** at the reconciled HEAD: `tsc` EXIT 0, no-emulator
  PASS=12/20, full Firestore/Auth emulator PASS=20/20 `RELEASE_TESTS_PASS`.
- **Release-critical gaps are enumerated (RC-1..RC-11), each owned.** The gate stays
  **CLOSED**; the dominant blocker remains the external genuine-new-user acceptance (RC-1) and
  the browser/device QA class (RC-2), both requiring resources not available in Steps 1–10.

`BUILD_106_ARTIFACT = DOES_NOT_EXIST`
`BUILD_106_RELEASE_GATE = CLOSED`
`NEXT_SAFE_ACTION = Step 11 — focused unit/emulator/browser/device verification` (begin with the
small owned fixes DS-2C1, DS-AI1, DS-J4, then the browser-surface sub-steps when a local Next
runtime is authorized).
