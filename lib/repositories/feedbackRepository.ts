import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { sanitizeForFirestore } from "@/lib/firebase/sanitizeForFirestore";
import {
  FeedbackTicket,
  FeedbackStatus,
  CommunicationPriority
} from "../types/communication";
import { CommunicationRepository } from "./communicationRepository";

/**
 * BHUMI V4 FEEDBACK REPOSITORY
 * Phase E5 User Feedback & Communication Hub
 * Handles two-way engagement and support tickets.
 */
export class FeedbackRepository {
  /**
   * Submit a new feedback ticket.
   */
  public static async submit(ticket: FeedbackTicket): Promise<void> {
    try {
      const docRef = doc(db, "feedback", ticket.id);
      const payload = sanitizeForFirestore({
        ...ticket,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });

      await setDoc(docRef, payload);

      // Analytics
      await CommunicationRepository.trackEvent({
        messageId: ticket.id,
        uid: ticket.uid,
        event: 'feedback_submitted',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("[FeedbackRepository] Submit failed:", error);
      throw error;
    }
  }

  /**
   * Fetch feedback history for a user.
   */
  public static async getByUser(uid: string): Promise<FeedbackTicket[]> {
    try {
      const ref = collection(db, "feedback");
      const q = query(
        ref,
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FeedbackTicket);
    } catch (error: any) {
      console.error("[FeedbackRepository] getByUser failed:", error);
      return [];
    }
  }

  /**
   * ADMIN: Fetch all feedback tickets with filters.
   */
  public static async getAll(params: {
    status?: FeedbackStatus;
    type?: string;
    priority?: CommunicationPriority;
    limitCount?: number;
  }): Promise<FeedbackTicket[]> {
    try {
      const ref = collection(db, "feedback");
      let q = query(ref, orderBy("createdAt", "desc"));

      if (params.status) {
        q = query(q, where("status", "==", params.status));
      }
      if (params.type) {
        q = query(q, where("type", "==", params.type));
      }
      if (params.priority) {
        q = query(q, where("priority", "==", params.priority));
      }
      if (params.limitCount) {
        q = query(q, limit(params.limitCount));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as FeedbackTicket);
    } catch (error: any) {
      console.error("[FeedbackRepository] getAll failed:", error);
      return [];
    }
  }

  /**
   * ADMIN: Update ticket status and add notes.
   */
  public static async update(ticketId: string, updates: Partial<FeedbackTicket>): Promise<void> {
    const docRef = doc(db, "feedback", ticketId);
    try {
      const payload = sanitizeForFirestore({
        ...updates,
        updatedAt: serverTimestamp()
      });
      await updateDoc(docRef, payload);

      // If status changed, track it
      if (updates.status) {
        const snapshot = await getDoc(docRef);
        const uid = snapshot.data()?.uid;
        if (uid) {
          await CommunicationRepository.trackEvent({
            messageId: ticketId,
            uid,
            event: `feedback_${updates.status}` as any,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error: any) {
      console.error("[FeedbackRepository] Update failed:", error);
    }
  }
}
