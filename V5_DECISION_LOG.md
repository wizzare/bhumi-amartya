# V5 Decision Log

**Status:** Canonical - ratified Founder + ChatGPT decisions for V5 product direction.

**Authority:** This log records decisions that bind all downstream implementation. Do not implement contrary to a ratified decision without a new Founder + ChatGPT decision entry.

---

## D-V5-01 - Locale Set
**Date:** 2026-08-19
**Status:** RATIFIED

V5 supports six visible locales:

- id-ID - Indonesian - default
- en - English
- ms-MY - Malay
- es - Spanish
- pt-BR - Brazilian Portuguese
- fr-FR - French

The previous conflicting 8-locale PRD/TODO target and the alternative SOT locale set are superseded.

Do not add Japanese, Hindi, Simplified Chinese, Traditional Chinese, or Hong Kong Chinese to the current V5 scope.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_I18N_SPEC.md, V5_PRD.md, V5_TODO.md

---

## D-V5-02 - i18n Architecture
**Date:** 2026-08-19
**Status:** RATIFIED

V5 will use react-i18next.

Requirements:

- structured locale resources (src/locales/{lang}/translation.json)
- English fallback (en) -> Indonesian fallback (id-ID)
- missing-key fallback chain
- interpolation support
- pluralization where required
- persisted locale (user profile + localStorage)
- functional locale switcher
- AI output respects selected locale
- notifications respect selected locale

Existing custom LanguageContext / translations.ts / normalizeLocale.ts are migration sources, not the final V5 architecture.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_I18N_SPEC.md, V5_ARCHITECTURE.md, V5_TODO.md

---

## D-V5-03 - ms-MY Crash
**Date:** 2026-08-19
**Status:** V4 CLOSURE BLOCKER

The current phantom ms-MY dictionary in the legacy i18n system causes a runtime crash. Must be resolved before any release.

**Affected:** V4_UNFINISHED_WORK.md, V5_SOURCE_OF_TRUTH.md, V5_TODO.md (P0)

---

## D-V5-04 - Inbox AI Generator
**Date:** 2026-08-19
**Status:** DEFERRED

Do not implement an AI inbox generator in the current V5 core scope.

Retain the data model only if it remains useful.

Revisit later based on actual product need.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_TODO.md (P8)

---

## D-V5-05 - Living Intelligence / Memory
**Date:** 2026-08-19
**Status:** RATIFIED FOR DESIGN

V5 must define memory continuity before implementation.

Memory exists to support useful continuity, not to retain everything the user says.

The design must cover:

- meaningful preferences
- recurring themes
- long-term goals
- useful patterns
- progress signals
- memory lifecycle
- user control
- privacy boundaries

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md, V5_TODO.md (P4)

---

## D-V5-06 - Calculation Accuracy
**Date:** 2026-08-19
**Status:** REQUIRED VALIDATION

Existing engines are carried forward.

Before claiming V5 calculation correctness, validate critical engines against golden datasets.

Do not rebuild engines merely because they are old.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_TODO.md (P8)

---

## D-V5-07 - Journaling
**Date:** 2026-08-19
**Status:** RATIFIED

V5 has five journal modes:

1. Free
2. CBT
3. Emotion
4. Guided
5. Spiritual

All share the same JournalEntry foundation with journalType discriminator.

CBT is a reflection framework, not diagnosis or therapy.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_JOURNAL_INNER_WORK_SPEC.md, V5_CBT_JOURNAL_DESIGN.md, V5_DATA_MODEL.md, V5_TODO.md (P3)

---

## D-V5-08 - Comfort Mode
**Date:** 2026-08-19
**Status:** RATIFIED

Comfort Mode is a V5 UX capability.

It is NOT a sixth journal type.

Its purpose is to let users interact with Bhumi without being pushed toward tasks, streaks, journaling, meditation, or productivity.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_COMFORT_MODE_UX_SPEC.md, V5_JOURNAL_INNER_WORK_SPEC.md, V5_TODO.md (P3)

---

## D-V5-09 - Habit Philosophy
**Date:** 2026-08-19
**Status:** RATIFIED

Bhumi should encourage return, not enforce streaks.

Streaks are optional feedback.

No guilt-based retention.

No punishment for absence.

The product should feel like a companion, not a taskmaster.

**Affected:** V5_PRODUCT_PHILOSOPHY.md, V5_DAILY_RHYTHM_SPEC.md, V5_TODO.md

