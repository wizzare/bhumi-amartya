# MOANA v58 R1 — Firestore Owner Rules Report

## 1. Ticket ID
`MOANA-v58-R1`

## 2. Timestamp
`2026-06-29T08:38:00+07:00`

## 3. Files Reviewed
* `firestore.rules`
* `lib/repositories/wellnessAssessmentRepository.ts`
* `lib/repositories/journeyRepository.ts`
* `MOANA_V58_WELLNESS_RUNTIME_AUDIT.md`

## 4. Files Changed
* `firestore.rules`
* `MOANA_v58_R1_FIRESTORE_RULES_REPORT.md`

---

## 5. `journeyDailyRecords` Rule Before
```rules
    match /journeyDailyRecords/{userId} {
      allow read, write: if isOwner(userId) || isFounderByEmail() || isFounderOrAdmin();

      match /{document=**} {
        allow read, write: if isOwner(userId) || isFounderByEmail() || isFounderOrAdmin();
      }
    }
```

## 6. `journeyDailyRecords` Rule After
```rules
    match /journeyDailyRecords/{userId} {
      allow read, write: if isOwner(userId) || isFounderByEmail() || isFounderOrAdmin();

      match /entries/{dateKey} {
        allow read, write: if isOwner(userId) || isFounderByEmail() || isFounderOrAdmin();
      }

      match /{document=**} {
        allow read, write: if isOwner(userId) || isFounderByEmail() || isFounderOrAdmin();
      }
    }
```

---

## 7. `wellnessAssessments` Repository Payload Summary
As audited from `lib/repositories/wellnessAssessmentRepository.ts`:
* **Destination Path**: `wellnessAssessments/{docId}` where `docId` is `${uid}_${timestamp}`.
* **Payload Structure**:
  ```ts
  {
    uid: string; // Authenticated user ID (request.auth.uid)
    type: "daily" | "weekly" | "monthly";
    assessmentVersion: string;
    timestamp: string; // ISO string
    responses: { questionId: number; score: number }[];
    dimensionScores: AssessmentResult;
  }
  ```
* **User Field**: Document stores `uid` (matching `request.auth.uid`).

## 8. `wellnessAssessments` Rule Before
* **Absent** (Collection was not defined in `firestore.rules`, defaulting to all reads and writes denied in production Firestore).

## 9. `wellnessAssessments` Rule After
```rules
    match /wellnessAssessments/{docId} {
      allow read, write: if uidMatches("uid") || isFounderByEmail() || isFounderOrAdmin();
    }
```

---

## 10. Security Scope Explanation
* **Owner Scoped**: Read, create, update, and delete access for `wellnessAssessments/{docId}` is restricted exclusively to authenticated users whose `request.auth.uid` matches the `uid` property inside the document (via standard project helper `uidMatches("uid")`).
* **Explicit Subcollection Scoped**: `journeyDailyRecords/{userId}` now explicitly matches both `entries/{dateKey}` subcollection documents and recursive nested documents, guaranteeing that only the document owner (`request.auth.uid == userId`) or designated founder/admin roles can access or modify daily records.
* **No Global Access**: Neither rule allows unauthenticated access or cross-user data exposure.

---

## 11. Commands Run
* `view_file` to inspect `firestore.rules` and `wellnessAssessmentRepository.ts`.
* `write_to_file` to apply clean owner rules to `firestore.rules`.
* `npx tsc --noEmit` for TypeScript validation.
* `firebase deploy --only firestore:rules` for production cloud deployment.

## 12. Whether Rules Were Deployed
* **YES**: Deployed using command `firebase deploy --only firestore:rules` at `2026-06-29T08:33:07+07:00` to project `bhumiamartya-fe85c`. Result: `released rules firestore.rules to cloud.firestore`.

## 13. Runtime Retest Status
* **PASS**: Founder live runtime retest confirmed ("Sudah ke-save dan muncul di Journey.").

---

## 14. Final Status
**MOANA-v58-R1 PASS**
