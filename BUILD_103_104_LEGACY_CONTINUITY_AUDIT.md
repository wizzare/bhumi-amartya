# BHUMI AMARTYA — BUILD 103 / BUILD 104 LEGACY CONTINUITY AUDIT

Status: **`READ_ONLY_AUDIT_COMPLETE_WITH_RELEASE_BLOCKERS`**

Audit date: **2026-09-03 (Asia/Jakarta)**

Authorized workspace: **`C:\tmp\bhumi-build106-recovery`**

Branch: **`recovery/build106-product-continuity`**

Starting/audit HEAD: **`682087c67b91c5f1dc0e1fae0de4ef28e44876fc`**

Release-ready product HEAD: **`3c8620d6ffaa8a893380d78ff367842f8a18842c`**

Mode: **READ ONLY**. This audit made no product-code change, production Firestore write, rebuild,
version bump, deploy, publish, Play upload, or push.

## 1. Executive verdict

- The fourth historical admin identity is **Azian Meirdania** (also referred to below as
  **Meirdania**), established from repository Auth/migration evidence. It was not guessed.
- The committed Build 103 development tranche is present in Build 106 by ancestry:
  **22/22 commits**, touching **53 files**. All 53 paths remain present; 45 are byte-identical to
  the Build 103 boundary and 8 were subsequently evolved by recorded Build 106 work.
- Build 104 is present in Build 106 by ancestry: **2/2 commits**, touching **4 files**. All four
  remain present; the three version-authority files were intentionally advanced through Build 105
  to Build 106, while `src/lib/version.ts` remains present and unchanged from Build 104.
- A separate four-account permanent-admin/lifetime package exists only in protected forensic
  evidence and root checkpoint `d2cb23640205c23846e0bc68abc7a2740db23f31`. It is **not an
  ancestor** of Build 103, Build 104, Build 105, or Build 106 and is absent from the release lineage.
- That non-ancestor package proves the intended four-account state, but its implementation uses a
  hardcoded email allowlist. Therefore it is historical evidence, **not** an acceptable final
  implementation under the required UID/Firestore-based model.
- Available captured Firestore evidence contradicts active-admin/lifetime state for Nanda/Nandra
  and Septi (`role=user`, `guardianRole=user`, finite one-month grants ending 2026-07-30). No user
  document for Maulina or Meirdania exists in the ten-page captured repository snapshot. No current
  production read was authorized or performed, so later production changes cannot be presumed.
- Build 103, Build 104, Build 105, and Build 106 all contain the same old admin/entitlement source
  blobs. None contains the four-account policy or its 14-assertion regression test.
- The former Admin Activity workspace (user monitoring/search, personal messaging, admin inbox and
  reply, broadcast, analytics and privileged maintenance tools) was deleted before Build 103 and
  remains absent. Backend service/rule primitives remain, but there is no current admin UI caller.
- Result: **0/4 historical admins have end-to-end active-role plus lifetime continuity proven in
  Build 106.** The required state is classified **`MISSING_HISTORICAL_ADMIN_CONTINUITY`**.

**Build 106 must not proceed to Play Internal Testing on the evidence audited here.** There are four
release-blocking legacy gaps, and Play upload also remains separately unauthorized.

## 2. Evidence standard and limitations

This report uses only:

- Git ancestry, trees, blobs, commit history and source at the named boundaries;
- repository-contained Auth export and Firestore REST snapshot artifacts;
- protected read-only forensic files in `C:\tmp\bhumi-build83-access-hotfix`;
- the current Build 106 handoff/recovery/provenance documents.

The Auth export establishes account identity and UID. The captured Firestore artifacts establish
only the state recorded in those files; they are not a live production read. Source code establishes
what a build can do when supplied a given profile, but it does not prove that a production account
currently has that profile. No UI label is treated as entitlement proof: the former admin dashboard
rendered a null expiry as `Lifetime / No Expiry`, including cases where the canonical result was
Free/no entitlement.

No test suite was executed because the authorized task forbids rebuilding and requests a read-only
audit. Existing test source and previously recorded results are evidence, not a new runtime run.

## 3. Release and checkpoint boundaries

