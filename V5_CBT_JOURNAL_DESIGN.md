# V5 CBT Journal Design

**Status:** Canonical
**Conforms to:** [V5_JOURNAL_INNER_WORK_SPEC.md](V5_JOURNAL_INNER_WORK_SPEC.md), [V5_PRODUCT_PHILOSOPHY.md](V5_PRODUCT_PHILOSOPHY.md), [V5_EXPERIENCE_ARCHITECTURE.md](V5_EXPERIENCE_ARCHITECTURE.md)

---

## 1. Purpose

CBT Journal is NOT therapy, diagnosis, or clinical treatment. It is a structured cognitive reflection tool that helps users understand what is happening in their thinking.

> **Boundary:** The system does not diagnose. It does not replace professional care. It does not make clinical claims. The user retains full agency.

---

## 2. Prompt

Help me understand what is happening in my thinking.

---

## 3. Structure (8 Steps)

| Step | Field | Description |
|------|-------|-------------|
| 1 | situation | What happened? (factual description, not interpretation) |
| 2 | emotion | What emotions arose? (with intensity 0-100 or tag list) |
| 3 | automaticThought | What thoughts went through your mind? (user own words) |
| 4 | interpretation | How did you interpret the situation? What meaning did you assign? |
| 5 | evidence | What evidence supports this interpretation? What evidence contradicts it? |
| 6 | alternativePerspective | What is another way to see this? Is there a more balanced view? |
| 7 | underlyingNeed | Beneath the thought, what need is unmet? (safety, autonomy, connection, etc.) |
| 8 | nextStep | Optional: What could you do tomorrow that honors this need? |

### 3.1 Optional: Reflection Summary

After completion, the system may offer a reflection summary field (auto-generated or user-written) that captures the key insight from the session.

---

## 4. Data Model Integration

CBT fields are stored as optional nested objects on JournalEntry:

`	ypescript
interface CBTFields {
  situation: string;
  emotion: {
    tags: string[];       // free-tagged emotions
    intensity?: number;   // 0-100
  };
  automaticThought: string;
  interpretation: string;
  evidence: {
    supporting: string;
    contradicting: string;
  };
  alternativePerspective: string;
  underlyingNeed: string;
  nextStep?: string;
  reflectionSummary?: string;
}
`

See [V5_DATA_MODEL.md](V5_DATA_MODEL.md) for the full schema.

---

## 5. UX Guidelines

- Each step is a discrete screen OR an expandable section - no forced linear navigation.
- User may skip any step.
- User may leave nextStep blank.
- Language is neutral and exploratory: What thought came up? / Is there another way to see this?
- No validation that blocks saving - the user reflection is always valid as entered.

---

## 6. AI Interaction (Optional)

The system may offer gentle AI-powered reframing suggestions (e.g., Here is another way to consider this), but:

- AI suggestions are presented as one possible perspective, not truth.
- User can always override or ignore.
- AI must NOT claim clinical expertise.
- AI must NOT generate a diagnosis.

---

## 7. Clinical Boundary Enforcement (Safety - P1)

- Crisis keywords (suicide, self-harm, abuse) -> immediate resource card, NOT AI response.
- Resource card includes: local crisis lines, emergency services, professional help directories.
- Non-diagnostic enforcement: no clinical language in output (no disorder labels, no pathology framing).
- Regular boundary audit: automated scan for diagnostic language in AI outputs.

---

## 8. Progress Tracking (P1)

- CBT insights over time view: recurring automaticThought patterns, evidence/alternative balance, underlyingNeed trends.
- User-facing dashboard: My CBT journey - patterns, progress, insights.

---

## 9. V4 Baseline

V4 has no CBT journal. This is a new design for V5.

---

## 10. Acceptance Criteria

- [AC-CBT-01] User can start a CBT journal entry from any Inner Work entry point.
- [AC-CBT-02] User can save a partial CBT entry (steps completed so far).
- [AC-CBT-03] User can navigate between CBT steps non-linearly.
- [AC-CBT-04] No clinical/diagnostic language appears in CBT UI.
- [AC-CBT-05] cbt fields are stored nested on the JournalEntry.
- [AC-CBT-06] CBT entries appear correctly in the entry history with journalType: CBT.
- [AC-CBT-07] Crisis keywords trigger resource card, not AI response.
- [AC-CBT-08] No clinical/diagnostic language in AI outputs (automated scan).
