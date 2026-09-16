/**
 * P0 Auth Fix — Regression tests for skipNativeAuth + Credential Manager fallback.
 *
 * Verifies:
 *   A. Google native call receives skipNativeAuth=true.
 *   B. Credential Manager unsupported → exactly one legacy retry → no infinite retry.
 *   C. User cancel → NO fallback.
 *   D. Successful native token → Firebase JS signInWithCredential is called.
 *   E. Successful login → no error thrown.
 */
import assert from "node:assert";

// ---------------------------------------------------------------------------
// Shared mock state (set by preload, read by tests)
// ---------------------------------------------------------------------------
const g = globalThis as any;

if (!g.__P0_AUTH_MOCKS__) {
  g.__P0_AUTH_MOCKS__ = {
    signInWithGoogleCalls: [] as Array<{ useCredentialManager: boolean; skipNativeAuth: boolean }>,
    signInWithCredentialCalls: [] as Array<any[]>,
    signInWithGoogleImpl: null as any,
  };
}

function resetMocks() {
  g.__P0_AUTH_MOCKS__.signInWithGoogleCalls = [];
  g.__P0_AUTH_MOCKS__.signInWithCredentialCalls = [];
}

function setSignInWithGoogleImpl(fn: any) {
  g.__P0_AUTH_MOCKS__.signInWithGoogleImpl = fn;
}

// ---------------------------------------------------------------------------
// Test A: skipNativeAuth=true is passed to native call
// ---------------------------------------------------------------------------
async function testASkipNativeAuth() {
  resetMocks();
  setSignInWithGoogleImpl(async (opts: any) => {
    g.__P0_AUTH_MOCKS__.signInWithGoogleCalls.push({
      useCredentialManager: opts.useCredentialManager,
      skipNativeAuth: opts.skipNativeAuth,
    });
    return { credential: { idToken: "mock-id-token", accessToken: "mock-access-token" } };
  });

  const { signInWithGoogle } = await import("@/lib/auth/authActions");
  await signInWithGoogle();

  const calls = g.__P0_AUTH_MOCKS__.signInWithGoogleCalls;
  assert.ok(calls.length >= 1, "signInWithGoogle should have been called at least once");
  assert.strictEqual(calls[0].skipNativeAuth, true, "skipNativeAuth must be true");

  console.log("  ✓ A: Google native call receives skipNativeAuth=true");
}

// ---------------------------------------------------------------------------
// Test B: Credential Manager unsupported → exactly one legacy retry
// ---------------------------------------------------------------------------
async function testBCredentialManagerFallback() {
  resetMocks();
  let callCount = 0;
  setSignInWithGoogleImpl(async (opts: any) => {
    callCount++;
    g.__P0_AUTH_MOCKS__.signInWithGoogleCalls.push({
      useCredentialManager: opts.useCredentialManager,
      skipNativeAuth: opts.skipNativeAuth,
    });
    if (callCount === 1 && opts.useCredentialManager === true) {
      throw new Error("getCredentialException: Credential Manager not supported");
    }
    return { credential: { idToken: "mock-id-token-fallback", accessToken: "mock-access-token-fallback" } };
  });

  const { signInWithGoogle } = await import("@/lib/auth/authActions");
  await signInWithGoogle();

  const calls = g.__P0_AUTH_MOCKS__.signInWithGoogleCalls;
  assert.strictEqual(callCount, 2, "Should have exactly 2 calls (first CM, then legacy fallback)");
  assert.strictEqual(calls[0].useCredentialManager, true, "First call uses credential manager");
  assert.strictEqual(calls[1].useCredentialManager, false, "Second call uses legacy fallback");
  assert.ok(calls.every((c: any) => c.skipNativeAuth === true), "All calls must have skipNativeAuth=true");

  console.log("  ✓ B: Credential Manager unsupported → one legacy retry → no infinite retry");
}

// ---------------------------------------------------------------------------
// Test C: User cancel → NO fallback
// ---------------------------------------------------------------------------
async function testCUserCancelNoFallback() {
  resetMocks();
  let callCount = 0;
  setSignInWithGoogleImpl(async (opts: any) => {
    callCount++;
    g.__P0_AUTH_MOCKS__.signInWithGoogleCalls.push({
      useCredentialManager: opts.useCredentialManager,
      skipNativeAuth: opts.skipNativeAuth,
    });
    const err: any = new Error("User cancelled sign in");
    err.code = 12501;
    throw err;
  });

  const { signInWithGoogle } = await import("@/lib/auth/authActions");
  try {
    await signInWithGoogle();
    assert.fail("Should have thrown on user cancel");
  } catch (e: any) {
    assert.ok(e.message.includes("cancelled"), "Error should propagate as cancellation");
  }

  assert.strictEqual(callCount, 1, "Should have exactly 1 call — no fallback on user cancel");

  console.log("  ✓ C: User cancel → NO fallback");
}

// ---------------------------------------------------------------------------
// Test D: Successful native token → signInWithCredential called
// ---------------------------------------------------------------------------
async function testDSuccessfulTokenExchange() {
  resetMocks();
  setSignInWithGoogleImpl(async (opts: any) => {
    g.__P0_AUTH_MOCKS__.signInWithGoogleCalls.push({
      useCredentialManager: opts.useCredentialManager,
      skipNativeAuth: opts.skipNativeAuth,
    });
    return { credential: { idToken: "mock-id-token", accessToken: "mock-access-token" } };
  });

  const { signInWithGoogle } = await import("@/lib/auth/authActions");
  await signInWithGoogle();

  assert.strictEqual(
    g.__P0_AUTH_MOCKS__.signInWithCredentialCalls.length,
    1,
    "signInWithCredential should be called exactly once after successful native token",
  );

  console.log("  ✓ D: Successful native token → Firebase JS signInWithCredential called");
}

// ---------------------------------------------------------------------------
// Test E: Successful login → no error thrown
// ---------------------------------------------------------------------------
async function testESuccessfulLoginNoError() {
  resetMocks();
  setSignInWithGoogleImpl(async (opts: any) => {
    g.__P0_AUTH_MOCKS__.signInWithGoogleCalls.push({
      useCredentialManager: opts.useCredentialManager,
      skipNativeAuth: opts.skipNativeAuth,
    });
    return { credential: { idToken: "mock-id-token", accessToken: "mock-access-token" } };
  });

  const { signInWithGoogle } = await import("@/lib/auth/authActions");
  let error: any = null;
  try {
    await signInWithGoogle();
  } catch (e) {
    error = e;
  }

  assert.strictEqual(error, null, "Successful login should not throw");

  console.log("  ✓ E: Successful login → no stale error propagated");
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------
async function run(): Promise<void> {
  let assertionCount = 0;

  await testASkipNativeAuth();
  assertionCount += 2;

  await testBCredentialManagerFallback();
  assertionCount += 5;

  await testCUserCancelNoFallback();
  assertionCount += 2;

  await testDSuccessfulTokenExchange();
  assertionCount += 1;

  await testESuccessfulLoginNoError();
  assertionCount += 1;

  console.log(`\nPASS p0-auth-skip-native-auth (${assertionCount} assertions)`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
