'use client';

import { useMemo } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { pct } from '@/lib/analytics';

const WELLNESS_EVENTS = new Set(['wellness_checkin_completed','wellness_assessment_completed','open_innerwork','wellness_view']);
const JOURNEY_EVENTS = new Set(['open_journey','practice_completed','daily_completion_reached','journey_view']);
const DAILY_EVENTS = new Set(['practice_completed','daily_completion_reached']);

type FunnelRow = { name: string; count: number; stepRate: number; baseRate: number };

export function AnalyticsPage() {
  const founder = useFounderData();
  const allowed = useMemo(() => new Set(founder.users.map((u) => u.uid)), [founder.users]);
  const analytics = useProductAnalytics(allowed, 90);

  const signals = useMemo(() => {
    const dashboard = new Set<string>();
    const profile = new Set<string>();
    const wellness = new Set<string>();
    const journey = new Set<string>();
    const daily = new Set<string>();

    founder.activities.forEach((activity) => {
      const screen = String(activity.lastScreen || '').toLowerCase();
      if (screen.includes('dashboard')) dashboard.add(activity.uid);
      if (screen.includes('profile')) profile.add(activity.uid);
      if (screen.includes('wellness')) wellness.add(activity.uid);
      if (screen.includes('journey')) journey.add(activity.uid);
    });

    analytics.events.forEach((event) => {
      const screen = String(event.screen || '').toLowerCase();
      if (event.eventName === 'dashboard_view' || screen.includes('dashboard')) dashboard.add(event.uid);
      if (event.eventName === 'profile_view' || screen.includes('profile')) profile.add(event.uid);
      if (WELLNESS_EVENTS.has(event.eventName) || screen.includes('wellness')) wellness.add(event.uid);
      if (JOURNEY_EVENTS.has(event.eventName) || screen.includes('journey')) journey.add(event.uid);
      if (DAILY_EVENTS.has(event.eventName)) daily.add(event.uid);
    });

    return { dashboard, profile, wellness, journey, daily };
  }, [founder.activities, analytics.events]);

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
      { name: 'Registered', set: registered },
      { name: 'First Login', set: firstLogin },
      { name: 'Dashboard', set: dashboard },
      { name: 'Profile', set: profile },
      { name: 'Wellness', set: wellness },
      { name: 'Journey', set: journey },
      { name: 'Daily Practice', set: daily },
    ];

    return stages.map((stage, index) => {
      const previous = index === 0 ? stage.set.size : stages[index - 1]?.set.size || 0;
      return {
        name: stage.name,
        count: stage.set.size,
        stepRate: index === 0 ? 100 : pct(stage.set.size, previous),
        baseRate: pct(stage.set.size, registered.size),
      };
    });
  }, [founder.users, signals]);

  const featureReach = useMemo(() => [
    { name: 'Dashboard', count: signals.dashboard.size },
    { name: 'Profile', count: signals.profile.size },
    { name: 'Wellness', count: signals.wellness.size },
    { name: 'Journey', count: signals.journey.size },
    { name: 'Daily Practice', count: signals.daily.size },
  ], [signals]);

  const topEvents = useMemo(() => {
    const aggregate = new Map<string, { events: number; users: Set<string> }>();
    analytics.events.forEach((event) => {
      if (!event.eventName) return;
      const row = aggregate.get(event.eventName) || { events: 0, users: new Set<string>() };
      row.events += 1;
      row.users.add(event.uid);
      aggregate.set(event.eventName, row);
    });
    return Array.from(aggregate.entries())
      .map(([name, row]) => ({ name, events: row.events, users: row.users.size }))
      .sort((a, b) => b.users - a.users || b.events - a.events)
      .slice(0, 15);
  }, [analytics.events]);

  const total = founder.users.length;
  const firstLogin = funnel.find((row) => row.name === 'First Login')?.count || 0;
  const dashboard = funnel.find((row) => row.name === 'Dashboard')?.count || 0;

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Activation & Engagement</h1>
          <p>Funnel dan feature reach dari data internal Bhumi.</p>
        </div>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          <span className="source-badge">LIVE INTERNAL</span>
          <button className="btn" onClick={() => { void founder.refresh(); void analytics.refresh(); }}>Refresh</button>
        </div>
      </div>

      {(founder.error || analytics.error) && <div className="error-box" style={{ marginBottom: 12 }}>{founder.error || analytics.error}</div>}

      <div className="kpi-grid">
        <div className="kpi-card"><div className="kpi-label">Real User Base</div><div className="kpi-value">{total}</div><div className="kpi-foot"><span>deleted/test excluded</span></div></div>
        <div className="kpi-card"><div className="kpi-label">First Login Rate</div><div className="kpi-value">{pct(firstLogin, total)}%</div><div className="kpi-foot"><span>{firstLogin} users</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Dashboard Activation</div><div className="kpi-value">{pct(dashboard, total)}%</div><div className="kpi-foot"><span>{dashboard} users</span></div></div>
        <div className="kpi-card"><div className="kpi-label">Daily Practice Reach</div><div className="kpi-value">{pct(signals.daily.size, total)}%</div><div className="kpi-foot"><span>{signals.daily.size} users</span></div></div>
        <div className="kpi-card"><div className="kpi-label">90D Analytics Events</div><div className="kpi-value">{analytics.events.length}</div><div className="kpi-foot"><span>filtered UIDs only</span></div></div>
      </div>

      <div className="grid-2">
        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">New User Activation Funnel</div><span className="panel-subtitle">Setiap tahap adalah subset tahap sebelumnya.</span></div><span className="source-badge">UID-BASED</span></div>
          <div className="panel-body"><div className="stat-list">{funnel.map((row) => <div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{ width: `${Math.min(100, row.baseRate)}%` }} /></div><span className="stat-value">{row.count} · {row.stepRate}%</span></div>)}</div></div>
        </section>

        <section className="panel">
          <div className="panel-head"><div><div className="panel-title">Feature Reach</div><span className="panel-subtitle">Historical reach pada telemetry yang tersedia.</span></div></div>
          <div className="panel-body"><div className="stat-list">{featureReach.map((row) => <div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{ width: `${Math.min(100, pct(row.count, total))}%` }} /></div><span className="stat-value">{row.count}</span></div>)}</div></div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Top Analytics Events</div><span className="panel-subtitle">Unique user reach dan volume event.</span></div><span className="source-badge">90D</span></div>
        <div className="table-wrap"><table><thead><tr><th>Event</th><th>Unique Users</th><th>Events</th><th>% User Base</th></tr></thead><tbody>{topEvents.map((event) => <tr key={event.name}><td><b>{event.name}</b></td><td>{event.users}</td><td>{event.events}</td><td>{pct(event.users, total)}%</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
