'use client';

import { useMemo } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFounderData } from '@/hooks/useFounderData';
import { pct } from '@/lib/analytics';

function key(ms:number){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(ms));}
function addDays(date:string,n:number){const d=new Date(`${date}T12:00:00+07:00`);d.setDate(d.getDate()+n);return key(d.getTime());}
function mondayOf(ms:number){const d=new Date(ms);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d.getTime();}

export function RetentionPage(){
  const {users,activities,loading,error,refresh}=useFounderData();
  const activityByUid=useMemo(()=>{const m=new Map<string,Set<string>>();activities.forEach(a=>{const s=m.get(a.uid)||new Set<string>();s.add(a.date);m.set(a.uid,s)});return m;},[activities]);
  const activityDates=useMemo(()=>activities.map(a=>a.date).filter(Boolean).sort(),[activities]);
  const minDate=activityDates[0]||'';
  const maxDate=activityDates[activityDates.length-1]||'';

  const retention=useMemo(()=>{
    function calc(day:number){
      let eligible=0,retained=0;
      users.forEach(u=>{
        if(!u.registeredAt)return;
        const reg=key(u.registeredAt),target=addDays(reg,day);
        if(!minDate||target<minDate||target>maxDate)return;
        eligible+=1;if(activityByUid.get(u.uid)?.has(target))retained+=1;
      });
      return {day,eligible,retained,rate:pct(retained,eligible)};
    }
    return [calc(1),calc(7),calc(30)];
  },[users,activityByUid,minDate,maxDate]);

  const cohorts=useMemo(()=>{
    const groups=new Map<number,typeof users>();
    users.forEach(u=>{if(!u.registeredAt)return;const w=mondayOf(u.registeredAt);groups.set(w,[...(groups.get(w)||[]),u]);});
    return [...groups.entries()].sort((a,b)=>b[0]-a[0]).slice(0,10).map(([week,rows])=>{
      const calc=(day:number)=>{let e=0,r=0;rows.forEach(u=>{const target=addDays(key(u.registeredAt),day);if(!minDate||target<minDate||target>maxDate)return;e++;if(activityByUid.get(u.uid)?.has(target))r++;});return{e,r,rate:pct(r,e)}};
      return{week:key(week),users:rows.length,d1:calc(1),d7:calc(7),d30:calc(30)};
    });
  },[users,activityByUid,minDate,maxDate]);

  const trend=useMemo(()=>[...cohorts].reverse().map(c=>({week:c.week.slice(5),D1:c.d1.e?c.d1.rate:null,D7:c.d7.e?c.d7.rate:null,D30:c.d30.e?c.d30.rate:null})),[cohorts]);
  const returning7=useMemo(()=>{const cutoff=Date.now()-7*86400000;return users.filter(u=>u.lastSeenAt>=cutoff).length;},[users]);
  const returning30=useMemo(()=>{const cutoff=Date.now()-30*86400000;return users.filter(u=>u.lastSeenAt>=cutoff).length;},[users]);

  return <div className="page">
    <div className="page-heading"><div><h1>Retention</h1><p>D1, D7, D30 dihitung per UID dan tanggal registrasi; cohort tanpa coverage telemetry tidak dipaksa menjadi 0%.</p></div><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    {error&&<div className="error-box" style={{marginBottom:12}}>{error}</div>}
    <div className="kpi-grid">
      {retention.map(x=><div className="kpi-card" key={x.day}><div className="kpi-label">D{x.day} Retention</div><div className="kpi-value">{loading?'—':x.eligible?`${x.rate}%`:'N/A'}</div><div className="kpi-foot"><span>{x.retained}/{x.eligible} eligible</span></div></div>)}
      <div className="kpi-card"><div className="kpi-label">Returning ≤7D</div><div className="kpi-value">{returning7}</div><div className="kpi-foot"><span>{pct(returning7,users.length)}% user base</span></div></div>
      <div className="kpi-card"><div className="kpi-label">Returning ≤30D</div><div className="kpi-value">{returning30}</div><div className="kpi-foot"><span>{pct(returning30,users.length)}% user base</span></div></div>
    </div>

    <section className="panel" style={{marginBottom:14}}><div className="panel-head"><div><div className="panel-title">Retention Trend by Registration Week</div><span className="panel-subtitle">N/A berarti target day di luar coverage user_activity, bukan 0%.</span></div><span className="source-badge">90D ACTIVITY</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend}><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="week" tick={{fontSize:9}}/><YAxis domain={[0,100]} tick={{fontSize:9}}/><Tooltip/><Line type="monotone" dataKey="D1" stroke="#2f7555" strokeWidth={2} connectNulls={false}/><Line type="monotone" dataKey="D7" stroke="#5f6fd3" strokeWidth={2} connectNulls={false}/><Line type="monotone" dataKey="D30" stroke="#c4a15d" strokeWidth={2} connectNulls={false}/></LineChart></ResponsiveContainer></div></div></section>

    <section className="panel"><div className="panel-head"><div><div className="panel-title">Cohort Table</div><span className="panel-subtitle">Registrasi minggu Senin–Minggu, Asia/Jakarta.</span></div></div><div className="table-wrap"><table><thead><tr><th>Week</th><th>New Users</th><th>D1</th><th>D1 Base</th><th>D7</th><th>D7 Base</th><th>D30</th><th>D30 Base</th></tr></thead><tbody>{cohorts.map(c=><tr key={c.week}><td><b>{c.week}</b></td><td>{c.users}</td><td>{c.d1.e?`${c.d1.rate}%`:'N/A'}</td><td>{c.d1.r}/{c.d1.e}</td><td>{c.d7.e?`${c.d7.rate}%`:'N/A'}</td><td>{c.d7.r}/{c.d7.e}</td><td>{c.d30.e?`${c.d30.rate}%`:'N/A'}</td><td>{c.d30.r}/{c.d30.e}</td></tr>)}</tbody></table></div></section>
  </div>;
}
