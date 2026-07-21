import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";

const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const DEFAULT_SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-5a2cbcc72efa.json";
export const CUTOFF_ISO = "2026-07-20T00:00:00+07:00";
export const CUTOFF_DATE = new Date(CUTOFF_ISO);

function getAdminFirestore() {
  if (getApps().length) return getFirestore();
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

function parseDocDate(createdAtField: unknown): Date | null {
  if (!createdAtField) return null;
  if (createdAtField instanceof Date) return createdAtField;
  if (typeof createdAtField === "string") {
    const d = new Date(createdAtField);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof createdAtField === "object" && createdAtField !== null) {
    if ("toDate" in createdAtField && typeof (createdAtField as { toDate: () => Date }).toDate === "function") {
      return (createdAtField as { toDate: () => Date }).toDate();
    }
    if ("seconds" in createdAtField && typeof (createdAtField as { seconds: number }).seconds === "number") {
      return new Date((createdAtField as { seconds: number }).seconds * 1000);
    }
  }
  return null;
}

export type InboxCleanupReport = {
  activeProject: string;
  authMethod: string;
  mode: "dry-run" | "execute";
  cutoffIso: string;
  firestoreAudit: {
    totalScanned: number;
    beforeCutoff: number;
    onOrAfterCutoff: number;
    missingCreatedAt: number;
    invalidTimestampCount: number;
    failedReads: number;
  };
  sampleRetained: Array<{ docId: string; createdAtIso: string }>;
  executionResults: {
    deletedCount: number;
    failedCount: number;
    writesExecuted: number;
  };
  verification: {
    beforeCutoffRemaining: number;
    onOrAfterCutoffRemaining: number;
    missingCreatedAtRemaining: number;
    verificationFailedReads: number;
  };
};

export async function runInboxCleanup(isExecuteRequested = false): Promise<InboxCleanupReport> {
  const isExecute = isExecuteRequested || process.argv.includes("--execute");
  const db = getAdminFirestore();

  console.log("=== PHASE 1: CREDENTIAL AND QUOTA PROOF ===");
  const testSnap = await db.collection("users").limit(1).get();
  console.log("Harmless Read Result: SUCCESS. User docs returned:", testSnap.docs.length);

  console.log("\n=== PHASE 2: DRY-RUN AUDIT ===");

  // Scan collectionGroup 'communications' across all users and top-level 'communications'
  const [groupSnap, rootSnap] = await Promise.all([
    db.collectionGroup("communications").get(),
    db.collection("communications").get(),
  ]);

  // Merge unique docs
  const docMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  groupSnap.docs.forEach((d) => docMap.set(d.ref.path, d));
  rootSnap.docs.forEach((d) => docMap.set(d.ref.path, d));

  const allDocs = Array.from(docMap.values());
  const totalScanned = allDocs.length;

  let beforeCutoff = 0;
  let onOrAfterCutoff = 0;
  let missingCreatedAt = 0;
  let invalidTimestampCount = 0;
  let failedReads = 0;

  const docsToDelete: Array<{ ref: FirebaseFirestore.DocumentReference; path: string; date: Date }> = [];
  const retainedDocs: Array<{ path: string; date: Date }> = [];

  let newestMatchedDate: Date | null = null;
  let oldestRetainedDate: Date | null = null;

  allDocs.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data || data.createdAt === undefined || data.createdAt === null) {
      missingCreatedAt++;
      return;
    }
    const docDate = parseDocDate(data.createdAt);
    if (!docDate) {
      invalidTimestampCount++;
      return;
    }

    if (docDate.getTime() < CUTOFF_DATE.getTime()) {
      beforeCutoff++;
      docsToDelete.push({ ref: docSnap.ref, path: docSnap.ref.path, date: docDate });
      if (!newestMatchedDate || docDate > newestMatchedDate) {
        newestMatchedDate = docDate;
      }
    } else {
      onOrAfterCutoff++;
      retainedDocs.push({ path: docSnap.ref.path, date: docDate });
      if (!oldestRetainedDate || docDate < oldestRetainedDate) {
        oldestRetainedDate = docDate;
      }
    }
  });

  console.log("Dry-Run Scanned:", totalScanned);
  console.log("Before Cutoff (Matched for deletion):", beforeCutoff);
  console.log("On/After Cutoff (Retained):", onOrAfterCutoff);
  console.log("Missing createdAt:", missingCreatedAt);
  console.log("Invalid timestamps:", invalidTimestampCount);
  if (newestMatchedDate) console.log("Newest matched date:", (newestMatchedDate as Date).toISOString());
  if (oldestRetainedDate) console.log("Oldest retained date:", (oldestRetainedDate as Date).toISOString());

  let deletedCount = 0;
  let failedCount = 0;
  let writesExecuted = 0;

  if (isExecute && docsToDelete.length > 0) {
    console.log("\n=== PHASE 3: EXECUTION SAFETY & DELETION ===");
    console.log("DELETE_SCOPE_CONFIRMED");
    console.log(`cutoff = ${CUTOFF_ISO}`);
    console.log(`matched = ${beforeCutoff}`);
    console.log(`retained = ${onOrAfterCutoff}`);

    const batchSize = 200;
    for (let i = 0; i < docsToDelete.length; i += batchSize) {
      const chunk = docsToDelete.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((item) => batch.delete(item.ref));
      try {
        await batch.commit();
        deletedCount += chunk.length;
        writesExecuted += chunk.length;
      } catch (err: any) {
        failedCount += chunk.length;
        console.error(`Batch delete chunk starting at ${i} failed:`, err?.message || String(err));
        break; // Stop immediately on batch failure; do not retry automatically
      }
    }
  }

  console.log("\n=== PHASE 4: POST-DELETE VERIFICATION ===");
  const [postGroupSnap, postRootSnap] = await Promise.all([
    db.collectionGroup("communications").get(),
    db.collection("communications").get(),
  ]);

  const postDocMap = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  postGroupSnap.docs.forEach((d) => postDocMap.set(d.ref.path, d));
  postRootSnap.docs.forEach((d) => postDocMap.set(d.ref.path, d));

  let beforeCutoffRemaining = 0;
  let onOrAfterCutoffRemaining = 0;
  let missingCreatedAtRemaining = 0;

  postDocMap.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data || data.createdAt === undefined || data.createdAt === null) {
      missingCreatedAtRemaining++;
      return;
    }
    const docDate = parseDocDate(data.createdAt);
    if (!docDate) return;
    if (docDate.getTime() < CUTOFF_DATE.getTime()) {
      beforeCutoffRemaining++;
    } else {
      onOrAfterCutoffRemaining++;
    }
  });

  const sampleRetained = retainedDocs.slice(0, 3).map((r) => ({
    docId: r.path.split("/").pop() || "doc",
    createdAtIso: r.date.toISOString(),
  }));

  return {
    activeProject: EXPECTED_PROJECT_ID,
    authMethod: "Service Account Cert (bhumiamartya-fe85c-5a2cbcc72efa.json)",
    mode: isExecute ? "execute" : "dry-run",
    cutoffIso: CUTOFF_ISO,
    firestoreAudit: {
      totalScanned,
      beforeCutoff,
      onOrAfterCutoff,
      missingCreatedAt,
      invalidTimestampCount,
      failedReads,
    },
    sampleRetained,
    executionResults: {
      deletedCount,
      failedCount,
      writesExecuted,
    },
    verification: {
      beforeCutoffRemaining,
      onOrAfterCutoffRemaining,
      missingCreatedAtRemaining,
      verificationFailedReads: 0,
    },
  };
}

if (process.argv[1]?.includes("deleteOldInboxMessages")) {
  const isExecute = process.argv.includes("--execute");
  runInboxCleanup(isExecute)
    .then((report) => {
      console.log(`=== INBOX CLEANUP PRODUCTION ${report.mode.toUpperCase()} REPORT ===`);
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((err) => {
      console.error("INBOX CLEANUP FAILED:", err.message);
      process.exit(1);
    });
}
