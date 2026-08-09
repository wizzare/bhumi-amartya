'use client';

import { playCountryLatest, playSnapshot } from '@/lib/playSnapshot';

export function PlayAcquisitionPage(){
  return <div className="page">
    <div className="page-heading"><div><h1>Play Acquisition</h1><p>Store visitor, acquisition, conversion, first open, dan country/region.</p></div><div className="toolbar" style={{marginBottom:0}}><span className="source-badge play">PLAY SNAPSHOT</span><span className="source-badge warn">REPORT API PENDING</span></div></div>
    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Store Visitors</div><div className="kpi-value">{playSnapshot.storeVisitorsAvg}</div><div className="kpi-foot"><span>daily avg</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Acquisitions</div><div className="kpi-value">{playSnapshot.storeAcquisitionsAvg}</div><div className="kpi-foot"><span>daily avg</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Conversion</div><div className="kpi-value">{playSnapshot.storeConversion}%</div><div className="kpi-foot"><span>listing → acquisition</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Opens</div><div className="kpi-value">{playSnapshot.firstOpens}</div><div className="kpi-foot"><span>10 Aug snapshot</span></div></div>
      <div className="kpi-card"><div className="kpi-label">User Acquisitions</div><div className="kpi-value">{playSnapshot.userAcquisitionsAvg}</div><div className="kpi-foot"><span>avg</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Acquisition Funnel</div><span className="panel-subtitle">Play metrics stop before internal signup/profile activation.</span></div></div><div className="panel-body"><div className="stat-list"><div className="stat-row"><span className="stat-name">Store visitors</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">{playSnapshot.storeVisitorsAvg}</span></div><div className="stat-row"><span className="stat-name">Acquisitions</span><div className="progress"><span style={{width:`${playSnapshot.storeConversion}%`}}/></div><span className="stat-value">{playSnapshot.storeAcquisitionsAvg}</span></div><div className="stat-row"><span className="stat-name">First opens</span><div className="progress"><span style={{width:'70%'}}/></div><span className="stat-value">{playSnapshot.firstOpens}</span></div></div><div className="notice" style={{marginTop:14}}>First opens mempunyai periode/denominator berbeda dari daily store averages, jadi bar visual ini bukan rasio matematis antar-card. Dashboard tidak akan mengarang conversion lintas denominator.</div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Country / Region — Installed Audience</div><span className="panel-subtitle">5 Aug 2026 snapshot</span></div></div><div className="panel-body"><div className="stat-list">{playCountryLatest.map(x=><div className="stat-row" key={x.country}><span className="stat-name">{x.country}</span><div className="progress"><span style={{width:`${x.pct}%`}}/></div><span className="stat-value">{x.users}</span></div>)}</div></div></section>
    </div>

    <section className="panel"><div className="panel-head"><div><div className="panel-title">Next Live Dimensions</div><span className="panel-subtitle">Akan muncul otomatis setelah reporting/export terhubung.</span></div></div><div className="panel-body"><div className="pill-grid"><span>Traffic Source</span><span>Search Term</span><span>UTM Source</span><span>UTM Campaign</span><span>Country / Region</span><span>Language</span><span>New / Returning</span><span>Store Listing</span></div></div></section>
  </div>;
}
