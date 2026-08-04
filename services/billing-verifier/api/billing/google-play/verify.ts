import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { adminAuth } from "../../../lib/firebaseAdmin";
import { acknowledgeSubscription, checkVoidedPurchase, createGooglePlayRequestContext, fetchSubscription, validateProduct } from "../../../lib/googlePlay";
import { decision, markEntitlementAcknowledged, persistEntitlement } from "../../../lib/entitlement";
import { BASE_PLAN_ID, MAX_BODY_BYTES, PACKAGE_NAME, PRODUCT_ID, originAllowed, previewDryRunEnabled, tokenHash } from "../../../lib/security";
import { sendJson } from "../../../lib/response";
import { executeLedgerVerificationTx, markLedgerSyncFailure, markLedgerSyncSuccess, updateLedgerAck } from "../../../lib/purchaseLedger";
import { generateSignedEntitlement } from "../../../lib/signedEntitlement";
import {
  ACK_MARK_TIMEOUT_MS,
  PERSIST_ENTITLEMENT_TIMEOUT_MS,
  TOTAL_REQUEST_BUDGET_MS,
  VERIFY_ID_TOKEN_TIMEOUT_MS,
  StageTimeoutError,
  correlationId,
  logStage,
  mapAuthVerificationError,
  runStage,
  withTimeout,
  type StageLogContext,
} from "../../../lib/timeout";

export const config = { runtime: "nodejs", maxDuration: 30, api: { bodyParser: { sizeLimit: "16kb" } } };
type RouteResult = { status: number; body: Record<string, unknown> };

function result(status: number, body: Record<string, unknown>): RouteResult { return { status, body }; }

// processVerifiedRequest is the main request handler

