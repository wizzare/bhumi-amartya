# Billing Backend Deployment Plan — Founder Review Required

**Status: LOCAL SOURCE FIXES ONLY.** No production deployment, configuration change, production
read, or production write has been executed. Every external step below still requires explicit
go/no-go. **Option B is the recommended path** — see §0.5.

## 0. Recap of the confirmed root cause

- `gcloud functions list --project=bhumiamartya-fe85c` → **0 functions deployed**, in any region.
- `gcloud logging read 'protoPayload.serviceName="cloudfunctions.googleapis.com"' --freshness=180d`
  → **0 audit log entries** (deploy, delete, update — nothing) in the last 180 days. General
  logging in the project IS active and readable (confirmed via a separate unfiltered query that
  returned a real entry from 2026-07-28), so this is a genuine empty result, not a broken query.
- `androidpublisher.googleapis.com` (Google Play Developer API) is **not enabled** on
  `bhumiamartya-fe85c`.
- Conclusion: `functions/index.js` — including `verifyGooglePlayPurchase` and its
  `acknowledgeSubscriptionIfPending` logic — has **never been live in production**, since this
  code was introduced (earliest commit `e149a94d`, Build 66, 2026-07-02) through today.

## 0.5. NEW — billing constraint confirmed, and a live alternative already exists

**Cloud Functions deploy (original Step 1c) is confirmed blocked.** Direct REST call:

```
$ curl -s "https://cloudbilling.googleapis.com/v1/projects/bhumiamartya-fe85c/billingInfo" -H "Authorization: Bearer $TOKEN"
{"name":"projects/bhumiamartya-fe85c/billingInfo","projectId":"bhumiamartya-fe85c","billingAccountName":"","billingEnabled":false}
```

`bhumiamartya-fe85c` is on the **Spark (free) plan** — no billing account linked. Firebase Cloud
Functions unconditionally requires Blaze regardless of usage volume; this is a hard product
requirement, not a per-API cost question. **Step 1c as originally written cannot run.**

Separately, on your question of whether enabling *any* API requires billing: `bhumiamartya-fe85c`
already has several non-Functions/non-Run APIs enabled (Firestore, BigQuery, Identity Toolkit, and
more) despite `billingEnabled: false` — so enabling most APIs, including
`androidpublisher.googleapis.com`, does **not** generally require an active billing account. Only
Cloud Functions/Cloud Run specifically enforce the Blaze requirement. Step 1a (enable the API) was
probably always fine on its own; it's specifically Step 1c that's hard-blocked.

**The Vercel service (`services/billing-verifier/`) is not dead code — it's live and configured:**

```
$ vercel projects ls
  Project Name             Latest Production URL
  bhumi-billing-verifier   https://bhumi-billing-verifier.vercel.app     (updated 10d ago)

$ curl -i -X GET  https://bhumi-billing-verifier.vercel.app/api/billing/google-play/verify
HTTP/1.1 405 Method Not Allowed
{"ok":false,"error":"METHOD_NOT_ALLOWED"}

$ curl -i -X POST https://bhumi-billing-verifier.vercel.app/api/billing/google-play/verify -d '{}'
HTTP/1.1 401 Unauthorized
{"ok":false,"error":"AUTH_MISSING"}
```

These are the handler's own application-level error codes (not a generic gateway/404 page), and the
`X-Vercel-Id: sin1::...` region matches `vercel.json`'s `"regions": ["sin1"]` — this is genuinely
the deployed code responding, not a stale/placeholder page.

```
$ vercel env ls production --project bhumi-billing-verifier
 FIREBASE_CLIENT_EMAIL       Encrypted   Production   10d ago
 FIREBASE_PRIVATE_KEY        Encrypted   Production   10d ago
 FIREBASE_PROJECT_ID         Encrypted   Production   10d ago
 GOOGLE_PLAY_CLIENT_EMAIL    Encrypted   Production   10d ago
 GOOGLE_PLAY_PRIVATE_KEY     Encrypted   Production   10d ago
 GOOGLE_PLAY_PROJECT_ID      Encrypted   Production   10d ago
 GOOGLE_PLAY_PRODUCT_ID      Encrypted   Production   10d ago
 GOOGLE_PLAY_BASE_PLAN_ID    Encrypted   Production   10d ago
 ANDROID_PACKAGE_NAME        Encrypted   Production   10d ago
 ALLOWED_ORIGINS             Encrypted   Production   10d ago
```