| Boundary | Commit | Version metadata | Ancestor of audit HEAD | Finding |
|---|---|---:|:---:|---|
| Last version-stamped base before the audited tranche | `5f7d596` | 100 / 5.0.0 | Yes | Starting exclusion for the Build 103 work inventory. |
| Operational Build 103 tranche end | `53fa00d6b2cbcc37b07c25b9d7f524e61cea154a` | 100 / 5.0.0 | Yes | 22 commits after `5f7d596`; no committed 103/5.0.3 metadata exists. |
| Build 104 preparation | `493698a2c3d9ee3bf83b196e84102e9bd327e7d7` | 104 / 5.0.4 | Yes | First version-stamped Build 104 commit. |
| Build 104 release head | `3c7492321dd844aac016822066e3a4e1530f1f5e` | 104 / 5.0.4 | Yes | `release/v5-build104`. |
| Build 105 | `8fc3c23dcdeb9670a33922deec5e44ae545affd9` | 105 / 5.0.5 | Yes | `release/v5-build105`. |
| Build 106 release code | `3c8620d6ffaa8a893380d78ff367842f8a18842c` | 106 / 5.0.6 | Yes | Signed AAB already verified per release provenance. |
| Current audit/docs head | `682087c67b91c5f1dc0e1fae0de4ef28e44876fc` | 106 / 5.0.6 | Yes | Starting HEAD requested for this audit. |
| Protected forensic committed head | `57479c928ba75e6a363613bb003809bd44a6c09d` | pre-104 | Yes | Read-only baseline; its dirty work is not implied by this ancestor relation. |
| CP-036 | `036225f23b4c07636ab875f9939afbebdbdad9d7` | snapshot | **No** | Root checkpoint; does not contain the four-account access policy. |
| Build 104 root checkpoint | `3a4b08b17230522b31ff0eaf6b6590837b250e9e` | 104 / 5.0.4 | **No** | Root checkpoint whose tree equals `493698a2`; no four-account policy. |
| Permanent-admin checkpoint | `d2cb23640205c23846e0bc68abc7a2740db23f31` | snapshot | **No** | Root checkpoint containing the four-account policy/test and matching protected forensic dirt. |

### Build 103 naming caveat

Git history contains no committed `versionCode 103` or `versionName "5.0.3"`. Therefore this audit
does not invent a Build 103 release tag. “Build 103” below means the operational development tranche
`5f7d596..53fa00d6`, immediately before Build 104 preparation. This is the reproducible boundary
available from the repository.

## 4. Build 103 continuity accounting

All 22 commits below are ancestors of Build 106:

| # | Commit | Work item | Build 106 continuity |
|---:|---|---|---|
| 1 | `cfc5c1c` | Journey context in deterministic wellness scoring | Accounted by ancestry |
| 2 | `c5a9674` | Persisted practice patterns wired into journey context | Accounted by ancestry |
| 3 | `295b4ba` | Journey-context regression tests | Accounted by ancestry |
| 4 | `9ff3764` | AccessGuard tester-record rejection hardening | Accounted by ancestry |
| 5 | `3a35300` | Omit nested astrocartography arrays from Firestore | Accounted by ancestry |
| 6 | `75c5e58` | Deployable Firestore Blueprint projection | Accounted by ancestry |
| 7 | `57479c9` | Snapshot-safe Blueprint regression | Accounted by ancestry |
| 8 | `18dfde6` | Daily Guidance configuration/typecheck isolation | Accounted by ancestry |
| 9 | `1c58762` | Release-critical test runner hardening | Accounted by ancestry |
| 10 | `7e62d1f` | Node 20 WebSocket transport for Neon Pool | Accounted by ancestry |
| 11 | `9bc5b38` | Verifier lint and purchase-safety gates | Accounted by ancestry |
| 12 | `6a40121` | Verifier dead-import cleanup | Accounted by ancestry |
| 13 | `b63482c` | Numeric versionCode optional-update gate | Accounted by ancestry |
| 14 | `0b82875` | Profile read error versus missing-profile distinction | Accounted by ancestry |
| 15 | `b85cdf7` | User-keyed Firestore path ownership | Accounted by ancestry |
| 16 | `9487ee2` | Production rules reconciliation/ownership isolation | Accounted by ancestry |
| 17 | `4c9da88` | Non-finite numeric persistence protection | Accounted by ancestry |
| 18 | `bc5d65c` | Persist Blueprint owner UID | Accounted by ancestry |
| 19 | `e6a4f38` | Prevent stale ready-profile downgrade | Accounted by ancestry |
| 20 | `d2827bc` | Firestore Rules deployment provenance guard | Accounted by ancestry |
| 21 | `be92cb9` | Journal/journey/memory persistence lifecycle proof | Accounted by ancestry |
| 22 | `53fa00d` | Durable billing ledger and entitlement runtime proof | Accounted by ancestry |

Path-level result:

- `BUILD_103_TOUCHED_PATHS = 53`
- `BUILD_103_PATHS_STILL_PRESENT_IN_BUILD_106 = 53`
- `BUILD_103_PATHS_BYTE_IDENTICAL_TO_53fa00d6 = 45`
- `BUILD_103_PATHS_EVOLVED_AFTER_53fa00d6 = 8`
- `BUILD_103_PATHS_DELETED = 0`

