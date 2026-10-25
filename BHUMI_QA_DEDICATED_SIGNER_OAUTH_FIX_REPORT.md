# BHUMI QA - Dedicated Signer and OAuth Fix

**Date:** 2026-10-23  
**Sprint:** QA-DEDICATED-SIGNER-OAUTH-FIX-01  
**Verdict:** **QA SIGNER PASS / ANDROID OAUTH PASS / QA SDK PASS / RUNTIME BLOCKED**  
**Release status:** NOT READY - no APK, no native sign-in, no backend deployment

---

## 1. Authorization and boundaries

Authorized worktree: `C:\tmp\bhumi-build106-recovery`  
HEAD at execution: `e63f334cf0ac20cc076bc88e98e3e06808b024f3` (unchanged)

Performed within the Founder directive:

- Created a dedicated QA signing key with the local JDK/keytool.
- Stored the keystore and password properties outside the source repository under `%USERPROFILE%\.bhumi-qa\signing\`.
- Derived public QA SHA-1/SHA-256 fingerprints.
- Verified the new package + SHA-1 combination is not registered in any accessible Firebase project.
- Added a QA-only Gradle signing config and `qa` build type.
- Registered the new SHA-1/SHA-256 in Firebase project `bhumi-amartya-qa` only.
- Refreshed the QA `google-services.json` outside the repository.
- Verified Android OAuth `client_type 1` and Web OAuth `client_type 3`.
- Re-ran local QA/Auth guard tests, TypeScript, and Quality Gate.
- Verified Spark, Firestore isolation, and disabled Billing.

Not performed:

- No production Firebase mutation or signer change.
- No deletion of the conflicting OAuth client in another project.
- No new Play Console account.
- No Blaze, Cloud Billing, or paid service.
- No APK export/build/install/launch.
- No native Google Sign-In or device login.
- No backend deployment.
- No Git commit, push, reset, clean, or stash.
- No keystore password, private key material, or keystore bytes recorded in this report.

---

## 2. Root cause and decision

The previous QA Android OAuth client could not be created because another project already owns the OAuth client combination:

```text
Package: com.bhumiamartya.app.qa
SHA-1:   E7:76:79:29:E8:C4:14:92:FE:FA:D0:E8:A5:3A:BE:27:49:FF:A8:D4
```

Decision implemented: use a dedicated QA signing key with a new unique SHA-1. The global Android debug keystore and all production signing keys remain untouched.

---

## 3. Dedicated QA signer

### 3.1 Location and properties

```text
Keystore:   %USERPROFILE%\.bhumi-qa\signing\bhumi-qa-dedicated.p12
Properties: %USERPROFILE%\.bhumi-qa\signing\keystore.properties
Public:     %USERPROFILE%\.bhumi-qa\signing\fingerprints.txt
```

- Format: PKCS12
- Alias: `bhumi-qa`
- Key algorithm: RSA 4096
- Signature algorithm: SHA256withRSA
- Validity: 10000 days
- Distinguished name: synthetic QA identity (`CN=Bhumi Amartya QA, OU=QA, O=Bhumi Amartya, L=Jakarta, ST=Jakarta, C=ID`)
- Keystore size: 4428 bytes

The password properties and keystore are outside the repository. The `signing` directory and all three files have ACL protection restricted to the current Windows user (`SHEINA\shein`, FullControl only). Passwords and private key material are not included in this report.

### 3.2 Public fingerprints

```text
QA_SHA1=06:CF:57:E5:B3:D0:FC:67:44:A8:B1:D7:18:16:E6:46:67:AE:63:B0
QA_SHA256=E2:4C:6F:DC:B3:80:F6:BE:70:27:6F:51:47:26:64:99:5A:71:6D:F7:EF:9B:4D:C7:70:A6:28:C8:6F:0C:D4:BF
```

These fingerprints are recorded in `fingerprints.txt` and used in Firebase QA.

---

## 4. Uniqueness verification

The new package + SHA-1 combination was checked before registering it. Read-only Firebase Management API checks covered all accessible projects:

```text
PROJECTS_CHECKED=9
ANDROID_APPS_CHECKED=8
SHA_CERTS_CHECKED=21
EXACT_PACKAGE_SHA1_MATCHES=0
NEW_SHA1_ANYWHERE=0
NEW_SHA256_ANYWHERE=0
READ_ERRORS=0
```

The check included production project `bhumiamartya-fe85c` as read-only metadata. No production app or signer was modified.

The production `.qa` app still contains the old conflicting SHA-1 and does **not** contain the new QA SHA-1:

```text
PROD_QA_APP_OLD_CONFLICT_SHA1_STILL_PRESENT=True
NEW_QA_SHA1_PRESENT_IN_PROD=False
```

The conflicting OAuth client was not deleted.

---

## 5. Gradle QA signing configuration

`android/app/build.gradle` now has:

- QA signing values from `BHUMI_QA_STORE_FILE`, `BHUMI_QA_STORE_PASSWORD`, `BHUMI_QA_KEY_ALIAS`, `BHUMI_QA_KEY_PASSWORD`.
- Fallback to `BHUMI_QA_KEYSTORE_PROPERTIES` or `%USERPROFILE%\.bhumi-qa\signing\keystore.properties`.
- A conditional `qa` signing config and `qa` build type.
- `qa` build type: `.qa` applicationId suffix, `-qa` versionName suffix, release-like minify/shrink/proguard, `matchingFallbacks = ['release']`.
- Production `release` and `debug` signing behavior unchanged.

Gradle verification (configuration only; no APK task):

```text
Variant: qa
Config: qa
Store: C:\Users\shein\.bhumi-qa\signing\bhumi-qa-dedicated.p12
Alias: bhumi-qa
SHA1: 06:CF:57:E5:B3:D0:FC:67:44:A8:B1:D7:18:16:E6:46:67:AE:63:B0
SHA-256: E2:4C:6F:DC:B3:80:F6:BE:70:27:6F:51:47:26:64:99:5A:71:6D:F7:EF:9B:4D:C7:70:A6:28:C8:6F:0C:D4:BF
```

`Variant: debug` still uses the global debug keystore (old conflicting SHA-1). `Variant: release` still uses the production release keystore. The `signingReport` task completed with `BUILD SUCCESSFUL`, exit `0`, and did not build an APK.

---

## 6. Firebase QA registration

Registered in `bhumi-amartya-qa` only:

| Type | SHA ID | Fingerprint |
|---|---|---|
| SHA-1 | `c70283598f709fd3` | `06:CF:57:E5:B3:D0:FC:67:44:A8:B1:D7:18:16:E6:46:67:AE:63:B0` |
| SHA-256 | `9d522ac2d52c0517` | `E2:4C:6F:DC:B3:80:F6:BE:70:27:6F:51:47:26:64:99:5A:71:6D:F7:EF:9B:4D:C7:70:A6:28:C8:6F:0C:D4:BF` |

The QA app now has four registered SHA certificates: the two old debug fingerprints and the two new dedicated QA fingerprints. No old SHA was deleted.

---

## 7. OAuth client and QA SDK verification

The QA `google-services.json` was refreshed from Firebase. The previous file was backed up at:

```text
%USERPROFILE%\.bhumi-qa\backup\google-services.pre-dedicated-signer.json
```

Final QA configuration:

```text
PROJECT_ID=bhumi-amartya-qa
PROJECT_NUMBER=125330899891
MOBILESDK_APP_ID=1:125330899891:android:1d0bf90724f7a71ed4c1c6
PACKAGE=com.bhumiamartya.app.qa
OAUTH_TYPES=1,3
TYPE1_COUNT=1
TYPE3_COUNT=1
TYPE1_PACKAGE=com.bhumiamartya.app.qa
TYPE1_CERT_SHA1=06cf57e5b3d0fc6744a8b1d71816e64667ae63b0
TYPE1_CLIENT_ID=125330899891-1vt8924vp04qdf2lsl4o06p9feukhftn.apps.googleusercontent.com
TYPE3_CLIENT_ID=125330899891-j9vs2s13oolg3qsaib2qc9rjp2jhju3b.apps.googleusercontent.com
TYPE3_MATCHES_IDP=True
TYPE3_PATTERN_MATCH=True
TYPE1_IS_PRODUCTION=False
TYPE3_IS_PRODUCTION=False
PRODUCTION_NUMBER_PRESENT=False
```

The Android OAuth client is correct: package `com.bhumiamartya.app.qa`, certificate SHA-1 `06cf...63b0`, and QA project number `125330899891`. The Web OAuth client matches the Google IdP `clientId` and remains QA-only.

---

## 8. QA Web Client ID resolver

`lib/auth/googleWebClientId.ts` was verified with the actual QA type 3 client:

```text
ACTUAL_QA_CLIENT_ACCEPTED=True
```

The resolver still rejects:

- Missing QA client ID.
- Mismatched QA project.
- Production client ID in QA mode.
- Any client ID outside `125330899891-*.apps.googleusercontent.com`.
- QA mode values other than `realQA`.

The production fallback remains impossible in QA mode. `assertQaOperationAllowed()` remains first in `signInWithGoogle`, so runtime stays blocked until a separate QA runtime policy authorization.

---

## 9. Isolation verification

```text
Billing enabled: False
Firestore database: (default)
Location: asia-southeast2
Type: FIRESTORE_NATIVE
Concurrency: PESSIMISTIC
Rules release: cloud.firestore
Ruleset: projects/bhumi-amartya-qa/rulesets/a89358b4-51b4-49eb-bd28-c79355accf97
DENY_ALL_PRESENT=True
```

Firebase QA remains Spark with Billing disabled. Firestore isolation and the deny-all release are intact. No Blaze or Cloud Billing activation occurred.

---

## 10. Tests and Quality Gate

| Command | Result | Exit |
|---|---|---|
| `node tests/unit/qa-google-web-client-id.test.mjs` | `21 assertions PASS` | `0` |
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | `PASS 512 assertions; protected callback/fetch/plugin invocations=0` | `0` |
| `npx tsx tests/unit/auth-new-02-bootstrap-telemetry.test.ts` | `PASS auth-new-02-bootstrap-telemetry (14 assertions)` | `0` |
| `npx tsc --noEmit` | PASS | `0` |
| `node scripts/run-quality-gate.cjs` | `DEVELOPMENT GATE PASS` / `RELEASE GATE BLOCKED` | `0` |
| `.\gradlew.bat :app:signingReport --no-daemon` | `BUILD SUCCESSFUL` | `0` |

The AUTH-NEW-02 test used synthetic, non-production Firebase environment values. No live Google token was exchanged.

---

## 11. Remaining blockers

- **Backend QA BLOCKED:** token verification and first-login profile bootstrap are still unavailable. Cloud Functions requires Blaze; Cloud Run free tier requires a billing account; the localhost harness is non-native; service-account credential creation/approval is not authorized.
- **Runtime BLOCKED:** realQA/OAuth policy still fails closed; the staging runner retains production Web/Billing defaults and synthetic Firebase fallbacks.
- **APK/device BLOCKED:** no export/build/install/launch, no native Google Sign-In, no device login.
- The old conflicting OAuth client in another project remains untouched.
- The old debug SHA-1/SHA-256 remain registered in QA but are not used by the new `qa` build type.

---

## 12. Worktree and production state

- `android/app/build.gradle` is modified with the QA-only signing config.
- `BHUMI_QA_DEDICATED_SIGNER_OAUTH_FIX_REPORT.md` is new.
- Master checklist, gap/risk register, execution plan, and Build 106 SOT were updated.
- No Git commit, push, reset, clean, or stash occurred; HEAD is unchanged and nothing is staged.
- Production `android/app/google-services.json` and `.env.local` are unchanged.
- The dedicated QA keystore, properties, fingerprints, and SDK backup are outside the repository.
- No production Firebase resource was mutated.

---

## 13. Minimum Founder action

**None required for the signer or Android OAuth client.** The dedicated QA signer, Gradle configuration, Firebase SHA registration, and OAuth client verification are complete.

The next required decision is separate: authorize the backend QA approach for token verification and first-login bootstrap. APK/device work remains separately gated after that.

---

## 14. Final status

**QA SIGNER PASS - ANDROID OAUTH PASS - QA SDK PASS - BACKEND BLOCKED - RUNTIME BLOCKED**

- 44 requirements unchanged: **21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 VERIFIED COMPLETE**.
- RCV-25/28 BL, RCV-41 IP; RSK-22/23 open; 25 RSK / 21 DS preserved.
- No APK, native sign-in, device login, backend deployment, production change, or commit.

**STOP AFTER VERIFICATION.**
