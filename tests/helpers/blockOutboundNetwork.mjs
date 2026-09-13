import net from "node:net";
import { syncBuiltinESMExports } from "node:module";

const allowedPorts = new Set();
for (const key of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST"]) {
  const value = process.env[key];
  if (!value) continue;
  const match = /^127\.0\.0\.1:([0-9]+)$/.exec(value);
  if (!match || Number(match[1]) < 1 || Number(match[1]) > 65535) {
    throw new Error("QA_NETWORK_INVALID_EMULATOR_ENDPOINT");
  }
  allowedPorts.add(Number(match[1]));
}
if (process.env.BHUMI_QA_REQUIRE_EMULATORS === "true" &&
    (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST)) {
  throw new Error("QA_NETWORK_EMULATORS_REQUIRED");
}

const hdOverride = process.env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL;
if (!hdOverride) throw new Error("HD_TEST_MISSING_OVERRIDE");
const hdUrl = new URL(hdOverride);
if (hdUrl.protocol !== "http:" || hdUrl.hostname !== "127.0.0.1" || !hdUrl.port ||
    hdUrl.username || hdUrl.password || hdUrl.search || hdUrl.hash ||
    hdUrl.pathname !== "/api/humandesign/calculate") {
  throw new Error("QA_NETWORK_INVALID_HD_ENDPOINT");
}
allowedPorts.add(Number(hdUrl.port));

function assertEndpoint(host, port) {
  if (host !== "127.0.0.1" || !allowedPorts.has(Number(port))) {
    throw new Error("QA_OUTBOUND_NETWORK_BLOCKED");
  }
}

const connect = net.Socket.prototype.connect;
net.Socket.prototype.connect = function (...args) {
  const first = Array.isArray(args[0]) ? args[0][0] : args[0];
  const options = typeof first === "object" && first !== null
    ? first
    : { port: first, host: typeof args[1] === "string" ? args[1] : undefined };
  assertEndpoint(options.host, options.port);
  return Reflect.apply(connect, this, args);
};
syncBuiltinESMExports();

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  assertEndpoint(url.hostname, url.port || (url.protocol === "https:" ? 443 : 80));
  if (url.protocol !== "http:" || url.username || url.password) {
    throw new Error("QA_OUTBOUND_NETWORK_BLOCKED");
  }
  if (Number(url.port) === Number(hdUrl.port) && url.href !== hdUrl.href) {
    throw new Error("QA_NETWORK_INVALID_HD_CONTRACT");
  }
  if (url.href === hdUrl.href && (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase() !== "POST") {
    throw new Error("QA_NETWORK_INVALID_HD_CONTRACT");
  }
  return originalFetch(input, { ...init, redirect: "error" });
};
