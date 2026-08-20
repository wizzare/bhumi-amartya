# WIDYA REGRESSION — AFFECTED USERS ENUMERATION (PHASE 9)

**Status:** SCOPE/Methodology defined. Execution REQUIRES Founder/ops authorization
and production Firestore read access (not available in this session).

## Risk window definition

A user is at risk of the **same bug as Widya** if ALL three hold:
1. They have an entry in `testerBadgeRegistry/{uid}` with
   `badge ∈ {"Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"}`.
2. They have a `users/{uid}` document with `entitlementSource == "google_play"`
   AND `membershipType == "PREMIUM"` (paid subscriber on file).
3. Their `users/{uid}.membershipExpiryDate` is **earlier than** the canonical
   end (`INTI_ACCESS_UNTIL` for Inti, `ALFA_ACCESS_UNTIL` for Alfa).

This is the "tester + Play stale" pattern. Before the parallel-resolver fix
(Build 100 commit `1d943c8`), such a user was correctly granted access today
(via the tester branch) but would be silently locked out the day after their
tester grant expires, even though their real Play subscription is still
active.

## Query

Run in the Firebase console (Cloud Firestore > Query):

```
Collection: users
Where: entitlementSource == "google_play"
        AND membershipType == "PREMIUM"
        AND membershipExpiryDate < "2026-08-30T00:00:00+07:00"
```

For each match, check `testerBadgeRegistry/{uid}.badge` to confirm whether the
user is in the at-risk population.

## Population size estimate (Founder-provided data only)

The Founder holds the canonical Inti/Alfa tester list at:
`lib/billing/founderTesterSourceOfTruth.ts` → registry-backed, see also
`testerBadgeRegistry/{uid}` collection.

For each tester in that registry, check whether they ALSO have a Google Play
subscription (i.e. they are a paying user who also got a tester grant). The
intersection is the at-risk population.

Known seed (Founder-confirmed, 2026-08-16):
- Widya Gustina (ydKZoZuehlewy93U3vrK8abIHS42): confirmed at risk, fixed by
  Build 100 commit 1d943c8.

## Required remediation (operational, not code)

For each at-risk user:
1. **Option A (preferred)**: refresh `users/{uid}.membershipExpiryDate` to
   match the real Google Play subscription end. This is a one-time admin
   write. The verifier service (`services/billing-verifier/api/billing/...`)
   has the auth context to do this server-side.
2. **Option B (interim)**: leave Firestore stale but ensure the parallel
   resolver is reading the canonical Inti/Alfa end (which the Build 100
   commit already does). Then the user will be locked out only AFTER the
   real Play subscription expires, which is the correct behavior.

## How to run this audit (Founder script)

Requires service account credentials with Firestore read access. Not runnable
from the current session.

```
set -a && . ./.env.local && set +a
npx tsx scripts/forensic/affected_tester_subscriber_audit.ts
```

Where the script must:
1. Read all `testerBadgeRegistry/{uid}` docs (small population).
2. For each, read `users/{uid}` doc and check condition #2 and #3.
3. Emit a CSV: `uid,email,badge,membershipExpiryDate,canonical_end,risk=true|false`.
4. Output to `audit/widya_affected_users_<date>.csv`.

## What this session DID NOT do

- Did NOT read production Firestore.
- Did NOT enumerate the at-risk population.
- Did NOT refresh any `users/{uid}` document.
- Did NOT modify any user data.

This is by design (AGENTS.md §8 Production Safety — no production reads
without explicit Founder authorization).
