# Google Play Real-Time Developer Notifications (RTDN) — Interface Spec

**Status:** DEFERRED. Not implemented in Phase B1.1. This document defines the
contract for the Phase B1.2 implementation so B1.1's ledger/reconciliation
foundation can absorb it without further schema changes.

## Scope Boundary

- **B1.1 (this phase, implemented):** Neon Postgres ledger, ES256 signed
  entitlement, durable acknowledgement/sync jobs, reconciliation worker,
  coalesced silent restore.
- **B1.2 (deferred):** RTDN push handler, renewal/cancellation/refund
  lifecycle automation driven by Google Play push notifications instead of
  purely client-triggered verification.

Do not represent B1.1 as covering RTDN. Renewals/cancellations that occur
while the app is never opened will not be reflected until B1.2 ships;
silent restore (on login/open/resume/reconnect) is the current mitigation.

## Endpoint

`POST /api/billing/google-play/notifications`

Triggered by a Google Cloud Pub/Sub push subscription configured against the
Real-Time Developer Notifications topic declared in Play Console.

## Envelope Validation

1. Verify the Pub/Sub push request is authentic (OIDC token in
   `Authorization: Bearer <token>`, audience + issuer checked against the
   configured Pub/Sub service account — never trust an unauthenticated body).
2. Decode `message.data` (base64) into the `DeveloperNotification` JSON.
3. Extract `packageName`, `eventTimeMillis`, and one of
   `subscriptionNotification` / `oneTimeProductNotification` /
   `voidedPurchaseNotification`.
4. Deduplicate on `message.messageId` (Pub/Sub delivery is at-least-once).
   Store seen message IDs in `billing_events.provider_event_id`
   (unique constraint already defined in `001_billing_schema.sql`).

## Trust Model

**The notification payload is a pointer, not a source of truth.** It tells
us *something changed* for a given `purchaseToken`; it never tells us the
current state directly. Every notification type triggers a live call to the
Google Play Developer API (`purchases.subscriptionsv2.get`) using the
existing `fetchSubscription()` in `services/billing-verifier/lib/googlePlay.ts`.

## Notification Types → Action

| `notificationType` | Meaning | Action |
|---|---|---|
| `SUBSCRIPTION_PURCHASED` (4) | New purchase | Re-verify → upsert ledger → enqueue `SYNC_FIRESTORE_ENTITLEMENT` + `ACKNOWLEDGE_GOOGLE_PLAY` if pending |
| `SUBSCRIPTION_RENEWED` (2) | Renewal charged | Re-verify → update `expires_at` → enqueue `SYNC_FIRESTORE_ENTITLEMENT` |
| `SUBSCRIPTION_CANCELED` (3) | User canceled (still paid through period end) | Re-verify → ledger stays active until confirmed expiry, mark `purchase_state` |
| `SUBSCRIPTION_EXPIRED` (13) | Grace/account-hold exhausted | Re-verify → mark `entitlement_status = EXPIRED` → enqueue sync |
| `SUBSCRIPTION_ON_HOLD` (5) / `IN_GRACE_PERIOD` (6) | Payment issue | Re-verify → reflect actual Google state, do not assume active |
| `SUBSCRIPTION_REVOKED` (12) | Refund/chargeback | Re-verify → mark `CANCELLED`, revoke entitlement |
| Voided purchase notification | Refund/chargeback (older event) | Existing `checkVoidedPurchase()` path; revoke |

No branch may set `entitlement_status` from the notification type alone —
every path re-verifies via the Developer API first, matching the existing
"voided-purchase check before decision" pattern already used in `verify.ts`.

## Idempotency

- Primary key: `provider_event_id` (Pub/Sub `messageId`) in `billing_events`.
- A redelivered message with the same `messageId` is a no-op (unique
  constraint violation caught and ignored).
- The re-verify + upsert into `purchase_ledger` is itself idempotent on
  `token_hash`, so even without dedup the end state converges correctly —
  dedup exists to avoid redundant Google API calls and duplicate event rows,
  not for correctness.

## Response Contract

- Return `204` quickly once the event is durably queued (insert into
  `billing_events` + `entitlement_sync_jobs` inside one transaction, same
  pattern as `executeLedgerVerificationTx`).
- Do the actual re-verification + Firestore sync via the existing
  reconciliation worker (`/api/billing/reconcile`), not inline in the RTDN
  handler — this keeps the push handler's ack latency low and reuses the
  SKIP LOCKED claim/backoff/dead-letter machinery already built in B1.1.
- Pub/Sub retries on any non-2xx; a slow synchronous re-verify inline risks
  duplicate redelivery storms.

## Open Items for B1.2 Implementation

- Configure Play Console → Pub/Sub topic → push subscription → this endpoint.
- Provision the Pub/Sub push service account and pin its OIDC audience.
- Add `job_type = 'RTDN_REVERIFY'` to `entitlement_sync_jobs` (schema already
  supports arbitrary job_type values; no migration needed).
- Extend `billing_events.event_type` enum-by-convention with
  `RTDN_SUBSCRIPTION_PURCHASED`, `RTDN_SUBSCRIPTION_RENEWED`, etc.
