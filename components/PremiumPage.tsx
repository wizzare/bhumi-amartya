'use client';

import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFounderData } from '@/hooks/useFounderData';
import { pct } from '@/lib/analytics';

const order = [
  'Google Play Paid',
  'Trial',
  'Penjaga Inti',
  'Penjaga Alfa',
  'Founder',
  'Expired Grant',
  'Expired Paid',
  'Pending Verification',
  'Data Incomplete',
  'Free',
];
const colors=['#2f7555','#5f6fd3','#c4a15d','#7e62b3','#78938a','#bd5b5b','#9f7f72','#7b879f','#a1a69f','#cfd7d2'];

export function PremiumPage(){
  const {users,loading,error,refresh}=useFounderData();
  const counts=useMemo(()=>{
    const map=new Map<string,number>();
    order.forEach((name)=>map.set(name,0));
    users.forEach((user)=>map.set(user.plan,(map.get(user.plan)||0)+1));
    return order.map((name)=>({name,value:map.get(name)||0}));
  },[users]);

  const count=(name:string)=>counts.find((item)=>item.name===name)?.value||0;
  const paid=count('Google Play Paid');
  const founder=count('Founder');
  const trial=count('Trial');
  const inti=count('Penjaga Inti');
  const alfa=count('Penjaga Alfa');
  const expiredGrant=count('Expired Grant');
  const expiredPaid=count('Expired Paid');
  const pending=count('Pending Verification');
  const incomplete=count('Data Incomplete');
  const free=count('Free');
  const activePremiumAccess=paid+inti+alfa+founder;
  const activeGrantAccess=inti+alfa;
  const lockedOrFree=free+expiredGrant+expiredPaid+incomplete;
  const paidConversion=pct(paid,Math.max(0,users.length-founder));

  const statusRows=useMemo(()=>{
    const map=new Map<string,number>();
    users.forEach((user)=>{
      const status=user.subscriptionStatus||'—';
      map.set(status,(map.get(status)||0)+1);
    });
    return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  },[users]);

  return <div className="page">
    <div className="page-heading">
      <div>
        <h1>Premium & Trial</h1>
        <p>Hanya entitlement yang masih aktif hari ini masuk Premium Access. Badge/grant yang sudah lewat dipisahkan sebagai Expired Grant.</p>
      </div>
      <button className="btn" onClick={()=>void refresh()}>Refresh</button>
    </div>

    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Active Premium Access</div><div className="kpi-value">{loading?'—':activePremiumAccess}</div><div className="kpi-foot"><span>Paid + active Inti/Alfa + Founder</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Google Play Paid</div><div className="kpi-value">{loading?'—':paid}</div><div className="kpi-foot"><span>{paidConversion}% non-Founder base</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Active Trial</div><div className="kpi-value">{loading?'—':trial}</div><div className="kpi-foot"><span>trial window still valid</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Active Inti / Alfa</div><div className="kpi-value">{loading?'—':activeGrantAccess}</div><div className="kpi-foot"><span>Inti {inti} • Alfa {alfa}</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Expired Grants</div><div className="kpi-value">{loading?'—':expiredGrant}</div><div className="kpi-foot"><span>tidak masuk Premium Access</span></div></div>
    </div>

    <div className="grid-2">
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Current Access Distribution</div><span className="panel-subtitle">Mutually exclusive per UID, berdasarkan status saat ini.</span></div><span className="source-badge">BHUMI DB</span></div>
        <div className="panel-body">
          <div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={counts.filter((item)=>item.value)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>{counts.filter((item)=>item.value).map((_,index)=><Cell key={index} fill={colors[index%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
          <div className="stat-list">{counts.map((item,index)=><div className="stat-row" key={item.name}><span className="stat-name">{item.name}</span><div className="progress"><span style={{width:`${pct(item.value,users.length)}%`,background:colors[index%colors.length]}}/></div><span className="stat-value">{item.value}</span></div>)}</div>
          <div className="notice" style={{marginTop:14}}>Locked/Free saat ini: {lockedOrFree}. Pending verification: {pending}. Data incomplete: {incomplete}. Kategori diagnostic tidak pernah ditambahkan ke Active Premium Access.</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Entitlement Rules</div><span className="panel-subtitle">Dashboard mengikuti masa akses, bukan badge historis.</span></div><span className="source-badge warn">CANONICAL</span></div>
        <div className="panel-body">
          <div className="stat-list">
            <div className="stat-row"><span className="stat-name">Founder</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">Lifetime</span></div>
            <div className="stat-row"><span className="stat-name">Inti</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">s/d 30 Agu</span></div>
            <div className="stat-row"><span className="stat-name">Alfa</span><div className="progress"><span style={{width:'0%'}}/></div><span className="stat-value">Expired 30 Jul</span></div>
            <div className="stat-row"><span className="stat-name">Paid</span><div className="progress"><span style={{width:'100%'}}/></div><span className="stat-value">verified + unexpired</span></div>
          </div>
          <div className="notice" style={{marginTop:14}}>Jika Alfa yang sudah expired kemudian menjadi pelanggan Google Play aktif, UID tersebut dihitung sebagai Google Play Paid—bukan Alfa. Missing expiry/proof tidak dianggap lifetime.</div>
        </div>
      </section>
    </div>

    <div className="grid-2">
      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Subscription Status Fields</div><span className="panel-subtitle">Raw status dari user documents untuk diagnosis.</span></div><span className="source-badge warn">DIAGNOSTIC</span></div>
        <div className="panel-body"><div className="stat-list">{statusRows.slice(0,12).map((item)=><div className="stat-row" key={item.name}><span className="stat-name">{item.name}</span><div className="progress"><span style={{width:`${pct(item.value,users.length)}%`}}/></div><span className="stat-value">{item.value}</span></div>)}</div></div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><div className="panel-title">Access Quality</div><span className="panel-subtitle">Akses yang perlu investigasi tanpa mengubah entitlement user.</span></div></div>
        <div className="panel-body">
          <div className="stat-list">
            <div className="stat-row"><span className="stat-name">Expired Grant</span><div className="progress"><span style={{width:`${pct(expiredGrant,users.length)}%`}}/></div><span className="stat-value">{expiredGrant}</span></div>
            <div className="stat-row"><span className="stat-name">Expired Paid</span><div className="progress"><span style={{width:`${pct(expiredPaid,users.length)}%`}}/></div><span className="stat-value">{expiredPaid}</span></div>
            <div className="stat-row"><span className="stat-name">Pending</span><div className="progress"><span style={{width:`${pct(pending,users.length)}%`}}/></div><span className="stat-value">{pending}</span></div>
            <div className="stat-row"><span className="stat-name">Incomplete</span><div className="progress"><span style={{width:`${pct(incomplete,users.length)}%`}}/></div><span className="stat-value">{incomplete}</span></div>
          </div>
        </div>
      </section>
    </div>
  </div>;
}
