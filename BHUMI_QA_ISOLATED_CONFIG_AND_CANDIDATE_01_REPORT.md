# QA-ISOLATED-CONFIG-AND-CANDIDATE-01

Date: 23 October 2026. Worktree: `C:\tmp\bhumi-build106-recovery`.
Authorized branch: `hotfix/build110-indonesian-only`; initial HEAD `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.

## Verdict and actual phases

**BLOCKED overall. Checkpoint A PARTIAL; local guard tests PASS. B approved Spark but unconfigured/BLOCKED. C NOT RUN.**

- [x] Verify expected branch/HEAD and 68 modified / 111 untracked / 0 staged; read AGENTS, RULES, prior preflight/local/external reports, three masters and narrow consumers.
- [x] Capture baseline target texts in Read tool records, Git hash inventory and non-target manifest digest before source edits; preserve existing changes.
- [x] Apply minimum selector and billing direct-path fixes; extend existing installed TypeScript/VM/assert harness.
- [x] Run baseline and final repository TSC, lint and separate backend TSC; record baseline defect rather than claim full PASS.
- [x] Assess local tooling availability only; no Firebase invocation or account/project enumeration.
- [ ] A full acceptance: separate backend declaration/typecheck gate remains unresolved.
- [ ] B provisioning: no verified authenticated dedicated operator/account/tool or exact authorized project identity.
- [ ] C export/APK: not run because A+B have not passed.
- [x] Update existing three masters; preserve historical ledger/risk rows.

This is current QA isolation, not Build108 ENL implementation or a historical source restoration. Founder authorization already permits staged local source fixes and ONE separate Firebase QA Spark project; it does not supply authenticated capability or identify a target. No Git staging was requested/performed.

## Local changes and evidence

- `lib/config/qaRuntime.ts:3`: retain unconditional denial for any defined explicit QA mode/candidate/config, including empty/false/production. Add denial for active BHUMI_LOCAL_QA (`1`), global/split Firebase/Auth/Firestore/Functions emulator flags (`true`), emulator QA login and Founder pre-release QA (`true`), and nonempty server emulator hosts. Split flags cannot silently initialize production through guarded seams. Direct public env accesses retained for Next build-time substitution.
- `NEXT_PUBLIC_ENABLE_ADMIN_UI` alone is an exposure toggle, not a QA identity: do not disable legitimate non-QA production merely because it is true. Inactive optional flags do not select QA. Founder pre-release flag is explicitly a QA mode per `lib/auth/founderQaPolicy.ts:13`; its active value now denies protected operations, not account allowlist-based isolation.
- `lib/billing/googlePlayBilling.ts:419`: shared Android assertion now independently checks QA before platform/token/fetch/storage. Direct process/verify aliases therefore cannot bypass plugin guards. Additional first-statement checks at supplied-purchase recovery (:182), purchase orchestration (:209), restore orchestration (:224), automatic recovery (:368) precede auth reads, callbacks and promise/cooldown mutation. Production billing authority and existing plugin wrappers unchanged; no backend grant logic modified.
- `tests/unit/qa-backend-auth-db-config.test.mjs:65`: execute actual qaRuntime wiring and full transpiled Auth/Billing modules with inert imports, deny fetch and protected callbacks before module evaluation. 31 selector cases each test real guard, Firebase init denial, bootstrap, Google login and ten billing entry paths. Three mock-only non-QA cases preserve pending/product-mismatch behavior, including admin-only and inactive flags. Prior pure contract tests reject missing, inherited production, unknown destinations and malformed origins.

Explicit candidate runtime remains denied even when config is missing, inherited production or synthetic-valid. Staging entry remains unconditionally disabled, including missing selectors. No replacement of kill switches or fixture-based runtime activation. A browser built outside this runner with all identities omitted remains outside certified scope: no compiled browser/artifact acceptance, no universal network firewall claim. Server-only flags cannot be assumed visible in a browser. Unrelated direct proxies/import side effects, FCM/weather and older artifacts are not certified contained.

New denials use fixed `QA_RUNTIME_DISABLED`, no endpoint/token/credential content. No .env or credential file was read or fed into tests. VM process.env is an explicit fixture object; VM require never loads application dependencies, SDKs or networking modules. No live SDK service initialization. Existing auth telemetry test imports authActions and the billing lifecycle harness uses module interception; inspected, not launched uncontained. This session executes the bounded extended suite instead, not the historical 421-assertion auth or full billing matrix. No owner-rules/native/OAuth/runtime success inferred.

## Executed checks

| Command | Baseline | Final | Evidence |
|---|---:|---:|---|
| `node tests/unit/qa-backend-auth-db-config.test.mjs` | 0 | 0 | 69 baseline; intermediate 481; final **512 assertions**, zero protected callback/fetch/plugin invocations |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` | 0 | 0 | Repository-wide TSC PASS under existing inclusion, no incremental artifact |
| `node node_modules/typescript/bin/tsc -p services/billing-verifier/tsconfig.json --noEmit --incremental false` | 2 | 2 | FAIL: pre-existing TS7016 at qaRuntime.ts:1, qaConfig.mjs lacks declaration in separate backend compilation; unchanged diagnostic, not a new regression |
| `node node_modules/eslint/bin/eslint.js app components lib src` | 0 | 0 | Same installed command as package lint; **0 errors / 421 warnings** both runs |

