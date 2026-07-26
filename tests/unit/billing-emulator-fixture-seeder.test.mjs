import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ensureAccounts,
  getFixturePassword,
  validateEnvironment as validateAuthEnvironment,
} from "../../scripts/qa/seed-auth-emulator.mjs";
import {
  BILLING_EMAILS,
  EXPECTED_PROJECT_ID,
  buildBillingFixtureDefinitions,
  classifyFixture,
  resolveAuthUsers,
  validateEnvironment as validateFirestoreEnvironment,
} from "../../scripts/qa/seed-firestore-emulator.mjs";

let passed = 0;
function test(label, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed++;
      console.log(`  PASS: ${label}`);
    });
}

const validEnvironment = {
  GCLOUD_PROJECT: EXPECTED_PROJECT_ID,
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  FUNCTIONS_EMULATOR_HOST: "127.0.0.1:5001",
};

class FakeAuth {
  constructor(users = []) {
    this.users = new Map(users.map((user) => [user.email, user]));
    this.createCalls = 0;
    this.updateCalls = 0;
  }

  async getUserByEmail(email) {
    const user = this.users.get(email);
    if (!user) {
      const error = new Error("missing");
      error.code = "auth/user-not-found";
      throw error;
    }
    return user;
  }

  async createUser({ email }) {
    this.createCalls++;
    const user = { email, uid: `derived-${this.users.size + 1}` };
    this.users.set(email, user);
    return user;
  }

  async updateUser(uid) {
    this.updateCalls++;
    return [...this.users.values()].find((user) => user.uid === uid);
  }
}

await test("required emulator project and endpoints are accepted", () => {
  const endpoints = validateFirestoreEnvironment(validEnvironment);
  assert.equal(endpoints.auth.port, 9099);
  assert.equal(endpoints.firestore.port, 8080);
  assert.equal(endpoints.functions.port, 5001);
});

await test("wrong project ID aborts", () => {
  assert.throws(() => validateFirestoreEnvironment({ ...validEnvironment, GCLOUD_PROJECT: "wrong-project" }), /Refusing unexpected project/);
  assert.throws(() => validateAuthEnvironment({ ...validEnvironment, GCLOUD_PROJECT: "wrong-project" }), /Refusing unexpected project/);
});

