import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const serviceSource = readFileSync(resolve("lib/services/appUpdateService.ts"), "utf8");
const checkerSource = readFileSync(resolve("components/global/VersionChecker.tsx"), "utf8");
const helperStart = serviceSource.indexOf("export function normalizeNativeAppUpdateResult");
const helperEnd = serviceSource.indexOf("/**", helperStart);
assert.notEqual(helperStart, -1, "native update normalization helper exists");
assert.notEqual(helperEnd, -1, "native update helper boundary exists");

const compiled = ts.transpileModule(serviceSource.slice(helperStart, helperEnd), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const helperModule = { exports: {} as Record<string, unknown> };
new Function("exports", "module", compiled.outputText)(helperModule.exports, helperModule);

const normalize = helperModule.exports.normalizeNativeAppUpdateResult as (value: unknown) => Record<string, unknown>;
const runCheck = helperModule.exports.runNativeAppUpdateCheck as (
  check: () => Promise<unknown>,
  logWarning?: (message: string, error: unknown) => void,
) => Promise<{ native: Record<string, unknown>; succeeded: boolean }>;

let passed = 0;
function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed += 1;
  console.log(`PASS: ${label}`);
}

async function main() {
  test("undefined native result normalizes safely", Object.keys(normalize(undefined)).length === 0);
  test("null native result normalizes safely", Object.keys(normalize(null)).length === 0);
  test("result lacking downloaded remains safe", normalize({ available: false }).downloaded === undefined);

  const noUpdate = await runCheck(async () => ({}));
  test("normal no-update result completes successfully", noUpdate.succeeded && Object.keys(noUpdate.native).length === 0);

  const available = await runCheck(async () => ({ available: true, flexibleAllowed: true, state: "available" }));
  test("available-update fields are preserved", available.succeeded && available.native.available === true && available.native.state === "available");

  const warnings: Array<{ message: string; error: unknown }> = [];
  const expectedError = new Error("synthetic native rejection");
  const rejected = await runCheck(async () => { throw expectedError; }, (message, error) => warnings.push({ message, error }));
  test("plugin rejection resolves to controlled fallback", !rejected.succeeded && Object.keys(rejected.native).length === 0);
  test("real plugin error remains logged", warnings.length === 1 && warnings[0].error === expectedError && warnings[0].message.includes("local fallback"));
  test("plugin rejection does not become an unhandled rejection", rejected.native !== undefined);

  test("VersionChecker settles loading in finally", checkerSource.includes("} finally {") && checkerSource.includes("setIsChecking(false)"));
  test("empty placeholder is limited to active checking", checkerSource.includes("if (isChecking)"));
  test("failed update check renders the application", checkerSource.includes("if (!updateStatus) return <>{children}</>"));
  test("native available-update policy remains present", serviceSource.includes("native.downloaded || native.downloading || native.immediateInProgress || native.available"));

  console.log(`${passed} tests passed`);
}

void main();
