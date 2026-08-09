'use client';

import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';
import { isIncludedRealUser, normalizeUser, NormalizedUser } from '@/lib/analytics';

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

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year:'numeric', month:'2-digit', day:'2-digit' }).format(d);
}

export function useFounderData() {
  const [users, setUsers] = useState<NormalizedUser[]>([]);
  const [activities, setActivities] = useState<ActivityDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<number>(0);

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const realUsers = usersSnap.docs
        .map((d) => ({ uid: d.id, raw: d.data() }))
        .filter(({ raw }) => isIncludedRealUser(raw))
        .map(({ uid, raw }) => normalizeUser(uid, raw));
      const allowedUids = new Set(realUsers.map((u) => u.uid));

      const start = dateKey(-90);
      const end = dateKey(0);
      const activitySnap = await getDocs(query(collection(db, 'user_activity'), where('date', '>=', start), where('date', '<=', end)));
      const activity = activitySnap.docs.map((d) => {
        const x: any = d.data();
        return {
          uid: String(x.uid || ''),
          date: String(x.date || ''),
          loginCount: Number(x.loginCount || 0),
          sessionCount: Number(x.sessionCount || 0),
          totalSeconds: Number(x.totalSeconds || 0),
          lastSeen: x.lastSeen,
          lastScreen: String(x.lastScreen || ''),
          appVersion: x.appVersion ? String(x.appVersion) : undefined,
          buildNumber: x.buildNumber ? String(x.buildNumber) : undefined,
        } as ActivityDoc;
      }).filter((a) => allowedUids.has(a.uid));

      setUsers(realUsers);
      setActivities(activity);
      setLastRefresh(Date.now());
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca data Founder.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  const byUid = useMemo(() => new Map(users.map((u) => [u.uid, u])), [users]);
  return { users, activities, byUid, loading, error, lastRefresh, refresh };
}