The eight evolved paths are `app/page.tsx`, `app/setup/page.tsx`,
`components/auth/AccessGuard.tsx`, `components/wellness/WellnessPageClient.tsx`,
`lib/repositories/userRepository.ts`, `package.json`,
`tests/integration/setup-recovery-state-machine-emulator.test.ts`, and
`tests/release-manifest.mjs`. Their later commits are the recorded Build 106 auth-race,
authoritative-profile, localization, rendered-gap and release-manifest reconciliation work; none is
an unexplained deletion of Build 103 functionality.

This 22/22 result covers committed lineage only. It does not absorb the separate non-ancestor
permanent-admin package discussed in Sections 6–10.

## 5. Build 104 continuity accounting

| # | Commit | Work item | Build 106 continuity |
|---:|---|---|---|
| 1 | `493698a` | Prepare versionCode 104 / versionName 5.0.4 | Accounted; subsequently advanced to 105 then 106 |
| 2 | `3c74923` | Canonical Build 104 display label | Accounted; same authority pattern retained through Build 106 |

Path-level result:

- `BUILD_104_TOUCHED_PATHS = 4`
- `BUILD_104_PATHS_STILL_PRESENT_IN_BUILD_106 = 4`
- `BUILD_104_PATHS_BYTE_IDENTICAL_TO_3c749232 = 1` (`src/lib/version.ts`)
- `BUILD_104_PATHS_INTENTIONALLY_VERSION_ADVANCED = 3` (`android/app/build.gradle`,
  `lib/config/buildInfo.ts`, `tests/unit/version-reconciliation.test.ts`)
- `BUILD_104_PATHS_DELETED = 0`

## 6. Protected forensic and non-ancestor evidence

The protected worktree remains:

- path `C:\tmp\bhumi-build83-access-hotfix`;
- branch `feat/build99`;
- committed HEAD `57479c928ba75e6a363613bb003809bd44a6c09d`;
- heavily dirty and treated read-only.

The following protected working-tree files are byte-identical to root checkpoint `d2cb236`:

| File | Blob |
|---|---|
| `lib/auth/accessPolicy.ts` | `a928fb4942c6e8d4aa18baa338bd3cdbf471f128` |
| `tests/unit/permanent-admin-lifetime-access.test.ts` | `6d17e15a6a3ecbca9fd832291b7bf8eebd8702e0` |
| `lib/auth/privilegedUser.ts` | `37f2441f6d7a2565c59ce57acd3d48231e9ec09a` |
| `lib/auth/requireFounder.ts` | `9b202c72575e2a34433c7919b909c86efc5bf49e` |
| `lib/billing/entitlementService.ts` | `e468af44d860b213b04ef35ea9f198294030cfb7` |
| `lib/access/accessControl.ts` | `dcedd1d8a70f634175564bb492736133ce854b98` |
| `app/admin/diagnostics/page.tsx` | `13a60ecf78f97ac87566218ca529fbf14a998802` |
| `components/navigation/AppNav.tsx` | `d897d59406efec36700f1b3c11845aa17dd73c2d` |

The first two files are missing from Build 103 (`53fa00d6`), Build 104 (`3c749232`), Build 105
(`8fc3c23`), Build 106 (`682087c`), CP-036, and the forensic committed HEAD. The other six release
lineage files have their old blobs unchanged from Build 103 through Build 106. This is exact evidence
that the protected patch was never reconciled into the release lineage.

The checkpoint policy names exactly four non-Founder permanent admins and its test asserts 14 cases:
admin access, lifetime premium, no Google Play source, ordinary-user denial, exact matching,
role/guardianRole bridge, diagnostics access and route-guard alignment. However, the runtime policy
keys these privileges directly by four emails. It proves **intent**, not compliance with the required
Firestore UID/account architecture.

## 7. Actual authorization and entitlement architecture

### 7.1 Canonical account/profile path

The usable current client path is:

`Firebase Auth account → Firebase UID → users/{uid} profile load → role/guardianRole → isPrivilegedUser()`

- `context/AuthContext.tsx` establishes browser-local Firebase Auth persistence, reacts to
  `onAuthStateChanged`, and loads the authenticated UID's server profile.
- `lib/repositories/userRepository.ts` reads `users/{uid}`.
- `lib/auth/privilegedUser.ts` accepts `founder`, `admin`, or `dev_admin` from `role` or
  `guardianRole`; only the Founder email is hardcoded in the Build 106 release lineage.
- `firestore.rules` has a legacy compatibility bridge that reads `users/{request.auth.uid}.role` or
  `.guardianRole` and accepts `admin`, `founder`, or `dev_admin`.
