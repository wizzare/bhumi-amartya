# JOURNEY INTELLIGENCE INFLUENCE TRACE

Tracing exact sentences in the UI back to their Intelligence Engine source.

| UI Sentence | Source Engine | Data Object | Influence Scope |
| :--- | :--- | :--- | :--- |
| "Selama minggu ini tema yang paling sering muncul adalah..." | `reflectionEngine` | `weeklyLearning.weeklyPattern` | Journey > Focus |
| "Bhumi melihat kamu lebih mudah bergerak ketika langkahnya sederhana..." | `reflectionEngine` | `weeklyLearning.coachObservation` | Journey > Focus |
| "Tema utama bulan ini adalah belajar membedakan kepedulian dari tanggung jawab." | `journeyStoryEngine` | `monthlyLearning.monthlyTheme` | Journey > Focus |
| "Over Responsibility ↓ Boundary Issues" | `growthNarrativeEngine` | `growthNarrative.growthNarrative` | Journey > Stage |
| "Pelajaran saat ini: 'Belajar bahwa nilai dirimu tidak ditentukan oleh...'" | `growthNarrativeEngine` | `growthNarrative.currentLesson` | Journey > Stage |
| "Undangan berikutnya: 'Mulailah hari dengan menanyakan: Apa yang benar-benar milikku...'" | `growthNarrativeEngine` | `growthNarrative.nextInvitation` | Journey > Stage |
| "Kamu cenderung berkembang lebih baik melalui praktik singkat yang langsung melibatkan tubuh..." | `journeyNarrativeEngine` | `coachMemory.coachMemory` | Journey > Stage |
| "Body Awareness (Helpful Score 78%)" | `completionEngine` | `practiceInsights` | Journey > Attention |

## Consumption Verification
- **`JourneyDetailClient.tsx`**: **FULLY CONSUMING**. This page is the primary vehicle for the Learning V1 upgrade.
- **`journeyRepository.getDailyMemory`**: **ORCHESTRATING**. Correctiy triggers all extended engines.
- **`Catatan Hari Ini`**: **NOT CONSUMING**. The dashboard note is still "Storage Only" and lacks chronological awareness.

## FINAL VERDICT
**ACTIVELY INFLUENCING USER EXPERIENCE (PARTIAL)**

The upgrade is successful in the Journey Detail surfaces, providing the user with a true "Learning" experience. The main dashboard "Life Coach" note requires further integration to reach full maturity.
