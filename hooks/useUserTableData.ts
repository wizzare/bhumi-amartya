'use client';

import { collection, endAt, getDocs, limit, orderBy, query, startAfter, startAt } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { isIncludedRealUser, normalizeUser, NormalizedUser } from '@/lib/analytics';
import { peekFounderDataCache } from '@/hooks/useFounderData';

const PAGE_SIZE = 10;

type CachedPage = {
  rows: NormalizedUser[];
  lastDoc: any | null;
  hasMore: boolean;
};

type CachedSearch = {
  rows: NormalizedUser[];
  source: 'founder-cache' | 'firestore';
  reads: number;
};

let pageCache: CachedPage[] = [];
const searchCache = new Map<string, CachedSearch>();
const searchRequests = new Map<string, Promise<CachedSearch>>();

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

function normalizeSearchTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/(^|\s)\S/g, (char) => char.toUpperCase());
}

function dedupeRows(rows: NormalizedUser[]) {
  const unique = new Map<string, NormalizedUser>();
  rows.forEach((user) => {
    const identity = identityFor(user.uid, user.raw || {});
    const current = unique.get(identity);
    if (!current || Math.max(user.lastLoginAt, user.lastSeenAt) > Math.max(current.lastLoginAt, current.lastSeenAt)) {
      unique.set(identity, user);
    }
  });
  return [...unique.values()].sort((a, b) => b.lastLoginAt - a.lastLoginAt).slice(0, PAGE_SIZE);
}

async function prefixQuery(field: string, prefix: string) {
  const snap = await getDocs(query(
    collection(db, 'users'),
    orderBy(field),
    startAt(prefix),
    endAt(`${prefix}\uf8ff`),
    limit(PAGE_SIZE),
  ));

  const rows = snap.docs
    .map((doc) => ({ id: doc.id, raw: doc.data() as Record<string, any> }))
    .filter(({ raw }) => isIncludedRealUser(raw))
    .map(({ id, raw }) => normalizeUser(canonicalUid(id, raw), raw));

  return { rows, reads: Math.max(1, snap.docs.length) };
}

async function fetchSearch(term: string): Promise<CachedSearch> {
  const key = normalizeSearchTerm(term);
  const founderCache = peekFounderDataCache();

  if (founderCache) {
    const rows = founderCache.users
      .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(key))
      .sort((a, b) => b.lastLoginAt - a.lastLoginAt)
      .slice(0, PAGE_SIZE);
    return { rows, source: 'founder-cache', reads: 0 };
  }

  const collected: NormalizedUser[] = [];
  let reads = 0;
  const original = term.trim().replace(/\s+/g, ' ');
  const variants = Array.from(new Set([original, titleCase(original), original.toLowerCase()].filter(Boolean)));

  const append = async (field:string, prefix:string) => {
    const result = await prefixQuery(field, prefix);
    reads += result.reads;
    collected.push(...result.rows);
  };

  if (key.includes('@')) {
    await append('email', key);
  } else {
    for (const variant of variants.slice(0, 2)) {
      await append('fullName', variant);
      if (dedupeRows(collected).length >= PAGE_SIZE) break;
    }

    if (dedupeRows(collected).length < PAGE_SIZE) {
      for (const variant of variants.slice(0, 2)) {
        await append('displayName', variant);
        if (dedupeRows(collected).length >= PAGE_SIZE) break;
      }
    }

    if (dedupeRows(collected).length < PAGE_SIZE) {
      await append('email', key);
    }
  }

  const rows = dedupeRows(collected).filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(key));
  return { rows, source: 'firestore', reads };
}

async function getSearch(term: string) {
  const key = normalizeSearchTerm(term);
  const cached = searchCache.get(key);
  if (cached) return { ...cached, cached: true };

  const inflight = searchRequests.get(key);
  if (inflight) return { ...(await inflight), cached: true };

  const request = fetchSearch(term);
  searchRequests.set(key, request);
  try {
    const result = await request;
    searchCache.set(key, result);
    return { ...result, cached: false };
  } finally {
    searchRequests.delete(key);
  }
}

export function useUserTableData() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<NormalizedUser[]>(pageCache[0]?.rows || []);
  const [hasMore, setHasMore] = useState(pageCache[0]?.hasMore || false);
  const [loading, setLoading] = useState(!pageCache[0]);
  const [error, setError] = useState('');
  const [readsThisPage, setReadsThisPage] = useState(0);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSource, setSearchSource] = useState<'founder-cache' | 'firestore' | ''>('');

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
        setSearchMode(false);
        setSearchTerm('');
        setSearchSource('');
        return;
      }

      const previous = pageIndex > 0 ? pageCache[pageIndex - 1] : null;
      if (pageIndex > 0 && !previous?.lastDoc) {
        setRows([]);
        setHasMore(false);
        setPage(targetPage);
        setReadsThisPage(0);
        setSearchMode(false);
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
      setSearchMode(false);
      setSearchTerm('');
      setSearchSource('');
    } catch (e: any) {
      setError(e?.message || 'Gagal membaca halaman user.');
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(async (term: string) => {
    const normalized = normalizeSearchTerm(term);
    if (normalized.length < 2) {
      setError('Masukkan minimal 2 karakter untuk mencari nama/email.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await getSearch(term);
      setRows(result.rows);
      setSearchMode(true);
      setSearchTerm(term.trim());
      setSearchSource(result.source);
      setReadsThisPage(result.cached ? 0 : result.reads);
      setHasMore(false);
    } catch (e: any) {
      setError(e?.message || 'Gagal mencari user.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    const cached = pageCache[Math.max(0, page - 1)] || pageCache[0];
    setSearchMode(false);
    setSearchTerm('');
    setSearchSource('');
    setError('');
    if (cached) {
      setRows(cached.rows);
      setHasMore(cached.hasMore);
      setReadsThisPage(0);
      return;
    }
    void loadPage(1);
  }, [loadPage, page]);

  useEffect(() => { if (!pageCache[0]) void loadPage(1); }, [loadPage]);

  const next = useCallback(() => {
    if (!loading && !searchMode && hasMore) void loadPage(page + 1);
  }, [hasMore, loadPage, loading, page, searchMode]);

  const previous = useCallback(() => {
    if (!loading && !searchMode && page > 1) void loadPage(page - 1);
  }, [loadPage, loading, page, searchMode]);

  const refresh = useCallback(() => {
    setSearchMode(false);
    setSearchTerm('');
    setSearchSource('');
    void loadPage(1, true);
  }, [loadPage]);

  return {
    rows,
    page,
    hasMore,
    loading,
    error,
    readsThisPage,
    next,
    previous,
    refresh,
    pageSize: PAGE_SIZE,
    search,
    clearSearch,
    searchMode,
    searchTerm,
    searchSource,
  };
}
