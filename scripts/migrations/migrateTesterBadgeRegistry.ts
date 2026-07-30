import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import { LEGACY_FOUNDER_TESTER_RECORDS } from "./legacyFounderTesterData";

const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const DEFAULT_SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-5a2cbcc72efa.json";
const TESTER_BADGE_REGISTRY_COLLECTION = "testerBadgeRegistry";

function getAdminFirestore() {
  if (getApps().length) {
    return getFirestore();
  }
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SA_PATH;
  if (!existsSync(saPath)) {
    throw new Error(`Service Account JSON not found at ${saPath}`);
  }
  const sa = JSON.parse(readFileSync(saPath, "utf8"));
  if (sa.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(`Project ID mismatch: expected ${EXPECTED_PROJECT_ID}, found ${sa.project_id}`);
  }
  const app = initializeApp({
    credential: cert(sa),
    projectId: sa.project_id,
  });
  return getFirestore(app);
}

export type MigrationReport = {
  activeProject: string;
  mode: "dry-run" | "execute";
  totalRecords: number;
  alreadyMatching: number;
  needingWrite: number;
  written: number;
  failed: number;
  failedUids: Array<{ uid: string; error: string }>;
};

function recordsMatch(existing: FirebaseFirestore.DocumentData | undefined, payload: Record<string, unknown>): boolean {
  if (!existing) return false;
  return Object.keys(payload).every((key) => existing[key] === payload[key]);
}

export async function runMigration(executeRequested = false): Promise<MigrationReport> {
  const isExecute = executeRequested || process.argv.includes("--execute");
  const db = getAdminFirestore();

  let alreadyMatching = 0;
  let needingWrite = 0;
  let written = 0;
  let failed = 0;
  const failedUids: Array<{ uid: string; error: string }> = [];

  const docsToWrite: Array<{ uid: string; payload: Record<string, unknown> }> = [];

  const docRefs = LEGACY_FOUNDER_TESTER_RECORDS.map((r) => db.collection(TESTER_BADGE_REGISTRY_COLLECTION).doc(r.uid));
  const docSnaps = await db.getAll(...docRefs);

  LEGACY_FOUNDER_TESTER_RECORDS.forEach((record, idx) => {
    // Deliberately excludes name/email — those already live on the user's own
    // `users/{uid}` profile document and aren't needed by any entitlement logic.
    const payload = {
      registeredAt: record.registeredAt,
      activeDays: record.activeDays,
      badge: record.badge,
      sourceBadge: record.sourceBadge,
      membership: record.membership,
      premiumMonths: record.premiumMonths,
      trialDays: record.trialDays,
    };

    if (recordsMatch(docSnaps[idx].data(), payload)) {
      alreadyMatching++;
    } else {
      needingWrite++;
      docsToWrite.push({ uid: record.uid, payload });
    }
  });

  if (isExecute && docsToWrite.length > 0) {
    const batchSize = 400;
    for (let i = 0; i < docsToWrite.length; i += batchSize) {
      const chunk = docsToWrite.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((item) => {
        batch.set(db.collection(TESTER_BADGE_REGISTRY_COLLECTION).doc(item.uid), item.payload, { merge: true });
      });
      try {
        await batch.commit();
        written += chunk.length;
      } catch (err: any) {
        failed += chunk.length;
        chunk.forEach((item) => failedUids.push({ uid: item.uid, error: err?.message || String(err) }));
      }
    }
  }

  return {
    activeProject: EXPECTED_PROJECT_ID,
    mode: isExecute ? "execute" : "dry-run",
    totalRecords: LEGACY_FOUNDER_TESTER_RECORDS.length,
    alreadyMatching,
    needingWrite,
    written: isExecute ? written : 0,
    failed,
    failedUids,
  };
}

if (process.argv[1]?.includes("migrateTesterBadgeRegistry")) {
  const isExecute = process.argv.includes("--execute");
  runMigration(isExecute)
    .then((report) => {
      console.log(`=== TESTER BADGE REGISTRY MIGRATION ${report.mode.toUpperCase()} REPORT ===`);
      console.log(JSON.stringify(report, null, 2));
      if (report.mode === "dry-run") {
        console.log("\nThis was a DRY RUN — no writes were made. Re-run with --execute to write.");
      }
    })
    .catch((err) => {
      console.error("EXECUTION FAILED:", err.message);
      process.exit(1);
    });
}
