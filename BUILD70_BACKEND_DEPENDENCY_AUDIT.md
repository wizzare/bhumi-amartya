# BUILD 70 BACKEND DEPENDENCY AUDIT

This audit performs a strict security and dependency review of all files removed or reviewed during the Web-agent cleanup phase. Specifically, it reviews Firebase Cloud Functions (`functions/`) and Next.js backend API routes (`app/api/`) to determine their exact role in supporting the Android/App platform and the Firebase backend.

---

## 1. Firebase Cloud Functions Review

> [!IMPORTANT]
> **RESTORED & PRESERVED**: The `functions/` directory has been fully restored to the repository. It is classified as **SHARED/BACKEND** infrastructure and will **NOT** be deleted.

### 1.1. `functions/index.js`
1. **Is this used by Android?** **YES**
   - The Android client calls the HTTPS callable Cloud Function `verifyGooglePlayPurchase` when a user purchases a subscription in the app via Google Play billing (`BhumiBillingPlugin.java`).
   - The `assignJuly1AccessOnCreate` onCreate trigger automatically assigns 3-day trial access to new accounts registered on Android.
2. **Is this used by Web?** **NO**
   - The website does not handle Google Play billing or onCreate user grants.
3. **Is this used by Backend?** **YES**
   - Hosted on Firebase Cloud Functions backend.
4. **If removed, what Android functionality changes?**
   - **CRITICAL BREAKAGE**: Users on Android will be unable to purchase or restore the Premium Monthly subscription. Google Play receipt verification and subscription acknowledgement will fail entirely.
   - New users registering accounts on Android will no longer receive the default 3-day free trial grant.
5. **What Firebase functionality changes?**
   - Firestore transactions updating user membership statuses, entitlements, and billing tokens in `users/${uid}` and `billing_purchase_tokens/` will no longer execute.

### 1.2. `functions/package.json` & `functions/package-lock.json`
1. **Is this used by Android?** **YES** (indirectly via function dependency compilation).
2. **Is this used by Web?** **NO**.
3. **Is this used by Backend?** **YES**.
4. **If removed, what Android functionality changes?**
   - Cloud Functions deployment fails due to missing packages (`googleapis`, `firebase-admin`, `firebase-functions`), causing purchase verification to break.
5. **What Firebase functionality changes?**
   - Firebase Functions deployment environment fails to compile.

---

## 2. API Routes Audit (`app/api/`)

### 2.1. `app/api/humandesign/calculate/route.ts`
1. **Is this used by Android?** **NO**
   - The production Android client makes direct requests to the Cloud Run Python calculation container via the `NEXT_PUBLIC_HUMAN_DESIGN_API_URL` environment variable, bypassing the Next.js proxy route entirely.
2. **Is this used by Web?** **YES**
   - The website's public Human Design testing page uses this proxy endpoint to fetch calculations in development mode.
3. **Is this used by Backend?** **YES**
   - Runs on the Next.js Vercel backend.
4. **If removed, what Android functionality changes?**
   - None. The Android application uses local offline calculation adapter (`hdkitAdapter.ts`) and direct Cloud Run endpoint query logic.
5. **What Firebase functionality changes?**
   - None.

---

## 3. Web-only Removed Files Audit

For each additional file removed during the cleanup phase, the dependency status is detailed below:

### 3.1. `app/admin/activity/page.tsx` & `app/admin/page.tsx`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Web Admin Dashboard)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.2. `app/blueprint/destiny-matrix/page.tsx`, `human-design/page.tsx`, `natal-chart/page.tsx`, `tzolkin/page.tsx`, & `page.tsx`
1. **Is this used by Android?** **NO** (Mobile profile views reside under `app/profile/`)
2. **Is this used by Web?** **YES** (Web calculator previews)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.3. `components/blueprint/DestinyMatrixVisual.tsx`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Web Destiny Matrix graph rendering)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.4. `lib/engines/destinyMatrixLegacyTranslator.ts` & `destinyMatrixMeaningSynthesis.ts`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Destiny Matrix web preview summaries)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.5. `lib/visual/destinyMatrixVisualModel.ts`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Web Destiny Matrix graph calculations)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.6. `src/app/founder/page.tsx` & `lib/founder/founderMetrics.ts`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Web Founder metrics page)
3. **Is this used by Backend?** **NO**
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** None.

### 3.7. `secure/bhumiamartya-adminsdk.json.json`
1. **Is this used by Android?** **NO**
2. **Is this used by Web?** **YES** (Web APIs accessing Firestore with full admin privileges)
3. **Is this used by Backend?** **YES** (Vercel serverless APIs authentication)
4. **If removed, what Android functionality changes?** None.
5. **What Firebase functionality changes?** Deactivates backend admin SDK API access, preventing unauthorized write/read vectors.

---

## 4. Conclusion & Staged Status
- **Firebase Functions Stays**: The `functions/` directory has been fully restored and staged as unchanged. Android Google Play billing functionality is completely preserved.
- **Surgical Web Removals**: Only web-only pages, components, and local APIs have been removed.
- **Build Verification**: The project builds cleanly and matches Capacitor constraints.
