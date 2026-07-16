# BUILD 69 — WELLNESS & ROUTING HOTFIX REPORT (BUILD 70)

**Date:** 2026-07-04
**Build Number:** 70
**Status:** READY FOR INTERNAL TESTING

## 1. Root Cause Analysis
- **Routing Blocker:** `ProtectedRoute.tsx` contained a mandatory redirect to `/wellness` for any user with `baselineWellnessCompleted: false`. This overrode the intended landing on `/dashboard`.
- **Double Assessment:** The Wellness baseline (15Q) and Daily Check-in (5Q) were independent. Completing the baseline did not mark today's check-in as done, leading to back-to-back assessments.
- **Copy Issues:** Many Wellness UI strings used technical terms ("Navigator Mode", "Confidence", "Probability") and mixed English/Indonesian.

## 2. Files Changed
- `components/auth/ProtectedRoute.tsx`: Removed auto-redirect to Wellness for new users.
- `components/wellness/WellnessAssessmentFlow.tsx`:
    - Updated intro text (15 questions).
    - Implemented logic to mark daily check-in as completed upon baseline completion.
    - Derived initial wellness metrics from baseline scores to prevent double-entry.
    - Updated results UI with "Buka Ruang Wellness" and reload logic.
- `components/wellness/WellnessPageClient.tsx`: Cleaned up language, section titles, and status labels.
- `components/dashboard/WellnessCheckInCard.tsx`: Humanized copy for the 5-question daily check-in.
- `components/wellness/WellnessMappingView.tsx`: Translated technical terms (Confidence, Drivers, Probability).
- `components/wellness/WellnessNavigatorView.tsx`: Translated and humanized mode labels and actions.
- `components/wellness/WellnessSupportPathView.tsx`: Translated and improved support recommendation copy.
- `android/app/build.gradle`: Bumped `versionCode` to 70.
- `app/status/page.tsx`: Updated UI label to Build 70.

## 3. Routing Logic (Before vs After)
| Flow | Before | After |
| :--- | :--- | :--- |
| **New User Setup** | Redirected to `/wellness` (Baseline) | **Redirects to `/dashboard`** |
| **Dashboard Entry** | Forced to `/wellness` if incomplete | **Unconditionally accessible** |
| **Wellness Entry** | Automatic on login | **User-initiated (via Nav/Card)** |

## 4. Assessment Rules
### Baseline 15Q (Pemetaan Awal)
- **Trigger:** Only when user opens Wellness page and `baselineWellnessCompleted` is false.
- **Effect:** Saves baseline profile AND marks today's Daily Check-in as completed.
- **Prevent Double Assessment:** Successfully implemented. User enters the full Wellness Hub after completion without a second 5Q prompt.

### Daily 5Q (Cek Diri Hari Ini)
- **Trigger:** Daily when user opens Wellness Hub or clicks Check-in card.
- **Frequency:** Once per day.
- **Tone:** Soft, reflective ("Bagaimana Kabarmu?").

## 5. Copy Cleanup Audit
- [x] "Navigator Mode" → "Mode Pendampingan"
- [x] "Baseline Scan" → "Pemetaan Awal Dirimu"
- [x] "Daily Check-in" → "Cek Diri Hari Ini"
- [x] "Confidence" → "Kecocokan"
- [x] "Probability" → Percentage display only or "Dominan"
- [x] Technical section headers humanized to Indonesian.
- [x] Warm tone applied to buttons and empty states.

## 6. Test Checklist
- [x] Fresh login lands on Dashboard: **PASS**
- [x] Dashboard allows exploration without redirect: **PASS**
- [x] Clicking Wellness triggers 15Q: **PASS**
- [x] Completing 15Q unlocks Wellness Hub: **PASS**
- [x] No immediate 5Q after 15Q: **PASS**
- [x] Version Code is 70: **PASS**

## 7. Recommendation
**Build 70** should be treated as the official Hotfix for Build 69. All forensic audit concerns from Build 68 are maintained while resolving the onboarding friction and double-assessment issues.

---
**Senior Release Engineer**
Bhumi Amartya
