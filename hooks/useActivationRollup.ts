'use client';

import { collection, doc, getDoc, getDocs, limit, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/lib/firebase';

const MAX_RAW_DOCS = 1000;
const ROLLUP_DOC = 'activation_90d';
const LOCAL_KEY = 'bhumi-founder-activation-rollup-v1';

const WELLNESS_EVENTS = new Set(['wellness_checkin_completed','wellness_assessment_completed','open_innerwork','wellness_view']);
const JOURNEY_EVENTS = new Set(['open_journey','practice_completed','daily_completion_reached','journey_view']);
const DAILY_EVENTS = new Set(['practice_completed','daily_completion_reached']);

type ReachKey = 'dashboard' | 'profile' | 'wellness' | 'journey' | 'daily';

export type ActivationRollup = {
  version: 1;
  days: number;
  builtAt: number;
  scannedDocs: number;
  truncated: boolean;
  reach: Record<ReachKey, string[]>;
  source: 'server' | 'local';
};

type ServerRollup = Omit<ActivationRollup, 'source'> & { source?: string };

let sharedRollup: ActivationRollup | null = null;
let sharedServerCheck: Promise<ActivationRollup | null> | null = null;
let serverChecked = false;

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(d);
}

function cleanUid(value: unknown) {
  return String(value || '').trim();
}

function normalizeRollup(raw: any, source: 'server' | 'local'): ActivationRollup | null {
  if (!raw || raw.version !== 1 || !raw.reach || typeof raw.reach !== 'object') return null;
  const list = (key: ReachKey) => Array.isArray(raw.reach[key]) ? raw.reach[key].map(cleanUid).filter(Boolean) : [];
  return {
    version: 1,
    days: Number(raw.days || 90),
    builtAt: Number(raw.builtAt || 0),
    scannedDocs: Number(raw.scannedDocs || 0),
    truncated: Boolean(raw.truncated),
    reach: {
      dashboard: list('dashboard'),
      profile: list('profile'),
      wellness: list('wellness'),
      journey: list('journey'),
      daily: list('daily'),
    },
    source,
  };
}

function readLocal() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    return normalizeRollup(JSON.parse(raw), 'local');
  } catch {
    return null;
  }
}

function writeLocal(rollup: ActivationRollup) {
  if (typeof window === 'undefined') return;
  try {
    const { source: _source, ...persisted } = rollup;
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(persisted));
  } catch {
    // Local persistence is best-effort only.
  }
}

async function readServerRollup() {
  if (serverChecked && sharedRollup) return sharedRollup;
  if (serverChecked) return null;
  if (sharedServerCheck) return sharedServerCheck;

  sharedServerCheck = (async () => {
    try {
      const snap = await getDoc(doc(db, 'admin_rollups', ROLLUP_DOC));
      if (!snap.exists()) return null;
      const rollup = normalizeRollup(snap.data(), 'server');
      if (rollup) {
        sharedRollup = rollup;
        writeLocal(rollup);
      }
      return rollup;
    } catch {
      return null;
    } finally {
      serverChecked = true;
      sharedServerCheck = null;
    }
  })();

  return sharedServerCheck;
}

function classifyEvent(raw: Record<string, any>, sets: Record<ReachKey, Set<string>>) {
  const uid = cleanUid(raw.uid || raw.activeUid || raw.userId || raw.ownerUserId);
  if (!uid) return;
  const eventName = String(raw.eventName || raw.name || raw.event || raw.type || '').trim().toLowerCase();
  const screen = String(raw.screen || raw.screenName || raw.lastScreen || raw.route || '').trim().toLowerCase();

  if (eventName === 'dashboard_view' || screen.includes('dashboard')) sets.dashboard.add(uid);
  if (eventName === 'profile_view' || screen.includes('profile')) sets.profile.add(uid);
  if (WELLNESS_EVENTS.has(eventName) || screen.includes('wellness')) sets.wellness.add(uid);
  if (JOURNEY_EVENTS.has(eventName) || screen.includes('journey')) sets.journey.add(uid);
  if (DAILY_EVENTS.has(eventName)) sets.daily.add(uid);
}

