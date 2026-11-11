# Bhumi Amartya VC 122 — Production Monitoring, Rollback & Post-Approval Runbook

**Status:** VC 122 (`5.0.22`) uploaded to Google Play Production (Under Review).  
**Submitted Artifact:** Unchanged (`017d1ee455cfee2987f176afdd420970c4b8523a` baseline for Android build; server verifier hardened independently).

---

## 1. Current Safe Pre-Approval Baseline

- **Vercel Backend (`bhumi-billing-verifier.vercel.app`):**
  - `BHUMI_ANTI_ABUSE_MODE=observe` (default safe observation mode; zero hard device denials).
  - `BHUMI_ANTI_ABUSE_HMAC_SECRET`: configured (Sensitive, length >= 32).
  - `GOOGLE_PLAY_CLIENT_EMAIL` & `GOOGLE_PLAY_PRIVATE_KEY`: configured for Play Developer API + Play Integrity decode.
  - Endpoints live & fail-closed on unauthenticated calls:
    - `POST /api/access/challenge` (`401 AUTH_MISSING`)
    - `POST /api/access/bootstrap-trial` (`401 AUTH_MISSING`, `403 ORIGIN_NOT_ALLOWED`)
    - `POST /api/account/reconcile-deletion` (`401 AUTH_MISSING`)
    - `POST /api/billing/google-play/verify` (`401 AUTH_MISSING`)
    - `POST /api/billing/reconcile` (`401 UNAUTHORIZED_CRON`)
- **Firestore Rules (`bhumiamartya-fe85c`):**
  - Deployed with deny-all rules on `antiAbuseDeviceClaims`, `antiAbuseAuditLogs`, `antiAbuseUsedNonces` (only Admin SDK via billing-verifier writes them).
  - Existing VC 121 trial/lifetime/premium entitlements and `users/{uid}` owner protections preserved.

---

## 2. Production Monitoring & Alerts

### Metrics to Monitor in `antiAbuseAuditLogs` (90-day retention, HMAC/SHA-256 only, zero raw PII)
1. **Challenge & Play Integrity pass/fail distribution (`integrityReason`, `playIntegrityVerified`):**
   - Expect `integrityReason == "VERIFIED"` and `playIntegrityVerified == true` on Play-distributed VC 122 Android installs once Play Store serves VC 122.
   - Alert threshold: unexpected spike in `APP_NOT_PLAY_RECOGNIZED`, `INTEGRITY_DECODE_HTTP_*`, `PLAY_INTEGRITY_DECODE_ERROR`, or `NONCE_REPLAYED` across real Play installs -> **DO NOT enable `enforce`; stay in `observe` and investigate.**
2. **Entitlement outcomes (`status`, `reasons`, `outcome`):**
   - `ELIGIBLE_FREE`: legitimate first-device Free Trial provisioning (`PROVISIONED`).
   - `DEVICE_FREE_TRIAL_USED`: duplicate device trial attempt (`FREE_LIMIT_REACHED` in `enforce`, `MODE_OBSERVE_ONLY` in `observe`).
   - `VERIFICATION_REQUIRED`: untrusted/failed Play Integrity attestation when `requirePlayIntegrity=true`.
   - `SIGNAL_UNAVAILABLE`: fallback behavior when Android signal cannot be collected.
   - `HIGHER_ENTITLEMENT` / `ALREADY_GRANTED`: existing Premium, Lifetime, or valid VC 121 users untouched.
3. **Vercel Function Error Rate & Latency:**
   - Monitor Vercel project `bhumi-billing-verifier` runtime logs (`vercel logs https://bhumi-billing-verifier.vercel.app --prod`) for 5xx responses on `/api/access/challenge`, `/api/access/bootstrap-trial`, `/api/account/reconcile-deletion`, `/api/billing/google-play/verify`.

---

## 3. Immediate Enforcement Rollback & Emergency Kill Switch

Three independent rollback mechanisms exist without needing a new Android release:

1. **Immediate Soft Rollback (`enforce` -> `observe`) via Vercel Env:**
   ```bash
   # Switch back to observe and redeploy production verifier
   vercel env rm BHUMI_ANTI_ABUSE_MODE production
   # re-add BHUMI_ANTI_ABUSE_MODE=observe and run:
   vercel deploy --prod --yes --non-interactive
   ```
   Effect: Existing claims continue to be observed/logged without denying Free Trial provisioning on new accounts.
