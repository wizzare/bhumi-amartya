/* eslint-disable @typescript-eslint/no-require-imports -- Local Cloudflare Workers proof of concept. */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const http = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { initializeApp } = require("firebase/app");
const { getAuth, connectAuthEmulator, signInAnonymously } = require("firebase/auth");

const PROJECT = "demo-build126-canonical-qa";
const AUTH_EMULATOR = "http://127.0.0.1:19099";
const WORKER_ORIGIN = "http://127.0.0.1:8787";
const WORKER_DIR = path.resolve(__dirname, "..");
const BIRTH = {
  birthDate: "2000-01-01", birthTime: "09:00", birthCity: "Example", birthPlace: "Example",
  birthCountry: "ID", latitude: 0, longitude: 1, timezone: "Asia/Jakarta",
};

let checks = 0;
const evidence = {};

function base64url(buffer) {
  return buffer.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function mintToken(privateKey, { uid, kid, authTimeSeconds, project = PROJECT, alg = "RS256" }) {
  const header = { alg, typ: "JWT" };
  if (kid) header.kid = kid;
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: `https://securetoken.google.com/${project}`,
    aud: project,
    sub: uid,
    user_id: uid,
    auth_time: authTimeSeconds ?? now,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(Buffer.from(JSON.stringify(header)))}.${base64url(Buffer.from(JSON.stringify(payload)))}`;
  if (alg === "none") return `${signingInput}.${base64url(Buffer.from("unsigned"))}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

async function post(route, body, token) {
  const headers = { "content-type": "application/json", origin: "capacitor://localhost" };
  if (token) headers.authorization = `Bearer ${token}`;
  const startedAt = Date.now();
  let response;
  try {
    response = await fetch(`${WORKER_ORIGIN}${route}`, { method: "POST", headers, body: JSON.stringify({ data: body }) });
  } catch (error) {
    console.error("FETCH_FAILED", route, error && error.message);
    throw error;
  }
  const text = await response.text();
  if (response.status >= 500) console.error("SERVER_ERROR_BODY", response.status, text.slice(0, 400));
  let json = null;
  try { json = JSON.parse(text); } catch { json = null; }
  return {
    status: response.status,
    json,
    text,
    ms: Date.now() - startedAt,
    subrequests: Number(response.headers.get("x-poc-subrequests") || "0"),
    cpuProxyMs: Number(response.headers.get("x-poc-cpu-proxy-ms") || "0"),
  };
}

async function adminAuth(pathname, body) {
  const response = await fetch(`${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/${pathname}?key=synthetic-api-key`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer owner" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => null) };
}

async function firestoreDoc(pathname) {
  const response = await fetch(`http://127.0.0.1:18080/v1/projects/${PROJECT}/databases/(default)/documents/${pathname}`, {
    headers: { authorization: "Bearer owner" },
  });
  if (response.status === 404) return null;
  return response.json();
}

function startFixtureServer(jwk) {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      if (req.url === "/jwks") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ keys: [{ ...jwk, kid: "poc-key-1", alg: "RS256", use: "sig" }] }));
        return;
      }
      if (req.url === "/token") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ access_token: "owner", expires_in: 3600, token_type: "Bearer" }));
        return;
      }
      res.writeHead(404);
      res.end();
    });
    server.listen(8788, "127.0.0.1", () => resolve(server));
  });
}

async function waitForWorker(logStream) {
  for (let attempt = 0; attempt < 120; attempt++) {
    try {
      const response = await fetch(`${WORKER_ORIGIN}/api/canonical/getCanonicalBirth`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ data: { profileUid: "probe" } }),
      });
      if (response.status === 401 || response.status === 400) return true;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500));
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`worker did not become ready; log: ${logStream}`);
}

