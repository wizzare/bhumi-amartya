import fs from "node:fs";
import net from "node:net";
import tls from "node:tls";
import dns from "node:dns";
import dgram from "node:dgram";
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";

export const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "0.0.0.0"]);
export const ALLOWED_PORTS = new Set([3000, 3001, 3002, 18765]);

export const blockedEvents = [];

export function isAllowedTarget(host, port) {
  const normalizedHost = String(host).toLowerCase();
  const normalizedPort = Number(port);
  return ALLOWED_HOSTS.has(normalizedHost) && ALLOWED_PORTS.has(normalizedPort);
}

export function isAllowedUrl(input) {
  try {
    const url = new URL(input);
    return url.protocol === "http:" && !url.username && !url.password &&
      isAllowedTarget(url.hostname, url.port || 80);
  } catch {
    return false;
  }
}

export function logBlocked(type, target) {
  const item = { type, target, timestamp: new Date().toISOString() };
  blockedEvents.push(item);
  console.warn(`[HD05C NETWORK/CREDENTIAL GUARD BLOCKED] ${type}: ${target}`);
}

// 1. File system credential protection
const forbiddenPattern = /(?:\.env(?:\.|$)|service.?account|firebase-adminsdk|keystore|\.pem$|\.build106-production-admin-provision|Downloads[\\/].*\.json)/i;

function isForbiddenCredentialPath(p) {
  const s = String(p);
  if (/[\\/]node_modules[\\/]/.test(s)) return false;
  return forbiddenPattern.test(s);
}

for (const name of ["readFileSync", "readFile", "openSync", "open", "existsSync"]) {
  const original = fs[name];
  fs[name] = function (path, ...args) {
    if (isForbiddenCredentialPath(path)) {
      logBlocked("FS_SYNC_DENIED", String(path));
      throw new Error(`[GUARD] Denied credential access to: ${path}`);
    }
    return original.call(this, path, ...args);
  };
}

for (const name of ["readFile", "open"]) {
  const original = fs.promises[name];
  fs.promises[name] = function (path, ...args) {
    if (isForbiddenCredentialPath(path)) {
      logBlocked("FS_PROMISE_DENIED", String(path));
      return Promise.reject(new Error(`[GUARD] Denied credential access to: ${path}`));
    }
    return original.call(this, path, ...args);
  };
}

// 2. Network socket interception (net & tls)
const origNetConnect = net.connect;
const origNetCreateConnection = net.createConnection;
const origSocketConnect = net.Socket.prototype.connect;

function checkAndConnect(self, origFn, args) {
  const targetArgs = Array.isArray(args[0]) ? args[0] : args;
  let host = "localhost";
  let port = 0;
  if (typeof targetArgs[0] === "number") {
    port = targetArgs[0];
    if (typeof targetArgs[1] === "string") host = targetArgs[1];
  } else if (targetArgs[0] && typeof targetArgs[0] === "object") {
    host = targetArgs[0].host || targetArgs[0].hostname || "localhost";
    port = targetArgs[0].port || 0;
  }
  if (!isAllowedTarget(host, port)) {
    logBlocked("SOCKET_CONNECT_BLOCKED", `${host}:${port}`);
    const err = new Error(`[GUARD] Outbound socket to ${host}:${port} blocked by localhost allowlist`);
    if (self && typeof self.destroy === "function") {
      self.destroy(err);
      return self;
    }
    throw err;
  }
  return origFn.apply(self, args);
}

net.Socket.prototype.connect = function (...args) {
  return checkAndConnect(this, origSocketConnect, args);
};

net.connect = function (...args) {
  return checkAndConnect(null, origNetConnect, args);
};

net.createConnection = function (...args) {
  return checkAndConnect(null, origNetCreateConnection, args);
};

// 3. HTTP / HTTPS interception
const origHttpRequest = http.request;
const origHttpGet = http.get;
const origHttpsRequest = https.request;
const origHttpsGet = https.get;

function wrapHttp(origFn, type) {
  return function (urlOrOptions, ...args) {
    let host = "localhost";
    let port = type === "https" ? 443 : 80;
    if (typeof urlOrOptions === "string" || urlOrOptions instanceof URL) {
      try {
        const u = new URL(urlOrOptions);
        host = u.hostname;
        port = Number(u.port) || (u.protocol === "https:" ? 443 : 80);
      } catch {
        // invalid URL
      }
    } else if (urlOrOptions && typeof urlOrOptions === "object") {
      host = urlOrOptions.hostname || urlOrOptions.host || "localhost";
      port = urlOrOptions.port || (type === "https" ? 443 : 80);
    }
    if (!isAllowedTarget(host, port)) {
      logBlocked(`${type.toUpperCase()}_BLOCKED`, `${host}:${port}`);
      throw new Error(`[GUARD] Outbound ${type.toUpperCase()} request to ${host}:${port} blocked by localhost allowlist`);
    }
    return origFn.call(this, urlOrOptions, ...args);
  };
}

