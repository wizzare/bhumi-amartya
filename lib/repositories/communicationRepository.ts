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
  public static normalizeCommunicationMessage(raw: Record<string, any>, id: string): CommunicationMessage {
    const iso = (value: any) => {
      if (!value) return new Date(0).toISOString();
      if (typeof value.toDate === "function") {
        try { return value.toDate().toISOString(); } catch { return new Date(0).toISOString(); }
      }
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" && value) return value;
      if (typeof value === "number" && Number.isFinite(value)) return new Date(value).toISOString();
      if (typeof value === "object" && typeof value.seconds === "number") {
        return new Date(value.seconds * 1000).toISOString();
      }
      return new Date(0).toISOString();
    };

    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : id,
      uid: typeof raw.uid === "string" ? raw.uid : "user",
      senderUid: typeof raw.senderUid === "string" ? raw.senderUid : "bhumi",
      senderName: typeof raw.senderName === "string" ? raw.senderName : undefined,
      type: raw.type || "user-message",
      priority: raw.priority || "normal",
      source: raw.source || "system",
      title: typeof raw.title === "string" && raw.title ? raw.title : "Pesan",
      summary: typeof raw.summary === "string" ? raw.summary : (typeof raw.content === "string" ? raw.content.substring(0, 100) : ""),
      content: typeof raw.content === "string" ? raw.content : (typeof raw.summary === "string" ? raw.summary : ""),
      createdAt: iso(raw.createdAt),
      updatedAt: iso(raw.updatedAt || raw.createdAt),
      expiresAt: raw.expiresAt ? iso(raw.expiresAt) : undefined,
      status: raw.status || "delivered",
      action: typeof raw.action === "string" ? raw.action : undefined,
      deepLink: typeof raw.deepLink === "string" ? raw.deepLink : undefined,
      threadId: typeof raw.threadId === "string" && raw.threadId ? raw.threadId : id,
      parentMessageId: typeof raw.parentMessageId === "string" ? raw.parentMessageId : undefined,
      metadata: typeof raw.metadata === "object" && raw.metadata !== null ? raw.metadata : undefined,
      ownerUserId: typeof raw.ownerUserId === "string" ? raw.ownerUserId : undefined,
      senderRole: raw.senderRole,
      recipientRole: raw.recipientRole,
      category: raw.category,
      isRead: raw.isRead === true || raw.status === "opened" || raw.status === "clicked",
      isArchived: raw.isArchived === true || raw.status === "archived",
      isDismissed: raw.isDismissed === true || raw.status === "dismissed",
      deliveryChannels: Array.isArray(raw.deliveryChannels) ? raw.deliveryChannels : ["inbox"],
      deliveryAttempts: typeof raw.deliveryAttempts === "number" ? raw.deliveryAttempts : 0,
    } as CommunicationMessage;
  }

  private static normalizeAdminMessage(raw: Record<string, any>, id: string): CommunicationMessage {
    return this.normalizeCommunicationMessage(raw, id);
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
    const stage = (label: string) => {
      if (process.env.NODE_ENV === "development") console.debug(`[InboxStage] ${label}`);
    };
    stage("QUERY_STARTED");
    try {
      const commsRef = collection(db, "users", uid, "communications");
      stage("QUERY_CREATED");
      const q = query(
        commsRef,
        orderBy("createdAt", "desc"),
        limit(200)
      );

      stage("FETCHING");
      const snapshot = await getDocs(q);
      stage("DOCUMENTS_RECEIVED");
      const rawCount = snapshot.docs.length;
      const messages: CommunicationMessage[] = [];
      let skippedCount = 0;

      for (const docSnap of snapshot.docs) {
        try {
          const raw = docSnap.data();
          if (!raw) { skippedCount++; continue; }
          stage("NORMALIZING");
          const normalized = this.normalizeCommunicationMessage(raw, docSnap.id);
          if (!normalized.isArchived && normalized.status !== "expired") {
            messages.push(normalized);
          }
        } catch (err) {
          skippedCount++;
          if (process.env.NODE_ENV === "development") console.debug(`[InboxStage] SKIPPED_MALFORMED ${docSnap.id}:`, err);
        }
      }
      stage("NORMALIZATION_COMPLETED");
      
      const safeTime = (msg: CommunicationMessage) => {
        if (!msg.createdAt) return 0;
        const t = new Date(msg.createdAt).getTime();
        return Number.isFinite(t) ? t : 0;
      };

      const sorted = messages.sort((a, b) => {
        if (a.isRead === b.isRead) {
          return safeTime(b) - safeTime(a);
        }
        return a.isRead ? 1 : -1;
      });
      stage("SORT_COMPLETED");
      if (process.env.NODE_ENV === "development") {
        console.debug(`[InboxStage] raw=${rawCount} normalized=${messages.length} skipped=${skippedCount} returned=${sorted.length}`);
      }
      return sorted;
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[InboxStage] CATCH error=${error?.code || error?.message || error}`);
      }
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
      const messages: CommunicationMessage[] = [];

      for (const docSnap of snapshot.docs) {
        try {
          const raw = docSnap.data();
          if (!raw) continue;
          messages.push(this.normalizeCommunicationMessage(raw, docSnap.id));
        } catch (err) {
          console.warn(`[CommunicationRepository] Skipped malformed thread message ${docSnap.id}:`, err);
        }
      }

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
