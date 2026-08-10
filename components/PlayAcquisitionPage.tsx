'use client';

import { useGooglePlayData } from '@/hooks/useGooglePlayData';

export function PlayAcquisitionPage(){
  const { data, loading, error, refresh } = useGooglePlayData();
  const a = data?.acquisition;
  const firstOpens = data?.overview.firstOpens;
  const mode = data?.mode === 'live' ? 'LIVE' : data?.mode === 'partial' ? 'PARTIAL LIVE' : 'SNAPSHOT';

  return <div className="page">
    <div className="page-heading"><div><h1>Play Acquisition</h1><p>Store visitor, acquisitions, conversion, first open, dan user acquisition. Source live dan fallback dibedakan jelas.</p></div><div className="toolbar" style={{margin:0}}><span className="source-badge play">{data ? `${mode} · ${data.dataDate}` : 'LOADING'}</span><button className="btn" onClick={refresh} disabled={loading}>Refresh</button></div></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Store Visitors</div><div className="kpi-value">{a ? a.storeVisitorsAvg.toFixed(2) : '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('storeVisitorsAvg')?'live report · daily avg':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Acquisitions</div><div className="kpi-value">{a ? a.storeAcquisitionsAvg.toFixed(2) : '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('storeAcquisitionsAvg')?'live report · daily avg':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Conversion</div><div className="kpi-value">{a ? `${a.storeConversion.toFixed(1)}%` : '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('storeConversion')?'live report':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Opens</div><div className="kpi-value">{firstOpens ?? '—'}</div><div className="kpi-foot"><span>snapshot until export mapped</span></div></div>
      <div className="kpi-card"><div className="kpi-label">User Acquisitions</div><div className="kpi-value">{a ? a.userAcquisitionsAvg.toFixed(2) : '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('userAcquisitionsAvg')?'live installs report':'snapshot fallback'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">User Loss</div><div className="kpi-value">{a ? a.userLossAvg.toFixed(2) : '—'}</div><div className="kpi-foot"><span>{data?.liveFields.includes('userLossAvg')?'live installs report':'snapshot fallback'}</span></div></div>
    </div>

    <section className="panel">
      <div className="panel-head"><div><div className="panel-title">Acquisition Funnel</div><span className="panel-subtitle">Store visitor → store acquisition. First opens ditampilkan terpisah karena periodenya tidak selalu identik.</span></div><span className="source-badge play">{data?.liveFields.includes('storeConversion')?'LIVE':'SNAPSHOT'}</span></div>
      <div className="panel-body">
        <div className="stat-list">
          <div className="stat-row"><span className="stat-name">Store visitors</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">{a ? a.storeVisitorsAvg.toFixed(2) : '—'}</span></div>
          <div className="stat-row"><span className="stat-name">Store acquisitions</span><div className="progress"><span style={{width:`${Math.min(100, a?.storeConversion || 0)}%`}}/></div><span className="stat-value">{a ? a.storeAcquisitionsAvg.toFixed(2) : '—'}</span></div>
        </div>
        <div className="notice" style={{marginTop:14}}>First opens tidak dipaksa menjadi tahap rasio dari daily store averages. Dashboard menjaga denominator Play apa adanya.</div>
      </div>
    </section>
  </div>;
}
