/**
 * Pure landing-page CTA routing decision. No imports on purpose so it can be
 * unit-tested in isolation and shared by both landing CTAs.
 *
 * Shares the canonical invariant of getUserRouteState (lib/auth/userRouteState.ts):
 * a failed / timed-out profile READ is never treated as "profile missing" and
 * must not send an existing authenticated user to first-time /setup.
 *
 *   "wait"      — auth/profile still resolving; make no routing decision yet
 *   "login"     — unauthenticated
 *   "reauth"    — authenticated but the profile READ failed (timeout / permission /
 *                 network). READ ERROR != DOCUMENT MISSING.
 *   "setup"     — authenticated and the profile is confirmed missing, or exists but
 *                 setupCompleted !== true (first-time / recovery onboarding)
 *   "dashboard" — authenticated, profile present, setupCompleted === true
 */
export type LandingCtaRoute = "wait" | "login" | "reauth" | "setup" | "dashboard";

export interface LandingCtaRouteInput {
  authLoading?: boolean | null;
  profileLoading?: boolean | null;
  authUser: unknown;
  profile: { setupCompleted?: boolean | null } | null | undefined;
  profileError?: string | null;
}

export function decideLandingCtaRoute(input: LandingCtaRouteInput): LandingCtaRoute {
  if (input.authLoading || input.profileLoading) return "wait";
  if (!input.authUser) return "login";
  if (input.profileError) return "reauth";
  if (!input.profile) return "setup";
  return input.profile.setupCompleted === true ? "dashboard" : "setup";
}
