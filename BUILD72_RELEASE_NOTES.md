# BUILD 72 RELEASE NOTES

This document contains the release notes for Build 72 (versionName `"4.1.2"`, versionCode `72`), which represents a production-ready hotfix release built on top of Build 71.

---

## 1. Release Info
*   **Version Code**: `72`
*   **Version Name**: `4.1.2` (as per semantic V4 versioning policy: V4 Second Test)
*   **Release Date**: `2026-07-07`
*   **Scope**: Production hotfix for trial authorization and voice identity regression.
*   **Status**: **READY FOR GOOGLE PLAY PRODUCTION**

---

## 2. Changes & Bug Fixes from Build 71

### 2.1. Trial System & Authorization
*   **Decoupled Authorization from Badge**: Replaced the legacy strict rule requiring the `"Penjaga Bhumi"` badge. Access control now evaluates user plans/memberships (`"TRIAL"` / `"free_trial"`) and checks the `trialEndsAt` timestamp to grant page access.
*   **Penghuni Bhumi Defaults**: Updated Cloud Function registration triggers to successfully assign the default user badge `"Penghuni Bhumi"` and initialize `isPremium: false`.
*   **Feature Gate Locking**: Active trial users successfully access all features (Journey, Wellness, Profile) during the trial window, and are gracefully locked out of premium features (leaving only the Dashboard open) upon trial expiration.

### 2.2. Companion Mirror Voice
*   **Adaptive narrative openings**: Restored the original name-free Build 68/69 voice tone. All mirror cycles start with narrative openers (e.g. *"Pagi ini, di hari Selasa, ada ritme yang menantimu..."*) instead of robotic `"Hai {Name}"` repetitions.

### 2.3. Soul Identity AI Routing
*   **Gemini Route & Client Fallback**: Implemented the POST endpoint interceptor in `app/api/ai/daily-guidance/route.ts` to call Gemini models on request, while verifying the client-side local synthesis fallback dynamically translates blueprints on network or API failures.

---

## 3. Final Production QA & Verification Traces

All 14 pre-release verification points passed:

1.  **New User Registration**: **PASS** (Cloud Function default variables verified).
2.  **Active Trial**: **PASS** (Zero premium gates or redirects for active trials).
3.  **Cache Refreshing**: **PASS** (`AuthContext` forces Firestore sync on session recheck).
4.  **Reinstall Restoration**: **PASS** (App successfully restores trial properties from remote Firestore configs).
5.  **Expired Trial**: **PASS** (Revokes premium access and shows Premium Gate, leaving the Dashboard unlocked).
6.  **Premium User**: **PASS** (Unlock credentials verified).
7.  **Founder**: **PASS** (Bypass validation verified).
8.  **Mirror Greeting**: **PASS** (Adaptive openings confirmed).
9.  **Soul Identity**: **PASS** (Gemini route and dynamic local synthesis verified).
10. **Journey Narrative**: **PASS** (Zero English leaks or placeholder phrases).
11. **Weton Rollover**: **PASS** (18:00 rollover boundary checked).
12. **Android Admin**: **PASS** (Accuracy debugger is fully operational).
13. **Auto Update**: **PASS** (Version checks lock access for build 71 and below if minimum build is set to 72).
14. **Release Compilation**: **PASS** (`npx tsc --noEmit` and `npm run build` compiled without errors. Gradle signed `app-release.aab` with exit code 0).

---

## 4. Release Recommendation

**STATUS:** **READY FOR GOOGLE PLAY PRODUCTION**

Build 72 consolidates all UX and access control hotfixes into a single compiled package. The codebase is clean, build sync is complete, and the release App Bundle has been compiled successfully.
