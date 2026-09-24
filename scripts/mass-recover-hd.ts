import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { getHdState } from "../lib/humandesign/hdState";
import { isCanonicalHumanDesign } from "../lib/humandesign/hdAudit";
import { canonicalizeNatalTimezone } from "../lib/astrology/resolveIanaTimezone";
import { mergeVerifiedHumanDesignChart, normalizeLiveHumanDesignResponse } from "../lib/humandesign/liveContract";
import {
  getHumanDesignCompleteness,
  type HumanDesignCoreState,
} from "../lib/humandesign/completeness";

/** A stored record is already "good enough" — no recovery candidate, regardless of hdState. */
function isStructurallySettled(coreState: HumanDesignCoreState): boolean {
  return coreState === "CANONICAL_CORE_COMPLETE" || coreState === "CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL";
}

/** Identity-bearing fields. A change here on a repair candidate must be flagged, never silently repaired. */
const IDENTITY_FIELDS = ["type", "strategy", "authority", "profile"] as const;

type FieldSnapshot = {
  type: string | null;
  strategy: string | null;
  authority: string | null;
  profile: string | null;
  definition: string | null;
  gatesLen: number;
  channelsLen: number;
  centersDetermined: number;
  incarnationCrossName: string | null;
  advancedStatus: string;
};

const CENTER_KEYS = ["head", "ajna", "throat", "g", "ego", "spleen", "sacral", "solarPlexus", "root"];

function normStr(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function fieldSnapshot(hd: any): FieldSnapshot {
  const centers = hd?.centers && typeof hd.centers === "object" ? hd.centers : {};
  return {
    type: normStr(hd?.type),
    strategy: normStr(hd?.strategy),
    authority: normStr(hd?.authority),
    profile: normStr(hd?.profile),
    definition: normStr(hd?.definition),
    gatesLen: Array.isArray(hd?.gates) ? hd.gates.length : 0,
    channelsLen: Array.isArray(hd?.channels) ? hd.channels.length : 0,
    centersDetermined: CENTER_KEYS.filter((k) => centers[k] === true || centers[k] === false).length,
    incarnationCrossName: normStr(hd?.incarnationCross?.name),
    advancedStatus: getHumanDesignCompleteness(hd).advancedVariables.status,
  };
}

/**
 * Compares BEFORE/AFTER field snapshots. An IDENTITY_FIELDS value that was
 * already non-null and changes to a DIFFERENT non-null value is an
 * IDENTITY_CHANGE (never silently treated as an ordinary repair). A field
 * that only moved from empty/null to populated is STRUCTURAL_COMPLETION.
 */
function compareSnapshots(before: FieldSnapshot, after: FieldSnapshot) {
  const changedIdentityFields: string[] = [];
  for (const f of IDENTITY_FIELDS) {
    const b = before[f];
    const a = after[f];
    if (b !== null && a !== null && b.toLowerCase() !== a.toLowerCase()) {
      changedIdentityFields.push(f);
    }
  }
  const structuralGains: string[] = [];
  if (before.definition === null && after.definition !== null) structuralGains.push("definition");
  if (after.gatesLen > before.gatesLen) structuralGains.push("gates");
  if (after.channelsLen > before.channelsLen) structuralGains.push("channels");
  if (after.centersDetermined > before.centersDetermined) structuralGains.push("centers");
  if (before.incarnationCrossName === null && after.incarnationCrossName !== null) structuralGains.push("incarnationCross.name");
  if (before.advancedStatus !== "COMPLETE" && after.advancedStatus === "COMPLETE") structuralGains.push("advancedVariables");

  return {
    identityChanged: changedIdentityFields.length > 0,
    changedIdentityFields,
    structuralGains,
    classification: changedIdentityFields.length > 0 ? "IDENTITY_CHANGE" as const : "STRUCTURAL_COMPLETION" as const,
  };
}

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
  const storedTimezone = userDoc?.timezone || userDoc?.profile?.timezone || null;
  const latitude = userDoc?.latitude ?? userDoc?.profile?.latitude ?? null;
  const longitude = userDoc?.longitude ?? userDoc?.profile?.longitude ?? null;
  const timezone = canonicalizeNatalTimezone({ storedTimezone, latitude, longitude }).timezone;

  if (birthDate && birthTime && birthCity && timezone) {
    return { birthDate, birthTime, birthCity, timezone, latitude, longitude };
  }
  return null;
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const isExecute = args.includes("--execute");
  const isDryRun = args.includes("--dry-run") || !isExecute;
  const allowIdentityChange = args.includes("--allow-identity-change");
  const fullFleetPreview = args.includes("--full-fleet-preview");

  let limit: number | null = null;
  let canary: number | null = null;
  let targetStateFilter: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit" && args[i + 1]) limit = parseInt(args[i + 1], 10);
    if (args[i] === "--canary" && args[i + 1]) canary = parseInt(args[i + 1], 10);
    if (args[i] === "--state" && args[i + 1]) targetStateFilter = args[i + 1].toUpperCase();
  }

  return { isExecute, isDryRun, limit, canary, targetStateFilter, allowIdentityChange, fullFleetPreview };
}

