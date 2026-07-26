#!/usr/bin/env node
// Local-only Auth Emulator seeder. Safe: refuses non-local hosts/projects.

import { createConnection } from "node:net";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const EMULATOR_HOSTS = new Set(["127.0.0.1", "localhost"]);
export const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const REQUIRED_ENDPOINTS = [
  ["Auth", 9099],
  ["Firestore", 8080],
  ["Functions", 5001],
];

const ACCOUNTS = [
  ["admin@bhumi.test", "ADMIN"],
  ["user-a@bhumi.test", "USER_A"],
  ["user-b@bhumi.test", "USER_B"],
  ["wedhaswarawidhi@gmail.com", "EXCL1"],
  ["widhi.w.karyodikromo@gmail.com", "EXCL2"],
  ["free-user@bhumi.test", "FREE"],
  ["trial-active@bhumi.test", "TRIAL"],
  ["trial-exhausted@bhumi.test", "EXH"],
  ["premium-active@bhumi.test", "PREMIUM"],
  ["premium-expired@bhumi.test", "EXPIRED"],
  ["auth-smoke@bhumi.test", "SMOKE"],
];

export function getFixturePassword(email) {
  const digest = createHash("sha256")
    .update(`${EXPECTED_PROJECT_ID}:${email}`)
    .digest("base64url")
    .slice(0, 20);
  return `Qa-${digest}!`;
}

export function validateLocalEndpoint(value, expectedPort, label) {
  if (!value) throw new Error(`${label} emulator host is not set.`);
  const [host, rawPort, ...extra] = value.split(":");
  const port = Number(rawPort);
  if (extra.length || !EMULATOR_HOSTS.has(host.toLowerCase()) || port !== expectedPort) {
    throw new Error(`Refusing unexpected ${label} emulator endpoint: ${value}`);
  }
  return { host, port };
}

export function validateEnvironment(env = process.env) {
  if (env.GCLOUD_PROJECT !== EXPECTED_PROJECT_ID) {
    throw new Error(`Refusing unexpected project: ${env.GCLOUD_PROJECT || "<missing>"}`);
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error("Refusing to run while GOOGLE_APPLICATION_CREDENTIALS is set.");
  }
  const auth = validateLocalEndpoint(
    env.FIREBASE_AUTH_EMULATOR_HOST || env.AUTH_EMULATOR_HOST,
    9099,
    "Auth",
  );
  validateLocalEndpoint(env.FIRESTORE_EMULATOR_HOST, 8080, "Firestore");
  validateLocalEndpoint(env.FUNCTIONS_EMULATOR_HOST, 5001, "Functions");
  return auth;
}

function assertListener(host, port, label) {
  return new Promise((resolve, reject) => {
    const socket = createConnection({ host, port });
    const fail = () => reject(new Error(`${label} emulator listener unavailable at ${host}:${port}`));
    socket.setTimeout(1500);
    socket.once("connect", () => {
      socket.destroy();
      resolve();
    });
    socket.once("timeout", () => {
      socket.destroy();
      fail();
    });
    socket.once("error", fail);
  });
}

export async function ensureAccounts(auth, accounts = ACCOUNTS) {
  let created = 0;
  let reused = 0;
  for (const [email, label] of accounts) {
    const password = getFixturePassword(email);
    let user;
    try {
      user = await auth.getUserByEmail(email);
      await auth.updateUser(user.uid, { password });
      reused++;
      console.log(`  REUSED  ${label.padEnd(8)} email=${email} uid=${user.uid}`);
    } catch (error) {
      if (error?.code !== "auth/user-not-found") throw error;
      user = await auth.createUser({ email, password });
      created++;
      console.log(`  CREATED ${label.padEnd(8)} email=${email} uid=${user.uid}`);
    }
  }
  return { created, reused, total: accounts.length };
}

async function main() {
  const authEndpoint = validateEnvironment();
  await Promise.all(REQUIRED_ENDPOINTS.map(([label, port]) => assertListener("127.0.0.1", port, label)));
  process.env.FIREBASE_AUTH_EMULATOR_HOST = `${authEndpoint.host}:${authEndpoint.port}`;

  const [{ initializeApp }, { getAuth }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth"),
  ]);
  const app = initializeApp({ projectId: EXPECTED_PROJECT_ID }, "auth-emulator-seeder");
  const result = await ensureAccounts(getAuth(app));
  console.log(`\nAUTH SEED: ${result.created} created, ${result.reused} reused, ${result.total} total`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error("FATAL:", error.message);
    process.exit(1);
  });
}
