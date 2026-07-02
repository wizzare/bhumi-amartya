# MOANA V65 Google Play Billing Implementation Report

Date: 2026-07-01
Build: 65
Scope: Closed Testing only

## Status

Implementation status: PASS for code readiness.

Deploy status: pending explicit approval for the new Cloud Function.

Play Console status remains pending until Build 65 AAB is uploaded to Closed Testing. The Android manifest merge now contains `com.android.vending.BILLING`, so Play Console should recognize the app as Billing-capable after the Build 65 upload is processed.

## Files Changed

- `android/app/build.gradle`
  - Upgraded Google Play Billing Library to `com.android.billingclient:billing:9.1.0`.
- `android/app/src/main/java/com/bhumiamartya/app/MainActivity.java`
  - Registered the native Capacitor billing plugin.
- `android/app/src/main/java/com/bhumiamartya/app/billing/BhumiBillingPlugin.java`
  - Added BillingClient initialization, connection, product query, purchase flow, purchase listener, acknowledgement, and restore.
- `lib/billing/googlePlayBilling.ts`
  - Replaced placeholder billing flow with Capacitor bridge methods and Firebase callable verification.
- `app/upgrade/page.tsx`
  - Added Premium purchase screen for Android Google Play purchases.
  - The client displays server-returned entitlement state and never unlocks locally.
- `functions/index.js`
  - Added `verifyGooglePlayPurchase` callable function.
  - Verifies Google Play purchase token with Android Publisher API before updating Firestore.
- `functions/package.json`
  - Added `googleapis`.
- `functions/package-lock.json`
  - Updated dependency lock for `googleapis`.
- `lib/config/buildInfo.ts`
  - Updated fallback build metadata to version `3.2.1`, code `65`.

## Billing Architecture

Google Play Billing is used only for payment collection.

The Premium access authority remains server-owned:

1. Android app starts Google Play purchase flow.
2. Google Play returns purchase token.
3. Client sends purchase token to `verifyGooglePlayPurchase`.
4. Cloud Function verifies the token through Google Play Developer API.
5. Firestore is updated by the server with `plan`, `membershipType`, `accessUntil`, `subscriptionStatus`, `purchase`, `purchases`, and `entitlements`.
6. Client refreshes profile and displays the entitlement returned from Firestore.

The client does not grant Premium from purchase result alone.

## Client Flow

- Product ID: `bhumi_premium`
- Base plan: `monthly`
- Native plugin:
  - Initializes `BillingClient`.
  - Queries `ProductDetails` for `bhumi_premium`.
  - Launches Google Play purchase sheet.
  - Receives purchases via `PurchasesUpdatedListener`.
  - Acknowledges purchased subscriptions using Billing Library.
  - Restores active subscriptions with `queryPurchasesAsync`.
- Web layer:
  - Calls native plugin only on Android native runtime.
  - Sends purchase token to server callable.
  - Refreshes auth profile after server verification.

## Server Flow

- Callable: `verifyGooglePlayPurchase`
- Region: `asia-southeast2`
- Requires Firebase Auth.
- Validates:
  - Package name: `com.bhumiamartya.app`
  - Product ID: `bhumi_premium`
  - Base plan: `monthly`
  - Purchase token exists
- Uses Android Publisher API:
  - `purchases.subscriptionsv2.get`
  - Best-effort server acknowledgement when Google reports pending acknowledgement.
- Grants entitlement only when Google reports active subscription state and valid expiry.

## Verification

- `npx tsc --noEmit`: PASS
- `node -c functions/index.js`: PASS
- `.\gradlew.bat :app:processDebugMainManifest`: PASS
- `.\gradlew.bat :app:assembleDebug`: PASS
- Merged manifest verification:
  - `android/app/build/intermediates/merged_manifests/debug/processDebugManifest/AndroidManifest.xml`
  - Contains `<uses-permission android:name="com.android.vending.BILLING" />`

Official reference checked:

- Google Play Billing Library release notes show Billing Library `9.1.0` as the current supported release on 2026-06-18.
- Android billing integration docs require purchase verification before entitlement grant and note subscription acknowledgement requirements.

## Known Limitations

- Play Console subscription menu cannot be confirmed locally. It must be confirmed after uploading Build 65 to Closed Testing.
- `verifyGooglePlayPurchase` has been implemented but was not deployed from this session because deploying live billing entitlement code needs explicit approval.
- Cloud Functions service account must have Google Play Android Developer API access for the app in Play Console.
- Real purchase sheet, product load, restore, token verification, and Firestore entitlement update require an internal/closed testing track build installed from Google Play.
- No Production upload was performed.
