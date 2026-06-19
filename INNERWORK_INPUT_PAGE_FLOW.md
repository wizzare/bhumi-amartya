# INNERWORK INPUT PAGE FLOW

Tracing user inputs from source to Innerwork consumption.

| Input Item | Storage Location | Consumed by Innerwork? | How? |
|---|---|---|---|
| **Name** | `userProfiles/{uid}` | **YES** | Used in greeting and context mapping. |
| **Birth Date/Time** | `userProfiles/{uid}` | **YES (via Blueprint)** | Used by `CanonicalTranslatorService` to build the Blueprint. |
| **Birth City** | `userProfiles/{uid}` | **YES (via Blueprint)** | Used for precise Astro calculations in the Blueprint. |
| **Daily Scan Answers** | `dailyStates/{uid}/entries/{date}` | **YES** | Consumed via `dailyState.wellnessSnapshot.metrics` in `deriveCurrentIssue`. |
| **Wellness Baseline** | `wellnessAssessments/{uid}` | **YES** | Consumed via `wellnessNavigatorRepository` to set the mode (RECOVERY/GROWTH). |

**Verdict:** The foundational data path is intact. Innerwork is aware of who the user is, their life-path data, and their current physical/emotional state.
