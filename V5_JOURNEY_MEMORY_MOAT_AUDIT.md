# V5 JOURNEY MEMORY MOAT — AUDIT ADDENDUM

**Status:** Audit specification / implementation handoff
**Scope:** Wellness Sections 1–4 → Journey Memory → longitudinal personalization
**Mode:** No feature behavior is assumed to be complete unless proven by source, persistence, and read-back evidence.

## 1. Founder Question

> Apakah hasil dari Bagian 1–4 sudah terekam di Journey Memory sehingga menjadi MOAT?

### Verdict

**BELUM TERBUKTI sebagai MOAT.**

The current Wellness flow clearly produces and passes contextual data across Sections 1–4, but the available audit evidence does **not** prove a complete, durable pipeline in which the outputs of Sections 1–4 are normalized, persisted, compiled into Journey Memory, and then reliably reused for future personalization.

The key distinction is:

**context continuity ≠ memory continuity ≠ moat.**

A URL carrying `sourceTheme` proves only contextual handoff. A practice acknowledgement or journal save proves persistence of an event. A MOAT requires longitudinal memory that compounds over time and changes future experience based on what the user actually did, felt, selected, and confirmed.

## 2. Section-by-Section Audit

### Section 1 — Check-in

**Current evidence:** Section 1 contributes user-state signals into Wellness intelligence and the Section 1 → 2 → 3 → 4 chain.

**Not yet proven:** that the meaningful user signal is written into the canonical Journey Memory store with provenance, timestamp, confidence, and a later read path.

**Required evidence:**
- source record / persistence location;
- memory compilation step;
- Journey read path;
- proof that the memory affects a later recommendation or reflection.

**Status: PARTIAL / NOT PROVEN AS JOURNEY MEMORY.**

### Section 2 — Kondisimu Hari Ini

The current issue such as `Proses Pelepasan dan Duka yang Mendalam` is resolved through Wellness intelligence and becomes the Section 4 practice context. The W1 audit confirmed the carrier works for most practices.

**Important:** `sourceTheme` in a URL is transient context, not durable memory.

**Required:** persist the semantic condition/theme as a dated Wellness observation or derived insight, with provenance showing whether it came from user input, deterministic mapping, or AI interpretation.

**Status: CONTEXTUALIZED, BUT NOT PROVEN AS DURABLE JOURNEY MEMORY.**

### Section 3 — Rekomendasi Hari Ini

Recommendations are generated from Wellness intelligence and acknowledgement is persisted.

**Gap:** an acknowledged recommendation is not automatically a Journey Memory record. The system must distinguish:
- recommended;
- viewed;
- started;
- completed;
- skipped / dismissed;
- user-reported effect.

Only meaningful completed/confirmed behavior should become candidate memory, rather than treating every recommendation as a fact about the user.

**Status: EVENT PERSISTENCE EXISTS / MEMORY COMPILATION NOT PROVEN.**

### Section 4 — Praktik Tambahan

The Section 4 tiles carry `issue`, `practiceId`, `practiceCategory`, `sourceTheme`, and display `title` into target practices.

W1 established the context contract:
- `sourceTheme` = semantic context;
- `title` = display string.

This is useful for continuity, but it is **not yet a memory moat**.

Practice completion should create durable, attributable events such as:
- practice selected;
- practice started;
- practice completed;
- duration / completion metadata where available;
- context at time of practice;
- optional user reflection / effect.

**Status: CONTEXT CONTINUITY PROVEN; LONGITUDINAL MEMORY INTEGRATION NOT PROVEN.**

### Journaling

The legacy journal is the strongest candidate for memory because it contains user-authored reflection. Existing `memoryCompiler` infrastructure was previously audited as generic/partial and not differentiated by the planned V5 modes.

The critical audit question is not only whether journal entries are saved, but whether a safe, consented memory representation is compiled and then consumed by Journey.