await test("non-emulator hosts abort", () => {
  assert.throws(() => validateFirestoreEnvironment({ ...validEnvironment, FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:8080" }), /Refusing unexpected Firestore/);
  assert.throws(() => validateAuthEnvironment({ ...validEnvironment, FIREBASE_AUTH_EMULATOR_HOST: "identitytoolkit.googleapis.com:9099" }), /Refusing unexpected Auth/);
});

await test("production Admin credentials abort", () => {
  assert.throws(() => validateFirestoreEnvironment({ ...validEnvironment, GOOGLE_APPLICATION_CREDENTIALS: "service-account.json" }), /GOOGLE_APPLICATION_CREDENTIALS/);
});

await test("UIDs are derived by Auth Emulator email lookup", async () => {
  const users = BILLING_EMAILS.map((email, index) => ({ email, uid: `current-${index}` }));
  const resolved = await resolveAuthUsers(new FakeAuth(users));
  assert.deepEqual([...resolved.values()], users.map((user) => user.uid));
});

await test("missing Auth Emulator account fails safely", async () => {
  await assert.rejects(resolveAuthUsers(new FakeAuth(), [BILLING_EMAILS[0]]), /Expected Auth Emulator account is missing/);
});

await test("existing Auth account is reused", async () => {
  const account = ["free-user@bhumi.test", "FREE"];
  const auth = new FakeAuth([{ email: account[0], uid: "current-free" }]);
  const result = await ensureAccounts(auth, [account]);
  assert.deepEqual(result, { created: 0, reused: 1, total: 1 });
  assert.equal(auth.createCalls, 0);
  assert.equal(auth.updateCalls, 1);
});

await test("Auth seeding is idempotent and does not duplicate users", async () => {
  const accounts = [["fixture@bhumi.test", "FIXTURE"]];
  const auth = new FakeAuth();
  const first = await ensureAccounts(auth, accounts);
  const second = await ensureAccounts(auth, accounts);
  assert.equal(first.created, 1);
  assert.equal(second.reused, 1);
  assert.equal(auth.createCalls, 1);
  assert.equal(auth.users.size, 1);
});

await test("fixture passwords are derived and never stored as literals", () => {
  const first = getFixturePassword("first@bhumi.test");
  const second = getFixturePassword("second@bhumi.test");
  assert.notEqual(first, second);
  assert.ok(first.length >= 16);
});

const definitions = buildBillingFixtureDefinitions();
for (const email of BILLING_EMAILS) {
  await test(`${email} has a deterministic fixture state`, () => {
    assert.ok(definitions[email]);
    assert.equal(classifyFixture(definitions[email].access), definitions[email].expectedState);
  });
}

await test("free fixture has neither premium nor trial access", () => {
  const access = definitions["free-user@bhumi.test"].access;
  assert.equal(access.isPremium, false);
  assert.equal(access.plan, "free");
  assert.ok(access.trialLoginCount > 7);
});

await test("active trial uses the existing trial fields without premium label", () => {
  const access = definitions["trial-active@bhumi.test"].access;
  assert.equal(access.membershipType, "TRIAL");
  assert.equal(access.testerBadge, "Penjaga Bhumi");
  assert.equal(access.isPremium, false);
  assert.ok(access.trialLoginCount <= 7);
});

await test("exhausted trial cannot restart through trial fallback", () => {
  const access = definitions["trial-exhausted@bhumi.test"].access;
  assert.equal(access.plan, "expired");
  assert.equal(access.trialStatus, "free");
  assert.ok(access.trialLoginCount > 7);
});

await test("active premium has a future authoritative expiry", () => {
  const access = definitions["premium-active@bhumi.test"].access;
  assert.equal(access.membershipType, "PREMIUM");
  assert.equal(access.isPremium, true);
  assert.ok(access.membershipExpiryDate > new Date("2026-07-26T00:00:00Z"));
});

await test("expired premium has no trial fallback", () => {
  const access = definitions["premium-expired@bhumi.test"].access;
  assert.equal(access.membershipType, "PREMIUM");
  assert.equal(access.plan, "expired");
  assert.equal(access.trialStatus, "free");
  assert.ok(access.trialLoginCount > 7);
});

await test("Firestore document IDs are the resolved Auth UIDs", async () => {
  const users = BILLING_EMAILS.map((email, index) => ({ email, uid: `auth-uid-${index}` }));
  const resolved = await resolveAuthUsers(new FakeAuth(users));
  const documentIds = Object.keys(definitions).map((email) => resolved.get(email));
  assert.deepEqual(documentIds, users.map((user) => user.uid));
});

await test("seeders contain no hardcoded UID map", async () => {
  const source = await readFile(new URL("../../scripts/qa/seed-firestore-emulator.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /AUTH_UID_MAP|uid\s*:\s*["'][A-Za-z0-9]{20,}["']/);
  assert.match(source, /getUserByEmail/);
});

await test("seeder logging does not expose credentials or tokens", async () => {
  const sources = await Promise.all([
    readFile(new URL("../../scripts/qa/seed-auth-emulator.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../scripts/qa/seed-firestore-emulator.mjs", import.meta.url), "utf8"),
  ]);
  const logStatements = sources.join("\n").split("\n").filter((line) => /console\.(log|error)/.test(line)).join("\n");
  assert.doesNotMatch(logStatements, /password|idToken|refreshToken|purchaseToken/i);
});

console.log(`\n${passed} tests, ${passed} passed, 0 failed`);
process.exit(0);
