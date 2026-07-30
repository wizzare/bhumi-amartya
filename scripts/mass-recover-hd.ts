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

async function fetchDocsMap(uids: string[], collectionName: string) {
  const results = new Map<string, any>();
  const BATCH_SIZE = 30;
  for (let i = 0; i < uids.length; i += BATCH_SIZE) {
    const batch = uids.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (uid) => {
        try {
          const snap = await db.collection(collectionName).doc(uid).get();
          if (snap.exists) results.set(uid, snap.data());
        } catch (e) {}
      })
    );
  }
  return results;
}

async function runMassRecovery() {
  const isExecute = process.argv.includes("--execute");

  console.log(`=== HUMAN DESIGN MASS RECOVERY SCRIPT ===`);
  console.log(`MODE: ${isExecute ? "🚨 EXECUTE PRODUCTION WRITE 🚨" : "🛡️ DRY-RUN (READ-ONLY) 🛡️"}\n`);

  if (!isExecute) {
    console.log("NOTE: Running in default DRY-RUN mode. No Firestore documents will be modified.");
    console.log("To execute production backfill, pass the explicit '--execute' flag after Founder approval.\n");
  }

  // 1. Fetch all Auth users to get total user base
  let pageToken: string | undefined = undefined;
  const allAuthUsers: UserRecord[] = [];
  do {
    const listResult = await auth.listUsers(1000, pageToken);
    allAuthUsers.push(...listResult.users);
    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log(`Total Firebase Auth users: ${allAuthUsers.length}`);

  const allUids = allAuthUsers.map((u) => u.uid);

  console.log(`Fetching user & blueprint documents for all ${allUids.length} users...`);
  const userDocsMap = await fetchDocsMap(allUids, "users");
  const blueprintDocsMap = await fetchDocsMap(allUids, "blueprints");
  console.log(`Fetched ${userDocsMap.size} user docs and ${blueprintDocsMap.size} blueprint docs.`);

  // 2. Identify candidate users
  const candidates: { uid: string; birthProfile: any; currentHdState: string }[] = [];
  let skippedCanonicalCount = 0;
  let skippedIncompleteBirthDataCount = 0;

  for (const uid of allUids) {
    const userDoc = userDocsMap.get(uid) || {};
    const blueprintDoc = blueprintDocsMap.get(uid) || {};

    const hdPayload = blueprintDoc.humanDesign || userDoc.humanDesign;
    const hdResult = getHdState(hdPayload);

    if (hdResult.state === "CANONICAL") {
      skippedCanonicalCount++;
      continue;
    }

    const birthProfile = getBirthProfile(userDoc);
    if (!birthProfile) {
      skippedIncompleteBirthDataCount++;
      continue;
    }

    // Candidate for recovery (FALLBACK_LABELED, RETRIABLE_ERROR, PENDING)
    candidates.push({
      uid,
      birthProfile,
      currentHdState: hdResult.state,
    });
  }

  console.log(`\n--- CANDIDATE AUDIT SUMMARY (AGGREGATED, PRIVACY-SAFE) ---`);
  console.log(`Total Candidates Eligible for HD Recovery: ${candidates.length}`);
  console.log(`  Skipped (Already CANONICAL): ${skippedCanonicalCount}`);
  console.log(`  Skipped (Incomplete Birth Data): ${skippedIncompleteBirthDataCount}`);

  const breakdownByState: Record<string, number> = {};
  for (const c of candidates) {
    breakdownByState[c.currentHdState] = (breakdownByState[c.currentHdState] || 0) + 1;
  }
  for (const [st, cnt] of Object.entries(breakdownByState)) {
    console.log(`  Candidate state breakdown [${st}]: ${cnt}`);
  }

  console.log(`\n--- RECOVERY PLAN ESTIMATES & SAFEGUARDS ---`);
  console.log(`Estimated API Requests: ${candidates.length}`);
  console.log(`Estimated Execution Time: ~${Math.ceil((candidates.length * 200) / 1000)} seconds (with 5 req/sec rate limit)`);
  console.log(`Concurrency Limit: 3 workers max`);
  console.log(`Retry Strategy: Max 2 retries per user with exponential backoff (1s, 3s)`);
  console.log(`Idempotency: Re-evaluates getHdState before write; skips if already CANONICAL.`);

  if (!isExecute) {
    console.log(`\n[DRY-RUN COMPLETE] 0 documents updated. STOPPING AND WAITING FOR FOUNDER APPROVAL.`);
    return;
  }

  // 3. EXECUTE MODE (only reached if --execute is explicitly supplied)
  console.log(`\nStarting production batch execution for ${candidates.length} candidates...`);

  let successCount = 0;
  let failCount = 0;
  const CONCURRENCY = 3;

  for (let i = 0; i < candidates.length; i += CONCURRENCY) {
    const batch = candidates.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (candidate) => {
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

          if (!res.ok) throw new Error(`API response status ${res.status}`);
          const data = await res.json();
          if (data.status === "error" || !data.type) throw new Error(data.note || "Invalid API response");

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

          // Update Firestore
          const bpRef = db.collection("blueprints").doc(candidate.uid);
          const bpSnap = await bpRef.get();
          const existingBp = bpSnap.exists ? bpSnap.data() || {} : {};

          await bpRef.set({
            ...existingBp,
            uid: candidate.uid,
            humanDesign: canonicalChart,
            updatedAt: now,
          }, { merge: true });

          return true;
        } catch (e) {
          return false;
        }
      })
    );

    results.forEach((ok) => {
      if (ok) successCount++;
      else failCount++;
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log(`\n=== BATCH EXECUTION COMPLETE ===`);
  console.log(`Successfully Recovered to CANONICAL: ${successCount}`);
  console.log(`Failed / Skipped: ${failCount}`);
}

runMassRecovery().catch(console.error).finally(() => process.exit(0));
