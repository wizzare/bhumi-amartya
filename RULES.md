# Bhumi Amartya Engineering and Product Rules

## 1. Source-of-Truth Precedence

**Implementation behavior:** committed application code and configuration > reproducible runtime or emulator evidence > committed tests and governance evidence > active canonical documentation > historical documentation and drafts.

**Deployment and release state:** Play Console, deployed environment, APK/AAB, or signed release evidence > Founder-confirmed external release observation > committed release configuration > governance documentation > plans and historical claims.

**Product roadmap:** must not be promoted into current implementation documentation without committed implementation evidence.

**Founder-confirmed decisions** override all documentation when backed by committed evidence or explicit written instruction.

A document or test plan alone is not proof of deployment. Historical documents never override current implementation.

## 2. Product Identity

Bhumi Amartya is a self-knowledge, reflection, wellness, and personal growth application combining structured blueprint systems, reflective guidance, Journey, Wellness, and supporting insight. It is not presented as medical diagnosis, psychological treatment, or deterministic prediction. Spiritual and cultural systems may be presented within their own interpretive frameworks without falsely claiming objective certainty.

## 3. Current Blueprint System Boundary

The verified currently implemented deterministic engine systems are:

1. Life Path
2. Human Design
3. Natal Chart
4. Destiny Matrix
5. Weton
6. BaZi
7. Vedic Astrology
8. Tzolkin

Zi Wei Dou Shu is not verified as a current implemented engine. Content or future roadmap may mention additional systems. Marketing system counts must not be copied into application implementation claims without code evidence.

## 4. User and UID Ownership

- Every user-scoped read or write must bind to an authenticated UID.
- Client repositories may rely on Firestore Rules, but this dependency must be explicit.
- Never derive user ownership from mutable profile fields or email alone.
- No user-scoped cache may leak between UIDs.
- Admin requests must guard against stale responses and selected-UID changes.

**REQUIRED INVARIANT, NOT YET PRESENT IN BUILD 80:** Admin stale-response protection (request ID guard, UID-bound modal key) exists in external commit `fad0f65d` on branch `hotfix/v4-build78-wellness-journey-sync`. Manual reconciliation into Build 80 remains pending.

## 5. Version Telemetry

- User version must come from the client or session that emitted the activity.
- `user_activity` is the preferred source for latest client activity metadata.
- Do not use a global server build constant as a per-user installed version.
- localhost, web, Android, and production sessions must be distinguishable.
- `versionName` and `versionCode` must remain paired.
- Stale cross-user async results must never overwrite selected-user details.

## 6. Firestore Data Rules

- Deterministic resources must use deterministic document IDs.
- Owner isolation must be tested with both positive (same-user) and negative (cross-user) cases.
- Broad wildcard rules must not bypass dedicated sensitive subcollections.
- Path values must not be treated as strings in Firestore Rules (`Path.matches` defect is fixed in committed branch).
- Schema validation absence must be documented.
- Merge, overwrite, update, and transaction behavior must be explicit.
- Retry and concurrency behavior must be characterized.
- Sensitive data must have documented readers and writers.

## 7. Repository and Service Contracts

- Repositories own persistence contracts.
- Services coordinate application behavior.
- Engines own deterministic domain logic.
- UI must not silently duplicate persistence logic.
- Background writes must not block core UI unless required.
- Failures may be non-blocking only when data loss is acceptable and logged safely.
- Orphaned source cannot be admitted without provenance and contract audit.

## 8. AI and Guidance

- AI output must use approved service and prompt boundaries.
- Deterministic blueprint calculations must not be replaced by generative AI.
- Provider fallback must be explicit.
- Generated guidance must preserve UID and date identity.
- Deterministic document identity does not automatically prove generation deduplication across runtimes.
- Cross-runtime concurrency limitations must remain documented.

## 9. Product Experience

- No hidden feature state when a useful partial result can be shown.
- Loading, empty, partial, offline, and error states must be distinct.
- Existing data must not be labelled Coming Soon.
- User-facing language must remain warm, clear, and non-judgmental.
- Spiritual framing must not become coercive or fear-based.
- Accessibility and readable hierarchy are required.

## 10. Localization

- No visible locale may be claimed until its strings and runtime path exist.
- Language selector labels use text, not flags.
- Translated spiritual terminology must preserve intended meaning.
- Fallback language behavior must be explicit.
- V5 locale plans are not current V4 implementation.

## 11. Testing Invariants

- Consumer contract tests.
- Rules-positive and rules-negative tests.
- Exact assertion totals.
- Idempotency and concurrency verification where relevant.
- Bounds and malformed-data behavior.
- Privacy and logging checks.
- No skipped assertions hidden inside a broad PASS.
- Production guards for every emulator harness.

## 12. Release Gates

Build release requires: coherent version metadata; TSC state documented accurately; required test suites passing; Admin stale-response fix reconciled; browser QA; physical-device QA where Android is affected; billing and entitlement verification; force-update and version telemetry verification; deployed rules or backend evidence; APK/AAB and signing evidence; Founder approval.

## 13. Prohibited Shortcuts

- Declaring deployment from a commit alone.
- Declaring browser PASS from HTTP 200 alone.
- Treating historical prose as runtime truth.
- Silently repairing malformed production data.
- Broad Firestore allow rules without isolation tests.
- Global version fallback for user-specific version display.
- Swallowing critical persistence errors without evidence.
- Promoting V5 scope into V4 documentation.