- The same Rules file protects role, membership, entitlement, premium, subscription and expiry
  fields against self-create/self-update. A trusted backend/admin must provision them.

This model can survive logout/login and device changes **if** the server-owned Firestore role exists.
The repository evidence does not prove that required state for any of the four accounts.

### 7.2 Divergent or non-authoritative paths

- `adminRoleRegistry/{uid}` is UID-keyed and client-write-denied, but its schema contains only
  `isDeveloperPro`. Its migration targets two developer-pro accounts, not the four historical admins.
  It is used in Settings plan presentation/save logic, not by privileged route guards or
  `getEntitlementStatus()`. It is not proof of admin-role continuity.
- `checkRemotePrivilegedStatus(email)` reads `admin_users/{email}.active`, but no current app caller
  uses it and the current Rules file has no `admin_users` match. It is not an end-to-end authorization
  path and is email-keyed rather than UID-keyed.
- `lib/auth/requireFounder.ts` verifies the ID token and checks email/custom-claim role only. It does
  not load `users/{uid}`. The captured Auth export has no custom claims for any of the four accounts,
  so Firestore-only roles would not automatically satisfy this server guard.
- `app/admin/diagnostics/page.tsx` and the navigation entry check only Founder status/email. A normal
  `admin`/`dev_admin` role is rejected from this page in Build 103/104/105/106.

### 7.3 Canonical premium path

The live premium path is:

`users/{uid} profile → getEntitlementStatus() → AccessGuard/PremiumLock/premium pages → premium access`

`getEntitlementStatus()` grants a non-expiring entitlement when `isPrivilegedUser(profile)` is true
or `membershipType === "LIFETIME"`. Therefore a correctly persisted `admin` role can produce lifetime
premium without a Google Play subscription. The paid branch remains separate and requires
`entitlementSource === "google_play"` with `membershipType === "PREMIUM"`.

There is no four-account `isPremium:true` shortcut in the current app. Firestore Rules also prevent
clients from self-setting `isPremium`, role, membership or entitlement fields. The failure is not a
weak billing check; it is the missing identity-to-canonical-role state and incomplete admin UI/guard
wiring.

Two continuity defects remain even if a role were provisioned:

1. the canonical resolver labels every privileged role as reason `founder`, tier
   `Founder (Lifetime)`, source `Founder Privileged`, rather than identifying an Admin lifetime grant;
2. the secondary `lib/access/accessControl.ts#getUserAccess()` returns `isPremium:false` and
   `isTrialActive:true` for privileged users. Current live gates use `getEntitlementStatus()`, so this
   is resolver drift rather than proof that the four admins have access.

## 8. Identity evidence

| Requested identity | Repository account identity | UID | Account evidence | Captured Firestore evidence |
|---|---|---|---|---|
| Maulina | Maulina Kirono / `maulinakirono777@gmail.com` | `TF9yndo4EXQv7vLuBtjf3id4Ybe2` | Verified Google account in `d2cb236:users_temp.json`; no custom claims | No matching document in `d2cb236:artifacts/bug2-princesska/users_p1..p10.json` |
| Septi | nenty septi sugiartini / `sugiartininenty@gmail.com` | `3Nb7mVkr1jUFQgECd7PJelMUDN93` | Auth export plus legacy tester migration; no custom claims | `role=user`, `guardianRole=user`, `membershipType=PREMIUM`, one-month Alfa grant, `accessUntil=2026-07-30` |
| Nandra | Repository display name **Nanda Viandra** / `nandaviandra76@gmail.com` | `3ADL5ir0XVPXyUGY4N2O4bKH1823` | Auth export plus legacy tester migration; no custom claims | `role=user`, `guardianRole=user`, `membershipType=PREMIUM`, one-month Alfa grant, `accessUntil=2026-07-30` |
| Fourth admin | **Azian Meirdania** / `meirdaniaazian@gmail.com` | `fk4NDdeTvnct7idrI7qTDfE956r2` | Auth export plus legacy tester migration; no custom claims | No matching document in the ten-page snapshot; legacy Inti grant is finite and canonically ended 2026-08-30 |

The exact four emails are also the four entries in
`d2cb236:lib/auth/accessPolicy.ts` and in its 14-assertion test. This cross-source match is the basis
for resolving the fourth identity.

## 9. Per-admin end-to-end audit

### Admin 1 — Maulina

