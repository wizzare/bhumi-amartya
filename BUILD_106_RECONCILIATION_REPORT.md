# BHUMI AMARTYA — BUILD 106 FULL RECONCILIATION REPORT (R-PRD-01..46)

Status: CANONICAL — Step 10 deliverable; extended by §11.1 (Step 11), §11.2 (Step 12), §11.3 (Step 12 cont.), §11.4 (final pre-release gap closure — `RELEASE_CRITICAL_GAPS_OPEN = 0`), §11.5 (Step 13 — version bump + local artifact)
Primary authority: `BUILD_106_MASTER_SOT.md` §7.10 / §7.13 / §10
Execution ledger: `BUILD_106_RECOVERY_MATRIX.md` · Step 13 record: `BUILD_106_RELEASE_PROVENANCE.md`
Date: 2026-09-02; last updated 2026-09-03 (§11.5)
Branch: `recovery/build106-product-continuity`
Implementation HEAD reconciled: `1b4e41c` (end of Step 9); §11.3/§11.4 at the Step 12 (cont.) + final-gap-closure commits; §11.5 at the Step 13 version-bump commit `0b55f99`

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
| **DS-J4** | R-PRD-18 (mood trend, no-streak) | journaling/insights consumer work + browser | **PARTIAL (Step 12 cont.)** — `progressCalculationEngine` (Step 11) **and** `lib/insights/createInsightProgress.ts` (the engine `/insights` renders, Step 12 cont.) de-streaked: `consistencyScore` = frequency + active-days-in-30 + recent-7d, no consecutive term; stage on `activeDays30`; milestone "7 Hari Aktif"; `streakDays` raw-metric only. Guard 30. Browser: `/insights` reachable, no bounce. Remainder (not release-critical): streak section rendered with seeded data |
| DS-I1 | R-PRD-29..34 full UI localization | localization component-migration sprint | OPEN |
| DS-I2 | R-PRD-29/30 extended (`v5-i18n.test.ts`) | Step 7 | **DONE** (28/28, in manifest) |
| **DS-AI1** | R-PRD-31 (AI in user locale + attribution) | AI-output reconciliation sub-step | **PARTIAL (Step 12 cont.)** — journal AI locked; daily-guidance prompt locale/attribution contract + id/en/ms plumbing; native Bahasa Melayu synthesis/practice; Step 12 cont. adopted `mirrorDailyReflection` id/en/ms `MIRROR_COPY` + locale daypart, and `unifiedBlueprintSynthesis`/`localDailyGuidanceFallback` now propagate `language`. Guard 38. **Browser: Soul Reflection wrapper RENDERED PASS en/ms** (after the BCP47 `DashboardClient` fix). Remainder: **DS-AI1-themes** body prose (not release-critical per D-V5-36) |
| **DS-AI1-themes** | R-PRD-31 deterministic-fallback completeness | i18n follow-up sprint (post browser pass) | **OPEN (new — Step 11)** — Indonesian-only theme-label dictionaries + full `localDailyGuidanceFallback` ms (~70 sites, currently `ms → id`). Not release-critical on its own — primary AI path renders true ms |
| DS-2C1 | new-user gate Invariant E secondary path (`lib/firebase/service.ts` read-error swallow) | auth-hardening follow-up | **DONE (Step 11)** — read failure propagates (null = absent doc only); guard (10) + state-machine "I" step updated; emulator PASS=23/23 |
| DS-2C2 | GATE_07, R-PRD-33/34 browser | verification | **PARTIAL (Step 12)** — setup→dashboard, dashboard hard-reload, logout→login exercised in a real emulator-hydration browser run. Remaining: scripted Playwright regression + locale visible-copy round-trip (needs DS-I1) |
| DS-GATE07 | GATE_07_GENUINE_NEW_USER | verification Step 12 | **ACCEPTED (emulator-hydration, Step 12)** — brand-new emulator account, real hydration/auth/blueprint, rules-enforced Firestore, dashboard rendered + reload + logout/login all correct. Production / Play-device run still ideal |
| DS-2C3 | GATE_07 residual trap (feature-page trigger) | auth-hardening follow-up | **CLOSED (Step 12 cont., 2026-09-03)** — `isCompletedProfileForUser` helper; `app/setup/page.tsx` mount guard → `/dashboard` for a completed user (retry card on read failure); `resolveActiveProfile` authoritative cold-context re-read + `isUnavailable` (fail-closed); `AccessGuard` + `InsightPageClient` reconcile before gating (`InsightPageClient` drops the unscoped `bhumiUserProfile` read). Guard `build106-ds2c3-cold-nav` (11) in manifest. Emulator PASS=24/24; browser `/setup` + `/insights` hard-nav verified |
| DS-M1 | R-PRD-23 (Memory Dashboard UI), R-PRD-21 browser | Memory-Dashboard UI sub-step (DS-I1 first) | OPEN |
| DS-M2 | R-PRD-03 Dashboard surfacing, Master SOT §5 | Founder reconciliation decision, then Daily Rhythm/Dashboard step | OPEN (decision) |
| DS-M3 | R-PRD-28 | Daily Rhythm/Memory consumer work | PARTIAL (decay + eligibility done; synthesis/persistence/UI open) |
| DS-DC1 | R-PRD-03 astro source typing | Step 6 | **DONE** |
| DS-A1 | R-PRD-36 consumer wiring | astro-integration sub-step | OPEN |
| DS-A2 | R-PRD-35 large-cycle scope | Founder decision, then wire | OPEN (decision) |
| DS-E1 | R-PRD-45 browser, R-PRD-44 rendered unavailable | verification | **PARTIAL (Step 12 cont.)** — emulator-hydration browser: `/dashboard/environment` reachable, Schumann "Data belum tersedia" with **no fabricated "Stabil"** ⇒ R-PRD-44 honest-unavailable rendered PASS. Remainder: fully-populated 3-layer render + provenance labels (needs mocked geolocation + live Schumann source) |
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

