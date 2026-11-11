/*
 * BHUMI QUALITY GATE — EVIDENCE-BASED VALIDATION RUNNER
 * Run: npm run quality:gate
 *
 * Strict Evidence Status Taxonomy (Phase 7):
 *   PASS       — check executed in THIS run and passed (exitCode === 0)
 *   FAIL       — check executed in THIS run and returned non-zero
 *   BLOCKED    — prerequisite unavailable in this environment (e.g. missing emulator JDK 21+ / ADB device)
 *   NOT_RUN    — check intentionally not executed in this invocation
 *   HISTORICAL — prior evidence only; NEVER promoted to PASS
 */

const { execSync, spawnSync } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const REPORTS_DIR = path.join(process.cwd(), "reports-qualitygate");
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function getGitInfo() {
  const runGit = (cmd) => {
    try {
      return execSync(cmd, { encoding: "utf8" }).trim();
    } catch {
      return "unknown";
    }
  };
  return {
    branch: runGit("git branch --show-current"),
    head: runGit("git rev-parse HEAD"),
  };
}

function runCommand(command, args, opts = {}) {
  const start = Date.now();
  const res = spawnSync(command, args, {
    cwd: opts.cwd || process.cwd(),
    encoding: "utf8",
    maxBuffer: 15 * 1024 * 1024,
    shell: process.platform === "win32",
    env: opts.env || process.env,
    timeout: opts.timeoutMs || 180000,
  });
  const durationMs = Date.now() - start;
  const exitCode = res.status ?? (res.error ? 1 : 2);
  const combined = `${res.stdout || ""}\n${res.stderr || ""}`.trim();
  return {
    exitCode,
    durationMs,
    outputTail: combined.split(/\r?\n/).slice(-12).join(" | ").slice(0, 350),
  };
}

function checkTypeScriptRoot() {
  const res = runCommand("npx", ["tsc", "--noEmit"]);
  return {
    name: "TYPESCRIPT_ROOT",
    status: res.exitCode === 0 ? "PASS" : "FAIL",
    exitCode: res.exitCode,
    command: "npx tsc --noEmit",
    detail: res.exitCode === 0 ? `tsc passed in ${res.durationMs}ms` : res.outputTail || "tsc failed",
  };
}

function checkTypeScriptBillingVerifier() {
  const verifierDir = path.join(process.cwd(), "services", "billing-verifier");
  if (!fs.existsSync(verifierDir)) {
    return {
      name: "TYPESCRIPT_BILLING_VERIFIER",
      status: "BLOCKED",
      exitCode: null,
      command: "npm --prefix services/billing-verifier run typecheck",
      detail: "services/billing-verifier directory missing",
    };
  }
  const res = runCommand("npm", ["--prefix", "services/billing-verifier", "run", "typecheck"]);
  return {
    name: "TYPESCRIPT_BILLING_VERIFIER",
    status: res.exitCode === 0 ? "PASS" : "FAIL",
    exitCode: res.exitCode,
    command: "npm --prefix services/billing-verifier run typecheck",
    detail: res.exitCode === 0 ? `verifier tsc passed in ${res.durationMs}ms` : res.outputTail || "verifier tsc failed",
  };
}

function checkEslintCore() {
  const res = runCommand("npx", [
    "eslint",
    "components/ui/BhumiPageHeader.tsx",
    "components/dashboard/DashboardHeader.tsx",
    "components/blueprint/NatalChartWheel.tsx",
    "components/blueprint/HumanDesignBodygraphLite.tsx",
    "app/blueprint/natal-chart/page.tsx",
    "lib/antiAbuse",
    "lib/billing/canonicalAccessBootstrap.ts",
    "components/auth/AccessGuard.tsx",
    "components/auth/PremiumLock.tsx",
    "app/premium-bhumi/page.tsx",
    "app/api/access/bootstrap-trial/route.ts",
  ]);
  return {
    name: "ESLINT_MODIFIED_SCOPE",
    status: res.exitCode === 0 ? "PASS" : "FAIL",
    exitCode: res.exitCode,
    command: "npx eslint <vc122-modified-scope>",
    detail: res.exitCode === 0 ? `0 errors (${res.durationMs}ms)` : res.outputTail || "eslint failed",
  };
}

function checkUnitSuites() {
  const tsxCli = path.join("node_modules", "tsx", "dist", "cli.mjs");
  const suites = [
    "tests/unit/dashboard-design1-invariants.test.ts",
    "tests/unit/build119-bp04-final-gate.test.ts",
    "tests/unit/build119-bp03-d5-page-audit.test.ts",
    "tests/unit/build108-cdi02-hd-advanced-variables.test.ts",
    "tests/unit/version-reconciliation.test.ts",
    "tests/unit/build122-anti-abuse-matrix.test.ts",
    "tests/unit/billing-entitlement-contract.test.ts",
    "tests/unit/billing-entitlement-presentation.test.ts",
    "tests/unit/build121-sprint02-billing-verifier.test.ts",
    "tests/unit/build126r3-entitlement-forgery.test.ts",
    "tests/unit/p0-01-accessguard-hardening.test.ts",
  ];
  const res = runCommand("node", [tsxCli, "--import", "./tests/helpers/initTestEnv.ts", "--test", ...suites]);
  return {
    name: "UNIT_AND_SECURITY_SUITES",
    status: res.exitCode === 0 ? "PASS" : "FAIL",
    exitCode: res.exitCode,
    command: `node ${tsxCli} --import ./tests/helpers/initTestEnv.ts --test (${suites.length} files)`,
    detail: res.exitCode === 0 ? `All ${suites.length} suites passed (${res.durationMs}ms)` : res.outputTail || "unit suites failed",
  };
}