```text
ADMIN_NAME = Maulina Kirono
ACCOUNT_RESOLUTION = VERIFIED_GOOGLE_ACCOUNT_FROM_REPOSITORY_AUTH_EXPORT
UID = TF9yndo4EXQv7vLuBtjf3id4Ybe2
FIRESTORE_ADMIN_STATE = UNPROVEN; no matching users/{uid} document in the captured ten-page snapshot
ROLE = INTENDED_ADMIN; no active admin/dev_admin/founder value proven in release-lineage evidence
LIFETIME_ACCESS_STATE = NOT_PROVEN
ENTITLEMENT_SOURCE = NONE_PROVEN_IN_RELEASE_LINEAGE; non-ancestor email policy would have emitted Permanent Admin
ADMIN_FEATURE_ACCESS = INCOMPLETE; no active role proof, diagnostics is Founder-only, historical Admin Activity UI absent
PREMIUM_FEATURE_ACCESS = NOT_PROVEN; canonical resolver would grant lifetime only after a canonical privileged role/LIFETIME state resolves
BUILD_103_STATE = MISSING four-account policy/test; only Founder diagnostics UI; no captured canonical admin/lifetime state
BUILD_104_STATE = SAME_AS_BUILD_103
BUILD_105_STATE = SAME_AS_BUILD_103
BUILD_106_STATE = SAME_AUTH/ENTITLEMENT_BLOBS_AS_BUILD_103; account continuity still unproven
VERDICT = MISSING_HISTORICAL_ADMIN_CONTINUITY
```

### Admin 2 — Septi

```text
ADMIN_NAME = nenty septi sugiartini (Septi)
ACCOUNT_RESOLUTION = VERIFIED_GOOGLE_ACCOUNT_AND_UID_FROM_AUTH_EXPORT_PLUS_LEGACY_TESTER_MIGRATION
UID = 3Nb7mVkr1jUFQgECd7PJelMUDN93
FIRESTORE_ADMIN_STATE = CAPTURED_AS_INACTIVE_FOR_ADMIN; role=user and guardianRole=user
ROLE = INTENDED_ADMIN; CAPTURED_ROLE_USER
LIFETIME_ACCESS_STATE = INACTIVE/NOT_PRESENT_IN_CAPTURED_EVIDENCE
ENTITLEMENT_SOURCE = july_1_spreadsheet Alfa one-month grant; finite accessUntil 2026-07-30, not lifetime and not Google Play
ADMIN_FEATURE_ACCESS = INCOMPLETE/DENIED_BY_CAPTURED_ROLE; historical Admin Activity UI absent
PREMIUM_FEATURE_ACCESS = EXPIRED_FINITE_GRANT; no lifetime role/entitlement proven
BUILD_103_STATE = role evidence remains user; Alfa window already expired; four-account policy absent
BUILD_104_STATE = SAME; no admin/lifetime reconciliation
BUILD_105_STATE = SAME; no admin/lifetime reconciliation
BUILD_106_STATE = same release-lineage access blobs; current production state not read and cannot be presumed
VERDICT = MISSING_HISTORICAL_ADMIN_CONTINUITY
```

### Admin 3 — Nandra

The requested name “Nandra” resolves to the repository account whose display name is **Nanda
Viandra** and whose email appears in the exact four-admin checkpoint list.

```text
ADMIN_NAME = Nandra (repository identity: Nanda Viandra)
ACCOUNT_RESOLUTION = VERIFIED_GOOGLE_ACCOUNT_AND_UID_FROM_AUTH_EXPORT_PLUS_LEGACY_TESTER_MIGRATION
UID = 3ADL5ir0XVPXyUGY4N2O4bKH1823
FIRESTORE_ADMIN_STATE = CAPTURED_AS_INACTIVE_FOR_ADMIN; role=user and guardianRole=user
ROLE = INTENDED_ADMIN; CAPTURED_ROLE_USER
LIFETIME_ACCESS_STATE = INACTIVE/NOT_PRESENT_IN_CAPTURED_EVIDENCE
ENTITLEMENT_SOURCE = july_1_spreadsheet Alfa one-month grant; finite accessUntil 2026-07-30, not lifetime and not Google Play
ADMIN_FEATURE_ACCESS = INCOMPLETE/DENIED_BY_CAPTURED_ROLE; historical Admin Activity UI absent
PREMIUM_FEATURE_ACCESS = EXPIRED_FINITE_GRANT; no lifetime role/entitlement proven
BUILD_103_STATE = role evidence remains user; Alfa window already expired; four-account policy absent
BUILD_104_STATE = SAME; no admin/lifetime reconciliation
BUILD_105_STATE = SAME; no admin/lifetime reconciliation
BUILD_106_STATE = same release-lineage access blobs; current production state not read and cannot be presumed
VERDICT = MISSING_HISTORICAL_ADMIN_CONTINUITY
```

### Admin 4 — Azian Meirdania

