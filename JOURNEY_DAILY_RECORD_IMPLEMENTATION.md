# Journey Daily Record Implementation

Journey now has a merge-safe daily memory record at:

`journeyDailyRecords/{userId}/entries/{appDate}`

Dashboard creates the record for today even when no Innerwork activity occurs. Catatan, Innerwork recommendation, and Innerwork completion progressively enrich the same document.

Default completion state is neutral:

- `completed: false`
- `skipped: true`
- `reason: unknown`

No guilt language is stored or generated.

Validation:

- Full TypeScript: PASS
- Production build: PASS
- Targeted Journey lint: PASS
