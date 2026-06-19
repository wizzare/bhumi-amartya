# Zone B to Journey Context Audit

## Journey payload

Contextual saves write:

- `dominantIssue`
- `issueCategory`
- `innerworkRecommendation.practiceId`
- `innerworkRecommendation.practiceType`
- `innerworkRecommendation.practiceTitle`
- duration and source signals
- completion and timestamp
- actual practice ID/category/duration
- reflection result
- helpful classification when the result indicates lighter/calm

Journaling and Meditation use their existing emotional reflection.

Contextual Yoga and Workout now require:

- Lebih Tenang
- Sama Saja
- Sedikit Lebih Berat
- Belum Yakin

before saving.

## Can Journey know “What helped for Difficulty Resting?”

**YES**, for the most recently saved contextual Zone B practice on that date.

## Limitation

`JourneyDailyRecord` has one recommendation and completion slot per day. Completing several Zone B practices on the same date overwrites the earlier Journey slot; detailed Yoga/Workout activity records still remain in their activity collection.