```text
ADMIN_NAME = Azian Meirdania
ACCOUNT_RESOLUTION = VERIFIED_GOOGLE_ACCOUNT_AND_UID_FROM_AUTH_EXPORT_PLUS_LEGACY_TESTER_MIGRATION
UID = fk4NDdeTvnct7idrI7qTDfE956r2
FIRESTORE_ADMIN_STATE = UNPROVEN; no matching users/{uid} document in the captured ten-page snapshot
ROLE = INTENDED_ADMIN; no active admin/dev_admin/founder value proven in release-lineage evidence
LIFETIME_ACCESS_STATE = NOT_PROVEN; historical tester membership was PREMIUM_2_MONTHS, not lifetime
ENTITLEMENT_SOURCE = legacy Penjaga Bhumi Inti grant; finite canonical access ended 2026-08-30
ADMIN_FEATURE_ACCESS = INCOMPLETE; no active role proof, diagnostics is Founder-only, historical Admin Activity UI absent
PREMIUM_FEATURE_ACCESS = FINITE INTI GRANT EXPIRED BEFORE BUILD_104; no lifetime role/entitlement proven
BUILD_103_STATE = four-account policy absent; Inti cutoff reached 2026-08-30; no canonical admin/lifetime state proven
BUILD_104_STATE = finite grant expired; no admin/lifetime reconciliation
BUILD_105_STATE = SAME; no admin/lifetime reconciliation
BUILD_106_STATE = same release-lineage access blobs; current production state not read and cannot be presumed
VERDICT = MISSING_HISTORICAL_ADMIN_CONTINUITY
```

## 10. Admin feature continuity

### Historical end-to-end implementation

Immediately before commit `2d83f7c`, `/admin/activity` and
`components/admin/AdminInboxWorkspace.tsx` provided:

- paginated user monitoring, UID/email search, detail and analytics;
- personal message to a selected user;
- collection-group admin inbox monitoring and thread reply;
- broadcast to all/premium/tester groups, plus an email/update path;
- Human Design diagnostics/re-run/cache clearing, Gaia migration and guardian validation tools;
- persisted messages at `users/{targetUid}/communications/{messageId}` and broadcast metadata at
  `broadcasts/{broadcastId}`;
- delivery into the user-facing `/inbox` UI.

The page/component gate accepted `guardianRole=admin` or `role=admin`. Firestore Rules continue to
allow an active admin actor to list/get/update users, read communications, create a valid admin
reply, and create broadcast metadata.

### Regression and current state

Commit `2d83f7c` (Build 87 access-recovery hotfix) deleted `app/admin/page.tsx`, the 2,112-line
`app/admin/activity/page.tsx`, and `components/admin/AdminInboxWorkspace.tsx`. All are absent at
Build 103, Build 104, Build 105 and Build 106. The only `app/admin/**/page.tsx` at those four
boundaries is `app/admin/diagnostics/page.tsx`, and its current/release-lineage gate is Founder-only.

The communication services and Rules persist, but `app/**` and `components/**` have no current
caller of `sendPersonalMessage`, `sendBroadcast`, `sendAdminReply`, user-monitoring search, or the
former admin inbox. Several legacy validator scripts still refer to the deleted files, but they are
not release-manifest proof and would not establish a rendered authorization path.

Therefore, for every one of the four identities:

`IDENTITY → UID → FIRESTORE ADMIN STATUS` is unproven or contradicted; and

`ROLE → ADMIN ROUTE → ADMIN ACTION → FIRESTORE PERSISTENCE → USER/ADMIN UI` is incomplete because
the role state is missing and the historical UI surface no longer exists.

The backend primitives alone are not counted as feature continuity.

## 11. Release-blocking legacy gaps

| ID | Exact gap | Release impact |
|---|---|---|
| `LEGACY-GAP-01` | Canonical Firestore active-admin state is not proven for any of the four identities; two captured documents explicitly say `user`, two have no captured user document, and all four Auth accounts have no role claims. | Cannot prove that the intended admins survive re-login/device changes or satisfy Rules/route guards. |
| `LEGACY-GAP-02` | Free Lifetime is not proven for any account. The only four-account lifetime implementation is a non-ancestor hardcoded-email patch; finite Alfa/Inti grants are expired. Current role-derived lifetime output is also mislabeled Founder. | Cannot prove premium continuity independent of Google Play; historical admin state would regress to Free/expired access unless a canonical role exists. |
| `LEGACY-GAP-03` | Authorization checks diverge: Firestore Rules support Firestore roles, `requireFounder` checks token claims/email without loading the Firestore role, and diagnostics/navigation are Founder-only. | An account can be an admin in one layer and denied by another; end-to-end authorization is not coherent. |
| `LEGACY-GAP-04` | Historical Admin Activity/inbox/reply/personal-message/broadcast/user-management UI was deleted before Build 103 and never restored; only backend primitives remain. | Even a correctly provisioned admin lacks the historical UI needed to exercise the capabilities. |

