import fs from "node:fs";
import net from "node:net";
import tls from "node:tls";
import http from "node:http";
import https from "node:https";
import { syncBuiltinESMExports } from "node:module";

const blocked = () => { throw new Error("HD test blocked external IO"); };
globalThis.fetch = blocked;
net.connect = blocked;
net.createConnection = blocked;
net.Socket.prototype.connect = blocked;
tls.connect = blocked;
http.request = blocked;
http.get = blocked;
https.request = blocked;
https.get = blocked;
const forbidden = path => /(?:\.env(?:\.|$)|service.?account|firebase-adminsdk|keystore|\.pem$|\.build106-production-admin-provision|Downloads[\\/].*\.json)/i.test(String(path));
for (const name of ["readFileSync", "readFile", "openSync", "open", "existsSync"]) {
  const original = fs[name];
  fs[name] = function(path, ...args) {
    if (forbidden(path)) return blocked();
    return original.call(this, path, ...args);
  };
}
for (const name of ["readFile", "open"]) {
  const original = fs.promises[name];
  fs.promises[name] = function(path, ...args) {
    if (forbidden(path)) return Promise.reject(new Error("HD test blocked credential IO"));
    return original.call(this, path, ...args);
  };
}
syncBuiltinESMExports();