All 10 required env vars are populated (set 10 days ago, matching the deploy) — not left as blank
`.env.example` template values. This service uses its **own dedicated service account**
(`GOOGLE_PLAY_CLIENT_EMAIL`/`GOOGLE_PLAY_PRIVATE_KEY`/`GOOGLE_PLAY_PROJECT_ID`), separate from
`bhumiamartya-fe85c`'s default Cloud Functions runtime SA — meaning `bhumiamartya-fe85c`'s Spark
plan is **irrelevant to this path entirely**, as long as whatever `GOOGLE_PLAY_PROJECT_ID` points to
already has `androidpublisher` enabled and is Play-Console-linked (see the open question below).

### Functional comparison vs. `functions/index.js` — mostly equivalent, two real gaps

Read in full: `services/billing-verifier/api/billing/google-play/verify.ts`,
`lib/googlePlay.ts`, `lib/entitlement.ts`, `lib/security.ts`.

| | `functions/index.js` (Cloud Function) | `services/billing-verifier` (Vercel) |
|---|---|---|
| Auth | `context.auth.uid` (Firebase callable) | `adminAuth().verifyIdToken()` on `Authorization: Bearer` header |
| Subscription fetch | `androidpublisher.purchases.subscriptionsv2.get` | same endpoint, called directly via `fetch` |
| Product/base-plan validation | yes | yes (`validateProduct`) |
| Token ownership / idempotency | yes, in transaction | yes, in transaction (`persistEntitlement`) |
| Voided/refunded purchase check | **yes** — `checkVoidedPurchase` via `purchases.voidedpurchases.list` | **locally fixed** — same 30-day lookup; unavailable checks are fail-open but emit a Vercel error log without token or UID |
| Firestore persistence vs. acknowledge order | **persist first** (`ACK_PENDING`), acknowledge after; ack failure logged, non-fatal | **locally fixed** — transaction persists first; acknowledge is best-effort and records `acknowledgementDeferred` for idempotent retry |
| Request body contract | `{ packageName, purchaseToken }` | strictly `{ purchaseToken, productId }` — any other key → `400 BODY_INVALID` |

**Gap 1 — closed locally, pending deployment**: a 30-day voided-purchase lookup now occurs before
the entitlement decision. A found token resolves to non-premium `VOIDED`; a lookup failure follows
the legacy Cloud Function's accepted fail-open behavior and emits the conspicuous
`[GOOGLE_PLAY_VOIDED_CHECK_UNAVAILABLE]` server log without purchase token or UID.

**Gap 2 — closed locally, pending deployment**: the transaction writes entitlement and `ACK_PENDING`
before any Google acknowledgement. Acknowledge failure leaves the persisted entitlement intact and
returns `acknowledgementDeferred: true`, which the client cutover must retry idempotently through
the established recovery path.

Both gaps are **production blockers**. They must be fixed and reviewed locally before this verifier
is deployed or the Android client is pointed at it. There is no approved path that accepts either
gap temporarily for real purchases: an acknowledgement can only occur after the entitlement
transaction succeeds, and a voided/refunded purchase must resolve to non-premium entitlement.

### Open question I could not resolve without your input or a live test

I cannot read the actual value of `GOOGLE_PLAY_PROJECT_ID` (correctly encrypted in Vercel), so I
cannot directly confirm whether *that* project has `androidpublisher.googleapis.com` enabled and is
linked in Play Console for this specific service account. The fact that all 10 env vars are
populated is a strong positive signal someone configured this deliberately, but it's circumstantial,
not a confirmed end-to-end success. The only way to know for certain is a real authenticated test —
see the revised §3.

## 1. Recommended path — Option B: point the client at the Vercel endpoint

This avoids the entire Blaze-billing blocker and the Play-Console-linking step for
`bhumiamartya-fe85c`'s own service account (assuming the Vercel service's own SA is already linked —
see open question above). **No code has been changed.** This is the exact, precise change that
*would* be needed, for your review:

In `lib/billing/googlePlayBilling.ts`, `processAndVerifyPurchaseToken()` currently does:
```ts
const functionsInstance = getClientFunctions("asia-southeast2");
const verifyCallable = httpsCallable(functionsInstance, "verifyGooglePlayPurchase");
const response = await verifyCallable({ packageName: GOOGLE_PLAY_PACKAGE_NAME, purchaseToken: purchase.purchaseToken });
const data = response.data as any;
```