**Final pre-release gap closure (2026-09-03, §11.4): `RELEASE_CRITICAL_GAPS_OPEN = 0`.**
RC-3..RC-7 are dispositioned **ACCEPTED_DEFERRED_NON_BLOCKING**; RC-8 is **CLOSED**
(account-deletion inventory defect fixed + verified; security/privacy audit run clean);
F-2 is fixed + tested. No `RELEASE_BLOCKER` remains. The rows below carry the dispositioned
status; see §11.4 for the audit.

| # | Gap | Master SOT / PRD gate | Owner | Blocking type |
|---|---|---|---|---|
| RC-1 | Genuine fresh non-sample new-user browser acceptance | Master SOT §8, §10.3; PRD §5 | DS-GATE07 | **ACCEPTED at emulator-hydration level (Step 12)** — brand-new emulator account, full lifecycle to a rendered `/dashboard` (real blueprint, rules-enforced Firestore), dashboard hard-reload + logout/login all correct. A production / Play-device run is still the ideal final proof, not a blocker |
| RC-2 | Browser/device QA for affected primary surfaces (Daily Rhythm, Schumann, Memory Dashboard, Premium, locale switcher, Astro Today, onboarding) | Master SOT §8 | DS-R1, DS-E1, DS-M1, DS-PR1, DS-2C2, DS-A1 | **ADVANCED (Step 12 cont.)** — DS-2C3 unblocked. Verified in the emulator-hydration browser run: onboarding (setup→dashboard, reload, logout/login); Premium `/premium-bhumi` + `/upgrade` (DS-PR1 browser part); locale switcher visibility/persistence (R-34); `/setup` hard-nav as a completed user → `/dashboard`; `/insights` hard-nav → no bounce; `/dashboard/environment` Schumann "Data belum tersedia" with **no fabricated "Stabil"** (R-PRD-44); dashboard Soul Reflection rendered native en ("Warm hugs from Bhumi.") + ms ("Pelukan hangat daripada Bhumi."). **Residual (not release-critical):** DS-AI1-themes body prose in the LLM-down local fallback; DS-J4 streak section rendered *with seeded data*; DS-M1 Memory Dashboard, DS-R1 Daily Rhythm consumer UI (still un-built) |
| RC-12 | `/setup` mount guard for an already-complete user | Master SOT §4.1 (residual trap, narrower trigger) | DS-2C3 | **CLOSED (Step 12 cont., 2026-09-03)** — adopted parallel-session work under Founder OPTION A: `isCompletedProfileForUser` helper; `app/setup/page.tsx` mount guard redirects a completed user to `/dashboard` and shows a retry card on read failure; `resolveActiveProfile` does an authoritative cold-context re-read and returns `isUnavailable` (fail-closed) instead of "missing"; `AccessGuard` + `InsightPageClient` reconcile before gating. Guard `build106-ds2c3-cold-nav.test.ts` (11) + `build106-authoritative-profile-gate` +4. Full emulator suite PASS=24/24; browser: `/setup` completed-user hard-nav → `/dashboard`, `/insights` hard-nav → no bounce |
| RC-3 | FCM infrastructure live (backend sender, VAPID round-trip, native remote push, device delivery) | PRD §5 "FCM infrastructure live"; Master SOT §5 | DS-N1 | **ACCEPTED_DEFERRED_NON_BLOCKING (§11.4)** — Build 105 had no notification system; Build 106 recovered id/en/ms copy + opt-in default + quiet hours + suppression + real-token-only registration + fail-closed persistence + SW + Android local scheduling (Step-8 suite, in manifest). Remote push delivery needs Founder-authorized external config (VAPID, backend deploy, Play) + device QA — outside this worktree. Net improvement over Build 105; no regression |
| RC-4 | Memory Dashboard (view/edit/delete/export) functional | PRD §5 | DS-M1 (needs DS-I1 first) | **ACCEPTED_DEFERRED_NON_BLOCKING (§11.4)** — verified: `memoryCandidateRepository.upsertFromEntry` has **zero callers** in the runtime, so `journalMemoryCandidates/*` stays empty → no user memory to manage, no privacy exposure. Dashboard UI + the extraction call site (DS-J2) land together post-Build-106. **Re-open if `upsertFromEntry` is wired before DS-M1 ships** |
| RC-5 | Journal draft recovery + history/search functional (rendered) | PRD §5 | DS-J1/DS-J2/DS-J3 | **ACCEPTED_DEFERRED_NON_BLOCKING (§11.4)** — verified: `app/journal/page.tsx` + `app/innerwork/journaling/page.tsx` are live and save (local + `journalRepository.saveEntry`) + load history at the Build 105 baseline. Build 106 recovered the full V5 data contracts (5 modes, CBT 8-field, per-mode draft, history/search/export functions). The V5 UI relocation is deferred; journaling is not broken |
| RC-6 | Comfort Mode as first-class path functional (rendered) | PRD §5 | DS-R1 | **ACCEPTED_DEFERRED_NON_BLOCKING (§11.4)** — R-PRD-06 (Do Nothing valid) PRESERVED_VERIFIED at Build 105; R-PRD-14 (Comfort as first-class path) NEW_CONTRACT_VERIFIED (`lib/dailyRhythm/runtime.ts` + Step-8 suite). The rendered Comfort interaction state is DS-R1 consumer UI; Build 105 baseline dashboard + Do-Nothing path intact — no regression |
| RC-7 | Adaptive check-in + returning-user behaviour functional (rendered) | PRD §5 | DS-R1 | **ACCEPTED_DEFERRED_NON_BLOCKING (§11.4)** — R-PRD-01/02/07/09 all NEW_CONTRACT_VERIFIED (`resolveOrientation`, 7→3 need options, evening-reflection window, no-guilt return copy; Step-8 suite). Rendered adaptive orientation/need-discovery/evening-reflection UI is DS-R1; Build 105 baseline check-in intact — no regression |
| RC-8 | Security audit + Privacy audit passed; account deletion reconciled to full data inventory | PRD §5; Master SOT §5 | DS-P1 + a dedicated audit pass | **CLOSED (§11.4, 2026-09-03)** — audit run: auth PII-logging clean; `firestore.rules` unchanged from Build 105 (owner-isolation + `journalMemoryCandidates`/`fcmTokens` contracts pass in the release suite); per-entry privacy enforcement fail-closed (Step-8 + Persistence E2E). **Defect found + fixed:** `deleteUserDataCompletely` collection-name drift + 6 omitted per-user collections → sensitive wellness/emotional/journal-derived data survived account deletion. Fixed in `lib/firebase/service.ts`; regression test `build106-final-pre-release-gap-closure` (89 assertions, repo-vs-delete cross-check) in the manifest; emulator suite PASS=25/25. Residual DS-P1 entry-controls UI + external pen-test → ACCEPTED_DEFERRED_NON_BLOCKING |
| RC-9 | AI content localization + attribution | R-PRD-31 / R-XC-09 | DS-AI1 | **LOCAL LOGIC CLOSED + WRAPPER RENDERED (Step 12 cont.)** — Step 11 prompt locale/attribution contract + id/en/ms plumbing + native Bahasa Melayu synthesis/practice; Step 12 cont. adopted `mirrorDailyReflection` id/en/ms `MIRROR_COPY` + locale daypart, and `unifiedBlueprintSynthesis`/`localDailyGuidanceFallback` now propagate `language` (was collapsing to id). Emulator-hydration browser: Soul Reflection wrapper renders native en/ms, `crashed:false` (after the BCP47 `DashboardClient` fix). Remaining: **DS-AI1-themes** body-prose fragments in the LLM-down local fallback — per **D-V5-36** `ms → id` prose ratified, **not release-critical** |
| RC-10 | `lib/firebase/service.ts` `getUserProfile` swallows read errors to `null` (secondary path) | new-user gate Invariant E | DS-2C1 | **CLOSED (Step 11)** — read failure propagates; guard + state-machine "I" step updated; full emulator suite PASS=23/23 |
| RC-11 | Mood trend audited against no-streak contract | R-PRD-18 / R-XC-02 | DS-J4 | **LOCAL LOGIC CLOSED (Step 12 cont.)** — Step 11 de-streaked `progressCalculationEngine`; Step 12 cont. adopted the matching de-streak in `lib/insights/createInsightProgress.ts` (the engine `/insights` renders): `consistencyScore` = frequency + active-days-in-30 + recent-7d (no consecutive term), stage on `activeDays30`, milestone "7 Hari Aktif", `streakDays` raw-metric only. Guard `build106-ds-j4-mood-trend-no-streak` 30 assertions; browser: `/insights` reachable, no bounce. Remaining (not release-critical): streak section rendered *with seeded activity data* |

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