http.request = wrapHttp(origHttpRequest, "http");
http.get = wrapHttp(origHttpGet, "http");
https.request = wrapHttp(origHttpsRequest, "https");
https.get = wrapHttp(origHttpsGet, "https");

// 4. Fetch interception
const origFetch = globalThis.fetch;
globalThis.fetch = async function (input, init) {
  let urlStr = typeof input === "string" ? input : input instanceof URL ? input.href : input?.url || "";
  try {
    const u = new URL(urlStr, "http://localhost:3001");
    if (!isAllowedTarget(u.hostname, u.port)) {
      logBlocked("FETCH_BLOCKED", u.href);
      throw new Error(`[GUARD] Outbound fetch to ${u.href} blocked by localhost allowlist`);
    }
  } catch (err) {
    if (err.message.includes("[GUARD]")) throw err;
    logBlocked("FETCH_INVALID_URL", urlStr);
    throw err;
  }
  return origFetch.call(this, input, init);
};

const deny = () => { throw new Error("[GUARD] Unsupported network transport denied"); };
tls.connect = deny;
dgram.createSocket = deny;
const lookup = dns.lookup;
dns.lookup = function (host, ...args) {
  if (!ALLOWED_HOSTS.has(host)) return deny();
  return lookup.call(this, host, ...args);
};
for (const target of [dns, dns.promises, dns.Resolver.prototype, dns.promises.Resolver.prototype]) {
  for (const key of Object.getOwnPropertyNames(target)) {
    if (key.startsWith("resolve") || key === "reverse") target[key] = deny;
  }
}
const promiseLookup = dns.promises.lookup;
dns.promises.lookup = function (host, ...args) {
  if (!ALLOWED_HOSTS.has(host)) return Promise.reject(new Error("[GUARD] DNS denied"));
  return promiseLookup.call(this, host, ...args);
};
if (globalThis.WebSocket) globalThis.WebSocket = class { constructor() { deny(); } };
globalThis.__HD05D_GUARD__ = true;
syncBuiltinESMExports();

export async function runGuardSelfTests() {
  console.log("▶ Running Network & Credential Guard Self-Tests...");
  let passed = 0;
  let failed = 0;

  function assertCondition(desc, condition) {
    if (condition) {
      passed++;
      console.log(`  PASS: ${desc}`);
    } else {
      failed++;
      console.error(`  FAIL: ${desc}`);
    }
  }

  // 1. Outbound fetch to external domain blocked
  try {
    await globalThis.fetch("https://hd05d.invalid/calculate");
    assertCondition("External fetch blocked without dialing remote", false);
  } catch (err) {
    assertCondition("External fetch blocked without dialing remote", err.message.includes("[GUARD] Outbound fetch"));
  }

  // 2. Outbound HTTP request blocked
  try {
    http.get("http://hd05d.invalid/test");
    assertCondition("External http.get blocked without dialing remote", false);
  } catch (err) {
    assertCondition("External http.get blocked without dialing remote", err.message.includes("[GUARD] Outbound HTTP"));
  }

  // 3. Outbound HTTPS request blocked
  try {
    https.get("https://hd05d.invalid/accounts");
    assertCondition("External https.get blocked without dialing remote", false);
  } catch (err) {
    assertCondition("External https.get blocked without dialing remote", err.message.includes("[GUARD] Outbound HTTPS"));
  }

  // 4. Credential file sync access blocked
  try {
    fs.readFileSync("C:/tmp/test-service-account.json");
    assertCondition("Credential file readFileSync blocked", false);
  } catch (err) {
    assertCondition("Credential file readFileSync blocked", err.message.includes("[GUARD] Denied credential access"));
  }

  // 5. Credential file promise access blocked
  try {
    await fs.promises.readFile("C:/tmp/.env.local");
    assertCondition("Credential file fs.promises.readFile blocked", false);
  } catch (err) {
    assertCondition("Credential file fs.promises.readFile blocked", err.message.includes("[GUARD] Denied credential access"));
  }

  // 6. Authorized local port is NOT blocked by url validation
  assertCondition("Localhost 127.0.0.1:18765 is allowed target", isAllowedTarget("127.0.0.1", 18765));
  assertCondition("Localhost 3001 is allowed target", isAllowedTarget("localhost", 3001));
  assertCondition("Remote target is disallowed", !isAllowedTarget("example.com", 80));

  console.log(`Self-tests complete: ${passed} passed, ${failed} failed.\n`);
  if (failed > 0) throw new Error("Guard self-tests failed");
  return { passed, failed };
}
