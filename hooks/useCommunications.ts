'use client';

import { collection, collectionGroup, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { asTime } from '@/lib/analytics';

export type AdminMessage = { id:string; uid:string; title:string; content:string; summary:string; createdAt:number; isRead:boolean; status:string; senderRole:string; recipientRole:string; parentMessageId:string; threadId:string; type:string; raw:Record<string,any>; };
export type BroadcastLog = { id:string; title:string; content:string; createdAt:number; targetGroups:string[]; status:string; stats:Record<string,any>; raw:Record<string,any>; };
type MessageCache = { messages: AdminMessage[]; fetchedAt: number; };
type BroadcastCache = { broadcasts: BroadcastLog[]; fetchedAt: number; };

const MAX_MESSAGES = 100;
const MAX_BROADCASTS = 100;
let sharedMessageCache: MessageCache | null = null;
let sharedMessageRequest: Promise<MessageCache> | null = null;
let sharedBroadcastCache: BroadcastCache | null = null;
let sharedBroadcastRequest: Promise<BroadcastCache> | null = null;

async function fetchMessages(): Promise<MessageCache> {
  const snap = await getDocs(query(collectionGroup(db, 'communications'), orderBy('createdAt', 'desc'), limit(MAX_MESSAGES)));
  const messageMap = new Map<string, AdminMessage>();

  snap.docs.forEach((doc) => {
    const x:any = doc.data();
    const uid = String(x.ownerUserId || x.uid || x.senderUid || x.userId || '').trim();
    const row: AdminMessage = {
      id: doc.id, uid,
      title: String(x.title || x.subject || 'Tanpa judul'),
      content: String(x.content || x.message || x.summary || ''),
      summary: String(x.summary || ''),
      createdAt: Math.max(asTime(x.createdAt), asTime(x.updatedAt)),
      isRead: Boolean(x.isRead), status: String(x.status || 'active'),
      senderRole: String(x.senderRole || ''), recipientRole: String(x.recipientRole || ''),
      parentMessageId: String(x.parentMessageId || ''), threadId: String(x.threadId || ''),
      type: String(x.type || 'user-message'), raw: x,
    };
    const key = `${uid}|${row.threadId || row.parentMessageId || row.id}|${row.id}`;
    if (!messageMap.has(key)) messageMap.set(key, row);
  });

  return {
    messages: Array.from(messageMap.values()).sort((a, b) => b.createdAt - a.createdAt),
    fetchedAt: Date.now(),
  };
}

async function getMessages(force = false) {
  if (!force && sharedMessageCache) return sharedMessageCache;
  if (!force && sharedMessageRequest) return sharedMessageRequest;
  sharedMessageRequest = fetchMessages();
  try { sharedMessageCache = await sharedMessageRequest; return sharedMessageCache; }
  finally { sharedMessageRequest = null; }
}

async function fetchBroadcasts(): Promise<BroadcastCache> {
  const snap = await getDocs(query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(MAX_BROADCASTS)));
  const broadcastMap = new Map<string, BroadcastLog>();

  snap.docs.forEach((doc) => {
    const x:any = doc.data();
    const row: BroadcastLog = {
      id: doc.id,
      title: String(x.title || 'Tanpa judul'),
      content: String(x.content || x.message || x.summary || ''),
      createdAt: Math.max(asTime(x.createdAt), asTime(x.updatedAt)),
      targetGroups: Array.isArray(x.targetGroups) ? x.targetGroups.map(String) : [],
      status: String(x.status || 'sent'),
      stats: x.stats && typeof x.stats === 'object' ? x.stats : {},
      raw: x,
    };
    if (!broadcastMap.has(row.id)) broadcastMap.set(row.id, row);
  });

  return {
    broadcasts: Array.from(broadcastMap.values()).sort((a, b) => b.createdAt - a.createdAt),
    fetchedAt: Date.now(),
  };
}

async function getBroadcasts(force = false) {
  if (!force && sharedBroadcastCache) return sharedBroadcastCache;
  if (!force && sharedBroadcastRequest) return sharedBroadcastRequest;
  sharedBroadcastRequest = fetchBroadcasts();
  try { sharedBroadcastCache = await sharedBroadcastRequest; return sharedBroadcastCache; }
  finally { sharedBroadcastRequest = null; }
}

export function useInboxMessages(allowedUids:Set<string>) {
  const [allMessages, setAllMessages] = useState<AdminMessage[]>(sharedMessageCache?.messages || []);
  const [loading,setLoading] = useState(!sharedMessageCache);
  const [error,setError] = useState('');
  const allowedKey = useMemo(() => [...allowedUids].sort().join('|'), [allowedUids]);

  const refresh = useCallback(async(force = true) => {
    if (!allowedUids.size) { setAllMessages([]); setLoading(false); return; }
    setLoading(true); setError('');
    try { setAllMessages((await getMessages(force)).messages); }
    catch (e:any) { setError(e?.message || 'Gagal membaca Inbox.'); }
    finally { setLoading(false); }
  }, [allowedKey]);

  useEffect(() => {
    if (!allowedUids.size) { setAllMessages([]); setLoading(false); return; }
    void (async () => {
      setLoading(!sharedMessageCache); setError('');
      try { setAllMessages((await getMessages(false)).messages); }
      catch (e:any) { setError(e?.message || 'Gagal membaca Inbox.'); }
      finally { setLoading(false); }
    })();
  }, [allowedKey]);

  const messages = useMemo(() => allMessages
    .filter((message) => allowedUids.has(message.uid))
    .filter((message) => message.recipientRole.toLowerCase() === 'admin' || message.senderRole.toLowerCase() === 'user'),
  [allMessages, allowedKey]);

  return { messages, loading, error, refresh, maxMessages: MAX_MESSAGES };
}

export function useBroadcastHistory() {
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>(sharedBroadcastCache?.broadcasts || []);
  const [loading,setLoading] = useState(!sharedBroadcastCache);
  const [error,setError] = useState('');

  const refresh = useCallback(async(force = true) => {
    setLoading(true); setError('');
    try { setBroadcasts((await getBroadcasts(force)).broadcasts); }
    catch (e:any) { setError(e?.message || 'Gagal membaca broadcast history.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(!sharedBroadcastCache); setError('');
      try { setBroadcasts((await getBroadcasts(false)).broadcasts); }
      catch (e:any) { setError(e?.message || 'Gagal membaca broadcast history.'); }
      finally { setLoading(false); }
    })();
  }, []);

  return { broadcasts, loading, error, refresh, maxBroadcasts: MAX_BROADCASTS };
}

// Compatibility hook for any legacy caller that still needs both datasets.
export function useCommunications(allowedUids:Set<string>) {
  const inbox = useInboxMessages(allowedUids);
  const history = useBroadcastHistory();
  return {
    messages: inbox.messages,
    broadcasts: history.broadcasts,
    loading: inbox.loading || history.loading,
    error: inbox.error || history.error,
    refresh: async () => { await Promise.all([inbox.refresh(true), history.refresh(true)]); },
    maxMessages: MAX_MESSAGES,
    maxBroadcasts: MAX_BROADCASTS,
  };
}
