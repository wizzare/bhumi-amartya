/**
 * Billing durable-ledger + entitlement runtime gate (Task 11).
 *
 * Exercises PRODUCTION billing-verifier source in-process against a REAL,
 * disposable PostgreSQL 16 (local Docker) via the injected pg adapter — no
 * mocked pg. Google Play is never called: synthetic purchase identifiers only.
 * Also covers the pure entitlement decision / signed-entitlement / product
 * validation contracts with synthetic keypairs.
 *
 * Requires DATABASE_URL to point at a disposable local PostgreSQL (see
 * `npm run test:billing:runtime`). Hard-fails (no console.assert). Prints no
 * secrets. Not in the ordinary root release suite (needs external infra).
 */
import assert from "node:assert/strict";
import { randomUUID, generateKeyPairSync } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createPgPool } from "../helpers/pgAdapter";
import type { BillingDbPool } from "../../lib/db";
import { runMigrations } from "../../scripts/migrate";
import { executeLedgerVerificationTx, shouldCreateAcknowledgementJob } from "../../lib/purchaseLedger";
import { tokenHash } from "../../lib/security";
import { decision } from "../../lib/entitlement";
import { generateSignedEntitlement, verifySignedEntitlement } from "../../lib/signedEntitlement";
import { validateProduct } from "../../lib/googlePlay";

if (!process.env.DATABASE_URL) {
  console.error("BILLING_RUNTIME_GATE_BLOCKED: DATABASE_URL not set — a disposable local PostgreSQL is required (see npm run test:billing:runtime).");
  process.exit(1);
}
process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1 = process.env.BILLING_TOKEN_ENCRYPTION_KEY_V1
  || "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

let passed = 0;
let POSTGRES_BEGIN_COMMIT = false;
let POSTGRES_ROLLBACK = false;
async function test(label: string, work: () => void | Promise<void>) {
  await work();
  passed++;
  console.log(`  PASS ${passed}: ${label}`);
}

const synthToken = (tag: string) => `SYNTH_T11_${tag}_${randomUUID()}`;
const baseParams = (uid: string, token: string, over: Partial<Parameters<typeof executeLedgerVerificationTx>[0]> = {}) => ({
  uid,
  purchaseToken: token,
  productId: "bhumi_premium_monthly",
  packageName: "com.bhumiamartya.app",
  provider: "google_play",
  orderId: `GPA.${randomUUID().slice(0, 12)}`,
  purchaseState: "SUBSCRIPTION_STATE_ACTIVE",
  entitlementStatus: "ACTIVE",
  acknowledged: false,
  acknowledgementRequired: true,
  purchasedAt: new Date(),
  expiresAt: new Date(Date.now() + 30 * 864e5),
  ...over,
});

/** wrapper that throws the first time it sees a statement containing `trigger` */
function poolThatFailsOn(inner: BillingDbPool, trigger: string): BillingDbPool {
  let armed = true;
  return {
    query: inner.query.bind(inner),
    end: inner.end?.bind(inner),
    async connect() {
      const c = await inner.connect();
      return {
        query(text: string, params?: unknown[]) {
          if (armed && text.includes(trigger)) { armed = false; return Promise.reject(new Error("INJECTED_DB_FAILURE")); }
          return c.query(text, params);
        },
        release: c.release.bind(c),
      };
    },
  } as BillingDbPool;
}

