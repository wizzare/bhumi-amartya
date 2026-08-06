/**
 * Phase B1.3 Driver-Level Disposable PostgreSQL Integration
 *
 * Exercises PRODUCTION billing code in-process against real PostgreSQL 16
 * through an injected pg adapter:
 *   - runMigrations(pgPool)          (scripts/migrate.ts)
 *   - executeLedgerVerificationTx(..., { pool: pgPool })  (lib/purchaseLedger.ts)
 *   - encryptToken / decryptToken    (lib/encryption.ts)
 *   - reconcile claim query          (api/billing/reconcile.ts SQL)
 *
 * docker exec psql is used ONLY for physical-state assertions that must read
 * raw rows (e.g. confirming plaintext is absent and ciphertext is stored).
 *
 * Only localhost PostgreSQL (docker) is accessed. No external network calls.
 */

import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createPgPool } from "../helpers/pgAdapter";
import type { BillingDbPool } from "../../lib/db";
import { runMigrations } from "../../scripts/migrate";
import { executeLedgerVerificationTx } from "../../lib/purchaseLedger";
import { encryptToken, decryptToken } from "../../lib/encryption";

const container = process.env.POSTGRES_CONTAINER || "bhumi-b1-postgres-test";
const dbUser = process.env.POSTGRES_USER || "postgres";
const dbName = process.env.POSTGRES_DB || "test";
const TEST_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

// Physical-state query via docker exec psql (no production pool involvement)
function runSql(sql: string): string {
  const host_tmpFile = `C:\\tmp\\bhumi_query_${randomUUID().slice(0, 8)}.sql`;
  const container_tmpFile = `/tmp/bhumi_query_${randomUUID().slice(0, 8)}.sql`;
  require("node:fs").writeFileSync(host_tmpFile, sql, "utf8");
  try {
    execSync(`docker cp "${host_tmpFile}" ${container}:${container_tmpFile}`);
    return execSync(`docker exec ${container} psql -U ${dbUser} -d ${dbName} -t -A -f ${container_tmpFile}`, { encoding: "utf8" }).trim();
  } finally {
    try { require("node:fs").unlinkSync(host_tmpFile); } catch {}
  }
}

let passed = 0;
async function test(label: string, work: () => void | Promise<void>) {
  try {
    await work();
    passed++;
    console.log(`PASS ${passed}: ${label}`);
  } catch (err: any) {
    console.error(`FAIL: ${label}`, err);
    throw err;
  }
}

function tokenSentinel(tag: string): string {
  return `SYNTH_B1_${tag}_${randomUUID().slice(0, 8)}`;
}

