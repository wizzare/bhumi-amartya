# BHUMI AMARTYA — REMAINING WORK EXECUTION PLAN

**Document ID:** PLAN-001  
**Authorized branch:** `hotfix/build110-indonesian-only`  
**Initial HEAD:** `e63f334cf0ac20cc076bc88e98e3e06808b024f3`  
**Date:** 22 October 2026  
**Status:** finite documentation recovery complete; product coverage partial; native/production NOT VERIFIED.

## A. Closed finite recovery pass, not a new recovery backlog

**HISTORICAL LEDGER NOT RECOVERABLE FROM AVAILABLE EVIDENCE.**

Actual recovery inventory: **44** independently scoped requirements, RCV-01..RCV-44. Historical **84 requirements / 22 domains** remains an unsubstantiated claim, not the denominator of product completion. Earliest observable combined claim in the bounded search is the pre-edit three-master snapshot (checklist line 80, risk line 102, plan line 10), with no established relative chronology or author. Exact documentation-scoped Git claim/path-history searches returned no commits; broad numeric history was not a ledger. PRM is a declared operational convention, not proof of original history. Temp inventory/hash records did not recover complete requirement rows. See checklist sections A–D for finite search limits and source crosswalk; no further history recovery is scheduled.

| Status | Count |
|---|---:|
| SYNTHETIC PASS — RUNTIME PENDING | 21 |
| IMPLEMENTED — NOT VERIFIED | 7 |
| BLOCKED | 7 |
| EVIDENCE MISSING | 8 |
| IN PROGRESS | 1 |
| VERIFIED COMPLETE | 0 |
| NOT STARTED | 0 |
| NOT APPLICABLE | 0 |
| TOTAL | 44 |

Old Item 1→RCV-21; 2→RCV-22; 3→RCV-23; duplicate Item 5→3→RCV-23 (excluded); 6→RCV-30 audit identity / RCV-24 export criteria. Status totals formerly summing to 100 are invalid. No 80 fabricated absent requirements. All 25 RSK rows (24 concrete IDs including aliases + 1 reserved) and 21 DS rows (12 OPEN, 5 PARTIAL, 2 DONE, 2 CLOSED) remain preserved in the risk register, with recovery mappings and uncertainty. Historical resolved labels are not new product verification.

## B. Completed preflight and exact next batch

**QA-ISOLATION-PREFLIGHT-01: PASS read-only inspection / BLOCKED runtime readiness.** [Report](BHUMI_QA_ISOLATION_PREFLIGHT_01_REPORT.md) records current config/source evidence; no runtime case below was executed. Original proposed five-case matrix remains acceptance backlog, not permission to run it. Historical coverage unknown does not block independently safe QA.

**Next exact batch: QA-BACKEND-AUTH-DB-CONFIG-01**, RCV-25/20/28/41, RSK-23. Separate Founder authorization must name narrow backend/config/harness files and any external resource actions. Accept QA Auth/backend/database project, issuer/audience, owner rules and pre-request destination denial first. Installed plugin uses default_web_client_id; Android OAuth identity/package/exact signer and dependency inclusion follow. Then authorize fresh AUTH-NEW-02 export (RCV-23/24/30/31), QA APK (RCV-21), and separately controlled new/existing QA-account device tests (RCV-22/26). No production users; billing disabled/not invoked; Play licensing remains later RCV-27. No credentials/service-account creation this sprint.

Reuse existing SDK, emulator configuration and scoped tests only after preventive guard review: current network observer is not a blocker, cleanup precedes helper guard, and product split flags can leave services remote (report section 5). No new library required. Aura API manifest label reconciliation and production FCM worker containment remain RCV-24/25/30 gaps; no silent source changes. All 44 requirement statuses/counts and 25 RSK/21 DS historical rows remain unchanged.

IDs: **RCV-25, RCV-28, RCV-41, RCV-26, RCV-23, RCV-20**; risks RSK-01/08/23 and DS-2C1/2C2/2C3. Objective: a finite readiness verdict separating local synthetic feasibility from native configuration blockers, not full auth/billing certification.

1. Obtain Founder authorization for exact preflight scope/files/commands. Confirm branch/HEAD/dirty baseline and preserve non-target paths. Inspect existing harness contracts before execution; do not assume safety from an old report.
2. Inventory configuration **names and redacted target classifications only**. Verify localhost Auth/Firestore/functions destinations and synthetic project identity; absent emulator variables, unknown destinations, inherited production defaults or missing network guards must fail closed. No service-account credentials for client-rule tests, no secret output or real accounts.
3. Produce a bounded five-case local readiness matrix, only if safe with already available tools: (a) missing emulator config denied; (b) production/unknown destination denied; (c) synthetic same-owner access allowed; (d) cross-owner/server-access-field mutation rejected; (e) synthetic profile absent vs pending vs read-error routing differentiated without overwrite or trial self-grant. Reuse existing tests when adequate; any code/test edits require explicit scope. No install/download/build. Stop if infrastructure or fail-closed protection is unavailable.
4. Record each case as NOT RUN/BLOCKED or executed result with exact exit/assertion count, synthetic identity boundary and input provenance. Failure is not permission to broaden scope. Do not label Google OAuth, native sign-in, real bootstrap deployment or Play billing PASS.
5. Update checklist and risk register for the referenced IDs: evidence, acceptance satisfied/remaining, scope and status. Stop for Founder review after this finite matrix.

