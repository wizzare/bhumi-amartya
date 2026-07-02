# MOANA V64 Wellness to Journey Integration Plan

Status: PRODUCT AUDIT + IMPLEMENTATION PLAN ONLY

Final Recommendation: OPTION B

Founder approval required before implementation.

## Documents Read

- `MOANA_V64_WELLNESS_JOURNEY_PERSISTENCE_AUDIT.md`
- `MOANA_V3_EXECUTION_MODE.md`
- `SOURCE_OF_TRUTH_V1.md`
- `MOANA_V64_WELLNESS_UX_DESIGN.md`
- `WELLNESS_USER_FLOW.md`
- `WELLNESS_PRODUCTION_READINESS.md`
- `KARA_EXPECTED_FEATURES.md`

Note: a single literal file named `KARA Source of Truth` was not found in the workspace. The available KARA Wellness/source documents above were used as the KARA reference layer.

## Current Architecture

Wellness currently has four conceptual sections:

1. Section 1 - Daily Check In
   - User input.
   - Persists `wellnessSnapshot` to `dailyStates/{uid}/entries/{dateKey}`.
   - Feeds Wellness intelligence, Dashboard context, and Journey-derived memory indirectly.

2. Section 2 - Kondisimu Hari Ini
   - Read-only interpretation layer.
   - Uses existing mapping/intelligence.
   - Should not create a Journey entry by itself.

3. Section 3 - Hari Ini Cukup
   - Daily enoughness checklist.
   - Persists to `journeyDailyRecords/{uid}/entries/{dateKey}.wellnessState.enoughnessChecklist`.
   - Current issue: data is stored in Journey record, but it is not treated as a Journey progress surface.

4. Section 4 - Praktik Tambahan
   - Optional practice library.
   - Saves to `dailyStates/{uid}/entries/{dateKey}` and `journeyDailyRecords/{uid}/entries/{dateKey}`.
   - Appends `practiceResults[]` with `source: "wellness_section_4"`.
   - Current Journey Progress Today counts the seven Section 4 practice categories.

Existing Journey repository remains the correct storage path. No new Journey repository, memory engine, save pipeline, or Firestore architecture is needed.

## Analysis

### 1. Purpose Of Section 3

Section 3 is not a full practice library and not a diagnostic recommendation block.

Correct product role:

- It is today's minimum care plan.
- It is a daily habit surface.
- It translates Section 1 and Section 2 into small, doable actions.
- It answers: `Apa yang cukup untuk hari ini?`

It should feel lighter than Section 4. It should reduce pressure, not increase it.

Best definition:

`Hari Ini Cukup` is a daily enoughness plan: a small checklist that confirms the user has given themself enough care for today.

It is adjacent to recommendation, but it is not the same as "Recommended Today". It should not feel like a prescription or a long task list.

### 2. Should Section 3 Contribute To Journey?

Yes.

Reason:

- MOANA Source of Truth says the canonical save pipeline is User Action -> Save -> Firestore -> Journey -> Dashboard -> Refleksi Jiwa -> Catatan Hari Ini -> Manifestasi -> AI Memory.
- SOURCE_OF_TRUTH_V1 says Growth is owned by active Innerwork/Journey data, and active user actions override static blueprint predictions.
- The approved Wellness UX design says Journey should read checklist offered, checklist completed count, enoughness status, and optional practice completed.

How Section 3 should contribute:

- It should contribute to Journey as `Today's Plan` / `Daily Care`, not as Section 4 practice completion.
- It should remain stored inside the existing Journey daily record under `wellnessState.enoughnessChecklist`.
- Journey should read and display or narrate:
  - checklist completed count
  - checklist total
  - enoughness status
  - whether 2/3 or the approved threshold was reached
  - today's condition/current issue that informed the checklist

Important distinction:

- Section 3 completion means: "the user gave enough care today."
- Section 4 completion means: "the user completed an optional deeper practice."

These are related, but not identical.

### 3. Should Section 3 Affect Dashboard, Refleksi Jiwa, Catatan Bhumi, Manifestasi, AI Memory?

Yes, but with different levels of influence.

Dashboard:
- Should be allowed to read Section 3 as a daily care signal.
- It should not replace Section 4 practice progress.
- Dashboard can show that the user has done enough care today, especially when Section 4 is empty.

Refleksi Jiwa:
- Should use Section 3 as tone/context.
- If enoughness is complete, reflection can acknowledge care and steadiness.
- If partial, reflection can stay gentle and invite one small return.
- It must never shame incomplete checklist items.

Catatan Bhumi:
- Should use Section 3 as continuity.
- It can mention today's care direction or the pattern forming over recent days.
- It should avoid raw task language like "2/3 completed" unless the UI context calls for it.

