# Wellness User Flow: KARA V3

## Complete Journey Map

### 1. Assessment (The Input)
*   **User Action:** Answers 8-25 questions on a scale of 1-5.
*   **Dimensions:** Body, Emotion, Relationship, Meaning, Spirituality.
*   **Trigger:** Daily Check-in or Deep Reflection request.

### 2. Scoring & Mapping (The Process)
*   **Normalization:** 1-5 raw scores converted to 0-100 dimension scores.
*   **Pattern Matching:** Scores passed through `wellnessMappingEngine`.
*   **Theme Detection:** Highest probability theme identified (e.g., "Burnout").
*   **Confidence Check:** Calculation of confidence based on history (Snapshot vs History).

### 3. Classification (The Decision)
*   **Support Path:** `wellnessSupportEngine` assigns Levels 1-6.
*   **Navigator Mode:** `wellnessNavigatorEngine` sets the experience mode:
    *   **RECOVERY:** Focus on rest and grounding.
    *   **REFLECTION:** Focus on journaling and insight.
    *   **GROWTH:** Focus on manifestation and expansion.

### 4. Recommendation (The Influence)
The assessment result propagates to the following UI surfaces:
*   **Innerwork:** Unlocks specific practices (e.g., "Audio Healing" for Level 1 Burnout).
*   **Journey:** Tailors the narrative and daily focus.
*   **Dashboard:** Displays the "Navigator Mode" and "Primary Action".
*   **Catatan Hari Ini:** Populates the reflection summary and next steps.

### 5. Next Action (The Output)
*   **Low Intensity:** Guided self-care (App-based).
*   **Medium Intensity:** Referral to practitioners (Community/WA).
*   **High Intensity:** Professional referral (External Resources).

---

## Technical Integration
1.  `WellnessAssessmentFlow.tsx` (UI)
2.  `wellnessMappingRepository.ts` (Data Persistence)
3.  `assessmentScoringEngine.ts` (Mathematics)
4.  `wellnessNavigatorEngine.ts` (UX Routing)
5.  `wellnessSupportEngine.ts` (Safety & Triage)