Native prerequisite is separate: Founder selects isolated QA Firebase project, `.qa` Android client and verified signer SHA, Google provider/consent/test accounts, matching web OAuth and SDK, backend issuer/audience/project pin, Firestore/functions/rules, bootstrap origin/CORS, and fail-closed extras/purchases. `.qa` registration in production project is NOT isolation. `BHUMI_AUTH_NATIVE_QA_01_PREPARATION_REPORT.md:41-84` records OAuth hardcoding, backend production pin and exporter production defaults; config alone is not proven sufficient. No production fallback, non-suffixed workaround, or service-account key in APK/export.

## C. Subsequent finite batches — each requires separate authorization

| Priority / batch | Requirement IDs and risk acceptance | Exit evidence / gate |
|---|---|---|
| P0 local security contracts | RCV-01/09/10/15/16/20/28/41; RSK-01/02/03/06/08/16/18/19/20 | Approved synthetic/emulator owner-positive and cross-user rejection, idempotency/concurrency, fail-closed mutation and rollback; no deployed/production claim |
| P1 QA config readiness | RCV-25; RSK-23 | Founder-authorized narrow configuration/backend adaptation; project/package/provider/signer/issuer/database/origin evidence; production denial proven before native |
| P1 latest auth export | RCV-23/24/21/30; RSK-22/23 | Approved latest AUTH-NEW-02 input manifest, disposable export, exclusions, fresh full parity, then separately approved QA APK; old compile artifact not reused as auth proof |
| P1 native auth/bootstrap | RCV-22/23/26; DS-2C1/2C2/2C3 | Explicit install/runtime permission; Google new/returning/cancel/failure, pending/read-error/absent profile, setup completion/relogin, logout/account switch; no loop or data overwrite |
| P1 native billing | RCV-18/27 with RCV-09..17; RSK-04/14/05a/17/21 | Review NAT-01/NAT-04 findings first; approved Play license tester/track, purchase/restore/pending/cancel/expiry/refund/account hold/RTDN and UID isolation; no real transaction permission implied |
| P1 privacy/deletion | RCV-29/20/28; DS-P1 | Synthetic current collection/retention/policy inventory, owner isolation, deletion failure recovery; old June trace not current blanket closure |
| P2 UI/consumer decisions | RCV-31..40; mapped DS entries | Approved Indonesian-only provenance disposition vs historical locale demands; journaling/memory/astro/environment/notifications scoped acceptance; no Build108 scope expansion from this ledger |
| P2 production/release gates | RCV-04/08/12/28/42/43; RSK-02/10/18 | Explicit production read, write/deploy, version/artifact and upload permissions separately; deployed parity, scheduler, sanitized telemetry, device evidence and Founder sign-off |
| P3 maintenance | RCV-03/19/44; RSK-09/11/12/13 | Scoped hash-debt monitoring/admin residual evidence review; no silent deletion or fabricated closure |

Each sprint references IDs and updates **BHUMI_MASTER_PROJECT_CHECKLIST.md** plus **BHUMI_MASTER_GAP_AND_RISK_REGISTER.md** acceptance, evidence scope, status and remaining action. New IDs require exact sources and non-overlap rationale. Keep retired aliases and evidence gaps visible. No fourth master tracker. Priority is not implementation authorization.

## D. Evidence corrections carried forward

- Final Gradle compile: **234 actionable tasks = 110 executed + 124 up-to-date**, BUILD SUCCESSFUL; report total 10 is a typo; 120s timeout was earlier. Source: `BHUMI_BILL-05A.4H_ANDROID_APK_FINAL_ACCEPTANCE_REPORT.md:13`.
- Complete hash parity historical PASS: **808 files / 66 HTML / 9213286 bytes**, missing/unexpected/changed 0, not filtered **202** (`BHUMI_ANDROID_APK_01_ASSET_PARITY_REPORT.md:45-56,80`). COMPILE-ONLY, not runtime/release.
- APK binds old PLATFORM-02C output, **does not contain AUTH-NEW-02 source changes** (`BHUMI_AUTH_NATIVE_QA_01_PREPARATION_REPORT.md:25-35`). Next export requires latest approved inputs and new parity.
- AUTH-NEW-02 historical 384 main/421 combined assertions, own-suite table 11, not old master 14; none rerun. Timestamp fallback uncertainty and `/setup` read-error routing remain explicit discrepancies (`BHUMI_AUTH_NATIVE_QA_01_PREPARATION_REPORT.md:15-21`).
- HD-06A is PARTIAL / RELEASE GATES OPEN (`docs/tracking/SPRINT_REGISTER.md:29`). DS-N1 is remote notifications, not billing. 107/5.0.7 is not a newly verified universal production baseline; no version bump here. Old build-blocked text does not erase accepted historical compile-only artifact.
- RCV-17 dual display follows recorded BILL-04 decision (`docs/tracking/RISK_REGISTER.md:75-81`); Aura WEB_ONLY and Weather-AQI SHARED follow PLATFORM-01:19-20. Legacy locale demand vs Indonesian-only remains provenance/disposition gap RCV-32, not authorization to re-enable languages.

