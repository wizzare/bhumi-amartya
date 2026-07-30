import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import {
  INTI_GRANT_STARTS_AT,
  INTI_ACCESS_UNTIL,
  ALFA_GRANT_STARTS_AT,
  ALFA_ACCESS_UNTIL,
} from "../lib/billing/founderTesterSourceOfTruth";
import { LEGACY_FOUNDER_TESTER_RECORDS as FOUNDER_TESTER_SOURCE_OF_TRUTH } from "./migrations/legacyFounderTesterData";

const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const DEFAULT_SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-5a2cbcc72efa.json";

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

function toIsoString(val: unknown): string | null {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toISOString();
  }
  if (typeof val === "object" && val !== null) {
    if ("toDate" in val && typeof (val as { toDate: () => Date }).toDate === "function") {
      return (val as { toDate: () => Date }).toDate().toISOString();
    }
    if ("seconds" in val && typeof (val as { seconds: number }).seconds === "number") {
      return new Date((val as { seconds: number }).seconds * 1000).toISOString();
    }
  }
  return null;
}

export type ProductionExecutionReport = {
  activeProject: string;
  authMethod: string;
  mode: "dry-run" | "execute";
  runtimeResolution: {
    intiTotal: number;
    alfaTotal: number;
  };
  firestoreResults: {
    intiScanned: number;
    alfaScanned: number;
    totalScanned: number;
    alreadyCanonical: number;
    needingUpdate: number;
    updated: number;
    skipped: number;
    failed: number;
    writesExecuted: number;
  };
  failedAccounts: Array<{ label: string; error: string }>;
};

export async function runProductionBackfill(executeRequested = false): Promise<ProductionExecutionReport> {
  const isExecute = executeRequested || process.argv.includes("--execute");
  const db = getAdminFirestore();

  const testerRecords = FOUNDER_TESTER_SOURCE_OF_TRUTH.filter((r) => r.badge !== "Founder");

  let intiScanned = 0;
  let alfaScanned = 0;
  let alreadyCanonical = 0;
  let needingUpdate = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let writesExecuted = 0;
  const failedAccounts: Array<{ label: string; error: string }> = [];

  const targetIntiStartIso = new Date(INTI_GRANT_STARTS_AT).toISOString();
  const targetIntiUntilIso = new Date(INTI_ACCESS_UNTIL).toISOString();
  const targetAlfaStartIso = new Date(ALFA_GRANT_STARTS_AT).toISOString();
  const targetAlfaUntilIso = new Date(ALFA_ACCESS_UNTIL).toISOString();

  const docRefs = testerRecords.map((r) => db.collection("users").doc(r.uid));
  const docSnaps = (await db.getAll(...docRefs)) as any[];

  const docsToUpdate: Array<{ ref: any; payload: any; isInti: boolean }> = [];

  docSnaps.forEach((docSnap, idx) => {
    const testerRecord = testerRecords[idx];
    const isInti = testerRecord.badge === "Penjaga Bhumi Inti" || testerRecord.sourceBadge === "Inti";
    const isAlfa = testerRecord.badge === "Penjaga Bhumi Alfa" || testerRecord.sourceBadge === "Alfa";

    if (isInti) intiScanned++;
    if (isAlfa) alfaScanned++;

    const targetStartIso = isInti ? targetIntiStartIso : targetAlfaStartIso;
    const targetUntilIso = isInti ? targetIntiUntilIso : targetAlfaUntilIso;
    const grantStartsAtVal = isInti ? INTI_GRANT_STARTS_AT : ALFA_GRANT_STARTS_AT;
    const accessUntilVal = isInti ? INTI_ACCESS_UNTIL : ALFA_ACCESS_UNTIL;

    let docHasIssue = false;

    if (!docSnap.exists) {
      docHasIssue = true;
    } else {
      const data = docSnap.data() || {};
      const storedStartIso = toIsoString(data.grantStartsAt || data.accessStart);
      const storedUntilIso = toIsoString(data.accessUntil || data.membershipExpiryDate || data.testerExpiresAt);

      if (!storedStartIso || storedStartIso !== targetStartIso) docHasIssue = true;
      if (!storedUntilIso || storedUntilIso !== targetUntilIso) docHasIssue = true;
    }

    if (docHasIssue) {
      needingUpdate++;
      docsToUpdate.push({
        ref: docRefs[idx],
        payload: {
          grantStartsAt: grantStartsAtVal,
          accessStart: grantStartsAtVal,
          accessUntil: accessUntilVal,
          membershipExpiryDate: accessUntilVal,
          subscriptionStatus: "active",
          isPremium: true,
        },
        isInti,
      });
    } else {
      alreadyCanonical++;
    }
  });

  if (isExecute && docsToUpdate.length > 0) {
    const batchSize = 400;
    for (let i = 0; i < docsToUpdate.length; i += batchSize) {
      const chunk = docsToUpdate.slice(i, i + batchSize);
      const batch = db.batch();
      chunk.forEach((item) => {
        batch.set(item.ref, item.payload, { merge: true });
      });
      try {
        await batch.commit();
        writesExecuted += chunk.length;
        updated += chunk.length;
      } catch (err: any) {
        failed += chunk.length;
        failedAccounts.push({
          label: `Batch chunk ${i / batchSize + 1}`,
          error: err?.message || String(err),
        });
      }
    }
  }

  return {
    activeProject: EXPECTED_PROJECT_ID,
    authMethod: "Service Account Cert (bhumiamartya-fe85c-5a2cbcc72efa.json)",
    mode: isExecute ? "execute" : "dry-run",
    runtimeResolution: {
      intiTotal: intiScanned,
      alfaTotal: alfaScanned,
    },
    firestoreResults: {
      intiScanned,
      alfaScanned,
      totalScanned: intiScanned + alfaScanned,
      alreadyCanonical,
      needingUpdate,
      updated: isExecute ? updated : 0,
      skipped,
      failed,
      writesExecuted,
    },
    failedAccounts,
  };
}

if (process.argv[1]?.includes("backfillTesterGrantPeriods")) {
  const isExecute = process.argv.includes("--execute");
  runProductionBackfill(isExecute)
    .then((report) => {
      console.log(`=== TESTER GRANT PRODUCTION ${report.mode.toUpperCase()} REPORT ===`);
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((err) => {
      console.error("EXECUTION FAILED:", err.message);
      process.exit(1);
    });
}
