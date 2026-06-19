# Dashboard to Catatan Difference Audit

## Active inputs

`DailyNoteV2` receives current Daily Guidance, current state, yesterday state, and seven recent Daily States.

## User A: new user

Likely history sentences:

> “Akhir-akhir ini mungkin belum banyak waktu untuk berhenti dan menanyakan kabar dirimu sendiri.”

Journey context falls back to:

> “Langkahmu nggak harus kelihatan gede buat tetap berarti.”

History-specific traces are omitted because `hasHistory` is false.

## User B: 30-day history

Only the latest seven Daily States are loaded. The stated 30-day evolution:

`Over Responsibility → Boundary Issues → Difficulty Resting`

is not directly supplied to Catatan.

Possible sentence differences are activity-based:

> “Belakangan kamu terlihat cukup konsisten.”

or:

> “Beberapa hari ini ritme harimu lagi berat ya?”

Yesterday completion can also add:

> “Kemarin kamu sempat memberi ruang untuk mendengarkan diri…”

## Comparison

- New vs established user: visibly different when recent activity exists.
- Thirty-day issue evolution: no direct difference.
- Weekly/monthly/growth/coach learning: no sentence contribution.
- Reflection quality is not directly used by Catatan.

## Failure flag

**FAIL: a rich 30-day issue history is reduced to seven-day activity presence and yesterday completion.** Catatan continuity exists, but thematic learning continuity does not.
