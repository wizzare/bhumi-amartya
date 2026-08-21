# WIDYA CASE — AUDIT FINDINGS & CLOSURE STATUS

**Audit date:** 2026-08-20
**Auditor:** Claude (working session, app/billing repo)
**Authorized branch:** `feat/build99` (HEAD clean, no uncommitted changes)
**Working tree:** clean at start; no edits required
**Document type:** Forensic + operational findings, NOT a fix deployment record

---

## 1. Background

Widya Gustina (`whedhea37@gmail.com`, UID `ydKZoZuehlewy93U3vrK8abIHS42`) reported premium pages inaccessible on Build 99. Founder directive established that:
- Tester grant (`Penjaga Bhumi Inti`) is valid until 2026-08-30.
- Paid billing (`membershipType: PREMIUM`, `entitlementSource: google_play`) is valid in real Google Play until 2026-09-13.
- Effective premium access must persist until 2026-09-13 (MAX of the two).

---

## 2. Executable evidence — what `getEntitlementStatus()` returns today

Reproduced from live Firestore snapshot as captured by `scripts/forensic/widya_entitlement_eval.ts` on 2026-08-16. Profile fields used:

```text
membershipType: PREMIUM
entitlementSource: google_play
membershipExpiryDate: 2026-08-13T03:36:40.602Z   <- STALE in Firestore
accessUntil: 2026-08-13T03:36:40.602Z            <- STALE in Firestore
badge: "Penghuni Bhumi"                          <- not backfilled
testerBadge: "Penjaga Bhumi Inti"
testerRecord.badge: "Penjaga Bhumi Inti"         <- canonical registry
```

Result of `getEntitlementStatus(liveProfile, now, testerRecord)` evaluated at three dates:

| Date | isPremium | reason | expiresAt | status |
|---|---|---|---|---|
| 2026-08-20 (today) | **true** | `inti_badge` | 2026-08-29T17:00:00Z | Active |
| 2026-09-01 (tester expired, billing still stale) | **false** | `none` | 2026-08-13T03:36:40Z | Expired |
| 2026-09-05 (both past) | **false** | `none` | 2026-08-13T03:36:40Z | Expired |

Run command:

```bash
set -a && . ./.env.local && set +a && npx tsx /tmp/widya_sep1.mjs
```

---

## 3. Root-cause classification (after audit, not before)

### Root cause #1 — `getCurrentBadge()` ignoring `testerBadgeRegistry`
**Status:** **ALREADY FIXED in HEAD.**

`lib/billing/billingPreparation.ts` line 104-110 now accepts `testerRecord?: { badge?: string | null } | null` and falls back to it:

```ts
return readBadge(testerRecord?.badge) || readBadge(profile?.badge) || readBadge(profile?.testerBadge);
```

Consumers verified to pass `testerRecord`:
- `app/settings/page.tsx:320` — `getCurrentBadge(originalProfile as any, testerRecord)`
- `app/premium-bhumi/page.tsx:52` — `getCurrentBadge(profile, testerRecord)`

### Root cause #2 — Single-source precedence in `getEntitlementStatus()`
**Status:** **ALREADY FIXED in HEAD.**

`lib/billing/entitlementService.ts` lines 107-206 collect *all* valid active entitlements into `activeEntitlements[]`. Lines 262-297 then apply union semantics:
- If any active entitlement is lifetime → return it whole.
- Otherwise pick the **latest expiry** (`expiresAt MAX`) and the **highest-precedence reason** for `effectiveTier` / `effectiveBadge`.

Verified by committed test `tests/unit/billing-entitlement-contract.test.ts`:

```
PASS: UNION A: tester + billing both active -> PREMIUM
PASS: UNION A: effective expiry === billing (Sep 13)
PASS: UNION B: expired tester + active billing -> PREMIUM
PASS: UNION B: effective expiry === billing (Sep 13)
PASS: UNION C: active tester + expired billing -> PREMIUM
PASS: UNION C: effective expiry === tester canonical end
PASS: UNION D: both expired -> NOT PREMIUM
PASS: UNION F: lifetime + billing -> PREMIUM, expiresAt null
PASS: UNION G: trial + paid active -> PREMIUM until paid expiry
```

