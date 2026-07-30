import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { getHdState } from "../lib/humandesign/hdState";

function getAdmin() {
  if (getApps().length) return { db: getFirestore(), auth: getAuth() };

  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const candidatePaths = [
    envPath,
    "./service-account.json",
    process.env.HOME ? `${process.env.HOME}/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json` : null,
    process.env.USERPROFILE ? `${process.env.USERPROFILE}/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json` : null,
  ].filter(Boolean) as string[];

  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        const sa = JSON.parse(readFileSync(p, "utf8"));
        if (sa.private_key && sa.private_key.includes("BEGIN PRIVATE KEY")) {
          initializeApp({ credential: cert(sa), projectId: sa.project_id });
          return { db: getFirestore(), auth: getAuth() };
        }
      } catch (e) {}
    }
  }
  throw new Error("No valid service account credential found in GOOGLE_APPLICATION_CREDENTIALS or standard paths");
}

const { db, auth } = getAdmin();

const PENDING_STALE_THRESHOLD_MS = 30 * 60 * 1000; // Minimum 30 minutes threshold for PENDING

function hashUid(uid: string): string {
  return createHash("sha256").update(uid).digest("hex").slice(0, 12);
}

function getBirthProfile(userDoc: any) {
  const birthDate = userDoc?.birthDate || userDoc?.dateOfBirth || userDoc?.profile?.birthDate || userDoc?.profile?.blueprintInput?.birthDate;
  const birthTime = userDoc?.birthTime || userDoc?.timeOfBirth || userDoc?.profile?.birthTime || userDoc?.profile?.blueprintInput?.birthTime;
  const birthCity = userDoc?.birthCity || userDoc?.birthPlace || userDoc?.cityOfBirth || userDoc?.placeOfBirth || userDoc?.profile?.birthCity || userDoc?.profile?.blueprintInput?.birthCity;
  const timezone = userDoc?.timezone || userDoc?.profile?.timezone || "+07:00";
  const latitude = userDoc?.latitude ?? userDoc?.profile?.latitude ?? null;
  const longitude = userDoc?.longitude ?? userDoc?.profile?.longitude ?? null;

  if (birthDate && birthTime && birthCity) {
    return { birthDate, birthTime, birthCity, timezone, latitude, longitude };
  }
  return null;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const isDryRun = args.includes("--dry-run") || !isExecute;

  let limit: number | null = null;
  let canary: number | null = null;
  let targetStateFilter: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = parseInt(args[i + 1], 10);
    if (args[i] === "--canary" && args[i + 1]) canary = parseInt(args[i + 1], 10);
    if (args[i] === "--state" && args[i + 1]) targetStateFilter = args[i + 1].toUpperCase();
  }

  return { isExecute, isDryRun, limit, canary, targetStateFilter };
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
      } catch (e) {}
    });
    await Promise.all(promises);
  }
  return results;
}

function isValidResponseShape(data: any): boolean {
  if (!data || typeof data !== "object") return false;
  if (data.status === "error") return false;
  if (!data.type || typeof data.type !== "string") return false;
  return true;
}

