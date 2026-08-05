# Android Runtime Smoke Checklist — B1.1.1

Status: **NOT EXECUTED YET** (packaging/build completed, runtime validation still required on emulator/device).

## Preconditions

- Install the generated debug APK from this branch (`app-debug.apk`)
- Use synthetic/non-production test identity (no real purchase)
- Backend points to non-production test environment only

## Steps

1. Install clean APK
2. Login with test founder/customer identity
3. Store a synthetic signed entitlement (server-generated ES256 test token)
4. Restart app
5. Verify token survives securely
6. Logout
7. Verify token removed from secure storage
8. Login with another UID
9. Verify previous UID token rejected and removed
10. Corrupt stored token payload/signature
11. Verify fail-closed behavior (access denied, token removed)
12. Verify no entitlement plaintext in normal SharedPreferences XML
13. Verify Node-issued ES256 token is verified on device Web Crypto path
14. Trigger simultaneous login/open/resume/reconnect signals and verify single-flight silent restore (no duplicate verifier bursts)

## Expected Observations

- `SecureStoragePlugin` set/get/remove works
- `signed_entitlement_<uid>` key is bound to current UID
- `last_entitlement_sync_<uid>` may exist in Preferences (metadata only)
- No raw purchase token appears in storage/logs
- Web platform fails closed for offline authoritative entitlement

## Runtime Result Placeholder

- Device/Emulator: _TBD_
- Execution date: _TBD_
- Result: **PENDING**
- Notes: _TBD_
