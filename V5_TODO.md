# V5 Master TODO

**Status:** Canonical
**Related:** [V5_IMPLEMENTATION_ROADMAP.md](V5_IMPLEMENTATION_ROADMAP.md), [V5_PRD.md](V5_PRD.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

> **Build 100 Audit Reconciliation (2026-08-21):** Item statuses below reflect a read-only code audit. Key architecture rulings (Founder Decision): (1) **Exactly 11 Blueprint systems** — Enneagram/MBTI/Big Five/Temperament/TA are NOT Blueprints and were never engines/routes/UI; legacy `enneagramType`/`enneagramWing` on `CoreIdentity` removed. (2) **All journaling = ONE entry point** at `WELLNESS → SECTION 4 (Praktik Tambahan) → JOURNALING`; no per-mode routes. Legacy `app/journal/page.tsx` + `app/innerwork/journaling/page.tsx` are duplicate implementations to be consolidated (redirects), not kept as parallel surfaces.
>
> **Post-Billing Status Audit (2026-08-24):** All P0/P1/M4 items re-audited against source with file:line evidence; statuses updated in place. Execution order follows the ratified sprint plan in [V5_IMPLEMENTATION_ROADMAP.md](V5_IMPLEMENTATION_ROADMAP.md#sprint-plan--post-billing-2026-08-24). Release remains frozen per D-V5-33.

---

## P0 - V4 Closure (Security, Privacy & Release Blockers)
- [x] **T0-01:** DONE 2026-08-24 (session 2): lib/prompts/promptSanitizer.ts (deep string clamp 600 chars + control-char strip) applied at buildDailyGuidancePrompt boundary to journalHistory/meditationHistory/audioHealingHistory/weeklyReflections + USER_TEXT_IS_DATA_RULE injected into prompt. tests/unit/v5-prompt-sanitizer.test.ts 6/6.
- [x] **T0-02:** DONE 2026-08-24 (session 2): raw uid/email removed from AuthContext.tsx auth logs, authActions.ts bootstrap log, app/login/page.tsx (3 sites incl CRITICAL AUTH RAW dump -> error.code only), lib/auth/resolveActiveProfile.ts mismatch logs — uidFingerprint (first4***) only.
- [x] **T0-03:** DONE 2026-08-24 (session 2): orphaned dailyGuidanceOrchestrator.ts + lib/ai/gemini.ts deleted after zero-importer re-verification; repo tsc exit 0 post-delete.
- [ ] **T0-04:** Fix ms-MY phantom dictionary runtime crash (lib/data/translations.ts or i18n bundle). (Code / i18n) — **SAFE / NOT RUNTIME-REACHABLE** (audit 2026-08-24: ms dict structurally parallel at translations.ts:568+; selection layer caps to id|en at LanguageContext.tsx:12-14 so no reachable crash path; becomes real work again when react-i18next lands).
- [x] **T0-05:** DONE 2026-08-24 (session 2): JournalInput.tsx autosaves to localStorage every 30s, restores on mount ("Draft dipulihkan"), clears on submit, Draft-saved indicator.
- [ ] **T0-06:** Add journalType discriminator to JournalEntry (lib/data/types.ts:279-297 — currently ABSENT; V5 spec requires it). (Data Model) — **NOT IMPLEMENTED**: `JournalEntry` has no `journalType` field; all journaling currently flows through one undifferentiated "Guided Reflection" record. Part of single-entry-point consolidation: add `journalType` + mode-specific nested fields (cbt/emotion/guided/spiritual), no per-mode routes. — **DONE (data model) 2026-08-24 (session 2)**: JournalType union + optional journalType + cbt/emotion/guided/spiritual nested payloads added to JournalEntry (lib/data/types.ts); legacy entries treated as GUIDED. UI mode flows remain T3-01.
- [ ] **T0-07:** Mount Catatan Hari Ini (DailyNoteV2) on DashboardClient.tsx. (Code / UI) — **NOT MOUNTED ON DASHBOARD** (audit 2026-08-24: rendered only on app/profile/page.tsx:377-387 with hardcoded placeholder props `dailyState={null}` etc.; DashboardClient has unused setDailyNoteFocus only).
- [ ] **T0-08:** Implement adaptive check-in with returning-user greeting + gap acknowledgment. (Code / UX) — **PARTIAL** (engine lib/retention/adaptiveRetentionEngine.ts + reminder copy exist but dashboard UI absent; components/dashboard/RetentionLoopCard.tsx is orphaned — never imported; greeting is time-of-day only).
- [ ] **T0-09:** Implement empty/failure states for Daily Rhythm (AI fail, empty note, network error, nothing to say). (Code / UX) — **DONE** (audit 2026-08-24: service local-fallback source:"local-fallback" at dailyGuidanceService.ts:411-521; client fallback generateLocalDailyGuidance + dgError double-failure state in DashboardClient; DailyNoteV2 distinct loading/unavailable/error/incomplete states).
- [ ] **T0-10:** Implement Comfort Mode as first-class Daily Rhythm path (equal to LEARN/REFLECT/JOURNAL). (Code / UX) — **NOT IMPLEMENTED** (audit: no Comfort Mode component/overlay exists in repo; V5_COMFORT_MODE_UX_SPEC.md is spec-only).
- [ ] **T0-11:** Implement Memory -> Daily Guidance integration pipeline. (Code / AI) — **DONE for server AI path** (audit 2026-08-24: memoryCompiler → dailyGuidanceEngine → AIGateway → prompts/registry.ts:125-190 injects dominantThemes/recurringWounds/healingEdges/previousReflection/previousDailyNote/journalHistory into buildDailyGuidancePrompt; caveat: client local-fallback path bypasses MemoryCompiler).
- [ ] **T0-12:** Remove DailyState checklist booleans (checkInDone, journalingDone, dailyGuidanceCompleted) -> replace with interaction tracking. (Data Model) — **LARGELY RESOLVED** (audit 2026-08-24: canonical DailyState lives in lib/repositories/dailyStateRepository.ts:9-66 with completedActivityIds/checkInRevision interaction tracking; checkInDone & dailyGuidanceCompleted have zero repo matches; residual legacy flags journalingDone/dailyNoteDone/groundingDone/meditationDone remain in the repository type and legacy ReminderState).

## P1 - V5 Foundation
- [x] **T1-01:** DONE V5-02 (2026-08-24): i18next@23 + react-i18next@14 installed; canonical instance lib/i18n/index.ts (resources from src/locales/{id-ID,en-US,ms-MY}/translation.json; fallback {ms:[en,id], en:[id]}); LanguageContext backed by i18n.changeLanguage. CURRENT locales only per D-V5-35.
- [x] **T1-02:** DONE V5-02: bundles generated for id-ID/en-US/ms-MY (15 sections each incl. astroToday+environment); deferred es/pt-BR/fr-FR excluded by design.
- [x] **T1-03:** DONE V5-02: settings selector id/en/ms + persistence & hydration accepts ms; welcome page switcher now functional (3 buttons); LanguageContext union widened to include ms.
- [ ] **T1-04:** Align version metadata (buildInfo.ts, build.gradle, package.json, docs). (Config / Release)

## P2 - Daily Rhythm
- [ ] **T2-01:** Wire Tiny Step inline in Daily Note (personalized from Memory). (Code / UI)
- [ ] **T2-02:** Wire timezone-aware evening reflection trigger (contextual, only if journaled). (Code / Logic)
- [ ] **T2-03:** Implement adaptive check-in (progressive disclosure, usual time detection). (Code / UX)
- [ ] **T2-04:** Implement weekly reflection synthesis (Sunday, opt-in). (Code / AI)

## P3 - Journaling / Inner Work
- [ ] **T3-01:** Implement 5 journal mode flows (Free, CBT, Emotion, Guided, Spiritual). (Code / UI) — **NOT IMPLEMENTED**: single "Guided Reflection" flow only; no mode selector, no CBT 8-step, no EMOTION/SPIRITUAL structured flows. **Architecture rule (Founder Decision):** all 5 modes enter via ONE feature at `WELLNESS → SECTION 4 → JOURNALING`; NO per-mode routes (`/cbt`, `/comfort`, `/spiritual`, `/emotion`, `/guided` must not exist). Mode chosen inside the feature via `journalType` selector.
- [ ] **T3-02:** Implement journal history browser (timeline, filters, search, export). (Code / UI)
- [ ] **T3-03:** Implement draft recovery UI (draft list, conflict resolution, auto-save indicator). (Code / UX)
- [ ] **T3-04:** Implement Continue yesterday thread shortcut. (Code / UX)
- [ ] **T3-05:** Implement mood/emotion trend visualization. (Code / UI)
- [ ] **T3-06:** Implement per-entry privacy controls (lock, hide, local-only). (Code / Privacy)
- [ ] **T3-07:** Implement CBT crisis detection -> resource referral. (Code / Safety)
- [ ] **T3-08:** Implement AI response contract (reflective only, user-controllable, crisis -> resource). (Code / AI)
- [ ] **T3-09:** Implement CBT progress tracking (insights over time). (Code / UI)

## P4 - Living Intelligence (Memory)
- [ ] **T4-01:** Define and implement memory continuity service (memoryCompiler.ts) with pipeline: Journal -> Extraction -> Memory -> Pattern -> Insight -> Future Experience. (Code / AI) — **PARTIAL**: `MemoryCompiler.compile()` exists (`lib/livingIntelligence/memoryCompiler.ts`) and ingests journal entries, but reads them generically (no per-mode `journalType` extraction; Free/CBT/Emotion/Guided/Spiritual flow through one bucket).
- [ ] **T4-02:** Implement Memory Dashboard (view/edit/delete/export) with consent flow, correction mechanism, transparency UI. (Code / UI / Privacy) [PROMOTED FROM P4] — **NOT IMPLEMENTED**: no Memory Dashboard component exists in repo; spec/spec-only.
- [ ] **T4-03:** Implement consent flow for sensitive content (opt-in UI). (Code / Privacy)
- [ ] **T4-04:** Implement correction mechanism (user can fix misremembered themes). (Code / UX)
- [ ] **T4-05:** Implement transparency UI (what is stored, why, source). (Code / UX)
- [ ] **T4-06:** Implement weekly reflection synthesis (Sunday, opt-in) and monthly pattern summary. (Code / AI)
- [ ] **T4-07:** Implement Memory -> Daily Guidance integration (theme thread continuation, Tiny Step personalization). (Code / AI)

### P4a - Wellness → Journey Memory Moat (Audit: 2026-08-22)

> **Current Moat Level: M3 (Derived Memory) + Partial M4**
> **Target: Closed M4 deterministic personalization loop.** Do NOT call this M5.
>
> Terminology: M1=Event Log, M2=Historical Memory, M3=Derived Memory, M4=Closed Personalization Loop, M5=Personal Context Graph.
>
> **Proven:** Section 1/3/4 persistence, Journal → emotionalMemory → MemoryCompiler, AI Daily Guidance consuming MemoryContext.
> **Broken:** deterministic recommendation scoring ignores journeyContext; Section 2 currentIssue ephemeral; local/cloud Journey memory divergent.

- [x] **M4-01:** Wire `journeyContext` into deterministic Wellness recommendation scoring. **CLOSED 2026-08-24 (audit evidence):** `SelectWellnessPackagesInput.journeyContext` present (wellnessRecommendationEngine.ts:114); `scoreCandidate` applies helped=+4 (L305) and skipped=-6 (L306); regression tests assert exact score deltas (tests/unit/m4-journey-memory-integration.test.ts:44-70).

- [x] **M4-02:** Hydrate and pass real `journeyContext` into Wellness recommendation engine. **CLOSED 2026-08-24 (audit evidence):** wellnessCurationService.ts:517-528 builds context via `buildJourneyCompactContext(recentPracticePatterns)` and passes it; caller chain WellnessPageClient.tsx:587-595 → wellnessDailyIntelligence → memoryCompiler verified; mapper test tests/unit/m4-02-journey-context-wiring.test.ts.

- [ ] **M3-01:** Unify Journey local/cloud memory source. **Goal:** Remove divergence between localStorage `bhumiJourneyData` and canonical cloud memory. **Acceptance:** One canonical source of truth. No orphan local cache used as independent Journey truth. Offline behavior explicitly documented. No duplicated/conflicting Journey states. **Files:** `lib/journey/createJourneyData.ts`, `lib/ai/compileUserInnerwork.ts`, `app/journey/page.tsx`. **Dependency:** M4-02. **Evidence:** `app/journey/page.tsx:41-55` reads raw Firestore states bypassing `MemoryContext`. `createJourneyData.ts:312-326` writes orphan `JourneyData` to `localStorage`. **Test:** Verify Journey page reads cloud-backed data; no independent localStorage source. **Status:** OPEN.

- [x] **M3-02:** DONE 2026-08-24 (session 2): currentIssuePersistencePayload persisted via journeyRepository.updateDailyRecord on every loadWellnessDailyIntelligence run (key+title+source+ISO timestamp; day assoc via record appDate); pure logic extracted to lib/services/wellnessIssueResolution.ts (repo-free, unit-testable). tests/unit/v5-m3-02-current-issue-persistence.test.ts 5/5.

## P5 - Notifications
- [ ] **T5-01:** Configure firebase.json with messaging section. (Config / FCM)
- [ ] **T5-02:** Implement FCM token registration in user profile. (Code / FCM)
- [ ] **T5-03:** Replace reminderSystem.ts console.log with real FCM payload delivery. (Code / FCM)
- [ ] **T5-04:** Implement notification personalization (timing from Memory, content from Memory, category opt-in). (Code / FCM)
- [ ] **T5-05:** Implement frequency caps, adaptive reduction on dismiss, category opt-in. (Code / FCM)
- [ ] **T5-06:** Implement absence handling notifications (Day 3, 7, 30). (Code / FCM)
- [ ] **T5-07:** Implement Comfort Mode suppression of non-absence notifications. (Code / FCM)

## P6 - Account & Firestore
- [ ] **T6-01:** Implement server-side Play entitlement/subscription revocation on account deletion. (Code / Billing)
- [ ] **T6-02:** Add Firestore rules for feedback write and admin_users read. (Security / Firestore)

## P7 - QA, Security & Release
- [ ] **T7-01:** Execute full V5 acceptance test suite (i18n, prompt sanitization, Journal modes, Dashboard Catatan, FCM, Memory Dashboard, Adaptive Rhythm). (Testing)

## P8 - Future / Deferred
- [ ] **T8-01:** Inbox AI message generator (Deferred per D-V5-04). (Future)
- [ ] **T8-02:** Golden-dataset calculation accuracy re-verification (Deferred per D-V5-06). (Future)
- [ ] **T8-03:** Quarterly/monthly reflection milestones. (Future)
- [ ] **T8-04:** Journal export (PDF, JSON). (Future)
- [ ] **T8-05:** Seasonal Daily Note variations. (Future)
- [ ] **T8-06:** Shared/reflective mode (with trusted person). (Future)
- [ ] **T8-07:** AI depth control (minimal <-> deep). (Future)
- [ ] **T8-08:** Offline-first sync conflict resolution. (Future)
- [ ] **T8-09:** Relationship milestone acknowledgments. (Future)

## P9 - Monetization UX (Premium Price)
- [ ] **T9-01:** Change canonical monthly display price to Rp25.000/bulan: lib/data/translations.ts id `subscriptionNote` (:257) and en `subscriptionNote` (:540); add explicit price line to ms block (currently omits price); update hardcoded fallback in app/premium-bhumi/page.tsx:274. (Code / Copy) — per D-V5-32 / R-PRD-42.
- [ ] **T9-02:** Price consistency sweep — verify no remaining user-facing Rp50.000 subscription copy; confirm live Play-price surfaces (app/upgrade/page.tsx queryProducts formattedPrice) are untouched and continue to win over static copy. (QA / Copy)
- [ ] **T9-03:** Document Play Console price as separately governed (requires Founder Play Console action if real charge should change); no product/base-plan/entitlement/trial changes. (Docs)

## Astro Hari Ini — Synthesis & Integration
- [x] **T-ASTRO-10:** DONE 2026-08-24 (session 2): canonicalToday.ts completed (timezone resolution fixed, robust getYesterdayCanonical); DashboardClient fully wired (getCanonicalToday/getYesterdayCanonical); synthesis uses it as date backbone. Repo tsc now EXIT 0.
- [x] **T-ASTRO-06:** Dynamic Western presentation. **DONE 2026-08-24**: slice(0,5) removed; cards = selectRelevantWesternEvents(sky) with aspect/retro/ingress detail lines.
- [x] **T-ASTRO-01:** Dynamic eclipse source. **DONE 2026-08-24**: lib/astrology/calculateEclipses.ts via astronomy-engine (SearchGlobalSolarEclipse/SearchLunarEclipse/SearchLocalSolarEclipse); tests/unit/v5-astro-core.test.ts 20/20.
- [ ] **T-ASTRO-02:** Global Next + Local/Visible Next. **PARTIAL 2026-08-24**: Global Next live in AstroTodayCard; Local/Visible renders explicit unavailable state because no canonical CURRENT-location signal exists (birth location ≠ current location) — per D-V5-29 this honest state is compliant; wire a geolocation/canonical-location source when ratified.
- [x] **T-ASTRO-03:** Relevance contract. **DONE 2026-08-24**: relevantWesternEvents.ts — retrograde/tight-aspect(orb≤6°)/ingress reasons, Sun-only-with-reason, variable count proven 0..N by tests.
- [x] **T-ASTRO-12:** KNOWN_ECLIPSES retired 2026-08-24; astroAwarenessEngine now consumes buildUpcomingEclipseEvents.
- [ ] **T-ASTRO-11:** **LARGELY DONE 2026-08-24 (session 2)**: eastern card framing + moonThemes moved to astroToday.eastern.* (id/en/ms); card fully dict-driven. REMAINING: engine-layer dictionaries (wavespell meanings etc.) are DATA-layer Indonesian — needs a ratified content pass, not UI plumbing.
- [x] **T-ASTRO-04:** DONE 2026-08-24 (session 2): lib/astrology/dailyAstroSynthesis.ts — single canonical synthesis (sky+moon+relevant western+current-day Tzolkin/Weton+dynamic eclipses+openScope majorCycles) with sourceVersion stamping; consumed by card/Wellness/Catatan/Weekly. tests/unit/v5-daily-synthesis.test.ts 22/22.
- [x] **T-ASTRO-05:** Blueprint duplication removed from AstroTodayCard 2026-08-24 (group deleted; house activations retained only for Moon narrative).
- [x] **T-ASTRO-07:** DONE 2026-08-24 (session 2): WellnessPageClient.loadCanonicalWellnessContext builds astroContext via astroContextFromSynthesis(synthesis) (exact EnvironmentalContext shape; validForLocalDate anchored to wellness date).
- [x] **T-ASTRO-08:** DONE 2026-08-24 (session 2): DashboardClient Catatan feed now derives memoryContext.currentSky from the canonical synthesis (single-source; awareness window unchanged).
- [x] **T-ASTRO-09:** DONE 2026-08-24 (session 2): weeklyGuidanceEngine accepts aggregated astroContext summary -> ONE contextual lens line in weekly direction + timingEvidence "daily-astro-synthesis" + contributingSystems tag; no horoscope dump.

## DROP - Do Not Build
- [ ] Streak counter / streak UI
- [ ] Daily completion checklist
- [ ] Gamified badges/achievements
- [ ] Social comparison / leaderboards
- [ ] Mandatory daily steps
- [ ] Premium upsell in Comfort Mode

## P10 - Environment / Geophysical Context (D-V5-34)
- [x] **T-ENV-00:** Earth Activity truth contract — DONE 2026-08-24: dataState availability flag added; unavailable USGS no longer fabricates "Stabil" (card+detail show Belum tersedia).
- [x] **T-ENV-01:** DONE 2026-08-24: service.tsx fetches NOAA products/noaa-planetary-k-index.json -> kpIndex + geomagneticActivity label + observedAt; UTC-normalized (Z-suffix fix); never merged with Schumann.
- [x] **T-ENV-02a:** DONE 2026-08-24: schumann.ts normalizeSchumannResponse (SR1..SR5/intensity/amplitude/power/status, provenance=modelled-series) consumed in getNormalizedEnvironment with unavailable-fallback to last observation.
- [x] **T-ENV-02b:** DONE 2026-08-24: localStorage ring buffer (24h window, ~90s source respect via idempotent replay) + SchumannGraph.tsx SVG (amplitude+power polylines, honest window label).
- [x] **T-ENV-02c:** DONE 2026-08-24: environment.* i18n section (labels/staleness/sources/three-layer copy) id/en/ms; card+detail dict-driven; es/pt-BR/fr-FR DEFERRED (D-V5-35).
- [x] **T-ENV-02d:** DONE 2026-08-24: tests/unit/v5-environment-context.test.ts 17/17 (normalization, ring-buffer prune-after-insert + replay idempotency, honest window, Kp labels/UTC, spiritual band mapping).
- [x] **T-ENV-03:** DONE 2026-08-24: canonical EnvironmentContext (types.ts) now spans weather/AQI/astronomy/moon/earth(dataState)/spaceWeather/schumann/circadian with per-domain EnvironmentSourceMeta provenance.
- [x] **T-ENV-04:** DONE 2026-08-24: Daily Context path reuses buildAIEnvironmentContext (extended: geomagneticActivity/kpIndex/schumann fields) flowing into DashboardClient guidance memoryContext — no new memory system.
- [x] **T-ENV-05:** DONE 2026-08-24: Catatan receives environment as optional weak context via cautionFlags (geomagnetic_storm_level/active, schumann_elevated_context) + summary fields; user-state priority untouched.
- [x] **T-ENV-06:** DONE 2026-08-24 (contextual-only): Wellness consumption remains via existing EnvironmentalContext levels + guidance weak signals; recommendation scoring untouched (M4-01/M4-02 frozen). Priority order preserved: user > wellness > memory > env/astro.

---

## MASTER COMPLETION AUDIT RECONCILIATION (2026-08-24 — Founder authorized)

Evidence-based status corrections and newly surfaced canonical gaps (full analysis: V5_IMPLEMENTATION_ROADMAP.md § MASTER AUDIT SPRINT PLAN):

### Newly surfaced / corrected
- [ ] **T0-10a:** V5_COMFORT_MODE_UX_SPEC.md is an UNTRACKED, BINARY-CORRUPTED file (unreadable bytes; not in git HEAD). Rewrite the Comfort Mode UX spec (content contract survives in V5_JOURNAL_INNER_WORK_SPEC.md §3: calm presence, Memory resurface, max-4-sentences, no new memory capture, no upsell) before implementing T0-10. (Docs / P1)
- [ ] **CONFLICT-J01:** Fifth journal mode naming — canonical docs say SPIRITUAL (SOT §3.2, D-V5-07, R-PRD-12); Founder directive in V5_JOURNALING_PRD.md §0 renames to SPIRITUAL_AWAKENING and declares itself authoritative for implementation. Resolution rule: directive wins at implementation time; canonical docs updated inside Sprint V5-03 (J0-01 of V5_JOURNALING_TODO.md). (Docs / P1)
- [x] **AUDIT-NOTE:** Single-entry-point journaling consolidation evidence: legacy routes app/journal/page.tsx + app/innerwork/journaling/page.tsx both EXIST; app/wellness/journaling does NOT exist; no WELLNESS Section-4 journaling link found → T3-01 consolidation NOT STARTED.
- [x] **AUDIT-NOTE:** firebase.json has NO messaging section; reminderSystem.ts delivers via console.log (1 occurrence) → T5-01..T5-07 all NOT STARTED.
- [x] **AUDIT-NOTE:** settings LocaleSwitcher offers id/en only (app/settings/page.tsx ~L192-199); welcome-page switcher placeholder non-functional → T1-03 PARTIAL confirmed.

### Frozen / HOLD register (current evidence)
| Item | Why | Dependency | Resume condition |
|---|---|---|---|
| Billing deploy + purchase verification | Neon URL not yet supplied by Founder | Founder input | Immediate on URL receipt |
| T6-01 server-side Play revoke on deletion | Billing backend unverified | Billing gate | After billing verified |
| Android build/release (D-V5-33) | Release freeze | V5 completion + Founder authorization | Explicit go |
| Life Pattern Engine | Conceptual P2+ (D-V5-25) | None — sequenced last | Founder scheduling |

---

## V5-01 FOUNDATION BASELINE — DISPOSITIONS (2026-08-24, Founder-approved sprint)

- [x] **D-V5-24 Blueprint type completeness:** DONE (evidence 2026-08-24): lib/types/blueprint.ts:174-175 already carries astrocartography?: AstrocartographyResult + ziWei?: ZiWeiResult with typed imports; result types exist in lib/astrocartography/types.ts + lib/zi-wei/types.ts. Gap was STALE. Decision log annotated.
- [x] **T0-10a Comfort spec:** DONE — V5_COMFORT_MODE_UX_SPEC.md rewritten as tracked canonical reconstruction from surviving contracts (JOURNAL_INNER_WORK §3, RHYTHM §3/4, PHILOSOPHY, SECURITY_PRIVACY, FCM §5) + AC-CM-01..06; original corrupted bytes NOT guessed.
- [x] **J0-01 naming:** DONE — SPIRITUAL_AWAKENING applied to JournalType union + SOT §3.2 + PRD R-PRD-12 + D-V5-07a addendum. Zero runtime consumers existed.
- [x] **T0-12 legacy flags disposition:** ReminderState has 8 live consumers (AIReminderState.tsx, reminderService.ts, dashboardOrchestrator, localDailyGuidanceFallback, prompts, engines/types). KEEP as LEGACY-coexisting; revisit deletion inside Sprint V5-06 (notifications owner). NOT a blocker for canonical DailyState interaction tracking.
- [x] **T1-04 metadata disposition:** Drift recorded — package.json 4.4.5 · gradle versionCode 100/versionName "5.0.0"-qa · ARCHITECTURE.md stale (99/4.4.15). Alignment DEFERRED to release-prep: gradle is a frozen release artifact; changing it now violates the no-build freeze. No code change.
- [x] **T0-07/T0-08 placement disposition:** DailyNoteV2 mount + adaptive greeting UI are EXPERIENCE completeness, not foundation blockers — zero imports from journaling/i18n/memory depend on them → moved to Sprint V5-05 per dependency proof (DashboardClient is their only host).
- [x] **T-ASTRO-10 re-verified:** canonicalToday.ts fixed+tested (22/22 synthesis suite covers it); DashboardClient wired. Stays DONE.
- [x] **Test harness disposition:** tsx assert convention (tests/unit/*.test.ts) sufficient for V5-02..05; Firestore-rules testing (V5-07) will need @firebase/rules-unit-testing + emulator harness — added as entry requirement of V5-07, not built now (YAGNI).

### I18N CODE ASSUMPTIONS TO CHANGE IN V5-02 (recorded 2026-08-24, D-V5-35 — no source changes made in this reconciliation)
- app/context/LanguageContext.tsx caps Language to "id" | "en" → add "ms" (+ persistence guard accepts ms).
- lib/locale/normalizeLocale.ts already supports ms-MY ✓ (no change expected).
- translations.ts currently ships id/en/ms top-level dicts ✓ — react-i18next loader maps these as initial resources.
- AI prompt language field: audit accepted values in dailyGuidance pipeline during V5-02 (must accept ms).
- Notification/email template locale lists: none implemented yet (T5-04 will use CURRENT locales only).
