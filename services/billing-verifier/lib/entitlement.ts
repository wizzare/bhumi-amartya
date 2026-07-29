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
    transaction.set(tokenRef, { uid, provider: "google_play", packageName: process.env.ANDROID_PACKAGE_NAME || "com.bhumiamartya.app", productId: process.env.GOOGLE_PLAY_PRODUCT_ID || "bhumi_premium_monthly", tokenHash: hash, subscriptionState: state, entitlementStatus: result.status, ackStatus: acknowledgementStatus, voidedCheck, accessUntil: until, lastVerifiedAt: now }, { merge: true });
    transaction.set(userRef, { plan: result.active ? "premium" : "free", membership: result.active ? "GOOGLE_PLAY_PREMIUM" : "GOOGLE_PLAY_INACTIVE", membershipType: result.active ? "PREMIUM" : "FREE", membershipExpiryDate: result.date ? Timestamp.fromDate(result.date) : null, accessUntil: until, subscriptionStatus: result.status, isPremium: result.active, badge: founder ? "Founder" : result.active ? "Penghuni Bhumi" : existing.badge || "Penjaga Bhumi", entitlementSource: "google_play", entitlementUpdatedAt: now, updatedBy: "vercel_google_play_verifier", updatedAt: now }, { merge: true });
  });
}

export async function markEntitlementAcknowledged(uid: string, purchaseToken: string) {
  const db = adminDb();
  const acknowledgedAt = new Date().toISOString();
  await db.runTransaction(async (transaction) => {
    const tokenRef = db.doc(`billing_purchase_tokens/${tokenHash(purchaseToken)}`);
    const userRef = db.doc(`users/${uid}`);
    transaction.set(tokenRef, { ackStatus: "ACKNOWLEDGED", acknowledgedAt }, { merge: true });
    transaction.set(userRef, { "purchase.acknowledgedByServer": true, "purchase.ackStatus": "ACKNOWLEDGED", "purchases.googlePlay.ackStatus": "ACKNOWLEDGED" }, { merge: true });
  });
}