This would change to a direct authenticated `fetch` against the Vercel endpoint. Two contract
differences to get right (the Vercel handler is strict about both):
- Request body must be **exactly** `{ purchaseToken, productId }` — no `packageName` key, or it's
  rejected with `400 BODY_INVALID`.
- Auth is a Firebase ID token in an `Authorization: Bearer <token>` header (`await
  auth.currentUser.getIdToken()`), not an implicit callable-function auth context.
- A successful response with `acknowledgementDeferred: true` means the entitlement transaction
  succeeded but Google acknowledgement must be retried idempotently. The client cutover must retain
  the purchase token for the existing recovery path and trigger that retry on the next billing
  bootstrap/restore attempt; it must not present the persisted entitlement as a failed purchase.

- **GO / NO-GO to implement this client code change: _______**
- The verifier safety fixes are a precondition, not an alternative go/no-go. Their production
  deployment remains a separate explicit decision after local review and verification.

## 2. Option A — Cloud Functions deploy (blocked, kept for reference)

Retained for comparison and in case billing is enabled on `bhumiamartya-fe85c` later.

### Step 1a — Enable the Google Play Developer API (not blocked by Spark plan, per §0.5)
```
gcloud services enable androidpublisher.googleapis.com --project=bhumiamartya-fe85c
```
Free per general knowledge of this API; not blocked by `billingEnabled: false` per the evidence in
§0.5. **GO / NO-GO: _______**

### Step 1b — Service account IAM + Play Console linking
Same as before: GCP IAM needs no extra role for this API (it's authorized via Play Console linking,
not an IAM grant); IAM bindings themselves could not be verified due to a local gcloud
quota-project misconfiguration on this machine (unrelated to the project itself —
`cloudresourcemanager.googleapis.com` is confirmed enabled on `bhumiamartya-fe85c`). Play Console
linking is manual, UI-only, and requires Play Console Owner/Admin access. **GO / NO-GO: _______**
(and: who has that access?)

### Step 1c — BLOCKED
```
firebase deploy --only functions:verifyGooglePlayPurchase --project bhumiamartya-fe85c
```
Will fail outright: Cloud Functions requires the Blaze plan; `bhumiamartya-fe85c` is on Spark with
`billingEnabled: false`. This step cannot proceed until billing is resolved on the user's side — not
something I can plan around further; **do not approve this step** until that changes.

## 3. Post-deploy / post-cutover verification plan (before declaring anything done)

Applies to whichever option is approved.

1. **If Option B**: after the verifier deployment and client cutover are separately approved and
   completed, re-run Scenario 1 end-to-end with a new, dedicated Play license-tester account whose
   app-auth and Play Store identities are aligned. Do not reuse either previously attempted account.
   Capture log and screen recording via `run_scenario.ps1`/`.sh` so the result has real,
   account-matched evidence.
2. **If Option A** (only once billing is resolved): confirm the function exists and is callable —
   ```
   gcloud functions describe verifyGooglePlayPurchase --region=asia-southeast2 --project=bhumiamartya-fe85c
   gcloud functions logs read verifyGooglePlayPurchase --region=asia-southeast2 --project=bhumiamartya-fe85c --limit=20
   ```
   then repeat step 1's re-test.
3. Either way, confirm via Firestore query (same read-only method used throughout this audit) that
   `billing_purchase_tokens/{hash}` and `users/{uid}` actually got written with `isPremium: true` —
   not just that the UI shows Premium.
4. For Option B specifically: also confirm `acknowledgementState` flips to
   `ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED` in Play Console or via a log check, closing the loop on the
   original refund-risk concern, and note whether Gap 1/Gap 2 above were addressed or accepted.
5. Only then proceed to Scenarios 2–4 per the existing manual checklist
   (`qa-artifacts/billing-runtime/MANUAL_VERIFICATION_CHECKLIST_SCENARIOS_1-4.md`).

## 4. Additional investigation (unchanged from prior revision, still relevant context)

### 4a. Was this ever deployed and later rolled back?

**No evidence of that.** Cloud Audit Logs for `cloudfunctions.googleapis.com` are empty across the
full 180-day lookback, which covers the entire git history of `functions/index.js` (oldest commit
is 27 days old as of today). If it had ever been deployed or deleted, that would show up as a
`google.cloud.functions.v1.CloudFunctionsService.*` audit entry. There isn't one. This means:

