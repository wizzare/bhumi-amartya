'use client';

import { useMemo } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { useActivationRollup } from '@/hooks/useActivationRollup';
import { pct } from '@/lib/analytics';

type FunnelRow = { name: string; count: number; stepRate: number; baseRate: number; available: boolean };
type Props = { embedded?: boolean };

export function AnalyticsPage({ embedded = false }: Props) {
  const founder = useFounderData();
  const allowed = useMemo(() => new Set(founder.users.map((u) => u.uid)), [founder.users]);
  const telemetry = useActivationRollup(allowed, 90);

  const signals = useMemo(() => {
    const dashboard = new Set(telemetry.reach.dashboard);
    const profile = new Set(telemetry.reach.profile);
    const wellness = new Set(telemetry.reach.wellness);
    const journey = new Set(telemetry.reach.journey);
    const daily = new Set(telemetry.reach.daily);

    founder.activities.forEach((activity) => {
      const screen = String(activity.lastScreen || '').toLowerCase();
      if (screen.includes('dashboard')) dashboard.add(activity.uid);
      if (screen.includes('profile')) profile.add(activity.uid);
      if (screen.includes('wellness')) wellness.add(activity.uid);
      if (screen.includes('journey')) journey.add(activity.uid);
    });

    return { dashboard, profile, wellness, journey, daily };
  }, [founder.activities, telemetry.reach]);

  const funnel = useMemo<FunnelRow[]>(() => {
    const registered = new Set(founder.users.map((u) => u.uid));
    const firstLogin = new Set(founder.users.filter((u) => u.firstLoginAt > 0).map((u) => u.uid));
    const intersect = (left: Set<string>, right: Set<string>) => new Set(Array.from(left).filter((uid) => right.has(uid)));

    const dashboard = intersect(firstLogin, signals.dashboard);
    const profile = intersect(dashboard, signals.profile);
    const wellness = intersect(profile, signals.wellness);
    const journey = intersect(wellness, signals.journey);
    const daily = intersect(journey, signals.daily);

    const stages = [
      { name: 'Registered', set: registered, available: true },
      { name: 'First Login', set: firstLogin, available: true },
      { name: 'Dashboard', set: dashboard, available: true },
      { name: 'Profile', set: profile, available: true },
      { name: 'Wellness', set: wellness, available: true },
      { name: 'Journey', set: journey, available: true },
      { name: 'Daily Practice', set: daily, available: Boolean(telemetry.rollup) },
    ];

    return stages.map((stage, index) => {
      const previous = index === 0 ? stage.set.size : stages[index - 1]?.set.size || 0;
      return {
        name: stage.name,
        count: stage.set.size,
        stepRate: index === 0 ? 100 : pct(stage.set.size, previous),
        baseRate: pct(stage.set.size, registered.size),
        available: stage.available,
      };
    });
  }, [founder.users, signals, telemetry.rollup]);

  const featureReach = useMemo(() => [
    { name: 'Dashboard', count: signals.dashboard.size, available: true },
    { name: 'Profile', count: signals.profile.size, available: true },
    { name: 'Wellness', count: signals.wellness.size, available: true },
    { name: 'Journey', count: signals.journey.size, available: true },
    { name: 'Daily Practice', count: signals.daily.size, available: Boolean(telemetry.rollup) },
  ], [signals, telemetry.rollup]);

  const total = founder.users.length;
  const firstLogin = funnel.find((row) => row.name === 'First Login')?.count || 0;
  const rollupLabel = telemetry.rollup
    ? `ROLLUP ${telemetry.rollup.source.toUpperCase()} · ${new Date(telemetry.rollup.builtAt).toLocaleDateString('id-ID')}`
    : telemetry.loading ? 'ROLLUP CHECK' : 'ACTIVITY ONLY';

  const rebuildRollup = () => {
    if (telemetry.rebuilding) return;
    if (!window.confirm(`Bangun ulang Activation Rollup? Ini akan membaca maksimal ${telemetry.maxRawDocs} dokumen analytics satu kali, lalu menyimpan hasil compact untuk pemakaian berikutnya.`)) return;
    void telemetry.rebuild();
  };

  return (
    <div className={embedded ? '' : 'page'}>
      {embedded ? (
        <div className="toolbar" style={{justifyContent:'space-between',marginBottom:12}}>
          <span className="source-badge">{rollupLabel}</span>
          <div className="toolbar" style={{marginBottom:0}}>
            <button className="btn" onClick={() => void founder.refresh()}>Refresh Activity</button>
            <button className="btn" disabled={telemetry.rebuilding || !allowed.size} onClick={rebuildRollup}>{telemetry.rebuilding ? 'Membangun…' : 'Rebuild Rollup'}</button>
          </div>
        </div>
      ) : (
        <div className="page-heading">
          <div><h1>Activation & Engagement</h1><p>Seberapa jauh user bergerak dari first login sampai memakai fitur inti.</p></div>
          <div className="toolbar" style={{marginBottom:0}}>
            <span className="source-badge">{rollupLabel}</span>
            <button className="btn" onClick={() => void founder.refresh()}>Refresh Activity</button>
            <button className="btn" disabled={telemetry.rebuilding || !allowed.size} onClick={rebuildRollup}>{telemetry.rebuilding ? 'Membangun…' : 'Rebuild Rollup'}</button>
          </div>
        </div>
      )}

      {(founder.error || telemetry.error) && <div className="error-box" style={{ marginBottom: 12 }}>{founder.error || telemetry.error}</div>}

      {!telemetry.rollup && !telemetry.loading && (
        <div className="notice" style={{marginBottom:12}}>
          Raw analytics tidak dibaca otomatis. Feature reach saat ini memakai telemetry dari user_activity yang sudah dimuat; Daily Practice ditandai N/A sampai rollup dibangun. Rebuild Rollup adalah satu-satunya aksi yang membaca raw analytics.
        </div>
      )}

      {telemetry.rollup && (
        <div className="notice" style={{marginBottom:12}}>
          Activation Rollup: {telemetry.rollup.scannedDocs} raw docs dipadatkan menjadi UID reach. Dibangun {new Date(telemetry.rollup.builtAt).toLocaleString('id-ID',{timeZone:'Asia/Jakarta'})}.
          {telemetry.rollup.truncated ? ` Query menyentuh batas ${telemetry.maxRawDocs} docs; angka historis bisa terpotong.` : ''}
          {telemetry.syncNote ? ` ${telemetry.syncNote}` : ''}
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">First Login Rate</div><div className="kpi-value">{pct(firstLogin, total)}%</div><div className="kpi-foot"><span>{firstLogin} user</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Daily Practice Reach</div><div className="kpi-value">{telemetry.rollup ? `${pct(signals.daily.size, total)}%` : 'N/A'}</div><div className="kpi-foot"><span>{telemetry.rollup ? `${signals.daily.size} user` : 'requires rollup'}</span></div></div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">New User Activation Funnel</div><span className="panel-subtitle">Setiap tahap adalah subset tahap sebelumnya.</span></div><span className="source-badge">UID-BASED</span></div>
          <div className="panel-body"><div className="stat-list">{funnel.map((row) => <div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{ width: `${row.available ? Math.min(100, row.baseRate) : 0}%` }} /></div><span className="stat-value">{row.available ? `${row.count} · ${row.stepRate}%` : 'N/A'}</span></div>)}</div></div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Feature Reach</div><span className="panel-subtitle">Rollup historis + user_activity terbaru; tidak membaca raw analytics saat load biasa.</span></div></div>
          <div className="panel-body"><div className="stat-list">{featureReach.map((row) => <div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{ width: `${row.available ? Math.min(100, pct(row.count, total)) : 0}%` }} /></div><span className="stat-value">{row.available ? row.count : 'N/A'}</span></div>)}</div></div>
        </section>
      </div>
    </div>
  );
}
