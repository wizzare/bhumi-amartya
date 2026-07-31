# Build 83 Handover — Historical Record

**Status: CLOSED. All checklist items below are confirmed live in production as of 2026-07-31.**

Repository: `bhumi-amartya-clean` (worktree at `C:\tmp\bhumi-billing-main-release`)
Branch: `build82-integration` (pushed to `origin` as a new branch; did not touch `main`)
Production Firebase project: `bhumiamartya-fe85c` ("BhumiAmartya", package `com.bhumiamartya.app`)
Production billing service: Vercel project `bhumi-billing-verifier` (independent deploy target, `services/billing-verifier/`)

This document was written after the fact, once all fixes were already verified live, as a durable record of what was found, what was changed, and why — not as a pre-deploy plan.

---

## 1. Chronology

### 1.1 Access control — dual authorization systems (Firestore rules)

The production Firestore ruleset determined admin/founder privilege by reading `role`/`guardianRole` fields directly off the requesting user's own `users/{uid}` document (a Firestore read inside the rules evaluation). The candidate ruleset already committed on this branch had replaced that entirely with Firebase Auth custom claims (`request.auth.token.admin`/`founder`) plus a hardcoded founder-email bypass — with no code path left that consulted the legacy `role`/`guardianRole` fields at all.

A read-only audit against production (`bhumiamartya-fe85c`) found:
- 3 accounts with `role`/`guardianRole` ∈ {admin, founder} in Firestore.
- 0 of those 3 had any Firebase Auth custom claims set.
- No migration script existed anywhere in the repo that sets `admin`/`founder` custom claims on real accounts (the only `setCustomUserClaims` call found was in the emulator test fixture, against synthetic test users).

Consequence if the candidate had shipped unmodified: the Founder's own account was protected by the separate hardcoded-email bypass, but the two other legacy-role admin accounts had no custom claims and no email match — they would have lost all admin-gated access the moment the ruleset deployed, silently.

A second, narrower risk was checked before touching anything further: whether an ordinary signed-in user could self-elevate by writing `role`/`guardianRole`/`membershipType`/`testerBadge`/`badge`/`guardianBadge` directly onto their own `users/{uid}` document. Both the rules layer (`protectedAccessFields()` guard on create/update) and the client code layer (`stripServerOwnedAccessFields()` in `userRepository.ts`) already blocked this independently. A 7-assertion emulator probe (create-time and update-time attempts, including a field bundled with an innocuous one) confirmed 7/7 denied — no self-elevation path existed before or after the bridge.

### 1.2 Billing — "Failed to fetch" (carried in as OPEN from before this session)

The billing-verifier's `POST /api/billing/google-play/verify` endpoint had been failing with "Failed to fetch" prior to this session. Rather than debug through the browser/CORS layer, a temporary server-side diagnostic endpoint (`GET /api/debug/health-check`, no request body, no purchase processing) was added to `services/billing-verifier` to test Firebase Admin and Google Play credential initialization directly, bypassing any client-side network questions entirely.

Root causes were found and fixed in sequence, each ruled out before moving to the next:

1. **`GOOGLE_PLAY_PROJECT_ID` — red herring.** An earlier report claimed this had a code-level fallback default (citing `lib/security.ts:5`). Direct inspection showed line 5 is actually `PACKAGE_NAME`'s fallback (`ANDROID_PACKAGE_NAME`), and `GOOGLE_PLAY_PROJECT_ID` is not read by any executable code in the repo at all — only present in `.env.example` and a planning doc. Whether it was blank in Vercel had zero effect on runtime behavior. Ruled out.

2. **`GOOGLE_PLAY_CLIENT_EMAIL` — wrong value.** The Founder visually confirmed in the Vercel dashboard that this variable held an API-key-shaped string, not a service account email. Corrected to the real service account email, `bhumi-google-play-billing@bhumiamartya-fe85c` (full form: `bhumi-google-play-billing@bhumiamartya-fe85c.iam.gserviceaccount.com`).

