import { loadConfig } from "./lib/config.mjs";
import { startLocalBootstrapServer } from "./lib/server.mjs";

const config = loadConfig();
const { server } = await startLocalBootstrapServer(config);
const address = server.address();
const port = typeof address === "object" && address ? address.port : config.port;

console.log(JSON.stringify({
  service: config.service,
  host: config.host,
  port,
  protocol: config.tls ? "https" : "http",
  projectId: config.projectId,
  authProjectId: config.authProjectId,
  firestoreProjectId: config.firestoreProjectId,
  firestoreHost: config.firestoreHost,
  issuer: config.issuer,
  audience: config.audience,
  revocationEnabled: config.requireRevocation,
  routes: ["/healthz", "/api/access/bootstrap-trial", "/api/qa/bootstrap-first-login"],
}));

function shutdown() {
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
