# V5 JOURNEY MEMORY MOAT — TODO

**Status:** New audit-driven implementation track
**Branch:** `audit/journey-memory-moat`
**Rule:** Audit first. Implement only after evidence confirms the existing persistence/read architecture.

## J0 — Architecture Audit / Source of Truth

- [ ] **J0-01** Trace Section 1 check-in input to its exact persistence model.
- [ ] **J0-02** Trace Section 2 `currentIssue` / condition / capacity / context to persistence and determine whether it is durable or only daily derived state.
- [ ] **J0-03** Trace Section 3 recommendation lifecycle: generated → viewed → acknowledged → started → completed → outcome.
- [ ] **J0-04** Trace every Section 4 practice completion/save event and identify what is currently persisted.
- [ ] **J0-05** Trace journal save → repository → memoryCompiler → Journey read path.
- [ ] **J0-06** Identify the canonical Journey Memory store and its current schema.
- [ ] **J0-07** Identify existing consent/privacy/deletion mechanisms that must be reused.
- [ ] **J0-08** Produce a source-evidence matrix before changing code.

## J1 — Canonical Memory Event Contract

- [ ] **J1-01** Define one normalized memory-event contract covering Sections 1–4 and Journaling.
- [ ] **J1-02** Include source surface, event type, timestamp, user action/outcome, issue/theme, practice id/category, locale, and provenance.
- [ ] **J1-03** Separate raw evidence from derived memory.
- [ ] **J1-04** Define provenance values and certainty rules.
- [ ] **J1-05** Ensure URL `sourceTheme` is treated as transient context, never as durable memory by itself.
- [ ] **J1-06** Define retention/deletion behavior using existing product infrastructure.

## J2 — Section 1 → Memory

- [ ] **J2-01** Persist meaningful user check-in signals as candidate events using the existing data layer.
- [ ] **J2-02** Preserve user-authored/selected provenance.
- [ ] **J2-03** Make the memory queryable by Journey.
- [ ] **J2-04** Add read-back test proving a later Journey context can retrieve the prior signal.

## J3 — Section 2 → Memory

- [ ] **J3-01** Persist the semantic current condition/theme when it is appropriate to become longitudinal context.
- [ ] **J3-02** Preserve whether the theme came from user input, deterministic mapping, or AI interpretation.
- [ ] **J3-03** Do not convert a temporary daily issue into a permanent fact without the appropriate confidence/provenance rule.
- [ ] **J3-04** Add read-back test from Journey.

## J4 — Section 3 → Memory

- [ ] **J4-01** Model recommendation lifecycle separately from memory.
- [ ] **J4-02** Record completion only when completion is actually established.
- [ ] **J4-03** Capture user-reported helpful/unhelpful outcome where existing UX supports it.
- [ ] **J4-04** Do not treat recommendation generation alone as evidence about the user.
- [ ] **J4-05** Add read-back test proving completed practices can influence future personalization.

## J5 — Section 4 → Memory

- [ ] **J5-01** Audit Yoga, Workout, Meditation, Herbal, Manifestasi, Journaling, and Audio Healing separately.
- [ ] **J5-02** Preserve the existing Zone-B semantic contract (`sourceTheme` semantic; `title` display-only).
- [ ] **J5-03** Persist meaningful practice selection/completion events through existing repositories.
- [ ] **J5-04** Do not create memory events for Audio Healing merely because a YouTube CTA was opened; preserve its external-by-design behavior.
- [ ] **J5-05** Add per-practice read-back evidence.

## J6 — Journaling → Memory

- [ ] **J6-01** Audit the legacy journal repository and existing memoryCompiler implementation before changing it.
- [ ] **J6-02** Preserve raw journal entry separately from derived memory.
- [ ] **J6-03** Compile only safe, provenance-aware memory candidates.
- [ ] **J6-04** Prevent AI interpretation from silently becoming a user fact.
- [ ] **J6-05** Verify Journey can retrieve prior journal-derived context.
- [ ] **J6-06** Verify deletion/exclusion semantics propagate to derived memory where required.

## J7 — Journey Read / Personalization Loop

- [ ] **J7-01** Identify the exact Journey page/service that consumes memory.
- [ ] **J7-02** Connect the canonical memory query to Journey using existing architecture.
- [ ] **J7-03** Ensure memory affects future personalization only when relevant and sufficiently supported.
- [ ] **J7-04** Add user correction/confirmation behavior for derived insights where the existing product pattern supports it.
- [ ] **J7-05** Add a longitudinal integration test: prior Sections 1–4 activity → memory → later Journey output.
- [ ] **J7-06** Add regression tests for a new user with no memory.
- [ ] **J7-07** Add regression tests for stale/conflicting memory.

## J8 — MOAT Verification

- [ ] **J8-01** Demonstrate that repeated user behavior improves personalization over time.
- [ ] **J8-02** Demonstrate provenance for every surfaced memory.
- [ ] **J8-03** Demonstrate that memory can be corrected/removed without leaving an inconsistent Journey state.
- [ ] **J8-04** Document the final Wellness → Journey Memory loop in the canonical architecture docs.
- [ ] **J8-05** Update `V5_TODO.md` and `V5_IMPLEMENTATION_ROADMAP.md` only after implementation evidence is complete.

## Definition of Done

This track is complete only when:

- Sections 1–4 have an evidence-backed persistence path;
- meaningful events are compiled into canonical Journey Memory;
- provenance and privacy rules are enforced;
- Journey reads that memory;
- a later user experience is measurably/contextually personalized by prior activity;
- tests prove the full loop;
- no unrelated product architecture is changed.
