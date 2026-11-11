import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAuth } from "../../lib/firebaseAdmin";
import { originAllowed } from "../../lib/security";
import { sendJson } from "../../lib/response";
import { issueIntegrityChallenge, resolveAntiAbuseHmacSecret } from "../../lib/playIntegrity";

export const config = { runtime: "nodejs", maxDuration: 15, api: { bodyParser: { sizeLimit: "4kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const failure = (status: number, error: string) => sendJson(res, status, { ok: false, error });

  if (!originAllowed(origin)) return failure(403, "ORIGIN_NOT_ALLOWED");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Firebase-AppCheck");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return failure(405, "METHOD_NOT_ALLOWED");

  const authorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authorization.startsWith("Bearer ") || !authorization.slice(7).trim()) {
    return failure(401, "AUTH_MISSING");
  }

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid;
    if (!uid || uid.includes("/")) return failure(401, "AUTH_INVALID");
  } catch {
    return failure(401, "AUTH_INVALID");
  }

  try {
    const secret = resolveAntiAbuseHmacSecret();
    const challenge = issueIntegrityChallenge(uid, secret);
    return sendJson(res, 200, { ok: true, ...challenge });
  } catch {
    return failure(500, "CHALLENGE_UNAVAILABLE");
  }
}
