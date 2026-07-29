import assert from "node:assert";
import { config } from "dotenv";

config({ path: ".env.local" });

let assertions = 0;

function equal<T>(actual: T, expected: T, message: string): void {
  assertions += 1;
  assert.strictEqual(actual, expected, message);
}

async function run(): Promise<void> {
  const {
    GooglePopupTimeoutError,
    waitForGooglePopupResult,
  } = await import("../../lib/auth/authActions.ts");

  equal(
    await waitForGooglePopupResult(Promise.resolve("signed-in"), 25),
    "signed-in",
    "a settled Google popup result resolves unchanged",
  );

  const popupFailure = new Error("popup failed");
  await assert.rejects(
    waitForGooglePopupResult(Promise.reject(popupFailure), 25),
    (error: unknown) => error === popupFailure,
    "a Firebase popup rejection is preserved",
  );
  assertions += 1;

  await assert.rejects(
    waitForGooglePopupResult(new Promise<never>(() => undefined), 10),
    (error: unknown) => error instanceof GooglePopupTimeoutError && error.code === "auth/popup-timeout",
    "a pending popup rejects with the explicit timeout error",
  );
  assertions += 1;

  console.log(`PASS google-popup-timeout (${assertions} assertions)`);
}

void run();
