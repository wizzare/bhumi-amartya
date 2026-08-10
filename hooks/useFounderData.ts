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

type UsersCache = {
  users: NormalizedUser[];
  fetchedAt: number;
};

type ActivityCache = {
  activities: ActivityDoc[];
  fetchedAt: number;
  usersFetchedAt: number;
};

type FounderCache = {
  users: NormalizedUser[];
  activities: ActivityDoc[];
  fetchedAt: number;
};

let sharedUsersCache: UsersCache | null = null;
let sharedUsersRequest: Promise<UsersCache> | null = null;
let sharedActivityCache: ActivityCache | null = null;
let sharedActivityRequest: Promise<ActivityCache> | null = null;

export function peekFounderDataCache(): FounderCache | null {
  if (!sharedUsersCache) return null;
  return {
    users: sharedUsersCache.users,
    activities: sharedActivityCache?.activities || [],
    fetchedAt: Math.max(sharedUsersCache.fetchedAt, sharedActivityCache?.fetchedAt || 0),
  };
}

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

async function fetchFounderUsers(): Promise<UsersCache> {
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

  return { users: Array.from(uniqueUsers.values()), fetchedAt: Date.now() };
}

async function getFounderUsers(force = false) {
  if (!force && sharedUsersCache) return sharedUsersCache;
  if (!force && sharedUsersRequest) return sharedUsersRequest;

  sharedUsersRequest = fetchFounderUsers();
  try {
    sharedUsersCache = await sharedUsersRequest;
    return sharedUsersCache;
  } finally {
    sharedUsersRequest = null;
  }
}

async function fetchFounderActivities(allowedUids: Set<string>, usersFetchedAt: number): Promise<ActivityCache> {
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

  return { activities: Array.from(uniqueActivity.values()), fetchedAt: Date.now(), usersFetchedAt };
}

async function getFounderActivities(users: UsersCache, force = false) {
  if (!force && sharedActivityCache && sharedActivityCache.usersFetchedAt === users.fetchedAt) return sharedActivityCache;
  if (!force && sharedActivityRequest) return sharedActivityRequest;

  const allowedUids = new Set(users.users.map((user) => user.uid));
  sharedActivityRequest = fetchFounderActivities(allowedUids, users.fetchedAt);
  try {
    sharedActivityCache = await sharedActivityRequest;
    return sharedActivityCache;
  } finally {
    sharedActivityRequest = null;
  }
}

export function useFounderUsers() {
  const [users, setUsers] = useState<NormalizedUser[]>(sharedUsersCache?.users || []);
  const [loading, setLoading] = useState(!sharedUsersCache);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<number>(sharedUsersCache?.fetchedAt || 0);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    setError('');
    try {
      const data = await getFounderUsers(force);
      setUsers(data.users);
      setLastRefresh(data.fetchedAt);
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca data user Founder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(!sharedUsersCache);
      setError('');
      try {
        const data = await getFounderUsers(false);
        setUsers(data.users);
        setLastRefresh(data.fetchedAt);
      } catch (e: any) {
        setError(e?.message || 'Gagal membaca data user Founder.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const byUid = useMemo(() => new Map(users.map((user) => [user.uid, user])), [users]);
  return { users, byUid, loading, error, lastRefresh, refresh };
}

export function useFounderData() {
  const initial = peekFounderDataCache();
  const [users, setUsers] = useState<NormalizedUser[]>(initial?.users || []);
  const [activities, setActivities] = useState<ActivityDoc[]>(initial?.activities || []);
  const [loading, setLoading] = useState(!(sharedUsersCache && sharedActivityCache));
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<number>(initial?.fetchedAt || 0);

  const refresh = useCallback(async (force = true) => {
    setLoading(true);
    setError('');
    try {
      const userData = await getFounderUsers(force);
      const activityData = await getFounderActivities(userData, force);
      setUsers(userData.users);
      setActivities(activityData.activities);
      setLastRefresh(Math.max(userData.fetchedAt, activityData.fetchedAt));
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca data Founder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(!(sharedUsersCache && sharedActivityCache));
      setError('');
      try {
        const userData = await getFounderUsers(false);
        const activityData = await getFounderActivities(userData, false);
        setUsers(userData.users);
        setActivities(activityData.activities);
        setLastRefresh(Math.max(userData.fetchedAt, activityData.fetchedAt));
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