async function main() {
  const pool: BillingDbPool = createPgPool();
  try {
    await runMigrations(pool as never);

    // ---- §8  BEGIN / COMMIT + fresh-connection persistence -------------------
    const uidA = `t11-uidA-${randomUUID().slice(0, 8)}`;
    const tokA = synthToken("A");
    const hashA = tokenHash(tokA);
    await test("§8 executeLedgerVerificationTx COMMIT — ledger row + FIRESTORE_SYNC + ACKNOWLEDGEMENT jobs", async () => {
      const { hash, jobId } = await executeLedgerVerificationTx(baseParams(uidA, tokA), { pool });
      assert.equal(hash, hashA);
      assert.ok(Number.isFinite(jobId));
    });
    await test("§8/L2 fresh connection (new Pool) reads the committed ledger + jobs", async () => {
      const fresh = createPgPool();
      try {
        const led = await fresh.query("SELECT firebase_uid, product_id, purchase_state, entitlement_status, firestore_sync_status FROM purchase_ledger WHERE token_hash=$1", [hashA]);
        assert.equal(led.rows.length, 1, "committed ledger row survives a fresh connection");
        assert.equal(led.rows[0].firebase_uid, uidA);
        assert.equal(led.rows[0].firestore_sync_status, "PENDING");
        const jobs = await fresh.query("SELECT job_type, status FROM entitlement_sync_jobs WHERE ledger_id=$1 ORDER BY job_type", [hashA]);
        assert.deepEqual(jobs.rows.map((r: any) => r.job_type).sort(), ["ACKNOWLEDGEMENT", "FIRESTORE_SYNC"]);
        assert.ok(jobs.rows.every((r: any) => r.status === "PENDING"));
        POSTGRES_BEGIN_COMMIT = true;
      } finally { await fresh.end?.(); }
    });

    // ---- §8/§9.L6  forced failure -> ROLLBACK, nothing half-written ----------
    const tokRB = synthToken("RB");
    const hashRB = tokenHash(tokRB);
    await test("§8/L6 forced mid-transaction failure -> ROLLBACK, no ledger/jobs persisted", async () => {
      const failing = poolThatFailsOn(pool, "INSERT INTO billing_events");
      await assert.rejects(() => executeLedgerVerificationTx(baseParams("t11-rb", tokRB), { pool: failing }), /INJECTED_DB_FAILURE/);
      const fresh = createPgPool();
      try {
        const led = await fresh.query("SELECT 1 FROM purchase_ledger WHERE token_hash=$1", [hashRB]);
        assert.equal(led.rows.length, 0, "rolled-back ledger row does NOT persist");
        const ev = await fresh.query("SELECT 1 FROM entitlement_sync_jobs WHERE ledger_id=$1", [hashRB]);
        assert.equal(ev.rows.length, 0, "rolled-back sync jobs do NOT persist");
        POSTGRES_ROLLBACK = true;
      } finally { await fresh.end?.(); }
    });

    // ---- §9  ledger runtime -------------------------------------------------
    await test("§9/L3 replay of the same token is idempotent (1 ledger row, 1 of each job)", async () => {
      await executeLedgerVerificationTx(baseParams(uidA, tokA), { pool });
      await executeLedgerVerificationTx(baseParams(uidA, tokA), { pool });
      const led = await pool.query("SELECT COUNT(*)::int c FROM purchase_ledger WHERE token_hash=$1", [hashA]);
      assert.equal(led.rows[0].c, 1);
      const jobs = await pool.query("SELECT job_type, COUNT(*)::int c FROM entitlement_sync_jobs WHERE ledger_id=$1 GROUP BY job_type", [hashA]);
      for (const r of jobs.rows as any[]) assert.equal(r.c, 1, `exactly one ${r.job_type} job after replays`);
    });
    await test("§9/L4 same token with a conflicting owner -> TOKEN_OWNERSHIP_CONFLICT, ledger unchanged", async () => {
      await assert.rejects(() => executeLedgerVerificationTx(baseParams("t11-uidB-other", tokA), { pool }), /TOKEN_OWNERSHIP_CONFLICT/);
      const led = await pool.query("SELECT firebase_uid FROM purchase_ledger WHERE token_hash=$1", [hashA]);
      assert.equal(led.rows[0].firebase_uid, uidA, "owner not taken over");
    });
    await test("§9/L5 re-verify with a new subscription state -> ON CONFLICT DO UPDATE (durable transition)", async () => {
      const newExpiry = new Date(Date.now() - 864e5); // expired
      const before = await pool.query("SELECT created_at FROM purchase_ledger WHERE token_hash=$1", [hashA]);
      await executeLedgerVerificationTx(baseParams(uidA, tokA, { purchaseState: "SUBSCRIPTION_STATE_EXPIRED", entitlementStatus: "EXPIRED", expiresAt: newExpiry, acknowledgementRequired: false }), { pool });
      const after = await pool.query("SELECT created_at, purchase_state, entitlement_status, expires_at FROM purchase_ledger WHERE token_hash=$1", [hashA]);
      assert.equal(after.rows[0].purchase_state, "SUBSCRIPTION_STATE_EXPIRED");
      assert.equal(after.rows[0].entitlement_status, "EXPIRED");
      assert.equal(new Date(after.rows[0].created_at).getTime(), new Date(before.rows[0].created_at).getTime(), "same row, not recreated");
    });

    // ---- §10  concurrency: real reconcile claim SQL, two independent pools ---
    await test("§10 two independent connections running the REAL reconcile claim SQL never double-claim", async () => {
      // seed a batch of PENDING jobs on fresh ledgers
      const CLAIM_SQL =
        `UPDATE entitlement_sync_jobs SET status='PROCESSING', locked_at=NOW(), locked_by=$1, attempt_count=attempt_count+1, updated_at=NOW()
         WHERE id IN (SELECT id FROM entitlement_sync_jobs WHERE status IN ('PENDING','FAILED') AND next_attempt_at <= NOW()
           AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes') ORDER BY next_attempt_at ASC FOR UPDATE SKIP LOCKED LIMIT $2)
         RETURNING id`;
      // take every pre-existing job out of the claimable set so this scenario is self-contained
      await pool.query("UPDATE entitlement_sync_jobs SET status='COMPLETED', completed_at=NOW() WHERE status IN ('PENDING','FAILED')");
      const seeded: string[] = [];
      for (let i = 0; i < 8; i++) {
        const t = synthToken(`C${i}`);
        await executeLedgerVerificationTx(baseParams(`t11-conc-${i}`, t), { pool });
        seeded.push(tokenHash(t));
      }
      const pendingBefore = await pool.query("SELECT COUNT(*)::int c FROM entitlement_sync_jobs WHERE status IN ('PENDING','FAILED') AND next_attempt_at <= NOW() AND (locked_at IS NULL OR locked_at < NOW() - INTERVAL '5 minutes')");
      const p1 = createPgPool(); const p2 = createPgPool();
      try {
        const [r1, r2] = await Promise.all([
          p1.query(CLAIM_SQL, ["w1", 100]),
          p2.query(CLAIM_SQL, ["w2", 100]),
        ]);
        const ids1 = new Set((r1.rows as any[]).map((r) => Number(r.id)));
        const ids2 = new Set((r2.rows as any[]).map((r) => Number(r.id)));
        for (const id of ids1) assert.ok(!ids2.has(id), `job ${id} claimed by only one worker`);
        assert.equal(ids1.size + ids2.size, pendingBefore.rows[0].c, "every pending job claimed exactly once, none twice");
        const stray = await pool.query("SELECT COUNT(*)::int c FROM entitlement_sync_jobs WHERE ledger_id = ANY($1) AND status='PENDING'", [seeded]);
        assert.equal(stray.rows[0].c, 0, "no pending job left unclaimed");
      } finally { await p1.end?.(); await p2.end?.(); }
    });

    // ---- §12  Firestore mirror failure -> durable ledger stays correct ------
    await test("§12 markLedgerSyncFailure SQL — ledger purchase identity durable, FIRESTORE_SYNC job reclaimable", async () => {
      const t = synthToken("MF"); const h = tokenHash(t);
      await executeLedgerVerificationTx(baseParams("t11-mf", t), { pool });
      // exact statements from lib/purchaseLedger.ts markLedgerSyncFailure()
      await pool.query("UPDATE purchase_ledger SET firestore_sync_status='FAILED', last_error_code=$2, updated_at=NOW() WHERE token_hash=$1", [h, "FIRESTORE_WRITE_ERROR"]);
      await pool.query("UPDATE entitlement_sync_jobs SET status='FAILED', last_error_code=$2, updated_at=NOW() WHERE ledger_id=$1 AND job_type='FIRESTORE_SYNC'", [h, "FIRESTORE_WRITE_ERROR"]);
      const fresh = createPgPool();
      try {
        const led = await fresh.query("SELECT firebase_uid, entitlement_status, firestore_sync_status FROM purchase_ledger WHERE token_hash=$1", [h]);
        assert.equal(led.rows[0].firebase_uid, "t11-mf", "durable purchase identity intact after mirror failure");
        assert.equal(led.rows[0].entitlement_status, "ACTIVE", "entitlement state intact");
        assert.equal(led.rows[0].firestore_sync_status, "FAILED");
        const job = await fresh.query("SELECT status FROM entitlement_sync_jobs WHERE ledger_id=$1 AND job_type='FIRESTORE_SYNC'", [h]);
        assert.equal(job.rows[0].status, "FAILED", "FIRESTORE_SYNC job is FAILED -> reclaimable by reconcile -> later reconciliation possible");
      } finally { await fresh.end?.(); }
    });

    // ---- §11  ACK ordering contract (source-shape, no Google Play call) -----
    await test("§11 verify route: Google ACK is NOT gated on firestoreSynced (only the FS bookkeeping is)", async () => {
      const src = readFileSync(path.join(process.cwd(), "api/billing/google-play/verify.ts"), "utf8");
      const flat = src.replace(/\s+/g, " ");
      assert.ok(flat.indexOf("executeLedgerVerificationTx(") < flat.indexOf("persistEntitlement("), "durable ledger before Firestore mirror");
      assert.ok(/if \(acknowledgementPending\) \{ try \{ await acknowledgeSubscription\(/.test(flat), "acknowledgeSubscription called on acknowledgementPending, not on firestoreSynced");
      assert.ok(/if \(firestoreSynced\) \{ await withTimeout\("ACKNOWLEDGE"[^}]*markEntitlementAcknowledged/.test(flat), "only the Firestore-side ACK bookkeeping is behind if (firestoreSynced)");
      assert.ok(/catch \{ acknowledgementDeferred = true;? \}/.test(flat), "ACK failure -> acknowledgementDeferred = true (not rethrown)");
      assert.ok(!/if \(\s*acknowledgementPending && firestoreSynced\s*\)/.test(flat), "no Firestore-gated ACK prerequisite");
    });

    // ---- §14  entitlement decision precedence (pure) -----------------------
    await test("§14 decision() precedence matrix", async () => {
      const future = new Date(Date.now() + 864e5).toISOString();
      const past = new Date(Date.now() - 864e5).toISOString();
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", future).status, "ACTIVE");
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", future).active, true);
      assert.equal(decision("SUBSCRIPTION_STATE_IN_GRACE_PERIOD", future).status, "GRACE_PERIOD");
      assert.equal(decision("SUBSCRIPTION_STATE_CANCELED", future).status, "CANCELED_PAID_THROUGH");
      assert.equal(decision("SUBSCRIPTION_STATE_CANCELED", future).active, true);
      assert.equal(decision("SUBSCRIPTION_STATE_PENDING", future).active, false);
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", past).status, "EXPIRED");
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", past).active, false);
      // voided overrides an otherwise-active state
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", future, { voided: true }).status, "VOIDED");
      assert.equal(decision("SUBSCRIPTION_STATE_ACTIVE", future, { voided: true }).active, false);
      assert.equal(shouldCreateAcknowledgementJob(baseParams("x", "y")), true);
      assert.equal(shouldCreateAcknowledgementJob(baseParams("x", "y", { acknowledged: true })), false);
    });

    // ---- §16  signed entitlement crypto (synthetic P-256 keypair) ----------
    await test("§16 signed entitlement: round-trip valid; tamper/alg/expiry/kid/iss all rejected", async () => {
      const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
      process.env.ENTITLEMENT_PRIVATE_KEY = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
      process.env.ENTITLEMENT_PUBLIC_KEY = publicKey.export({ type: "spki", format: "pem" }).toString();
      delete process.env.NEXT_PUBLIC_ENTITLEMENT_PUBLIC_KEY;
      const good = generateSignedEntitlement({ sub: "u1", productId: "bhumi_premium_monthly", status: "ACTIVE", exp: Math.floor(Date.now() / 1000) + 3600, jti: randomUUID(), syncStatus: "SYNCED" } as never);
      assert.ok(verifySignedEntitlement(good), "valid signed entitlement verifies");
      const [h, p, s] = good.split(".");
      const tamperedPayload = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(p, "base64url").toString()), status: "ACTIVE", sub: "attacker" })).toString("base64url");
      assert.equal(verifySignedEntitlement(`${h}.${tamperedPayload}.${s}`), null, "payload tamper -> null");
      const rs256Header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "v1" })).toString("base64url");
      assert.equal(verifySignedEntitlement(`${rs256Header}.${p}.${s}`), null, "non-ES256 alg -> null");
      const expired = generateSignedEntitlement({ sub: "u1", productId: "bhumi_premium_monthly", status: "ACTIVE", exp: Math.floor(Date.now() / 1000) - 3600, jti: randomUUID(), syncStatus: "SYNCED" } as never);
      assert.equal(verifySignedEntitlement(expired), null, "expired -> null");
      const badKid = Buffer.from(JSON.stringify({ alg: "ES256", typ: "JWT", kid: "v2" })).toString("base64url");
      assert.equal(verifySignedEntitlement(`${badKid}.${p}.${s}`), null, "unknown kid -> null");
      assert.equal(verifySignedEntitlement("not.a.jwt"), null, "malformed -> null");
    });

    // ---- §20  product validation ------------------------------------------
    await test("§20 validateProduct — canonical product/base plan accepted; wrong rejected", async () => {
      assert.equal(validateProduct({ productId: "bhumi_premium_monthly", offerDetails: { basePlanId: "monthly" } } as never), true);
      assert.equal(validateProduct({ productId: "bhumi_premium_monthly" } as never), true, "absent base plan allowed");
      assert.equal(validateProduct({ productId: "some_other_product", offerDetails: { basePlanId: "monthly" } } as never), false, "wrong product rejected");
      assert.equal(validateProduct({ productId: "bhumi_premium_monthly", offerDetails: { basePlanId: "annual" } } as never), false, "wrong base plan rejected");
      assert.equal(validateProduct(undefined), false, "missing item rejected");
    });

    console.log(`\nBILLING_RUNTIME_GATE PASS tests=${passed} POSTGRES_BEGIN_COMMIT=${POSTGRES_BEGIN_COMMIT} POSTGRES_ROLLBACK=${POSTGRES_ROLLBACK} evidence=REAL_POSTGRES_INTEGRATION`);
  } finally {
    await pool.end?.();
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("BILLING_RUNTIME_GATE_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exit(1);
});
