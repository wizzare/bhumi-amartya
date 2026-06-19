# Founder Activity Monitor - Data Source Parity Audit

## 1. Source Mapping Table

| Displayed Field | Exact Document Source | Exact Field Source | Source Type |
| :--- | :--- | :--- | :--- |
| **Tanggal Daftar** | `users/{uid}` | `createdAt` | Current |
| **Hari Sejak Daftar** | `users/{uid}` | `createdAt` | Current (Calculated) |
| **Total Hari Login** | `users/{uid}` | `participationMetrics.activeDays` | Legacy/Fallback |
| **Last Login** | `user_activity/{uid_date}` (Fallback to `users`) | `lastLogin` (Fallback: `participationMetrics.lastLoginAt`) | Current / Legacy |
| **Last Activity** | `user_activity/{uid_date}` (Fallback to `users`) | `lastSeen` (Fallback: `participationMetrics.lastSeen`) | Current / Legacy |
| **Login Hari Ini** | `user_activity/{uid_date}` | `loginCount` | Current |
| **Session Count** | `user_activity/{uid_date}` | `sessionCount` | Current |
| **Durasi Hari Ini** | `user_activity/{uid_date}` | `totalSeconds` | Current |
| **Halaman Terakhir Diakses** | `user_activity/{uid_date}` | `lastScreen` | Current |

---

## 2. Legacy Fields Still Used

The Activity Monitor heavily relies on the older `participationMetrics` object inside `users/{uid}` to fill gaps when today's `user_activity` document is missing. 

Legacy fields currently bridging the UI gaps:
- `participationMetrics.activeDays` (Array used for "Total Hari Login Sejak Daftar" / `totalActiveDays`)
- `participationMetrics.lastLoginAt` (Used for "Last Login" fallback)
- `participationMetrics.lastSeen` (Used for "Last Activity" fallback)

---

## 3. Incorrect Field Pairings

The core discrepancy lies in mixing **Current identity states** with **Legacy cumulative metrics** in the same detail panel:
1. Pairing `users.createdAt` (Registration date) with `users.participationMetrics.activeDays` (Lifetime activity tracking). If `createdAt` was overwritten or initialized late, the active days will exceed the mathematical maximum possible days since registration.
2. Mixing `user_activity.lastLogin` with `participationMetrics.lastLoginAt` can cause time-travel discrepancies if the backend fails to sync the legacy object during a new session tracking event.

---

## 4. Root Cause per User (Dwi Special Check)

**Why Dwi has Tanggal Daftar = 17 Jun 2026, but Total Hari Login = 5 hari:**

This is mathematically possible because the two fields do not share the same chronological source of truth. 
* **Tanggal Daftar** comes from `createdAt`.
* **Total Hari Login** comes from `participationMetrics.activeDays.length`.

If Dwi was an early tester, used the app prior to June 17, and her `createdAt` timestamp was either missing, corrupted, or explicitly set/migrated on June 17, 2026, the `participationMetrics.activeDays` array would still independently hold her 5 historical distinct active days. The `updateParticipationMetrics` function pushes to `activeDays` regardless of when `createdAt` was established.

---

## 5. Recommended Cleanup

1. **Stop querying `participationMetrics` for lifetime stats** if the goal is absolute chronological accuracy. Alternatively, enforce a backend cleanup script that caps `activeDays.length` to `getDaysSince(createdAt)` so legacy users don't break the space-time continuum.
2. **Standardize `createdAt`**: Run a one-time migration on the `users` collection to ensure `createdAt` is always the absolute earliest timestamp recorded in `participationMetrics.activeDays` if the current `createdAt` is missing or newer than the first active day.
3. **Deprecate `participationMetrics.lastLoginAt` & `lastSeen`**: Phase out writing to the heavy `users` document on every session. Rely entirely on a centralized `user_activity` history query to fetch the last known login, which dramatically saves Firestore write costs.