**No user has ever had a real Google Play purchase verified or acknowledged through
`functions/index.js`.** Any account currently showing `isPremium: true` / a paid badge got there
through some other path (the founder allowlist, a manual Firestore edit, a seed/QA script, or the
`assignJuly1AccessOnCreate` trial grant) — not through that specific pipeline. I did not find
evidence of an existing paying user at risk of the 3-day auto-refund *specifically because this
pipeline broke* — it appears to have never worked at all via this path, so there's no "was fine,
now broken" user population to worry about from *that* function. (I cannot fully rule out a real
Play Store customer having purchased and never gotten premium — that would show up as a support
complaint, not something I can query for directly. Flag this to me if you know of any such report.)

### 4b. Two-attempt history for Scenario 1, and correction of an earlier misattributed claim

**Attempt 1**: app-side Firebase Auth was `rakasa112233@gmail.com`, but the Play Store purchase on
the emulator was made under `wizzare@gmail.com` — an unintentional account mismatch, confirmed by
Google's order-confirmation email explicitly stating "Your account: wizzare@gmail.com". The
`scenario_1_log.txt` capture with the `SUBSCRIPTION_PENDING_ACKNOWLEDGEMENT` Play Store
notifications is from this attempt, and reflects `wizzare@gmail.com`'s purchase, not
`rakasa112233@gmail.com`'s.

**Attempt 2**: Play Store and app auth were aligned to `rakasa112233@gmail.com` on both sides, then
retried. Result was identical — "internal" error banner, account status stayed free/trial. No
separate log capture exists for this attempt.

**Why this is consistent evidence, not a contradiction, and why no extra log capture was required
before proceeding**: the confirmed root cause (§0 — zero Cloud Functions deployed,
`androidpublisher.googleapis.com` disabled on `bhumiamartya-fe85c`) is account-agnostic by
construction. The failure occurs when Firebase's client SDK tries to reach a Cloud Function that
does not exist, before any account-specific code ever runs. Two attempts with different account
configurations failing with the identical externally-observable signature is exactly what that root
cause predicts — not something that needed a second log to confirm.

**Correction of an earlier claim in this audit, recorded here rather than silently removed**: in the
"Audit Findings" response to the Scenario 1 failure report, I wrote *"I confirmed this against the
actual Firestore record for the account that just attempted the purchase: role: 'founder'..."* That
was a mislabeling error on my part. I had reused a Firestore query result for `wizzare@gmail.com`
(fetched in an earlier, separate turn) without re-verifying that `wizzare@gmail.com` was actually
the account relevant to that specific purchase attempt, and presented reused data as freshly
confirmed. `wizzare@gmail.com` does genuinely carry `role: "founder"` (it's the Founder's own
account, hardcoded in `FOUNDER_EMAILS`) — that underlying fact was correct — but the framing implying
it was "the account that just attempted the purchase" was wrong. Both data points below are
individually accurate; the error was in how they got connected.

**`rakasa112233@gmail.com` direct Firestore check** (the query that first surfaced the mislabeling
above): `users/EcKsOleSKdRNhCxSEiyUoVovZal1`, created `2026-07-29T05:21:45Z`. Full field list has no
`role`, `badge`, `testerBadge`, `membership`, `membershipType`, `isPremium`, `guardianRole`, or
`plan` field at all. `admin_users/rakasa112233@gmail.com` → 404, does not exist. The email does not
appear anywhere in the codebase (not in `FOUNDER_EMAILS`, not in any seed script allowlist). This
account is genuinely fresh and unprivileged — it is valid to reuse for post-cutover testing.

## Summary of what I need from you

- Go/no-go on implementing the Option B client-side code change (§1), after the verifier safety
  diff has been reviewed and its deployment has received separate approval.
- If you'd rather still pursue Option A eventually: confirmation once billing is resolved on
  `bhumiamartya-fe85c`, at which point Steps 1a/1b/1c in §2 apply as before.
- Whether you can reveal (or check yourself) which GCP project `GOOGLE_PLAY_PROJECT_ID` points to,
  so I can directly verify `androidpublisher` enablement and Play Console linking for that specific
  project rather than relying on circumstantial evidence.

I will not change any code or run any command in §1/§2 until you respond with explicit approval for
that specific step.
