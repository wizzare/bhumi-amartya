import {
  CommunicationMessage,
  CommunicationType,
  CommunicationPriority,
  CommunicationSource,
  CommunicationStatus,
  DeliveryChannel,
  CommunicationAnalytics,
  FeedbackTicket,
  FeedbackStatus,
  BroadcastMessage,
  BroadcastCategory
} from "../types/communication";
import { CommunicationRepository } from "../repositories/communicationRepository";
import { FeedbackRepository } from "../repositories/feedbackRepository";
import { adminRepository } from "../repositories/adminRepository";
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";

/**
 * BHUMI V4 COMMUNICATION CENTER SERVICE
 * Hardened in Phase E2, Expanded in E5, Threaded in E6
 * Unified engagement layer with lifecycle management, persistence, and two-way feedback.
 */
export class CommunicationCenterService {
  public static async submitUserSupportMessage(params: {
    authenticatedUid: string;
    userName: string;
    category: "SUGGESTION" | "BUG_REPORT" | "GENERAL_FEEDBACK" | "ACCOUNT_SUPPORT";
    subject: string;
    content: string;
  }): Promise<string> {
    const labels = {
      SUGGESTION: "Saran Pengembangan",
      BUG_REPORT: "Error atau Bug",
      GENERAL_FEEDBACK: "Masukan Umum",
      ACCOUNT_SUPPORT: "Bantuan Akun atau Aplikasi",
    } as const;
    if (!params.authenticatedUid || !params.subject.trim() || !params.content.trim()) throw new Error('Invalid support message');
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return this.dispatch({
      uid: params.authenticatedUid,
      senderUid: params.authenticatedUid,
      type: params.category === "BUG_REPORT" ? "user-bug-report" : "user-feedback",
      priority: params.category === "BUG_REPORT" ? "high" : "normal",
      source: "user",
      title: params.subject,
      summary: `${labels[params.category]} · ${params.content.substring(0, 100)}`,
      content: params.content,
      threadId,
      ownerUserId: params.authenticatedUid,
      senderRole: 'user',
      recipientRole: 'admin',
      category: params.category,
      metadata: { ownerUserId: params.authenticatedUid, recipientRole: "admin", category: params.category, userName: params.userName },
    });
  }
  /**
   * Dispatch a message through the lifecycle.
   */
  public static async dispatch(params: {
    uid: string;
    senderUid?: string;
    type: CommunicationType;
    priority: CommunicationPriority;
    source: CommunicationSource;
    title: string;
    summary: string;
    content: string;
    action?: string;
    deepLink?: string;
    expiresInDays?: number;
    deliveryChannels?: DeliveryChannel[];
    threadId?: string;
    parentMessageId?: string;
    metadata?: Record<string, any>;
    ownerUserId?: string;
    senderRole?: 'user' | 'admin' | 'system';
    recipientRole?: 'user' | 'admin' | 'system';
    category?: 'SUGGESTION' | 'BUG_REPORT' | 'GENERAL_FEEDBACK' | 'ACCOUNT_SUPPORT';
  }): Promise<string> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    const expiresAt = params.expiresInDays
      ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    const message: CommunicationMessage = {
      id,
      uid: params.uid,
      senderUid: params.senderUid || 'bhumi',
      type: params.type,
      priority: params.priority,
      source: params.source,
      title: params.title,
      summary: params.summary,
      content: params.content,
      createdAt: now,
      updatedAt: now,
      expiresAt,
      status: 'queued',
      action: params.action,
      deepLink: params.deepLink,
      threadId: params.threadId || id, // Default to self if new thread
      parentMessageId: params.parentMessageId,
      metadata: params.metadata,
      ownerUserId: params.ownerUserId,
      senderRole: params.senderRole,
      recipientRole: params.recipientRole,
      category: params.category,
      isRead: false,
      isArchived: false,
      isDismissed: false,
      deliveryChannels: params.deliveryChannels || ['inbox'],
      deliveryAttempts: 0,
    };

    const scopeUid = (params.uid !== 'admin' && params.uid !== 'bhumi')
      ? params.uid
      : (params.senderUid && params.senderUid !== 'bhumi' ? params.senderUid : 'admin');

    await CommunicationRepository.save(message);
    await this.trackEvent(id, scopeUid, 'created');
    await this.processDelivery(message, scopeUid);

