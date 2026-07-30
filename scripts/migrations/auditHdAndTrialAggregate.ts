import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { getHdState } from "../../lib/humandesign/hdState";

const sa = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
if (!getApps().length) initializeApp({ credential: cert(sa), projectId: sa.project_id });
const db = getFirestore();

const WINDOW_DAYS = Number(process.argv[2] || 30);
const now = Date.now();
const windowStartMs = now - WINDOW_DAYS * 24 * 60 * 60 * 1000;

function toMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === "string" || typeof value === "number") {
    const t = new Date(value).getTime();
    return Number.isFinite(t) ? t : 0;
  }
  if (typeof value === "object" && value !== null) {
    const v = value as any;
    if (typeof v.toMillis === "function") return v.toMillis();
    if (typeof v.seconds === "number") return v.seconds * 1000;
  }
  return 0;
}

function registeredAtMs(u: Record<string, unknown>): number {
  const candidates = [
    toMs(u.createdAt),
    toMs(u.registeredAt),
    toMs(u.joinedAt),
    toMs((u.participationMetrics as any)?.firstLoginAt),
  ].filter((n) => n > 0);
  return candidates.length ? Math.min(...candidates) : 0;
}

async function main() {
  const usersSnap = await db.collection("users").get();
  const recentUsers: Array<{ uid: string; regMs: number; data: Record<string, unknown> }> = [];

  usersSnap.forEach((doc) => {
    const data = doc.data();
    const regMs = registeredAtMs(data);
    if (regMs >= windowStartMs) {
      recentUsers.push({ uid: doc.id, regMs, data });
    }
  });

  console.log(`=== AGGREGATE AUDIT: users registered in last ${WINDOW_DAYS} days ===`);
  console.log(`Total users in collection: ${usersSnap.size}`);
  console.log(`Users matching window (registeredAt >= ${new Date(windowStartMs).toISOString()}): ${recentUsers.length}`);
  console.log("");

  const hdCounts: Record<string, number> = {
    CANONICAL: 0,
    FALLBACK_LABELED_historical: 0,
    FALLBACK_LABELED_local_fallback: 0,
    PENDING: 0,
    RETRIABLE_ERROR: 0,
    TERMINAL_ERROR: 0,
    no_blueprint_doc: 0,
  };

  let trialExhaustedFast = 0; // loginCount > 7 within a small number of days of registering
  let trialExhaustedFastDaysList: number[] = [];
  let totalWithTrialData = 0;

  for (const u of recentUsers) {
    const bpDoc = await db.collection("blueprints").doc(u.uid).get();
    if (!bpDoc.exists) {
      hdCounts.no_blueprint_doc++;
    } else {
      const bp = bpDoc.data() || {};
      const hdState = getHdState(bp.humanDesign);
      if (hdState.state === "FALLBACK_LABELED") {
        hdCounts[`FALLBACK_LABELED_${hdState.provenance}`] = (hdCounts[`FALLBACK_LABELED_${hdState.provenance}`] || 0) + 1;
      } else {
        hdCounts[hdState.state] = (hdCounts[hdState.state] || 0) + 1;
      }
    }

    // Trial timing check
    const profile = u.data;
    const loginCount = typeof profile.trialLoginCount === "number" ? profile.trialLoginCount : (profile.setupCompleted ? 1 : 0);
    const normalizedPlan = String(profile.plan || "").toLowerCase();
    const isExplicitFree = profile.trialStatus === "free" || normalizedPlan === "free" || normalizedPlan === "expired";
    const isExhausted = loginCount > 7 && !isExplicitFree;
    const daysSinceReg = u.regMs ? (now - u.regMs) / (1000 * 60 * 60 * 24) : null;

    if (typeof profile.trialLoginCount === "number") totalWithTrialData++;

    if (isExhausted && daysSinceReg !== null && daysSinceReg <= 3) {
      trialExhaustedFast++;
      trialExhaustedFastDaysList.push(Math.round(daysSinceReg * 10) / 10);
    }
  }

  const total = recentUsers.length || 1;
  console.log("=== HD STATE DISTRIBUTION (aggregate, no individual identifiers) ===");
  Object.entries(hdCounts).forEach(([k, v]) => {
    console.log(`  ${k}: ${v} (${((v / total) * 100).toFixed(1)}%)`);
  });

  console.log("");
  console.log("=== TRIAL TIMING CHECK ===");
  console.log(`Users with trialLoginCount field present: ${totalWithTrialData}`);
  console.log(`Users exhausted (loginCount > 7) AND registered <= 3 days ago: ${trialExhaustedFast} (${((trialExhaustedFast / total) * 100).toFixed(1)}% of window population)`);
  if (trialExhaustedFastDaysList.length) {
    console.log(`Days-since-registration for these fast-exhausted users (sample, no identifiers): ${trialExhaustedFastDaysList.slice(0, 20).join(", ")}`);
  }
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