**Status: JOURNAL PERSISTENCE ≠ JOURNEY MEMORY. COMPILATION/READ-BACK MUST BE PROVEN.**

## 3. What Counts as MOAT

For Bhumi, the Wellness → Journey moat should be defined as a **compounding personal context graph**, not a pile of logs.

Minimum loop:

```text
Section 1 user signal
        ↓
Section 2 interpreted condition / current theme
        ↓
Section 3 recommendation
        ↓
Section 4 selected + completed practice
        ↓
Journal / user reflection / outcome
        ↓
Memory compiler
        ↓
Canonical Journey Memory
        ↓
Next Wellness / Journey personalization
        ↓
User confirms, corrects, or rejects
        ↺
```

The loop becomes a moat only when repeated use makes the system more personally useful than a fresh session with no history.

## 4. Memory Layers

Do not put everything into one undifferentiated memory field.

### Layer A — Raw evidence

Examples: check-in answer, journal text, practice completion, recommendation acknowledgement.

### Layer B — Structured event

Normalized event with:
- event type;
- timestamp;
- source surface (Section 1/2/3/4/journal);
- practice id/category where relevant;
- issue/theme;
- user action/outcome;
- locale;
- provenance.

### Layer C — Derived memory

Examples:
- recurring themes;
- preferred practices;
- patterns the user explicitly confirms;
- helpful / unhelpful practice signals;
- longitudinal emotional or reflective patterns.

Derived memory must never be silently presented as a diagnosis or immutable truth.

### Layer D — Journey-facing context

A compact, queryable set of memories that can safely influence Journey and Wellness personalization.

## 5. Provenance Contract

Every durable memory candidate should preserve provenance such as:

- `user_written` — directly authored by the user;
- `user_selected` — explicitly selected by the user;
- `user_confirmed` — derived statement explicitly confirmed;
- `system_derived` — deterministic product inference;
- `ai_interpretation` — AI-generated interpretation;
- `ai_insight` — AI-generated longitudinal insight.

AI-derived information must not be promoted to the same certainty level as user-authored facts without confirmation.

## 6. Privacy / Consent Rule

Raw journal content and derived memory are different assets.

The implementation must support:
- user consent for memory compilation where required by the existing product contract;
- deletion / exclusion semantics;
- provenance and source traceability;
- no diagnostic labeling;
- no silent conversion of sensitive reflection into permanent profile facts.

## 7. Acceptance Criteria

The agent must not mark this work complete merely because data is written to a database.

Completion requires evidence for all of the following:

1. Section 1 signal can be traced from input → persistence → memory candidate → Journey read.
2. Section 2 current issue/theme can be traced from derived state → persistence → memory candidate → Journey read.
3. Section 3 recommendation lifecycle can be distinguished from mere recommendation generation.
4. Section 4 practice selection/completion can be traced to durable events.
5. Journaling can be traced from saved entry → safe memory compilation → Journey read.
6. Memory entries preserve provenance and timestamps.
7. The next Wellness/Journey experience demonstrably uses prior memory.
8. User confirmation/correction can prevent a derived inference from becoming an unquestioned fact.
9. Existing Build 100, billing, Widya, auth, Wellness, and approved Enneagram cleanup remain untouched unless directly required.
10. No Enneagram, MBTI, Big Five, Temperament, TA Blueprint, or additional blueprint system is introduced.

## 8. Non-Goals

- Do not reintroduce V5 five-mode Journaling in this audit task.
- Do not create per-journal-type routes.
- Do not redesign Wellness Section 1–4.
- Do not alter Audio Healing's external YouTube behavior.
- Do not invent clinical or diagnostic memory.
- Do not count URL query parameters as durable memory.

## 9. Founder-Level Outcome

The desired result is not merely:

> "Bhumi remembers what happened."

It is:

> **"Bhumi learns, with the user's permission and correction, what repeatedly matters to this person — and that history makes the next experience more relevant."**

That is the intended Journey Memory MOAT.
