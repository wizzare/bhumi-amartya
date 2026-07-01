# MOANA V65 — PLAY BILLING READINESS AUDIT

## STATUS: NOT BILLING-READY (NO) ❌

The current Build 64 is not recognized by the Google Play Console as billing-ready because it lacks the necessary Android manifest permissions and native library dependencies.

### 1. Audit Findings

| Requirement | Status | Details |
|-------------|--------|---------|
| **BILLING Permission** | **MISSING** | `com.android.vending.BILLING` is absent from `AndroidManifest.xml`. |
| **Billing Library** | **MISSING** | `com.android.billingclient:billing` is not declared in `app/build.gradle`. |
| **Capacitor Plugin** | **MISSING** | No billing-related plugin (e.g., `@capacitor/purchase`) found in `package.json`. |
| **Native Bridge** | **MISSING** | No billing plugin registered in `android/capacitor.settings.gradle`. |
| **Implementation** | **SKELETON ONLY** | `lib/billing/` contains preparation logic but no active runtime integration. |

### 2. Analysis
Play Console displays "Upload a new APK" because the Google Play Store scanning engine looks for the `com.android.vending.BILLING` permission in the `AndroidManifest.xml` of the latest uploaded Artifact (Build 64). Since this permission is missing, the Subscriptions and In-app Products menus remain locked or require a new billing-capable AAB to be uploaded.

### 3. Missing Pieces
1.  **Android Permission**: The app does not request permission to use the Google Play Billing service.
2.  **Native Dependency**: The project does not include the Google Play Billing Library (Play Billing Client).
3.  **Capacitor Bridge**: There is no bridge between the React/Next.js frontend and the native Android Billing API.
4.  **Product Configuration**: While preparation code exists, no real Product IDs or Subscription IDs are wired to the native layer.

### 4. Minimal Implementation Plan (For Build 65)
To enable Subscription creation in Play Console, the following changes are required in the next build:

1.  **AndroidManifest.xml**: Add the Billing permission:
    ```xml
    <uses-permission android:name="com.android.vending.BILLING" />
    ```
2.  **android/app/build.gradle**: Add the Play Billing Library:
    ```gradle
    implementation "com.android.billingclient:billing:7.1.1"
    ```
3.  **package.json**: Install a Capacitor Billing Plugin:
    ```bash
    npm install @capacitor/purchase
    npx cap sync android
    ```
4.  **Build & Upload**:
    *   Increment `versionCode` to `65`.
    *   Generate a new signed AAB.
    *   Upload to an **Internal Testing** or **Closed Testing** track on Play Console.

**Conclusion**: Build 64 is a "Non-Billing" build. Play Console will only allow subscription management once a "Billing-Capable" build (containing the permission and library) is uploaded and processed.
