import assert from "node:assert";
import { classifyGoogleSignInError, GoogleSignInFailure, googleSignInCategoryMessage } from "@/lib/auth/classifyGoogleSignInError";
import { readFileSync } from "node:fs";

async function run(): Promise<void> {
  let assertionCount = 0;

  // Case 1: Code 10 -> DEVELOPER_ERROR
  const error10 = { code: 10 };
  const result10 = classifyGoogleSignInError(error10, "NATIVE_GOOGLE_SIGN_IN");
  assert.strictEqual(result10.category, "DEVELOPER_ERROR");
  assert.strictEqual(result10.stage, "NATIVE_GOOGLE_SIGN_IN");
  assertionCount += 2;

  // Case 2: Code 12501 -> SIGN_IN_CANCELLED
  const errorCancel = { code: 12501 };
  const resultCancel = classifyGoogleSignInError(errorCancel);
  assert.strictEqual(resultCancel.category, "SIGN_IN_CANCELLED");
  assertionCount += 1;

  // Case 3: "No credentials available" -> NO_CREDENTIAL
  const errorNoCred = { message: "No credentials available" };
  const resultNoCred = classifyGoogleSignInError(errorNoCred);
  assert.strictEqual(resultNoCred.category, "NO_CREDENTIAL");
  assertionCount += 1;

  // Case 4: Sanitize email
  const errorEmail = { message: "Error for test@gmail.com" };
  const resultEmail = classifyGoogleSignInError(errorEmail);
  assert.strictEqual(resultEmail.message, "UNKNOWN");
  assertionCount += 1;

  // Case 5: Stage FIREBASE_CREDENTIAL_EXCHANGE -> FIREBASE_CREDENTIAL_ERROR
  const errorFirebase = { message: "Some internal error" };
  const resultFirebase = classifyGoogleSignInError(errorFirebase, "FIREBASE_CREDENTIAL_EXCHANGE");
  assert.strictEqual(resultFirebase.category, "FIREBASE_CREDENTIAL_ERROR");
  assertionCount += 1;

  for (const input of [undefined, null, false, 10, Symbol("test"), [], {}, { message: 42 }, { message: {} }, { code: {}, errorMessage: [] }]) {
    assert.strictEqual(classifyGoogleSignInError(input).category, "UNKNOWN");
    assertionCount++;
  }

  for (const input of ["DEVELOPER_ERROR", "ApiException: 10:", "code 10", "statusCode=10", "10", { errorMessage: "DEVELOPER_ERROR" }, { statusCode: "10" }]) {
    assert.strictEqual(classifyGoogleSignInError(input).category, "DEVELOPER_ERROR");
    assertionCount++;
  }

  for (const input of [{ code: "CANCELLED" }, { code: "auth/popup-closed-by-user" }, { code: 16 }, "getCredentialException: user cancelled"] ) {
    assert.strictEqual(classifyGoogleSignInError(input).category, "SIGN_IN_CANCELLED");
    assertionCount++;
  }

  for (const input of [{ code: 7 }, { code: "NETWORK_ERROR" }, { code: "auth/network-request-failed" }, "getCredentialException: network connection failed"]) {
    assert.strictEqual(classifyGoogleSignInError(input).category, "NETWORK_ERROR");
    assertionCount++;
  }

  for (const [input, category] of [
    ["Credential Manager unavailable", "CREDENTIAL_MANAGER_ERROR"],
    ["getCredentialException", "CREDENTIAL_MANAGER_ERROR"],
    ["NoCredentialException", "NO_CREDENTIAL"],
    ["code 100", "UNKNOWN"],
    [{ code: 12500 }, "SIGN_IN_FAILED"],
  ] as const) {
    assert.strictEqual(classifyGoogleSignInError(input).category, category);
    assertionCount++;
  }

  for (const stage of ["NATIVE_GOOGLE_SIGN_IN", "ID_TOKEN_RETRIEVAL", "FIREBASE_CREDENTIAL_EXCHANGE", "PROFILE_PROVISIONING"] as const) {
    const diagnostic = classifyGoogleSignInError({ code: "secret-token", message: "uid=synthetic email=test@example.invalid token=secret-token" }, stage, false);
    const failure = new GoogleSignInFailure(diagnostic);
    const uiDiagnostic = classifyGoogleSignInError(failure);
    assert.strictEqual(uiDiagnostic, diagnostic);
    assert.strictEqual(uiDiagnostic.stage, stage);
    assert.strictEqual(uiDiagnostic.credentialManagerEnabled, false);
    assert.strictEqual(uiDiagnostic.nativeFlow, "legacy_fallback");
    assert.strictEqual(uiDiagnostic.code, null);
    assert.strictEqual(failure.message, diagnostic.category);
    assert.ok(!JSON.stringify(failure).includes("secret-token"));
    assert.ok(!JSON.stringify(failure).includes("test@example.invalid"));
    assert.ok(googleSignInCategoryMessage(uiDiagnostic.category).length > 0);
    assertionCount += 9;
  }

  assert.strictEqual(classifyGoogleSignInError({}, "UNKNOWN", true).nativeFlow, "credential_manager");
  assert.strictEqual(classifyGoogleSignInError({}, "UNKNOWN", undefined, "web_popup").nativeFlow, "web_popup");
  assert.strictEqual(classifyGoogleSignInError({ code: "auth/popup-timeout" }).code, "auth/popup-timeout");
  assertionCount += 3;

  const telemetry = readFileSync("lib/auth/authTelemetry.ts", "utf8").split("export async function recordGoogleSignInDiagnostic")[1];
  assert.ok(telemetry.indexOf("console.error") < telemetry.indexOf("await getRuntimeBuildInfo"));
  assert.ok(telemetry.includes("credentialManagerEnabled ?? null"));
  assert.ok(!/\buid\b|classifiedError\.message|catch \(error\)/.test(telemetry));
  for (const field of ["provider", "category", "code", "stage", "nativeFlow", "credentialManagerEnabled"]) {
    assert.ok(telemetry.includes(`${field}: classifiedError.${field}`));
    assertionCount++;
  }
  assertionCount += 3;

  const actions = readFileSync("lib/auth/authActions.ts", "utf8");
  assert.ok(actions.includes("let useCredentialManager = true"));
  assert.ok(actions.includes('classified.category === "CREDENTIAL_MANAGER_ERROR" || classified.category === "NO_CREDENTIAL"'));
  assert.ok(actions.includes("useCredentialManager = false"));
  assert.ok(actions.includes("stage: classified.stage"));
  const login = readFileSync("app/login/page.tsx", "utf8");
  assert.ok(login.includes("googleSignInCategoryMessage(classifyGoogleSignInError(err).category)"));
  assertionCount += 5;

  console.log(`PASS classifyGoogleSignInError (${assertionCount} assertions)`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