No guard assertion failed. A is PARTIAL rather than full PASS because backend TSC is red and browser binding/resource acceptance is absent. No dependencies installed/fetched. No build/export runner executed. Backend TSC defect left explicit rather than broadening configuration or weakening strictness.

## B: authorization versus executable prerequisites

Available tool list has no dedicated Firebase provisioning tool. `Get-Command firebase` finds a CLI on PATH; it was NOT invoked. This proves neither authentication nor permissions nor QA-only scope. No login/browser launch, credentials inspection, project listing, production enumeration or external request occurred. Project creation count **0**; no guessed project ID or false resource-existence claim.

Minimum next operator information: identify the authorized QA provisioning operator/account context, supply exact intended unique independent project ID and permitted parent/ownership context, and provide a verified QA-scoped authenticated provisioning mechanism (or have that operator create the already-approved single Spark project and provide sanitized identity/config evidence). Do not send private keys/tokens in reports. Verify Spark/no billing-account linkage; no Blaze/paid resources authorized. This is NOT another request to approve Spark resources.

Then verify Google provider/consent/test-user policy, QA Web and Android `com.bhumiamartya.app.qa` registrations, generated default_web_client_id linkage, matching SDK project, exact chosen signing certificate SHA-1/SHA-256, Firestore identity/location/rules and issuer/audience/CORS/bootstrap origin. Exact intended signer remains UNKNOWN: historical fingerprints are not remeasured or asserted as next signer; no approved exact signer path supplied, no keystore access/generation.

Spark Auth/Firestore may support their free-tier services subject to quotas; they do not alone implement trusted server-owned trial bootstrap. Cloud Functions deployment requires Blaze and is prohibited under this authorization. Choose an existing isolated trusted backend only after availability, terms/cost and QA identity evidence; do not assume a new backend is free. Alternatively a bounded localhost emulator harness can verify rules/profile contracts but is not equivalent native Google runtime. A Blaze/paid backend would require a distinct cost decision, not silent escalation. Firestore client trial grants/rules are unchanged and must not be weakened.

## C and retained ledger

C **NOT RUN**: no fresh export, APK/AAB, signing, install, device login, Play transactions, deployment or release-readiness claim. Existing runtime/staging kill switches retained. Latest AUTH-NEW-02 source binding, artifact exclusions/signature/OAuth/parity remain RSK-22/23 prerequisites.

RCV-25/28 remain BL, RCV-41 IP with scoped local guard evidence; RCV-20/21/23 SP, RCV-22/24/27 BL, RCV-26/30/31 IV unchanged. **44 unique requirements = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete.** Original 25 RSK / 21 DS rows untouched, including DS-2C1/2C2/2C3 profile distinctions and device/billing risks. No new requirement or risk ID.

## Integrity and session diff

Baseline Git-listed hash output retained in tool record `tool_165161099001A7sIbHOXJvsgzd`. Separate ordered non-target manifest covers **2882 files**, excluding the six existing edit targets and new report. SHA256 of ordered paths plus Git blob hashes: `111D91C66377923412CF4DA023D9405401B8A6A5CE9C10EB4D6B484F11CE6C7B`. This is an aggregate over Git blob hashes, not per-file SHA256. Target originals captured by pre-edit Read results; Git baseline numstats retained in command output. Ignored files/.git/dependencies/external files and transient writes are outside this evidence.

Session-only source diff: qaRuntime **+13/-0**, googlePlayBilling **+5/-0**. Existing billing HEAD diff was +28/-5 before and +33/-5 after: historical dirty edits are not attributed here. Test **+42/-3** (66 to 105 lines); each master **+6/-0**. New report **+72/-0** is the sole new workspace path; total session **+150/-3**. No historical lines removed from masters.

Final read-only manifest comparison **PASS, exit 0**: all 2882 non-target ordered paths/blob hashes produce the identical digest above. Branch/HEAD unchanged; **68 tracked modified / 112 untracked / 0 staged**, preserving 111 initial untracked entries and adding only this report. One aggregate equality assertion executed; ledger counts above retained from unchanged tables, not a newly executed automated ledger validator.

Production reads/writes **0**; external provisioning/network calls **0**; credentials generated/read **0**; commits/staging/Git mutations **0**. No HD algorithm, production billing authority, native config, dependency, rules or version changes.

Exact next task: resolve the existing backend declaration/typecheck gate and provide the operator/project/provisioning information plus isolated bootstrap hosting decision above. Stop external access and any new-cost action until prerequisites are satisfied; do not ask for redundant Spark approval.

**STOP AND WAIT FOR FOUNDER REVIEW**
