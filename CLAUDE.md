@AGENTS.md

# Bhumi Amartya — Repository Map and Build 85 Scope

## Repositories (TWO separate repositories — do not confuse)

### 1. APP / BILLING REPOSITORY (this repository)

- **Path:** `C:\tmp\bhumi-build83-access-hotfix`
- **Branch:** `hotfix/build84-access-recovery`
- **Known HEAD before new Build 85 work:** `942d84e6851af5cd773ddf1b8a0f9c1e446d47f3`
- Contains:
  - Bhumi user application (Next.js, Capacitor Android)
  - Billing (client + `services/billing-verifier` backend service)
  - Human Design (canonical hotfix — **CLOSED**, do not modify unless regression proven)
  - Legacy in-app admin routes: `app/admin/**` — **LEGACY REFERENCE ONLY**

### 2. FOUNDER DASHBOARD REPOSITORY (SEPARATE repository)

- **Path:** `C:\tmp\bhumi-founder-dashboard`
- **Branch:** `main`
- This is the **standalone web Founder Dashboard** — separate from the mobile Bhumi application.
- **Do NOT recreate it inside the app repository.**
- Do NOT implement Founder Dashboard work from the app repo.
- Completed commits include:
  - `64344a121f964c907ad7df4471023c03c2a9c03f` — fix: correct founder user pagination range
  - `d100cb592f8a8cdd54a3a88a8b9e09cbf687ed78` — fix: clarify analytics and inbox states
  - `76fbc3211ea496aa4bfe78843d79c350be5b4707` — fix: exclude dashboard QA accounts
  - `a93abf743acf50e1d57ed38102d6d820ca7fe627` — fix: remove dashboard horizontal overflow
  - `5b2a26b72100139180efa37671bc3da6ad4ad702` — fix: load founder users and remove dashboard overflow
- Already completed: Google Founder login, server-side Firebase ID token verification, founder allowlist, HttpOnly session cookie, users live data, pagination, exact search, analytics state handling, inbox state handling, QA account exclusion, TypeScript/build/tests/Playwright previously passing.
- **Broadcast Commit 3 is HOLD / unfinished** — pending uncommitted work in `lib/services/adminCommunicationService.ts` (BROADCAST_BATCH_SIZE, getBroadcastMaxRecipients, resolveBroadcastRecipientCount, previewBroadcast, initial cap enforcement, QA-prefix exclusion; still missing final sendBroadcast cap enforcement, preview/dryRun wiring, app/api/broadcast/route.ts, app/broadcast/page.tsx, preview UI, invalidation, KIRIM confirmation, duplicate protection, tests, verification, commit). **Do NOT touch or overwrite this work while operating in the app/billing repository.**

## Responsibilities

| Concern | Repository |
|---|---|
| Bhumi user app (mobile + web) | APP/BILLING repo |
| Android app | APP/BILLING repo |
| Billing (client + verifier service) | APP/BILLING repo |
| Human Design | APP/BILLING repo |
| Legacy in-app admin (`app/admin/**`) | APP/BILLING repo — LEGACY REFERENCE ONLY |
| Standalone web Founder Dashboard | FOUNDER DASHBOARD repo (separate) |

## Status Summary

- **Human Design:** canonical fallback incident **CLOSED**. Do not modify unless a regression is directly proven.
- **Billing B1.1–B1.4:** PASS. **B1.4.1 unfinished** — runtime proof for silent-restore single-flight, restore cooldown, secure-storage persistence, cached entitlement, TTL, offline grace, grace expiry, UID/context mismatch, invalid signature, malformed entitlement, future timestamp, clock rollback, stale cache online. Founder approved OPTION A (debug/androidTest-only synthetic entitlement seam; production behavior unchanged; no fake entitlement in release; no authorization bypass). Do NOT claim B1.4.1 complete without an actual execution report.
- **Founder Dashboard:** lives in the separate repository (`C:\tmp\bhumi-founder-dashboard`). Trial status there must eventually use canonical entitlement (TRIAL / PREMIUM / FREE), not raw membership strings.

## Build 85 Scope (current)

### A. Trial Presentation Fix — USER APP (P0) — ✅ DONE

Confirmed affected files:
- `app/upgrade/page.tsx`
- `app/premium-bhumi/page.tsx`

Backend trial creation is correct. Firestore trial fields are correct. Billing entitlement is correct. The bug is PRESENTATION. Use canonical entitlement source (`getEntitlementStatus()`). Expected UI states: **TRIAL / PREMIUM / FREE**. Do not redesign. Regression cover: `tests/unit/build85-trial-presentation.test.ts` (tsx EXIT 0).

