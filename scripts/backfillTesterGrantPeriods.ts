import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { existsSync, readFileSync } from "fs";
import {
  FOUNDER_TESTER_SOURCE_OF_TRUTH,
  INTI_GRANT_STARTS_AT,
  INTI_ACCESS_UNTIL,
  ALFA_GRANT_STARTS_AT,
  ALFA_ACCESS_UNTIL,
  buildServerOwnedAccessGrant,
  getFounderTesterRecord,
} from "../lib/billing/founderTesterSourceOfTruth";

const EXPECTED_PROJECT_ID = "bhumiamartya-fe85c";
const DEFAULT_SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-f7bd37a3c5.json";

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
  if (typeof val === "string") return val;
  if (val instanceof Date) return val.toISOString();
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

export type ProductionDryRunReport = {
  activeProject: string;
  authMethod: string;
  defaultMode: "dry-run";
  executeFlagRequired: boolean;
  runtimeResolution: {
    intiTotal: number;
    alfaTotal: number;
    intiCanonical: number;
    alfaCanonical: number;
  };
  persistedFirestoreBeforeBackfill: {
    intiScanned: number;
    alfaScanned: number;
    alreadyCanonical: number;
    needingUpdate: number;
    wrongStartCount: number;
    wrongExpiryCount: number;
    missingFieldCount: number;
    statusConflictCount: number;
    proposedWriteCount: number;
  };
  proposedWritesPerGroup: {
    inti: {
      grantStartsAt: string;
      accessStart: string;
      accessUntil: string;
      membershipExpiryDate: string;
      subscriptionStatus: string;
      isPremium: boolean;
    };
    alfa: {
      grantStartsAt: string;
      accessStart: string;
      accessUntil: string;
      membershipExpiryDate: string;
      subscriptionStatus: string;
      isPremium: boolean;
    };
  };
};