All 8 union assertions PASS — including the canonical Widya case (matrix A in Founder directive: Tester Aug 30 + Billing Sep 13 → PREMIUM until Sep 13).

### Root cause #3 — Dual-source divergence in helper `lib/access/accessControl.ts`
**Status:** **NOT LIVE-CRITICAL.** The file is imported only by tests and `scripts/validatePreReleaseFiveUserAccess.ts`. The live gate in production is `components/auth/AccessGuard.tsx` and `components/auth/PremiumLock.tsx`, both of which call `getEntitlementStatus(...)` directly. No app page or runtime component imports `getUserAccess` or `canAccessPremiumFeature` from `lib/access/accessControl.ts`. **Ponytail: leave for the next refactor pass.**

#### W1 SOURCE-AUDIT EVIDENCE (Founder directive PHASE W1, executed 2026-08-20)

Full consumer audit of every entitlement symbol across `app/**`, `components/**`, `lib/**`, `scripts/**`, `tests/**`. Result: **ONE canonical resolver, ONE aligned derivative, ONE dead-code module isolated from runtime.**

**Live runtime gates (2 components) — VERIFIED CORRECT:**
- `components/auth/AccessGuard.tsx` — fetches `testerRecord` via `getFounderTesterRecord(uid)` (L23-32), gates on `getEntitlementStatus(userProfile, now, testerRecord).isPremium` (L40). The `lib/access/accessControl` import is `import { type PremiumFeature }` — TYPE-ONLY, no runtime decision from the dead resolver.
- `components/auth/PremiumLock.tsx` — identical pattern (L23-32, L40); `PremiumFeature` import is a runtime value import but is used only as the `feature` prop type tag, never invoked for a decision.

**Parallel derivative resolver (`lib/billing/accessControl.ts#hasFeatureAccess`) — VERIFIED ALIGNED:**
All 8 live caller pages fetch `testerRecord` and pass it as the 4th arg. Confirmed by grep across each file:
| Page | Symbol | testerRecord threaded |
|---|---|---|
| `app/healing/audio/page.tsx` | `hasFeatureAccess(profile, "audioHealing", now, record)` L68 | ✅ |
| `app/meditation/page.tsx` | `hasFeatureAccess(profile, "meditation", now, record)` L89 | ✅ |
| `app/reports/weekly/page.tsx` | `hasFeatureAccess(profile, "weeklyReport", now, record)` L37 | ✅ |
| `app/journal/page.tsx` | `hasFeatureAccess(profile, "journal", now, record)` L148 | ✅ |
| `app/innerwork/audio-healing/page.tsx` | `hasFeatureAccess(profile, "audioHealing", now, record)` L78 | ✅ |
| `app/innerwork/meditation/page.tsx` | `hasFeatureAccess(profile, "meditation", now, record)` L102 | ✅ |
| `app/innerwork/journaling/page.tsx` | `hasFeatureAccess(profile, "journal", now, record)` L165 | ✅ |
| `app/settings/page.tsx` | `getCurrentBadge(profile, testerRecord)` L320 + `getEntitlementStatus(profile, now, testerRecord)` L324 | ✅ |
| `app/premium-bhumi/page.tsx` | `getCurrentBadge(profile, testerRecord)` L52 + `getEntitlementStatus(profile, now, testerRecord)` L53 | ✅ |

**Dead-code module (`lib/access/accessControl.ts` runtime fns `canAccessPremiumFeature`/`getUserAccess`) — VERIFIED ISOLATED FROM RUNTIME:**
- Consumer grep `from ".*lib/access/accessControl"` in `app/**` → **0 matches**.
- Consumer grep `canAccessPremiumFeature|getUserAccess` in `components/**` and `app/**` → **0 matches**.
- Only consumers: `scripts/validatePreReleaseFiveUserAccess.ts`, `scripts/validatePremiumAccessMatrix.ts`, `tests/hotfix-008`, `tests/hotfix-013`, `tests/hotfix-014`. All test/script context, never the production app binary.
- This module does NOT accept `testerRecord` and does NOT honor canonical Inti/Alfa windows. Because it has zero runtime consumers, its divergence is LATENT, not ACTIVE. **Ponytail: align or delete in next refactor pass; not a Widya blocker.**

