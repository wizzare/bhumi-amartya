import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";

const source = readFileSync(resolve("components/dev/EmulatorQaLogin.tsx"), "utf8");
const guardStart = source.indexOf("export function shouldShowEmulatorQaLogin");
const guardEnd = source.indexOf("export function EmulatorQaLogin", guardStart);
assert.notEqual(guardStart, -1, "QA login guard helper exists");
assert.notEqual(guardEnd, -1, "QA login guard helper boundary exists");
const compiled = ts.transpileModule(source.slice(guardStart, guardEnd), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});
const guardModule = { exports: {} as Record<string, unknown> };
new Function("exports", "module", compiled.outputText)(guardModule.exports, guardModule);
const shouldShow = guardModule.exports.shouldShowEmulatorQaLogin as (input: {
  nodeEnv: string | undefined;
  useFirebaseEmulators: string | undefined;
  enableAndroidQaLogin: string | undefined;
  isNativePlatform: boolean;
  platform: string;
}) => boolean;
let passed = 0;

function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed += 1;
  console.log(`PASS: ${label}`);
}

test("module-scope browser guard is removed", !source.includes("const showQaLogin =\n  typeof window"));
test("initial mounted state is false", source.includes("useState(false)"));
test("client mount enables the harness", source.includes("useEffect(() =>") && source.includes("setMounted(true)"));
test("SSR and initial hydration render null", source.includes("if (!mounted) return null"));
test("production web mode is denied by the guard", source.includes('nodeEnv !== "production"'));
test("only explicit emulator mode is allowed", source.includes('useFirebaseEmulators !== "true"'));
test("emulator mode uses direct public env access", source.includes("process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS"));
test("Android QA flag uses direct public env access", source.includes("process.env.NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN"));
test("Capacitor native platform is checked", source.includes("Capacitor.isNativePlatform()") && source.includes("Capacitor.getPlatform()"));
test("existing application Auth service is reused", source.includes('import { auth } from "@/lib/firebase/firebase"'));
test("component creates no Firebase app or Auth instance", !/initializeApp|getAuth\(/.test(source));
test("web development emulator mode still renders", shouldShow({ nodeEnv: "development", useFirebaseEmulators: "true", enableAndroidQaLogin: undefined, isNativePlatform: false, platform: "web" }));
test("Android native with both QA flags renders", shouldShow({ nodeEnv: "production", useFirebaseEmulators: "true", enableAndroidQaLogin: "true", isNativePlatform: true, platform: "android" }));
test("Android native without explicit QA flag is denied", !shouldShow({ nodeEnv: "production", useFirebaseEmulators: "true", enableAndroidQaLogin: undefined, isNativePlatform: true, platform: "android" }));
test("Android native with false QA flag is denied", !shouldShow({ nodeEnv: "production", useFirebaseEmulators: "true", enableAndroidQaLogin: "false", isNativePlatform: true, platform: "android" }));
test("iOS is denied under Android-only flag", !shouldShow({ nodeEnv: "production", useFirebaseEmulators: "true", enableAndroidQaLogin: "true", isNativePlatform: true, platform: "ios" }));
test("normal production web build is denied", !shouldShow({ nodeEnv: "production", useFirebaseEmulators: "true", enableAndroidQaLogin: undefined, isNativePlatform: false, platform: "web" }));
test("release Android configuration without emulator mode is denied", !shouldShow({ nodeEnv: "production", useFirebaseEmulators: undefined, enableAndroidQaLogin: "true", isNativePlatform: true, platform: "android" }));
test("no fixture credentials are embedded", !/@bhumi\.test|pass(word)?\s*[:=]/i.test(source));
for (const testId of ["qa-emulator-email", "qa-emulator-password", "qa-emulator-submit", "qa-emulator-error"]) {
  test(`${testId} selector remains present`, source.includes(`data-testid="${testId}"`));
}

console.log(`${passed} tests passed`);
