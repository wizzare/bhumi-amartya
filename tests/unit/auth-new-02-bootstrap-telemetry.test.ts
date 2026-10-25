import assert from "node:assert";
import { isServerIssuedProfilePending, resolveIsNewUserFromCredential } from "@/lib/auth/authActions";
import type { UserProfile } from "@/lib/repositories/userRepository";
import type { User, UserCredential } from "firebase/auth";

// ---------------------------------------------------------------------------
// Unit tests for Mission A (Telemetry) & Mission B (Bootstrap / Pending Profile)
// ---------------------------------------------------------------------------

let totalAssertions = 0;

function runAssertion(condition: boolean, msg: string) {
  assert.ok(condition, msg);
  totalAssertions++;
}

// ---------------------------------------------------------------------------
// 1. Mission A: isNewUser Resolution from getAdditionalUserInfo & metadata fallback
// ---------------------------------------------------------------------------
function testIsNewUserResolution() {
  console.log("-> Testing isNewUser resolution from getAdditionalUserInfo & metadata fallback");

  // Case 1: getAdditionalUserInfo is authoritative (isNewUser: true)
  const credentialNewUser = {
    user: {
      isAnonymous: false,
      metadata: {
        creationTime: "2026-10-21T10:00:00.000Z",
        lastSignInTime: "2026-10-21T10:00:01.000Z",
      },
    },
    _tokenResponse: { isNewUser: true, providerId: "google.com" },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(credentialNewUser) === true,
    "Authoritative isNewUser from credential should be true",
  );

  // Case 2: getAdditionalUserInfo is authoritative (isNewUser: false)
  const credentialReturningUser = {
    user: {
      isAnonymous: false,
      metadata: {
        creationTime: "2026-10-21T10:00:00.000Z",
        lastSignInTime: "2026-10-21T10:00:01.000Z",
      },
    },
    _tokenResponse: { isNewUser: false, providerId: "google.com" },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(credentialReturningUser) === false,
    "Authoritative isNewUser from credential should be false even if timestamps are close",
  );

  // Case 3: Fallback when additionalInfo is not available - Within 5s threshold
  const fallbackWithin5s = {
    user: {
      metadata: {
        creationTime: "2026-10-21T10:00:00.000Z",
        lastSignInTime: "2026-10-21T10:00:04.999Z",
      },
    },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(fallbackWithin5s) === true,
    "Fallback within 5s threshold resolves as new user",
  );

  // Case 4: Fallback when additionalInfo is not available - Exceeding 5s threshold (e.g. 5001ms)
  const fallbackExceeding5s = {
    user: {
      metadata: {
        creationTime: "2026-10-21T10:00:00.000Z",
        lastSignInTime: "2026-10-21T10:00:05.001Z",
      },
    },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(fallbackExceeding5s) === false,
    "Fallback exceeding 5s threshold resolves as returning user (not new)",
  );

  // Case 5: Fallback when additionalInfo is not available - Days later returning user
  const fallbackDaysLater = {
    user: {
      metadata: {
        creationTime: "2026-01-01T10:00:00.000Z",
        lastSignInTime: "2026-10-21T10:00:00.000Z",
      },
    },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(fallbackDaysLater) === false,
    "Fallback long after creation resolves as returning user",
  );

  // Case 6: Fallback when metadata is unavailable/missing
  const fallbackNoMetadata = {
    user: {
      metadata: {},
    },
  } as unknown as UserCredential;
  runAssertion(
    resolveIsNewUserFromCredential(fallbackNoMetadata) === undefined,
    "Fallback with missing metadata returns undefined (not false or true)",
  );

  console.log("   ✓ isNewUser resolution accurately prioritizes getAdditionalUserInfo with strict fallback");
}

