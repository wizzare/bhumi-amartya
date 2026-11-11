/**
 * Self-contained QA/emulator fail-closed guard for standalone Vercel billing-verifier deployments.
 */
const LOOPBACK_RE = /^(127\.0\.0\.1|localhost):\d+$/;

function isLocalEmulatorTestHarness(): boolean {
  if (typeof window !== "undefined") return false;
  if (process.env.NODE_ENV === "production") return false;
  if (process.env.BHUMI_QA_HARNESS !== "true") return false;
  if (process.env.BHUMI_RELEASE_SUITE_KIND !== "emulator") return false;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || "";
  const fsHost = process.env.FIRESTORE_EMULATOR_HOST || "";
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "";
  return (
    projectId.startsWith("demo-") &&
    LOOPBACK_RE.test(fsHost) &&
    LOOPBACK_RE.test(authHost)
  );
}

export function assertQaOperationAllowed(): void {
  if (isLocalEmulatorTestHarness()) return;

  const qaMode =
    process.env.NEXT_PUBLIC_QA_MODE ||
    process.env.BHUMI_QA_MODE ||
    process.env.NEXT_PUBLIC_QA_CANDIDATE ||
    process.env.BHUMI_QA_CONFIG;

  if (qaMode !== undefined || process.env.BHUMI_LOCAL_QA === "1" || process.env.ENABLE_QA_LOGIN === "true") {
    throw new Error("QA_RUNTIME_DISABLED");
  }

  if (
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST
  ) {
    throw new Error("QA_RUNTIME_DISABLED");
  }
}
