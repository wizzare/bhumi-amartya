'use client';

import { collection, getDocs, limit, orderBy, query, startAfter } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { isIncludedRealUser, normalizeUser, NormalizedUser } from '@/lib/analytics';

const PAGE_SIZE = 10;

type CachedPage = {
  rows: NormalizedUser[];
  lastDoc: any | null;
  hasMore: boolean;
};

let pageCache: CachedPage[] = [];

function canonicalUid(docId: string, raw: Record<string, any>) {
  return String(raw.authUid || raw.uid || raw.userId || raw.ownerUserId || docId).trim() || docId;
}

function identityFor(docId: string, raw: Record<string, any>) {
  const authId = String(raw.authUid || raw.uid || raw.userId || raw.ownerUserId || '').trim();
  if (authId) return `uid:${authId}`;
  const email = String(raw.email || '').trim().toLowerCase();
  if (email) return `email:${email}`;
  return `doc:${docId}`;
}

function priorIdentities(pageIndex: number) {
  const seen = new Set<string>();
  for (let i = 0; i < pageIndex; i += 1) {
    pageCache[i]?.rows.forEach((user) => {
      const raw = user.raw || {};
      seen.add(identityFor(user.uid, raw));
    });
  }
  return seen;
}

export function useUserTableData() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<NormalizedUser[]>(pageCache[0]?.rows || []);
  const [hasMore, setHasMore] = useState(pageCache[0]?.hasMore || false);
  const [loading, setLoading] = useState(!pageCache[0]);
  const [error, setError] = useState('');
  const [readsThisPage, setReadsThisPage] = useState(0);

  const loadPage = useCallback(async (targetPage: number, force = false) => {
    setLoading(true);
    setError('');

    try {
      if (force) pageCache = [];

      const pageIndex = Math.max(0, targetPage - 1);
      const cached = pageCache[pageIndex];
      if (cached && !force) {
        setRows(cached.rows);
        setHasMore(cached.hasMore);
        setPage(targetPage);
        setReadsThisPage(0);
        return;
      }

      const previous = pageIndex > 0 ? pageCache[pageIndex - 1] : null;
      if (pageIndex > 0 && !previous?.lastDoc) {
        setRows([]);
        setHasMore(false);
        setPage(targetPage);
        setReadsThisPage(0);
        return;
      }

      const base = collection(db, 'users');
      const q = previous?.lastDoc
        ? query(base, orderBy('participationMetrics.lastLoginAt', 'desc'), startAfter(previous.lastDoc), limit(PAGE_SIZE))
        : query(base, orderBy('participationMetrics.lastLoginAt', 'desc'), limit(PAGE_SIZE));

      const snap = await getDocs(q);
      const seen = priorIdentities(pageIndex);
      const unique = new Map<string, NormalizedUser>();

      snap.docs.forEach((doc) => {
        const raw = doc.data() as Record<string, any>;
        if (!isIncludedRealUser(raw)) return;
        const identity = identityFor(doc.id, raw);
        if (seen.has(identity) || unique.has(identity)) return;
        unique.set(identity, normalizeUser(canonicalUid(doc.id, raw), raw));
      });

      const nextPage: CachedPage = {
        rows: Array.from(unique.values()).slice(0, PAGE_SIZE),
        lastDoc: snap.docs[snap.docs.length - 1] || null,
        hasMore: snap.docs.length === PAGE_SIZE,
      };

      pageCache[pageIndex] = nextPage;
      setRows(nextPage.rows);
      setHasMore(nextPage.hasMore);
      setPage(targetPage);
      setReadsThisPage(snap.docs.length);
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca halaman user.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!pageCache[0]) void loadPage(1); }, [loadPage]);

  const next = useCallback(() => {
    if (!loading && hasMore) void loadPage(page + 1);
  }, [hasMore, loadPage, loading, page]);

  const previous = useCallback(() => {
    if (!loading && page > 1) void loadPage(page - 1);
  }, [loadPage, loading, page]);

  const refresh = useCallback(() => { void loadPage(1, true); }, [loadPage]);

  return { rows, page, hasMore, loading, error, readsThisPage, next, previous, refresh, pageSize: PAGE_SIZE };
}
