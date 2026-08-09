'use client';

import { collection, getDocs, limit, query, where } from 'firebase/firestore';
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

type AnalyticsCache = {
  events: AnalyticsEvent[];
  fetchedAt: number;
  days: number;
};

const MAX_ANALYTICS_DOCS = 1000;
const cacheByDays = new Map<number, AnalyticsCache>();
const requestByDays = new Map<number, Promise<AnalyticsCache>>();

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function dateKeyFromTime(ms: number) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}

async function fetchAnalytics(days: number): Promise<AnalyticsCache> {
  const snap = await getDocs(query(
    collection(db, 'analytics'),
    where('date', '>=', dateKey(-(days - 1))),
    where('date', '<=', dateKey(0)),
    limit(MAX_ANALYTICS_DOCS),
  ));

  const unique = new Map<string, AnalyticsEvent>();
  snap.docs.forEach((doc) => {
    const x: any = doc.data();
    const uid = String(x.uid || x.activeUid || x.userId || '').trim();
    const eventName = String(x.eventName || x.name || x.event || x.type || '').toLowerCase();
    const timestamp = Math.max(asTime(x.timestamp), asTime(x.createdAt), asTime(x.updatedAt));
    const event: AnalyticsEvent = {
      id: doc.id,
      uid,
      eventName,
      date: String(x.date || (timestamp ? dateKeyFromTime(timestamp) : '')),
      timestamp,
      screen: String(x.screen || x.screenName || x.lastScreen || x.route || '').toLowerCase(),
      raw: x,
    };
    const key = `${uid}|${eventName}|${timestamp || event.date}|${doc.id}`;
    if (!unique.has(key)) unique.set(key, event);
  });

  return { events: Array.from(unique.values()), fetchedAt: Date.now(), days };
}

async function getAnalytics(days: number, force = false) {
  const cached = cacheByDays.get(days);
  if (!force && cached) return cached;
  const inflight = requestByDays.get(days);
  if (!force && inflight) return inflight;

  const request = fetchAnalytics(days);
  requestByDays.set(days, request);
  try {
    const next = await request;
    cacheByDays.set(days, next);
    return next;
  } finally {
    requestByDays.delete(days);
  }
}

export function useProductAnalytics(allowedUids: Set<string>, days = 90) {
  const cached = cacheByDays.get(days);
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>(cached?.events || []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState('');
  const allowedKey = useMemo(() => [...allowedUids].sort().join('|'), [allowedUids]);

  const refresh = useCallback(async (force = true) => {
    if (!allowedUids.size) {
      setAllEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getAnalytics(days, force);
      setAllEvents(data.events);
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca analytics.');
    } finally {
      setLoading(false);
    }
  }, [allowedKey, days]);

  useEffect(() => {
    if (!allowedUids.size) {
      setAllEvents([]);
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(!cacheByDays.get(days));
      setError('');
      try {
        const data = await getAnalytics(days, false);
        setAllEvents(data.events);
      } catch (e: any) {
        setError(e?.message || 'Gagal membaca analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, [allowedKey, days]);

  const events = useMemo(() => allEvents.filter((event) => allowedUids.has(event.uid)), [allEvents, allowedKey]);
  return { events, loading, error, refresh, maxDocs: MAX_ANALYTICS_DOCS };
}