---

## D-V5-10 - Daily Relationship Loop
**Date:** 2026-08-19
**Status:** RATIFIED

Conceptual loop:

`
OPEN APP
-> CHECK-IN
-> WHAT DO I NEED?
-> DAILY GUIDANCE / DAILY NOTE
-> OPTIONAL TINY STEP
-> OPTIONAL JOURNAL / CONVERSATION
-> MEMORY
-> PATTERN
-> REFLECTION
-> TOMORROW
`

This is not a mandatory daily checklist.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_PRD.md

---

## D-V5-11 - V4 Closure
**Date:** 2026-08-19
**Status:** RATIFIED

The following remain V4 closure requirements (P0 release blockers):

- journal prompt injection (lib/prompts/dailyGuidancePrompt.ts:71)
- client PII logging (authActions.ts, AuthContext.tsx, app/login/page.tsx)
- Gemini AIGateway bypass (lib/orchestrators/dailyGuidanceOrchestrator.ts:89)
- journal autosave (components/journal/JournalInput.tsx)
- ms-MY crash (legacy i18n)
- Dashboard Daily Note mount (components/dashboard/DashboardClient.tsx)
- JournalEntry discriminator (lib/data/types.ts)
- account deletion entitlement cleanup

FCM is V5 infrastructure, not retroactively classified as a V4 bug.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_TODO.md (P0), V4_UNFINISHED_WORK.md

---

## D-V5-12 - Build 100
**Date:** 2026-08-19
**Status:** RATIFIED

Build 100 documentation remains governance/history.

V5 is the product implementation track.

Do not force V5 to become Build 100 merely for naming consistency.

**Affected:** V5_SOURCE_OF_TRUTH.md, BUILD_100_CONTEXT_CONFLICTS.md

---

## D-V5-13 - Comfort Mode as First-Class Path
**Date:** 2026-08-19
**Status:** RATIFIED

Comfort Mode is a first-class Daily Rhythm path (not an alternative entry). Equal to LEARN, REFLECT, JOURNAL paths. Do Nothing is a valid successful interaction.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_COMFORT_MODE_UX_SPEC.md, V5_PRD.md, V5_TODO.md (P0)

---

## D-V5-14 - Do Nothing as Valid Completion
**Date:** 2026-08-19
**Status:** RATIFIED

Do Nothing is a valid successful Daily Rhythm completion. User can complete Daily Rhythm without any action. No streak, no checklist, no guilt.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_PRODUCT_PHILOSOPHY.md, V5_TODO.md (P0)

---

## D-V5-15 - Memory Dashboard at P1
**Date:** 2026-08-19
**Status:** RATIFIED

Memory Dashboard (view/edit/delete/export with consent flow, correction, transparency) promoted from P4 to P1. Trust requires visibility.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md, V5_TODO.md (P1), V5_IMPLEMENTATION_ROADMAP.md

---

## D-V5-16 - Adaptive Daily Rhythm
**Date:** 2026-08-19
**Status:** RATIFIED

Daily Rhythm is adaptive: Orientation -> Need Discovery -> Optional Path -> Value -> Memory -> Future Relevance. Check-in reduces for familiar users. Do Nothing bypass available.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_PRD.md, V5_TODO.md (P0)

---

## D-V5-17 - Empty/Failure States Required
**Date:** 2026-08-19
**Status:** RATIFIED

Daily Rhythm must have graceful empty/failure states: AI fail, empty note, network error, insufficient context, nothing to say.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_PRD.md, V5_TODO.md (P0)

---

## D-V5-18 - Returning-User Greeting + Gap Acknowledgment
**Date:** 2026-08-19
**Status:** RATIFIED

Returning users receive contextual greeting with last theme and gap acknowledgment (3/7/30 days). No guilt language ever.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DAILY_RHYTHM_SPEC.md, V5_PRD.md, V5_TODO.md (P0)

---

## D-V5-19 - DailyState Checklist Booleans Removed
**Date:** 2026-08-19
**Status:** RATIFIED

DailyState checkInDone, journalingDone, dailyGuidanceCompleted booleans removed (invite checklist UI). Replaced with interaction tracking (lastInteractionType, lastInteractionDate).

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_DATA_MODEL.md, V5_DAILY_RHYTHM_SPEC.md, V5_TODO.md (P0)

---

