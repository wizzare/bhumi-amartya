# MOANA V64 Final AAB Build Report

## Timestamp

2026-07-01 11:08:51 +07:00

## Branch

`KARA_V3_WELLNESS_STABLE`

## HEAD Commit

`068030ffbedfed73f24f597a101f1b84bcf576b3`

## Version Verification

Required:

- `versionCode = 64`
- `versionName = "3.2.0"`

HEAD commit value from `android/app/build.gradle`:

- `versionCode 62`
- `versionName "3.1.12-RC"`

Current working tree value from `android/app/build.gradle`:

- `versionCode 64`
- `versionName "3.2"`

Result:

FAIL

Reason:

- The task requires using HEAD of the current branch.
- HEAD does not contain the required Android release version metadata.
- The local working tree contains uncommitted Android version changes, but they are not suitable for a release build from HEAD.
- `versionName` in the working tree is also `"3.2"`, not the required `"3.2.0"`.

## TypeScript Result

NOT RUN

Reason:

- Stopped at version verification before validation/build.

## Android Sync Result

NOT RUN

Reason:

- Stopped at version verification before Android sync.

## Gradle Result

NOT RUN

Reason:

- Stopped at version verification before Gradle release bundle.

## AAB Verification

| Field | Value |
|---|---|
| AAB path | NOT GENERATED |
| AAB filename | N/A |
| AAB size | N/A |
| AAB timestamp | N/A |

## Known Issues

- Website-only `/api/kenali-diri/aura` remains out of scope for MOANA Android release.
- No website-only issue was encountered in this attempt because build did not reach `npm run build`.
- Main working tree remains dirty with unrelated local modified/untracked files from prior triage.

## Play Console

NOT UPLOADED

## Code Changes

NONE

No application code, version metadata, Firestore Rules, Billing, Badge, Subscription, Journey, Wellness, Dashboard, AI, or Access logic was changed during this build attempt.

## Final Status

FAIL

Signed Release AAB was not generated because HEAD is not at the required Android release version metadata.

## Version Metadata Hotfix

Previous HEAD:

`068030ffbedfed73f24f597a101f1b84bcf576b3`

New HEAD:

`9e597c430c4cfdbacea0090a20e456ab41591073`

Commit Message:

`chore(release): bump android version to 64`

Version metadata now in HEAD:

- `versionCode 64`
- `versionName "3.2.0"`

TypeScript:

PASS

Command:

```bash
npx tsc --noEmit
```

Push Status:

PUSHED

Remote:

`https://github.com/wizzare/bhumi-amartya-clean.git`

Branch:

`KARA_V3_WELLNESS_STABLE`

Play Console:

NOT UPLOADED

Note:

No AAB was built during the version metadata hotfix, per instruction.