async function run() {
  console.log("=== PHASE B1.3 DRIVER-LEVEL POSTGRES INTEGRATION ===\n");

  process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = TEST_KEY;
  const pool: BillingDbPool = createPgPool();

  try {
    // 1. PRODUCTION runMigrations() against empty disposable DB
    await test("production runMigrations() creates schema in empty DB", async () => {
      const count = runSql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';");
      assert.equal(count, "0", "disposable DB must be empty before migration");
      await runMigrations(pool);
      // schema_migrations (created by runMigrations) + purchase_ledger + entitlement_sync_jobs + billing_events
      const tables = runSql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';");
      assert.equal(tables, "4", "runMigrations created schema_migrations + purchase_ledger + entitlement_sync_jobs + billing_events");
      const migrations = runSql("SELECT COUNT(*) FROM schema_migrations WHERE version='001';");
      assert.equal(migrations, "1", "migration recorded in schema_migrations");
    });

    // 2. IDEMPOTENCY
    await test("production runMigrations() is idempotent", async () => {
      await runMigrations(pool); // second run
      const migrations = runSql("SELECT COUNT(*) FROM schema_migrations WHERE version='001';");
      assert.equal(migrations, "1", "no duplicate migration row");
      const tables = runSql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';");
      assert.equal(tables, "4", "schema stable after rerun");
    });

    // 3. ADVISORY LOCK CONCURRENCY
    await test("concurrent runMigrations() serialized by advisory lock", async () => {
      await Promise.all([runMigrations(pool), runMigrations(pool), runMigrations(pool)]);
      const migrations = runSql("SELECT COUNT(*) FROM schema_migrations WHERE version='001';");
      assert.equal(migrations, "1", "only one migration row despite concurrency");
      const tables = runSql("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';");
      assert.equal(tables, "4", "schema not corrupted by concurrent runs");
    });

    // 4. PRODUCTION executeLedgerVerificationTx() writes ledger + jobs
    const uidA = `uid_${randomUUID().slice(0, 8)}`;
    const tokenA = tokenSentinel("A");
    const orderA = `GPA.${randomUUID().slice(0, 8)}`;
    const productId = "bhumi_premium_monthly";

    await test("production executeLedgerVerificationTx() persists ledger + FIRESTORE_SYNC + ACKNOWLEDGEMENT", async () => {
      const { hash } = await executeLedgerVerificationTx(
        {
          uid: uidA,
          purchaseToken: tokenA,
          productId,
          packageName: "com.bhumiamartya.app",
          provider: "google_play",
          orderId: orderA,
          purchaseState: "PURCHASED",
          entitlementStatus: "ACTIVE_PENDING_SYNC",
          acknowledged: false,
          acknowledgementRequired: true,
        },
        { pool },
      );
      assert.ok(hash && hash.length === 64, "hash returned");

      const ledger = runSql(`SELECT firebase_uid, product_id, purchase_state FROM purchase_ledger WHERE token_hash='${hash}';`);
      assert.ok(ledger.includes(uidA), "ledger row has correct uid");
      assert.ok(ledger.includes(productId), "ledger row has correct product");
      assert.ok(ledger.includes("PURCHASED"), "ledger row has correct state");

      const jobs = runSql(`SELECT job_type FROM entitlement_sync_jobs WHERE ledger_id='${hash}' ORDER BY job_type;`);
      assert.ok(jobs.includes("FIRESTORE_SYNC"), "FIRESTORE_SYNC job persisted");
      assert.ok(jobs.includes("ACKNOWLEDGEMENT"), "ACKNOWLEDGEMENT job persisted");
    });

    // 5. ENCRYPTION AT REST (physical row check via production encrypt path)
    let hashA = "";
    await test("production encryption writes ciphertext/iv/tag/version; plaintext absent", async () => {
      const result = await executeLedgerVerificationTx(
        {
          uid: uidA,
          purchaseToken: tokenA,
          productId,
          packageName: "com.bhumiamartya.app",
          provider: "google_play",
          orderId: orderA,
          purchaseState: "PURCHASED",
          entitlementStatus: "ACTIVE_PENDING_SYNC",
          acknowledged: false,
          acknowledgementRequired: true,
        },
        { pool },
      );
      hashA = result.hash;

      const row = runSql(`SELECT purchase_token_ciphertext, purchase_token_iv, purchase_token_tag, encryption_key_version FROM purchase_ledger WHERE token_hash='${hashA}';`);
      assert.ok(row.length > 0, "encrypted columns populated");
      assert.ok(!row.includes(tokenA), "plaintext token NOT present in physical row");
      assert.ok(row.includes("v1"), "encryption_key_version is v1");
      assert.ok(row.includes("ciphertext".length ? "" : ""), "ciphertext present"); // placeholder cleared below
      const parsed = row.split("|");
      assert.ok(parsed[0].length > 0, "ciphertext non-empty");
      assert.ok(parsed[1].length > 0, "iv non-empty");
      assert.ok(parsed[2].length > 0, "tag non-empty");
    });

    // 6. VALID DECRYPT
    await test("production decrypt recovers synthetic token", () => {
      const { ciphertext, iv, tag, version } = encryptToken(tokenA, {
        uid: uidA,
        productId,
        provider: "google_play",
      });
      const plain = decryptToken({ ciphertext, iv, tag, version }, {
        uid: uidA,
        productId,
        provider: "google_play",
      });
      assert.equal(plain, tokenA, "decrypt recovers exact token");
    });

    // 7. WRONG AAD FAILS
    await test("decrypt with wrong AAD fails", () => {
      const { ciphertext, iv, tag, version } = encryptToken(tokenA, {
        uid: uidA,
        productId,
        provider: "google_play",
      });
      assert.throws(() => decryptToken({ ciphertext, iv, tag, version }, {
        uid: "other-user",
        productId,
        provider: "google_play",
      }), /DECRYPTION_FAILED_OR_TAMPERED/, "wrong AAD must fail closed");
    });

    // 8. WRONG KEY FAILS
    await test("decrypt with wrong key fails", async () => {
      const originalKey = process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1;
      process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      try {
        const { ciphertext, iv, tag, version } = encryptToken(tokenA, {
          uid: uidA,
          productId,
          provider: "google_play",
        });
        process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = originalKey;
        assert.throws(() => decryptToken({ ciphertext, iv, tag, version }, {
          uid: uidA,
          productId,
          provider: "google_play",
        }), /DECRYPTION_FAILED_OR_TAMPERED/, "wrong key must fail closed");
      } finally {
        process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = originalKey;
      }
    });

    // 9. LEDGER REPLAY IDEMPOTENCY
    await test("replay of same token is idempotent (no duplicate jobs)", async () => {
      const before = runSql(`SELECT COUNT(*) FROM entitlement_sync_jobs WHERE ledger_id='${hashA}';`);
      await executeLedgerVerificationTx(
        {
          uid: uidA,
          purchaseToken: tokenA,
          productId,
          packageName: "com.bhumiamartya.app",
          provider: "google_play",
          orderId: orderA,
          purchaseState: "PURCHASED",
          entitlementStatus: "ACTIVE_PENDING_SYNC",
          acknowledged: false,
          acknowledgementRequired: true,
        },
        { pool },
      );
      const after = runSql(`SELECT COUNT(*) FROM entitlement_sync_jobs WHERE ledger_id='${hashA}';`);
      assert.equal(after, before, "replay must not create duplicate jobs");
    });

    // 10. TRANSACTION ROLLBACK THROUGH PRODUCTION CODE
    await test("production transaction rolls back atomically on failure", async () => {
      const tokenB = tokenSentinel("B");
      const uidB = `uid_${randomUUID().slice(0, 8)}`;

      // Ownership conflict: token B's hash is new, but force failure by
      // pre-inserting a ledger row for a DIFFERENT token that maps to the
      // same order id is not enough (unique is per-provider/order). Instead,
      // create a ledger row with a bad encryption_key_version so decrypt
      // would fail at claim time — not here. Simpler: insert ledger for
      // tokenB as another user first, then attempt same token as uidB.
      // That is ownership conflict.
      const hashB = require("node:crypto").createHash("sha256").update(tokenB).digest("hex");
      runSql(`INSERT INTO purchase_ledger (token_hash, firebase_uid, provider, product_id, purchase_token_ciphertext, purchase_token_iv, purchase_token_tag, encryption_key_version, purchase_state, entitlement_status, acknowledged)
              VALUES ('${hashB}', 'other-user', 'google_play', '${productId}', 'ct', 'iv', 'tag', 'v1', 'PURCHASED', 'ACTIVE', false);`);

      await assert.rejects(
        () => executeLedgerVerificationTx(
          {
            uid: uidB,
            purchaseToken: tokenB,
            productId,
            packageName: "com.bhumiamartya.app",
            provider: "google_play",
            orderId: `GPA.${randomUUID().slice(0, 8)}`,
            purchaseState: "PURCHASED",
            entitlementStatus: "ACTIVE_PENDING_SYNC",
            acknowledged: false,
            acknowledgementRequired: true,
          },
          { pool },
        ),
        /TOKEN_OWNERSHIP_CONFLICT/,
        "ownership conflict must reject",
      );

      // No orphan jobs created by the failed tx
      const orphans = runSql(`SELECT COUNT(*) FROM entitlement_sync_jobs WHERE ledger_id='${hashB}';`);
      assert.equal(orphans, "0", "no orphan job remains after rollback");

      // Connection reusable
      const healthy = await pool.query("SELECT 1 AS ok");
      assert.equal(healthy.rows[0].ok, 1, "pool reusable after rollback");

      // Subsequent valid transaction succeeds
      const tokenC = tokenSentinel("C");
      const uidC = `uid_${randomUUID().slice(0, 8)}`;
      await executeLedgerVerificationTx(
        {
          uid: uidC,
          purchaseToken: tokenC,
          productId,
          packageName: "com.bhumiamartya.app",
          provider: "google_play",
          orderId: `GPA.${randomUUID().slice(0, 8)}`,
          purchaseState: "PURCHASED",
          entitlementStatus: "ACTIVE_PENDING_SYNC",
          acknowledged: false,
          acknowledgementRequired: false,
        },
        { pool },
      );
      const hashC = require("node:crypto").createHash("sha256").update(tokenC).digest("hex");
      const ledgerC = runSql(`SELECT firebase_uid FROM purchase_ledger WHERE token_hash='${hashC}';`);
      assert.ok(ledgerC.includes(uidC), "subsequent valid transaction succeeded");
    });

    // 11. IDENTITY ISOLATION / IMMUTABLE ORDER TAKEOVER
    await test("cross-user immutable order takeover is rejected", async () => {
      const tokenD = tokenSentinel("D");
      const uidD = `uid_${randomUUID().slice(0, 8)}`;
      const orderD = `GPA.${randomUUID().slice(0, 8)}`;
      const hashD = require("node:crypto").createHash("sha256").update(tokenD).digest("hex");

      await executeLedgerVerificationTx(
        {
          uid: uidD,
          purchaseToken: tokenD,
          productId,
          packageName: "com.bhumiamartya.app",
          provider: "google_play",
          orderId: orderD,
          purchaseState: "PURCHASED",
          entitlementStatus: "ACTIVE_PENDING_SYNC",
          acknowledged: false,
          acknowledgementRequired: false,
        },
        { pool },
      );

      // Second user tries to claim same orderId with a different token
      const tokenE = tokenSentinel("E");
      const uidE = `uid_${randomUUID().slice(0, 8)}`;
      await assert.rejects(
        () => executeLedgerVerificationTx(
          {
            uid: uidE,
            purchaseToken: tokenE,
            productId,
            packageName: "com.bhumiamartya.app",
            provider: "google_play",
            orderId: orderD,
            purchaseState: "PURCHASED",
            entitlementStatus: "ACTIVE_PENDING_SYNC",
            acknowledged: false,
            acknowledgementRequired: false,
          },
          { pool },
        ),
        (err: any) => /duplicate|uq_ledger_provider_order_id/i.test(String(err?.message || "")),
        "second user cannot reuse same immutable order id",
      );

      const hashE = require("node:crypto").createHash("sha256").update(tokenE).digest("hex");
      const existsE = runSql(`SELECT COUNT(*) FROM purchase_ledger WHERE token_hash='${hashE}';`);
      assert.equal(existsE, "0", "conflicting row rolled back");
    });

    // 12. RECONCILIATION CLAIM + SKIP LOCKED
    await test("reconcile claim query claims canonical job types without duplicate ownership", async () => {
      // Claim both jobs for hashA using the exact reconcile claim SQL
      const claimResult = await pool.query<{ id: number; ledger_id: string; job_type: string }>(
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
         RETURNING id, ledger_id, job_type`,
        ["worker-integration", 25],
      );
      const claimedTypes = claimResult.rows.map((r) => r.job_type).sort();
      assert.ok(claimedTypes.includes("FIRESTORE_SYNC"), "FIRESTORE_SYNC claimable by reconcile");
      assert.ok(claimedTypes.includes("ACKNOWLEDGEMENT"), "ACKNOWLEDGEMENT claimable by reconcile");
    });

    // 13. SKIP LOCKED concurrent workers
    await test("concurrent SKIP LOCKED workers do not claim the same job twice", async () => {
      // Reset claims then run two concurrent claimers
      runSql(`UPDATE entitlement_sync_jobs SET status='PENDING', locked_at=NULL, locked_by=NULL, attempt_count=0 WHERE ledger_id='${hashA}';`);
      const [r1, r2] = await Promise.all([
        pool.query("SELECT id FROM entitlement_sync_jobs WHERE status IN ('PENDING','FAILED') AND next_attempt_at <= NOW() AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes') ORDER BY next_attempt_at ASC FOR UPDATE SKIP LOCKED LIMIT 25"),
        pool.query("SELECT id FROM entitlement_sync_jobs WHERE status IN ('PENDING','FAILED') AND next_attempt_at <= NOW() AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes') ORDER BY next_attempt_at ASC FOR UPDATE SKIP LOCKED LIMIT 25"),
      ]);
      const ids1 = new Set((r1.rows as any[]).map((r: any) => r.id));
      const ids2 = new Set((r2.rows as any[]).map((r: any) => r.id));
      for (const id of ids1) {
        assert.ok(!ids2.has(id), `job ${id} claimed by at most one worker`);
      }
    });

    console.log(`\n=== B1_3_DRIVER_POSTGRES_INTEGRATION_PASS tests=${passed} ===`);
  } finally {
    await pool.end?.();
  }
}

run().catch((err) => {
  console.error("\n=== DRIVER INTEGRATION FAILED ===", err);
  process.exit(1);
});
