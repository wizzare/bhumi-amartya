'use client';

import { playSnapshot } from '@/lib/playSnapshot';

export function PlayAcquisitionPage(){
  return <div className="page">
    <div className="page-heading"><div><h1>Play Acquisition</h1><p>Fokus pada store visitor, acquisition, conversion, dan first open. Geography tetap di Play Overview.</p></div><span className="source-badge play">PLAY SNAPSHOT</span></div>

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Store Visitors</div><div className="kpi-value">{playSnapshot.storeVisitorsAvg}</div><div className="kpi-foot"><span>daily avg</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Acquisitions</div><div className="kpi-value">{playSnapshot.storeAcquisitionsAvg}</div><div className="kpi-foot"><span>daily avg</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Store Conversion</div><div className="kpi-value">{playSnapshot.storeConversion}%</div><div className="kpi-foot"><span>listing → acquisition</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Opens</div><div className="kpi-value">{playSnapshot.firstOpens}</div><div className="kpi-foot"><span>{playSnapshot.kpiDate}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">User Acquisitions</div><div className="kpi-value">{playSnapshot.userAcquisitionsAvg}</div><div className="kpi-foot"><span>daily avg</span></div></div>
    </div>

    <section className="panel">
      <div className="panel-head"><div><div className="panel-title">Acquisition Funnel</div><span className="panel-subtitle">Play metrics berhenti sebelum internal signup/profile activation.</span></div></div>
      <div className="panel-body">
        <div className="stat-list">
          <div className="stat-row"><span className="stat-name">Store visitors</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">{playSnapshot.storeVisitorsAvg}</span></div>
          <div className="stat-row"><span className="stat-name">Acquisitions</span><div className="progress"><span style={{width:`${playSnapshot.storeConversion}%`}}/></div><span className="stat-value">{playSnapshot.storeAcquisitionsAvg}</span></div>
          <div className="stat-row"><span className="stat-name">First opens</span><div className="progress"><span style={{width:'70%'}}/></div><span className="stat-value">{playSnapshot.firstOpens}</span></div>
        </div>
        <div className="notice" style={{marginTop:14}}>First opens memiliki periode/denominator berbeda dari daily store averages, jadi bar visual tidak diperlakukan sebagai rasio matematis lintas-card.</div>
      </div>
    </section>
  </div>;
}
