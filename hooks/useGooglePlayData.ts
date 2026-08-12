'use client';

import { useCallback, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

export type PlayData = {
  mode: 'live' | 'partial' | 'snapshot';
  fetchedAt: number;
  dataDate: string;
  overview: {
    installs: number; activeDevices: number; audience: number; firstOpens: number;
    dau: number; mau: number; revenueUsd: number; revenueCurrency: string; revenuePeriod: string; rating: number;
    crashRate: number | null; anrRate: number | null;
  };
  acquisition: {
    storeVisitorsAvg: number; storeAcquisitionsAvg: number; storeConversion: number;
    userAcquisitionsAvg: number; userLossAvg: number;
  };
  countries: Array<{ country: string; users: number; pct: number }>;
  history: Array<{ date: string; total: number; Indonesia?: number }>;
  liveFields: string[];
  snapshotFields: string[];
  sources: { reports: boolean; financial: boolean; vitals: boolean; reportBucketConfigured: boolean; serviceAccountConfigured: boolean };
  warnings: string[];
};

let sharedCache: PlayData | null = null;
let sharedRequest: Promise<PlayData> | null = null;

async function requestPlayData(force = false) {
  if (!force && sharedCache) return sharedCache;
  if (!force && sharedRequest) return sharedRequest;

  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Founder session belum siap.');
  const token = await currentUser.getIdToken();
  const request = fetch(`/api/google-play/summary${force ? '?refresh=1' : ''}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: 'no-store',
  }).then(async (response) => {
    if (!response.ok) throw new Error(`Google Play data gagal dimuat (${response.status}).`);
    return await response.json() as PlayData;
  });

  sharedRequest = request;
  try {
    sharedCache = await request;
    return sharedCache;
  } finally {
    sharedRequest = null;
  }
}

export function useGooglePlayData() {
  const [data, setData] = useState<PlayData | null>(sharedCache);
  const [loading, setLoading] = useState(!sharedCache);
  const [error, setError] = useState('');

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError('');
    try {
      setData(await requestPlayData(force));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google Play data gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!sharedCache) void load(false); }, [load]);
  return { data, loading, error, refresh: () => load(true) };
}
