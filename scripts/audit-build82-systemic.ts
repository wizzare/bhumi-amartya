import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { getHdState } from "../lib/humandesign/hdState";

const SA_PATHS = [
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json",
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-f49e4c95baf3.json",
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-522e9ad4ac07.json",
  "C:/Users/shein/Downloads/bhumiamartya-adminsdk.json.json",
];

function getAdmin() {
  if (getApps().length) return { db: getFirestore(), auth: getAuth() };
  for (const p of SA_PATHS) {
    if (existsSync(p)) {
      const sa = JSON.parse(readFileSync(p, "utf8"));
      if (sa.private_key && sa.private_key.includes("BEGIN PRIVATE KEY")) {
        initializeApp({ credential: cert(sa), projectId: sa.project_id });
        return { db: getFirestore(), auth: getAuth() };
      }
    }
  }
  throw new Error("No valid service account found");
}

const { db, auth } = getAdmin();

function hasBirthData(userDocData: any): boolean {
  const date = userDocData?.birthDate || userDocData?.dateOfBirth || userDocData?.profile?.birthDate || userDocData?.profile?.blueprintInput?.birthDate;
  const time = userDocData?.birthTime || userDocData?.timeOfBirth || userDocData?.profile?.birthTime || userDocData?.profile?.blueprintInput?.birthTime;
  const city = userDocData?.birthCity || userDocData?.birthPlace || userDocData?.cityOfBirth || userDocData?.placeOfBirth || userDocData?.profile?.birthCity || userDocData?.profile?.blueprintInput?.birthCity;
  return Boolean(date && time && city);
}

async function fetchCollectionDocs(uids: string[], collectionName: string) {
  const results = new Map<string, any>();
  const BATCH_SIZE = 25;
  for (let i = 0; i < uids.length; i += BATCH_SIZE) {
    const batchUids = uids.slice(i, i + BATCH_SIZE);
    const promises = batchUids.map(async (uid) => {
      try {
        const snap = await db.collection(collectionName).doc(uid).get();
        if (snap.exists) {
          results.set(uid, snap.data());
        }
      } catch (e) {
        // ignore individual fetch errors
      }
    });
    await Promise.all(promises);
  }
  return results;
}