### B. Billing B1.4.1 status continuation (P1) — PARTIAL 12/13, 1 DEVICE REMAINING

- **Status: PARTIAL — 12/13 PASS, 1 PHYSICAL DEVICE VERIFICATION REMAINING. NOT a Build 85 RC blocker.**
- 12/13 proven in Category A (non-Android, no QEMU): single-flight, restore cooldown, cached entitlement, TTL, offline grace, grace expiry, UID/context mismatch, invalid signature, malformed entitlement, future timestamp, clock rollback, stale-cache-online — all PASS.
- 1/13 remains **secure-storage persistence after force-stop**; Option-A harness source present (`android/app/src/androidTest/.../harness/`) but not executed. Requires physical Android device. Manual pre-production check.
- `billing-entitlement-contract.test.ts` + `trial-boundary.test.ts`: NOT VERIFIED — legacy env/import-order precondition; OUT OF SCOPE.

### C. Founder Dashboard (P1 — handoff note only)

Do NOT implement from app repo. Record only that the standalone dashboard lives in `C:\tmp\bhumi-founder-dashboard`. Future dashboard work continues there.

### E. Review & Rating Prompt (P1 — IMPLEMENTED / STATIC VERIFIED / RUNTIME E2E NOT VERIFIED)

- Existing implementation already present and wired: `lib/rating/reviewTriggerService.ts` (eligibility + localStorage state), `components/rating/DashboardReviewPrompt.tsx` (dashboard-entry controller), `components/rating/ReviewDialog.tsx` (modal), `android/.../ReviewPlugin.java` (Google Play in-app review), static validator `scripts/validateDashboardReviewPrompt.ts`.
- **Eligibility threshold is already 3 days** (NOT 7): `REVIEW_LIMITS.MIN_INSTALL_DAYS: 3`, `MIN_LOGIN_DAYS: 3`, `MIN_SESSIONS: 3`, `PROMPT_COOLDOWN_DAYS: 30`. Git history (commit `05539a8 feat(review): add post-login dashboard review prompt`) confirms a 7-day threshold never existed in this codebase.
- Dashboard entry wiring confirmed present: `<DashboardReviewPrompt/>` mounted in `components/dashboard/DashboardClient.tsx` (dashboard page), guarded by `pathname === "/dashboard"`, `dashboardReady`, and `blockedByModal`.
- Anti-repeat state confirmed via localStorage keys: `bhumi_review_prompt_shown`, `bhumi_review_next_prompt_date` (30-day cooldown), `bhumi_review_prompt_opt_out` (permanent), `bhumi_review_action_requested_at`.
- Positive action invokes native Google Play in-app review (`ReviewPlugin.requestReview`) with web fallback to the Play Store listing; `PROMPT_SHOWN` + cooldown written on success.
- **NO CODE CHANGE REQUIRED.** No functional bug proven. Runtime E2E could not be executed because the clean emulator had no authorized authenticated test account; static wiring confirmed instead.
- **Manual authenticated smoke test on a physical Android device remains a pre-production check** before release.
- **Do NOT modify review eligibility logic. Do NOT rewrite the popup flow. Do NOT build a new review system.**

### D. Welcome / Entry Screen Update (P1) — `app/page.tsx`

Small user-facing UI/copy update, NO redesign. Requirements:

1. Replace tagline `"Ruang harian untuk mengenali diri, membaca ritme hidup, dan menjalani praktik batin sesuai jati dirimu."` → `"Ruang Untuk Pulang kemudian Kenali Diri"`.
2. Replace primary CTA `"Mulai Perjalanan"` → `"Pengguna Baru"`.
3. Replace `"Saya Sudah Punya Akun"` with a real button — same color family/style as "Pengguna Baru", clear vertical spacing, preserve existing login navigation.
4. Replace `"CLOSED BETA V1.0"` → `"Versi 4"`.
5. Under the version label, add a lightweight `Indonesia | English` language selector — placeholder/non-functional is acceptable (preparation for V5 multilingual; NO full localization system, NO translation engine, NO architecture change).

Current page: `app/page.tsx`. No language-switching logic currently exists there (confirmed 2026-08-07).

## Policies

- **Legacy `app/admin/**`:** LEGACY REFERENCE ONLY. Do not invest in improving old in-app admin UI unless a production blocker requires it. Do not add new features there.
- **MINIMAL DIFF rule:** No refactoring, no redesign, no renaming, no moving files, no unrequested abstractions. Shortest working diff wins. Document unrelated issues; do not implement them.
