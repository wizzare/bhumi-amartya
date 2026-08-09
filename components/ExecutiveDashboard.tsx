'use client';

import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, CircleDollarSign, Clock3, LogIn, Smartphone, Store, Users } from 'lucide-react';
import { useFounderData } from '@/hooks/useFounderData';
import { pct, startOfToday } from '@/lib/analytics';

const play = {
  installs: 331,
  activeDevices: 182,
  audience: 176,
  firstOpens: 92,
  dau: 36.9,
  mau: 188,
  storeConversion: 50.8,
  revenue: 12.30,
  rating: 5.0,
  snapshot: '10 Agu 2026',
};

function Kpi({ label, value, foot, icon: Icon, delta }: { label:string; value:string|number; foot:string; icon:any; delta?:string }) {
  return <div className="kpi-card"><div className="kpi-top"><span className="kpi-label">{label}</span><span className="kpi-icon"><Icon /></span></div><div className="kpi-value">{value}</div><div className="kpi-foot"><span>{foot}</span>{delta && <span className={delta.startsWith('+') ? 'delta-up' : delta.startsWith('-') ? 'delta-down' : ''}>{delta}</span>}</div></div>;
}

function dayKeys(n: number) {
  const out: string[] = [];
  for (let i=n-1;i>=0;i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    out.push(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(d));
  }
  return out;
}

