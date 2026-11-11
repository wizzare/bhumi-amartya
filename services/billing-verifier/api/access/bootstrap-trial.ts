import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";
import { MAX_BODY_BYTES, originAllowed } from "../../lib/security";
import { sendJson } from "../../lib/response";
import {
  parseVerifierSignals,
  runVerifierTrialBootstrap,
  type TrialBootstrapOutcome,
  type TrialBootstrapResponse,
} from "../../lib/antiAbuse";

export type { TrialBootstrapOutcome, TrialBootstrapResponse };

export const config = { runtime: "nodejs", maxDuration: 30, api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const failure = (status: number, error: string) =>
    sendJson(res, status, { ok: false, outcome: "RETRYABLE_ERROR", error });
  if (!originAllowed(origin)) return failure(403, "ORIGIN_NOT_ALLOWED");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Firebase-AppCheck");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return failure(405, "METHOD_NOT_ALLOWED");
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return failure(413, "BODY_INVALID");

  const appCheckHeader =
    typeof req.headers["x-firebase-appcheck"] === "string" ? req.headers["x-firebase-appcheck"] : undefined;
  const parsed = parseVerifierSignals(req.body, appCheckHeader);
  if (!parsed.valid) return failure(400, "BODY_INVALID");

  const authorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authorization.startsWith("Bearer ") || !authorization.slice(7).trim()) return failure(401, "AUTH_MISSING");
  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid;
    if (!uid || uid.includes("/")) return failure(401, "AUTH_INVALID");
  } catch {
    return failure(401, "AUTH_INVALID");
  }

  try {
    const db = adminDb();
    const { statusCode, body } = await runVerifierTrialBootstrap(db, uid, parsed.signals);
    return sendJson(res, statusCode, body);
  } catch {
    return failure(500, "ENTITLEMENT_WRITE_FAILURE");
  }
}
