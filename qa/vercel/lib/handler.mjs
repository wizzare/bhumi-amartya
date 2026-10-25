import {
  bearerToken,
  corsHeaders,
  handleRequest,
  originAllowed,
  sendJson,
} from "@bhumi/qa-backend/server";
import { createRateLimiter, clientKey } from "./rate-limit.mjs";
import { createQaServices } from "./services.mjs";
import { getVercelOidcToken } from "./wif.mjs";

const TRIAL_ROUTE = "/api/access/bootstrap-trial";
const FIRST_LOGIN_ROUTE = "/api/qa/bootstrap-first-login";
const HEALTH_ROUTES = new Set(["/healthz", "/api/healthz"]);

function isProtectedRoute(pathname) {
  return pathname === TRIAL_ROUTE || pathname === FIRST_LOGIN_ROUTE;
}

export function createVercelQaHandler({
  config,
  servicesFactory = createQaServices,
  now,
  rateLimiter = createRateLimiter(config.rateLimit),
}) {
  return async function handler(req, res) {
    const requestUrl = new URL(req.url || "/", "https://qa.invalid");
    const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;

    if (HEALTH_ROUTES.has(requestUrl.pathname) && req.method === "GET") {
      return handleRequest({
        config,
        verifier: async () => {
          throw new Error("QA_VERCEL_VERIFIER_UNAVAILABLE");
        },
        db: null,
        now,
        req,
        res,
      });
    }

    if (!isProtectedRoute(requestUrl.pathname)) {
      return handleRequest({
        config,
        verifier: async () => {
          throw new Error("QA_VERCEL_VERIFIER_UNAVAILABLE");
        },
        db: null,
        now,
        req,
        res,
      });
    }

    if (!originAllowed(config, origin)) {
      sendJson(res, 403, { ok: false, outcome: "ORIGIN_NOT_ALLOWED" });
      return;
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders(origin));
      res.end();
      return;
    }

    if (req.method === "POST" && !rateLimiter.check(clientKey(req))) {
      sendJson(res, 429, { ok: false, outcome: "RATE_LIMITED" }, corsHeaders(origin));
      return;
    }

    if (req.method === "POST" && bearerToken(req)) {
      try {
        getVercelOidcToken(req);
      } catch {
        sendJson(res, 503, { ok: false, outcome: "QA_BACKEND_UNAVAILABLE" }, corsHeaders(origin));
        return;
      }
    }

    let services = null;
    let activeDb = null;
    const db = {
      doc(path) {
        if (!activeDb) throw new Error("QA_VERCEL_DB_UNAVAILABLE");
        return activeDb.doc(path);
      },
      runTransaction(fn) {
        if (!activeDb) throw new Error("QA_VERCEL_DB_UNAVAILABLE");
        return activeDb.runTransaction(fn);
      },
    };

    const verifier = async (token) => {
      if (!services) {
        try {
          const subjectToken = getVercelOidcToken(req);
          services = await servicesFactory({ config, subjectToken, req });
          activeDb = services.db;
        } catch {
          throw Object.assign(new Error("QA_VERCEL_UNAVAILABLE"), { code: "QA_VERCEL_UNAVAILABLE" });
        }
      }
      return services.verifier(token);
    };

    try {
      await handleRequest({ config, verifier, db, now, req, res });
    } finally {
      if (services?.dispose) await services.dispose();
    }
  };
}
