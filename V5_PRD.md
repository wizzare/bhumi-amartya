# V5 Product Requirements Document

**Status:** Canonical — defines functional requirements for Bhumi V5.

**Supersedes:** PRD_V5_BHUMI_AMARTYA_APLIKASI.md (historical, see [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)).

**Conforms to:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md).

---

## 1. Product Vision

V5 = USER HABIT + LIVING INTELLIGENCE. Bhumi is a companion that understands the user rhythm — not a taskmaster. The objective is to make Bhumi feel useful, safe, personal, emotionally comfortable, context-aware, and worth returning to.

---

## 2. V5 Four Core Engines

### 2.1 DAILY RHYTHM

The adaptive daily relationship loop (conceptual, not mandatory):

`
OPEN
→ ORIENTATION
→ NEED DISCOVERY
→ OPTIONAL PATH
→ VALUE
→ MEMORY
→ FUTURE RELEVANCE
`

Requirements:

- R-PRD-01: The app opens to an orientation that adapts to user state (new/returning/same-day/absence).
- R-PRD-02: Need discovery (check-in) is always optional. Options: Tired / Curious / Reflective / Overwhelmed / Same as yesterday / I do not know / Just show me.
- R-PRD-03: Based on check-in + Memory, the system generates a Daily Note (Catatan Hari Ini) and/or Daily Guidance.
- R-PRD-04: A tiny actionable step is offered as an optional micro-suggestion, inline in the Daily Note.
- R-PRD-05: Optional paths (user chooses, not system): Learn / Reflect / Journal / Talk / Explore / Rest (Comfort) / Do Nothing.
- R-PRD-06: Do Nothing is a valid successful interaction — user can complete Daily Rhythm without any action.
- R-PRD-07: Evening reflection is optional, contextual (only if user journaled/reflected).
- R-PRD-08: The dashboard must NOT be a mandatory checklist. Each step is invitational. No streak UI, no completion checklist.
- R-PRD-09: Returning-user behavior: greeting with context (last theme, gap acknowledgment). No guilt language.
- R-PRD-10: Graceful empty/failure states: AI failure → fallback note; empty note → Comfort Mode; network error → cached content.
> **ID RECONCILIATION (2026-08-24):** The Astro requirements previously collided with the Journaling block below (both used R-PRD-11..17). Journaling keeps R-PRD-11..20 (referenced by V5_JOURNALING_PRD/TODO); the Astro block is renumbered R-PRD-35..41. No requirement text changed.

- R-PRD-35: Astro Today provides a single Daily Astro Synthesis combining current sky, moon, dynamic Western transits/retrogrades, current-day Tzolkin/Weton, eclipses, and canonical large-cycle signals.
- R-PRD-36: Daily Astro Synthesis feeds as contextual input into Wellness, Catatan Hari Ini, and Panduan Minggu Ini; it is a lens, not a diagnosis.
- R-PRD-37: Western sky events are dynamic and variable-count per day; no fixed item limit.
- R-PRD-38: Tzolkin and Weton in Astro Today are current-day calendar systems only (no birth-data personalization).
- R-PRD-39: Eclipse contract: show both Global Next and Local/Visible Next (when visibility data is reliable); no countdown UI; no hardcoded eclipse list.
- R-PRD-40: Blueprint section removed from Astro Today; Blueprint retains its dedicated section.
- R-PRD-41: Astrology is contextual lens only — never diagnoses, never overrides Wellness/Journey/user state, never determines emotional/health conditions.
- R-PRD-42: Canonical user-facing monthly subscription display price is Rp25.000/bulan (localized representation for non-id locales). The actual Google Play charge is governed exclusively by Play Console pricing for `bhumi_premium_monthly` / base plan `monthly` and must never be spoofed client-side; where the app shows a live Play price (queryProducts formattedPrice), that value wins over any hardcoded copy.

See [V5_DAILY_RHYTHM_SPEC.md](V5_DAILY_RHYTHM_SPEC.md).

### 2.2 INNER WORK (JOURNALING)

Five modes + one UX concept.

Requirements:

- R-PRD-11: All five journal modes share the same JournalEntry data model with a journalType discriminator field.
- R-PRD-12: Journal types: FREE, CBT, EMOTION, GUIDED, SPIRITUAL_AWAKENING. (Fifth mode renamed from SPIRITUAL per Founder directive J0-01; display name "Spiritual Awakening".)
- R-PRD-13: CBT Journal is a structured reflection tool (Situation, Emotion, Automatic Thought, Interpretation, Evidence/Alternative Perspective, Underlying Need, Next Step, Reflection Summary). It must NOT diagnose, must NOT make clinical claims, must NOT replace professional care.
- R-PRD-14: Comfort Mode is a first-class interaction path (not an alternative entry). Accessible from check-in, Dashboard, Journal, and absence return.
- R-PRD-15: Draft autosave every 30s with conflict resolution UI. Draft list per mode.
- R-PRD-16: Journal history with timeline, search (full-text + semantic), filters (mode/mood/tags/date), export (PDF/JSON/text).
- R-PRD-17: Continue yesterday thread shortcut from Daily Rhythm and Journal hub.
- R-PRD-18: Mood trend visualization (progress without streaks).
- R-PRD-19: AI response: reflective only, never diagnostic; user-controllable per mode; crisis keywords → resource card.
- R-PRD-20: Per-entry privacy controls (lock, hide, local-only).

See [V5_JOURNAL_INNER_WORK_SPEC.md](V5_JOURNAL_INNER_WORK_SPEC.md).

