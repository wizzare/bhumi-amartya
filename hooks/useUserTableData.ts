'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { PAGE_SIZE, dedupeAll, sortForTable } from '@/lib/userTableOrdering';
import { useFounderUsers } from '@/hooks/useFounderData';

function normalizeSearchTerm(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function useUserTableData() {
  const { users, loading, error, lastRefresh, refresh: refreshUsers } = useFounderUsers();
  const [page, setPage] = useState(1);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchError, setSearchError] = useState('');

  // Single canonical, deduped, deterministically ordered population.
  // Identical to the set useFounderData() exposes to Overview, so the Users
  // table and the Executive Overview can no longer disagree.
  const population = useMemo(() => sortForTable(dedupeAll(users)), [users]);

  const matches = useMemo(() => {
    if (!searchMode) return population;
    const key = normalizeSearchTerm(searchTerm);
    if (!key) return population;
    return population.filter((user) => `${user.name} ${user.email} ${user.uid}`.toLowerCase().includes(key));
  }, [population, searchMode, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);

  // Slicing happens after filtering and dedupe, so a page is short only when
  // the dataset is genuinely exhausted.
  const rows = useMemo(
    () => matches.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [matches, safePage],
  );

  const hasMore = safePage < totalPages;

  useEffect(() => { setPage(1); }, [searchTerm, searchMode]);

  const search = useCallback((term: string) => {
    const normalized = normalizeSearchTerm(term);
    if (normalized.length < 2) {
      setSearchError('Masukkan minimal 2 karakter untuk mencari nama/email/UID.');
      return;
    }
    setSearchError('');
    setSearchTerm(term.trim());
    setSearchMode(true);
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchError('');
    setSearchTerm('');
    setSearchMode(false);
    setPage(1);
  }, []);

  const next = useCallback(() => { if (hasMore) setPage((value) => value + 1); }, [hasMore]);
  const previous = useCallback(() => { setPage((value) => Math.max(1, value - 1)); }, []);

  const refresh = useCallback(() => {
    setSearchMode(false);
    setSearchTerm('');
    setSearchError('');
    setPage(1);
    void refreshUsers(true);
  }, [refreshUsers]);

  return {
    rows,
    page: safePage,
    totalPages,
    hasMore,
    loading,
    error: error || searchError,
    readsThisPage: 0,
    next,
    previous,
    refresh,
    pageSize: PAGE_SIZE,
    search,
    clearSearch,
    searchMode,
    searchTerm,
    searchSource: 'founder-cache' as const,
    totalMatches: matches.length,
    totalPopulation: population.length,
    lastRefresh,
  };
}
