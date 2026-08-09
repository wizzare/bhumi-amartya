'use client';

import { useMemo, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { formatDateTime, formatRelative, startOfToday } from '@/lib/analytics';

function statusClass(status:string){return status==='Active'?'green':status==='Cooling'?'gold':status==='At Risk'?'red':'gray';}

export function UserTablePage(){
  const { users, loading, error, refresh } = useFounderData();
  const [q,setQ]=useState('');
  const [plan,setPlan]=useState('all');
  const [page,setPage]=useState(1);
  const perPage=25;
  const now=Date.now();
  const today=startOfToday();

  const sorted=useMemo(()=>[...users].sort((a,b)=>b.lastLoginAt-a.lastLoginAt || b.lastSeenAt-a.lastSeenAt),[users]);
  const filtered=useMemo(()=>sorted.filter(u=>{
    const hit=!q || `${u.name} ${u.email} ${u.city} ${u.country}`.toLowerCase().includes(q.toLowerCase());
    const planHit=plan==='all'||u.plan===plan;
    return hit&&planHit;
  }),[sorted,q,plan]);
  const totalPages=Math.max(1,Math.ceil(filtered.length/perPage));
  const rows=filtered.slice((page-1)*perPage,page*perPage);
  const firstToday=users.filter(u=>u.firstLoginAt>=today).length;
  const first30=users.filter(u=>u.firstLoginAt>=now-30*60000).length;
  const login30=users.filter(u=>u.lastLoginAt>=now-30*60000).length;
  const active30=users.filter(u=>u.lastSeenAt>=now-30*60000).length;
  const plans=[...new Set(users.map(u=>u.plan))].sort();

  return <div className="page">
    <div className="page-heading"><div><h1>Data User</h1><p>Tabel user kanonik. Deleted/archived/tester tidak pernah masuk denominator atau baris tabel.</p></div><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}
    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Total Real User</div><div className="kpi-value">{loading?'—':users.length}</div><div className="kpi-foot"><span>Included UIDs</span><span className="source-badge">BHUMI DB</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Login Hari Ini</div><div className="kpi-value">{firstToday}</div><div className="kpi-foot"><span>00:00 WIB → sekarang</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Login ≤30 Menit</div><div className="kpi-value">{first30}</div><div className="kpi-foot"><span>newly activated</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Latest Login ≤30 Menit</div><div className="kpi-value">{login30}</div><div className="kpi-foot"><span>sorted newest first</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Active / Last Seen ≤30m</div><div className="kpi-value">{active30}</div><div className="kpi-foot"><span>presence proxy</span></div></div>
    </div>

    <section className="panel">
      <div className="panel-head"><div><div className="panel-title">User Table</div><span className="panel-subtitle">Nama, Email, Tanggal Daftar, First Login, Last Login, Last Seen, Login Count, Session Count, Plan, Status</span></div><span className="source-badge">LIVE</span></div>
      <div className="panel-body">
        <div className="toolbar">
          <input className="search" value={q} onChange={e=>{setQ(e.target.value);setPage(1)}} placeholder="Cari nama, email, kota, negara…" />
          <select className="select" value={plan} onChange={e=>{setPlan(e.target.value);setPage(1)}}><option value="all">Semua Plan</option>{plans.map(x=><option key={x} value={x}>{x}</option>)}</select>
          <span style={{fontSize:9,color:'#7c8a82'}}>{filtered.length} user</span>
        </div>
        <div className="table-wrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Tgl Daftar</th><th>First Login</th><th>Last Login</th><th>Last Seen</th><th>Login</th><th>Session</th><th>Plan</th><th>Status</th><th>App</th><th>Profile City</th></tr></thead><tbody>{rows.map(u=><tr key={u.uid}><td><b>{u.name}</b></td><td>{u.email||'—'}</td><td>{formatDateTime(u.registeredAt)}</td><td>{formatDateTime(u.firstLoginAt)}</td><td title={formatDateTime(u.lastLoginAt)}>{formatRelative(u.lastLoginAt)}</td><td title={formatDateTime(u.lastSeenAt)}>{formatRelative(u.lastSeenAt)}</td><td>{u.loginCount}</td><td>{u.sessionCount}</td><td><span className={`pill ${u.plan==='Premium'?'green':u.plan==='Founder'?'gold':'gray'}`}>{u.plan}</span></td><td><span className={`pill ${statusClass(u.status)}`}>{u.status}</span></td><td>{u.appVersion} / {u.buildNumber}</td><td>{u.city}</td></tr>)}</tbody></table></div>
        {!loading&&!rows.length&&<div className="empty">Tidak ada user yang cocok dengan filter.</div>}
        <div className="toolbar" style={{justifyContent:'flex-end',marginTop:12,marginBottom:0}}><button className="btn" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Previous</button><span style={{fontSize:9,color:'#7c8a82'}}>Page {page} / {totalPages}</span><button className="btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next</button></div>
      </div>
    </section>
  </div>;
}
