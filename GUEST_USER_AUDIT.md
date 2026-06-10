# Guest / Unauthenticated User Audit - Bhumi Amartya

**Date:** 2026-06-06  
**Status:** ⚠️ FAIL (Login Strictly Required)

## Findings

### 1. Route Access
| Route | Access | Behavior |
|-------|--------|----------|
| `/` (Landing) | ✅ OPEN | Shows "Mulai Perjalanan" and "Saya Sudah Punya Akun". |
| `/dashboard` | ❌ BLOCKED | Redirects to `/login`. |
| `/journal` | ❌ BLOCKED | Redirects to `/login`. |
| `/meditation` | ❌ BLOCKED | Redirects to `/login`. |
| `/journey` | ⚠️ SEMI-OPEN | Does not redirect, but shows "Data perjalanan belum tersedia". |
| `/setup` | ❌ BLOCKED | Shows "Anda harus login terlebih dahulu" with button to `/login`. |

### 2. User Experience Issues
- **Login Friction**: Users cannot experience the "Innerwork" loop as a guest. Everything requires an account immediately.
- **Inconsistent Redirection**: Most pages redirect to `/login`, but `/journey` stays on a blank state.
- **Onboarding Flow**: The app correctly handles new users by directing them to `/setup` after login.

### 3. Technical Stability
- **Redirect Loops**: No infinite loops found. `ProtectedRoute` is simple and effective.
- **Blank Screens**: Loading state is handled by a spinner ("Menyelaraskan ruang..."), avoiding white screens.

## Affected Files
- `components/auth/ProtectedRoute.tsx`
- `app/setup/page.tsx`
- `app/journey/page.tsx`
- `app/page.tsx`

## Recommended Fixes
1.  **Guest Mode**: Consider allowing users to complete at least one "Innerwork" session locally before forcing a sign-up.
2.  **Consistent Guards**: Add `ProtectedRoute` to `/journey` to match the rest of the app behavior.
3.  **Onboarding Messaging**: Update the "Mulai Perjalanan" button on the landing page to clearly state that a Google/Email login is the next step.
