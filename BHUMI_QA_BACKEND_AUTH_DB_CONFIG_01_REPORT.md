# QA-BACKEND-AUTH-DB-CONFIG-01 — local implementation report

Date: 22 October 2026. Authorized worktree: `C:\tmp\bhumi-build106-recovery`.
Branch: `hotfix/build110-indonesian-only`; initial and final HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`.

## Verdict and phase tracking

- [x] Verify expected branch/HEAD and 62 tracked modified / 106 untracked status entries / 0 staged; read AGENTS, RULES, existing preflight and three masters without repeating audit.
- [x] Capture baseline hashes and dirty diff; implement minimum centralized synthetic contract and actual-operation stop gates.
- [x] Execute pure fixtures/import-isolated mocks, installed lint and repository typecheck.
- [x] Update three masters, preserve ledger/risk rows and report remaining gates.

**LOCAL SYNTHETIC GUARD ACCEPTANCE ONLY. QA RUNTIME / EXPORT / NATIVE: BLOCKED.** This is the authorized fail-closed alternative, not a usable QA Firebase deployment. Both emulator and realQA operations remain disabled. A structured emulator fixture returns only `ELIGIBLE_FOR_FURTHER_VERIFICATION_ONLY`, with `runtimeAllowed: false`. RealQA is rejected unconditionally because no approved resource/evidence manifest exists. No syntax-based OAuth/credential verification is invented. The full requested real-resource configuration contract and runtime acceptance are deliberately NOT COMPLETE.

Current QA isolation is not Build108 ENL product/scope work, consistent with existing preflight classification; the eight historical Build108 documents were not applicable. No HD algorithm, production billing authority, rules, version, native configuration or dependency changed.

## Wired enforcement and scope

| Seam | Source | Enforcement |
|---|---|---|
| Central pure contract | `lib/config/qaConfig.mjs:3` | Explicit emulator selection, demo project equality across native/web/backend, synthetic app identifiers, exact `.qa` package, issuer/audience, disabled billing/OAuth/storage/Aura, four explicit localhost origins and matching emulator hosts. Parsed protocol/hostname/port/path/credentials/query/fragment checks; inherited sensitive configuration rejected except exact permitted matches. |
| Runtime selector | `lib/config/qaRuntime.ts:3` | Any defined NEXT_PUBLIC_QA_MODE/CANDIDATE or BHUMI_QA_MODE/CONFIG, including empty/false/production strings, blocks. Absent new selectors preserve existing production behavior. |
| Firebase Auth/Firestore/Functions | `lib/firebase/config.ts:17` | Stop before app lookup/initialization and service creation; regional Functions helper also checks. No QA app is created or reused. |
| Native/Web login | `lib/auth/authActions.ts:328` | Stop before platform, telemetry and native Google invocation. Initialization gate also prevents importing usable QA Auth/Firestore instances. |
| Bootstrap client | `lib/billing/canonicalAccessBootstrap.ts:26` | Stop before caches, token callback, fetch or profile callback. |
| Backend Admin | `services/billing-verifier/lib/firebaseAdmin.ts:31` | Stop before service-account handling, app lookup and SDK initialization. Production pin and shared named-app Auth/DB behavior retained. QA branch disabled rather than reusing production/default app. |
| Web bootstrap | `app/api/access/bootstrap-trial/route.ts:88` | Stop before authentication bypass, token verification or default Admin access; existing response handling returns failure. |
| Billing plugin | `lib/billing/googlePlayBilling.ts:72` | QA-only check before all five native billing methods, including initialize/query/purchase/restore/listener. Existing production orchestration retained. |
| Direct API resolution | `lib/config/hdApiUrl.ts:4`, `lib/config/astrologyApiUrl.ts:4`, `lib/config/dailyGuidanceApiUrl.ts:11` | Selected QA blocked before resolving live defaults; HD/astrology also blocked on module evaluation. Algorithms unchanged. |
| Aura | `app/api/kenali-diri/aura/route.ts:10` | Stop before request parsing/generation. |
| Candidate staging | `scripts/run-mobile-staging-build.mjs:249` | Pure guard imported and called first in main, before staging mkdir/copy/junction/spawn. Missing selector cannot silently choose production. Valid fixture also throws QA_STAGING_DISABLED. Runner was NOT executed. |

The old staging production defaults remain unreachable behind this unconditional staging stop; they are not certified safe or replaced with fake QA defaults. Existing production application behavior is unchanged when the new selectors are absent; the candidate staging utility is intentionally disabled. The contract is consumed by the staging entry, while runtime consumers use unconditional QA denial rather than treating fixture eligibility as permission.

## Tests and exact execution

| Command | Exit | Evidence |
|---|---:|---|
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` before edits | 0 | Baseline repository typecheck clean; no incremental artifact writes. |
| `node tests/unit/qa-backend-auth-db-config.test.mjs` initial | 0 | 66 assertions. |
| Same command after route/login checks | 0 | **69 assertions**, protected callback/fetch/plugin invocations **0**. |
| `npm run lint` | 0 | 0 errors, 421 warnings; unrelated warnings not repaired. No pre-edit lint comparison, so not claiming all warnings independently baseline-proven. |
| `node node_modules/typescript/bin/tsc --noEmit --incremental false` post-edit, twice | 0 | Repository-wide TSC PASS within existing tsconfig inclusion; services/tests excluded by that config. |
| `node C:\Users\shein\AppData\Local\Temp\opencode\qa-backend-auth-db-config-01-verify.mjs` corrected final validation | 0 | 2869 unchanged non-target hashes, 44 ledger rows/status totals and preserved historical risk rows. |