2. **Instant Firestore Kill Switch (`app_config/antiAbuse`):**
   Set `{ "killSwitch": true }` on Firestore document `app_config/antiAbuse`.
   Effect: Immediately forces `mode = "off"` across both `resolveVerifierAntiAbuseFlags` and `resolveAntiAbuseFeatureFlags` on the next request without waiting for a Vercel redeploy.
3. **Env Kill Switch (`BHUMI_ANTI_ABUSE_KILL_SWITCH=true`):**
   Set `BHUMI_ANTI_ABUSE_KILL_SWITCH=true` in Vercel Production env and redeploy.

> **Important Precedence Guarantee:** When `BHUMI_ANTI_ABUSE_MODE=enforce` is set on Vercel, stale/tampered `app_config/antiAbuse` docs CANNOT silently downgrade `mode` to `observe` or disable `enforceDeviceFreeClaim` or `requirePlayIntegrity`. Only `killSwitch: true` stops enforcement immediately in emergencies.

---

## 4. Authorized Synthetic Test Account Matrix (Pre-Staged)

| Scenario | Identity / State | Expected (`observe`) | Expected (`enforce`, post-Play verification) |
| --- | --- | --- | --- |
| **A. Brand-new Play-distributed device** | Synthetic Fresh Account 1 (`auth_uid_A`), no prior `antiAbuseDeviceClaims` | `PROVISIONED` (`ELIGIBLE_FREE`), `playIntegrityVerified=true`, writes `antiAbuseDeviceClaims` | `PROVISIONED` (`ELIGIBLE_FREE`), `antiAbuseUsedNonces` consumes nonce |
| **B. Second account on same Android device** | Synthetic Account 2 (`auth_uid_B`), same device claim key (`appSetIdHash`/`deviceIdHash`), valid Play Integrity | `PROVISIONED` with `DEVICE_CLAIM_EXISTS_OTHER_UID,MODE_OBSERVE_ONLY` | `FREE_LIMIT_REACHED` (`DEVICE_FREE_TRIAL_USED`), sign-in allowed, no Free Trial |
| **C. Sideloaded / tampered APK or spoofed nonce** | Account on sideloaded APK or replayed challenge nonce | `playIntegrityVerified=false`, logged with `integrityReason` | `VERIFICATION_REQUIRED` (retryable via `"Verifikasi Akun"`) |
| **D. Google Play Premium purchase / Restore** | Paid/licensed Play account (`PREMIUM_ACTIVE`) | `HIGHER_ENTITLEMENT` | `HIGHER_ENTITLEMENT` (never blocked by device claim) |
| **E. Existing VC 121 user / Lifetime / Founder** | Legacy VC 121 valid trial or Lifetime/Founder badge | `ALREADY_PRESENT` / `HIGHER_ENTITLEMENT` | `ALREADY_PRESENT` / `HIGHER_ENTITLEMENT` (backward compatible) |
| **F. Shared household birth data, distinct devices** | Account C on Device 2 with matching birth core | `PROVISIONED` (`birthCoreHmac` logged for audit only) | `PROVISIONED` (`birthCoreHmac` NEVER blocks alone) |
| **G. Account deletion + re-signup on same device** | Deleted account via `/api/account/reconcile-deletion` | `users/{uid}` purged; device claim history retained up to `retainUntil` | Prior device Free Trial benefit stays exhausted unless purchase/restore |

---

## 5. Post-Approval Activation Gate (Execute ONLY After Play Store Approves VC 122)

1. Confirm Google Play Store listing shows **VC 122 (`5.0.22`)** live on Production and install directly from Google Play on an authorized Android device.
2. Execute Cases A, D, E on the Play-installed app while still in `mode=observe`; inspect `antiAbuseAuditLogs` to verify:
   - `playIntegrityVerified === true`
   - `integrityReason === "VERIFIED"`
   - (Optional) Capture Play App Signing `certificateSha256Digest` and set `BHUMI_PLAY_CERT_SHA256_B64` if strict cert pinning is desired.
3. Only after Play Integrity verification is confirmed `VERIFIED` on the genuine Play binary:
   - Update Vercel `BHUMI_ANTI_ABUSE_MODE=enforce` and redeploy `services/billing-verifier`.
   - Re-verify Cases B, C, D, E, F, G live and monitor error rate / false positives.
