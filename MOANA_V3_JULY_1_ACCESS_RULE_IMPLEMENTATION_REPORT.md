# MOANA V3 July 1 Access Rule Implementation Report

STATUS: PARTIAL

Reason: spreadsheet mapping, access helper rules, and server/admin seed contract are implemented, but production Firestore data was not mutated in this task. New user automatic server assignment still requires backend/admin execution.

## Files Changed

- `lib/billing/founderTesterSourceOfTruth.ts`
- `lib/billing/billingPreparation.ts`
- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`
- `scripts/prepare_july1_access_seed.ts`
- `MOANA_V3_JULY_1_ACCESS_RULE_IMPLEMENTATION_REPORT.md`

## Spreadsheet Rows Processed

53 user rows processed from:

```text
C:\Users\shein\Downloads\Ringkasan_Tester_Bhumi_FormatExcel.xlsx
```

Columns read:

- Nama
- Email
- UID
- Tanggal Daftar
- Total Hari Aktif
- Badge

## Badge Mapping Summary

- `Founder` -> `Founder`
- `Inti` -> `Penjaga Bhumi Inti`
- `Alfa` -> `Penjaga Bhumi Alfa`
- default/new user -> `Penjaga Bhumi`

No new badge category was created.

Legacy badge categories removed from active preparation helper:

- `Tester 1 Bulan`
- `Tester 2 Bulan`
- `New User (3 Hari)`
- `Expired` as badge

`expired` remains valid only as plan/subscription status.

## Access Rule Summary

Founder:

- badge: `Founder`
- plan: `lifetime_free`
- accessUntil: `null`
- full access lifetime

Penjaga Bhumi Inti:

- badge: `Penjaga Bhumi Inti`
- plan: `free_access`
- accessUntil: registration date + 2 months
- after expiry: Dashboard only

Penjaga Bhumi Alfa:

- badge: `Penjaga Bhumi Alfa`
- plan: `free_access`
- accessUntil: registration date + 1 month
- after expiry: Dashboard only

Penjaga Bhumi:

- badge: `Penjaga Bhumi`
- plan: `free_trial`
- accessUntil: max(registration date, July 1 effective date) + 3 days
- after expiry: Dashboard only

Billing remains payment only. Billing runtime was not activated.

## Founder Users

Count: 1

- Widhi Wedhaswara / wizzare@gmail.com / vybyLLFpBxhF1L1m9liGHm5chgG2

Note: the spreadsheet marks Kahfi Fauzil Adhim as `Alfa`, so the static SoT now follows the spreadsheet for this task.

## Inti Users

Count: 25

Examples:

- diah shofina izzati
- Audri Imelda
- Nisa Maulidyani
- Widya Gustina
- Henny Hendrianti

Full list is implemented in `FOUNDER_TESTER_SOURCE_OF_TRUTH`.

## Alfa Users

Count: 27

Examples:

- Dwi mei
- nenty septi sugiartini
- Nanda Viandra
- Kahfi Fauzil Adhim
- Bayu Putra Nusantara

Full list is implemented in `FOUNDER_TESTER_SOURCE_OF_TRUTH`.

## Penjaga Bhumi Users

Count from spreadsheet: 0

Rule implemented for all users outside Founder/Inti/Alfa and all new users after July 1:

- badge: `Penjaga Bhumi`
- plan: `free_trial`
- accessUntil: max(registration date, July 1 effective date) + 3 days

## New User Rule

Implemented as server-owned contract:

- `buildDefaultNewUserAccessGrant(registeredAt)`
- if `registeredAt < 2026-07-01T00:00:00+07:00`, access starts from July 1
- if `registeredAt >= 2026-07-01T00:00:00+07:00`, access starts from registration date
- accessUntil is start date + 3 days

Blocked production item:

- The client still must not assign this grant.
- Backend/admin creation flow must call the contract or equivalent server logic.

## Server-Owned Field Check

PASS

Server-owned fields remain protected:

- badge
- plan
- accessUntil
- trialStartedAt
- trialEndsAt
- membership
- subscriptionStatus
- isPremium
- entitlements

Firestore rules were not changed in this task.

## Client Write Check

PASS

Existing profile writes still strip protected fields in:

- `lib/firebase/service.ts`
- `lib/repositories/userRepository.ts`

The new seed contract is server/admin-only:

- `scripts/prepare_july1_access_seed.ts`
- dry-run by default
- requires explicit `--apply`
- requires `FIREBASE_SERVICE_ACCOUNT`

The script was not executed with `--apply`.

## Feature Lock Matrix

Dashboard:

- open for all users, including expired

Locked when expired:

- Journey
- Wellness
- Meditation
- Journaling
- Yoga
- Workout
- Audio Healing
- Healthy Food
- Herbal
- Manifestasi
- Refleksi Jiwa
- Catatan Hari Ini
- AI Memory premium features
- Premium content

Implemented in access helpers:

- `lib/billing/accessControl.ts`
- `lib/access/accessControl.ts`

Remaining integration risk:

- Some screens already call the access helpers.
- Screens that do not call the access helpers still need UI route-guard integration in a later task if product wants hard page-level blocking everywhere.

## Verification Result

TypeScript: PASS

Command:

```powershell
npx tsc --noEmit
```

Access logic verification:

- Founder full access: PASS by helper rule
- Inti active before accessUntil: PASS by helper rule
- Inti expired after accessUntil: PASS by helper rule
- Alfa active before accessUntil: PASS by helper rule
- Alfa expired after accessUntil: PASS by helper rule
- Penjaga Bhumi active before accessUntil: PASS by helper rule
- Penjaga Bhumi expired after accessUntil: PASS by helper rule
- Penjaga Bhumi pre-July-1 registration starts trial at July 1 effective date: PASS by server-owned grant contract
- Dashboard open when expired: PASS by helper rule

Production data verification:

- NOT RUN
- No Firestore mutation was performed.
- No real user runtime verification was performed.

## Blocked Items

- Backend/admin must apply access grants to production Firestore.
- New user server assignment must be wired to account creation or admin job.
- Route-level guard coverage should be audited for screens that do not currently call access helpers.
- Runtime Android/Firebase verification remains required after data is applied.

## Regression Risk

MEDIUM.

Reasons:

- Access helper behavior changed from billing-disabled open access to server-owned badge/accessUntil access.
- Billing runtime remains disabled.
- No Journey pipeline change.
- No Dashboard engine change.
- No Firestore rules change.
- No data model change.
- No build release was generated.

## Next Required Task

1. Run dry-run seed review:

```powershell
npx ts-node scripts/prepare_july1_access_seed.ts
```

2. After Founder approval, run server/admin apply with production service account:

```powershell
npx ts-node scripts/prepare_july1_access_seed.ts --apply
```

3. Wire new-user server assignment to call `buildDefaultNewUserAccessGrant()`.

4. Runtime verify with real authenticated users:

- Founder
- Penjaga Bhumi Inti active and expired simulation
- Penjaga Bhumi Alfa active and expired simulation
- Penjaga Bhumi active and expired simulation
- New user after July 1