**Handover (2026-09-02).** Primary agent → **CODEX** after Step 12. Superseded by §11.3.

### 11.3 Step 12 (cont.) — DS-2C3 closure + RC-2 rendered re-verification (2026-09-03)

`AUDIT → ANALYZE → FIX → VERIFY → REPORT`. Founder **OPTION A (ADOPT)**.

**In-flight work adopted.** At HEAD `0b8e8a4` the worktree carried an uncommitted parallel-session
change (10 tracked source files, 6 test files incl. a new `build106-ds2c3-cold-nav.test.ts`,
ephemeral `.playwright-cli/` / `.env.local`) with no report. Per the Founder directive it was
**not** discarded/stashed/reset — audited hunk-by-hunk against canonical Build 106, verified, and
adopted. Provenance: **parallel Build 106 recovery session (Codex/Antigravity), unreported.**
Commits: `c9f3d04` (source, +417 −86 / 10 files), `1808852` (tests, +198 −7 / 6 files),
docs commit (this update + matrix + handoff + `.gitignore`).

**RC-12 / DS-2C3 — CLOSED (code + full emulator suite + emulator-hydration browser).**
`lib/auth/authoritativeProfileGate.ts` `isCompletedProfileForUser(uid, profile)`;
`lib/auth/resolveActiveProfile.ts` `isUnavailable` + authoritative `refreshUserProfile()` re-read
on a cold/stale context (read failure ⇒ fail-closed `isUnavailable`, not "missing"); de-identified
`[USER DATA LOAD]` log; `app/setup/page.tsx` mount guard (`checking/ready/redirecting/unavailable`
— completed owned profile ⇒ `router.replace("/dashboard")`, read failure ⇒ "Coba Lagi" retry, not
the birth-data form); `components/auth/AccessGuard.tsx` reconciles the active profile before the
entitlement check; `components/insights/InsightPageClient.tsx` cold-nav uses `resolveActiveProfile`
+ scoped `storageProvider.getUserBlueprint()` and drops the forbidden unscoped `bhumiUserProfile`
localStorage read.

