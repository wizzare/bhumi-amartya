import { readFileSync } from "fs";
import { resolve } from "path";
import {
  CURRENT_BUILD_NUMBER,
  CURRENT_VERSION_CODE,
  CURRENT_VERSION_NAME,
} from "../../lib/config/buildInfo";
import {
  APP_VERSION,
  formatReleaseName,
  RELEASE_NAME,
} from "../../src/lib/version";

console.log("Running Build 105 version reconciliation tests\n");

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

// 1. The visible release label derives from canonical BuildInfo.
const versionContent = readFileSync(resolve(__dirname, "../../src/lib/version.ts"), "utf8");
const layoutContent = readFileSync(resolve(__dirname, "../../app/layout.tsx"), "utf8");

test("APP_VERSION is canonical 5.0.5", APP_VERSION === "5.0.5", `got "${APP_VERSION}"`);
test("APP_VERSION derives from CURRENT_VERSION_NAME", APP_VERSION === CURRENT_VERSION_NAME);
test(
  "RELEASE_NAME is canonical V5 Build 105",
  RELEASE_NAME === "BHUMI AMARTYA V5 BUILD 105",
  `got "${RELEASE_NAME}"`,
);
test(
  "release-name helper uses canonical version and build",
  formatReleaseName(CURRENT_VERSION_NAME, CURRENT_BUILD_NUMBER) === RELEASE_NAME,
);
test("version.ts imports CURRENT_VERSION_NAME", versionContent.includes("CURRENT_VERSION_NAME"));
test("version.ts imports CURRENT_BUILD_NUMBER", versionContent.includes("CURRENT_BUILD_NUMBER"));
test("version.ts does not import package.json", !versionContent.includes("package.json"));
test("active version source has no stale 4.4.5", !versionContent.includes("4.4.5"));
test("active version source has no stale V4 BUILD 82", !versionContent.includes("V4 BUILD 82"));
test("active display is not Build 104", !`${APP_VERSION} ${RELEASE_NAME}`.includes("5.0.4 BHUMI AMARTYA V5 BUILD 104"));
test(
  "root layout renders the canonical version exports",
  /Versi:\s*\{APP_VERSION\}\s*\{RELEASE_NAME\}/.test(layoutContent),
);
test("root layout has no stale 4.4.5", !layoutContent.includes("4.4.5"));
test("root layout has no stale V4 BUILD 82", !layoutContent.includes("V4 BUILD 82"));

// 2. Canonical BuildInfo is Build 105.
test("CURRENT_VERSION_NAME is 5.0.5", CURRENT_VERSION_NAME === "5.0.5");
test("CURRENT_VERSION_CODE is 105", CURRENT_VERSION_CODE === 105);
test("CURRENT_BUILD_NUMBER is 105", CURRENT_BUILD_NUMBER === "105");

// 3. Android release metadata is Build 105 and matches BuildInfo.
const gradleContent = readFileSync(resolve(__dirname, "../../android/app/build.gradle"), "utf8");
const androidVersionName = gradleContent.match(/versionName\s*"([^"]+)"/)?.[1];
const androidVersionCode = gradleContent.match(/versionCode\s+(\d+)/)?.[1];

test("android versionName is 5.0.5", androidVersionName === "5.0.5", `got "${androidVersionName}"`);
test("android versionCode is 105", androidVersionCode === "105", `got "${androidVersionCode}"`);
test("Android and display version names agree", androidVersionName === APP_VERSION);
test("Android versionCode matches canonical build number", androidVersionCode === CURRENT_BUILD_NUMBER);

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

if (failed > 0) process.exit(1);
