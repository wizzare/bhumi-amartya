#!/usr/bin/env node
// Local-only Auth Emulator seeder. Safe: refuses non-local hosts.

const EMULATOR_HOSTS = new Set(["127.0.0.1", "localhost"]);
const PORT = process.env.AUTH_EMULATOR_PORT || 9099;
const API_KEY = "fake-emulator-api-key";

const ACCOUNTS = [
  ["admin@bhumi.test", "admin-1pass", "ADMIN"],
  ["user-a@bhumi.test", "user-a-pass", "USER_A"],
  ["user-b@bhumi.test", "user-b-pass", "USER_B"],
  ["wedhaswarawidhi@gmail.com", "excl-1-pass", "EXCL1"],
  ["widhi.w.karyodikromo@gmail.com", "excl-2-pass", "EXCL2"],
  ["free-user@bhumi.test", "free-pass-1", "FREE"],
  ["trial-active@bhumi.test", "trial-pass", "TRIAL"],
  ["trial-exhausted@bhumi.test", "exh-pass-1", "EXH"],
  ["premium-active@bhumi.test", "prem-pass-1", "PREMIUM"],
  ["premium-expired@bhumi.test", "exp-pass-1", "EXPIRED"],
  ["auth-smoke@bhumi.test", "smoke-pass", "SMOKE"],
];

async function main() {
  const host = process.env.AUTH_EMULATOR_HOST || "127.0.0.1";
  if (!EMULATOR_HOSTS.has(host)) {
    throw new Error("Refusing non-local Auth host: " + host);
  }

  const baseUrl = `http://${host}:${PORT}`;
  const signUpUrl = `${baseUrl}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;
  let created = 0, skipped = 0, failed = 0;

  for (const [email, password, label] of ACCOUNTS) {
    try {
      const resp = await fetch(signUpUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      });

      if (resp.ok) {
        const data = await resp.json();
        console.log(`  CREATED ${label.padEnd(8)} uid=${data.localId}`);
        created++;
      } else if (resp.status === 400) {
        const err = await resp.json();
        if (err.error?.message === "EMAIL_EXISTS") {
          console.log(`  SKIPPED ${label.padEnd(8)} email already exists`);
          skipped++;
        } else {
          console.log(`  FAILED  ${label.padEnd(8)} ${err.error?.message}`);
          failed++;
        }
      } else {
        console.log(`  FAILED  ${label.padEnd(8)} HTTP ${resp.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`  ERROR   ${label.padEnd(8)} ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${created} created, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

main();
