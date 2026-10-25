import {
  CommunicationMessage,
  CommunicationType,
  CommunicationPriority,
  CommunicationSource,
  CommunicationStatus,
  DeliveryChannel,
  FeedbackTicket,
  FeedbackStatus,
  BroadcastMessage,
  BroadcastCategory
} from "../types/communication";
import { CommunicationRepository } from "../repositories/communicationRepository";
import { adminRepository } from "../repositories/adminRepository";
import { UserProfile } from "../repositories/userRepository";
import {
  collection,
  doc,
  setDoc,
  query,
  orderBy,
  getDocs,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import type { BirthdayProfile } from "@/lib/birthday/birthdayMessage";
import { UserCommunicationService } from "./userCommunicationService";

/**
 * BHUMI V4 COMMUNICATION CENTER SERVICE
 * Hardened in Phase E2, Expanded in E5, Threaded in E6
 * Unified engagement layer with lifecycle management, persistence, and two-way feedback.
 */
const BROADCAST_RECIPIENT_CACHE_TTL_MS = 30_000;
const DISPATCH_BATCH_SIZE = 50;
let broadcastRecipientCache: { users: UserProfile[]; fetchedAt: number } | null = null;

async function getCachedBroadcastRecipients(): Promise<UserProfile[]> {
  const now = Date.now();
  if (broadcastRecipientCache && now - broadcastRecipientCache.fetchedAt < BROADCAST_RECIPIENT_CACHE_TTL_MS) {
    return broadcastRecipientCache.users;
  }
  const users = await adminRepository.getAllUsersUnbounded();
  broadcastRecipientCache = { users, fetchedAt: now };
  return users;
}

export class CommunicationCenterService {
  public static async submitUserSupportMessage(params: {
    authenticatedUid: string;
    userName: string;
    category: "SUGGESTION" | "BUG_REPORT" | "GENERAL_FEEDBACK" | "ACCOUNT_SUPPORT";
    subject: string;
    content: string;
  }): Promise<string> {
    return UserCommunicationService.submitUserSupportMessage(params);
  }

  public static async ensureBirthdayMessage(profile: BirthdayProfile, now = new Date()): Promise<boolean> {
    return UserCommunicationService.ensureBirthdayMessage(profile, now);
  }

  /**
   * Dispatch a message through the lifecycle.
   */
  public static async dispatch(params: {
    uid: string;
    id?: string;
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
    return UserCommunicationService.dispatch(params);
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
    broadcastIdOverride?: string;
  }): Promise<void> {
    const allowedGroups = new Set(['all', 'premium', 'beta-tester']);
    if (!params.adminUid || !params.title.trim() || !params.content.trim() || params.targetGroups.some((group) => !allowedGroups.has(group))) throw new Error('Invalid broadcast audience');
    const broadcastId = params.broadcastIdOverride || `bc_${Date.now()}`;

    // 1. Fetch target users safely (cached across the preview→confirm→send flow so
    // retries within the TTL window don't re-read the whole users collection).
    let allUsers: UserProfile[] = [];
    try {
      allUsers = await getCachedBroadcastRecipients();
    } catch (err) {
      console.error("[CommunicationCenterService] Failed to fetch users for broadcast:", err);
      throw new Error(`Broadcast failed: unable to query user targets (${err instanceof Error ? err.message : 'Unknown error'})`);
    }

    let targets = allUsers;

    if (!params.targetGroups.includes('all')) {
      targets = allUsers.filter(u => {
        let isMatch = false;
        if (params.targetGroups.includes('premium')) {
          if (u.isPremium || u.membershipType === 'PREMIUM' || u.membershipType === 'LIFETIME') {
            isMatch = true;
          }
        }
        if (params.targetGroups.includes('beta-tester')) {
          if (u.testerBadge || (u as any).isTester || u.guardianBadge) {
            isMatch = true;
          }
        }
        return isMatch;
      });
    }

    // 2. Dispatch to each target in paginated batches, using deterministic ID &
    // Promise.allSettled per batch for failure isolation.
    const results: PromiseSettledResult<string>[] = [];
    for (let i = 0; i < targets.length; i += DISPATCH_BATCH_SIZE) {
      const batch = targets.slice(i, i + DISPATCH_BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(user =>
          this.dispatch({
            id: `msg_${broadcastId}_${user.uid}`,
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
        )
      );
      results.push(...batchResults);
    }

    const deliveredCount = results.filter(r => r.status === 'fulfilled').length;
    const failedCount = results.filter(r => r.status === 'rejected').length;
    const status: 'complete' | 'partial' | 'failed' = 
      failedCount === 0 ? 'complete' : (deliveredCount > 0 ? 'partial' : 'failed');

    // 3. Save broadcast metadata with accurate delivery stats & status
    const bcRef = doc(db, "broadcasts", broadcastId);
    const payload = sanitizeForFirestore({
      id: broadcastId,
      adminUid: params.adminUid,
      targetGroups: params.targetGroups,
      title: params.title,
      content: params.content,
      category: params.category,
      priority: params.priority,
      createdAt: new Date().toISOString(),
      deliveryStats: {
        targetCount: targets.length,
        attemptedCount: targets.length,
        deliveredCount,
        failedCount,
        openedCount: 0,
        status
      }
    });

    try {
      if (process.env.NODE_ENV !== 'test') {
        await setDoc(bcRef, payload, { merge: true });
      }
    } catch (err) {
      console.error("[CommunicationCenterService] Failed to record global broadcast metadata:", err);
    }

    // 4. Log analytics
    await this.trackEvent(broadcastId, 'admin', 'broadcast_sent', {
      targetCount: targets.length,
      attemptedCount: targets.length,
      deliveredCount,
      failedCount,
      status,
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
    return UserCommunicationService.sendUserReply(params);
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
  public static async processDelivery(message: CommunicationMessage, scopeUid: string): Promise<void> {
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
    return await UserCommunicationService.getInbox(uid);
  }

  /** Admin-only view; repository applies the source=user collection-group filter. Cursor-paginated. */
  public static async getAllUserCommunications(
    pageSize?: number,
    cursor?: import("firebase/firestore").QueryDocumentSnapshot<import("firebase/firestore").DocumentData>
  ) {
    return await CommunicationRepository.getAllUserCommunications(pageSize, cursor);
  }

  /**
   * Fetch thread.
   */
  public static async getThread(uid: string, threadId: string): Promise<CommunicationMessage[]> {
    return await UserCommunicationService.getThread(uid, threadId);
  }

  /**
   * Public API for UI to update message state.
   */
  public static async updateState(uid: string, messageId: string, status: CommunicationStatus): Promise<void> {
    return UserCommunicationService.updateState(uid, messageId, status);
  }

  /**
   * Mark all as read.
   */
  public static async markAllAsRead(uid: string): Promise<void> {
    return UserCommunicationService.markAllAsRead(uid);
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
    return UserCommunicationService.submitFeedback(params);
  }

  /**
   * ADMIN: Manage feedback.
   */
  public static async getFeedback(params: {
    uid?: string;
    status?: FeedbackStatus;
  }): Promise<FeedbackTicket[]> {
    return UserCommunicationService.getFeedback(params);
  }

  /**
   * ADMIN: Update feedback.
   */
  public static async updateFeedback(ticketId: string, updates: Partial<FeedbackTicket>): Promise<void> {
    return UserCommunicationService.updateFeedback(ticketId, updates);
  }

  /**
   * Standard analytics tracking.
   */
  public static async trackEvent(messageId: string, uid: string, event: any, metadata?: any): Promise<void> {
    return UserCommunicationService.trackEvent(messageId, uid, event, metadata);
  }

  /**
   * Cleanup task.
   */
  public static async maintenance(uid: string): Promise<void> {
    return UserCommunicationService.maintenance(uid);
  }
}
