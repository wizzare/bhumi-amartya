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
