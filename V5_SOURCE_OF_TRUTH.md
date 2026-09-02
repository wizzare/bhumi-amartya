# V5 Source of Truth

**Status:** Canonical

**Supersedes:** SOT_V5_BHUMI_AMARTYA_APLIKASI.md (historical)

---

## 1. Purpose

This document defines the final V5 product specifications.

---

## 2. V5 Definition

**V5 = USER HABIT + LIVING INTELLIGENCE**

V5 is a personal companion for self-understanding.

---

## 3. V5 Four Core Engines

### 3.1 DAILY RHYTHM

Adaptive daily loop, not mandatory checklist:

- daily check-in (optional, adaptive)
- Daily Note / Catatan Hari Ini
- Daily Guidance
- tiny actionable step (inline, optional)
- evening reflection (optional, contextual)
- personal rhythm (learned, not enforced)
- notification/reminder architecture (guilt-free, personalized)

The Daily Rhythm MUST NOT become a checklist, streak system, mandatory sequence, or daily productivity task list.

### 3.2 INNER WORK (JOURNALING)

**Five journal modes** (all share the same JournalEntry foundation with a journalType discriminator):

1. FREE - Just let me write.
2. CBT - Help me understand what is happening in my thinking.
3. EMOTION - Help me understand what I am feeling.
4. GUIDED - Guide me through reflection.
5. SPIRITUAL_AWAKENING - Help me explore the meaning of this experience. (Renamed from SPIRITUAL per Founder directive J0-01 / V5_JOURNALING_PRD §0 — V5-01.)

Plus one UX concept:

- COMFORT MODE - a first-class interaction path (not an alternative) for users who feel tired, overwhelmed, or simply want to be accompanied. Not a journal type. Do Nothing is a valid successful interaction.

### 3.3 LIVING INTELLIGENCE

Memory as useful continuity, not surveillance:

- memory continuity (user-scoped, encrypted, local-first)
- meaningful recurring themes (3+ occurrences, 90-day decay, pinnable)
- pattern recognition (context-aware, not continuous)
- growth tracking (progress signals without pressure)
- longitudinal context (declared goals, important context)
- personalization (attributed, user-controllable)
- personal rhythm (learned timing, not enforced)

Memory is NOT store everything the user ever wrote. Memory retains useful continuity that helps Bhumi understand the user ongoing journey. No fake personalization - only user-declared or clear 3+ patterns.

#### Build 100 Moat Audit Reconciliation (2026-08-22)

**Current:**
*   Memory infrastructure implemented
*   Derived memory/pattern detection implemented
*   AI personalization loop **PROVEN**
*   Deterministic recommendation loop **PROVEN (closed 2026-08-24)** — journeyContext wired into scoring with regression tests

