/**
 * BHUMI V4 COMMUNICATION CENTER TYPES
 * Established in Phase E1, Hardened in E2, Expanded in E5, Threaded in E6
 */

export type CommunicationPriority = 'critical' | 'high' | 'normal' | 'low' | 'silent';

export type CommunicationStatus =
  | 'queued'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'dismissed'
  | 'archived'
  | 'expired'
  | 'failed';

export type CommunicationType =
  | 'daily-insight'
  | 'mirror'
  | 'weekly-review'
  | 'monthly-review'
  | 'journey-milestone'
  | 'healing-reminder'
  | 'growth-achievement'
  | 'system-announcement'
  | 'product-update'
  | 'review-request'
  | 'user-feedback'
  | 'user-bug-report'
  | 'user-feature-request'
  | 'user-question'
  | 'user-message'
  | 'admin-reply'
  | 'user-reply'
  | 'system-birthday'
  | 'welcome'
  | 'app-update';

export type CommunicationSource =
  | 'daily-guidance'
  | 'mirror'
  | 'journey'
  | 'recommendation'
  | 'growth-intelligence'
  | 'system'
  | 'user'
  | 'admin';

export type BroadcastCategory = 'announcement' | 'news' | 'maintenance' | 'feature-update' | 'reminder' | 'play-store-update';
export interface BroadcastMessage {
  id: string;
  adminUid: string;
  title: string;
  content: string;
  category: BroadcastCategory;
  priority: CommunicationPriority;
  createdAt: string;
  deliveryStats?: Record<string, number>;
}

export type DeliveryChannel =
  | 'inbox'
  | 'push'
  | 'banner'
  | 'email'
  | 'whatsapp';

export interface CommunicationMessage {
  id: string;
  uid: string; // Target Recipient (User UID or 'admin')
  senderUid: string; // Sender (User UID or 'admin' or 'bhumi')
  senderName?: string;
  type: CommunicationType;
  priority: CommunicationPriority;
  title: string;
  summary: string;
  content: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  expiresAt?: string; // ISO String
  status: CommunicationStatus;
  source: CommunicationSource;
  action?: string; // e.g., 'Open Journal'
  deepLink?: string; // e.g., '/journal/new'
  metadata?: Record<string, any>;
  ownerUserId?: string;
  senderRole?: 'user' | 'admin' | 'system';
  recipientRole?: 'user' | 'admin' | 'system';
  category?: 'SUGGESTION' | 'BUG_REPORT' | 'GENERAL_FEEDBACK' | 'ACCOUNT_SUPPORT';

  // Threading Support
  threadId: string;
  parentMessageId?: string;

  // State Flags (for easy filtering)
  isRead: boolean;
  isArchived: boolean;
  isDismissed: boolean;
  isPinned?: boolean;

  // Delivery Tracking
  deliveryChannels: DeliveryChannel[];
  deliveryAttempts: number;
  lastDeliveredAt?: string;
}

/**
 * Server-side (Admin SDK only) record of one email send attempt, written to
 * the top-level `emailDeliveries/{deliveryId}` collection by
 * functions/communicationDispatch.js. Never written from the client.
 */
export type EmailDeliveryStatus = 'PENDING' | 'SENDING' | 'SENT' | 'FAILED_RETRYABLE' | 'FAILED_PERMANENT' | 'BOUNCED';

export interface EmailDeliveryRecord {
  id: string;
  uid: string;
  category: string; // e.g. 'birthday' | 'play-store-update' | BroadcastCategory
  sourceMessageId: string | null;
  status: EmailDeliveryStatus;
  attempts: number;
  createdAt: string;
  updatedAt: string;
  lastAttemptAt: string | null;
  sentAt: string | null;
  provider: 'resend';
  providerMessageId: string | null;
  lastErrorReason: string | null;
  metadata?: Record<string, any> | null;
}

/** Metadata shape for BroadcastCategory 'play-store-update' / CommunicationType 'app-update'. */
export interface AppUpdateBroadcastMetadata {
  versionName: string;
  versionCode?: number;
  playStoreUrl: string;
  releaseNotes?: string | string[];
  language?: 'id' | 'en';
}

/**
 * BHUMI V4 USER FEEDBACK TYPES
 */
export type FeedbackStatus = 'open' | 'in-review' | 'answered' | 'resolved' | 'closed';

export interface FeedbackTicket {
  id: string;
  uid: string; // Submitting User UID
  userName: string;
  type: 'feedback' | 'bug-report' | 'feature-request' | 'question' | 'general';
  priority: CommunicationPriority;
  subject: string;
  description: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  attachments?: string[]; // URLs to screenshots/images
  adminNotes?: string;
  tags?: string[];
  threadId: string; // Linked to a communication thread
}

export type CommunicationEventType =
  | 'created'
  | 'queued'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'dismissed'
  | 'expired'
  | 'archived'
  | 'failed'
  | 'feedback_submitted'
  | 'feedback_assigned'
  | 'feedback_resolved'
  | 'feedback_closed'
  | 'reply_sent';

export interface CommunicationAnalytics {
  messageId: string;
  uid: string;
  event: CommunicationEventType;
  timestamp: string;
  channel?: DeliveryChannel;
  metadata?: Record<string, any>;
}

/**
 * BHUMI V4 WEEKLY RECOMMENDATION TYPES
 */
export interface WeeklyManifestation {
  affirmation: string;
  assumption: string;
  attraction: string;
}

export interface WeeklyRecommendation {
  uid: string;
  weekId: string; // YYYY-Wxx
  startDate: string;
  endDate: string;
  kabarMingguIni: string;
  pikiran: string;
  ekonomi: string;
  asmara: string;
  orangTerdekat: string;
  maknaBatin: string;
  yangLagiBerat: string;
  ruangBaru: string;
  tema: string;
  peluang: string;
  perluDijaga: string;
  fokus: string;
  saranBhumi: string;
  manifestasi: WeeklyManifestation;
  generatedAt: string;
  expiresAt: string;
}
