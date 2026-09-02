# V5 Comfort Mode UX Specification

**Status:** Canonical (reconstructed V5-01, 2026-08-24)
**Authority note:** The original file was found untracked and binary-corrupted; per Founder instruction its contents were NOT guessed at. This reconstruction is drawn strictly from the surviving canonical contracts listed below. If Founder holds an original copy, it may supersede wording — not contract.

**Surviving sources:** V5_JOURNAL_INNER_WORK_SPEC.md §3 · V5_DAILY_RHYTHM_SPEC.md §3/§4 (REST/COMFORT path, suppression) · V5_PRODUCT_PHILOSOPHY.md (Companion First, Return Without Guilt) · V5_SECURITY_PRIVACY.md (Comfort Mode Privacy) · V5_NOTIFICATION_FCM_SPEC.md §5 (suppression) · D-V5-08/13/14.

---

## 1. Definition

Comfort Mode is **NOT a journal type** and **NOT a route**. It is a first-class, optional **interaction state** in the Daily Rhythm — equal in validity to LEARN / REFLECT / JOURNAL paths (D-V5-13).

Purpose: let users who are tired, overwhelmed, or simply unwilling to engage still have a complete, successful Bhumi interaction built on calm presence.

## 2. Entry Points

- Check-in options: Tired → Comfort primary; Overwhelmed → Comfort primary; I do not know → Comfort immediate (V5_DAILY_RHYTHM_SPEC §3).
- Dashboard optional path REST/COMFORT.
- Absence return flow.
- Any moment the user opts out of analysis.

## 3. Experience Contract

| Rule | Contract |
|---|---|
| Tone | Calm presence; companionship without agenda |
| Length | Max ~4 sentences per surface |
| Memory | May gently resurface ONE warm prior theme (Memory resurface); never a task list |
| Actions | At most one invitational micro-action ("want to just breathe?"); always skippable |
| Completion | Reaching Comfort Mode IS a valid successful Daily Rhythm completion (Do Nothing valid, D-V5-14) |

## 4. Privacy Contract

- No new memory capture inside Comfort Mode unless the user explicitly saves content.
- No premium upsell anywhere in Comfort Mode.
- No streak/guilt language ever.

## 5. Notification Suppression

While the session is in Comfort Mode: non-absence notifications suppressed (FCM spec §5). Low-energy pattern (3+ Tired check-ins) reduces frequency.

## 6. Non-Requirements

- Not therapy, not diagnosis, not crisis tool (crisis keywords follow T3-07 resource-card path).
- No checklist, no completion UI, no badges.
- No separate `/comfort` route.

## 7. Acceptance Criteria (for Sprint V5-03/V5-05 implementation)

- [AC-CM-01] Reachable from check-in, dashboard path, journal hub, absence return.
- [AC-CM-02] Surfaces ≤4 sentences; zero task framing.
- [AC-CM-03] Optional memory resurface (max one theme, attributed).
- [AC-CM-04] Counts as Daily Rhythm completion in state tracking.
- [AC-CM-05] Suppresses non-absence notifications for the session.
- [AC-CM-06] No memory writes unless user explicitly saves.