Manifestasi:
- Should use Section 3 as today's practical anchor.
- If the checklist is complete enough, Manifestasi can become softer and more aligned with integration.
- If not started, Manifestasi should not pretend the user already practiced.

AI Memory:
- Should receive Section 3 after Journey save succeeds.
- It should be a memory signal, not a blocking dependency.
- If memory update fails, Journey and the user-facing save must still succeed.

### 4. Should Section 4 Remain Independent?

Yes.

Section 4 should remain independent as `Praktik Tambahan`.

Reasons:

- Approved UX says Section 4 keeps existing practice library and becomes optional.
- KARA Wellness flow treats recommendation/practice routing as a deeper output after assessment.
- MOANA execution mode says Section 4 practice types must share one canonical save pipeline.
- Section 4 is currently the source for the seven Journey Progress Today practice categories.

Section 4 should not be required to make the day valid. It is deeper support, not proof that the user cared for themselves.

## Option Comparison

### Option A - Journey Progress Only Section 4

Model:
- Journey Progress remains only Section 4.
- Section 3 stores checklist only.

Strength:
- Minimal UI change.
- Preserves existing Progress Today behavior.
- Lowest implementation risk.

Problem:
- It underuses Section 3.
- It contradicts the approved Wellness UX concept that Journey should read enoughness status.
- It makes "Hari Ini Cukup" emotionally central in Wellness but invisible in Journey progress.
- A user can complete enough daily care and still see Journey as 0 progress if they do not open Section 4.

Verdict: not recommended.

### Option B - Journey Contains Today's Plan And Practice Progress Separately

Model:

```text
Today's Plan
3 / 5 or approved checklist count

Practice
7 / 7
```

Or, if the approved UX returns to 3 items:

```text
Today's Plan
2 / 3 - Hari ini cukup

Practice
0 / 7 - Praktik tambahan belum dilakukan
```

Strength:
- Matches the emotional design of Wellness.
- Keeps Section 3 and Section 4 meanings clean.
- Reuses existing Journey daily record and existing fields.
- Avoids creating a new engine.
- Avoids inflating Section 4 practice completion.
- Allows Journey narrative to recognize care without forcing deeper practices.

Implementation shape after approval:
- Continue storing Section 3 in `wellnessState.enoughnessChecklist`.
- Add Journey read/display layer for `Today's Plan`.
- Keep existing Section 4 progress as `Practice Progress`.
- Let Dashboard/AI context consume the same existing Journey daily record.

Verdict: recommended.

### Option C - Merge Everything Into One Progress

Model:
- Section 3 checklist and Section 4 practices all count into one number.

Strength:
- Simple at first glance.

Problem:
- Blurs "enough care" with "extra practice".
- Creates an inflated or confusing progress number.
- Makes optional practices feel required.
- Risks punishing users who completed enough care but skipped deeper practice.
- Makes Journey harder to narrate because checklist items and practice completions have different meaning and weight.

Verdict: not recommended.

## Recommended Model

Choose OPTION B.

Journey should have two separate daily progress concepts:

1. Today's Plan
   - Source: Section 3 `wellnessState.enoughnessChecklist`
   - Meaning: daily care / enoughness
   - Completion: threshold-based
   - Tone: compassionate, non-performative

2. Practice Progress
   - Source: Section 4 daily state flags and Journey `practiceResults`
   - Meaning: optional deeper practice
   - Completion: seven practice categories
   - Tone: consistency and depth

Recommended labels:

```text
Rencana Hari Ini
2/3 - Hari ini cukup

Praktik Tambahan
1/7 - Ritme berjalan
```

If current implementation remains 5 checklist items, the label can be:

```text
Rencana Hari Ini
3/5
```

But product alignment is stronger if Founder re-approves the original 3-item, 2/3 enoughness model from the UX design.

## UX Impact

Wellness:
- Section 3 remains the emotional center after condition summary.
- Section 4 remains clearly optional.
- The user is not pressured to complete all seven practices.

Journey:
- Add or revise the daily progress area to show two lines/cards:
  - `Rencana Hari Ini`
  - `Praktik Tambahan`
- Journey history can show both enoughness and practice dots separately.
- Journey details can narrate:
  - check-in happened
  - condition recognized
  - enoughness checklist progress
  - optional practice if completed

Dashboard:
- Dashboard can acknowledge today's enoughness status without changing the Section 4 progress model.
- If no Section 4 activity exists but Section 3 is enough, Dashboard should not treat the user as inactive.

Tone:
- Missed checklist items must not be framed as failure.
- Section 3 should use language like:
  - `Kamu sudah mulai merawat dirimu.`
  - `Hari ini sudah cukup.`
  - `Kamu bisa kembali kapan pun tubuhmu siap.`

## Journey Impact

