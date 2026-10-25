import { sendJson } from "@bhumi/qa-backend/server";
import { loadVercelQaConfig } from "./config.mjs";
import { createVercelQaHandler } from "./handler.mjs";

let cachedHandler = null;

export function getVercelQaHandler() {
  if (!cachedHandler) {
    const config = loadVercelQaConfig(process.env);
    cachedHandler = createVercelQaHandler({ config });
  }
  return cachedHandler;
}

export function createVercelQaEntrypoint() {
  return async function entrypoint(req, res) {
    try {
      return await getVercelQaHandler()(req, res);
    } catch {
      if (!res.headersSent) {
        sendJson(res, 503, { ok: false, outcome: "QA_BACKEND_UNAVAILABLE" });
      } else {
        res.end();
      }
    }
  };
}