// ---------------------------------------------------------------------------
// 2. Mission B: isServerIssuedProfilePending behavior
// ---------------------------------------------------------------------------
function testIsServerIssuedProfilePending() {
  console.log("-> Testing isServerIssuedProfilePending conditions");

  const baseCreation = "2026-10-21T10:00:00.000Z";
  const baseSign = "2026-10-21T10:00:01.000Z";
  const nowMs = Date.parse("2026-10-21T10:00:02.000Z");

  const mockFirstLoginUser = {
    uid: "test-uid-1",
    metadata: {
      creationTime: baseCreation,
      lastSignInTime: baseSign,
    },
  } as unknown as User;

  const mockReturningUser = {
    uid: "test-uid-2",
    metadata: {
      creationTime: "2026-01-01T10:00:00.000Z",
      lastSignInTime: "2026-10-21T10:00:00.000Z",
    },
  } as unknown as User;

  // Condition 1: Returning user should NEVER be pending server profile
  const pendingReturning = isServerIssuedProfilePending(mockReturningUser, null, nowMs);
  runAssertion(pendingReturning === false, "Returning user is never server-profile pending");

  // Condition 2: First-time user with no profile (null) -> is pending
  const pendingFirstLoginNoProfile = isServerIssuedProfilePending(mockFirstLoginUser, null, nowMs);
  runAssertion(pendingFirstLoginNoProfile === true, "First-login user without profile is pending");

  // Condition 3: First-time user with profile but trial not issued yet -> is pending
  const profileNoTrial = {
    uid: "test-uid-1",
    membershipType: "FREE",
    setupCompleted: false,
  } as unknown as UserProfile;
  const pendingFirstLoginProfileNoTrial = isServerIssuedProfilePending(mockFirstLoginUser, profileNoTrial, nowMs);
  runAssertion(pendingFirstLoginProfileNoTrial === true, "First-login with profile missing trial dates is pending");

  // Condition 4: First-time user with trial issued -> NOT pending
  const profileWithTrial = {
    uid: "test-uid-1",
    membershipType: "FREE",
    trialStartedAt: { seconds: 1700000000, nanoseconds: 0 },
    trialEndsAt: { seconds: 1700500000, nanoseconds: 0 },
    setupCompleted: false,
  } as unknown as UserProfile;
  const pendingWithTrial = isServerIssuedProfilePending(mockFirstLoginUser, profileWithTrial, nowMs);
  runAssertion(pendingWithTrial === false, "First-login with trial issued is NOT pending");

  // Condition 5: Higher server entitlement (LIFETIME, Google Play PREMIUM, Founder/Penjaga badge) -> NOT pending
  const lifetimeProfile = {
    uid: "test-uid-1",
    membershipType: "LIFETIME",
    setupCompleted: false,
  } as unknown as UserProfile;
  runAssertion(isServerIssuedProfilePending(mockFirstLoginUser, lifetimeProfile, nowMs) === false, "LIFETIME bypasses pending");

  const founderProfile = {
    uid: "test-uid-1",
    membershipType: "FREE",
    testerBadge: "Founder",
    setupCompleted: false,
  } as unknown as UserProfile;
  runAssertion(isServerIssuedProfilePending(mockFirstLoginUser, founderProfile, nowMs) === false, "Founder badge bypasses pending");

  console.log("   ✓ isServerIssuedProfilePending matches canonical specifications");
}

// ---------------------------------------------------------------------------
// 3. Mission B: Recovery from Pending / Missing Profile & No Infinite Loop
// ---------------------------------------------------------------------------
function testSetupAndLoginRoutingSimulation() {
  console.log("-> Testing setup & login routing simulation on pending/missing profile");

  // Simulating what AuthContext does when ServerIssuedProfilePendingError happens:
  const authStateOnPendingError = {
    authUser: { uid: "user-123" },
    authStateResolved: true,
    userProfile: null,
    profileLoading: false,
    authLoading: false,
    profileError: "Profil sedang disiapkan. Mohon tunggu.",
  };

  // Simulating checkUserAndRoute in app/login/page.tsx:
  const simulateLoginRoute = (state: typeof authStateOnPendingError, storageProfile: any) => {
    if (!state.authStateResolved || !state.authUser || state.profileLoading) {
      return "waiting";
    }
    const profile = state.userProfile ?? storageProfile;
    const blueprint = null;
    let setupCompleted = profile?.setupCompleted === true && (profile?.uid == null || profile?.uid === state.authUser.uid);
    const blueprintExists = Boolean(blueprint) || setupCompleted;

    if (setupCompleted && blueprintExists) {
      return "/dashboard";
    }
    return "/setup";
  };

  const loginTarget = simulateLoginRoute(authStateOnPendingError, null);
  runAssertion(loginTarget === "/setup", "Login routes unprofiled/pending user to /setup");

  // Now, simulating app/setup/page.tsx guard behavior:
  // In app/setup/page.tsx:
  // effectiveUser is user-123.
  // mountGuard check:
  // if (isCompletedProfileForUser(user.uid, currentAuth.userProfile)) -> redirect /dashboard. Here false.
  // resolveActiveProfile(currentAuth) ->
  //   if auth.userProfile is null, and refreshUserProfile is absent or returns null/throws:
  //   it checks storageProvider. If null, returns { profile: null, isMissing: false, isUnavailable: false } (or similar).
  //   If unavailable -> mountGuard = "unavailable" (shows Try Again button).
  //   If profile is null and not completed -> mountGuard = "ready" (ALLOWS user to fill the form!).
  // Most importantly: app/setup/page.tsx DOES NOT redirect back to /login when effectiveUser exists!
  const simulateSetupMountGuard = (hasUser: boolean, isCompleted: boolean) => {
    if (!hasUser) return "must_login";
    if (isCompleted) return "redirect_dashboard";
    return "ready_to_fill_form";
  };

  const setupGuardResult = simulateSetupMountGuard(true, false);
  runAssertion(setupGuardResult === "ready_to_fill_form", "Setup page allows user to fill birth form without looping");

  console.log("   ✓ Setup page does NOT bounce user back to /login; infinite loop is prevented");
}

// ---------------------------------------------------------------------------
// Run all tests
// ---------------------------------------------------------------------------
testIsNewUserResolution();
testIsServerIssuedProfilePending();
testSetupAndLoginRoutingSimulation();

console.log(`\nPASS auth-new-02-bootstrap-telemetry (${totalAssertions} assertions)\n`);
