import { createMinimalProfile, evaluateBootstrap } from "./bootstrap-contract.mjs";

function assertUid(uid) {
  if (typeof uid !== "string" || !uid || uid.includes("/")) {
    throw Object.assign(new Error("QA_BOOTSTRAP_UID_INVALID"), { code: "QA_BOOTSTRAP_UID_INVALID" });
  }
}

function resolveNow(now) {
  return typeof now === "function" ? new Date(now()) : new Date(now);
}

function decisionResponse(decision) {
  if (decision.outcome === "PROVISIONED") {
    return {
      ok: true,
      outcome: decision.outcome,
      trialStartedAt: decision.trialStartedAt,
      trialEndsAt: decision.trialEndsAt,
    };
  }
  return decision;
}

export async function bootstrapTrialOnly({ db, uid, now = new Date() }) {
  assertUid(uid);
  const ref = db.doc(`users/${uid}`);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const data = snapshot.exists ? snapshot.data() || {} : {};
    const decision = evaluateBootstrap(data, resolveNow(now));
    if (decision.outcome === "PROVISIONED") {
      transaction.set(ref, decision.grant, { merge: true });
    }
    return decisionResponse(decision);
  });
}

export async function bootstrapFirstLogin({ db, uid, claims = {}, now = new Date() }) {
  assertUid(uid);
  const ref = db.doc(`users/${uid}`);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const decisionNow = resolveNow(now);
    if (!snapshot.exists) {
      const profile = createMinimalProfile({ uid, claims, now: decisionNow });
      const decision = evaluateBootstrap({}, decisionNow);
      transaction.set(ref, { ...profile, ...decision.grant });
      return {
        ok: true,
        outcome: "PROVISIONED_NEW_USER",
        trialStartedAt: decision.trialStartedAt,
        trialEndsAt: decision.trialEndsAt,
      };
    }
    const decision = evaluateBootstrap(snapshot.data() || {}, decisionNow);
    if (decision.outcome === "PROVISIONED") {
      transaction.set(ref, decision.grant, { merge: true });
      return {
        ok: true,
        outcome: "PROVISIONED_EXISTING_PROFILE",
        trialStartedAt: decision.trialStartedAt,
        trialEndsAt: decision.trialEndsAt,
      };
    }
    return decisionResponse(decision);
  });
}
