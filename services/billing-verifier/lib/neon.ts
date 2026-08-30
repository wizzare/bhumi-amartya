import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import type { BillingDbPool } from "./db";

// Node.js 20 does not provide the WebSocket global required by Neon Pool/Client.
// Keep Pool for the interactive ledger transaction and provide the supported
// Node transport explicitly.
neonConfig.webSocketConstructor = ws;

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
