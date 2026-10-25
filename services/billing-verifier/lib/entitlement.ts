import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "./firebaseAdmin";
import { tokenHash } from "./security";

const activeStates = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD"]);
type VoidedPurchaseCheck = {
  checked: boolean;
  voided: boolean;
  reason: string;
};

type AcknowledgementStatus = "ACK_PENDING" | "ACKNOWLEDGED" | "NOT_REQUIRED";

export function decision(state: string, expiry?: string, options: { voided?: boolean } = {}) {
  const date = expiry ? new Date(expiry) : null;
  const future = Boolean(date && !Number.isNaN(date.getTime()) && date.getTime() > Date.now());
  if (options.voided) return { active: false, status: "VOIDED", date };
  if (activeStates.has(state) && future) return { active: true, status: state === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD" ? "GRACE_PERIOD" : "ACTIVE", date };
  if (state === "SUBSCRIPTION_STATE_CANCELED" && future) return { active: true, status: "CANCELED_PAID_THROUGH", date };
  if (state === "SUBSCRIPTION_STATE_PENDING" || state === "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED") return { active: false, status: "SUBSCRIPTION_PENDING", date };
  return { active: false, status: future ? "SUBSCRIPTION_INACTIVE" : "EXPIRED", date };
}

export async function persistEntitlement(
  uid: string,
  purchaseToken: string,
  state: string,
  result: ReturnType<typeof decision>,
  acknowledgementStatus: AcknowledgementStatus,
  voidedCheck: VoidedPurchaseCheck,
) {
  const db = adminDb();
  const hash = tokenHash(purchaseToken);
  const now = new Date().toISOString();
  const until = result.date && !Number.isNaN(result.date.getTime()) ? result.date.toISOString() : null;
  await db.runTransaction(async (transaction) => {
    const tokenRef = db.doc(`billing_purchase_tokens/${hash}`);
    const userRef = db.doc(`users/${uid}`);
    const tokenSnap = await transaction.get(tokenRef);
    const existingToken = tokenSnap.exists ? tokenSnap.data() || {} : {};
    if (existingToken.uid && existingToken.uid !== uid) throw new Error("TOKEN_OWNERSHIP_CONFLICT");
    const userSnap = await transaction.get(userRef);
    const existing = userSnap.exists ? userSnap.data() || {} : {};
    const founder = existing.badge === "Founder" || existing.testerBadge === "Founder";
    
    // Check if the user already has an active, non-expired paid subscription
    const existingExpiry = existing.membershipExpiryDate && typeof (existing.membershipExpiryDate as any).toDate === "function"
      ? (existing.membershipExpiryDate as any).toDate()
      : existing.accessUntil
        ? new Date(String(existing.accessUntil))
        : null;
    const hasActiveFuturePaid = Boolean(
      existing.isPremium === true &&
      existing.membershipType === "PREMIUM" &&
      existingExpiry &&
      !Number.isNaN(existingExpiry.getTime()) &&
      existingExpiry.getTime() > Date.now()
    );

    // A stale older token (expired, voided, without date, or not the authoritative active token)
    // must NEVER overwrite or downgrade the user's active future entitlement.
    // However, if this token IS the authoritative active token (or a legacy account without
    // activeTokenHash being refunded), it is NOT stale and must be processed.
    const isAuthoritativeActiveToken = Boolean(
      existing.activeTokenHash
        ? existing.activeTokenHash === hash
        : (result.status === "VOIDED" || voidedCheck.voided)
    );

    const isStaleOlderToken = Boolean(
      !result.active &&
      hasActiveFuturePaid &&
      !isAuthoritativeActiveToken &&
      (
        (existing.activeTokenHash && existing.activeTokenHash !== hash) ||
        !result.date ||
        (existingExpiry && result.date.getTime() < existingExpiry.getTime())
      )
    );

    // Transaction Phase 1: All Reads Must Precede All Writes
    // If the authoritative active token is deactivated or refunded,
    // query billing_purchase_tokens to check if this user has another valid active token.
    type AlternativeTokenInfo = {
      tokenHash: string;
      accessUntil: string;
      status: string;
      date: Date;
    };
    let alternativeToken: AlternativeTokenInfo | null = null;

    if (!result.active && isAuthoritativeActiveToken && typeof (db as any).collection === "function") {
      // NOTE: Do not swallow errors here. If the query fails or times out, the error
      // must bubble up to abort the transaction cleanly without committing any partial
      // writes or falsely downgrading users/{uid} on transient infrastructure errors.
      const tokensQuery = (db as any).collection("billing_purchase_tokens").where("uid", "==", uid);
      const querySnap = await transaction.get(tokensQuery);
      const nowMs = Date.now();
      let latestAlternativeDate: Date | null = null;

      if (querySnap && typeof querySnap.forEach === "function") {
        querySnap.forEach((docSnap: any) => {
          const data = (typeof docSnap.data === "function" ? docSnap.data() : docSnap.data) || {};
          if (data.tokenHash === hash) return; // skip this token being revoked
          if (data.voidedCheck?.voided) return;
          const isActiveStatus =
            data.entitlementStatus === "ACTIVE" ||
            data.entitlementStatus === "GRACE_PERIOD" ||
            data.entitlementStatus === "CANCELED_PAID_THROUGH";
          if (!isActiveStatus) return;
          if (!data.accessUntil) return;
          const tokenUntil = new Date(data.accessUntil);
          if (Number.isNaN(tokenUntil.getTime()) || tokenUntil.getTime() <= nowMs) return;
          // Validate lastVerifiedAt if present (reject candidate if malformed)
          if (data.lastVerifiedAt) {
            const verifiedDate = new Date(data.lastVerifiedAt);
            if (Number.isNaN(verifiedDate.getTime())) return;
          }
          if (!latestAlternativeDate || tokenUntil.getTime() > latestAlternativeDate.getTime()) {
            latestAlternativeDate = tokenUntil;
            alternativeToken = {
              tokenHash: data.tokenHash,
              accessUntil: data.accessUntil,
              status: data.entitlementStatus,
              date: tokenUntil,
            };
          }
        });
      }
    }

    // Transaction Phase 2: Transaction Writes (Only after all reads have completed)
    // Record token ownership unconditionally in billing_purchase_tokens
    transaction.set(tokenRef, { uid, provider: "google_play", packageName: process.env.ANDROID_PACKAGE_NAME || "com.bhumiamartya.app", productId: process.env.GOOGLE_PLAY_PRODUCT_ID || "bhumi_premium_monthly", tokenHash: hash, subscriptionState: state, entitlementStatus: result.status, ackStatus: acknowledgementStatus, voidedCheck, accessUntil: until, lastVerifiedAt: now }, { merge: true });

    // Invariants:
    // 1. Founder and Lifetime never downgrade under any subscription outcome.
    // 2. An older/expired/voided token with earlier date must not downgrade a currently active future subscription.
    if (existing.membershipType === "LIFETIME" || founder || isStaleOlderToken) return;

    // Check if existing active subscription provides a strictly later expiry date
    const existingProvidesLaterExpiry = Boolean(
      result.active &&
      existing.activeTokenHash &&
      existingExpiry &&
      result.date &&
      existingExpiry.getTime() > result.date.getTime()
    );

    const alt = alternativeToken as AlternativeTokenInfo | null;

    // Determine effective entitlement state (considering alternative active token fallback)
    const effectiveActive = result.active || Boolean(alt);
    const effectiveStatus = result.active
      ? result.status
      : alt
        ? alt.status
        : result.status;
    const effectiveDate = result.active
      ? (existingProvidesLaterExpiry ? existingExpiry : result.date)
      : alt
        ? alt.date
        : null;
    const effectiveUntil = effectiveDate && !Number.isNaN(effectiveDate.getTime())
      ? effectiveDate.toISOString()
      : null;

    const newActiveTokenHash = result.active
      ? (existingProvidesLaterExpiry ? existing.activeTokenHash : hash)
      : alt
        ? alt.tokenHash
        : (existing.activeTokenHash === hash ? null : existing.activeTokenHash || null);

    const isTesterBadge = existing.badge === "Penjaga Bhumi Inti" ||
      existing.badge === "Penjaga Bhumi Alfa" ||
      existing.testerBadge === "Penjaga Bhumi Inti" ||
      existing.testerBadge === "Penjaga Bhumi Alfa";

    transaction.set(userRef, {
      plan: effectiveActive ? "premium" : "free",
      membership: effectiveActive ? "GOOGLE_PLAY_PREMIUM" : "GOOGLE_PLAY_INACTIVE",
      membershipType: effectiveActive ? "PREMIUM" : "FREE",
      membershipExpiryDate: effectiveDate ? Timestamp.fromDate(effectiveDate) : null,
      accessUntil: effectiveUntil,
      subscriptionStatus: effectiveStatus,
      isPremium: effectiveActive,
      activeTokenHash: newActiveTokenHash,
      badge: founder ? "Founder" : isTesterBadge ? (existing.badge || existing.testerBadge) : effectiveActive ? "Penghuni Bhumi" : existing.badge || "Penjaga Bhumi",
      entitlementSource: "google_play",
      entitlementUpdatedAt: now,
      updatedBy: "vercel_google_play_verifier",
      updatedAt: now,
    }, { merge: true });
  });
}

export async function markEntitlementAcknowledged(uid: string, purchaseToken: string) {
  const db = adminDb();
  const acknowledgedAt = new Date().toISOString();
  await db.runTransaction(async (transaction) => {
    const tokenRef = db.doc(`billing_purchase_tokens/${tokenHash(purchaseToken)}`);
    const userRef = db.doc(`users/${uid}`);
    const tokenSnap = await transaction.get(tokenRef);
    if (!tokenSnap.exists || tokenSnap.data()?.uid !== uid) throw new Error("TOKEN_OWNERSHIP_CONFLICT");
    transaction.set(tokenRef, { ackStatus: "ACKNOWLEDGED", acknowledgedAt }, { merge: true });
    transaction.set(userRef, { "purchase.acknowledgedByServer": true, "purchase.ackStatus": "ACKNOWLEDGED", "purchases.googlePlay.ackStatus": "ACKNOWLEDGED" }, { merge: true });
  });
}
