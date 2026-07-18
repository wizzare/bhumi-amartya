import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminAuth } from "../../../lib/firebaseAdmin";
import { acknowledgeSubscription, fetchSubscription, validateProduct } from "../../../lib/googlePlay";
import { decision, persistEntitlement } from "../../../lib/entitlement";
import { BASE_PLAN_ID, MAX_BODY_BYTES, PACKAGE_NAME, PRODUCT_ID, originAllowed } from "../../../lib/security";
import { sendJson } from "../../../lib/response";

export const config = { runtime: "nodejs20.x", maxDuration: 30, api: { bodyParser: { sizeLimit: "16kb" } } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  if (!originAllowed(origin)) return sendJson(res, 403, { ok: false, error: "ORIGIN_NOT_ALLOWED" });
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return sendJson(res, 413, { ok: false, error: "BODY_INVALID" });
  const authorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authorization.startsWith("Bearer ")) return sendJson(res, 401, { ok: false, error: "AUTH_MISSING" });
  let decoded: { uid: string };
  try { decoded = await adminAuth().verifyIdToken(authorization.slice(7).trim(), true); } catch (error) { const message = error instanceof Error ? error.message : ""; return sendJson(res, 401, { ok: false, error: message.includes("revoked") ? "AUTH_REVOKED" : message.includes("expired") ? "AUTH_EXPIRED" : "AUTH_INVALID" }); }
  const body = req.body as Record<string, unknown>;
  const purchaseToken = typeof body?.purchaseToken === "string" ? body.purchaseToken.trim() : "";
  if (!purchaseToken || body.productId !== PRODUCT_ID || Object.keys(body).some((key) => !["purchaseToken", "productId"].includes(key))) return sendJson(res, 400, { ok: false, error: !purchaseToken ? "BODY_INVALID" : "PRODUCT_MISMATCH" });
  try {
    const subscription = await fetchSubscription(purchaseToken);
    const item = subscription.lineItems?.[0];
    if (!validateProduct(item)) return sendJson(res, 403, { ok: false, error: "PRODUCT_MISMATCH" });
    const state = subscription.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED";
    const result = decision(state, item?.expiryTime);
    if (result.active && item?.acknowledgementState !== "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED") await acknowledgeSubscription(purchaseToken);
    if (state === "SUBSCRIPTION_STATE_UNSPECIFIED") return sendJson(res, 403, { ok: false, error: "SUBSCRIPTION_INACTIVE" });
    await persistEntitlement(decoded.uid, purchaseToken, state, result);
    return sendJson(res, 200, { ok: true, active: result.active, status: result.status, membershipType: result.active ? "PREMIUM" : "FREE", accessUntil: result.date?.toISOString() || null, badge: result.active ? "Penghuni Bhumi" : undefined, refreshRequired: true, productId: PRODUCT_ID, basePlanId: BASE_PLAN_ID, packageName: PACKAGE_NAME });
  } catch (error) { const code = error instanceof Error ? error.message : "UNKNOWN"; const safe = ["TOKEN_INVALID", "TOKEN_OWNERSHIP_CONFLICT", "GOOGLE_API_FAILURE", "ACKNOWLEDGMENT_FAILURE"].includes(code) ? code : "ENTITLEMENT_WRITE_FAILURE"; return sendJson(res, safe === "TOKEN_OWNERSHIP_CONFLICT" ? 409 : 502, { ok: false, error: safe }); }
}
