import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";

const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const DEFAULT_SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-5a2cbcc72efa.json";
const ADMIN_ROLE_REGISTRY_COLLECTION = "adminRoleRegistry";

// The 2 emails previously hardcoded in lib/billing/getUserPlanStatus.ts as
// LOCAL_DEVELOPER_PRO_EMAILS (removed in build82-integration). Resolved to
// uid here via Admin Auth, then written keyed by uid — no email/name stored
// in the destination collection.
const LEGACY_DEVELOPER_PRO_EMAILS = ["wizzare@gmail.com", "dj.neynna@gmail.com"];

function getAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }
  const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || DEFAULT_SA_PATH;
  if (!existsSync(saPath)) {
    throw new Error(`Service Account JSON not found at ${saPath}`);
  }
  const sa = JSON.parse(readFileSync(saPath, "utf8"));
  if (sa.project_id !== EXPECTED_PROJECT_ID) {
    throw new Error(`Project ID mismatch: expected ${EXPECTED_PROJECT_ID}, found ${sa.project_id}`);
  }
  return initializeApp({
    credential: cert(sa),
    projectId: sa.project_id,
  });
}

export type MigrationReport = {
  activeProject: string;
  mode: "dry-run" | "execute";
  totalEmails: number;
  resolvedUids: number;
  unresolvedCount: number;
  alreadyMatching: number;
  needingWrite: number;
  written: number;
  failed: number;
  failedUids: Array<{ uid: string; error: string }>;
};

export async function runMigration(executeRequested = false): Promise<MigrationReport> {
  const isExecute = executeRequested || process.argv.includes("--execute");
  const app = getAdminApp();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const unresolvedEmails: string[] = [];
  const resolvedUids: string[] = [];

  for (const email of LEGACY_DEVELOPER_PRO_EMAILS) {
    try {
      const user = await auth.getUserByEmail(email);
      resolvedUids.push(user.uid);
    } catch {
      unresolvedEmails.push(email);
    }
  }

  const payload = { isDeveloperPro: true };
  let alreadyMatching = 0;
  let needingWrite = 0;
  let written = 0;
  let failed = 0;
  const failedUids: Array<{ uid: string; error: string }> = [];
  const docsToWrite: string[] = [];

  if (resolvedUids.length > 0) {
    const docRefs = resolvedUids.map((uid) => db.collection(ADMIN_ROLE_REGISTRY_COLLECTION).doc(uid));
    const docSnaps = await db.getAll(...docRefs);

    resolvedUids.forEach((uid, idx) => {
      const existing = docSnaps[idx].data();
      if (existing && existing.isDeveloperPro === true) {
        alreadyMatching++;
      } else {
        needingWrite++;
        docsToWrite.push(uid);
      }
    });
  }

  if (isExecute && docsToWrite.length > 0) {
    const batch = db.batch();
    docsToWrite.forEach((uid) => {
      batch.set(db.collection(ADMIN_ROLE_REGISTRY_COLLECTION).doc(uid), payload, { merge: true });
    });
    try {
      await batch.commit();
      written = docsToWrite.length;
    } catch (err: any) {
      failed = docsToWrite.length;
      docsToWrite.forEach((uid) => failedUids.push({ uid, error: err?.message || String(err) }));
    }
  }

  return {
    activeProject: EXPECTED_PROJECT_ID,
    mode: isExecute ? "execute" : "dry-run",
    totalEmails: LEGACY_DEVELOPER_PRO_EMAILS.length,
    resolvedUids: resolvedUids.length,
    unresolvedCount: unresolvedEmails.length,
    alreadyMatching,
    needingWrite,
    written: isExecute ? written : 0,
    failed,
    failedUids,
  };
}

if (process.argv[1]?.includes("migrateAdminRoleRegistry")) {
  const isExecute = process.argv.includes("--execute");
  runMigration(isExecute)
    .then((report) => {
      console.log(`=== ADMIN ROLE REGISTRY MIGRATION ${report.mode.toUpperCase()} REPORT ===`);
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
