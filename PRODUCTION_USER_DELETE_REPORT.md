# PRODUCTION USER DELETE REPORT

This report documents the permanent deletion of production user accounts and their associated Firestore documents, storage assets, and authentication records.

---

## 1. Deletion & Verification Matrix

| User (Email) | UID | Collections Deleted | Storage Deleted | Auth Deleted | Remaining References | Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `dtiffano@gmail.com` | `n4Vd7g7X97QiWnC6E5z5r96DvKy1` | `users`, `blueprints`, `userProfiles` | 0 | **YES** | 0 | **PASS** |
| `mj84japara@gmail.com` | `YogfEXOqmINqIcgqP6kLCPwTU252` | `users`, `blueprints`, `userProfiles` | 0 | **YES** | 0 | **PASS** |
| `lyraauliaratmaji2025@gmail.com` | `afINgOWYMkSOryMR3NfitwgfK5c2` | `users`, `blueprints`, `userProfiles` | 0 | **YES** | 0 | **PASS** |
| `indriyanilesles@gmail.com` | `U5aiIabcWoQoEqVGHiqS7a24eW23` | `users`, `blueprints`, `userProfiles` | 0 | **YES** | 0 | **PASS** |
| `aura2306@gmail.com` | `fo6iRaq2pTZn3bspcCSsByo8hEA2` | `users`, `blueprints`, `userProfiles` | 0 | **YES** | 0 | **PASS** |
| `gadescantika@gmail.com` | `EoHNUIUFyvgfGa4x16VZFGt5QnJ3` | `users`, `blueprints` | 0 | **YES** | 0 | **PASS** |
| `wedhaswarawidhi@gmail.com` | `kWiivJI1d7Wnwfrt3SfAUWiYv222` | `users`, `blueprints`, `userProfiles`, `analytics`, `user_activity` | 0 | **YES** | 0 | **PASS** |
| `mahrusmuhammad504@gmail.com` | `RKePZj2NOpdey4YbWMXjMBX8jVp2` | `users`, `blueprints` | 0 | **YES** | 0 | **PASS** |
| `kaniasari090801@gmail.com` | `ddJdjxVVYOPMWgyYy2uNXyWnk9s2` | `users`, `blueprints` | 0 | **YES** | 0 | **PASS** |

---

## 2. Verification details

- **Authentication Accounts**: All 9 Firebase Authentication accounts were successfully queried, authenticated, and deleted using the Firebase Admin SDK.
- **Firestore Documents**: Recurse-searched and deleted all documents in primary and subcollections matching the UIDs, direct doc IDs, prefixed doc IDs (`uid_`), or where `uid` or `userId` matched.
- **Remaining References**: Post-deletion scans re-queried all Firestore user collections and confirmed **0 remaining references** exist in the database for all target users.
- **Storage Deletion**: Scanned bucket `bhumiamartya-fe85c.firebasestorage.app` for files matching target UIDs; no storage files were associated with these users.
- **Safety Guards**: No other user accounts (specifically, Founder, Core Team, and Alfa test accounts) were affected.
