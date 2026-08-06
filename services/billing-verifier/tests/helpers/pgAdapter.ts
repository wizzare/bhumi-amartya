/**
 * Test-only pg adapter. Wraps pg.Pool so integration tests can exercise
 * production billing code against disposable local PostgreSQL.
 *
 * This file is never imported by production source. pg is a devDependency.
 */
import { Pool as PgPool } from "pg";
import type { BillingDbPool } from "../../lib/db";

export function createPgPool(): BillingDbPool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL_MISSING");
  }
  // Type-compatible structural wrapper over pg.Pool, bound to the BillingDbPool port.
  const inner = new PgPool({ connectionString });
  const wrapper: BillingDbPool = {
    query<Row = Record<string, unknown>>(text: string, params?: unknown[]) {
      return inner.query(text, params) as Promise<any>;
    },
    connect() {
      return inner.connect().then((client) => ({
        query<Row = Record<string, unknown>>(text: string, params?: unknown[]) {
          return client.query(text, params) as Promise<any>;
        },
        release() {
          client.release();
        },
      }));
    },
    end() {
      return inner.end();
    },
  };
  return wrapper;
}