### 2.3 LIVING INTELLIGENCE (MEMORY)

Requirements:

- R-PRD-21: Memory retains useful continuity (preferences, recurring themes 3+, long-term goals, declared context, behavioral patterns, progress signals).
- R-PRD-22: Memory does NOT automatically store every journal entry, every transient emotion, or raw sensitive content without explicit consent.
- R-PRD-23: Users have visibility and control over their memory (view, edit, delete, export) — Memory Dashboard at P1.
- R-PRD-24: Memory retrieval is context-aware (date, mood, journal type, identity context, declared goals).
- R-PRD-25: Memory → Experience pipeline: Journal → Extraction → Memory → Pattern → Insight → Future Experience Adaptation.
- R-PRD-26: Boundary rules: no diagnosis, no overinterpretation (max 1 theme/note), no forced topic, no repeated mentions (max 1/week), opt-in for raw text, user-scoped only.
- R-PRD-27: Decay: themes without reinforcement decay over 90 days (configurable). User can pin to retain.
- R-PRD-28: Weekly reflection synthesis (opt-in) and monthly pattern summary.

See [V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md](V5_MEMORY_LIVING_INTELLIGENCE_SPEC.md).

### 2.4 GLOBAL FOUNDATION

Requirements:

- R-PRD-29: CURRENT locales: id-ID (default), en-US, ms-MY. FUTURE/DEFERRED: es-ES, pt-BR, fr-FR (D-V5-35).
- R-PRD-30: Fallback hierarchy: missing key → n → id-ID.
- R-PRD-31: AI-generated content renders in the user locale with source attribution.
- R-PRD-32: All notifications are localized.
- R-PRD-33: Locale persists to user profile and localStorage.
- R-PRD-34: Locale switcher is visible and functional.

See [V5_I18N_SPEC.md](V5_I18N_SPEC.md).

---

## 3. Cross-Cutting Requirements

| ID | Requirement | Applies To |
|----|-------------|------------|
| R-XC-01 | Companion-first interaction model | All touchpoints |
| R-XC-02 | Gentle habit philosophy — no streak pressure | Daily Rhythm |
| R-XC-03 | Return without guilt | Daily Rhythm |
| R-XC-04 | AI as Companion, Not Authority | AI-generated content |
| R-XC-05 | Privacy-first memory | Living Intelligence |
| R-XC-06 | Cultural respect in localization | Global Foundation |
| R-XC-07 | No clinical/diagnostic claims | CBT Journal, AI content |
| R-XC-08 | User agency — always optional | All flows |
| R-XC-09 | No fake personalization — attributed, user-controllable | All personalization |
| R-XC-10 | Do Nothing as valid completion | Daily Rhythm |

---

## 4. Non-Requirements

V5 does NOT:

- Rebuild the identity/calculation engines (numerology, astrology, Human Design, Destiny Matrix).
- Build a full localization system from scratch without react-i18next.
- Diagnose users or make clinical claims.
- Force streak maintenance or consistency.
- Turn the dashboard into a mandatory checklist.
- Store everything the user ever wrote as memory.
- Replace professional care with AI.
- Build notifications without FCM infrastructure.
- Create streak UI, completion checklist, badges, social comparison, mandatory daily steps.
- Premium upsell inside Comfort Mode.

---

## 5. Release Criteria

Before V5 release:

- All V4 P0 closure items resolved (see [V4_UNFINISHED_WORK.md](V4_UNFINISHED_WORK.md)).
- Security audit passed.
- Privacy audit passed.
- Locale test suite passed (id-ID/en-US/ms-MY, missing-key fallback, ms-MY no-crash; deferred locales excluded from gate).
- Firestore rules verified (feedback write, admin_users read).
- FCM infrastructure live with personalization.
- Golden-dataset validation for calculation engines (numerology, astrology, HD, Destiny Matrix).
- Memory Dashboard (view/edit/delete/export) functional.
- Journal draft recovery + history/search functional.
- Adaptive check-in + returning-user behavior functional.
- Comfort Mode as first-class path functional.


---

## 6. Environment / Geophysical Context (Ratified D-V5-34)

- R-PRD-43: The Dashboard "Kondisi Lingkungan Hari Ini" surface is a canonical V5 Environment Context layer with one primary source per domain: Weather=Open-Meteo, AirQuality=Open-Meteo AQ, Sun/Moon/Circadian=astronomy-engine, Seismic=USGS FDSN, Geomagnetic=NOAA SWPC planetary Kp, Schumann=schumannresonancelive.com API.
- R-PRD-44: Every environment domain carries provenance (source, status, observedAt) and freshness; unavailable data renders as "Data belum tersedia" — fabricated defaults are forbidden.
- R-PRD-45: Schumann presentation is three-layered: (1) Observation — modelled SR1–SR5/intensity/amplitude with explicit MODEL label, UTC timestamp and source; rendered as the Bhumi 24h Context Graph accumulated from real API observations with an honest availability window; (2) Interpretation — Bhumi environmental reading; (3) Spiritual/energetic reading in genuine Bhumi vocabulary (energetic shifts, grounding, collective field, sensitivity). No medical, diagnostic, or deterministic emotional-causation claims anywhere; layers remain visually and copy-wise distinguishable.
- R-PRD-46: Environment Context is an optional weak contextual input to Daily Context (Catatan Hari Ini) and Wellness; it never overrides user state, check-ins, or Journey Memory, and never merges geomagnetic (NOAA) with Schumann status into one undifferentiated "energy level".
