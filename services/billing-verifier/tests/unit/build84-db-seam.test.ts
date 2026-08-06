import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

async function run() {
  const neonSrc = readFileSync(join(__dirname, "../../lib/neon.ts"), "utf8");
  const ledgerSrc = readFileSync(join(__dirname, "../../lib/purchaseLedger.ts"), "utf8");
  const migrateSrc = readFileSync(join(__dirname, "../../scripts/migrate.ts"), "utf8");

  await test("production source contains no pg import", () => {
    for (const [name, src] of [["neon.ts", neonSrc], ["purchaseLedger.ts", ledgerSrc], ["migrate.ts", migrateSrc]]) {
      assert.ok(!src.includes('from "pg"'), `${name} must not import pg`);
      assert.ok(!src.includes('require("pg")'), `${name} must not require pg`);
    }
  });

  await test("getDbPool returns the BillingDbPool port", () => {
    assert.ok(neonSrc.includes("BillingDbPool"), "neon.ts references BillingDbPool type");
  });

  await test("executeLedgerVerificationTx accepts optional injected pool", () => {
    assert.ok(ledgerSrc.includes("LedgerTxDependencies"), "purchaseLedger.ts defines LedgerTxDependencies");
    assert.ok(ledgerSrc.includes("dependencies?.pool ?? getDbPool()"), "default path still uses getDbPool()");
  });

  await test("runMigrations accepts optional injected pool", () => {
    assert.ok(migrateSrc.includes("runMigrations(pool?: BillingDbPool)"), "migrate.ts signature is injectable");
    assert.ok(migrateSrc.includes("pool ?? getDbPool()"), "default path still uses getDbPool()");
  });

  await test("no test-only driver switch in production logic", () => {
    for (const [name, src] of [["neon.ts", neonSrc], ["purchaseLedger.ts", ledgerSrc], ["migrate.ts", migrateSrc]]) {
      assert.ok(!src.includes("NODE_ENV === \"test\""), `${name} must not switch on NODE_ENV`);
      assert.ok(!src.includes("USE_LOCAL_POSTGRES"), `${name} must not use a local-driver flag`);
    }
  });

  console.log(`BUILD84_DB_SEAM_PASS tests=${passed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
