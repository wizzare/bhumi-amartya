# Reflection Firestore Proof

## Collections

- `dailyStates/{uid}/entries/{date}`
- `journeyDailyRecords/{uid}/entries/{date}`

Both repositories call Firestore `setDoc(..., { merge: true })`.

## Proof boundary

Repository calls and exact document paths are verified from active source. A production-account document read was not performed. Browser execution was blocked by the environment.

## Risk

The first document may persist while the second fails. No batch, transaction, retry queue, or reconciliation flag joins them.
