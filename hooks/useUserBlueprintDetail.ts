'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';

type BlueprintRecord = Record<string, any>;
type CacheEntry = { data: BlueprintRecord | null; fetchedAt: number };

const blueprintCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

async function loadBlueprint(uid: string): Promise<CacheEntry> {
  const cached = blueprintCache.get(uid);
  if (cached) return cached;

  const pending = inflight.get(uid);
  if (pending) return pending;

  const request = (async () => {
    const snap = await getDoc(doc(db, 'blueprints', uid));
    const entry: CacheEntry = {
      data: snap.exists() ? (snap.data() as BlueprintRecord) : null,
      fetchedAt: Date.now(),
    };
    blueprintCache.set(uid, entry);
    return entry;
  })();

  inflight.set(uid, request);
  try {
    return await request;
  } finally {
    inflight.delete(uid);
  }
}

export function useUserBlueprintDetail(uid: string | null) {
  const cached = uid ? blueprintCache.get(uid) : undefined;
  const [data, setData] = useState<BlueprintRecord | null>(cached?.data || null);
  const [loading, setLoading] = useState(Boolean(uid && !cached));
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(Boolean(cached));
  const [fetchedAt, setFetchedAt] = useState(cached?.fetchedAt || 0);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      setError('');
      setFromCache(false);
      setFetchedAt(0);
      return;
    }

    const existing = blueprintCache.get(uid);
    if (existing) {
      setData(existing.data);
      setLoading(false);
      setError('');
      setFromCache(true);
      setFetchedAt(existing.fetchedAt);
      return;
    }

    let active = true;
    setLoading(true);
    setError('');
    setFromCache(false);

    void loadBlueprint(uid)
      .then((entry) => {
        if (!active) return;
        setData(entry.data);
        setFetchedAt(entry.fetchedAt);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.message || 'Gagal membaca blueprint user.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [uid]);

  return { data, loading, error, fromCache, fetchedAt, reads: uid && !cached && !fromCache ? 1 : 0 };
}
