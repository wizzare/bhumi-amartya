'use client';

import { useMemo, useState } from 'react';
import { useFounderData } from '@/hooks/useFounderData';
import { useCommunications, AdminMessage } from '@/hooks/useCommunications';
import { formatDateTime, formatRelative } from '@/lib/analytics';

export function InboxPage(){
  const founder=useFounderData();
  const allowed=useMemo(()=>new Set(founder.users.map(u=>u.uid)),[founder.users]);
  const comm=useCommunications(allowed);
  const [selected,setSelected]=useState<AdminMessage|null>(null);
  const [q,setQ]=useState('');
  const rows=useMemo(()=>comm.messages.filter(m=>{const u=founder.byUid.get(m.uid);return !q||`${m.title} ${m.content} ${u?.name||''} ${u?.email||''}`.toLowerCase().includes(q.toLowerCase())}),[comm.messages,founder.byUid,q]);
  const last24=comm.messages.filter(m=>m.createdAt>=Date.now()-86400000).length;
  const threads=new Set(comm.messages.map(m=>m.threadId||m.parentMessageId||m.id)).size;
  const users=new Set(comm.messages.map(m=>m.uid)).size;
  const unreadFlag=comm.messages.filter(m=>!m.isRead).length;

  return <div className="page">
    <div className="page-heading"><div><h1>Inbox</h1><p>Monitoring pesan user → admin dari collection group communications. Tidak ada reply/write pada tahap ini.</p></div><button className="btn" onClick={()=>void comm.refresh()}>Refresh</button></div>
    {(founder.error||comm.error)&&<div className="error-box" style={{marginBottom:12}}>{founder.error||comm.error}</div>}
    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Messages</div><div className="kpi-value">{comm.loading?'—':comm.messages.length}</div><div className="kpi-foot"><span>valid real users only</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Last 24 Hours</div><div className="kpi-value">{last24}</div><div className="kpi-foot"><span>incoming activity</span></div></div>
      <div className="kpi-card"><div className="kpi-label">User Threads</div><div className="kpi-value">{threads}</div><div className="kpi-foot"><span>thread/message grouping</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Unique Users</div><div className="kpi-value">{users}</div><div className="kpi-foot"><span>senders</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Unread Flag</div><div className="kpi-value">{unreadFlag}</div><div className="kpi-foot"><span>raw communication flag</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Incoming Messages</div><span className="panel-subtitle">Newest first. Deleted/test users are excluded before display.</span></div><span className="source-badge">COMMUNICATIONS</span></div><div className="panel-body"><div className="toolbar"><input className="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari user, email, judul, isi…"/></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Message</th><th>Time</th><th>Type</th><th>Status</th></tr></thead><tbody>{rows.slice(0,100).map(m=>{const u=founder.byUid.get(m.uid);return <tr key={`${m.uid}-${m.id}`} onClick={()=>setSelected(m)} style={{cursor:'pointer'}}><td><b>{u?.name||'Unknown User'}</b><br/><span style={{color:'#87948c'}}>{u?.email||m.uid}</span></td><td><b>{m.title}</b><br/><span style={{color:'#87948c'}}>{(m.summary||m.content).slice(0,90)}</span></td><td title={formatDateTime(m.createdAt)}>{formatRelative(m.createdAt)}</td><td>{m.type}</td><td><span className={`pill ${m.isRead?'gray':'gold'}`}>{m.isRead?'read flag':'unread flag'}</span></td></tr>})}</tbody></table></div>{!comm.loading&&!rows.length&&<div className="empty">Tidak ada pesan.</div>}</section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Message Detail</div><span className="panel-subtitle">Read-only monitoring</span></div></div><div className="panel-body">{selected?(()=>{const u=founder.byUid.get(selected.uid);return <><div className="notice"><b>{u?.name||'Unknown User'}</b><br/>{u?.email||selected.uid}<br/>{formatDateTime(selected.createdAt)}</div><h3 style={{fontFamily:'Georgia,serif',fontWeight:500}}>{selected.title}</h3><div style={{fontSize:11,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{selected.content||selected.summary||'—'}</div><div className="notice" style={{marginTop:14}}>Thread: {selected.threadId||'—'}<br/>Parent: {selected.parentMessageId||'—'}<br/>Status: {selected.status}</div></>:<div className="empty">Pilih pesan untuk melihat detail.</div>})()}</div></section>
    </div>
  </div>;
}