## E. Session verification and operational limits

Only the existing three master documents edited; no source/test/config changes, build/install, technical audit/test execution, commit/stage/push/deploy, production/network reads or writes. Application tests/lint/typecheck NOT RUN, exit N/A by documentation-only directive; historical application counts are not session PASS.

Baseline captured after initial reads and Git verification in approved temp `finite-ledger-baseline.json`: all Git tracked/untracked non-ignored file paths except three targets, **2879 SHA256 hashes**, plus original target text for before/after diff. Scope excludes `.git`, ignored artifacts and external locations; no claim of no-mutation before baseline or absence of transient changes. Before/after equality establishes final path/byte preservation only in that scope. Initial 62 tracked modified / 105 untracked status entries / 0 staged; status entries differ from recursive file counts. Original target text is the diff baseline because targets are untracked, not Git HEAD.

Read-only Python assertions validate row count, unique IDs, required fields/source references, status totals, legacy risk-row preservation, all risk mappings, cross-document counts/aliases, Git state and non-target hashes; exact executed count/exit and per-file diff statistics are reported with the final response. No additional technical acceptance implied.

**Current preflight session:** only the requested report plus three masters changed; source/config untouched. Read-only stdlib documentation/hash assertions replace application lint/typecheck (not run, exit N/A). Initial Git 62/105/0; report adds one untracked entry. Exact assertion totals, exit, before/after 2879 non-target hashes and file-level session diff are recorded in the preflight report; earlier section E is the prior finite-recovery session record, not current runtime evidence.

**Next exact task: Founder review and separately authorize QA-BACKEND-AUTH-DB-CONFIG-01; no further historical recovery batch, export/build or external action implied.**

## QA-BACKEND-AUTH-DB-CONFIG-01 — completed local scope and next gate

[Implementation report](BHUMI_QA_BACKEND_AUTH_DB_CONFIG_01_REPORT.md) supersedes earlier next-batch proposals: minimum centralized synthetic contract and actual-seam QA stop gates implemented and locally tested. Both emulator and realQA runtime remain disabled; structured fixture eligibility is only permission to seek further verification, never runtime PASS. No export, SDK service initialization, external resource operation or production action occurred. Counts remain **44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP**, 0 VERIFIED COMPLETE; original 25 RSK/21 DS preserved.

Next exact scope: **QA-EXTERNAL-CONFIG-EVIDENCE-01** (RCV-25/28/41, RSK-23), Founder review first, then separately authorize isolated project/provider/Web/native registration, verified OAuth allowlist and exact signer, backend issuer/audience/shared app/database/CORS and deployed owner-rule evidence. No credentials generated here. A later narrow emulator harness may enable only approved localhost operations after owner-positive/cross-owner/server-field tests; current stop gates must not be removed merely because configuration parses. Then separately gate latest-source export, QA APK and native account matrix. RSK-22 export, RCV-30 Aura exclusion and RCV-31 remote weather remain unresolved; billing/Play remains later RCV-27. No automatic execution of these next steps.

## QA-EXTERNAL-CONFIG-EVIDENCE-01 — completed review / superseding next scope

[Evidence report](BHUMI_QA_EXTERNAL_CONFIG_EVIDENCE_01_REPORT.md): **READY FOR FOUNDER QA RESOURCE APPROVAL, NOT RUNTIME READY**. Approve isolated project/provider/consent/Web/native identity and exact signer, then backend/database/rules/issuer/audience/CORS/regions plus security and cost boundary. Existing resources are externally UNKNOWN; creation may be approved, not presumed. Historical certificate fingerprints are not exact future signer proof. Spark eligibility/quotas are conditional; Functions deployment requires Blaze billing approval if selected; no free backend is verified.

ONE future separately authorized **QA-ISOLATED-CONFIG-AND-CANDIDATE-01** batch supersedes earlier fragmented proposals: exact approved scope, configure QA backend/native/Web, resolve selector/browser-build and legacy bypass activation limits, replace unconditional runtime/staging stops only after verified QA config AND preventive guard acceptance, including direct billing verification/reconcile denial identified by the 23 October retry (report sections 3/7), then explicitly authorized fresh AUTH-NEW-02 export and QA APK. Internal gates verify isolated issuer/audience/database, owner rules/profile failures, exclusions/destination denial, actual signature/default_web_client_id/config and full asset parity BEFORE install. Device/login requires another explicit approval; Play/billing stays disabled and separately gated. Lighter alternative: retained stops plus narrow localhost rules/profile harness, not native OAuth proof.

RCV-20/21/23 SP, RCV-22/24/25/27/28 BL, RCV-26/30/31 IV, RCV-41 IP; RSK-22/23 open. **44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP**; 0 VERIFIED COMPLETE; 25 RSK / 21 DS preserved. This session changes documentation only; no application tests/lint/typecheck, runtime, external calls or build. Exact preservation/assertions/session diff in report.