type PreviewClassification =
  | "ENGINE_FAILURE"
  | "NONCANONICAL_RESULT"
  | "IDENTITY_CHANGE"
  | "INCOMPLETE_AFTER_PREVIEW"
  | "NO_IMPROVEMENT"
  | "STRUCTURAL_COMPLETION";

/**
 * Classifies one candidate's read-only engine preview in priority order.
 * Exactly one bucket per candidate — used by both the bounded canary preview
 * and the full-fleet dry-run preview so the two reports are comparable.
 */
async function classifyPreviewOutcome(candidate: { birthProfile: any; beforeSnapshot: FieldSnapshot; coreStateBefore: HumanDesignCoreState }) {
  let data: any;
  try {
    data = await callEngine(candidate.birthProfile);
  } catch (e: any) {
    return { classification: "ENGINE_FAILURE" as PreviewClassification, error: e?.message || String(e) };
  }

  const freshChart = normalizeLiveHumanDesignResponse(data);
  if (!freshChart || !isCanonicalHumanDesign(freshChart)) {
    return { classification: "NONCANONICAL_RESULT" as PreviewClassification };
  }

  const after = fieldSnapshot(freshChart);
  const cmp = compareSnapshots(candidate.beforeSnapshot, after);
  if (cmp.classification === "IDENTITY_CHANGE") {
    return { classification: "IDENTITY_CHANGE" as PreviewClassification, changedIdentityFields: cmp.changedIdentityFields, freshChart };
  }

  const freshCompleteness = getHumanDesignCompleteness(freshChart);
  if (freshCompleteness.coreState === "CANONICAL_INCOMPLETE") {
    return { classification: "INCOMPLETE_AFTER_PREVIEW" as PreviewClassification, structuralGains: cmp.structuralGains, freshChart, freshCompleteness };
  }

  // Same "improves" bar mergeVerifiedHumanDesignChart enforces at write time,
  // so this preview and the actual --execute outcome cannot disagree.
  const improves = cmp.structuralGains.length > 0;
  if (!improves) {
    return { classification: "NO_IMPROVEMENT" as PreviewClassification, freshChart, freshCompleteness };
  }

  return { classification: "STRUCTURAL_COMPLETION" as PreviewClassification, structuralGains: cmp.structuralGains, freshChart, freshCompleteness };
}

