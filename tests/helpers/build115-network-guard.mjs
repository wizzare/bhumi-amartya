import { createRequire, syncBuiltinESMExports } from "node:module";

const require = createRequire(import.meta.url);
const synthetic = {
  NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-build115.invalid",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-build115",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-build115.invalid",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:synthetic",
};
for (const [key, value] of Object.entries(process.env)) {
  if (!value) continue;
  if (/CREDENTIAL|PRIVATE_KEY|SERVICE_ACCOUNT|ACCESS_TOKEN|REFRESH_TOKEN|FIREBASE_TOKEN|GOOGLE_APPLICATION|API_SECRET/i.test(key)) throw new Error("OFFLINE_ENV_REJECTED");
  if (/FIREBASE|GCLOUD_PROJECT|GOOGLE_CLOUD_PROJECT|HD_API_URL/.test(key) && value !== synthetic[key]) throw new Error("OFFLINE_ENV_REJECTED");
}
Object.assign(process.env, synthetic);
const blocked = () => { throw new Error("OFFLINE_TEST_NETWORK_BLOCKED"); };
globalThis.fetch = async () => blocked();
for (const name of ["node:http", "node:https"]) {
  const module = require(name);
  module.request = blocked;
  module.get = blocked;
}
const net = require("node:net");
net.connect = blocked;
net.createConnection = blocked;
net.Socket.prototype.connect = blocked;
require("node:tls").connect = blocked;
require("node:tls").TLSSocket.prototype.connect = blocked;
require("node:dgram").createSocket = blocked;
syncBuiltinESMExports();