## QA-ISOLATED-CONFIG-AND-CANDIDATE-01 — authorized execution / stop

[Current report](BHUMI_QA_ISOLATED_CONFIG_AND_CANDIDATE_01_REPORT.md): local selector/billing fixes and 512-assertion regression completed (exit 0). A PARTIAL because separate backend TSC retains baseline TS7016 (exit 2); repository TSC/lint exit 0. B explicitly approved for ONE independent Firebase Spark QA project, not executable yet: dedicated authenticated tooling/account scope and exact target not verified. C export/APK NOT RUN; runtime/export kill switches remain.

Next: resolve backend declaration check, identify authorized provisioning operator and exact QA project identity (no guessed ID, production enumeration, login or credentials fallback), then verify provider/Web/Android OAuth, exact signer, rules, issuer/audience/database and trusted isolated bootstrap backend. Spark Auth/Firestore does not provide the server-owned trial bootstrap by itself. Cloud Functions requires separately approved Blaze/cost decision; an existing free backend needs availability/terms evidence, localhost emulator is only bounded non-native alternative. No new cost/resource approval is inferred. Preserve RCV-25/28 BL, RCV-41 IP, RSK-22/23 open and 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 25 RSK / 21 DS unchanged. Stop external access pending these prerequisites.

**STOP AND WAIT FOR FOUNDER REVIEW**

## Final Git/GitHub Closeout Plan — approval-gated preparation (2026-10-24)

### Verified inventory and release baseline

- Branch: `hotfix/build110-indonesian-only`; HEAD: `e63f334cf0ac20cc076bc88e98e3e06808b024f3`; upstream: `origin/hotfix/build110-indonesian-only`; remote: `https://github.com/wizzare/bhumi-amartya.git`.
- Initial audit: **72 tracked modified files**, **130 collapsed untracked status entries**; recursive `git ls-files --others --exclude-standard` currently reports **216 untracked paths** because several entries are directories/artifact trees. **0 staged**. Do not silently substitute one count for the other.
- Founder Play baseline: **versionCode 115 / versionName 5.0.15**. `android/app/build.gradle:10-11` is an **exact match**. Highest-ever Play code across internal/closed/open/production remains UNKNOWN; 116 is not assumed safe. No version bump now.

### Untracked classification and staging policy

- **Preserve untracked / ignore only after review:** `qa-artifacts/**` screenshots/JSON, generated reports-qualitygate outputs, APK/build/export/output trees, logs, temporary staging snapshots, local env/config files, Firebase/SDK credential material, keystores/certificates/private keys, and any sensitive local report containing secrets. Preserve by default; never delete, clean, reset, stash or broad-add. Existing `.gitignore` covers common `.env*`, `*.apk`, signing files, logs, `out/`, `release/`, `capacitor-www/`, `.vercel/`, service-account/admin SDK patterns; confirm ignored status before any future staging.
- **Canonical documentation/test reports for candidate staging after provenance review:** the explicitly named Founder-requested four documents plus relevant canonical `BHUMI_*.md` reports, `docs/**` governance, and report-linked QA harness documentation. Do not stage every untracked Markdown file automatically; first reconcile duplicate/historical/draft status and secret scan.
- **Product/test code candidates:** `app/test-3d-poc/**`, components/lib/config/qa code, `qa/backend/**`, `qa/firebase/**`, `qa/vercel/**`, scripts, services and tests. Stage only files tied to the approved change scope after dependency and secret review; unrelated product changes remain preserved unstaged.
- **Mandatory pre-stage security gate:** `git diff --check`; inspect `git diff --name-only`; enumerate candidate paths with `git check-ignore -v`; scan staged candidates for secret filenames/content without printing values; explicitly exclude `.env*`, `google-services.json`, keystores, certificates/private keys, service-account/admin SDK JSON, APK/AAB, `out/`, `release/`, `node_modules/`, screenshots and logs. Current evidence does not claim every untracked path is safe to stage.

### Proposed commit grouping (after Founder approval only)

1. Documentation/governance: the four requested baseline updates plus only provenance-reviewed canonical reports/registers, message `docs: record founder play baseline and closeout plan`.
2. QA/backend/test implementation: only the approved coherent QA or test scope, message matching existing `feat(...)`, `fix(...)`, or `test(...)` conventions.
3. Product source changes: separately reviewed, tested, and explicitly authorized; do not mix with governance. If policy requires one atomic commit, use one reviewed aggregate with the same scoped subject, not an indiscriminate `git add -A`.

### Exact eight-step execution sequence — do not run now

1. Obtain explicit Founder approval naming the commit scope and permitted untracked paths; re-capture branch, HEAD, status, diff and inventory.
2. Classify every candidate path and confirm provenance; preserve/review ignored and sensitive paths without deleting anything.
3. Run secret/build-artifact exclusion checks and `git diff --check`; verify only intended files are candidates.
4. Stage explicit path lists only; inspect `git status`, `git diff --cached --stat`, and `git diff --cached --name-only`.
5. Run required lint/typecheck/tests for the approved scope; record exact exits/assertions and rerun `git diff --check`.
6. Founder reviews staged diff, security exclusions, commit grouping and Play-history evidence; approve commit explicitly.
7. Commit only approved paths; verify commit, status, branch and upstream. Do not amend or reset.
8. After separate explicit push approval, push `hotfix/build110-indonesian-only` to `origin`, verify remote status/commit, and report URL; no upload/publish/release action is implied.

