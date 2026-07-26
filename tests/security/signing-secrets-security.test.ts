import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

let passed = 0;

function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed++;
  console.log(`PASS: ${label}`);
}

const gradleProps = readFileSync(resolve("android/gradle.properties"), "utf8");

// Verify no real signing values remain in tracked gradle.properties
test("BHUMI_RELEASE_STORE_FILE not in gradle.properties", !/^BHUMI_RELEASE_STORE_FILE\s*=.+/m.test(gradleProps));

// Key alias should not be present
test("BHUMI_RELEASE_KEY_ALIAS not in gradle.properties", !/^BHUMI_RELEASE_KEY_ALIAS\s*=.+/m.test(gradleProps));

// Store password should not be present
test("BHUMI_RELEASE_STORE_PASSWORD not in gradle.properties", !/^BHUMI_RELEASE_STORE_PASSWORD\s*=.+/m.test(gradleProps));

// Key password should not be present
test("BHUMI_RELEASE_KEY_PASSWORD not in gradle.properties", !/^BHUMI_RELEASE_KEY_PASSWORD\s*=.+/m.test(gradleProps));

// No keystore binary tracked
const trackedKeystores = (() => {
  const { execSync } = require("child_process");
  try {
    const out = execSync("git ls-files '*.jks' '*.keystore' '*.p12' '*.pfx' '*.pem'", { encoding: "utf8", cwd: resolve(".") });
    return out.trim().split("\n").filter(Boolean);
  } catch { return []; }
})();
test("no keystore binary tracked", trackedKeystores.length === 0);

// Verify example file exists with placeholder values
const exampleExists = existsSync(resolve("android/keystore.properties.example"));
test("keystore.properties.example exists", exampleExists);

if (exampleExists) {
  const exampleContent = readFileSync(resolve("android/keystore.properties.example"), "utf8");
  test("example file uses placeholder path", /\/path\/to\/your/.test(exampleContent));
  test("example file uses placeholder alias", /<your-key-alias>/.test(exampleContent));
  test("example file uses placeholder password", /<store-password>/.test(exampleContent));
  test("example file uses placeholder key password", /<key-password>/.test(exampleContent));
  test("example file has no real path", !/shein/.test(exampleContent));
  test("example file has no real alias", !/bhumi-amartya(?!\.jks)/.test(exampleContent));
}

// Verify local properties file is gitignored
const gitignore = existsSync(resolve(".gitignore")) ? readFileSync(resolve(".gitignore"), "utf8") : "";
const hasGitignore = gitignore.length > 0;
if (hasGitignore) {
  test(".gitignore covers keystore.properties", /keystore\.properties/.test(gitignore));
  test(".gitignore covers .jks files", /\.jks/.test(gitignore));
}

// Verify build.gradle does not log signing values
const buildGradle = readFileSync(resolve("android/app/build.gradle"), "utf8");
test("build.gradle does not print keystoreFile", !buildGradle.includes("println") || !buildGradle.includes("keystoreFile"));
test("build.gradle does not print signing credentials", !(/storePassword/.test(buildGradle) && /println/.test(buildGradle)));
test("build.gradle reads env vars", buildGradle.includes("System.getenv('BHUMI_RELEASE_STORE_FILE')"));
test("build.gradle falls back to local props", buildGradle.includes("keystore.properties"));

console.log(`\n${passed} signing security tests passed`);