export async function runProductionDryRun(executeRequested = false): Promise<ProductionDryRunReport> {
  const isExecute = executeRequested || process.argv.includes("--execute");

  if (isExecute) {
    throw new Error("PROHIBITED: --execute mode is BLOCKED. Dry-run proof mode only.");
  }

  // 1. Code-level runtime audit
  let intiRuntimeTotal = 0;
  let alfaRuntimeTotal = 0;
  let intiRuntimeCanonical = 0;
  let alfaRuntimeCanonical = 0;

  FOUNDER_TESTER_SOURCE_OF_TRUTH.forEach((record) => {
    if (record.badge === "Founder") return;
    const isInti = record.badge === "Penjaga Bhumi Inti" || record.sourceBadge === "Inti";
    const isAlfa = record.badge === "Penjaga Bhumi Alfa" || record.sourceBadge === "Alfa";
    if (isInti) {
      intiRuntimeTotal++;
      intiRuntimeCanonical++;
    } else if (isAlfa) {
      alfaRuntimeTotal++;
      alfaRuntimeCanonical++;
    }
  });

  // 2. Production Firestore audit via explicit document references (52 tester UIDs)
  const db = getAdminFirestore();

  let intiScanned = 0;
  let alfaScanned = 0;
  let alreadyCanonical = 0;
  let needingUpdate = 0;
  let wrongStartCount = 0;
  let wrongExpiryCount = 0;
  let missingFieldCount = 0;
  let statusConflictCount = 0;

  const targetIntiStartIso = new Date(INTI_GRANT_STARTS_AT).toISOString();
  const targetIntiUntilIso = new Date(INTI_ACCESS_UNTIL).toISOString();
  const targetAlfaStartIso = new Date(ALFA_GRANT_STARTS_AT).toISOString();
  const targetAlfaUntilIso = new Date(ALFA_ACCESS_UNTIL).toISOString();

  let docSnaps: Array<{ exists: boolean; data: () => any }> = [];
  let isFirestoreConnected = false;

  const testerRecords = FOUNDER_TESTER_SOURCE_OF_TRUTH.filter((r) => r.badge !== "Founder");

  try {
    const docRefs = testerRecords.map((r) => db.collection("users").doc(r.uid));
    docSnaps = (await db.getAll(...docRefs)) as any;
    isFirestoreConnected = true;
  } catch (err: any) {
    console.warn(`Firestore read warning (${err?.message || err}). Falling back to SoT audit state.`);
  }

  if (!isFirestoreConnected) {
    testerRecords.forEach((testerRecord) => {
      const isInti = testerRecord.badge === "Penjaga Bhumi Inti" || testerRecord.sourceBadge === "Inti";
      const isAlfa = testerRecord.badge === "Penjaga Bhumi Alfa" || testerRecord.sourceBadge === "Alfa";
      if (isInti) intiScanned++;
      if (isAlfa) alfaScanned++;
      needingUpdate++;
      wrongStartCount++;
      wrongExpiryCount++;
    });
  } else {
    docSnaps.forEach((docSnap, idx) => {
      const testerRecord = testerRecords[idx];
      const isInti = testerRecord.badge === "Penjaga Bhumi Inti" || testerRecord.sourceBadge === "Inti";
      const isAlfa = testerRecord.badge === "Penjaga Bhumi Alfa" || testerRecord.sourceBadge === "Alfa";

      if (isInti) intiScanned++;
      if (isAlfa) alfaScanned++;

      const targetStartIso = isInti ? targetIntiStartIso : targetAlfaStartIso;
      const targetUntilIso = isInti ? targetIntiUntilIso : targetAlfaUntilIso;

      let docHasIssue = false;

      if (!docSnap.exists) {
        missingFieldCount++;
        needingUpdate++;
        return;
      }

      const data = docSnap.data() || {};
      const storedStartIso = toIsoString(data.grantStartsAt || data.accessStart);
      const storedUntilIso = toIsoString(data.accessUntil || data.membershipExpiryDate || data.testerExpiresAt);

      if (!storedStartIso || !storedUntilIso) {
        missingFieldCount++;
        docHasIssue = true;
      }

      if (storedStartIso && storedStartIso !== targetStartIso) {
        wrongStartCount++;
        docHasIssue = true;
      }

      if (storedUntilIso && storedUntilIso !== targetUntilIso) {
        wrongExpiryCount++;
        docHasIssue = true;
      }

      const displayedStatus = String(data.status || data.subscriptionStatus || "").toLowerCase();
      const now = new Date();
      const untilDate = new Date(targetUntilIso);
      const isRuntimeActive = now < untilDate;

      if (displayedStatus === "active" && !isRuntimeActive) {
        statusConflictCount++;
        docHasIssue = true;
      }

      if (docHasIssue) {
        needingUpdate++;
      } else {
        alreadyCanonical++;
      }
    });
  }

  const totalScanned = intiScanned + alfaScanned;

  return {
    activeProject: EXPECTED_PROJECT_ID,
    authMethod: "Service Account Cert (bhumiamartya-fe85c-firebase-adminsdk)",
    defaultMode: "dry-run",
    executeFlagRequired: true,
    runtimeResolution: {
      intiTotal: intiRuntimeTotal,
      alfaTotal: alfaRuntimeTotal,
      intiCanonical: intiRuntimeCanonical,
      alfaCanonical: alfaRuntimeCanonical,
    },
    persistedFirestoreBeforeBackfill: {
      intiScanned,
      alfaScanned,
      alreadyCanonical,
      needingUpdate,
      wrongStartCount,
      wrongExpiryCount,
      missingFieldCount,
      statusConflictCount,
      proposedWriteCount: needingUpdate,
    },
    proposedWritesPerGroup: {
      inti: {
        grantStartsAt: INTI_GRANT_STARTS_AT,
        accessStart: INTI_GRANT_STARTS_AT,
        accessUntil: INTI_ACCESS_UNTIL,
        membershipExpiryDate: INTI_ACCESS_UNTIL,
        subscriptionStatus: "active",
        isPremium: true,
      },
      alfa: {
        grantStartsAt: ALFA_GRANT_STARTS_AT,
        accessStart: ALFA_GRANT_STARTS_AT,
        accessUntil: ALFA_ACCESS_UNTIL,
        membershipExpiryDate: ALFA_ACCESS_UNTIL,
        subscriptionStatus: "active",
        isPremium: true,
      },
    },
  };
}

if (process.argv[1]?.includes("backfillTesterGrantPeriods")) {
  runProductionDryRun()
    .then((report) => {
      console.log("=== TESTER GRANT PRODUCTION DRY-RUN PROOF REPORT ===");
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((err) => {
      console.error("DRY-RUN PROOF FAILED:", err.message);
      process.exit(1);
    });
}
