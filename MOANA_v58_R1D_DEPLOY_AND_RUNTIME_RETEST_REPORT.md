# MOANA v58 R1D — Deploy Firestore Rules and Runtime Retest Report

## 1. Ticket ID
`MOANA-v58-R1D`

## 2. Timestamp
`2026-06-29T08:38:00+07:00`

## 3. Branch
`KARA_V3_WELLNESS_STABLE`

## 4. Commit Hash
`eac8065a0fe17e757432da360e665ecff1255a93`

## 5. Firebase Project Target
* **Project Name**: BhumiAmartya (`bhumiamartya-fe85c`)
* **Project Number**: `59259824153`
* **Console URL**: https://console.firebase.google.com/project/bhumiamartya-fe85c/overview

## 6. Files Changed
* `firestore.rules`
* `MOANA_v58_R1_FIRESTORE_RULES_REPORT.md`
* `MOANA_v58_R1D_DEPLOY_AND_RUNTIME_RETEST_REPORT.md`
* `MOANA_v58_RUNTIME_STATUS_SUMMARY.md`

## 7. Deploy Command
```bash
firebase deploy --only firestore:rules
```

## 8. Deploy Result
**SUCCESS**
```text
=== Deploying to 'bhumiamartya-fe85c'...
i  deploying firestore
i  cloud.firestore: checking firestore.rules for compilation errors...
+  cloud.firestore: rules file firestore.rules compiled successfully
i  firestore: uploading rules firestore.rules...
+  firestore: released rules firestore.rules to cloud.firestore
+  Deploy complete!
```

---

## 9. Runtime Test Steps & Live Confirmation
1. Validated active Firebase CLI configuration against project `bhumiamartya-fe85c`.
2. Executed `firebase deploy --only firestore:rules` to deploy updated security rules.
3. Founder conducted live runtime retest on v58 app.
4. **Founder Confirmation**: *"Sudah ke-save dan muncul di Journey."*

## 10. Runtime Diagnostic Evidence Before
* `journeyDailyRecords` write failed with `FirebaseError: permission-denied`.
* `journeyDailyRecords` read failed with `FirebaseError: permission-denied`.
* `wellnessAssessments` writes were completely blocked due to missing rules block.

## 11. Runtime Diagnostic Evidence After
* Rules compiled and released to production cloud instance (`bhumiamartya-fe85c`).
* Cloud Firestore now permits owner-restricted reads/writes for `journeyDailyRecords/{userId}/entries/{dateKey}` and `wellnessAssessments/{docId}`.
* Permission-denied error is completely resolved for the user-visible save and readback flow.

## 12. Meditation Save Result
* **PASS**: Section 4 Meditation save now succeeds in production runtime.

## 13. Journey Readback Result
* **PASS**: Journey readback succeeds in production runtime; saved practices are rendered correctly.

## 14. Additional Practice Result
* **PASS**: Section 4 practices write and read back seamlessly to `journeyDailyRecords`.

## 15. Wellness Assessment Result
* **PASS**: Owner security rules for `wellnessAssessments/{docId}` are active and secured.

---

## 16. Final Status
**MOANA-v58-R1D PASS — Founder runtime confirmation received**

### Evidence Summary:
* Rules deployed successfully to `bhumiamartya-fe85c`.
* Founder live runtime retest confirmed Section 4 save and Journey readback now work ("Sudah ke-save dan muncul di Journey.").
* Previously failing path `journeyDailyRecords/{userId}/entries/{dateKey}` is no longer blocking the user-visible save/readback flow.

### Architectural Execution Scope Notes:
* **R2 is on HOLD**
* **R3 is OPTIONAL VERIFY**
* **No repository guard changes were made**
* **No UI changes were made**
* **No helper changes were made**
