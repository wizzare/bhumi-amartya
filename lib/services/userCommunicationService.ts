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
} from "../types/communication";
import { CommunicationRepository } from "../repositories/communicationRepository";
import { FeedbackRepository } from "../repositories/feedbackRepository";
import type { UserProfile } from "../repositories/userRepository";
import { birthdayYearKey, buildBirthdayMessage, type BirthdayProfile } from "@/lib/birthday/birthdayMessage";

export class UserCommunicationService {
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

  public static async ensureBirthdayMessage(profile: BirthdayProfile, now = new Date()): Promise<boolean> {
    const year = birthdayYearKey(profile, now);
    if (!year) return false;
    const message = buildBirthdayMessage(profile, year);
    const existing = await this.getInbox(profile.uid);
    if (existing.some((item) => item.id === message.id)) return false;
    await this.dispatch({
      id: message.id,
      uid: profile.uid,
      senderUid: 'bhumi',
      type: 'system-birthday',
      priority: 'normal',
      source: 'system',
      title: message.title,
      summary: "Pesan ulang tahun dari Bhumi Amartya.",
      content: message.content,
      ownerUserId: profile.uid,
      senderRole: 'system',
      recipientRole: 'user',
      metadata: { birthdayYear: year, systemMessage: true },
    });
    return true;
  }

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
    const id = params.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      threadId: params.threadId || id,
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

  private static async processDelivery(message: CommunicationMessage, scopeUid: string): Promise<void> {
    try {
      await CommunicationRepository.updateStatus(scopeUid, message.id, 'delivered', {
        deliveryAttempts: message.deliveryAttempts + 1,
        lastDeliveredAt: new Date().toISOString()
      });
      await this.trackEvent(message.id, scopeUid, 'delivered');
    } catch (error: any) {
      console.warn("[UserCommunicationService] processDelivery background task failed:", error.message);
    }
  }

  public static async getInbox(uid: string): Promise<CommunicationMessage[]> {
    return await CommunicationRepository.getInbox(uid);
  }

  public static async getThread(uid: string, threadId: string): Promise<CommunicationMessage[]> {
    return await CommunicationRepository.getThread(uid, threadId);
  }

  public static async updateState(uid: string, messageId: string, status: CommunicationStatus): Promise<void> {
    await CommunicationRepository.updateStatus(uid, messageId, status);
    await this.trackEvent(messageId, uid, status as any);
  }

  public static async markAllAsRead(uid: string): Promise<void> {
    await CommunicationRepository.markAllAsRead(uid);
  }

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

    await this.dispatch({
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

  public static async getFeedback(params: {
    uid?: string;
    status?: FeedbackStatus;
  }): Promise<FeedbackTicket[]> {
    if (params.uid) {
      return await FeedbackRepository.getByUser(params.uid);
    }
    return await FeedbackRepository.getAll({ status: params.status });
  }

  public static async updateFeedback(ticketId: string, updates: Partial<FeedbackTicket>): Promise<void> {
    await FeedbackRepository.update(ticketId, updates);
  }

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

  public static async maintenance(uid: string): Promise<void> {
    await CommunicationRepository.cleanupExpired(uid);
  }
}
