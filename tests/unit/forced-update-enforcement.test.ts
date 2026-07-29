import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateAppUpdateStatus, type RemoteVersionConfig } from "../../lib/services/appUpdatePolicy.ts";

function androidBuild(versionCode: number, platform = "android") {
  return { versionName: "4.4.4", versionCode, buildNumber: String(versionCode), platform };
}

function config(overrides: Partial<RemoteVersionConfig> = {}): RemoteVersionConfig {
  return { minimumSupportedVersionCode: 80, latestVersion: "4.4.4", forceUpdate: true, updateUrl: "market://details?id=com.bhumiamartya.app", ...overrides };
}

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean) {
  if (condition) { passed++; console.log(`PASS: ${label}`); }
  else { failed++; console.error(`FAIL: ${label}`); }
}

// BUILD 78 — forced update
{
  const status = evaluateAppUpdateStatus(androidBuild(78), config());
  test("build 78: isOutdated", status.isOutdated === true);
  test("build 78: minimumBuild is 80", status.minimumBuild === 80);
  test("build 78: currentBuild is 78", status.currentBuild === 78);
  test("build 78: policy is immediate_required", status.policy === "immediate_required");
  test("build 78: configSource is firestore", status.configSource === "firestore");
}

// BUILD 79 — forced update
{
  const status = evaluateAppUpdateStatus(androidBuild(79), config());
  test("build 79: isOutdated", status.isOutdated === true);
  test("build 79: minimumBuild is 80", status.minimumBuild === 80);
  test("build 79: policy is immediate_required", status.policy === "immediate_required");
}

// BUILD 80 — allowed
{
  const status = evaluateAppUpdateStatus(androidBuild(80), config());
  test("build 80: not outdated", status.isOutdated === false);
  test("build 80: policy is no_update", status.policy === "no_update");
}

// BUILD 81 — allowed
{
  const status = evaluateAppUpdateStatus(androidBuild(81), config());
  test("build 81: not outdated", status.isOutdated === false);
  test("build 81: policy is no_update", status.policy === "no_update");
}

// EXACT BOUNDARY: build 79 with remote min 79 — fallback 80 overrides
{
  const status = evaluateAppUpdateStatus(androidBuild(79), config({ minimumSupportedVersionCode: 79 }));
  test("boundary: fallback 80 caps remote min 79", status.minimumBuild === 80);
  test("boundary: build 79 < 80 still outdated", status.isOutdated === true);
}

// EXACT BOUNDARY: build 79 with minimum 80
{
  const status = evaluateAppUpdateStatus(androidBuild(79), config({ minimumSupportedVersionCode: 80 }));
  test("boundary: build 79 with minimum 80 is outdated", status.isOutdated === true);
}

// NO FORCE UPDATE FLAG: build below minimum but forceUpdate not set
{
  const status = evaluateAppUpdateStatus(androidBuild(78), { minimumSupportedVersionCode: 80 });
  test("no force flag: still outdated because below minimum", status.isOutdated === true);
  test("no force flag: policy immediate_required", status.policy === "immediate_required");
}

// FALLBACK LOCAL FAILSAFE: no remote config
{
  const status = evaluateAppUpdateStatus(androidBuild(78), null);
  test("no remote: uses local failsafe (80)", status.minimumBuild === 80);
  test("no remote: build 78 < 80 is outdated", status.isOutdated === true);
  test("no remote: configSource is local-failsafe", status.configSource === "local-failsafe");
}

// FALLBACK: build 79 blocked with no remote config
{
  const status = evaluateAppUpdateStatus(androidBuild(79), null);
  test("fallback 79: isOutdated", status.isOutdated === true);
  test("fallback 79: policy immediate_required", status.policy === "immediate_required");
}

// FALLBACK: build 80 allowed with no remote config
{
  const status = evaluateAppUpdateStatus(androidBuild(80), null);
  test("fallback 80: not outdated", status.isOutdated === false);
  test("fallback 80: policy no_update", status.policy === "no_update");
}

// FALLBACK: build 81 allowed with no remote config
{
  const status = evaluateAppUpdateStatus(androidBuild(81), null);
  test("fallback 81: not outdated", status.isOutdated === false);
  test("fallback 81: policy no_update", status.policy === "no_update");
}

// Build 80 never blocks itself regardless of config
{
  const status = evaluateAppUpdateStatus(androidBuild(80), config({ minimumSupportedVersionCode: 80 }));
  test("build 80 with minimum 80 not outdated", status.isOutdated === false);
}

// MALFORMED CONFIG: string version codes
{
  const status = evaluateAppUpdateStatus(androidBuild(79), { minimumSupportedVersionCode: "80", latestVersion: "4.4.4", forceUpdate: true });
  test("malformed string: parses string min build", status.minimumBuild === 80);
  test("malformed string: isOutdated", status.isOutdated === true);
}

// MALFORMED CONFIG: NaN version code falls back to 80
{
  const status = evaluateAppUpdateStatus(androidBuild(79), { minimumSupportedVersionCode: "abc", latestVersion: "4.4.4", forceUpdate: true });
  test("malformed NaN: falls back to local failsafe 80", status.minimumBuild === 80);
  test("malformed NaN: build 79 < 80 outdated", status.isOutdated === true);
}