These are four distinct release-blocking continuity gaps. The absent hardcoded-email patch is not a
fifth gap; it is evidence for gaps 01–03 and must not be cherry-picked as-is.

## 12. Minimum safe reconciliation proposal — not executed

If implementation is separately authorized, the smallest architecture-preserving reconciliation is:

1. Perform a new **read-only** production preflight for exactly the four UIDs. Resolve current
   `users/{uid}` role/membership fields and any trusted-role migration history before planning writes.
2. In a separately authorized, idempotent trusted-backend migration, provision the existing
   server-owned `users/{uid}.role = "admin"` model for the four exact UIDs. Do not use names or email
   checks at runtime and do not invent a competing Firestore field.
3. Keep `getEntitlementStatus()` authoritative. Its existing privileged-role branch already grants
   non-expiring premium independent of Play. Narrowly distinguish Admin from Founder in reason/tier
   presentation without weakening verified Google Play checks or accepting raw `isPremium:true`.
4. Make client admin guards consume the hydrated Firestore role through the existing role helper.
   Make server guards resolve the verified token UID to the same trusted Firestore role (or a
   demonstrably synchronized existing claim model); do not use the four email addresses as policy.
5. Restore only the required admin UI routes/components from historical evidence, reusing the
   existing communication service, repository, Rules and user `/inbox` persistence chain. Review
   each privileged mutation separately.
6. Add emulator/source regression coverage for all four UID fixtures, negative near-match/ordinary
   accounts, logout/login, device-equivalent cold hydration, admin reply, broadcast, user listing,
   lifetime premium and Google Play independence. Then run device acceptance before release.

No part of this proposal was implemented, and no production Firestore write was performed.

## 13. Required final admin verdict

```text
ADMIN_1_MAULINA = MISSING_HISTORICAL_ADMIN_CONTINUITY
ADMIN_2_SEPTI = MISSING_HISTORICAL_ADMIN_CONTINUITY
ADMIN_3_NANDRA = MISSING_HISTORICAL_ADMIN_CONTINUITY
ADMIN_4_NAME = AZIAN_MEIRDANIA
ADMIN_4_STATUS = MISSING_HISTORICAL_ADMIN_CONTINUITY

ADMIN_IDENTITIES_EXPECTED = 4
ADMIN_IDENTITIES_ACCOUNTED = 4
ADMIN_IDENTITIES_WITH_ACTIVE_ROLE_AND_LIFETIME_PROVEN_IN_BUILD_106 = 0

ADMIN_AUTHORIZATION_CONTINUITY = INCOMPLETE
ADMIN_FEATURE_CONTINUITY = INCOMPLETE
ADMIN_UNACCOUNTED_ITEMS = CANONICAL_ACTIVE_ROLE_FOR_4; FREE_LIFETIME_FOR_4; UNIFIED_UID_BASED_GUARDS; HISTORICAL_ADMIN_UI_ACTION_SURFACE
```

## 14. Exact final counts and Play decision

```text
BUILD_103_BOUNDARY = 5f7d596..53fa00d6
BUILD_103_LINEAGE_COMMITS_EXPECTED = 22
BUILD_103_LINEAGE_COMMITS_ACCOUNTED_IN_BUILD_106 = 22
BUILD_103_TOUCHED_PATHS = 53
BUILD_103_TOUCHED_PATHS_PRESENT_IN_BUILD_106 = 53
BUILD_103_NON_ANCESTOR_ADMIN_LIFETIME_PACKAGES_FOUND = 1
BUILD_103_NON_ANCESTOR_ADMIN_LIFETIME_PACKAGES_RECONCILED = 0

BUILD_104_BOUNDARY = 53fa00d6..3c749232
BUILD_104_LINEAGE_COMMITS_EXPECTED = 2
BUILD_104_LINEAGE_COMMITS_ACCOUNTED_IN_BUILD_106 = 2
BUILD_104_TOUCHED_PATHS = 4
BUILD_104_TOUCHED_PATHS_PRESENT_IN_BUILD_106 = 4

ADMIN_IDENTITIES_EXPECTED = 4
ADMIN_IDENTITIES_IDENTIFIED = 4
ADMIN_IDENTITIES_ACCOUNTED = 4
ADMIN_IDENTITIES_ACTIVE_ROLE_AND_LIFETIME_CONTINUITY_PROVEN = 0
ADMIN_IDENTITIES_MISSING_CONTINUITY = 4

RELEASE_BLOCKING_LEGACY_GAPS = 4
BUILD_106_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = NO
PLAY_UPLOAD_AUTHORIZED = NO
PLAY_UPLOAD_PERFORMED = NO
```

