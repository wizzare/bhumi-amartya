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
  collectionGroup,
  getDoc,
  limit
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
  private static normalizeAdminMessage(raw: Record<string, any>, id: string): CommunicationMessage {
    const iso = (value: any) => {
      if (value && typeof value.toDate === "function") return value.toDate().toISOString();
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" && value) return value;
      return new Date(0).toISOString();
    };
    return {
      id,
      uid: typeof raw.uid === "string" ? raw.uid : "admin",
      senderUid: typeof raw.senderUid === "string" ? raw.senderUid : "unknown",
      senderName: typeof raw.senderName === "string" ? raw.senderName : undefined,
      type: raw.type || "user-message",
      priority: raw.priority || "normal",
      title: typeof raw.title === "string" ? raw.title : "Pesan pengguna",
      summary: typeof raw.summary === "string" ? raw.summary : "",
      content: typeof raw.content === "string" ? raw.content : "",
      createdAt: iso(raw.createdAt),
      updatedAt: iso(raw.updatedAt || raw.createdAt),
      status: raw.status || "queued",
      source: raw.source || "user",
      threadId: typeof raw.threadId === "string" ? raw.threadId : id,
      isRead: raw.isRead === true,
      isArchived: raw.isArchived === true,
      isDismissed: raw.isDismissed === true,
      deliveryChannels: Array.isArray(raw.deliveryChannels) ? raw.deliveryChannels : ["inbox"],
      deliveryAttempts: typeof raw.deliveryAttempts === "number" ? raw.deliveryAttempts : 0,
      ownerUserId: typeof raw.ownerUserId === "string" ? raw.ownerUserId : undefined,
      senderRole: raw.senderRole,
      recipientRole: raw.recipientRole,
      metadata: raw.metadata,
    } as CommunicationMessage;
  }
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
        orderBy("createdAt", "desc"),
        limit(200)
      );

      const snapshot = await getDocs(q);
      let messages = snapshot.docs.map(doc => doc.data() as CommunicationMessage);
      
      // Filter out archived and expired messages in memory
      messages = messages.filter(
        (m) => !m.isArchived && m.status !== "expired"
      );

      const safeTime = (msg: CommunicationMessage) => {
        if (!msg.createdAt) return 0;
        const t = new Date(msg.createdAt).getTime();
        return Number.isFinite(t) ? t : 0;
      };

      return messages.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return safeTime(b) - safeTime(a);
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
        limit(200)
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => doc.data() as CommunicationMessage);
      
      const safeTime = (msg: CommunicationMessage) => {
        if (!msg.createdAt) return 0;
        const t = new Date(msg.createdAt).getTime();
        return Number.isFinite(t) ? t : 0;
      };

      return messages.sort((a, b) => safeTime(a) - safeTime(b));
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
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(commsQuery);
      const messages = snapshot.docs
        .map((entry) => CommunicationRepository.normalizeAdminMessage(entry.data(), entry.id))
        .filter((message) => message.source === "user");
      const ownerIds = [...new Set(messages.map((message) => message.ownerUserId || message.uid).filter((uid) => uid && uid !== "admin" && uid !== "bhumi"))];
      const profiles = await Promise.all(ownerIds.map(async (uid) => {
        try {
          const profile = await getDoc(doc(db, "users", uid));
          if (!profile.exists()) return [uid, undefined] as const;
          const data = profile.data() as Record<string, any>;
          const candidates = [data.fullName, data.displayName, data.name, data.nama, data.profile?.fullName, data.profile?.displayName, data.profile?.name];
          const name = candidates.find((value) => typeof value === "string" && value.trim())?.trim();
          return [uid, name] as const;
        } catch {
          return [uid, undefined] as const;
        }
      }));
      const names = new Map(profiles);
      return messages.map((message) => ({
        ...message,
        senderName: names.get(message.ownerUserId || message.uid) || message.senderName || message.metadata?.userName || undefined,
      }));
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
