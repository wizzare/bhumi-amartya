import assert from "node:assert";
import { classifyGoogleSignInError } from "@/lib/auth/classifyGoogleSignInError";

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
  assert.strictEqual(resultEmail.message, "Error for [EMAIL]");
  assertionCount += 1;

  // Case 5: Stage FIREBASE_CREDENTIAL_EXCHANGE -> FIREBASE_CREDENTIAL_ERROR
  const errorFirebase = { message: "Some internal error" };
  const resultFirebase = classifyGoogleSignInError(errorFirebase, "FIREBASE_CREDENTIAL_EXCHANGE");
  assert.strictEqual(resultFirebase.category, "FIREBASE_CREDENTIAL_ERROR");
  assertionCount += 1;

  console.log(`PASS classifyGoogleSignInError (${assertionCount} assertions)`);
}

void run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
