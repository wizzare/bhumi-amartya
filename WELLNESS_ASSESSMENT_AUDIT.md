# Wellness Assessment Audit: KARA V3

## 1. Question Generation
The system employs a multi-tiered approach to question selection, moving from static to adaptive.

### Question Selection Mechanism
*   **Initial/Monthly Assessment:** Uses the full set of questions (25+ questions) across all 5 dimensions.
*   **Weekly Assessment:** Selects 3 random questions per dimension (Total 15).
*   **Daily Assessment:** Selects 1 random question per dimension (Total 5).
*   **Current UI (V3 Implementation):** Employs a fixed set of 8 high-signal questions covering:
    *   **BODY** (3 Questions): Focus on sleep, energy, and somatic listening.
    *   **EMOTION** (2 Questions): Focus on awareness and emotional regulation.
    *   **RELATIONSHIP** (1 Question): Focus on support systems.
    *   **MEANING** (1 Question): Focus on daily value/meaning.
    *   **SPIRITUALITY** (1 Question): Focus on reflection.

**Evidence:** Found in `assessmentScoringEngine.ts` (`getRandomAssessmentQuestions`) and `WellnessAssessmentFlow.tsx` (static `QUESTIONS` array).

---

## 2. Decision Logic: State Engine vs Identity Engine
The Wellness Assessment functions as a **State Engine**. It does not define "who the user is" (Identity), but "where the user is right now" (State).

### Evidence of State Engine Functionality:
1.  **Confidence Scoring:** The mapping result includes a `confidence` level (LOW/MEDIUM/HIGH) based on the frequency of check-ins. This acknowledges that a single assessment is just a snapshot.
2.  **Booster Integration:** The engine (`wellnessMappingEngine.ts`) incorporates "Boosters" from recent `WellnessSnapshot` data (check-ins) to refine the theme (e.g., "Low Energy Pattern" boosts the "Burnout" score).
3.  **Conflict Resolution:** It includes logic like "Growth Phase Protection" which suppresses crisis themes if all dimensions are consistently high, preventing noise from isolated bad days.

---

## 3. False Positive Risk Assessment
*   **Distressed user classified too low:** 
    *   *Risk:* High. If a user in "LIFE_CRISIS" scores slightly above 25 (e.g., 26) in all dimensions, they remain at **Level 1 (Self Support)**. The escalation to Level 3 (Professional) only triggers if a dimension falls below 25.
*   **Healthy user classified too high:**
    *   *Risk:* Low. "Growth Phase Protection" logic specifically reduces the scores of crisis categories by 50% if the user maintains high scores across dimensions, acting as a buffer against occasional low-score outliers.

---

## 4. Final Verdict
**Does it function as a daily emotional scanner or a static questionnaire?**

It functions as a **Daily Emotional Scanner (High-Frequency State Engine)**.

**Evidence:**
1.  **Adaptive Frequency:** The engine is designed to handle daily, weekly, and monthly resolutions.
2.  **Recency Bias:** The recommendation engine (`wellnessRecommendationEngine.ts`) prioritizes immediate metrics (Sleep, Energy, Focus) over long-term traits.
3.  **Temporal Context:** The results are timestamped (`calculatedAt`) and saved as "Reflections" rather than "Profiles," encouraging users to "Repeat Reflection" (as seen in the UI).
