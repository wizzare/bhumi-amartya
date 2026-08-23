import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// P0-01: AccessGuard hardening regression test
// Verifies that getFounderTesterRecord is called with .catch(() => null)
// so Firestore/network failures cannot cause unhandled promise rejections.

const accessGuard = readFileSync("components/auth/AccessGuard.tsx", "utf8");

console.log("===================================================================");
console.log("  P0-01: ACCESSGUARD HARDENING REGRESSION TEST");
console.log("===================================================================\n");

// Test 1: getFounderTesterRecord call exists
console.log("1. Verifying getFounderTesterRecord is called...");
assert.match(accessGuard, /getFounderTesterRecord/, "getFounderTesterRecord must be called");
console.log("   ✅ PASS: getFounderTesterRecord call found\n");

// Test 2: .catch(() => null) is chained before .then()
console.log("2. Verifying .catch(() => null) is chained before .then()...");
assert.match(
  accessGuard,
  /getFounderTesterRecord\([^)]+\)\.catch\(\(\) => null\)\.then\(/,
  "getFounderTesterRecord must have .catch(() => null) before .then()"
);
console.log("   ✅ PASS: .catch(() => null) before .then() confirmed\n");

// Test 3: setTesterRecord is still called with record
console.log("3. Verifying setTesterRecord is still called on success...");
assert.match(
  accessGuard,
  /getFounderTesterRecord\([^)]+\)\.catch\(\(\) => null\)\.then\(\(record\) => \{\s*if \(!cancelled\) setTesterRecord\(record\);\s*\}\)/,
  "setTesterRecord must still be called with record on success"
);
console.log("   ✅ PASS: setTesterRecord called correctly\n");

// Test 4: Non-founder behavior preserved — default hasAccess = true
console.log("4. Verifying default hasAccess behavior for non-founder/tester...");
assert.match(
  accessGuard,
  /const \[hasAccess, setHasAccess\] = useState\(true\);/,
  "Default hasAccess must be true for non-founder/tester users"
);
console.log("   ✅ PASS: Default hasAccess = true preserved\n");

// Test 5: AccessGuard still renders children for non-premium when hasAccess = true
console.log("5. Verifying AccessGuard renders children when hasAccess is true...");
assert.match(
  accessGuard,
  /if \(hasAccess\) return <>\{children\}<\/>;/,
  "AccessGuard must render children when hasAccess is true"
);
console.log("   ✅ PASS: Children rendered for non-premium when hasAccess = true\n");

// Test 6: AccessGuard does NOT crash page on rejection path
console.log("6. Verifying no synchronous throw on rejection path...");
// Ensure there's no throw or process.exit in the effect
const rejectionPath = accessGuard.slice(
  accessGuard.indexOf("getFounderTesterRecord"),
  accessGuard.indexOf("return () => {")
);
assert.doesNotMatch(rejectionPath, /throw|process\.exit/, "No throw/process.exit in rejection path");
console.log("   ✅ PASS: No synchronous throw on rejection path\n");

// Test 7: Cleanup function still cancels properly
console.log("7. Verifying cleanup function cancels properly...");
assert.match(
  accessGuard,
  /return \(\) => \{\s*cancelled = true;\s*\};/,
  "Cleanup function must set cancelled = true"
);
console.log("   ✅ PASS: Cleanup function cancels properly\n");

console.log("===================================================================");
console.log("  P0-01: ACCESSGUARD HARDENING REGRESSION TESTS COMPLETE: ALL PASS");
console.log("===================================================================");
console.log("\nSummary:");
console.log("- getFounderTesterRecord rejection path safely resolves as null");
console.log("- Non-founder/tester behavior unchanged (hasAccess defaults to true)");
console.log("- No unhandled promise rejection on Firestore/network failure");
console.log("- Component continues normal behavior for non-founder/tester users");