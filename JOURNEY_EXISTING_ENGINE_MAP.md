# Journey Existing Engine Map

This document maps out the existing engines in the Bhumi codebase and reviews their alignment with the requirements of the Journey Intelligence V1 upgrade.

---

## 1. `growthEngine.ts`
- **Purpose**: Evaluates user growth metrics (awareness, consistency, depth, balance, courage, acceptance) and milestones based on historical completion logs.
- **Inputs**: `states: DailyState[]`
- **Outputs**: `GrowthProfile` (`signals: GrowthSignals`, `currentMilestone: string`, `milestoneIcon: string`, `story: string`)
- **Current usage**: Used in `DashboardJourneyRuntimeAdapter` to output milestone narratives on the dashboard.
- **Reusable for V1?**: **Yes**. Its calculated signals provide quantitative baseline weights for what areas of growth are active.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**. To parse the nested structured logs of `JourneyDailyRecord` instead of `DailyState` to retrieve more accurate performance weights.

---

## 2. `journeyStoryEngine.ts`
- **Purpose**: Synthesizes flat daily state participation data and blueprint structures into a narrative Growth Story.
- **Inputs**: `states: DailyState[]`, `synthesis: UnifiedBlueprintSynthesis`
- **Outputs**: `GrowthStory` (`stage`, `companionMessage`, `growthFocus`, `growingAreas`, `attentionAreas`, `nextMilestone`)
- **Current usage**: Consumed by `JourneyDetailClient.tsx` to populate detail views.
- **Reusable for V1?**: **Yes**. Its output structure provides the containers for the details subpages.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**. We can extend it to ingest the output of our new learning layers so they can be rendered in the respective subpages.

---

## 3. `journeyNarrativeEngine.ts`
- **Purpose**: Generates a soulful summary of dominant issues and karmic lessons using the full blueprint context.
- **Inputs**: `states: DailyState[]`, `synthesis: UnifiedBlueprintSynthesis`
- **Outputs**: `JourneyStory` (`narrative`, `growthEdge`, `soulInsight`, `milestoneTitle`)
- **Current usage**: Unused (available as library utility).
- **Reusable for V1?**: **Yes**. Useful as a reference for blueprint-to-narrative generation.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**.

---

## 4. `completionEngine.ts`
- **Purpose**: Computes progress completion metrics (counts, percentages, status labels) for daily pilar activities.
- **Inputs**: `state: DailyState | null`
- **Outputs**: `CompletionSummary` (`count`, `total`, `status`, `label`, `isUnlocked`, `items`)
- **Current usage**: Widely used in the Dashboard, Journey list, and other calculation pipelines.
- **Reusable for V1?**: **Yes**. Helps determine active days and verify pilar logs.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**. Expand it to support mapping actual practices from `JourneyDailyRecord` fields.

---

## 5. `reflectionEngine.ts`
- **Purpose**: Formulates weekly summaries, themes, small wins, and next-week focuses from 7 days of logs.
- **Inputs**: `uid: string`, `weekId: string`, `states: DailyState[]`
- **Outputs**: `WeeklyReflection`
- **Current usage**: Used in `dailyGuidanceEngine.ts` to feed recent weekly reflections to the guidance prompt generator.
- **Reusable for V1?**: **Yes**. Demonstrates how 7-day windows are categorized and themed.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**. Needs extension to output the Indonesia-friendly weekly pattern paragraph (`weeklyLearning`).

---

## 6. `journeyRuntimeAdapter.ts`
- **Purpose**: Dynamically maps daily check-ins and logs to 6 growth/stuck/blind-spot signals.
- **Inputs**: `canonical: CanonicalIdentity`, `meaning: HumanMeaning`, `innerwork: InnerworkRuntimeData`, `input: JourneyInput`
- **Outputs**: `JourneyIntelligence` (6 signals)
- **Current usage**: Validated via `scripts/validateJourneyRuntime.ts` to output report.
- **Reusable for V1?**: **Yes**. Excellent reference for mapping specific blueprint alignments (e.g. Projector strategy, specific life paths) to Indonesian insights.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**.

---

## 7. `dashboardJourneyRuntimeAdapter.ts`
- **Purpose**: Prepares current day completion data and latest practice reflections for the dashboard.
- **Inputs**: `meaning: HumanMeaning`, `currentState: DailyState | null`, `recentStates: DailyState[]`
- **Outputs**: `DashboardJourneyRuntime`
- **Current usage**: Consumed by `DashboardClient.tsx` to feed context to the Mirror card.
- **Reusable for V1?**: **Yes**.
- **Rebuild required?**: **No**.
- **Extension required?**: **Yes**.
