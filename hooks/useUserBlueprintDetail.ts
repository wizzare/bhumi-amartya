'use client';

import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { BlueprintStatus, evaluateBlueprint } from '@/lib/blueprintVersion';
import { BLUEPRINT_CACHE_TTL_MS, shouldRefetch } from '@/lib/blueprintCachePolicy';

type BlueprintRecord = Record<string, any>;
type CacheEntry = { data: BlueprintRecord | null; fetchedAt: number };

export { BLUEPRINT_CACHE_TTL_MS };

const blueprintCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<CacheEntry>>();

export function clearBlueprintCache() {
  blueprintCache.clear();
  inflight.clear();
}

function isFresh(entry: CacheEntry | undefined, now: number): boolean {
  return !shouldRefetch(entry, now, false);
}

async function loadBlueprint(uid: string, force: boolean): Promise<CacheEntry> {
  const now = Date.now();
  if (!force) {
    const cached = blueprintCache.get(uid);
    if (cached && isFresh(cached, now)) return cached;
    const pending = inflight.get(uid);
    if (pending) return pending;
  }

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
  const [data, setData] = useState<BlueprintRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromCache, setFromCache] = useState(false);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [status, setStatus] = useState<BlueprintStatus | null>(null);

  const run = useCallback(async (targetUid: string, force: boolean) => {
    const cached = blueprintCache.get(targetUid);
    const servedFromCache = !force && isFresh(cached, Date.now());
    setLoading(!servedFromCache);
    setError('');
    setFromCache(servedFromCache);
    try {
      const entry = await loadBlueprint(targetUid, force);
      setData(entry.data);
      setFetchedAt(entry.fetchedAt);
      setStatus(evaluateBlueprint(entry.data));
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca blueprint user.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!uid) {
      setData(null);
      setLoading(false);
      setError('');
      setFromCache(false);
      setFetchedAt(0);
      setStatus(null);
      return;
    }
    let active = true;
    void (async () => {
      if (!active) return;
      await run(uid, false);
    })();
    return () => { active = false; };
  }, [uid, run]);

  const refresh = useCallback(() => {
    if (uid) void run(uid, true);
  }, [uid, run]);

  return { data, loading, error, fromCache, fetchedAt, status, refresh };
}
