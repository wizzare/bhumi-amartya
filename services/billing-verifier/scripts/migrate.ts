import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getDbPool } from "../lib/neon";
import type { BillingDbPool } from "../lib/db";

// Injectable migration entry point. When pool is omitted, the default
// production Neon-backed pool is used. When a pool is supplied (integration
// tests), it is used as-is and is never closed by this function.
export async function runMigrations(pool?: BillingDbPool): Promise<void> {
  const dbPool = pool ?? getDbPool();
  const client = await dbPool.connect();

  try {
    // Acquire a transaction-level advisory lock using a unique big integer
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(83838484)");

    // 1. Create schema_migrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        run_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check if migration has already been executed
    const checkRes = await client.query(
      "SELECT version FROM schema_migrations WHERE version = $1",
      ["001"]
    );

    if (checkRes.rows.length === 0) {
      console.log("[MIGRATOR] Running migration 001_billing_schema.sql...");
      const migrationPath = join(__dirname, "../migrations/001_billing_schema.sql");
      const sql = readFileSync(migrationPath, "utf8");

      // Execute the migration DDL
      await client.query(sql);

      // Record success
      await client.query(
        "INSERT INTO schema_migrations (version) VALUES ($1)",
        ["001"]
      );
      console.log("[MIGRATOR] Migration 001_billing_schema.sql completed successfully.");
    } else {
      console.log("[MIGRATOR] Migration 001_billing_schema.sql already applied. Skipping.");
    }

    await client.query("COMMIT");
  } catch (err: any) {
    await client.query("ROLLBACK");
    console.error("[MIGRATOR] Migration failed:", err?.message);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  // Load local environment vars if needed during dev
  require("dotenv").config();
  // CLI owns the pool it creates; close it after a successful run so the
  // process exits cleanly. On failure, the migration already failed closed.
  runMigrations()
    .then(() => getDbPool().end?.())
    .then(() => {
      console.log("[MIGRATOR] Process completed.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[MIGRATOR] Fatal migration error:", err);
      process.exit(1);
    });
}