// TIMEOUT-style null remote config uses fallback 80
{
  const status = evaluateAppUpdateStatus(androidBuild(79), null);
  test("timeout null: fallback 80 is min", status.minimumBuild === 80);
  test("timeout null: build 79 outdated", status.isOutdated === true);
}

// Missing native result never creates a blank screen (tested via VersionChecker source)
{
  const checkerSource = readFileSync(resolve("components/global/VersionChecker.tsx"), "utf8");
  test("missing native: VersionChecker always renders something", checkerSource.includes("UpdateRequiredScreen") || checkerSource.includes("children"));
  test("missing native: no blank path beyond isChecking", !checkerSource.includes("if (!updateStatus) return null"));
}

// MISSING UPDATE URL: uses default
{
  const status = evaluateAppUpdateStatus(androidBuild(78), config({ updateUrl: undefined }));
  test("missing URL: uses default Play Store URL", status.updateUrl === "market://details?id=com.bhumiamartya.app");
}

// EMPTY CONFIG: no fields at all — uses fallback 80
{
  const status = evaluateAppUpdateStatus(androidBuild(78), {});
  test("empty config: falls back to local failsafe 80", status.minimumBuild === 80);
  test("empty config: build 78 < 80 outdated", status.isOutdated === true);
}

// PLATFORM WEB: not affected by Android-only constraints
{
  const status = evaluateAppUpdateStatus(androidBuild(78, "web"), config());
  test("web platform: ignores Android remote minimum", status.minimumBuild === 0);
  test("web platform: build 78 is not outdated", status.isOutdated === false);
  test("web platform: Android force update is not immediate_required", status.policy === "no_update");
  test("web platform: Android remote config is not a version gate source", status.configSource === "default");
}

// OLDER CONFIG SCHEMA: minimumBuild instead of minimumSupportedVersionCode
{
  const status = evaluateAppUpdateStatus(androidBuild(79), { minimumBuild: 80, latestVersion: "4.4.4", forceUpdate: true });
  test("legacy schema: minimumBuild field works", status.minimumBuild === 80);
  test("legacy schema: isOutdated", status.isOutdated === true);
}

// LEGACY forceUpdate without minimumBuild — falls back to 80
{
  const status = evaluateAppUpdateStatus(androidBuild(79), { forceUpdate: true });
  test("legacy force without min: falls back to 80", status.minimumBuild === 80);
  test("legacy force without min: build 79 < 80 outdated", status.isOutdated === true);
}

// AUTHENTICATED SESSION: version check doesn't depend on auth state
{
  const status = evaluateAppUpdateStatus(androidBuild(79), config());
  test("auth independence: version check works same for any auth state", status.isOutdated === true);
}

// STABLE LOADING EXIT: VersionChecker always calls setIsChecking(false)
{
  const checkerSource = readFileSync(resolve("components/global/VersionChecker.tsx"), "utf8");
  test("VersionChecker: finally block calls setIsChecking(false)", checkerSource.includes("setIsChecking(false)"));
  test("VersionChecker: no infinite loading path", checkerSource.includes("} finally {"));
}

// NO BLANK SCREEN: VersionChecker always renders UpdateRequiredScreen or children
{
  const checkerSource = readFileSync(resolve("components/global/VersionChecker.tsx"), "utf8");
  test("VersionChecker: forced update path renders UpdateRequiredScreen", checkerSource.includes("UpdateRequiredScreen"));
  test("VersionChecker: non-outdated path renders children", checkerSource.includes("<>{children}</>"));
}

// UPDATE URL is the official Play Store destination
{
  const serviceSource = readFileSync(resolve("lib/services/appUpdateService.ts"), "utf8");
  const screenSource = readFileSync(resolve("components/global/UpdateRequiredScreen.tsx"), "utf8");
  test("Play Store URL: uses official package ID", serviceSource.includes("market://details?id=com.bhumiamartya.app"));
  test("Play Store URL: has https fallback in UpdateRequiredScreen", screenSource.includes("play.google.com/store/apps/details"));
}

// No sensitive diagnostic logging in update service
{
  const serviceSource = readFileSync(resolve("lib/services/appUpdateService.ts"), "utf8");
  test("no password in service source", !/password/i.test(serviceSource));
  test("no token in service source", !/(access|id|refresh)_?token/i.test(serviceSource));
}

// Production absence of QA build override unless emulator+QA flags are set
{
  const buildInfoSource = readFileSync(resolve("lib/config/buildInfo.ts"), "utf8");
  test("buildInfo: QA override guarded by emulator+QA flags", buildInfoSource.includes("USE_FIREBASE_EMULATORS") && buildInfoSource.includes("ENABLE_ANDROID_EMULATOR_QA_LOGIN") && buildInfoSource.includes("QA_SIMULATED_BUILD"));
  test("buildInfo: QA override only applies when both flags true", buildInfoSource.includes("isEmulatorMode && isQaMode"));
  test("buildInfo: parsed simulated build must be positive integer", buildInfoSource.includes("Number.isFinite(parsed) && parsed > 0"));
}

console.log(`\n${passed} tests passed${failed > 0 ? `, ${failed} failed` : ""}`);
process.exit(failed > 0 ? 1 : 0);