**Current closeout state: PLAN ONLY — no staging, commit, push, upload, publish, reset, clean, stash, force-push or rebase performed.**

**STOP AND WAIT FOR FOUNDER REVIEW**


---
Quality Gate Validation (run: `npm run quality:gate`)
Result: see reports-qualitygate/BHUMI_QUALITY_GATE_REPORT.md
Linked requirement IDs: RCV-21 .. RCV-28 (44-item ledger)
Preserved: 25 RSK rows, 21 DS rows, 44-item ledger.
---\n
---
Phase A — QA-ISOLATED-CONFIG-AND-CANDIDATE-01
Result: see BHUMI_QA_ISOLATED_CONFIG_AND_CANDIDATE_01_PHASE_A_REPORT.md
Linked requirement IDs: RCV-21 .. RCV-28 (44-item ledger)
Preserved: 25 RSK rows, 21 DS rows, 44-item ledger.
---\n
---
Phase B — QA-ISOLATED-CONFIG-AND-CANDIDATE-01 (FIREBASE SPARK EXECUTION)
Result: see BHUMI_QA_PHASE_B_FIREBASE_SPARK_EXECUTION_REPORT.md
Executed: QA project `bhumi-amartya-qa` (Spark, no billing), Firestore `(default)` asia-southeast2 with deny-all rules release, Web/Android app registration, Android `.qa` SHA-1/SHA-256 from actual local debug signer, secure QA SDK configs outside repo.
Blocked: Google Auth provider API requires billing (`BILLING_NOT_ENABLED`; Blaze prohibited) → Founder Console enablement is the single next action; OAuth/`default_web_client_id` and QA backend bootstrap/token verification remain blocked; APK/export/device not authorized.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved.
---
---
QA-GOOGLE-AUTH-VERIFY-01 (2026-10-22)
Result: see BHUMI_QA_GOOGLE_AUTH_VERIFY_01_REPORT.md
Done: Google provider ENABLED; domain/OAuth Web client verification; QA project/package/SHA match; Spark $0; Firestore deny-all; QA guard 512 assertions PASS.
Next sequence: (1) Founder re-adds SHA-1 via Firebase Console to materialize the Android OAuth client; (2) authorized source change for QA Web client ID + realQA policy; (3) backend decision (local harness vs approved paid backend); (4) only then export/APK/device login.
Blocked: Android OAuth client absent; native hardcoded production client; backend bootstrap/token verification; no APK/export/device authorized.
---
---
QA-ANDROID-OAUTH-AND-AUTH-SOURCE-FIX-01 (2026-10-23)
Result: see BHUMI_QA_ANDROID_OAUTH_AND_AUTH_SOURCE_FIX_01_REPORT.md
Done: production Web client literal removed from the native QA path; new `lib/auth/googleWebClientId.ts` resolver validates `NEXT_PUBLIC_QA_MODE=realQA`, QA project `bhumi-amartya-qa`, and QA type 3 client ID; missing/mismatched/production client fails closed; production behavior preserved. New resolver test 21 assertions PASS; QA guard 512 PASS; AUTH-NEW-02 14 PASS; TSC exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED.
Blocked: Android OAuth client (type 1) absent; no public API for standard Google Sign-In OAuth clients; Console action required (firebase-tools#2470). QA backend bootstrap/token verification BLOCKED; realQA/OAuth policy still fail-closed; runtime/export/APK/device remain blocked.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.
Next: Founder re-adds SHA-1 in Firebase Console or creates the Android OAuth client in Google Auth Platform; agent refreshes QA SDK and verifies type 1 + 3. Then backend decision; no APK/device yet.
---
---
QA-DEDICATED-SIGNER-OAUTH-FIX-01 (2026-10-23)
Result: see BHUMI_QA_DEDICATED_SIGNER_OAUTH_FIX_REPORT.md
Done: dedicated QA keystore outside repo; SHA-1/SHA-256 derived; uniqueness verified; QA-only Gradle `qa` signing config; Firebase QA SHA registration; QA SDK refreshed to types 1,3; Android OAuth client verified; resolver actual-QA-client check PASS; 21/512/14 tests PASS; TSC 0; Quality Gate dev PASS/release BLOCKED; signingReport BUILD SUCCESSFUL.
Blocked: backend token verification/first-login bootstrap; realQA runtime; APK/device/native sign-in. Spark/Billing-disabled/Firestore deny-all preserved.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.
Next: separate Founder decision on backend QA approach; no signer/OAuth action required. No APK/device yet.
---
---
QA-BACKEND-BOOTSTRAP-LOCAL-01 (2026-10-23)
Result: see BHUMI_QA_BACKEND_BOOTSTRAP_LOCAL_01_REPORT.md
Done: isolated local harness under `qa/backend/`; real RS256/JWKS verification; canonical 7-day grant; first-login profile creation; idempotency; higher-entitlement preservation; malformed-state fail-closed; cross-user isolation; loopback-only fail-closed config; production project/credential rejection. Tests 43/43 PASS exit 0; non-emulator subset 31/31 PASS; lint 421 warnings / 0 errors; TSC exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
Blocked: real QA ID token/revocation; Vercel QA backend; browser/device proof; APK/export/device. Local HTTP PASS is not device QA; Admin SDK tests bypass Firestore rules.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.
Next: Founder decision on Option A local harness vs Option B isolated Vercel QA backend; only then authorized deployment/device QA. No APK/device yet.
---
QA-VERCEL-BACKEND-CANDIDATE-02 (2026-10-23)
Result: see BHUMI_QA_VERCEL_BACKEND_CANDIDATE_02_REPORT.md
Done: `/api/healthz` routing fix with actual-entrypoint test; `@bhumi/qa-backend` local package with `install-links=true`; clean-room `npm ci` boundary check; lockfile; Candidate 02 report and README update. Candidate 25/25 PASS exit 0; non-emulator 17/17 PASS; clean-room 2/2 PASS; node --check 17/17; TSC 0; lint 421 warnings / 0 errors; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
Blocked: GCP WIF pool/provider, QA service account/IAM; Vercel QA project/Pro/protection/custom domain; actual Vercel preview build with outside-root source enabled; live OIDC/WIF and Firebase revocation; Android/device QA. No deploy/cloud/paid-plan/APK/Billing/production change/commit.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.
Next: ONE Founder action after review - approve `QA-VERCEL-BACKEND-DEPLOYMENT-01` for isolated QA cloud-resource creation, preview build, deployment, and live verification. Stop before Vercel deployment. No APK/device yet.
---
QA-VERCEL-BACKEND-DEPLOYMENT-01 (2026-10-23)
Result: see BHUMI_QA_VERCEL_BACKEND_DEPLOYMENT_01_REPORT.md
Done: read-only Vercel plan/team/project inspection; actual plan Hobby, one OWNER, 15 projects, no QA project, contract 0, usage 404; selected isolated `bhumi-qa-bootstrap`/`qa/vercel`; prepared custom domain/protection/auth design; GCP QA project/billing/Firestore/WIF/SA/APIs checked; minimum IAM corrected to `roles/iam.workloadIdentityUser` plus narrow custom runtime role; exact WIF commands/env/docs prepared.
Verified: QA billing disabled; Firestore `(default)`/`asia-southeast2`; WIF/SA/APIs absent; Rules API 403; local deny-all intact. Tests: 25/25 candidate PASS exit 0; 17/17 non-emulator PASS; clean-room npm ci exit 0 + 2/2 PASS; node --check 17/17; TSC 0; lint 421 warnings / 0 errors; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
Cost: Hobby $0 but non-commercial; Pro $20/month plus tax, includes $20/month usage credit; one owner, no extra seat; usage beyond credit unknown. No purchase.
Blocked: Pro plan, QA Vercel project/domain/protection, WIF APIs/pool/provider, SA/IAM, actual Vercel build/outside-root, live OIDC/WIF and Firebase revocation, Rules readback, custom-domain reachability, Android/device QA, verified usage cost. Current approval does not authorize deployment.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS preserved; RSK-22/23 open.
Next: ONE Founder activation decision under a separate task (recommended `QA-VERCEL-BACKEND-ACTIVATION-01`); no APK/device/Billing. No deploy/cloud/paid-plan/production change/commit.
---
QA-FREE-BACKEND-SELECTION-01 (2026-10-23)
Decision: Vercel activation is superseded. Select the existing local `qa/backend` harness as the only demonstrated `$0` route for real Android Google Sign-In. Reuse `bhumi-amartya-qa` Spark, QA OAuth/signer, external QA SDK config, 43/43 local harness, AUTH-NEW-02 resolver, and existing Android toolchain. No Vercel Pro, GCP WIF, Netlify/Cloudflare, paid resource, production change, APK, or device action.
Blockers: QA runtime/Firebase guards fail closed; `qaConfig` rejects `realQA`; staging always throws and hardcodes production/synthetic Firebase plus production Vercel URLs; backend is demo-only/no revocation; native defaults are production; QA SDK is outside repo; no HTTPS/trust/adb reverse; no device.
Minimum scope: fail-closed realQA allowance; exact QA token project + emulator writes + revocation via QA Identity Toolkit; local HTTPS/TLS + debug trust + adb reverse; QA SDK/env/package and non-production HD/astrology routing.
Outcome: real Android login is NOT testable today; after authorized QA APK it is testable for real QA Auth + emulator bootstrap. Real cloud Firestore/rules/backend/device remain unverified. Cost `$0/month`.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS; RSK-22/23 open.
Next: ONE authorization `QA-LOCAL-ANDROID-SIGNIN-01`; documentation only now, STOP before APK/deploy/device.
---
QA-LOCAL-ANDROID-SIGNIN-01 PHASE A (2026-10-24)
Result: see BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_A_REPORT.md
Done: fail-closed realQA config/runtime; exact QA project/package; QA Auth + isolated demo Firestore single-app selection; QA staging gate/local origins; QA billing disablement; backend auth/data split + strict auth_time + Identity Toolkit revocation + optional HTTPS; conditional dedicated QA signing and debug-only cleartext/user-CA trust. QA unit guard 530 assertions PASS exit 0; backend 53/53 PASS exit 0; TSC exit 0; lint 421 warnings / 0 errors exit 0; Quality Gate DEVELOPMENT PASS / RELEASE BLOCKED exit 0.
Blocked: external QA google-services not placed; no local TLS cert/key; no real QA token/Google Sign-In/live revocation/staging build/APK/install/adb reverse/device/browser acceptance. No production/cloud/deploy/paid/commit.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS; RSK-22/23 open.
Next: separate Founder-authorized Phase B execution; STOP before APK/device/deploy.
---
QA-LOCAL-ANDROID-SIGNIN-01 PHASE B REMEDIATION (2026-10-24)
Result: see BHUMI_QA_LOCAL_ANDROID_SIGNIN_01_PHASE_B_REPORT.md
Verdict: PHASE B PASS — ISOLATION ACCEPTANCE RESOLVED, SIGNED QA APK BUILT.
Artifact: `C:\Users\shein\AppData\Local\Temp\opencode\mobile-staging-1792803200489\android\app\build\outputs\apk\qa\app-qa.apk`; SHA-256 `99F08D79F3DD023875D243F9190FD5DE1394A8D6943A03F068665D1C08E1D448`; 7,769,171 bytes. assembleQa/apksigner/aapt2 exit 0; QA package com.bhumiamartya.app.qa, code 115, name 5.0.15-qa, dedicated QA signer (RSA 4096, SHA-256 `e24c6fdc...`). Full identity and evidence in Phase B report.
Compiled module proof: `phaseb-compiled-proof.mjs` PASS, 36 checks exit 0 (0 native calls, 0 network). Compiled qaRuntime validated, loopback endpoints enforced, local bootstrap provisions trial, billing rejects all calls with QA_BILLING_DISABLED. Asset parity: 808/808 output->staged and output->APK entries, 0 mismatches (`phaseb-parity.mjs`). Previous APK at `mobile-staging-1792797759370` preserved as historical evidence.
Parent gates: QA guard 538, Google client 21, TLS 8, backend JDK21 53/53 all exit 0; AUTH-NEW-02 14 PASS via initTestEnv (loaded .env.local). TSC exit 0; lint 421 warnings / 0 errors exit 0; quality gate exit 0 DEVELOPMENT PASS / RELEASE BLOCKED.
No cloud/production reads or writes; no device/ADB/install/launch/login/billing/deploy/commits. Authorized baseline: 72 tracked modified / 130 untracked, preserve all. Mandatory final Git closeout remains approval-gated; no stage/commit/push or artifact/secret staging.
Statuses unchanged: RCV-25/28 BL, RCV-41 IP; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; 25 RSK / 21 DS; RSK-22/23 open.
Next: ONE Founder review of Phase B remediation pass and device authorization. STOP BEFORE DEVICE TESTING / STOP AND WAIT FOR FOUNDER REVIEW.
---
AUTOMATED EMULATOR ACCEPTANCE SMOKE TEST (2026-10-24)
Result: see BHUMI_ANDROID_AUTOMATED_ACCEPTANCE_REPORT.md
Verdict: AUTOMATED EMULATOR SMOKE TEST: PASS.
Execution: Headless Android Emulator `Pixel_8` (API 34+, system image `android-37.0` x86_64, 4096MB RAM); cold start in 5.6s (`Status: ok`), `dumpsys activity top` confirmed `com.bhumiamartya.app.qa/com.bhumiamartya.app.MainActivity` resumed and focused; window focused; `CapacitorWebView` element attached.
Stability: 0 fatal exceptions, 0 application ANRs.
Network isolation: 0 requests to production Firebase (`bhumiamartya-fe85c`), production Vercel endpoints, or production billing verifiers. Clean post-test uninstall and emulator teardown.
Release Gate: Strictly remains RELEASE BLOCKED.
Minimum remaining release blockers:
1. Google Play Console all-track history read-only verification (highest-ever uploaded versionCode remains UNKNOWN; Founder baseline 115 / 5.0.15; 116 not safe without full track verification).
2. End-to-end interactive Google OAuth sign-in and live cloud Firestore rules remain unverified in this automated smoke test.
3. Mandatory Git/GitHub closeout remains pending explicit Founder authorization before any commit or push.
Preserved: 25 RSK / 21 DS; 44 = 21 SP + 7 IV + 7 BL + 8 EM + 1 IP; 0 complete; RCV-25/28 BL, RCV-41 IP.
Next: Founder review of automated smoke test report and decision on Play Console read-only export / release closeout. STOP AND WAIT FOR FOUNDER REVIEW.
---
FINAL RELEASE EVIDENCE & GIT PREFLIGHT (2026-10-24)
Result: see BHUMI_FINAL_RELEASE_AND_GIT_PREFLIGHT_REPORT.md
Verdict: PREFLIGHT COMPLETE — READY FOR FOUNDER APPROVAL (DO NOT COMMIT/PUSH YET).
Release Gate: Strictly remains RELEASE BLOCKED.
Google Play Console: NOT VERIFIED (highest-ever versionCode across tracks UNKNOWN; confirmed Founder baseline 115 / 5.0.15; 116 not safe without full track verification).
Git Preflight: Target origin hotfix/build110-indonesian-only (tracking remote); exactly 72 tracked modified and 132 untracked entries inventoried; zero staged; zero commits; all secrets, private keystores, TLS keys, and build artifacts verified external or git-ignored.
Proposed closeout: 4 logical commits (core product fixes, QA tooling & tests, restored platform modules, governance documentation & trackers) + push.
Next: ONE Founder review of final preflight report and authorization for 4-commit Git closeout. STOP BEFORE GIT MUTATIONS AND RELEASE ACTIONS.

---

## HUMANIZED LANGUAGE & NATURAL CONTENT REVIEW (2026-10-24)

**Task:** Integrated into final review → QA build → phone test → comprehensive report workflow per Founder directive. Not a separate language sprint.

**Scope:** All user-facing copy across Dashboard/Home, Astrology, Human Design, Transit, Daily/Weekly Guidance, Onboarding, Auth, Billing/Premium, Settings, Library, Daily Reminders, Empty/Loading/Error states.

**Approach:** Fix at source (templates, prompts, static dictionaries, fallback messages) — not merely replacing visible strings. Removed repeated AI-sounding patterns at their source.

**Files Modified:**
- `lib/dailyGuidance/normalizeUserFacingGuidance.ts` — extended blacklist (16 new patterns)
- `lib/prompts/dailyGuidancePrompt.ts` — added `humanVoiceRule`, extended `genericFilterRule`
- `lib/weeklyGuidance/weeklyGuidanceEngine.ts` — rewrote templated skeletons
- `lib/notifications/notificationPolicy.ts` — rewrote all 4 categories; updated test assertions
- `src/locales/id-ID/translation.json` — ~40 string rewrites
- `lib/astrology/personalizedTransitNarrative.ts` — fixed 5 cliché sites
- `lib/orchestrators/localDailyGuidanceFallback.ts` — fixed 4 template lines

**Test Results:** All regression suites PASS (157 + 63 + 10 + 14 + 22 assertions); TypeScript 0 errors; ESLint 0 errors (421 pre-existing warnings); Quality Gate DEV PASS / RELEASE BLOCKED.

**Humanized Content Acceptance:** PASS (see BHUMI_MASTER_PROJECT_CHECKLIST.md for full before/after matrix and criteria verification).

**Next:** Founder review of comprehensive report; then QA APK rebuild, phone test, final report.

---

---

## ANTIGRAVITY LEAD ENGINEER CLOSEOUT SUMMARY (2026-10-25)

**Completed Scope:**
1. Inherited and preserved 100% of OpenCode completions: humanized copy (7 source files, 40+ dictionary strings, de-clichéd prompts), daily reminder at 20:00, native stability (WebView crash-loop guard, PasswordStorageHelper AndroidKeyStore non-blocking start, version reconciliation 115 / 5.0.15), and QA backend bootstrap harness.
2. Re-verified all test suites: TypeScript (0 errors), ESLint (0 errors, 421 warnings), HD golden regressions (65 assertions PASS), Auth/New User synthetic regressions (573 assertions PASS), Billing regressions (67 assertions PASS), Quality Gate (DEV PASS / RELEASE BLOCKED).
3. Verified latest signed QA APK (`mobile-staging-1792845764078\android\app\build\outputs\apk\qa\app-qa.apk`, SHA-256 `0B2B54902D5AF5FB11A8C927D2D76085503A00709C404FB90505CFF9DAB1535D`, 7,769,319 bytes, package `com.bhumiamartya.app.qa`, 115 / `5.0.15-qa`, dedicated QA signer, 808/808 asset parity, 0 production leaks).
4. Upgraded production baseline to versionCode 116 / versionName 5.0.16 per explicit Founder authorization. Executed and verified local production Android APK build (`android\app\build\outputs\apk\release\app-release.apk`, SHA-256 `5FE93E46A8540FBE213FB2D7D266BDECE0222B7CF31F3884B8AE94AC14CA1105`, 8,109,069 bytes, package `com.bhumiamartya.app`, 116 / `5.0.16`, v2 production scheme signed with `bhumi-amartya-release.jks` [SHA-1 `b51c84d0...`], 884 assets in `assets/public/`, 0 QA leakage, 0 secrets, exit code 0).
5. Prepared complete 4-commit Git closeout manifests; zero secrets in Git candidates; zero commits/pushes executed.

**ONE Final Founder Action:**
Provide explicit authorization to execute the 4-commit Git closeout sequence on branch `hotfix/build110-indonesian-only` and push to `origin/hotfix/build110-indonesian-only`.

---

STOP AND WAIT FOR FOUNDER REVIEW.