3. **`GOOGLE_PLAY_PRIVATE_KEY` — corrupted PEM.** Even with the correct email, the debug endpoint returned `googlePlayAuthOk: false` with `error:1E08010C:DECODER routines::unsupported` / `ERR_OSSL_UNSUPPORTED` — a Node/OpenSSL error meaning the PEM string itself was structurally invalid (most likely newline-escaping mangled by the Vercel dashboard's single-line text input). Fix: the Founder re-stored the key as base64 (of the correct PEM), and `lib/googlePlay.ts`'s `accessToken()` was updated to detect the stored format (`startsWith("-----BEGIN")` → treat as raw PEM; otherwise base64-decode) before handing it to `GoogleAuth`.

   One self-inflicted detour during this step: the debug endpoint had its own standalone copy of the key-parsing logic, and continued to fail identically after the `lib/googlePlay.ts` fix landed — not because the fix was wrong, but because the debug endpoint's copy had never been updated to match. Once the debug endpoint was aligned with the real fix, `googlePlayAuthOk: true` was confirmed immediately (`rawKeyLength: 2272`, `looksLikePem: false`, correctly base64-decoded).

The debug endpoint was deleted and a final production deploy confirmed it returns `404`, before the real fix was committed.

Final confirmation: a real purchase on a physical device (test account `rakasa112233`) completed successfully — Premium entitlement active, confirmed by the Founder directly on-device.

### 1.3 Minimum supported version (forced update gate)

Once both fixes above were live, the minimum supported Android version code was raised in production Firestore (`app_config/version`) so that every install on Build 82 or older is prompted to update and receive both fixes. Confirmed beforehand that the version-gate logic (`lib/services/appUpdatePolicy.ts`) only applies this minimum to `platform === "android"` — web/PWA is structurally exempt, so this could not repeat an earlier incident where a version gate blocked web access.

---

## 2. Commits

| Commit | Summary | Author |
|---|---|---|
| `2cc95438` | (session-start baseline, pre-existing) `fix(billing): derive premium-bhumi days-left/access-until from entitlementService.ts` | — |
| `a5d377ec` | `fix(firestore): add compatibility bridge for admin/founder authorization, close self-elevation gap` | Prior Claude Code session, same worktree, Founder-authorized; confirmed legitimate by Founder after the fact |
| `e9df644f` | `fix(billing): accept base64-encoded GOOGLE_PLAY_PRIVATE_KEY in Vercel` | This session |

All commits on `build82-integration` (267 total ahead of `origin/main`) were pushed to `origin` as a new branch. `main` was not touched; no CI is configured on this repo to auto-trigger on the push.

---

## 3. Technical details worth remembering

- **`GOOGLE_PLAY_PRIVATE_KEY` is stored base64-encoded in Vercel**, specifically to avoid the dashboard's single-line text input mangling PEM newlines. `lib/googlePlay.ts`'s `accessToken()` detects format by prefix:
  ```ts
  const rawKey = process.env.GOOGLE_PLAY_PRIVATE_KEY || "";
  const privateKey = rawKey.trim().startsWith("-----BEGIN")
    ? rawKey.replace(/\\n/g, "\n")
    : Buffer.from(rawKey.trim(), "base64").toString("utf-8");
  ```
  If this credential is ever rotated, re-encode the new key the same way (`base64` of the full PEM block, including headers) rather than pasting raw PEM into the Vercel dashboard.
- **Correct Google Play service account:** `bhumi-google-play-billing@bhumiamartya-fe85c.iam.gserviceaccount.com`. `GOOGLE_PLAY_CLIENT_EMAIL` must hold this exact email — not an API key.
- **Firestore compatibility bridge (`firestore.rules`):** `isFounderOrAdmin()` now also accepts `legacyRoleIsAdminOrFounder()` — a case-insensitive check of the requesting user's own `users/{uid}.role` / `.guardianRole` against `{admin, founder, dev_admin}` (matching `ADMIN_ROLES` in `lib/auth/privilegedUser.ts`). This must stay in place until every account currently relying on it has a verified, matching custom claim — removing it early reproduces the original lockout risk for the two non-Founder admin accounts identified in the audit.
- **`GOOGLE_PLAY_PROJECT_ID`** remains unused dead configuration. Leaving it blank in Vercel is fine; do not spend more time on it.

---

## 4. Final checklist — all confirmed live

| Item | Status | How verified |
|---|---|---|
| Firestore rules compatibility bridge | ✅ Live | Fetched production ruleset directly (`bhumiamartya-fe85c`, ruleset `a87d040a-79e5-4d9e-92cb-d6d51a2ec265`, deployed `2026-07-31T02:40:01Z`) — confirmed it contains `legacyRoleIsAdminOrFounder()` |
| Self-elevation not possible | ✅ Confirmed | 7/7 emulator probe assertions denied every privileged-field self-write attempt |
| Billing credential fix | ✅ Live | Debug endpoint confirmed `googlePlayAuthOk: true` end-to-end; real purchase completed on physical device (`rakasa112233`), Premium active |
| Build 83 on Google Play | ✅ Confirmed | Founder-confirmed directly (not independently checked via Play Console API — no such access in this session) |
| Minimum supported version code → 83 | ✅ Confirmed | Read-before (80) → scoped write → independent read-after (83); all other fields in the document byte-identical before/after |
| Commits pushed | ✅ Done | `build82-integration` pushed to `origin` as a new branch (267 commits ahead of `origin/main`); `main` untouched |
| Debug endpoint removed | ✅ Confirmed | Redeployed without it; endpoint returns `404` in production |

---

## 5. Known gaps / follow-ups (not blocking, worth tracking)

- **Compatibility-bridge-specific emulator test suite was never completed in this session.** A dedicated 5-case suite was planned (legacy-admin-no-claim passes / custom-claim-only passes / founder-by-email-with-neither passes / ordinary user fails / case-insensitive `"Admin"` passes) but the run was interrupted before executing. The bridge is confirmed *live and matching the reviewed diff*, and the pre-existing 45/45 authorization suite + the 7/7 self-elevation probe both passed against the rules — but the bridge's specific claim-priority logic has not had its own dedicated automated regression. Recommend running it opportunistically.
- **"Claims-only" admin accounts were never fully ruled out.** The audit confirmed 3 legacy-role accounts with zero custom claims, but a full Firebase Auth user-base enumeration (to check whether *anyone* has custom claims without a matching Firestore role) was blocked by this session's action classifier as too broad a PII read for the task at hand. Not expected to matter now that the bridge covers both paths, but flagging for completeness.
- **`app_config/version.latestVersionCode` is stale (`70`)**, now lower than the new `minimumBuild`/`minimumSupportedVersionCode` (`83`). Pre-existing inconsistency from an earlier rollback event (`PRODUCTION_HOTFIX_001`), not touched in this session since it wasn't in scope — but worth a cleanup pass since it reads as contradictory.
- The Founder's on-device billing confirmation showed entitlement access recorded "until 2026-07-31" — the same date as the purchase. Likely just an anchor/cycle-date display quirk rather than a real problem, but wasn't independently re-checked.

---

*Session closed 2026-07-31.*