function checkAndroidArtifact() {
  const gradlePath = path.join(process.cwd(), "android", "app", "build.gradle");
  const aabPath = path.join(
    process.cwd(),
    "android",
    "app",
    "build",
    "outputs",
    "bundle",
    "release",
    "app-release.aab",
  );
  if (!fs.existsSync(gradlePath)) {
    return {
      name: "ANDROID_BUNDLE_ARTIFACT",
      status: "BLOCKED",
      exitCode: null,
      command: "stat android/app/build/outputs/bundle/release/app-release.aab",
      detail: "android/app/build.gradle not found",
    };
  }
  const gradleSrc = fs.readFileSync(gradlePath, "utf8");
  const versionCode = gradleSrc.match(/versionCode\s+(\d+)/)?.[1] || "unknown";
  const versionName = gradleSrc.match(/versionName\s+"([^"]+)"/)?.[1] || "unknown";

  if (!fs.existsSync(aabPath)) {
    return {
      name: "ANDROID_BUNDLE_ARTIFACT",
      status: "NOT_RUN",
      exitCode: null,
      command: "stat android/app/build/outputs/bundle/release/app-release.aab",
      detail: `AAB not yet built for versionCode=${versionCode} (${versionName})`,
    };
  }

  const stat = fs.statSync(aabPath);
  const hash = crypto.createHash("sha256").update(fs.readFileSync(aabPath)).digest("hex");
  return {
    name: "ANDROID_BUNDLE_ARTIFACT",
    status: "PASS",
    exitCode: 0,
    command: "sha256 app-release.aab",
    detail: `versionCode=${versionCode} (${versionName}), bytes=${stat.size}, mtime=${stat.mtime.toISOString()}, sha256=${hash}`,
  };
}

function checkEmulatorStatus() {
  const hasEmulatorHost = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  return {
    name: "FIREBASE_EMULATOR_SUITE",
    status: hasEmulatorHost ? "NOT_RUN" : "BLOCKED",
    exitCode: null,
    command: "npm run test:release",
    detail: hasEmulatorHost
      ? "Emulator detected; invoke npm run test:release directly"
      : "Requires active Firebase Auth/Firestore emulator + JDK 21+",
  };
}

function runGate() {
  const git = getGitInfo();
  const categories = [
    checkTypeScriptRoot(),
    checkTypeScriptBillingVerifier(),
    checkEslintCore(),
    checkUnitSuites(),
    checkAndroidArtifact(),
    checkEmulatorStatus(),
  ];

  const mandatoryNames = new Set([
    "TYPESCRIPT_ROOT",
    "TYPESCRIPT_BILLING_VERIFIER",
    "ESLINT_MODIFIED_SCOPE",
    "UNIT_AND_SECURITY_SUITES",
  ]);
  const mandatoryFailed = categories.some((c) => mandatoryNames.has(c.name) && c.status !== "PASS");
  const devGate = mandatoryFailed ? "DEVELOPMENT GATE FAIL" : "DEVELOPMENT GATE PASS";

  const aabReady = categories.find((c) => c.name === "ANDROID_BUNDLE_ARTIFACT")?.status === "PASS";
  const releaseGate = mandatoryFailed || !aabReady ? "RELEASE GATE BLOCKED" : "RELEASE CANDIDATE LOCAL PASS (FOUNDER REVIEW REQUIRED)";

  const lines = [
    "BHUMI QUALITY GATE — EVIDENCE-BASED VALIDATION REPORT",
    "======================================================",
    `Date: ${new Date().toISOString()}`,
    `Branch: ${git.branch}`,
    `HEAD: ${git.head}`,
    "",
    ...categories.map(
      (c) =>
        `  ${c.name}: ${c.status} (exit=${c.exitCode ?? "N/A"}) — ${c.detail}\n    cmd: ${c.command}`,
    ),
    "",
    `DEVELOPMENT GATE: ${devGate}`,
    `RELEASE GATE: ${releaseGate}`,
    "",
    "EVIDENCE POLICY: Only PASS/FAIL/BLOCKED/NOT_RUN/HISTORICAL are permitted; no historical evidence is promoted to PASS.",
  ];

  const reportPath = path.join(REPORTS_DIR, "BHUMI_QUALITY_GATE_REPORT.md");
  fs.writeFileSync(reportPath, lines.join("\n") + "\n", "utf8");
  console.log(lines.join("\n"));

  process.exit(mandatoryFailed ? 1 : 0);
}

runGate();
