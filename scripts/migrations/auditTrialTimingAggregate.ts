import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

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

  let inWindow = 0;
  let hasTrialFields = 0;
  let trialWindowTooShort = 0; // less than 6 days duration
  let trialWindowTooLong = 0; // more than 8 days duration
  let expiredButRecentlyRegistered = 0; // trialEndsAt already passed, but registered <= 3 days ago
  let planExpiredButTrialEndsAtFuture = 0; // plan/trialStatus says expired/free but trialEndsAt is still in the future (premature cutoff bug)
  let planActiveButTrialEndsAtPast = 0; // plan says active but trialEndsAt already passed (should have been cut off, wasn't)
  const durationSamples: number[] = [];

  usersSnap.forEach((doc) => {
    const data = doc.data();
    const regMs = registeredAtMs(data);
    if (regMs < windowStartMs) return;
    inWindow++;

    const trialStartedMs = toMs(data.trialStartedAt) || regMs;
    const trialEndsMs = toMs(data.trialEndsAt);
    if (!trialEndsMs) return;
    hasTrialFields++;

    const durationDays = (trialEndsMs - trialStartedMs) / (1000 * 60 * 60 * 24);
    durationSamples.push(Math.round(durationDays * 10) / 10);
    if (durationDays < 6) trialWindowTooShort++;
    if (durationDays > 8) trialWindowTooLong++;

    const daysSinceReg = (now - regMs) / (1000 * 60 * 60 * 24);
    const trialEndsPassed = trialEndsMs < now;

    if (trialEndsPassed && daysSinceReg <= 3) expiredButRecentlyRegistered++;

    const normalizedPlan = String(data.plan || "").toLowerCase();
    const trialStatus = String(data.trialStatus || "").toLowerCase();
    const looksExpiredByPlan = normalizedPlan === "expired" || normalizedPlan === "free" || trialStatus === "free";

    if (looksExpiredByPlan && !trialEndsPassed) planExpiredButTrialEndsAtFuture++;
    if (!looksExpiredByPlan && trialEndsPassed) planActiveButTrialEndsAtPast++;
  });

  console.log(`=== TRIAL TIMING AUDIT (time-based fields): users registered in last ${WINDOW_DAYS} days ===`);
  console.log(`Users in window: ${inWindow}`);
  console.log(`Users with trialEndsAt field present: ${hasTrialFields}`);
  console.log("");
  console.log(`Trial window duration < 6 days (too short): ${trialWindowTooShort}`);
  console.log(`Trial window duration > 8 days (too long): ${trialWindowTooLong}`);
  console.log(`Duration samples (days, first 20): ${durationSamples.slice(0, 20).join(", ")}`);
  console.log("");
  console.log(`Trial already time-expired but registered <= 3 days ago (suspiciously fast expiry): ${expiredButRecentlyRegistered}`);
  console.log(`plan/trialStatus shows expired/free but trialEndsAt is still in the FUTURE (premature cutoff bug): ${planExpiredButTrialEndsAtFuture}`);
  console.log(`plan/trialStatus shows still-active but trialEndsAt already PASSED (stale/not-enforced bug): ${planActiveButTrialEndsAtPast}`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
