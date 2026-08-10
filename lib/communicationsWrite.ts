'use client';

import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, FOUNDER_EMAIL } from '@/lib/firebase';

export type FounderMessageInput = {
  targetUid: string;
  title: string;
  content: string;
  parentMessageId?: string;
  threadId?: string;
};

const inFlight = new Map<string, Promise<{ id: string }>>();

function clean(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function assertFounder() {
  const user = auth.currentUser;
  if (!user) throw new Error('Sesi Founder tidak ditemukan. Silakan login ulang.');
  if ((user.email || '').toLowerCase() !== FOUNDER_EMAIL.toLowerCase()) {
    throw new Error('Akun ini tidak memiliki izin Founder.');
  }
  return user;
}

function messageId(kind: 'reply' | 'personal', uid: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${kind}_${uid}_${Date.now()}_${random}`;
}

async function writeFounderMessage(input: FounderMessageInput) {
  const founder = assertFounder();
  const targetUid = input.targetUid.trim();
  const title = clean(input.title);
  const content = input.content.trim();

  if (!targetUid) throw new Error('UID penerima tidak tersedia.');
  if (!title) throw new Error('Judul pesan wajib diisi.');
  if (!content) throw new Error('Isi pesan wajib diisi.');
  if (title.length > 160) throw new Error('Judul maksimal 160 karakter.');
  if (content.length > 5000) throw new Error('Isi pesan maksimal 5000 karakter.');

  const isReply = Boolean(input.parentMessageId);
  const id = messageId(isReply ? 'reply' : 'personal', targetUid);
  const threadId = input.threadId?.trim() || input.parentMessageId?.trim() || id;
  const createdAt = new Date().toISOString();

  const payload: Record<string, unknown> = {
    id,
    uid: targetUid,
    ownerUserId: targetUid,
    senderUid: founder.uid,
    senderRole: 'admin',
    recipientRole: 'user',
    type: isReply ? 'admin-reply' : 'admin-message',
    priority: 'normal',
    source: 'admin',
    category: isReply ? 'support-reply' : 'personal',
    title,
    summary: content.slice(0, 180),
    content,
    createdAt,
    updatedAt: serverTimestamp(),
    status: 'active',
    threadId,
    isRead: false,
    isArchived: false,
    isDismissed: false,
    deliveryChannels: ['inbox'],
    deliveryAttempts: 0,
    metadata: {
      founderDashboard: true,
      senderEmail: founder.email || FOUNDER_EMAIL,
    },
  };

  if (input.parentMessageId?.trim()) payload.parentMessageId = input.parentMessageId.trim();

  await setDoc(doc(db, 'users', targetUid, 'communications', id), payload, { merge: true });
  return { id };
}

export function sendFounderMessage(input: FounderMessageInput) {
  const key = [
    input.targetUid.trim(),
    input.parentMessageId?.trim() || '',
    clean(input.title).toLowerCase(),
    input.content.trim(),
  ].join('|');

  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = writeFounderMessage(input);
  inFlight.set(key, request);
  request.finally(() => inFlight.delete(key));
  return request;
}