## D-V5-20 - Anti-Metrics (Must NOT Optimize)
**Date:** 2026-08-19
**Status:** RATIFIED

V5 must NOT optimize for: DAU, streak maintenance rate, session length, journals per week, notification CTR, feature adoption funnel completion.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_PRD.md, V5_TODO.md


## D-V5-21 - Official Blueprint Count (11 Systems)
**Date:** 2026-08-19
**Status:** RATIFIED

Bhumi V5 has exactly 11 official Blueprint systems (Cetak Biru Jiwa) displayed on the Profile page:

1. Life Path
2. Destiny Matrix
3. Human Design
4. Natal Chart
5. Weton
6. BaZi
6. Vedic Astrology
7. Tzolkin Maya
8. Whole Sign Birth Chart
9. Astrocartography
11. Zi Wei Dou Shu

The previous Identity Layer listing 6 systems is superseded. These 11 are the official Blueprint count.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_EXPERIENCE_ARCHITECTURE.md, V5_PRD.md, V5_DATA_MODEL.md

---

## D-V5-22 - Enneagram Field Status
**Date:** 2026-08-19
**Status:** RESOLVED (2026-08-24) — OPTION B EXECUTED

The CoreIdentity type contained `enneagramType?` and `enneagramWing?` fields with NO calculation engine. Per the Build 100 audit reconciliation and Founder confirmation, Option B was executed: the legacy fields were removed from `CoreIdentity`.

**Evidence (2026-08-24):** repo-wide grep for `enneagram` in `lib/data/` returns zero matches. Enneagram is NOT a Blueprint system and MUST NOT be implemented without a new explicit Founder decision.

**Affected:** V5_DATA_MODEL.md, V5_SOURCE_OF_TRUTH.md, V5_DECISION_LOG.md

---

## D-V5-23 - Temperament Profile & Transactional Analysis
**Date:** 2026-08-19
**Status:** PROPOSED FUTURE INPUTS — NOT BLUEPRINT SYSTEMS

Temperament Profile (Sanguine/Phlegmatic/Choleric/Melancholic) and Transactional Analysis (Parent/Adult/Child ego states) are CONCEPTUAL FUTURE INPUTS for the Life Pattern Engine layer.

They are NOT Blueprint systems #12 and #13. They are proposed as additional input layers for the Life Pattern Engine, consuming Blueprint data + user behavioral evidence.

Implementation methodology (birth-derived vs questionnaire) requires Founder decision before any implementation.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_EXPERIENCE_ARCHITECTURE.md, V5_DECISION_LOG.md, V5_LIFE_PATTERN_ENGINE_AUDIT.md

---

## D-V5-24 - Blueprint Type Completeness
**Date:** 2026-08-19
**Status:** TECHNICAL GAP — REQUIRES IMPLEMENTATION

Astrocartography and Zi Wei Dou Shu have:
- Calculation engines (lib/astrocartography/calculateAstrocartography.ts, lib/zi-wei/calculateZiWei.ts)
- UI routes (app/blueprint/astrocartography, app/blueprint/zi-wei)
- Page components (page.tsx in each)

BUT they are NOT represented in the Blueprint type (lib/types/blueprint.ts). This is a technical consistency gap.

**Action Required:** Add AstrocartographyBlueprint and ZiWeiBlueprint types to lib/types/blueprint.ts and include them in the Blueprint interface.

**Affected:** lib/types/blueprint.ts, V5_SOURCE_OF_TRUTH.md, V5_DECISION_LOG.md

---

## D-V5-25 - Life Pattern Engine Status
**Date:** 2026-08-19
**Status:** FUTURE LAYER — NOT IMPLEMENTED

Life Pattern Engine is a CONCEPTUAL FUTURE LAYER that will:
- Consume Blueprint data (11 systems) + lived user evidence (journals, check-ins, memory)
- Generate pattern hypotheses (triggers, loops, stress responses, relationship patterns, strengths, growth edges)
- Surface hypotheses for user confirmation: 'Bhumi melihat pola ini... Apakah terasa benar?' [Ya/Sebagian/Tidak]
- Update confidence based on user feedback
- Feed confirmed patterns back to Living Intelligence

**Status:** CONCEPTUAL ONLY — NO CODE, NO UI, NO SCHEMA, NO SCORING.
**Priority:** P2 (Phase 6+) — after core Daily Rhythm, Journaling, Memory Dashboard are functional.
**Architectural Principle:** Blueprints = starting hypotheses; Lived experience = evidence; Life Pattern Engine connects both without treating either as absolute truth.

