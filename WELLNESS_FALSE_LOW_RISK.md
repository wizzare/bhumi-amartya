# Wellness False Low Risk Audit: KARA V3

This report identifies scenarios where the Wellness Engine may categorize a high-distress user into an inappropriately low support level.

## 1. The Relationship Blind Spot (Critical Risk)
**Scenario:**
*   Body: 80 (Healthy)
*   Emotion: 80 (Stable)
*   Meaning: 80 (Strong)
*   **Relationship: 5** (Acute interpersonal crisis, isolation, or abuse)

**Current Classification:** Level 1 (Self Support)
**Risk Level:** **CRITICAL**
**Explanation:** The escalation logic in `wellnessSupportEngine.ts` only triggers Level 3/4/6 based on **Body, Emotion, and Meaning**. Even though the `LONELINESS` theme will score high (approx 76%), it is mapped to Level 1. A user in a dangerous or severely isolated social situation receives no professional escalation.

---

## 2. The "26" Cluster (Systemic Fatigue)
**Scenario:**
*   Body: 26
*   Emotion: 26
*   Meaning: 26

**Current Classification:** Level 1 (Self Support) or Level 2 (if Life Crisis theme wins)
**Risk Level:** **HIGH**
**Explanation:** The user is 1 point away from Level 3 (Professional) in three different dimensions simultaneously. The cumulative effect of being "barely okay" across the board is likely a state of functional collapse, yet the system retains them in a "Self-Directed" or "Practitioner" path.

---

## 3. Isolated Severe Meaning Crisis
**Scenario:**
*   Body: 60
*   Emotion: 60
*   **Meaning: 26** (Intense loss of purpose)

**Current Classification:** Level 1 (Self Support)
**Risk Level:** **MEDIUM**
**Explanation:** Because Body and Emotion are "Baik" (Good), the system assumes the user is resilient enough for self-support. However, a score of 26 in Meaning indicates significant existential distress that typically requires Level 2 or 3 intervention.

---

## 4. The Borderline Emergency
**Scenario:**
*   **Body: 16**
*   Emotion: 16
*   Meaning: 16

**Current Classification:** Level 3 (Professional Support)
**Risk Level:** **MEDIUM**
**Explanation:** The user is 1 point away from **Level 6 (Jalur Aman/Emergency)**. While Level 3 is a professional referral, the system does not trigger the "Jalur Aman" safety protocols because the score did not hit the < 15 threshold.

---

## 5. Summary of Threshold Risks

| Threshold | Score | Current Level | Expected Level (Safety First) |
| :--- | :--- | :--- | :--- |
| Safety Threshold | 14 | Level 6 | Level 6 |
| Safety Threshold | 16 | Level 3 | Level 6 (Cautionary) |
| Clinical Threshold | 24 | Level 3 | Level 3 |
| Clinical Threshold | 26 | Level 1/2 | Level 3 (Cautionary) |
