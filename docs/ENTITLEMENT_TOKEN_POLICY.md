# Signed Entitlement Token Lifetime & Offline Grace Policy

## Values (as implemented)

| Parameter | Value | Where enforced |
|---|---|---|
| Token TTL | **24 hours** from issuance | `verify.ts` — `exp = min(subscriptionExpiry, now + 24h)` |
| Max clock skew | **60 seconds** | `signedEntitlement.ts` (server), `googlePlayBilling.ts` (client) |
| Offline grace | **72 hours** from `iat` | `googlePlayBilling.ts::verifySignedEntitlementLocal` |
| Refresh cadence | Every silent-restore trigger, min 5 min apart | `autoRecoverActiveSubscriptions` cooldown |
| Cancellation/revocation visibility delay | ≤ 24h online; ≤ 72h fully offline | consequence of TTL + grace |

## Why the token is not issued for the full subscription period

A monthly subscription is valid for ~30 days, but the signed entitlement is
capped at 24 hours. If we signed a 30-day token, a refund, chargeback, or
cancellation could not be reflected on-device for up to a month — the client
would keep unlocking premium off a stale but cryptographically valid token.
The 24h cap bounds that exposure while still fully surviving the original
incident (Firestore being down does not block access, because the ledger +
signed token path is independent of Firestore).

## Online vs offline behavior

- **Online, token fresh (< 24h):** unlocked locally, no network needed.
- **Online, token expired:** `verifySignedEntitlementLocal` returns `false`
  and does **not** apply the grace window — the app must re-verify against
  the server. This prevents an online device from coasting on a stale token.
- **Offline, token expired but < 72h since `iat`:** grace applies, access
  continues. This is the "user is on a plane / no signal" case.
- **Offline, > 72h since `iat`:** fails closed, token is deleted from secure
  storage, access denied until the device can reach the verifier again.

## Fail-closed conditions (token deleted from secure storage)

- `sub` claim ≠ currently signed-in Firebase UID (account switch).
- Past the 72h offline grace limit.
- Explicit logout (`handleUserLogout`).
- Web platform — offline local verification is refused entirely; the web
  build must not treat a locally cached token as authoritative.
