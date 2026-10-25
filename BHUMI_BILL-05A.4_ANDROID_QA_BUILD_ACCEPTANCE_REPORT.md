# BILL-05A.4 Android QA Build Acceptance Report

Date: 2026-10-21
Verdict: **FOUNDER CONFIGURATION REQUIRED — STOPPED AT LOCAL QA GATE**

## Authority and scope

Authorized worktree: `C:\tmp\bhumi-build106-recovery`.
Branch: `hotfix/build110-indonesian-only`.
Initial HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.
Founder explicitly requires stopping when legitimate local QA configuration is absent. This takes precedence over downstream audit/test/build requests. Only blocked-state documentation continued after that gate. No product source or pipeline was edited or inspected after the stop.
Read: supplied AGENTS contract, BUILD_106_MASTER_SOT authority section, BILL-05A.3 report, PLATFORM-02C report, and risk register. Historical untracked reports were consulted as claims, not adopted as verified canonical evidence. Source diffs, full governance reconciliation and source audit remain deferred, not completed.

## Fresh local evidence

A repository glob found only `android/app/google-services.json`. A local Node JSON parser emitted package metadata only: the sole Android client package is `com.bhumiamartya.app`; matching `com.bhumiamartya.app.qa` client is false. Both `android/app/src/debug/google-services.json` and `android/app/src/qa/google-services.json` are absent. Requested report path was checked absent before creation.

No keys, project credentials or configuration values were printed. This narrow metadata check does not prove absence of secrets elsewhere, QA backend isolation, or validity of any remote project. No remote validation occurred.

Git porcelain confirms **61 modified tracked files, 88 untracked entries, 0 staged** initially. With `-uall`, those untracked entries expand to **132 files**; these counts are compatible, not evidence of drift. Branch/HEAD above were obtained independently through Node child_process because the first shell command returned only an abbreviated status display.

## Phase acceptance

| Phase / gate | Actual status |
| --- | --- |
| Local Android QA configuration | BLOCKED — matching legitimate client absent |
| Independent retained-page/layout module graph | NOT RUN — mandatory stop |
| Static/dynamic imports and cycles through AuthContext, userCommunicationService, CommunicationRepository, FeedbackRepository to adminRepository/founder broadcast | NOT VERIFIED; no absence claim |
| PLATFORM-02C source diffs | NOT REVIEWED in this stopped execution |
| Test-content/mock inspection | NOT RUN; birthday, inbox, support and login-switch coverage unverified |
| 45-assertion communication unit suite | NOT RUN fresh; historical claim is UNIT evidence only, never rules evidence |
| Root lint / typecheck | NOT RUN after gate; exit codes and counts unavailable |
| Lint comparison against 421 | UNKNOWN; no detailed baseline comparison performed |
| Full regression | NOT RUN; “clean nothing to commit” is not execution evidence |
| Static export | Historical report only; fresh NOT RUN |
| Firestore rules / Phase C emulator tests | NOT RUN |
| APK / AAB | NOT RUN |
| Android emulator / device | NOT RUN |
| Native plugin availability | NOT VERIFIED |
| Play / purchase testing | NOT AUTHORIZED |
| Release readiness | NOT ESTABLISHED |

PLATFORM-02C reports 66 HTML routes, 808 output files, export exit 0 and 45 passing unit assertions. These are historical, independently unverified claims in this task. Token scans cannot establish the complete module graph, absence of admin code or absence of secrets. The report's rules and isolation assurances are not accepted as fresh runtime evidence. No graph completeness, authorization correctness, behavioral preservation or production isolation PASS is asserted here.

## Founder setup checklist

