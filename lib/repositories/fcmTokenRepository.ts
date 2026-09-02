/**
 * FCM Token Repository — canonical token persistence
 * Firestore: users/{uid}/fcmTokens/{tokenId}
 * Tokens are not mirrored to localStorage. Firestore is the owner-scoped source
 * of truth and persistence failures fail closed.
 */
import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import { debugFirestoreOperation } from "@/lib/firebase/debugFirestore";

export type FcmTokenRecord = {
  token: string;
  tokenId: string; // hash of token for doc id
  platform: "web" | "android" | "ios" | "unknown";
  createdAt: string;
  lastSeenAt: string;
  enabled: boolean;
  vapidKey?: string;
};

export function tokenIdFor(token: string): string {
  let h = 0;
  for (let i = 0; i < token.length; i++) h = Math.imul(31, h) + token.charCodeAt(i) | 0;
  return `tok_${Math.abs(h).toString(36)}`;
}

function assertOwner(uid: string): void {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error("FCM_TOKEN_OWNER_MISMATCH");
  }
}

function tokenCollection(uid: string) { return collection(db, "users", uid, "fcmTokens"); }
function tokenDoc(uid: string, tokenId: string) { return doc(db, "users", uid, "fcmTokens", tokenId); }

export const fcmTokenRepository = {
  async saveToken(uid: string, token: string, platform: FcmTokenRecord["platform"] = "web"): Promise<FcmTokenRecord> {
    assertOwner(uid);
    const tokenId = tokenIdFor(token);
    const now = new Date().toISOString();
    const record: FcmTokenRecord = {
      token,
      tokenId,
      platform,
      createdAt: now,
      lastSeenAt: now,
      enabled: true,
    };
    await debugFirestoreOperation(
      { operation: "setDoc", path: `users/${uid}/fcmTokens/${tokenId}`, uid },
      () => setDoc(tokenDoc(uid, tokenId), sanitizeForFirestore({ ...record, updatedAt: serverTimestamp() }), { merge: true })
    );
    return record;
  },

  async getTokens(uid: string): Promise<FcmTokenRecord[]> {
    assertOwner(uid);
    const snap = await debugFirestoreOperation(
      { operation: "getDocs", path: `users/${uid}/fcmTokens`, uid },
      () => getDocs(tokenCollection(uid))
    );
    return snap.docs.map(d => d.data() as FcmTokenRecord);
  },

  async invalidateToken(uid: string, token: string): Promise<void> {
    assertOwner(uid);
    const tokenId = tokenIdFor(token);
    await debugFirestoreOperation(
      { operation: "deleteDoc", path: `users/${uid}/fcmTokens/${tokenId}`, uid },
      () => deleteDoc(tokenDoc(uid, tokenId))
    );
  },

  async deleteAllForUser(uid: string): Promise<void> {
    assertOwner(uid);
    const tokens = await this.getTokens(uid);
    for (const token of tokens) {
      await debugFirestoreOperation(
        { operation: "deleteDoc", path: `users/${uid}/fcmTokens/${token.tokenId}`, uid },
        () => deleteDoc(tokenDoc(uid, token.tokenId))
      );
    }
  },
};