async function runPreview(
  candidateList: { uid: string; birthProfile: any; currentHdState: string; coreStateBefore: HumanDesignCoreState; beforeSnapshot: FieldSnapshot }[],
  label: string,
) {
  console.log(`\n--- ${label} PREVIEW (${candidateList.length} candidates, engine called read-only, NOTHING WRITTEN) ---`);

  const classificationTally: Record<string, number> = {};
  const byOriginalState: Record<string, Record<string, number>> = {};
  const identityFieldTally: Record<string, number> = { type_changed: 0, strategy_changed: 0, authority_changed: 0, profile_changed: 0 };
  const fieldGainTally: Record<string, number> = {};
  const expectedPostStateTally: Record<string, number> = { CANONICAL_CORE_COMPLETE: 0, CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL: 0, CANONICAL_INCOMPLETE: 0, FAILED: 0 };
  let enrichmentFabricationSuspected = 0;
  let reflectorValidEmptyChannels = 0;

  const CONCURRENCY = 4;
  let processed = 0;
  for (let i = 0; i < candidateList.length; i += CONCURRENCY) {
    const batch = candidateList.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(async (candidate) => ({ candidate, outcome: await classifyPreviewOutcome(candidate) })));

    for (const { candidate, outcome } of results) {
      processed++;
      const origState = candidate.coreStateBefore;
      classificationTally[outcome.classification] = (classificationTally[outcome.classification] || 0) + 1;
      byOriginalState[origState] = byOriginalState[origState] || {};
      byOriginalState[origState][outcome.classification] = (byOriginalState[origState][outcome.classification] || 0) + 1;

      if (outcome.classification === "IDENTITY_CHANGE" && "changedIdentityFields" in outcome) {
        for (const f of outcome.changedIdentityFields!) {
          const key = `${f}_changed`;
          if (key in identityFieldTally) identityFieldTally[key]++;
        }
        expectedPostStateTally.FAILED++; // not written -> stays as-is, counted as not-recovered
      } else if (outcome.classification === "ENGINE_FAILURE" || outcome.classification === "NONCANONICAL_RESULT") {
        expectedPostStateTally.FAILED++;
      } else if (outcome.classification === "NO_IMPROVEMENT" || outcome.classification === "INCOMPLETE_AFTER_PREVIEW") {
        expectedPostStateTally.CANONICAL_INCOMPLETE++;
      } else if (outcome.classification === "STRUCTURAL_COMPLETION" && "freshCompleteness" in outcome && outcome.freshCompleteness) {
        expectedPostStateTally[outcome.freshCompleteness.coreState] = (expectedPostStateTally[outcome.freshCompleteness.coreState] || 0) + 1;
        for (const g of outcome.structuralGains || []) fieldGainTally[g] = (fieldGainTally[g] || 0) + 1;
        if (outcome.freshCompleteness.enrichment.status === "ENRICHMENT_COMPLETE" || outcome.freshCompleteness.enrichment.status === "ENRICHMENT_PARTIAL") {
          enrichmentFabricationSuspected++;
        }
        const fc = "freshChart" in outcome ? outcome.freshChart : null;
        if (fc && typeof fc.type === "string" && fc.type.trim().toLowerCase() === "reflector" && Array.isArray(fc.channels) && fc.channels.length === 0) {
          reflectorValidEmptyChannels++;
        }
      }
    }
    if (processed % 40 < CONCURRENCY) console.log(`  ...progress: ${processed}/${candidateList.length}`);
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\n--- ${label} AGGREGATE RESULT ---`);
  console.log(`TOTAL ELIGIBLE: ${candidateList.length}`);
  for (const key of ["STRUCTURAL_COMPLETION", "IDENTITY_CHANGE", "NO_IMPROVEMENT", "ENGINE_FAILURE", "NONCANONICAL_RESULT", "INCOMPLETE_AFTER_PREVIEW"]) {
    console.log(`${key}: ${classificationTally[key] || 0}`);
  }

  console.log(`\nBreakdown by original state:`);
  // coreStateBefore collapses hdState RETRIABLE_ERROR/TERMINAL_ERROR into a single
  // "ERROR" bucket (matching completeness.ts's contract) — under the default
  // candidate filter only RETRIABLE_ERROR ever reaches this list, so "ERROR" here
  // means RETRIABLE_ERROR specifically.
  for (const [origState, label] of [["CANONICAL_INCOMPLETE", "CANONICAL_INCOMPLETE"], ["FALLBACK", "FALLBACK"], ["ERROR", "RETRIABLE_ERROR"]] as const) {
    const row = byOriginalState[origState] || {};
    console.log(`  ${label}: total=${Object.values(row).reduce((a, b) => a + b, 0)} -> ${JSON.stringify(row)}`);
  }

  console.log(`\nIDENTITY_CHANGE field breakdown (aggregate counts only):`);
  for (const [k, v] of Object.entries(identityFieldTally)) console.log(`  ${k}: ${v}`);

  console.log(`\nExpected post-recovery states (if these candidates were executed as-is):`);
  for (const [k, v] of Object.entries(expectedPostStateTally)) console.log(`  ${k}: ${v}`);

  console.log(`\nField-level gains across STRUCTURAL_COMPLETION candidates (aggregate only):`);
  for (const [f, cnt] of Object.entries(fieldGainTally)) console.log(`  ${f}: ${cnt}`);

  console.log(`\nEnrichment independence check: ${enrichmentFabricationSuspected} STRUCTURAL_COMPLETION candidate(s) showed enrichment != ENGINE_UNSUPPORTED.`);
  console.log(`(Expected: 0, given the deployed engine still returns no activations/cross-gates as of this run. A`);
  console.log(`nonzero count here would mean the engine started returning enrichment data — worth a fresh check,`);
  console.log(`not evidence of fabrication, since nothing is invented client-side.)`);

  console.log(`\nREFLECTOR_VALID_EMPTY_CHANNELS: ${reflectorValidEmptyChannels}`);
  console.log(`(Type=Reflector, channels=[], 9/9 centers determined and open — verified valid per`);
  console.log(`getHumanDesignCompleteness()'s Reflector exemption, not fabricated, included within STRUCTURAL_COMPLETION above.)`);

  return { classificationTally, byOriginalState, identityFieldTally, expectedPostStateTally, fieldGainTally, reflectorValidEmptyChannels };
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

async function callEngine(bp: { birthDate: string; birthTime: string; birthCity: string; timezone: string; latitude: number | null; longitude: number | null }) {
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
  return data;
}

async function runMassRecovery() {
  const { isExecute, isDryRun, limit, canary, targetStateFilter, allowIdentityChange, fullFleetPreview } = parseCliArgs();

  console.log(`=== HUMAN DESIGN MASS RECOVERY SCRIPT ===`);
  console.log(`MODE: ${isExecute ? "🚨 EXECUTE PRODUCTION WRITE 🚨" : "🛡️ DRY-RUN (READ-ONLY) 🛡️"}`);
  if (canary) console.log(`CANARY LIMIT: ${canary} candidates`);
  if (limit) console.log(`COUNT LIMIT: ${limit} candidates`);
  console.log(`STATE FILTER: ${targetStateFilter || "DEFAULT (FALLBACK_LABELED/local_fallback + RETRIABLE_ERROR + CANONICAL_INCOMPLETE, PENDING EXCLUDED)"}`);
  console.log(`  Valid --state values: FALLBACK_LABELED | RETRIABLE_ERROR | PENDING | CANONICAL_INCOMPLETE`);
  if (isExecute) console.log(`ALLOW IDENTITY CHANGE WRITES: ${allowIdentityChange ? "YES (--allow-identity-change passed)" : "NO (identity-changed candidates will be skipped, not written)"}`);
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
  let candidateList: { uid: string; birthProfile: any; currentHdState: string; coreStateBefore: HumanDesignCoreState; beforeSnapshot: FieldSnapshot }[] = [];
  let skippedCanonical = 0;
  let skippedIncomplete = 0;
  let skippedExcludedPending = 0;
  const coreStateBeforeTally: Record<string, number> = {};

  for (const uid of allUids) {
    const userDoc = userDocsMap.get(uid) || {};
    const blueprintDoc = blueprintDocsMap.get(uid) || {};

    const hdPayload = blueprintDoc.humanDesign || userDoc.humanDesign;
    const hdResult = getHdState(hdPayload);
    // Structural check on top of hdState metadata: a CANONICAL (per hdState) record
    // can still have empty gates/channels/centers (CDI-108 finding). Only a
    // structurally settled record (CANONICAL_CORE_COMPLETE or
    // CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL) is skipped here; CANONICAL_INCOMPLETE
    // falls through and becomes a recovery candidate like any other non-canonical state.
    const completeness = hdResult.state === "CANONICAL" ? getHumanDesignCompleteness(hdPayload) : null;

    if (hdResult.state === "CANONICAL" && completeness && isStructurallySettled(completeness.coreState)) {
      skippedCanonical++;
      continue;
    }

    const birthProfile = getBirthProfile(userDoc);
    if (!birthProfile) {
      skippedIncomplete++;
      continue;
    }

    // Default target filter: FALLBACK_LABELED (local_fallback), RETRIABLE_ERROR, and
    // CANONICAL_INCOMPLETE (structurally incomplete despite hdState metadata saying CANONICAL).
    // PENDING is EXCLUDED by default unless --state PENDING is explicitly provided.
    if (targetStateFilter) {
      if (targetStateFilter === "CANONICAL_INCOMPLETE") {
        if (!completeness || completeness.coreState !== "CANONICAL_INCOMPLETE") continue;
      } else if (hdResult.state !== targetStateFilter) {
        continue;
      }
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
      // Require FALLBACK_LABELED(local_fallback), RETRIABLE_ERROR, or CANONICAL_INCOMPLETE
      if (hdResult.state === "FALLBACK_LABELED") {
        if (hdResult.provenance !== "local_fallback") continue;
      } else if (hdResult.state === "CANONICAL") {
        if (!completeness || completeness.coreState !== "CANONICAL_INCOMPLETE") continue;
      } else if (hdResult.state !== "RETRIABLE_ERROR") {
        continue;
      }
    }

    const coreStateBefore = completeness?.coreState ?? (hdResult.state === "FALLBACK_LABELED" ? "FALLBACK" : hdResult.state === "PENDING" ? "PENDING" : "ERROR") as HumanDesignCoreState;

    candidateList.push({
      uid,
      birthProfile,
      currentHdState: hdResult.state,
      coreStateBefore,
      beforeSnapshot: fieldSnapshot(hdPayload),
    });
  }

  // Apply Canary or Limit filters
  const effectiveLimit = canary ? Math.min(canary, limit || Infinity) : (limit || Infinity);
  if (Number.isFinite(effectiveLimit) && candidateList.length > effectiveLimit) {
    candidateList = candidateList.slice(0, effectiveLimit);
  }

  console.log(`\n--- CANDIDATE AUDIT SUMMARY (AGGREGATED, PRIVACY-SAFE) ---`);
  console.log(`Total Candidates Filtered for Recovery: ${candidateList.length}`);
  console.log(`  Skipped (Already CANONICAL_CORE_COMPLETE[_ADVANCED_PARTIAL]): ${skippedCanonical}`);
  console.log(`  Skipped (Incomplete Birth Data): ${skippedIncomplete}`);
  console.log(`  Skipped (Excluded PENDING): ${skippedExcludedPending}`);

  const breakdownByState: Record<string, number> = {};
  for (const c of candidateList) {
    breakdownByState[c.currentHdState] = (breakdownByState[c.currentHdState] || 0) + 1;
    coreStateBeforeTally[c.coreStateBefore] = (coreStateBeforeTally[c.coreStateBefore] || 0) + 1;
  }
  for (const [st, cnt] of Object.entries(breakdownByState)) {
    console.log(`  Filtered candidate state [${st}]: ${cnt}`);
  }

  console.log(`\n--- CORE STRUCTURAL COMPLETENESS BEFORE (getHumanDesignCompleteness) ---`);
  for (const [st, cnt] of Object.entries(coreStateBeforeTally)) {
    console.log(`  ${st}: ${cnt}`);
  }
  console.log(`NOTE: designActivations/personalityActivations/incarnationCross.gates/color/tone/base are an`);
  console.log(`independent ENRICHMENT dimension, currently unavailable from the deployed engine (verified`);
  console.log(`live — see completeness.ts doc comment). They no longer gate core completeness. Candidates`);
  console.log(`recovered here will gain gates/channels/centers/advanced-variables and reach`);
  console.log(`CANONICAL_CORE_COMPLETE[_ADVANCED_PARTIAL]; enrichment will remain ENGINE_UNSUPPORTED until`);
  console.log(`the engine deployment is fixed (separate workstream).`);

  console.log(`\n--- RECOVERY SAFEGUARDS & CIRCUIT BREAKER ---`);
  console.log(`Circuit Breaker Threshold: Triggered if success rate drops below 90% or 3 consecutive failures.`);
  console.log(`Idempotency: Checks structural completeness before write; skips if already structurally settled.`);
  console.log(`Identity Guard: Type/Strategy/Authority/Profile changes are flagged IDENTITY_CHANGE and, in`);
  console.log(`--execute mode, SKIPPED (not written) unless --allow-identity-change is explicitly passed.`);
  console.log(`Privacy Safeguard: Checkpoint saved with SHA-256 hashed UIDs only.`);

  // Dry-run preview: actually call the engine (read-only) and report real
  // classification + BEFORE -> AFTER field metrics. Bounded (--canary) or, with
  // --full-fleet-preview, across every eligible candidate. Skipped for a plain
  // unbounded dry-run (no flag) to avoid unintentionally hammering the engine.
  if (isDryRun && (canary || fullFleetPreview)) {
    await runPreview(candidateList, fullFleetPreview ? "FULL FLEET DRY-RUN" : "CANARY DRY-RUN");
  }

  if (isDryRun) {
    console.log(`\n[DRY-RUN COMPLETE] 0 documents updated. STOPPING.`);
    return;
  }

  // 4. EXECUTE MODE (only reached if --execute is passed)
  console.log(`\nStarting production batch execution for ${candidateList.length} candidates...`);

  let attemptedCount = 0;
  let successCount = 0;
  let failCount = 0;
  let consecutiveFailures = 0;
  const skipReasonTally: Record<string, number> = {};
  const checkpointLogs: { hashedUid: string; status: "success" | "skipped" | "fail"; reason?: string }[] = [];
  const coreStateAfterTally: Record<string, number> = {};

  const CONCURRENCY = 3;
  for (let i = 0; i < candidateList.length; i += CONCURRENCY) {
    const batch = candidateList.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (candidate) => {
        const hashedUid = hashUid(candidate.uid);

        // Classify first, EXACTLY like the dry-run preview (same function, same
        // engine call), so --execute can never write anything the preview
        // wouldn't have called STRUCTURAL_COMPLETION.
        const outcome = await classifyPreviewOutcome(candidate);
        if (outcome.classification !== "STRUCTURAL_COMPLETION" || !("freshChart" in outcome) || !outcome.freshChart) {
          return { kind: "skipped" as const, hashedUid, reason: outcome.classification };
        }

        try {
          const now = new Date().toISOString();
          const canonicalChart = { ...outcome.freshChart, generatedAt: now, updatedAt: now };

          const bpRef = db.collection("blueprints").doc(candidate.uid);
          const bpSnap = await bpRef.get();
          const existingBp = bpSnap.exists ? bpSnap.data() || {} : {};

          // HOTFIX (widened): last-write safety guard — a structurally settled chart
          // (CANONICAL_CORE_COMPLETE or CANONICAL_CORE_COMPLETE_ADVANCED_PARTIAL) must
          // never be overwritten. Re-read the latest document and abort on that race. A
          // CANONICAL_INCOMPLETE existing record (the exact bug this recovery targets)
          // is allowed through — that is the intended repair, not a guard violation.
          const existingCompleteness = existingBp?.humanDesign ? getHumanDesignCompleteness(existingBp.humanDesign) : null;
          if (existingCompleteness && isStructurallySettled(existingCompleteness.coreState)) {
            console.warn(`[HD WRITE GUARD] Structurally settled chart already exists (${existingCompleteness.coreState}). Skipping UID ${candidate.uid}.`);
            return { kind: "skipped" as const, hashedUid, reason: "ALREADY_SETTLED_RACE" };
          }

          // Identity guard, re-checked against the freshly re-read existing doc to
          // close the race between preview classification and write time.
          const beforeSnapshotFresh = fieldSnapshot(existingBp?.humanDesign);
          const afterSnapshot = fieldSnapshot(canonicalChart);
          const cmp = compareSnapshots(beforeSnapshotFresh, afterSnapshot);
          if (cmp.classification === "IDENTITY_CHANGE" && !allowIdentityChange) {
            console.warn(`[IDENTITY GUARD] IDENTITY_CHANGE on [${cmp.changedIdentityFields.join(", ")}] detected at write time (race). Skipping write.`);
            return { kind: "skipped" as const, hashedUid, reason: "IDENTITY_CHANGE_RACE" };
          }

          // Opt-in repair path: identity guard has already passed above (condition 4
          // of the merge contract), and the existing-record structural check just
          // above already confirmed it is not settled (condition 2).
          // mergeVerifiedHumanDesignChart independently re-verifies coreState and
          // requires a structural improvement (conditions 2/3/5) before allowing it.
          const mergedChart = mergeVerifiedHumanDesignChart(existingBp?.humanDesign, canonicalChart, {
            allowCanonicalIncompleteRepair: true,
          });
          if (!mergedChart) {
            return { kind: "skipped" as const, hashedUid, reason: "NO_IMPROVEMENT_RACE" };
          }

          const mergedCompleteness = getHumanDesignCompleteness(mergedChart);
          if (mergedCompleteness.coreState === "CANONICAL_INCOMPLETE") {
            // Defense in depth: never persist a record that is still structurally
            // incomplete, even if the pre-write preview said STRUCTURAL_COMPLETION.
            return { kind: "skipped" as const, hashedUid, reason: "INCOMPLETE_AFTER_PREVIEW_RACE" };
          }

          await bpRef.set({
            ...existingBp,
            uid: candidate.uid,
            humanDesign: mergedChart,
            updatedAt: now,
          }, { merge: true });

          return { kind: "success" as const, hashedUid, afterCoreState: mergedCompleteness.coreState };
        } catch (e) {
          return { kind: "fail" as const, hashedUid };
        }
      })
    );

    for (const r of results) {
      attemptedCount++;
      if (r.kind === "success") {
        successCount++;
        consecutiveFailures = 0;
        checkpointLogs.push({ hashedUid: r.hashedUid, status: "success" });
        coreStateAfterTally[r.afterCoreState] = (coreStateAfterTally[r.afterCoreState] || 0) + 1;
      } else if (r.kind === "skipped") {
        skipReasonTally[r.reason] = (skipReasonTally[r.reason] || 0) + 1;
        checkpointLogs.push({ hashedUid: r.hashedUid, status: "skipped", reason: r.reason });
      } else {
        failCount++;
        consecutiveFailures++;
        checkpointLogs.push({ hashedUid: r.hashedUid, status: "fail" });
      }
    }

    // Circuit Breaker check — keyed off genuine failures only; an intentional
    // skip (identity change, incomplete-after-preview, etc.) is the safety
    // guard working correctly, not a malfunction, so it never counts here.
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

  const skippedCount = Object.values(skipReasonTally).reduce((a, b) => a + b, 0);

  // Save hashed checkpoint
  const checkpointPath = "scripts/recovery-checkpoint.json";
  writeFileSync(checkpointPath, JSON.stringify({ timestamp: new Date().toISOString(), attemptedCount, successCount, skippedCount, failCount, skipReasonTally, logs: checkpointLogs }, null, 2));

  console.log(`\n=== BATCH EXECUTION SUMMARY ===`);
  console.log(`ATTEMPTED: ${attemptedCount}`);
  console.log(`WRITTEN: ${successCount}`);
  console.log(`SKIPPED: ${skippedCount}`);
  for (const [reason, cnt] of Object.entries(skipReasonTally)) console.log(`  - ${reason}: ${cnt}`);
  console.log(`FAILED: ${failCount}`);
  console.log(`Privacy Checkpoint saved: ${checkpointPath} (containing hashed UIDs only)`);

  console.log(`\n--- CORE STRUCTURAL COMPLETENESS: BEFORE -> AFTER ---`);
  console.log(`BEFORE (candidates):`);
  for (const [st, cnt] of Object.entries(coreStateBeforeTally)) console.log(`  ${st}: ${cnt}`);
  console.log(`AFTER (successful writes only):`);
  for (const [st, cnt] of Object.entries(coreStateAfterTally)) console.log(`  ${st}: ${cnt}`);
}

runMassRecovery().catch(console.error).finally(() => process.exit(0));