1. Provide an explicitly authorized **separate Firebase QA project**, isolated Auth user pool, Firestore database, Storage and backend resources. Do not merely add a `.qa` client to production. Supply non-secret provenance identifying the intended QA resources and allowed endpoints.
2. Register Android package exactly `com.bhumiamartya.app.qa`. Supply legitimate client configuration at `android/app/src/debug/google-services.json`; preserve the production root file. Public Firebase client configuration is not a service-account credential, though its API keys still need appropriate restrictions.
3. Register SHA-1 and SHA-256 of the actual debug signing certificate. Fingerprints were NOT obtained: no certificate/tool search was performed after the gate, and user-home Android/Java directories are outside authorized access. Provide an existing debug certificate in the authorized repository/approved temporary area and an accessible existing inspection tool, or supply authenticated local fingerprint evidence. Do not supply or require a production/release keystore or release signing key for debug. Do not invent fingerprints or generate a replacement silently.
4. Provide the documented QA web-client mapping for the same QA project: Firebase API key, auth domain, project ID, storage bucket, messaging sender ID and app ID. Exact repository environment variable NAMES and mappings remain to be inspected before use; no secret values should appear in reports. Android JSON alone does not configure the web Firebase client.
5. Configure the appropriate QA authentication providers and OAuth clients, debug-certificate registration, and permitted web/native redirect origins. Confirm sign-in cannot fall back to production. No network authentication is authorized by this report.
6. Provide QA-only API/backends and documented environment-variable NAMES for auth verification, Firebase project selection, billing verification and external compute dependencies. Keep service-account/private keys server-side, never in public client variables or Android assets. Confirm missing QA endpoints fail closed rather than selecting production defaults.
7. Provide approved QA rules/index configuration, owner-isolation test requirements and synthetic identities. Require same-user positive access, cross-user rejection, birthday idempotency, inbox/support authorization and account-switch cleanup checks. Mocked unit tests cannot substitute for rules runtime checks.
8. For later authorized rules tests, identify an already-safe localhost emulator and synthetic project, with `FIRESTORE_EMULATOR_HOST` / `FIREBASE_AUTH_EMULATOR_HOST` as applicable and an explicit no-production fallback guard. No emulator discovery/startup or tests occurred here.
9. Obtain Founder permission to resume. First inspect governance/source diffs and actual TS-parser graph (including dynamic imports, re-exports, unresolved edges and cycles), then inspect tests before safe unit/lint execution. Only after successful QA gating may a separately authorized fresh export/debug APK and Android runtime acceptance proceed. Play testing remains separately unauthorized.

## Commands and evidence discipline

- Initial shell: `git branch --show-current; git rev-parse HEAD; git status --short; git diff --stat`. Tool returned abbreviated status only; no reliable individual exit codes or diff statistics were provided.
- Local Node metadata/Git command used `git branch --show-current`, `git rev-parse HEAD`, `git status --porcelain=v1 -uall`, filesystem presence checks and JSON package extraction. Completed without reported error; tool did not expose numeric exit code. Do not retroactively assign an exit code.
- Pre-edit Node check used `git status --porcelain=v1` and `git diff --numstat -- docs/tracking/RISK_REGISTER.md`: 61 tracked, 88 untracked entries, zero staged; risk-register diff empty. Completed without reported error; numeric exit code not exposed.
- Glob/read/edit/write tools are not test assertions. No tests executed; fresh assertion count **0**. No test, lint, build or emulator exit codes exist for this task.

## Changes, preservation and limitations

Only this new report and two appended evidence bullets in `docs/tracking/RISK_REGISTER.md` are authorized changes. Prior risk text is preserved; the RSK-23 append explicitly rejects the historical production/non-suffixed workaround as current authorization. RSK-22 is not closed on historical export claims.

Before: 61 modified tracked, 88 untracked entries (132 expanded files), staged 0. Verified after: **61 modified tracked, 89 untracked entries, staged 0**. The risk register is itself pre-existing **untracked**, confirmed by path-specific porcelain (exit 0); hence its edits do not increase tracked counts and its empty git diff is not preservation evidence. Exact task delta: risk register **+2/-0 lines** (177 to 179); new report **+74/-0 lines**. Final branch, HEAD, risk-register numstat and status commands each returned explicitly captured exit **0**; branch/HEAD unchanged. No pre-existing file was deleted, reverted or staged. No content-hash snapshot was taken before the gate, so byte-for-byte preservation of all unrelated files is not asserted.

Production reads/writes: **none**. Network authentication/console/deployment/purchases: **none**. Git mutations/commits/pushes: **none**. New extraction/build/emulator attempts: **none**. No external directories accessed.

Next task: Founder supplies legitimate isolated QA configuration and authorizes resumption of the deferred independent source/test audit. No acceptance or release readiness is granted.

**STOP AND WAIT FOR FOUNDER REVIEW**