**Affected:** V5_SOURCE_OF_TRUTH.md, V5_EXPERIENCE_ARCHITECTURE.md, V5_PRD.md, V5_DECISION_LOG.md

---

## D-V5-26 — Astro Hari Ini: Daily Astro Synthesis
**Date:** 2026-08-23
**Status:** RATIFIED

Astro Hari Ini ("Astro Today") on Dashboard becomes a single Daily Astro Synthesis combining:
- Current sky (planetary positions, retrogrades)
- Moon phase
- Dynamic Western transits (variable count, no fixed limit)
- Current-day Tzolkin (calendar system, not birth-data)
- Current-day Weton (calendar system, not birth-data)
- Eclipse data
- Existing canonical large-cycle signals

The synthesis feeds as contextual input into Wellness, Catatan Hari Ini, and Panduan Minggu Ini.

Astro is a contextual lens only — it must NOT diagnose, assert emotional states, override Wellness signals, override Journey Memory, or override user input.

**Affected:** V5_PRD.md, V5_SOURCE_OF_TRUTH.md, V5_TODO.md, AstroTodayCard.tsx

---

## D-V5-27 — Astro Hari Ini: Western Sky Dynamic Events
**Date:** 2026-08-23
**Status:** RATIFIED

Western sky events in Astro Today are dynamic and variable-count per day. No hardcoded fixed item limit. Events may vary between 3 and 15+ depending on astronomical activity on a given day.

**Affected:** V5_PRD.md, V5_TODO.md, AstroTodayCard.tsx

---

## D-V5-28 — Astro Hari Ini: Blueprint Duplication Removal
**Date:** 2026-08-23
**Status:** RATIFIED

"Menyentuh Blueprint-mu Hari Ini" section must be removed from Astro Today. Blueprint retains its dedicated section elsewhere. No duplication.

**Affected:** V5_PRD.md, V5_TODO.md, AstroTodayCard.tsx

---

## D-V5-29 — Astro Hari Ini: Eclipse Contract
**Date:** 2026-08-23
**Status:** RATIFIED

Eclipse display in Astro Today shows BOTH:
- **Global Next:** Next chronological eclipse event globally
- **Local/Visible Next:** Next eclipse relevant/visible for the user's location (when visibility data is reliable)

If visibility cannot be established reliably, show Global Next and explicitly mark Local/Visible as unavailable. Do not invent visibility.

No countdown UI for current scope. No hardcoded eclipse list.

**Affected:** V5_PRD.md, V5_TODO.md, astronomicalEvents.ts, AstroTodayCard.tsx

---

## D-V5-30 — Astro Hari Ini: Tzolkin & Weton Are Current-Day
**Date:** 2026-08-23
**Status:** RATIFIED

Tzolkin and Weton in Astro Today are CURRENT-DAY CALENDAR SYSTEMS only. They use today's date, not birth data. Do not personalize these systems to birth date.

**Affected:** V5_PRD.md, AstroTodayCard.tsx

---

## D-V5-31 — Astro Hari Ini: No Birth-Data Personalization
**Date:** 2026-08-23
**Status:** RATIFIED

Astro Today is not a personalized natal reading. It shows current-day astronomical context as a universal lens. Personalization comes from downstream integration (Wellness, Catatan, Weekly) where astro context meets user state.

**Affected:** V5_PRD.md, AstroTodayCard.tsx

---


---

## D-V5-32 — Premium Display Price Rp25.000/bulan
**Date:** 2026-08-24
**Status:** RATIFIED

The user-facing monthly subscription DISPLAY price changes from Rp50.000/bulan to **Rp25.000/bulan** across all subscription surfaces (premium page copy, translations, paywall/CTA text).

Scope guardrails:
- This is a UI/copy change ONLY. The actual Google Play charge is governed exclusively by Play Console pricing for product `bhumi_premium_monthly` / base plan `monthly`. Play Console configuration is NOT modified in this sprint and must be updated separately by Founder if the real charge should also become Rp25.000.
- Where the app renders a live Play price (`queryProducts` → `formattedPrice`, e.g. app/upgrade/page.tsx), the Play-provided value always wins; hardcoded display copy must never override it.
- Product ID, base plan, entitlement logic, and trial logic are unchanged.