**BUILD_106_REGRESSION found by the RC-2 rendered run + fixed (Founder OPTION A item 4).**
`components/dashboard/DashboardClient.tsx` read `translations[profile.language]` directly. After
the Step-3 switcher persists a normalized BCP47 tag (`"en-US"` / `"ms-MY"`) to
`users/{uid}.language`, `translations["en-US"]` is `undefined` and the dashboard render throws
`Cannot read properties of undefined (reading 'dashboard')` — a white-screen for every en/ms
switcher user. Fix: `getDictionaryKey(profile?.language ?? "id")`. Latent since Step 3, not in the
adopted diff. Regression cover: `build106-ds-ai1-ai-locale-attribution.test.ts` section 5.

**RC-2 rendered re-verification (emulator-hydration harness, same as §11.2):**

| Item | Result |
|---|---|
| DS-2C3 — `/setup` hard-nav as a completed user | **RENDERED PASS** — redirects to `/dashboard`; no strand |
| DS-2C3 — `/insights` hard-nav (cold AuthContext) | **RENDERED PASS** — no bounce to `/setup` |
| DS-E1 / R-PRD-44 — `/dashboard/environment` | **RENDERED PASS (honest-unavailable)** — Schumann "Data belum tersedia", **no fabricated "Stabil"**. Full 3-layer render still needs geolocation + a live Schumann source |
| DS-AI1 / R-PRD-31 — Soul Reflection en | **RENDERED PASS (wrapper)** — "Good morning" / "Hello, RC2 QA. How are you this morning?" / "Warm hugs from Bhumi.", `crashed:false` |
| DS-AI1 / R-PRD-31 — Soul Reflection ms | **RENDERED PASS (wrapper)** — "Selamat pagi" / "Hai, RC2 QA. Apa khabar pada pagi ini?" / "Pelukan hangat daripada Bhumi.", `crashed:false` |
| DS-AI1-themes — reflection body prose | **OPEN residual** — Indonesian theme-label fragments in the LLM-down local fallback; per D-V5-36 `ms → id` prose ratified ⇒ NOT release-critical |
| DS-J4 / R-PRD-18 — `/insights` | **PARTIAL** — reachable + de-streak unit-verified; streak section with data needs seeded activity (deferred) |

