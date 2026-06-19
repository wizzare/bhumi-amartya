# Wellness Navigator Validation: KARA V3

## 1. Mode: RECOVERY
**Triggers:**
*   Body Score < 30
*   Themes: Burnout, Anxiety, Life Crisis, Loss & Grief.

**Validation:**
*   **Matches State?** YES. These categories all represent high-drain states where the nervous system is likely over-taxed. Prioritizing rest and grounding is the correct clinical intuition.

---

## 2. Mode: REFLECTION
**Triggers:**
*   Themes: Meaning Crisis, Life Transition, Spiritual Crisis.

**Validation:**
*   **Matches State?** YES. These are cognitive and existential "re-wiring" phases. Pushing for growth or demanding recovery might be frustrating; inward focus via journaling and contemplation is the logical path.

---

## 3. Mode: GROWTH
**Triggers:**
*   Themes: Growth Phase, Spiritual Awakening.

**Validation:**
*   **Matches State?** YES. When the foundation (Body/Emotion) is strong, the user has the "bandwidth" for expansion.

---

## 4. Logical Integrity Issues
*   **Conflict:** If a user has `Body: 25` (Recovery) but `Theme: Spiritual Awakening` (Growth).
*   **Resolution:** The `getNavigatorMode` function prioritizes `Body < 30` over the Theme.
*   **Verdict:** This is a **SAFETY-FIRST** design choice. You cannot grow if you have no energy. This logic is validated as sound.
