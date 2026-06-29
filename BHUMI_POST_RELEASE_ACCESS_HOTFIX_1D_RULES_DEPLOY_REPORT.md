# BHUMI POST-RELEASE ACCESS HOTFIX-1D RULES DEPLOY REPORT

## 1. Timestamp

- Report timestamp: 2026-06-29 12:36:14 +07:00
- Deploy timestamp from Firebase release: 2026-06-29T05:29:49.202919Z
- Local timezone: Asia/Jakarta

## 2. Firebase Project ID

- Expected project: `bhumiamartya-fe85c`
- Confirmed by `firebase projects:list`: `bhumiamartya-fe85c (current)`
- Confirmed by `firebase use`: `bhumiamartya-fe85c`
- Deploy target used: `bhumiamartya-fe85c`

## 3. Branch

- Branch: `KARA_V3_WELLNESS_STABLE`

## 4. Commit Hash

- HEAD: `c5087f47128621fb04d3d8051f197cafa1c7cd14`

## 5. Rules File Reviewed

- Reviewed file: `firestore.rules`
- Rules root collections confirmed:
  - `users/{userId}`
  - `profiles/{userId}`
  - `userProfiles/{userId}`

For these three root profile paths, normal owner writes are allowed only when protected access fields are not created or changed:

- `create`: `isOwner(userId) && doesNotCreateProtectedAccessFields()`
- `update`: `isOwner(userId) && doesNotChangeProtectedAccessFields()`

Founder/admin writes remain allowed through:

- `isFounderByEmail()`
- `isFounderOrAdmin()`

## 6. Protected Fields Confirmed

Confirmed in `protectedAccessFields()`:

- `plan`
- `plans`
- `planLabel`
- `tier`
- `tiers`
- `role`
- `roles`
- `guardianRole`
- `badge`
- `badges`
- `testerBadge`
- `guardianBadge`
- `recognitionTier`
- `isDeveloper`
- `isFoundingMember`
- `premium`
- `isPremium`
- `subscription`
- `subscriptionStatus`
- `entitlement`
- `entitlements`
- `membership`
- `membershipType`
- `memberType`
- `membershipStartDate`
- `membershipExpiryDate`
- `membershipExpiresAt`
- `billing`
- `purchase`
- `purchases`
- `productId`
- `expiryDate`
- `validUntil`
- `trial`
- `trialStartedAt`
- `trialEndsAt`
- `quota`
- `limits`
- `credits`
- `founder`
- `admin`
- `staff`
- `paid`
- `paymentStatus`

Required field coverage from task:

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
- `accessUntil`: NOT PRESENT
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

Note: `accessUntil` was requested for confirmation but is not currently listed in `protectedAccessFields()`. Closely related expiry fields are present: `membershipExpiresAt`, `membershipExpiryDate`, `expiryDate`, and `validUntil`.

## 7. Deploy Command

Dry-run validation:

```powershell
firebase deploy --only firestore:rules --dry-run --project bhumiamartya-fe85c
```

Production deploy:

```powershell
firebase deploy --only firestore:rules --project bhumiamartya-fe85c
```

## 8. Deploy Result

Dry-run result:

- PASS
- Firebase CLI confirmed: `cloud.firestore: rules file firestore.rules compiled successfully`
- Firebase CLI confirmed: `Dry run complete!`

Production deploy result:

- PASS
- Firebase CLI confirmed: `cloud.firestore: rules file firestore.rules compiled successfully`
- Firebase CLI confirmed: `firestore: released rules firestore.rules to cloud.firestore`
- Firebase CLI confirmed: `Deploy complete!`
- Released ruleset: `projects/bhumiamartya-fe85c/rulesets/1f9ab0b1-b0d8-4b9a-8bf2-eb30873fb6e4`
- Release: `projects/bhumiamartya-fe85c/releases/cloud.firestore`
- Release update time: `2026-06-29T05:29:49.202919Z`

## 9. Runtime / Security Verification Result

Core app route smoke after rules deploy:

- `/dashboard`: PASS, HTTP 200
- `/journal`: PASS, HTTP 200
- `/journey`: PASS, HTTP 200
- `/wellness`: PASS, HTTP 200
- `/innerwork/manifestasi`: PASS, HTTP 200

Catatan Hari Ini note:

- Catatan Hari Ini was verified as part of Dashboard availability.
- There is no standalone `/catatan` route in the current app directory.

Manifestasi Hari Ini note:

- Actual route is `/innerwork/manifestasi`.

## 10. Allowed Profile Write Result

Live production normal-user write test:

- NOT COMPLETED

Reason:

- Attempted to create a normal production client session with `signInAnonymously`.
- Production Firebase Auth rejected anonymous sign-in with `auth/admin-restricted-operation`.
- No safe normal-user credentials were available in the repo or environment.

Local rules-emulator fallback:

- NOT COMPLETED

Reason:

- Attempted to run `firebase emulators:exec --only firestore --project bhumiamartya-fe85c`.
- Firebase CLI failed with: `Could not spawn java -version. Please make sure Java is installed and on your system PATH.`
- Therefore, synthetic normal-user allowed-write assertions could not be executed locally.

Expected allowed fields reviewed in rules/code:

- `name`
- `birthDate`
- `birthTime`
- `birthCity`
- normal `preferences`

These are not listed in `protectedAccessFields()` and should remain writable by the document owner under the deployed rules.

## 11. Protected Field Write Result

Live production normal-user protected-write test:

- NOT COMPLETED

Reason:

- Same blocker as above: anonymous normal-user auth is disabled in production, and no safe normal-user credential was available.

Local rules-emulator fallback:

- NOT COMPLETED

Reason:

- Firestore emulator could not start because Java is unavailable on PATH.

Protected fields reviewed and confirmed in deployed rules:

- `plan`
- `isPremium`
- `badge`
- `role`
- `membership`
- `subscriptionStatus`
- `entitlements`

Rules logic indicates these fields are blocked for normal owner `create` and `update` on:

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

- Firestore rules were successfully deployed to `bhumiamartya-fe85c`.
- Dry-run and production deploy both compiled `firestore.rules` successfully.
- Core app routes still respond after deploy.
- The deployed rules contain the intended protected-field guards for `users/{uid}`, `profiles/{uid}`, and `userProfiles/{uid}`.
- However, runtime protected-write testing with a normal production user was not completed because anonymous auth is disabled and no safe normal-user credentials were available.
- Local emulator verification was also blocked because Java is not installed/on PATH.

Additional follow-up:

- Add `accessUntil` to `protectedAccessFields()` in a future rules patch if that field may ever be used as an entitlement or membership expiry field.
- Complete a normal-user production write test with a dedicated QA account, or install Java and run the Firestore emulator assertion harness.
