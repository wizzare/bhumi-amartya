# Build110 remediation — incomplete candidate

Branch: `hotfix/build110-indonesian-only`.
Initial HEAD / SOURCE_BASE: Build108 `2da21d31208a2101017759ea85cf7b27bf58a779`, not Build109.
Founder authorization supersedes historical ENL policy. All eight mandatory governance documents were read before source edits.

```text
BUILD110_STATUS = PARTIAL_NOT_RELEASE_READY
SOURCE_BASE = BUILD108_2da21d31208a2101017759ea85cf7b27bf58a779
SINGLE_LANGUAGE_MODE = PARTIAL_BOUNDARIES_IMPLEMENTED
DEFAULT_LOCALE = id-ID
LANGUAGE_SELECTOR = REMOVED_FROM_THREE_IDENTIFIED_SURFACES
ENL_RUNTIME_DISABLED = EDITION_FLAG_DISABLED_OTHER_PATHS_PENDING_AUDIT
MALAY_RUNTIME_DISABLED = PARTIAL
LANDING_INDONESIAN = PARTIAL_NO_RENDERED_VERIFICATION
LOGIN_INDONESIAN = PARTIAL_NO_RENDERED_VERIFICATION
SETUP_INDONESIAN = UNVERIFIED
NAVIGATION_INDONESIAN = UNVERIFIED
DASHBOARD_INDONESIAN = PARTIAL
PROFILE_INDONESIAN = PARTIAL
HUMAN_DESIGN_INDONESIAN = UNVERIFIED
WEEKLY_GUIDANCE_INDONESIAN = PARTIAL
ENVIRONMENT_INDONESIAN = UNVERIFIED
WELLNESS_INDONESIAN = PARTIAL
PREMIUM_INDONESIAN = UNVERIFIED
SETTINGS_INDONESIAN = PARTIAL
AI_GENERATED_LANGUAGE = PARTIAL_ID_GATEWAY_AND_SERVICE_BOUNDARIES
DATE_FORMAT = PARTIAL_ID_CONTEXT_NO_COMPLETE_SURFACE_AUDIT
SYSTEM_ENGLISH_LEAK = NOT_MEASURED_KNOWN_GAPS_REMAIN
SYSTEM_MALAY_LEAK = NOT_MEASURED
USER_AUTHORED_CONTENT_PRESERVED = PARTIAL_NO_MIGRATION_NEW_TRANSACTION_NOT_RUNTIME_VERIFIED
HD_NEW_USER = INHERITANCE_UNIT_CHECKS_PASSED_DEVICE_UNVERIFIED
HD_EXISTING_USER = INHERITANCE_UNIT_CHECKS_PASSED_DEVICE_UNVERIFIED
HD_RECALCULATING_STUCK = INHERITANCE_GUARD_PASSED_NOT_DEVICE_VERIFIED
HD_DESTRUCTIVE_OVERWRITE = INHERITANCE_GUARD_PASSED_NOT_DEVICE_VERIFIED
BILLING_REGRESSION = UNVERIFIED_FINAL_CANDIDATE
ENV2_REGRESSION = INHERITANCE_SUITE_54_CHECKS_EXIT_0
SECURITY_REGRESSION = RULES_UNCHANGED_FINAL_RUNTIME_NOT_REVERIFIED
DEVICE_RUNTIME = BLOCKED_NO_CONNECTED_DEVICE
RELEASE_CRITICAL_GAPS = OPEN
BUILD110_CAN_PROCEED_TO_RELEASE = NO
```

## Implemented scope and remaining hazards

Fixed React language context, edition flag, i18next initialization and compatibility dictionaries to Indonesian; removed landing/settings/profile selectors; preserved stored profile language during settings save; localized selected login, journal, meditation, audio, Whole Sign and natal presentation copy. Added Indonesian service/API/gateway boundaries, birthday and notification copy, version-based daily cache rejection before read-only normalization, and weekly generated-record marker.

