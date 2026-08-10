'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFounderData } from '@/hooks/useFounderData';
import { formatDateTime, formatRelative } from '@/lib/analytics';

function keys(n:number){const a:string[]=[];for(let i=n-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(d));}return a;}

export function LoginActivityPage(){
  const {users,activities,loading,error,refresh}=useFounderData();
  const now=Date.now();
  const curve=useMemo(()=>keys(30).map(date=>{const r=activities.filter(x=>x.date===date);return{date:date.slice(5),users:new Set(r.map(x=>x.uid)).size,logins:r.reduce((s,x)=>s+x.loginCount,0)}}),[activities]);
  const recent=useMemo(()=>[...users].filter(u=>u.lastLoginAt).sort((a,b)=>b.lastLoginAt-a.lastLoginAt).slice(0,10),[users]);
  const firstRecent=useMemo(()=>[...users].filter(u=>u.firstLoginAt).sort((a,b)=>b.firstLoginAt-a.firstLoginAt).slice(0,10),[users]);
  const within30=users.filter(u=>u.lastLoginAt>=now-30*60000).length;
  const first30=users.filter(u=>u.firstLoginAt>=now-30*60000).length;
  const active30=users.filter(u=>u.lastSeenAt>=now-30*60000).length;

  return <div className="page">
    <div className="page-heading"><div><h1>Login Activity</h1><p>Fokus pada aktivitas login terbaru dan first login. Data user lengkap tetap berada di Data User.</p></div><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Login ≤30 Menit</div><div className="kpi-value">{loading?'—':within30}</div><div className="kpi-foot"><span>user dengan login terbaru</span></div></div>
      <div className="kpi-card"><div className="kpi-label">First Login ≤30 Menit</div><div className="kpi-value">{loading?'—':first30}</div><div className="kpi-foot"><span>aktivasi user baru</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Last Seen ≤30 Menit</div><div className="kpi-value">{loading?'—':active30}</div><div className="kpi-foot"><span>presence proxy</span></div></div>
    </div>

    <section className="panel" style={{marginBottom:14}}><div className="panel-head"><div><div className="panel-title">Login & Active User Curve — 30 Hari</div><span className="panel-subtitle">Unique active users vs total login event per hari.</span></div><span className="source-badge">user_activity</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={curve}><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:10,border:'1px solid #e3e9e5',borderRadius:8}}/><Area type="monotone" dataKey="users" stroke="#2f7555" fill="#dfeee6" strokeWidth={2}/><Area type="monotone" dataKey="logins" stroke="#5f6fd3" fill="transparent" strokeWidth={1.5}/></AreaChart></ResponsiveContainer></div></div></section>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">10 Login Terbaru</div><span className="panel-subtitle">Urutan terbaru; detail user ada di Data User.</span></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Last Login</th><th>Last Seen</th></tr></thead><tbody>{recent.map(u=><tr key={u.uid}><td><b>{u.name}</b><br/><span style={{color:'#87948c'}}>{u.email}</span></td><td title={formatDateTime(u.lastLoginAt)}>{formatRelative(u.lastLoginAt)}</td><td>{formatRelative(u.lastSeenAt)}</td></tr>)}</tbody></table></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">10 First Login Terbaru</div><span className="panel-subtitle">User baru yang baru pertama masuk.</span></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>First Login</th><th>Registered</th></tr></thead><tbody>{firstRecent.map(u=><tr key={u.uid}><td><b>{u.name}</b><br/><span style={{color:'#87948c'}}>{u.email}</span></td><td title={formatDateTime(u.firstLoginAt)}>{formatRelative(u.firstLoginAt)}</td><td>{formatDateTime(u.registeredAt)}</td></tr>)}</tbody></table></div></section>
    </div>
  </div>;
}