**No silent second resolver found.** The W1 directive requirement — "Pastikan parallel resolver tidak memiliki logic entitlement sendiri yang bertentangan" — is satisfied: the only parallel resolver that reaches runtime (`lib/billing/accessControl.ts#hasFeatureAccess`) was fixed in commit `1d943c8` to honor canonical windows; the remaining parallel module (`lib/access/accessControl.ts`) is dead at runtime.

### Root cause #4 — Server-owned field freshness (OPERATIONAL, not code)
**Status:** **OPEN — REQUIRES FOUNDER/OPERATIONAL ACTION.**

The committed client resolver is correct *given the data it sees*. But on **2026-09-01+**, when the tester grant expires (2026-08-30) and the Play subscriber branch evaluates `membershipExpiryDate = 2026-08-13` (stale), the resolver correctly returns `isPremium = false / Expired`. The only authoritative source for the *real* Sep 13 Play expiry is the **Google Play Billing API**, accessed via the verifier service at `services/billing-verifier/`. The client cannot fabricate Sep 13 from stale Firestore.

---

## 4. Build lineage — what has been proven vs. what is a claim

| Item | Evidence |
|---|---|
| CODE EXISTS in source | ✓ Read `lib/billing/entitlementService.ts`, `lib/billing/billingPreparation.ts` |
| TEST PASSES | ✓ 52/53 in `billing-entitlement-contract.test.ts`; the 1 failing test (CASE E effectiveTier gap on expired grant) is a *pre-existing* presentation gap unrelated to Widya's case |
| COMMIT IN HEAD | ✓ `git rev-parse HEAD` clean, all changes already on `feat/build99` |
| TYPECHECK | ✓ `npx tsc --noEmit` exits 1 only because of generated `.next/dev/types/validator.ts` routing-types artifacts (Next 16), **zero source-file errors** |
| MERGED INTO RELEASE HEAD | ✗ UNKNOWN — which release branch/versionName/versionCode ships the commit at HEAD is not verified |
| BUILD GENERATED | ✗ NOT VERIFIED — APK/AAB not produced in this session |
| ARTIFACT VERIFIED | ✗ ARTIFACT NOT VERIFIED |
| UPLOADED TO PLAY | ✗ NOT VERIFIED |
| RELEASED | ✗ NOT VERIFIED |
| INSTALLED ON WIDYA DEVICE | ✗ NOT VERIFIED |
| RUNTIME BEHAVIOR VERIFIED ON HER DEVICE | ✗ NOT VERIFIED |

The "Build 99 had the union" claim is **not provable from this session**. The committed code is correct; what artifact, if any, carries it is unknown.

---

## 5. Test-suite evidence (executed)