export function ExecutiveDashboard() {
  const { users, activities, loading, error, lastRefresh, refresh } = useFounderData();
  const now = Date.now();
  const today = startOfToday();

  const metrics = useMemo(() => {
    const todayKey = dayKeys(1)[0];
    const dates7 = new Set(dayKeys(7));
    const dates30 = new Set(dayKeys(30));
    const todayActivities = activities.filter(a => a.date === todayKey);
    const dau = new Set(todayActivities.map(a=>a.uid)).size;
    const wau = new Set(activities.filter(a=>dates7.has(a.date)).map(a=>a.uid)).size;
    const mau = new Set(activities.filter(a=>dates30.has(a.date)).map(a=>a.uid)).size;
    const loginsToday = todayActivities.reduce((s,a)=>s+a.loginCount,0);
    const sessionsToday = todayActivities.reduce((s,a)=>s+a.sessionCount,0);
    const newToday = users.filter(u=>u.registeredAt>=today).length;
    const firstLoginToday = users.filter(u=>u.firstLoginAt>=today).length;
    const login30m = users.filter(u=>u.lastLoginAt>=now-30*60000).length;
    const active30m = users.filter(u=>u.lastSeenAt>=now-30*60000).length;
    return { dau,wau,mau,loginsToday,sessionsToday,newToday,firstLoginToday,login30m,active30m };
  }, [users, activities, now, today]);

  const curve = useMemo(() => dayKeys(14).map(date => {
    const rows = activities.filter(a=>a.date===date);
    return { date: date.slice(5), users: new Set(rows.map(r=>r.uid)).size, logins: rows.reduce((s,r)=>s+r.loginCount,0), sessions: rows.reduce((s,r)=>s+r.sessionCount,0) };
  }), [activities]);

  const planData = useMemo(() => {
    const m = new Map<string,number>(); users.forEach(u=>m.set(u.plan,(m.get(u.plan)||0)+1));
    return [...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }, [users]);

  const cities = useMemo(() => {
    const m = new Map<string,number>(); users.forEach(u=>m.set(u.city,(m.get(u.city)||0)+1));
    return [...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,7);
  }, [users]);

  const countries = useMemo(() => {
    const m = new Map<string,number>(); users.forEach(u=>m.set(u.country,(m.get(u.country)||0)+1));
    return [...m.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,7);
  }, [users]);

  const palette = ['#2f7555','#5f6fd3','#c4a15d','#7e62b3','#78938a','#bd5b5b'];

  return <div className="page">
    <div className="page-heading">
      <div><h1>Executive Overview</h1><p>Data internal Bhumi + snapshot Google Play. Setiap sumber dipisahkan agar tidak terjadi salah denominator.</p></div>
      <div className="toolbar" style={{marginBottom:0}}><span className="source-badge">BHUMI DB • LIVE</span><span className="source-badge play">PLAY • {play.snapshot}</span><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    </div>

    {error && <div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <Kpi label="Registered Users" value={loading?'—':users.length} foot="Internal real users" icon={Users} />
      <Kpi label="DAU Internal" value={loading?'—':metrics.dau} foot={`WAU ${metrics.wau} • MAU ${metrics.mau}`} icon={Activity} />
      <Kpi label="First Login Hari Ini" value={loading?'—':metrics.firstLoginToday} foot={`${metrics.login30m} login ≤30m`} icon={LogIn} />
      <Kpi label="Active ≤30 Menit" value={loading?'—':metrics.active30m} foot={`${metrics.loginsToday} login hari ini`} icon={Clock3} />
      <Kpi label="Google Play Installs" value={play.installs} foot={`${play.activeDevices} active devices`} icon={Smartphone} delta="+9" />
    </div>

    <div className="kpi-grid">
      <Kpi label="Play Audience" value={play.audience} foot={`${play.firstOpens} first opens`} icon={Users} delta="+3" />
      <Kpi label="Play DAU / MAU" value={`${play.dau} / ${play.mau}`} foot={`${((play.dau/play.mau)*100).toFixed(1)}% ratio`} icon={Activity} />
      <Kpi label="Store Conversion" value={`${play.storeConversion}%`} foot="Store listing" icon={Store} delta="-2.0 pp" />
      <Kpi label="Revenue" value={`$${play.revenue.toFixed(2)}`} foot="Google Play" icon={CircleDollarSign} delta="+33.4%" />
      <Kpi label="Rating" value={play.rating.toFixed(2)} foot="Google Play" icon={Store} />
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Aktivitas Pengguna — 14 Hari</div><span className="panel-subtitle">Unique active users, login, dan session dari user_activity</span></div><span className="source-badge">Telemetry</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={curve}><defs><linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f7555" stopOpacity={0.35}/><stop offset="100%" stopColor="#2f7555" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:10,border:'1px solid #e3e9e5',borderRadius:8}}/><Area type="monotone" dataKey="users" stroke="#2f7555" fill="url(#gUsers)" strokeWidth={2}/><Area type="monotone" dataKey="logins" stroke="#5f6fd3" fill="transparent" strokeWidth={1.6}/></AreaChart></ResponsiveContainer></div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Distribusi Akses</div><span className="panel-subtitle">Free, Trial, Premium, Founder, Inti/Alfa</span></div><span className="source-badge">BHUMI DB</span></div><div className="panel-body"><div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={planData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>{planData.map((_,i)=><Cell key={i} fill={palette[i%palette.length]}/>)}</Pie><Tooltip contentStyle={{fontSize:10,border:'1px solid #e3e9e5',borderRadius:8}}/></PieChart></ResponsiveContainer></div><div className="stat-list">{planData.slice(0,6).map((x,i)=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`,background:palette[i%palette.length]}}/></div><span className="stat-value">{x.value}</span></div>)}</div></div></section>
    </div>

    <div className="grid-3">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Top Profile/Birth Cities</div><span className="panel-subtitle">Bukan current location</span></div><span className="source-badge warn">PROFILE</span></div><div className="panel-body"><div className="stat-list">{cities.map(x=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`}}/></div><span className="stat-value">{x.value}</span></div>)}</div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Profile Country</div><span className="panel-subtitle">Explicit/inferred from profile fields</span></div><span className="source-badge warn">PROFILE</span></div><div className="panel-body"><div className="stat-list">{countries.map(x=><div className="stat-row" key={x.name}><span className="stat-name">{x.name}</span><div className="progress"><span style={{width:`${pct(x.value,users.length)}%`}}/></div><span className="stat-value">{x.value}</span></div>)}</div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Data Quality</div><span className="panel-subtitle">Sumber dan freshness</span></div></div><div className="panel-body"><div className="stat-list"><div className="stat-row"><span className="stat-name">Users loaded</span><div className="progress"><span style={{width:users.length?'100%':'0%'}}/></div><span className="stat-value">{users.length}</span></div><div className="stat-row"><span className="stat-name">30D activity docs</span><div className="progress"><span style={{width:activities.length?'100%':'0%'}}/></div><span className="stat-value">{activities.length}</span></div></div><div className="notice" style={{marginTop:14}}>Deleted, archived, QA/test users dikeluarkan sebelum agregasi. Last refresh: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString('id-ID') : '—'}.</div></div></section>
    </div>
  </div>;
}