async function processVerifiedRequest(req: VercelRequest, context: StageLogContext): Promise<RouteResult> {
  // Step 1: Validate Firebase authentication
  const authorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authorization.startsWith("Bearer ")) return result(401, { ok: false, error: "AUTH_MISSING" });

  let decoded: { uid: string };
  try {
    decoded = await runStage(context, "VERIFY_ID_TOKEN", VERIFY_ID_TOKEN_TIMEOUT_MS, adminAuth().verifyIdToken(authorization.slice(7).trim(), true));
  } catch (error) {
    const mapped = mapAuthVerificationError(error);
    return result(mapped.status, { ok: false, error: mapped.error, retryable: mapped.retryable });
  }

  // Step 2: Validate request schema
  const body = req.body as Record<string, unknown>;
  const purchaseToken = typeof body?.purchaseToken === "string" ? body.purchaseToken.trim() : "";
  if (!purchaseToken || body.productId !== PRODUCT_ID || Object.keys(body).some((key) => !["purchaseToken", "productId"].includes(key))) {
    return result(400, { ok: false, error: !purchaseToken ? "BODY_INVALID" : "PRODUCT_MISMATCH" });
  }
  if (previewDryRunEnabled()) return result(200, { ok: true, active: false, status: "PREVIEW_DRY_RUN", membershipType: "FREE", accessUntil: null, refreshRequired: false, productId: PRODUCT_ID, basePlanId: BASE_PLAN_ID, packageName: PACKAGE_NAME, preview: true });

  // Step 3: Verify purchase against Google Play
  const googleContext = createGooglePlayRequestContext(context);
  try {
    const subscription = await fetchSubscription(purchaseToken, googleContext);
    const item = subscription.lineItems?.[0];
    if (!validateProduct(item)) return result(403, { ok: false, error: "PRODUCT_MISMATCH" });
    const state = subscription.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED";
    if (state === "SUBSCRIPTION_STATE_UNSPECIFIED") return result(403, { ok: false, error: "SUBSCRIPTION_INACTIVE" });

    const voidedCheck = await checkVoidedPurchase(purchaseToken, googleContext);
    if (!voidedCheck.checked) console.error("[GOOGLE_PLAY_VOIDED_CHECK_UNAVAILABLE]", { reason: voidedCheck.reason, productId: PRODUCT_ID, packageName: PACKAGE_NAME });
    const entitlement = decision(state, item?.expiryTime, { voided: voidedCheck.voided });
    const acknowledgementPending = entitlement.active && subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING";
    const ledgerStatus = entitlement.active ? "ACTIVE_PENDING_SYNC" : entitlement.status;
    const hash = tokenHash(purchaseToken);

    // Steps 4-8: Atomic Postgres transaction (upsert ledger + insert event + insert sync job)
    await executeLedgerVerificationTx({
      uid: decoded.uid,
      purchaseToken,
      productId: PRODUCT_ID,
      packageName: PACKAGE_NAME,
      provider: "google_play",
      purchaseState: state,
      entitlementStatus: ledgerStatus,
      acknowledged: subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
      expiresAt: entitlement.date,
    });

    // Step 9: Issue asymmetric signed entitlement (24h TTL)
    const tokenTtlSeconds = 24 * 60 * 60;
    const subscriptionExpirySec = entitlement.date ? Math.floor(entitlement.date.getTime() / 1000) : Math.floor(Date.now() / 1000) + tokenTtlSeconds;
    const signedEntitlement = generateSignedEntitlement({
      sub: decoded.uid,
      productId: PRODUCT_ID,
      status: entitlement.active ? "ACTIVE" : entitlement.status,
      exp: Math.min(subscriptionExpirySec, Math.floor(Date.now() / 1000) + tokenTtlSeconds),
      jti: randomUUID(),
      syncStatus: ledgerStatus,
    });

    // Resilient Firestore sync: attempt synchronously, swallow failures
    let firestoreSynced = false;
    try {
      await withTimeout("PERSIST_ENTITLEMENT", PERSIST_ENTITLEMENT_TIMEOUT_MS,
        persistEntitlement(decoded.uid, purchaseToken, state, entitlement, acknowledgementPending ? "ACK_PENDING" : subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED" ? "ACKNOWLEDGED" : "NOT_REQUIRED", voidedCheck));
      firestoreSynced = true;
      await markLedgerSyncSuccess(hash);
    } catch (fsErr: any) {
      console.warn("[FIRESTORE_SYNC_FAILED_GRACEFUL_DEGRADE]", { correlationId: context.correlationId, error: fsErr?.message });
      await markLedgerSyncFailure(hash, fsErr?.message || "FIRESTORE_WRITE_ERROR").catch(() => {});
    }

    // Step 10: Acknowledge purchase if required
    let acknowledgementDeferred = false;
    if (acknowledgementPending) {
      try {
        await acknowledgeSubscription(purchaseToken, googleContext);
        await updateLedgerAck(hash, true);
        if (firestoreSynced) {
          await withTimeout("ACKNOWLEDGE", ACK_MARK_TIMEOUT_MS, markEntitlementAcknowledged(decoded.uid, purchaseToken));
        }
      } catch {
        acknowledgementDeferred = true;
      }
    }

    // Step 11: Return verified result
    return result(200, {
      ok: true,
      active: entitlement.active,
      status: firestoreSynced ? entitlement.status : "ACTIVE_PENDING_SYNC",
      membershipType: entitlement.active ? "PREMIUM" : "FREE",
      accessUntil: entitlement.date?.toISOString() || null,
      badge: entitlement.active ? "Penghuni Bhumi" : undefined,
      refreshRequired: true,
      acknowledgementDeferred,
      signedEntitlement,
      productId: PRODUCT_ID,
      basePlanId: BASE_PLAN_ID,
      packageName: PACKAGE_NAME,
    });
  } catch (error) {
    if (error instanceof StageTimeoutError) {
      return result(504, { ok: false, error: `${error.stage}_TIMEOUT`, retryable: true });
    }
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const safe = ["TOKEN_INVALID", "TOKEN_OWNERSHIP_CONFLICT", "GOOGLE_API_FAILURE"].includes(code) ? code : "LEDGER_WRITE_FAILURE";
    return result(safe === "TOKEN_OWNERSHIP_CONFLICT" ? 409 : safe === "TOKEN_INVALID" ? 403 : 502, { ok: false, error: safe, retryable: safe === "GOOGLE_API_FAILURE" || safe === "LEDGER_WRITE_FAILURE" });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const totalStartedAt = Date.now();
  const context: StageLogContext = { correlationId: correlationId(), totalStartedAt };
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  if (!originAllowed(origin)) return sendJson(res, 403, { ok: false, error: "ORIGIN_NOT_ALLOWED" });
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  if (Number(req.headers["content-length"] || 0) > MAX_BODY_BYTES) return sendJson(res, 413, { ok: false, error: "BODY_INVALID" });

  let response: RouteResult;
  let totalError: unknown;
  try {
    response = await withTimeout("TOTAL_DURATION", TOTAL_REQUEST_BUDGET_MS, processVerifiedRequest(req, context));
    return sendJson(res, response.status, response.body);
  } catch (error) {
    totalError = error;
    return sendJson(res, 504, { ok: false, error: "TOTAL_REQUEST_TIMEOUT", retryable: true });
  } finally {
    logStage(context, "TOTAL_DURATION", totalStartedAt, 0, totalError);
  }
}
