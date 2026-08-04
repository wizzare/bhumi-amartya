import { Pool } from "@neondatabase/serverless";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL_MISSING");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}