Fixtures cover missing configuration, mixed project/audience, production project/backend/Firestore, inherited production config/credential path/proxy, malformed/credential-bearing/non-loopback URLs, unknown/unverified OAuth, billing enablement denial, missing/false staging selectors and structured eligibility only. No SDK imports initialize a service: VM executes transpiled source with inert dependency substitutes. Actual Firebase initialization, bootstrap, Admin, URL resolver and route seams are exercised; login prefix and billing wrapper are extracted source checks, not full native-module integration. Staging ordering is static plus direct pure guard tests, not execution of the runner. No native/device/OAuth success inferred.

Integrity verifier initially exited 1 three times on baseline-text reconstruction differences (CRLF and omitted initial target text), after printing hash inventory; corrected reconstruction is accepted only when its SHA256 equals the originally captured baseline. These were verification-script failures, not runtime failures or discarded evidence. No product tests failed.

## Integrity and session-only diff

Baseline capture: `C:/Users/shein/AppData/Local/Temp/opencode/qa-backend-auth-db-config-01-baseline.json`; capture script beside it. Contains 2883 sorted Git-listed tracked/untracked non-ignored SHA256 entries, original eight target texts, status and existing binary diff. Manifest digest: `5b2e8fa1a574b72a9a2951d6d4d2b68a7f064b093d9e3cff129a1d003b92ba52`. Additional targets reconstructed solely for diff statistics and checked against their initial hashes. Prior edits remain preserved. Scope excludes ignored files, .git, node_modules and external/temp files; not evidence of transient-write absence.

| Existing file | Session additions/deletions |
|---|---:|
| BHUMI_MASTER_GAP_AND_RISK_REGISTER.md | +6/-0 |
| BHUMI_MASTER_PROJECT_CHECKLIST.md | +6/-0 |
| BHUMI_REMAINING_WORK_EXECUTION_PLAN.md | +6/-0 |
| app/api/access/bootstrap-trial/route.ts | +2/-0 |
| app/api/kenali-diri/aura/route.ts | +2/-0 |
| lib/auth/authActions.ts | +3/-0 |
| lib/billing/canonicalAccessBootstrap.ts | +2/-0 |
| lib/billing/googlePlayBilling.ts | +9/-1 |
| lib/config/astrologyApiUrl.ts | +4/-0 |
| lib/config/dailyGuidanceApiUrl.ts | +2/-0 |
| lib/config/hdApiUrl.ts | +4/-0 |
| lib/firebase/config.ts | +5/-0 |
| scripts/run-mobile-staging-build.mjs | +2/-0 |
| services/billing-verifier/lib/firebaseAdmin.ts | +3/-0 |

Existing-file total **+56/-1**; three new implementation/test files plus this report. **2869/2869 non-target initial files byte-identical**, no prior path deleted. Final expected status **68 tracked modified / 110 untracked entries / 0 staged**, delta **+6/+4/0**; final recheck follows report creation. All 106 initial untracked entries retained. No Git mutation/commit, external service/network/production read/write, console access, credential generation, export/APK/build/deploy or billing operation occurred.

## Limitations and next gate

No claim of total network containment: arbitrary unrelated scripts, transitive SDK imports, direct server HD proxy paths, messaging worker, weather and existing legacy QA flags are not comprehensively intercepted. Omitting all new selectors preserves production, so it must NEVER be used to run a QA candidate. The guarded candidate staging entry rejects even missing flags, preventing that bypass through this runner. No artifact can be produced through this gated runner; independently launching old artifacts or other build scripts is outside this containment. No fetch monkeypatch or after-request observer used.

OAuth remains disabled, not supported by an invented verified allowlist. Actual native/web Firebase metadata, verified OAuth client/resource match, exact package signer, backend isolated shared app, CORS, Auth provider, Firestore rules deployment, owner-positive/cross-owner/server-field rejection and profile absent/pending/read-error tests remain external/runtime dependencies. FCM and platform Aura manifest discrepancy remain unresolved; weather is not certified. Existing requirement statuses unchanged: **44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 VERIFIED COMPLETE**; original **25 RSK / 21 DS** rows preserved. RCV-25/28 BL and RCV-41 IP receive only scoped local guard evidence; RSK-23 and RSK-22 remain open.

**Exact next scope: QA-EXTERNAL-CONFIG-EVIDENCE-01**, not automatically executed. Founder first reviews this disabled-runtime implementation, then separately authorizes isolated Firebase/provider/native/web resources, verified OAuth allowlist and exact signer evidence, backend issuer/audience/shared QA app/database/CORS, and owner-rule deployment/acceptance. No credential generation implied. Alternatively separately authorize a narrow localhost-only emulator harness and rules tests before enabling any runtime path. Fresh latest-auth export, QA APK, install/device matrix and Play tests each remain separate gates.

**STOP AND WAIT FOR FOUNDER REVIEW**