    return id;
  }

  /**
   * ADMIN: Send a personal message to a user.
   */
  public static async sendPersonalMessage(params: {
    adminUid: string;
    targetUid: string;
    title: string;
    content: string;
    priority: CommunicationPriority;
  }): Promise<string> {
    if (!params.adminUid || !params.targetUid || !params.title.trim() || !params.content.trim()) throw new Error('Invalid personal message');
    return await this.dispatch({
      uid: params.targetUid,
      senderUid: params.adminUid,
      type: 'user-message',
      priority: params.priority,
      source: 'admin',
      title: params.title,
      summary: params.content.substring(0, 100),
      content: params.content,
      ownerUserId: params.targetUid,
      senderRole: 'admin',
      recipientRole: 'user',
      metadata: { adminUid: params.adminUid }
    });
  }

  /**
   * ADMIN: Broadcast message to groups.
   */
  public static async sendBroadcast(params: {
    adminUid: string;
    targetGroups: ('all' | 'premium' | 'beta-tester' | string)[];
    title: string;
    content: string;
    category: BroadcastCategory;
    priority: CommunicationPriority;
  }): Promise<void> {
    const allowedGroups = new Set(['all', 'premium', 'beta-tester']);
    if (!params.adminUid || !params.title.trim() || !params.content.trim() || params.targetGroups.some((group) => !allowedGroups.has(group))) throw new Error('Invalid broadcast audience');
    const broadcastId = `bc_${Date.now()}`;

    // 1. Fetch target users
    const allUsers = await adminRepository.getAllUsersForMonitoring();
    let targets = allUsers;

    if (!params.targetGroups.includes('all')) {
      targets = allUsers.filter(u => {
        if (params.targetGroups.includes('premium') && u.isPremium) return true;
        return false;
      });
    }

    // 2. Dispatch to each target
    const promises = targets.map(user =>
      this.dispatch({
        uid: user.uid,
        senderUid: params.adminUid,
        type: 'system-announcement',
        priority: params.priority,
        source: 'admin',
        title: params.title,
        summary: params.content.substring(0, 100),
        content: params.content,
        ownerUserId: user.uid,
        senderRole: 'admin',
        recipientRole: 'user',
        metadata: { broadcastId, category: params.category, broadcast: true }
      })
    );

    await Promise.all(promises);

    // 3. Save broadcast metadata
    const bcRef = doc(db, "broadcasts", broadcastId);
    const payload = sanitizeForFirestore({
      id: broadcastId,
      ...params,
      createdAt: new Date().toISOString(),
      deliveryStats: {
        targetCount: targets.length,
        deliveredCount: targets.length,
        openedCount: 0
      }
    });

    await setDoc(bcRef, payload);

    // 4. Log analytics
    await this.trackEvent(broadcastId, 'admin', 'broadcast_sent', {
      targetCount: targets.length,
      groups: params.targetGroups
    });
  }

  /**
   * ADMIN: Get latest broadcasts.
   */
  public static async getLatestBroadcasts(limitCount = 5): Promise<BroadcastMessage[]> {
    try {
      const q = query(
        collection(db, "broadcasts"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as BroadcastMessage);
    } catch (error) {
      console.error("[CommunicationCenter] Error fetching broadcasts:", error);
      return [];
    }
  }

  /**
   * USER: Reply to a message.
   */
  public static async sendUserReply(params: {
    uid: string;
    userName: string;
    parentMessage: CommunicationMessage;
    content: string;
    type?: 'user-feedback' | 'user-bug-report' | 'user-feature-request' | 'user-question' | 'user-message';
  }): Promise<string> {
    if (params.parentMessage.ownerUserId && params.parentMessage.ownerUserId !== params.uid) throw new Error('Thread ownership mismatch');
    if (!params.parentMessage.threadId || !params.parentMessage.id || !params.content.trim()) throw new Error('Invalid thread reply');
    return await this.dispatch({
      uid: params.uid,
      senderUid: params.uid,
      threadId: params.parentMessage.threadId,
      parentMessageId: params.parentMessage.id,
      type: params.type || 'user-reply',
      priority: 'normal',
      source: 'user',
      title: `Reply: ${params.parentMessage.title}`,
      summary: params.content.substring(0, 100),
      content: params.content,
      ownerUserId: params.uid,
      senderRole: 'user',
      recipientRole: 'admin',
      metadata: { userName: params.userName }
    });
  }

  /**
   * ADMIN: Reply to a user.
   */
  public static async sendAdminReply(params: {
    adminUid: string;
    targetUid: string;
    parentMessage: CommunicationMessage;
    content: string;
  }): Promise<string> {
    if (!params.adminUid || !params.targetUid || params.parentMessage.ownerUserId && params.parentMessage.ownerUserId !== params.targetUid) throw new Error('Thread ownership mismatch');
    return await this.dispatch({
      uid: params.targetUid,
      senderUid: params.adminUid,
      threadId: params.parentMessage.threadId,
      parentMessageId: params.parentMessage.id,
      type: 'admin-reply',
      priority: 'high',
      source: 'admin',
      title: `Bhumi: ${params.parentMessage.title}`,
      summary: params.content.substring(0, 100),
      content: params.content,
      ownerUserId: params.targetUid,
      senderRole: 'admin',
      recipientRole: 'user',
    });
  }

  /**
   * Process delivery channels.
   */
  private static async processDelivery(message: CommunicationMessage, scopeUid: string): Promise<void> {
    try {
      await CommunicationRepository.updateStatus(scopeUid, message.id, 'delivered', {
        deliveryAttempts: message.deliveryAttempts + 1,
        lastDeliveredAt: new Date().toISOString()
      });
      await this.trackEvent(message.id, scopeUid, 'delivered');
    } catch (error: any) {
      console.warn("[CommunicationCenter] processDelivery background task failed:", error.message);
    }
  }

  /**
   * Fetch user inbox.
   */
  public static async getInbox(uid: string): Promise<CommunicationMessage[]> {
    return await CommunicationRepository.getInbox(uid);
  }

  /** Admin-only view; repository applies the source=user collection-group filter. */
  public static async getAllUserCommunications(): Promise<CommunicationMessage[]> {
    return await CommunicationRepository.getAllUserCommunications();
  }

  /**
   * Fetch thread.
   */
  public static async getThread(uid: string, threadId: string): Promise<CommunicationMessage[]> {
    return await CommunicationRepository.getThread(uid, threadId);
  }

  /**
   * Public API for UI to update message state.
   */
  public static async updateState(uid: string, messageId: string, status: CommunicationStatus): Promise<void> {
    await CommunicationRepository.updateStatus(uid, messageId, status);
    await this.trackEvent(messageId, uid, status as any);
  }

  /**
   * Mark all as read.
   */
  public static async markAllAsRead(uid: string): Promise<void> {
    await CommunicationRepository.markAllAsRead(uid);
  }

  /**
   * USER FEEDBACK: Submit a ticket.
   */
  public static async submitFeedback(params: {
    uid: string;
    userName: string;
    type: 'feedback' | 'bug-report' | 'feature-request' | 'question' | 'general';
    subject: string;
    description: string;
    priority?: CommunicationPriority;
    attachments?: string[];
  }): Promise<string> {
    const threadId = `thread_${Date.now()}`;

    const msgId = await this.dispatch({
      uid: 'admin',
      senderUid: params.uid,
      threadId,
      type: `user-${params.type}` as any,
      priority: params.priority || 'normal',
      source: 'user',
      title: params.subject,
      summary: params.description.substring(0, 100),
      content: params.description,
      metadata: { userName: params.userName, attachments: params.attachments }
    });

    const ticket: FeedbackTicket = {
      id: `ticket_${Date.now()}`,
      uid: params.uid,
      userName: params.userName,
      type: params.type,
      priority: params.priority || 'normal',
      subject: params.subject,
      description: params.description,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: params.attachments,
      threadId
    };

    await FeedbackRepository.submit(ticket);
    return ticket.id;
  }

  /**
   * ADMIN: Manage feedback.
   */
  public static async getFeedback(params: {
    uid?: string;
    status?: FeedbackStatus;
  }): Promise<FeedbackTicket[]> {
    if (params.uid) {
      return await FeedbackRepository.getByUser(params.uid);
    }
    return await FeedbackRepository.getAll({ status: params.status });
  }

  /**
   * ADMIN: Update feedback.
   */
  public static async updateFeedback(ticketId: string, updates: Partial<FeedbackTicket>): Promise<void> {
    await FeedbackRepository.update(ticketId, updates);
  }

  /**
   * Standard analytics tracking.
   */
  public static async trackEvent(messageId: string, uid: string, event: any, metadata?: any): Promise<void> {
    const analyticsEvent: CommunicationAnalytics = {
      messageId,
      uid,
      event,
      timestamp: new Date().toISOString(),
      metadata
    };
    await CommunicationRepository.trackEvent(analyticsEvent);
  }

  /**
   * Cleanup task.
   */
  public static async maintenance(uid: string): Promise<void> {
    await CommunicationRepository.cleanupExpired(uid);
  }
}