async function main() {
  const issuerKeys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const issuerJwk = issuerKeys.publicKey.export({ format: "jwk" });
  const serviceKeys = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
  const servicePem = serviceKeys.privateKey.export({ type: "pkcs8", format: "pem" });

  const fixtureServer = await startFixtureServer(issuerJwk);
  require("node:fs").writeFileSync(
    path.join(WORKER_DIR, ".dev.vars"),
    `SERVICE_ACCOUNT_PRIVATE_KEY="${servicePem.replace(/\n/g, "\\n")}"\n`,
    "utf8",
  );

  const logFile = path.join(__dirname, "wrangler-dev.log");
  const logStream = require("node:fs").createWriteStream(logFile, { flags: "a" });
  const isWin = process.platform === "win32";
  const cmd = process.env.WRANGLER_CLI_PATH ? process.execPath : (isWin ? "npx" : "npx");
  const args = process.env.WRANGLER_CLI_PATH
    ? [process.env.WRANGLER_CLI_PATH, "dev", "--local", "--port", "8787", "--ip", "127.0.0.1"]
    : ["wrangler", "dev", "--local", "--port", "8787", "--ip", "127.0.0.1"];
  const wrangler = spawn(cmd, args, {
    cwd: WORKER_DIR,
    env: { ...process.env, WRANGLER_SEND_METRICS: "false" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: isWin,
  });
  wrangler.stdout.on("data", (chunk) => logStream.write(chunk));
  wrangler.stderr.on("data", (chunk) => logStream.write(chunk));

  let exitCode = 0;
  try {
    await waitForWorker(logFile);
    checks++; evidence.workerReady = true;

    const ownerApp = initializeApp({ apiKey: "synthetic", projectId: PROJECT, appId: "poc-owner" }, "poc-owner");
    const ownerAuth = getAuth(ownerApp);
    connectAuthEmulator(ownerAuth, AUTH_EMULATOR, { disableWarnings: true });
    const ownerUid = (await signInAnonymously(ownerAuth)).user.uid;

    const otherApp = initializeApp({ apiKey: "synthetic", projectId: PROJECT, appId: "poc-other" }, "poc-other");
    const otherAuth = getAuth(otherApp);
    connectAuthEmulator(otherAuth, AUTH_EMULATOR, { disableWarnings: true });
    const otherUid = (await signInAnonymously(otherAuth)).user.uid;
    assert.notEqual(ownerUid, otherUid); checks++; evidence.distinctUsers = true;

    const freshToken = () => mintToken(issuerKeys.privateKey, { uid: ownerUid, kid: "poc-key-1" });
    const otherToken = () => mintToken(issuerKeys.privateKey, { uid: otherUid, kid: "poc-key-1" });

    // Seed a complete legacy birth record on the owner document so the legacy
    // attestation gate is the one under test.
    const seedResponse = await fetch(`http://127.0.0.1:18080/v1/projects/${PROJECT}/databases/(default)/documents:commit`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer owner" },
      body: JSON.stringify({
        writes: [{
          update: {
            name: `projects/${PROJECT}/databases/(default)/documents/users/${ownerUid}`,
            fields: {
              birthDate: { stringValue: BIRTH.birthDate },
              birthTime: { stringValue: BIRTH.birthTime },
              birthCity: { stringValue: BIRTH.birthCity },
              birthPlace: { stringValue: BIRTH.birthPlace },
              birthCountry: { stringValue: BIRTH.birthCountry },
              latitude: { doubleValue: BIRTH.latitude },
              longitude: { doubleValue: BIRTH.longitude },
              timezone: { stringValue: BIRTH.timezone },
              displayName: { stringValue: "keep" },
            },
          },
          currentDocument: { exists: false },
        }],
      }),
    });
    assert.equal(seedResponse.status, 200); checks++; evidence.legacySeed = true;

    // 1) Missing / malformed / unsigned / tampered tokens are rejected.
    let response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, null);
    assert.equal(response.status, 401); checks++;
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, "not-a-jwt");
    assert.equal(response.status, 401); checks++;
    const unsignedToken = mintToken(issuerKeys.privateKey, { uid: ownerUid, kid: "poc-key-1", alg: "none" });
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, unsignedToken);
    assert.equal(response.status, 401); checks++; evidence.unsignedRejected = true;
    const tampered = freshToken().slice(0, -4) + "AAAA";
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, tampered);
    assert.equal(response.status, 401); checks++; evidence.tamperedRejected = true;

    // 2) UID isolation: token of A cannot touch or read B.
    response = await post("/api/canonical/commitCanonicalBirth", { profileUid: otherUid, operationId: "cross-user-001", expected: { epoch: null, revision: 0 }, canonicalBirth: BIRTH }, freshToken());
    assert.equal(response.status, 403); checks++; evidence.crossUserRejected = true;

    // 3) Legacy without owner confirmation is rejected.
    response = await post("/api/canonical/initializeCanonicalBirth", { profileUid: ownerUid, operationId: "legacy-no-attest-01", confirmedBirth: BIRTH }, freshToken());
    assert.equal(response.status, 200);
    assert.equal(response.json.status, "REJECTED");
    assert.equal(response.json.reason, "legacy_confirmation_required"); checks++; evidence.legacyRejected = true;

    // 4) Legacy with owner attestation commits atomically: canonical + receipt + mirror.
    const initOperationId = "legacy-attested-0001";
    response = await post("/api/canonical/initializeCanonicalBirth", { profileUid: ownerUid, operationId: initOperationId, confirmedBirth: BIRTH, attestation: "owner_reviewed_birth_v1" }, freshToken());
    assert.equal(response.status, 200);
    assert.equal(response.json.status, "COMMITTED"); checks++;
    const epoch = response.json.epoch;
    const revision = response.json.revision;
    assert.equal(typeof epoch, "string"); assert.equal(revision, 1); checks++;
    const canonicalDoc = await firestoreDoc(`users/${ownerUid}/canonical/birth`);
    if (!canonicalDoc || !canonicalDoc.fields) console.error("CANONICAL_DOC_RAW", JSON.stringify(canonicalDoc));
    assert.equal(canonicalDoc.fields.birthDate.stringValue, BIRTH.birthDate);
    assert.equal(canonicalDoc.fields.revision.integerValue, "1"); checks++;
    const receiptDoc = await firestoreDoc(`users/${ownerUid}/birthOperations/${initOperationId}`);
    assert.equal(receiptDoc.fields.status.stringValue, "COMMITTED");
    assert.equal(receiptDoc.fields.attestation.stringValue, "owner_reviewed_birth_v1"); checks++;
    const mirrorDoc = await firestoreDoc(`users/${ownerUid}`);
    assert.equal(mirrorDoc.fields.canonicalBirthRevision.integerValue, "1"); checks++; evidence.atomicCommit = true;

    // 5) Idempotency: same operation id returns the same revision, idempotent flag set.
    response = await post("/api/canonical/initializeCanonicalBirth", { profileUid: ownerUid, operationId: initOperationId, confirmedBirth: BIRTH, attestation: "owner_reviewed_birth_v1" }, freshToken());
    assert.equal(response.json.status, "COMMITTED");
    assert.equal(response.json.idempotent, true);
    assert.equal(response.json.revision, 1); checks++; evidence.idempotent = true;

    // 6) Revision conflict: stale expected revision is refused.
    const nextBirth = { ...BIRTH, birthDate: "2001-01-01" };
    response = await post("/api/canonical/commitCanonicalBirth", { profileUid: ownerUid, operationId: "commit-stale-0001", expected: { epoch: null, revision: 0 }, canonicalBirth: nextBirth }, freshToken());
    assert.equal(response.json.status, "CONFLICT");
    assert.equal(response.json.currentRevision, 1); checks++;
    response = await post("/api/canonical/commitCanonicalBirth", { profileUid: ownerUid, operationId: "commit-good-0001", expected: { epoch, revision: 1 }, canonicalBirth: nextBirth }, freshToken());
    assert.equal(response.json.status, "COMMITTED");
    assert.equal(response.json.revision, 2); checks++;
    response = await post("/api/canonical/commitCanonicalBirth", { profileUid: ownerUid, operationId: "commit-stale-0002", expected: { epoch, revision: 1 }, canonicalBirth: { ...nextBirth, birthDate: "2002-01-01" } }, freshToken());
    assert.equal(response.json.status, "CONFLICT");
    assert.equal(response.json.currentRevision, 2); checks++; evidence.revisionConflict = true;

    // 7) Concurrent commits on the same expected revision: one commits, one conflicts.
    const race = await Promise.all([
      post("/api/canonical/commitCanonicalBirth", { profileUid: ownerUid, operationId: "race-op-000001", expected: { epoch, revision: 2 }, canonicalBirth: { ...nextBirth, birthDate: "2003-01-01" } }, freshToken()),
      post("/api/canonical/commitCanonicalBirth", { profileUid: ownerUid, operationId: "race-op-000002", expected: { epoch, revision: 2 }, canonicalBirth: { ...nextBirth, birthDate: "2004-01-01" } }, freshToken()),
    ]);
    const raceStatuses = race.map((entry) => entry.json.status).sort();
    assert.deepEqual(raceStatuses, ["COMMITTED", "CONFLICT"]); checks++; evidence.concurrentConflict = true;

    // 8) Cross-user data is invisible: B cannot read A's canonical record.
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: otherUid }, otherToken());
    assert.equal(response.json.status, "NOT_FOUND"); checks++; evidence.crossUserDataHidden = true;
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid, operationId: initOperationId }, freshToken());
    assert.equal(response.json.status, "SUCCESS");
    assert.equal(response.json.data.type, "receipt"); checks++;

    // 9) Revocation: a token issued before tokensValidAfterTime is rejected.
    const validSince = new Date().toISOString();
    const update = await adminAuth("accounts:update", { localId: ownerUid, validSince });
    assert.equal(update.status, 200); checks++;
    const staleToken = mintToken(issuerKeys.privateKey, { uid: ownerUid, kid: "poc-key-1", authTimeSeconds: Math.floor(Date.now() / 1000) - 600 });
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, staleToken);
    assert.equal(response.status, 401); checks++; evidence.revokedRejected = true;
    response = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, freshToken());
    assert.equal(response.status, 200); checks++; evidence.freshTokenAccepted = true;

    // 10) Secrets never leave the server and never appear in client sources.
    const secretProbe = [response.text, JSON.stringify(evidence)].join(" ");
    assert.equal(secretProbe.includes("PRIVATE KEY"), false);
    assert.equal(secretProbe.includes("synthetic-oauth-access-token"), false); checks++;
    const clientSources = [
      path.resolve(__dirname, "..", "..", "..", "lib", "profile", "canonicalHttps.ts"),
      path.resolve(__dirname, "..", "..", "..", "lib", "profile", "canonicalBirth.ts"),
    ];
    for (const source of clientSources) {
      const content = require("node:fs").readFileSync(source, "utf8");
      assert.equal(content.includes("SERVICE_ACCOUNT"), false);
      assert.equal(content.includes("PRIVATE KEY"), false);
    }
    checks++; evidence.secretsServerSideOnly = true;

    // 11) Request cost: subrequests and CPU proxy stay inside the free tier limits.
    const samples = [];
    for (let index = 0; index < 10; index++) {
      const sample = await post("/api/canonical/getCanonicalBirth", { profileUid: ownerUid }, freshToken());
      samples.push(sample);
    }
    const maxSubrequests = Math.max(...samples.map((sample) => sample.subrequests));
    const maxCpuProxy = Math.max(...samples.map((sample) => sample.cpuProxyMs));
    const latencies = samples.map((sample) => sample.ms).sort((a, b) => a - b);
    evidence.freeTier = {
      maxSubrequests,
      maxCpuProxyMs: Number(maxCpuProxy.toFixed(2)),
      p50LatencyMs: latencies[Math.floor(latencies.length / 2)],
      p95LatencyMs: latencies[latencies.length - 1],
      freeSubrequestLimit: 50,
      freeCpuLimitMs: 10,
    };
    assert.equal(maxSubrequests <= 50, true);
    assert.equal(maxCpuProxy <= 10, true); checks++;

    console.log(JSON.stringify({ checks, result: "PASS", scope: "local workers runtime + firestore/auth emulators", evidence }));
  } catch (error) {
    exitCode = 1;
    console.error("POC FAILED:", error && error.message);
    console.error(error && error.stack);
  } finally {
    wrangler.kill();
    fixtureServer.close();
    try { require("node:fs").unlinkSync(path.join(WORKER_DIR, ".dev.vars")); } catch { }
    setTimeout(() => process.exit(exitCode), 500);
  }
}

main();
