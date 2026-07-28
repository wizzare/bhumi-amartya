import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { evaluateFounderQaAllowlist, isFounderQaMode } from "../../lib/auth/founderQaPolicy";

let passed = 0;

function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed++;
  console.log(`PASS: ${label}`);
}

// Verify guard file structure
const guardSource = readFileSync(resolve("lib/auth/founderQaGuard.ts"), "utf8");
const policySource = readFileSync(resolve("lib/auth/founderQaPolicy.ts"), "utf8");

test("Founder allowlist contains wedhaswarawidhi", policySource.includes("wedhaswarawidhi@gmail.com"));
test("Founder allowlist contains widhi.w.karyodikromo", policySource.includes("widhi.w.karyodikromo@gmail.com"));
test("Founder allowlist contains wizzare", policySource.includes("wizzare@gmail.com"));
test("Founder allowlist is case-insensitive via normalizeEmail", policySource.includes(".toLowerCase()"));
test("Guard exports enforceFounderQaAllowlist", guardSource.includes("enforceFounderQaAllowlist"));
test("Guard exports isFounderQaMode", guardSource.includes("isFounderQaMode"));
test("Guard delegates to the pure allowlist decision", guardSource.includes("evaluateFounderQaAllowlist"));
test("Policy checks QA flag", policySource.includes("ENABLE_FOUNDER_PRE_RELEASE_QA"));
test("Non-allowed account triggers signOut", guardSource.includes("signOut(auth)"));
test("No credentials embedded in guard", !/@bhumi\.test|pass(word)?\s*[:=]/i.test(guardSource));
test("No tokens in guard source", !/(access|id|refresh)_?token/i.test(guardSource));

// Verify AuthContext integrates the guard
const authSource = readFileSync(resolve("context/AuthContext.tsx"), "utf8");
test("AuthContext imports founderQaGuard", authSource.includes("founderQaGuard"));
test("AuthContext calls enforceFounderQaAllowlist", authSource.includes("enforceFounderQaAllowlist"));
test("AuthContext handles rejected allowlist", authSource.includes("allowlistResult.allowed"));

const qaFlag = "NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA";
const originalQaFlag = process.env[qaFlag];

try {
  delete process.env[qaFlag];
  test("production-disabled mode allows every account", isFounderQaMode() === false && evaluateFounderQaAllowlist("outside@example.test").allowed);

  process.env[qaFlag] = "true";
  test("explicit QA mode enables the Founder restriction", isFounderQaMode() === true);
  test("explicit QA mode allows a listed Founder", evaluateFounderQaAllowlist("wizzare@gmail.com").allowed);
  const unauthorized = evaluateFounderQaAllowlist("outside@example.test");
  test("unauthorized account is denied when QA restriction is active", unauthorized.allowed === false && unauthorized.reason?.includes("whitelist Founder QA") === true);
  test("missing email is denied when QA restriction is active", evaluateFounderQaAllowlist(null).allowed === false);
} finally {
  if (originalQaFlag === undefined) delete process.env[qaFlag];
  else process.env[qaFlag] = originalQaFlag;
}

test("test restores its original QA environment value", process.env[qaFlag] === originalQaFlag);

console.log(`\n${passed} founder QA tests passed`);
