'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFounderData } from '@/hooks/useFounderData';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { pct } from '@/lib/analytics';

const WELLNESS_EVENTS = new Set(['wellness_checkin_completed','wellness_assessment_completed','open_innerwork','wellness_view']);
const JOURNEY_EVENTS = new Set(['open_journey','practice_completed','daily_completion_reached','journey_view']);
const DAILY_EVENTS = new Set(['practice_completed','daily_completion_reached']);

export function AnalyticsPage() {
  const founder = useFounderData();
  const allowed = useMemo(() => new Set(founder.users.map(u => u.uid)), [founder.users]);
  const analytics = useProductAnalytics(allowed, 90);

  const signal = useMemo(() => {
    const dashboard = new Set<string>();
    const profile = new Set<string>();
    const wellness = new Set<string>();
    const journey = new Set<string>();
    const daily = new Set<string>();
    founder.activities.forEach(a => {
      const s = a.lastScreen.toLowerCase();
      if (s.includes('dashboard')) dashboard.add(a.uid);
      if (s.includes('profile')) profile.add(a.uid);
      if (s.includes('wellness')) wellness.add(a.uid);
      if (s.includes('journey')) journey.add(a.uid);
    });
    analytics.events.forEach(e => {
      if (e.eventName === 'dashboard_view' || e.screen.includes('dashboard')) dashboard.add(e.uid);
      if (e.eventName === 'profile_view' || e.screen.includes('profile')) profile.add(e.uid);
      if (WELLNESS_EVENTS.has(e.eventName) || e.screen.includes('wellness')) wellness.add(e.uid);
      if (JOURNEY_EVENTS.has(e.eventName) || e.screen.includes('journey')) journey.add(e.uid);
      if (DAILY_EVENTS.has(e.eventName)) daily.add(e.uid);
    });
    return { dashboard, profile, wellness, journey, daily };
  }, [founder.activities, analytics.events]);

  const funnel = useMemo(() => {
    const registered = new Set(founder.users.map(u => u.uid));
    const login = new Set(founder.users.filter(u => u.firstLoginAt > 0).map(u => u.uid));
    const sequential = (prev:Set<string>, next:Set<string>) => new Set([...prev].filter(uid => next.has(uid)));
    const dashboard = sequential(login, signal.dashboard);
    const profile = sequential(dashboard, signal.profile);
    const wellness = sequential(profile, signal.wellness);
    const journey = sequential(wellness, signal.journey);
    const daily = sequential(journey, signal.daily);
    return [
      ['Registered', registered], ['First Login', login], ['Dashboard', dashboard], ['Profile', profile],
      ['Wellness', wellness], ['Journey', journey], ['Daily Practice', daily],
    ] as [string, Set<string>][];
  }, [founder.users, signal]);

  const reach = useMemo(() => [
    { name:'Dashboard', value:signal.dashboard.size },
    { name:'Profile', value:signal.profile.size },
    { name:'Wellness', value:signal.wellness.size },
    { name:'Journey', value:signal.journey.size },
    { name:'Daily Practice', value:signal.daily.size },
  ], [signal]);

  const topEvents = useMemo(() => {
    const m = new Map<string,{events:number;users:Set<string>}>();
    analytics.events.forEach(e => {
      if (!e.eventName) return;
      const x = m.get(e.eventName) || { events:0, users:new Set<string>() };
      x.events += 1; x.users.add(e.uid); m.set(e.eventName,x);
    });
    return [...m.entries()].map(([name,x]) => ({name,events:x.events,users:x.users.size})).sort((a,b)=>b.users-a.users || b.events-a.events).slice(0,15);
  }, [analytics.events]);

  const total = founder.users.length;
  const loginRate = pct(funnel[1]?.[1].size || 0, total);
  const activationRate = pct(funnel[2]?.[1].size || 0, total);
  const dailyRate = pct(signal.daily.size, total);

  return <div className="page">
    <div className="page-heading"><div><h1>Activation & Engagement</h1><p>Sequential funnel + feature reach dari users, user_activity, dan analytics.</p></div><div className="toolbar" style={{marginBottom:0}}><span className="source-badge">LIVE INTERNAL</span><button className="btn" onClick={()=>{void founder.refresh();void analytics.refresh();}}>Refresh</button></div></div>
    {(founder.error || analytics.error) && <div className="error-box" style={{marginBottom:12}}>{founder.error || analytics.error}</div>}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Real User Base</div><div className="kpi-value">{total}</div><div className="kpi-foot"><span>deleted/test excluded</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Login Rate</div><div className="kpi-value">{loginRate}%</div><div className="kpi-foot"><span>{funnel[1]?.[1].size || 0} users</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Dashboard Activation</div><div className="kpi-value">{activationRate}%</div><div className="kpi-foot"><span>first value proxy</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Daily Practice Reach</div><div className="kpi-value">{dailyRate}%</div><div className="kpi-foot"><span>{signal.daily.size} users</span></div></div>
      <div className="kpi-card"><div className="kpi-label">90D Analytics Events</div><div className="kpi-value">{analytics.events.length}</div><div className="kpi-foot"><span>filtered UIDs only</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">New User Activation Funnel</div><span className="panel-subtitle">Setiap tahap adalah subset tahap sebelumnya, jadi funnel tidak bisa >100%.</span></div><span className="source-badge">UID-BASED</span></div><div className="panel-body"><div className="stat-list">{funnel.map(([name,set],i)=>{const prev=i===0?set.size:funnel[i-1][1].size;return <div className="stat-row" key={name}><span className="stat-name">{name}</span><div className="progress"><span style={{width:`${pct(set.size,total)}%`}}/></div><span className="stat-value">{set.size} · {i===0?'100':pct(set.size,prev)}%</span></div>})}</div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Feature Reach</div><span className="panel-subtitle">Historical reach pada data yang tersedia</span></div></div><div className="panel-body"><div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><BarChart data={reach} layout="vertical" margin={{left:12,right:10}}><CartesianGrid stroke="#edf1ee" horizontal={false}/><XAxis type="number" tick={{fontSize:9}}/><YAxis type="category" dataKey="name" width={82} tick={{fontSize:9}}/><Tooltip/><Bar dataKey="value" fill="#2f7555" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></div></section>
    </div>

    <section className="panel"><div className="panel-head"><div><div className="panel-title">Top Analytics Events</div><span className="panel-subtitle">Unique user reach lebih penting daripada raw event volume.</span></div><span className="source-badge">90D</span></div><div className="table-wrap"><table><thead><tr><th>Event</th><th>Unique Users</th><th>Events</th><th>% User Base</th></tr></thead><tbody>{topEvents.map(e=><tr key={e.name}><td><b>{e.name}</b></td><td>{e.users}</td><td>{e.events}</td><td>{pct(e.users,total)}%</td></tr>)}</tbody></table></div></section>
  </div>;
}
