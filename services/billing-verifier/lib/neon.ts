import { Pool } from "@neondatabase/serverless";
import type { BillingDbPool } from "./db";

let pool: Pool | null = null;

// Returned type is the minimal BillingDbPool port. @neondatabase/serverless's
// Pool satisfies it structurally (query/connect/end), so no adapter is needed
// for production. Test code injects a pg.Pool, which satisfies the same port.
export function getDbPool(): BillingDbPool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL_MISSING");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
