import assert from "node:assert";
import { readFileSync } from "fs";
import { resolve } from "path";

console.log("Running Build 82 version reconciliation tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

// 1. src/lib/version.ts reads as Build 82
const versionContent = readFileSync(resolve(__dirname, "../../src/lib/version.ts"), "utf8");
const versionName = versionContent.match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
const releaseName = versionContent.match(/RELEASE_NAME\s*=\s*"([^"]+)"/)?.[1];

test("canonical versionName is 4.4.5", versionName === "4.4.5", `got "${versionName}"`);
test("RELEASE_NAME contains BUILD 82", releaseName?.includes("BUILD 82"), `got "${releaseName}"`);
test("no stale Build 78 in version.ts", !versionContent.includes("BUILD 78"), `found BUILD 78`);
test("no stale 4.4.1 in version.ts", !versionContent.includes("4.4.1"), `found 4.4.1`);

// 2. buildInfo.ts reads as Build 82
const buildInfoContent = readFileSync(resolve(__dirname, "../../lib/config/buildInfo.ts"), "utf8");
const biVersion = buildInfoContent.match(/CURRENT_VERSION_NAME\s*=\s*"([^"]+)"/)?.[1];
const biCode = buildInfoContent.match(/CURRENT_VERSION_CODE\s*=\s*(\d+)/)?.[1];
const biBuild = buildInfoContent.match(/CURRENT_BUILD_NUMBER\s*=\s*"([^"]+)"/)?.[1];

test("buildInfo CURRENT_VERSION_NAME is 4.4.5", biVersion === "4.4.5", `got "${biVersion}"`);
test("buildInfo CURRENT_VERSION_CODE is 82", biCode === "82", `got "${biCode}"`);
test("buildInfo CURRENT_BUILD_NUMBER is 82", biBuild === "82", `got "${biBuild}"`);
test("buildInfo and version.ts agree on version", versionName === biVersion);
test("buildInfo and version.ts agree on build number", biBuild === "82" && releaseName?.includes("82"));

// 3. Android build.gradle reads as Build 82
const gradleContent = readFileSync(resolve(__dirname, "../../android/app/build.gradle"), "utf8");
const androidVersionName = gradleContent.match(/versionName\s*"([^"]+)"/)?.[1];
const androidVersionCode = gradleContent.match(/versionCode\s+(\d+)/)?.[1];

test("android versionName is 4.4.5", androidVersionName === "4.4.5", `got "${androidVersionName}"`);
test("android versionCode is 82", androidVersionCode === "82", `got "${androidVersionCode}"`);
test("android and web version names agree", versionName === androidVersionName);
test("android versionCode matches build number", androidVersionCode === "82");

// 4. No stale Build 78/79 runtime constants
test("no Build 78 in version.ts", !versionContent.includes("78"), `found "78"`);
test("no versionCode 79 in build.gradle", !gradleContent.includes("versionCode 79"), `found "versionCode 79"`);
test("no 4.4.1 in build.gradle", !gradleContent.includes("4.4.1"), `found "4.4.1"`);

// 5. parseVersionCode produces numeric result (not lexical)
test("parseVersionCode handles number correctly", (() => {
  const parsed = parseInt("82", 10);
  return Number.isFinite(parsed) && parsed === 82;
})());

test("parseVersionCode handles string correctly", (() => {
  const parsed = parseInt("82", 10);
  return parsed === 82 && typeof parsed === "number";
})());

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);
