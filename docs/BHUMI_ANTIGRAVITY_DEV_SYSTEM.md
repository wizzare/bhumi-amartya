# Bhumi Amartya — Permanent Google Antigravity Development System

This repository configures a reusable Antigravity engineering workflow under `.agents/` and `.github/` so future releases (VC 123+) run with consistent security, canonical data preservation, and evidence discipline.

## 1. Configured Antigravity Artifacts

| Component | Path | Purpose |
|---|---|---|
| Workspace Rules Extension | `.agents/AGENTS.md` | Appends 10 mandatory engineering rules & evidence discipline while preserving existing KARA rules and root `AGENTS.md`. |
| Role Skill 1 | `.agents/skills/bhumi-architecture-audit/SKILL.md` | Phase 0 provenance audit, source-of-truth precedence, dependency gate. |
| Role Skill 2 | `.agents/skills/bhumi-frontend-visualization/SKILL.md` | Responsive React/SVG visualizations, WebView symbol rendering, Design1 compliance. |
| Role Skill 3 | `.agents/skills/bhumi-backend-security/SKILL.md` | Server-owned entitlement, Firestore rules, HMAC/device anti-abuse, Play Billing integrity. |
| Role Skill 4 | `.agents/skills/bhumi-qa-browser-emulator/SKILL.md` | Multi-viewport Playwright (`320x640`..`768x1024`), Firebase Emulator (JDK 21+), honest quality gate reporting. |
| Role Skill 5 | `.agents/skills/bhumi-android-release/SKILL.md` | Capacitor sync, Gradle `bundleRelease`, AAB signing/SHA-256 verification, release readiness. |
| Honest Quality Gate | `scripts/run-quality-gate.cjs` | Executes real checks and emits strictly classified `PASS`/`FAIL`/`BLOCKED`/`NOT_RUN`/`HISTORICAL` verdicts. |
| CI Workflow | `.github/workflows/ci-quality-gate.yml` | Least-privilege (`contents: read`) automated checks; never auto-deploys to Play Store or Firebase production. |

## 2. Standard 8-Stage Delivery Lifecycle

| Stage | Input | Responsible Role | Exit Criteria | Required Evidence | Failure Handling | Rollback Procedure |
|---|---|---|---|---|---|---|
| **1. AUDIT** | Founder request, repo state | Architecture Auditor | Correct user branch/commit & VC baseline verified | Branch, HEAD SHA, provenance check | Stop & report blocker if baseline unverified | No code touched yet |
| **2. PLAN** | Impacted files & rules | Architecture Auditor + Lead | File-disjoint change plan preserving canonical math | File map & invariant list | Escalate conflicting requirements | Discard draft plan |
| **3. IMPLEMENT** | Approved plan | Frontend / Backend Engineers | Minimal diff matching specs & rules | Clean diff & `tsc --noEmit` exit 0 | Revert partial file edit | `git restore <file>` (only authorized target) |
| **4. SELF-REVIEW** | Modified files | Implementing Roles | Zero secret/PII leakage, zero engine drift | ESLint output & code review notes | Fix before testing | Revert commit/patch |
| **5. TEST** | Implementation | QA & Browser + Backend | Unit, billing, migration & matrix tests pass | Command + exit code + assertion totals | Fix defect; never mark `PASS` cleanly | Toggle server feature flag to `off` |
| **6. SECURITY CHECK** | Rules, auth, API routes | Backend & Security | Fail-closed auth/rules/HMAC/anti-abuse verified | `firestore.rules` + security test log | Block enforcement (`observe`/`off` fallback) | Flip `BHUMI_ANTI_ABUSE_KILL_SWITCH=true` |
| **7. ANDROID QA** | `build:prod` + `cap sync` | QA + Android Release | Multi-viewport & Android WebView checks pass; signed AAB builds cleanly | Screenshots, AAB SHA-256, APK/AAB check | Mark unverified hardware checks `BLOCKED` cleanly | Keep previous VC live on Play Store |
| **8. RELEASE REVIEW** | Full VC report | Founder Approval | Explicit Founder sign-off | Sections A–G report | Do NOT upload/publish | Hold Play Console promotion |

## 3. Tooling, MCP & Telemetry Evaluation

- **Google Developer Documentation MCP (`google-developer-knowledge`)**: Installed and active for verifying Android SDK, Play Integrity API, Firebase App Check, Firebase Auth, and Google Play Billing docs without granting access to production project data.
- **Firebase Crashlytics (Android)**: Not yet wired in `android/app/build.gradle`. Recommended for VC 123+ to capture native WebView/Billing crashes keyed to `versionCode`/`versionName`; pair with separate client error reporting for JS runtime exceptions.
- **Dependency Policy**: Prefer existing installed packages (`astronomy-engine`, `lucide-react`, `@capacitor/*`, `firebase`, `playwright`). New packages require documented necessity, bundle impact check, security check, and rollback path.

## 4. How the Founder Prompts Future Builds (VC 123+)

For future tasks, the Founder only needs to state the objective, target VC, and scope constraints (without repeating engineering standards):

> "Jalankan workflow Bhumi Antigravity Dev System untuk **VC 123** pada branch `hotfix/...`. Fokus task: [jelaskan fitur/bug]. Mulai dari Phase 0 Audit dan tunggu approval sebelum release Play Store."