async function buildRollup(allowedUids: Set<string>, days: number): Promise<{ rollup: ActivationRollup; serverSaved: boolean }> {
  const snap = await getDocs(query(
    collection(db, 'analytics'),
    where('date', '>=', dateKey(-(days - 1))),
    where('date', '<=', dateKey(0)),
    limit(MAX_RAW_DOCS),
  ));

  const sets: Record<ReachKey, Set<string>> = {
    dashboard: new Set(), profile: new Set(), wellness: new Set(), journey: new Set(), daily: new Set(),
  };

  snap.docs.forEach((item) => classifyEvent(item.data() as Record<string, any>, sets));
  const onlyAllowed = (values: Set<string>) => [...values].filter((uid) => allowedUids.has(uid)).sort();

  const rollup: ActivationRollup = {
    version: 1,
    days,
    builtAt: Date.now(),
    scannedDocs: snap.size,
    truncated: snap.size >= MAX_RAW_DOCS,
    reach: {
      dashboard: onlyAllowed(sets.dashboard),
      profile: onlyAllowed(sets.profile),
      wellness: onlyAllowed(sets.wellness),
      journey: onlyAllowed(sets.journey),
      daily: onlyAllowed(sets.daily),
    },
    source: 'local',
  };

  sharedRollup = rollup;
  writeLocal(rollup);

  let serverSaved = false;
  try {
    const { source: _source, ...payload } = rollup;
    await setDoc(doc(db, 'admin_rollups', ROLLUP_DOC), {
      ...payload,
      updatedAt: serverTimestamp(),
      source: 'founder-dashboard',
    }, { merge: true });
    serverSaved = true;
    sharedRollup = { ...rollup, source: 'server' };
    writeLocal(sharedRollup);
  } catch {
    // Firestore rules may intentionally block admin_rollups. Local rollup remains usable.
  }

  serverChecked = true;
  return { rollup: sharedRollup || rollup, serverSaved };
}

export function useActivationRollup(allowedUids: Set<string>, days = 90) {
  const initial = sharedRollup || readLocal();
  if (!sharedRollup && initial) sharedRollup = initial;

  const [rollup, setRollup] = useState<ActivationRollup | null>(initial);
  const [loading, setLoading] = useState(!initial);
  const [rebuilding, setRebuilding] = useState(false);
  const [error, setError] = useState('');
  const [syncNote, setSyncNote] = useState('');
  const allowedKey = useMemo(() => [...allowedUids].sort().join('|'), [allowedUids]);

  useEffect(() => {
    if (rollup || !allowedUids.size) { setLoading(false); return; }
    void (async () => {
      setLoading(true);
      const server = await readServerRollup();
      if (server) setRollup(server);
      setLoading(false);
    })();
  }, [allowedKey, rollup]);

  const rebuild = useCallback(async () => {
    if (!allowedUids.size || rebuilding) return;
    setRebuilding(true);
    setError('');
    setSyncNote('');
    try {
      const result = await buildRollup(allowedUids, days);
      setRollup(result.rollup);
      setSyncNote(result.serverSaved
        ? 'Rollup tersimpan di Firestore dan cache lokal.'
        : 'Rollup tersimpan di browser. Firestore admin_rollups belum mengizinkan write, jadi tidak ada perubahan rules otomatis.');
    } catch (e: any) {
      setError(e?.message || 'Gagal membangun activation rollup.');
    } finally {
      setRebuilding(false);
    }
  }, [allowedKey, days, rebuilding]);

  const filteredReach = useMemo(() => {
    const filter = (values: string[] = []) => new Set(values.filter((uid) => allowedUids.has(uid)));
    return {
      dashboard: filter(rollup?.reach.dashboard),
      profile: filter(rollup?.reach.profile),
      wellness: filter(rollup?.reach.wellness),
      journey: filter(rollup?.reach.journey),
      daily: filter(rollup?.reach.daily),
    };
  }, [rollup, allowedKey]);

  return {
    rollup,
    reach: filteredReach,
    loading,
    rebuilding,
    error,
    syncNote,
    rebuild,
    maxRawDocs: MAX_RAW_DOCS,
  };
}
