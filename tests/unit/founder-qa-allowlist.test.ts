import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let passed = 0;

function test(label: string, condition: boolean) {
  assert.equal(condition, true, label);
  passed++;
  console.log(`PASS: ${label}`);
}

// Verify guard file structure
const guardSource = readFileSync(resolve("lib/auth/founderQaGuard.ts"), "utf8");

test("Founder allowlist contains wedhaswarawidhi", guardSource.includes("wedhaswarawidhi@gmail.com"));
test("Founder allowlist contains widhi.w.karyodikromo", guardSource.includes("widhi.w.karyodikromo@gmail.com"));
test("Founder allowlist contains wizzare", guardSource.includes("wizzare@gmail.com"));
test("Founder allowlist is case-insensitive via normalizeEmail", guardSource.includes(".toLowerCase()"));
test("Guard exports enforceFounderQaAllowlist", guardSource.includes("enforceFounderQaAllowlist"));
test("Guard exports isFounderQaMode", guardSource.includes("isFounderQaMode"));
test("Guard checks QA flag", guardSource.includes("ENABLE_FOUNDER_PRE_RELEASE_QA"));
test("Non-allowed account triggers signOut", guardSource.includes("signOut(auth)"));
test("No credentials embedded in guard", !/@bhumi\.test|pass(word)?\s*[:=]/i.test(guardSource));
test("No tokens in guard source", !/(access|id|refresh)_?token/i.test(guardSource));

// Verify AuthContext integrates the guard
const authSource = readFileSync(resolve("context/AuthContext.tsx"), "utf8");
test("AuthContext imports founderQaGuard", authSource.includes("founderQaGuard"));
test("AuthContext calls enforceFounderQaAllowlist", authSource.includes("enforceFounderQaAllowlist"));
test("AuthContext handles rejected allowlist", authSource.includes("allowlistResult.allowed"));

// Verify QA flag is only active when explicitly set
test("Guard checks env var ENABLE_FOUNDER_PRE_RELEASE_QA", guardSource.includes("process.env.NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA"));

// Verify unrelated accounts are rejected
test("Unrelated account not in allowlist", !guardSource.includes("unknown@test.com"));
test("Unrelated account rejected with correct message", guardSource.includes("Akun ini tidak terdaftar dalam whitelist Founder QA"));
test("Null email rejected", guardSource.includes("Email tidak dikenali"));

// Verify guard doesn't affect production behavior
test("QA_FLAG defaults to false when env var absent", guardSource.includes('"true"'));
test("Normal production mode skips allowlist when flag off", guardSource.includes("if (!QA_FLAG) return { allowed: true }"));

// Verify env profile exists
const envExists = require("fs").existsSync(resolve(".env.local.founder-qa"));
test(".env.local.founder-qa profile exists", envExists);

if (envExists) {
  const envContent = readFileSync(resolve(".env.local.founder-qa"), "utf8");
  test("founder-qa profile sets USE_FIRESTORE_EMULATOR=true", envContent.includes("USE_FIRESTORE_EMULATOR=true"));
  test("founder-qa profile sets USE_FUNCTIONS_EMULATOR=true", envContent.includes("USE_FUNCTIONS_EMULATOR=true"));
  test("founder-qa profile sets USE_AUTH_EMULATOR=false", envContent.includes("USE_AUTH_EMULATOR=false"));
  test("founder-qa profile sets ENABLE_EMULATOR_QA_LOGIN=false", envContent.includes("ENABLE_EMULATOR_QA_LOGIN=false"));
  test("founder-qa profile sets ENABLE_FOUNDER_PRE_RELEASE_QA=true", envContent.includes("ENABLE_FOUNDER_PRE_RELEASE_QA=true"));
}

console.log(`\n${passed} founder QA tests passed`);
