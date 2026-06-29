# BHUMI POST-RELEASE ACCESS HOTFIX-1E ACCESSUNTIL RULES PATCH REPORT

## 1. Timestamp

- Report timestamp: 2026-06-29 12:45:33 +07:00
- Deploy release timestamp from Firebase: 2026-06-29T05:44:38.284368Z
- Local timezone: Asia/Jakarta

## 2. Firebase Project ID

- Firebase project ID: `bhumiamartya-fe85c`
- Confirmed with:

```powershell
firebase use
```

Result:

```text
bhumiamartya-fe85c
```

## 3. Previous Ruleset ID

- Previous deployed ruleset from HOTFIX-1D: `1f9ab0b1-b0d8-4b9a-8bf2-eb30873fb6e4`

## 4. New Ruleset ID

- New deployed ruleset from HOTFIX-1E: `94e735d5-9efb-469a-bdfd-e0fbbd664ed7`
- Release: `projects/bhumiamartya-fe85c/releases/cloud.firestore`
- Release update time: `2026-06-29T05:44:38.284368Z`

## 5. File Changed

- `firestore.rules`

Scope of change:

- Firestore rules patch only.
- No app code was changed for this task.
- No badge/member business logic was changed.
- No billing behavior was changed.
- No premium locks were activated.

## 6. Protected Field Added: accessUntil

Added to `protectedAccessFields()`:

```text
accessUntil
```

Nearby related protected expiry/access fields confirmed present:

- `expiryDate`
- `validUntil`
- `trialEndsAt`
- `membershipExpiryDate`
- `membershipExpiresAt`

Required protected field coverage after patch:

- `badge`: CONFIRMED
- `badges`: CONFIRMED
- `membership`: CONFIRMED
- `memberType`: CONFIRMED
- `plan`: CONFIRMED
- `tier`: CONFIRMED
- `role`: CONFIRMED
- `roles`: CONFIRMED
- `isPremium`: CONFIRMED
- `premium`: CONFIRMED
- `subscription`: CONFIRMED
- `subscriptionStatus`: CONFIRMED
- `entitlements`: CONFIRMED
- `entitlement`: CONFIRMED
- `trial`: CONFIRMED
- `trialEndsAt`: CONFIRMED
- `accessUntil`: CONFIRMED
- `validUntil`: CONFIRMED
- `expiryDate`: CONFIRMED
- `billing`: CONFIRMED
- `purchase`: CONFIRMED
- `purchases`: CONFIRMED
- `productId`: CONFIRMED
- `paymentStatus`: CONFIRMED
- `founder`: CONFIRMED
- `admin`: CONFIRMED
- `staff`: CONFIRMED

The protected-field guard remains active for normal owner writes on:

- `users/{userId}`
- `profiles/{userId}`
- `userProfiles/{userId}`

Rules behavior:

- Normal owner `create`: allowed only if protected fields are absent.
- Normal owner `update`: allowed only if protected fields are not changed.
- Founder/admin write paths remain allowed.

## 7. Dry-Run Result

Command:

```powershell
firebase deploy --only firestore:rules --dry-run --project bhumiamartya-fe85c
```

Result:

- PASS
- Firebase CLI confirmed:

```text
cloud.firestore: rules file firestore.rules compiled successfully
Dry run complete!
```

## 8. Deploy Result

Command:

```powershell
firebase deploy --only firestore:rules --project bhumiamartya-fe85c
```

Result:

- PASS
- Firebase CLI confirmed:

```text
cloud.firestore: rules file firestore.rules compiled successfully
firestore: released rules firestore.rules to cloud.firestore
Deploy complete!
```

Deployed ruleset:

```text
projects/bhumiamartya-fe85c/rulesets/94e735d5-9efb-469a-bdfd-e0fbbd664ed7
```

## 9. Core Route Result

Core route smoke after deploy:

- `/dashboard`: PASS, HTTP 200
- `/journal`: PASS, HTTP 200
- `/journey`: PASS, HTTP 200
- `/wellness`: PASS, HTTP 200
- `/innerwork/manifestasi`: PASS, HTTP 200

Notes:

- Journal/Refleksi was verified through `/journal`.
- Manifestasi Hari Ini was verified through `/innerwork/manifestasi`.
- Catatan Hari Ini is part of Dashboard in the current app structure, not a standalone `/catatan` route.

## 10. Allowed Write Test Result

Production real-QA-user allowed write test:

- NOT COMPLETED

Reason:

- No safe QA email/password credentials were available in `.env`, `.env.local`, `.env.local.example`, or reviewed scripts.
- Only public Firebase web config was available.
- Anonymous auth remains unavailable for this verification path.

Expected allowed normal profile fields:

- display name / `name`
- normal profile preference fields
- `birthDate`
- `birthTime`
- `birthCity`

Rules review result:

- These normal profile fields are not in `protectedAccessFields()`.
- They should remain writable by the document owner on `users/{userId}`, `profiles/{userId}`, and `userProfiles/{userId}`.

## 11. Protected Write Test Result

Production real-QA-user protected write test:

- NOT COMPLETED

Reason:

- No safe real QA user credentials were available.
- Anonymous auth was already known unavailable from HOTFIX-1D verification.
- Local emulator fallback remains unavailable unless Java is installed/on PATH.

Protected fields intended for rejection:

- `accessUntil`
- `plan`
- `isPremium`
- `badge`
- `membership`
- `subscriptionStatus`
- `entitlements`

Rules review result:

- All listed protected fields are now present in `protectedAccessFields()`.
- Normal owner `create`/`update` attempts affecting these fields should be rejected on:
  - `users/{userId}`
  - `profiles/{userId}`
  - `userProfiles/{userId}`

## 12. Play Console Status

- NOT TOUCHED

## 13. Version Status

- NOT CHANGED

## 14. AAB Status

- NOT REBUILT

## 15. Final Status

PARTIAL

Reason:

- `accessUntil` was added to the Firestore protected access field list.
- Rules dry-run passed.
- Rules deployed successfully to `bhumiamartya-fe85c`.
- New ruleset `94e735d5-9efb-469a-bdfd-e0fbbd664ed7` was released to `cloud.firestore`.
- Core routes still respond after deploy.
- Real QA user allowed/protected write verification could not be completed because no safe QA credentials were available.

No prohibited actions were performed:

- Billing was not implemented.
- Premium locks were not activated.
- Badge/member business rules were not changed.
- Version code was not changed.
- AAB was not rebuilt.
- Play Console was not touched.
