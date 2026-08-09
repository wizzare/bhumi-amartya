'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFounderData } from '@/hooks/useFounderData';
import { formatDateTime, pct } from '@/lib/analytics';

const order=['Google Play Paid','Trial','Penjaga Inti','Penjaga Alfa','Founder','Unknown Legacy','Free'];
const colors=['#2f7555','#5f6fd3','#c4a15d','#7e62b3','#78938a','#bd5b5b','#cfd7d2'];

export function PremiumPage(){
  const {users,loading,error,refresh}=useFounderData();
  const counts=useMemo(()=>{const m=new Map<string,number>();order.forEach(x=>m.set(x,0));users.forEach(u=>m.set(u.plan,(m.get(u.plan)||0)+1));return order.map(name=>({name,value:m.get(name)||0}));},[users]);
  const count=(name:string)=>counts.find(x=>x.name===name)?.value||0;
  const paid=count('Google Play Paid'),founder=count('Founder'),trial=count('Trial');
  const paidConversion=pct(paid,Math.max(0,users.length-founder));
  const accessUsers=paid+count('Penjaga Inti')+count('Penjaga Alfa')+founder+count('Unknown Legacy');
  const statusRows=useMemo(()=>{const m=new Map<string,number>();users.forEach(u=>{const s=u.subscriptionStatus||'—';m.set(s,(m.get(s)||0)+1)});return[...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);},[users]);
  const expiring=useMemo(()=>users.filter(u=>u.accessUntil>0).sort((a,b)=>a.accessUntil-b.accessUntil).slice(0,30),[users]);

  return <div className="page">
    <div className="page-heading"><div><h1>Premium & Trial</h1><p>Source segmentation dipisahkan: Google Play Paid, Trial, Inti, Alfa, Founder, legacy, dan Free.</p></div><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}
    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Google Play Paid</div><div className="kpi-value">{loading?'—':paid}</div><div className="kpi-foot"><span>verified/source-backed</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Paid Conversion</div><div className="kpi-value">{paidConversion}%</div><div className="kpi-foot"><span>Paid / non-Founder base</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Trial</div><div className="kpi-value">{trial}</div><div className="kpi-foot"><span>trial source only</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Premium Access</div><div className="kpi-value">{accessUsers}</div><div className="kpi-foot"><span>Paid + grants + Founder</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Free</div><div className="kpi-value">{count('Free')}</div><div className="kpi-foot"><span>{pct(count('Free'),users.length)}% real users</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Access Source Distribution</div><span className="panel-subtitle">Mutually exclusive per UID.</span></div><span className="source-badge">BHUMI DB</span></div><div className="panel-body"><div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={counts.filter(x=>x.value)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>{counts.filter(x=>x.value).map((_,i)=><Cell key={i} fill={colors[i%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div><div className="stat-list">{counts.map((x,i)=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`,background:colors[i%colors.length]}}/></div><span className="stat-value">{x.value}</span></div>)}</div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Subscription Status Fields</div><span className="panel-subtitle">Raw status dari user documents; Billing API belum menjadi source of truth di dashboard.</span></div><span className="source-badge warn">DIAGNOSTIC</span></div><div className="panel-body"><div className="stat-list">{statusRows.slice(0,12).map(x=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`}}/></div><span className="stat-value">{x.value}</span></div>)}</div><div className="notice" style={{marginTop:14}}>Nanti Google Play Developer API akan memvalidasi state active, grace period, on hold, canceled, paused, dan expired berdasarkan purchase token. Sampai connector server-side hidup, raw Firestore status ditandai diagnostic.</div></div></section>
    </div>

    <section className="panel"><div className="panel-head"><div><div className="panel-title">Access Expiry Monitor</div><span className="panel-subtitle">Tidak pernah menganggap expiry kosong sebagai Lifetime; Founder saja yang lifetime.</span></div></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Source</th><th>Subscription Status</th><th>Access Until</th></tr></thead><tbody>{expiring.map(u=><tr key={u.uid}><td><b>{u.name}</b><br/><span style={{color:'#87948c'}}>{u.email}</span></td><td>{u.plan}</td><td>{u.subscriptionStatus}</td><td>{formatDateTime(u.accessUntil)}</td></tr>)}</tbody></table></div>{!expiring.length&&<div className="empty">Belum ada expiry timestamp yang bisa ditampilkan.</div>}</section>
  </div>;
}
