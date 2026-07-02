# MOANA V3 - Force Update Rollback Report

Date: 2026-06-30

## STATUS

PASS

Urgent Firestore remote config rollback completed.

No release build was run. No APK or AAB was generated. No Play Console upload was performed. No Firestore rules were deployed. No access seed was run. No app source code was changed for this rollback.

## Firestore Config Updated

Path:

- `app_config/version`

Updated fields:

- `minimumSupportedVersionCode = 62`
- `minimumBuild = 62`
- `updatedBy = server_admin_force_update_rollback`

Reason:

- v64 is not available on Google Play yet.
- Closed Testing users on v62 must not be force-blocked before v64 is downloadable.
- Only users with `versionCode < 62`, including v61 down to older builds, should receive the update gate.

## Verification

Production readback:

```json
{
  "minimumSupportedVersionCode": 62,
  "minimumBuild": 62,
  "v50Blocked": true,
  "v61Blocked": true,
  "v62Blocked": false,
  "v63Blocked": false
}
```

## Release Note

`minimumBuild = 64` must only be restored after v64 is available on Google Play. Current emergency threshold remains `62`, which blocks v61 and below while allowing v62 and above.