Data model:
- Reuse `journeyDailyRecords/{uid}/entries/{dateKey}`.
- Reuse `wellnessState.enoughnessChecklist`.
- Reuse existing Journey repository methods.
- Do not create a new collection.
- Do not create a new repository.

Read model:
- Journey main page reads today's Journey record.
- Journey detail/history reads recent Journey records.
- Journey computes:
  - Today's Plan count from `wellnessState.enoughnessChecklist.completedCount`
  - Today's Plan total from `wellnessState.enoughnessChecklist.total`
  - Today's Plan status from `completed` or threshold rule
  - Practice Progress from existing daily state + Section 4 practice results

Narrative model:
- Section 3 informs enough-care narrative.
- Section 4 informs deeper-practice narrative.
- Section 3 should not create duplicate `practiceResults`.

## Dashboard Impact

Dashboard should read the same Journey daily record and daily state already used in current architecture.

Expected influence:
- Refleksi Jiwa can acknowledge the user's care state.
- Catatan Bhumi can include continuity from enoughness status.
- Manifestasi can align with the care direction if available.

Do not create a Dashboard engine.

Do not make Dashboard depend on AI Memory before rendering saved Journey data.

## AI Memory Impact

Section 3 should become a memory signal only after Journey save succeeds.

Correct order:

```text
Checklist action
Save to Journey daily record
User sees success/progress
Memory can learn from it
```

AI Memory should store meaning such as:
- user started care
- user reached enough care
- user completed full care
- repeated issue/care patterns

AI Memory must not:
- block checklist save
- block Journey update
- become the canonical source for progress
- create a separate memory pipeline for Section 3

## AccessGuard QA Plan

Current audit status is BLOCKED because runtime verification hit AccessGuard/access renewal screens.

Safest QA strategy without bypassing AccessGuard, modifying production rules, or modifying badge system:

1. Use a real QA account that already has valid server-owned access.
   - The account must have valid badge/plan/membership/accessUntil from the existing backend process.
   - Do not set these fields from the client.
   - Do not edit Firestore rules.

2. Verify in a staging or development environment that points to real Firebase rules and real auth.
   - Same AccessGuard behavior as production.
   - Same repository paths.
   - Same authenticated uid ownership checks.

3. Start from Dashboard.
   - Confirm AccessGuard allows the account naturally.
   - Do not navigate by hidden bypass URLs.

4. Runtime checklist:
   - Complete Section 1.
   - Confirm `dailyStates/{uid}/entries/{dateKey}.wellnessSnapshot`.
   - Read Section 2.
   - Toggle Section 3 checklist.
   - Confirm `journeyDailyRecords/{uid}/entries/{dateKey}.wellnessState.enoughnessChecklist`.
   - Complete one Section 4 practice.
   - Confirm daily state flag, Journey record, and `practiceResults[]`.
   - Open Journey.
   - Confirm Today's Plan and Practice Progress are both shown after implementation.
   - Refresh.
   - Logout/login.
   - Confirm records persist.

5. Dashboard impact verification:
   - Return to Dashboard after Section 3 and Section 4 activity.
   - Confirm Refleksi Jiwa and Catatan Bhumi are not fallback/static.
   - Confirm no `undefined`, `null`, or stale copy appears.

6. Evidence required:
   - Screenshot Wellness Section 3 after checklist progress.
   - Screenshot Journey progress split.
   - Screenshot Journey detail/history.
   - Screenshot Dashboard after save.
   - Console check for no `permission-denied`.
   - Firestore path screenshots or logged readback evidence.

QA result rules:
- PASS only with real auth, real Firebase, natural AccessGuard access, refresh persistence, and logout/login persistence.
- BLOCKED if AccessGuard prevents reaching Wellness/Journey.
- FAIL if saves occur but Journey/Dashboard does not read them.

## Implementation Boundary After Approval

Allowed after Founder approval:
- Journey UI read/display of `wellnessState.enoughnessChecklist`.
- Dashboard context read of existing Journey enoughness field.
- Narrative/context mapping from existing fields.
- Report update and runtime verification.

Not allowed without separate approval:
- New Journey repository.
- New Firestore collection.
- New memory engine.
- New save pipeline.
- Badge/access rule edits.
- Billing changes.
- Firestore rules changes.
- versionCode/AAB/Play Console changes.

## Final Recommendation

Implement Option B after Founder approval:

```text
Journey separates:

Rencana Hari Ini
from Section 3 enoughness checklist

Praktik Tambahan
from Section 4 practice completion
```

This is the most faithful model to MOANA Source of Truth because it lets daily care count in Journey without turning optional deeper practices into obligations.

Final status: PLAN READY FOR FOUNDER REVIEW. NO CODE IMPLEMENTED.
