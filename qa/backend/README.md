# QA Local Bootstrap Backend

Local-only harness for the Build 110 first-login access bootstrap. It exists to verify the server-owned trial contract, real RS256 token verification, Firestore emulator behavior, idempotency, and per-user isolation without touching production Firebase.

## Security boundary

- Binds only to `127.0.0.1`.
- Requires `BHUMI_QA_BACKEND=1`.
- Separates the Auth project from the data project. `QA_BOOTSTRAP_AUTH_PROJECT_ID` is pinned to the exact QA project; `QA_BOOTSTRAP_FIRESTORE_PROJECT_ID` must be an isolated `demo-` project.
- Requires `QA_BOOTSTRAP_ALLOW_REAL_QA=1` before the QA Auth project is accepted.
- Requires a loopback `FIRESTORE_EMULATOR_HOST`; never connects to production Firestore.
- Rejects production project IDs, production issuers, and production audiences.
- Rejects `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `GOOGLE_APPLICATION_CREDENTIALS`.
- Rejects arbitrary JWKS URLs; only the Firebase secure-token JWKS URL, an inline public JWKS, or a public JWKS file is accepted.
- Verifies RS256 signatures with Node `crypto`, not a mocked `verifyIdToken`.
- Enforces `iss`, `aud`, `sub`, `exp`, `iat`, `nbf`, algorithm, key ID, and signature.
- Real-QA mode additionally requires a bounded `auth_time` and an Identity Toolkit revocation lookup using `QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY`.
- Revocation lookup checks `localId`, `disabled`, and `validSince` against the verified token; failures are closed with `401` or `503`.
- Derives the write target only from the verified token subject.

## Routes

| Method | Route | Behavior |
| --- | --- | --- |
| `GET` | `/healthz` | Local metadata only. No secrets. |
| `POST` | `/api/access/bootstrap-trial` | Production-equivalent trial-only contract. Does not create a client profile. |
| `POST` | `/api/qa/bootstrap-first-login` | QA-only combined flow: creates a minimal profile when absent, then provisions the canonical trial. |

The QA-only route is intentionally not production code. Production creates the minimal profile on the client; this route makes the local first-login acceptance test self-contained and must not be deployed.

## Configuration

| Variable | Required | Default |
| --- | --- | --- |
| `BHUMI_QA_BACKEND` | yes | must be `1` |
| `FIRESTORE_EMULATOR_HOST` | yes | loopback host and port |
| `QA_BOOTSTRAP_AUTH_PROJECT_ID` | no | `QA_BOOTSTRAP_PROJECT_ID` or `demo-bhumi-qa-bootstrap` |
| `QA_BOOTSTRAP_FIRESTORE_PROJECT_ID` | real QA | isolated `demo-` project; defaults to the Auth project in demo mode |
| `QA_BOOTSTRAP_ALLOW_REAL_QA` | real QA | must be `1` for `bhumi-amartya-qa` |
| `QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY` | real QA | Firebase web API key used only for `accounts:lookup` |
| `QA_BOOTSTRAP_IDENTITY_TOOLKIT_URL` | no | exact Identity Toolkit lookup URL |
| `QA_BOOTSTRAP_PROJECT_ID` | no | legacy demo project `demo-bhumi-qa-bootstrap` |
| `QA_BOOTSTRAP_ISSUER` | no | `https://securetoken.google.com/<auth-project>` |
| `QA_BOOTSTRAP_AUDIENCE` | no | `<auth-project>` |
| `QA_BOOTSTRAP_PORT` | no | `8443` with TLS, otherwise `8787` |
| `QA_BOOTSTRAP_TLS_CERT_FILE` | no | PEM certificate path |
| `QA_BOOTSTRAP_TLS_KEY_FILE` | no | PEM private-key path |
| `QA_BOOTSTRAP_ALLOWED_ORIGINS` | no | `https://localhost,http://localhost,capacitor://localhost` |
| `QA_BOOTSTRAP_JWKS_JSON` | no | inline public JWKS |
| `QA_BOOTSTRAP_JWKS_FILE` | no | path to public JWKS |
| `QA_BOOTSTRAP_JWKS_URL` | no | Firebase secure-token JWKS URL only |

## Run the isolated tests

Firebase CLI 15.18.0 requires Java 21 or newer.

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
npm run test:qa:backend-bootstrap
```

The runner starts the Firestore emulator on `127.0.0.1:8088` with `qa/firebase/firebase.json`, uses `demo-bhumi-qa-bootstrap`, and runs 53 tests across token verification, revocation, contract, configuration, and emulator integration.

## Run the local server

Start the emulator in one terminal:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
firebase emulators:start --config qa/firebase/firebase.json --project demo-bhumi-qa-bootstrap --only firestore
```

Start the harness in another terminal:

```powershell
$env:BHUMI_QA_BACKEND = "1"
$env:FIRESTORE_EMULATOR_HOST = "127.0.0.1:8088"
$env:QA_BOOTSTRAP_AUTH_PROJECT_ID = "bhumi-amartya-qa"
$env:QA_BOOTSTRAP_FIRESTORE_PROJECT_ID = "demo-bhumi-qa-bootstrap"
$env:QA_BOOTSTRAP_ALLOW_REAL_QA = "1"
$env:QA_BOOTSTRAP_IDENTITY_TOOLKIT_API_KEY = "<set out of band>"
node qa/backend/local-bootstrap-server.mjs
```

Use a real QA Firebase ID token only after an authorized QA sign-in. The default JWKS URL verifies Firebase-issued tokens. Do not log or persist tokens or the Identity Toolkit API key.

TLS is optional but required for a release-like local QA client that does not trust a debug user CA. Provide `QA_BOOTSTRAP_TLS_CERT_FILE` and `QA_BOOTSTRAP_TLS_KEY_FILE`; the default port becomes `8443`. The certificate and key must remain outside the repository.

For local test tokens, provide a public JWKS file generated by the test harness. Private test keys must remain ephemeral and must never be committed.

## Scope limits

- No production Firebase access.
- No service-account creation.
- No deployment.
- No real Google Sign-In or Billing.
- No APK build, install, or launch.
- No physical-device verification.
- No live QA token or Identity Toolkit call in the isolated tests; revocation is covered with synthetic responses.
- No claim that local HTTP success equals browser or device QA.