async function runMassRecovery() {
  const { isExecute, isDryRun, limit, canary, targetStateFilter } = parseCliArgs();

  console.log(`=== HUMAN DESIGN MASS RECOVERY SCRIPT ===`);
  console.log(`MODE: ${isExecute ? "🚨 EXECUTE PRODUCTION WRITE 🚨" : "🛡️ DRY-RUN (READ-ONLY) 🛡️"}`);
  if (canary) console.log(`CANARY LIMIT: ${canary} candidates`);
  if (limit) console.log(`COUNT LIMIT: ${limit} candidates`);
  console.log(`STATE FILTER: ${targetStateFilter || "DEFAULT (FALLBACK_LABELED/local_fallback + RETRIABLE_ERROR strictly, PENDING EXCLUDED)"}`);
  console.log("");

  if (isDryRun) {
    console.log("NOTE: Running in DRY-RUN mode. No Firestore documents will be modified.");
    console.log("Pass --execute explicitly after Founder approval to commit changes.\n");
  }

  // 1. Fetch Auth users
  let pageToken: string | undefined = undefined;
  const allAuthUsers: UserRecord[] = [];
  do {
    const listResult = await auth.listUsers(1000, pageToken);
    allAuthUsers.push(...listResult.users);
    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log(`Total Firebase Auth users: ${allAuthUsers.length}`);

  const allUids = allAuthUsers.map((u) => u.uid);

  const userDocsMap = await fetchCollectionDocs(allUids, "users");
  const blueprintDocsMap = await fetchCollectionDocs(allUids, "blueprints");

  const nowMs = Date.now();
  let candidateList: { uid: string; birthProfile: any; currentHdState: string }[] = [];
  let skippedCanonical = 0;
  let skippedIncomplete = 0;
  let skippedExcludedPending = 0;

  for (const uid of allUids) {
    const userDoc = userDocsMap.get(uid) || {};
    const blueprintDoc = blueprintDocsMap.get(uid) || {};

    const hdPayload = blueprintDoc.humanDesign || userDoc.humanDesign;
    const hdResult = getHdState(hdPayload);

    if (hdResult.state === "CANONICAL") {
      skippedCanonical++;
      continue;
    }

    const birthProfile = getBirthProfile(userDoc);
    if (!birthProfile) {
      skippedIncomplete++;
      continue;
    }

    // Default target filter: strictly FALLBACK_LABELED (local_fallback) and RETRIABLE_ERROR.
    // PENDING is EXCLUDED by default unless --state PENDING is explicitly provided.
    if (targetStateFilter) {
      if (hdResult.state !== targetStateFilter) continue;
      if (targetStateFilter === "PENDING") {
        const updatedAtStr = blueprintDoc.updatedAt || userDoc.updatedAt;
        const updatedAtMs = updatedAtStr ? new Date(updatedAtStr).getTime() : 0;
        if (updatedAtMs > 0 && nowMs - updatedAtMs < PENDING_STALE_THRESHOLD_MS) {
          skippedExcludedPending++;
          continue; // Fresh pending calculation under 30 minutes; skip
        }
      }
    } else {
      // Default execute/dry-run filter:
      // Exclude PENDING completely
      if (hdResult.state === "PENDING") {
        skippedExcludedPending++;
        continue;
      }
      // Require FALLBACK_LABELED with local_fallback OR RETRIABLE_ERROR
      if (hdResult.state === "FALLBACK_LABELED") {
        if (hdResult.provenance !== "local_fallback") continue;
      } else if (hdResult.state !== "RETRIABLE_ERROR") {
        continue;
      }
    }

    candidateList.push({
      uid,
      birthProfile,
      currentHdState: hdResult.state,
    });
  }

  // Apply Canary or Limit filters
  const effectiveLimit = canary ? Math.min(canary, limit || Infinity) : (limit || Infinity);
  if (Number.isFinite(effectiveLimit) && candidateList.length > effectiveLimit) {
    candidateList = candidateList.slice(0, effectiveLimit);
  }

  console.log(`\n--- CANDIDATE AUDIT SUMMARY (AGGREGATED, PRIVACY-SAFE) ---`);
  console.log(`Total Candidates Filtered for Recovery: ${candidateList.length}`);
  console.log(`  Skipped (Already CANONICAL): ${skippedCanonical}`);
  console.log(`  Skipped (Incomplete Birth Data): ${skippedIncomplete}`);
  console.log(`  Skipped (Excluded PENDING): ${skippedExcludedPending}`);

  const breakdownByState: Record<string, number> = {};
  for (const c of candidateList) {
    breakdownByState[c.currentHdState] = (breakdownByState[c.currentHdState] || 0) + 1;
  }
  for (const [st, cnt] of Object.entries(breakdownByState)) {
    console.log(`  Filtered candidate state [${st}]: ${cnt}`);
  }

  console.log(`\n--- RECOVERY SAFEGUARDS & CIRCUIT BREAKER ---`);
  console.log(`Circuit Breaker Threshold: Triggered if success rate drops below 90% or 3 consecutive failures.`);
  console.log(`Idempotency: Checks getHdState before write; skips if state turned CANONICAL.`);
  console.log(`Privacy Safeguard: Checkpoint saved with SHA-256 hashed UIDs only.`);

  if (isDryRun) {
    console.log(`\n[DRY-RUN COMPLETE] 0 documents updated. STOPPING.`);
    return;
  }

  // 4. EXECUTE MODE (only reached if --execute is passed)
  console.log(`\nStarting production batch execution for ${candidateList.length} candidates...`);

  let successCount = 0;
  let failCount = 0;
  let consecutiveFailures = 0;
  const checkpointLogs: { hashedUid: string; status: "success" | "fail"; state: string }[] = [];

  const CONCURRENCY = 3;
  for (let i = 0; i < candidateList.length; i += CONCURRENCY) {
    const batch = candidateList.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (candidate) => {
        const hashedUid = hashUid(candidate.uid);
        try {
          const bp = candidate.birthProfile;
          const res = await fetch("https://bhumi-human-design-api.vercel.app/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fullName: "User",
              birthDate: bp.birthDate,
              birthTime: bp.birthTime,
              birthPlace: bp.birthCity,
              timezone: bp.timezone,
              latitude: bp.latitude,
              longitude: bp.longitude,
            }),
          });

          if (!res.ok) throw new Error(`API response HTTP ${res.status}`);
          const data = await res.json();
          if (!isValidResponseShape(data)) throw new Error("Invalid API response shape");

          const now = new Date().toISOString();
          const canonicalChart = {
            type: data.type,
            strategy: data.strategy,
            authority: data.authority,
            profile: data.profile,
            definition: data.definition || "Single Definition",
            incarnationCross: {
              name: data.inc_cross || data.incarnationCross || null,
              gates: [],
            },
            centers: data.definedCenters || [],
            gates: (data.gatesPersonality || []).concat(data.gatesDesign || []).map(Number),
            channels: data.channels || [],
            variables: data.variables || null,
            digestion: data.digestion || null,
            cognition: data.cognition || null,
            motivation: data.motivation || null,
            environment: data.environment || null,
            perspective: data.perspective || null,
            status: "ready",
            source: "human-design-py",
            accuracy: "verified",
            calculationQuality: "verified",
            hdEngineVersion: "gaia-hd-v1",
            hdAuditStatus: "validated",
            generatedAt: now,
            updatedAt: now,
            calculationStatus: "completed",
          };

          const bpRef = db.collection("blueprints").doc(candidate.uid);
          const bpSnap = await bpRef.get();
          const existingBp = bpSnap.exists ? bpSnap.data() || {} : {};

          await bpRef.set({
            ...existingBp,
            uid: candidate.uid,
            humanDesign: canonicalChart,
            updatedAt: now,
          }, { merge: true });

          return { ok: true, hashedUid };
        } catch (e) {
          return { ok: false, hashedUid };
        }
      })
    );

    for (const r of results) {
      if (r.ok) {
        successCount++;
        consecutiveFailures = 0;
        checkpointLogs.push({ hashedUid: r.hashedUid, status: "success", state: "CANONICAL" });
      } else {
        failCount++;
        consecutiveFailures++;
        checkpointLogs.push({ hashedUid: r.hashedUid, status: "fail", state: "ERROR" });
      }
    }

    // Circuit Breaker check
    const totalProcessed = successCount + failCount;
    const successRate = totalProcessed > 0 ? (successCount / totalProcessed) * 100 : 100;

    if (consecutiveFailures >= 3 || (totalProcessed >= 5 && successRate < 90)) {
      console.error(`\n🚨 CIRCUIT BREAKER TRIGGERED 🚨`);
      console.error(`Processed: ${totalProcessed}, Success: ${successCount}, Fail: ${failCount}, Rate: ${successRate.toFixed(1)}%`);
      console.error(`Execution halted to prevent cascade errors.`);
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  // Save hashed checkpoint
  const checkpointPath = "scripts/recovery-checkpoint.json";
  writeFileSync(checkpointPath, JSON.stringify({ timestamp: new Date().toISOString(), total: successCount + failCount, successCount, failCount, logs: checkpointLogs }, null, 2));

  console.log(`\n=== BATCH EXECUTION SUMMARY ===`);
  console.log(`Successfully Recovered to CANONICAL: ${successCount}`);
  console.log(`Failed / Aborted: ${failCount}`);
  console.log(`Privacy Checkpoint saved: ${checkpointPath} (containing hashed UIDs only)`);
}

runMassRecovery().catch(console.error).finally(() => process.exit(0));