**Verification totals (final worktree = adopted + BCP47 fix + BCP47 guard test):**
`npx tsc --noEmit` **EXIT 0**; no-emulator runner PASS=16/24; **full Firestore/Auth emulator
release suite PASS=24 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine `passed=33 failed=0`);
DS suites EXIT 0 — `ds2c3-cold-nav` 11, `ds-ai1` 38, `ds-j4` 30, `authoritative-profile-gate` 27,
`mirror-daily-reflection-contract` 32, `ds2c1` 10.

**Evidence discipline:** no production read/write, no build artifact, no deploy/publish/push, no
version bump. Ephemeral `.env.local` / `.next` / `.playwright-cli/` / debug logs removed; worktree
clean apart from the three coherent commits.

**Handover (2026-09-03).** Primary agent → **ANTIGRAVITY**. `NEXT_SAFE_ACTION = audit remaining
RC-3..RC-8 + the DS register → Founder approval for Step 13 (version bump / Build 106 artifact)`.
Branch `recovery/build106-product-continuity`; HEAD = resolve with `git rev-parse HEAD` (the Step
12 cont. docs commit is newest). RC-1 = ACCEPTED (emulator-hydration); RC-2 = ADVANCED; RC-9 /
RC-11 = local logic closed (RC-9 wrapper rendered); **RC-10 / RC-12 = CLOSED**; RC-3..RC-8
unchanged; DS-AI1-themes = open residual (not release-critical per D-V5-36). No product-code
change beyond the audited adoption + the one authorized regression fix; no version bump, build,
deploy, publish, push, or production write.

### 11.4 Final pre-release gap closure (2026-09-03) — `RELEASE_CRITICAL_GAPS_OPEN = 0`

`AUDIT → ANALYZE → FIX only where required → VERIFY → REPORT`. Founder-directed disposition of
RC-3..RC-8, the F-2 Daily Guidance ultimate-fallback finding, and every remaining `DS-*`.
Build 106 is **product-continuity recovery**, not a feature-complete release: an item is a
`RELEASE_BLOCKER` only if it is a real defect against canonical Build 106, a
correctness/security/privacy issue, or a regression that should already work. Un-built canonical
V5 surfaces that Build 105 also never shipped are **not** regressions.

**RC-3 — FCM infrastructure live → ACCEPTED_DEFERRED_NON_BLOCKING.** Build 105 had no
notification system (Master SOT §5). Build 106 recovered the client contract: id/en/ms copy,
opt-in default, quiet hours, category suppression, **real-token-only** registration (no fake
tokens), **fail-closed** persistence, service worker, **Android local scheduling** — Step-8
contract suite passes and is in the release manifest. The missing piece — a trusted backend FCM
sender/scheduler, VAPID web round-trip, native remote-push plugin, per-category UI, on-device
delivery proof — needs Founder-authorized external configuration (VAPID keys, backend deploy,
Play Console) and a physical device, all outside this worktree's authorization. Net improvement
over Build 105; no regression.

