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

type Insight = { title:string; detail:string; tone:'good'|'warn'|'risk'|'info' };

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

function validCity(value:string) {
  const text=String(value||'').trim();
  return Boolean(text) && !['unknown','no data','n/a','null','undefined','-','—'].includes(text.toLowerCase());
}

function insightStyle(tone:Insight['tone']) {
  if(tone==='good') return {borderLeft:'3px solid #2f7555',background:'#f5faf7'};
  if(tone==='risk') return {borderLeft:'3px solid #b65757',background:'#fff7f7'};
  if(tone==='warn') return {borderLeft:'3px solid #c49b4a',background:'#fffbf2'};
  return {borderLeft:'3px solid #687aa8',background:'#f6f8fc'};
}

function InsightList({items}:{items:Insight[]}) {
  return <div style={{display:'grid',gap:8}}>{items.map((item,index)=><div key={`${item.title}-${index}`} style={{...insightStyle(item.tone),padding:'10px 12px',borderRadius:8}}><div style={{fontSize:10,fontWeight:800,marginBottom:3}}>{item.title}</div><div style={{fontSize:9,lineHeight:1.55,color:'#65736b'}}>{item.detail}</div></div>)}</div>;
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
    const loginsToday = todayActivities.reduce((sum,a)=>sum+a.loginCount,0);
    const firstLoginToday = users.filter(u=>u.firstLoginAt>=today).length;
    const login30m = users.filter(u=>u.lastLoginAt>=now-30*60000).length;
    const active30m = users.filter(u=>u.lastSeenAt>=now-30*60000).length;
    return { dau,wau,mau,loginsToday,firstLoginToday,login30m,active30m };
  }, [users, activities, now, today]);

  const curve = useMemo(() => dayKeys(14).map(date => {
    const rows = activities.filter(a=>a.date===date);
    return { date: date.slice(5), users: new Set(rows.map(r=>r.uid)).size, logins: rows.reduce((sum,r)=>sum+r.loginCount,0) };
  }), [activities]);

  const planData = useMemo(() => {
    const map = new Map<string,number>();
    users.forEach(user=>map.set(user.plan,(map.get(user.plan)||0)+1));
    return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }, [users]);

  const planCounts = useMemo(() => new Map(planData.map(row=>[row.name,row.value])), [planData]);

  const birthCities = useMemo(() => {
    const map = new Map<string,number>();
    users.forEach(user=>{ if(validCity(user.birthCity)) map.set(user.birthCity,(map.get(user.birthCity)||0)+1); });
    return [...map.entries()].map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value).slice(0,10);
  }, [users]);

  const knownBirthUsers=users.filter(user=>validCity(user.birthCity)).length;
  const palette = ['#2f7555','#5f6fd3','#c4a15d','#7e62b3','#78938a','#bd5b5b','#9f7f72','#a1a69f'];

  const intelligence = useMemo(() => {
    const founder=planCounts.get('Founder')||0;
    const paid=planCounts.get('Google Play Paid')||0;
    const inti=planCounts.get('Penjaga Inti')||0;
    const alfa=planCounts.get('Penjaga Alfa')||0;
    const trial=planCounts.get('Trial')||0;
    const free=planCounts.get('Free')||0;
    const expiredGrant=planCounts.get('Expired Grant')||0;
    const expiredPaid=planCounts.get('Expired Paid')||0;
    const incomplete=planCounts.get('Data Incomplete')||0;
    const pending=planCounts.get('Pending Verification')||0;
    const activePremium=founder+paid+inti+alfa;
    const paidConversion=pct(paid,Math.max(1,users.length-founder));
    const freeShare=pct(free+expiredGrant+expiredPaid,users.length);
    const internalDauMau=pct(metrics.dau,metrics.mau);
    const playDauMau=Math.round((play.dau/play.mau)*1000)/10;
    const birthCoverage=pct(knownBirthUsers,users.length);

    const fourteen=dayKeys(14);
    const previous7=new Set(fourteen.slice(0,7));
    const current7=new Set(fourteen.slice(7));
    const prevActive=new Set(activities.filter(row=>previous7.has(row.date)).map(row=>row.uid)).size;
    const currentActive=new Set(activities.filter(row=>current7.has(row.date)).map(row=>row.uid)).size;
    const weeklyChange=prevActive?Math.round(((currentActive-prevActive)/prevActive)*1000)/10:(currentActive?100:0);

    const strengths:Insight[]=[];
    const weaknesses:Insight[]=[];
    const opportunities:Insight[]=[];
    const threats:Insight[]=[];
    const attention:Insight[]=[];

    if(play.storeConversion>=40) strengths.push({title:'Store conversion kuat',detail:`Store Conversion ${play.storeConversion}%. Listing sudah cukup efektif mengubah pengunjung menjadi install.`,tone:'good'});
    if(pct(play.activeDevices,play.installs)>=50) strengths.push({title:'Installed base masih hidup',detail:`${play.activeDevices} active devices dari ${play.installs} installs.`,tone:'good'});
    if(birthCoverage>=80) strengths.push({title:'Data profil cukup lengkap',detail:`Birth city valid pada ${birthCoverage}% user.`,tone:'good'});
    if(weeklyChange>0) strengths.push({title:'Aktivitas 7 hari naik',detail:`Unique active user 7 hari berubah +${weeklyChange}% dibanding 7 hari sebelumnya.`,tone:'good'});
    if(!strengths.length) strengths.push({title:'Fondasi data sudah terkonsolidasi',detail:'User, activity, entitlement, geography, dan Play snapshot tersedia dalam satu view.',tone:'info'});

    if(paidConversion<2) weaknesses.push({title:'Paid conversion masih rendah',detail:`Google Play Paid ${paid} user atau ${paidConversion}% dari basis non-Founder.`,tone:'risk'});
    if(internalDauMau<20) weaknesses.push({title:'Habit harian belum kuat',detail:`Internal DAU/MAU ${internalDauMau}%. User base ada, tetapi frekuensi harian masih perlu diperkuat.`,tone:'warn'});
    if(incomplete+pending>0) weaknesses.push({title:'Entitlement perlu dibersihkan',detail:`${incomplete} data incomplete dan ${pending} pending verification.`,tone:'risk'});
    if(!weaknesses.length) weaknesses.push({title:'Tidak ada kelemahan besar terdeteksi',detail:'Tetap pantau retention, conversion, dan billing verification.',tone:'info'});

    if(play.storeConversion>=40 && paidConversion<2) opportunities.push({title:'Fokus post-install → paid',detail:'Acquisition tidak terlihat sebagai bottleneck utama. Peluang terbesar ada pada onboarding, activation, trial, habit, dan paywall conversion.',tone:'good'});
    if(expiredGrant>0) opportunities.push({title:'Win-back alumni Penjaga',detail:`Ada ${expiredGrant} expired grant. Cohort ini sudah mengenal Bhumi dan cocok untuk strategi upgrade yang lebih terarah.`,tone:'good'});
    if(trial>0) opportunities.push({title:'Trial-to-paid journey',detail:`Ada ${trial} active trial. Dorong discovery value sebelum masa trial berakhir.`,tone:'good'});
    opportunities.push({title:'Segmentasi cohort',detail:'Pisahkan strategi Free, Trial, Paid, Inti, expired grant, dan dormant agar komunikasi tidak generik.',tone:'info'});

    if(paid<5) threats.push({title:'Basis paid masih sangat kecil',detail:`Hanya ${paid} user terklasifikasi Google Play Paid. Churn 1–2 user dapat berdampak besar pada persentase revenue.`,tone:'risk'});
    if(freeShare>60) threats.push({title:'Basis tanpa akses premium dominan',detail:`Free + expired access sekitar ${freeShare}% dari user. Pertumbuhan registrasi belum otomatis menjadi pertumbuhan revenue.`,tone:'warn'});
    if(internalDauMau<15 && metrics.mau>0) threats.push({title:'Risiko penggunaan sesekali',detail:'Jika DAU/MAU tetap rendah, Bhumi berisiko dikenal tetapi belum menjadi habit.',tone:'risk'});
    threats.push({title:'Firestore quota harus dijaga',detail:'Semua halaman turunan harus reuse shared session cache. Jangan menambah full-collection read untuk metrik yang dapat diturunkan dari data yang sudah ada.',tone:'warn'});

    if(paidConversion<2) attention.push({title:'1. Monetization funnel',detail:`Audit Registered → First Login → Activation → Trial → Paid. Paid Conversion saat ini ${paidConversion}%.`,tone:'risk'});
    if(expiredGrant>0) attention.push({title:'2. Expired grant',detail:`${expiredGrant} grant sudah selesai dan tidak boleh masuk Active Premium Access.`,tone:'warn'});
    if(internalDauMau<20) attention.push({title:'3. Retention & habit',detail:`Internal DAU/MAU ${internalDauMau}% vs Play DAU/MAU ${playDauMau}%. Periksa D1/D7/D30 dan fitur yang membuat user kembali.`,tone:'warn'});
    if(incomplete+pending>0) attention.push({title:'4. Entitlement diagnostics',detail:`${incomplete+pending} akun perlu verifikasi status agar akses tidak salah.`,tone:'risk'});
    attention.push({title:'5. Firestore efficiency',detail:'Pindah menu dan membuka data yang sama harus 0 read tambahan selama session cache masih ada.',tone:'info'});

    let conclusion=`Bhumi sudah memiliki basis user dan visibility data yang cukup untuk mengambil keputusan. Fokus utama berikutnya adalah memperkuat habit, activation, dan monetisasi tanpa menambah beban Firestore.`;
    if(play.storeConversion>=40 && paidConversion<2) conclusion=`Akuisisi bukan bottleneck utama saat ini: Store Conversion ${play.storeConversion}% sudah kuat, tetapi Paid Conversion internal baru ${paidConversion}%. Fokus Founder sebaiknya bergeser ke activation, retention, trial-to-paid, dan kualitas entitlement.`;

    return { founder,paid,inti,alfa,trial,free,expiredGrant,expiredPaid,incomplete,pending,activePremium,paidConversion,freeShare,internalDauMau,playDauMau,birthCoverage,weeklyChange,strengths:strengths.slice(0,4),weaknesses:weaknesses.slice(0,4),opportunities:opportunities.slice(0,4),threats:threats.slice(0,4),attention:attention.slice(0,5),conclusion };
  },[users,activities,metrics.dau,metrics.mau,knownBirthUsers,planCounts]);

  return <div className="page">
    <div className="page-heading">
      <div><h1>Executive Overview</h1></div>
      <div className="toolbar" style={{marginBottom:0}}><span className="source-badge">BHUMI DB • CACHED</span><span className="source-badge play">PLAY • {play.snapshot}</span><button className="btn" onClick={()=>void refresh()}>Refresh</button></div>
    </div>

    {error && <div className="error-box" style={{marginBottom:12}}>{error}</div>}

    <div className="kpi-grid">
      <Kpi label="Registered Users" value={loading?'—':users.length} foot="Internal real users" icon={Users} />
      <Kpi label="DAU Internal" value={loading?'—':metrics.dau} foot={`WAU ${metrics.wau} • MAU ${metrics.mau}`} icon={Activity} />
      <Kpi label="First Login Hari Ini" value={loading?'—':metrics.firstLoginToday} foot={`${metrics.login30m} login ≤30m`} icon={LogIn} />
      <Kpi label="Active ≤30 Menit" value={loading?'—':metrics.active30m} foot={`${metrics.loginsToday} login events hari ini`} icon={Clock3} />
      <Kpi label="Google Play Installs" value={play.installs} foot={`${play.activeDevices} active devices`} icon={Smartphone} delta="+9" />
    </div>

    <div className="kpi-grid">
      <Kpi label="Play Audience" value={play.audience} foot={`${play.firstOpens} first opens`} icon={Users} delta="+3" />
      <Kpi label="Play DAU / MAU" value={`${play.dau} / ${play.mau}`} foot={`${intelligence.playDauMau}% ratio`} icon={Activity} />
      <Kpi label="Store Conversion" value={`${play.storeConversion}%`} foot="Store listing" icon={Store} delta="-2.0 pp" />
      <Kpi label="Revenue" value={`$${play.revenue.toFixed(2)}`} foot="Google Play" icon={CircleDollarSign} delta="+33.4%" />
      <Kpi label="Rating" value={play.rating.toFixed(2)} foot="Google Play" icon={Store} />
    </div>

    <section className="panel" style={{marginBottom:14}}>
      <div className="panel-head"><div><div className="panel-title">Founder Intelligence — Kesimpulan Keseluruhan</div><span className="panel-subtitle">Diturunkan dari data Executive yang sudah ada. Tidak ada Firestore read tambahan.</span></div><span className="source-badge">DERIVED</span></div>
      <div className="panel-body">
        <div style={{fontSize:13,lineHeight:1.7,fontWeight:650,color:'#32453b',marginBottom:14}}>{loading?'Menyusun kesimpulan dari cache…':intelligence.conclusion}</div>
        <div className="grid-3" style={{marginBottom:0}}>
          <div className="notice"><b>Engagement</b><br/>DAU/MAU {intelligence.internalDauMau}% • 7D change {intelligence.weeklyChange>0?'+':''}{intelligence.weeklyChange}%.</div>
          <div className="notice"><b>Monetization</b><br/>Active Premium {intelligence.activePremium} • Paid {intelligence.paid} • Paid Conversion {intelligence.paidConversion}%.</div>
          <div className="notice"><b>Data Quality</b><br/>Birth City coverage {intelligence.birthCoverage}% • Entitlement issue {intelligence.incomplete+intelligence.pending}.</div>
        </div>
      </div>
    </section>

    <div className="grid-2" style={{marginBottom:14}}>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Yang Perlu Diperhatikan Sekarang</div><span className="panel-subtitle">Prioritas otomatis berdasarkan kondisi data saat ini.</span></div></div><div className="panel-body"><InsightList items={intelligence.attention}/></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Access Health</div><span className="panel-subtitle">Status akses hari ini, bukan badge historis.</span></div></div><div className="panel-body"><div className="stat-list">
        <div className="stat-row"><span className="stat-name">Google Play Paid</span><div className="progress"><span style={{width:`${pct(intelligence.paid,users.length)}%`}}/></div><span className="stat-value">{intelligence.paid}</span></div>
        <div className="stat-row"><span className="stat-name">Active Inti</span><div className="progress"><span style={{width:`${pct(intelligence.inti,users.length)}%`}}/></div><span className="stat-value">{intelligence.inti}</span></div>
        <div className="stat-row"><span className="stat-name">Active Alfa</span><div className="progress"><span style={{width:`${pct(intelligence.alfa,users.length)}%`}}/></div><span className="stat-value">{intelligence.alfa}</span></div>
        <div className="stat-row"><span className="stat-name">Active Trial</span><div className="progress"><span style={{width:`${pct(intelligence.trial,users.length)}%`}}/></div><span className="stat-value">{intelligence.trial}</span></div>
        <div className="stat-row"><span className="stat-name">Expired Grant</span><div className="progress"><span style={{width:`${pct(intelligence.expiredGrant,users.length)}%`}}/></div><span className="stat-value">{intelligence.expiredGrant}</span></div>
      </div></div></section>
    </div>

    <section className="panel" style={{marginBottom:14}}>
      <div className="panel-head"><div><div className="panel-title">SWOT — Founder View</div><span className="panel-subtitle">Berubah setiap kali cache direfresh.</span></div><span className="source-badge">DYNAMIC</span></div>
      <div className="panel-body">
        <div className="grid-2" style={{marginBottom:12}}><div><div style={{fontSize:11,fontWeight:800,marginBottom:8,color:'#2f7555'}}>Strengths</div><InsightList items={intelligence.strengths}/></div><div><div style={{fontSize:11,fontWeight:800,marginBottom:8,color:'#9b6b34'}}>Weaknesses</div><InsightList items={intelligence.weaknesses}/></div></div>
        <div className="grid-2" style={{marginBottom:0}}><div><div style={{fontSize:11,fontWeight:800,marginBottom:8,color:'#5969a5'}}>Opportunities</div><InsightList items={intelligence.opportunities}/></div><div><div style={{fontSize:11,fontWeight:800,marginBottom:8,color:'#a64e4e'}}>Threats</div><InsightList items={intelligence.threats}/></div></div>
      </div>
    </section>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Aktivitas Pengguna — 14 Hari</div><span className="panel-subtitle">Unique active users dan login events dari user_activity.</span></div><span className="source-badge">Telemetry</span></div><div className="panel-body"><div className="chart-box"><ResponsiveContainer width="100%" height="100%"><AreaChart data={curve}><defs><linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2f7555" stopOpacity={0.35}/><stop offset="100%" stopColor="#2f7555" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="date" tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:9,fill:'#7d8b83'}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{fontSize:10,border:'1px solid #e3e9e5',borderRadius:8}}/><Area type="monotone" dataKey="users" stroke="#2f7555" fill="url(#gUsers)" strokeWidth={2}/><Area type="monotone" dataKey="logins" stroke="#5f6fd3" fill="transparent" strokeWidth={1.6}/></AreaChart></ResponsiveContainer></div></div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Distribusi Akses</div><span className="panel-subtitle">Mutually exclusive current classification.</span></div><span className="source-badge">BHUMI DB</span></div><div className="panel-body"><div className="chart-box small"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={planData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={2}>{planData.map((_,i)=><Cell key={i} fill={palette[i%palette.length]}/>)}</Pie><Tooltip contentStyle={{fontSize:10,border:'1px solid #e3e9e5',borderRadius:8}}/></PieChart></ResponsiveContainer></div><div className="stat-list">{planData.slice(0,8).map((row,i)=><div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{width:`${pct(row.value,users.length)}%`,background:palette[i%palette.length]}}/></div><span className="stat-value">{row.value}</span></div>)}</div></div></section>
    </div>

    <div className="grid-2">
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Top Profile / Birth Cities</div><span className="panel-subtitle">Unknown tidak masuk ranking.</span></div><span className="source-badge warn">PROFILE</span></div><div className="panel-body"><div className="stat-list">{birthCities.map(row=><div className="stat-row" key={row.name}><span className="stat-name">{row.name}</span><div className="progress"><span style={{width:`${pct(row.value,Math.max(1,knownBirthUsers))}%`}}/></div><span className="stat-value">{row.value}</span></div>)}</div>{!birthCities.length&&<div className="empty">Belum ada birth city valid.</div>}</div></section>
      <section className="panel"><div className="panel-head"><div><div className="panel-title">Data Quality & Cache</div><span className="panel-subtitle">Hanya indikator yang memiliki data nyata.</span></div></div><div className="panel-body"><div className="stat-list"><div className="stat-row"><span className="stat-name">Users loaded</span><div className="progress"><span style={{width:users.length?'100%':'0%'}}/></div><span className="stat-value">{users.length}</span></div><div className="stat-row"><span className="stat-name">Birth city known</span><div className="progress"><span style={{width:`${intelligence.birthCoverage}%`}}/></div><span className="stat-value">{knownBirthUsers}</span></div><div className="stat-row"><span className="stat-name">Entitlement issue</span><div className="progress"><span style={{width:`${pct(intelligence.incomplete+intelligence.pending,users.length)}%`}}/></div><span className="stat-value">{intelligence.incomplete+intelligence.pending}</span></div></div><div className="notice" style={{marginTop:14}}>Shared session cache aktif. Pindah menu tidak membaca dataset yang sama lagi. Last refresh: {lastRefresh ? new Date(lastRefresh).toLocaleTimeString('id-ID') : '—'}.</div></div></section>
    </div>
  </div>;
}
