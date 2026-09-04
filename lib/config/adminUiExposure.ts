/**
 * Build 106 hotfix — ADMIN PAGE / MENU EXPOSURE gate.
 *
 * Separates two concerns that must never be conflated:
 *   - ADMIN AUTHORIZATION (Firestore role, lifetime entitlement, security rules,
 *     `lib/auth/privilegedUser.ts`, `lib/auth/requireFounder.ts`) — always active.
 *   - ADMIN PAGE / MENU EXPOSURE (the in-app `/admin/*` console + its nav items) —
 *     NOT intended for the shipped production app. Off unless a deployment
 *     explicitly opts in.
 *
 * The production APK build (`scripts/run-prod-build.mjs`) pins
 * `NEXT_PUBLIC_ENABLE_ADMIN_UI=false`, so the legacy admin console is neither
 * linked nor reachable there. An internal web/dev console can still enable it by
 * setting `NEXT_PUBLIC_ENABLE_ADMIN_UI=true` at build time.
 */
export function isAdminUiExposed(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ADMIN_UI === "true";
}