**Open:**
*   [M3-01: Unify Journey local/cloud memory source](V5_TODO.md#m3-01-unify-journey-localcloud-memory-source)
*   [M3-02: Persist Section 2 `currentIssue` as longitudinal Wellness context](V5_TODO.md#m3-02-persist-section-2-currentissue-as-longitudinal-wellness-context)

> **M4 closure evidence (2026-08-24 audit):** `SelectWellnessPackagesInput.journeyContext` (wellnessRecommendationEngine.ts:114); `scoreCandidate` helped=+4 / skipped=-6 (:305-306); curation passes built context (wellnessCurationService.ts:517-528); tests `tests/unit/m4-journey-memory-integration.test.ts` + `tests/unit/m4-02-journey-context-wiring.test.ts`.



### 3.4 GLOBAL FOUNDATION

Includes:

- internationalization (CURRENT: id-ID default, en-US, ms-MY; FUTURE/DEFERRED: es-ES, pt-BR, fr-FR — D-V5-35)
- locale handling (react-i18next, fallback: active -> en -> id-ID)
- translated AI output (attributed to source)
- localized notifications (personalized, frequency-aware)
- timezone awareness (user local time, not UTC)
- culturally appropriate language
- missing-key fallback
- locale persistence (profile + localStorage)

---
---

## 4. Global Foundation — Locale Specification

| Property | Value |
|----------|-------|
| **Supported locales (CURRENT)** | id-ID (default), en-US, ms-MY |
| **Deferred locales (FUTURE)** | es-ES, pt-BR, fr-FR — out of current V5 scope (D-V5-35) |
| **Default locale** | id-ID |
| **Fallback hierarchy** | If a string is missing for a locale, fall back to en; if still missing, fall back to id-ID. |
| **Locale persistence** | User locale preference persists in user profile (user.language field) and localStorage. |
| **AI language awareness** | AI-generated content (Daily Guidance, insights) must render in the user locale. |
| **Notification localization** | All notifications must be localized to the user locale. |
| **RTL support** | Not required (all 6 target locales are LTR). |

> Locale history: prior three-way/8-locale/6-locale targets are all superseded. CURRENT canonical scope (D-V5-35): id-ID (default), en-US, ms-MY. Deferred: es-ES, pt-BR, fr-FR.

---

## 5. Blueprint Layer (EXISTING CONTEXT — Reuse, Do Not Rebuild)

The following **11 Blueprint systems** (official **Cetak Biru Jiwa**) exist in V4 and are **REUSED** in V5 as context/identity layer for personalization. They are NOT the primary daily habit loop and must NOT be rebuilt as a V5 feature.

| # | Blueprint System | Engine Location | Role in V5 |
|---|------------------|-----------------|------------|
| 1 | **Life Path** (Numerology) | lib/calculations/calculateLifePath.ts, lib/calculations/calculateNumerology.ts | Core identity number & archetype; identity context for prompts |
| 2 | **Destiny Matrix** | lib/calculations/calculateDestinyMatrix.ts, lib/calculations/destinyMatrix/mapToBlueprint.ts, lib/engines/destinyMatrix*.ts | Chart context for reflection; arcana center & karmic lines |
| 3 | **Human Design** | lib/humandesign/calculateHumanDesign.ts, lib/humandesign/hdkitAdapter.ts | Type, profile, gates, channels, authority, centers; +58° mandala offset |
| 4 | **Natal Chart** | lib/astrology/calculateNatalBasics.ts, lib/astrology/calculateNatalBasicsAsync | Sun/moon/rising, houses, planets, aspects, patterns, dominance |
| 5 | **Weton** | lib/weton/calculateWeton.ts | Indonesian traditional calendar; pasaran & hari cycle |
| 6 | **BaZi** | lib/bazi/calculateBazi.ts, lib/bazi/baziMeaning.ts | Four Pillars of Destiny; Chinese metaphysical system |
| 7 | **Vedic Astrology** | lib/vedic/calculateVedic.ts | Jyotish chart; dashas, nakshatras, yogas |
| 8 | **Tzolkin Maya** | lib/tzolkin/calculateTzolkin.ts | Mayan sacred calendar; kin, tone, solar tribe |
| 9 | **Whole Sign Birth Chart** | lib/whole-sign/calculateWholeSign.ts | Whole sign house system; alternative to Placidus |
| 10 | **Astrocartography** | lib/astrocartography/calculateAstrocartography.ts | Locational astrology; planetary lines on world map |
| 11 | **Zi Wei Dou Shu** | lib/zi-wei/calculateZiWei.ts | Purple Star Astrology; Chinese emperor astrology |

> **Note:** Astrocartography and Zi Wei Dou Shu currently have type/model coverage gaps in the Blueprint type definition (lib/types/blueprint.ts). They have engines and UI routes but are not fully represented in the Blueprint type. This is a technical consistency gap flagged for implementation.

Calculation accuracy of these engines is NOT independently re-verified in V5; golden-dataset validation is a prerequisite before V5 claims correctness (see [V5_DECISION_LOG.md#d-v5-06-engine-accuracy](V5_DECISION_LOG.md#d-v5-06-engine-accuracy)).

---

### Supporting Systems (Existing Context — Reuse, Do Not Rebuild)

The following systems exist in V4 and are **REUSED** in V5 as supporting context/behavioral infrastructure. They are **NOT** Blueprint systems.

| System | Role in V5 |
|--------|------------|
| Wellness Engine (lib/engines/wellness*Engine.ts) | Emotional state mapping for daily guidance |
| Arsip Akashi (lib/arsipAkashi/*) | Soul letter archive for narrative depth |

Calculation accuracy of these engines is NOT independently re-verified in V5; golden-dataset validation is a prerequisite before V5 claims correctness (see [V5_DECISION_LOG.md#d-v5-06-engine-accuracy](V5_DECISION_LOG.md#d-v5-06-engine-accuracy)).

---

## 6. V4 Closure Requirements (V5 Pre-requisites)

The following V4 items must be closed before V5 implementation begins (P0 release blockers):

| Item | Status | Evidence / Location |
|------|--------|---------------------|
| Journal prompt injection risk | OPEN | lib/prompts/dailyGuidancePrompt.ts:71 — unescaped journal text in prompt |
| Client PII logging | OPEN | authActions.ts, AuthContext.tsx, app/login/page.tsx — raw email/uid logged |
| Gemini direct bypass of AIGateway | OPEN | lib/orchestrators/dailyGuidanceOrchestrator.ts:89 bypasses gateway |
| Journal autosave/draft persistence | OPEN | components/journal/JournalInput.tsx — no autosave; text lost on refresh |
| ms-MY crash | OPEN | lib/data/translations.ts — phantom dict for ms-MY |
| Dashboard Daily Note not mounted | OPEN | components/dashboard/DashboardClient.tsx — generates/computes but does not render DailyNoteV2 |

See [V4_UNFINISHED_WORK.md](V4_UNFINISHED_WORK.md) for full list.

---

## 7. Experience Principles (from V5_EXPERIENCE_ARCHITECTURE.md)

- **Comfort > Engagement hacks** — Do Nothing is a valid successful interaction
- **Meaning > Activity** — No fake personalization; only user-declared or 3+ patterns
- **Continuity > Streaks** — No streak UI, no completion checklist, no badges
- **Personalization > Automation** — Attributed, user-controllable, disableable
- **Trust > Retention manipulation** — No guilt, no shame, no manufactured urgency
- **Small useful moments > Large daily workloads** — Adaptive loop, not mandatory sequence
- **Companion > Taskmaster** — Calm, present, non-demanding, contextual
- **Environment as geophysical context** — Kondisi Lingkungan layer (weather/AQI/seismic/geomagnetic/Schumann) with provenance + three-layer framing; weak signal only (D-V5-34)
- **Astro as contextual lens** — Sky context informs Wellness/Catatan/Weekly; it never diagnoses or overrides user state (D-V5-26)
- **Subscription display price Rp25.000/bulan** — UI copy only; real Play price governed by Play Console; live Play prices win where rendered (D-V5-32)

---

## 8. References

[V5_DESIGN_CONTRACT.md](V5_DESIGN_CONTRACT.md) — design synthesis (principles, experience, identity, subscription)

[V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md) — philosophy, principles, habit philosophy
[V5_PRD.md](V5_PRD.md) — functional requirements
[V5_TODO.md](V5_TODO.md) — phased task list
[V5_DECISION_LOG.md](V5_DECISION_LOG.md) — ratified decisions
[V5_ARCHITECTURE.md](V5_ARCHITECTURE.md) — system architecture
[V5_I18N_SPEC.md](V5_I18N_SPEC.md) — i18n specification
[V5_DAILY_RHYTHM_SPEC.md](V5_DAILY_RHYTHM_SPEC.md) — daily habit loop
[V5_JOURNAL_INNER_WORK_SPEC.md](V5_JOURNAL_INNER_WORK_SPEC.md) — journaling
[V5_CBT_JOURNAL_DESIGN.md](V5_CBT_JOURNAL_DESIGN.md) — CBT journal
[V5_COMFORT_MODE_UX_SPEC.md](V5_COMFORT_MODE_UX_SPEC.md) — Comfort Mode
[V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md](V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md) — Memory
[V5_DATA_MODEL.md](V5_DATA_MODEL.md) — data model
[V5_NOTIFICATION_FCM_SPEC.md](V5_NOTIFICATION_FCM_SPEC.md) — FCM
[V5_SECURITY_PRIVACY.md](V5_SECURITY_PRIVACY.md) — security & privacy
[V4_AUDIT_BUILD_99_100.md](V4_AUDIT_BUILD_99_100.md) — V4 audit evidence
[V4_UNFINISHED_WORK.md](V4_UNFINISHED_WORK.md) — V4 closure list
[V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md) — experience architecture synthesis
