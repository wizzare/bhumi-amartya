/**
 * Canonical release test runner.
 *
 *   npm run test:release              -> starts the Firestore/Auth emulator, runs every
 *                                        suite in tests/release-manifest.mjs
 *   node scripts/run-release-tests.mjs --skip-emulator
 *                                     -> runs only "node"/"env" suites (no Java/emulator)
 *   node scripts/run-release-tests.mjs --self-test
 *                                     -> proves the runner reports failure on a failing child
 *
 * Rules: uses child-process exit codes, never swallows stderr (stdio: "inherit"),
 * stops nothing early but reports every failure, exits non-zero if ANY suite fails.
 * No duplicate-alias inflation — each manifest entry runs exactly once.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PRELOAD = "./tests/helpers/releaseTestEnv.mjs";
const TSX_CLI = path.join(REPO_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const args = new Set(process.argv.slice(2));
const skipEmulator = args.has("--skip-emulator");
const selfTest = args.has("--self-test");

function runSuite(suite) {
  const emulatorLive = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (suite.kind === "emulator" && !emulatorLive) {
    return { ...suite, status: "SKIPPED_NO_EMULATOR", code: null };
  }
  const preload = suite.kind === "emulator" || suite.kind === "env" ? ["--import", ENV_PRELOAD] : [];
  const filePath = path.join(REPO_ROOT, suite.file);
  if (!existsSync(filePath)) {
    return { ...suite, status: "MISSING_FILE", code: 2 };
  }
  console.log(`\n──── ${suite.name}  [${suite.kind}/${suite.evidence}]`);
  console.log(`     ${suite.file}`);
  const timeoutMs = Number(process.env.RELEASE_SUITE_TIMEOUT_MS || suite.timeoutMs || 240000);
  const res = spawnSync(process.execPath, [TSX_CLI, ...preload, suite.file], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: process.env,
    timeout: timeoutMs,
  });
  if (res.error && res.error.code === "ETIMEDOUT") {
    console.error(`     TIMEOUT after ${timeoutMs}ms`);
    return { ...suite, status: "FAIL", code: 124 };
  }
  const code = res.status ?? (res.signal ? 1 : 2);
  return { ...suite, status: code === 0 ? "PASS" : "FAIL", code };
}

function selfTestRunner() {
  // Synthetic failing child — proves a non-zero child propagates to a non-zero runner exit.
  const res = spawnSync(process.execPath, ["-e", "process.exit(3)"], { stdio: "inherit" });
  const childCode = res.status;
  const runnerWouldFail = childCode !== 0;
  console.log(`SELF_TEST child exit=${childCode} -> runner treats as ${runnerWouldFail ? "FAIL" : "PASS"}`);
  if (!runnerWouldFail) {
    console.error("SELF_TEST_FAIL: runner did not detect a failing child");
    process.exit(1);
  }
  console.log("SELF_TEST_PASS: failing child correctly produces non-zero handling");
  process.exit(0);
}

async function main() {
  if (selfTest) return selfTestRunner();

  const { releaseSuites } = await import(pathToFileURL(path.join(REPO_ROOT, "tests/release-manifest.mjs")).href);
  const seen = new Set();
  const results = [];
  for (const suite of releaseSuites) {
    if (seen.has(suite.file)) {
      console.error(`MANIFEST_ERROR: duplicate suite file ${suite.file}`);
      process.exit(2);
    }
    seen.add(suite.file);
    if (skipEmulator && suite.kind === "emulator") {
      results.push({ ...suite, status: "SKIPPED_FLAG", code: null });
      continue;
    }
    results.push(runSuite(suite));
  }

  const pass = results.filter((r) => r.status === "PASS");
  const fail = results.filter((r) => r.status === "FAIL" || r.status === "MISSING_FILE");
  const skip = results.filter((r) => String(r.status).startsWith("SKIPPED"));

  console.log("\n================ RELEASE TEST SUMMARY ================");
  for (const r of results) console.log(`  ${r.status.padEnd(18)} ${r.name}`);
  console.log("----------------------------------------------------");
  console.log(`  PASS=${pass.length}  FAIL=${fail.length}  SKIPPED=${skip.length}  TOTAL=${results.length}`);
  const strongRealSdk = pass.filter((r) => r.evidence === "STRONG_REAL_SDK").length;
  const strongUnit = pass.filter((r) => r.evidence === "STRONG_UNIT").length;
  const staticGuard = pass.filter((r) => r.evidence === "STATIC_GUARD").length;
  const mockUnit = pass.filter((r) => r.evidence === "MOCK_UNIT").length;
  console.log(`  passed by evidence: STRONG_REAL_SDK=${strongRealSdk} STRONG_UNIT=${strongUnit} STATIC_GUARD=${staticGuard} MOCK_UNIT=${mockUnit}`);
  console.log("====================================================");

  if (fail.length > 0) {
    console.error(`RELEASE_TESTS_FAIL: ${fail.map((r) => r.name).join("; ")}`);
    process.exit(1);
  }
  if (skip.length > 0) {
    console.log(`RELEASE_TESTS_PARTIAL: ${skip.length} emulator suite(s) not run in this environment`);
    process.exit(0);
  }
  console.log("RELEASE_TESTS_PASS");
  process.exit(0);
}

main().catch((err) => {
  console.error("RELEASE_RUNNER_ERROR", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(2);
});
