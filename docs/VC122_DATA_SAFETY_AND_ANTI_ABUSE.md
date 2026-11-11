# Bhumi Amartya VC 122 — Privacy, Data Retention & Anti-Multi Account Architecture

## 1. Purpose & Production Default

VC 122 (`5.0.22`) introduces server-owned device and attestation telemetry to prevent Free Trial abuse across multiple Google accounts on a single physical Android device, while keeping legitimate users, existing Free Trials, Founder/Lifetime roles, Legacy VC 121 users, and active Google Play subscribers protected.

- **Default production mode:** `observe` (`enforceDeviceFreeClaim: false`).
- **Activation prerequisite:** Hard enforcement (`mode: "enforce"`) MUST NOT be enabled until VC 122 has been distributed through Google Play (Internal Testing -> Production) and live `PLAY_RECOGNIZED` Play Integrity verdicts are confirmed.

---

## 2. Device Identification & Attestation Lifecycle

1. **Challenge Issuance (`POST /api/access/challenge`):**
   - Requires verified Firebase ID token (`Authorization: Bearer <token>`).
   - Issues an HMAC-SHA256-signed single-use `challengeToken` bound to `uidHash`, a 24-byte `nonce`, and a 5-minute expiration (`expiresAt`).
2. **Android Native Collection (`DeviceIntegrityPlugin.java`):**
   - Uses Android `Settings.Secure.ANDROID_ID` hashed locally via SHA-256 (`deviceIdHash`) — raw `ANDROID_ID`, IMEI, serial number, MAC address, and `READ_PHONE_STATE` are never requested or transmitted.
   - Requests Play Services App Set ID (`AppSet.getClient().getAppSetIdInfo()`) hashed locally via SHA-256 (`appSetIdHash`) only when Play Services returns it cleanly (`null` otherwise).
   - Requests a Google Play Integrity token (`IntegrityManagerFactory.create().requestIntegrityToken`) bound to the server nonce for cloud project `59259824153`.
   - Web and local QA builds use a random per-install UUID (`installIdHash`).
3. **Server Verification (`POST /api/access/bootstrap-trial`):**
   - Verifies Firebase ID token (`checkRevoked: true`) and Firebase App Check header (`X-Firebase-AppCheck`) when configured.
   - Ignores any client-supplied `playIntegrityVerified` or `appCheckVerified` booleans (`parseVerifierSignals` initializes both to `null`).
   - Verifies HMAC signature, UID binding, and expiration of `challengeToken`.
   - Calls Google Play Integrity `decodeIntegrityToken` (`v1/com.bhumiamartya.app:decodeIntegrityToken`), verifying:
     - `requestPackageName === "com.bhumiamartya.app"`
     - `nonce` matches the verified challenge nonce
     - `timestampMillis` within 10 minutes
     - `appRecognitionVerdict === "PLAY_RECOGNIZED"`
     - `deviceRecognitionVerdict` contains `MEETS_DEVICE_INTEGRITY` or `MEETS_STRONG_INTEGRITY`
   - Consumes the challenge nonce atomically in `antiAbuseUsedNonces/{nonceHash}` (`allow read, write: if false;` in Firestore Rules) to prevent replay attacks.
   - Prioritizes `appset:<appSetIdHash>` -> `dev:<deviceIdHash>` -> `inst:<installIdHash>`.
   - When `mode === "enforce"`, `requirePlayIntegrity` defaults to `true` so Android enforcement never depends on SHA-256 Android ID alone without operator override.

---

## 3. Anti-Multi Account Business Matrix (Cases 1–7)

| Case | Scenario | Result | User Protection |
| --- | --- | --- | --- |
| 1 | First Google account on eligible Android device | `PROVISIONED` (7-day server trial) | Records atomic claim with `firstUidHash` (no raw UID stored). |
| 2 | Second Google account on same device after claim | `DEVICE_FREE_TRIAL_USED` (`FREE_LIMIT_REACHED`, HTTP 403 in `enforce`) / `ELIGIBLE_FREE` flagged in `observe` | Sign-in, Free Dashboard, **Lihat Bhumi Premium**, **Pulihkan Pembelian**, **Masuk Akun Lama**, and **Verifikasi Akun** remain accessible. |
| 3 | Active Premium / Founder / Lifetime switching devices or reinstalling | `HIGHER_ENTITLEMENT` (`PREMIUM_ACTIVE`) | Never downgraded, blocked, or overwritten. |
| 4 | Duplicate birth profile (twins/family/shared details) | `BIRTH_PROFILE_SIMILARITY_OBSERVED` flag only | Never hard-blocks Free Trial alone. |
| 5 | Legitimate shared family device | Non-hostile banner + retry/appeal | **Masuk Akun Lama**, inline **Verifikasi Akun** (`retryCanonicalAccessVerification`), and support review at `/bantuan#verifikasi-perangkat`. |
| 6 | App reinstall / storage reset / Android profile switch | Same `uid` -> `ALREADY_PRESENT`; new Android `uid` on same device -> matched by `appSetIdHash`/`deviceIdHash` | `installIdHash` resets on storage clear/reinstall; `appSetIdHash` persists across app reinstalls within the same developer group; `deviceIdHash` persists across uninstall on same Android profile+signing key; Play Integrity verifies genuine Play install. |
| 7 | Concurrent claims from two accounts on same device | Firestore transaction serializes claim creation; 1st commits `PROVISIONED`, 2nd sees conflict/existing claim | Server-owned atomic entitlement writes only. |

