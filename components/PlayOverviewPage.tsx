'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { playCountryHistory, playCountryLatest, playSnapshot } from '@/lib/playSnapshot';

export function PlayOverviewPage(){
  return <div className="page">
    <div className="page-heading"><div><h1>Google Play Overview</h1><p>Snapshot metrik Play Console yang sudah tersedia. Data internal Bhumi tetap dipisahkan.</p></div><span className="source-badge play">SNAPSHOT {playSnapshot.kpiDate}</span></div>

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Total Installs</div><div className="kpi-value">{playSnapshot.installs}</div><div className="kpi-foot"><span>Google Play</span><span className="delta-up">+9</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Active Devices</div><div className="kpi-value">{playSnapshot.activeDevices}</div><div className="kpi-foot"><span>Google Play</span><span className="delta-up">+3</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Audience</div><div className="kpi-value">{playSnapshot.audience}</div><div className="kpi-foot"><span>Google Play</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Opens</div><div className="kpi-value">{playSnapshot.firstOpens}</div><div className="kpi-foot"><span>activation proxy</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Revenue</div><div className="kpi-value">${playSnapshot.revenueUsd.toFixed(2)}</div><div className="kpi-foot"><span>Play snapshot</span><span className="delta-up">+33.4%</span></div></div>
    </div>

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">DAU</div><div className="kpi-value">{playSnapshot.dau}</div><div className="kpi-foot"><span>Google Play</span></div></div>
      <div className="kpi-card"><div className="kpi-label">MAU</div><div className="kpi-value">{playSnapshot.mau}</div><div className="kpi-foot"><span>DAU/MAU {(playSnapshot.dau/playSnapshot.mau*100).toFixed(1)}%</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Conversion</div><div className="kpi-value">{playSnapshot.storeConversion}%</div><div className="kpi-foot"><span>store listing</span><span className="delta-down">-2.0 pp</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Rating</div><div className="kpi-value">{playSnapshot.rating.toFixed(2)}</div><div className="kpi-foot"><span>Google Play</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Installed Audience Trend</div><span className="panel-subtitle">Total vs Indonesia dari snapshot yang tersedia.</span></div><span className="source-badge play">PLAY</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={playCountryHistory}><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip/><Area type="monotone" dataKey="total" stroke="#2f7555" fill="#dfeee6" strokeWidth={2}/><Area type="monotone" dataKey="Indonesia" stroke="#5f6fd3" fill="transparent" strokeWidth={1.7}/></AreaChart></ResponsiveContainer></div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Country Distribution</div><span className="panel-subtitle">Installed audience snapshot.</span></div></div><div className="panel-body"><div className="stat-list">{playCountryLatest.map(x=><div className="stat-row" key={x.country}><span className="stat-name">{x.country}</span><div className="progress"><span style={{width:`${x.pct}%`}}/></div><span className="stat-value">{x.users} · {x.pct}%</span></div>)}</div></div></section>
    </div>
  </div>;
}
