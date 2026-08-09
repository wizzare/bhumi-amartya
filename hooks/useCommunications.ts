'use client';

import { collection, collectionGroup, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { asTime } from '@/lib/analytics';

export type AdminMessage = { id:string; uid:string; title:string; content:string; summary:string; createdAt:number; isRead:boolean; status:string; senderRole:string; recipientRole:string; parentMessageId:string; threadId:string; type:string; raw:Record<string,any>; };
export type BroadcastLog = { id:string; title:string; content:string; createdAt:number; targetGroups:string[]; status:string; stats:Record<string,any>; raw:Record<string,any>; };
type CommunicationsCache = { messages: AdminMessage[]; broadcasts: BroadcastLog[]; fetchedAt: number; };

const MAX_MESSAGES = 100;
const MAX_BROADCASTS = 100;
let sharedCache: CommunicationsCache | null = null;
let sharedRequest: Promise<CommunicationsCache> | null = null;

async function fetchCommunications(): Promise<CommunicationsCache> {
  const [msgSnap, broadcastSnap] = await Promise.all([
    getDocs(query(collectionGroup(db, 'communications'), orderBy('createdAt', 'desc'), limit(MAX_MESSAGES))),
    getDocs(query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(MAX_BROADCASTS))),
  ]);

  const messageMap = new Map<string, AdminMessage>();
  msgSnap.docs.forEach((doc) => {
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

  const broadcastMap = new Map<string, BroadcastLog>();
  broadcastSnap.docs.forEach((doc) => {
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
    messages: Array.from(messageMap.values()).sort((a, b) => b.createdAt - a.createdAt),
    broadcasts: Array.from(broadcastMap.values()).sort((a, b) => b.createdAt - a.createdAt),
    fetchedAt: Date.now(),
  };
}

async function getCommunications(force = false) {
  if (!force && sharedCache) return sharedCache;
  if (!force && sharedRequest) return sharedRequest;
  sharedRequest = fetchCommunications();
  try { sharedCache = await sharedRequest; return sharedCache; }
  finally { sharedRequest = null; }
}

export function useCommunications(allowedUids:Set<string>) {
  const [allMessages, setAllMessages] = useState<AdminMessage[]>(sharedCache?.messages || []);
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>(sharedCache?.broadcasts || []);
  const [loading,setLoading] = useState(!sharedCache);
  const [error,setError] = useState('');
  const allowedKey = useMemo(() => [...allowedUids].sort().join('|'), [allowedUids]);

  const refresh = useCallback(async(force = true) => {
    if (!allowedUids.size) { setAllMessages([]); setBroadcasts([]); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const data = await getCommunications(force);
      setAllMessages(data.messages); setBroadcasts(data.broadcasts);
    } catch (e:any) { setError(e?.message || 'Gagal membaca communications.'); }
    finally { setLoading(false); }
  }, [allowedKey]);

  useEffect(() => {
    if (!allowedUids.size) { setAllMessages([]); setBroadcasts([]); setLoading(false); return; }
    void (async () => {
      setLoading(!sharedCache); setError('');
      try {
        const data = await getCommunications(false);
        setAllMessages(data.messages); setBroadcasts(data.broadcasts);
      } catch (e:any) { setError(e?.message || 'Gagal membaca communications.'); }
      finally { setLoading(false); }
    })();
  }, [allowedKey]);

  const messages = useMemo(() => allMessages
    .filter((message) => allowedUids.has(message.uid))
    .filter((message) => message.recipientRole.toLowerCase() === 'admin' || message.senderRole.toLowerCase() === 'user'),
  [allMessages, allowedKey]);

  return { messages, broadcasts, loading, error, refresh, maxMessages: MAX_MESSAGES, maxBroadcasts: MAX_BROADCASTS };
}
