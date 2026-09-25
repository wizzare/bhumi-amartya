import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { getDbPool } from "../../lib/neon";
import { decryptToken, type EncryptedData } from "../../lib/encryption";
import { createGooglePlayRequestContext, fetchSubscription, acknowledgeSubscription, validateProduct, checkVoidedPurchase } from "../../lib/googlePlay";
import { PRODUCT_ID } from "../../lib/security";
import { decision, markEntitlementAcknowledged, persistEntitlement } from "../../lib/entitlement";
import { sendJson } from "../../lib/response";
import { correlationId } from "../../lib/timeout";

export const config = { runtime: "nodejs", maxDuration: 60 };

const MAX_JOBS_PER_RUN = 25;
const MAX_ATTEMPTS = 10;

type ClaimedJob = { id: number; ledger_id: string; job_type: string; attempt_count: number };
type LedgerRow = {
  firebase_uid: string;
  provider: string;
  product_id: string;
  purchase_token_ciphertext: string;
  purchase_token_iv: string;
  purchase_token_tag: string;
  encryption_key_version: string;
  acknowledged: boolean;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Cron authentication: reject missing/invalid secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return sendJson(res, 500, { ok: false, error: "CRON_SECRET_NOT_CONFIGURED" });
  }
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${cronSecret}`) {
    return sendJson(res, 401, { ok: false, error: "UNAUTHORIZED_CRON" });
  }

  const pool = getDbPool();
  const workerId = `worker-${randomUUID().slice(0, 8)}`;

  // Atomic claim: FOR UPDATE SKIP LOCKED prevents concurrent workers from processing the same job
  const claimResult = await pool.query<ClaimedJob>(
    `UPDATE entitlement_sync_jobs
     SET status = 'PROCESSING',
         locked_at = NOW(),
         locked_by = $1,
         attempt_count = attempt_count + 1,
         updated_at = NOW()
     WHERE id IN (
       SELECT id FROM entitlement_sync_jobs
       WHERE status IN ('PENDING', 'FAILED')
         AND next_attempt_at <= NOW()
         AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')
       ORDER BY next_attempt_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $2
     )
     RETURNING id, ledger_id, job_type, attempt_count`,
    [workerId, MAX_JOBS_PER_RUN]
  );

  const jobs = claimResult.rows;
  let succeeded = 0;
  let failed = 0;
  let deadLettered = 0;

  for (const job of jobs) {
    const context = { correlationId: correlationId(), totalStartedAt: Date.now() };
    const googleContext = createGooglePlayRequestContext(context);

    try {
      // Fetch ledger row with encrypted token data
      const ledgerRes = await pool.query<LedgerRow>(
        `SELECT firebase_uid, provider, product_id,
                purchase_token_ciphertext, purchase_token_iv, purchase_token_tag,
                encryption_key_version, acknowledged
         FROM purchase_ledger WHERE token_hash = $1`,
        [job.ledger_id]
      );

      if (ledgerRes.rows.length === 0) {
        // Ledger row deleted; mark job completed
        await pool.query("UPDATE entitlement_sync_jobs SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = $1", [job.id]);
        succeeded++;
        continue;
      }

      const row = ledgerRes.rows[0];
      const encrypted: EncryptedData = {
        ciphertext: row.purchase_token_ciphertext,
        iv: row.purchase_token_iv,
        tag: row.purchase_token_tag,
        version: row.encryption_key_version,
      };

      const rawToken = decryptToken(encrypted, {
        uid: row.firebase_uid,
        productId: row.product_id,
        provider: row.provider,
      });

      if (row.provider !== "google_play" || row.product_id !== PRODUCT_ID) throw new Error("PRODUCT_MISMATCH");
      if (job.job_type === "FIRESTORE_SYNC" || job.job_type === "ACKNOWLEDGEMENT") {
        // Re-verify against Google Play
        const subscription = await fetchSubscription(rawToken, googleContext);
        const item = subscription.lineItems?.[0];
        if (!validateProduct(item)) throw new Error("PRODUCT_MISMATCH");
        const state = subscription.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED";
        if (state === "SUBSCRIPTION_STATE_UNSPECIFIED") throw new Error("SUBSCRIPTION_UNAVAILABLE");
        const voidedCheck = await checkVoidedPurchase(rawToken, googleContext);
        const entitlement = decision(state, item?.expiryTime, { voided: voidedCheck.voided });
        const acknowledgementPending = entitlement.active && subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING";

        // Persist to Firestore
        await persistEntitlement(
          row.firebase_uid,
          rawToken,
          state,
          entitlement,
          acknowledgementPending ? "ACK_PENDING" : subscription.acknowledgementState === "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED" ? "ACKNOWLEDGED" : "NOT_REQUIRED",
          voidedCheck
        );

        if (acknowledgementPending) {
          await acknowledgeSubscription(rawToken, googleContext);
          await markEntitlementAcknowledged(row.firebase_uid, rawToken);
          await pool.query("UPDATE purchase_ledger SET acknowledged = true, updated_at = NOW() WHERE token_hash = $1", [job.ledger_id]);
        }
        await pool.query(
          `UPDATE purchase_ledger SET firestore_sync_status = 'SYNCED', entitlement_status = $2, updated_at = NOW() WHERE token_hash = $1`,
          [job.ledger_id, entitlement.active ? "ACTIVE_SYNCED" : entitlement.status]
        );
        await pool.query("UPDATE entitlement_sync_jobs SET status = 'COMPLETED', completed_at = NOW(), updated_at = NOW() WHERE id = $1", [job.id]);
        succeeded++;
      } else {
        throw new Error("JOB_TYPE_INVALID");
      }
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : "";
      const errorCode = ["PRODUCT_MISMATCH", "SUBSCRIPTION_UNAVAILABLE", "TOKEN_OWNERSHIP_CONFLICT", "TOKEN_INVALID", "GOOGLE_API_FAILURE", "ACKNOWLEDGMENT_FAILURE", "JOB_TYPE_INVALID"].includes(code) ? code : "RECONCILE_FAILED";

      if (job.attempt_count >= MAX_ATTEMPTS) {
        // Dead-letter after max attempts
        await pool.query(
          "UPDATE entitlement_sync_jobs SET status = 'DEAD_LETTER', last_error_code = $2, updated_at = NOW() WHERE id = $1",
          [job.id, errorCode]
        );
        deadLettered++;
      } else {
        // Exponential backoff: 2^attempt_count minutes
        const backoffMinutes = Math.min(Math.pow(2, job.attempt_count), 60);
        await pool.query(
          `UPDATE entitlement_sync_jobs
           SET status = 'FAILED',
               locked_at = NULL,
               locked_by = NULL,
               last_error_code = $2,
               next_attempt_at = NOW() + ($3 || ' minutes')::INTERVAL,
               updated_at = NOW()
           WHERE id = $1`,
          [job.id, errorCode, String(backoffMinutes)]
        );
        failed++;
      }
    }
  }

  return sendJson(res, 200, {
    ok: true,
    claimed: jobs.length,
    succeeded,
    failed,
    deadLettered,
    workerId,
  });
}
