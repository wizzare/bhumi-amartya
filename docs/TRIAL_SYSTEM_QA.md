# Trial System QA

## Scope
- 7-day free trial for new users.
- Locked after expiry: Journal, Meditation, Audio Healing, Journey, Weekly Report, Healing Memory.
- Always accessible: Dashboard, Profile, Settings, Blueprint.
- Admin/dev bypass always enabled.

## Test Cases

1. New user
- Complete setup.
- Verify profile contains trial fields:
  - `plan: "trial"` (non-admin)
  - `trialStartedAt`
  - `trialEndsAt` (+7 days)
  - `isPro: false`
- Verify protected features are accessible during trial.

2. Trial active
- Set `trialEndsAt` to future date.
- Verify access granted for:
  - Journal
  - Meditation
  - Audio Healing
  - Journey
  - Weekly Report
  - Healing Memory

3. Trial expiring
- Set `trialEndsAt` to <= 2 days from now.
- Verify Dashboard shows warning:
  - `Masa percobaan berakhir dalam X hari`

4. Trial expired
- Set `trialEndsAt` to past date.
- Verify each locked route renders locked screen (no redirect):
  - `/journal`
  - `/meditation`
  - `/healing/audio`
  - `/journey`
  - `/reports/weekly`
- Verify Dashboard remains accessible and shows:
  - `Masa percobaan telah berakhir`

5. Pro user
- Set profile to `plan: "pro"` or `isPro: true`.
- Verify all routes remain accessible regardless of trial dates.

6. Admin user
- Login as `wizzare@gmail.com` (or Widhi Wedhaswara account email mapped by role helper).
- Verify bypass:
  - All locked features accessible even if `trialEndsAt` is past.

## Migration Checks
- Existing users missing trial fields:
  - `trialStartedAt` falls back to `createdAt` when available.
  - If `createdAt` missing, fallback uses current date.
  - `trialEndsAt` auto-derived as +7 days from fallback start for access evaluation.
