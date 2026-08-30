/**
 * Node-20 Neon transport proof. Connection-free.
 *
 * @neondatabase/serverless's Pool uses a WebSocket transport for the interactive
 * pooled connection used by executeLedgerVerificationTx (BEGIN/COMMIT). Node 20
 * ships no global `WebSocket`, so neonConfig.webSocketConstructor must be set
 * explicitly. This test proves the isolated fix does that, without opening any
 * database connection.
 *
 * Hard-fail: node:assert/strict (throws -> exit 1).
 */
import assert from "node:assert/strict";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  PASS: ${name}`);
}

async function main() {
  // Premise: Node 20 has no global WebSocket.
  check("Node 20 provides no global WebSocket", () => {
    assert.equal(typeof (globalThis as { WebSocket?: unknown }).WebSocket, "undefined");
  });

  // Importing lib/neon.ts must configure the transport as a side effect.
  const neonModule = await import("../../lib/neon");
  check("importing lib/neon.ts sets neonConfig.webSocketConstructor", () => {
    assert.ok(neonConfig.webSocketConstructor, "webSocketConstructor must be defined after importing neon.ts");
  });
  check("neonConfig.webSocketConstructor is the ws implementation", () => {
    assert.equal(neonConfig.webSocketConstructor, ws as unknown);
  });

  // getDbPool must still behave exactly as committed: throw when DATABASE_URL is absent.
  const savedUrl = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  try {
    check("getDbPool() throws DATABASE_URL_MISSING when unset (committed behavior preserved)", () => {
      assert.throws(() => neonModule.getDbPool(), /DATABASE_URL_MISSING/);
    });
  } finally {
    if (savedUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = savedUrl;
  }

  // Constructing the Neon Pool must NOT fail merely because global WebSocket is
  // absent. Use a syntactically valid, non-routable URL; never issue a query.
  check("Neon Pool constructs without a missing-WebSocket error (no connection made)", () => {
    process.env.DATABASE_URL = "postgres://user:pass@127.0.0.1:1/db?sslmode=require";
    try {
      const pool = neonModule.getDbPool();
      assert.equal(typeof (pool as { query?: unknown }).query, "function");
      assert.equal(typeof (pool as { connect?: unknown }).connect, "function");
      // Do NOT call .query()/.connect() — that would open a socket.
      void (pool as { end?: () => Promise<void> }).end?.().catch(() => undefined);
    } finally {
      if (savedUrl === undefined) delete process.env.DATABASE_URL;
      else process.env.DATABASE_URL = savedUrl;
    }
  });

  console.log(`\nNEON_TRANSPORT_FIX_PASS assertions=${passed} node=${process.version} globalWebSocket=absent webSocketConstructor=ws`);
}

main().catch((err) => {
  console.error("NEON_TRANSPORT_FIX_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exitCode = 1;
});
