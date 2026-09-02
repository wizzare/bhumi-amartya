# V5 Security & Privacy Requirements

**Status:** Canonical
**Related:** [V5_SOURCE_OF_TRUTH.md](V5_SOURCE_OF_TRUTH.md), [V5_ARCHITECTURE.md](V5_ARCHITECTURE.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## 1. Security Release-Blockers (P0)

1. **Prompt Injection Sanitization:**
   - Location: lib/prompts/dailyGuidancePrompt.ts:71
   - Requirement: Escape/sandbox journal and wellness free-text before concatenating into AI prompts.
2. **PII Console Logging Removal:**
   - Locations: authActions.ts, AuthContext.tsx, app/login/page.tsx
   - Requirement: Remove raw email/uid logging; use redacted tokens ([EMAIL], [UID]).
3. **AI Gateway Bypass Fix:**
   - Location: lib/orchestrators/dailyGuidanceOrchestrator.ts:89
   - Requirement: Route via AIGateway.generateStructuredJson() instead of direct Gemini call.
4. **Firestore Rules Coverage:**
   - Requirement: Add rules for feedback collection (write), admin_users (read), journals (user-scoped), livingIntelligenceMemory (user-scoped), dailyState (user-scoped).

---

## 2. Privacy Principles

- **Zero Surveillance:** Memory and analytics collect minimal necessary context; no third-party tracking of journal content.
- **Data Deletion:** Account deletion must purge Firestore data, auth records, and revoke server-side Google Play subscriptions.
- **Local-First Safety:** LocalStorage data is scoped per UID (bhumiJournalEntries:, bhumiJournalDrafts::).
- **Personalization Without Surveillance:** No fake personalization - only user-declared or 3+ patterns. Attributed, user-controllable, disableable.
- **Comfort Mode Privacy:** No new memory capture in Comfort Mode unless user explicitly saves. No premium upsell.

---

## 3. Memory Privacy Boundaries

- Memory data is encrypted at rest (Firestore) and in transit.
- No AI training on user memory content.
- No third-party access.
- User can request full memory deletion at any time (Memory Dashboard).
- Opt-in for raw journal text memory (default = themes only).
- Decay: themes without reinforcement decay over 90 days (configurable). User can pin to retain.
- User control: view, edit, delete, export at any time.

---

## 4. Journal Privacy Controls

- Per-entry privacy: lock, hide, local-only.
- Draft persistence in localStorage only (bhumiJournalDrafts::).
- Export: user-controlled (PDF/JSON/text).

---

## 5. Comfort Mode Privacy

- No new memory capture unless user explicitly saves.
- No premium upsell in Comfort flow.
- No notification nudges during Comfort Mode session.

---

## 5. CBT Safety Boundaries

- Crisis keywords (suicide, self-harm, abuse) -> immediate resource card, NOT AI response.
- Resource card: local crisis lines, emergency services, professional help directories.
- Non-diagnostic enforcement: automated scan for clinical language in AI outputs.
- No clinical language in CBT UI or AI outputs.

---

## 6. Notification Privacy

- Opt-in per category (daily / return / weekly / milestone).
- No notification during Comfort Mode session.
- Quiet hours: user-configured (default 22:00-07:00).
- Adaptive frequency reduction on dismiss (3 consecutive -> auto-reduce).
- No guilt/shame language ever (automated content scan).

---

## 7. Acceptance Criteria

- All P0 security items resolved in code before V5 release.
- Automated tests verify prompt sanitization and PII redaction.
- Firestore security rules pass emulator test suite.
- Memory Dashboard (view/edit/delete/export) functional with consent flow.
- CBT crisis detection -> resource card (not AI response) verified.
- No clinical language in CBT/AI outputs (automated scan).
- Notification opt-out rate <20% (if higher -> reduce frequency).
