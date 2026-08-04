# Signed Entitlement Key Rotation Procedure

## Model

- Server signs with exactly one **active** private key, selected by `kid`
  (currently `"v1"`). The private key never leaves the server; it lives only
  in the `ENTITLEMENT_PRIVATE_KEY` env var.
- The client holds a **keyring** of public keys only, keyed by `kid`:
  - `NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY` → `v1`
  - `NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY_V2` → `v2`
- `services/billing-verifier/lib/signedEntitlement.ts::getPublicKeyPem(kid)`
  and `lib/billing/googlePlayBilling.ts::verifySignedEntitlementLocal`'s
  `PUBLIC_KEYRING` map both reject any `kid` they don't recognize — an
  unknown `kid` fails closed, it never falls back to a default key.
- The public key can only verify, never sign (`crypto.verify` vs.
  `crypto.sign` — the client build has no code path that calls `sign`).

## Rotation Steps

1. Generate a new key pair: `npx tsx services/billing-verifier/scripts/generateKeys.ts`.
2. Ship the new public key to the client under a **new** `kid` (e.g. `v2`)
   via `NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY_V2`, alongside the still-active
   `v1` key. Release this client build and let it roll out.
3. Once telemetry confirms the new client build has reasonable adoption,
   flip the server's active signing key to `v2` (`ENTITLEMENT_PRIVATE_KEY`
   becomes the v2 private key; `generateSignedEntitlement` is called with
   `kid = "v2"`).
4. Tokens already issued under `v1` continue to verify on old clients until
   they naturally expire (max 24h TTL + up to 72h offline grace — see
   token lifetime policy below), so `v1`'s public key must stay in the
   client keyring for at least that window after cutover.
5. After the overlap window closes, remove `v1` from the client keyring in
   a subsequent release and retire the `v1` private key.

## Guardrails already enforced in code

- `getPublicKeyPem` (`signedEntitlement.ts`) throws `UNKNOWN_KID` for any
  `kid` outside the configured set — verified by
  `tests/unit/build84-purchase-ledger.test.ts`.
- `verifySignedEntitlementLocal` (`googlePlayBilling.ts`) returns `false`
  immediately if `PUBLIC_KEYRING[header.kid]` is undefined.
- Rotation never requires a schema or API contract change — `kid` is
  carried in the token header, not the database.
