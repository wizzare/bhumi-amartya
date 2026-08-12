'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGooglePlayData } from '@/hooks/useGooglePlayData';

function badge(mode: 'live'|'partial'|'snapshot') {
  return mode === 'live' ? 'LIVE' : mode === 'partial' ? 'PARTIAL LIVE' : 'SNAPSHOT';
}

function money(amount: number, currency: string) {
  if (currency === 'USD') return `$${amount.toFixed(2)}`;
  if (currency === 'IDR') return `Rp${Math.round(amount).toLocaleString('id-ID')}`;
  try {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
  }
}

function revenueFoot(source: 'earnings'|'estimated_sales'|'snapshot'|undefined, period: string | undefined) {
  if (source === 'estimated_sales') return `estimated sales · ${period || '—'}`;
  if (source === 'earnings') return `finalized earnings · ${period || '—'}`;
  return 'snapshot fallback';
}

export function PlayOverviewPage(){
  const { data, loading, error, refresh } = useGooglePlayData();
  const d = data?.overview;
  const ratio = d && d.mau ? (d.dau / d.mau * 100).toFixed(1) : '—';

  return <div className="page">
    <div className="page-heading"><div><h1>Google Play Overview</h1><p>Data Play live bila connector tersedia; snapshot hanya dipakai sebagai fallback dan ditandai jelas.</p></div><div className="toolbar" style={{margin:0}}><span className="source-badge play">{data ? `${badge(data.mode)} · ${data.dataDate}` : 'LOADING'}</span><button className="btn" onClick={refresh} disabled={loading}>Refresh</button></div></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}
    {data?.warnings?.length ? <div className="notice" style={{marginBottom:12}}>{data.warnings.join(' · ')}</div> : null}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Total Installs</div><div className="kpi-value">{loading&&!d?'—':d?.installs ?? '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('installs')?'live report':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Active Devices</div><div className="kpi-value">{d?.activeDevices ?? '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('activeDevices')?'live report':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Audience</div><div className="kpi-value">{d?.audience ?? '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('audience')?'live report':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Opens</div><div className="kpi-value">{d?.firstOpens ?? '—'}</div><div className="kpi-foot"><span>snapshot until export mapped</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Revenue</div><div className="kpi-value">{d ? money(d.revenueUsd, d.revenueCurrency) : '—'}</div><div className="kpi-foot"><span>{revenueFoot(d?.revenueSource, d?.revenuePeriod)}</span></div></div>
    </div>

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">DAU</div><div className="kpi-value">{d?.dau ?? '—'}</div><div className="kpi-foot"><span>snapshot until stats export mapped</span></div></div>
      <div className="kpi-card"><div className="kpi-label">MAU</div><div className="kpi-value">{d?.mau ?? '—'}</div><div className="kpi-foot"><span>DAU/MAU {ratio}%</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Crash Rate</div><div className="kpi-value">{d?.crashRate == null ? '—' : `${(d.crashRate*100).toFixed(2)}%`}</div><div className="kpi-foot"><span>{data?.liveFields.includes('crashRate')?'Play Developer Reporting':'not live yet'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">ANR Rate</div><div className="kpi-value">{d?.anrRate == null ? '—' : `${(d.anrRate*100).toFixed(2)}%`}</div><div className="kpi-foot"><span>{data?.liveFields.includes('anrRate')?'Play Developer Reporting':'not live yet'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Rating</div><div className="kpi-value">{d ? d.rating.toFixed(2) : '—'}</div><div className="kpi-foot"><span>snapshot until reviews source mapped</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Installed Audience Trend</div><span className="panel-subtitle">Total vs Indonesia.</span></div><span className="source-badge play">{data?.liveFields.includes('history')?'LIVE':'SNAPSHOT'}</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data?.history || []}><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9}}/><YAxis tick={{fontSize:9}}/><Tooltip/><Area type="monotone" dataKey="total" stroke="#2f7555" fill="#dfeee6" strokeWidth={2}/><Area type="monotone" dataKey="Indonesia" stroke="#5f6fd3" fill="transparent" strokeWidth={1.7}/></AreaChart></ResponsiveContainer></div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Country Distribution</div><span className="panel-subtitle">Installed audience by country.</span></div><span className="source-badge play">{data?.liveFields.includes('countries')?'LIVE':'SNAPSHOT'}</span></div><div className="panel-body"><div className="stat-list">{(data?.countries || []).map(x=><div className="stat-row" key={x.country}><span className="stat-name">{x.country}</span><div className="progress"><span style={{width:`${x.pct}%`}}/></div><span className="stat-value">{x.users} · {x.pct}%</span></div>)}</div></div></section>
    </div>
  </div>;
}
