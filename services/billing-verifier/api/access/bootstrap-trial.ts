import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";
import { MAX_BODY_BYTES, originAllowed } from "../../lib/security";
import { sendJson } from "../../lib/response";

export type TrialBootstrapOutcome = "PROVISIONED" | "ALREADY_PRESENT" | "HIGHER_ENTITLEMENT" | "EXPIRED_BY_ACCOUNT_AGE" | "DATA_CONFLICT" | "AUTH_CREATION_TIME_UNAVAILABLE" | "RETRYABLE_ERROR";
export type TrialBootstrapResponse = { ok: boolean; outcome: TrialBootstrapOutcome; trialStartedAt?: string; trialEndsAt?: string; error?: string };

export const config = { runtime: "nodejs", maxDuration: 30, api: { bodyParser: { sizeLimit: "16kb" } } };
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const SOURCE = "server_access_bootstrap";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const failure = (status: number, error: string) => sendJson(res, status, { ok: false, outcome: "RETRYABLE_ERROR", error });
  if (!originAllowed(origin)) return failure(403, "ORIGIN_NOT_ALLOWED");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return failure(405, "METHOD_NOT_ALLOWED");
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return failure(413, "BODY_INVALID");
  if (req.body != null && req.body !== "" && (typeof req.body !== "object" || Array.isArray(req.body) || Object.keys(req.body).length)) return failure(400, "BODY_INVALID");
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
    const ref = db.doc(`users/${uid}`);
    const result = await db.runTransaction<TrialBootstrapResponse>(async (transaction) => {
      const snapshot = await transaction.get(ref);
      const data = snapshot.data() || {};
      if ([data.badge, data.testerBadge, data.guardianBadge].some(value => ["Founder", "Penjaga Bhumi Inti", "Penjaga Bhumi Alfa"].includes(value)) || data.membershipType === "LIFETIME" || data.membershipType === "PREMIUM" || data.isPremium === true) {
        return { ok: true, outcome: "HIGHER_ENTITLEMENT" };
      }
      const hasTrial = ["trialStartedAt", "trialEndsAt", "accessStart", "accessUntil", "entitlementSource", "accessSource", "trialLoginCount", "trialStatus", "trialCompletedAt", "trialGranted"].some(key => Object.hasOwn(data, key)) || data.membershipType === "TRIAL" || data.membership === "REGULAR_TRIAL" || data.plan === "free_trial" || data.subscriptionStatus === "trialing";
      if (hasTrial) {
        const start = typeof data.trialStartedAt === "string" ? Date.parse(data.trialStartedAt) : NaN;
        const end = typeof data.trialEndsAt === "string" ? Date.parse(data.trialEndsAt) : NaN;
        const valid = Number.isFinite(start) && Number.isFinite(end) && end - start === SEVEN_DAYS_MS && start <= Date.now() &&
          data.entitlementSource === SOURCE && data.accessSource === SOURCE && data.updatedBy === SOURCE &&
          data.accessSourceVersion === "2026-09-13" && data.accessStart === data.trialStartedAt && data.accessUntil === data.trialEndsAt &&
          data.membershipType === "TRIAL" && data.membership === "REGULAR_TRIAL" && data.plan === "free_trial" && data.subscriptionStatus === "trialing";
        return { ok: valid, outcome: valid ? "ALREADY_PRESENT" : "DATA_CONFLICT" };
      }
      const now = new Date();
      const start = now.toISOString();
      const end = new Date(now.getTime() + SEVEN_DAYS_MS).toISOString();
      transaction.set(ref, {
        plan: "free_trial", membership: "REGULAR_TRIAL", membershipType: "TRIAL", subscriptionStatus: "trialing",
        trialStartedAt: start, trialEndsAt: end, accessStart: start, accessUntil: end,
        entitlementSource: SOURCE, accessSource: SOURCE, accessSourceVersion: "2026-09-13",
        entitlementUpdatedAt: start, updatedBy: SOURCE, updatedAt: start,
      }, { merge: true });
      return { ok: true, outcome: "PROVISIONED" };
    });
    return sendJson(res, result.ok ? 200 : 409, result);
  } catch {
    return failure(500, "ENTITLEMENT_WRITE_FAILURE");
  }
}
