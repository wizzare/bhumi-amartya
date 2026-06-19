# KARA V3: Baseline Wellness Implementation Plan

## 1. Data Model Updates

### User Profile Expansion
Update `UserProfile` in `lib/repositories/userRepository.ts` and Firestore schema:
*   `baselineWellnessCompleted: boolean` (Default: `false`)
*   `baselineWellnessResults`:
    *   `scores: Record<WellnessDomain, number>` (0-100)
    *   `completedAt: string` (ISO Timestamp)
    *   `version: string` (e.g., "V3_BASELINE")
*   `dailyWellnessState`:
    *   `lastScanAt: string`
    *   `currentNavigatorMode: "RECOVERY" | "REFLECTION" | "GROWTH"`

---

## 2. Question Bank Structure (30 Questions)

### Domains (6 Domains x 5 Questions)
1.  **TUBUH (Body):** Energy levels, somatic recovery, sleep quality, fatigue patterns, body awareness.
2.  **EMOSI (Emotion):** Emotional regulation, stress resilience, overwhelm, emotional expression, psychological safety.
3.  **PIKIRAN (Mind):** Cognitive focus, rumination levels, mental clarity, worry/anxiety, cognitive load management.
4.  **RELASI (Relationship):** Quality of support, interpersonal trust, social connection, sense of belonging, isolation risk.
5.  **MAKNA HIDUP (Meaning):** Sense of purpose, life direction, hopefulness, existential meaning, fulfillment.
6.  **REGULASI DIRI (Self-Regulation):** Coping mechanisms, adaptation to change, help-seeking behavior, resilience, recovery skills.

**Answer Scale (1-5):**
*   1: Sangat Tidak Sesuai (Strongly Disagree)
*   2: Tidak Sesuai (Disagree)
*   3: Kadang Sesuai (Neutral/Sometimes)
*   4: Sesuai (Agree)
*   5: Sangat Sesuai (Strongly Agree)

---

## 3. Scoring & Navigator Logic

### Scoring Engine (`assessmentScoringEngine.ts`)
*   **Normalization:** `((Sum - Count) / (Count * 4)) * 100` per domain.
*   **Result Categorization:**
    *   **Area Terkuat:** Domain with the highest score.
    *   **Area Bertumbuh:** Domain with score 41-70.
    *   **Area Perlu Perhatian:** Domain with score < 40.

### Navigator Mode Mapping & Safety Triggers
*   **RECOVERY:** Triggered if **Tubuh** < 35 OR **Emosi** < 35 OR **Relasi** < 30 OR Average < 40.
*   **REFLECTION:** Triggered if **Makna** < 50 OR **Pikiran** < 50 OR **Regulasi** < 50.
*   **GROWTH:** Triggered if all domains > 60 AND Average > 70.

### First-Class Safety Guardrails
The following domains are independent escalation triggers. Distress in one cannot be "averaged out" by high scores in others:
1.  **TUBUH (Body):** Threshold < 25 triggers Professional/Clinical review.
2.  **EMOSI (Emotion):** Threshold < 25 triggers Professional/Clinical review.
3.  **MAKNA (Meaning):** Threshold < 25 triggers Professional/Clinical review.
4.  **RELASI (Relationship):** Threshold < 25 triggers Elevated Support/Community review. **Relationship is a safety domain, not just a growth domain.**

---

## 4. Feature Integration & Locking

### Onboarding & Migration
*   **Middleware/Route Guard:** If `auth.userProfile.baselineWellnessCompleted === false`, redirect all authenticated traffic to `/wellness-assessment`.
*   **Notification:** Toast or Modal overlay: *"Bhumi sudah mengenal identitasmu. Sekarang bantu Bhumi memahami kondisi dirimu saat ini melalui 30 pertanyaan singkat agar pendampingan menjadi lebih sesuai."*

### Feature Access Rules
| Feature | Before Baseline | After Baseline (No Daily Scan) | After Daily Scan |
| :--- | :--- | :--- | :--- |
| **Dashboard** | LOCKED | UNLOCKED (Generic) | UNLOCKED (Personalized) |
| **Innerwork** | LOCKED | UNLOCKED (Generic) | UNLOCKED (Personalized) |
| **Catatan Hari Ini** | LOCKED | UNLOCKED | UNLOCKED (with context) |
| **Journey** | LOCKED | UNLOCKED | UNLOCKED |

### Founder Override
*   Profile attribute `guardianRole === 'founder'` bypasses the mandatory redirect, allowing access to all features for testing/development without completing the assessment.

---

## 5. Daily Adaptive Scan Logic

Once the Baseline is established, the daily 5-question scan becomes adaptive:
*   **Question Distribution:**
    *   2 Questions from the **Weakest Domain** (Area Perlu Perhatian).
    *   1 Question from a **Random Domain**.
    *   1 Question biased by **Recent History**.
    *   1 Question biased by **Navigator Mode**.

*   **Relationship Bias Rule:** If **Relasi** is the weakest domain, the daily scan must prioritize questions related to:
    *   **Support & Belonging:** Availability of emotional/practical help.
    *   **Trust & Connection:** Depth of interpersonal bonds.
    *   **Isolation Risk:** Feelings of being unheard or withdrawn.

---

## 6. Implementation Roadmap

1.  **Phase 1: Data & Engine**
    *   Update `userRepository` and `assessmentScoringEngine`.
    *   Create `wellnessBaselineLibrary.ts` with 30 canonical questions.
2.  **Phase 2: UI/UX**
    *   Expand `WellnessAssessmentFlow.tsx` to handle 30-question baseline vs 5-question daily.
    *   Implement "Onboarding Barrier" logic in `ProtectedRoute.tsx`.
3.  **Phase 3: Integration**
    *   Connect `NavigatorMode` to Dashboard and Innerwork recommendation blocks.
    *   Implement "Personalized Advice" lock messages for missing Daily Scans.
4.  **Phase 4: Migration**
    *   Deployment script to set `baselineWellnessCompleted: false` for all non-founder users.
