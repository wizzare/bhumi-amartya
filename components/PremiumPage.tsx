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

type Props = { embedded?: boolean };

export function PremiumPage({ embedded = false }: Props){
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
  const activePremiumAccess=paid+inti+alfa+founder;
  const paidConversion=pct(paid,Math.max(0,users.length-founder));

  return <div className={embedded ? '' : 'page'}>
    {embedded ? (
      <div className="toolbar" style={{justifyContent:'space-between',marginBottom:12}}>
        <span className="source-badge">ACCESS · SHARED CACHE</span>
        <button className="btn" onClick={()=>void refresh()}>Refresh Access</button>
      </div>
    ) : (
      <div className="page-heading">
        <div><h1>Premium & Trial</h1><p>Status akses saat ini per UID.</p></div>
        <button className="btn" onClick={()=>void refresh()}>Refresh</button>
      </div>
    )}

    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <div className="kpi-card"><div className="kpi-label">Google Play Paid</div><div className="kpi-value">{loading?'—':paid}</div><div className="kpi-foot"><span>{paidConversion}% non-Founder base</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Trial Aktif</div><div className="kpi-value">{loading?'—':trial}</div><div className="kpi-foot"><span>trial window masih berlaku</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Inti / Alfa Aktif</div><div className="kpi-value">{loading?'—':inti+alfa}</div><div className="kpi-foot"><span>Inti {inti} • Alfa {alfa}</span></div></div>
    </div>

    <div className="notice" style={{marginBottom:14}}>Total akses premium aktif: <b>{activePremiumAccess}</b>. Grant atau paid access yang sudah selesai tetap ditampilkan di distribusi, tetapi tidak dihitung sebagai akses aktif.</div>

    <section className="panel">
      <div className="panel-head"><div><div className="panel-title">Distribusi Akses Saat Ini</div><span className="panel-subtitle">Satu UID hanya masuk satu kategori.</span></div><span className="source-badge">BHUMI DB</span></div>
      <div className="panel-body">
        <div className="grid-2" style={{marginBottom:0}}>
          <div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={counts.filter((item)=>item.value)} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>{counts.filter((item)=>item.value).map((_,index)=><Cell key={index} fill={colors[index%colors.length]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
          <div className="stat-list">{counts.filter((item)=>item.value).map((item,index)=><div className="stat-row" key={item.name}><span className="stat-name">{item.name}</span><div className="progress"><span style={{width:`${pct(item.value,users.length)}%`,background:colors[index%colors.length]}}/></div><span className="stat-value">{item.value}</span></div>)}</div>
        </div>
      </div>
    </section>
  </div>;
}
