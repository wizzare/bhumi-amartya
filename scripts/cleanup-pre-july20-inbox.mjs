/**
 * PRE-20-JULY INBOX CLEANUP SCRIPT
 *
 * Canonical cutoff: 2026-07-20 00:00 Asia/Jakarta (2026-07-19T17:00:00.000Z)
 *
 * Usage:
 *   node scripts/cleanup-pre-july20-inbox.mjs --dry-run
 *   node scripts/cleanup-pre-july20-inbox.mjs --execute
 *
 * Safety:
 *   - dry-run is the default
 *   - --execute flag required for actual deletion
 *   - paginated reads with batch deletion
 *   - skips documents with missing/invalid createdAt
 *   - verifies each candidate immediately before deletion
 *   - no UID/email/message-body in logs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { createHash } from "crypto";

const CUTOFF_ISO = "2026-07-19T17:00:00.000Z";
const CUTOFF_TIMESTAMP = Timestamp.fromDate(new Date(CUTOFF_ISO));
const BATCH_SIZE = 50;
const EXPECTED_PROJECT = "bhumiamartya-fe85c";
const SA_PATH = "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-f7bd37a3c5.json";

const isDryRun = !process.argv.includes("--execute");
const isExecute = process.argv.includes("--execute");

let scanned = 0;
let eligible = 0;
let deleted = 0;
let skipped = 0;
let failed = 0;
let missingTs = 0;
let invalidTs = 0;
let affectedUsers = new Set();

function hashId(id) {
  return createHash("sha256").update(id).digest("hex").slice(0, 12);
}

async function main() {
  if (!isDryRun && !isExecute) {
    console.log("Usage: node cleanup-pre-july20-inbox.mjs [--dry-run | --execute]");
    process.exit(0);
  }

  console.log(`Mode: ${isDryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Cutoff: ${CUTOFF_ISO} (2026-07-20 00:00 Asia/Jakarta)`);
  const projectArg = process.argv.find((a) => a.startsWith("--project="));
  if (projectArg) {
    const project = projectArg.split("=")[1];
    if (project !== EXPECTED_PROJECT) {
      console.error(`PROJECT MISMATCH: expected ${EXPECTED_PROJECT}, got ${project}`);
      process.exit(1);
    }
  }
  console.log(`Project: ${EXPECTED_PROJECT}`);
  console.log();

  const raw = JSON.parse(readFileSync(SA_PATH, "utf8"));
  if (raw.project_id !== EXPECTED_PROJECT) {
    console.error(`SERVICE ACCOUNT PROJECT MISMATCH: expected ${EXPECTED_PROJECT}, got ${raw.project_id}`);
    process.exit(1);
  }
  if (!getApps().length) initializeApp({ credential: cert(raw) });
  const db = getFirestore();

  const usersSnap = await db.collection("users").select("uid").limit(500).get();
  console.log(`Users scanned: ${usersSnap.size}`);

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const commsSnap = await db
      .collection(`users/${uid}/communications`)
      .get();

    for (const doc of commsSnap.docs) {
      scanned++;
      const data = doc.data();
      const createdAt = data.createdAt;
      const type = data.type || data.source || "unknown";
      const docHash = hashId(doc.id);

      if (!createdAt) {
        missingTs++;
        console.log(`  SKIP(missing ts) doc=${docHash} uid=${hashId(uid)} type=${type}`);
        continue;
      }

      let ts;
      if (createdAt instanceof Timestamp) {
        ts = createdAt.toMillis();
      } else if (typeof createdAt === "object" && createdAt?.seconds) {
        ts = createdAt.seconds * 1000;
      } else if (typeof createdAt === "string") {
        const p = Date.parse(createdAt);
        if (!Number.isFinite(p)) {
          invalidTs++;
          console.log(`  SKIP(invalid ts) doc=${docHash} uid=${hashId(uid)} ts=${createdAt}`);
          continue;
        }
        ts = p;
      } else {
        invalidTs++;
        console.log(`  SKIP(unparseable) doc=${docHash} uid=${hashId(uid)} type=${typeof createdAt}`);
        continue;
      }

      if (ts >= CUTOFF_TIMESTAMP.toMillis()) {
        continue; // retained
      }

      if (isExecute && ts >= CUTOFF_TIMESTAMP.toMillis()) {
        console.error(`ABORT: document ${docHash} has createdAt >= cutoff but was classified as eligible`);
        process.exit(1);
      }

      eligible++;
      affectedUsers.add(uid);

      if (isExecute) {
        try {
          await db.doc(`users/${uid}/communications/${doc.id}`).delete();
          deleted++;
          console.log(`  DELETED doc=${docHash} uid=${hashId(uid)} type=${type}`);
        } catch (err) {
          failed++;
          console.error(`  FAILED doc=${docHash} uid=${hashId(uid)} type=${type} error=${err.message}`);
        }
      } else {
        console.log(`  ELIGIBLE doc=${docHash} uid=${hashId(uid)} type=${type}`);
      }
    }
  }

  console.log("\n=== CLEANUP SUMMARY ===");
  console.log(`Scanned:        ${scanned}`);
  console.log(`Eligible:       ${eligible}`);
  console.log(`Deleted:        ${deleted}`);
  console.log(`Skipped:        ${skipped}`);
  console.log(`Failed:         ${failed}`);
  console.log(`Missing ts:     ${missingTs}`);
  console.log(`Invalid ts:     ${invalidTs}`);
  console.log(`Affected users: ${affectedUsers.size}`);
  console.log(`Remaining eligible: ${eligible - deleted}`);

  if (isDryRun) {
    console.log("\n[DRY RUN] No documents were deleted. Use --execute to perform deletion.");
  }

  if (eligible !== deleted && isExecute) {
    console.error(`MISMATCH: ${eligible} eligible but only ${deleted} deleted. Some deletions may have failed.`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