async function runAudit() {
  const startDateStr = "2026-06-30T00:00:00.000Z";
  const endDateStr = "2026-07-30T23:59:59.999Z";
  const startTimeMs = new Date(startDateStr).getTime();
  const endTimeMs = new Date(endDateStr).getTime();

  console.log(`=== AUDIT BUILD 82 START ===`);
  console.log(`Date Range: ${startDateStr} to ${endDateStr}\n`);

  // 1. Fetch Auth users
  let pageToken: string | undefined = undefined;
  const allAuthUsers: UserRecord[] = [];
  do {
    const listResult = await auth.listUsers(1000, pageToken);
    allAuthUsers.push(...listResult.users);
    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log(`Total Firebase Auth users in DB: ${allAuthUsers.length}`);

  // Filter 30 day cohort
  const cohortAuthUsers = allAuthUsers.filter((u) => {
    const createdMs = new Date(u.metadata.creationTime).getTime();
    return createdMs >= startTimeMs && createdMs <= endTimeMs;
  });

  const cohortUidsArray = cohortAuthUsers.map((u) => u.uid);
  console.log(`Total cohort users (registered last 30 days): ${cohortUidsArray.length}\n`);

  // Check rakasa user by email
  let rakasaUid: string | null = null;
  try {
    const rakasaUser = await auth.getUserByEmail("rakasa112233@gmail.com");
    rakasaUid = rakasaUser.uid;
  } catch (err) {
    // ignore
  }

  const allTargetUids = Array.from(new Set([...cohortUidsArray, ...(rakasaUid ? [rakasaUid] : [])]));

  console.log(`Fetching user & blueprint documents for ${allTargetUids.length} targeted UIDs...`);
  const userDocsMap = await fetchCollectionDocs(allTargetUids, "users");
  const blueprintDocsMap = await fetchCollectionDocs(allTargetUids, "blueprints");
  console.log(`Fetched ${userDocsMap.size} user docs and ${blueprintDocsMap.size} blueprint docs.`);

  let stateCounts: Record<string, number> = {
    CANONICAL: 0,
    FALLBACK_LABELED: 0,
    PENDING: 0,
    RETRIABLE_ERROR: 0,
    TERMINAL_ERROR: 0,
    UNKNOWN_EMPTY: 0,
  };

  let fallbackProvenanceCounts: Record<string, number> = {
    historical: 0,
    local_fallback: 0,
    empty: 0,
    other: 0,
  };

  let completeBirthDataCount = 0;
  let incompleteBirthDataCount = 0;

  // Trial metrics for 30-day cohort
  let trialActiveCount = 0;
  let trialExpiredCount = 0;
  let trialMissingCount = 0;
  let trialInvalidDateCount = 0;
  let trialExpiredTooFastCount = 0; // expired before 7 days
  let trialTooLongCount = 0; // trial ends > 8 days after start

  let rakasaAuditResult: any = null;
  const nowMs = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  for (const uid of cohortUidsArray) {
    const userDoc = userDocsMap.get(uid) || {};
    const blueprintDoc = blueprintDocsMap.get(uid) || {};

    const birthDataValid = hasBirthData(userDoc);
    if (birthDataValid) {
      completeBirthDataCount++;
    } else {
      incompleteBirthDataCount++;
    }

    // HD State classification
    const hdPayload = blueprintDoc.humanDesign || userDoc.humanDesign;
    const hdResult = getHdState(hdPayload);

    if (stateCounts[hdResult.state] !== undefined) {
      stateCounts[hdResult.state]++;
    } else {
      stateCounts.UNKNOWN_EMPTY++;
    }

    if (hdResult.state === "FALLBACK_LABELED") {
      const prov = hdResult.provenance;
      if (prov === "historical") fallbackProvenanceCounts.historical++;
      else if (prov === "local_fallback") fallbackProvenanceCounts.local_fallback++;
      else if (!prov) fallbackProvenanceCounts.empty++;
      else fallbackProvenanceCounts.other++;
    }

    // Trial timing classification
    const authRecord = cohortAuthUsers.find((u) => u.uid === uid);
    const createdMs = authRecord ? new Date(authRecord.metadata.creationTime).getTime() : 0;

    const trialStartedAt = userDoc.trialStartedAt || userDoc.createdAt || userDoc.registeredAt;
    const trialEndsAt = userDoc.trialEndsAt || userDoc.accessUntil || userDoc.membershipExpiryDate;

    let startMs: number | null = null;
    if (trialStartedAt) {
      if (typeof trialStartedAt.toMillis === "function") startMs = trialStartedAt.toMillis();
      else if (typeof trialStartedAt === "string" || typeof trialStartedAt === "number") startMs = new Date(trialStartedAt).getTime();
    }
    if (!startMs && createdMs) startMs = createdMs;

    let endMs: number | null = null;
    if (trialEndsAt) {
      if (typeof trialEndsAt.toMillis === "function") endMs = trialEndsAt.toMillis();
      else if (typeof trialEndsAt === "string" || typeof trialEndsAt === "number") endMs = new Date(trialEndsAt).getTime();
    }

    if (!trialEndsAt && !trialStartedAt && !userDoc.plan) {
      trialMissingCount++;
    } else if ((startMs && Number.isNaN(startMs)) || (endMs && Number.isNaN(endMs))) {
      trialInvalidDateCount++;
    } else if (endMs) {
      if (nowMs < endMs) {
        trialActiveCount++;
      } else {
        trialExpiredCount++;
      }

      if (startMs) {
        const durationMs = endMs - startMs;
        if (durationMs < SEVEN_DAYS_MS - 60000) {
          trialExpiredTooFastCount++;
        } else if (durationMs > SEVEN_DAYS_MS + (24 * 3600 * 1000)) {
          trialTooLongCount++;
        }
      }
    } else {
      trialMissingCount++;
    }
  }

  // Audit rakasa separately
  if (rakasaUid) {
    const userDoc = userDocsMap.get(rakasaUid) || {};
    const blueprintDoc = blueprintDocsMap.get(rakasaUid) || {};
    const hdPayload = blueprintDoc.humanDesign || userDoc.humanDesign;
    const hdResult = getHdState(hdPayload);

    rakasaAuditResult = {
      inCohort: cohortUidsArray.includes(rakasaUid),
      hdState: hdResult.state,
      hdProvenance: hdResult.provenance,
      hdReason: hdResult.reason,
      needsUpgrade: hdResult.needsUpgrade,
      hdSource: hdPayload?.source || null,
      hdQuality: hdPayload?.calculationQuality || null,
      hdEngineVersion: hdPayload?.hdEngineVersion || null,
      calculatedAt: hdPayload?.calculatedAt || null,
      updatedAt: hdPayload?.updatedAt || null,
      hasCanonicalPayload: Boolean(hdPayload?.type && (hdPayload?.source === "human-design-py" || hdPayload?.source === "hdkit")),
      birthDataCompleteness: {
        hasBirthDate: Boolean(userDoc.birthDate || userDoc.dateOfBirth || userDoc.profile?.birthDate),
        hasBirthTime: Boolean(userDoc.birthTime || userDoc.timeOfBirth || userDoc.profile?.birthTime),
        hasBirthCity: Boolean(userDoc.birthCity || userDoc.birthPlace || userDoc.cityOfBirth || userDoc.profile?.birthCity),
        hasTimezone: Boolean(userDoc.timezone || userDoc.profile?.timezone),
        hasLatLong: Boolean((userDoc.latitude != null || userDoc.profile?.latitude != null) && (userDoc.longitude != null || userDoc.profile?.longitude != null)),
      },
      trialFields: {
        plan: userDoc.plan || null,
        trialStartedAt: userDoc.trialStartedAt || null,
        trialEndsAt: userDoc.trialEndsAt || null,
        trialLoginCount: userDoc.trialLoginCount || null,
        trialStatus: userDoc.trialStatus || null,
        accessUntil: userDoc.accessUntil || null,
      }
    };
  }

  const totalCohort = cohortUidsArray.length;

  console.log(`\n--- HUMAN DESIGN STATE DISTRIBUTION ---`);
  console.log(`Total Cohort: ${totalCohort}`);
  for (const [st, count] of Object.entries(stateCounts)) {
    const pct = totalCohort > 0 ? ((count / totalCohort) * 100).toFixed(2) : "0.00";
    console.log(`  ${st}: ${count} (${pct}%)`);
  }

  console.log(`\n--- FALLBACK_LABELED PROVENANCE BREAKDOWN ---`);
  const totalFallback = stateCounts.FALLBACK_LABELED || 0;
  for (const [prov, count] of Object.entries(fallbackProvenanceCounts)) {
    const pct = totalFallback > 0 ? ((count / totalFallback) * 100).toFixed(2) : "0.00";
    console.log(`  ${prov}: ${count} (${pct}%)`);
  }

  console.log(`\n--- BIRTH DATA COMPLETENESS ---`);
  const completePct = totalCohort > 0 ? ((completeBirthDataCount / totalCohort) * 100).toFixed(2) : "0.00";
  const incompletePct = totalCohort > 0 ? ((incompleteBirthDataCount / totalCohort) * 100).toFixed(2) : "0.00";
  console.log(`  Complete birth data: ${completeBirthDataCount} (${completePct}%)`);
  console.log(`  Incomplete birth data: ${incompleteBirthDataCount} (${incompletePct}%)`);

  console.log(`\n--- TRIAL TIMING AGGREGATE (COHORT) ---`);
  console.log(`  Trial Active: ${trialActiveCount}`);
  console.log(`  Trial Expired: ${trialExpiredCount}`);
  console.log(`  Trial Missing Fields: ${trialMissingCount}`);
  console.log(`  Trial Invalid Date: ${trialInvalidDateCount}`);
  console.log(`  Trial Expired Too Fast (<7 days): ${trialExpiredTooFastCount}`);
  console.log(`  Trial Too Long (>8 days): ${trialTooLongCount}`);

  console.log(`\n--- RAKASA ACCOUNT AUDIT (AGGREGATED SUMMARY, NO PII) ---`);
  console.log(JSON.stringify(rakasaAuditResult, null, 2));

  console.log(`\n=== AUDIT BUILD 82 END ===`);
}

runAudit().catch(console.error).finally(() => process.exit(0));