---

## 4. Account Deletion, Retention & Data Minimization

### Collections & Schema Controls
All anti-abuse collections are **server-only** (`allow read, write: if false;` in `firestore.rules`):

- **`antiAbuseDeviceClaims`:** Stores `claimKey`, `firstUidHash`, `uidHistory` (capped at 15 salted hashes), `firstClaimedAt`, `lastSeenAt`, `retainUntil` (**180 days**). Raw `firstUid` is no longer written by new bootstrap transactions.
- **`antiAbuseBirthClaims`:** Stores salted `hmac`, `firstUidHash`, `uidHashes` (capped at 20), `retainUntil` (**180 days**).
- **`antiAbuseAuditLogs`:** Stores `uidHash`, `deviceClaimId`, `status`, `reasons`, `observedRiskFlags`, `mode`, `platform`, `appVersionCode`, `createdAt`, `retainUntil` (**90 days**).
- **`antiAbuseUsedNonces`:** Stores `uidHash`, `usedAt`, `retainUntil` (**7 days**) to block nonce replay.

### Deletion Reconciliation (`POST /api/account/reconcile-deletion`)
Invoked automatically (best-effort authenticated call) during account deletion in `app/settings/page.tsx` before `deleteUser(user)`:
1. Removes the user's `uidHash` from `antiAbuseBirthClaims` documents (deletes the document completely if no other accounts remain).
2. Scrubs any legacy raw `firstUid` (`FieldValue.delete()`) from matching `antiAbuseDeviceClaims` documents into `firstUidHash`, stamps `accountDeletedAt`, and enforces the `retainUntil` 180-day ceiling.
3. Redacts `birthCoreHmac: null`, stamps `accountDeletedAt`, and enforces the 90-day `retainUntil` ceiling on `antiAbuseAuditLogs`.

*Retention enforcement note:* `retainUntil` timestamps are stamped on every document write and deletion reconciliation. Periodic TTL pruning relies on Firestore TTL policy activation for the `retainUntil` field across those collections in Google Cloud Console (`bhumiamartya-fe85c`).

---

## 5. Google Play Data Safety Declaration Mapping

| Data Type | Collected | Shared | Ephemeral / Processed Only | Purpose | Correlation / Anonymity Accuracy |
| --- | --- | --- | --- | --- | --- |
| Account Info (Email, Display Name, Firebase UID) | Yes | No | No | Account functionality, sync | Tied to user identity; deleted on account deletion. |
| User-Provided Birth Data (Date, Time, Location) | Yes | Partial (anonymized/derived prompt context if AI enabled) | No | App functionality (Blueprint) | Linked to UID; unlinked/deleted on account deletion. |
| Approximate Location (GPS when Weather/Env feature requested) | Optional (user permission) | Weather/AQI API query | **Yes (ephemeral)** | App functionality (Environment card) | Only requested when user interacts; coordinates are not stored permanently in profile. |
| Purchase History / Play Billing Purchase Tokens | Yes | Google Play Billing API | No | App functionality, Fraud prevention | Linked to user & Google Play entitlement verification. |
| App Activity (Journals, Wellness Reflections) | Yes | No | No | Personalization, App functionality | Deleted on account deletion. |
| Device or Other IDs (SHA-256 `ANDROID_ID`, SHA-256 `installId`, App Set ID when returned by Play Services, Firebase App Check & Play Integrity tokens) | Yes | Google Play Integrity / Firebase App Check APIs | Integrity tokens: ephemeral; Hashes: bounded 180d/90d | Fraud prevention, Security, Analytics (stability) | **Pseudonymous / correlatable — NOT anonymous.** Disclosed accurately in `app/kebijakan-privasi/page.tsx`. |
