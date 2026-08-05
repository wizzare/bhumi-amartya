import { randomUUID } from "node:crypto";
import { getDbPool } from "./neon";
import { tokenHash } from "./security";
import { encryptToken } from "./encryption";

export interface LedgerTxParams {
  uid: string;
  purchaseToken: string;
  productId: string;
  packageName: string;
  provider: string;
  orderId?: string | null;
  purchaseState: string;
  entitlementStatus: string;
  acknowledged: boolean;
  acknowledgementRequired?: boolean;
  purchasedAt?: Date | null;
  expiresAt?: Date | null;
  lastErrorCode?: string | null;
}

// Pure, testable decision: should an ACKNOWLEDGEMENT job be enqueued?
export function shouldCreateAcknowledgementJob(params: LedgerTxParams): boolean {
  const isPurchasedAckState = params.purchaseState === "SUBSCRIPTION_STATE_ACTIVE"
    || params.purchaseState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"
    || params.purchaseState === "PURCHASED";
  const ackRequired = params.acknowledgementRequired === true;
  return isPurchasedAckState && ackRequired && params.acknowledged !== true;
}

export async function checkTokenOwnership(purchaseToken: string, uid: string): Promise<void> {
  const hash = tokenHash(purchaseToken);
  const pool = getDbPool();
  const res = await pool.query("SELECT firebase_uid FROM purchase_ledger WHERE token_hash = $1", [hash]);
  if (res.rows.length > 0 && res.rows[0].firebase_uid !== uid) {
    throw new Error("TOKEN_OWNERSHIP_CONFLICT");
  }
}

export async function executeLedgerVerificationTx(params: LedgerTxParams): Promise<{ hash: string; jobId: number }> {
  const hash = tokenHash(params.purchaseToken);
  const encrypted = encryptToken(params.purchaseToken, {
    uid: params.uid,
    productId: params.productId,
    provider: params.provider,
  });

  const pool = getDbPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Check ownership inside transaction
    const ownerRes = await client.query("SELECT firebase_uid FROM purchase_ledger WHERE token_hash = $1 FOR UPDATE", [hash]);
    if (ownerRes.rows.length > 0 && ownerRes.rows[0].firebase_uid !== params.uid) {
      throw new Error("TOKEN_OWNERSHIP_CONFLICT");
    }

    const now = new Date();

    // 2. Upsert purchase ledger idempotently
    await client.query(
      `INSERT INTO purchase_ledger (
        token_hash, firebase_uid, provider, product_id, purchase_token_ciphertext,
        purchase_token_iv, purchase_token_tag, encryption_key_version, order_id,
        purchase_state, entitlement_status, acknowledged, purchased_at, expires_at,
        last_verified_at, firestore_sync_status, retry_count, last_error_code, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'PENDING', 0, $16, $15, $15)
       ON CONFLICT (token_hash) DO UPDATE SET
        purchase_state = EXCLUDED.purchase_state,
        entitlement_status = EXCLUDED.entitlement_status,
        acknowledged = EXCLUDED.acknowledged,
        purchased_at = EXCLUDED.purchased_at,
        expires_at = EXCLUDED.expires_at,
        last_verified_at = EXCLUDED.last_verified_at,
        last_error_code = EXCLUDED.last_error_code,
        updated_at = EXCLUDED.updated_at`,
      [
        hash,
        params.uid,
        params.provider,
        params.productId,
        encrypted.ciphertext,
        encrypted.iv,
        encrypted.tag,
        encrypted.version,
        params.orderId || null,
        params.purchaseState,
        params.entitlementStatus,
        params.acknowledged,
        params.purchasedAt ? params.purchasedAt.toISOString() : null,
        params.expiresAt ? params.expiresAt.toISOString() : null,
        now.toISOString(),
        params.lastErrorCode || null,
      ]
    );

    // 3. Insert billing event idempotently
    const idempotencyKey = `verify_${hash}_${now.getTime()}`;
    await client.query(
      `INSERT INTO billing_events (
        ledger_id, event_type, idempotency_key, sanitized_payload, occurred_at
      ) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [
        hash,
        "VERIFY_REQUEST",
        idempotencyKey,
        JSON.stringify({
          uid: params.uid,
          productId: params.productId,
          purchaseState: params.purchaseState,
          entitlementStatus: params.entitlementStatus,
          acknowledged: params.acknowledged,
        }),
        now.toISOString(),
      ]
    );

    // 4. Insert or update entitlement sync job (FIRESTORE_SYNC)
    const jobRes = await client.query(
      `INSERT INTO entitlement_sync_jobs (
        ledger_id, job_type, status, attempt_count, next_attempt_at, created_at, updated_at
      ) VALUES ($1, 'FIRESTORE_SYNC', 'PENDING', 0, $2, $2, $2)
       RETURNING id`,
      [hash, now.toISOString()]
    );

    // 5. Insert acknowledgement job if required (ACKNOWLEDGEMENT)
    if (shouldCreateAcknowledgementJob(params)) {
      await client.query(
        `INSERT INTO entitlement_sync_jobs (
          ledger_id, job_type, status, attempt_count, next_attempt_at, created_at, updated_at
        ) VALUES ($1, 'ACKNOWLEDGEMENT', 'PENDING', 0, $2, $2, $2)`,
        [hash, now.toISOString()]
      );
    }

    const jobId = jobRes.rows[0].id;

    await client.query("COMMIT");
    return { hash, jobId };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function markLedgerSyncSuccess(tokenHashValue: string): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `UPDATE purchase_ledger
     SET firestore_sync_status = 'SYNCED',
         entitlement_status = 'ACTIVE_SYNCED',
         updated_at = NOW()
     WHERE token_hash = $1`,
    [tokenHashValue]
  );
  await pool.query(
    `UPDATE entitlement_sync_jobs
     SET status = 'COMPLETED',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE ledger_id = $1 AND job_type = 'FIRESTORE_SYNC'`,
    [tokenHashValue]
  );
}

export async function markLedgerSyncFailure(tokenHashValue: string, errorCode: string): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `UPDATE purchase_ledger
     SET firestore_sync_status = 'FAILED',
         last_error_code = $2,
         updated_at = NOW()
     WHERE token_hash = $1`,
    [tokenHashValue, errorCode]
  );
  await pool.query(
    `UPDATE entitlement_sync_jobs
     SET status = 'FAILED',
         last_error_code = $2,
         updated_at = NOW()
     WHERE ledger_id = $1 AND job_type = 'FIRESTORE_SYNC'`,
    [tokenHashValue, errorCode]
  );
}

export async function updateLedgerAck(tokenHashValue: string, acknowledged: boolean): Promise<void> {
  const pool = getDbPool();
  await pool.query(
    `UPDATE purchase_ledger
     SET acknowledged = $2,
         updated_at = NOW()
     WHERE token_hash = $1`,
    [tokenHashValue, acknowledged]
  );
  if (acknowledged) {
    await pool.query(
      `UPDATE entitlement_sync_jobs
       SET status = 'COMPLETED',
           completed_at = NOW(),
           updated_at = NOW()
       WHERE ledger_id = $1 AND job_type = 'ACKNOWLEDGEMENT'`,
      [tokenHashValue]
    );
  }
}