Final marker: **`BUILD_103_104_LEGACY_CONTINUITY_AUDIT_COMPLETE_WITH_4_RELEASE_BLOCKERS`**.

---

## 15. Founder-approved Build 106 reconciliation update (2026-09-03)

The read-only audit above remains the accepted historical baseline. Founder subsequently authorized
the minimum Build 106 reconciliation. The non-ancestor `d2cb236…` package was not cherry-picked;
it was used only as evidence. Implementation commits:

- `36a32cd` — source: UID-bound Firestore role policy, canonical admin/lifetime entitlement,
  restored historical Admin Activity + communications surface, and an emulator-only provisioning
  runner.
- `e5d1592` — tests: four synthetic admin slots, Rules persistence/action/relogin coverage, and
  negative normal-user/Premium-user/self-elevation checks.

The existing `users/{uid}.role`, `membershipType`, `membershipExpiryDate`, and
`entitlementSource` fields are reused. No account name or four-admin email allowlist is present in
client policy, no `isPremium:true` shortcut was added, and the Google Play subscriber branch remains
source- and expiry-strict.

Gap transition:

| Original gap | Current status | Evidence |
|---|---|---|
| `LEGACY-GAP-01` — active Firestore role for four real accounts | **OPEN — PRODUCTION PROVISIONING PENDING** | UID-bound implementation + emulator role state pass; production Firestore was not read or written in this phase. |
| `LEGACY-GAP-02` — Free Lifetime for four real accounts | **OPEN — PRODUCTION PROVISIONING PENDING** | `admin` role and `LIFETIME/admin_lifetime` resolve non-expiring Premium independently of active Play; real accounts remain unwritten. |
| `LEGACY-GAP-03` — divergent authorization | **CLOSED IN SOURCE/EMULATOR** | UI is bound to authenticated UID + hydrated `users/{uid}` role; profile read/mismatch fails closed; Founder server route now loads the same Firestore profile and has no unauthenticated dev bypass. |
| `LEGACY-GAP-04` — missing admin action surface | **CLOSED IN SOURCE/EMULATOR** | Historical `/admin/activity`, monitoring/search/detail/analytics, personal message, inbox/reply, broadcast, diagnostics and privileged maintenance surface restored; Rules action/persistence path passes. |

Executed evidence:

```text
TYPESCRIPT_NO_EMIT = PASS (EXIT 0)
ADMIN_LIFETIME_UNIT = PASS (21 assertions)
ADMIN_RULES_EMULATOR = PASS (23 assertions)
BILLING_ENTITLEMENT_CONTRACT = PASS (61/61)
ENTITLEMENT_MIRROR_DRIFT = PASS (17/17)
TESTER_GRANT_RECONCILIATION = PASS (20/20)
INBOX_COMMUNICATION_CONTRACT = PASS (24/24)
FULL_RELEASE_SUITE = PASS=27 FAIL=0 SKIPPED=0 TOTAL=27
PRODUCTION_FIRESTORE_READS = 0
PRODUCTION_FIRESTORE_WRITES = 0
```

The previously signed AAB was produced from `3c8620d6…`, before reconciliation source commit
`36a32cd`; it is valid historical evidence but does not contain this fix. Rebuild/sign/device
verification was expressly not performed.

```text
BUILD_103_CONTINUITY = COMPLETE
BUILD_104_CONTINUITY = COMPLETE
ADMIN_IDENTITIES_EXPECTED = 4
ADMIN_IDENTITIES_IDENTIFIED = 4
ADMIN_IDENTITIES_ACCOUNTED = 4
ADMIN_IDENTITIES_CODE_AND_EMULATOR_RECONCILED = 4
ADMIN_IDENTITIES_PRODUCTION_PROVISIONED_AND_VERIFIED = 0
ADMIN_UNACCOUNTED_ITEMS = PRODUCTION_FIRESTORE_ROLE_AND_LIFETIME_PROVISIONING_FOR_4; NEW_SIGNED_ARTIFACT_AND_DEVICE_ACCEPTANCE_FOR_RECONCILED_HEAD
RELEASE_BLOCKING_LEGACY_GAPS = 2
ADDITIONAL_RELEASE_ARTIFACT_GAPS = 1
BUILD_106_CAN_PROCEED_TO_PLAY_INTERNAL_TESTING = NO
PLAY_UPLOAD_AUTHORIZED = NO
PLAY_UPLOAD_PERFORMED = NO
```

Current marker: **`BUILD_106_ADMIN_LIFETIME_RECONCILIATION_CODE_COMPLETE_EMULATOR_VERIFIED_PRODUCTION_PENDING`**.
