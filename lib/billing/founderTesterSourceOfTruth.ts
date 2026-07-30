import { db } from "../firebase/firebase";
import { doc, documentId, getDoc, getDocs, query, where, collection } from "firebase/firestore";
import {
  DEFAULT_USER_POLICY_EFFECTIVE_AT,
  type FounderTesterBadge,
  type FounderTesterMembership,
  type ServerOwnedAccessGrant,
} from "./registrationPolicy";

export type { FounderTesterBadge, FounderTesterMembership, ServerOwnedAccessGrant };

export type FounderTesterRecord = {
  uid: string;
  registeredAt: string;
  activeDays: number;
  badge: FounderTesterBadge;
  sourceBadge: "Founder" | "Inti" | "Alfa" | "Penjaga Bhumi";
  membership: FounderTesterMembership;
  premiumMonths: number | null;
  trialDays: number | null;
};

const TESTER_BADGE_REGISTRY_COLLECTION = "testerBadgeRegistry";

function recordFromDoc(uid: string, data: Record<string, unknown>): FounderTesterRecord {
  return {
    uid,
    registeredAt: String(data.registeredAt || ""),
    activeDays: typeof data.activeDays === "number" ? data.activeDays : 0,
    badge: data.badge as FounderTesterBadge,
    sourceBadge: data.sourceBadge as FounderTesterRecord["sourceBadge"],
    membership: data.membership as FounderTesterMembership,
    premiumMonths: typeof data.premiumMonths === "number" ? data.premiumMonths : null,
    trialDays: typeof data.trialDays === "number" ? data.trialDays : null,
  };
}

/**
 * Single-document Firestore lookup, keyed by uid. Replaces the previous
 * hardcoded-array + uid/email/name fallback matching.
 */
export async function getFounderTesterRecord(uid?: string | null): Promise<FounderTesterRecord | null> {
  const trimmedUid = (uid || "").trim();
  if (!trimmedUid) return null;
  const snap = await getDoc(doc(db, TESTER_BADGE_REGISTRY_COLLECTION, trimmedUid));
  if (!snap.exists()) return null;
  return recordFromDoc(trimmedUid, snap.data());
}

/**
 * Batched lookup for admin views that render many users at once — avoids one
 * Firestore round trip per row. Firestore's `in` operator is capped at 30
 * values per query, so uids are chunked.
 */
export async function getFounderTesterRecordsByUids(uids: string[]): Promise<Map<string, FounderTesterRecord>> {
  const result = new Map<string, FounderTesterRecord>();
  const distinctUids = Array.from(new Set(uids.map((u) => (u || "").trim()).filter(Boolean)));
  const CHUNK_SIZE = 30;
  for (let i = 0; i < distinctUids.length; i += CHUNK_SIZE) {
    const chunk = distinctUids.slice(i, i + CHUNK_SIZE);
    const snap = await getDocs(
      query(collection(db, TESTER_BADGE_REGISTRY_COLLECTION), where(documentId(), "in", chunk)),
    );
    snap.forEach((docSnap) => {
      result.set(docSnap.id, recordFromDoc(docSnap.id, docSnap.data()));
    });
  }
  return result;
}

export const INTI_GRANT_STARTS_AT = "2026-06-29T00:00:00+07:00";
export const INTI_ACCESS_UNTIL = "2026-08-30T00:00:00+07:00";

export const ALFA_GRANT_STARTS_AT = "2026-06-29T00:00:00+07:00";
export const ALFA_ACCESS_UNTIL = "2026-07-30T00:00:00+07:00";

export function buildServerOwnedAccessGrant(
  record: FounderTesterRecord,
  now: Date = new Date(),
): ServerOwnedAccessGrant {
  if (record.badge === "Founder") {
    return {
      badge: "Founder",
      plan: "lifetime_free",
      membership: "LIFETIME_PREMIUM",
      membershipType: "LIFETIME",
      accessStart: DEFAULT_USER_POLICY_EFFECTIVE_AT.toISOString(),
      accessUntil: null,
      subscriptionStatus: "active",
      isPremium: true,
      entitlements: { dashboard: true, premiumFeatures: true },
    };
  }

  const isInti = record.badge === "Penjaga Bhumi Inti" || record.sourceBadge === "Inti";
  const startStr = isInti ? INTI_GRANT_STARTS_AT : ALFA_GRANT_STARTS_AT;
  const untilStr = isInti ? INTI_ACCESS_UNTIL : ALFA_ACCESS_UNTIL;

  const startDate = new Date(startStr);
  const untilDate = new Date(untilStr);
  const isActive = now >= startDate && now < untilDate;

  return {
    badge: record.badge,
    plan: "free_access",
    membership: record.membership,
    membershipType: "PREMIUM",
    accessStart: startDate.toISOString(),
    accessUntil: untilDate.toISOString(),
    subscriptionStatus: isActive ? "active" : "expired",
    isPremium: isActive,
    entitlements: { dashboard: true, premiumFeatures: isActive },
  };
}
