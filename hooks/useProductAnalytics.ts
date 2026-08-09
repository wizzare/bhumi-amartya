'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { asTime } from '@/lib/analytics';

export type AnalyticsEvent = {
  id: string;
  uid: string;
  eventName: string;
  date: string;
  timestamp: number;
  screen: string;
  raw: Record<string, any>;
};

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function useProductAnalytics(allowedUids: Set<string>, days = 90) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const allowedKey = useMemo(() => [...allowedUids].sort().join('|'), [allowedUids]);

  const refresh = useCallback(async () => {
    if (!allowedUids.size) { setEvents([]); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const snap = await getDocs(query(collection(db, 'analytics'), where('date', '>=', dateKey(-(days - 1))), where('date', '<=', dateKey(0))));
      const rows = snap.docs.map((d) => {
        const x: any = d.data();
        const uid = String(x.uid || x.activeUid || x.userId || '');
        const eventName = String(x.eventName || x.name || x.event || x.type || '').toLowerCase();
        const timestamp = Math.max(asTime(x.timestamp), asTime(x.createdAt), asTime(x.updatedAt));
        return {
          id: d.id,
          uid,
          eventName,
          date: String(x.date || (timestamp ? dateKeyFromTime(timestamp) : '')),
          timestamp,
          screen: String(x.screen || x.screenName || x.lastScreen || x.route || '').toLowerCase(),
          raw: x,
        } as AnalyticsEvent;
      }).filter((e) => e.uid && allowedUids.has(e.uid));
      setEvents(rows);
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca analytics.');
    } finally {
      setLoading(false);
    }
  }, [allowedKey, allowedUids, days]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { events, loading, error, refresh };
}

function dateKeyFromTime(ms: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
