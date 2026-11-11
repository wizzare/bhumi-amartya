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
2. Execute Cases A, D, E on the Play-installed app while still in `mode=observe`; inspect `/api/access/monitor` / `node scripts/monitor-vc122-anti-abuse.mjs` to verify:
   - `playIntegrityVerified === true`
   - `integrityReason === "VERIFIED"`
   - Confirm Play App Signing `SHA-256` from Google Play Console (`Release > Setup > App integrity > App signing key certificate`) and configure `BHUMI_PLAY_CERT_SHA256_B64` (hex or base64url accepted).
3. Only after Play Integrity verification is confirmed `VERIFIED` on the genuine Play binary AND Play App Signing pinning (if enabled) passes:
   - Update Vercel `BHUMI_ANTI_ABUSE_MODE=enforce` and redeploy `services/billing-verifier`.
   - Re-verify Cases B, C, D, E, F, G live and confirm zero false denials before widening rollout.

---

## 6. Device Signal Binding & Known Bypass Boundaries (VC 122 Audit)

- **Cryptographically Bound in VC 122 Play Integrity Flow:**
  - Authenticated Firebase `uid` (`challengeToken` HMAC signature over `uidHash`, `nonce`, `iat`, `exp`).
  - Single-use `nonce` freshness (`antiAbuseUsedNonces/{nonceHash}`, 5-minute TTL, 10-minute Play Integrity timestamp window).
  - Package name (`com.bhumiamartya.app`), `versionCode >= 122`, Play recognition (`PLAY_RECOGNIZED`), and device integrity (`MEETS_DEVICE_INTEGRITY` / `MEETS_STRONG_INTEGRITY`).
- **Known VC 122 Client Limitation (Must Remain Documented):**
  - `DeviceIntegrityPlugin.requestIntegrityToken` and `lib/billing/canonicalAccessBootstrap.ts` pass raw `chBody.nonce` directly to Play Integrity without binding `appSetIdHash`/`deviceIdHash` into the Play Integrity `nonce` hash.
  - Therefore, a legitimate user/device generating an unused `PLAY_RECOGNIZED` token for its own `uid` and tampering with the HTTP JSON fields (`appSetIdHash`/`deviceIdHash`) can cause a different `deviceClaimId` to be evaluated. Closing that binding gap requires a future **VC 123** client update (`nonce = sha256(serverNonce + uid + appSetIdHash + deviceIdHash)`).
  - Play Integrity tokens also do NOT create an immutable hardware identity across factory resets or full App Set uninstall resets; when `appSetIdHash`/`deviceIdHash` are legitimately unavailable (`allowSignalUnavailableFallback=true`), unsupported signal claims MUST NOT trigger automatic denial.

---

## 7. Play App Signing vs Upload Certificate & Continuous Monitoring

- **Upload Certificate (`bhumi-amartya-release.jks`, verified on `app-release.aab`):**
  - SHA-1: `B5:1C:84:D0:7B:86:95:80:C7:D5:9D:36:E8:FA:F8:52:F7:92:CC:52`
  - SHA-256: `1B:C1:30:61:AA:B6:F7:EB:36:2B:FD:0A:71:E3:DB:10:6D:B8:61:57:36:A3:37:B1:97:FC:5F:0D:B5:92:B5:18`
- **Google Play App Signing Certificate (Unconfirmed from Play Console API):**
  - Firebase `apps:android:sha:list` (`1:59259824153:android:204d11fa49fa41371ee288`) contains `F7:0F:FC:C9:...` (confirmed local debug keystore) plus two additional SHA-256 hashes (`48:B1:AE:1A:...` and `83:F1:3B:20:...`), none of which matches the upload key (`1B:C1:30:61:...`) and none carries Play App Signing metadata in Firebase.
  - `BHUMI_PLAY_CERT_SHA256_B64` intentionally remains unset in Production during `OBSERVE` so real Play-distributed installs are never rejected by uploading key pinning (`1B:C1:...`) by mistake. Configure `BHUMI_PLAY_CERT_SHA256_B64` ONLY after verifying the active **App signing key certificate SHA-256** directly in Google Play Console.
- **Scheduled Continuous Monitoring:**
  - **Vercel Cron:** `GET /api/access/monitor` scheduled daily (`0 2 * * *`) in `services/billing-verifier/vercel.json`, authenticated via `CRON_SECRET`, reporting non-PII `byStatus`, `byIntegrityReason`, collection counts, HMAC check, and `CRITICAL`/`WARNING` alerts.
  - **GitHub Actions Cron:** `.github/workflows/vc122-anti-abuse-monitor.yml` runs `node scripts/monitor-vc122-anti-abuse.mjs` every 30 minutes (`*/30 * * * *`) across all live verifier endpoints and optional authenticated `/api/access/monitor` threshold checks (`BHUMI_VERIFIER_CRON_SECRET`).