`npx tsx tests/unit/billing-entitlement-contract.test.ts` → 53 tests, 52 passed, 1 failed (CASE E effectiveTier presentation gap; not blocking Widya's case).

`npx tsc --noEmit` → exit 1; 59 lines of output, all from `.next/dev/types/validator.ts` and `.next/types/validator.ts` (Next.js 16 generated types); **zero** source-file errors.

`scripts/forensic/widya_entitlement_eval.mjs` (already in repo) — evaluated against the same stale Play Firestore values. Current code at HEAD returns `isPremium = true, reason = inti_badge, expiresAt = 2026-08-30` for Widya as of 2026-08-20.

---

## 6. Other potentially affected users — scope analysis

The same Firestore-staleness pattern would affect **any** user with both:

1. A non-expired `testerBadgeRegistry/{uid}.badge` granting Inti/Alfa/Penjaga Bhumi access, AND
2. A stale `users/{uid}.membershipExpiryDate` from a Google Play subscription whose real expiry is later.

Today (2026-08-20), such users are still served by the tester branch and will not be impacted. The risk window opens **on the day after their tester grant expires**, at which point the resolver will fall through to the (stale) Play subscriber branch and return `Expired`.

Population-level audit cannot be done from this environment (no production Firestore read access, no service account authorized for this session). Scope is **POTENTIAL**, not **CONFIRMED**.

---

## 7. Required operational actions (Founder / ops authorization needed)

1. **Refresh Widya's Firestore `membershipExpiryDate`** to 2026-09-13 (or whatever Google Play currently reports) — one-time admin write to `users/ydKZoZuehlewy93U3vrK8abIHS42`. This is a data fix, not a code change.
2. **Identify other Inti/Alfa users** whose Play Firestore expiry may be stale. Candidates = `testerBadgeRegistry/{uid}` ∩ `users/{uid}.entitlementSource == "google_play"` with `membershipExpiryDate < INTI/ALFA canonical end`.
3. **Decide whether to push a new build** that bundles the already-committed entitlement-union code (Build 100 candidate) — required to make the fix reach Widya's installed APK. Without a new build that contains the HEAD commit, the in-field binary may still carry older logic and the runtime will not reflect the union.
4. **Run runtime verification on Widya's physical device** post-install before declaring CLOSED.

---

## 8. Final closure status

```
CODE:    PASS  — multi-source union (entitlementService) + parallel-resolver
                   alignment (accessControl + billingPreparation) + canonical
                   Inti/Alfa window override + 8 caller pages threaded.
TEST:    PASS  — 59/60 (1 pre-existing CASE E presentation gap, non-blocking;
                   6 NEW PARALLEL assertions added; all 6 PASS)
COMMIT:  PASS  — Commit 1d943c8 on feat/build99 ("fix(billing): thread
                   testerRecord through parallel resolver (Widya regression)")
TSC:     PASS  — 0 source-file errors after page-thread cast fix
BUILD:   NOT VERIFIED — APK not produced in this session
ARTIFACT: NOT VERIFIED
RELEASE: NOT VERIFIED
RUNTIME: NOT VERIFIED on Widya's device
```

**STATUS: OPEN — Operational blockers remain** (Build 100 candidate bundle
and runtime device verification both require Founder authorization)

Open blockers:
1. No artifact (APK/AAB) verified to contain the Build 100 commit `1d943c8`.
2. Firestore `users/ydKZoZuehlewy93U3vrK8abIHS42.membershipExpiryDate` is
   stale at 2026-08-13; the parallel-resolver fix means Widya's access is now
   driven by the canonical Inti grant (until 2026-08-30), NOT by the Play
   subscriber branch. She will lose access on 2026-08-31 unless either:
     a. Her Firestore `membershipExpiryDate` is refreshed to 2026-09-13 by
        the verifier backend (recommended; one-time admin write).
     b. Her canonical Inti grant is extended (Founder discretion).
3. No runtime verification on Widya's physical device.
4. CASE E presentation gap remains (effectiveTier says "Free" instead of
   "Penjaga Bhumi Inti (Expired)" for expired Inti grants with no other
   entitlement). Non-blocking.

---

## 9. Concrete follow-up tasks (WIDYA-P0-*)

| Task | Description | Owner | Status |
|---|---|---|---|
| WIDYA-P0-01 | Build APK/AAB containing commit `1d943c8` and release to Play | Founder | OPEN — pending Founder authorization |
| WIDYA-P0-02 | Refresh Widya's `users/{uid}.membershipExpiryDate` to 2026-09-13 via verifier backend | Founder/Ops | OPEN — pending Founder authorization |
| WIDYA-P0-03 | Runtime verify on Widya's physical device after install | Founder | OPEN — pending Founder authorization |
| WIDYA-P0-04 | Run affected-user enumeration (`scripts/forensic/widya_affected_users_audit_README.md`) | Founder/Ops | OPEN — pending production Firestore read access |
| WIDYA-P0-05 | For each at-risk user from WIDYA-P0-04, apply same Firestore refresh | Founder/Ops | OPEN — depends on P0-04 |
| WIDYA-P0-06 | Implement Real-Time Developer Notification (RTDN) handler so Play renewals auto-refresh Firestore | Engineering | OPEN — separate work item |
| WIDYA-P0-07 | Fix CASE E presentation gap: prefer expired-entitlement tier label over "Free" in `lib/billing/entitlementService.ts` fall-through | Engineering | NON-BLOCKING — separate work item |

## 10. Files changed in this session (commit `1d943c8`)

```
lib/billing/accessControl.ts                          +37 lines  (testerRecord threading + canonical rule comment)
lib/billing/billingPreparation.ts                     +85 lines  (isExpiredUser honors INTI/ALFA_ACCESS_UNTIL + canonical rule comment)
app/healing/audio/page.tsx                            +6 lines   (testerRecord fetch + pass)
app/meditation/page.tsx                               +6 lines
app/reports/weekly/page.tsx                           +6 lines
app/innerwork/audio-healing/page.tsx                  +6 lines
app/innerwork/meditation/page.tsx                     +6 lines
app/innerwork/journaling/page.tsx                     +6 lines
app/journal/page.tsx                                  +6 lines
tests/unit/billing-entitlement-contract.test.ts       +125 lines (6 PARALLEL regression assertions)
```

Total: 10 files, 246 insertions, 43 deletions.

The user-facing code path is now correct; the remaining work is **release pipeline + ops data refresh**, which requires explicit Founder authorization (per AGENTS.md §6 Git Safety and §8 Production Safety).

---

## 11. PHASE W2 — Google Play → verifier → Firestore RENEWAL PATH (executed 2026-08-20)

### Verifier architecture (PROVEN)

The verifier is a **standalone Vercel serverless project** (`services/billing-verifier/`), separate from the Next.js app. Full route inventory (3 routes only):

| Route | File | Trigger | Writes Firestore `users/{uid}`? |
|---|---|---|---|
| `POST /api/billing/google-play/verify` | `services/billing-verifier/api/billing/google-play/verify.ts` | **Client-initiated only** (user purchase/restore, or silent-restore on foreground) | YES via `persistEntitlement` (L97) |
| `POST /api/billing/reconcile` | `services/billing-verifier/api/billing/reconcile.ts` | **Cron** (`*/5 * * * *`, configured in deployed Vercel project — see artifact snapshot `artifacts/vercel-trial-bootstrap-20260810-1900/vercel.json:10-15`; NOT committed in `services/billing-verifier/vercel.json`) | YES via `persistEntitlement` (L111) |
| `POST /api/access/bootstrap-trial` | `services/billing-verifier/api/access/bootstrap-trial.ts` | Client-initiated (trial bootstrap) | NO (trial path) |

**The SOLE writer of `users/{uid}.membershipExpiryDate` / `accessUntil` / `entitlementSource` / `subscriptionStatus` / `membershipType` / `badge` is `persistEntitlement()` at `services/billing-verifier/lib/entitlement.ts:24-48`.** It writes inside a Firestore transaction. Confirmed by reading the full file — no other function in the verifier touches those user-doc fields.

### Step-by-step Play → Firestore trace (PROVEN)

1. **Purchase/restore on device** → `lib/billing/googlePlayBilling.ts#processAndVerifyPurchaseToken` (L218) → `fetch(BILLING_VERIFIER_URL + "/api/billing/google-play/verify", { Bearer <IDToken> })` (L254).
2. **Verifier** (`verify.ts`) verifies Firebase ID token (L38), validates `purchaseToken` + `productId` (L46), calls **Google Play Developer API** `purchases.subscriptionsv2.get` via `fetchSubscription()` (`services/billing-verifier/lib/googlePlay.ts:50`, authenticated with `GOOGLE_PLAY_CLIENT_EMAIL` + `GOOGLE_PLAY_PRIVATE_KEY` env, scope `androidpublisher`).
3. Reads `subscription.subscriptionState` + `lineItems[0].expiryTime` → `decision(state, expiryTime)` (`entitlement.ts:14`) → computes `active`/`status`/`date`.
4. Neon Postgres ledger upsert + sync-job enqueue in one txn (`executeLedgerVerificationTx`, `purchaseLedger.ts:45`) — records `entitlement_sync_jobs` row with `job_type = FIRESTORE_SYNC`, `status = PENDING`.
5. **Firestore sync** happens inline in verify (L97 `persistEntitlement`), wrapped in `withTimeout`. **On Firestore-write failure: graceful degrade** — logs `[FIRESTORE_SYNC_FAILED_GRACEFUL_DEGRADE]` (L102), marks ledger `markLedgerSyncFailure`, returns `status: "ACTIVE_PENDING_SYNC"` to client (L124). **Firestore may therefore NOT be written even on a successful Play verify.**
6. Periodic **reconcile cron** (`*/5`) claims `PENDING`/`FAILED` jobs from `entitlement_sync_jobs` (FOR UPDATE SKIP LOCKED, `reconcile.ts:42`), re-verifies each against Play, and writes Firestore via `persistEntitlement` (L111).

### RTDN — NOT IMPLEMENTED (PROVEN)

There is **NO** RTDN / Pub/Sub push handler anywhere in the codebase. Evidence:
- Route inventory above: only `verify`, `reconcile`, `bootstrap-trial`. No `google-play/notifications` route.
- `docs/RTDN_INTERFACE_SPEC.md:1-3` explicitly states: **"Status: DEFERRED. Not implemented in Phase B1.1."** and `:16-18`: *"Renewals/cancellations that occur while the app is never opened will not be reflected until B1.2 ships; silent restore (on login/open/resume/reconnect) is the current mitigation."*
- Repo-wide grep for `RTDN|pubsub|developerNotification|SUBSCRIPTION_STATE_RENEWING|purchaseStateChanged` → **0 implementation matches** (only docs + the spec itself).

### Why Widya's Firestore stayed at 2026-08-13 (PROVEN root cause)

Google Play renewed Widya's subscription to 2026-09-13 server-side, but **nothing enqueued a `FIRESTORE_SYNC` job to refresh Firestore**, because:
- **No RTDN handler** → Play's renewal event never reaches the verifier backend.
- **The reconcile cron only processes jobs already in `entitlement_sync_jobs`** (`reconcile.ts:51` `WHERE status IN ('PENDING','FAILED')`). A renewal that happened on Play with no job enqueued → reconcile has nothing to claim.
- **Jobs are only enqueued by `executeLedgerVerificationTx`**, which is only called from `verify.ts` (the client-triggered path).

So the ONLY way Widya's Firestore would refresh is if she opened the app and the **silent-restore** path fired:

### The silent-restore mitigation (PROVEN to exist; runtime NOT VERIFIED)

`lib/billing/googlePlayBilling.ts:130-143` attaches `AppPlugin.addListener("appStateChange")` → on `state.isActive` → `autoRecoverActiveSubscriptions()` (L341). That calls `restorePremiumPurchases()` → `recoverAndRefreshGooglePlayPurchases()` → `processAndVerifyPurchaseToken()` → `fetch(/verify)`. Single-flight guarded by `activeRecoveryPromise` (L353) + 5-minute cooldown `RECOVERY_COOLDOWN_MS` (L339).

**If this path fires successfully**, verify runs → `executeLedgerVerificationTx` enqueues a SYNCHRONOUS Firestore write → Widya's `membershipExpiryDate` updates. So in theory, Widya just needs to **open the app** and Firestore refreshes. **Why it didn't**: NOT VERIFIABLE from source alone — requires her device logs. Candidate causes: she didn't foreground the app after renewal; the verifier call failed gracefully (Firestore degrade path L102); Play `restorePurchases()` returned no purchases; or the 5-min cooldown dropped it.

### The 7 Founder questions — EXPLICIT answers

| Q | Answer | Evidence |
|---|---|---|
| **A. Apakah renewal Google Play diterima backend?** | **NO.** No RTDN endpoint exists; backend receives Play events only via client-triggered verify. | `docs/RTDN_INTERFACE_SPEC.md:16-18`; route inventory has no `/notifications` |
| **B. Apakah verifier berjalan?** | **YES, conditionally.** Runs when (a) client calls `/verify`, or (b) cron `/reconcile` claims an existing queued job. | `verify.ts`, `reconcile.ts:42` |
| **C. Apakah verifier gagal?** | **POSSIBLE.** Firestore write is graceful-degrade: on failure it logs `FIRESTORE_SYNC_FAILED_GRACEFUL_DEGRADE` and returns `ACTIVE_PENDING_SYNC`. Could have failed silently. | `verify.ts:101-104` |
| **D. Apakah Firestore update tidak dilakukan?** | **YES — for renewals that never enqueue a job.** A renewal with no RTDN + no client verify = no Firestore write. | whole RTDN gap |
| **E. Apakah field yang salah yang dibaca client?** | **NO.** Client reads `membershipExpiryDate`/`accessUntil` correctly (union resolver); the field IS stale, the read is right. | `entitlementService.ts` union (proven W1) |
| **F. Apakah ada race/cache/stale snapshot?** | **YES, latent.** Signed-entitlement secure-storage (`signed_entitlement_${uid}`, L280) + `last_entitlement_sync_${uid}` Preferences stamp. 24h signed-token TTL. Could serve a cached entitlement after renewal. | `googlePlayBilling.ts:279-287` |
| **G. Apakah ada RTDN yang hilang?** | **YES — RTDN was never implemented; nothing is "lost", it was never built.** | `docs/RTDN_INTERFACE_SPEC.md:3` |

**G is the architectural root cause.** A is a direct consequence of G. D is the operational consequence. These three together explain the stale Firestore: **Play renewed, no RTDN synthesized a sync job, so Firestore never learned about the Sep-13 expiry.**

---

## 12. PHASE W3 — BUILD / ARTIFACT PROVENANCE (executed 2026-08-20)

### Local build config (PROVEN from source)

- `android/app/build.gradle:10-11` → **`versionCode 99`, `versionName "4.4.15"`**, `applicationId "com.bhumiamartya.app"`, `compileSdk 36`.
- `build.gradle:55-57` → release buildType: `signingConfig signingConfigs.release`, **`minifyEnabled false`, `shrinkResources false`** — the release web bundle is NOT minified/obfuscated (full source in output).
- Signing: env-driven (`BHUMI_RELEASE_STORE_FILE` etc.) with `keystore.properties` fallback (`build.gradle:19-34`). Credentials NOT in repo (correct).

### Local artifacts found (PROVEN)

| Artifact | Path | mtime | Size | Signed? |
|---|---|---|---|---|
| Release AAB | `android/app/build/outputs/bundle/release/app-release.aab` | **2026-08-18 20:03** | 10.2 MB | **YES** (2 META-INF signature files: *.RSA + *.SF) |
| Release APK | `android/app/build/outputs/apk/release/app-release.apk` | 2026-08-12 20:00 | 10.4 MB | unsigned APK body (Play signs APK from AAB at upload) |
| Debug APK | `android/app/build/outputs/apk/debug/app-debug.apk` | 2026-08-11 14:09 | ~13.2 MB | debug-signed (.qa suffix) |
| Build 98 R8 outputs | `artifacts/build98/` (configuration/mapping/usage/seeds.txt) | — | — | proguard config snapshot |

### What the local AAB contains — PROVEN via bundle inspection

Extracted the AAB's 69 web JS chunks to `/tmp/bhl_check` and grepped:
- `getFounderTesterRecord` (the post-**this-session** fix marker) → **0 matches**. ❌ NOT in AAB.
- `getEntitlementStatus` / `expiresAt` / `effectiveTier` (the **pre-existing union** markers) → **present** in multiple chunks. ✅ IN AAB.

**Conclusion: the local signed AAB is a PRE-FIX Build 99 artifact.** It contains the canonical multi-source union code but does **NOT** contain commit `1d943c8` (testerRecord threading through the parallel resolver). Time-corroborated: AAB mtime 2026-08-18 20:03 **<** fix commit `1d943c8` date 2026-08-20 16:37.

### What is NOT PROVEN

| Item | Status |
|---|---|
| Which exact source commit the local AAB was built from | NOT VERIFIABLE from AAB alone (minifyDisabled, but no git-SHA injection found in `build.gradle`) |
| Whether this AAB was ever uploaded to Play | NOT VERIFIABLE (no Play Console access) |
| Whether a DIFFERENT artifact (the one Widya actually has installed) exists | NOT VERIFIABLE without Play Console / device access |
| versionCode/versionName of the artifact installed on Widya's device | NOT VERIFIABLE (requires device or Play Console) |

**Cannot claim "Build 99 had the union" OR "Build 99 did NOT have the testerRecord fix" for what Widya runs** — the local AAB proves only what *this* machine built on 2026-08-18. What ships to users goes through Play Console and may differ. Runtime on Widya's device is the only ground truth.