Daily and weekly generation saves now create only absent records in transactions. Existing records, including progress, remain intact. This deliberately leaves stale records stored; replacement guidance may remain session/local-cache only. Transaction behavior needs direct real-repository tests, including concurrent progress updates and read failures.

Not complete: all route/child surfaces, generated journal/reflection paths, direct prompt/fallback entry points, old dashboard and weekly-report caches, provider output language validation, and Indonesian dictionary completeness. Some direct helpers still accept EN/MS. Dashboard API results can still be normalized before version validation. Full generated-history presentation policy is unresolved. Do not claim zero leaks.

## Verification evidence

- Initial branch/HEAD/status: exit 0, tracked clean; sole pre-existing untracked utility preserved unread.
- TSC initially failed (exit 2), then passed. Final correction: `npx tsc --noEmit --incremental false`, exit 0.
- Initial `npm run lint`: exit 0, 332 warnings, zero errors. Not all warnings were pre-existing; some arose from removed consumers. Final correction: `npm run lint -- --quiet`, exit 0.
- Build107 surface guard: exit 0, 131 checks. HD convergence: exit 0, 19 checks.
- CDI01: exit 0, 13 checks/12 fixtures. CDI01a: exit 0, 11 checks/12 fixtures. CDI02: exit 0, 39 checks. CDI03: exit 0, 16 checks.
- ENV2: exit 0, 54 checks. FRA HD: exit 0, 58 checks. Build106 new-user lifecycle: exit 0, 56 assertions. Admin lifetime: exit 0, 22 checks.
- Sprint04 English suite: repeated exit 1; latest failure was English normalizer expectation. Historical language expectations conflict with Build110 and need explicit retargeting, not runtime regressions to satisfy them.
- Intermediate non-emulator release runs: exit 1 (22 pass/3 fail/9 skipped), exit 1 (24 pass/1 fail/9 skipped), then exit 0 (25 pass/0 fail/9 skipped).
- Emulator launch with Java17: exit 1, requires Java21. Java21 launch: exit 0, 34 suites passed, none skipped. This was INTERMEDIATE SOURCE ONLY, before final policy corrections. It does not verify this candidate. Included daily guidance 29 checks, journal/journey/memory 35 checks, setup recovery 33 checks.
- Emulator execution was not preceded by a complete network-safety inspection or explicit clearing of inherited configuration. Logs showed HD HTTP403 attempts; destination was not established. Therefore no claim of proven zero production network operations is made. No deliberate production data operations, deployment, upload or backfill was performed. Do not rerun until localhost-only network guards are verified.
- Build110 suite intermediate run: 25 test groups passed, not 25 individual assertions. Its dictionary test only compared the shared product title; its user-preservation test asserted an untouched literal, not application behavior. These are inadequate acceptance evidence and must be replaced. Final source rerun: exit 0, 25 groups; the coverage limitations above still apply.
- adb not on PATH (exit 1); SDK adb found and `devices` exit 0 with no devices. No app launched, screenshots, APK/AAB, version bump, or release artifact produced.

## Provenance and next task

Commit `d1cf592`: initial source, 37 files, +121/-343. Subsequent corrective source commit must be reviewed with it; the first commit alone contains reverted policy and billing mistakes. No push.

Security rules, Firebase/OAuth/provider configuration, and version files were not edited. Existing version is Build108/5.0.8, not the historical Build107 value. Protected `scripts/.build106-production-admin-provision.mjs` was never opened, hashed, edited, or staged. No independent content-integrity claim is made.

Next: complete Indonesian boundary/surface audit; replace weak tests with hostile EN/MS inputs and real preservation/concurrency checks; safely rerun final inheritance/emulator checks with outbound network blocked; then synthetic browser/device acceptance. Reconcile exact final commit IDs, diff statistics and tracked state from Git before review.

Corrective source commit: `7c58b5d`. Initial test commit: `c3f02a9` (2 files, +312/-0). Cumulative source/tests versus initial HEAD: 40 files, +420/-352. Before this documentation commit: tracked worktree clean; report and protected utility untracked. The documentation commit adds this report only.

STOP AND WAIT FOR FOUNDER REVIEW
