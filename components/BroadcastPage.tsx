'use client';

import { useMemo, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { useCommunications } from '@/hooks/useCommunications';
import { formatDateTime } from '@/lib/analytics';

export function BroadcastPage(){
  const founder=useFounderData();
  const allowed=useMemo(()=>new Set(founder.users.map(u=>u.uid)),[founder.users]);
  const comm=useCommunications(allowed);
  const [audience,setAudience]=useState('all');
  const [title,setTitle]=useState('');
  const [content,setContent]=useState('');
  const targetUsers=useMemo(()=>founder.users.filter(u=>audience==='all'||(audience==='premium'&&['Google Play Paid','Penjaga Inti','Penjaga Alfa','Founder','Unknown Legacy'].includes(u.plan))||(audience==='trial'&&u.plan==='Trial')||(audience==='free'&&u.plan==='Free')),[founder.users,audience]);
  const latest=comm.broadcasts[0];

  return <div className="page">
    <div className="page-heading"><div><h1>Broadcast</h1><p>Draft, audience preview, recipient count, dan riwayat broadcast. Send massal masih dikunci.</p></div><button className="btn" onClick={()=>void comm.refresh()}>Refresh History</button></div>
    {(founder.error||comm.error)&&<div className="error-box" style={{marginBottom:12}}>{founder.error||comm.error}</div>}
    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Broadcast History</div><div className="kpi-value">{comm.loading?'—':comm.broadcasts.length}</div><div className="kpi-foot"><span>global logs</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Current Audience</div><div className="kpi-value">{targetUsers.length}</div><div className="kpi-foot"><span>{audience}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Real User Base</div><div className="kpi-value">{founder.users.length}</div><div className="kpi-foot"><span>deleted/test excluded</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Latest Broadcast</div><div className="kpi-value" style={{fontSize:16}}>{latest?latest.title.slice(0,22):'—'}</div><div className="kpi-foot"><span>{latest?formatDateTime(latest.createdAt):'No history'}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Send Status</div><div className="kpi-value" style={{fontSize:18}}>LOCKED</div><div className="kpi-foot"><span>safety gate</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Compose Draft</div><span className="panel-subtitle">Tidak menulis ke Firestore sampai safeguard server-side selesai.</span></div><span className="source-badge warn">DRAFT ONLY</span></div><div className="panel-body">
        <div className="toolbar"><select className="select" value={audience} onChange={e=>setAudience(e.target.value)}><option value="all">All real users</option><option value="premium">Premium access</option><option value="trial">Trial</option><option value="free">Free</option></select><span className="pill green">{targetUsers.length} recipients</span></div>
        <input className="search" style={{maxWidth:'none',width:'100%',marginBottom:10}} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Judul broadcast"/>
        <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Isi broadcast" style={{width:'100%',minHeight:170,border:'1px solid var(--line)',borderRadius:8,padding:11,fontSize:11,resize:'vertical'}}/>
        <div className="toolbar" style={{justifyContent:'flex-end',marginTop:10,marginBottom:0}}><button className="btn" onClick={()=>{setTitle('');setContent('')}}>Clear</button><button className="btn primary" disabled title="Mass send belum diaktifkan">Send Broadcast</button></div>
        <div className="notice" style={{marginTop:12}}>Kenapa dikunci: sistem produksi lama melakukan fan-out copy ke user yang sudah ada saat pengiriman. Dashboard baru tidak boleh mengaktifkan mass-send sebelum recipient resolution, idempotency, error reporting, dan server Founder verification selesai.</div>
      </div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Preview</div><span className="panel-subtitle">Apa yang akan dibaca user</span></div></div><div className="panel-body"><div className="notice"><b>Audience:</b> {audience} · {targetUsers.length} user</div><h3 style={{fontFamily:'Georgia,serif',fontWeight:500}}>{title||'Judul broadcast'}</h3><div style={{fontSize:11,lineHeight:1.7,whiteSpace:'pre-wrap',minHeight:110}}>{content||'Isi pesan akan muncul di sini.'}</div></div></section>
    </div>

    <section className="panel"><div className="panel-head"><div><div className="panel-title">Broadcast History</div><span className="panel-subtitle">Global broadcast documents, newest first.</span></div><span className="source-badge">broadcasts</span></div><div className="table-wrap"><table><thead><tr><th>Created</th><th>Title</th><th>Audience</th><th>Status</th><th>Stats</th></tr></thead><tbody>{comm.broadcasts.slice(0,100).map(b=><tr key={b.id}><td>{formatDateTime(b.createdAt)}</td><td><b>{b.title}</b><br/><span style={{color:'#87948c'}}>{b.content.slice(0,90)}</span></td><td>{b.targetGroups.join(', ')||'—'}</td><td>{b.status}</td><td className="mono">{Object.keys(b.stats).length?JSON.stringify(b.stats):'—'}</td></tr>)}</tbody></table></div>{!comm.loading&&!comm.broadcasts.length&&<div className="empty">Belum ada broadcast history yang terbaca.</div>}</section>
  </div>;
}
