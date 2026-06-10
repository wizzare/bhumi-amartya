# ACCOUNT DELETION QA

Date: 2026-06-06
Environment: local workspace against configured Firebase project
Tester: Codex automated QA script

## Summary

Overall result: **FAIL**

End-to-end account deletion could not be fully verified because the configured Firebase project rejected Firestore writes from the newly created test account with:

```text
PERMISSION_DENIED: Missing or insufficient permissions.
```

The test account creation step passed, but setup/blueprint/journal/daily guidance seed data could not be created. Because the required user-scoped Firestore data could not be seeded, the account deletion flow could not be verified end-to-end.

## QA Steps

| Step | Result | Evidence |
| --- | --- | --- |
| Create test account | PASS | Firebase Auth returned UID in both runs. |
| Complete setup | FAIL | Firestore write to user-scoped setup/profile data was denied. |
| Generate blueprint | NOT RUN | Blocked by Firestore permission failure. |
| Create journal entry | NOT RUN | Blocked by Firestore permission failure. |
| Generate daily guidance | NOT RUN | Blocked by Firestore permission failure. |
| Delete account from Settings | NOT RUN | Seed data could not be created, so UI deletion was not executed. |

## Verification Results

| Target | Result | Notes |
| --- | --- | --- |
| `users/{uid}` deleted | NOT VERIFIED | `users/{uid}` could not be created due to Firestore permission denied. |
| `blueprints/{uid}` deleted | NOT VERIFIED | `blueprints/{uid}` could not be created due to Firestore permission denied. |
| `dailyGuidance/{uid}_*` deleted | NOT VERIFIED | Daily guidance doc could not be created. |
| `journals/{uid}/entries/*` deleted | NOT VERIFIED | Journal entry could not be created. |
| local cache deleted | NOT VERIFIED | UI deletion was not reached. |
| Firebase Auth user deleted | PARTIAL PASS | Second QA run cleanup deleted the Auth user after failure. First failed run may have left one orphan test Auth user. |

## Log Evidence

### Run 1

```json
{
  "qaRunAt": "2026-06-06T06:48:31.757Z",
  "error": "permission-denied",
  "message": "7 PERMISSION_DENIED: Missing or insufficient permissions.",
  "evidence": [
    {
      "step": "create test account",
      "status": "PASS",
      "details": "uid=5VtjhRytQ0TEX9P456IrCBZjEH02"
    }
  ],
  "remaining": {}
}
```

### Run 2

```json
{
  "qaRunAt": "2026-06-06T06:49:05.826Z",
  "error": "permission-denied",
  "message": "7 PERMISSION_DENIED: Missing or insufficient permissions.",
  "evidence": [
    {
      "step": "create test account",
      "status": "PASS",
      "details": "uid=cUFStS4iNePSDIDAsXqK7I8dAdx1"
    },
    {
      "step": "cleanup Firebase Auth user after failure",
      "status": "PASS",
      "details": "deleteUser resolved"
    }
  ],
  "remaining": {}
}
```

## Remaining Data

- Firestore: no seeded QA Firestore documents were created in the successful-cleanup run because writes were denied.
- Firebase Auth:
  - `cUFStS4iNePSDIDAsXqK7I8dAdx1`: deleted by cleanup.
  - `5VtjhRytQ0TEX9P456IrCBZjEH02`: potential orphan Auth test user from the first failed run before cleanup logic was added. This should be checked and removed in Firebase Console.

## Screenshot / Log Evidence

No browser screenshot was produced because the QA flow was blocked before the app UI could create user data and reach Settings deletion. The evidence above is command log output from the Firebase SDK QA run.

## Blocker

**P0: Firestore permissions prevent authenticated QA user writes.**

Expected app-owned writes for setup/profile/blueprint/journal/daily guidance must be allowed for the authenticated user, or QA must be run against a Firebase project where the matching Firestore rules are deployed.

## Recommendation

1. Confirm the local Firebase config points to the intended QA/staging project.
2. Deploy or verify Firestore rules for:
   - `users/{uid}`
   - `blueprints/{uid}`
   - `dailyGuidance/{uid}_*`
   - `journals/{uid}/entries/*`
   - legacy `journalEntries` if still used
3. Remove the potential orphan Auth test user `5VtjhRytQ0TEX9P456IrCBZjEH02` from Firebase Console if it exists.
4. Rerun:

```bash
node scripts/accountDeletionQa.mjs
```

