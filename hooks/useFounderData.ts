'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { asTime, isIncludedRealUser, normalizeUser, NormalizedUser } from '@/lib/analytics';

export type ActivityDoc = {
  uid: string;
  date: string;
  loginCount: number;
  sessionCount: number;
  totalSeconds: number;
  lastSeen: any;
  lastScreen: string;
  appVersion?: string;
  buildNumber?: string;
};

type FounderCache = {
  users: NormalizedUser[];
  activities: ActivityDoc[];
  fetchedAt: number;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
let sharedCache: FounderCache | null = null;
let sharedRequest: Promise<FounderCache> | null = null;

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function canonicalUid(docId: string, raw: Record<string, any>) {
  return String(raw.authUid || raw.uid || raw.userId || raw.ownerUserId || docId).trim() || docId;
}

function userIdentity(uid: string, raw: Record<string, any>) {
  const authId = String(raw.authUid || raw.uid || raw.userId || raw.ownerUserId || '').trim();
  if (authId) return `uid:${authId}`;
  const email = String(raw.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `doc:${uid}`;
}

function userFreshness(user: NormalizedUser) {
  return Math.max(user.lastSeenAt, user.lastLoginAt, user.registeredAt);
}

async function fetchFounderData(): Promise<FounderCache> {
  const usersSnap = await getDocs(collection(db, 'users'));
  const uniqueUsers = new Map<string, NormalizedUser>();

  usersSnap.docs.forEach((doc) => {
    const raw = doc.data() as Record<string, any>;
    if (!isIncludedRealUser(raw)) return;

    const uid = canonicalUid(doc.id, raw);
    const normalized = normalizeUser(uid, raw);
    const identity = userIdentity(uid, raw);
    const existing = uniqueUsers.get(identity);

    if (!existing || userFreshness(normalized) > userFreshness(existing)) {
      uniqueUsers.set(identity, normalized);
    }
  });

  const users = Array.from(uniqueUsers.values());
  const allowedUids = new Set(users.map((user) => user.uid));
  const start = dateKey(-90);
  const end = dateKey(0);
  const activitySnap = await getDocs(query(collection(db, 'user_activity'), where('date', '>=', start), where('date', '<=', end)));
  const uniqueActivity = new Map<string, ActivityDoc>();

  activitySnap.docs.forEach((doc) => {
    const x: any = doc.data();
    const uid = String(x.uid || x.activeUid || x.userId || '').trim();
    const date = String(x.date || '').trim();
    if (!uid || !date || !allowedUids.has(uid)) return;

    const next: ActivityDoc = {
      uid,
      date,
      loginCount: Number(x.loginCount || 0),
      sessionCount: Number(x.sessionCount || 0),
      totalSeconds: Number(x.totalSeconds || 0),
      lastSeen: x.lastSeen,
      lastScreen: String(x.lastScreen || ''),
      appVersion: x.appVersion ? String(x.appVersion) : undefined,
      buildNumber: x.buildNumber ? String(x.buildNumber) : undefined,
    };

    const key = `${uid}|${date}`;
    const existing = uniqueActivity.get(key);
    if (!existing) {
      uniqueActivity.set(key, next);
      return;
    }

    uniqueActivity.set(key, {
      uid,
      date,
      loginCount: Math.max(existing.loginCount, next.loginCount),
      sessionCount: Math.max(existing.sessionCount, next.sessionCount),
      totalSeconds: Math.max(existing.totalSeconds, next.totalSeconds),
      lastSeen: asTime(next.lastSeen) >= asTime(existing.lastSeen) ? next.lastSeen : existing.lastSeen,
      lastScreen: asTime(next.lastSeen) >= asTime(existing.lastSeen) ? next.lastScreen : existing.lastScreen,
      appVersion: next.appVersion || existing.appVersion,
      buildNumber: next.buildNumber || existing.buildNumber,
    });
  });

  return {
    users,
    activities: Array.from(uniqueActivity.values()),
    fetchedAt: Date.now(),
  };
}

async function getFounderData(force = false) {
  const cacheValid = sharedCache && Date.now() - sharedCache.fetchedAt < CACHE_TTL_MS;
  if (!force && cacheValid) return sharedCache as FounderCache;
  if (!force && sharedRequest) return sharedRequest;

  sharedRequest = fetchFounderData();
  try {
    sharedCache = await sharedRequest;
    return sharedCache;
  } finally {
    sharedRequest = null;
  }
}

export function useFounderData() {
  const [users, setUsers] = useState<NormalizedUser[]>(sharedCache?.users || []);
  const [activities, setActivities] = useState<ActivityDoc[]>(sharedCache?.activities || []);
  const [loading, setLoading] = useState(!sharedCache);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<number>(sharedCache?.fetchedAt || 0);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    setError('');
    try {
      const data = await getFounderData(force);
      setUsers(data.users);
      setActivities(data.activities);
      setLastRefresh(data.fetchedAt);
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca data Founder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(!sharedCache);
      setError('');
      try {
        const data = await getFounderData(false);
        setUsers(data.users);
        setActivities(data.activities);
        setLastRefresh(data.fetchedAt);
      } catch (e: any) {
        setError(e?.message || 'Gagal membaca data Founder.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byUid = useMemo(() => new Map(users.map((user) => [user.uid, user])), [users]);
  return { users, activities, byUid, loading, error, lastRefresh, refresh };
}
