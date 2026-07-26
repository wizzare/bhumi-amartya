import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve("components/dev/EmulatorQaLogin.tsx"), "utf8");
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
test("production mode is denied", source.includes('process.env.NODE_ENV !== "production"'));
test("only explicit emulator mode is allowed", source.includes('process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true"'));
test("existing application Auth service is reused", source.includes('import { auth } from "@/lib/firebase/firebase"'));
test("component creates no Firebase app or Auth instance", !/initializeApp|getAuth\(/.test(source));
for (const testId of ["qa-emulator-email", "qa-emulator-password", "qa-emulator-submit", "qa-emulator-error"]) {
  test(`${testId} selector remains present`, source.includes(`data-testid="${testId}"`));
}

console.log(`${passed} tests passed`);