**RC-4 — Memory Dashboard functional → ACCEPTED_DEFERRED_NON_BLOCKING.** Build 105: missing
(Master SOT §5). Build 106 recovered the full CRUD state machine
(`confirm`/`correct`/`dismiss`/`deleteCandidate`) + pattern aggregator +
`getActiveCandidates → memoryCompiler` wiring (`build106-memory-pipeline`). **Verified:**
`memoryCandidateRepository.upsertFromEntry` (the only write path) has **zero callers** in
`app/`, `lib/`, `components/` — memory-candidate extraction is not wired into any live save
flow, so `journalMemoryCandidates/*` stays empty. There is no user memory to view/edit/delete
and no privacy exposure. The dashboard UI (`app/journey/memory/page.tsx`, needs DS-I1) and the
extraction call site (DS-J2) land together post-Build-106. **Re-open guard:** if a future change
wires `upsertFromEntry` before DS-M1 ships, RC-4 becomes release-critical again.

**RC-5 — Journal draft recovery + history/search functional → ACCEPTED_DEFERRED_NON_BLOCKING.**
**Verified:** `app/journal/page.tsx` and `app/innerwork/journaling/page.tsx` are live client
components that save (local `saveLocalJournalEntry` + cloud `journalRepository.saveEntry`) and
load history (`loadLocalJournalEntries`) at the Build 105 baseline — journaling is functional.
Build 106 recovered the canonical V5 data contracts: `JournalType` discriminator, 5 modes, CBT
8-field payload, per-mode draft autosave/conflict, multi-entry history +
`getEntriesByType`/`getJournalHistoryGroupedByWeek`, crisis scan + AI suppression
(`build106-journal-contracts` + `v5-03-journaling-acceptance`). The V5 UI relocation
(`app/wellness/journaling/page.tsx` + redirects + 30 s autosave wiring + rendered
history/search/filter/export) is DS-J1/J2/J3, deferred. Journaling is not broken.

