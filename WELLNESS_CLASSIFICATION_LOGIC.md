# Wellness Classification Logic: KARA V3

## 1. Classification Levels (Support Levels)
Users are assigned to one of six Support Levels based on their assessment scores and identified themes.

| Level | Label | Recommendation Path |
| :--- | :--- | :--- |
| **Level 1** | Dukungan Mandiri | Self-directed tools (Journal, Meditation) |
| **Level 2** | Pendampingan | Guidance from practitioners |
| **Level 3** | Dukungan Profesional | Clinical/Professional perspective |
| **Level 4** | Layanan Publik | Public health services |
| **Level 5** | Safety Observation | Closely monitored self-care |
| **Level 6** | Jalur Aman | Immediate safety protocols (Acute Collapse) |

---

## 2. Exact Decision Path (Priority Based)

The system evaluates conditions in the following order of precedence:

### Step A: Safety Escalation (Intensity Check)
The system first checks the raw intensity of three key dimensions: **Body, Emotion, and Meaning**.
1.  **IF** any dimension < 15:
    *   **Primary Level:** 6 (Jalur Aman)
    *   **Secondary Level:** 3 (Professional)
2.  **ELSE IF** any dimension < 25:
    *   **Primary Level:** 3 (Professional)
    *   **Secondary Level:** 4 (Public)

### Step B: Theme-Based Mapping
If the user passes the Safety Escalation check, the level is determined by their `Top Theme` (the category with the highest probability).

| Top Theme | Primary Level | Secondary Level |
| :--- | :--- | :--- |
| **LIFE_CRISIS** | Level 2 | Level 3 |
| **SPIRITUAL_CRISIS** | Level 2 | Level 3 |
| **BURNOUT** | Level 1 | Level 2 |
| **ANXIETY** | Level 1 | Level 2 |
| **MEANING_CRISIS** | Level 1 | Level 2 |
| **LONELINESS** | Level 1 | Level 2 |
| **LOSS_AND_GRIEF** | Level 1 | Level 2 |
| **GROWTH_PHASE** | Level 1 | - |
| **SPIRITUAL_AWAKENING** | Level 1 | - |

---

## 3. Theme Scoring Formulas
Themes are calculated using weighted averages of normalized dimension scores (0-100).

*   **BURNOUT:** `(100 - body) * 0.6 + (100 - emotion) * 0.4`
*   **ANXIETY:** `(100 - emotion) * 0.7 + (100 - body) * 0.3`
*   **LONELINESS:** `(100 - relationship) * 0.8 + (100 - emotion) * 0.2`
*   **MEANING_CRISIS:** `(100 - meaning) * 0.7 + (100 - spirituality) * 0.3`
*   **LIFE_TRANSITION:** `(100 - emotion) * 0.5 + (meaning > 60 ? 30 : 0)`

**Logic Evidence:** `wellnessSupportEngine.ts` (`calculateSupportPath`) and `wellnessMappingEngine.ts` (`calculateWellnessMapping`).