**Affected:** lib/data/translations.ts (id/en/ms), app/premium-bhumi/page.tsx fallback copy, V5_PRD.md (R-PRD-42), V5_TODO.md

---

## D-V5-33 — Release Freeze Until Founder Authorization
**Date:** 2026-08-24
**Status:** RATIFIED

Completing V5 implementation does NOT authorize an Android production release. Prohibited without separate explicit Founder authorization: version bump, AAB/APK release build, Play Console upload, production rollout.

The Android `NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY` build-injection fix is DOCUMENTED AND QUEUED for that future release phase; it is not a blocker for server-side billing recovery (Firestore-based access resolution works without it).

**Affected:** V5_IMPLEMENTATION_ROADMAP.md (sprint gates), V5_TODO.md, billing recovery docs (P0-03 series)

---

## D-V5-34 — Canonical Environment / Geophysical Context Layer
**Date:** 2026-08-24
**Status:** RATIFIED

The Dashboard "Kondisi Lingkungan Hari Ini" card and its detail page are ratified as a canonical V5 contextual layer (Environment Context), alongside Astro Today.

Contract:
1. ONE canonical model in `lib/environment/types.ts`; `service.tsx` is the sole production implementation; legacy `provider.ts` stub retired.
2. Domain responsibilities (one primary source each): Weather=Open-Meteo · AirQuality=Open-Meteo AQ · Sun/Moon/Circadian=astronomy-engine · Seismic=USGS FDSN · Geomagnetic=NOAA SWPC planetary Kp · Schumann=schumannresonancelive.com API (keyless, ~90s cache, UTC timestamps; SR numeric series are MODELLLED by the source — always labelled).
3. Three-layer framing: OBSERVATION (measured/modelled, labelled, timestamped, sourced) → INTERPRETATION (Bhumi environmental reading) → SPIRITUAL/ENERGETIC READING (Bhumi spiritual vocabulary: energetic shifts, collective field, grounding, sensitivity). Interpretation is never presented as proven causal law; no medical/diagnostic/deterministic-emotional claims; user state > wellness state > memory > environment/astro priority order holds.
4. Freshness: every domain carries observedAt/source meta; "Belum tersedia" for unavailable — fabricated defaults ("Stabil") forbidden.
5. Schumann graph = "Bhumi 24h Context Graph" built from Bhumi-side accumulated API observations (rolling window shown honestly, e.g. "6 jam tersedia"). Never called raw Tomsk spectrogram.
6. Downstream: Environment Context feeds Daily Context → Catatan Hari Ini + Wellness as an OPTIONAL weak contextual signal only (never overrides user state/check-in/Journey Memory).

**Affected:** lib/environment/*, dashboard card/detail, V5_PRD.md (R-PRD-43..46), V5_SOURCE_OF_TRUTH.md, V5_TODO.md (T-ENV-00..06), V5_DESIGN_CONTRACT.md


---

## D-V5-07a — Fifth Mode Renamed SPIRITUAL_AWAKENING (J0-01)
**Date:** 2026-08-24 (V5-01)
**Status:** RATIFIED — implements pre-existing Founder directive

Per V5_JOURNALING_PRD.md §0 (directive authoritative for implementation naming), the fifth journal mode is **SPIRITUAL_AWAKENING** (display "Spiritual Awakening"). Applied in V5-01 to: lib/data/types.ts JournalType, V5_SOURCE_OF_TRUTH §3.2, V5_PRD R-PRD-12, this log's D-V5-07 list. Contract unchanged otherwise.


---

## D-V5-35 — V5 Language Scope Revision (Three Current Locales)
**Date:** 2026-08-24
**Status:** RATIFIED

Founder revises the V5 language scope.

CURRENT (required for V5 completion): **id-ID (default), en-US, ms-MY**.
FUTURE / DEFERRED (explicitly out of current scope): **es-ES, pt-BR, fr-FR**.

Rules:
- Fallback chain unchanged: active → en-US → id-ID.
- All CORE V5 journeys (onboarding, login/setup, dashboard, wellness, astro today, environment, daily guidance, catatan hari ini, weekly guidance, journaling, premium, notifications, errors/empty/loading, applicable a11y labels) must work in the three current locales.
- Deferred locales are NEVER counted as failed implementation; every reference must be labelled FUTURE / DEFERRED.
- Historical six/eight-locale texts remain as history, marked superseded where they state scope.

Supersedes the locale-set portion of D-V5-01.