**RC-6 — Comfort Mode as first-class path → ACCEPTED_DEFERRED_NON_BLOCKING.** R-PRD-06 ("Do
Nothing is a valid completion") is `PRESERVED_VERIFIED` — Build 105 already correct
(`availablePaths()` contains `do-nothing`, no mandatory completion). R-PRD-14 ("Comfort Mode as
first-class path") is `NEW_CONTRACT_VERIFIED` — `lib/dailyRhythm/runtime.ts`
(tired/overwhelmed/unknown → Comfort; notification policy suppresses non-return categories),
Step-8 suite (63 assertions). The rendered Comfort interaction state is DS-R1 consumer UI; the
Build 105 baseline dashboard + Do-Nothing path are intact — no regression.

**RC-7 — Adaptive check-in + returning-user behaviour → ACCEPTED_DEFERRED_NON_BLOCKING.**
R-PRD-01/02/07/09 are all `NEW_CONTRACT_VERIFIED` (`resolveOrientation`, `getNeedOptions` 7→3
for familiar users, evening-reflection 18:00–21:59-local-and-only-after-journaling, no-guilt
return-window copy; Step-8 suite). The rendered adaptive orientation / need-discovery /
evening-reflection consumer UI is DS-R1, deferred. Build 105 baseline check-in is intact — no
regression.

**RC-8 — Security + Privacy audit + account deletion → CLOSED.** Audit executed this pass:

- **Auth PII logging** — `grep` of `lib/auth/`, `context/AuthContext.tsx`, `app/login/` for raw
  `email`/`uid` in `console.*` → clean. Step-8 safe diagnostics + the Step 12 (cont.)
  `[USER DATA LOAD]` de-identification hold.
- **Firestore rules** — `git diff 8fc3c23..HEAD -- firestore.rules` = empty. Owner-isolation +
  `journalMemoryCandidates` / `fcmTokens` / `telemetry_events` contracts are covered by the
  "Firestore owner isolation + production-preserved blocks" release suite (PASS) and
  "Persistence E2E … cross-user denial" (PASS).
- **Per-entry privacy (R-PRD-20)** — `lib/journal/privacy.ts` + repository/extraction enforcement
  (`localOnly` rejected by the cloud repo; `excludeFromMemory` blocked before extraction),
  Step-8 suite + Persistence E2E. The entry-level toggle **UI** is DS-P1 (deferred; enforcement
  is already fail-closed).
- **Account deletion — DEFECT FOUND + FIXED.** `firebaseService.deleteUserDataCompletely` used
  drifted collection names (`meditationEntries`, `audioHealingEntries`, `healingMemory`,
  `journeyData`, `weeklyReports`) and omitted `activities`, `dailyStates`,
  `journalMemoryCandidates`, `wellnessAssessments`, `wellnessMappings`, `progressData` — so a
  "permanent" account deletion left daily check-in states (emotional words / moods / wellness
  snapshots), wellness assessments + mappings, healing progress, journey daily records, weekly
  reflections, physical activities, journal-derived memory candidates, and progress data in
  Firestore. Byte-identical to Build 105 (pre-existing), but a privacy-correctness defect and a
  named Master SOT §5 Build 106 reconciliation item. **Fixed** (`lib/firebase/service.ts`): a
  generic `deleteNestedEntries(parent, sub)` deleter now covers the canonical per-user schema
  (nested subcollections for meditations / audioHealing / activities / dailyStates /
  journeyDailyRecords / journalMemoryCandidates; `healingProgress` / `wellnessMappings` /
  `progressData` direct docs; `weeklyReflections` / `wellnessAssessments` uid-scoped), with the
  legacy aliases retained as labelled no-ops. The local-storage side is already covered by its
  `key.includes(uid)` prefix sweep. Regression test
  `tests/unit/build106-final-pre-release-gap-closure.test.ts` (89 assertions, incl. a
  repo-collection-literal-vs-deletion-coverage cross-check) — in the manifest.

Remaining RC-8 residual — the DS-P1 entry-controls **UI** and a formal external penetration
test — is ACCEPTED_DEFERRED_NON_BLOCKING (enforcement is fail-closed; an external pen-test is
outside this worktree).

**F-2 — Daily Guidance malformed ultimate fallback → RESOLVED.** Reachability **confirmed**:
`generateLocalDailyGuidance`'s outer catch **re-throws**, so when every AI provider fails and a
deterministic narrative sub-generator throws, `runProviderCascade` returns `{ ok:false }` and
`dailyGuidanceEngine.generateLanguageFace` routes to `generateFallbackFace`, which persisted
`aiInsight: "Hari ini tentang ."` plus empty `soulReflectionText` / `dailyNoteText` /
`journalPrompt` / `meditationSuggestion` — a record that passes `isCanonicalDailyGuidanceRecord`
and renders. **Minimum correctness fix** (`lib/engines/dailyGuidanceEngine.ts`): a small id/en
fallback copy block (`ms → id` per D-V5-36) fills those five fields with coherent, punctuation-
terminated sentences; the malformed literal is removed. No architecture change — this is the
deepest fallback (AI stack + deterministic generator both unavailable). Present verbatim in
Build 105 → not a Build 106 regression, but a correctness defect → fixed per Founder
instruction. Regression test: 89 assertions (behavioural id/en/ms + static reachability guards).

**Every remaining `DS-*` reconciled:**

| DS-* | Class | Note |
|---|---|---|
| DS-DC1, DS-I2, DS-2C1, DS-2C3 | **CLOSED** | done in Steps 6/7/11/12 cont. |
| **DS-P1** (release-critical portion) | **CLOSED** | account-deletion inventory fixed + verified this pass. Entry-controls UI residual → deferred. |
| DS-J1, DS-J2, DS-J3 | ACCEPTED_DEFERRED_NON_BLOCKING | V5 journaling UI relocation; journaling functional at Build 105 baseline (verified). |
| DS-J4 | ACCEPTED_DEFERRED_NON_BLOCKING | both engines de-streaked; `/insights` no-bounce verified; residual = streak section rendered with seeded data. |
| DS-I1 | ACCEPTED_DEFERRED_NON_BLOCKING | `useTranslation()` component migration; id/en/ms foundation + fallback + persistence + switcher verified (R-29..R-34 reconciled). |
| DS-AI1 | ACCEPTED_DEFERRED_NON_BLOCKING | local logic closed + mirror wrapper rendered en/ms; residual DS-AI1-themes body prose. |
| DS-AI1-themes | ACCEPTED_DEFERRED_NON_BLOCKING | ratified `ms → id` narrative prose under D-V5-36. |
| DS-2C2 | ACCEPTED_DEFERRED_NON_BLOCKING | onboarding + cold hard-nav flows exercised in the emulator-hydration browser; residual = scripted Playwright + locale visible-copy round-trip (needs DS-I1). |
| DS-M1 | ACCEPTED_DEFERRED_NON_BLOCKING | Memory Dashboard UI; extraction unwired → no data to manage, no exposure (verified). Re-open if `upsertFromEntry` is wired first. |
| DS-M2, DS-A2 | ACCEPTED_DEFERRED_NON_BLOCKING | Founder decisions (dedicated Daily Note card; ratified large-cycle astro signals). |
| DS-M3 | ACCEPTED_DEFERRED_NON_BLOCKING | weekly/monthly reflection synthesis/persistence/UI; decay + eligibility done; opt-in feature, never shipped-then-broken. |
| DS-A1 | ACCEPTED_DEFERRED_NON_BLOCKING | R-36 astro consumer wiring; adapters recovered + typed; astro renders (`build106-astro-regressions`). |
| DS-E1 | ACCEPTED_DEFERRED_NON_BLOCKING | `/dashboard/environment` honest-unavailable rendered PASS (no fabricated "Stabil", R-PRD-44); residual = fully-populated 3-layer render (needs geolocation + live Schumann source). |
| DS-R1 | ACCEPTED_DEFERRED_NON_BLOCKING | Daily Rhythm consumer UI; all contracts NEW_CONTRACT_VERIFIED (Step-8 suite); Build 105 baseline dashboard intact. |
| DS-N1 | ACCEPTED_DEFERRED_NON_BLOCKING | remote FCM delivery infra; external config + device; local scheduling works. |
| DS-PR1 | ACCEPTED_DEFERRED_NON_BLOCKING | `/premium-bhumi` Rp25.000 + `/upgrade` neutral rendered; residual = real Play `formattedPrice` on an installed build (device / Play sandbox only). |
| DS-GATE07 | ACCEPTED_DEFERRED_NON_BLOCKING | ACCEPTED at emulator-hydration (Step 12, Founder-accepted); production / Play-device run is the ideal final proof, not a blocker. |

**Verification (final worktree):** `npx tsc --noEmit` **EXIT 0**; full Firestore/Auth emulator
release suite **PASS=25 FAIL=0 SKIPPED=0** `RELEASE_TESTS_PASS` (state-machine
`passed=33 failed=0`); `build106-final-pre-release-gap-closure` 89 assertions EXIT 0.

**`RELEASE_CRITICAL_GAPS_OPEN = 0`.** No `RELEASE_BLOCKER` remains. Step 13 (version bump /
Build 106 artifact) may begin on **Founder approval**. No F-1 / F-3 / F-4 / F-5 / F-6 / F-7 / F-8
work was done — those remain the post-Build-106 Daily Guidance roadmap (Step 12.5 audit §6); no
new evidence proved any of them a release-critical defect.

### 11.5 Step 13 — version bump + local release artifact (2026-09-03)

Founder-approved. Canonical record: **`BUILD_106_RELEASE_PROVENANCE.md`**.

- **Version bump** (commit `0b55f99`): versionCode **106**, versionName **5.0.6**, RELEASE_NAME
  "BHUMI AMARTYA V5 BUILD 106" — `android/app/build.gradle` + `lib/config/buildInfo.ts` +
  `tests/unit/version-reconciliation.test.ts` (20/20 PASS).
- **Local release artifact:** `bhumi-amartya-v5.0.6-build106-release-unsigned.aab` — Android App
  Bundle, **unsigned** (release variant; no local keystore) — 27,003,050 bytes — sha256
  `9a67aace816dfa0ea7a84d4ed9f38e6e01148205810833676410a0e894af9977`.
- **Build/verify:** `next build` EXIT 0; release security guard 0 violations; `cap sync` OK;
  `gradlew :app:bundleRelease` packaged the AAB then failed only at `signReleaseBundle` (no
  keystore — environment/credential limitation, **not** a Build 106 defect); `tsc` EXIT 0; full
  emulator release suite PASS=25/25; AAB zip integrity OK; packaged manifest carries
  `com.bhumiamartya.app` / 106 / 5.0.6 / minSdk 24 / targetSdk 36, no `.qa`, no `debuggable`; no
  new permissions vs Build 105; no `firestore.rules` / backend change to deploy.
- **Smoke test:** device install not locally possible (no keystore; cannot touch signing /
  `google-services.json`); static/structural smoke test performed — all pass.
- **Marker:** `BUILD_106_RECOVERY_RECONCILED_AND_RELEASE_READY` — **pending production signing +
  Play upload on the authorized release machine.** No deploy / publish / Play upload / production
  write.

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
