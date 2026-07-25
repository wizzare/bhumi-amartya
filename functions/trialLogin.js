"use strict";

/**
 * Records an interactive login transaction in Firestore.
 *
 * Writes a trial-login count to the user's Firestore document so the client
 * can evaluate trial status. The transaction is idempotent: duplicate calls
 * for the same user in rapid succession are safe.
 */

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {{ admin: any; uid: string; authTimeSeconds?: number; provider?: string; registrationHint?: boolean }} params
 * @returns {Promise<{ eventType: string; counted: boolean; trialLoginCount: number; idempotent: boolean }>}
 */
async function recordInteractiveLoginTransaction({ admin, uid, authTimeSeconds, provider, registrationHint }) {
  const db = admin.firestore();
  const now = new Date();

  const userRef = db.collection("users").doc(uid);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const data = snap.data() || {};

    const existingCount = typeof data.trialLoginCount === "number" ? data.trialLoginCount : 0;
    const lastLoginAt = data.lastLoginAt;
    const lastLoginMs = lastLoginAt
      ? (typeof lastLoginAt === "object" && typeof lastLoginAt.toDate === "function"
          ? lastLoginAt.toDate().getTime()
          : new Date(lastLoginAt).getTime())
      : 0;

    const elapsed = now.getTime() - lastLoginMs;
    const isSameSession = lastLoginMs > 0 && elapsed < SEVEN_DAYS_MS;

    const counted = !isSameSession;
    const newCount = counted ? existingCount + 1 : existingCount;

    tx.set(
      userRef,
      {
        lastLoginAt: now,
        lastInteractiveLoginAt: now,
        trialLoginCount: newCount,
        authTimeSeconds: authTimeSeconds || null,
        loginProvider: provider || null,
      },
      { merge: true }
    );

    return {
      eventType: counted ? "LOGIN_COUNTED" : "LOGIN_SKIPPED",
      counted,
      trialLoginCount: newCount,
      idempotent: !counted,
    };
  });

  return result;
}

module.exports = { recordInteractiveLoginTransaction };
