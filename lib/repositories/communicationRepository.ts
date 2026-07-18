import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
  collectionGroup
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import {
  CommunicationMessage,
  CommunicationStatus,
  CommunicationAnalytics,
} from "../types/communication";

/**
 * BHUMI V4 COMMUNICATION REPOSITORY
 * Phase E2 Persistence, Hardened in E4, Threaded in E6
 * Handles durable storage of communication objects in Firestore.
 */
export class CommunicationRepository {
  /**
   * Save a new message or update existing.
   * Always saves to the user-scoped collection to ensure consolidated history.
   */
  public static async save(message: CommunicationMessage): Promise<void> {
    const scopeUid = (message.uid !== 'admin' && message.uid !== 'bhumi')
      ? message.uid
      : message.senderUid;

    const payload = sanitizeForFirestore({
      ...message,
      updatedAt: serverTimestamp(),
    });

    try {
      const docRef = doc(db, "users", scopeUid, "communications", message.id);
      await setDoc(docRef, payload, { merge: true });
    } catch (error: any) {
      console.error("[CommunicationRepository] Save failed:", error);
      throw error;
    }
  }

  /**
   * Fetch active inbox for a user.
   */
  public static async getInbox(uid: string): Promise<CommunicationMessage[]> {
    try {
      const commsRef = collection(db, "users", uid, "communications");
      const q = query(
        commsRef,
        where("isArchived", "==", false),
        where("status", "!=", "expired"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      let messages = snapshot.docs.map(doc => doc.data() as CommunicationMessage);
      messages = messages.filter(m => !m.parentMessageId);

      return messages.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a.isRead ? 1 : -1;
      });
    } catch (error: any) {
      console.error("[CommunicationRepository] Error fetching inbox:", error);
      throw error;
    }
  }

  /**
   * Fetch a conversation thread.
   */
  public static async getThread(uid: string, threadId: string): Promise<CommunicationMessage[]> {
    try {
      const commsRef = collection(db, "users", uid, "communications");
      const q = query(
        commsRef,
        where("threadId", "==", threadId),
        orderBy("createdAt", "asc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as CommunicationMessage);
    } catch (error: any) {
      console.error("[CommunicationRepository] Error fetching thread:", error);
      throw error;
    }
  }

  /**
   * Update message status and metadata.
   */
  public static async updateStatus(scopeUid: string, messageId: string, status: CommunicationStatus, updates: Partial<CommunicationMessage> = {}): Promise<void> {
    const finalUpdates = sanitizeForFirestore({
      ...updates,
      status,
      updatedAt: serverTimestamp(),
    });

    if (status === 'opened' || status === 'clicked') {
      (finalUpdates as any).isRead = true;
    }
    if (status === 'archived') {
      (finalUpdates as any).isArchived = true;
    }
    if (status === 'dismissed') {
      (finalUpdates as any).isDismissed = true;
    }

    try {
      const docRef = doc(db, "users", scopeUid, "communications", messageId);
      await updateDoc(docRef, finalUpdates);
    } catch (error: any) {
      console.error("[CommunicationRepository] Update status failed:", error);
      throw error;
    }

    await this.trackEvent({
      messageId,
      uid: scopeUid,
      event: status as any,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track analytics event.
   */
  public static async trackEvent(event: CommunicationAnalytics): Promise<void> {
    try {
      const eventsRef = collection(db, "analytics", "communications", "events");
      const payload = sanitizeForFirestore({
        ...event,
        serverTimestamp: serverTimestamp(),
      });
      await addDoc(eventsRef, payload);
    } catch (error: any) {
      console.warn("[CommunicationRepository] Analytics track failed:", error);
    }
  }

  /**
   * Bulk mark as read.
   */
  public static async markAllAsRead(uid: string): Promise<void> {
    const inbox = await this.getInbox(uid);
    const unread = inbox.filter(m => !m.isRead);

    for (const msg of unread) {
      await this.updateStatus(uid, msg.id, msg.status, { isRead: true });
    }
  }

  /**
   * ADMIN: Fetch all user-initiated communications across all users.
   */
  public static async getAllUserCommunications(): Promise<CommunicationMessage[]> {
    try {
      const commsQuery = query(
        collectionGroup(db, "communications"),
        where("source", "==", "user"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(commsQuery);
      return snapshot.docs.map(doc => doc.data() as CommunicationMessage);
    } catch (error: any) {
      console.error("[CommunicationRepository] Admin getAll failed:", error);
      throw error;
    }
  }

  /**
   * Cleanup expired messages for a user.
   */
  public static async cleanupExpired(uid: string): Promise<void> {
    try {
      const commsRef = collection(db, "users", uid, "communications");
      const q = query(
        commsRef,
        where("status", "in", ["queued", "delivered", "opened", "clicked"]),
        where("expiresAt", "<=", new Date().toISOString())
      );
      const snapshot = await getDocs(q);
      for (const docSnapshot of snapshot.docs) {
        await this.updateStatus(uid, docSnapshot.id, "expired");
      }
    } catch (error: any) {
      console.error("[CommunicationRepository] Cleanup expired failed:", error);
    }
  }
}
